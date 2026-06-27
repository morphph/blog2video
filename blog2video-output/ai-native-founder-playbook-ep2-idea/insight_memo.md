# Insight Memo: AI-Native 创始人手册 EP2 —— 想法阶段（Idea Stage）：在有证据前忍住不做

## title_zh
AI 让做产品几乎免费，为什么反而更危险？

## one_sentence_thesis
AI 把"做出一个产品"的成本压到几乎为零，但这件好事真正的后果是——"做出来"被悄悄当成了"验证过了"，于是想法阶段唯一重要的能力，从"能不能做"翻转成了"在证据出现之前忍住不做"；而过早扩张和被 AI 放大的确认偏误，让这条纪律比以往任何时候都更难守住。

## why_this_video_exists
绝大多数"AI + 创业"内容告诉你 AI 能多快帮你做出 MVP。这一集要给的是相反方向的认知：正因为做产品变得几乎免费、几乎瞬间，"轻易做出来的原型"第一次变成了真正的存在性风险——它让创始人把"我做出来了"误当成"我验证了"，把执行规模拉到远超业务需求的地方；而 AI 还会主动配合你去证明你是对的（确认偏误第一次配上了一个研究引擎）。观众从别处拿不到的两个判断：① 原型只是用来压测对话的道具，对话本身才是证据；② 解药是把同一个工具反过来用——让 Claude 当结构化的"魔鬼代言人"，主动去找反对你的证据。

## judgment_lines
- "做产品变便宜并不是纯粹的好事——'轻易做出原型'这件事，反直觉地第一次成了真正的存在性风险" — 来源：原文 "the rapidity and ease of spinning up a prototype that looks something like a product also, counterintuitively, presents a genuinely dangerous existential risk"；且早在 agentic coding 之前就有 42% 创业死于"做了没人要的东西"，原文判断这个比例"only going to climb"
- "做出来 ≠ 验证了——原型是用来压测对话的道具，对话本身才是证据" — 来源："A working prototype is easy to mistake as concrete evidence that you're solving a real problem, but it's not. Your prototype instead serves as a useful pressure-testing prop for conversations with potential users. These conversations themselves are the real evidence."
- "想法阶段真正危险的不是 AI 会出错，而是 AI 太听话——确认偏误第一次配上了一个研究引擎" — 来源："Ask AI to validate your startup idea and it will find supporting evidence; ask it to size your potential market and it will find the number that makes your TAM look fundable. AI follows your direction"——一个不问难题的创始人，能比以往更快搭出一套"看起来做足了尽调"的、为坏点子辩护的论证
- "解药是同一个工具反过来指——让 Claude 主动论证你是错的、去找反驳你假设的证据" — 来源："The antidote is the same tool, only pointed in the opposite direction"；exercise 要求 ask Claude to argue against your idea / find disconfirming evidence；原文注明 structured devil's advocate "is a core use case at every stage of the AI startup life cycle"
- "想法阶段的第一道门槛是'可证伪'——一个说不清谁有、多频繁、现在怎么办的问题陈述，根本还没资格被拿去验证" — 来源：观察 vs 可测试假设的对比（报销 / 合同审查两个具体例子），exit criterion 要求你能点名 exactly who experiences this problem, how often, how severely, and what they currently do about it

## evidence_map
- [具体数字] **42% of startups failed because they built something nobody wanted**——且这是 agentic coding 时代之前的数据，原文明确判断在 Claude Code 抹平"有想法 → 有产品"距离后，这个失败率"only going to climb"。全文最硬的开场锚点
- [具体对比 / 可测试假设] 观察 vs 可测试假设的两组并列：① "People struggle with expense reporting"（只是观察）→ "Finance managers at mid-market companies spend four-plus hours a week reconciling submissions because their current tools don't integrate with their accounting software"（可测试假设）；② 法务版："Contract review takes too long"（不可测试）→ "In-house legal teams at mid-market companies spend 3+ days per contract review cycle because redlines are managed across email threads rather than a single version-controlled document"（very testable）。"4+ 小时/周""3+ 天/合同审查周期"是可直接复述的硬细节
- [一手引用] 原型本质："A working prototype is easy to mistake as concrete evidence... it's not... a useful pressure-testing prop... These conversations themselves are the real evidence."
- [一手引用] 确认偏误：ask AI to size your market "and it will find the number that makes your TAM look fundable"
- [一手引用] 过早扩张 / 判断力归属："It will generate, test, debug, and refactor a codebase around a fundamentally flawed premise with exactly the same enthusiasm it brings to a great idea. The intelligence in the system is yours."
- [退出标准 / 三问清单] problem-solution fit 三个必须全"是"：① 问题真实且具体（说得出谁经历、多频繁、多严重、现在怎么办）② 你的方案解决的是验证过程揭示的真问题，而不是你最初假设的那个（"Sometimes these are the same thing, but not always"）③ 信号足够支撑 building——但永远不会有确定性，"waiting for it is its own failure mode"
- [具体方法 / 反直觉] customer discovery 的提问陷阱：rookie mistake 是问指向未来的泛问题 "would you use something like this?"；正确做法是查询相关的过去 "tell me about the last time you dealt with this problem"
- [具体概念] competitor neglect（竞品忽视）+ 解药：让 Claude 论证"为什么某个竞品会成功、而你会失败"；按 tier 画竞争格局——direct / indirect / potential acquirers / adjacent players
- [具体动作] 阶段收尾的"5 个人"测试：定义方案依赖的单一核心交互，让 Claude Code 只做这一个，放到 5 个符合目标画像的人面前——这 5 次对话决定你继续做还是推倒重来
- [具体工具链] outreach 自动化：Claude Cowork 用目标画像建 prospect list + 批量个性化邮件 + 通过 MCP 连 Gmail/Google Calendar 排期 + day-seven 跟进 + 实时更新 tracking sheet

