# HyperFrames 迁移方案:从「HTML 截图」到「真动画」

> 调研 + 方案,2026-06-12。结论:用 HeyGen 开源的 HyperFrames 替换「Puppeteer 截图 → Remotion 静态图」这一段,
> 上游 1–4 阶段(memo → narration → split → slide plan)和投递流程**全部不动**,所有 timing JSON 原样复用。
> 仓库里 `.claude/worktrees/heygen/ab-test-hyperframes/` 已有 4 月 17 日做到一半的 A/B 实验,
> Arm B 已渲出 1080×1920@30fps + MiniMax 音轨正确封装的 MP4,技术可行性已验证,只差打分和投产。

---

## 1. HyperFrames 是什么,为什么对口

[HyperFrames](https://github.com/heygen-com/hyperframes) 是 HeyGen 2026 年 3 月开源的 HTML→视频渲染框架
(Apache 2.0,无渲染费/席位费,26.8k stars,采用者含 HeyGen、tldraw、TanStack)。
核心思路:**HTML 即视频源文件** —— 元素用 `data-start` / `data-duration` / `data-track-index` 声明上场时间,
GSAP/Lottie/CSS/Three.js 动画通过 Frame Adapter 被**逐帧确定性 seek**(时间完全虚拟化,同输入必同输出),
Chrome 逐帧捕获后 FFmpeg 合成 MP4,`<audio>` 元素直接作为时间轴上的 clip 被混入成片。

对我们管线的对应关系:

| 现状 | HyperFrames 后 |
|---|---|
| Stage 5 生成静态 HTML(无任何动画) | Stage 5 生成**带时间轴的 HTML scene**(GSAP timeline) |
| Puppeteer 截图 → PNG | 不再截图,HTML 直接进渲染器 |
| Remotion 把 PNG 排时间轴 + 混音轨 + 烧字幕 | `npx hyperframes render` 一步出片(音轨、字幕、转场全在 composition 里) |
| 切页 = 10 帧淡入硬切 | 场景级转场(crossfade/push/shader)+ 场景内逐元素编排 |

关键能力(均已核实):
- **竖屏**:`data-width=1080 data-height=1920`,本地 arm-b 渲染已验证。
- **音频**:`<audio data-start data-duration data-volume>` 原生混流;本地已验证 MiniMax MP3 → AAC 48kHz 封装,时长精确到 146.772s。
- **字幕**:`npx hyperframes transcribe`(本地 Whisper,**支持中文**,`--model small --language zh`)出词级时间戳;
  官方 caption skill 提供 16 种字幕组件。我们也可以直接拿现有 `video_N_audio_subtitles.json`(句级)喂自定义字幕层。
- **工具链**:`init / preview(浏览器时间轴编辑器)/ lint / validate(含 WCAG 对比度抽帧审计)/ inspect(文字溢出检测)/ snapshot / render / benchmark`;
  全部支持 `--json --non-interactive`,为 agent 设计。
- **Claude Code skills**:`npx skills add heygen-com/hyperframes` 装 5 个 skill
  (`hyperframes` 创作规范、`hyperframes-cli`、`gsap`、`hyperframes-registry`、`website-to-hyperframes`)——
  **本会话已可见,arm-b 里已装过**。
- **官方对 Remotion 的差异化**:Remotion 里 GSAP 按真实时钟跑(4 秒动画在捕获的头 1 秒内跑完),HyperFrames 是逐帧 seek;
  HTML 是 LLM 训练语料的大头,agent 写 HTML 比写 React+Remotion 可靠得多。Remotion 优势是 React 生态和久经考验的 Lambda 规模化。

### 风险清单(0.x 软件,要正视)

| 风险 | 影响 | 缓解 |
|---|---|---|
| 版本churn:11 周发了 207 个版本,Frame Adapter API 标注 v0 experimental | 升级可能破坏 composition | 锁版本 + `--docker` 渲染固定 Chromium/FFmpeg/字体 |
| **issue #1348:encode 超过 600s 被 kill** | 我们单集 17 分钟,encode 有触线风险 | Phase 0 用 loop-engineering video_1 实测;必要时按场景分段渲染 + ffmpeg concat;`--gpu` 硬编;关注 issue 修复 |
| `data-volume` 范围 0–1,不能动画(#1064) | 现 Remotion 用 `volume={3}` 增益;HyperFrames 可能无法 >1 | Phase 0 实测成片响度 vs 现管线;若需增益,确认方案(此项受 NEVER 「不做 loudnorm/boost」约束,需对齐) |
| preview 中子合成音频偏移 bug(#1174,render 正确) | 仅影响预览体验 | 知悉即可,以 render 为准 |
| 长视频渲染时长/内存 | 17 分钟 ×30fps=31k+ 帧 | `--workers auto`(每 worker ~256MB);`benchmark` 找最优参数;draft CRF 出样片 |
| 中文字体打包 | 渲染器自打包字体 | arm-b 已验证 PingFang/Noto Sans SC 正常;新品牌字体选 OFL/免费商用、本地安装 |
| **大号 CJK 字体 OOM(实测踩到)** | 本机 8GB RAM,渲染 worker 跑 node v20 默认堆 ~2GB | 见下方「实测教训」,投产必须处理 |

### 实测教训(2026-06-13 渲三支样片时踩到,投产必读)

渲染 worker 不是用我装 CLI 的 node v22,而是 spawn `/usr/local/bin/node`(**v20.17.0,默认堆 ~2GB**)。
本机只有 **8GB RAM**。三支样片里,d2/d3(MiSans/得意黑,字体文件小)一次过;**d1「纸面信号」用思源宋体,
两个 OTF 各 23–24MB(共 47MB)被逐文件 base64 嵌入,叠加 headless Chrome 对大号宋体字形的逐帧栅格化,
堆涨到 2.3GB 触发 `FATAL ERROR: Reached heap limit - JavaScript heap out of memory`(SIGABRT/exit 134),连崩 3 次**。

修复(两手并用后 exit 0,耗时 225s):
1. **一个字重只留一个文件**:把 700/Bold 的 `@font-face` 指向 Heavy 同一个 OTF(Heavy 本就比 Bold 重,次级标题视觉无损),
   47MB → 24MB,Chrome 常驻字体内存减半。**禁止同一字族嵌入多个大 CJK OTF**。
2. **加大堆**:`NODE_OPTIONS="--max-old-space-size=5120" hyperframes render --workers 1`。
3. 并发渲染会叠加内存(两个 `--workers 2` 同跑直接 OOM)——**8GB 机器上样片串行渲、`--workers 1`**。

对投产的影响(尤其选了 d1 宋体方向时):
- 字体子集化(只保留用到的字形)能把 24MB OTF 砍到几百 KB,根治内存与体积 —— 进 Phase 2 工具链。
- 单集 17 分钟(31k 帧)远超 40s 样片,内存/时长风险更高:优先考虑**分场景渲染 + ffmpeg concat**,
  或在内存更大的机器/`cloud render` 上跑;`--docker` 同时锁定 node 版本(避免 worker 落回 v20 默认堆)。
- 与风险表 #1348(>600s encode 被 kill)叠加:长视频务必分段。

---

## 2. 动效最佳实践 → 写进 prompt spec 的规则

调研覆盖 Mayer 多媒体学习原理(唯一有严格实证的:temporal contiguity 9/9 实验 d=1.22、redundancy 16/16 d=0.86)、
西方头部创作者(Johnny Harris / Cleo Abram)、小红书/视频号平台数据、Hormozi 字幕规范、GSAP 技法。
**完整 12 条规则如下,Phase 2 原样编入新的 scene-generator prompt:**

1. **不与口播同步就不动**:每个元素的入场绑定 VO 时间戳,在被说到的 ±300ms 内出现;重点内容绝不提前露出(观众会先读完就不听了)。
2. **永不整页上屏**:列表、图解、对比都跟着口播逐条 build;一页只在它的口播段结束时才"完整"。
3. **节奏底线**:前 30s 每 10–15s 必须有视觉变化,之后每 20–30s;任何画面静止不得超过 5s(慢推近景也算变化)。
4. **同一时刻只有一个焦点动画**:VO 讲 A 时只有 A 在动,其余冻结或仅做环境级微动。
5. **环境呼吸感**:每个场景 1.00→1.03~1.05 的缓慢 scale 漂移(场景间交替推/拉),禁止大幅快速平移(前庭安全)。
6. **画布文字=关键词,不是逐字稿**:单次上屏 ≤8–12 个汉字;整句字幕只住底部字幕带(1 行 ≤10 字、54–108px、语毕停留 +0.5s)。
   中文平台规范是**整句上屏**,不是英文圈的逐词卡拉OK;"Hormozi 能量"用画布大字关键词实现,不动底部字幕。
7. **关键词强调=信号不是入场**:VO 说到关键术语时,用色块扫过/兄弟元素压暗到 30%/下划线 draw-on(200–300ms),而不是重新入场。
8. **入场语法**:300–400ms、power2.out、y 偏移 16–32px + fade、词级 stagger 0.03–0.08s;出场 150–250ms ease-in;
   scale 弹跳上限 105%;bounce/elastic/spin 全片至多 1 个 hero moment。
9. **数字会数数**:统计数字 1–3s ease-out count-up,VO 说完数字的瞬间正好落停;用等宽数字。
10. **图解按逻辑顺序画出来**:箭头/连线/下划线用 stroke draw(0.6–1.2s),方向跟随论证方向;图表是长出来的,不是 pop 出来的。
11. **Hook 场景特殊**:前 3s 放全片最大胆的 kinetic text(反直觉论断或问题),3s 内给出 payoff 信号;
    15–20s 处埋前向钩子(「后面有 X」);25–35s 处放一次 pattern interrupt(布局/配色反转),之后每 2–3 分钟一次。
12. **节奏预算**:每 ~30s 口播一个「知识锚点」场景边界 + 视觉重置;场景内规划 2–4 个 build 步骤。
    平台数据:小红书知识类 3–5 分钟互动量 >2×,视频号 3s/15s/20s 三个流失判定点 —— **单集时长值得在编辑层重新讨论**(见 §5 待决)。

技法词汇表(给生成器用):GSAP SplitText(3.13 起免费)做词级遮罩 reveal、DrawSVG/stroke-dashoffset 画线、
counter snap、超大画布 + transform 平移缩放做「镜头」、只动 transform/opacity 保性能。

---

## 3. 品牌方向:三选一(完整规格)

调研结论的共同模式:**一个克制的底色 + 唯一签名强调色 + 一个"人手感"信号**(衬线/纹理/手绘/网格)。
我们现在的「1 个深底 + 5 个强调色」正好是反面。2026 趋势:暗紫科技渐变已是每个 AI 工具的默认输出,正在过时;
Pantone 2026 年度色 Cloud Dancer(米白),Adobe/Canva 趋势报告都指向 warm、anti-AI-slick、手工感。
小红书侧:知识类封面=大字报(主标题 3–7 字、80–120px)、手写感标记 CTR +38%、暖色高饱和是平台验证过的点击杠杆;
信息流是浅色 UI,**暖浅色既融入 feed 又在 AI 内容的暗色扎堆里差异化**。视频号人群偏大龄,更吃清晰可信、不吃炫酷。

### 方向 1 —「纸面信号 Paper Signal」(暖编辑部·浅色)★ 推荐
- 气质:认真排版的中文科技杂志专栏,「我替你读完了硬核材料并划好了重点」。对标 Anthropic 书卷奶油色系。
- 色板:底 `#F6F2E9` 暖奶油 / 卡片 `#FFFDF7` / 墨色文字 `#1C1A16`(对比 ~14:1 AAA)
  / **签名色 陶土橙 `#D9603B`** / 墨蓝 `#3E5C76`(数据·代码)/ 苔绿 `#6F7D4E`(正向)/ 印章红 `#B3382C`(警示,当印章省着用)
- 字体:思源宋体 Heavy(标题,OFL)+ MiSans(正文,免费商用)+ JetBrains Mono(代码,OFL)+ 霞鹜文楷(手写批注层,OFL)
- 纹理/母题:2–3% 纸纹噪点、细编辑线与脚注编号、陶土色手绘下划线/圈注、每集一枚红色印章式集数章
- 动效性格:编辑部式从容 —— 长 ease-out、按阅读速度扫出的马克笔高亮、排版式文字落位、零弹跳
- 为什么:同时踩中宏观趋势与小红书暖色信任色系;在暗色 AI 内容堆里辨识度最高;日光下最易读;对视频号大龄人群最友好。
  风险:缩略图一眼「科技感」弱 —— 用 mono 字体 + 代码块母题补。

### 方向 2 —「终端霓影 Terminal v2」(精修暗色·单一酸性强调)
- 气质:Linear/Vercel 式指挥舱,开发者自我认同。保住现有暗色资产,但把「藏青 + 5 色」换成纪律性的单色 + 一个信号灯。
- 色板:底 `#121212` 暖近黑(不是藏青)/ 面板 `#1C1C1E` / 主文字 `#EDEBE6` / 次级 `#8A8A85`
  / **签名色 酸性黄绿 `#CCFF4D`**(每一帧都在)/ 电青 `#5FD3E8`、信号珊瑚 `#FF6B5E`(各 ≤10% 帧出现)
- 字体:MiSans Heavy/Demibold 全家桶 + JetBrains Mono 当身份元素(时间戳、页码、终端框)
- 母题:蓝图点阵网格、终端窗口 chrome、闪烁光标 logo、1px keyline、极淡扫描线
- 动效性格:工程师式干脆 —— 6–10 帧切换、打字机 + 光标、计数器 tick、网格线 draw-in,零晃动
- 为什么:小红书侧暗色科技仍被明确推荐给 AI 内容,此方向是它的 2026 版;开发者身份信号最强;与现有素材连续性最好。
  风险:仍在最卷的暗色 AI 赛道里,差异化全靠强调色纪律 + mono 工艺感。

### 方向 3 —「高亮笔记 Highlighter Pop」(明亮玩趣)
- 气质:最聪明同学的划重点笔记 × 新波普贴纸文化,大字报能量,为小红书 CTR 物理学而生。
- 色板:底 `#F2EFE6` 暖骨白 / 文字 `#191919` / **荧光黄 `#FFD43A`**(关键词扫过)/ 橘 `#FF7A1A` / 钴蓝 `#2447F0` / 贴纸粉 `#FF5C8A`(梗层)
- 字体:得意黑(OFL 零限制,B站/短视频原生气质)+ 阿里巴巴普惠体(正文)+ IBM Plex Mono + 霞鹜文楷(涂鸦旁注)
- 母题:3–4px 粗描边 + 错位硬阴影贴纸、手绘箭头圈注、撕纸胶带、半调网点、胖圆角 bento 数据卡
- 动效性格:弹性 —— squash-and-stretch、贴纸拍上带 2–3° 旋转过冲、荧光笔实时扫过,1–2s 必有东西在动
- 为什么:与小红书封面点击杠杆一一对应,最能停手指。风险:声量大易损「专家感」,视频号大龄人群接受度最低,需要最强的艺术指导才不像营销号。

**推荐:方向 1 为主基调,借方向 3 的「荧光笔关键词扫过」做画布强调手法**(这正好也是动效规则 7 的实现)。
方向 2 作为 B 选项保留。最终用 30s 样片 A/B 定(见 Phase 1),不拍脑袋。

---

## 4. 架构与实施计划

### 改动面(只动两处)

```
不动:Stage 1–4(memo/narration/split/slide-plan)、TTS(MiniMax)、timing JSON 三件套、投递(rclone/meta.json/NEVER 清单)
改动:
  Stage 5  slide-html-generator.md  →  scene-generator spec
           产物:index.html + compositions/scene-N.html(GSAP timeline 注册到 window.__timelines)
           场景 data-start/duration 由现有 alignSlideTiming 逻辑(slide_map + minimax raw subtitles)注入
           场景内元素时间戳:句级用 video_N_audio_subtitles.json;词级用 npx hyperframes transcribe --language zh
  Stage 6  render-all.mjs 增加 --renderer hyperframes 路径(Remotion 保留为 fallback)
           Puppeteer 截图段跳过;npx hyperframes render → out/video_N.mp4;封面图改用 hyperframes snapshot 或保留现截图逻辑
```

音频两条路都通:继续 MiniMax TTS(时间戳走现有 JSON);**将来换真人自录**,则 `hyperframes transcribe` 出词级时间戳,
timing 合同自动替代 MiniMax raw subtitles —— 架构不变。

### Phase 0 — 把烂尾实验做完(½ 天)
arm-b 用 loop-engineering video_1 渲**完整 17:20 成片**,填掉空着的 `comparison.md`:
画质/音画同步(≤0.5s 判据)/ encode 是否触发 600s kill / 渲染耗时与内存 / 成片响度 vs 现管线(volume 增益问题)。
这是 go/no-go 闸门。

### Phase 1 — 品牌定向(1 天)
取 loop-engineering 开头 30s(hook 段,最考验),按方向 1 和方向 2 各做一支样片(draft CRF 快渲),你看片定方向。

### Phase 2 — 写规范(1–2 天)
- `design/design-system-v2.md`:获选方向的全套 token(色/字/纹理/母题/安全区不变:上 200 / 左右 72 / 下 420)
- `prompts/scene-generator.md`:替代 slide-html-generator,内嵌 §2 的 12 条动效规则 + GSAP 技法词汇表 + 转场规范
  (每次场景切换必有转场、每元素必有入场、除末场景禁出场动画 —— 官方 skill 的硬规则照搬)
- 字幕层:底部整句字幕组件(吃现有 subtitles.json)+ 画布关键词强调组件
- `hyperframes lint / validate / inspect` 进入生成后的自检步骤(对比度审计 + 文字溢出检测,agent 可机读)

### Phase 3 — 管线集成(1 天)
render-all.mjs 接 `--renderer` 开关;锁 hyperframes 版本;`--docker` 可复现渲染;投递流程零改动
(交付物清单不变,`*.html`/manifest 本来就在排除名单里)。

### Phase 4 — 试产与对比(1 期内容)
新管线全流程跑一期新内容上线,对比平台数据(完播率、互动),达标后设为默认 renderer,Remotion 退役为 fallback。

### 待决事项
1. **品牌方向**:看完 Phase 1 样片拍板(我的推荐:方向 1 + 方向 3 的荧光笔手法)。
2. **单集时长**:平台数据说知识类 3–5 分钟互动 >2×,我们现在单集 17 分钟。Episode Splitter 本来就支持多切 ——
   是否借这次改版把切集策略调短?(纯编辑决策,与渲染器无关,但同一窗口期做完最划算)
3. **响度策略**:现 Remotion `volume={3}` 与 NEVER「不 boost」条款本就矛盾,HyperFrames `data-volume` 上限 1 会把矛盾显性化,Phase 0 实测后定。

---

## 附:主要来源

- HyperFrames:[GitHub](https://github.com/heygen-com/hyperframes) · [官方文档](https://hyperframes.mintlify.app/quickstart) · [官网](https://hyperframes.heygen.com/) · [vs Remotion](https://hyperframes.mintlify.app/guides/hyperframes-vs-remotion) · [silenceper 评测](https://silenceper.com/en/article/2026-05-02-hyperframes-html-video-rendering/)
- 学习科学:[Mayer 多媒体原理](https://waterbearlearning.com/mayers-principles-multimedia-learning/) · [Reducing Extraneous Processing](https://www.researchgate.net/publication/262915119)
- 节奏/字幕:[AIR retention editing](https://air.io/en/youtube-hacks/advanced-retention-editing-cutting-patterns-that-keep-viewers-past-minute-8) · [Hormozi 字幕规格](https://ascynd.io/en/blog/hormozi-captions) · [OpusClip 字幕设计](https://www.opus.pro/blog/video-caption-design-placement) · [中文字幕规范](https://subanana.com/zh-HK/blog/four-points-to-note-when-creating-video-subtitle) · [视频号完播率](https://zhuanlan.zhihu.com/p/348358347) · [2025 视频笔记种草洞察](https://zhuanlan.zhihu.com/p/1969782831904461116)
- 设计趋势:[Creative Bloq 2026](https://www.creativebloq.com/design/graphic-design/texture-warmth-and-tactile-rebellion-the-big-graphic-design-trends-for-2026) · [Adobe Creative Trends 2026](https://business.adobe.com/resources/creative-trends-report.html) · [小红书封面设计分析(花叔)](https://www.huasheng.ai/insights/xiaohongshu-image-design/) · [woshipm 封面 CTR](https://www.woshipm.com/marketing/5525145.html) · [Anthropic 品牌(type.today)](https://type.today/en/journal/anthropic)
- 字体许可:[得意黑](https://github.com/atelier-anchor/smiley-sans) · [霞鹜文楷](https://github.com/lxgw/LxgwWenkaiGB) · [JetBrains Mono](https://www.jetbrains.com/lp/mono/) · [MiSans 许可讨论](https://www.zhihu.com/question/508873535)
- GSAP 技法:[SplitText](https://gsap.com/docs/v3/Plugins/SplitText/) · [DrawSVG](https://gsap.com/docs/v3/Plugins/DrawSVGPlugin/) · [Codrops GSAP tips](https://tympanus.net/codrops/2025/09/03/7-must-know-gsap-animation-tips-for-creative-developers/)
