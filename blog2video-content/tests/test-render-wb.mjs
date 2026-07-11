#!/usr/bin/env node
// render-wb offline test — REAL verb against RENDER_WB_FAKE_BIN (no TTS API,
// no hyperframes, no ffmpeg). Mirrors test-render-d2.mjs ethos.
// Run: node blog2video-content/tests/test-render-wb.mjs

import assert from "node:assert";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

process.env.RENDER_WB_NO_MAIN = "1";
const { ttsScriptFromNarration, splitSections, assignCues, bboxToViewBox, buildStoryboard } =
  await import("../render-wb.mjs");

const HERE = path.dirname(fileURLToPath(import.meta.url));
const VERB = path.join(HERE, "..", "render-wb.mjs");

let passes = 0;
const failures = [];
function check(name, fn) {
  try {
    fn();
    passes += 1;
    console.log(`  PASS  ${name}`);
  } catch (e) {
    failures.push(name);
    console.log(`  FAIL  ${name}  ${String(e.message).slice(0, 240)}`);
  }
}

// ── pure units ────────────────────────────────────────────────────────────────

check("ttsScript strips headings, keeps quote text", () => {
  const out = ttsScriptFromNarration("# 大标题\n\n正文一。\n\n## 节标题\n\n> 引文内容。\n\n正文二。");
  assert.ok(!out.includes("大标题") && !out.includes("节标题"));
  assert.ok(out.includes("引文内容。") && out.includes("正文二。"));
});

check("splitSections: intro + N sections", () => {
  const s = splitSections("# t\n\n开场白。\n\n## 一\n\nA。\n\n## 二\n\nB。");
  assert.equal(s.length, 3);
  assert.equal(s[0].title, "__intro__");
  assert.ok(s[1].text.includes("A。") && s[2].text.includes("B。"));
});

check("bboxToViewBox: founder-mode offset (x-20, y+50)", () => {
  const canvas = { viewBox: "0 0 1270 1110", bbox: [30, -40, 1250, 1090] };
  assert.deepEqual(bboxToViewBox([110, 40, 940, 176], canvas), [90, 90, 940, 176]);
});

check("assignCues walks section boundaries in order", () => {
  const sections = [{ text: "开场白。" }, { text: "第一节内容甲。" }, { text: "第二节内容乙。" }];
  const cues = [
    { start: 0, end: 2, text: "开场白。" },
    { start: 2, end: 5, text: "第一节内容甲。" },
    { start: 5, end: 9, text: "第二节内容乙。" },
  ];
  const a = assignCues(sections, cues);
  assert.deepEqual(a.map((x) => x.length), [1, 1, 1]);
});

check("buildStoryboard: intro=home camera, sections map to step bboxes", () => {
  const narration = "# t\n\n开场白介绍整板。\n\n## 一\n\n第一节内容甲。\n\n## 二\n\n第二节内容乙。";
  const cues = [
    { start: 0, end: 4, text: "开场白介绍整板。" },
    { start: 4, end: 9, text: "第一节内容甲。" },
    { start: 9, end: 15, text: "第二节内容乙。" },
  ];
  const steps = {
    canvas: { viewBox: "0 0 1270 1110", bbox: [30, -40, 1250, 1090] },
    steps: [
      { step: 1, bbox: [110, 40, 940, 176] },
      { step: 2, bbox: [60, 300, 1150, 560] },
    ],
  };
  const sb = buildStoryboard({ narration, cues, steps, audioDuration: 15 });
  assert.equal(sb.scenes.length, 3);
  assert.deepEqual(sb.scenes[0].camera, [0, 0, 1270, 1110]);
  assert.equal(sb.scenes[0].emphasizeLayer, null);
  assert.deepEqual(sb.scenes[1].camera, [90, 90, 940, 176]);
  assert.equal(sb.scenes[1].emphasizeLayer, 1);
  assert.equal(sb.scenes[1].t0, 4);
  assert.equal(sb.scenes[2].t0, 9);
  assert.ok(sb.scenes[2].duration >= 6); // 15+0.6 tail - 9
  assert.equal(sb.scenes[1].subs[0].start, 0);
});

