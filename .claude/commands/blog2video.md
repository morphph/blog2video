# /blog2video — Blog to Video Pipeline

将英文技术内容（博客、PDF文档、YouTube视频）自动转化为中文口播视频（小红书/视频号风格）。

## 使用方式
```
/blog2video <url-or-file>
```

支持的输入格式：
- **博客 URL** — `https://example.com/blog-post`
- **PDF** — 远程 URL（`https://.../*.pdf`）或本地路径（`./paper.pdf`）
- **YouTube 视频** — `https://www.youtube.com/watch?v=...` 或 `https://youtu.be/...`
- **本地文件** — 任意文本文件路径

## 执行步骤

请按照以下步骤严格执行。每个 Stage 使用独立的 subagent 完成。

### Step 0: 准备工作

1. 读取输入参数 `$ARGUMENTS`，按以下顺序检测输入类型：

   **a) YouTube 视频**（参数包含 `youtube.com` 或 `youtu.be`）：
   - 获取视频标题作为 slug：`yt-dlp --print title "<url>"` → 转为 kebab-case slug
   - 创建输出目录：`./blog2video-output/<slug>/`
   - 下载英文字幕（VTT格式，不需要 ffmpeg）：`yt-dlp --write-auto-sub --sub-lang en --skip-download -o "./blog2video-output/<slug>/transcript" "<url>"`
   - 解析 `.vtt` 文件提取纯文本：用 Python 去掉 WEBVTT 头部、时间戳行、`<c>`/`<00:...>` 标签、重复行，只保留唯一的文字内容
   - 将提取的文本保存为 `./blog2video-output/<slug>/source_blog.md`

   **b) PDF 文件**（参数以 `.pdf` 结尾，不区分大小写）：
   - 如果是远程 URL（以 `http` 开头）：下载文件 `curl -sL "<url>" -o "./blog2video-output/source.pdf"`
   - 从文件名提取 slug
   - 创建输出目录：`./blog2video-output/<slug>/`
   - 使用 pdfminer 提取文本，保存为 `./blog2video-output/<slug>/source_blog.md`

   **c) 博客 URL**（参数以 `http` 开头，非 PDF）：
   - 使用 `curl` 或 `fetch` 获取博客内容
   - 从 URL 提取 slug
   - 创建输出目录：`./blog2video-output/<slug>/`
   - 将博客原文保存为 `./blog2video-output/<slug>/source_blog.md`
   - **图片下载**：扫描远程图片引用，下载到 `images/` 目录，替换 URL

   **d) 本地文件**（其他情况）：
   - 读取文件内容，从文件名提取 slug
   - 创建输出目录，保存为 `source_blog.md`

2. 验证 `source_blog.md` 已生成且非空，否则报错退出

### Step 0.7: Image Enrichment（图片分析）

**由 orchestrator 直接执行，不使用 subagent。** 仅在 `<output-dir>/images/` 目录存在且包含图片文件时执行，否则跳过。

对每张图片（上限 15 张）：用 Read 工具多模态读取，判断类型（diagram/photo/decorative），在 source_blog.md 中插入 `<!-- [IMAGE DESCRIPTION] ... -->` 描述。

### Step 1: Insight Memo Writer（编辑备忘）

**使用 subagent 执行。一次调用，覆盖整篇博客。**

读取 `.claude/skills/blog2video/prompts/insight-memo-writer.md` 获取完整 prompt。

对 subagent 的指令：
```
你是 Insight Memo Writer。请阅读以下prompt规范，然后为这篇博客生成 insight memo。

<prompt_spec>
{insight-memo-writer.md 的内容}
</prompt_spec>

<blog_content>
{博客原文}
</blog_content>

请输出结构化的 insight memo（Markdown 格式）。
```

将输出保存为 `./blog2video-output/<slug>/insight_memo.md`。

### Step 2: Script Writer（叙述稿生成）

**使用 subagent 执行。一次调用，为整篇博客写一篇完整叙述稿。**

读取 `.claude/skills/blog2video/prompts/script-writer.md` 获取完整 prompt。
读取 `.claude/skills/blog2video/examples/example-narration-v1.md` 作为 few-shot 参考。

对 subagent 的指令：
```
你是 Script Writer。请阅读以下prompt规范和参考示例，然后为这篇博客生成叙述稿。

<prompt_spec>
{script-writer.md 的内容}
</prompt_spec>

<few_shot_example>
{example-narration-v1.md 的内容}
</few_shot_example>

<blog_content>
{博客原文（主要写作来源）}
</blog_content>

<insight_memo>
{insight_memo.md 的内容}
</insight_memo>

请输出完整的叙述稿 Markdown。注意：
- 以 source_blog 为主要写作来源，insight memo 为编辑判断参考
- 使用 ## 标题分段，不要输出 [SLIDE] 标记
- 写到内容自然结束，不要硬凑或硬压字数
```

