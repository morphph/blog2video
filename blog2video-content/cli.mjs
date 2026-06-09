#!/usr/bin/env node
// blog2video-content — agent-native CLI for the Hermes content system.
//
// Exposes a stable JSON contract over the Blog2Video production worker so the
// Hermes orchestrator can drive it WITHOUT understanding this repo's internals.
//
// Boundaries (load-bearing — see README.md):
//   • Never bypass the human review checkpoint.
//   • `render` refuses unless the caller passes the approved review_hash.
//   • Never auto-publish; `package` stops at a local manifest.
//   • Never writes the central Hermes SQLite ledger — state is file-based here.
//   • Never runs expensive LLM workflows implicitly.
//
// Verbs: assess | script --review-only | revise-script | render | package
//
// Every verb prints ONE JSON envelope on stdout. Human logs go to stderr.
// Exit codes: 0 ok | 1 gate refusal / ok:false | 2 usage error | 3 exception.

import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";
import {
  CONTRACT_VERSION,
  artifact,
  contentHash,
  emit,
  envelope,
  loadTask,
  log,
  normalize,
  parseArgs,
  resolveTextArg,
  saveTask,
  shortHash,
  toSlug,
} from "./lib/contract.mjs";

const REPO_ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..");
const OUTPUT_ROOT = path.join(REPO_ROOT, "blog2video-output");
const RENDER_SCRIPT = path.join(REPO_ROOT, "blog2video-remotion", "scripts", "render-all.mjs");

// Chinese narration speaking rate used only for a rough duration estimate.
const CHARS_PER_MIN = 220;

// Delivery exclusion list — authoritative copy mirrors CLAUDE.md "Post-Render
// Delivery". `package` applies this to decide what is distributable.
const DELIVERY_EXCLUDE = [
  /\.mp3$/,
  /\.html$/,
  /_manifest\.json$/,
  /_minimax_raw_subtitles\.json$/,
  /_audio_subtitles\.json$/,
  /_slide_map\.json$/,
  /^video_plan\.json$/,
  /^twitter_metadata\.json$/,
  /^source_raw\.md$/,
  /_narration\.md$/,
  /_insight_memo\.md$/,
  /^insight_memo\.md$/,
  /^narration\.md$/,
  /^\.b2v-task\.json$/,
  /^review_packet\./,
  /^package_manifest\.json$/,
  /\.b2v-feedback/,
];
// Slide screenshots are excluded, but *_cover_photo.png is delivered.
function isExcludedFromDelivery(name) {
  if (/_cover_photo\.png$/.test(name)) return false;
  if (/\.png$/.test(name)) return true; // slide screenshots
  return DELIVERY_EXCLUDE.some((re) => re.test(name));
}

// ─── Shared helpers ───────────────────────────────────────────────────────────

function readSource(opts) {
  const src = opts.source || opts.s;
  if (!src) return { error: "missing --source <path>" };
  if (!fs.existsSync(src)) return { error: `source not found: ${src}` };
  const text = fs.readFileSync(src, "utf-8");
  if (!normalize(text)) return { error: `source is empty: ${src}` };
  return { src, text };
}

function resolveOutputDir(opts, slug) {
  if (opts["output-dir"]) return path.resolve(opts["output-dir"]);
  return path.join(OUTPUT_ROOT, slug);
}

function deriveSlug(opts, srcPath) {
  return toSlug(opts.slug || (srcPath ? path.basename(srcPath) : "untitled"));
}

