# HANDOFF — AI 原生创业手册系列 · EP2 (Idea Stage)

> 给**新 session** 的交接书。目标:把 Anthropic 官方《The Founder's Playbook: Building an AI-Native Startup》(36 页 PDF) 的 **Idea Stage 章节**做成系列第 2 集中文口播视频,走 d2「终端霓影」流水线。
> 你没有上一轮的上下文,本文件 + 项目 `CLAUDE.md` + skill `.claude/skills/blog2video/` = 你需要的全部。
> 相关记忆:`~/.claude/projects/-Users-yufanp-Desktop-Project-blog2video/memory/project_founders_playbook_series.md`(系列方案 + 固定 Hook 模板)。

---

## 0. 这是一个 5 集系列(切集已定)

源 PDF 按创业生命周期分章 → 切成 5 集:

| 集 | 内容 | 状态 |
|----|------|------|
| EP1 开篇 | Ch1 生命周期被重写 + Ch2 创始人变了 | ✅ **已完成**(`blog2video-output/ai-native-founder-playbook/video_1.mp4`,631s) |
| **EP2** | **Idea Stage(想法阶段)** | ⬅️ **你做这一集** |
| EP3 | MVP Stage | 待做 |
| EP4 | Launch Stage | 待做 |
| EP5 | Scale Stage(+ Same job / Resources 收尾) | 待做 |

**EP1 成片已交付片就绪;封面/上传可能还有尾巴(见 §6),与 EP2 无关,别动 EP1 的目录。**

---

## 1. 源 PDF + 抽取(⚠️ 双栏坑)

PDF:`/Users/yufanp/Downloads/69fe2a55b93bb0732b1fe33c_The-Founders-Playbook-05062026_v3 (1).pdf`(36 页)。
目录:Idea Stage 在 **p8**,MVP Stage 在 **p15** → **EP2 = PDF 第 8–14 页**。

**⚠️ 致命坑:这份 PDF 从 Ch2 起是双栏精排版,`pdfminer`/`pdftotext` 直接抽会把左右栏按行交错读乱(句子全串)。** 必须用 **Read 工具读 PDF 页面图像**(`pages: "8-14"`)、靠视觉还原正确阅读顺序,再清洗成干净 markdown。`pdftotext -layout` 能分栏但仍要手工拼,**首选视觉读页**。
- 删页眉(`Chapter N`)、页码、装饰符;`Think:` 侧边栏 = 该能力的一句话定位,保留;bullet callout 保留。
- 把清洗后的 Idea Stage 全文写成 EP2 的 `source_blog.md`(英文原文即可,后续 Insight Memo/Script 阶段翻译)。

---

## 2. 输出目录 / slug

EP2 用**独立 slug 目录**(d2 工作区 `scenes/ clips/ scenes-data.json briefs/` 不带 video_N 前缀,同目录跑第二集会覆盖 EP1——所以必须分目录):

```
slug = ai-native-founder-playbook-ep2-idea
OUT  = blog2video-output/ai-native-founder-playbook-ep2-idea
```
先 `git pull`,`mkdir -p $OUT`,把清洗好的 Idea Stage 写到 `$OUT/source_blog.md`。

---

## 3. 固定 Hook 模板(用户拍板,EP2 必须照做)

EP2-5 的 Hook **第①句逐字固定**(系列标志性开场),**第②句承上**:

> **①(固定不变):** Anthropic 刚刚发布了一份官方手册:在 2026 年,怎么用 AI 从零打造一家创业公司——哪怕你只有一个人。
> **②(承上启下):** 今天,我们接着上一集,讲创业的第一步——**Idea Stage,想法阶段**。
> → 然后直接进入本集内容(讲一个想法怎么变成值得做的创业:问题验证、市场调研、用 AI 做竞品/市场规模/可行性等)。

**EP1 讲了什么(供承接参照):** 两块地基——①创业的整套玩法被掀翻(传统 validate→raise→hire→build 依赖链被 AI 抹掉);②"创始人"身份被改写(能动手做 vs 有好点子的墙塌了,创始人从亲手执行→指挥 Agent)。

---

## 4. 流水线 runbook(d2 path,逐步)

