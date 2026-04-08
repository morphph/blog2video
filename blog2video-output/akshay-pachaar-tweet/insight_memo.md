# Insight Memo: Agent Harness 架构解剖

## title_zh
Agent 的真正大脑不是大模型，是你看不见的那层

## one_sentence_thesis
大模型本身是无状态的"裸 CPU"，真正让 Agent 有用的不是模型能力，而是围绕模型的多层 harness 架构——它才是决定 Agent 成败的操作系统。

## why_this_video_exists
市面上大多数 Agent 讨论聚焦于"哪个模型更强"，这条视频提供一个被忽视的认知：五大框架（Anthropic、OpenAI、LangChain、CrewAI、AutoGen）都在同一个 loop 模式上竞争，真正的分歧不在模型，而在 harness 的厚薄——你选择信任模型多少。这是一个架构决策视角，不是产品评测视角。

## judgment_lines
- 所有主流 Agent 框架已经收敛到同一个 7 步循环模式，差异只在哲学层面的 thin vs thick 赌注 — 来源：框架对比表显示 Claude SDK / OpenAI SDK / LangGraph / CrewAI / AutoGen 共享相同的 prompt→inference→classify→execute→package→update→loop 结构，但在 state 管理和 multi-agent 策略上分叉
- Harness 厚度不是技术选择，而是对模型能力的信仰赌注：你越相信模型会变聪明，harness 就应该越薄 — 来源：原文明确指出 "As models improve, the bar shifts left toward thinner harnesses"，且 Anthropic 押注 thin（trust the model）而 LangGraph 押注 thick（encode control in code）
- Tool scoping 是一个被严重低估的性能杠杆，限制工具集可带来 80% 的冗余消除 — 来源：原文引用 Vercel 的数据 "Vercel uses 80% fewer tools" 在 minimal-per-step 策略下
- Agent 的"智能"是涌现行为，不是任何单一组件的属性——harness 提供脚手架，模型提供劳动力，但用户看到的 Agent 是两者结合的涌现 — 来源：脚手架比喻（scaffolding metaphor）明确区分 agent（涌现行为）、LLM（工人）、harness（脚手架）

## evidence_map
- [对比数据] 五大框架（Claude SDK / OpenAI / LangGraph / CrewAI / AutoGen）的 Loop / State / Multi-Agent / Philosophy 四维对比表，证明行业收敛
- [具体数字] Vercel 在 minimal-per-step tool scoping 下减少了 80% 的工具调用
- [具体数字] Plan-and-Execute 策略比 ReAct 快 3-6 倍，但自适应能力更低
- [架构事实] Claude SDK 用 git commits 做状态管理，OpenAI 提供 4 种策略，LangGraph 用 typed dicts + checkpoints——同一问题的三种完全不同实现
- [结构类比] 计算机架构类比表（CPU=LLM, RAM=Context Window, Hard Disk=Vector DB, OS=Harness），将抽象概念锚定到已知认知
- [循环结构] 7 步 agent loop 的完整拆解（prompt assembly → inference → classify → execute → package → context update → loop back），含 4 种退出条件

## non_obvious_points
- 脚手架的"依赖锁定"效应：模型是在特定 harness 上训练的，更换 harness 会导致性能下降（"the worker was trained on THIS scaffolding, change it and performance drops"）— 为什么这不显而易见：大多数人以为模型能力是通用的，可以即插即用到任何框架，但实际上模型和 harness 之间存在隐性耦合
- ReAct vs Plan-and-Execute 不是"更好 vs 更差"，而是"灵活 vs 快速"的根本性权衡，3-6x 的速度差距意味着在生产场景中选错策略的成本极高 — 为什么这不显而易见：开发者倾向于默认使用 ReAct 因为它更灵活，但没意识到在确定性任务上它慢了数倍
- Harness 的厚薄不是固定的，而是会随模型迭代动态迁移——今天正确的 thick harness 在下一代模型发布后可能变成技术债 — 为什么这不显而易见：架构决策通常被视为一次性选择，但 agent harness 是一个需要持续"拆除重建脚手架"的动态过程

## tradeoffs_and_limits
- [Thin harness 的脆弱性] 当模型能力不足时，thin harness 意味着没有兜底逻辑，失败模式不可预测 — 具体表现：Claude SDK 的 "dumb loop, smart model" 策略假设模型总能做出正确决策，但当模型出错时缺少 explicit routing 来纠正
- [框架收敛的隐性代价] 所有框架共享同一个 loop 模式，意味着创新空间被限制在 state/multi-agent/philosophy 三个维度，而非根本性架构创新 — 具体表现：对比表中 Loop 列的差异远小于其他维度
- [本文的覆盖边界] 原文是架构概览层面的分析，不涉及任何框架的生产部署经验、故障案例或实际性能基准——是地图，不是旅行日志 — 具体表现：所有 tradeoff 都是理论维度的，没有 "我们在生产中发现..." 这类实证

## what_to_leave_out
**不该进入的素材：**
- 7 步 loop 的每一步的详细描述（观众不需要记住 "Result Packaging" 这种实现细节）
- 五大框架对比表的逐格讲解（信息密度太高，视频形式无法承载）
- 计算机类比表的逐行对应（CPU=LLM 这种直接类比一句话带过即可）
- 图片中的架构环形图（无法在视频中有效呈现复杂嵌套图）

**应避免的叙事方向：**
- 不要做成"五大框架横评"——这不是评测，是架构认知
- 不要把 thin vs thick 讲成谁对谁错——原文明确说 "no universal right answer, only trade-offs"
- 不要暗示某个框架"最好"——原文的价值在于揭示选择背后的哲学分歧

## signature_line
大模型是建筑工人，harness 才是脚手架——你以为在选模型，其实在选操作系统。
