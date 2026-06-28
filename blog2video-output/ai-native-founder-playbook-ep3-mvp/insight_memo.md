# Insight Memo: AI-Native 创始人手册 EP3 —— MVP 阶段：AI 删掉了免费的护栏，你得亲手装回去

## title_zh
AI 把创业的刹车全拆了，你得自己装回去？

## one_sentence_thesis
MVP 阶段不是"施工期"，它仍然是在收集证据——只不过这次收集的是关于"解法"的证据；而真正的危险在于，AI 删掉了工程成本和时间这两个天然瓶颈，可这两个瓶颈过去恰恰是"免费的护栏"，逼着创始人不乱来——所以当速度变免费，唯一还稀缺的东西是判断力，那些过去白送的纪律，现在必须靠你在动手前一条条亲手写进文档里重建。

## why_this_video_exists
绝大多数"AI + 创业"内容告诉你 AI 能多快帮你做出 MVP。这一集要给的是它压根没说的那一层：MVP 阶段的四个失败模式——架构混乱（agentic technical debt）、数据骗人（false PMF）、功能失控（zero-friction scope creep）、新手不懂安全（insecure by inexperience）——看起来是四件不相干的事，其实是**同一个根因**：一个过去"免费存在"的强制函数（工程成本、时间、那种逼你先量后发的慢）被 AI 删掉了。所以解药也都是同一个形状——把过去白送的护栏，开工前亲手写成文档：架构文档 / CLAUDE.md、scope 文档、launch 前的测量框架、任何用户碰到前的 security review。观众从别处拿不到的判断：① 把四个挑战读成一个；② 这阶段稀缺的不是速度（速度已经免费），而是判断力；③ 几个反直觉的 PMF 试金石（Sean Ellis 40%、effort test 的"拉 vs 推"），以及"pivot 不是失败，是系统在正常工作"。

## judgment_lines
- "MVP 阶段仍然是在收证据，不是搞建设——只是这次收的是关于'解法'的证据" — 来源：原文开篇 "the MVP stage is still fundamentally an evidence-gathering exercise. The difference is that you are now gathering evidence about the solution instead of the problem space"；退出条件是 retention / revenue / referral 的真实 PMF 证据，不是产品"做完了"的感觉
- "AI 删掉的不是麻烦，而是天然瓶颈——而那些瓶颈过去是免费的护栏，逼你不乱来；这也是为什么 AI 技术债会'复利式'累积" — 来源："AI essentially removes every natural bottleneck that once controlled what reaches production"；scope creep 那段点名 "the traditional forcing function against it—the real cost of engineering time—no longer exists"；普通技术债 "builds gradually and can be cleared"，但 "AI technical debt, however, compounds"
- "早期火爆 ≠ PMF——那股劲是临时的，到第 6 周、第 12 周就散了" — 来源："early traction is not the same as product-market fit. Launch energy is generated from ephemeral forces"（创始人的朋友 / 投资人其他 portfolio 公司里的潜在买家 / Hacker News 头条带来的 spike），"none of these reliably predicts what happens at week six or week twelve"
- "scope creep 之所以危险，正因为每一次加功能单独看都'合理'" — 来源："each individual addition is defensible. Of course the product should handle that edge case"；用 agentic coding 加一个功能只要一下午、几乎免费，所以当下根本不像 scope creep；解药是开工前写好 scope 文档，把决策点从"该不该做"挪到"是不是一批用户明确说没它就拿不到价值"
- "代码能跑 ≠ 代码安全——漏洞在被人利用前是隐形的，没有任何反馈回路提醒你出了问题" — 来源："agentic coding tools generate code that works, not code that is inherently secure. Functional code is easy, because either the feature works or it doesn't. Security vulnerabilities are invisible until they're exploited, which means there's no natural feedback loop"

