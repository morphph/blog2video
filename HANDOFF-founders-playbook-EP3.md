# HANDOFF — AI 原生创业手册系列 · EP3 (MVP Stage)

> 给**新 session** 的交接书。目标:把 Anthropic 官方《The Founder's Playbook: Building an AI-Native Startup》(36 页 PDF) 的 **MVP Stage 章节**做成系列第 3 集中文口播视频,走 d2「终端霓影」流水线。
> 你没有上一轮的上下文,本文件 + 项目 `CLAUDE.md` + skill `.claude/skills/blog2video/` = 你需要的全部。
> 相关记忆:`~/.claude/projects/-Users-yufanp-Desktop-Project-blog2video/memory/project_founders_playbook_series.md`(系列方案 + 固定 Hook 模板,已含 EP2 的 Hook 决策更新)。
> EP2 的交接书 `HANDOFF-founders-playbook-EP2.md` 仍在仓库,本文件是它的「踩坑升级版」——EP2 实战学到的东西都并进了 §5/§6/§9。

---

## 0. 这是一个 5 集系列(切集已定)

源 PDF 按创业生命周期分章 → 切成 5 集:

| 集 | 内容 | 状态 |
|----|------|------|
| EP1 开篇 | Ch1 生命周期被重写 + Ch2 创始人变了 | ✅ 已完成(`blog2video-output/ai-native-founder-playbook/`,631s) |
| EP2 | Idea Stage(想法阶段) | ✅ **已完成**(`blog2video-output/ai-native-founder-playbook-ep2-idea/`,643s,成片+封面齐;交付见 §7 备注) |
| **EP3** | **MVP Stage(最小可用产品阶段)** | ⬅️ **你做这一集** |
| EP4 | Launch Stage | 待做 |
| EP5 | Scale Stage(+ Same job / Resources 收尾) | 待做 |

**别动 EP1 / EP2 的目录。** EP2 成片 `video_1.mp4`(643s)、封面、6 个交付文件都已就绪;只剩最后的 rclone 上传需在**用户自己的终端**跑(原因见 §7),与 EP3 无关。

---

## 1. 源 PDF + 抽取(⚠️ 双栏坑)

PDF:`/Users/yufanp/Downloads/69fe2a55b93bb0732b1fe33c_The-Founders-Playbook-05062026_v3 (1).pdf`(36 页)。
目录:Idea Stage 在 **p8**,**MVP Stage 在 p15** → **EP3 = MVP Stage 章节**。
- **先用 Read 工具读 PDF 目录页(约 p2–p4)确认 MVP Stage 的精确页范围**:起始 p15,结束 = Launch Stage 起始页的前一页(EP2 时 Idea Stage 是 p8–14 共 7 页;MVP 体量类似,**预计 p15–p21 上下,务必读目录确认,别照搬**)。
- **⚠️ 致命坑:这份 PDF 从 Ch2 起是双栏精排版**,`pdfminer`/`pdftotext` 直接抽会把左右栏按行交错读乱。必须用 **Read 工具读 PDF 页面图像**(`pages: "15-21"` 之类)、靠视觉还原正确阅读顺序(先读完左栏再右栏),再清洗成干净 markdown。
- 删页眉(`Chapter N`)、页码、装饰符;`Think:`/`Note:`/`Exercise:` 侧边栏与 callout 保留;表格按"行=条目"重排。
- 把清洗后的 MVP Stage 全文写成 EP3 的 `source_blog.md`(英文原文即可,后续 Insight Memo/Script 阶段翻译)。

---

## 2. 输出目录 / slug

EP3 用**独立 slug 目录**(d2 工作区 `scenes/ clips/ scenes-data.json briefs/` 不带 video_N 前缀,同目录跑会覆盖,必须分目录):

```
slug = ai-native-founder-playbook-ep3-mvp
OUT  = blog2video-output/ai-native-founder-playbook-ep3-mvp
```
先 `git pull`,`mkdir -p $OUT`,把清洗好的 MVP Stage 写到 `$OUT/source_blog.md`。

---

## 3. 固定 Hook 模板(⚠️ EP2 用户更新过,照新规矩来)

**第①句 = 不变的是「Anthropic 官方刚发布手册」这个权威/官方框架,但措辞每集微调**(2026-06-27 用户拍板:第一句要每集有不同版本,只保证官方权威感,不再逐字固定)。

