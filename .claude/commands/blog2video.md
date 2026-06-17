# /blog2video — Blog to Video Pipeline（d2「终端霓影」）

将英文技术内容（博客、PDF、YouTube、Twitter/X）自动转化为中文口播竖屏视频（小红书/视频号风格）。

> **视觉引擎 = d2「终端霓影」（2026-06 起，正式投产）。** 旧的 Remotion 截图链路保留为 **fallback**。
> **本命令是编排入口，只负责命令级职责**；逐阶段的执行细节（subagent 架构、各 prompt 规范、d2 场景生成、渲染）
> **defer 到 `.claude/skills/blog2video/SKILL.md` §「Orchestrator 调度逻辑」(d2 path)** 与 `prompts/*.md`——
> 不要在本文件里复述整条 pipeline。本命令负责：**输入处理、Twitter/X 前置检查、强制 Hook review 检查点、各 Gate、
> 分集/时长决策、d2 渲染与封面命令、Post-Render Delivery**。

## 使用方式
```
/blog2video <url-or-file>
```

支持的输入格式：
- **博客 URL** — `https://example.com/blog-post`
- **PDF** — 远程 URL（`https://.../*.pdf`）或本地路径（`./paper.pdf`）
- **YouTube 视频** — `https://www.youtube.com/watch?v=...` 或 `https://youtu.be/...`
- **Twitter/X** — `https://x.com/...` 或 `https://twitter.com/...`
- **本地文件** — 任意文本文件路径

## 命令级铁律

- **每条 shell 命令前缀** `export PATH="/opt/homebrew/opt/node@22/bin:$PATH"`（node 必须 v22.x，否则 d2 渲染/截图 OOM）。
- **NEVER（见 CLAUDE.md）**：音频不做 loudnorm/响度处理；`meta.json` 不加 title/description/tags；交付的 PNG 只有 `*_cover_photo.png`（slide 截图不投递）。
- 每个 subagent 独立、无共享上下文。某 Stage 失败时，先输出已完成文件，再报告错误。
- `source_blog.md` 是跨系统共享产物（LoreAI 博客导入依赖它），务必生成且非空。

---

## Step 0：准备 + 输入处理（命令级）

读取 `$ARGUMENTS`，按以下顺序检测输入类型，产出 `./blog2video-output/<slug>/source_blog.md`：

**a) YouTube**（含 `youtube.com` / `youtu.be`）：`yt-dlp --print title` 取 slug → `yt-dlp --write-auto-sub --sub-lang en --skip-download` 下字幕 → 解析 `.vtt`（去 WEBVTT 头、时间戳、`<c>`/`<00:..>` 标签、重复行）→ `source_blog.md`。

**b) PDF**（以 `.pdf` 结尾）：远程则 `curl -sL` 下载 → 从文件名取 slug → pdfminer 提取 → `source_blog.md`。

**c) 博客 URL**（`http` 开头、非 PDF）：`curl`/`fetch` 抓取 → 从 URL 取 slug → 扫描并下载远程图片到 `images/`（替换 URL）→ `source_blog.md`。

**d) Twitter/X**（含 `x.com` / `twitter.com`）：
- ⚠️ **前置检查（命令级，必做）**：用 ToolSearch 确认 **Playwright MCP 已加载**（`mcp__playwright__*`）。**未加载则停止**并要求用户重启 session 加载 MCP——不要降级硬抓。
- 从 URL 取 slug（作者名-推文ID）→ 执行 Twitter/X fallback chain（详见 `fetch-source.md` §c）：Playwright MCP → WebFetch → Puppeteer → 图片视觉转录 → `source_raw.md`。

**e) 本地文件**（其他）：读取内容，从文件名取 slug → `source_blog.md`。

验证 `source_blog.md` 非空，否则报错退出。

---

## Stages 1–5：内容 → 内容蓝本（执行细节见 SKILL.md d2 path）

按 **`SKILL.md` §Orchestrator 调度逻辑（d2 path）** 顺序派发独立 subagent；各 prompt 规范在 `.claude/skills/blog2video/prompts/`。
本命令只在此列出顺序、Gate 与**必须前置的 Hook review**——具体每个 subagent 的输入/输出契约以 SKILL.md + 对应 prompt 为准。