function countChars(text) {
  // Strip markdown noise and whitespace for a content-length proxy.
  return normalize(text).replace(/[#>*`\-_\[\]()!]/g, "").replace(/\s+/g, "").length;
}

function estMinutes(chars) {
  return Math.round((chars / CHARS_PER_MIN) * 10) / 10;
}

function listScriptFiles(outputDir) {
  if (!fs.existsSync(outputDir)) return [];
  return fs
    .readdirSync(outputDir)
    .filter((f) => /^video_\d+_script\.md$/.test(f))
    .sort();
}

function taskIdForSource(sourceHash) {
  return `b2v_${shortHash(sourceHash)}`;
}

// ─── Verb: assess ─────────────────────────────────────────────────────────────
// Pure heuristic. No LLM, no writes. Decides if a source is video-worthy and
// keeps that judgment inside this repo (not in Hermes).
function verbAssess(opts) {
  const r = readSource(opts);
  if (r.error) return emit(envelope({ ok: false, verb: "assess", errors: [r.error] }), 2);

  const text = r.text;
  const sourceHash = contentHash(text);
  const chars = countChars(text);
  const words = normalize(text).split(/\s+/).filter(Boolean).length;
  const headings = (text.match(/^#{1,6}\s/gm) || []).length;
  const codeBlocks = (text.match(/```/g) || []).length / 2;
  const links = (text.match(/\[[^\]]+\]\([^)]+\)/g) || []).length;
  const lists = (text.match(/^\s*[-*]\s/gm) || []).length;

  // Heuristic score (0–100). Tuned for "is there enough substance for a
  // narrated technical video?" — favors length + structure + concreteness.
  const reasons = [];
  let score = 0;
  if (words >= 300) { score += 30; reasons.push(`length ok (${words} words)`); }
  else { reasons.push(`thin content (${words} words)`); }
  if (headings >= 2) { score += 20; reasons.push(`${headings} sections`); }
  if (codeBlocks >= 1) { score += 20; reasons.push(`${codeBlocks} code blocks (concrete)`); }
  if (links >= 1) { score += 10; reasons.push(`${links} references`); }
  if (lists >= 3) { score += 10; reasons.push(`structured lists`); }
  if (words >= 1200) { score += 10; reasons.push(`in-depth`); }

  const threshold = Number(opts.threshold) || 50;
  const verdict = score >= threshold ? "video_worthy" : "skip";
  if (verdict === "skip") reasons.push(`score ${score} < threshold ${threshold}`);

  return emit(
    envelope({
      ok: true,
      verb: "assess",
      task_id: taskIdForSource(sourceHash),
      content_hash: shortHash(sourceHash),
      data: {
        verdict,
        score,
        threshold,
        signals: { words, chars, headings, code_blocks: codeBlocks, links, lists },
        est_minutes: estMinutes(chars),
        reasons,
      },
    }),
    0,
  );
}

// ─── Review packet ────────────────────────────────────────────────────────────
// Build the content-hashed packet Hermes sends to the human. review_hash binds
// source + narration + scripts so a later edit invalidates a prior approval.
function buildReviewPacket(outputDir, task, narration, scriptFiles) {
  const scriptsText = scriptFiles
    .map((f) => fs.readFileSync(path.join(outputDir, f), "utf-8"))
    .join("\n");
  const reviewHash = shortHash(contentHash([task.source_hash, narration, scriptsText]));
  const chars = countChars(narration);

  const packet = {
    contract_version: CONTRACT_VERSION,
    task_id: task.task_id,
    slug: task.slug,
    source_hash: task.source_hash,
    review_hash: reviewHash,
    revision: task.revision || 0,
    word_count_chars: chars,
    est_minutes: estMinutes(chars),
    script_files: scriptFiles,
    approve_with: `render --task ${task.task_id} --approved-hash ${reviewHash}`,
    narration_preview: normalize(narration).slice(0, 600),
  };

  fs.writeFileSync(
    path.join(outputDir, "review_packet.json"),
    JSON.stringify(packet, null, 2) + "\n",
  );

  const md = [
    `# Review Packet — ${task.slug}`,
    ``,
    `- task_id: \`${task.task_id}\``,
    `- review_hash: \`${reviewHash}\``,
    `- length: ~${chars} chars (~${packet.est_minutes} min)`,
    `- scripts: ${scriptFiles.join(", ") || "(narration only)"}`,
    ``,
    `## Approve`,
    `Pass the review_hash back to render (stale edits invalidate it):`,
    ``,
    "```",
    packet.approve_with,
    "```",
    ``,
    `## Narration`,
    ``,
    normalize(narration),
    ``,
  ].join("\n");
  fs.writeFileSync(path.join(outputDir, "review_packet.md"), md);

  return reviewHash;
}

// ─── Verb: script --review-only ───────────────────────────────────────────────
// Establish the task workspace and packetize EXISTING narration into a review
// packet, then stop. Does not render. Does not call the LLM unless --generate
// is explicitly passed AND a generator command is configured.
function verbScript(opts) {
  if (!opts["review-only"]) {
    return emit(
      envelope({
        ok: false,
        verb: "script",
        errors: ["v1 only supports `script --review-only` (render is a separate, gated verb)"],
      }),
      2,
    );
  }

  const r = readSource(opts);
  if (r.error) return emit(envelope({ ok: false, verb: "script", errors: [r.error] }), 2);

  const slug = deriveSlug(opts, r.src);
  const outputDir = resolveOutputDir(opts, slug);
  fs.mkdirSync(outputDir, { recursive: true });

  const sourceHash = contentHash(r.text);
  const taskId = taskIdForSource(sourceHash);

  // Idempotent source copy.
  const sourceDest = path.join(outputDir, "source_blog.md");
  if (!fs.existsSync(sourceDest) || normalize(fs.readFileSync(sourceDest, "utf-8")) !== normalize(r.text)) {
    fs.writeFileSync(sourceDest, r.text);
  }

  let task = loadTask(outputDir) || {};
  task = {
    ...task,
    task_id: taskId,
    slug,
    source_path: r.src,
    source_hash: shortHash(sourceHash),
    revision: task.revision || 0,
    feedback_log: task.feedback_log || [],
  };

  // Resolve narration: explicit flag > existing artifact > optional generator.
  const narrationDest = path.join(outputDir, "narration.md");
  let narration = null;
  const warnings = [];

  if (opts.narration && fs.existsSync(opts.narration)) {
    narration = fs.readFileSync(opts.narration, "utf-8");
    fs.writeFileSync(narrationDest, narration);
  } else if (fs.existsSync(narrationDest)) {
    narration = fs.readFileSync(narrationDest, "utf-8");
  } else if (opts.generate && process.env.B2V_GENERATOR_CMD) {
    // Explicit opt-in to the (expensive) generator. Default path never gets here.
    log(`[script] running configured generator: ${process.env.B2V_GENERATOR_CMD}`);
    try {
      execFileSync("sh", ["-c", process.env.B2V_GENERATOR_CMD], {
        cwd: REPO_ROOT,
        env: { ...process.env, B2V_OUTPUT_DIR: outputDir, B2V_SOURCE: sourceDest },
        stdio: "inherit",
      });
    } catch (e) {
      return emit(envelope({ ok: false, verb: "script", task_id: taskId, errors: [`generator failed: ${e.message}`] }), 1);
    }
    if (fs.existsSync(narrationDest)) narration = fs.readFileSync(narrationDest, "utf-8");
  }

  if (!narration) {
    // Honest boundary: narration generation is the Claude Code skill's job.
    task.state = "needs_script";
    saveTask(outputDir, task);
    return emit(
      envelope({
        ok: false,
        verb: "script",
        task_id: taskId,
        content_hash: task.source_hash,
        artifacts: [artifact("source_blog.md", sourceDest, "source")],
        warnings,
        errors: ["narration_missing"],
        data: {
          state: "needs_script",
          next_action:
            "Generate narration via the Claude Code skill (`/blog2video-script <output-dir>`), " +
            "then re-run `script --review-only` to build the review packet. " +
            "Or pass --narration <path> / set B2V_GENERATOR_CMD with --generate.",
          output_dir: outputDir,
        },
      }),
      1,
    );
  }

  const scriptFiles = listScriptFiles(outputDir);

  // Idempotency: if a packet for this exact content already exists, don't rewrite.
  const candidateHash = shortHash(
    contentHash([task.source_hash, narration, scriptFiles.map((f) => fs.readFileSync(path.join(outputDir, f), "utf-8")).join("\n")]),
  );
  if (task.review_hash === candidateHash && fs.existsSync(path.join(outputDir, "review_packet.json")) && !opts.force) {
    warnings.push("unchanged: review packet already current");
    task.state = "awaiting_review";
    saveTask(outputDir, task);
    return emit(
      envelope({
        ok: true,
        verb: "script",
        task_id: taskId,
        content_hash: candidateHash,
        artifacts: [
          artifact("review_packet.json", path.join(outputDir, "review_packet.json"), "review"),
          artifact("review_packet.md", path.join(outputDir, "review_packet.md"), "review"),
          artifact("narration.md", narrationDest, "narration"),
        ],
        warnings,
        data: { state: "awaiting_review", review_hash: candidateHash, output_dir: outputDir },
      }),
      0,
    );
  }

  const reviewHash = buildReviewPacket(outputDir, task, narration, scriptFiles);
  task.review_hash = reviewHash;
  task.state = "awaiting_review";
  task.approved_hash = null; // any prior approval is now stale
  saveTask(outputDir, task);

  if (!scriptFiles.length) warnings.push("no video_N_script.md yet — review packet covers narration only");

  return emit(
    envelope({
      ok: true,
      verb: "script",
      task_id: taskId,
      content_hash: reviewHash,
      artifacts: [
        artifact("source_blog.md", sourceDest, "source"),
        artifact("narration.md", narrationDest, "narration"),
        artifact("review_packet.json", path.join(outputDir, "review_packet.json"), "review"),
        artifact("review_packet.md", path.join(outputDir, "review_packet.md"), "review"),
      ],
      warnings,
      data: {
        state: "awaiting_review",
        review_hash: reviewHash,
        output_dir: outputDir,
        est_minutes: estMinutes(countChars(narration)),
      },
    }),
    0,
  );
}

// ─── Task resolution for verbs that act on an existing task ───────────────────
function resolveTask(opts, verb) {
  let outputDir = null;
  if (opts["output-dir"]) outputDir = path.resolve(opts["output-dir"]);
  else if (opts.slug) outputDir = path.join(OUTPUT_ROOT, toSlug(opts.slug));
  else if (opts.task) {
    // Find the output dir whose task.json matches this task_id.
    if (fs.existsSync(OUTPUT_ROOT)) {
      for (const d of fs.readdirSync(OUTPUT_ROOT)) {
        const t = loadTask(path.join(OUTPUT_ROOT, d));
        if (t && t.task_id === opts.task) { outputDir = path.join(OUTPUT_ROOT, d); break; }
      }
    }
  }
  if (!outputDir) return { error: "specify --task <id> | --slug <slug> | --output-dir <path>" };
  const task = loadTask(outputDir);
  if (!task) return { error: `no task ledger at ${outputDir} (run \`script --review-only\` first)` };
  return { outputDir, task };
}

// ─── Verb: revise-script ──────────────────────────────────────────────────────
// Record human feedback. Invalidates the prior review_hash so any in-flight
// approval is rejected. If a revised narration is supplied, re-packet immediately.
function verbRevise(opts) {
  const rt = resolveTask(opts, "revise-script");
  if (rt.error) return emit(envelope({ ok: false, verb: "revise-script", errors: [rt.error] }), 2);
  const { outputDir, task } = rt;

  let feedback;
  try {
    feedback = resolveTextArg(opts.feedback);
  } catch (e) {
    return emit(envelope({ ok: false, verb: "revise-script", task_id: task.task_id, errors: [`cannot read --feedback: ${e.message}`] }), 2);
  }
  if (!feedback || !normalize(feedback)) {
    return emit(envelope({ ok: false, verb: "revise-script", task_id: task.task_id, errors: ["missing --feedback <text|@path>"] }), 2);
  }

  const feedbackHash = shortHash(contentHash(feedback));
  const lastEntry = (task.feedback_log || [])[task.feedback_log?.length - 1];
  if (lastEntry && lastEntry.hash === feedbackHash && !opts.force) {
    return emit(
      envelope({
        ok: true,
        verb: "revise-script",
        task_id: task.task_id,
        content_hash: task.review_hash || null,
        warnings: ["unchanged: identical feedback already recorded"],
        data: { state: task.state, revision: task.revision },
      }),
      0,
    );
  }

  task.feedback_log = task.feedback_log || [];
  task.feedback_log.push({ hash: feedbackHash, at: new Date().toISOString(), text: normalize(feedback) });
  task.revision = (task.revision || 0) + 1;
  task.approved_hash = null;

  const warnings = [];
  const artifacts = [];

  if (opts.narration && fs.existsSync(opts.narration)) {
    // Operator supplied a revised narration — re-packet immediately.
    const narration = fs.readFileSync(opts.narration, "utf-8");
    fs.writeFileSync(path.join(outputDir, "narration.md"), narration);
    const reviewHash = buildReviewPacket(outputDir, task, narration, listScriptFiles(outputDir));
    task.review_hash = reviewHash;
    task.state = "awaiting_review";
    artifacts.push(
      artifact("narration.md", path.join(outputDir, "narration.md"), "narration"),
      artifact("review_packet.json", path.join(outputDir, "review_packet.json"), "review"),
    );
  } else {
    // No new narration yet — the Claude skill must regenerate incorporating
    // feedback. Old review_hash is invalidated so render can't proceed on it.
    task.review_hash = null;
    task.state = "needs_script";
    warnings.push("review_hash invalidated; regenerate narration via Claude skill, then re-run `script --review-only`");
  }

  saveTask(outputDir, task);

  return emit(
    envelope({
      ok: true,
      verb: "revise-script",
      task_id: task.task_id,
      content_hash: task.review_hash,
      artifacts,
      warnings,
      data: {
        state: task.state,
        revision: task.revision,
        feedback_hash: feedbackHash,
        review_hash: task.review_hash,
        next_action: task.state === "needs_script"
          ? "Regenerate narration via `/blog2video-script`, then `script --review-only`."
          : "Re-send review packet for approval.",
      },
    }),
    0,
  );
}

// ─── Verb: render ─────────────────────────────────────────────────────────────
// HARD human-approval gate. Refuses unless --approved-hash matches the current
// review_hash. --dry-run checks the gate without rendering.
function verbRender(opts) {
  const rt = resolveTask(opts, "render");
  if (rt.error) return emit(envelope({ ok: false, verb: "render", errors: [rt.error] }), 2);
  const { outputDir, task } = rt;

  const approved = opts["approved-hash"];
  if (!approved) {
    return emit(envelope({ ok: false, verb: "render", task_id: task.task_id, errors: ["missing --approved-hash <review_hash>"] }), 2);
  }
  if (!task.review_hash) {
    return emit(
      envelope({
        ok: false,
        verb: "render",
        task_id: task.task_id,
        errors: ["not_reviewed"],
        data: { state: task.state, hint: "run `script --review-only` to produce a review packet first" },
      }),
      1,
    );
  }
  if (approved !== task.review_hash) {
    // Stale approval — content changed since the human signed off.
    return emit(
      envelope({
        ok: false,
        verb: "render",
        task_id: task.task_id,
        content_hash: task.review_hash,
        errors: ["stale_approval"],
        data: { expected: task.review_hash, got: approved, hint: "re-review the current packet" },
      }),
      1,
    );
  }

  if (opts["dry-run"]) {
    return emit(
      envelope({
        ok: true,
        verb: "render",
        task_id: task.task_id,
        content_hash: task.review_hash,
        data: { would_render: true, state: "approved", output_dir: outputDir },
      }),
      0,
    );
  }

  // Idempotency: skip if already rendered for this exact approved hash.
  const existingMp4s = fs.existsSync(outputDir)
    ? fs.readdirSync(outputDir).filter((f) => /^video_\d+\.mp4$/.test(f))
    : [];
  if (task.state === "rendered" && task.approved_hash === approved && existingMp4s.length && !opts.force) {
    return emit(
      envelope({
        ok: true,
        verb: "render",
        task_id: task.task_id,
        content_hash: approved,
        artifacts: existingMp4s.map((f) => artifact(f, path.join(outputDir, f), "video")),
        warnings: ["already_rendered (pass --force to re-render)"],
        data: { state: "rendered", output_dir: outputDir },
      }),
      0,
    );
  }

  task.approved_hash = approved;
  task.state = "approved";
  saveTask(outputDir, task);

  try {
    log(`[render] node ${RENDER_SCRIPT} ${outputDir}` + (opts.video ? ` ${opts.video}` : ""));
    const args = [RENDER_SCRIPT, outputDir];
    if (opts.video) args.push(String(opts.video));
    execFileSync("node", args, { cwd: REPO_ROOT, stdio: "inherit" });
  } catch (e) {
    return emit(
      envelope({ ok: false, verb: "render", task_id: task.task_id, content_hash: approved, errors: [`render failed: ${e.message}`], data: { state: "approved" } }),
      1,
    );
  }

  const mp4s = fs.readdirSync(outputDir).filter((f) => /^video_\d+\.mp4$/.test(f));
  task.state = "rendered";
  saveTask(outputDir, task);

  return emit(
    envelope({
      ok: true,
      verb: "render",
      task_id: task.task_id,
      content_hash: approved,
      artifacts: mp4s.map((f) => artifact(f, path.join(outputDir, f), "video")),
      data: { state: "rendered", output_dir: outputDir, videos: mp4s.length },
    }),
    0,
  );
}

// ─── Verb: package ────────────────────────────────────────────────────────────
// Prepare distribution artifacts + metadata. Builds meta.json (no title/desc/
// tags — Claudiny generates those) and a package_manifest.json applying the
// delivery exclusion list. Does NOT upload or publish.
function verbPackage(opts) {
  const rt = resolveTask(opts, "package");
  if (rt.error) return emit(envelope({ ok: false, verb: "package", errors: [rt.error] }), 2);
  const { outputDir, task } = rt;

  const warnings = [];
  const mp4s = fs.readdirSync(outputDir).filter((f) => /^video_\d+\.mp4$/.test(f)).sort();
  if (!mp4s.length) warnings.push("no rendered video_N.mp4 found — package may be incomplete");

  // Build meta.json if missing. Never add title/description/tags.
  const metaPath = path.join(outputDir, "meta.json");
  let meta;
  if (fs.existsSync(metaPath) && !opts.force) {
    meta = JSON.parse(fs.readFileSync(metaPath, "utf-8"));
  } else {
    meta = {
      topic: task.slug.replace(/-/g, " "),
      blog_url: "",
      source: task.slug,
      flow_source: "manual-curate",
      videos: mp4s.map((f) => {
        const n = f.match(/video_(\d+)\.mp4/)[1];
        return {
          video_number: Number(n),
          file: f,
          cover: `video_${n}_cover_photo.png`,
          script: `video_${n}_script.md`,
          subtitle: `video_${n}_audio.vtt`,
        };
      }),
    };
    if (!opts["dry-run"]) fs.writeFileSync(metaPath, JSON.stringify(meta, null, 2) + "\n");
  }

  // Apply the delivery exclusion list to compute the distributable set.
  const all = fs.readdirSync(outputDir).filter((f) => fs.statSync(path.join(outputDir, f)).isFile());
  const included = all.filter((f) => !isExcludedFromDelivery(f)).sort();
  const excluded = all.filter((f) => isExcludedFromDelivery(f));

  const fileHashes = {};
  for (const f of included) {
    fileHashes[f] = shortHash(contentHash(fs.readFileSync(path.join(outputDir, f))));
  }
  const setHash = shortHash(contentHash(included.map((f) => `${f}:${fileHashes[f]}`).join("|")));

  const manifest = {
    contract_version: CONTRACT_VERSION,
    task_id: task.task_id,
    slug: task.slug,
    content_hash: setHash,
    included_files: included,
    file_hashes: fileHashes,
    excluded_count: excluded.length,
    delivery_target: `gdrive:blog2video/${task.slug}/`,
    upload_command: `rclone copy ${outputDir}/ gdrive:blog2video/${task.slug}/ <exclusions per CLAUDE.md>`,
    note: "Distribution is human-gated; this verb does NOT upload or publish.",
  };

  const manifestPath = path.join(outputDir, "package_manifest.json");
  if (!opts["dry-run"]) {
    fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2) + "\n");
    if (task.state === "rendered") { task.state = "packaged"; saveTask(outputDir, task); }
  }

  const requiredCovers = mp4s.map((f) => `video_${f.match(/video_(\d+)/)[1]}_cover_photo.png`);
  const missingCovers = requiredCovers.filter((c) => !fs.existsSync(path.join(outputDir, c)));
  if (missingCovers.length) warnings.push(`missing cover photos: ${missingCovers.join(", ")}`);

  return emit(
    envelope({
      ok: true,
      verb: "package",
      task_id: task.task_id,
      content_hash: setHash,
      artifacts: [
        artifact("meta.json", metaPath, "metadata"),
        opts["dry-run"] ? { name: "package_manifest.json", path: manifestPath, role: "manifest", exists: false, content_hash: null } : artifact("package_manifest.json", manifestPath, "manifest"),
      ],
      warnings,
      data: {
        state: opts["dry-run"] ? task.state : (task.state || "packaged"),
        dry_run: Boolean(opts["dry-run"]),
        included_files: included,
        excluded_count: excluded.length,
        ready_for_delivery: mp4s.length > 0 && missingCovers.length === 0,
        output_dir: outputDir,
      },
    }),
    0,
  );
}

// ─── Router ───────────────────────────────────────────────────────────────────
function main() {
  const [, , verb, ...rest] = process.argv;
  const { opts } = parseArgs(rest);

  try {
    switch (verb) {
      case "assess": return verbAssess(opts);
      case "script": return verbScript(opts);
      case "revise-script": return verbRevise(opts);
      case "render": return verbRender(opts);
      case "package": return verbPackage(opts);
      case "--version":
      case "version":
        return emit(envelope({ ok: true, verb: "version", data: { contract_version: CONTRACT_VERSION } }), 0);
      default:
        return emit(
          envelope({
            ok: false,
            verb: verb || "(none)",
            errors: [`unknown verb: ${verb || "(none)"}`],
            data: { verbs: ["assess", "script --review-only", "revise-script", "render", "package"] },
          }),
          2,
        );
    }
  } catch (e) {
    return emit(envelope({ ok: false, verb: verb || "(none)", errors: [`unexpected: ${e.stack || e.message}`] }), 3);
  }
}

main();
