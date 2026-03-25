# Blog2Video Skill

将英文技术博客自动转化为中文口播视频（小红书/视频号风格）。

## Pipeline Overview

```
Blog URL    → [Step 0: fetch + download images] → source_blog.md + images/ → [Step 0.7: Image Enrichment] → [Step 1: Content Analyzer] → ...
PDF         → [Step 0: pdfminer]                → source_raw.md  → [Step 0.5: PDF Cleaner]         → source_blog.md → [Step 1] → ...
YouTube     → [Step 0: yt-dlp + VTT]            → source_raw.md  → [Step 0.5: Transcript Organizer] → source_blog.md → [Step 1] → ...
GitHub repo → [Step 0: git clone]               → repo/           → [Step 0.5: Repo Summarizer]      → source_blog.md → [Step 1] → ...
Twitter/X   → [Step 0: fetch-twitter.mjs]       → source_raw.md + images/ → [Step 0.5: Twitter Cleaner] → source_blog.md → [Step 0.7: Image Enrichment] → [Step 1] → ...

... → [Script Writer] → [Slide HTML Generator] → [Remotion Render + TTS] → MP4
```

## Subagent Architecture

本 pipeline 包含 4 个 preprocessor subagent + 3 个 core subagent + 1 个渲染脚本：

| Stage | Subagent | 输入 | 输出 |
|-------|----------|------|------|
| 0.5 | PDF Cleaner | `source_raw.md`（pdfminer 原始文本） | `source_blog.md`（清洁 Markdown） |
| 0.5 | Transcript Organizer | `source_raw.md`（VTT 纯文本） | `source_blog.md`（结构化 Markdown） |
| 0.5 | Repo Summarizer | cloned repo + `repo_metadata.txt` | `source_blog.md`（3000-5000词博客文章） |
| 0.5 | Twitter Cleaner | `source_raw.md`（Puppeteer 提取文本） | `source_blog.md`（清洁 Markdown） |
| 0.7 | Image Enrichment（orchestrator 直接执行） | `source_blog.md` + `images/` | `source_blog.md`（含 `[IMAGE DESCRIPTION]` 注释） |
| 1 | Content Analyzer | `source_blog.md` | `video_plan.json` |
| 2 | Script Writer | video_plan.json + `source_blog.md` | `video_N_script.md` (每个视频一个) |
| 3 | Slide HTML Generator | video_N_script.md | `slide_N.html` + `cover_photo.html` + `manifest.json` |
| 4 | Render (非 subagent) | HTML slides + manifest.json + TTS 音频 | MP4 视频文件 |

## 文件结构

```
.claude/skills/blog2video/
├── SKILL.md                      ← 你在这里
├── prompts/
│   ├── repo-summarizer.md        ← Stage 0.5 prompt (GitHub repo → 博客文章)
│   ├── pdf-cleaner.md            ← Stage 0.5 prompt (PDF 原始文本 → 清洁 Markdown)
│   ├── transcript-organizer.md   ← Stage 0.5 prompt (YouTube 转录 → 结构化 Markdown)
│   ├── twitter-cleaner.md        ← Stage 0.5 prompt (Twitter/X 文章 → 清洁 Markdown)
│   ├── content-analyzer.md       ← Stage 1 prompt
│   ├── script-writer.md          ← Stage 2 prompt
│   └── slide-html-generator.md   ← Stage 3 prompt (生成自包含 HTML slides)
├── examples/
│   ├── source-blog.md            ← 参考博客原文
│   ├── example-plan.json         ← 参考视频拆分计划
│   ├── example-script-v1.md      ← 参考口播稿（视频1）
│   ├── example-script-v2.md      ← 参考口播稿（视频2）
│   └── example-script-v3.md      ← 参考口播稿（视频3）
└── design/
    ├── design-system.md          ← 视觉设计规范
    └── slide-types.md            ← Slide 类型定义 + React 组件接口

blog2video-remotion/              ← 独立 Remotion 项目
├── src/
│   ├── compositions/BlogVideo.tsx ← 读取 manifest.json + slide PNGs
│   └── utils/                    ← 工具函数
├── scripts/
│   ├── render-all.mjs            ← TTS → Puppeteer 截图 → Remotion 渲染
│   ├── tts.mjs                   ← MiniMax TTS + slide map 生成
│   ├── gates.mjs                 ← Pipeline evaluation gates (script/manifest/alignment/postrender)
│   └── fetch-twitter.mjs         ← Puppeteer 获取 Twitter/X 长文章 + 图片
└── package.json
```

## Orchestrator 调度逻辑

Slash command `/blog2video` 的执行流程：

