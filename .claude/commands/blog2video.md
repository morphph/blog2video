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
   - 从文件名提取 slug（如 `The-Complete-Guide-to-Building-Skill-for-Claude.pdf` → `building-skill-for-claude`）
   - 创建输出目录：`./blog2video-output/<slug>/`
   - 如果是远程 PDF，将下载的文件移动到输出目录：`mv ./blog2video-output/source.pdf ./blog2video-output/<slug>/source.pdf`
   - 使用 pdfminer 提取文本：`python3 -c "from pdfminer.high_level import extract_text; print(extract_text('<pdf-path>'))"`
   - 将提取的文本保存为 `./blog2video-output/<slug>/source_blog.md`

   **c) 博客 URL**（参数以 `http` 开头，非 PDF）：
   - 使用 `curl` 或 `fetch` 获取博客内容（现有行为）
   - 从 URL 提取 slug
   - 创建输出目录：`./blog2video-output/<slug>/`
   - 将博客原文保存为 `./blog2video-output/<slug>/source_blog.md`
   - **图片下载**：保存 `source_blog.md` 之后，扫描其中的远程图片引用（`![...](https://...)`），下载到本地：
     1. 找出所有匹配 `![...](https://...)` 的图片 URL（跳过 `.svg` 后缀）
     2. 创建 `./blog2video-output/<slug>/images/` 目录
     3. 用 `curl -sL` 逐个下载，保存为 `images/image_1.jpg`, `image_2.jpg`, ...
     4. 下载后检查文件大小，删除小于 5KB 的文件（通常是 icon/badge）
     5. 将 `source_blog.md` 中对应的远程 URL 替换为本地路径 `images/image_N.jpg`
     6. 如果没有找到任何远程图片引用，跳过此步骤

   **d) 本地文件**（其他情况）：
   - 读取文件内容（现有行为）
   - 从文件名提取 slug
   - 创建输出目录：`./blog2video-output/<slug>/`
   - 将内容保存为 `./blog2video-output/<slug>/source_blog.md`

2. 验证 `source_blog.md` 已生成且非空，否则报错退出

### Step 0.7: Image Enrichment（图片分析）

**由 orchestrator 直接执行，不使用 subagent。** 仅在 `<output-dir>/images/` 目录存在且包含图片文件时执行，否则跳过。

对每张图片（上限 15 张）：

1. 用 Read 工具读取图片文件（多模态读取）
2. 在 `source_blog.md` 中找到对应的 `![...](images/image_N.jpg)` 引用及其上下文
3. 判断图片类型：
   - `diagram`（架构图、流程图、对比表、示意图）→ 详细描述，捕捉标签、数据、布局结构、箭头方向等视觉信息
   - `photo`（照片、产品截图、实物图）→ 简要描述主要内容
   - `decorative`（装饰性图片、logo、纯色背景）→ 跳过，不添加描述
4. 在图片引用的下一行插入描述（使用 Edit 工具）：
   ```
   <!-- [IMAGE DESCRIPTION] 2-4句描述，50-150词，捕捉标签、数据、布局结构等视觉信息 [/IMAGE DESCRIPTION] -->
   ```

描述写作要求：
- 50-150 词（英文）或等量中文
- 重点捕捉：标签文字、数据数值、箭头/流程方向、对比项、层级结构
- 使用客观描述，不做主观评价
- 结合 `source_blog.md` 中图片周围的文字上下文来理解图片含义

### Step 1: Content Analyzer（内容分析）

**使用 subagent 执行。**

读取 `.claude/skills/blog2video/prompts/content-analyzer.md` 获取完整 prompt。
读取 `.claude/skills/blog2video/examples/example-plan.json` 作为 few-shot 参考。

对 subagent 的指令：
```
你是 Content Analyzer。请阅读以下prompt规范和参考示例，然后分析给定的博客内容。

<prompt_spec>
{content-analyzer.md 的内容}
</prompt_spec>

<few_shot_example>
{example-plan.json 的内容}
</few_shot_example>

<blog_content>
{博客原文}
</blog_content>

请输出 video_plan.json（纯 JSON，无 markdown 包装）。
```

将 subagent 输出保存为 `./blog2video-output/<slug>/video_plan.json`。

验证 JSON 格式有效，打印视频计划摘要：
- 总视频数
- 每个视频的标题和预计时长

### Step 1.5: Insight Memo Writer（编辑备忘）

**对 video_plan 中的每个视频，分别使用 subagent 执行。**

读取 `.claude/skills/blog2video/prompts/insight-memo-writer.md` 获取完整 prompt。

对每个视频的 subagent 指令：
```
你是 Insight Memo Writer。请阅读以下prompt规范，然后为视频 N 生成 insight memo。

<prompt_spec>
{insight-memo-writer.md 的内容}
</prompt_spec>

<video_plan_entry>
{video_plan.json 中这个视频的条目}
</video_plan_entry>

<blog_content>
{博客原文}
</blog_content>

请输出结构化的 insight memo（Markdown 格式）。
```

将输出保存为 `./blog2video-output/<slug>/video_N_insight_memo.md`。

### Step 2: Script Writer（叙述稿生成）

**对 video_plan 中的每个视频，分别使用 subagent 执行。**

