# HANDOFF — AI 原生创业手册系列 · EP4 (Launch Stage)

> 给**新 session** 的交接书。目标:把 Anthropic 官方《The Founder's Playbook: Building an AI-Native Startup》(36 页 PDF) 的 **Launch Stage 章节**做成系列第 4 集中文口播视频,走 d2「终端霓影」流水线。
> 你没有上一轮的上下文,本文件 + 项目 `CLAUDE.md` + skill `.claude/skills/blog2video/` = 你需要的全部。
> 相关记忆:`~/.claude/projects/-Users-yufanp-Desktop-Project-blog2video/memory/project_founders_playbook_series.md`(系列方案 + 固定 Hook 模板)。
> 本文件是 `HANDOFF-founders-playbook-EP3.md` 的「踩坑升级版」——EP3 实战学到的东西都并进了 §4/§5/§6/§9(尤其:渲染改成「一条后台命令跑完」、auto-sync 已存在、EPERM 这次没触发、封面长标题降字号)。

---

## 0. 这是一个 5 集系列(切集已定)

源 PDF 按创业生命周期分章 → 切成 5 集:

| 集 | 内容 | 状态 |
|----|------|------|
| EP1 开篇 | Ch1 生命周期被重写 + Ch2 创始人变了 | ✅ 已完成(`blog2video-output/ai-native-founder-playbook/`,631s) |
| EP2 | Idea Stage(想法阶段) | ✅ 已完成(`blog2video-output/ai-native-founder-playbook-ep2-idea/`,643s) |
| EP3 | MVP Stage(最小可用产品阶段) | ✅ **已完成**(`blog2video-output/ai-native-founder-playbook-ep3-mvp/`,692s 成片+封面齐,6 文件已传 gdrive) |
| **EP4** | **Launch Stage(发布阶段)** | ⬅️ **你做这一集** |
| EP5 | Scale Stage(+ Same job / Resources 收尾) | 待做 |

**别动 EP1/EP2/EP3 的目录。** 三集成片、封面、交付文件都已就绪。

---

## 1. 源 PDF + 抽取(⚠️ 双栏坑)

PDF:`/Users/yufanp/Downloads/69fe2a55b93bb0732b1fe33c_The-Founders-Playbook-05062026_v3 (1).pdf`(36 页)。
目录(已实测):Idea **p8** / MVP **p15** / **Launch p21** / Scale **p25** / Same job p31 / Resources p33。→ **EP4 = Launch Stage 章节 = p21–24**(章首 p21 是插画分隔页,正文约 p22–24)。
- **先用 Read 工具读 PDF 目录页(p2)+ 章范围确认**:起 p21,止 = Scale 起始 p25 的前一页 = **p24**。Launch 体量比 MVP(p16–20 共 5 页正文)**更短**(约 3 页正文),所以本集预计比 EP3(692s/18 内容 slide)短一些,**口播正文预计 ~1200–1500 中文字、成片 ~7–9 分钟、内容 slide ~13–16 张**。务必读页确认,别照搬 EP3 的 18 张。
- **⚠️ 致命坑:这份 PDF 从 Ch2 起是双栏精排版**,`pdfminer`/`pdftotext` 直接抽会把左右栏按行交错读乱。必须用 **Read 工具读 PDF 页面图像**(`pages: "21-24"`),靠视觉还原正确阅读顺序(**先读完左栏,再读右栏**),再清洗成干净 markdown。
- 删页眉(`Chapter N`)、页码、装饰符;`Think:`/`Note:`/`Exercise:` 侧边栏与 callout 保留;表格按"行=条目"重排;删 emoji。
- 把清洗后的 Launch Stage 全文写成 EP4 的 `source_blog.md`(英文原文即可,后续阶段翻译)。

---

## 2. 输出目录 / slug

EP4 用**独立 slug 目录**(d2 工作区 `scenes/ clips/ scenes-data.json briefs/` 不带 video_N 前缀,同目录跑会覆盖,必须分目录):

```
slug = ai-native-founder-playbook-ep4-launch
OUT  = blog2video-output/ai-native-founder-playbook-ep4-launch
```
先 `git pull`,`mkdir -p $OUT`,把清洗好的 Launch Stage 写到 `$OUT/source_blog.md`。

---

## 3. 固定 Hook 模板(⚠️ 第①句每集给用户挑变体)

