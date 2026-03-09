# Blog2Video

**Turn English tech content into Chinese narrated videos, automatically.**

将英文技术内容自动转化为中文口播视频（小红书 / 视频号风格）。

[![Claude Code](https://img.shields.io/badge/Built_with-Claude_Code-blueviolet)](https://claude.ai/code)
[![Remotion](https://img.shields.io/badge/Rendered_with-Remotion-0b84f3)](https://www.remotion.dev/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

## What it does

Blog2Video is a fully automated pipeline that reads English technical content — blog posts, PDFs, or YouTube videos — and produces vertical Chinese narrated videos ready for platforms like 小红书 and 视频号. The entire process is orchestrated by [Claude Code](https://claude.ai/code) subagents: content analysis, Chinese script writing, slide generation, TTS narration, and video rendering all happen with a single command.

## Demo

<!-- TODO: Add demo GIF -->

**Typical workflow:**

```
Input:  A blog post URL (e.g. an Anthropic engineering blog)
  ↓
Output: 1-3 vertical MP4 videos (1080×1920, 30fps)
        with Chinese narration, animated slides, and dark-theme visuals
        → ready to upload to 小红书 / 视频号
```

## Quick Start

**Prerequisites:** Node.js 18+, Python 3.8+, [Claude Code](https://claude.ai/code)

### 1. Clone & install

```bash
git clone https://github.com/morphph/blog2video.git
cd blog2video/blog2video-remotion && npm install
pip install edge-tts
```

### 2. Run the pipeline

Open Claude Code in the project root and run:

```
/blog2video https://www.anthropic.com/engineering/built-with-claude-code
```

### 3. Find your videos

```bash
ls blog2video-output/built-with-claude-code/
# → video_1.mp4  video_2.mp4  ...
```

## How it works

```
Blog URL / PDF / YouTube / Text file
    ↓
[/blog2video slash command]          ← Claude Code orchestrator
    ↓
┌─────────────────────────────────┐
│ 1. Content Analyzer             │  → video_plan.json
│    Reads source, decides how    │    (video count, topics, durations)
│    many videos to produce (1-3) │
└────────────┬────────────────────┘
             ↓
┌─────────────────────────────────┐
│ 2. Script Writer  × N          │  → video_N_script.md
│    Writes Chinese narration     │    (with [SLIDE N: type] markers)
│    script for each video        │
└────────────┬────────────────────┘
             ↓
┌─────────────────────────────────┐
│ 3. Slide Data Generator  × N   │  → video_N_config.json
│    Converts script to Remotion- │    (slide types, text, colors)
│    compatible JSON config       │
└────────────┬────────────────────┘
             ↓
┌─────────────────────────────────┐
│ 4. Render                       │  → video_N.mp4
│    Edge TTS → audio             │    1080×1920, 30fps, dark theme
│    Remotion  → final MP4        │
└─────────────────────────────────┘
```

Each stage runs as an independent Claude Code subagent with its own prompt. No shared context between stages — all data flows through files.

### Supported inputs

| Input type | How it's processed |
|---|---|
| Blog URL | Fetched via curl/fetch |
| PDF file | Text extracted via `pdfminer` |
| YouTube video | English subtitles fetched via `yt-dlp` |
| Local text file | Read directly |

### Slide types

The rendering engine includes 6 built-in slide types:

- **cover** — Title card with video topic
- **principle** — Key concept with icon and explanation
- **comparison_cards** — Side-by-side comparisons
- **checklist** — Actionable items with checkmarks
- **quote** — Highlighted quote or callout
- **summary** — Recap and closing

## Project structure

```
.claude/
├── commands/blog2video.md              Slash command entry point
└── skills/blog2video/
    ├── SKILL.md                        Skill overview
    ├── prompts/
    │   ├── content-analyzer.md         Stage 1 prompt
    │   ├── script-writer.md            Stage 2 prompt
    │   └── slide-data-generator.md     Stage 3 prompt
    ├── examples/                       Reference outputs
    └── design/
        └── design-system.md            Visual design spec

blog2video-remotion/                    Remotion rendering engine
├── src/
│   ├── Root.tsx                        Remotion root
│   ├── compositions/BlogVideo.tsx      Main composition
│   ├── slides/                         6 slide components
│   ├── types.ts                        TypeScript interfaces & colors
│   └── utils/shared.tsx                Animation utilities
├── scripts/
│   ├── tts.mjs                         Edge TTS generation
│   └── render-all.mjs                  Batch render orchestrator
└── package.json
```

## Customization

### Change the TTS voice

Edit the `VOICE` variable in `blog2video-remotion/scripts/tts.mjs`:

| Voice | Description |
|---|---|
| `zh-CN-YunxiNeural` | Male, default (男声) |
| `zh-CN-XiaoxiaoNeural` | Female (女声) |
| `zh-CN-YunjianNeural` | Male, authoritative (男声，权威感) |

### Change the color scheme

Edit `COLORS` in `blog2video-remotion/src/types.ts` and the design spec at `.claude/skills/blog2video/design/design-system.md`.

### Add a new slide type

1. Define the data interface in `src/types.ts`
2. Create a React component in `src/slides/YourSlide.tsx`
3. Register it in the `SLIDE_COMPONENTS` map in `BlogVideo.tsx`
4. Add the type to the `slide-data-generator.md` prompt

## Commands reference

Run from `blog2video-remotion/`:

```bash
npx remotion studio                          # Preview in browser
npx remotion render BlogVideo out/video.mp4  # Render a single video
npm run render -- <output-dir>               # Render all videos from output dir
npm run tts -- <script.md> <output.mp3>      # Generate TTS audio only
```

## Contributing

Contributions are welcome! Feel free to open an issue or submit a pull request.

## License

MIT
