# Blog Type Taxonomy

## 方法论

- **样本数**: 25 篇精读 + ~50 篇通过标题/作者扫描辅助归类（总池 75 篇）
- **聚类逻辑**: 抛开题材与作者，只看作者对读者说什么、怎么说——"这篇博客的核心动作"是什么？发现 5 个稳定的"叙事意图"：定义/规范、指导/操作、主张/论证、复盘/亲历、解释/拆解。每一类的 narration 重心都不同，强行套用会让叙事变扁。

## 类型表

| Type ID | 中文名 | 定义（1句） | 辨别特征（3–5 个 observable signals） | 典型样本（2–3 个文件路径） | 该类型 narration 的叙事重心一句话 |
|---|---|---|---|---|---|
| **A. Reference** | 规范参考型 | 第一方文档/官方说明，目的是让读者准确知道某个工具/参数/接口存在并如何调用 | (1) 命令、参数、API、版本号密集 (2) 几乎无 "I/We" 叙述，作者隐身 (3) 大量 "When X happens, Y" 条件句 (4) 通常来自官方 docs / cookbook (5) 没有立场，没有故事 | `blog2video-output/claude-code-goal-docs/source_blog.md`<br>`blog2video-output/headless-mode/source_blog.md`<br>`blog2video-output/scheduled-tasks/source_blog.md`<br>`blog2video-output/web-search-tool/source_blog.md`<br>`blog2video-output/openai-codex-follow-goals/source_blog.md` | 重心在「这是什么 + 它在系统里的位置 + 用它要注意哪几条边界」——narration 要替观众把规范从干燥的参数表翻译成"什么时候用得上、踩坑在哪"，主播立场是导游而非评论员 |
| **B. Playbook** | 实操手册型 | 把某个工作流/技巧打包成"你照做就能用上"的 N 步法，强调读者动作 | (1) 大量祈使句 ("Do X", "Don't Y") (2) 有编号步骤、清单或"X 个 hack" (3) 提供可复制 prompt / 命令 / 文件模板 (4) 常出现成本/时间收益的具体数字 ("$375/week", "15→30min") (5) 标题里常出现 "How to", "N steps", "Master", "Guide" | `blog2video-output/best-practices-computer-browser-use/source_blog.md`<br>`blog2video-output/red-green-refactor-claude-code/source_blog.md`<br>`blog2video-output/0xcodez-2057807200173613450/source_blog.md` (Karpathy CLAUDE.md)<br>`blog2video-output/pawelhuryn-2036058594433519790/source_blog.md` (4-layer prompt)<br>`blog2video-output/anatolikopadze-2054568935274549597/source_blog.md` (18 steps)<br>`blog2video-output/mvanhorn-2061877533885473181/source_blog.md` (agentic hacks)<br>`blog2video-output/eng_khairallah1-2053405155630936297/source_blog.md` (context engineering course) | 重心在「一个具体的小工具/小习惯 + 为什么之前做错了 + 现在怎么对」——narration 要把"今天回去就能改"这件事讲清楚，主播立场是教练，不停问"你做过吗、踩过坑没" |
| **C. Manifesto** | 立场宣言型 | 作者抛出一个反共识/反直觉的论点并系统论证，目标是改变读者的判断而非教读者操作 | (1) 标题就是观点 ("PRDs are dead", "Models are commodity") (2) 早期段落即出现 "Most people are wrong about X" / "Here's why" (3) 论证依赖类比、对比、数据点而不是步骤 (4) 通常无 step-by-step 章节 (5) 作者身份显著（CEO/创始人/知名研究者），署名权威是论证的一部分 | `blog2video-output/agent-harnesses-2026/source_blog.md`<br>`blog2video-output/thin-harness-fat-skills/source_blog.md`<br>`blog2video-output/coding-agents-reshaping-epd/source_blog.md`<br>`blog2video-output/addyosmani-2053231239721885918/source_blog.md`<br>`blog2video-output/juliandeangelis-ai-agents-future/source_blog.md` (Spec is new code) | 重心在「一句反直觉的判断 + 三个证据 + 一个让你不得不接受的结论」——narration 要把作者的判断当成一场辩论的开场陈述来讲，主播立场是把作者的观点替观众"接住、放大、考问" |
| **D. Field Report** | 亲历复盘型 | 作者讲"我（或我们团队）真的用 X 做了 Y，发现了 Z"，故事感强，结论嵌在经历里 | (1) 大量第一人称 ("I built", "We tried", "It broke") (2) 有时间线/版本迭代 ("Version 1 was terrible, then we added...") (3) 通常带具体数字背书（行数、收入、token、星数） (4) 包含失败模式与修复，不只是成功结果 (5) 包括转录稿/对谈式内容（即"亲口讲述自己经历"） | `blog2video-output/garrytan-gstack/source_blog.md`<br>`blog2video-output/garrytan-2053127519872614419/source_blog.md` (meta-meta-prompting)<br>`blog2video-output/garrytan-2046876981711769720/source_blog.md` (skillify failures)<br>`blog2video-output/superpowers/source_blog.md`<br>`blog2video-output/lessons-from-building-claude-code-prompt-caching-is-everything/source_blog.md`<br>`blog2video-output/openai-codex-long-horizon-tasks/source_blog.md`<br>`blog2video-output/effective-harnesses-for-long-running-agents/source_blog.md`<br>`blog2video-output/obsidian-claude-code-life/source_blog.md`<br>`blog2video-output/managed-agents/source_blog.md`<br>`blog2video-output/karpathy-end-of-coding-agents-loopy-era/source_blog.md` (Karpathy interview transcript) | 重心在「主角 + 困境 + 转折 + 顿悟」——narration 要把它讲成一个让观众跟着"我"一起走过弯路再上岸的故事，主播立场是把作者的第一人称翻译成自己的转述，不能丢掉那个"试错→明白了"的情绪曲线 |
| **E. Mechanism Breakdown** | 机制拆解型 | 作者拿一个复杂的系统/概念（无论是别人的产品、一段代码、一个抽象框架）做"显微镜式"剖析，告诉读者"它内部到底怎么运转" | (1) 全文围绕一个对象的解剖（架构、层、组件、流程） (2) 大量表格、层级图、循环图、组件清单 (3) 用类比帮助理解（"CPU vs Harness OS"、"steel for organizations"） (4) 没有强调"你该怎么做"，重点是"你该怎么看懂这件事" (5) 通常没有强烈个人立场，作者像一个解说员 | `blog2video-output/akshay-pachaar-tweet/source_blog.md` (Anatomy of Harness)<br>`blog2video-output/troyhua-tweet/source_blog.md` (6-layer memory pipeline)<br>`blog2video-output/claude-code-leaked-architecture-panorama/source_blog.md`<br>`blog2video-output/ivanhzhao-notion-thoughts/source_blog.md` (Steam, Steel, Infinite Minds)<br>`blog2video-output/openai-cookbook-iterative-repair-loops/source_blog.md` | 重心在「先给一张地图，再带观众走一遍这台机器/这个概念是怎么运转的」——narration 要像拆机视频的旁白，主播立场是把抽象结构翻译成读者大脑里能"看见"的画面，强类比、强分层、弱号召 |

