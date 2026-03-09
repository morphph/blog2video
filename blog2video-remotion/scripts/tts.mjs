#!/usr/bin/env node
/**
 * MiniMax TTS Script
 * Usage: node scripts/tts.mjs <script.md> <output.mp3>
 *
 * Reads a Chinese narration script, calls MiniMax TTS API,
 * saves audio file + subtitle JSONs + VTT.
 */

import fs from "fs";
import path from "path";
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
const MINIMAX_VOICE_ID = process.env.MINIMAX_VOICE_ID;

if (!MINIMAX_API_KEY || !MINIMAX_VOICE_ID) {
  console.error("Missing MINIMAX_API_KEY or MINIMAX_VOICE_ID in .env");
  process.exit(1);
}

const scriptPath = process.argv[2];
const outputPath = process.argv[3];

if (!scriptPath || !outputPath) {
  console.error("Usage: node scripts/tts.mjs <script.md> <output.mp3>");
  process.exit(1);
}

// Extract plain text from markdown script (remove [SLIDE] markers, headings, etc.)
function extractText(markdown) {
  return markdown
    .split("\n")
    .filter((line) => {
      if (line.startsWith("#")) return false;
      if (line.match(/^\[SLIDE \d+:/)) return false;
      if (line.trim() === "") return false;
      return true;
    })
    .join("\n\n");
}

// Split MiniMax paragraph-level subtitles into sentence-level
function splitToSentences(rawSubtitles) {
  const sentences = [];
  for (const segment of rawSubtitles) {
    const text = segment.text;
    const timeBegin = segment.time_begin / 1000; // ms to seconds
    const timeEnd = segment.time_end / 1000;
    const totalDuration = timeEnd - timeBegin;

    // Split by Chinese sentence-ending punctuation
    const parts = text.split(/(?<=[。！？])/);
    const totalChars = parts.reduce((sum, p) => sum + p.length, 0);

    let currentTime = timeBegin;
    for (const part of parts) {
      const trimmed = part.trim();
      if (!trimmed) continue;
      const ratio = part.length / totalChars;
      const duration = totalDuration * ratio;
      sentences.push({
        start: Math.round(currentTime * 1000) / 1000,
        end: Math.round((currentTime + duration) * 1000) / 1000,
        text: trimmed,
      });
      currentTime += duration;
    }
  }
  return sentences;
}

// Generate VTT from sentence subtitles
function generateVTT(sentences) {
  let vtt = "WEBVTT\n\n";
  for (let i = 0; i < sentences.length; i++) {
    const s = sentences[i];
    vtt += `${i + 1}\n`;
    vtt += `${formatVTTTime(s.start)} --> ${formatVTTTime(s.end)}\n`;
    vtt += `${s.text}\n\n`;
  }
  return vtt;
}

function formatVTTTime(seconds) {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  const ms = Math.round((seconds % 1) * 1000);
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}.${String(ms).padStart(3, "0")}`;
}

async function main() {
  console.log(`Reading script: ${scriptPath}`);
  const markdown = fs.readFileSync(scriptPath, "utf-8");
  const text = extractText(markdown);
  console.log(`Extracted ${text.length} characters for TTS`);

  console.log("Calling MiniMax TTS API...");
  const response = await fetch("https://api.minimaxi.chat/v1/t2a_v2", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${MINIMAX_API_KEY}`,
    },
    body: JSON.stringify({
      model: "speech-02-hd",
      text: text,
      stream: false,
      voice_setting: {
        voice_id: MINIMAX_VOICE_ID,
        speed: 1.0,
        vol: 1.0,
        pitch: 0,
      },
      audio_setting: {
        format: "mp3",
        sample_rate: 32000,
      },
      subtitle_enable: true,
    }),
  });

  if (!response.ok) {
    const errText = await response.text();
    console.error(`MiniMax API error ${response.status}: ${errText}`);
    process.exit(1);
  }

  const result = await response.json();

  if (result.base_resp?.status_code !== 0) {
    console.error("MiniMax API returned error:", JSON.stringify(result.base_resp));
    process.exit(1);
  }

  // Save audio
  const audioHex = result.data?.audio;
  if (!audioHex) {
    console.error("No audio data in response");
    console.error("Full response:", JSON.stringify(result).substring(0, 500));
    process.exit(1);
  }

  const audioBuffer = Buffer.from(audioHex, "hex");
  fs.writeFileSync(outputPath, audioBuffer);
  console.log(`Audio saved: ${outputPath} (${(audioBuffer.length / 1024 / 1024).toFixed(1)} MB)`);

  // Parse subtitles
  let rawSubtitles = [];
  const subtitleFile = result.data?.subtitle_file;
  if (subtitleFile) {
    if (typeof subtitleFile === "string" && subtitleFile.startsWith("http")) {
      // subtitle_file is a URL — fetch the subtitle JSON
      console.log("Fetching subtitle file from URL...");
      const subResponse = await fetch(subtitleFile);
      if (subResponse.ok) {
        const subText = await subResponse.text();
        try {
          const parsed = JSON.parse(subText);
          rawSubtitles = parsed.subtitles || parsed || [];
        } catch {
          console.log("Subtitle URL response is not JSON, trying line parse");
        }
      } else {
        console.error(`Failed to fetch subtitle URL: ${subResponse.status}`);
      }
    } else if (typeof subtitleFile === "string") {
      try {
        const parsed = JSON.parse(subtitleFile);
        rawSubtitles = parsed.subtitles || parsed || [];
      } catch {
        console.log("subtitle_file is not JSON");
      }
    } else if (Array.isArray(subtitleFile)) {
      rawSubtitles = subtitleFile;
    } else if (subtitleFile.subtitles) {
      rawSubtitles = subtitleFile.subtitles;
    }
  }
  console.log(`Found ${rawSubtitles.length} raw subtitle segments`);
  const outputDir = path.dirname(outputPath);
  const baseName = path.basename(outputPath, ".mp3");

  const rawSubPath = path.join(outputDir, `${baseName}_minimax_raw_subtitles.json`);
  fs.writeFileSync(rawSubPath, JSON.stringify(rawSubtitles, null, 2));
  console.log(`Raw subtitles saved: ${rawSubPath} (${rawSubtitles.length} segments)`);

  // Split into sentences
  const sentences = splitToSentences(rawSubtitles);
  const sentencePath = path.join(outputDir, `${baseName}_subtitles.json`);
  fs.writeFileSync(sentencePath, JSON.stringify(sentences, null, 2));
  console.log(`Sentence subtitles saved: ${sentencePath} (${sentences.length} sentences)`);

  // Generate VTT
  const vttPath = path.join(outputDir, `${baseName}.vtt`);
  fs.writeFileSync(vttPath, generateVTT(sentences));
  console.log(`VTT saved: ${vttPath}`);

  // Return audio duration (approximate from last subtitle)
  const audioDuration =
    rawSubtitles.length > 0
      ? rawSubtitles[rawSubtitles.length - 1].time_end / 1000
      : 0;
  console.log(`Audio duration: ${audioDuration.toFixed(1)}s`);

  return { audioDuration, sentences, rawSubtitles };
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
