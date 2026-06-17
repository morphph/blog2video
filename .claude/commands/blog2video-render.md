# /blog2video-render — Render video from existing artifacts

从已有的 `video_N_script.md`（+ slide HTML）渲染最终视频。无需内容 subagent。

> **主链路 = d2「终端霓影」**（TTS → build-scenes-data → d2 场景 → render-d2.sh，末尾自动截封面）。
> **Remotion `render-all.mjs` / `video_N_config.json` 是 fallback**，仅 d2 不可用时用。
> 每条 shell 命令前缀 `export PATH="/opt/homebrew/opt/node@22/bin:$PATH"`（node 必须 v22.x，否则 d2 渲染 OOM）。
> 渲染细节以 `.claude/skills/blog2video/SKILL.md` §「Orchestrator 调度逻辑」(d2 path) 与 `scripts/render-d2.sh` 为准。

## 使用方式
```
/blog2video-render <output-dir> [video-number]
```
- `output-dir`：blog2video-output 下的输出目录路径
- `video-number`：可选，默认 1

## 主链路：d2 渲染（默认）

前置：`<output-dir>/` 下已有 `video_N_script.md` 与 `slide_N.html`（含 `cover_photo.html`）。

```bash
export PATH="/opt/homebrew/opt/node@22/bin:$PATH"   # node 必须 v22.x
OUT=<output-dir>; N=<video-number 默认1>

# 1. TTS → 音频 + 字幕 + slide_map + raw_subtitles（音频 raw，不响度处理）
( cd blog2video-remotion && npm run tts -- "../$OUT/video_${N}_script.md" "../$OUT/video_${N}_audio.mp3" )

# 2. 帧吸附时间轴 → scenes-data.json + briefs/scene-NN.json（修音视频漂移）
node .claude/skills/blog2video/scripts/build-scenes-data.mjs "$OUT" "$N"

# 3. d2 场景：若 src/scene-NN.html 已就绪 → 内联打包；否则先派 scene-generator.md 子 agent 生成（见 SKILL.md）
node .claude/skills/blog2video/scripts/build-scene.mjs "$OUT" all

# 4. 渲染（逐场景串行 + NODE_OPTIONS=--max-old-space-size=5120 OOM 防护）→ concat → 混 raw 音频
#    → video_N.mp4；脚本末尾自动 shoot-cover.mjs 截 cover_photo.html → video_N_cover_photo.png
.claude/skills/blog2video/scripts/render-d2.sh "$OUT" "$N"
```

> **d2 渲染硬约束（不可推翻）**：逐场景渲、绝不渲整片（>240s 在 8GB 必 OOM）；串行渲；node v22.x。均固化在 `render-d2.sh`。

封面单独补截：`node .claude/skills/blog2video/scripts/shoot-cover.mjs "$OUT" "$N"`

## Fallback：Remotion 渲染（仅 d2 不可用时）

前置：`<output-dir>/video_N_config.json` 存在（Remotion slide 数据，由 `/blog2video-slides` 生成）。

```bash
cd blog2video-remotion && npm install 2>/dev/null
# 单个视频：TTS + 复制 config/音频 + remotion render；或整目录：
node scripts/render-all.mjs "../<output-dir>/"
```
（`render-all.mjs` = TTS → Puppeteer 截 `slide_N.html` → Remotion 渲染。仅作 fallback，正式产出走 d2。）

## 完成后

打印渲染结果：每个视频的文件路径与大小（`video_N.mp4` + `video_N_cover_photo.png`）、总时长。
如果渲染失败但 TTS 成功，报告错误但保留已生成的音频文件。