环境:`export PATH="$HOME/.npm-global/bin:/opt/homebrew/opt/node@22/bin:$PATH"`(node 必须 v22.x;hyperframes 0.7.x)。每个 stage 派**独立 subagent**,prompt 让它先读对应规格文件。

1. **Insight Memo** — subagent 读 `prompts/insight-memo-writer.md` + `$OUT/source_blog.md` → 写 `$OUT/insight_memo.md`。
2. **Script Writer** — subagent 读 `prompts/script-writer.md` + source + memo → 写 `$OUT/narration.md`。
   - **铁律:** 第一人称主播视角;正文禁出现"作者/原文/文中/playbook 说"等 attribution(权威只在 Hook 出现一次);Hook 用 §3 固定模板;结尾品牌句逐字:`AI 世界很吵，精读一篇，胜过刷一百条。我们下期再见。`;TTS 友好(数字写"百分之85"、避多音字、每段≤150字)。
   - **结尾轻量承接:** 收尾点一句"下一集预告"(EP3 = MVP Stage),保持每集能独立看。
3. **⚠️ Hook Review 卡点** — 把 narration 的 Hook 段拿给**用户**确认后再继续(EP1 用户对 Hook 很在意,别跳过)。
4. **单集计划** — EP2 是单集连贯论证,默认不拆:手写 `$OUT/video_plan.json`(total_videos:1,blog_metadata.title_zh 用 memo 的 title_zh,slug=上面的 slug)+ `cp narration.md video_1_narration.md`。(格式见 `prompts/episode-splitter.md`,或抄 EP1 的 `blog2video-output/ai-native-founder-playbook/video_plan.json`。)
5. **Slide Planner** — subagent 读 `prompts/slide-planner.md` → `$OUT/video_1_script.md`(标 `[SLIDE N: type]`,一字不改叙述;首 cover 末 summary)。自检:去标记后口播文字与 narration 逐字一致。
6. **Slide HTML Generator** — subagent 读 `prompts/slide-html-generator.md` → `slide_1..N.html`(内容蓝本)+ `cover_photo.html`(终端霓影封面)+ `manifest.json`。
   - **封面系列参数(与 EP1 一致):** topbar `精读AI · AI 原生创业手册`;kicker 里折 `// EP.02 / 05`;右上 `anthropic.com`;src 胶囊 `The Founder's Playbook: Building an AI-Native Startup`;颜色铁律:酸性绿 `#ccff4d` 每帧 + 最多一种辅助色 电青 `#5fd3e8`,禁紫/红/渐变/emoji。
7. **TTS** — `cd blog2video-remotion && npm run tts -- ../$OUT/video_1_script.md ../$OUT/video_1_audio.mp3`(用绝对路径更稳)。产出 audio + `_subtitles.json` + `_minimax_raw_subtitles.json` + `_slide_map.json` + `.vtt`。(`.env` 里 MINIMAX 密钥已配好。)
8. **build-scenes-data** — `node .claude/skills/blog2video/scripts/build-scenes-data.mjs $OUT 1` → `scenes-data.json` + `briefs/scene-NN.json`(帧吸附,17 含 CTA 之类)。
9. **写语义 brief.type** — build-scenes-data 只默认了 `cover`(场景1)/`summary`(末内容张)/`cta`(尾卡)。**编排者(你)**按 Slide Planner 给每张的类型,把 `principle`/`quote`/`comparison_cards`/`checklist` 写回对应 `briefs/scene-NN.json` 的 `type` 字段(其余留 `image`)。用 python 改 JSON。
10. **d2 场景生成 ×N** — 每场景派一个 subagent,读 `prompts/scene-generator.md` + kit + **同类型黄金范本**(cover→samples/scene-01,image→scene-02,principle→scene-05,comparison_cards→scene-07,quote→scene-16,checklist→scene-17,summary→scene-24,cta→手写)+ 本场景 brief + 源 slide。产出 `src/scene-NN.html`(marker 形式)→ `node scripts/build-scene.mjs $OUT NN` → `scenes/scene-NN/index.html`,自检 `hyperframes lint`(0 真 error,`gsap_timeline_not_registered` 是已知良性误报)+ `hyperframes snapshot ... --at <5个时刻>` 后用 **Read 看 contact-sheet.jpg** 目检。
    - **并发 4–5 个一批**(8GB,snapshot 错峰防 OOM);topbar 统一 `精读AI · AI 原生创业手册`;字幕逐字烧入、画布只放关键词、长例子留字幕(密集场景尤其)。
