# Insight Memo: 300-agent 自改进循环（Kimi K2.6 swarm × Opus 4.8 verify gate）

## title_zh
300 个 Agent 跑一遍，下一遍它就更聪明了？

## one_sentence_thesis
真正的杠杆不在于哪个模型更聪明，而在于你能不能让一次运行「留下点东西」——一个可复用 skill、一条永久约束——让明天那群 agent 比今天的更聪明；模型不变，模型周围的系统在变厚。

## why_this_video_exists
大多数人把 Kimi 当聊天框用，只用到了产品 10% 的能力，从没打开过那个能一次跑 300 个并行 agent、产出真实文件的 swarm 模式。这篇文章揭示的不是「swarm 跑得快」这个表面卖点，而是一个反直觉的机制：单次运行的价值不在它的产出，而在它能不能把这次的流程、领域知识、犯过的错沉淀成下次的起点——让成本从「20 分钟」塌缩到「30 秒」。这是观众在「哪个模型最强」的口水战里拿不到的认知：问题已经从「选谁」变成了「你的 setup 今天有没有比昨天更锋利」。

## judgment_lines
- "一个 agent 干长任务会越干越蠢，不是因为它笨，而是因为它的上下文窗口会被自己填满到溢出，然后开始有损压缩——之后每一步推理都更差" — 来源：原文 step 03，单 agent 在长任务上 fills its window until it drowns and starts lossy summarization；swarm 给每个子任务独立 scoped context，只回传结构化输出，所以不崩。
- "便宜不是用来省钱的，便宜是用来改变你愿意尝试什么的——能负担得起把第一次结果扔掉重跑，这本身就是一种新能力" — 来源：原文 $0.95/M in、$4.00/M out、cache $0.16，"you can afford to throw the first attempt away"，"Cheap volume changes what you're willing to attempt"。
- "用便宜的开源模型干活、用诚实的模型把关——这套分工的现实依据是没有任何单一模型全面碾压" — 来源：基准对比图，MCP Mark Verified 上 GPT-5.5 取 92.9、Kimi K2.7 取 81.1、Opus 4.8 取 76.4、Kimi K2.6 取 72.8，各家互有胜负。
- "你不是在花高价 token 去生成，你是在花它去抓那个会被永久存进 skill 的隐藏缺陷——verify gate 一旦放过，错误就被固化成资产" — 来源：step 05，Opus 的唯一职责是 refute not praise，要在 step 4 把缺陷存成 skill 之前抓住它。
- "便宜的并行量只有在有可信的东西在检查时才是超能力" — 来源：step 03/05，"Cheap volume is only a superpower when something trustworthy is checking the work"。