**第①句 = 不变的是「Anthropic 官方刚发布手册」这个权威/官方框架,但措辞每集微调**(用户拍板:第一句每集要有不同版本,只保证官方权威感)。**已用过的角度(别重样,但都保官方框架):**
- EP1:`Anthropic 刚刚发布了一份官方手册:在 2026 年,怎么用 AI 从零打造一家创业公司——哪怕你只有一个人。`(原始固定句)
- EP2:`AI 时代到底怎么创业,Anthropic 这次亲自给了官方答案:一份刚刚发布的手册,教你在 2026 年,一个人也能用 AI 从零做出一家公司。`(官方亲自给答案)
- **EP3(用户选的):`Anthropic 刚刚发布了一份官方手册:在 2026 年,怎么用 AI 从零打造一家创业公司——哪怕你,只有一个人。`(「官方手册」前置·庄重,贴近 EP1)**

**EP4 做法:script 写完后,用 `AskUserQuestion` 给用户 3–4 个第①句变体挑**(都保官方权威框架,带 preview 显示整句 + 怎么接 ②)。用户偏「官方权威前置」的庄重感,但他要每集不一样——给他几个新角度(如:点 Claude 出处 / 更短促更狠 / 强调"发布/上线"这一集主题的呼应)。**他对这一句很在意,等他拍板再往下做 slide/TTS。**

**第②句直接承上**(逐字模板,照抄):
> 今天,我们接着上一集,讲 Launch 阶段,发布阶段。

然后接 1 句承上启下的本集定位,直接进内容。

**EP3 讲了什么(供 ② 之后承接参照,别大段回顾):** MVP 阶段 = AI 删掉了工程成本/时间这两个「免费的护栏」→ 速度从此免费、判断力成了唯一稀缺 → 四个失败模式(技术债/火爆≠PMF/scope creep/不懂安全)其实是同一根因 → 解药同形状:开工前把四道护栏亲手写回文档(CLAUDE.md / scope 文档 / 测量框架 / 安全审查)→ PMF 试金石(Sean Ellis 40% + effort test 拉vs推)→ pivot=系统正常工作不是失败。**EP4 主线**:产品有了 PMF 证据之后,怎么**正式推向更大的世界**——从"小范围验证"转到"放大分发/上线"(具体主线读完 Launch 章再定;EP3 结尾已经埋了"下一集进入发布阶段 Launch Stage"的钩子)。

---

## 4. 流水线 runbook(d2 path,与 EP3 完全一致,逐步)

环境:`export PATH="$HOME/.npm-global/bin:/opt/homebrew/opt/node@22/bin:$PATH"`(node 必须 v22.x)。每个 stage 派**独立 subagent**,prompt 让它先读对应规格文件。EP3 全程顺利,照搬即可:

1. **Insight Memo** — subagent 读 `prompts/insight-memo-writer.md` + `$OUT/source_blog.md` + EP1/EP2/EP3 的 `insight_memo.md`(系列声口)→ 写 `$OUT/insight_memo.md`(含 `title_zh`)。
2. **Script Writer** — subagent 读 `prompts/script-writer.md` + EP1/EP2/EP3 的 `narration.md`(系列声口锚定)+ source + memo → 写 `$OUT/narration.md`。
   - **铁律:** 第一人称主播视角;正文禁出现"作者/原文/文中/手册说/playbook/Anthropic 说"等 attribution(权威只在 Hook 出现一次);Hook 用 §3;结尾品牌句逐字:`AI 世界很吵，精读一篇，胜过刷一百条。我们下期再见。`;结尾前加一句**下一集预告(EP5 = Scale Stage,规模化阶段)**;TTS 友好(数字写中文如"百分之四十"、避多音字、每段≤150字、英文术语首次出现带中文解释)。