## 边界 / 混合情况

### 模糊样本与 fallback 判定

1. **`claude-code-leaked-architecture-panorama`**：是 E（机制拆解）还是 D（亲历）？  
   判定 E。虽然作者用第一人称讲"我花了 12 小时读源码"，但全文 95% 在拆 Claude Code 的内部结构。第一人称只是包装，叙事主体是 Claude Code 这个对象本身。**Fallback 规则**：如果"我/我们"是讲述者而非主角，归 E。

2. **`obsidian-claude-code-life`**：是 D（亲历）还是 B（实操）？  
   判定 D。它是对谈转录，包含具体配置步骤，但叙事框架是"我用这套方法改变了生活"的故事弧线，步骤穿插在两人对话里而不是清单。**Fallback 规则**：编号步骤是不是结构主干？是 → B；如果只是辅助论证 → D。

3. **`pawelhuryn-2036058594433519790`** (4-layer prompt)：是 B（手册）还是 E（机制）？  
   判定 B。它确实在"拆解"一个 4 层模型，但每一层都附带"你应该这样写"的可复制模板。**Fallback 规则**：终点是不是让读者今天就改？是 → B；终点是"让你看懂结构" → E。

4. **`ivanhzhao-notion-thoughts`** (Steam, Steel, Infinite Minds)：是 C（宣言）还是 E（机制）？  
   判定 E。Ivan 确实有立场（AI 是组织的钢铁），但全文结构是"用钢铁/蒸汽/城市三个历史隐喻搭建一张地图"，论证靠类比建构而非反驳共识，目的是让读者重新"看见"AI 时代而不是采纳一个具体判断。**Fallback 规则**：核心动作是"驳斥共识立场"还是"用隐喻搭新地图"？前者 → C，后者 → E。