## evidence_map
- [具体数字] 300 个并行 sub-agent × 4,000 步/次运行，相比 K2.5 的 100 / 1,500 翻了数倍 —— 来自 Kimi 官方公告引用。
- [具体数字+反直觉细节] 4,000 步是整个 swarm 的「总协调预算」，不是每个 agent 4,000 步；300 个 agent 一跑平均每个 ~13 步——短、专、窄的子任务。这条决定了「你的任务是否符合这个形态」。
- [对比数字] 一次免费开源模型的运行，在真实研究任务上得分高于你付 5 倍价钱的模型。
- [具体数字+成本] 定价 $0.95/M 输入、$4.00/M 输出，缓存命中 $0.16/M——重复上下文命中缓存时的单价。
- [对比数字+权威来源] Opus 4.8 据 Anthropic 称比 4.7 放过自己代码缺陷的概率低约 4 倍，是第一个在「不加批判地报告有缺陷结果」上得 0% 的 Claude。
- [震撼对比数字] Run #1 花 20 分钟（搭 spec、verify、distill 的一次性成本）；Run #N 只要 30 秒（附上新文件、复跑 skill）。
- [具体数字] swarm 在 BrowseComp 上的准确率 86.3%，且这一能力会被带进之后每一次复跑。
- [具体产出规格] 一次运行可交付 100+ 个文件、100,000 词的文献综述、或 20,000 行的数据集——真实文件而非聊天文本。
- [基准对比数据] MCP Mark Verified：GPT-5.5 92.9 / Kimi K2.7 81.1 / Opus 4.8 76.4 / Kimi K2.6 72.8——四模型横向对比（Coding：Kimi Code Bench v2、Program Bench、MLS Bench Lite；Agents：Kimi Claw 24/7 Bench、MCP Atlas、MCP Mark Verified），各家互有胜负。
- [具体 worked-example 场景] 贯穿全文的样例任务「Cross-Sectional Factor Decay Audit」（横截面因子衰减审计，量化金融研究）：SOURCES 限定 SSRN、Journal of Finance、AQR / Fama-French 一手数据库，明确写 "No aggregators, no blog summaries"；OUTPUT 要求 1 个 .xlsx、每行一个因子、7 列（name、source paper、in-sample Sharpe、OOS Sharpe、decay %、t-stat、capacity note）+ 200 词简报，文件名 factor_decay_audit_q2_2026.xlsx；ON CONFLICT 标记该行绝不静默；STOP CONDITION 任一 sub-agent 卡超 10 分钟或不足 25 个因子达到三来源标准就停下汇报。
- [具体拆解计划场景] Kimi 运行前给出可读的拆解计划 "Phase 1: Parallel Factor Discovery (5 agents, ~80–100 total searches)"，5 个 agent 各管 8–10 个候选因子（A1 Classic_FF_AQR：HML/SMB/MKT-RF/UMD/QMJ/BAB…，A2 Profitability_Investment，A3 LowVol_Value_Yield，A4 Reversal_Momentum_Behavioral，A5 Additional_Anomalies），统一任务：定位来源论文→提取样本内 Sharpe→找 ≥1 个 2010 年后独立复现→数来源、<3 个就标记。
- [具体执行场景] 运行界面出现系统消息 "BLOCKER: Background agents disabled. Re-dispatching in foreground mode. All 5 agents will run in parallel."——直观体现「遇阻即报、不静默绕过」的执行纪律。
- [具体交付确认场景] "OUTPUT CONFIRMED: factor_decay_audit_q2_2026.xlsx — 1 file, 1 sheet with 40 rows, 7 columns + 200-word brief embedded in a cover sheet."
- [作者信息图] 五拍架构：①BRIEF（你写 spec，Kimi 自行拆解）②SWARM（≤300 agent、4,000 步、产出真实文件）③VERIFY（Opus 4.8 在结果被保存前猎杀隐藏缺陷）④DISTILL（Kimi 把这次运行蒸馏成可复用 Skill）⑤REPLAY（下次从 skill 起步，更快更准）；第 1/2/4/5 拍全程在 Kimi 内，第 3 拍 verify 是唯一让「第二个模型」上场的位置。
- [一手引用/类比] 结论引 DeepSeek：开源发布会重新定义闭源前沿以为自己拥有的东西，整个领域一夜重新校准——「self-learning swarm on an open-weight model has the same shape」。

## non_obvious_points
- 「自我改进/self-learning」并不是模型在两次运行之间重训权重，而是模型周围的系统（skill 库、constraints 文件、喂进去的文档）在变厚——是系统级学习，不是模型级学习 —— 为什么这不显而易见：「self-improving loop」「自学习」这种词会让人直觉以为是模型在变聪明，原文 step 06 专门点破 "The model isn't retraining its weights between your runs."，需要读到这句才能纠正这个默认误解。
- verify gate 的价值随时间递减是设计目标，不是退化：step 8 把 Opus 抓到的 drift 固化成 CONSTRAINTS.md 的硬规则，于是 verify gate 每跑一次要抓的东西越来越少——护城河恰恰长在这个「越来越没事干」的过程里 —— 为什么这不显而易见：直觉会认为把关环节越来越闲是浪费，实际上它意味着错误正在被前移消除、系统在自我加固；而且这个 constraints 文件是从你几个月真实运行里长出来的，竞争对手一周抄不走。
- 真正决定胜负的不是 swarm 跑得多快，而是「读拆解计划」这个几乎免费、却最常被跳过的步骤——一个拆错的 200-agent swarm 会真金白银地烧钱烧时间，检查计划却不花一分钱 —— 为什么这不显而易见：人们被「300 agent」的爽点吸引，会本能地直接点运行；step 02 指出 first-timers 跳过的恰恰是这个「最贵的省略」，且 ~13 步/agent 这个数字反过来告诉你任务形态是否合适。

