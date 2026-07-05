#!/usr/bin/env node
// Offline tests for the render-d2 black-box verb (render-d2.mjs).
// No claude / no Max / no real render: RENDER_D2_FAKE_BIN reroutes every
// external command (claude, node, npm, zsh, ffprobe) through one fake that
// fabricates artifacts, logs invocations, and fails on demand via FAKE_FAIL.
//
// Run: node blog2video-content/tests/test-render-d2.mjs

import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

const HERE = path.dirname(new URL(import.meta.url).pathname);
const VERB = path.resolve(HERE, "..", "render-d2.mjs");
const HASH = "0aa84d1b1fe4b1ab";

const FAKE = `#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
const [name, ...argv] = process.argv.slice(2);
const out = process.env.FAKE_OUT;
const fails = (process.env.FAKE_FAIL || "").split(",");
fs.appendFileSync(process.env.FAKE_LOG, name + " " + argv.join(" ") + "\\n");

const j = (...p) => path.join(out, ...p);
function stageA() {
  if (fails.includes("stage_a")) return;
  fs.writeFileSync(j("video_plan.json"), JSON.stringify({ videos: 1 }));
  fs.writeFileSync(j("video_1_narration.md"), "n");
  fs.writeFileSync(j("video_1_script.md"), "[SLIDE 1: cover] script");
  fs.writeFileSync(j("slide_1.html"), "<html></html>");
  fs.writeFileSync(j("cover_photo.html"), "<html></html>");
  fs.writeFileSync(j("manifest.json"), JSON.stringify({ slides: 1 }));
}
function stageB() {
  if (fails.includes("scene_gen")) return;
  fs.mkdirSync(j("src"), { recursive: true });
  for (const f of fs.readdirSync(j("briefs"))) {
    const id = f.replace(".json", "");
    fs.writeFileSync(j("src", id + ".html"), "<html>scene</html>");
  }
}

if (name === "claude") {
  const prompt = argv[argv.indexOf("-p") + 1];
  if (prompt.includes("CONTINUE_STAGE_A_DONE")) stageA(); else stageB();
  console.log(JSON.stringify({ num_turns: 9, duration_ms: 1000, total_cost_usd: 0.5, result: "done" }));
  process.exit(0);
}
if (name === "node") {
  const script = argv[0];
  if (script.endsWith("gates.mjs")) {
    const gate = argv[1];
    process.exit(fails.includes("gate_" + gate) ? 1 : 0);
  }
  if (script.endsWith("build-scenes-data.mjs")) {
    if (!fails.includes("scenes_data")) {
      fs.writeFileSync(j("scenes-data.json"), JSON.stringify([{ dur: 5 }, { dur: 6 }]));
      fs.mkdirSync(j("briefs"), { recursive: true });
      fs.writeFileSync(j("briefs", "scene-01.json"), "{}");
      fs.writeFileSync(j("briefs", "scene-02.json"), "{}");
    }
    process.exit(fails.includes("scenes_data") ? 1 : 0);
  }
  if (script.endsWith("build-scene.mjs")) {
    if (!fails.includes("build_scene")) {
      for (const f of fs.readdirSync(j("briefs"))) {
        const id = f.replace(".json", "");
        fs.mkdirSync(j("scenes", id), { recursive: true });
        fs.writeFileSync(j("scenes", id, "index.html"), "<html>built</html>");
      }
    }
    process.exit(fails.includes("build_scene") ? 1 : 0);
  }
  process.exit(0);
}
if (name === "npm") {
  if (!fails.includes("tts")) fs.writeFileSync(j("video_1_audio.mp3"), "AUDIO");
  process.exit(fails.includes("tts") ? 1 : 0);
}
if (name === "zsh") {
  if (!fails.includes("render")) fs.writeFileSync(j("video_1.mp4"), "MP4BYTES");
  if (!fails.includes("cover")) fs.writeFileSync(j("video_1_cover_photo.png"), "PNG");
  process.exit(fails.includes("render") ? 1 : 0);
}
if (name === "ffprobe") {
  console.log(fails.includes("probe") ? "0" : "123.45");
  process.exit(0);
}
process.exit(0);
`;

let tmp, out, fakePath, logPath;
function setup({ state = "awaiting_review", reviewHash = HASH, approvedHash = null } = {}) {
  tmp = fs.mkdtempSync(path.join(os.tmpdir(), "render-d2-test-"));
  out = path.join(tmp, "out");
  fs.mkdirSync(out);
  fakePath = path.join(tmp, "fake.mjs");
  fs.writeFileSync(fakePath, FAKE);
  logPath = path.join(tmp, "invocations.log");
  fs.writeFileSync(logPath, "");
  for (const f of ["narration.md", "source_blog.md", "insight_memo.md"])
    fs.writeFileSync(path.join(out, f), "content of " + f);
  fs.writeFileSync(path.join(out, ".b2v-task.json"), JSON.stringify({
    task_id: "b2v_test", slug: "out", source_hash: "s", revision: 0,
    review_hash: reviewHash, state, approved_hash: approvedHash, feedback_log: [],
  }));
  return out;
}

function run(args, fail = "") {
  let stdout, status = 0;
  try {
    stdout = execFileSync(process.execPath, [VERB, ...args], {
      encoding: "utf-8",
      env: { ...process.env, RENDER_D2_FAKE_BIN: fakePath, FAKE_OUT: out, FAKE_LOG: logPath, FAKE_FAIL: fail },
    });
  } catch (e) {
    stdout = e.stdout;
    status = e.status;
  }
  return { env: JSON.parse(stdout), status };
}

const calls = () => fs.readFileSync(logPath, "utf-8").trim().split("\n").filter(Boolean);