5. **`karpathy-end-of-coding-agents-loopy-era`**：是 D（亲历）还是 C（宣言）？  
   判定 D。Karpathy 在做大量观点输出（"the loopy era"），但形式是访谈，叙事靠"我去年 12 月发生了什么、我看到 Peter 这么干"的第一人称经验。**Fallback 规则**：观点是从一段亲身经历里长出来的 → D；观点是开门见山摆出来再论证 → C。

### 最容易混的两组（区分锚点）

- **C（宣言）vs D（亲历）**：都有强立场。**锚点**：C 的开场是"你们都错了，因为 X"，论证用对比/数据/类比；D 的开场是"上周我遇到一件事"，论证用时间线和具体失败。**测试**：把开头 200 字遮住——还能感觉到"作者经历过什么"的，是 D。
- **B（手册）vs E（机制）**：都常含拆解和分层。**锚点**：B 的每一层都对应一个"你做什么"，E 的每一层都对应一个"它是什么/它怎么动"。**测试**：把全文的祈使句删掉——B 会塌掉一半，E 几乎不变。
- **A（规范）vs B（手册）**：都很"工具"。**锚点**：A 是"这是产品规格"，B 是"基于产品我教你工作流"。**测试**：作者署名是产品团队/官方 docs → A；署名是个人/有"我"的口吻 → B。

## 抽样标注表（附录）

