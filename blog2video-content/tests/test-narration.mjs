#!/usr/bin/env node
// Offline tests for the narration black-box verb (narration.mjs).
// No claude / no Max: the agent is replaced via NARRATION_CLAUDE_CMD with a
// fake whose behavior is driven by FAKE_MODE. Runs in a throwaway output dir.
//
// Run: node blog2video-content/tests/test-narration.mjs

import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import crypto from "node:crypto";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

const HERE = path.dirname(new URL(import.meta.url).pathname);
const NARRATION = path.resolve(HERE, "..", "narration.mjs");

const FAKE = `#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
const mode = process.env.FAKE_MODE || "success";
const dir = process.env.FAKE_OUTPUT_DIR;
fs.writeFileSync(path.join(dir, "spawned.marker"), "yes");
fs.writeFileSync(path.join(dir, "argv.json"), JSON.stringify(process.argv));
const narration = "# 假标题\\n\\n## Hook\\n\\n" + "这是一段用于测试的中文叙述稿内容。".repeat(60);
if (mode === "success" || mode === "revision") {
  fs.writeFileSync(path.join(dir, "insight_memo.md"), "# memo\\n\\nok");
  fs.writeFileSync(path.join(dir, "narration.md"), narration + (mode === "revision" ? "\\n\\n修订版。" : ""));
} else if (mode === "wb_success") {
  // wb line: long-form tutor script, deliberately NO insight_memo.md
  fs.writeFileSync(path.join(dir, "narration.md"), "# 假标题\\n\\n## Hook\\n\\n" + "这是一段用于测试的白板线长稿内容。".repeat(200));
} else if (mode === "too_short") {
  fs.writeFileSync(path.join(dir, "narration.md"), "太短了。");
} else if (mode === "no_write") {
  // writes nothing
}
console.log(JSON.stringify({ subtype: "success", num_turns: 5, duration_ms: 2000, total_cost_usd: 0.1, result: "narration done" }));
`;

let tmp, fakePath;
function setup() {
  tmp = fs.mkdtempSync(path.join(os.tmpdir(), "narration-test-"));
  fakePath = path.join(tmp, "fake_claude.mjs");
  fs.writeFileSync(fakePath, FAKE);
  const outDir = path.join(tmp, "out");
  fs.mkdirSync(outDir);
  return outDir;
}

function runVerb(outDir, { mode = "success", extra = [], withSource = true, withJingdu = false } = {}) {
  if (withSource && !fs.existsSync(path.join(outDir, "source_blog.md"))) {
    fs.writeFileSync(path.join(outDir, "source_blog.md"), "# Source\n\nbody ".repeat(50));
  }
  if (withJingdu && !fs.existsSync(path.join(outDir, "jingdu.md"))) {
    fs.writeFileSync(path.join(outDir, "jingdu.md"), "# 精读\n\n**一句话主旨**：测试。\n\n## 精读\n\n" + "内容 ".repeat(20));
  }
  let stdout, status = 0;
  try {
    stdout = execFileSync(process.execPath, [NARRATION, "--output-dir", outDir, ...extra], {
      encoding: "utf-8",
      env: {
        ...process.env,
        NARRATION_CLAUDE_CMD: `${process.execPath} ${fakePath}`,
        FAKE_MODE: mode,
        FAKE_OUTPUT_DIR: outDir,
      },
    });
  } catch (e) {
    stdout = e.stdout;
    status = e.status;
  }
  return { env: JSON.parse(stdout), status };
}

const spawned = (outDir) => fs.existsSync(path.join(outDir, "spawned.marker"));
const spawnedPrompt = (outDir) => JSON.parse(fs.readFileSync(path.join(outDir, "argv.json"), "utf-8")).join(" ");

