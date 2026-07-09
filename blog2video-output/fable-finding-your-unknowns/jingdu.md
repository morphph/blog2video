---
type: source-summary
created: 2026-07-08
last-updated: 2026-07-08
sources:
  - raw/2026-07-08-fable-finding-your-unknowns.md
tags: []
---

# 精读：A Field Guide to Fable — Finding Your Unknowns

## 精读

**作者**：Thariq（@trq212；Anthropic Claude Code 团队，前 YC W20 / South Park Commons / MIT Media Lab。写作 stake 是内部人第一手总结「怎么和 Fable 5 这代模型协作」——他直接参与了 Fable 的发布）
**来源**：X（原生 Article）· 2026-07-04 发布 · 2026-07-08（vault 抓取日；X 正文在登录墙后，WebFetch/defuddle 抓不到，正文由登录态浏览器提取）· [原文](https://x.com/trq212/status/2073100352921215386)
**传播（抓取时）**：3.35M 浏览 · 8,885 赞 · 20,168 收藏 · 1,524 转发 · 252 回复（同期 "Fable 5 best practice" 长文互动断层第一）
**原文字数**：约 1,400 words · **精读预读时长**：约 8 分钟
**一句话主旨**：和 Fable 5 协作时，活儿的质量瓶颈不再是模型能力，而是**你能不能把「unknowns（未知）」讲清楚**——你给的 prompt/skills/context 是「**地图**」，真正干活的 codebase/真实世界/约束是「**疆域**」，两者之差就是 unknowns。作者用 Rumsfeld 的 known/unknown 2×2 拆解未知，再给出一套按「**实现前 / 中 / 后**」编排的探测技巧（Blind Spot Pass、Brainstorm+Prototype、Interview、Reference、Impl Plan、Impl Notes、Pitch、Quiz），底层经济学是：**每一次探测都是在「变贵之前」用很便宜的方式把未知挖出来**。

---

### 1. 引子：地图不是疆域（原文无小标题，此为段落主题）

和 Claude Fable 5 协作，一遍遍在教作者一个老道理：**the map is not the territory（地图不是疆域）**。

「地图」是对「要做的工作」的一种表示——就是你的 prompts、skills、context，是你**交给 Claude** 的东西。「疆域」是**工作真正需要发生的地方**——codebase、真实世界、它们实际的约束。

地图与疆域之间的差，就是作者所说的 **unknowns（未知）**。当 Claude 撞上一个 unknown，它只能基于「对你想要什么的最佳猜测」去做决定。**活儿越大，Claude 可能撞上的 unknowns 越多。**

> **"Fable is the first model where I find the quality of the work is bottlenecked by my ability to clarify its unknowns."**
> —— Fable 是第一个让作者觉得「工作质量被**我澄清它的 unknowns 的能力**卡住」的模型。

要点是：**光提前规划并不总是够**。你可能在实现的深处才发现 unknowns，或者你的 unknowns 反过来会指向一个事实——你其实应该换一种完全不同的方式来解这个问题。所以和 Fable 协作，是一个在实现**之前、之中、之后**反复发现 unknowns 的迭代过程。（作者附了一组[找 unknowns 的示例 artifact](https://thariqs.github.io/html-effectiveness/unknowns/)，但提醒你要回来建立「何时该用它们」的直觉。）

### 2. Knowing your unknowns（认识你的未知）

你的 unknowns 是什么？作者带着问题来找 Claude 时，习惯把它拆成 4 类（即 Rumsfeld 的 known/unknown 矩阵）：

- **Known Knowns（已知的已知）**：基本就是你 prompt 里的内容——你明确告诉 agent 你要什么。
- **Known Unknowns（已知的未知）**：你还没想清、但你**知道**自己没想清的。
- **Unknown Knowns（未知的已知）**：太显然、你根本不会写下来，但**一看到就认得**的（即隐性知识 / tacit）。
- **Unknown Unknowns（未知的未知）**：你**压根没考虑过**的；你没意识到自己缺的知识；"我知道一件事能做到多好吗？"

顶尖的 agentic coder unknowns 相对很少。作者说看着像 **Boris 或 Jarred** 这样的人写 prompt，一眼就能看出他们**非常细节地知道自己要什么**——他们和 codebase、和模型行为都深度 in-sync。但他们**也会假设存在 unknowns**。

> **"reducing and planning for your unknowns is the skill of agentic coding."**
> —— 减少、并为你的 unknowns 做规划，本身就是 agentic coding 的那门**技能**。

好消息：这是一门**可以通过和 Claude 一起练来提升**的技能。

### 3. Help Claude help you（让 Claude 帮到你）

指令 Claude 是个微妙的平衡：**太具体**，Claude 会照你的指令走，哪怕换个方向更合适它也不换；**太模糊**，Claude 往往会基于「行业最佳实践」做选择和假设，而那些未必适合你的任务。

当你不为 unknowns 做准备时，你会**两头都输**：你不知道哪段路会布满障碍，也不知道哪段路本是坦途、但你其实还是想让 Claude 转向（veer）。

Claude 能帮你**更快**发现 unknowns：它搜 codebase 和互联网极快、对一般话题懂得比你多、从失败里迭代也更快。而这个过程**最重要的一步，是给 Claude 关于你「起点」的 context**——告诉它你在思考流程的哪个位置、坦白你对这个问题和 codebase 的经验，让它像一个 **thought partner（思想伙伴）**那样和你协作。

作者提到他之前写过[用 HTML 和 Claude 协作](https://x.com/trq212/status/2052809885763747935)——几乎所有这些情况里，**HTML artifact 都是可视化与表达的最佳方式**。接下来他详述自己用来挖 unknowns 的一套 pattern：不是每次都全用，而是一个值得备着的技巧集合。

### 4. Pre-implementation（实现前）

**Blind Spot Pass（盲点扫描）** —— 针对 **unknown unknowns**。开工时最有用的事之一，是搞清楚你的盲点。比如你在 codebase 一个新区域写功能，或让 Claude 帮你做设计这类不熟的活，你很可能有一堆 unknown unknowns：你不知道该问什么、"好"长什么样、历史上做过哪些工作、有哪些坑要避。做法：让 Claude 帮你找出 unknown unknowns 并讲给你听。作者爱用字面词 **"blindspot pass"** 和 **"unknown unknowns"**，并强调**给它「你是谁、你懂什么」的 context** 通常很重要。
> 例 prompt：① "我要加一个新的 auth provider，但我对这个 codebase 的 auth 模块一无所知。能不能做一次 blindspot pass，帮我找出相关的 unknown unknowns，并帮我更好地 prompt 你。" ② "我不知道 color grading 是什么但我得给这段视频调色。你能教我理解我在 color grading 上的 unknown unknowns，好让我 prompt 得更好吗？"

**Brainstorms and prototypes（头脑风暴与原型）** —— 针对 **unknown knowns**（那种「看到才知道」的标准）。在充满 unknown knowns、判据只有「见到才会定义」的领域，作者喜欢让 Claude 一起 brainstorm 和做原型。**早在原型阶段就把 unknown knowns 识别并说出来，极其值钱**——因为拖到实现阶段才发现，代价（相对）昂贵：spec 上的小改动会导致代码里天差地别的实现，而且让 agent 回退之前的改动更难。例如你可能只想看「一个按钮加到框里长什么样」，而不必去接后端路由或在前端多维护一份 state。视觉设计对作者就是「难以言表、但看到就知道要什么」——这种时候他会要几种不同的设计方向。作者几乎**每个 coding session 都以 exploration/brainstorm 开场**：带着意图去定义项目 scope；Claude 常能找到他会漏掉的高价值方向，有时也会「只见树木不见森林」；头脑风暴能防止 scope 定得太窄或太宽。
> 例 prompt：① "我想给这份数据做个 dashboard，但我没有视觉品味、也不知道有哪些可能。给我一个 HTML 页面、放 4 个天差地别的设计方向，让我来反应。" ② "在接任何线之前，先做一个单 HTML 文件、用假数据 mock 出新的编辑器工具栏。我想先对布局做反应，再让你碰真 app。" ③ "我的粗糙问题是：用户在 onboarding 后流失。搜 codebase，从最便宜到最激进 brainstorm 出 10 个可以干预的地方，我来告诉你哪些戳中我。"

**Interviews（访谈）** —— brainstorm 之后你多半仍有 unknowns。这时作者会让 Claude **就任何未知或含糊之处访谈他**；请 Claude 访谈时，给它关于你问题的 context 来引导它提问。
> 例 prompt："一次问我一个问题，围绕任何含糊之处，**优先那些「我的回答会改变架构」的问题**。"

**References（参照物）** —— 有时你**描述不出**你要什么（没有对应的语言，或复杂到描述起来要花很久）。这时最好的答案是一个 **reference**。图、文档、图片都可以，但——

> **"the absolute best reference is source code."**
> —— 绝对最好的参照物，是**源代码**。

如果有个库以某种方式实现了你想要的行为、或有个你很喜欢的设计组件，就把 Fable 指向那个文件夹、告诉它去找什么，**哪怕它是另一种语言**。Claude Design 也是这么工作的：你不必递给它文件（虽然也可以），你可以把它指向你喜欢的某网站上的一个模块，它读的是**底层代码而不只是截图**——因此能拿到关于 markup、结构、组件到底怎么搭出来的更丰富细节。
> 例 prompt："`vendor/rate-limiter` 里这个 Rust crate 实现了我想要的那种 backoff 行为。读它，然后在我们的 TypeScript API client 里重实现同样的语义。"

**Implementation Plans（实现计划）** —— 觉得可以动手时，作者倾向让 Claude 先出一份 implementation plan 给他 review，且**重点放在最可能变的部分**（比如 data models、type interfaces、UX flows）——这能让 Claude 把「你其实可能需要改」的东西浮现出来。
> 例 prompt："写一份 HTML 的 implementation plan，但**把我最可能微调的决策放最前面**：数据模型变更、新的 type interface、以及任何面向用户的部分。把机械性的 refactor 埋到最底下，那部分我信你。"

### 5. During implementation（实现中）

**Implementation notes（实现笔记）** —— 计划满意后，作者会**开一个新 session**，把 artifact（如 spec 文件 + prototype）传进 prompt，让 agent 去实现。但事实是：**无论你规划得多充分，总有 unknown unknowns 潜伏**——agent 干活时可能因为在代码里发现的一个 edge case 而需要换打法。作者会让 Claude Code 维护一个临时的 **`implementation-notes.md`**（或 `.html`）文件，记录它所做的决策，好让「下一次尝试」能从中学到东西。
> 例 prompt："维护一个 `implementation-notes.md`。如果你撞上一个迫使你偏离计划的 edge case，**选保守的那个选项**，把它记到 'Deviations' 下面，然后继续走。"

### 6. Post implementation（实现后）

**Pitches and explainers（推介与讲解）** —— 交付一件东西，最重要的环节之一是拿到 buy-in 和批准。在最终文档里搭 pitch/explainer artifact 有两个作用：① 当 reviewer 和你当初一样带着**同样的 unknowns** 起步时，加速他们理解；② 当专家想看到你**已经把他们会预见的 unknowns 和常见失败点都考虑到了**时，加速批准。
> 例 prompt："把 prototype、spec、implementation notes 打包成一个我能丢进 Slack 拿 buy-in 的单一文档。**开头放 demo GIF。**"

**Quizzes（测验）** —— 一段长 session 之后，Claude 可能干了比你意识到的**多得多**的事。光读 code diff 只能给你浅层理解，因为很多行为依赖既有的 code path。让 Claude 在给你大量 context 之后就这次改动**考你**，能帮你真正理解发生了什么。
> **"I only merge after I pass the quiz perfectly."** —— 只有我满分通过 quiz，我才会 merge。
> 例 prompt："我想确保我完全理解这次改动里发生的一切。给我一份关于这些改动的 HTML 报告，让我带着 context、直觉、做了什么等去读懂，并在底部附一个我必须通过的 quiz。"

### 7. How this comes together: launching Fable（融会贯通：发布 Fable 的视频）

Fable 的 [launch video](https://x.com/ClaudeDevs/status/2064399512664526853) **完全由 Claude Code 剪辑**。这对作者是全新领域，他绝非专家——所以他**从已知出发**：

- 他知道 Claude 能用代码剪视频、转录，但不确定够不够准 → 于是让 Claude 给他解释 **Whisper** 这类转录是怎么工作的、他能不能用 **ffmpeg** 准确剪掉「um」和长停顿。（= Blind Spot Pass）
- 他想要一个**和他说的话逐字同步**的 UI，但不确定能不能做到 → 于是让 Claude 用 **Remotion + 转录**做一个 prototype 视频来验证可行性。（= Prototype）
- 最后视频看起来有点**发闷**，他知道这是 color grading 的结果，但并不真懂 color grading 是什么。第一反应是让 Claude 做几个变体来挑，但他意识到——**自己根本不知道 color grading 的「好」长什么样**。于是他改为让 Claude **教他** color grading，以此发现自己的 unknowns。（= 对未知的未知做 Blind Spot Pass）

（作者附了[更详细的解说视频](https://x.com/trq212/status/2064826394589442448/video/1)。）

### 8. Matching the Map and Territory（让地图与疆域对齐）

模型越强，**用对方法**能达成的就越多。当一个 long-horizon 任务返回的结果是错的，很可能你需要**花更多时间定义你的 unknowns**，或者做一份让 Claude 能「即兴穿过」这些未知的 implementation plan。

> **"Every explainer, brainstorm, interview, prototype, and reference is a cheap way to find out what you didn't know before it gets expensive to fix."**
> —— 每一个 explainer、brainstorm、interview、prototype、reference，都是在「**变贵之前**」用很便宜的方式，弄清你原本不知道的东西。

所以——**下一个项目，就从「让 Claude 帮你找出你的 unknowns」开始。**

> [!note] 白板图示：Finding Your Unknowns 的完整论证——从「地图≠疆域」到 unknowns 的 2×2，再到「实现前/中/后」的便宜探测工具箱，最后收在 cheap-now vs expensive-later 的经济学
> 一张论证型白板图，把全文核心论证空间化：**地图（prompt/context）↔ 疆域（codebase/现实）的裂缝 = unknowns → Rumsfeld 2×2 四象限 → 「help Claude help you」的太具体/太模糊双输 → 沿实现前/中/后时间轴的探测（Blind Spot Pass / Brainstorm+Prototype / Interview / Reference / Impl Plan → Impl Notes → Pitch / Quiz）→ 每次探测都是「变贵之前」的便宜挖掘**。按论证顺序标了 7 个 `customData.step`，可分层动画导出。

![[fable-finding-your-unknowns-diagram.png]]

---
## 精读收尾

- **一句话总结**：和 Fable 5 协作，瓶颈从「模型能力」变成「你能不能讲清 unknowns」——你给的 prompt/context 是地图、真正的 codebase/现实是疆域，差就是未知。用 known/unknown 的 2×2 拆解未知，再用一套「实现前/中/后」的**便宜探测**（盲点扫描 / 原型 / 访谈 / 参照源码 / 实现计划 / 实现笔记 / 推介 / 测验），在「变贵之前」把未知挖出来。

- **关键引语**：
  1. **"The map is not the territory."** —— 全文的元隐喻：你给的表示 ≠ 工作真正发生的地方。
  2. **"Fable is the first model where I find the quality of the work is bottlenecked by my ability to clarify its unknowns."** —— 核心命题：瓶颈转移到「人澄清未知的能力」。
  3. **"reducing and planning for your unknowns is the skill of agentic coding."** —— 把「agentic coding 的技能」重新定义为「管理未知」，且可习得。
  4. **"the absolute best reference is source code."** —— 最反直觉、最可操作的一条：描述不出来时，用源码当参照物（Claude 读的是底层实现不是截图）。
  5. **"Every explainer, brainstorm, interview, prototype, and reference is a cheap way to find out what you didn't know before it gets expensive to fix."** —— 收束金句，把整套方法压成一句「cheap-now vs expensive-later」的经济学。

- **与 vault 的连接**：
  - [[html-as-output-format]] —— 本文明确回引 Thariq 自己「用 HTML 和 Claude 协作」的主张；这里几乎每一个探测技巧（brainstorm 出 4 个设计方向、mock 工具栏、implementation plan、pitch、quiz）都以 **HTML artifact** 为载体——unknowns 框架其实是 html-as-output-format 的「用途论」：HTML 不只是输出格式，更是**逼出未知的低成本反应界面**。
  - [[agentic-loop-tracking-files]] —— `implementation-notes.md`（记录 agent 的 Deviations 好让下次学习）与 PLAN.md/EXPERIMENTS.md/SCRATCHPAD.md「工作记忆落盘」是同一个模式；本文补上了「为什么」——因为再充分的规划也挡不住 unknown unknowns 在实现深处冒出来。
  - [[grill-with-docs]] —— "Interviews" 技巧（一次问一个问题，优先「会改变架构」的问题）与 Matt Pocock 的 grill-with-docs 技能几乎同形；两者都把「一问一答的逼问」当作把 unknown knowns 显性化的手段。
  - [[thariq]] —— 作者作为 Claude Code 内部人 + Fable 发布参与者的一手可信度；与其 [[source-thariq-session-management-1m]]、[[source-thariq-html-effectiveness]] 构成同一人的「怎么和这代模型协作」系列。

- **视频适配自评**：**适合**做白板讲解视频。理由：全文有一条干净的可空间化主线——**地图↔疆域的二元框架 → unknowns 的 2×2 矩阵 → 「实现前/中/后」时间轴上的探测工具箱 → cheap-now vs expensive-later 的经济学收束**；既有强钩子（「模型越强，瓶颈越在你」的反直觉命题），又有金句收尾。**弱点/风险**：中段 8 个技巧很容易被讲成流水账 tips 列表——视频必须始终扣住「每个技巧针对哪个象限的未知、把它从哪一格移到哪一格」这条论证线，否则就退化成一篇「Fable prompt 技巧合集」，丢掉了原文真正的心法。

---
### 文末注记（headless 消歧自决）

1. **源文件与 raw 落盘**：X 原生 Article 正文在登录墙后，WebFetch/defuddle 抓不到；正文由用户登录态 Chrome 提取，落盘为 `raw/2026-07-08-fable-finding-your-unknowns.md` 作为可追溯 source of record（X 内容会失效，必须留底）。CLAUDE.md 规定「raw/ 由 human 策展」——用户在本会话明确要求 /learn 本文，视为策展纳入信号；此为消歧自决，若不希望入 raw/ 可删除该文件（精读的 `sources:` 需相应改指 URL）。
2. **原文笔误照录**：raw 保留原文两处明显笔误（"are good have relatively few unknowns"、"before you touch the treal app"）逐字不改；精读按语义重述，未在正文加 sic 标注以免打断阅读。
3. **结构**：原文有明确的 H2/H3（Pre/During/Post implementation + 各技巧小节），精读严格沿用其章节序；phase 段下的技巧以**加粗子块**呈现（未各自拆成独立 `###`），以保留「阶段 → 技巧」的从属关系。引子与结尾无小标题，按段落主题命名并注明。
4. **字数/时长**：英文正文约 1,400 words 为估算，精读预读时长按此估 ~8 分钟。
5. **传播数据归位**：3.35M 浏览等是抓取时的传播指标、非文章论点，仅置于 raw header 与精读元信息头，不进正文论证。
6. **图示放置**：本文论证是「框架 + 时间轴」的整体结构，单一「最相关章节」不突出，故按 founder-mode 黄金样例惯例，将整体论证型白板图嵌于正文之后、精读收尾内。
