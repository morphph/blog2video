# AGENTS.md

This file provides guidance to any coding agent (Claude Code, Codex, Aider, Cursor, etc.) working in this repository. It is a duplicate of CLAUDE.md kept in sync for tools that follow the agents.md convention.

---

## Codex Quick Reference

### Repository structure
- `blog2video-content/` — CLI orchestration (`cli.mjs`, `smoke.sh`) for the 5-stage pipeline.
- `blog2video-remotion/` — Remotion rendering engine (TypeScript/React); has its own `package.json` + `.env`.
- `src/` — root TypeScript sources (scheduler, publishers, queue watcher — compiled to `dist/` via `tsc`).
- `.claude/` — Claude Code commands, skills, settings (pipeline prompt specs live here; keep intact).
- `.codex/hooks.json` — hook config (see Safety constraints; contains an auto-deploy hook — review before enabling).
- `templates/` — video-style template library. `config/`, `scripts/`, `bin/` — helpers.
- `blog2video-output/` — generated per-video outputs. Committed to git but **not materialized on disk** in this clone (sparse-checkout). Run `git sparse-checkout disable` to fetch them.

### Setup & development commands
```bash
npm install                 # root deps (openai, playwright, puppeteer-core, typescript)
npm run build               # tsc -> dist/  (typecheck + build; safe, no external side effects)
cd blog2video-remotion && npm install   # rendering engine deps (separate package)
```

### Lint / typecheck / test / build
- **Build / typecheck:** `npm run build` (root `tsc`). No dedicated lint or unit-test suite is configured at root.
- **Smoke (local):** `npm run b2v:smoke` — inspect `blog2video-content/smoke.sh` first; only run if it has no external/publish side effects.
- There is no `test` script; do not invent one.

### Safety constraints (load-bearing)
- **Never** run publishing/upload/production commands: `publish:xhs`, `publish:weixin`, `publish:xhs:draft`, `wechat:intake`, `watch`, `scheduler`, `login:*`, `sync-to-gdrive.sh`, `upload.sh`, `gdrive-watcher.sh`, or `scripts/auto-deliver-ec2.sh`.
- Never request/refresh OAuth tokens or read/print WeChat / Xiaohongshu / Google / MiniMax credentials. Secrets live only in `.env` / `cookies/` (git-ignored) — never commit them.
- `.codex/hooks.json` defines a `PostToolUse` hook that runs `scripts/auto-deliver-ec2.sh` (deploy) on every Bash call. Do not enable Claude-Code-style hooks in an environment that would auto-run it unless you intend to deploy.
- Treat rendering/publishing as opt-in: only when the human explicitly asks for that specific run.

### Definition of Done
- `npm run build` succeeds (no TS errors).
- No secrets, `.env`, `cookies/`, `dist/`, `node_modules/`, or large generated media added to the commit.
- Changes to pipeline behavior are reflected in the relevant `.claude/skills/` / `.claude/commands/` spec, per the Documentation Layers table below.
- Commit message is descriptive; push only the intended files.

---

## Project Overview

Blog2Video: automated pipeline that converts English technical content (blog posts, PDFs, YouTube videos) into Chinese narrated videos (小红书/视频号 style). Orchestrated by a Claude Code slash command `/blog2video <url-or-file>` that runs 5 core stages via subagents.

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
`blog2video-remotion/.env` must define:
```
MINIMAX_API_KEY=<your-key>
MINIMAX_VOICE_ID=moss_audio_ccbe9ed6-3a37-11f1-a1e0-8a43ce7defab
```
(The voice ID above is the current custom voice; update if a new one is created.)

## Slash Commands

| Command | What it does |
|---------|-------------|
| `/blog2video <url-or-file>` | Full pipeline: fetch → memo → script → split → slides → render → deliver |
| `/blog2video-script` | Generate or regenerate narration only (URL or existing output dir) |
| `/blog2video-slides` | Regenerate Remotion slide data JSON from existing narration |
| `/blog2video-render` | TTS + Remotion render from existing config (no subagents) |
| `/blog2video-continue` | Continue from existing `narration.md` through delivery |
| `/fetch-source <url>` | Fetch clean markdown from blog / PDF / YouTube / X article |

## Skills

`.claude/skills/blog2video/` — pipeline orchestration logic + per-stage prompt specs (`prompts/`, `design/`, `examples/`). Loaded by `/blog2video` and friends.

## Templates

`templates/` = 视频风格模板库(模板 = transcript + visual-style-prompt 两半 + 模板卡,seed→production),详见 `templates/README.md`。