// ── end-to-end against fake bin ───────────────────────────────────────────────

const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "render-wb-"));
const out = path.join(tmp, "out");
fs.mkdirSync(path.join(out, "diagrams", "layers"), { recursive: true });

const NARR = "# 标题\n\n开场白介绍整板结构。\n\n## 第一层\n\n第一节内容甲甲甲。\n\n## 第二层\n\n第二节内容乙乙乙。\n";
fs.writeFileSync(path.join(out, "narration.md"), NARR);
fs.writeFileSync(path.join(out, "source_blog.md"), "src");
fs.writeFileSync(path.join(out, "diagrams", "steps.json"), JSON.stringify({
  contract_version: "layer-export.v1",
  canvas: { viewBox: "0 0 1270 1110", bbox: [30, -40, 1250, 1090] },
  steps: [
    { step: 1, bbox: [110, 40, 940, 176], file: "layers/step-01.svg" },
    { step: 2, bbox: [60, 300, 1150, 560], file: "layers/step-02.svg" },
  ],
}));
for (const n of ["01", "02"]) {
  fs.writeFileSync(path.join(out, "diagrams", "layers", `step-${n}.svg`),
    `<svg viewBox="0 0 1270 1110"></svg>`);
}
fs.writeFileSync(path.join(out, ".b2v-task.json"), JSON.stringify({
  task_id: "b2v_test", slug: "t", source_path: "source_blog.md", source_hash: "s",
  revision: 1, feedback_log: [], review_hash: "goodhash1234", state: "awaiting_review",
  approved_hash: null, updated_at: "2026-07-11T00:00:00Z",
}));

// fake bin: emulates npm(tts) / ffprobe / hyperframes / ffmpeg; logs calls.
const fakeBin = path.join(tmp, "fake.mjs");
fs.writeFileSync(fakeBin, `
import fs from "node:fs";
import path from "node:path";
const [name, ...argv] = process.argv.slice(2);
fs.appendFileSync(path.join(process.env.FAKE_LOG_DIR, "calls.log"), JSON.stringify([name, ...argv]) + "\\n");
if (name === "npm") {
  const script = argv[3], audio = argv[4];
  fs.writeFileSync(audio, "MP3");
  fs.writeFileSync(audio.replace(/\\.mp3$/, "_subtitles.json"), JSON.stringify([
    { start: 0, end: 4, text: "开场白介绍整板结构。" },
    { start: 4, end: 9, text: "第一节内容甲甲甲。" },
    { start: 9, end: 15, text: "第二节内容乙乙乙。" },
  ]));
} else if (name === "ffprobe") {
  console.log("15.0");
} else if (name === "hyperframes") {
  const o = argv[argv.indexOf("-o") + 1];
  fs.writeFileSync(o, "CLIP");
} else if (name === "ffmpeg") {
  fs.writeFileSync(argv[argv.length - 1], "VIDEO");
}
process.exit(0);
`);

function runVerb(...args) {
  const proc = spawnSync(process.execPath, [VERB, ...args], {
    encoding: "utf-8",
    env: {
      ...process.env,
      RENDER_WB_NO_MAIN: "",
      RENDER_WB_FAKE_BIN: fakeBin,
      FAKE_LOG_DIR: tmp,
    },
  });
  let payload = null;
  try { payload = JSON.parse(proc.stdout); } catch {}
  return { payload, code: proc.status, raw: (proc.stdout + proc.stderr).slice(-800) };
}

check("stale hash → stale_approval exit 1", () => {
  const { payload, code } = runVerb("--output-dir", out, "--approved-hash", "WRONG");
  assert.equal(code, 1);
  assert.equal(payload.errors[0], "stale_approval");
});