```
1. 读取内容（URL fetch / pdfminer / yt-dlp / git clone）
1.5. 内容预处理（按输入类型）：PDF → PDF Cleaner / YouTube → Transcript Organizer / GitHub → Repo Summarizer / Twitter/X → Twitter Cleaner / 博客 → 跳过（博客 URL 在 Step 0 中已下载图片）
1.7. Image Enrichment（orchestrator 直接执行）：检查 images/ 目录，对每张图片用 Read 多模态读取并在 source_blog.md 中插入 `[IMAGE DESCRIPTION]` 描述。无图片则跳过
2. 调用 Content Analyzer subagent → 输出 video_plan.json
3. 检查 video_plan.json，确认视频数量
4. 对每个视频，依次调用：
   a. Script Writer subagent → 输出 video_N_script.md
   b. **Gate 1 (Script)**: `node scripts/gates.mjs script <script_path>` — 验证 [SLIDE] 标记、品牌植入、字数
   c. Slide HTML Generator subagent → 输出 slide_N.html + cover_photo.html + manifest.json
   d. **Gate 2 (Manifest)**: `node scripts/gates.mjs manifest <manifest_path> <script_path>` — 验证 slide 数量一致、HTML 文件存在
5. 渲染（render-all.mjs 统一处理，内含 Gate 3 + Gate 4）：
   a. MiniMax TTS → audio + subtitles + **slide_map.json**（text-offset 映射）
   b. Puppeteer 截图 HTML slides → slide_N.png
   c. **Slide timing alignment**：用 slide_map 精确对齐每张 slide 与音频时间轴
   d. **Gate 3 (Alignment)**: 验证每张 slide 有字幕映射、时长 > 2s、时间单调递增
   e. Remotion 渲染 → video_N.mp4
   f. **Gate 4 (PostRender)**: 验证 MP4 大小、封面图存在
6. 输出所有文件路径
```

## 使用方式

```bash
# 在 Claude Code 中
/blog2video https://claude.com/blog/some-article

# 或指定本地文件
/blog2video ./path/to/blog.md
```

## 输出目录

所有输出文件放在 `./blog2video-output/<blog-slug>/`：
```
blog2video-output/
└── <slug>/
    ├── source_blog.md                ← 原始博客内容（清洁 Markdown，LoreAI 导入依赖）
    ├── video_plan.json               ← 视频拆分计划（LoreAI 导入依赖）
    ├── video_1_script.md
    ├── slide_1.html … slide_N.html  ← 每张 slide 的自包含 HTML
    ├── cover_photo.html              ← 封面图 HTML
    ├── video_1_manifest.json         ← slide 清单和时间信息
    ├── video_1_audio.mp3
    ├── video_1_audio_slide_map.json  ← slide 字符偏移映射（用于精确音频对齐）
    ├── video_1.mp4
    ├── video_2_script.md
    ├── video_2_manifest.json
    ├── ...
    └── video_2.mp4
```

## Slide-Audio Alignment

TTS 生成音频后，`tts.mjs` 会输出 `video_N_audio_slide_map.json`，记录每张 slide 的口播文字在合并文本中的字符偏移范围。`render-all.mjs` 利用 MiniMax API 返回的 `text_begin` 偏移量，将每个字幕段落精确映射到对应的 slide，得到真实的 per-slide 音频时间轴。

这替代了之前的等比缩放（proportional scaling）方案，解决了因 TTS 对不同内容语速不同导致的 slide 切换与口播内容错位问题。

**关键文件**：
- `tts.mjs` → `extractTextWithSlideMap()` 生成 slide map
- `render-all.mjs` → `alignSlideTiming()` 用 slide map + raw subtitles 精确对齐
- `gates.mjs` → `gateAlignment()` 验证对齐质量

## Evaluation Gates

Pipeline 在每个阶段后运行 evaluation gate，用于捕获错误、防止渲染损坏的视频：

| Gate | Stage | 触发条件 | 检查项 |
|------|-------|---------|--------|
| Gate 1: Script | Script Writer 后 | orchestrator 调用 | [SLIDE] 标记、品牌植入、字数 |
| Gate 2: Manifest | Slide HTML Generator 后 | orchestrator 调用 | slide 数量一致、HTML 文件存在 |
| Gate 3: Alignment | TTS + alignment 后 | render-all.mjs 内置 | 字幕映射完整、时长 > 2s、单调递增 |
| Gate 4: PostRender | Remotion 渲染后 | render-all.mjs 内置 | MP4 大小、封面图 |

Gate 1-2 由 orchestrator 在 subagent 之间调用（CLI: `node scripts/gates.mjs script|manifest ...`），失败时 retry once。Gate 3-4 内置在 render-all.mjs 中自动运行。

## LoreAI 集成

Pipeline 完成后会提示将外部内容导入 LoreAI 博客。`source_blog.md` 和 `video_plan.json` 是跨系统共享的关键产物。
