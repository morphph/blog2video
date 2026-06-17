# Blog2Video Skill

将英文技术博客自动转化为中文口播视频（小红书/视频号风格）。

## Pipeline Overview

```
Blog URL    → [Step 0: fetch + download images] → source_blog.md + images/ → [Step 0.7: Image Enrichment] → ...
PDF         → [Step 0: pdfminer]                → source_raw.md  → [Step 0.5: PDF Cleaner]         → source_blog.md → ...
YouTube     → [Step 0: yt-dlp + VTT]            → source_raw.md  → [Step 0.5: Transcript Organizer] → source_blog.md → ...
Twitter/X   → [Step 0: Playwright MCP 前置检查 → 抓取全文] → source_raw.md + images/ → [Step 0.5: Twitter Cleaner] → source_blog.md → ...

... → [Insight Memo] → [Script Writer] → [Episode Splitter] → [Slide Planner] → [Slide HTML Generator (内容蓝本)]
    → [TTS] → [build-scenes-data] → [d2 Scene Generator ×N] → [render-d2: 逐场景渲+concat+混音] → MP4
```

> **视觉引擎(2026-06 起)= d2「终端霓影」**:每页 = 一个自包含、带时间轴+烧字幕的 d2 场景,
> 逐场景 `hyperframes render` → concat → 混音。旧的 Remotion 截图链路(`blog2video-remotion/`)保留为 **fallback**。

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
| 5 | Slide HTML Generator | `video_N_script.md` | `slide_N.html`(d2 内容蓝本 + Remotion fallback 截图源) + `cover_photo.html`(**d2 终端霓影风**) + `manifest.json` |
| 5.3 | TTS（非 subagent，`tts.mjs`） | `video_N_script.md` | `video_N_audio.mp3` + `_subtitles.json` + `_minimax_raw_subtitles.json` + `_slide_map.json` |
| 5.5 | build-scenes-data（非 subagent，`scripts/build-scenes-data.mjs`） | slide_map + raw_subtitles + subtitles | `scenes-data.json` + `briefs/scene-NN.json`（帧吸附时间轴） |
| 5.7 | **d2 Scene Generator ×N**（`prompts/scene-generator.md`，每场景一个 subagent） | `briefs/scene-NN.json` + `slide_N.html` + kit | `src/scene-NN.html` → `scenes/scene-NN/index.html`（自包含 d2 场景） |
| 6 | d2 Render（非 subagent，`scripts/render-d2.sh`） | `scenes/` + `scenes-data.json` + `video_N_audio.mp3` | 逐场景 clip → concat → 混音 → `video_N.mp4`（Remotion fallback：`render-image-video.mjs`） |

**关键设计：先写后拆。** Insight Memo 和 Script Writer 为整篇博客工作（不分集）。Episode Splitter 读完成品叙述稿后再决定是否拆分。这确保叙述质量不被分集决策污染。

## 文件结构