## evidence_map
- [具体数字 / litmus] **Sean Ellis 测试**：问活跃用户 "How would you feel if you could no longer use this product?"，若超过 **40%** 回答 "very disappointed"，是有意义的 PMF 指标。全片最硬的数字锚点
- [具体时间点] 临时的 launch 能量来自三类力量——创始人的朋友、投资人其他 portfolio 公司里的潜在买家、Hacker News 头条带来的 spike——"none reliably predicts what happens at **week six or week twelve**"。第 6 周 / 第 12 周是可直接复述的硬时间点
- [具体机制对比] 普通技术债 vs AI 技术债："Some technical debt is appropriate... builds gradually and can be cleared over time or in a dedicated sprint. **AI technical debt, however, compounds.**" 没把规格和架构约束写在 AI 能读到的地方，每个 session 从零重新推导基础决策、决策悄悄漂移，最后得到一个"没有连贯心智模型"的代码库——"**not because any single piece is bad, but because the pieces were never designed to fit together**"
- [具体反直觉机制] 安全没有反馈回路："Functional code is easy, because either the feature works or it doesn't. Security vulnerabilities are invisible until they're exploited" → 新手创始人不会收到任何信号提醒哪里错了，直到被利用
- [具体 litmus / effort test] PMF 前，retention 靠不断干预（频繁 outreach、激励、私人跟进、创始人英雄式投入）；PMF 后，产品自己开始做这件事——"When things begin **pulling instead of pushing**, that shift in effort is one of the clearest signals that something real has changed"
- [具体动作 / 四道亲手重建的护栏] ① 开工前用 Claude 定义架构（要遵循的模式、要避开的依赖、有意识接受的取舍）→ 存成 **CLAUDE.md**：项目级持久"记忆"，Agent SDK 在目录里运行时自动读取；② 开工前写 scope 文档（做什么 / 刻意不做什么 / 什么样的真实用户证据才配新增功能）；③ launch **之前**建好测量框架——retention benchmark、activation 标准、**Day 7 / Day 30** 目标；④ 任何用户碰到之前做 security review（认证与会话处理、API 响应里的数据暴露、输入校验与注入风险、已知漏洞依赖）
- [具体清单 / false positive] 为你的产品定义"假阳性"长什么样：注册但没激活 / 有收入但没留存 / 初始热情但无重复使用；数据来了之后让 Claude "make the adversarial case against your own traction: what would a skeptic say about these numbers?"
- [一手引用 / 安全底线] "A security review before any user touches your app... is the **minimum responsible threshold** for releasing a minimum viable product into the world."；以及 "founders who treat it [Claude] as [a substitute for security tooling or a human reviewer] are the ones who end up in the **breach stories**"
- [一手引用 / pivot] "The fact that your results don't confirm the direction you started from **is not failure, it's the system working**: the MVP stage is designed to surface this information before you over-invest in the wrong answer"
- [退出标准] MVP 退出条件 = retention（回来用）/ revenue（付费）/ referral（推荐给别人）的真实 PMF 证据；且 "**no single data point confirms product-market fit** because it's a pattern that has to hold across multiple iteration cycles"
- [具体工具] **Claude Code Security**（发布时为 limited beta）：扫描代码库找漏洞 + 给针对性补丁供人审，能发现传统方法漏掉的问题；**Claude Cowork** 接管 outreach / 排期 / bug triage / 迭代追踪（沿用 Idea 阶段同款 MCP 集成）
- [三问诊断] 完成 3 个以上迭代周期还没向 PMF benchmark 移动 → 让 Claude 跑诊断三问：数据里有没有某个 segment 反应不同？designed value 与 experienced value 的差距是定位问题还是产品问题？当前产品要找到真 PMF 需要什么为真、这现实吗？

## non_obvious_points
- 四个失败模式其实是同一个根因——一个"免费的强制函数"消失了 — 为什么这不显而易见：表面看它们是四件不相干的事（架构乱 / 数据骗人 / 功能太多 / 不安全），但它们共享同一结构：过去工程成本和时间这些天然瓶颈会自动逼你做正确的事（先想架构、先定范围、先量后发、先审安全），AI 把瓶颈删了，这些"白送的纪律"就一起没了。所以解药也是同一个形状——把过去免费得到的护栏，开工前亲手写成文档。要把四个 challenge 读成一个，才看得到这层
- 代码库崩坏不是因为哪块代码差，而是因为各块从没被设计成能拼在一起 — 为什么这不显而易见：直觉里"代码出问题"= 某段写得烂；但 AI 技术债的机制正相反——每一块单独看都没问题，问题是每个 session 都从零重新推导基础决策、决策悄悄漂移，最后是"没有连贯的心智模型"。坏的不是零件，是零件之间从没有过统一图纸。这也解释了为什么它"surface late"——平时一切能跑，等真实用户上量那一刻才塌
- 把"早期火爆"误当 PMF 的人，往往是 launch 之后才开始量数据的人，而且用的是"证明什么在 work"的指标，不是"暴露什么没 work"的指标 — 为什么这不显而易见：直觉以为只要发布后认真追踪数据就够客观了；但原文指出顺序本身就埋了偏误——发布后才选指标，会下意识挑那些让自己好看的。真正的解药是 launch **前**就把 benchmark、Day7/Day30、假阳性的样子全定死，让数据有机会反驳你，而不是迎合你

