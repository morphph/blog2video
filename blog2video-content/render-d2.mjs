#!/usr/bin/env node
// render-d2 — black-box verb: approved narration → final video_N.mp4 (d2 path).
//
// Pattern (content-ops plan §1 v2.6): agent inside, contract outside. This shell
// owns EVERYTHING deterministic: the human-approval hash gate (mirrors cli.mjs
// `render` exactly: not_reviewed / stale_approval / already_rendered), stage
// sequencing, gates.mjs checks, TTS, build-scenes-data, build-scene, render-d2.sh,
// ffprobe validation, task-state transitions, envelope. Headless claude is
// spawned ONLY for the two generative stages, with NO Bash access:
//   A. episode split + slide plan + slide HTML (steps 1–3 of /blog2video-continue)
//   B. d2 scene-generator ×N (SKILL.md step 5h)
// Every stage is skipped when its artifacts already exist → crash-resume is
// free (same ethos as render-d2.sh's clip resume).
//
// Envelope / exit codes identical to cli.mjs (contract 1.0):
//   0 ok | 1 handled failure | 2 usage | 3 exception.
// Error tokens (errors[0]): not_reviewed | stale_approval | prereq_missing |
//   gate_script_failed | gate_manifest_failed | tts_failed | scenes_data_failed |
//   scene_gen_incomplete | build_scene_failed | render_failed | video_invalid.
//
// Test seam: RENDER_D2_FAKE_BIN reroutes EVERY external command (claude, node,
// npm, zsh, ffprobe) through one fake binary as `fake <name> <argv...>`, so
// tests/test-render-d2.mjs exercises all paths offline (no claude/Max/render).

import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
import {
  emit,
  envelope,
  loadTask,
  log,
  parseArgs,
  saveTask,
} from "./lib/contract.mjs";

const REPO_ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..");
const GATES = path.join(REPO_ROOT, "blog2video-remotion", "scripts", "gates.mjs");
const REMOTION_DIR = path.join(REPO_ROOT, "blog2video-remotion");
const SKILL_SCRIPTS = path.join(REPO_ROOT, ".claude", "skills", "blog2video", "scripts");

const VERB = "render-d2";
const ALLOWED_TOOLS = "Read,Write,Task,Glob,Grep"; // NO Bash — shell runs all commands
const TIMEOUT_A_S = 1800;
const TIMEOUT_B_S = 2700;
const TIMEOUT_STEP_S = 900;
const DEFAULT_TIMEOUT_RENDER_S = 3600;
const MAX_TURNS_A = 40;
const MAX_TURNS_B = 80;

// ── external command runner (single test seam) ───────────────────────────────

function runExternal(name, argv, { cwd = REPO_ROOT, timeoutS = TIMEOUT_STEP_S } = {}) {
  const fake = process.env.RENDER_D2_FAKE_BIN;
  const cmd = fake ? process.execPath : name;
  const args = fake ? [fake, name, ...argv] : argv;
  const env = { ...process.env };
  env.PATH = `${env.PATH || ""}:${process.env.HOME}/.npm-global/bin:${process.env.HOME}/.local/bin`;
  const proc = spawnSync(cmd, args, {
    cwd, env, encoding: "utf-8", timeout: timeoutS * 1000, maxBuffer: 64 * 1024 * 1024,
  });
  return {
    status: proc.error?.code === "ETIMEDOUT" ? "timeout" : proc.status,
    stdout: proc.stdout || "",
    stderr: proc.stderr || "",
    spawn_error: proc.error && proc.error.code !== "ETIMEDOUT" ? String(proc.error.message) : null,
  };
}

function runClaude(prompt, maxTurns, timeoutS) {
  const r = runExternal("claude", [
    "-p", prompt,
    "--allowedTools", ALLOWED_TOOLS,
    "--max-turns", String(maxTurns),
    "--output-format", "json",
  ], { timeoutS });
  const meta = { exit_code: r.status, num_turns: null, duration_ms: null, result_tail: null };
  try {
    const payload = JSON.parse(r.stdout);
    meta.num_turns = payload.num_turns ?? null;
    meta.duration_ms = payload.duration_ms ?? null;
    meta.total_cost_usd = payload.total_cost_usd ?? null;
    meta.result_tail = String(payload.result || "").slice(-200);
  } catch {
    meta.result_tail = String(r.stdout || r.stderr).slice(-200);
  }
  return meta;
}

