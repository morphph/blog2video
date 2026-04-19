# Insight Memo: Resolvers — The Routing Table for Agent Intelligence

## title_zh
两万行 prompt 越塞越笨？

## one_sentence_thesis
Agent 系统之所以失败，不是因为模型不够聪明，而是因为大多数人在塞 prompt 而不是建"路由表"——缺了这层路由，能力会静默失联、知识会缓慢降级、所谓系统只是"一堆技能+祈祷"。

## why_this_video_exists
大多数 Agent 教程讲的是怎么"加能力"（更多技能、更多工具、更长 prompt）。这篇博客反过来：它讲一个被所有人忽略的治理层——resolver（路由表/调度表），并用一个具体数字（CLAUDE.md 从 20000 行砍到 200 行、Claude Code 亲自叫停）和一个可复现的 bug（13 个写 brain 的 skill 里只有 3 个查路由表）证明：没有这层管理，Agent 就是一个没有组织架构的公司。观众拿不到的是这套"Agent 即组织"的治理视角，以及具体的四道防线（trigger evals / check-resolvable / 共享 filing rules / 自学习路由表）。

## judgment_lines

- 不是模型塞得越多越聪明，恰恰相反——往系统提示里塞 20000 行知识会让模型注意力溃散，正确做法是给它一份 200 行的路由表，让它"在需要的时刻取到正确的那本书" — 来源：作者自述 CLAUDE.md 膨胀到 20000 行后，"Claude Code 自己告诉我该砍了"；砍到约 200 行决策树后响应更快、更准、幻觉更少。
- 能力存在但路由表不知道，比根本没有这个能力更危险，因为它制造了"系统能处理"的幻觉，等到要用时才发现失联 — 来源：OpenClaw 的签名追踪 skill 写好了却没在 resolver 注册；用户问"check my signatures"时系统直接耸肩，相当于"医院里有外科医生但不在科室名录里"。
- Agent 系统的崩溃不是戏剧性幻觉，而是一种"缓慢静默的漂移"——文件被归到错的目录、连接不再形成、知识库慢慢变成一个有 14700 个文件的杂物抽屉 — 来源：Manidis 文章被误归到 `sources/`（原始数据倾倒目录）而非 `civic/`（政策分析目录）触发审计，暴露 10/13 skill 有硬编码路径。
- 路由表是会腐烂的——Day 1 完美，Day 30 漏登 3 个新 skill，Day 60 触发词和用户实际说法对不上，Day 90 它已经变成"系统曾经能做什么"的历史文档 — 来源：作者观察到自己开始用"read skills/flight-tracker/SKILL.md"这种直接路径调用绕开 resolver，意识到"这不是系统，这是一个有文件柜的人"。
- 真正在搭建的不是技术模式，而是一个组织的管理层：skill 是员工，resolver 是组织架构图，filing rules 是内部流程，check-resolvable 是合规审计，trigger evals 是绩效考核——Agent 之所以不好用，是因为大家在造"一堆员工 + 模糊协作"的公司 — 来源：作者在博客后半段明确把架构重新框定为 management layer。

## evidence_map

- [具体数字] CLAUDE.md 从 20,000 行塞到模型明显变慢、Claude Code 自己提醒砍，重构成约 200 行路由式决策树后立刻变好。
- [具体数字] 13 个写 brain 的 skill 中，只有 3 个引用 resolver，10 个写死了默认路径（idea-ingest → `sources/`，pdf-ingest → `originals/`，meeting-ingest → `meetings/`）。
- [具体数字] 40+ 个 skill 里，check-resolvable 首次运行发现 6 个 skill 完全不可达，占 15%——包括一个 flight tracker、一个只在 cron 跑的 content-ideas generator、一个在目录里但 resolver 根本没列的 citation fixer。
- [具体 bug 场景] 把 Will Manidis 的"No New Deal for OpenAI"政策分析丢给 agent 摄入，结果被写进 `sources/`（应进 `civic/`）——因为 idea-ingest 技能内部硬编码了默认目录 `brain/sources/`，绕过 RESOLVER.md。
- [具体 bug 场景] signature-tracking 子系统建在 executive-assistant skill 内部且功能完整（DocuSign 截止日、未签文件、提醒草稿），但 resolver 没有 "signatures / what do I need to sign" 这个 trigger，所以"check my signatures"永远触达不到。
- [具体 bug 场景] 触发词和用户说法错配：skill 描述处理 "track this flight"，用户实际说 "is my flight delayed?"——描述一回事、用户一回事，skill 不触发。
- [具体数字/一手引用] 该系统每天处理 200 条输入，brain 仓库含 25000 个文件。
- [具体事实] 修复不是把 10 个 skill 逐个修（whack-a-mole），而是建一份共享的 `_brain-filing-rules.md` + 强制每个写 brain 的 skill 顶端加两行"先读 RESOLVER.md 和 _brain-filing-rules.md，按主题而非来源或 skill 名归档"——自此零误归档。
- [具体事实] 作者建了一个 50 条样例输入 + 期望输出的 trigger eval 测试集，区分 false negative（该触发没触发）和 false positive（错的 skill 被触发），两种都可通过改 markdown 修复、无需改代码。
- [一手引用] "You have a collection of skills and a prayer." —— 作者对"没有 resolver 测试"状态的定性。
- [一手引用] YC 办公时间某 CTO 提问："Could an RLM be used to solve context rot particularly around resolvers?"——作者由此展望一个"从 800 次调度记录中自我重写触发词"的自学习 resolver，并把 Claude Code 的 AutoDream 视为原始版本。
- [具体事实] Resolver 是分形的：skill resolver（AGENTS.md，任务→技能）、filing resolver（RESOLVER.md，内容→目录）、context resolver（每个 skill 内部的子路由）——同一套架构在每层重复。

