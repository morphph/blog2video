# Blog2Video Skill

将英文技术博客自动转化为中文口播视频（小红书/视频号风格）。

## Pipeline Overview

```
Blog URL    → [Step 0: fetch + download images] → source_blog.md + images/ → [Step 0.7: Image Enrichment] → ...
PDF         → [Step 0: pdfminer]                → source_raw.md  → [Step 0.5: PDF Cleaner]         → source_blog.md → ...
YouTube     → [Step 0: yt-dlp + VTT]            → source_raw.md  → [Step 0.5: Transcript Organizer] → source_blog.md → ...
Twitter/X   → [Step 0: Playwright MCP 前置检查 → 抓取全文] → source_raw.md + images/ → [Step 0.5: Twitter Cleaner] → source_blog.md → ...

... → [Insight Memo] → [Script Writer] → [Episode Splitter] → [Slide Planner] → [Slide HTML Generator] → [Render + TTS] → MP4
```

## Subagent Architecture

| Stage | Subagent | 输入 | 输出 |
|-------|----------|------|------|
| 0.5 | PDF Cleaner | `source_raw.md` | `source_blog.md` |
| 0.5 | Transcript Organizer | `source_raw.md` | `source_blog.md` |
| 0.5 | Twitter Cleaner | `source_raw.md` | `source_blog.md` |
| 0.7 | Image Enrichment（orchestrator 直接执行） | `source_blog.md` + `images/` | `source_blog.md`（含描述） |
| 1 | Insight Memo Writer | `source_blog.md` | `insight_memo.md` |
| 2 | Script Writer | `source_blog.md` + `insight_memo.md` | `narration.md` |
| 3 | Episode Splitter | `narration.md` + `insight_memo.md` + `source_blog.md` | `video_plan.json` + `video_N_narration.md` |
| 4 | Slide Planner | `video_N_narration.md` + `video_plan.json` | `video_N_script.md` |
| 5 | Slide HTML Generator | `video_N_script.md` | `slide_N.html` + `manifest.json` |
| 6 | Render (非 subagent) | HTML slides + TTS 音频 | MP4 视频文件 |

**关键设计：先写后拆。** Insight Memo 和 Script Writer 为整篇博客工作（不分集）。Episode Splitter 读完成品叙述稿后再决定是否拆分。这确保叙述质量不被分集决策污染。

## 文件结构

```
.Codex/skills/blog2video/
├── SKILL.md                      ← 你在这里
├── prompts/
│   ├── transcript-organizer.md   ← Stage 0.5 prompt
│   ├── twitter-cleaner.md        ← Stage 0.5 prompt
│   ├── insight-memo-writer.md    ← Stage 1 prompt
│   ├── script-writer.md          ← Stage 2 prompt (输出 narration.md)
│   ├── episode-splitter.md       ← Stage 3 prompt (分集决策 + video_plan.json)
│   ├── slide-planner.md          ← Stage 4 prompt (narration → script with slide markers)
│   └── slide-html-generator.md   ← Stage 5 prompt
├── examples/
│   ├── example-narration-v1.md   ← 参考叙述稿（essay-first，无 slide 标记）
│   ├── example-script-v1.md      ← 参考口播稿（带 slide 标记）
│   ├── example-script-v2.md
│   └── example-script-v3.md
└── design/
    ├── design-system.md          ← 视觉设计规范
    └── slide-types.md            ← Slide 类型定义

blog2video-remotion/              ← 独立 Remotion 项目
├── src/
│   ├── compositions/BlogVideo.tsx
│   └── utils/
├── scripts/
│   ├── render-all.mjs            ← TTS → Puppeteer 截图 → Remotion 渲染
│   ├── tts.mjs                   ← MiniMax TTS + slide map 生成
│   ├── gates.mjs                 ← Pipeline evaluation gates
│   └── fetch-twitter.mjs
└── package.json
```

## Orchestrator 调度逻辑

```
0. 前置检查（Twitter/X URL）：ToolSearch 确认 Playwright MCP 已加载，未加载则停止并要求用户重启 session
1. 读取内容（URL fetch / pdfminer / yt-dlp / Playwright MCP）
1.5. 内容预处理（按输入类型）
1.7. Image Enrichment（orchestrator 直接执行）
2. 调用 Insight Memo Writer subagent → insight_memo.md
3. 调用 Script Writer subagent → narration.md
4. 调用 Episode Splitter subagent → video_plan.json + video_N_narration.md
5. 对每个视频，依次调用：
   a. Slide Planner subagent → video_N_script.md
   b. Gate 1 (Script): 验证 [SLIDE] 标记、品牌植入
   c. Slide HTML Generator subagent → slide_N.html + manifest.json
   d. Gate 2 (Manifest): 验证 slide 数量一致
6. 渲染（render-all.mjs，内含 Gate 3 + Gate 4）
7. 输出所有文件路径
```

## 输出目录

```
blog2video-output/
└── <slug>/
    ├── source_blog.md                ← 原始博客内容
    ├── insight_memo.md               ← 编辑备忘（覆盖全文）
    ├── narration.md                  ← 完整叙述稿（内部产物）
    ├── video_plan.json               ← 视频计划（分集决策）
    ├── video_1_narration.md          ← 视频1叙述稿
    ├── video_1_script.md             ← 视频1口播稿（带 Slide 标记）
    ├── slide_1.html … slide_N.html
    ├── video_1_manifest.json
    ├── video_1_audio.mp3
    ├── video_1_audio_slide_map.json
    ├── video_1.mp4
    └── ...
```

## Slide-Audio Alignment

TTS 生成音频后，`tts.mjs` 输出 `video_N_audio_slide_map.json`，记录每张 slide 的口播文字在合并文本中的字符偏移范围。`render-all.mjs` 利用 MiniMax API 返回的 `text_begin` 偏移量精确对齐。

## Evaluation Gates

| Gate | Stage | 检查项 |
|------|-------|--------|
| Gate 1: Script | Slide Planner 后 | [SLIDE] 标记、品牌植入、字数 |
| Gate 2: Manifest | Slide HTML Generator 后 | slide 数量一致、HTML 文件存在 |
| Gate 3: Alignment | TTS + alignment 后 | 字幕映射完整、时长 > 2s |
| Gate 4: PostRender | Remotion 渲染后 | MP4 大小、封面图 |
