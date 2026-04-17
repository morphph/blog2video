#!/usr/bin/env node
/**
 * A/B test: raw MiniMax vs loudnorm-only (no 3x boost)
 * Output: scripts/voice-processing-test/option_A_raw.mp3 + option_B_loudnorm.mp3
 */

import fs from "fs";
import path from "path";
import { execSync } from "child_process";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const envPath = path.join(__dirname, "..", ".env");

for (const line of fs.readFileSync(envPath, "utf-8").split("\n")) {
  const m = line.match(/^(\w+)=(.+)$/);
  if (m) process.env[m[1]] = m[2].trim();
}

const MINIMAX_API_KEY = process.env.MINIMAX_API_KEY;
const MINIMAX_VOICE_ID = process.env.MINIMAX_VOICE_ID;

const TEST_TEXT = `两个人用同一个 Claude。一个产出 2 倍生产力，一个产出 100 倍。差的不是模型，不是参数，不是 prompt——他们连订阅的套餐都一样。这里是精读AI。今天我们来拆解一下 YC 总裁 Garry Tan 的最新架构心法——Thin Harness, Fat Skills。`;

const outDir = path.join(__dirname, "voice-processing-test");
fs.mkdirSync(outDir, { recursive: true });

console.log(`Voice ID: ${MINIMAX_VOICE_ID}`);
console.log(`Test text: ${TEST_TEXT.length} chars`);
console.log(`Calling MiniMax TTS...\n`);

const response = await fetch("https://api.minimaxi.chat/v1/t2a_v2", {
  method: "POST",
  headers: { "Content-Type": "application/json", Authorization: `Bearer ${MINIMAX_API_KEY}` },
  body: JSON.stringify({
    model: "speech-02-hd",
    text: TEST_TEXT,
    stream: false,
    voice_setting: { voice_id: MINIMAX_VOICE_ID, speed: 1.0, vol: 5.0, pitch: 0 },
    audio_setting: { format: "mp3", sample_rate: 32000 },
    subtitle_enable: false,
  }),
});

if (!response.ok) {
  console.error(`API error ${response.status}: ${await response.text()}`);
  process.exit(1);
}

const result = await response.json();
if (result.base_resp?.status_code !== 0) {
  console.error("API error:", JSON.stringify(result.base_resp));
  process.exit(1);
}

const optionA = path.join(outDir, "option_A_raw.mp3");
fs.writeFileSync(optionA, Buffer.from(result.data.audio, "hex"));
console.log(`✅ Option A (raw MiniMax, no processing): ${optionA}`);

// Option B: loudnorm only (no 3x boost)
const optionB = path.join(outDir, "option_B_loudnorm.mp3");
execSync(`ffmpeg -y -i "${optionA}" -af loudnorm=I=-14:TP=-1:LRA=11 "${optionB}"`, {
  stdio: "inherit",
});
console.log(`\n✅ Option B (loudnorm -14 LUFS, no boost): ${optionB}`);

// Reference: also generate current pipeline (loudnorm + 3x boost) for 3-way compare
const optionC = path.join(outDir, "option_C_current_pipeline.mp3");
const tmpNorm = path.join(outDir, "_tmp_norm.mp3");
execSync(`ffmpeg -y -i "${optionA}" -af loudnorm=I=-14:TP=-1:LRA=11 "${tmpNorm}"`, {
  stdio: "inherit",
});
execSync(
  `ffmpeg -y -i "${tmpNorm}" -af "volume=3.0,alimiter=limit=0.95:attack=5:release=50" "${optionC}"`,
  { stdio: "inherit" }
);
fs.unlinkSync(tmpNorm);
console.log(`\n✅ Option C (current 3x pipeline, for reference): ${optionC}`);

console.log("\n📁 Compare files:");
console.log(`   ${optionA}`);
console.log(`   ${optionB}`);
console.log(`   ${optionC}`);
