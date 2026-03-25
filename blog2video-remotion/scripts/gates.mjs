#!/usr/bin/env node
/**
 * Pipeline Evaluation Gates
 *
 * Validates outputs at each pipeline stage to catch errors early.
 * Each gate returns { pass: boolean, warnings: string[], errors: string[] }
 *
 * Usage (standalone):
 *   node scripts/gates.mjs script <script_path>
 *   node scripts/gates.mjs manifest <manifest_path> <script_path>
 *   node scripts/gates.mjs alignment <config_json>  (reads from stdin or file)
 *   node scripts/gates.mjs postrender <mp4_path> <cover_photo_path>
 */

import fs from "fs";
import path from "path";

// ─── Gate 1: Script Validation ───────────────────────────────────────────────

export function gateScript(scriptPath) {
  const warnings = [];
  const errors = [];

  if (!fs.existsSync(scriptPath)) {
    return { pass: false, warnings, errors: [`Script not found: ${scriptPath}`] };
  }

  const content = fs.readFileSync(scriptPath, "utf-8");

  // Extract [SLIDE N: type] markers
  const slideMarkers = [];
  for (const line of content.split("\n")) {
    const match = line.match(/^\[SLIDE (\d+):\s*(\w+)/);
    if (match) {
      slideMarkers.push({ number: parseInt(match[1]), type: match[2] });
    }
  }

  // Check: markers exist
  if (slideMarkers.length === 0) {
    errors.push("No [SLIDE N: type] markers found in script");
    return { pass: false, warnings, errors };
  }

  // Check: sequential numbering starting at 1
  for (let i = 0; i < slideMarkers.length; i++) {
    if (slideMarkers[i].number !== i + 1) {
      errors.push(`Slide numbering not sequential: expected ${i + 1}, got ${slideMarkers[i].number}`);
    }
  }

  // Check: first slide is cover, last is summary
  if (slideMarkers[0].type !== "cover") {
    errors.push(`First slide must be 'cover', got '${slideMarkers[0].type}'`);
  }
  if (slideMarkers[slideMarkers.length - 1].type !== "summary") {
    errors.push(`Last slide must be 'summary', got '${slideMarkers[slideMarkers.length - 1].type}'`);
  }

  // Check: brand intro present
  if (!content.includes("精读AI")) {
    warnings.push("Brand intro '精读AI' not found in script");
  }

  // Check: brand outro present
  if (!content.includes("精读一篇")) {
    warnings.push("Brand outro '精读一篇' not found in script");
  }

  // Check: per-slide character count (narration lines only)
  const sections = content.split(/^\[SLIDE \d+:/m);
  for (let i = 1; i < sections.length; i++) {
    const lines = sections[i].split("\n").filter((l) => {
      if (l.trim() === "") return false;
      if (l.startsWith("#")) return false;
      if (l.match(/^\w+\]/)) return false; // rest of [SLIDE] line
      return true;
    });
    const charCount = lines.join("").length;
    if (charCount < 30) {
      warnings.push(`Slide ${i} has very little text (${charCount} chars)`);
    }
    if (charCount > 800) {
      warnings.push(`Slide ${i} has very long text (${charCount} chars, ~${Math.round(charCount / 200 * 60)}s at 200 chars/min)`);
    }
  }

  // Check: no --- horizontal rules between slides
  if (content.match(/\n---\n/)) {
    warnings.push("Horizontal rule (---) found between slides — may break TTS alignment");
  }

  return { pass: errors.length === 0, warnings, errors };
}

// ─── Gate 2: Manifest Validation ─────────────────────────────────────────────

export function gateManifest(manifestPath, scriptPath) {
  const warnings = [];
  const errors = [];

  if (!fs.existsSync(manifestPath)) {
    return { pass: false, warnings, errors: [`Manifest not found: ${manifestPath}`] };
  }

  let manifest;
  try {
    manifest = JSON.parse(fs.readFileSync(manifestPath, "utf-8"));
  } catch (e) {
    return { pass: false, warnings, errors: [`Manifest is not valid JSON: ${e.message}`] };
  }

  // Check: slides array exists
  if (!Array.isArray(manifest.slides) || manifest.slides.length === 0) {
    errors.push("Manifest has no slides array or it is empty");
    return { pass: false, warnings, errors };
  }

  // Check: slide count matches script
  if (scriptPath && fs.existsSync(scriptPath)) {
    const scriptContent = fs.readFileSync(scriptPath, "utf-8");
    const scriptSlideCount = (scriptContent.match(/^\[SLIDE \d+:/gm) || []).length;
    if (manifest.slides.length !== scriptSlideCount) {
      errors.push(`Slide count mismatch: manifest has ${manifest.slides.length}, script has ${scriptSlideCount}`);
    }
  }

  // Check: all HTML files exist
  const manifestDir = path.dirname(manifestPath);
  for (const slide of manifest.slides) {
    if (!slide.file) {
      errors.push(`Slide ${slide.slide_number} has no 'file' field`);
    } else if (!fs.existsSync(path.join(manifestDir, slide.file))) {
      errors.push(`Slide ${slide.slide_number} HTML file missing: ${slide.file}`);
    }
  }

  // Check: estimated_duration_seconds present and > 0
  for (const slide of manifest.slides) {
    if (!slide.estimated_duration_seconds || slide.estimated_duration_seconds <= 0) {
      warnings.push(`Slide ${slide.slide_number} has invalid estimated_duration_seconds: ${slide.estimated_duration_seconds}`);
    }
  }

  // Check: cover photo
  if (!manifest.cover_photo) {
    warnings.push("Manifest has no cover_photo field");
  } else if (!fs.existsSync(path.join(manifestDir, manifest.cover_photo))) {
    warnings.push(`Cover photo HTML missing: ${manifest.cover_photo}`);
  }

  // Check: total duration reasonable
  const totalDuration = manifest.slides.reduce((sum, s) => sum + (s.estimated_duration_seconds || 0), 0);
  if (totalDuration < 30) {
    warnings.push(`Total estimated duration very short: ${totalDuration}s`);
  }
  if (totalDuration > 600) {
    warnings.push(`Total estimated duration very long: ${totalDuration}s`);
  }

  return { pass: errors.length === 0, warnings, errors };
}

// ─── Gate 3: Audio-Slide Alignment Validation ────────────────────────────────

export function gateAlignment(config, rawSubtitles, slideMap) {
  const warnings = [];
  const errors = [];

  const audioDuration = rawSubtitles.length > 0
    ? rawSubtitles[rawSubtitles.length - 1].time_end / 1000
    : 0;

  // Check: every slide has at least one subtitle mapped to it
  if (slideMap) {
    const slideGroups = new Map();
    for (const sub of rawSubtitles) {
      let slideNum = slideMap[0]?.slideNumber || 1;
      for (let i = slideMap.length - 1; i >= 0; i--) {
        if (slideMap[i].charStart <= sub.text_begin) {
          slideNum = slideMap[i].slideNumber;
          break;
        }
      }
      if (!slideGroups.has(slideNum)) slideGroups.set(slideNum, []);
      slideGroups.get(slideNum).push(sub);
    }

    for (const slide of config.slides) {
      if (slide.type === "cta") continue;
      if (!slideGroups.has(slide.slide_number) || slideGroups.get(slide.slide_number).length === 0) {
        errors.push(`Slide ${slide.slide_number} has no subtitle segments mapped to it`);
      }
    }
  }

  // Check: slide timing monotonically increasing
  for (let i = 1; i < config.slides.length; i++) {
    if (config.slides[i].start_time_seconds < config.slides[i - 1].start_time_seconds) {
      errors.push(`Slide ${config.slides[i].slide_number} start_time (${config.slides[i].start_time_seconds.toFixed(1)}s) is before slide ${config.slides[i - 1].slide_number} (${config.slides[i - 1].start_time_seconds.toFixed(1)}s)`);
    }
  }

  // Check: no slide too short (< 2s), excluding CTA
  for (const slide of config.slides) {
    if (slide.type === "cta") continue;
    if (slide.duration_seconds < 2) {
      errors.push(`Slide ${slide.slide_number} duration too short: ${slide.duration_seconds.toFixed(1)}s`);
    }
  }

  // Check: audio duration vs estimated total
  const totalEstimated = config.slides
    .filter((s) => s.type !== "cta")
    .reduce((sum, s) => sum + s.duration_seconds, 0);
  if (audioDuration > 0 && totalEstimated > 0) {
    const ratio = Math.abs(audioDuration - totalEstimated) / audioDuration;
    if (ratio > 0.3) {
      warnings.push(`Audio duration (${audioDuration.toFixed(1)}s) differs from slide total (${totalEstimated.toFixed(1)}s) by ${(ratio * 100).toFixed(0)}%`);
    }
  }

  // Check: subtitle coverage (no gaps > 3s in sentence subtitles)
  if (config.subtitles && config.subtitles.length > 1) {
    for (let i = 1; i < config.subtitles.length; i++) {
      const gap = config.subtitles[i].start - config.subtitles[i - 1].end;
      if (gap > 3) {
        warnings.push(`Subtitle gap of ${gap.toFixed(1)}s between index ${i - 1} and ${i}`);
      }
    }
  }

  return { pass: errors.length === 0, warnings, errors };
}

// ─── Gate 4: Post-Render Validation ──────────────────────────────────────────

export function gatePostRender(mp4Path, coverPhotoPath) {
  const warnings = [];
  const errors = [];

  // Check: MP4 exists and has reasonable size
  if (!fs.existsSync(mp4Path)) {
    errors.push(`MP4 not found: ${mp4Path}`);
  } else {
    const stats = fs.statSync(mp4Path);
    if (stats.size < 100 * 1024) {
      errors.push(`MP4 file too small (${(stats.size / 1024).toFixed(0)} KB), likely corrupt`);
    }
  }

  // Check: cover photo exists
  if (coverPhotoPath && !fs.existsSync(coverPhotoPath)) {
    warnings.push(`Cover photo not found: ${coverPhotoPath}`);
  }

  return { pass: errors.length === 0, warnings, errors };
}

// ─── Utility: Log gate results ───────────────────────────────────────────────

export function logGateResult(gateName, result) {
  if (result.pass) {
    console.log(`  ✅ Gate [${gateName}]: PASS`);
  } else {
    console.log(`  ❌ Gate [${gateName}]: FAIL`);
  }
  for (const w of result.warnings) {
    console.log(`  ⚠️  ${w}`);
  }
  for (const e of result.errors) {
    console.log(`  ❌ ${e}`);
  }
  return result.pass;
}

// ─── CLI entrypoint ──────────────────────────────────────────────────────────

const args = process.argv.slice(2);
if (args.length > 0) {
  const command = args[0];

  if (command === "script" && args[1]) {
    const result = gateScript(args[1]);
    logGateResult("Script", result);
    process.exit(result.pass ? 0 : 1);
  }

  if (command === "manifest" && args[1]) {
    const result = gateManifest(args[1], args[2]);
    logGateResult("Manifest", result);
    process.exit(result.pass ? 0 : 1);
  }

  if (command === "postrender" && args[1]) {
    const result = gatePostRender(args[1], args[2]);
    logGateResult("PostRender", result);
    process.exit(result.pass ? 0 : 1);
  }
}