function binarySha16(p) {
  return crypto.createHash("sha256").update(fs.readFileSync(p)).digest("hex").slice(0, 16);
}

function fileArtifact(name, p, role) {
  const exists = fs.existsSync(p);
  return { name, path: p, role, exists, content_hash: exists ? binarySha16(p) : null };
}

// ── main ──────────────────────────────────────────────────────────────────────

function main() {
  const { opts } = parseArgs(process.argv.slice(2));
  const warnings = [];
  const stages = {};

  if (!opts["output-dir"] || opts["output-dir"] === true) {
    return emit(envelope({ ok: false, verb: VERB, errors: ["usage", "--output-dir <dir> is required"] }), 2);
  }
  const outputDir = path.resolve(String(opts["output-dir"]));
  const approved = opts["approved-hash"];
  if (!approved || approved === true) {
    return emit(envelope({ ok: false, verb: VERB, errors: ["usage", "missing --approved-hash <review_hash>"] }), 2);
  }
  const vn = String(opts.video || 1);

  const task = loadTask(outputDir);
  if (!task) {
    return emit(envelope({ ok: false, verb: VERB, errors: ["usage", `no task ledger at ${outputDir} (run \`script --review-only\` first)`] }), 2);
  }

  // ── hash gate — mirrors cli.mjs render verbatim ────────────────────────────
  if (!task.review_hash) {
    return emit(envelope({
      ok: false, verb: VERB, task_id: task.task_id, errors: ["not_reviewed"],
      data: { state: task.state, hint: "run `script --review-only` to produce a review packet first" },
    }), 1);
  }
  if (approved !== task.review_hash) {
    return emit(envelope({
      ok: false, verb: VERB, task_id: task.task_id, content_hash: task.review_hash,
      errors: ["stale_approval"],
      data: { expected: task.review_hash, got: approved, hint: "re-review the current packet" },
    }), 1);
  }

  const mp4Path = path.join(outputDir, `video_${vn}.mp4`);
  const coverPath = path.join(outputDir, `video_${vn}_cover_photo.png`);

  // Idempotency: already rendered for this exact approval → no-op.
  if (task.state === "rendered" && task.approved_hash === approved && fs.existsSync(mp4Path) && !opts.force) {
    return emit(envelope({
      ok: true, verb: VERB, task_id: task.task_id, content_hash: approved,
      artifacts: [fileArtifact(`video_${vn}.mp4`, mp4Path, "video")],
      warnings: ["already_rendered (pass --force to re-render)"],
      data: { state: "rendered", output_dir: outputDir },
    }), 0);
  }

  // Prereqs of the generative pipeline (mirrors /blog2video-continue 前置检查).
  const missing = ["narration.md", "source_blog.md", "insight_memo.md"]
    .filter((f) => !fs.existsSync(path.join(outputDir, f)));
  if (missing.length) {
    return emit(envelope({
      ok: false, verb: VERB, task_id: task.task_id, errors: ["prereq_missing", missing.join(", ")],
      data: { output_dir: outputDir },
    }), 1);
  }

  if (opts["dry-run"]) {
    return emit(envelope({
      ok: true, verb: VERB, task_id: task.task_id, content_hash: approved,
      data: { would_render: true, state: "approved", output_dir: outputDir },
    }), 0);
  }

  task.approved_hash = approved;
  task.state = "approved";
  saveTask(outputDir, task);

  const scriptPath = path.join(outputDir, `video_${vn}_script.md`);
  const manifestPath = path.join(outputDir, "manifest.json");
  const audioPath = path.join(outputDir, `video_${vn}_audio.mp3`);
  const scenesData = path.join(outputDir, "scenes-data.json");
  const briefsDir = path.join(outputDir, "briefs");

  const fail = (token, detail, extra = {}) => emit(envelope({
    ok: false, verb: VERB, task_id: task.task_id, content_hash: approved, warnings,
    errors: detail ? [token, String(detail).slice(0, 800)] : [token],
    data: { state: "approved", output_dir: outputDir, stages, ...extra },
  }), 1);

  // ── Stage A: episode split + slide plan + slide HTML (agent, resumable) ─────
  const stageADone = () => fs.existsSync(path.join(outputDir, "video_plan.json"))
    && fs.existsSync(scriptPath) && fs.existsSync(manifestPath);

  const stageAPrompt =
    `Read .claude/commands/blog2video-continue.md. Execute ONLY Step 1 (Episode Splitter), ` +
    `Step 2 (Slide Planner) and Step 3 (Slide HTML Generator) for the output dir ${outputDir} — ` +
    `including their subagent calls exactly as the command file specifies. Do NOT run any shell ` +
    `command: skip the gates.mjs checks, skip TTS, skip everything from Step 4 onward (the caller ` +
    `runs those deterministically). Stop after video_plan.json, video_N_narration.md, ` +
    `video_N_script.md, slide_N.html, cover_photo.html and manifest.json are written. ` +
    `Your final output line must be exactly: CONTINUE_STAGE_A_DONE`;

  if (stageADone()) {
    stages.stage_a = "skipped (artifacts exist)";
  } else {
    stages.agent_a = runClaude(stageAPrompt, Number(opts["max-turns"]) || MAX_TURNS_A, TIMEOUT_A_S);
    if (!stageADone()) return fail("gate_script_failed", `stage A did not produce plan/script/manifest; tail=${stages.agent_a.result_tail}`);
    stages.stage_a = "ran";
  }

  // Gate 1 + Gate 2 (deterministic; one stage-A retry on failure).
  const runGates = () => {
    const g1 = runExternal("node", [GATES, "script", scriptPath]);
    if (g1.status !== 0) return { gate: "gate_script_failed", out: g1.stdout + g1.stderr };
    const g2 = runExternal("node", [GATES, "manifest", manifestPath, scriptPath]);
    if (g2.status !== 0) return { gate: "gate_manifest_failed", out: g2.stdout + g2.stderr };
    return null;
  };
  let gateFail = runGates();
  if (gateFail && stages.stage_a !== "ran") {
    // artifacts were stale/handmade — one regeneration attempt
    warnings.push(`existing stage-A artifacts failed ${gateFail.gate}; regenerating once`);
    stages.agent_a_retry = runClaude(stageAPrompt, Number(opts["max-turns"]) || MAX_TURNS_A, TIMEOUT_A_S);
    gateFail = runGates();
  } else if (gateFail && stages.stage_a === "ran") {
    warnings.push(`stage-A output failed ${gateFail.gate}; retrying stage A once`);
    stages.agent_a_retry = runClaude(stageAPrompt, Number(opts["max-turns"]) || MAX_TURNS_A, TIMEOUT_A_S);
    gateFail = runGates();
  }
  if (gateFail) return fail(gateFail.gate, gateFail.out.slice(-800));

  // ── TTS (deterministic, resumable) ──────────────────────────────────────────
  if (fs.existsSync(audioPath)) {
    stages.tts = "skipped (audio exists)";
  } else {
    log(`[render-d2] tts → ${audioPath}`);
    const t = runExternal("npm", ["run", "tts", "--", scriptPath, audioPath], { cwd: REMOTION_DIR, timeoutS: 900 });
    if (t.status !== 0 || !fs.existsSync(audioPath)) return fail("tts_failed", t.stderr.slice(-800) || t.spawn_error);
    stages.tts = "ran";
  }

  // ── build-scenes-data (deterministic, resumable) ────────────────────────────
  if (fs.existsSync(scenesData) && fs.existsSync(briefsDir)) {
    stages.scenes_data = "skipped (exists)";
  } else {
    const b = runExternal("node", [path.join(SKILL_SCRIPTS, "build-scenes-data.mjs"), outputDir, vn]);
    if (b.status !== 0 || !fs.existsSync(scenesData)) return fail("scenes_data_failed", (b.stderr || b.stdout).slice(-800));
    stages.scenes_data = "ran";
  }

  const briefs = fs.existsSync(briefsDir)
    ? fs.readdirSync(briefsDir).filter((f) => /^scene-\d+\.json$/.test(f)).sort()
    : [];
  if (!briefs.length) return fail("scenes_data_failed", "no briefs/scene-NN.json produced");
  const sceneIds = briefs.map((f) => f.replace(".json", "")); // scene-NN
  const srcFor = (id) => path.join(outputDir, "src", `${id}.html`);

  // ── Stage B: d2 scene-generator ×N (agent, resumable per scene) ────────────
  const missingScenes = () => sceneIds.filter((id) => !fs.existsSync(srcFor(id)));
  if (!missingScenes().length) {
    stages.stage_b = "skipped (all scene sources exist)";
  } else {
    const want = missingScenes();
    const stageBPrompt =
      `Read .claude/skills/blog2video/SKILL.md (step 5h) and .claude/skills/blog2video/prompts/scene-generator.md. ` +
      `For the output dir ${outputDir}: for EACH of these briefs — ${want.join(", ")} — dispatch a scene-generator ` +
      `subagent exactly as the prompt file specifies (brief JSON is at briefs/<id>.json; slide HTML and the d2-kit ` +
      `are where SKILL.md says). Each subagent must write ${outputDir}/src/<id>.html. Do NOT run any shell command ` +
      `(no build-scene.mjs, no lint scripts, no rendering — the caller runs those). ` +
      `Your final output line must be exactly: SCENES_DONE`;
    stages.agent_b = runClaude(stageBPrompt, Number(opts["max-turns-b"]) || MAX_TURNS_B, TIMEOUT_B_S);
    const still = missingScenes();
    if (still.length) return fail("scene_gen_incomplete", `missing src for: ${still.join(", ")}`, { missing_scenes: still });
    stages.stage_b = `ran (${want.length} scenes)`;
  }

  // ── build-scene all → scenes/scene-NN/index.html ────────────────────────────
  const builtFor = (id) => path.join(outputDir, "scenes", id, "index.html");
  const c = runExternal("node", [path.join(SKILL_SCRIPTS, "build-scene.mjs"), outputDir, "all"]);
  const unbuilt = sceneIds.filter((id) => !fs.existsSync(builtFor(id)));
  if (c.status !== 0 || unbuilt.length) {
    return fail("build_scene_failed", `exit=${c.status} unbuilt=${unbuilt.join(", ")} ${(c.stderr || c.stdout).slice(-400)}`);
  }
  stages.build_scene = "ran";

  // ── render-d2.sh (deterministic; resumes clips itself) ─────────────────────
  const renderStart = Date.now() - 1000;
  const timeoutRender = Number(opts["timeout-render"]) || DEFAULT_TIMEOUT_RENDER_S;
  log(`[render-d2] render-d2.sh ${outputDir} ${vn} (timeout ${timeoutRender}s)`);
  const r = runExternal("zsh", [path.join(SKILL_SCRIPTS, "render-d2.sh"), outputDir, vn], { timeoutS: timeoutRender });
  if (r.status !== 0) return fail("render_failed", `exit=${r.status} ${(r.stderr || r.stdout).slice(-800)}`);
  stages.render = "ran";

  // ── verify the video (disk is the only witness) ─────────────────────────────
  if (!fs.existsSync(mp4Path) || fs.statSync(mp4Path).mtimeMs < renderStart) {
    return fail("render_failed", `video_${vn}.mp4 missing or not (re)written by this run`);
  }
  const probe = runExternal("ffprobe", [
    "-v", "error", "-show_entries", "format=duration",
    "-of", "default=noprint_wrappers=1:nokey=1", mp4Path,
  ]);
  const duration = parseFloat(probe.stdout.trim());
  if (probe.status !== 0 || !(duration > 0)) {
    return fail("video_invalid", `ffprobe exit=${probe.status} duration=${probe.stdout.trim()}`);
  }

  // Advisory post-render gate (cover is non-fatal per SKILL.md).
  const pg = runExternal("node", [GATES, "postrender", mp4Path, coverPath]);
  if (pg.status !== 0) warnings.push(`postrender gate failed (advisory): ${(pg.stdout + pg.stderr).slice(-300)}`);
  if (!fs.existsSync(coverPath)) warnings.push(`cover photo missing: ${path.basename(coverPath)} (non-fatal)`);

  task.state = "rendered";
  saveTask(outputDir, task);

  return emit(envelope({
    ok: true,
    verb: VERB,
    task_id: task.task_id,
    content_hash: approved,
    artifacts: [
      fileArtifact(`video_${vn}.mp4`, mp4Path, "video"),
      fileArtifact(`video_${vn}_cover_photo.png`, coverPath, "cover"),
      fileArtifact("manifest.json", manifestPath, "manifest"),
    ],
    warnings,
    data: {
      state: "rendered",
      output_dir: outputDir,
      video: Number(vn),
      duration_s: Math.round(duration * 100) / 100,
      scenes: sceneIds.length,
      stages,
    },
  }), 0);
}

try {
  main();
} catch (e) {
  emit(envelope({ ok: false, verb: VERB, errors: [`unexpected: ${e.stack || e.message}`] }), 3);
}
