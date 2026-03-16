#!/usr/bin/env node
/**
 * Render All Videos Script
 * Usage: node scripts/render-all.mjs <output-dir> [video-number]
 *
 * For each video:
 * 1. TTS → audio + subtitles
 * 2. Puppeteer screenshot HTML slides → PNGs
 * 3. Build video_config.json with subtitle timing
 * 4. Remotion render → MP4
 */

import fs from "fs";
import path from "path";
import { execSync } from "child_process";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const remotionDir = path.join(__dirname, "..");

const outputDir = path.resolve(process.argv[2]);
const specificVideo = process.argv[3] ? parseInt(process.argv[3]) : null;

if (!outputDir) {
  console.error("Usage: node scripts/render-all.mjs <output-dir> [video-number]");
  process.exit(1);
}

// Find all video scripts
function findVideos() {
  const files = fs.readdirSync(outputDir);
  const scripts = files
    .filter((f) => f.match(/^video_\d+_script\.md$/))
    .map((f) => parseInt(f.match(/video_(\d+)_script/)[1]))
    .sort((a, b) => a - b);
  return specificVideo ? scripts.filter((n) => n === specificVideo) : scripts;
}

// Screenshot HTML slides using Puppeteer
async function screenshotSlides(videoNumber) {
  console.log(`\n📸 Taking screenshots for video ${videoNumber}...`);

  // Determine manifest and slide file patterns
  const prefix = videoNumber === 1 ? "" : `v${videoNumber}_`;
  const manifestName = videoNumber === 1 ? "manifest.json" : `v${videoNumber}_manifest.json`;
  const manifestPath = path.join(outputDir, manifestName);

  if (!fs.existsSync(manifestPath)) {
    console.error(`Manifest not found: ${manifestPath}`);
    return false;
  }

  const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf-8"));
  const publicDir = path.join(remotionDir, "public");

  // Ensure public dir exists
  if (!fs.existsSync(publicDir)) fs.mkdirSync(publicDir, { recursive: true });

  // Screenshot each slide + cover
  const filesToScreenshot = [];

  // Cover photo
  if (manifest.cover_photo) {
    filesToScreenshot.push({
      html: path.join(outputDir, manifest.cover_photo),
      png: path.join(publicDir, "cover_photo.png"),
      outputPng: path.join(outputDir, `video_${videoNumber}_cover_photo.png`),
    });
  }

  // Slides
  for (const slide of manifest.slides) {
    filesToScreenshot.push({
      html: path.join(outputDir, slide.file),
      png: path.join(publicDir, `slide_${slide.slide_number}.png`),
    });
  }

  // Use Puppeteer for screenshots
  const puppeteerScript = `
    const puppeteer = require('puppeteer');
    (async () => {
      const browser = await puppeteer.launch({
        headless: 'new',
        args: ['--no-sandbox', '--disable-setuid-sandbox']
      });
      const page = await browser.newPage();
      await page.setViewport({ width: 1080, height: 1920 });

      const files = ${JSON.stringify(filesToScreenshot)};
      for (const file of files) {
        console.log('  Screenshot:', file.html);
        await page.goto('file://' + file.html, { waitUntil: 'networkidle0' });
        await page.screenshot({ path: file.png, type: 'png' });
        if (file.outputPng) {
          require('fs').copyFileSync(file.png, file.outputPng);
        }
      }
      await browser.close();
    })();
  `;

  const tmpScript = path.join(remotionDir, ".tmp_screenshot.cjs");
  fs.writeFileSync(tmpScript, puppeteerScript);

  try {
    execSync(`node ${tmpScript}`, { cwd: remotionDir, stdio: "inherit" });
  } finally {
    if (fs.existsSync(tmpScript)) fs.unlinkSync(tmpScript);
  }

  return true;
}

// Build Remotion video_config.json with subtitle timing
function buildVideoConfig(videoNumber, subtitlesPath, manifestPath) {
  const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf-8"));
  const subtitles = JSON.parse(fs.readFileSync(subtitlesPath, "utf-8"));

  const config = {
    video_number: videoNumber,
    title: manifest.title || `Video ${videoNumber}`,
    fps: 30,
    width: 1080,
    height: 1920,
    slides: manifest.slides.map((s, index) => {
      let startTime;
      if (s.start_time !== undefined) {
        startTime = parseTime(s.start_time);
      } else {
        startTime = manifest.slides
          .slice(0, index)
          .reduce((sum, prev) => sum + (prev.estimated_duration_seconds || 0), 0);
      }
      return {
        slide_number: s.slide_number,
        type: "image",
        start_time_seconds: startTime,
        duration_seconds: s.estimated_duration_seconds,
        data: {},
      };
    }),
    subtitles: subtitles,
  };

  return config;
}

function parseTime(timeStr) {
  if (typeof timeStr === "number") return timeStr;
  if (!timeStr) return 0;
  const parts = timeStr.split(":").map(Number);
  if (parts.length === 2) return parts[0] * 60 + parts[1];
  if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2];
  return 0;
}

