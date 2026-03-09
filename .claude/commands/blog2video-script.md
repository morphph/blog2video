# /blog2video-script — Re-generate narration script

Re-generate or iterate on the narration script for a specific video.

## 使用方式
```
/blog2video-script <output-dir> [video-number]
```

例如：
```
/blog2video-script ./blog2video-output/effective-harnesses-for-long-running-agents/ 1
```

## 参数解析

`$ARGUMENTS` 格式：`<output-dir> [video-number]`
- `output-dir`：blog2video-output 下的输出目录路径
- `video-number`：可选，默认为 1

## 执行步骤

### Step 1: 读取现有数据

1. 解析 `$ARGUMENTS`，提取 output-dir 和 video-number（默认 1）
2. 读取 `<output-dir>/video_plan.json`，提取对应视频的 plan
3. 读取 `<output-dir>/source_blog.md`，获取博客原文
4. 如果已有 `<output-dir>/video_<N>_script.md`，读取它作为"上一版参考"

### Step 2: 调用 Script Writer subagent

读取 `.claude/skills/blog2video/prompts/script-writer.md` 获取完整 prompt。
读取 `.claude/skills/blog2video/examples/example-script-v1.md` 作为 few-shot 参考。

对 subagent 的指令：
```
你是 Script Writer。请阅读以下prompt规范和参考示例，然后为视频 N 生成口播稿。

<prompt_spec>
{script-writer.md 的内容}
</prompt_spec>

<few_shot_example>
{example-script-v1.md 的内容}
</few_shot_example>

<video_plan>
{video_plan.json 中这个视频的部分}
</video_plan>

<blog_content>
{博客原文}
</blog_content>

{如果有上一版脚本，加入以下内容：}
<previous_version>
{上一版 video_N_script.md 的内容}
</previous_version>

请在上一版基础上改进。注意保持好的部分，改进不够好的部分。

请输出完整的口播稿 Markdown。注意：
- 目标时长 {estimated_duration_minutes} 分钟 → 约 {minutes * 200} 字
- 必须包含 [SLIDE N: type] 标记
- 生成后检查字数是否在目标范围 ±15% 内
```

### Step 3: 保存并对比

将输出保存为 `<output-dir>/video_<N>_script.md`（覆盖旧版本）。

打印摘要：
- 总字数
- Slide 数量和类型
- 预计时长
- 如果有上一版，简述主要改动