## tradeoffs_and_limits
- AI 的 security review 不能替代专业安全工具或人审——它只是"第一遍" — 具体表现：原文明确 "It's a good habit... It is not a substitute for security tooling, however, or, at higher stakes, a human reviewer—and founders who treat it as one are the ones who end up in the breach stories."凡是碰到认证、密钥、数据处理的发现，必须升级到人审。不要把"让 Claude 扫一遍"讲成"安全搞定了"
- 这套"写文档建护栏"的纪律有持续成本，而且 PMF 永远没有确定性 — 具体表现：每个 Claude Code session 都要重温 scope、喂 CLAUDE.md、结束时回写决策日志（原文称 "five minutes of documentation per session is cheap insurance against architectural drift"）；而 PMF "no single data point confirms it"，要跨多个迭代周期成立——意味着创始人始终在不确定里靠判断收尾，litmus test（40% / 拉 vs 推）是信号不是证书。判断权始终在创始人这边（"a judgement exercise that combines founder intuition with collected evidence"）

## what_to_leave_out
**不该进入的素材：**
- 四段 exercise 的完整操作细节（session template 的字段、三问诊断的逐条措辞、security review brief 的四项清单全搬）——挑 1-2 个最有共鸣的即可，否则变成 how-to 罗列，稀释判断
- Claude Code Security 的 "limited beta / check current availability" 可用性提示——产品状态说明，不是观点
- Claude Cowork 接管 outreach / 排期 / bug triage 的全套操作层细节——EP2（Idea 阶段）已讲过同款 MCP 集成，EP3 点一句"操作杂活交给它、你专心做判断"即可，别重复 EP2
- "keep a human in the loop" 解读用户反馈那段的细颗粒例子（"this is great but I wish I could also..." 的三连追问）——提炼成一句"反馈要人来解读、工具替不了"，不必全搬

**应避免的叙事方向：**
- 不要写成"MVP 阶段操作手册 / how-to"——这是判断与纪律类内容，核心是"AI 删了免费护栏、你得亲手重建"，不是教人一步步搭 MVP
- 不要把全片建立在 40% 这一个数字上——它是 PMF litmus 的锚点，不是论证支柱；支柱是"四个失败模式 = 一个根因"，和"能跑 / 火爆 / 做得出都 ≠ 验证过"
- 不要把 Claude Code 讲成"帮你更快做出 MVP 的神器"——那恰好掉进原文警告的陷阱（速度本就免费、不再是稀缺品）；要强调反过来用：定架构、压测 scope、做对抗性质疑、审安全
- 不要把 pivot 讲成"失败 / 翻车"——原文明确 pivot = 系统在正常工作，是 MVP 阶段被设计出来要暴露的信息；叙事上要把它框成"在过度投入之前止损"的胜利，不是认输
- 不要重复 EP1（founder 重定义 / 杠杆与人头脱钩）和 EP2（先验证再做的纪律）的主线——各承接一句即可，本集主线是 MVP 阶段"先做什么 / 怎么做"的护栏纪律

## signature_line
速度从此免费，于是判断力成了创业唯一还稀缺的东西——AI 删掉的那些瓶颈，过去正是免费替你踩的刹车；现在你得在动手之前，把护栏一条条亲手写回文档里。能跑不等于安全，火爆不等于 PMF，做得出不等于该做。

## hot_keywords
- Claude Code — 全文核心，MVP 阶段的主力 build 工具：生成 / 测试 / 调试 / 迭代，每个 session 开头重温 scope + 喂 CLAUDE.md、结尾回写决策日志。可直接作 Hook 锚点
- CLAUDE.md — 本章的标志性 artifact（虽不在标准热词清单，但对开发者受众是强热词）：架构上下文文档 + 项目级持久"记忆"，Agent SDK 在目录里运行时自动读取。是"亲手把护栏写进文档"这一主线最具象的载体，建议重点用
- Agent SDK — 实质出现一次："CLAUDE.md... automatically read by the Agent SDK when it runs in a directory"，可作 CLAUDE.md 的技术注脚，二级锚点
- MCP — 出现一次且具体："The same MCP integrations that managed discovery logistics in the Idea stage apply here"，承接 EP2，可作二级锚点，不宜当主词
- Claude Code Security — 具体产品（limited beta）：扫代码库找漏洞 + 给补丁供人审。niche 但概念硬，可在"安全"段作具象抓手
- Claude Cowork — 本章实质概念：接管 MVP 阶段 outreach / 排期 / bug triage / 迭代追踪。可作"AI 运营杂工"的具象载体（但避免与 EP2 重复展开）
- Context Engineering（隐含，未点名）— 原文反复强调 "investing in persistent context from day one"、CLAUDE.md 作为 persistent memory，正是 context engineering 的实践，但没用这个词；属隐含提及，可作二级概念锚点，不宜硬塞为主词
- 其余热词（Agent Harness、Codex、Skills、/goal 模式、Computer Use、Subagent）原文均未实质出现，不要硬塞。本片 Hook 建议以"40% 用户说离不开""能跑≠安全""火爆≠PMF""AI 删掉的瓶颈其实在保护你"这类数字 / 反常识锚点为主