| 样本 slug | 类型 ID | 一句话标注 |
|---|---|---|
| `agent-harnesses-2026` | C | "2025 是 agents，2026 是 harness"——开门反共识，列三家公司做证据，结论是 harness 才是护城河 |
| `claude-code-goal-docs` | A | Anthropic 官方文档讲 `/goal` 命令的用法、判定逻辑、与 `/loop`/Stop hook 的对比 |
| `garrytan-gstack` | D | Garry Tan 自述 60 天写 60 万行代码，逐步介绍他开源的 gstack 工厂如何把 Claude Code 变成 20 人团队 |
| `karpathy-end-of-coding-agents-loopy-era` | D | Karpathy 对谈，讲自己进入"AI psychosis"的亲历，从中长出对 Claude/agent harness 的判断 |
| `superpowers` | D | 复盘 Jesse Vincent 的 Superpowers 项目从 0 到 67K stars 的过程、每个版本针对哪类 AI 失败 |
| `best-practices-computer-browser-use` | B | Anthropic 官博告诉你截图分辨率应该选什么、点击不准的几类排错路径 |
| `lessons-from-building-claude-code-prompt-caching-is-everything` | D | Claude Code 团队总结他们围绕 prompt cache 做了哪些反直觉决定，"我们以前破坏过缓存，因为做了 XXX" |
| `red-green-refactor-claude-code` | B | 把 TDD 老方法重新包装给 AI 编码时代的开发者，附带可粘贴的 TDD skill 文件 |
| `headless-mode` | A | Agent SDK CLI 模式（曾叫 headless）的所有参数说明 |
| `openai-cookbook-iterative-repair-loops` | E | 拆解 review→repair→validation 三阶段循环的架构，给出 schema 与停止条件 |
| `ivanhzhao-notion-thoughts` | E | 用 steel/steam/cities 三个隐喻搭建 AI 时代的组织地图，目的是换一种"看见" |
| `coding-agents-reshaping-epd` | C | Harrison Chase 论断 "PRDs are dead" 并展开 EPD 角色将如何重组 |
| `dual-audience-ai-products`† | (file missing in sample list) | — |
| `thin-harness-fat-skills` | C | Garry Tan 立论"thin harness, fat skills"是 1000x productivity 的真正解释，对抗"better model"叙事 |
| `akshay-pachaar-tweet` | E | 用 CPU/OS/RAM 类比拆解 agent harness 的三圈架构 |
| `troyhua-tweet` | E | 从 Claude Code 源码拆出 6 层记忆 pipeline，给出每层成本、触发条件 |
| `anatolikopadze-2054568935274549597` | B | "18 步解锁 Claude 100% 潜力"清单，每步配可粘贴 prompt |
| `anatolikopadze-2057813254617858078` | B | 同上风格，列举 Claude 隐藏功能 + 每项的现成 prompt |
| `garrytan-2053127519872614419` | D | Garry 复盘"book mirror"工作流从 v1 翻车到 v3 救回来的过程，"我用这套系统读完 20 本书" |
| `garrytan-2046876981711769720` | D | 复盘本周两次 agent 失败、如何 skillify 成永久修复 |
| `managed-agents` | D | Anthropic 工程博客复盘他们从 single-container 走到 brain/hands 解耦的过程 |
| `claude-code-leaked-architecture-panorama` | E | 中文长文，拆 Claude Code 51 万行代码的架构骨架 |
| `juliandeangelis-ai-agents-future` | C | 立论 "the spec is the new code"，把 SDD 的三层抽象推为新范式 |
| `eng_khairallah1-2053405155630936297` | B | "Context Engineering 六周完整课程"——每周一个动作清单 |
| `pawelhuryn-2036058594433519790` | B | 4 层 prompt 结构 + 每一层的现成 XML 模板 |
| `0xcodez-2057807200173613450` | B | CLAUDE.md 的 viral 配置文件全文，复制即用 |
| `mvanhorn-2061877533885473181` | B | "Every Agentic Engineering Hack" 清单，每条 hack 一个标题 + 操作 |
| `nickspisak-2037192071254048947` | B | 7-agent 软件工厂的搭建步骤 |
| `openai-codex-long-horizon-tasks` | D | OpenAI 团队复盘 25 小时 Codex 长任务实验：用了什么文件结构、模型怎么撑住 |
| `openai-codex-follow-goals` | A | Codex `/goal` 命令的官方说明 |
| `effective-harnesses-for-long-running-agents` | D | Anthropic 团队复盘他们做 long-running harness 时发现的两类失败模式 + 解法 |
| `obsidian-claude-code-life` | D | 对谈式视频转录，讲述 Vin 如何把 Obsidian + Claude Code 接进生活 |
| `scheduled-tasks` | A | Claude Code `/loop` 与 cron 工具的官方使用手册 |
| `web-search-tool` | A | Web search 工具的官方 API 文档：版本、参数、模型支持 |
| `addyosmani-2053231239721885918` | C | Addy Osmani 立论 "Agent = Model + Harness"，整合 @Vtrivedy10 等多个声音 |

> † `dual-audience-ai-products` 在初步样本里被点名但 `source_blog.md` 文件不存在；未纳入。

## 使用建议（给下游 Template Designer）

- A/B 是工具型，narration 容易写"干"——需要主播替读者把规范/步骤翻译成"什么时候用得上、踩坑在哪"。
- C 是观点型，narration 重心是把"作者的判断"立起来，主播要敢替作者说话。
- D 是故事型，narration 重心是时间线 + 情绪 + 顿悟，主播以"我替你看完这趟弯路"的姿态转述。
- E 是抽象型，narration 重心是把分层结构变成观众脑里能看见的画面，主播是解说员。
- 一篇博客如果同时跨两种倾向（如 D+C），按"主要结构主干"归类，**重心保留主类**，副类可作为副线点缀。
