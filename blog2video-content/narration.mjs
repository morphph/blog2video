#!/usr/bin/env node
// narration — black-box verb: headless claude writes narration.md, this shell verifies.
//
// Pattern (content-ops plan §1 v2.6): agent inside, contract outside. The spawned
// agent runs the proven /blog2video-script skill in DIRECTORY mode (reads the
// staged source_blog.md — never fetches) and owns only the generative part:
// insight_memo.md + narration.md. Everything deterministic lives here: input
// validation, freshness verification (mtime), length sanity range, hashing,
// envelope. The shell trusts artifacts on disk, never the agent's self-report.
//
// Re-running is the revision loop by design: an existing narration.md becomes
// the agent's "previous version" reference and gets rewritten in place.
//
// Envelope / exit codes identical to cli.mjs (contract 1.0):
//   0 ok | 1 handled failure (ok:false) | 2 usage | 3 exception.
// Error tokens (errors[0]): source_missing | narration_missing |
//   narration_not_written | narration_out_of_range | agent_failed.
//
// --take <file> is a RESERVED parameter slot (P2 brand-take injection); in P1 it
// is accepted, validated for existence, and explicitly ignored with a warning.
//
// Test seam: set NARRATION_CLAUDE_CMD to substitute the spawned binary
// (tests/test-narration.mjs exercises all paths offline, no claude/Max).

import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
import {
  artifact,
  contentHash,
  emit,
  envelope,
  loadTask,
  parseArgs,
  shortHash,
} from "./lib/contract.mjs";

const REPO_ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..");

const VERB = "narration";
// Per-mode contracts (P3 S6). d2 = legacy vertical line, byte-for-byte unchanged.
// wb = whiteboard tutor line: long-form script from staged jingdu.md, no insight memo.
const MODES = {
  d2: { command: "/blog2video-script", min: 800, max: 10000 },   // golden narration (ten-commandments) is 2573 chars
  wb: { command: "/blog2video-script-wb", min: 1500, max: 25000 }, // ~220 zh chars/min; real length governed by prompt
};
const DEFAULT_TIMEOUT_S = 900;   // golden run: 429s
const DEFAULT_MAX_TURNS = 30;    // golden run: 17 turns; revisions read more context
const ALLOWED_TOOLS = "Read,Write,Task,Glob,Grep";
const CHARS_PER_MIN = 220; // mirrors cli.mjs duration estimate

function countChars(text) {
  return String(text).replace(/\s+/g, "").length;
}

function claudeArgv(prompt, maxTurns) {
  const override = process.env.NARRATION_CLAUDE_CMD;
  const base = override ? override.split(/\s+/) : ["claude"];
  return base.concat([
    "-p", prompt,
    "--allowedTools", ALLOWED_TOOLS,
    "--max-turns", String(maxTurns),
    "--output-format", "json",
  ]);
}

function spawnAgent(command, outputDir, maxTurns, timeoutS, warnings) {
  const env = { ...process.env };
  // 剥离会话的 telegram 通道身份——headless claude 的 telegram 插件会抢走
  // bot poller、瘫痪回话通道（07-05/07-13 事故根因，content-ops 同款守卫）。
  delete env.TELEGRAM_STATE_DIR;
  // claude is not on PATH in VPS cron/script contexts — extend defensively.
  env.PATH = `${env.PATH || ""}:${process.env.HOME}/.npm-global/bin:${process.env.HOME}/.local/bin`;
  const argv = claudeArgv(`${command} ${outputDir}`, maxTurns);
  const meta = { timed_out: false, exit_code: null, num_turns: null, duration_ms: null, result_tail: null };
  const proc = spawnSync(argv[0], argv.slice(1), {
    cwd: REPO_ROOT,
    env,
    encoding: "utf-8",
    timeout: timeoutS * 1000,
    maxBuffer: 32 * 1024 * 1024,
  });
  if (proc.error) {
    if (proc.error.code === "ETIMEDOUT") {
      meta.timed_out = true;
      warnings.push(`agent timed out after ${timeoutS}s; verifying from disk anyway`);
    } else {
      meta.result_tail = `spawn failed: ${proc.error.message}`;
      meta.exit_code = -1;
      return meta;
    }
  }
  meta.exit_code = proc.status;
  try {
    const payload = JSON.parse(proc.stdout);
    meta.num_turns = payload.num_turns ?? null;
    meta.duration_ms = payload.duration_ms ?? null;
    meta.total_cost_usd = payload.total_cost_usd ?? null;
    meta.result_tail = String(payload.result || "").slice(-300);
  } catch {
    meta.result_tail = String(proc.stdout || proc.stderr || "").slice(-300);
    if (!meta.timed_out) warnings.push("agent stdout was not JSON; verifying from disk only");
  }
  return meta;
}