## tradeoffs_and_limits
- swarm 的已知缺陷：除非你显式要求 verify，它会产出自信但引用不足（under-cited）的论断，独立的 sub-agent 之间有时会自相矛盾——"Looks done" 和 "is correct" 是两个星球 —— 具体表现：原文 step 05 明确这是 the swarm's known flaw，正因如此整套循环必须挂一个第二模型把关，否则便宜的并行量会把错误大规模、自信地生产出来并存进 skill。
- 这套循环有真实的一次性建设成本和形态约束：Run #1 要 20 分钟搭 spec + verify + distill；任务必须能拆成大量「短、专、窄」的子任务（~13 步/agent）才适配 swarm 形态，不是所有任务都吃这套；上游 spec 写得越含糊（一句话 prompt），下游就越烧钱越垃圾。

## what_to_leave_out
**不该进入的素材：**
- 10 个 prompt 模板的逐字内容（spec 模板、read-plan、execute、save-skill、document-to-skill、constraints.md、replay、background-agent 各代码块）——太细节，是「可复制」的实操资产，视频展示其中 1-2 个示意即可，不应逐条念。
- 量化金融样例的全部列名与 STOP CONDITION 阈值细节（in-sample Sharpe、OOS Sharpe、t-stat、capacity note、卡 10 分钟、25 个因子三来源等）——作为一个具体可信的「真实文件长这样」证据点出即可，不必把每列每阈值讲完，观众不关心量化术语本身。
- 基准图里 Coding/Agents 全部子项的逐项分数（Kimi Code Bench v2、Program Bench、MLS Bench Lite、Kimi Claw 24/7、MCP Atlas 等）——只需 MCP Mark Verified 那组对比数字佐证「无单一模型碾压」即可。

**应避免的叙事方向：**
- 不要把全片框架建立在单一数字上（比如只讲「20min→30sec」或只讲「300 agent」）——核心 thesis 是「沉淀成 skill 让下次更聪明」的循环机制，数字是服务于这个机制的证据，不是结论本身。
- 不要写成「Kimi 教程」或「10 步操作指南」——这是认知视频不是 how-to，重点是为什么这套分工/循环成立，而不是手把手教点哪个按钮。
- 不要落进「Kimi vs Opus 谁更强」的模型对战叙事——文章的立场恰恰是这个问题已经过时了，叙事若变成模型 PK 会背离 thesis。
- 不要把 Opus 4.8 当成「更强的生成模型」来夸——它在这套系统里的角色是 refute（证伪/把关），不是 praise/生成，错位会误导观众理解整个 verify gate 的意义。

## signature_line
昨天跑你任务的那群 agent，应该比今天跑它的更聪明——模型没变，是你在模型周围搭的系统在变厚。

## hot_keywords
- Agent / Agent Swarm — 全文核心概念，300 并行 agent、子 agent 独立上下文窗口、background agent 反复出现，是 thesis 的载体。
- Skills — 核心机制词，step 06「Save the whole workflow as a Skill」、step 07 Document-to-Skill 都围绕它，是「自改进循环」的沉淀单位。
- Subagent — 实质出现，swarm = 300 个 sub-agent 并行波次、各自 scoped context、~13 步/agent。
- MCP — 周边提及，仅出现在基准图的 MCP Atlas / MCP Mark Verified 子项里，作为模型能力对比维度，非核心概念，Hook 不建议主打。
- Context Engineering — 概念实质出现但未点名：step 03 的「每个子任务独立 scoped 上下文窗口、避免长任务上下文溢出 lossy summarization」正是 context engineering 的核心母题，可作为 Hook 锚点之一。
- Computer Use / Codex / Claude Code / /goal 模式 — 无实质出现（Codex 仅作为同代竞品语境隐含，未点名），不建议硬塞。