读取 `.claude/skills/blog2video/prompts/script-writer.md` 获取完整 prompt。
读取 `.claude/skills/blog2video/examples/example-narration-v1.md` 作为 few-shot 参考。

对每个视频的 subagent 指令：
```
你是 Script Writer。请阅读以下prompt规范和参考示例，然后为视频 N 生成叙述稿。

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
{video_N_insight_memo.md 的内容}
</insight_memo>

<video_plan>
{video_plan.json 中这个视频的部分}
</video_plan>

请输出完整的叙述稿 Markdown。注意：
- 以 source_blog 为主要写作来源，insight memo 为编辑判断参考
- 目标时长 {estimated_duration_minutes} 分钟 → 约 {minutes * 200} 字
- 使用 ## 标题分段，不要输出 [SLIDE] 标记
- 生成后检查字数是否在目标范围 ±15% 内
```

将输出保存为 `./blog2video-output/<slug>/video_N_narration.md`。

### Step 2.5: Slide Planner（Slide 分段）

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
{video_N_insight_memo.md 的内容}
</insight_memo>

请输出带 [SLIDE N: type] (start_time - end_time) 标记的口播稿。
注意：不要改写叙述稿的任何文字，只做分段和标注。
```

将输出保存为 `./blog2video-output/<slug>/video_N_script.md`。

**Gate 1 (Script)**: `node blog2video-remotion/scripts/gates.mjs script <script_path>` — 验证 [SLIDE] 标记、品牌植入、字数。如果失败，让 Slide Planner subagent 重试一次。

### Step 3: Slide HTML Generator（Slide 视觉生成）

**对每个视频的口播稿，使用 subagent 执行。**

读取 `.claude/skills/blog2video/prompts/slide-html-generator.md` 获取完整 prompt。

对每个视频的 subagent 指令：
```
你是 Slide HTML Generator。请阅读以下prompt规范，然后为视频 N 的口播稿生成自包含 HTML slides 和 manifest.json。

<prompt_spec>
{slide-html-generator.md 的内容}
</prompt_spec>

<script>
{video_N_script.md 的内容}
</script>

请为每个 [SLIDE N: type] 生成一个 slide_N.html 文件（自包含 HTML，1080×1920 暗黑风格），以及一个 manifest.json。
所有文件写入 ./blog2video-output/<slug>/ 目录。
```

subagent 输出：
- `./blog2video-output/<slug>/slide_N.html` — 每张 slide 的自包含 HTML
- `./blog2video-output/<slug>/manifest.json` — slide 清单和时间信息

**Gate 2 (Manifest)**: `node blog2video-remotion/scripts/gates.mjs manifest <manifest_path> <script_path>` — 验证 slide 数量一致、HTML 文件存在。

### Step 4: 渲染视频

执行以下 shell 命令：

```bash
# 确保 edge-tts 已安装
pip install edge-tts 2>/dev/null || true

# 确保 Remotion 依赖已安装
cd blog2video-remotion && npm install 2>/dev/null

# 渲染所有视频
node scripts/render-all.mjs ../blog2video-output/<slug>/
```

如果 Remotion 渲染失败（例如环境缺少 Chrome），则至少完成 TTS 步骤：

```bash
# 对每个视频单独生成 TTS
for script in ./blog2video-output/<slug>/video_*_script.md; do
  num=$(echo "$script" | grep -o 'video_[0-9]*' | grep -o '[0-9]*')
  edge-tts --voice "zh-CN-YunxiNeural" --file "$script" \
    --write-media "./blog2video-output/<slug>/video_${num}_audio.mp3"
done
```

### Step 5: 输出汇总

打印所有生成的文件：
```
📁 blog2video-output/<slug>/
├── source_blog.md           ← 原始博客内容（清洁 Markdown）
├── video_plan.json          ← 视频拆分计划
├── video_1_insight_memo.md  ← 视频1编辑备忘
├── video_1_narration.md     ← 视频1叙述稿（内部产物）
├── video_1_script.md        ← 视频1口播稿（带 Slide 标记）
├── slide_1.html … slide_N.html  ← Slide HTML 文件
├── manifest.json            ← Slide 清单和时间
├── video_1_audio.mp3        ← 视频1配音
├── video_1.mp4              ← 视频1最终文件
└── ...
```

### Step 6: LoreAI 博客导入提示

如果视频源是外部内容（非 LoreAI 自己的博客），在输出汇总之后打印以下提示：

```
💡 Import to LoreAI blog:
   cd ../loreai-v2 && npx tsx scripts/import-video-blog.ts --dir=../blog2video/blog2video-output/<slug>
```

此命令会基于 source_blog.md 和 video_plan.json 在 LoreAI 上生成对应的 EN + ZH 博客文章，并自动关联视频。

## 注意事项

- 每个 subagent 都是独立的，不要在 subagent 之间共享上下文
- 如果某个 Stage 失败，先输出已完成的文件，再报告错误
- video_plan.json、narration.md 和 script.md 是核心产出（即使渲染失败也有价值）
- 叙述稿质量是最重要的——检查是否跟随原文 macro-order、是否保留了丰富细节
- source_blog.md 是跨系统共享的关键产物 — LoreAI 博客导入依赖此文件