11. **渲染** — 见 §5(有坑)。

---

## 5. 渲染(⚠️ 两个实测坑)

`render-d2.sh` 逐场景串行渲 → concat → 混音(raw,不响度处理/不 -shortest)→ `video_1.mp4`,收尾截封面。

**坑 A — 后台渲染约 5–6 分钟会被墙钟 kill。** 每个场景渲染约 1.5–2.5 分钟,后台跑 17 个会中途被停。`render-d2.sh` **支持断点续渲**(clip 已存在就 skip),所以:
- 要么反复重跑 `render-d2.sh`(每次多渲几个,clip 累积),
- 要么(更稳)**前台分批**手渲,每批 3 个、设 `timeout: 540000`(9分钟,稳在 10 分钟上限内):
```bash
export PATH="$HOME/.npm-global/bin:/opt/homebrew/opt/node@22/bin:$PATH"; cd $OUT
for n in 01 02 03; do NODE_OPTIONS="--max-old-space-size=5120" hyperframes render "scenes/scene-$n" -o "clips/scene-$n.mp4" --quiet; done
```
全部 clip 齐后,跑一次 `render-d2.sh` 做 concat+混音(clip 全缓存,秒级)。

**坑 B — render-d2.sh 是 `#!/bin/zsh`,务必用 `zsh` 跑,别用 `bash`。** 用 bash 跑时脚本里 `${0:A:h}` 取目录失败,封面那步会报 `Cannot find module '/shoot-cover.mjs'`(渲染本身不受影响)。
```bash
zsh .claude/skills/blog2video/scripts/render-d2.sh $OUT 1
```

---

## 6. 封面截图(⚠️ EP1 遇到的坑)

封面 `shoot-cover.mjs`(puppeteer-core 截 `cover_photo.html`→`video_1_cover_photo.png`)在 EP1 出现 **puppeteer 启动浏览器挂起/ProtocolError**。排查顺序:
1. 先杀残留 headless chrome(别杀用户正常浏览器):`pkill -9 -f "chrome-headless-shell"; pkill -9 -f "Chrome for Testing"; pkill -9 -f "shoot-cover.mjs"`。
2. 后台重跑:`node .claude/skills/blog2video/scripts/shoot-cover.mjs $OUT 1`(前台会撞 2 分钟上限,用后台或设大 timeout)。
3. 仍不行 → 用 **Playwright MCP** 兜底:`browser_navigate` 到 `file://$OUT/cover_photo.html`、`browser_resize` 1080×1920、`browser_take_screenshot` 存成 `video_1_cover_photo.png`(`$OUT/assets` 字体 symlink 已在,字体能渲)。

> EP1 状态:`video_1.mp4` 已好;`video_1_cover_photo.png` 当时还在重试。EP2 自查这一步即可,EP1 的尾巴用户会另行处理。

---

## 7. 交付(渲完 + 封面齐之后)

只传 6 个文件到 Google Drive(rclone remote `gdrive:` 已配),**最稳用 `--files-from` 白名单**(绕开排除清单遗漏):
```bash
printf '%s\n' video_1.mp4 video_1_cover_photo.png video_1_script.md video_1_audio.vtt source_blog.md meta.json > /tmp/deliver.txt
rclone copy ./$OUT/ gdrive:blog2video/ai-native-founder-playbook-ep2-idea/ --files-from /tmp/deliver.txt --progress
```
`meta.json` 格式见项目 `CLAUDE.md`(**不要**写 title/description/tags,Claudiny 服务器生成)。`source_blog.md` 用 EP2 的 Idea Stage 清洗稿。
> ⚠️ 系列分目录上传 vs 合并成一个系列 meta —— 这是个待定决策,做完先问用户怎么归组。

---

## 8. 一句话给新 session 的起手式

> "读 `HANDOFF-founders-playbook-EP2.md`,按它把 Anthropic Founder's Playbook 的 Idea Stage(PDF 第 8–14 页,注意双栏要视觉读页)做成系列第 2 集。先抽取清洗 → Insight Memo → Script(用固定 Hook 模板),写完 narration 把 Hook 拿给我确认,再往下做 slide/TTS/d2 场景/渲染/封面/交付。"