const tests = {
  success_envelope_and_hash() {
    const out = setup();
    const { env, status } = runVerb(out);
    assert.equal(status, 0);
    for (const k of ["contract_version", "ok", "verb", "task_id", "artifacts", "content_hash", "warnings", "errors", "data"])
      assert.ok(k in env, `missing envelope key ${k}`);
    assert.equal(env.ok, true);
    assert.equal(env.verb, "narration");
    assert.equal(env.data.revision, false);
    assert.ok(env.data.chars >= 800 && env.data.chars <= 10000, `chars ${env.data.chars}`);
    const narrArt = env.artifacts.find((a) => a.name === "narration.md");
    assert.ok(narrArt.exists && narrArt.content_hash, "narration artifact must exist with hash");
    // content_hash independently recomputable (normalize + sha256[:16], as contract.mjs)
    const norm = fs.readFileSync(path.join(out, "narration.md"), "utf-8")
      .replace(/\r\n/g, "\n").replace(/[ \t]+$/gm, "").trim();
    const expect = crypto.createHash("sha256").update(norm).digest("hex").slice(0, 16);
    assert.equal(env.content_hash, expect);
  },

  revision_rerun_is_safe() {
    const out = setup();
    runVerb(out);
    const { env, status } = runVerb(out, { mode: "revision" });
    assert.equal(status, 0);
    assert.equal(env.ok, true);
    assert.equal(env.data.revision, true, "second run must report revision=true");
  },

  source_missing() {
    const out = setup();
    const { env, status } = runVerb(out, { withSource: false });
    assert.equal(status, 1);
    assert.equal(env.errors[0], "source_missing");
    assert.ok(!spawned(out), "must not spawn without source");
  },

  narration_missing_when_agent_writes_nothing() {
    const out = setup();
    const { env, status } = runVerb(out, { mode: "no_write" });
    assert.equal(status, 1);
    assert.equal(env.errors[0], "narration_missing");
  },

  narration_not_written_when_stale() {
    const out = setup();
    fs.writeFileSync(path.join(out, "narration.md"), "旧版叙述稿".repeat(200));
    const past = new Date(Date.now() - 3600_000);
    fs.utimesSync(path.join(out, "narration.md"), past, past);
    const { env, status } = runVerb(out, { mode: "no_write" });
    assert.equal(status, 1);
    assert.equal(env.errors[0], "narration_not_written");
  },

  out_of_range_kept_for_inspection() {
    const out = setup();
    const { env, status } = runVerb(out, { mode: "too_short" });
    assert.equal(status, 1);
    assert.equal(env.errors[0], "narration_out_of_range");
    assert.ok(fs.existsSync(path.join(out, "narration.md")), "file kept, not deleted");
  },

  take_is_reserved_and_ignored() {
    const out = setup();
    const takeFile = path.join(tmp, "take.md");
    fs.writeFileSync(takeFile, "my take");
    const { env, status } = runVerb(out, { extra: ["--take", takeFile] });
    assert.equal(status, 0);
    assert.ok(env.warnings.some((w) => w.includes("reserved")), "must warn take is reserved");
  },

  dry_run_never_spawns() {
    const out = setup();
    const { env, status } = runVerb(out, { extra: ["--dry-run"] });
    assert.equal(status, 0);
    assert.equal(env.ok, true);
    assert.ok(!spawned(out), "dry-run must not spawn");
    assert.ok(!fs.existsSync(path.join(out, "narration.md")));
  },

  usage_without_output_dir() {
    setup();
    let status = 0, stdout = "";
    try {
      stdout = execFileSync(process.execPath, [NARRATION], { encoding: "utf-8" });
    } catch (e) {
      stdout = e.stdout;
      status = e.status;
    }
    assert.equal(status, 2);
    assert.equal(JSON.parse(stdout).errors[0], "usage");
  },

  // ─── P3 S6: wb mode matrix ────────────────────────────────────────────────

  d2_default_prompt_and_mode() {
    const out = setup();
    const { env, status } = runVerb(out);
    assert.equal(status, 0);
    assert.equal(env.data.mode, "d2");
    assert.ok(spawnedPrompt(out).includes("/blog2video-script "), "default mode must spawn the legacy d2 command");
    assert.ok(!spawnedPrompt(out).includes("/blog2video-script-wb"), "default mode must NOT spawn the wb command");
  },

  wb_happy_long_form_no_memo_warning() {
    const out = setup();
    const { env, status } = runVerb(out, { mode: "wb_success", withJingdu: true, extra: ["--mode", "wb"] });
    assert.equal(status, 0);
    assert.equal(env.ok, true);
    assert.equal(env.data.mode, "wb");
    assert.ok(env.data.chars >= 1500 && env.data.chars <= 25000, `wb chars ${env.data.chars}`);
    assert.ok(spawnedPrompt(out).includes("/blog2video-script-wb"), "wb mode must spawn the tutor command");
    assert.ok(!env.warnings.some((w) => w.includes("insight_memo")), "wb must not warn about insight_memo");
    assert.ok(!env.artifacts.some((a) => a.name === "insight_memo.md"), "wb envelope must not list insight_memo artifact");
  },

  wb_jingdu_missing_refuses_to_spawn() {
    const out = setup();
    const { env, status } = runVerb(out, { mode: "wb_success", extra: ["--mode", "wb"] });
    assert.equal(status, 1);
    assert.equal(env.errors[0], "jingdu_missing");
    assert.ok(!spawned(out), "must not spawn without jingdu.md in wb mode");
  },

  wb_range_rejects_d2_sized_script() {
    // the same ~1000-char script that PASSES d2 (see success_envelope_and_hash)
    // must FAIL wb — proves per-mode ranges are live.
    const out = setup();
    const { env, status } = runVerb(out, { mode: "success", withJingdu: true, extra: ["--mode", "wb"] });
    assert.equal(status, 1);
    assert.equal(env.errors[0], "narration_out_of_range");
    assert.ok(env.errors[1].includes("mode=wb"));
  },

  wb_dry_run_reports_mode() {
    const out = setup();
    const { env, status } = runVerb(out, { withJingdu: true, extra: ["--mode", "wb", "--dry-run"] });
    assert.equal(status, 0);
    assert.equal(env.data.mode, "wb");
    assert.ok(!spawned(out));
  },

  invalid_mode_is_usage() {
    const out = setup();
    const { env, status } = runVerb(out, { extra: ["--mode", "vhs"] });
    assert.equal(status, 2);
    assert.equal(env.errors[0], "usage");
    assert.ok(!spawned(out));
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