| # | 阶段 | prompt 规范 | 输出 |
|---|------|------------|------|
| 0.5 | Cleaner（PDF/Transcript/Twitter，按输入类型） | `prompts/{pdf,transcript-organizer,twitter-cleaner}.md` | `source_blog.md` |
| 0.7 | Image Enrichment（orchestrator 直接执行，有 `images/` 才跑，上限 15 张） | — | `source_blog.md`（含 `<!-- [IMAGE DESCRIPTION] -->`） |
| 1 | Insight Memo Writer | `prompts/insight-memo-writer.md` | `insight_memo.md` |
| 2 | Script Writer（整篇一稿，无 slide 标记） | `prompts/script-writer.md` + `examples/example-narration-v1.md` | `narration.md` |
| 3 | Episode Splitter（**分集/时长决策**） | `prompts/episode-splitter.md` | `video_plan.json` + `video_N_narration.md` |
| 4 | Slide Planner（×N，加 `[SLIDE N: type]` 标记，不改写文字） | `prompts/slide-planner.md` | `video_N_script.md` |
| 5 | Slide HTML Generator（×N，d2 内容蓝本 + **d2 终端霓影 `cover_photo.html`**） | `prompts/slide-html-generator.md` | `slide_N.html` + `cover_photo.html` + `manifest.json` |

**分集/时长决策原则（命令级）：先写后拆。** Stage 1/2 为整篇博客工作，不被分集污染；Stage 3 读完成品叙述稿后才决定是否拆分。
**时长是结果不是输入**——不要为凑时长压缩或注水叙述稿。

### ⚠️⚠️ Step 3.5：强制 Hook Review 检查点（命令级，**不可跳过**）⚠️⚠️

Stage 2 生成 `narration.md` 后、**进入 Stage 3/4 之前必须停下**：

1. 把 `narration.md` 的 **Hook 段完整展示**给用户，并打印摘要（标题、字数、预计时长、段落数）。
2. 显式询问：**「Hook 是否通过？通过后我会自动完成后续所有步骤（分集 → slide → HTML → TTS → d2 场景 → 渲染 → 封面 → 投递）；否则告诉我要怎么改。」**
3. **在用户明确确认前，绝不进入 Stage 3。** 用户可能要求重写 Hook、改正文论点、调整结构——用 Script Writer subagent 迭代 `narration.md` 直至确认。

> **为什么必须前置**：Hook 是观众「为什么不划走」的唯一理由。Stage 3 之后的全部产物（slide、TTS 音频、d2 场景、最终视频）都假定 Hook 已定，改 Hook = 全部重做。前置 review 省 2–3 小时返工。

### Gates

| Gate | 时机 | 检查 | 失败处理 |
|------|------|------|---------|
| Gate 1: Script | Slide Planner 后 | `[SLIDE]` 标记、品牌植入、字数 | 让 Slide Planner 重试一次 |
| Gate 2: Manifest | Slide HTML 后 | slide 数量一致、HTML 文件存在 | 补齐缺失 |
| Gate 3: Alignment | TTS + build-scenes-data 后 | 字幕映射完整、各场景时长 > 2s | 检查 slide_map / 音频 |
| Gate 4: PostRender | 渲染后 | MP4 大小合理、封面 PNG 存在 | 见 render-errors.log |

---

## Stage 5.3–6：TTS → d2 场景 → 渲染 + 封面（d2 path，**主链路**）

对每个视频 N，从仓库根依次执行（细节见 SKILL.md / `prompts/scene-generator.md` / `scripts/render-d2.sh`）：

```bash
export PATH="/opt/homebrew/opt/node@22/bin:$PATH"   # node 必须 v22.x
OUT=blog2video-output/<slug>

# 5.3 TTS → 音频 + 字幕 + slide_map + raw_subtitles（MiniMax，音频 raw 不处理）
( cd blog2video-remotion && npm run tts -- "../$OUT/video_${N}_script.md" "../$OUT/video_${N}_audio.mp3" )

# 5.5 帧吸附时间轴 → scenes-data.json + briefs/scene-NN.json（修音视频漂移）
node .claude/skills/blog2video/scripts/build-scenes-data.mjs "$OUT" "$N"
```

