# /blog2video-slides — Re-generate slide data（Remotion fallback 专用）

Re-generate Remotion slide data JSON（`video_N_config.json`）from an existing narration script.

> ⚠️ **此命令属于 Remotion fallback 链路。** 主链路 d2「终端霓影」不用 `video_N_config.json`——
> d2 的等价「重生成 slide 数据」是 `build-scenes-data.mjs`（帧吸附时间轴 + briefs/）+ `prompts/scene-generator.md`（逐场景重排）。
> 只有在走 Remotion fallback 渲染时才需要本命令。d2 重渲见 `/blog2video-render`（主链路块）与 SKILL.md d2 path。

## 使用方式
```
/blog2video-slides <output-dir> [video-number]
```

例如：
```
/blog2video-slides ./blog2video-output/effective-harnesses-for-long-running-agents/ 1
```

## 参数解析

`$ARGUMENTS` 格式：`<output-dir> [video-number]`
- `output-dir`：blog2video-output 下的输出目录路径
- `video-number`：可选，默认为 1

## 执行步骤

### Step 1: 读取现有数据

1. 解析 `$ARGUMENTS`，提取 output-dir 和 video-number（默认 1）
2. 读取 `<output-dir>/video_<N>_script.md`（必须已存在）
3. 如果已有 `<output-dir>/video_<N>_config.json`，读取作为参考

### Step 2: 调用 Slide Data Generator subagent

读取 `.claude/skills/blog2video/prompts/slide-data-generator.md` 获取完整 prompt。
读取 `.claude/skills/blog2video/design/design-system.md` 获取设计规范。

对 subagent 的指令：
```
你是 Slide Data Generator。请阅读以下prompt规范和设计规范，然后为视频 N 生成 Remotion 渲染所需的 JSON 数据。

<prompt_spec>
{slide-data-generator.md 的内容}
</prompt_spec>

<design_spec>
{design-system.md 的内容}
</design_spec>

<script>
{video_N_script.md 的内容}
</script>

请输出 video_N_config.json（纯 JSON，无 markdown 包装）。
确保：
- video_number 字段正确
- 每张 slide 的 start_time_seconds 和 duration_seconds 与口播稿时间标记一致
- fps = 30, width = 1080, height = 1920
- 每张 slide 的 data 字段严格匹配对应 type 的数据结构
```

### Step 3: 保存并验证

将输出保存为 `<output-dir>/video_<N>_config.json`。

验证 JSON 格式有效，打印摘要：
- Slide 数量和类型
- 每张 Slide 的时间范围
- 总时长

提示用户可以运行以下命令预览：
```
cd blog2video-remotion && npx remotion studio
```
（需要先手动将 config 复制到 `src/data/video_config.json`）
