# /blog2video-script — Generate narration script

Generate (or re-generate) the narration script for a blog2video project. Supports both URL input (runs full fetch + memo + script pipeline) and existing output directory input.

## 使用方式
```
/blog2video-script <url-or-output-dir> [video-number]
```

例如：
```
# 从 URL 开始（自动抓取 + memo + 叙述稿 + 分集 + slide plan）
/blog2video-script https://x.com/someone/status/123456

# 从已有目录重新生成叙述稿
/blog2video-script ./blog2video-output/effective-harnesses/
```

## 参数解析

`$ARGUMENTS` 格式：`<url-or-output-dir> [video-number]`
- 如果第一个参数以 `http` 开头 → URL 模式（从头开始）
- 否则 → 目录模式（基于已有数据重新生成）

## 执行步骤

### URL 模式（参数以 http 开头）

#### Step 0: 抓取内容

按输入类型抓取内容（YouTube/PDF/Twitter/博客），保存为 `source_blog.md`。

#### Step 1: Insight Memo Writer

使用 subagent 执行。读取 `.claude/skills/blog2video/prompts/insight-memo-writer.md` 获取 prompt。

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

输出保存为 `./blog2video-output/<slug>/insight_memo.md`。

#### Step 2: Script Writer

使用 subagent 生成叙述稿。

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

{如果有上一版叙述稿，加入以下内容：}
<previous_version>
{上一版 narration.md 的内容}
</previous_version>

请在上一版基础上改进。注意保持好的部分，改进不够好的部分。

请输出完整的叙述稿 Markdown。注意：
- 以 source_blog 为主要写作来源，insight memo 为编辑判断参考
- 使用 ## 标题分段，不要输出 [SLIDE] 标记
- 写到内容自然结束，不要硬凑或硬压字数
```

输出保存为 `./blog2video-output/<slug>/narration.md`。

**🔍 Review Checkpoint：暂停，等待用户确认。**

打印叙述稿摘要（标题、字数、预计时长、段落数）并告知用户：

> 叙述稿已生成：`narration.md`（约 X 字 / ~Y 分钟）。
> 请 review 并提出修改意见。满意后可用 `/blog2video-continue <output-dir>` 继续后续步骤（分集 → slide plan → HTML → 渲染）。

如果用户提出修改意见，使用 Script Writer subagent 修订 narration.md，再次暂停等待确认。
如果用户确认通过，**到此结束，不自动继续后续步骤。**

---

### 目录模式（参数不以 http 开头）

#### Step 1: 读取现有数据

1. 解析 `$ARGUMENTS`，提取 output-dir
2. 读取 `<output-dir>/source_blog.md`，获取博客原文
3. 如果已有 `<output-dir>/insight_memo.md`，读取它
4. 如果已有 `<output-dir>/narration.md`，读取它作为"上一版参考"

#### Step 1.5: Insight Memo Writer（如果 insight_memo.md 不存在）

先生成 insight memo（同 URL 模式 Step 1）。

#### Step 2: Script Writer

（与 URL 模式的 Step 2 相同，包括 Review Checkpoint）

---

## 输出摘要

打印：
- 输出目录路径
- 总字数和预计时长
- 段落数
- 如果有上一版，简述主要改动