3. **⚠️ Hook Review 卡点** — 把 narration 的 Hook **连同 3–4 个第①句变体**用 `AskUserQuestion` 拿给用户确认后再继续(见 §3)。选定后把第①句 edit 回 `narration.md` 并同步 `video_1_narration.md`。
4. **单集计划** — 默认不拆:抄 `blog2video-output/ai-native-founder-playbook-ep3-mvp/video_plan.json` 改字段(total_videos:1,title_zh 用 memo 的,slug=上面的,word_count 实数)+ `cp narration.md video_1_narration.md`。
5. **Slide Planner** — subagent 读 `prompts/slide-planner.md` + EP3 的 `video_1_script.md`(格式范本)→ `$OUT/video_1_script.md`(标 `[SLIDE N: type]`,一字不改叙述;**SLIDE 1=cover 装整个 Hook;末张=summary 收尾三段合并 + EP5 预告 + 品牌句**)。**Launch 更短 → 内容 slide 控制在 ~13–16 张**。**自检铁律:** 去标记后口播文字与 narration 逐字一致——subagent 必须跑 python diff 直到打印 `MATCH`(脚本见 EP3 dispatch,strip `# 标题`+`## headers`+`[SLIDE]` 标记后比对)。你这边**再独立跑一次 diff** 确认 `MATCH` 再往下。
6. **Slide HTML Generator** — subagent 读 `prompts/slide-html-generator.md` + EP3 的 slide 范本 → `slide_1..N.html`(内容蓝本,旧深色主题即可,d2 场景生成器会重新换皮)。**封面 `cover_photo.html` + `manifest.json` 由编排者(你)自己写**(抄 EP3 的改参数,确定性强、省一个 subagent;明确告诉 subagent"别碰 cover_photo.html / manifest.json")。
   - **封面系列参数(与 EP1/2/3 一致):** topbar `精读AI · AI 原生创业手册`;kicker `// EP.04 / 05 · ANTHROPIC OFFICIAL PLAYBOOK`;右上 `anthropic.com`;src 胶囊 `The Founder's Playbook: Building an AI-Native Startup`;颜色铁律:酸性绿 `#ccff4d` 每帧 + 最多一种辅助色 电青 `#5fd3e8`,禁紫/红/渐变/emoji。两个数据 chip 各放一个干净数字(从 Launch 章挑硬数据,EP3 用了 40% 绿 + 4 青)。
   - **⚠️ 封面 `.h1` 字号(EP3 实战教训):** 按标题长度选 80–88px;标题长就降到 **80px**,并**把换行处的标点(逗号)去掉**,逼成干净两行。EP3 标题`AI 把创业的刹车全拆了，你得自己装回去`在 88px 断成三行+孤字「了，」,降 80px+去逗号后两行干净(`AI 把创业的刹车全拆了` / `你得自己装回去`)。**改字号只需重截封面,不用重渲正片**(见 §5)。
7. **TTS** — `cd blog2video-remotion && npm run tts -- ../$OUT/video_1_script.md ../$OUT/video_1_audio.mp3`(绝对路径)。产出 audio + `_subtitles.json` + `_minimax_raw_subtitles.json` + `_slide_map.json` + `.vtt`。(EP3 实测 18 slide=686s 音频;Launch 短,预计 ~480–560s。)
8. **build-scenes-data** — `node .claude/skills/blog2video/scripts/build-scenes-data.mjs $OUT 1` → `scenes-data.json` + `briefs/scene-NN.json`(帧吸附;N 张内容 + 1 张 CTA = N+1 个场景)。
9. **写语义 brief.type** — build-scenes-data 只默认 `cover`(场景1)/`summary`(末内容张)/`cta`(尾卡),其余全 `image`。**编排者(你)**按 Slide Planner 的类型,用 python 把 `principle`/`quote`/`comparison_cards`/`checklist` 写回对应 `briefs/scene-NN.json` 的 `type`(image 的不动)。逐场景核对最终 type(EP3 脚本见历史,一段 python 搞定)。
10. **d2 场景生成 ×N** — 每场景派一个 subagent,读 `prompts/scene-generator.md` + kit(d2-base.css/d2-motion.js/components.md/DESIGN.md)+ **同类型黄金范本**(cover→samples/scene-01,image→scene-02,principle→scene-05,comparison_cards→scene-07,quote→scene-16,checklist→scene-17,summary→scene-24,cta→手写)+ 本场景 brief + 源 slide。产出 `src/scene-NN.html`(marker 形式)→ `node scripts/build-scene.mjs $OUT NN` → `scenes/scene-NN/index.html`,自检 `hyperframes lint` + `hyperframes snapshot` 后 **Read contact-sheet.jpg** 目检。**EP3 dispatch prompt 是验证过的好模板,照抄改场景号/类型/内容要点/breath 奇偶即可。**
    - **并发 3 个一批、6 批跑完 19 场景,零 OOM**(8GB 机器,subagent 各自串行 snapshot 自然错峰)。topbar 统一 `精读AI · AI 原生创业手册`;`breath` 奇数场景 `'in'`、偶数 `'out'`;字幕逐字烧入、画布只放关键词、长例子留字幕。
    - **⚠️ 必须在每个 dispatch 里写死的三条(EP3 全踩过,subagent 自己会修但提前说省一轮):**
      - **`gsap_timeline_not_registered` 是良性误报**:它在**每个**场景都报"1 error"(误报 motion.js 库脚本),场景脚本已显式 `window.__timelines['sNN']`,**忽略它**,别让 subagent 为它返工。其它良性 warning:`timeline_track_too_dense`/`overlapping_gsap_tweens __unresolved__`/`composition_self_attribute_selector`/`scoped_css_missing_wrapper`/`font_family_without_font_face`。**真 error = 0** 才算过。
      - **snapshot 的 `--at` 必须一条逗号分隔**:`--at 1,8,15,22`(多个 `--at` flag 会只取最后一个,等于只截一帧)。
      - **字幕重叠**:若 lint 报 `overlapping_clips_same_track`(相邻字幕本地时间重叠 ~13ms,超过 build 自动削的 10ms),把**前一条** `.clip.sub` 的 `data-duration` 削到下一条的 start(文字不动,差 ~12ms 无感),重 build+lint。
    - **辅助色纪律**:签名酸绿每帧必在;除签名色外任意一帧**最多再一种**辅助色(电青 `#5fd3e8` 数据/链接 · 信号珊瑚 `#ff6b5e` 警示/对立面)。EP3 summary 场景一个好判断:Launch 预告本想用青,但珊瑚 hero 行一直在屏 → 改用酸绿避免一帧两辅色。提醒 subagent 注意"持续在屏元素"会和晚到元素叠加辅色。
    - **cta 尾卡(5s 静音无字幕)编排者直接手写**:抄 `blog2video-output/ai-native-founder-playbook-ep3-mvp/src/scene-19.html`(scene 号按 N+1),改 `data-composition-id='sNN'` / 副标文字 `AI 原生创业手册 · 发布阶段 · 完`。**写完记得 `node scripts/build-scene.mjs $OUT NN` 把它也 build 出来**(EP3 漏过这步,渲染前才发现 scene-19/index.html 不存在)。
