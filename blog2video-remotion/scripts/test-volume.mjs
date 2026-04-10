#!/usr/bin/env node
/**
 * Volume A/B Test Script
 *
 * Generates short TTS clips with different settings to compare volume levels.
 * Usage: node scripts/test-volume.mjs
 *
 * Outputs go to scripts/volume-test/ directory.
 */

import fs from "fs";
import path from "path";
import { execSync } from "child_process";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const envPath = path.join(__dirname, "..", ".env");

// Load .env
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, "utf-8");
  for (const line of envContent.split("\n")) {
    const match = line.match(/^(\w+)=(.+)$/);
    if (match) process.env[match[1]] = match[2].trim();
  }
}

const MINIMAX_API_KEY = process.env.MINIMAX_API_KEY;
// Allow CLI override: VOICE_ID=xxx node scripts/test-volume.mjs
const MINIMAX_VOICE_ID = process.env.VOICE_ID || process.env.MINIMAX_VOICE_ID;

if (!MINIMAX_API_KEY || !MINIMAX_VOICE_ID) {
  console.error("Missing MINIMAX_API_KEY or MINIMAX_VOICE_ID in .env");
  process.exit(1);
}

const TEST_TEXT = "大家好，欢迎回来。今天我们要深入探讨一个非常重要的技术话题。这段音频是用来测试不同音量设置的效果，请注意听音量的变化。";

const outDir = path.join(__dirname, "volume-test");
if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