- EP1 原始固定句:`Anthropic 刚刚发布了一份官方手册:在 2026 年,怎么用 AI 从零打造一家创业公司——哪怕你只有一个人。`
- **EP2 选用「官方亲自给答案」版**:`AI 时代到底怎么创业,Anthropic 这次亲自给了官方答案:一份刚刚发布的手册,教你在 2026 年,一个人也能用 AI 从零做出一家公司。`
- **EP3 做法:script 写完后,给用户 3–4 个第①句变体挑(都保官方权威框架),让他拍板再继续**(用户对这一句很在意,EP2 在这里卡了一轮)。可参考 EP2 用过的角度:加 Claude 出处 / 「官方」前置庄重 / 官方亲自给答案 / 近原版收尾更狠。

**第②句直接承上**(逐字模板):
> 今天,我们接着上一集,讲 MVP 阶段,最小可用产品阶段。

然后接 1 句承上启下的本集定位,直接进内容。

**EP2 讲了什么(供 ② 之后的承接参照,别大段回顾):** Idea Stage 的纪律 = 在证据出现前忍住不做;两个反直觉(「做出来 ≠ 验证了」/「真正危险的是 AI 太听话——确认偏误配研究引擎」);解药 = 让 Claude 当结构化魔鬼代言人;落地门槛 = 问题要可证伪;收尾 = 把一个核心交互做出来、放到 5 个人面前。**EP3 主线预计**:从「该不该做」转到「该先做什么」——AI 的角色从研究伙伴变成施工队(这正是 Idea Stage 章末那句导读,EP2 故意没剧透,留给 EP3 开场)。

---

## 4. 流水线 runbook(d2 path,与 EP2 完全一致,逐步)

环境:`export PATH="$HOME/.npm-global/bin:/opt/homebrew/opt/node@22/bin:$PATH"`(node 必须 v22.x)。每个 stage 派**独立 subagent**,prompt 让它先读对应规格文件。EP2 全程顺利,照搬即可:

1. **Insight Memo** — subagent 读 `prompts/insight-memo-writer.md` + `$OUT/source_blog.md` → 写 `$OUT/insight_memo.md`(含 `title_zh`)。
2. **Script Writer** — subagent 读 `prompts/script-writer.md`(系列声口锚定 EP1/EP2 的 narration)+ source + memo → 写 `$OUT/narration.md`。
   - **铁律:** 第一人称主播视角;正文禁出现"作者/原文/文中/手册说/playbook"等 attribution(权威只在 Hook 出现一次);Hook 用 §3;结尾品牌句逐字:`AI 世界很吵，精读一篇，胜过刷一百条。我们下期再见。`;TTS 友好(数字写"百分之XX"、避多音字、每段≤150字)。
   - **结尾轻量承接:** 收尾点一句"下一集预告"(EP4 = Launch Stage),保持每集能独立看。
3. **⚠️ Hook Review 卡点** — 把 narration 的 Hook **连同 3–4 个第①句变体**拿给用户确认后再继续(见 §3)。
4. **单集计划** — 默认不拆:手写 `$OUT/video_plan.json`(total_videos:1,title_zh 用 memo 的,slug=上面的)+ `cp narration.md video_1_narration.md`。抄 EP2 的 `blog2video-output/ai-native-founder-playbook-ep2-idea/video_plan.json` 改字段即可。
5. **Slide Planner** — 读 `prompts/slide-planner.md` → `$OUT/video_1_script.md`(标 `[SLIDE N: type]`,一字不改叙述;首 cover 末 summary)。**EP2 经验:18 张内容 slide → 19 个场景(含 CTA),对 ~10 分钟正片刚好;场景数控制在 ~17–19。** 自检:去标记后口播文字与 narration 逐字一致(用 python diff)。
6. **Slide HTML Generator** — 读 `prompts/slide-html-generator.md` → `slide_1..N.html`(内容蓝本)。**封面 `cover_photo.html` + `manifest.json` 建议编排者自己写**(EP2 这么做的:抄 EP2/EP1 的 cover 模板改参数,确定性强、还省一个 subagent;subagent 只生成 N 张 slide 蓝本,明确告诉它"别碰 cover_photo.html / manifest.json")。
   - **封面系列参数(与 EP1/EP2 一致):** topbar `精读AI · AI 原生创业手册`;kicker `// EP.03 / 05 · ANTHROPIC OFFICIAL PLAYBOOK`;右上 `anthropic.com`;src 胶囊 `The Founder's Playbook: Building an AI-Native Startup`;颜色铁律:酸性绿 `#ccff4d` 每帧 + 最多一种辅助色 电青 `#5fd3e8`,禁紫/红/渐变/emoji。
   - **⚠️ 封面 `.h1` 字号:标题长就从 96px 降到 ~88px**,否则会中间断词换行(EP2 踩过:96px 时"免/费"被拆行,降 88px 两行干净)。两个数据 chip 各放一个干净数字(EP2 用了 42% 绿 + 5 青)。