将输出保存为 `./blog2video-output/<slug>/narration.md`。

**🔍 Review Checkpoint：暂停，等待用户确认。**

打印叙述稿摘要（标题、字数、预计时长、段落数）并告知用户：

> 叙述稿已生成：`narration.md`（约 X 字 / ~Y 分钟）。
> 请 review 并提出修改意见。确认后我会自动完成后续所有步骤（分集 → slide → HTML → 渲染）。

如果用户提出修改意见，使用 Script Writer subagent 修订 narration.md，再次暂停等待确认。
如果用户确认通过，继续执行后续步骤。

### Step 3: Episode Splitter（分集决策）

**使用 subagent 执行。**

读取 `.claude/skills/blog2video/prompts/episode-splitter.md` 获取完整 prompt。

对 subagent 的指令：
```
你是 Episode Splitter。请阅读以下prompt规范，然后决定这篇叙述稿是否需要分集。

<prompt_spec>
{episode-splitter.md 的内容}
</prompt_spec>

<narration>
{narration.md 的内容}
</narration>

<insight_memo>
{insight_memo.md 的内容}
</insight_memo>

<source_blog>
{source_blog.md 的内容}
</source_blog>

<slug>
{当前输出目录的 slug 名}
</slug>

请输出：
1. video_plan.json（纯 JSON）
2. video_1_narration.md（如果不拆，内容与 narration.md 一致）
3. 如需拆分，输出 video_2_narration.md 等

所有文件写入 ./blog2video-output/<slug>/ 目录。
```

验证 video_plan.json 格式有效，打印视频计划摘要。

### Step 4: Slide Planner（Slide 分段）

**对每个视频的叙述稿，使用 subagent 执行。**

读取 `.claude/skills/blog2video/prompts/slide-planner.md` 获取完整 prompt。

对每个视频的 subagent 指令：
```
你是 Slide Planner。请阅读以下prompt规范，然后为视频 N 的叙述稿生成带 Slide 标记的口播稿。

<prompt_spec>
{slide-planner.md 的内容}
</prompt_spec>

<narration>
{video_N_narration.md 的内容}
</narration>

<video_plan>
{video_plan.json 中这个视频的部分}
</video_plan>

<insight_memo>
{insight_memo.md 的内容}
</insight_memo>

请输出带 [SLIDE N: type] (start_time - end_time) 标记的口播稿。
注意：不要改写叙述稿的任何文字，只做分段和标注。
```

将输出保存为 `./blog2video-output/<slug>/video_N_script.md`。

**Gate 1 (Script)**: `node blog2video-remotion/scripts/gates.mjs script <script_path>` — 验证 [SLIDE] 标记、品牌植入、字数。如果失败，让 Slide Planner subagent 重试一次。

### Step 5: Slide HTML Generator（Slide 视觉生成）

**对每个视频的口播稿，使用 subagent 执行。**

读取 `.claude/skills/blog2video/prompts/slide-html-generator.md` 获取完整 prompt。

subagent 输出：
- `./blog2video-output/<slug>/slide_N.html` — 每张 slide 的自包含 HTML
- `./blog2video-output/<slug>/manifest.json` — slide 清单和时间信息

**Gate 2 (Manifest)**: 验证 slide 数量一致、HTML 文件存在。

### Step 6: 渲染视频

```bash
cd blog2video-remotion && npm install 2>/dev/null
node scripts/render-all.mjs ../blog2video-output/<slug>/
```

### Step 7: 输出汇总

打印所有生成的文件：
```
📁 blog2video-output/<slug>/
├── source_blog.md           ← 原始博客内容
├── insight_memo.md          ← 编辑备忘
├── narration.md             ← 完整叙述稿（内部产物）
├── video_plan.json          ← 视频计划
├── video_1_narration.md     ← 视频1叙述稿
├── video_1_script.md        ← 视频1口播稿（带 Slide 标记）
├── slide_1.html … slide_N.html
├── video_1_audio.mp3
├── video_1.mp4
└── ...
```

### Step 8: LoreAI 博客导入提示

如果视频源是外部内容，打印导入命令。

## 注意事项

- 每个 subagent 都是独立的，不要在 subagent 之间共享上下文
- 如果某个 Stage 失败，先输出已完成的文件，再报告错误
- 叙述稿质量是最重要的——检查是否跟随原文 macro-order、是否保留了丰富细节、是否有口语化的讲述节奏
- source_blog.md 是跨系统共享的关键产物 — LoreAI 博客导入依赖此文件