async function generateTTS(name, { vol, speed = 1.0, pitch = 0, bitrate, model = "speech-02-hd" }) {
  console.log(`\n--- Generating: ${name} (vol=${vol}, model=${model}, bitrate=${bitrate || "default"}) ---`);

  const body = {
    model,
    text: TEST_TEXT,
    stream: false,
    voice_setting: {
      voice_id: MINIMAX_VOICE_ID,
      speed,
      vol,
      pitch,
    },
    audio_setting: {
      format: "mp3",
      sample_rate: 32000,
    },
    subtitle_enable: false,
  };

  if (bitrate) {
    body.audio_setting.bitrate = bitrate;
  }

  const response = await fetch("https://api.minimaxi.chat/v1/t2a_v2", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${MINIMAX_API_KEY}`,
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const errText = await response.text();
    console.error(`  API error ${response.status}: ${errText}`);
    return null;
  }

  const result = await response.json();
  if (result.base_resp?.status_code !== 0) {
    console.error(`  API returned error:`, result.base_resp);
    return null;
  }

  const audioHex = result.data?.audio;
  if (!audioHex) {
    console.error("  No audio data in response");
    return null;
  }

  const audioBuffer = Buffer.from(audioHex, "hex");
  const outPath = path.join(outDir, `${name}.mp3`);
  fs.writeFileSync(outPath, audioBuffer);
  console.log(`  Saved: ${outPath} (${(audioBuffer.length / 1024).toFixed(0)} KB)`);
  return outPath;
}

function ffmpegLoudnorm(inputPath, outputPath, lufs = -14) {
  try {
    execSync(
      `ffmpeg -y -i "${inputPath}" -af loudnorm=I=${lufs}:TP=-1:LRA=11 "${outputPath}"`,
      { stdio: "pipe" }
    );
    console.log(`  Normalized to ${lufs} LUFS: ${outputPath}`);
    return outputPath;
  } catch (err) {
    console.error(`  ffmpeg loudnorm failed: ${err.message}`);
    return null;
  }
}

function ffmpegVolumeBoost(inputPath, outputPath, multiplier) {
  try {
    execSync(
      `ffmpeg -y -i "${inputPath}" -af "volume=${multiplier}" "${outputPath}"`,
      { stdio: "pipe" }
    );
    console.log(`  Volume boosted ${multiplier}x: ${outputPath}`);
    return outputPath;
  } catch (err) {
    console.error(`  ffmpeg volume boost failed: ${err.message}`);
    return null;
  }
}

function ffmpegVolumeLimiter(inputPath, outputPath, multiplier, limit = 0.95) {
  try {
    execSync(
      `ffmpeg -y -i "${inputPath}" -af "volume=${multiplier},alimiter=limit=${limit}:attack=5:release=50" "${outputPath}"`,
      { stdio: "pipe" }
    );
    console.log(`  Volume ${multiplier}x + limiter: ${outputPath}`);
    return outputPath;
  } catch (err) {
    console.error(`  ffmpeg volume+limiter failed: ${err.message}`);
    return null;
  }
}

function measureLoudness(filePath) {
  try {
    const result = execSync(
      `ffmpeg -i "${filePath}" -af loudnorm=I=-14:TP=-1:LRA=11:print_format=json -f null - 2>&1`,
      { encoding: "utf-8" }
    );
    const jsonMatch = result.match(/\{[\s\S]*"input_i"[\s\S]*\}/);
    if (jsonMatch) {
      const stats = JSON.parse(jsonMatch[0]);
      return {
        loudness: stats.input_i,
        peak: stats.input_tp,
        range: stats.input_lra,
      };
    }
  } catch (err) {
    // ffmpeg writes stats to stderr, which execSync captures in the output
    const output = err.stderr || err.stdout || "";
    const jsonMatch = output.match(/\{[\s\S]*"input_i"[\s\S]*\}/);
    if (jsonMatch) {
      const stats = JSON.parse(jsonMatch[0]);
      return {
        loudness: stats.input_i,
        peak: stats.input_tp,
        range: stats.input_lra,
      };
    }
  }
  return null;
}

async function main() {
  console.log("=== MiniMax TTS Volume A/B Test ===\n");
  console.log(`Test text: ${TEST_TEXT}`);
  console.log(`Voice ID: ${MINIMAX_VOICE_ID}`);
  console.log(`Output dir: ${outDir}\n`);

  // --- Test 1: Current settings (baseline) ---
  const baseline = await generateTTS("01_baseline_vol5", { vol: 5.0 });

  // --- Test 2: Max API volume ---
  const maxVol = await generateTTS("02_vol10", { vol: 10.0 });

  // --- Test 3: Max volume + higher bitrate ---
  const maxVolHQ = await generateTTS("03_vol10_bitrate256k", { vol: 10.0, bitrate: 256000 });

  // --- Now apply different post-processing to the max-vol clip ---

  if (maxVol) {
    // Test 4: Current pipeline (loudnorm -14 LUFS) applied to vol=10
    ffmpegLoudnorm(maxVol, path.join(outDir, "04_vol10_loudnorm-14.mp3"), -14);

    // Test 5: Louder loudnorm target (-10 LUFS)
    ffmpegLoudnorm(maxVol, path.join(outDir, "05_vol10_loudnorm-10.mp3"), -10);

    // Test 6: Simple volume boost (no loudnorm)
    ffmpegVolumeBoost(maxVol, path.join(outDir, "06_vol10_boost2x.mp3"), 2.0);

    // Test 7: Volume boost + limiter (proposed new pipeline)
    ffmpegVolumeLimiter(maxVol, path.join(outDir, "07_vol10_boost2x_limiter.mp3"), 2.0);
  }

  // Also process the baseline for comparison
  if (baseline) {
    // Test 8: Current full pipeline (vol=5 + loudnorm -14)
    ffmpegLoudnorm(baseline, path.join(outDir, "08_vol5_loudnorm-14_CURRENT.mp3"), -14);
  }

  // --- Measure loudness of all files ---
  console.log("\n\n=== LOUDNESS MEASUREMENTS ===\n");
  console.log("File".padEnd(45), "LUFS".padEnd(10), "Peak dB".padEnd(10), "LRA");
  console.log("-".repeat(75));

  const files = fs.readdirSync(outDir).filter((f) => f.endsWith(".mp3")).sort();
  for (const file of files) {
    const filePath = path.join(outDir, file);
    const stats = measureLoudness(filePath);
    if (stats) {
      console.log(
        file.padEnd(45),
        `${stats.loudness} LUFS`.padEnd(10),
        `${stats.peak} dB`.padEnd(10),
        stats.range
      );
    } else {
      console.log(file.padEnd(45), "(measurement failed)");
    }
  }

  console.log("\n=== DONE ===");
  console.log(`\nAll test clips are in: ${outDir}`);
  console.log("Play them back to compare volume levels.");
  console.log("\nRecommended comparison order:");
  console.log("  08 (current pipeline) vs 05 (louder loudnorm) vs 07 (boost+limiter)");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