7. **TTS** — `cd blog2video-remotion && npm run tts -- ../$OUT/video_1_script.md ../$OUT/video_1_audio.mp3`(用绝对路径)。产出 audio + `_subtitles.json` + `_minimax_raw_subtitles.json` + `_slide_map.json` + `.vtt`。EP2 实测 18 slide ≈ 637s 音频。
8. **build-scenes-data** — `node .claude/skills/blog2video/scripts/build-scenes-data.mjs $OUT 1` → `scenes-data.json` + `briefs/scene-NN.json`(帧吸附;N 张内容 + 1 张 CTA = N+1 个场景)。
9. **写语义 brief.type** — build-scenes-data 只默认 `cover`(场景1)/`summary`(末内容张)/`cta`(尾卡),其余全是 `image`。**编排者(你)**按 Slide Planner 的类型,用 python 把 `principle`/`quote`/`comparison_cards`/`checklist` 写回对应 `briefs/scene-NN.json` 的 `type` 字段(image 的留着不动)。
10. **d2 场景生成 ×N** — 每场景派一个 subagent,读 `prompts/scene-generator.md` + kit(d2-base.css/d2-motion.js/components.md/DESIGN.md)+ **同类型黄金范本**(cover→samples/scene-01,image→scene-02,principle→scene-05,comparison_cards→scene-07,quote→scene-16,checklist→scene-17,summary→scene-24,cta→手写抄 EP1/EP2 的 scene-19)+ 本场景 brief + 源 slide。产出 `src/scene-NN.html`(marker 形式)→ `node scripts/build-scene.mjs $OUT NN` → `scenes/scene-NN/index.html`,自检 `hyperframes lint`(0 真 error,`gsap_timeline_not_registered`/`composition_self_attribute_selector`/`timeline_track_too_dense`/`__unresolved__` 都是已知良性)+ `hyperframes snapshot ... --at <5-6个时刻>` 后用 **Read 看 contact-sheet.jpg** 目检。
    - **EP2 实战:并发 3 个一批、7 批跑完 19 场景,零 OOM**(8GB 机器,subagent 各自串行 snapshot,自然错峰)。topbar 统一 `精读AI · AI 原生创业手册`;字幕逐字烧入、画布只放关键词、长例子留字幕。
    - **⚠️ 字幕重叠坑(EP2 多次遇到,已在 prompt 里教 subagent 自修):** brief 的相邻字幕本地时间偶尔重叠 ~10–13ms,超过 build 脚本自动削的 10ms,会 lint 报 `overlapping_clips_same_track`。修法:把**前一条** `.clip.sub` 的 `data-duration` 削到下一条的 start(文字不动,显示差 ~12ms 无感)。
    - cta 尾卡(5s 静音无字幕)编排者直接手写:抄 `blog2video-output/ai-native-founder-playbook-ep2-idea/src/scene-19.html`,改 `data-composition-id` / 副标文字(EP2 用 `AI 原生创业手册 · 想法阶段 · 完`,EP3 改成 `… · MVP 阶段 · 完`)。
11. **渲染** — 见 §5。

---

## 5. 渲染(EP2 实测流程,稳)

`render-d2.sh` 逐场景串行渲 → concat → 混音(raw,不响度处理/不 -shortest)→ `video_1.mp4`,收尾截封面。**支持断点续渲(clip 已存在就 skip)。**

**EP2 实测节奏:每个场景 hyperframes render ≈ 70–150s(随时长),~100s 居多。** 前台**分批手渲**最稳(每批渲到接近 10 分钟上限就停,resume 接着来):
```bash
export PATH="$HOME/.npm-global/bin:/opt/homebrew/opt/node@22/bin:$PATH"; cd $OUT; mkdir -p clips renders
for n in 01 02 03 04; do [ -f "clips/scene-$n.mp4" ] && continue
  NODE_OPTIONS="--max-old-space-size=5120" hyperframes render "scenes/scene-$n" -o "clips/scene-$n.mp4" --quiet; done
```
EP2 用「每批 3–4 个、Bash timeout 设 560000(~9.3 分钟)」跑了 6 批渲完 19 个 clip。**短场景(~30s)可 4 个一批,含长场景(>50s)就 2–3 个一批。**