function main() {
  const { opts } = parseArgs(process.argv.slice(2));
  const warnings = [];

  const rawDir = opts["output-dir"];
  if (!rawDir || rawDir === true) {
    return emit(envelope({ ok: false, verb: VERB, errors: ["usage", "--output-dir <dir> is required"] }), 2);
  }
  const modeName = opts.mode === undefined || opts.mode === true ? "d2" : String(opts.mode);
  const mode = MODES[modeName];
  if (!mode) {
    return emit(envelope({ ok: false, verb: VERB, errors: ["usage", `--mode must be one of: ${Object.keys(MODES).join("|")}`] }), 2);
  }
  const outputDir = path.resolve(String(rawDir));
  const sourcePath = path.join(outputDir, "source_blog.md");
  const jingduPath = path.join(outputDir, "jingdu.md");
  const narrationPath = path.join(outputDir, "narration.md");
  const memoPath = path.join(outputDir, "insight_memo.md");

  if (opts.take) {
    if (typeof opts.take === "string" && !fs.existsSync(opts.take)) {
      return emit(envelope({ ok: false, verb: VERB, errors: ["usage", `--take file not found: ${opts.take}`] }), 2);
    }
    warnings.push("--take is a reserved P2 parameter; accepted but IGNORED in P1 (no take injection)");
  }

  if (!fs.existsSync(sourcePath)) {
    return emit(envelope({
      ok: false, verb: VERB,
      errors: ["source_missing", `expected staged source at ${sourcePath}`],
      data: { output_dir: outputDir, mode: modeName },
    }), 1);
  }
  // wb line: jingdu.md is the structural spine — refuse to spawn without it
  // (falling back to free-form rewriting of the source would defeat the close-reading gate).
  if (modeName === "wb" && !fs.existsSync(jingduPath)) {
    return emit(envelope({
      ok: false, verb: VERB,
      errors: ["jingdu_missing", `wb mode expects staged close reading at ${jingduPath}`],
      data: { output_dir: outputDir, mode: modeName },
    }), 1);
  }

  const hadNarration = fs.existsSync(narrationPath);
  const timeoutS = Number(opts.timeout) || DEFAULT_TIMEOUT_S;
  const maxTurns = Number(opts["max-turns"]) || DEFAULT_MAX_TURNS;

  if (opts["dry-run"]) {
    warnings.push("dry-run: agent not spawned, nothing written");
    return emit(envelope({
      ok: true, verb: VERB, warnings,
      data: { output_dir: outputDir, mode: modeName, would_spawn: true, revision: hadNarration },
    }), 0);
  }

  const startMs = Date.now() - 1000; // 1s guard for fs timestamp rounding
  const meta = spawnAgent(mode.command, outputDir, maxTurns, timeoutS, warnings);

  // Disk is the only witness we accept.
  if (!fs.existsSync(narrationPath)) {
    const token = meta.exit_code === 0 && !meta.timed_out ? "narration_missing" : "agent_failed";
    return emit(envelope({
      ok: false, verb: VERB, warnings,
      errors: [token, `exit=${meta.exit_code} timed_out=${meta.timed_out} tail=${meta.result_tail}`],
      data: { output_dir: outputDir, agent: meta },
    }), 1);
  }
  const st = fs.statSync(narrationPath);
  if (st.mtimeMs < startMs) {
    return emit(envelope({
      ok: false, verb: VERB, warnings,
      errors: ["narration_not_written", "narration.md exists but was not (re)written by this run"],
      data: { output_dir: outputDir, agent: meta },
    }), 1);
  }

  const narration = fs.readFileSync(narrationPath, "utf-8");
  const chars = countChars(narration);
  if (chars < mode.min || chars > mode.max) {
    return emit(envelope({
      ok: false, verb: VERB, warnings,
      errors: ["narration_out_of_range", `${chars} chars outside [${mode.min}, ${mode.max}] (mode=${modeName}); file kept for inspection`],
      data: { output_dir: outputDir, mode: modeName, chars, agent: meta },
    }), 1);
  }

  // insight memo belongs to the d2 line only; the wb line has no such stage.
  if (modeName === "d2" && !fs.existsSync(memoPath)) warnings.push("insight_memo.md not present after run");

  const task = loadTask(outputDir);
  return emit(envelope({
    ok: true,
    verb: VERB,
    task_id: task?.task_id ?? null,
    content_hash: shortHash(contentHash(narration)),
    artifacts: modeName === "wb"
      ? [artifact("narration.md", narrationPath, "narration")]
      : [
          artifact("narration.md", narrationPath, "narration"),
          artifact("insight_memo.md", memoPath, "insight_memo"),
        ],
    warnings,
    data: {
      output_dir: outputDir,
      mode: modeName,
      chars,
      est_minutes: Math.round((chars / CHARS_PER_MIN) * 10) / 10,
      revision: hadNarration,
      agent: meta,
    },
  }), 0);
}

try {
  main();
} catch (e) {
  emit(envelope({ ok: false, verb: VERB, errors: [`unexpected: ${e.stack || e.message}`] }), 3);
}
