#!/usr/bin/env node
// render-wb — deterministic verb: approved wb narration → final video_N.mp4
// (whiteboard lane, S7+S9+S10 collapsed into one staged, resumable verb).
//
// Unlike render-d2 there is NO agent inside: the whiteboard's visual truth is
// already in the layered SVGs (learn/S2 export), and the author-approved B档
// narration is structurally 1:1 with the layers (## section ⇄ layer N). Every
// stage is pure code:
//   1. tts-script   narration.md → video_N_script.md (strip headings/quote markers)
//   2. tts          npm run tts (MiniMax) → audio + subtitles json (+vtt)
//   3. storyboard   sections × subtitle cues × diagrams/steps.json → storyboard.json
//   4. scenes       storyboard → scenes/scene-NN/index.html (wb-kit inlined;
//                   全板常显 whole-board opening per author 2026-07-09 feedback:
//                   all layers preset ON, camera pushes per section, light pop
//                   emphasis on the section's layer)
//   5. render       hyperframes per scene (resumable) → concat → mux raw audio
//                   (no loudnorm, no -shortest — mirrors render-d2.sh)
//
// Hash gate / envelope / exit codes identical to render-d2.mjs (contract 1.0):
//   0 ok | 1 handled failure | 2 usage | 3 exception.
// Error tokens: not_reviewed | stale_approval | prereq_missing | tts_failed |
//   storyboard_failed | scenes_failed | render_failed | video_invalid.
//
// Critical render contract (specs/render-wb-vps.md): the composition root
// (the element with data-composition-id) MUST carry data-width/data-height —
// hyperframes ignores <html data-resolution>/CSS and defaults to portrait.
//
// Test seam: RENDER_WB_FAKE_BIN reroutes every external command (npm,
// hyperframes, ffmpeg, ffprobe) through one fake binary as `fake <name> <argv…>`.

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
const REMOTION_DIR = path.join(REPO_ROOT, "blog2video-remotion");
const WB_KIT = path.join(REPO_ROOT, ".claude", "skills", "blog2video", "design", "wb-kit");

const VERB = "render-wb";
const TIMEOUT_STEP_S = 900;
const DEFAULT_TIMEOUT_RENDER_S = 5400; // ~11min 成片 ≈ 40min VPS 渲染 + 余量
const STAGE_W = 1920;
const STAGE_H = 1080;
const SS = 2;
const INTRO_MIN_S = 3; // 整板开场至少停留