11. **渲染** — 见 §5。

---

## 5. 渲染(EP3 实测:一条后台命令跑完,最省心)

`render-d2.sh` 逐场景串行渲 → clip 校验 → concat → 混音(raw,不响度处理/不 -shortest)→ `video_1.mp4` → 收尾截封面。**`#!/bin/zsh`,务必用 `zsh` 跑(别用 bash,否则封面那步 `${0:A:h}` 取目录失败报 `Cannot find module '/shoot-cover.mjs'`)。脚本无 `set -e`、支持断点续渲(clip 已存在就 skip)、cover 失败非致命。**

**EP3 实战:把整条 `render-d2.sh` 丢后台一次跑完最省心**(serial 渲不会 OOM,~692s 片子 19 clip 全渲+concat+混音+封面,后台跑完自动回调你)。所有场景生成 subagent 必须**已全部结束**再开渲(渲染和 snapshot 都吃 5GB 内存,别让它俩并发):

```bash
export PATH="$HOME/.npm-global/bin:/opt/homebrew/opt/node@22/bin:$PATH"
cd /Users/yufanp/Desktop/Project/blog2video
zsh .claude/skills/blog2video/scripts/render-d2.sh blog2video-output/ai-native-founder-playbook-ep4-launch 1 > blog2video-output/ai-native-founder-playbook-ep4-launch/render-run.log 2>&1
```
(用 `run_in_background: true` 跑;完成自动通知。EP3 一次 exit 0,19 clip 全 rc=0,无 OOM。)

**渲完核验(必做):**
- `grep -E "render scene|FAIL|MISSING|TOTAL|FINAL|交付片|封面|✓|✗" render-run.log` 看每 clip rc=0、TOTAL 时长、混音核验、封面成功。
- **Read 看 `video_1_cover_photo.png`** 目检封面(尤其长标题有没有断词/孤字)。
- `ffmpeg -ss <中间秒> -i video_1.mp4 -frames:v 1 <scratchpad>/f.png` 抽 2–3 帧(选不同场景 + CTA 尾卡),**Read 确认画面+字幕+混音有内容**。
- **封面只重截不用重渲**:改了 `cover_photo.html`(比如降字号)→ `node .claude/skills/blog2video/scripts/shoot-cover.mjs $OUT 1`,再 Read 复核。
- 若封面 puppeteer 挂起(EP1 偶发,EP2/EP3 没复现):先 `pkill -9 -f "chrome-headless-shell"; pkill -9 -f "Chrome for Testing"; pkill -9 -f "shoot-cover.mjs"`(别杀用户正常浏览器),再后台重跑 shoot-cover.mjs;仍不行用 Playwright MCP 兜底截 `file://$OUT/cover_photo.html`(1080×1920)。