**5.7 d2 Scene Generator ×N**：对每个场景派一个 `prompts/scene-generator.md` 子 agent（可并行小批），
读 `briefs/scene-NN.json` + `slide_N.html` + kit + 同类型黄金范本，产出 `src/scene-NN.html`，
然后 `node .claude/skills/blog2video/scripts/build-scene.mjs "$OUT" all` 内联成 `scenes/scene-NN/index.html`。
每个子 agent 必须自检：`hyperframes lint` 0 error + 快照目检（酸性绿每帧在场、辅助色 ≤1、字幕一字不差、未侵入字幕带、emoji 已删）。
（cover/summary/cta 类型由 build-scenes-data 结构默认；principle/comparison_cards/quote/checklist 等语义类型由编排者读 slide 内容后写进 brief.type 再派活。）

**6 渲染 + 封面**（一条脚本搞定，**末尾自动截 d2 封面**）：
```bash
.claude/skills/blog2video/scripts/render-d2.sh "$OUT" "$N"
# → 逐场景串行 hyperframes render（NODE_OPTIONS=--max-old-space-size=5120，OOM 防护）
# → concat 静音整片 → 混入 raw 音频（不 loudnorm / 不 -shortest，CTA 静音尾卡保留）→ video_N.mp4
# → 自动 shoot-cover.mjs 截 cover_photo.html → video_N_cover_photo.png（非致命）
```

> **d2 渲染硬约束（Phase-1 踩坑换来，不可推翻）**：**逐场景渲、绝不渲整片**（>240s 合成在 8GB 必 OOM）；
> **串行**渲 + `NODE_OPTIONS=--max-old-space-size=5120`；**node v22.x**。这些都在 `render-d2.sh` 里固化，照常调脚本即可。

> **Remotion fallback（仅 d2 不可用时）**：`node blog2video-remotion/scripts/render-image-video.mjs ../blog2video-output/<slug>/`
> （Puppeteer 截 `slide_N.html` → Remotion 渲）。**默认不走这条**；正式产出一律 d2。

封面如需单独补截（已有 `cover_photo.html` 时）：
```bash
node .claude/skills/blog2video/scripts/shoot-cover.mjs "$OUT" "$N"
```

---

## Step 7：Post-Render Delivery（命令级）

视频渲染完成后，按 **CLAUDE.md §「Post-Render Delivery」（权威排除清单 + rclone 命令，以那里为准）** 投递到 Google Drive。

要点（详规见 CLAUDE.md，避免在此重复整张清单）：
- **只投递**：`video_N.mp4` + `video_N_cover_photo.png` + `video_N_script.md` + `video_N_audio.vtt` + `source_blog.md` + `meta.json`。
- **不投递**：`*.mp3`、`*.html`（含 slide_N/cover_photo/src/scenes）、slide 截图 PNG（`*_cover_photo.png` 除外）、`*_manifest.json`、`*_minimax_raw_subtitles.json`、`*_audio_subtitles.json`、`*_slide_map.json`、`video_plan.json`、`twitter_metadata.json`、`source_raw.md`、`*_narration.md`、`*_insight_memo.md`、`images/`，以及 d2 工作区 `scenes-data.json`/`briefs/`/`src/`/`scenes/`/`clips/`/`renders/`/`assets`（symlink）/`*.log`/`concat.txt`。
- ⚠️ 投递命令**不要** `--exclude="*.mp4"`（会误删要交付的 `video_N.mp4`）；d2 中间片靠排除 `clips/`、`renders/` 目录拿掉。
- `meta.json` **不加** title/description/tags——Claudiny 服务器基于 script + source_blog 自动生成。
- 投递完成后告知用户：**视频已上传到 Google Drive (blog2video/<slug>/)，Claudiny 会基于脚本自动生成标题/描述/标签并排期发布到小红书和微信视频号。**

## Step 8：输出汇总 + LoreAI 导入提示

打印生成的关键文件路径（`video_N.mp4`、`video_N_cover_photo.png`、`video_N_script.md`、`video_N_audio.vtt`、`source_blog.md`、`meta.json`）。
如果视频源是外部内容，打印 LoreAI 博客导入命令。