function runExternal(name, argv, { cwd = REPO_ROOT, timeoutS = TIMEOUT_STEP_S } = {}) {
  const fake = process.env.RENDER_WB_FAKE_BIN;
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

function binarySha16(p) {
  return crypto.createHash("sha256").update(fs.readFileSync(p)).digest("hex").slice(0, 16);
}

function fileArtifact(name, p, role) {
  const exists = fs.existsSync(p);
  return { name, path: p, role, exists, content_hash: exists ? binarySha16(p) : null };
}

// ── stage 1: narration → TTS script (deterministic strip) ─────────────────────
// Headings live on the whiteboard (DESIGN: 手写文字都在图内) — not read aloud.
// Blockquote markers are stripped but the quote text IS read (author-approved copy).
export function ttsScriptFromNarration(narration) {
  return narration
    .split("\n")
    .filter((l) => !/^#{1,6}\s/.test(l.trim()))
    .map((l) => l.replace(/^\s*>\s?/, ""))
    .join("\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim() + "\n";
}

// ── stage 3: sections × cues × steps.json → storyboard ───────────────────────
// Section = text before first "## " (intro/whole-board) + one per "## ".
export function splitSections(narration) {
  const lines = narration.split("\n");
  const sections = [{ title: "__intro__", body: [] }];
  for (const line of lines) {
    const m = line.match(/^##\s+(.*)$/);
    if (m) sections.push({ title: m[1].trim(), body: [] });
    else sections[sections.length - 1].body.push(line);
  }
  return sections.map((s) => ({
    title: s.title,
    text: ttsScriptFromNarration(s.body.join("\n")),
  }));
}

const normalize = (t) => t.replace(/[\s　]+/g, "").replace(/[，。！？；：、「」『』（）,.!?;:"'()\-—…·]/g, "");

// Assign each subtitle cue to a section by walking the concatenated normalized
// section text with a cursor (TTS reads the script verbatim, so cue order ==
// text order; fuzzy boundaries only shift a cue by one, which moves a camera
// cut by ~3s — acceptable, deterministic).
export function assignCues(sections, cues) {
  const secNorm = sections.map((s) => normalize(s.text));
  const bounds = [];
  let acc = 0;
  for (const n of secNorm) { acc += n.length; bounds.push(acc); }
  let cursor = 0;
  let sec = 0;
  const assigned = sections.map(() => []);
  for (const cue of cues) {
    const n = normalize(cue.text);
    const mid = cursor + n.length / 2;
    while (sec < bounds.length - 1 && mid >= bounds[sec]) sec += 1;
    assigned[sec].push(cue);
    cursor += n.length;
  }
  return assigned;
}

// viewBox ↔ steps.json bbox 坐标换算：层 SVG 的 viewBox 原点 = canvas.bbox 原点
// 减去均匀 margin（margin = (viewBoxW - bboxW)/2）。机械换算，绝不让人/agent 猜。
export function bboxToViewBox(bbox, canvas) {
  const [vx, vy, vw, vh] = String(canvas.viewBox).split(/\s+/).map(Number);
  const marginX = (vw - canvas.bbox[2]) / 2;
  const marginY = (vh - canvas.bbox[3]) / 2;
  const offX = canvas.bbox[0] - marginX - vx;
  const offY = canvas.bbox[1] - marginY - vy;
  return [bbox[0] - offX, bbox[1] - offY, bbox[2], bbox[3]];
}

export function buildStoryboard({ narration, cues, steps, audioDuration }) {
  const sections = splitSections(narration);
  const assigned = assignCues(sections, cues);
  const canvas = steps.canvas;
  const [, , vw, vh] = String(canvas.viewBox).split(/\s+/).map(Number);
  const home = [0, 0, vw, vh];
  const scenes = [];
  // scene start = its first cue's start; empty sections fold into the previous.
  const merged = [];
  sections.forEach((s, i) => {
    if (assigned[i].length === 0 && merged.length) {
      merged[merged.length - 1].cues.push(...assigned[i]);
      return;
    }
    merged.push({ index: i, title: s.title, cues: assigned[i] });
  });
  merged.forEach((m, k) => {
    const t0 = k === 0 ? 0 : m.cues[0].start;
    const next = merged[k + 1];
    const t1 = next ? next.cues[0].start : Math.max(audioDuration + 0.6, m.cues.at(-1)?.end ?? 0);
    const stepIdx = m.index; // section i ⇄ steps[i-1]（intro=0 无层）
    const step = stepIdx >= 1 ? steps.steps[Math.min(stepIdx, steps.steps.length) - 1] : null;
    scenes.push({
      id: `scene-${String(k + 1).padStart(2, "0")}`,
      section: m.title,
      t0: Math.round(t0 * 1000) / 1000,
      duration: Math.round((t1 - t0) * 1000) / 1000,
      camera: step ? bboxToViewBox(step.bbox, canvas) : home,
      emphasizeLayer: step ? steps.steps.indexOf(step) + 1 : null,
      subs: m.cues.map((c) => ({
        start: Math.round((c.start - t0) * 1000) / 1000,
        end: Math.round((c.end - t0) * 1000) / 1000,
        text: c.text,
      })),
    });
  });
  if (scenes.length && scenes[0].duration < INTRO_MIN_S) scenes[0].duration = INTRO_MIN_S;
  return { contract_version: "wb-storyboard.v1", home, layerCount: steps.steps.length, scenes };
}

// ── stage 4: storyboard → scene HTML (wb-kit inlined, whole-board opening) ────
const esc = (t) => t.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

export function sceneHtml({ scene, prevCamera, storyboard, wbCss, wbJs, canvasW, canvasH }) {
  const layers = Array.from({ length: storyboard.layerCount }, (_, i) =>
    `      <img class="layer on" id="ly${i + 1}" src="layers/step-${String(i + 1).padStart(2, "0")}.svg">`
  ).join("\n");
  const subs = scene.subs.map((s, i) =>
    `  <div class="sub" id="sub-${i + 1}" style="opacity:0"><div class="sub-inner">${esc(s.text)}</div></div>`
  ).join("\n");
  const subTl = scene.subs.map((s, i) => {
    const sel = `R+'#sub-${i + 1}'`;
    const hide = i + 1 < scene.subs.length
      ? `tl.set(${sel}, {opacity:0}, ${scene.subs[i + 1].start});`
      : "";
    return `  tl.to(${sel}, {opacity:1, duration:0.2, ease:'power1.out'}, ${Math.max(s.start, 0)}); ${hide}`;
  }).join("\n");
  const emph = scene.emphasizeLayer
    ? `  tl.fromTo(R+'#ly${scene.emphasizeLayer}', {opacity:0.55, scale:0.99}, {opacity:1, scale:1, duration:0.5, ease:'power2.out', transformOrigin:'50% 50%'}, 0.1);`
    : "";
  const move = JSON.stringify(scene.camera) === JSON.stringify(prevCamera)
    ? ""
    : `  WB.camera(tl, R, ${JSON.stringify(scene.camera)}, 0.35, {d: 1.6});`;
  return `<!doctype html>
<html lang="zh-CN">
<head>
<meta charset="UTF-8" />
<script src="https://cdn.jsdelivr.net/npm/gsap@3.14.2/dist/gsap.min.js"></script>
<style>
${wbCss}
</style>
</head>
<body>
<div class="stage" data-composition-id="${scene.id}" data-width="${STAGE_W}" data-height="${STAGE_H}" data-duration="${scene.duration}">
  <div class="viewport">
    <div class="canvas" data-ss="${SS}" style="width:${canvasW * SS}px;height:${canvasH * SS}px">
${layers}
    </div>
  </div>
${subs}
</div>
<script>
${wbJs}
</script>
<script>
(function(){
  var R = "[data-composition-id='${scene.id}'] ";
  var tl = gsap.timeline({ paused: true });
  WB.setCamera(tl, R, ${JSON.stringify(prevCamera)}, 0);
${move}
${emph}
  WB.breath(tl, R, 0, ${scene.duration}, '${Number(scene.id.slice(-2)) % 2 ? "in" : "out"}');
${subTl}
  tl.set({}, {}, ${scene.duration});
  WB.register('${scene.id}', tl);
})();
</script>
</body>
</html>
`;
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

  // hash gate — mirrors cli.mjs/render-d2 verbatim
  if (!task.review_hash) {
    return emit(envelope({
      ok: false, verb: VERB, task_id: task.task_id, errors: ["not_reviewed"],
      data: { state: task.state, hint: "run `script --review-only` first" },
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
  if (task.state === "rendered" && task.approved_hash === approved && fs.existsSync(mp4Path) && !opts.force) {
    return emit(envelope({
      ok: true, verb: VERB, task_id: task.task_id, content_hash: approved,
      artifacts: [fileArtifact(`video_${vn}.mp4`, mp4Path, "video")],
      warnings: ["already_rendered (pass --force to re-render)"],
      data: { state: "rendered", output_dir: outputDir },
    }), 0);
  }

  const stepsPath = path.join(outputDir, "diagrams", "steps.json");
  const layersDir = path.join(outputDir, "diagrams", "layers");
  const missing = ["narration.md", "source_blog.md"]
    .filter((f) => !fs.existsSync(path.join(outputDir, f)));
  if (!fs.existsSync(stepsPath)) missing.push("diagrams/steps.json");
  if (!fs.existsSync(layersDir)) missing.push("diagrams/layers/");
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

  const fail = (token, detail, extra = {}) => emit(envelope({
    ok: false, verb: VERB, task_id: task.task_id, content_hash: approved, warnings,
    errors: detail ? [token, String(detail).slice(0, 800)] : [token],
    data: { state: "approved", output_dir: outputDir, stages, ...extra },
  }), 1);

  const narration = fs.readFileSync(path.join(outputDir, "narration.md"), "utf-8");
  const scriptPath = path.join(outputDir, `video_${vn}_script.md`);
  const audioPath = path.join(outputDir, `video_${vn}_audio.mp3`);
  const subsPath = path.join(outputDir, `video_${vn}_audio_subtitles.json`);
  const storyboardPath = path.join(outputDir, "storyboard.json");

  // 1) tts script (always rewritten — cheap & deterministic)
  fs.writeFileSync(scriptPath, ttsScriptFromNarration(narration));
  stages.tts_script = "ran";

  // 2) TTS
  if (fs.existsSync(audioPath) && fs.existsSync(subsPath)) {
    stages.tts = "skipped (audio exists)";
  } else {
    log(`[render-wb] tts → ${audioPath}`);
    const t = runExternal("npm", ["run", "tts", "--", scriptPath, audioPath], { cwd: REMOTION_DIR, timeoutS: 900 });
    if (t.status !== 0 || !fs.existsSync(audioPath) || !fs.existsSync(subsPath)) {
      return fail("tts_failed", (t.stderr || t.stdout).slice(-800) || t.spawn_error);
    }
    stages.tts = "ran";
  }

  // 3) storyboard (deterministic; rebuilt when missing or older than inputs)
  const steps = JSON.parse(fs.readFileSync(stepsPath, "utf-8"));
  const cues = JSON.parse(fs.readFileSync(subsPath, "utf-8"));
  const probeA = runExternal("ffprobe", [
    "-v", "error", "-show_entries", "format=duration",
    "-of", "default=noprint_wrappers=1:nokey=1", audioPath,
  ]);
  const audioDuration = parseFloat(probeA.stdout.trim());
  if (probeA.status !== 0 || !(audioDuration > 0)) {
    return fail("tts_failed", `ffprobe on audio: exit=${probeA.status} out=${probeA.stdout.trim()}`);
  }
  let storyboard;
  try {
    storyboard = buildStoryboard({ narration, cues, steps, audioDuration });
  } catch (e) {
    return fail("storyboard_failed", e.stack || e.message);
  }
  if (!storyboard.scenes.length) return fail("storyboard_failed", "no scenes derived");
  fs.writeFileSync(storyboardPath, JSON.stringify(storyboard, null, 2));
  stages.storyboard = `ran (${storyboard.scenes.length} scenes)`;

  // 4) scenes (deterministic template; overwritten each run — cheap)
  let wbCss, wbJs;
  try {
    wbCss = fs.readFileSync(path.join(WB_KIT, "wb-base.css"), "utf-8")
      .split("\n").filter((l) => !l.includes("@font-face")).join("\n");
    wbJs = fs.readFileSync(path.join(WB_KIT, "wb-motion.js"), "utf-8");
  } catch (e) {
    return fail("scenes_failed", `wb-kit missing: ${e.message}`);
  }
  const [, , canvasW, canvasH] = String(steps.canvas.viewBox).split(/\s+/).map(Number);
  let prevCamera = storyboard.home;
  for (const scene of storyboard.scenes) {
    const dir = path.join(outputDir, "scenes", scene.id);
    fs.mkdirSync(dir, { recursive: true });
    const layerLink = path.join(dir, "layers");
    if (!fs.existsSync(layerLink)) {
      fs.symlinkSync(path.relative(dir, layersDir), layerLink);
    }
    fs.writeFileSync(path.join(dir, "index.html"),
      sceneHtml({ scene, prevCamera, storyboard, wbCss, wbJs, canvasW, canvasH }));
    prevCamera = scene.camera;
  }
  stages.scenes = `ran (${storyboard.scenes.length})`;

  // 5) render per scene (resumable) → concat → mux
  const clipsDir = path.join(outputDir, "clips");
  fs.mkdirSync(clipsDir, { recursive: true });
  const renderStart = Date.now() - 1000;
  const timeoutRender = Number(opts["timeout-render"]) || DEFAULT_TIMEOUT_RENDER_S;
  for (const scene of storyboard.scenes) {
    const clip = path.join(clipsDir, `${scene.id}.mp4`);
    if (fs.existsSync(clip)) continue;
    log(`[render-wb] hyperframes ${scene.id} (${scene.duration}s)`);
    const r = runExternal("hyperframes",
      ["render", path.join(outputDir, "scenes", scene.id), "-o", clip, "--quiet"],
      { timeoutS: timeoutRender });
    if (r.status !== 0 || !fs.existsSync(clip)) {
      return fail("render_failed", `${scene.id}: exit=${r.status} ${(r.stderr || r.stdout).slice(-600)}`,
        { failed_scene: scene.id, hint: "clips resume — re-run to continue from this scene" });
    }
  }
  stages.render = `ran (${storyboard.scenes.length} clips)`;

  const concatList = path.join(outputDir, "concat.txt");
  fs.writeFileSync(concatList,
    storyboard.scenes.map((s) => `file 'clips/${s.id}.mp4'`).join("\n") + "\n");
  const silent = path.join(outputDir, `video_${vn}_silent.mp4`);
  const cc = runExternal("ffmpeg", ["-y", "-f", "concat", "-safe", "0", "-i", concatList, "-c", "copy", silent], { cwd: outputDir });
  if (cc.status !== 0 || !fs.existsSync(silent)) return fail("render_failed", `concat: ${(cc.stderr || "").slice(-600)}`);
  // raw audio mux — no loudnorm, no -shortest (mirrors render-d2.sh: 音频放完转静音)
  const mx = runExternal("ffmpeg", ["-y", "-i", silent, "-i", audioPath,
    "-c:v", "copy", "-c:a", "aac", "-b:a", "192k", mp4Path]);
  if (mx.status !== 0) return fail("render_failed", `mux: ${(mx.stderr || "").slice(-600)}`);
  stages.mux = "ran";

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
  if (Math.abs(duration - (storyboard.scenes.at(-1).t0 + storyboard.scenes.at(-1).duration)) > 3) {
    warnings.push(`duration drift: video=${duration}s vs storyboard=${storyboard.scenes.at(-1).t0 + storyboard.scenes.at(-1).duration}s`);
  }

  task.state = "rendered";
  saveTask(outputDir, task);

  return emit(envelope({
    ok: true,
    verb: VERB,
    task_id: task.task_id,
    content_hash: approved,
    artifacts: [
      fileArtifact(`video_${vn}.mp4`, mp4Path, "video"),
      fileArtifact("storyboard.json", storyboardPath, "storyboard"),
    ],
    warnings,
    data: {
      state: "rendered",
      output_dir: outputDir,
      video: Number(vn),
      duration_s: Math.round(duration * 100) / 100,
      scenes: storyboard.scenes.length,
      stages,
    },
  }), 0);
}

// Runs on import (the bin dispatcher dynamic-imports this module, same as
// render-d2). Tests import pure functions with RENDER_WB_NO_MAIN=1.
if (!process.env.RENDER_WB_NO_MAIN) {
  try {
    main();
  } catch (e) {
    emit(envelope({ ok: false, verb: VERB, errors: [`unexpected: ${e.stack || e.message}`] }), 3);
  }
}
