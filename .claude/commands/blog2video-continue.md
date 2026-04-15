# /blog2video-continue — Continue pipeline from narration to final video

从已有的 `narration.md` 开始，执行剩余 pipeline 步骤：分集 → slide plan → slide HTML → 渲染 → 投递。

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
- `<output-dir>/slide_N.html` — 每张 slide 的自包含 HTML
- `<output-dir>/manifest.json` — slide 清单和时间信息

**Gate 2 (Manifest)**: 验证 slide 数量一致、HTML 文件存在。

### Step 4: 渲染视频

```bash
cd blog2video-remotion && npm install 2>/dev/null
node scripts/render-all.mjs ../<output-dir>/
```

### Step 5: 输出汇总

打印所有生成的文件：
```
📁 <output-dir>/
├── video_plan.json          ← 视频计划
├── video_1_narration.md     ← 视频1叙述稿
├── video_1_script.md        ← 视频1口播稿（带 Slide 标记）
├── slide_1.html … slide_N.html
├── video_1_audio.mp3
├── video_1.mp4
└── ...
```

## 注意事项

- 每个 subagent 都是独立的，不要在 subagent 之间共享上下文
- 如果某个 Stage 失败，先输出已完成的文件，再报告错误