check("dry-run passes gate without artifacts", () => {
  const { payload, code } = runVerb("--output-dir", out, "--approved-hash", "goodhash1234", "--dry-run");
  assert.equal(code, 0);
  assert.equal(payload.data.would_render, true);
});

check("prereq_missing when steps.json absent", () => {
  fs.renameSync(path.join(out, "diagrams", "steps.json"), path.join(tmp, "steps.bak"));
  const { payload, code } = runVerb("--output-dir", out, "--approved-hash", "goodhash1234");
  fs.renameSync(path.join(tmp, "steps.bak"), path.join(out, "diagrams", "steps.json"));
  assert.equal(code, 1);
  assert.equal(payload.errors[0], "prereq_missing");
});

let happy;
check("happy path → rendered, video artifact, 3 scenes", () => {
  happy = runVerb("--output-dir", out, "--approved-hash", "goodhash1234");
  assert.equal(happy.code, 0, happy.raw);
  assert.equal(happy.payload.data.state, "rendered");
  assert.equal(happy.payload.data.scenes, 3);
  assert.ok(fs.existsSync(path.join(out, "video_1.mp4")));
  const task = JSON.parse(fs.readFileSync(path.join(out, ".b2v-task.json")));
  assert.equal(task.state, "rendered");
  assert.equal(task.approved_hash, "goodhash1234");
});

check("scene HTML carries landscape data-width/height + layers symlink", () => {
  const html = fs.readFileSync(path.join(out, "scenes", "scene-02", "index.html"), "utf-8");
  assert.ok(html.includes('data-width="1920"') && html.includes('data-height="1080"'));
  assert.ok(html.includes('WB.register'));
  assert.ok(html.includes('class="layer on"'), "all layers preset ON (whole-board opening)");
  assert.ok(fs.lstatSync(path.join(out, "scenes", "scene-01", "layers")).isSymbolicLink());
});

check("storyboard.json: intro home camera + section cameras converted", () => {
  const sb = JSON.parse(fs.readFileSync(path.join(out, "storyboard.json")));
  assert.deepEqual(sb.scenes[0].camera, [0, 0, 1270, 1110]);
  assert.deepEqual(sb.scenes[1].camera, [90, 90, 940, 176]);
});

check("re-run with same hash → already_rendered no-op", () => {
  const { payload, code } = runVerb("--output-dir", out, "--approved-hash", "goodhash1234");
  assert.equal(code, 0);
  assert.ok(payload.warnings[0].startsWith("already_rendered"));
});

check("clip resume: only missing clips re-render", () => {
  const callsBefore = fs.readFileSync(path.join(tmp, "calls.log"), "utf-8")
    .split("\n").filter((l) => l.includes('"hyperframes"')).length;
  // force re-render but keep clips 01/02, drop 03
  fs.rmSync(path.join(out, "video_1.mp4"));
  fs.rmSync(path.join(out, "clips", "scene-03.mp4"));
  const task = JSON.parse(fs.readFileSync(path.join(out, ".b2v-task.json")));
  task.state = "approved";
  fs.writeFileSync(path.join(out, ".b2v-task.json"), JSON.stringify(task));
  const { code } = runVerb("--output-dir", out, "--approved-hash", "goodhash1234");
  assert.equal(code, 0);
  const callsAfter = fs.readFileSync(path.join(tmp, "calls.log"), "utf-8")
    .split("\n").filter((l) => l.includes('"hyperframes"')).length;
  assert.equal(callsAfter - callsBefore, 1, "exactly one scene re-rendered");
});

fs.rmSync(tmp, { recursive: true, force: true });

const total = passes + failures.length;
console.log(`\n${"=".repeat(52)}\n${passes}/${total} checks passed${failures.length ? "  —  FAILED: " + failures.join(", ") : "  —  ALL GREEN ✓"}`);
process.exit(failures.length ? 1 : 0);