const tests = {
  usage_errors() {
    setup();
    assert.equal(run([]).status, 2);
    assert.equal(run(["--output-dir", out]).status, 2);
  },

  not_reviewed() {
    setup({ reviewHash: null });
    const { env, status } = run(["--output-dir", out, "--approved-hash", HASH]);
    assert.equal(status, 1);
    assert.equal(env.errors[0], "not_reviewed");
  },

  stale_approval() {
    setup();
    const { env, status } = run(["--output-dir", out, "--approved-hash", "WRONGHASH"]);
    assert.equal(status, 1);
    assert.equal(env.errors[0], "stale_approval");
    assert.equal(env.data.expected, HASH);
    assert.equal(calls().length, 0, "gate refusal must not invoke anything");
  },

  prereq_missing() {
    setup();
    fs.unlinkSync(path.join(out, "insight_memo.md"));
    const { env, status } = run(["--output-dir", out, "--approved-hash", HASH]);
    assert.equal(status, 1);
    assert.equal(env.errors[0], "prereq_missing");
    assert.match(env.errors[1], /insight_memo/);
  },

  dry_run_checks_gate_only() {
    setup();
    const { env, status } = run(["--output-dir", out, "--approved-hash", HASH, "--dry-run"]);
    assert.equal(status, 0);
    assert.equal(env.data.would_render, true);
    assert.equal(calls().length, 0, "dry-run must not invoke anything");
  },

  full_success_path() {
    setup();
    const { env, status } = run(["--output-dir", out, "--approved-hash", HASH]);
    assert.equal(status, 0, JSON.stringify(env));
    assert.equal(env.ok, true);
    assert.equal(env.data.state, "rendered");
    assert.equal(env.data.duration_s, 123.45);
    assert.equal(env.data.scenes, 2);
    assert.equal(env.content_hash, HASH);
    const task = JSON.parse(fs.readFileSync(path.join(out, ".b2v-task.json"), "utf-8"));
    assert.equal(task.state, "rendered");
    assert.equal(task.approved_hash, HASH);
    const mp4 = env.artifacts.find((a) => a.name === "video_1.mp4");
    assert.ok(mp4.exists && mp4.content_hash);
    const seq = calls().map((l) => l.split(" ")[0]);
    assert.deepEqual(seq, ["claude", "node", "node", "npm", "node", "claude", "node", "zsh", "ffprobe", "node"],
      `unexpected call sequence: ${seq}`);
  },

  resume_skips_completed_stages() {
    setup();
    run(["--output-dir", out, "--approved-hash", HASH]); // full run
    fs.unlinkSync(path.join(out, "video_1.mp4"));        // simulate crash before render finished
    fs.writeFileSync(logPath, "");
    const { env, status } = run(["--output-dir", out, "--approved-hash", HASH]);
    assert.equal(status, 0);
    assert.match(env.data.stages.stage_a, /skipped/);
    assert.match(env.data.stages.tts, /skipped/);
    assert.match(env.data.stages.stage_b, /skipped/);
    const seq = calls().map((l) => l.split(" ")[0]);
    assert.ok(!seq.includes("claude"), `resume must not re-spawn agents: ${seq}`);
    assert.ok(!seq.includes("npm"), `resume must not re-run tts: ${seq}`);
  },

  already_rendered_noop() {
    setup({ state: "rendered", approvedHash: HASH });
    fs.writeFileSync(path.join(out, "video_1.mp4"), "MP4BYTES");
    const { env, status } = run(["--output-dir", out, "--approved-hash", HASH]);
    assert.equal(status, 0);
    assert.ok(env.warnings.some((w) => w.includes("already_rendered")));
    assert.equal(calls().length, 0);
  },

  render_failure_keeps_state_approved() {
    setup();
    const { env, status } = run(["--output-dir", out, "--approved-hash", HASH], "render");
    assert.equal(status, 1);
    assert.equal(env.errors[0], "render_failed");
    const task = JSON.parse(fs.readFileSync(path.join(out, ".b2v-task.json"), "utf-8"));
    assert.equal(task.state, "approved", "failed render must leave state approved for retry");
  },

  scene_gen_incomplete() {
    setup();
    const { env, status } = run(["--output-dir", out, "--approved-hash", HASH], "scene_gen");
    assert.equal(status, 1);
    assert.equal(env.errors[0], "scene_gen_incomplete");
    assert.deepEqual(env.data.missing_scenes, ["scene-01", "scene-02"]);
  },

  gate_script_failure_retries_stage_a_once() {
    setup();
    const { env, status } = run(["--output-dir", out, "--approved-hash", HASH], "gate_script");
    assert.equal(status, 1);
    assert.equal(env.errors[0], "gate_script_failed");
    const claudeCalls = calls().filter((l) => l.startsWith("claude")).length;
    assert.equal(claudeCalls, 2, "must retry stage A exactly once on gate failure");
  },

  tts_failure() {
    setup();
    const { env, status } = run(["--output-dir", out, "--approved-hash", HASH], "tts");
    assert.equal(status, 1);
    assert.equal(env.errors[0], "tts_failed");
  },

  video_invalid_when_probe_zero() {
    setup();
    const { env, status } = run(["--output-dir", out, "--approved-hash", HASH], "probe");
    assert.equal(status, 1);
    assert.equal(env.errors[0], "video_invalid");
  },
};

let pass = 0, fail = 0;
for (const [name, fn] of Object.entries(tests)) {
  try {
    fn();
    console.log(`ok - ${name}`);
    pass++;
  } catch (e) {
    console.error(`FAIL - ${name}\n${e.stack}`);
    fail++;
  } finally {
    if (tmp) fs.rmSync(tmp, { recursive: true, force: true });
  }
}
console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
