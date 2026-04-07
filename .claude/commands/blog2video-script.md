# /blog2video-script — Generate narration script

Generate (or re-generate) the narration script for a blog2video project. Supports both URL input (runs full fetch + analyze + script pipeline) and existing output directory input.

## 使用方式
```
/blog2video-script <url-or-output-dir> [video-number]
```

例如：
```
# 从 URL 开始（自动抓取 + 分析 + 生成脚本）
/blog2video-script https://x.com/someone/status/123456

# 从已有目录重新生成脚本
/blog2video-script ./blog2video-output/effective-harnesses/ 1
```

## 参数解析

`$ARGUMENTS` 格式：`<url-or-output-dir> [video-number]`
- 如果第一个参数以 `http` 开头 → URL 模式（从头开始）
- 否则 → 目录模式（基于已有数据重新生成）
- `video-number`：可选。URL 模式下忽略（生成所有视频脚本），目录模式下默认为 1

## 执行步骤

### URL 模式（参数以 http 开头）

#### Step 0: 抓取内容

按以下顺序检测输入类型并抓取内容：

**a) YouTube 视频**（URL 包含 `youtube.com` 或 `youtu.be`）：
- 获取视频标题作为 slug：`yt-dlp --print title "<url>"` → 转为 kebab-case slug
- 创建输出目录：`./blog2video-output/<slug>/`
- 下载英文字幕：`yt-dlp --write-auto-sub --sub-lang en --skip-download -o "./blog2video-output/<slug>/transcript" "<url>"`
- 解析 `.vtt` 提取纯文本，保存为 `source_raw.md`
- 使用 Transcript Organizer subagent 整理为 `source_blog.md`

**b) PDF 文件**（URL 以 `.pdf` 结尾）：
- 下载 PDF，使用 pdfminer 提取文本
- 保存为 `source_raw.md`，清洗后保存为 `source_blog.md`

**c) Twitter/X**（URL 包含 `x.com` 或 `twitter.com`）：
- 用 fxtwitter API 获取文章内容：`curl -sL "https://api.fxtwitter.com/<user>/status/<id>"`
- 解析 JSON 中的 article blocks 为 Markdown
- 下载封面图到 `images/` 目录
- 保存为 `source_raw.md`
- 使用 Twitter Cleaner subagent 清洗为 `source_blog.md`（如果内容已干净可跳过）

**d) 博客 URL**（其他 http 链接）：
- `curl -sL` 获取 HTML，转为干净 Markdown
- 保存为 `source_blog.md`

验证 `source_blog.md` 已生成且非空。

#### Step 1: Content Analyzer

使用 subagent 执行。读取 `.claude/skills/blog2video/prompts/content-analyzer.md` 获取 prompt。
读取 `.claude/skills/blog2video/examples/example-plan.json` 作为 few-shot 参考。

输出保存为 `./blog2video-output/<slug>/video_plan.json`。

#### Step 1.5: Insight Memo Writer

对 video_plan 中的每个视频，分别使用 subagent 生成 insight memo。

读取 `.claude/skills/blog2video/prompts/insight-memo-writer.md` 获取 prompt。

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

输出保存为 `./blog2video-output/<slug>/video_N_insight_memo.md`。

#### Step 2: Script Writer

对 video_plan 中的每个视频，分别使用 subagent 生成叙述稿（见下方 subagent 指令）。

输出保存为 `./blog2video-output/<slug>/video_N_narration.md`。

#### Step 2.5: Slide Planner

对每个视频的叙述稿，使用 subagent 生成带 Slide 标记的口播稿。

读取 `.claude/skills/blog2video/prompts/slide-planner.md` 获取 prompt。

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

输出保存为 `./blog2video-output/<slug>/video_N_script.md`。

完成后打印摘要并结束（不继续 slides/render）。

---

### 目录模式（参数不以 http 开头）

#### Step 1: 读取现有数据

1. 解析 `$ARGUMENTS`，提取 output-dir 和 video-number（默认 1）
2. 读取 `<output-dir>/video_plan.json`，提取对应视频的 plan
3. 读取 `<output-dir>/source_blog.md`，获取博客原文
4. 如果已有 `<output-dir>/video_<N>_insight_memo.md`，读取它
5. 如果已有 `<output-dir>/video_<N>_narration.md`，读取它作为"上一版参考"

#### Step 1.5: Insight Memo Writer（如果 insight memo 不存在）

如果 `video_N_insight_memo.md` 不存在，先生成它（同 URL 模式 Step 1.5）。

#### Step 2: 调用 Script Writer subagent

（与 URL 模式的 Step 2 相同）

#### Step 2.5: 调用 Slide Planner subagent

（与 URL 模式的 Step 2.5 相同）

---

## Script Writer Subagent 指令

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

{如果有上一版叙述稿，加入以下内容：}
<previous_version>
{上一版 video_N_narration.md 的内容}
</previous_version>

请在上一版基础上改进。注意保持好的部分，改进不够好的部分。

请输出完整的叙述稿 Markdown。注意：
- 以 source_blog 为主要写作来源，insight memo 为编辑判断参考
- 目标时长 {estimated_duration_minutes} 分钟 → 约 {minutes * 200} 字
- 使用 ## 标题分段，不要输出 [SLIDE] 标记
- 生成后检查字数是否在目标范围 ±15% 内
```

## Step 3: 保存并输出摘要

将叙述稿保存为 `<output-dir>/video_<N>_narration.md`。
将口播稿保存为 `<output-dir>/video_<N>_script.md`（覆盖旧版本）。

打印摘要：
- 输出目录路径
- 总字数
- Slide 数量和类型
- 预计时长
- 如果有上一版，简述主要改动
