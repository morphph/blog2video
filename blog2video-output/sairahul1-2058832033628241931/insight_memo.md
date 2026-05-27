# Insight Memo: Software Factory with Claude Code (Rahul, 7-Agent System)

## title_zh
1 个 prompt 当 6 个工程师, 注定崩

## one_sentence_thesis
Vibe coding 之所以在 Day 30 失效, 不是因为模型变笨, 而是因为你逼着一个 AI session 同时扮演产品分析师/架构师/后端/前端/测试/审稿人——上游一个错误假设, 会沿着数据模型→API→UI 一路放大成全栈错误, 而结构化的 7 个角色 + 3 个人类闸口才能切断这条扩散链。

## why_this_video_exists
大多数人讨论 Claude Code 时停留在"加 prompt、加 MCP、加 skill"。这篇博客提供了一个被 2.3M 次阅读验证过的、更结构化的视角: **AI 编码失败的根因不是模型, 是把 6 种角色塞进同一个 session**。它把"vibe coding 有天花板"这个直觉量化成了一个可执行的拆分方案——7 个 tool-scope 隔离的 agent + 3 个人类决策点——并且明确指出 human review 不是瓶颈, 而是整个系统得以成立的核心机制。这是观众在"Claude Code 进阶教程"里拿不到的认知。

## judgment_lines
- "你以为你在用 AI 写代码, 其实只是在打字打得更快" — 来源: 作者开篇自述, "I thought I was using AI to code. I was actually just typing faster." Day 1 觉得是魔法, Day 30 监督 AI 比自己写还累。
- "一个 session 当 6 个角色用, 错误一定会沿着数据模型→API→UI 级联放大" — 来源: 原文明确列出"Wrong assumptions in the plan become wrong database models. Wrong database models become wrong APIs. Wrong APIs become wrong UIs."
- "人类 review 不是 AI 系统的瓶颈, 而是它能成立的前提" — 来源: 整套系统只保留 3 个人类闸口(story / brief / PR), 其余全自动; 把"store IDs in memory"这种红旗在 brief 阶段拦截, 而不是 10 个文件改完之后。
- "Backend Builder 物理上碰不到前端, 不是规范约束而是工具权限隔离" — 来源: 每个 agent 被分配 scoped tools(Read-only / 仅 backend 目录 / 仅 test 文件), 跨域污染在工具层就被阻断。
- "自评的作业是没有价值的——Validator 的存在意义就是它不修任何东西, 只说真话" — 来源: 原文 "A self-graded paper is worthless. A validator that sees only what's on disk — not how it was written — is honest."

## evidence_map
- [具体数字: 影响力] 这条 X thread 累计 **2.3M 次浏览**, 是当下 Claude Code 工作流话题里传播最广的方案之一。
- [具体角色清单] 一个未拆分的 Claude Code prompt 同时承担 6 个角色: **Product analyst / Architect / Backend engineer / Frontend engineer / Test engineer / Code reviewer**。
- [具体级联场景] "Wrong assumptions in the plan → wrong database models → wrong APIs → wrong UIs"——上游 1 个错, 下游 4 层全错。
- [具体 bug 案例] **"store IDs in memory"** 是 Spec Writer 阶段最典型的红旗, 必须在 brief 审批时拦截, 否则会在 10 个文件改完后才暴露。
- [具体业务 demo] 演示场景: "Build invoice reminders for invoices unpaid for more than 7 days" —— 一句话触发 7 个 agent 的完整链路。
- [具体 bug 复现] 演示中 Test Verifier 发现 **7 passing / 1 failing**, 失败原因是"manual trigger doesn't check tenant ownership"; Validator 报 Critical + 文件路径 + 行号; 修复后 8/8 通过。
- [具体工具隔离] Researcher / Story Writer / Spec Writer / Validator: **Read-only**; Backend Builder: Read+Edit+Write+Bash 但只在 backend 目录; Frontend Builder: 同上但只在 frontend 目录; Test Verifier: 只能写 test 文件。
- [具体反例: drift 故障] 子说"subscriptions belong to companies", 如果只让 Claude patch, 会出现 `user.subscriptionId` 和 `company.subscriptionId` 同时存在的脏状态。
- [具体规模建议] CLAUDE.md 推荐 **100–300 行**; 整套 setup 耗时 **2–3 小时**; 跑过 **3–4 个 feature** 后 factory 开始适配你的 codebase。
- [Validator 输出格式] 报告按严重度分组: **Critical / Important / Minor**, 每个 finding 都带文件路径和行号; 没问题时如实说"没问题", 不为了显得专业而捏造 issue。
- [3 个 checkpoint] Approve the story → Approve the brief → Approve the PR, 其他全部自动。

