# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Blog2Video: automated pipeline that converts English technical content (blog posts, PDFs, YouTube videos) into Chinese narrated videos (小红书/视频号 style). Orchestrated by a Claude Code slash command `/blog2video <url-or-file>` that runs 5 stages via subagents.

### Supported input types
- **Blog URLs** — fetched via curl/fetch
- **PDF files** — local path or remote URL; text extracted via `pdfminer`
- **YouTube videos** — English subtitles fetched via `yt-dlp`, parsed to plain text
- **Local text files** — read directly

## Commands

### Remotion (run from `blog2video-remotion/`)
```bash
npm install                  # Install dependencies
npx remotion studio          # Preview in browser (dev mode)
npx remotion render BlogVideo out/video.mp4  # Render single video
npm run render -- <output-dir>  # Render all videos: node scripts/render-all.mjs <dir>
npm run tts -- <script.md> <output.mp3>  # Generate TTS audio
```

### TTS prerequisite
```bash
pip install edge-tts
```

## Architecture

### Pipeline stages (orchestrated by `/blog2video` slash command)

1. **Content Analyzer** — Analyzes blog, decides video count (1-3), outputs `video_plan.json` (with hook planning)
2. **Insight Memo Writer** (×N) — Extracts deep insights from source + plan into structured memo, outputs `video_N_insight_memo.md`
3. **Script Writer** (×N) — Converts insight memo into Chinese narration script with `[SLIDE N: type]` markers, outputs `video_N_script.md`
4. **Slide Data Generator** (×N) — Converts script to Remotion-compatible JSON, outputs `video_N_config.json`
5. **Render** — Edge TTS → audio, then Remotion renders final MP4

Each stage runs as an independent subagent with no shared context. Prompt specs live in `.claude/skills/blog2video/prompts/`, examples in `examples/`.

### Output structure
All outputs go to `./blog2video-output/<blog-slug>/` — plan, scripts, configs, audio, and MP4s.

### Remotion rendering engine (`blog2video-remotion/`)

- **Root.tsx** — Registers the single `BlogVideo` composition, reads config from `src/data/video_config.json`
- **BlogVideo.tsx** — Main composition; maps slide configs to components via `SLIDE_COMPONENTS` registry, adds audio track
- **6 slide types**: `cover`, `principle`, `comparison_cards`, `checklist`, `quote`, `summary` — each in `src/slides/`
- **types.ts** — TypeScript interfaces for `VideoConfig`, `SlideConfig`, and all slide data types; also defines `COLORS` map
- **shared.tsx** — Shared animation utilities and styles
- **render-all.mjs** — Orchestrates per-video: TTS → copy config → copy audio to `public/` → Remotion render
- **tts.mjs** — Extracts plain text from script markdown, calls `edge-tts` CLI

### Video specs
- Resolution: 1080×1920 (vertical 9:16)
- FPS: 30
- Background: `#0D0D1A`
- Dark theme with accent colors: purple (concepts), red (warnings), green (positive), yellow (highlights), blue (info)

## Adding a New Slide Type

1. Define the data interface in `src/types.ts`
2. Create React component in `src/slides/NewSlide.tsx`
3. Register in `BlogVideo.tsx` `SLIDE_COMPONENTS` map
4. Add the type to `slide-data-generator.md` prompt so subagents can generate it

## Key Conventions

- Slide data flows as JSON: subagent generates `video_N_config.json` → copied to `src/data/video_config.json` at render time
- Audio files go to `public/video_N_audio.mp3` for Remotion's `staticFile()` to find them
- Script word count target: ~200 chars/minute × target duration
- TTS voice: `zh-CN-YunxiNeural` (configurable in `scripts/tts.mjs`)

## Workflow

- After implementing a planned change, automatically commit and push without waiting to be asked. Use a descriptive commit message summarizing all changes.

## Post-Render Delivery

视频渲染完成后，自动将交付文件通过 rclone 上传到 Google Drive。

### 需要传输的文件（每个视频）

- `video_N.mp4` — 视频文件
- `video_N_cover_photo.png` — 封面图
- `video_N_script.md` — 脚本文稿
- `video_N_audio.vtt` — 字幕文件
- `source_blog.md` — 原始博客内容
- `meta.json` — 系列元数据

### meta.json 格式

```json
{
  "topic": "系列主题名称",
  "blog_url": "原始博客链接",
  "source": "slug名称（输出目录名）",
  "flow_source": "manual-curate",
  "videos": [
    {
      "video_number": 1,
      "file": "video_1.mp4",
      "cover": "video_1_cover_photo.png",
      "script": "video_1_script.md",
      "subtitle": "video_1_audio.vtt"
    }
  ]
}
```

meta.json 里**不需要** title、description、tags — 这些由远程服务器（Claudiny）基于 script 和 source_blog 自动生成，以适配小红书和微信视频号的平台风格。

### 投递命令

投递前先清理构建中间产物，**不需要传输的文件**：`*.mp3`、`*.html`、`*.png`（slide 截图，cover_photo.png 除外）、`*_manifest.json`、`*_minimax_raw_subtitles.json`、`*_audio_subtitles.json`、`*_slide_map.json`、`video_plan.json`、`twitter_metadata.json`、`source_raw.md`、`images/` 目录。

使用 rclone 上传到 Google Drive（rclone remote `gdrive:` 已配置）：

```bash
rclone copy ./blog2video-output/<slug>/ gdrive:blog2video/<slug>/ --exclude="*.mp3" --exclude="*.html" --exclude="*_manifest.json" --exclude="*_minimax_raw_subtitles.json" --exclude="*_audio_subtitles.json" --exclude="*_slide_map.json" --exclude="video_plan.json" --exclude="twitter_metadata.json" --exclude="source_raw.md" --exclude="images/**" --exclude="*_narration.txt" --exclude="*_config.json" --progress
```

注意：slide 截图 PNG 不传，但 `*_cover_photo.png` 需要传。用 `--include` 无法精确控制时，可先手动清理再 `rclone copy`。

### 投递完成后

告知用户：**视频已上传到 Google Drive (blog2video/<slug>/)，Claudiny 会基于脚本内容自动生成标题、描述和标签，并排期发布到小红书和微信视频号。**