## non_obvious_points
- "做出来"反而是危险信号，不该被记进进度栏 —— 为什么不显而易见：直觉里"有了原型"=有了进展，这是几十年的创业常识；但当 building 几乎免费且瞬间完成，"原型存在"本身不再携带任何"问题是真的"的信息量，它只是把"我相信我是对的"重新包装成了"看，它能跑"。要读到"prototype is a prop, conversations are evidence"这一层，才会把"做出来"从成就栏挪到风险栏
- 真正的陷阱不是 AI 不准，而是 AI 太顺从 —— 为什么不显而易见：大众的担忧停在"AI 会幻觉、会出错"；但原文指出的危险方向正相反——它太好用、太配合，能比以往更快地为一个坏点子搭出一套研究详实、看起来做足尽调的论证，而你全程感觉自己很严谨。错误来自它的服从性，不是它的错误率，所以你越用越自信、越自信越危险
- 验证完之后要解决的，往往不是你一开始假设的那个问题 —— 为什么不显而易见：exit criterion 第 2 条特意把 "the problem you originally assumed" 和 "the one the validation process revealed" 区分开，并补一句 "Sometimes these are the same thing, but not always"。直觉以为验证就是给原假设打勾，但验证的真正价值常常是逼你改写问题本身——这意味着"验证成功"有时长得像"我原来想错了"

## tradeoffs_and_limits
- 这套纪律的代价是"慢"且反人性，但它不是"无限验证" —— 具体表现：原文直接承认 "Progressing your AI-native startup concept through the Idea stage can feel like it takes forever. You are a founder and you just want to build."想法阶段本质是研究+验证，要求创始人在最想动手的时刻忍住；但另一面同样是陷阱——"等确定性"本身就是一种失败模式（"waiting for it is its own failure mode"）。所以这不是叫人无限验证，而是要在"动得太快"和"等太久"之间走钢丝
- 魔鬼代言人 / AI 压测有边界：它给的是"该 pivot"的信号，替不了你做判断 —— 具体表现：原文强调 "The intelligence in the system is yours."同一个 AI，既能帮你压测、也能帮你自欺，方向完全由你给的提示决定；它不会主动替你守住客观性，守住的责任始终在创始人这边

## what_to_leave_out
**不该进入的素材：**
- Chat / Claude Cowork / Claude Code 三个产品界面"哪个任务用哪个"的选择表——那是产品定位说明，不是观点；最多一句带过，绝不照搬表格
- TAM/SAM/SOM 建模、buyer landscape、trend analysis 三条 exercise、competitor tier 的完整四类清单——挑 1-2 个最有共鸣的即可，全堆上去会变成方法论罗列，稀释"先验证再做"的主轴
- outreach 自动化的全套操作细节（day-seven follow-up、tracking sheet 的列名）——太操作层，点到"AI 接管联络与排期、你专心准备对话本身"即可
- 章末"接下来就是 MVP 阶段，AI 从研究伙伴变成施工队"的导读句——是系列骨架，EP2 不替 EP3 剧透

**应避免的叙事方向：**
- 不要写成"想法阶段操作手册 / checklist"——这是认知与纪律类内容，核心是"在证据出现前忍住不做"这个反人性的判断，不是教人怎么一步步跑 customer discovery
- 不要把全片建立在 42% 这一个数字上——它是开场锚点，不是论证支柱；真正的支柱是"做出来≠验证"和"确认偏误配研究引擎"这两个机制
- 不要把 Claude 讲成"验证神器 / 帮你更快确认想法对了"——那恰好掉进原文警告的陷阱；必须强调"反过来用"：找反对证据、当结构化魔鬼代言人
- 不要只讲"AI 让你飞快验证"的爽点而无视代价——必须保留至少一条 tradeoff（最优先："想法阶段就是慢、反人性，而且'等确定性'本身也是失败模式"）
- EP2 不要重复 EP1 的"founder 角色重定义 / 杠杆与人头脱钩"论证——承接一句即可，本集主线是 Idea Stage 的验证纪律，别把上一集的结论再讲一遍

## signature_line
AI 让"做出来"几乎免费，于是"做出来"第一次不再等于"对"了——想法阶段真正稀缺的，是在证据出现之前忍住不做的纪律；原型只是压测对话的道具，对话才是证据。

## hot_keywords
- Claude Code — 核心，在想法阶段有两处实质出现：① 综合公开客户反馈、做"免费的竞品客户定性调研"；② 阶段收尾的"做轻量原型"（define the single core interaction → direct Claude Code to build only that）。可直接作 Hook 锚点
- Claude Cowork — 本章高频实质概念（虽不在标准热词清单内，但本文几乎所有研究/综合类工作都靠它）：客户访谈转录综合、竞争格局搭建、TAM/SAM/SOM、outreach 自动化。值得作为"AI 研究伙伴"的具象载体
- MCP — 实质出现一次且具体："connects to Gmail and Google Calendar via MCP" 来管理 outreach 线程与排期。可作二级锚点，不宜当主词
- Skills — 仅在产品对比表里一笔带过（"Folder access, connectors, skills, scheduled runs"），属周边提及，不要硬当主词
- 其余热词（Context Engineering、Agent Harness、Codex、Subagent、/goal 模式、Computer Use）原文均未实质出现，不要硬塞。本片 Hook 建议以"42% 死于做了没人要的东西""做出来≠验证""确认偏误配研究引擎"这类数字 / 反常识锚点为主
