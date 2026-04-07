#!/usr/bin/env node
/**
 * Pipeline Evaluation Gates
 *
 * Validates outputs at each pipeline stage to catch errors early.
 * Each gate returns { pass: boolean, warnings: string[], errors: string[] }
 *
 * Usage (standalone):
 *   node scripts/gates.mjs memo <memo_path>
 *   node scripts/gates.mjs narration <narration_path>
 *   node scripts/gates.mjs plan <plan_path> <output_dir>
 *   node scripts/gates.mjs script <script_path>
 *   node scripts/gates.mjs e2e <output_dir>
 *   node scripts/gates.mjs manifest <manifest_path> <script_path>
 *   node scripts/gates.mjs alignment <config_json>  (reads from stdin or file)
 *   node scripts/gates.mjs postrender <mp4_path> <cover_photo_path>
 */

import fs from "fs";
import path from "path";

// ─── Gate: Insight Memo Validation ──────────────────────────────────────────

export function gateMemo(memoPath) {
  const warnings = [];
  const errors = [];

  if (!fs.existsSync(memoPath)) {
    return { pass: false, warnings, errors: [`Memo not found: ${memoPath}`] };
  }

  const content = fs.readFileSync(memoPath, "utf-8");

  if (content.trim().length < 100) {
    errors.push(`Memo is too short (${content.trim().length} chars)`);
  }

  // Required sections
  const requiredSections = [
    "title_zh",
    "one_sentence_thesis",
    "judgment_lines",
    "evidence_map",
    "signature_line",
  ];
  for (const section of requiredSections) {
    if (!content.includes(`## ${section}`)) {
      errors.push(`Missing required section: ## ${section}`);
    }
  }

  // title_zh should have content after the header
  const titleMatch = content.match(/## title_zh\n+([\s\S]*?)(?=\n## |\n*$)/);
  if (titleMatch) {
    const titleContent = titleMatch[1].trim();
    if (titleContent.length === 0) {
      errors.push("title_zh section is empty");
    } else if (titleContent.length > 60) {
      warnings.push(`title_zh seems long (${titleContent.length} chars) — should be ≤20 chars`);
    }
  }

  // judgment_lines should have at least 3 items
  const judgmentMatch = content.match(/## judgment_lines\n+([\s\S]*?)(?=\n## )/);
  if (judgmentMatch) {
    const items = judgmentMatch[1].match(/^- /gm) || [];
    if (items.length < 3) {
      warnings.push(`judgment_lines has only ${items.length} items (expected 3-5)`);
    }
  }

  // evidence_map should have at least 3 items
  const evidenceMatch = content.match(/## evidence_map\n+([\s\S]*?)(?=\n## )/);
  if (evidenceMatch) {
    const items = evidenceMatch[1].match(/^- /gm) || [];
    if (items.length < 3) {
      warnings.push(`evidence_map has only ${items.length} items (expected 3+)`);
    }
  }

  return { pass: errors.length === 0, warnings, errors };
}

// ─── Gate: Narration Validation ─────────────────────────────────────────────

export function gateNarration(narrationPath) {
  const warnings = [];
  const errors = [];

  if (!fs.existsSync(narrationPath)) {
    return { pass: false, warnings, errors: [`Narration not found: ${narrationPath}`] };
  }

  const content = fs.readFileSync(narrationPath, "utf-8");

  if (content.trim().length < 500) {
    errors.push(`Narration is too short (${content.trim().length} chars)`);
  }

  // Required sections
  if (!content.includes("## Hook")) {
    errors.push("Missing ## Hook section");
  }
  if (!content.includes("## Brand Intro")) {
    errors.push("Missing ## Brand Intro section");
  }
  if (!content.includes("## Closing")) {
    errors.push("Missing ## Closing section");
  }
  if (!content.includes("## Synthesis")) {
    warnings.push("Missing ## Synthesis section (recommended)");
  }

  // Brand text
  if (!content.includes("精读AI")) {
    errors.push("Brand name '精读AI' not found in narration");
  }
  if (!content.includes("精读一篇")) {
    errors.push("Brand outro '精读一篇' not found in narration");
  }

  // Must NOT contain slide markers
  if (content.match(/\[SLIDE \d+:/)) {
    errors.push("Narration contains [SLIDE] markers — these belong in script.md, not narration.md");
  }

  // Must NOT contain --- horizontal rules
  if (content.match(/\n---\n/)) {
    warnings.push("Horizontal rule (---) found — may break downstream TTS alignment");
  }

  // Section count (should have at least 3 content sections beyond Hook/Brand/Closing)
  const sections = content.match(/^## /gm) || [];
  if (sections.length < 5) {
    warnings.push(`Only ${sections.length} sections found (expected ≥5 including Hook/Brand/Synthesis/Closing)`);
  }

  // Duration estimate
  const textOnly = content
    .split("\n")
    .filter((l) => !l.startsWith("#") && l.trim() !== "")
    .join("")
    .length;
  const estimatedMinutes = textOnly / 200;
  if (estimatedMinutes < 3) {
    warnings.push(`Estimated duration very short: ${estimatedMinutes.toFixed(1)} min`);
  }
  if (estimatedMinutes > 25) {
    warnings.push(`Estimated duration very long: ${estimatedMinutes.toFixed(1)} min`);
  }

  return { pass: errors.length === 0, warnings, errors };
}

// ─── Gate: Episode Splitter / Video Plan Validation ─────────────────────────

export function gatePlan(planPath, outputDir) {
  const warnings = [];
  const errors = [];

  if (!fs.existsSync(planPath)) {
    return { pass: false, warnings, errors: [`video_plan.json not found: ${planPath}`] };
  }

  let plan;
  try {
    plan = JSON.parse(fs.readFileSync(planPath, "utf-8"));
  } catch (e) {
    return { pass: false, warnings, errors: [`video_plan.json is not valid JSON: ${e.message}`] };
  }

  // Check required fields
  if (!plan.blog_metadata) {
    errors.push("Missing blog_metadata");
  } else {
    if (!plan.blog_metadata.title_zh) errors.push("Missing blog_metadata.title_zh");
    if (!plan.blog_metadata.slug) errors.push("Missing blog_metadata.slug");
  }

  if (!plan.video_plan) {
    errors.push("Missing video_plan");
  } else {
    const totalVideos = plan.video_plan.total_videos;
    if (!totalVideos || totalVideos < 1 || totalVideos > 5) {
      errors.push(`Invalid total_videos: ${totalVideos}`);
    }

    if (!Array.isArray(plan.video_plan.videos)) {
      errors.push("video_plan.videos is not an array");
    } else {
      if (plan.video_plan.videos.length !== totalVideos) {
        errors.push(`videos array length (${plan.video_plan.videos.length}) does not match total_videos (${totalVideos})`);
      }
      for (const v of plan.video_plan.videos) {
        if (!v.video_number) errors.push("Video entry missing video_number");
        if (!v.title_zh) errors.push(`Video ${v.video_number} missing title_zh`);
      }
    }

    // Check that video_N_narration.md files exist
    if (outputDir) {
      for (let i = 1; i <= totalVideos; i++) {
        const narrationFile = path.join(outputDir, `video_${i}_narration.md`);
        if (!fs.existsSync(narrationFile)) {
          errors.push(`video_${i}_narration.md not found in ${outputDir}`);
        }
      }
    }
  }

  return { pass: errors.length === 0, warnings, errors };
}

// ─── Gate: End-to-End Pipeline Validation ───────────────────────────────────

export function gateE2E(outputDir) {
  const warnings = [];
  const errors = [];

  if (!fs.existsSync(outputDir)) {
    return { pass: false, warnings, errors: [`Output directory not found: ${outputDir}`] };
  }

  // 1. Check all expected files exist
  const requiredFiles = ["source_blog.md", "insight_memo.md", "narration.md", "video_plan.json"];
  for (const f of requiredFiles) {
    if (!fs.existsSync(path.join(outputDir, f))) {
      errors.push(`Missing required file: ${f}`);
    }
  }

  // 2. Run individual gates
  const memoResult = gateMemo(path.join(outputDir, "insight_memo.md"));
  if (!memoResult.pass) errors.push(`Memo gate failed: ${memoResult.errors.join("; ")}`);
  warnings.push(...memoResult.warnings.map((w) => `[Memo] ${w}`));

  const narrationResult = gateNarration(path.join(outputDir, "narration.md"));
  if (!narrationResult.pass) errors.push(`Narration gate failed: ${narrationResult.errors.join("; ")}`);
  warnings.push(...narrationResult.warnings.map((w) => `[Narration] ${w}`));

  const planPath = path.join(outputDir, "video_plan.json");
  const planResult = gatePlan(planPath, outputDir);
  if (!planResult.pass) errors.push(`Plan gate failed: ${planResult.errors.join("; ")}`);
  warnings.push(...planResult.warnings.map((w) => `[Plan] ${w}`));

  // 3. Check per-video files and run script gate
  if (planResult.pass) {
    const plan = JSON.parse(fs.readFileSync(planPath, "utf-8"));
    for (let i = 1; i <= plan.video_plan.total_videos; i++) {
      const scriptFile = path.join(outputDir, `video_${i}_script.md`);
      if (fs.existsSync(scriptFile)) {
        const scriptResult = gateScript(scriptFile);
        if (!scriptResult.pass) errors.push(`Script gate failed for video ${i}: ${scriptResult.errors.join("; ")}`);
        warnings.push(...scriptResult.warnings.map((w) => `[Script ${i}] ${w}`));
      } else {
        warnings.push(`video_${i}_script.md not found (slide planner may not have run yet)`);
      }
    }
  }

  // 4. Content consistency: narration.md text ⊇ video_1_narration.md text (for single-video)
  if (fs.existsSync(path.join(outputDir, "narration.md")) && fs.existsSync(path.join(outputDir, "video_1_narration.md"))) {
    const narration = fs.readFileSync(path.join(outputDir, "narration.md"), "utf-8");
    const video1 = fs.readFileSync(path.join(outputDir, "video_1_narration.md"), "utf-8");
    // For single-video pass-through, they should be identical
    const planExists = fs.existsSync(planPath);
    if (planExists) {
      const plan = JSON.parse(fs.readFileSync(planPath, "utf-8"));
      if (plan.video_plan.total_videos === 1 && narration !== video1) {
        warnings.push("Single-video pass-through: narration.md and video_1_narration.md differ (expected identical)");
      }
    }
  }

  // 5. Title consistency: insight_memo title_zh should appear in video_plan
  if (fs.existsSync(path.join(outputDir, "insight_memo.md")) && fs.existsSync(planPath)) {
    const memo = fs.readFileSync(path.join(outputDir, "insight_memo.md"), "utf-8");
    const titleMatch = memo.match(/## title_zh\n+([\s\S]*?)(?=\n## )/);
    if (titleMatch) {
      const memoTitle = titleMatch[1].trim();
      const plan = JSON.parse(fs.readFileSync(planPath, "utf-8"));
      if (plan.blog_metadata.title_zh && !plan.blog_metadata.title_zh.includes(memoTitle.slice(0, 10))) {
        warnings.push(`Title mismatch: memo title_zh "${memoTitle}" vs plan title_zh "${plan.blog_metadata.title_zh}"`);
      }
    }
  }

  return { pass: errors.length === 0, warnings, errors };
}

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

  if (command === "memo" && args[1]) {
    const result = gateMemo(args[1]);
    logGateResult("Memo", result);
    process.exit(result.pass ? 0 : 1);
  }

  if (command === "narration" && args[1]) {
    const result = gateNarration(args[1]);
    logGateResult("Narration", result);
    process.exit(result.pass ? 0 : 1);
  }

  if (command === "plan" && args[1]) {
    const result = gatePlan(args[1], args[2]);
    logGateResult("Plan", result);
    process.exit(result.pass ? 0 : 1);
  }

  if (command === "script" && args[1]) {
    const result = gateScript(args[1]);
    logGateResult("Script", result);
    process.exit(result.pass ? 0 : 1);
  }

  if (command === "e2e" && args[1]) {
    const result = gateE2E(args[1]);
    logGateResult("E2E", result);
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
