# /blog2video-continue — Continue pipeline from narration to final video

从已有的 `narration.md` 开始，执行剩余 pipeline 步骤：分集 → slide plan → slide HTML（d2 内容蓝本 + d2 封面）→ TTS → d2 场景 → 渲染 → 投递。

> **视觉引擎 = d2「终端霓影」（主链路）。Remotion 截图链路为 fallback。** 渲染段执行细节 defer 到
> `.claude/skills/blog2video/SKILL.md` §「Orchestrator 调度逻辑」(d2 path) 与 `prompts/scene-generator.md`。
> 每条 shell 命令前缀 `export PATH="/opt/homebrew/opt/node@22/bin:$PATH"`（node 必须 v22.x）。

## 使用方式
```
/blog2video-continue <output-dir>
```

例如：
```
/blog2video-continue ./blog2video-output/effective-harnesses/
```

## 参数解析

`$ARGUMENTS` 格式：`<output-dir>`
- `output-dir`：blog2video-output 下的输出目录路径（必须已包含 `narration.md`）

## 前置检查

1. 解析 `$ARGUMENTS`，提取 output-dir
2. 验证以下文件存在，否则报错退出：
   - `<output-dir>/narration.md`
   - `<output-dir>/source_blog.md`
   - `<output-dir>/insight_memo.md`

## 执行步骤

### Step 1: Episode Splitter（分集决策）

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

所有文件写入 <output-dir>/ 目录。
```

验证 video_plan.json 格式有效，打印视频计划摘要。

### Step 2: Slide Planner（Slide 分段）

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

将输出保存为 `<output-dir>/video_N_script.md`。

**Gate 1 (Script)**: `node blog2video-remotion/scripts/gates.mjs script <script_path>` — 验证 [SLIDE] 标记、品牌植入、字数。如果失败，让 Slide Planner subagent 重试一次。

### Step 3: Slide HTML Generator（Slide 视觉生成）

**对每个视频的口播稿，使用 subagent 执行。**

读取 `.claude/skills/blog2video/prompts/slide-html-generator.md` 获取完整 prompt。

subagent 输出：
- `<output-dir>/slide_N.html` — 每张 slide 的自包含 HTML（d2 内容蓝本 + Remotion fallback 截图源）
- `<output-dir>/cover_photo.html` — **d2 终端霓影风封面**（下游 shoot-cover.mjs 截成 `video_N_cover_photo.png`）
- `<output-dir>/manifest.json` — slide 清单和时间信息

**Gate 2 (Manifest)**: 验证 slide 数量一致、HTML 文件存在。

### Step 4: TTS → d2 场景 → 渲染 + 封面（d2 path，主链路）

对每个视频 N（细节见 SKILL.md d2 path / `prompts/scene-generator.md` / `scripts/render-d2.sh`）：

```bash
export PATH="/opt/homebrew/opt/node@22/bin:$PATH"   # node 必须 v22.x
OUT=<output-dir>

# TTS → 音频 + 字幕 + slide_map + raw_subtitles（音频 raw，不响度处理）
( cd blog2video-remotion && npm run tts -- "../$OUT/video_${N}_script.md" "../$OUT/video_${N}_audio.mp3" )
# 帧吸附时间轴 → scenes-data.json + briefs/
node .claude/skills/blog2video/scripts/build-scenes-data.mjs "$OUT" "$N"
# d2 Scene Generator ×N（每场景一个 scene-generator.md 子 agent，自检 lint 0 error + 快照目检）
#   → src/scene-NN.html，再 build-scene.mjs all → scenes/scene-NN/index.html
node .claude/skills/blog2video/scripts/build-scene.mjs "$OUT" all
# 渲染（逐场景串行 + OOM 防护）→ concat → 混音 → video_N.mp4；末尾自动截 d2 封面 → video_N_cover_photo.png
.claude/skills/blog2video/scripts/render-d2.sh "$OUT" "$N"
```

> **Remotion fallback（仅 d2 不可用时）**：`node blog2video-remotion/scripts/render-image-video.mjs ../<output-dir>/`。默认不走。

### Step 5: 输出汇总

打印所有生成的文件：
```
📁 <output-dir>/
├── video_plan.json          ← 视频计划
├── video_1_narration.md     ← 视频1叙述稿
├── video_1_script.md        ← 视频1口播稿（带 Slide 标记）
├── slide_1.html … slide_N.html / cover_photo.html
├── video_1_audio.mp3
├── video_1.mp4              ← ★最终交付片
├── video_1_cover_photo.png  ← ★交付封面
└── ...
```

## 注意事项

- 每个 subagent 都是独立的，不要在 subagent 之间共享上下文
- 如果某个 Stage 失败，先输出已完成的文件，再报告错误