## non_obvious_points
- **Vibe coding 不是技术问题, 是组织结构问题** — 为什么这不显而易见: 大多数人把 Claude Code 卡壳归因于"模型不够强"或"prompt 不够好", 但作者指出问题在于"一个会议室里同时塞了 6 个不同工种的人, 还要他们在同一份白板上协作"——这是组织结构错配, 不是个人能力问题。
- **工具权限隔离 ≠ prompt 里写"请不要修改前端"** — 为什么这不显而易见: 直觉上"用文字约束 agent"和"在工具层禁止 agent 访问目录"看起来都能工作, 但前者只是约束意图, 后者是约束能力。一个有 frontend 写权限的后端 agent, 在 context 漂移时一定会越界; 一个根本拿不到 frontend 写工具的 agent, 哪怕想越界也做不到。这是从"软约束"到"硬隔离"的范式跳跃。
- **人类 checkpoint 越少越脆弱, 不是越自由越好** — 为什么这不显而易见: 自动化的常识是"减少人类介入 = 提效", 但这套系统反过来——它把人类锁定在 3 个**必须发生**的决策点(story / brief / PR), 而不是允许人类"想看就看一眼"。强制 checkpoint 反而保证了流程能跑下去, 因为它把"是否要 review"这个决策本身去掉了。

## tradeoffs_and_limits
- **不适合一次性脚本和小工具** — 具体表现: 7 个 agent + 3 次人类审批的开销, 只有在"持续迭代的产品代码库"上才划算。如果只是写一个一次性的数据清洗脚本, 走完整链路会变成纯负担。
- **架构假设错了就必须扔掉对话, 不能 patch** — 具体表现: 作者明确说"subscriptions 归属错误"这种架构级错误, 如果只让 Claude patch, 会出现两套字段共存的脏状态; 正确做法是"throw the conversation away and start fresh with the right assumption baked into the first prompt"——这意味着 setup 成本不可避免要交一些"重启税"。
- **CLAUDE.md 是动态资产, 不是一次性配置** — 具体表现: 它的价值来自"每次 AI 犯一个意外错误时, 问自己'如果 CLAUDE.md 里有这条规则会不会避免?', 然后加上去"——也就是说前几周一定是不顺的, factory 需要 3–4 个 feature 才能真正"知道你的 codebase"。
- **角色越细分, 协议成本越高** — 具体表现: Frontend Builder 必须读 Backend Builder 的 summary 拿到 API 契约; Test Verifier 必须读两个 Builder 的 summary; Validator 必须对比 story / brief / 当前实现三方——这些 handoff 都依赖每个 agent 严格按格式输出 summary, 一个 agent 偷懒少写一行, 下游就拿不到信息。

## what_to_leave_out
**不该进入的素材**:
- 8 步周末 setup 清单 (太教程化, 不是认知输出) — 原因: 观众不需要"教程", 需要的是"为什么这样拆分会工作"的判断框架; setup 步骤可以一句话带过。
- CLAUDE.md 100-300 行的具体建议 — 原因: 这是操作细节, 我们已经在 Anthropic Large Codebases 视频里讲过 CLAUDE.md, 这里不能重复讲。
- 每个 agent 详细的输入输出列表 (Researcher 输出哪 5 项、Story Writer 输出哪 4 项) — 原因: 全讲完会变成"产品功能列表", 失去节奏。挑代表性的 1-2 个 agent 深讲即可。
- "expert knowledge as agents"(支付专家把支付集成 agent 写出来, 整个团队都能用) — 原因: 这是个组织管理论点, 偏离技术核心 thesis, 留给文末一笔带过。
- code.claude.com 安装链接、`/agents` 命令、文件夹结构 — 原因: 工具说明书, 不是认知。

**应避免的叙事方向**:
- 不要写成"Claude Code 进阶教程" — 这个题材已经有大量视频, 我们的差异化在"vibe coding 为什么有天花板"这个认知重构, 不在"怎么搭"。
- 不要把核心建立在"3 个 checkpoint"这个数字上 — 数字本身不是 insight, "人类 review 是系统得以成立的前提"才是 insight。
- 不要重复"harness 比 model 重要" — 已经被 Tw93 / Improvement Loop 视频讲透了, 本片不能再做这个 framing。
- 不要重复"agent 需要 markdown 记忆文件" — 已经被 Hayduk / Improvement Loop / Anthropic Large Codebases 三次讲过, 本片只能略提 CLAUDE.md。
- 不要重复"agent 循环就是成功信号" — 已经被 OpenAI Repair Loops 视频讲透。
- 不要把"7 个 agent"逐一介绍 — 7 个角色逐一讲会变 listicle, 应该把它们抽象成"6 种工种被压在 1 个 session 里"vs"6 种工种分到 6 个隔离 session 里"的结构对比。
- 不要写成"AI 取代工程师" — 作者明确说"The factory doesn't remove you from the process. It removes you from the parts that don't need you." 必须保留这个张力。

## signature_line
你不是在用 AI 写代码——你是在让一个人同时开 6 个会, 还指望他不出错。

## hot_keywords
- **Claude Code** — 全文核心承载工具, 标题、setup 步骤、所有 agent 都基于 Claude Code 构建。
- **Agent / specialized agents** — 全文主线概念, 7 个 agent 各司其职是整个论点的骨架。
- **CLAUDE.md** — 专门有一整节论述其作为"跨 session 记忆"的角色, 推荐 100-300 行, 是 factory 的底座。
- **Subagent** — 隐含概念, 每个 agent 在 Claude Code 中以子代理形式存在, `/agents` 命令是创建入口。
- **Vibe coding** — 全文反派概念, 与"software factory"形成核心对比; 这个词本身正在 dev twitter 高频出现。