```
.claude/skills/blog2video/
├── SKILL.md                      ← 你在这里
├── prompts/
│   ├── transcript-organizer.md   ← Stage 0.5 prompt
│   ├── twitter-cleaner.md        ← Stage 0.5 prompt
│   ├── insight-memo-writer.md    ← Stage 1 prompt
│   ├── script-writer.md          ← Stage 2 prompt (输出 narration.md)
│   ├── episode-splitter.md       ← Stage 3 prompt (分集决策 + video_plan.json)
│   ├── slide-planner.md          ← Stage 4 prompt (narration → script with slide markers)
│   ├── slide-html-generator.md   ← Stage 5 prompt（d2 内容蓝本 + Remotion fallback）
│   └── scene-generator.md        ← Stage 5.7 prompt（d2 单场景生成器，子 agent 作业书）
├── scripts/
│   ├── build-scenes-data.mjs     ← Stage 5.5：slide_map+raw_subtitles → 帧吸附时间轴 scenes-data.json + briefs/
│   ├── build-scene.mjs           ← scaffold + 内联打包 src/scene-NN.html → scenes/scene-NN/index.html
│   ├── render-d2.sh              ← Stage 6：逐场景 hyperframes render → concat → 混音 → video_N.mp4(末尾自动截封面)
│   └── shoot-cover.mjs           ← Stage 6.5：puppeteer 截 cover_photo.html → video_N_cover_photo.png(兜底 assets symlink)
├── examples/
│   ├── example-narration-v1.md   ← 参考叙述稿（essay-first，无 slide 标记）
│   ├── example-script-v1.md      ← 参考口播稿（带 slide 标记）
│   ├── example-script-v2.md
│   └── example-script-v3.md
└── design/
    ├── design-system.md          ← 视觉设计规范（旧暗色版 / Remotion fallback）
    ├── slide-types.md            ← Slide 类型定义
    └── d2-kit/                   ← d2「终端霓影」组件库（随 skill 走）
        ├── d2-base.css           ← d2 令牌 + 全部组件类
        ├── d2-motion.js          ← D2 GSAP 助手 + buildSceneTimeline
        ├── components.md         ← 组件速查 + 类型范式（给生成器看）
        ├── DESIGN.md             ← 设计令牌权威
        ├── assets/fonts/         ← MiSans + JetBrains Mono（gitignored，本地）
        └── samples/scene-NN.html ← 7 类黄金范本 few-shot（01/02/05/07/16/17/24）

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
3.5. ⚠️ **强制 Script Review 检查点** ⚠️
     - 把 narration.md 的 Hook 段完整展示给用户
     - 显式询问："Hook 是否通过？通过后继续生成视频；否则告诉我要怎么改"
     - 在用户明确确认前，绝不进入 Stage 4 / Slide Planner
     - 用户可能要求重写 Hook、改正文论点、调整结构——按要求迭代 narration.md 直至获得确认
4. 调用 Episode Splitter subagent → video_plan.json + video_N_narration.md
5. 对每个视频，依次调用（**d2 path，正式投产**）：
   a. Slide Planner subagent → video_N_script.md
   b. Gate 1 (Script): 验证 [SLIDE] 标记、品牌植入
   c. Slide HTML Generator subagent → slide_N.html（d2 内容蓝本）+ cover_photo.html + manifest.json
   d. Gate 2 (Manifest): 验证 slide 数量一致
   e. **TTS**：`npm run tts -- <OUT>/video_N_script.md <OUT>/video_N_audio.mp3`
      → audio + _subtitles.json + _minimax_raw_subtitles.json + _slide_map.json
   f. Gate 3 (Alignment): 字幕映射完整、时长 > 2s
   g. **build-scenes-data**：`node .claude/skills/blog2video/scripts/build-scenes-data.mjs <OUT> N`
      → scenes-data.json + briefs/scene-NN.json（帧吸附,修音视频漂移）
   h. **d2 Scene Generator ×N**：对每个场景派一个 `scene-generator.md` 子 agent（可并行小批，
      每个产出 `src/scene-NN.html` → `build-scene.mjs` → `scenes/scene-NN/index.html`，自检 lint 0 error + 快照目检）
      · cover(场景1) / summary(末张) / cta(尾卡) 类型由 build-scenes-data 结构默认;
        principle/comparison_cards/quote/checklist 等语义类型由编排者读 slide 内容后写进 brief.type 再派活
6. **渲染（render-d2.sh）**：`.claude/skills/blog2video/scripts/render-d2.sh <OUT> N`
   → 逐场景 hyperframes render（串行，OOM 防护）→ concat 静音整片 → 混入 raw 音频（不响度处理/不 -shortest）
   → video_N.mp4 + Gate 4 (PostRender) 核验
   · **封面（脚本末尾自动）**：render-d2.sh 收尾会调 `shoot-cover.mjs` 把 stage-5 的 d2 `cover_photo.html`
     截成交付封面 `video_N_cover_photo.png`（1080×1920，非致命；assets symlink 由它兜底）。
     单独补截：`node .claude/skills/blog2video/scripts/shoot-cover.mjs <OUT> N`
   · **Remotion fallback**：若 d2 不可用，走 `blog2video-remotion/scripts/render-image-video.mjs`（截图 slide_N.html）
7. 输出所有文件路径
```

**为什么 Step 3.5 必须存在**：Hook 是观众"为什么不划走"的唯一理由。Stage 3 之后的所有产物（slide、TTS 音频、最终视频）都假定 Hook 已经确定，修改 Hook 等于全部重做。把 Hook review 前置到生成视频之前，节省 2-3 小时返工。

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
    ├── slide_1.html … slide_N.html   ← d2 内容蓝本 + Remotion fallback 截图源
    ├── cover_photo.html
    ├── video_1_manifest.json
    ├── video_1_audio.mp3
    ├── video_1_audio_slide_map.json / _subtitles.json / _minimax_raw_subtitles.json
    │   ── 以下是 d2 path 工作区（同一输出目录内）──
    ├── scenes-data.json              ← 帧吸附时间轴（build-scenes-data.mjs）
    ├── briefs/scene-NN.json          ← 每场景生成器输入
    ├── src/scene-NN.html             ← d2 场景授权源（scene-generator 写，含 marker）
    ├── scenes/scene-NN/index.html    ← 自包含 d2 场景（build-scene.mjs；assets symlink gitignored）
    ├── clips/scene-NN.mp4            ← 逐场景静音 clip（*.mp4 gitignored，不投递）
    ├── renders/<slug>-silent.mp4     ← concat 静音整片（不投递）
    ├── video_1.mp4                   ← ★最终交付片（混音后）
    ├── video_1_cover_photo.png       ← ★交付封面（shoot-cover.mjs 截 cover_photo.html;投递的唯一 PNG）
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