## NEVER
- Never apply loudnorm/boost/post-processing to audio — MiniMax TTS output is used raw
- Never add `title`, `description`, or `tags` to `meta.json` — Claudiny generates these on the server
- Never upload slide screenshot PNGs — only `*_cover_photo.png` is delivered
- Never upload `.mp3`, `*_manifest.json`, `*_narration.md`, `*_insight_memo.md`, or other intermediate files — Post-Render Delivery exclusion list is authoritative
- Never change `MINIMAX_VOICE_ID` casually — it's the show's voice identity; create a new env entry if testing alternatives

## Architecture

### Pipeline stages (orchestrated by `/blog2video` slash command)

1. **Insight Memo Writer** — Analyzes whole blog, extracts editorial judgments, evidence, non-obvious insights, outputs `insight_memo.md`
2. **Script Writer** — Generates essay-first Chinese narration for whole blog (no slide markers), outputs `narration.md`
3. **Episode Splitter** — Reads finished narration, decides whether to split into multiple videos, outputs `video_plan.json` + `video_N_narration.md`
4. **Slide Planner** (×N) — Segments each video's narration into downstream-compatible slide format, outputs `video_N_script.md`
5. **Slide HTML Generator** (×N) — Generates self-contained HTML slides + manifest from script
6. **Render** — MiniMax TTS → audio, Puppeteer screenshot → Remotion renders final MP4

Design principle: **write first, split later.** Narration quality is never constrained by splitting decisions. Duration is a result, not an input.

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
- **tts.mjs** — Extracts plain text from script markdown, calls MiniMax TTS API (`speech-02-hd`, voice from `MINIMAX_VOICE_ID` env)

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
- Script duration estimate — **use the calibrated model, not a flat chars/minute number**. Measured against 123 historical episodes (VTT end-timestamp = real audio duration), MiniMax TTS delivers: **CJK 324 chars/min, Latin+digit 803 chars/min, punctuation 175 marks/min** (MAPE 2.8%). Formula: `minutes = cjk/324 + latin/803 + punct/175`. A flat 200 chars/min **overestimates duration by ~25%** — it is a writing target, not a speech rate. Punctuation dominates because pauses, not syllables, drive runtime.
- TTS: MiniMax `speech-02-hd`, voice ID set via `MINIMAX_VOICE_ID` in `blog2video-remotion/.env` (see `scripts/tts.mjs`)
- Audio is used raw from MiniMax — no loudnorm/boost processing in the render pipeline

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

投递前先清理构建中间产物，**不需要传输的文件**：`*.mp3`、`*.html`、`*.png`（slide 截图，cover_photo.png 除外）、`*_manifest.json`、`*_minimax_raw_subtitles.json`、`*_audio_subtitles.json`、`*_slide_map.json`、`video_plan.json`、`twitter_metadata.json`、`source_raw.md`、`*_narration.md`、`*_insight_memo.md`、`images/` 目录。

使用 rclone 上传到 Google Drive（rclone remote `gdrive:` 已配置）：

```bash
rclone copy ./blog2video-output/<slug>/ gdrive:blog2video/<slug>/ --exclude="*.mp3" --exclude="*.html" --exclude="*_manifest.json" --exclude="*_minimax_raw_subtitles.json" --exclude="*_audio_subtitles.json" --exclude="*_slide_map.json" --exclude="video_plan.json" --exclude="twitter_metadata.json" --exclude="source_raw.md" --exclude="*_narration.md" --exclude="*_insight_memo.md" --exclude="images/**" --exclude="*_config.json" --progress
```

注意：slide 截图 PNG 不传，但 `*_cover_photo.png` 需要传。用 `--include` 无法精确控制时，可先手动清理再 `rclone copy`。

### 投递完成后

告知用户：**视频已上传到 Google Drive (blog2video/<slug>/)，Claudiny 会基于脚本内容自动生成标题、描述和标签，并排期发布到小红书和微信视频号。**

## Documentation Layers

| What changed | Update where |
|-------------|-------------|
| Project-wide convention (every session) | AGENTS.md (this file) |
| Slash command behavior | `.claude/commands/{name}.md`, NOT here |
| Skill prompts / pipeline-stage logic | `.claude/skills/blog2video/prompts/*.md`, NOT here |
| Slide type catalog / Remotion components | `blog2video-remotion/src/types.ts` + `src/slides/*.tsx` |
| Post-render delivery rules | This file (load-bearing every delivery) |
| Pipeline architecture / 6 stages | This file (Architecture section) |

Principle: **AGENTS.md declares WHAT exists and project-wide rules. HOW each stage works lives inside the skill / command file.**

## Compact Instructions

When compressing context, preserve in priority order:
1. NEVER list and Post-Render Delivery exclude rules — always re-check before delivery
2. The 6-stage pipeline architecture (Insight Memo → Script → Splitter → Slide Planner → Slide HTML → Render)
3. Modified files and key changes
4. Current task state and open TODOs
5. Tool outputs can be discarded — keep only pass/fail status