async function renderVideo(videoNumber) {
  console.log(`\n🎬 === Rendering Video ${videoNumber} ===\n`);

  const scriptPath = path.join(outputDir, `video_${videoNumber}_script.md`);
  const audioPath = path.join(outputDir, `video_${videoNumber}_audio.mp3`);
  const prefix = videoNumber === 1 ? "" : `v${videoNumber}_`;
  const manifestPath = path.join(outputDir, `${prefix}manifest.json`);

  // Step 1: TTS
  console.log("🔊 Step 1: Generating TTS audio...");
  execSync(`node ${path.join(__dirname, "tts.mjs")} "${scriptPath}" "${audioPath}"`, {
    cwd: remotionDir,
    stdio: "inherit",
  });

  // Step 2: Screenshot slides
  console.log("\n📸 Step 2: Taking slide screenshots...");
  await screenshotSlides(videoNumber);

  // Step 3: Build config with subtitles
  console.log("\n📋 Step 3: Building video config...");
  const subtitlesPath = path.join(outputDir, `video_${videoNumber}_audio_subtitles.json`);
  const config = buildVideoConfig(videoNumber, subtitlesPath, manifestPath);

  // Proportionally scale slide timing to match actual audio duration
  const rawSubPath = path.join(outputDir, `video_${videoNumber}_audio_minimax_raw_subtitles.json`);
  const rawSubs = JSON.parse(fs.readFileSync(rawSubPath, "utf-8"));
  const audioDuration = rawSubs.length > 0 ? rawSubs[rawSubs.length - 1].time_end / 1000 : 300;

  const totalEstimated = config.slides.reduce((sum, s) => sum + s.duration_seconds, 0);

  if (totalEstimated > 0 && audioDuration > 0) {
    const scaleFactor = audioDuration / totalEstimated;
    console.log(`  Timing scale: ${totalEstimated.toFixed(1)}s estimated → ${audioDuration.toFixed(1)}s actual (×${scaleFactor.toFixed(3)})`);

    let cumulativeTime = 0;
    for (const slide of config.slides) {
      slide.start_time_seconds = cumulativeTime;
      slide.duration_seconds = slide.duration_seconds * scaleFactor;
      cumulativeTime += slide.duration_seconds;
    }

    // Extend last slide by 1s buffer to prevent premature cutoff
    const lastSlide = config.slides[config.slides.length - 1];
    lastSlide.duration_seconds = audioDuration - lastSlide.start_time_seconds + 1;
  }

  // Auto-append CTA slide (5 seconds after last content slide)
  const contentEnd = config.slides.reduce(
    (max, s) => Math.max(max, s.start_time_seconds + s.duration_seconds),
    0
  );
  config.slides.push({
    slide_number: config.slides.length + 1,
    type: "cta",
    start_time_seconds: contentEnd,
    duration_seconds: 5,
    data: { type: "cta" },
  });

  // Save config
  const configPath = path.join(outputDir, `video_${videoNumber}_config.json`);
  fs.writeFileSync(configPath, JSON.stringify(config, null, 2));

  // Copy config to Remotion
  const remotionConfigPath = path.join(remotionDir, "src", "data", "video_config.json");
  fs.writeFileSync(remotionConfigPath, JSON.stringify(config));

  // Copy audio to Remotion public
  const publicAudioPath = path.join(remotionDir, "public", `video_${videoNumber}_audio.mp3`);
  fs.copyFileSync(audioPath, publicAudioPath);

  // Step 4: Remotion render
  console.log("\n🎥 Step 4: Remotion rendering...");
  const totalDuration = config.slides.reduce(
    (max, s) => Math.max(max, s.start_time_seconds + s.duration_seconds),
    0
  );
  const totalFrames = Math.ceil(totalDuration * config.fps);
  const outputMp4 = path.join(outputDir, `video_${videoNumber}.mp4`);

  const propsJson = JSON.stringify({ config }).replace(/'/g, "'\\''");
  fs.writeFileSync(
    path.join(remotionDir, ".tmp_render_props.json"),
    JSON.stringify({ config })
  );

  execSync(
    `npx remotion render src/Root.tsx BlogVideo "${outputMp4}" --props=".tmp_render_props.json" --frames=0-${totalFrames - 1}`,
    { cwd: remotionDir, stdio: "inherit", timeout: 600000 }
  );

  const stats = fs.statSync(outputMp4);
  console.log(`\n✅ Video ${videoNumber} rendered: ${outputMp4} (${(stats.size / 1024 / 1024).toFixed(1)} MB)`);
  console.log(`   Duration: ${totalDuration.toFixed(1)}s, Frames: ${totalFrames}`);
}

async function main() {
  const videos = findVideos();
  console.log(`Found ${videos.length} video(s) to render: ${videos.join(", ")}`);

  for (const videoNum of videos) {
    await renderVideo(videoNum);
  }

  console.log("\n🎉 All videos rendered successfully!");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