全部 clip 齐后,跑一次 render-d2.sh 做 clip 校验 + concat + 混音 + 封面截图(clip 全缓存,秒级):
```bash
zsh .claude/skills/blog2video/scripts/render-d2.sh $OUT 1
```
**⚠️ 坑 B(EP1 踩过,EP2 已规避):render-d2.sh 是 `#!/bin/zsh`,务必用 `zsh` 跑,别用 `bash`**(bash 跑时 `${0:A:h}` 取目录失败,封面那步报 `Cannot find module '/shoot-cover.mjs'`)。
- **封面(shoot-cover.mjs)EP2 一次成功,没复现 EP1 的 puppeteer 挂起。** 若再遇挂起:先 `pkill -9 -f "chrome-headless-shell"; pkill -9 -f "Chrome for Testing"; pkill -9 -f "shoot-cover.mjs"`(别杀用户正常浏览器),再后台重跑 `node .claude/skills/blog2video/scripts/shoot-cover.mjs $OUT 1`;仍不行用 Playwright MCP 兜底截 `file://$OUT/cover_photo.html`(1080×1920)。
- 改了 `cover_photo.html`(比如调字号)只要重截封面:`node .claude/skills/blog2video/scripts/shoot-cover.mjs $OUT 1`,不用重渲正片。
- 渲完用 **Read 看 `video_1_cover_photo.png`** 目检封面;再 ffmpeg 抽一帧正片(`ffmpeg -ss 330 -i video_1.mp4 -frames:v 1 <scratchpad>/f.png`)用 Read 确认混音片有画面+字幕。

---

## 6. ⚠️⚠️ 交付的大坑(EP2 卡在这里,EP3 提前规划)

**症状:** 渲完后,**agent 的沙箱 Bash 会对 `~/Desktop` 下"本轮 epoch 之前写的"文件报 `Operation not permitted`(EPERM)**——`cp`/`head`/`rclone` 读旧文件全失败,连 `dangerouslyDisableSandbox: true` 也压不住(是 macOS 层 seatbelt/TCC,不是 harness flag 能解的)。**本轮新写的文件能读,写新文件能写,列 rclone 远端也能(网络操作不碰本地保护目录),但读旧的成片/clip/脚本不行。** EP2 是在 date rollover(跨天)后触发的权限 epoch 重置。

**后果:** `rclone copy ./$OUT/ gdrive:...`(要读本地 6 个文件)会失败,报 `failed to open directory ... operation not permitted`。

**EP3 的应对(按优先级):**
1. **尽量在同一 epoch 内、趁早交付**:渲染一完成就立刻 rclone 上传,别跨长时间/跨天,旧文件还在可读授权里时上传就不会 EPERM。
2. 若已 EPERM:**让用户在自己的终端跑上传**(用户的 shell 不受 agent 沙箱 epoch 限制)。给他这条(EP2 验证过的形态):
   ```
   rclone copy "/Users/yufanp/Desktop/Project/blog2video/blog2video-output/ai-native-founder-playbook-ep3-mvp/" "gdrive:blog2video/ai-native-founder-playbook-ep3-mvp/" --include "{video_1.mp4,video_1_cover_photo.png,video_1_script.md,video_1_audio.vtt,source_blog.md,meta.json}" --progress
   ```
   提示用户可在 Claude Code 输入框用 `! <命令>` 跑,或开一个普通 Terminal 跑。**上传后你用 `rclone lsf gdrive:blog2video/ai-native-founder-playbook-ep3-mvp/` 核对远端恰好 6 个文件**(列远端是网络操作,你这边能跑)。

---

## 7. 交付(渲完 + 封面齐之后)

**归组决策已定(2026-06-28 用户拍板):每集独立文件夹,不合并系列 meta。** EP3 传到自己的 slug 目录,与 EP1/EP2 并列。

只传 **6 个文件**:`video_1.mp4` + `video_1_cover_photo.png` + `video_1_script.md` + `video_1_audio.vtt` + `source_blog.md` + `meta.json`。
- `meta.json` 抄 EP2 的改 `source` 字段为 `ai-native-founder-playbook-ep3-mvp`;**不要**写 title/description/tags(Claudiny 服务器生成)。`source_blog.md` 用 EP3 的 MVP Stage 清洗稿。
- 上传命令见 §6(优先 agent 自己传;EPERM 就让用户跑)。传完 `rclone lsf` 核对远端只有这 6 个。
- 投递完告诉用户:**视频已上传到 Google Drive (blog2video/ai-native-founder-playbook-ep3-mvp/),Claudiny 会基于脚本自动生成标题/描述/标签并排期发到小红书和视频号。**

---

## 8. 一句话给新 session 的起手式

> "读 `HANDOFF-founders-playbook-EP3.md`,按它把 Anthropic Founder's Playbook 的 MVP Stage(PDF 从 p15 起,先读目录确认页范围,注意双栏要视觉读页)做成系列第 3 集。先抽取清洗 → Insight Memo → Script(用 §3 的 Hook 规矩),写完 narration 把 Hook 连同几个第①句变体拿给我确认,再往下做 slide/TTS/d2 场景/渲染/封面/交付。"