---

## 6. 交付 + 两个权限/git 提醒(EP3 实测)

**git:** 仓库有**后台 auto-sync**(会自动 `auto: sync changes` 提交工作区改动)。所以你手动 `git commit` 偶尔报"no changes added"——不是你的 add 失败,是 auto-sync 已经提交了,**正常,别慌**。`.gitignore` 已排除 output 目录里的 `assets`(symlink)/`snapshots/`/`.hyperframes/`/`*.png`/`*.mp4`,所以 `git add $OUT/` 是安全的(不会误提 png/mp4/快照);`src/` + `scenes/scene-NN/{index,hyperframes,meta}.json` 会入库。milestone 处手动 commit+push 写清楚信息即可,工作树最后保持干净。

**EPERM(这次没触发,但留个心):** §EP3 警告的"跨天后旧文件 `Operation not permitted`"这次**没复现**(EP3 全程能读能写能传)。但交付前**先探一下读权限**最稳:
```bash
for f in video_1.mp4 video_1_cover_photo.png video_1_script.md video_1_audio.vtt source_blog.md meta.json; do
  wc -c < "$OUT/$f" >/dev/null 2>&1 && echo "OK $f" || echo "EPERM/MISSING $f"; done
```
全 OK 就直接传;若某个旧文件(如 `source_blog.md`,可能是开工那天写的)报 EPERM,就**在当前 epoch 用 Write 重写一遍那个文件**(内容你手上有/git 里有),或让用户在自己终端跑上传(用户 shell 不受 agent 沙箱 epoch 限制)。

**交付(渲完 + 封面齐之后):每集独立文件夹,不合并系列 meta(2026-06-28 用户拍板)。** 只传 **6 个文件**,用 `--files-from` 显式列(最稳,绕开排除清单遗漏):
```bash
SC=<scratchpad>; printf '%s\n' video_1.mp4 video_1_cover_photo.png video_1_script.md video_1_audio.vtt source_blog.md meta.json > "$SC/deliver.txt"
rclone copy "$OUT/" "gdrive:blog2video/ai-native-founder-playbook-ep4-launch/" --files-from "$SC/deliver.txt" --progress
rclone lsf "gdrive:blog2video/ai-native-founder-playbook-ep4-launch/"   # 核对远端恰好 6 个
```
- `meta.json` 抄 EP3 的改 `source` 为 `ai-native-founder-playbook-ep4-launch`;**不要**写 title/description/tags(Claudiny 服务器生成)。`source_blog.md` 用 EP4 的 Launch Stage 清洗稿。
- 投递完告诉用户:**视频已上传到 Google Drive (blog2video/ai-native-founder-playbook-ep4-launch/),Claudiny 会基于脚本自动生成标题/描述/标签并排期发到小红书和视频号。**

---

## 7. 一句话给新 session 的起手式

> "读 `HANDOFF-founders-playbook-EP4.md`,按它把 Anthropic Founder's Playbook 的 Launch Stage(PDF p21–24,先读目录确认页范围,注意双栏要视觉读页)做成系列第 4 集。先抽取清洗 → Insight Memo → Script(用 §3 的 Hook 规矩),写完 narration 把 Hook 连同几个第①句变体拿给我确认,再往下做 slide/TTS/d2 场景/渲染/封面/交付。"

---

## 8. EP3 → EP4 速查(直接抄改的文件)

| 你要写的 | 抄哪个改参数 |
|---|---|
| `cover_photo.html` | EP3 的,改 kicker `EP.04`、标题、两个数据 chip、字号(长标题 80px+去断行逗号) |
| `manifest.json` / `video_plan.json` / `meta.json` | EP3 的,改 slug/标题/slide 数/source |
| `src/scene-NN.html`(CTA 尾卡) | EP3 `src/scene-19.html`,改 composition-id + 副标 `… · 发布阶段 · 完`,记得 build |
| d2 场景 dispatch prompt | EP3 每个 batch 的 prompt 模板(已含三条防坑:gsap 误报/`--at` 逗号/字幕重叠) |
| Slide Planner / diff 自检 | EP3 的 python `MATCH` 校验脚本 |

> 全部 d2 硬约束(逐场景渲、串行、node22、加大堆、颜色纪律、安全区、字幕烧入)都在 `prompts/scene-generator.md` + `CLAUDE.md`,subagent 自己会读,本文件只点要害。