## non_obvious_points

- 一个"存在但不可达"的 skill 比完全没有这个 skill 更糟 — 为什么这不显而易见：直觉上"多一个能力总没坏处"，但作者指出这会制造虚假的能力幻觉，让你以为系统在处理而它根本没接到任务——"Missing is honest, unreachable is a lie"。这是 agent 系统独有的失败模式，传统软件里没有对应物。
- 修复方向不是"修 10 个 skill"而是"加 1 条强制前置规则 + 1 份共享 filing rules 文档"——把治理从分散的实现里抽出来，变成一层可以集中修正的共享合约 — 为什么这不显而易见：工程直觉是遇到 10 个 bug 修 10 个 bug，但作者指出这是打地鼠；真正的杠杆是把"归档逻辑"从 skill 内部搬到 skill 外部的一份文档里，让每个 skill 在写之前强制查表。
- Resolver 是会腐烂的文档，不是一次写完就稳定的配置——因此它需要 linter（check-resolvable）、绩效考核（trigger evals），最终需要一个能从流量中自学习的反馈环 — 为什么这不显而易见：大多数人把 routing table 当成静态配置文件，不会意识到它和代码一样需要 CI、需要审计节奏、需要退化检测；"Day 90 它是历史文档"这个比喻只有在实际跑过几十个 skill 之后才会显现。

## tradeoffs_and_limits

- 自学习 resolver（RLM 重写触发词）目前只是"前瞻性想法"，作者自己也承认"尚未完全建成"，现有系统依赖的是人工维护 + check-resolvable 每周审计 — 具体表现：博客在展望段明确写 "This is forward-looking. We haven't fully built it."，并只把 Claude Code 的 AutoDream 称作"原始版本"，不是成品。
- 即便 resolver 做对了，仍需要持续的治理成本：每周跑 check-resolvable、维护 50 条 trigger eval、新增 skill 就要登记到 AGENTS.md——这是一份永不完工的工作 — 具体表现：Day 30 会漏登新 skill，Day 60 会触发词漂移，作者自己都出现过"我知道该调哪个 skill 所以凑合用了"的绕过，证明哪怕作者本人也会放任路由表腐烂。
- 这套方法假设你愿意把 agent 当组织来管理——员工、组织架构、合规、绩效——这对只想"写点脚本让 AI 帮忙"的用户是过度工程，它的回报只有在 skill 数量和文件数量跨过阈值之后才会显现 — 具体表现：作者举的参考规模是 40+ skill、25000 文件、每天 200 输入；在小规模下 resolver 带来的治理开销可能高于收益。

## what_to_leave_out

1. **不该进入的素材**
   - GBrain / GStack / OpenClaw / Hermes Agent 的推广段（博客末尾"I want you to build your own brain"整节） — 原因：这属于产品广告，和视频要传达的核心认知无关；若进入会让视频变成带货。
   - GStack 有 72,000+ GitHub stars 这个数字 — 原因：是营销侧信号，和 resolver 论点无关。
   - 作者在"Thin Harness, Fat Skills"前作里提的其他四个定义（skill-as-method-call、diarization、thin harness 等） — 原因：提了会引出另一条独立叙事线，稀释"resolver 是被忽略的那一个"这个主论点。
   - 开源 / 自己搭 AGI / index card 等口号式结尾 — 原因：煽情收束，对 Script Writer 没有可用的具体证据。

2. **应避免的叙事方向**
   - ❌ 不要写成"手把手教你用 resolver"的实操教程 — 原因：博客本身不是教程，它是一个通过具体 bug 反向推出抽象原则的案例集；写成 tutorial 会丢掉"为什么"。
   - ❌ 不要一开头就抛"resolver 是 agent 系统的治理层"这种抽象定义 — 原因：这是博客结论而非起点，应该让观众从"20000 行 CLAUDE.md 越塞越慢"这种具体窘境切入。
   - ❌ 不要把 resolver 简化成"路由表"一个概念就收尾 — 原因：博客最关键的升级在后半段（resolver 会腐烂 → 需要 eval → 需要 check-resolvable → 终局是 self-learning），只讲"路由表"会砍掉一半价值。
   - ❌ 不要把这条视频定位为"Agent 入门" — 原因：论点预设观众已经有 agent / skill / 系统提示词 的基础概念；把它做成入门会既讲不透 resolver 又对新手无用。

## signature_line
塞 20000 行让模型变笨，200 行的路由表反而让它变聪明——Agent 缺的不是更大的大脑，而是一张组织架构图。
