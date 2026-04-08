# Insight Memo: Agent Harness 架构解剖

## title_zh
Agent 80%的能力不在大模型里？

## one_sentence_thesis
LLM 本身是无状态的裸 CPU，决定 Agent 能力上限的不是模型智商，而是围绕模型的多层 harness 架构——它是 Agent 真正的操作系统，而行业在这个操作系统该多厚上押了完全不同的赌注。

## why_this_video_exists
大多数 Agent 讨论在比模型强弱，但这篇内容揭示了一个被忽视的结构性事实：五大主流框架（Anthropic、OpenAI、LangGraph、CrewAI、AutoGen）已经收敛到同一个 7 步循环模式，真正的分歧不在模型选择，而在 harness 厚薄——这是一个关于"信任模型多少"的哲学赌注。观众从这里获得的不是框架评测，而是一套用来理解所有 Agent 架构的思维坐标系。

## judgment_lines
- 所有主流 Agent 框架已收敛到同一个 7 步循环，竞争战场不在 loop 本身而在对模型的信任程度 — 来源：框架对比表显示五大框架共享 prompt→inference→classify→execute→package→update→loop 结构，差异集中在 state 管理策略和 multi-agent 编排哲学上
- Harness 厚薄不是技术偏好，而是对未来模型能力的方向性赌注：越相信模型会变聪明，harness 就该越薄 — 来源：原文 "As models improve, the bar shifts left toward thinner harnesses"，Anthropic 押 thin（trust the model），LangGraph 押 thick（encode control in code）
- Tool scoping 是被严重低估的性能杠杆，不是"多给工具多灵活"，而是"少给工具性能好" — 来源：Vercel 在 minimal-per-step 策略下使用了比全量少 80% 的工具
- 模型和 harness 之间存在隐性耦合，更换脚手架会导致性能下降——所谓"通用智能"并不能即插即用到任意框架 — 来源：原文 scaffolding metaphor 中明确指出 "the worker was trained on THIS scaffolding. Change it, and performance drops"

## evidence_map
- [具体数字] Vercel 在 minimal-per-step tool scoping 策略下减少了 80% 的工具使用量
- [具体数字] Plan-and-Execute 策略比 ReAct 快 3.6 倍，但自适应能力更低
- [对比数据] 五大框架四维对比表：Loop（dumb loop / runner class / state graph / sequential-hierarchical / conversation-driven）、State（git commits / 4 strategies / typed dicts+checkpoints / task results / message history）、Multi-Agent（teamwork-worktree / agents-as-tools / nested graphs / agent-task-crew / 5 orchestration patterns）、Philosophy（thin→thick 光谱）
- [架构事实] Claude SDK 用 git commits 管理状态，OpenAI 提供 4 种状态策略，LangGraph 用 typed dicts + checkpoints——同一个问题的三种截然不同的实现路径
- [结构事实] Agent loop 有 4 种退出条件：max turns exceeded、token budget exhausted、guardrail triggers、user interrupt
- [结构类比] 计算机架构映射表（CPU=LLM、RAM=Context Window、Hard Disk=Vector DB、Device Drivers=Tool Integrations、OS=Agent Harness、Application=Agent emergent behavior）

## non_obvious_points
- 脚手架的"训练耦合"效应：模型是在特定 harness 上训练/对齐的，更换框架不只是工程迁移，而是会破坏模型已学会的行为模式 — 为什么这不显而易见：开发者普遍认为 LLM 能力是通用的，可以无损迁移到任何框架；但原文揭示模型与 harness 之间存在隐性依赖，"change it, and performance drops" 是一个违反通用性直觉的硬约束
- 今天正确的 thick harness 可能在下一代模型发布后变成技术债——harness 厚度是动态的，不是一次性架构决策 — 为什么这不显而易见：架构选择通常被视为长期稳定的基础设施决策，但 agent harness 需要随模型迭代持续"拆除重建"，原文用 scaffolding metaphor 暗示了这个时间维度（"removed once the building is complete"）
- 错误信息也会被打包回传给 LLM（"Errors are returned too"），这意味着 agent 的纠错能力不来自 harness 的错误屏蔽，而来自让模型看到失败并自行调整 — 为什么这不显而易见：常规工程思维倾向于在 harness 层吞掉错误并重试，但 agent 模式反而需要把错误暴露给模型

## tradeoffs_and_limits
- [Thin harness 的脆弱性] 当模型能力不够时，thin harness 没有兜底逻辑，失败模式不可预测 — 具体表现：Claude SDK 的 "dumb loop, smart model" 假设模型总能做正确决策，但在模型出错时缺少 explicit routing 或 fallback 来纠正方向
- [Harness 的保鲜期问题] 每次模型大版本更新，harness 可能需要重新适配甚至重建 — 具体表现：原文指出 "Models get retrained repeatedly, each time requiring removal and reconstruction of scaffolding"，这意味着 harness 层的工程投入有持续折旧风险
- [本文的认知边界] 全文是架构概览，不包含任何框架的生产部署故障案例或实测性能基准 — 具体表现：所有 tradeoff 讨论停留在理论维度（"simpler vs isolation"、"flexible vs fast"），无 "我们在生产环境中发现…" 的实证支撑

## what_to_leave_out
**不该进入的素材：**
- 7 步 loop 每一步的详细描述（"Result Packaging"、"Context Update" 等实现细节对观众无额外认知价值）
- 五大框架对比表的逐格讲解（信息密度过高，视频无法承载，只需提炼关键对立即可）
- 计算机类比表的逐行对应（CPU=LLM 这种直接映射一句话带过，不值得展开）
- 三环模型（Runtime / Capabilities / Safety & Scale）的逐层展开（概念层级有意义，但各层内部组件逐一罗列是凑时长）
- 七个设计决策的逐条讲解（选其中 2-3 个有冲突张力的即可，全覆盖会变成念 checklist）

**应避免的叙事方向：**
- 不要做成"五大框架横评推荐"——这是架构认知输出，不是选购指南
- 不要把 thin vs thick 讲成对错——原文明确说 "no universal right answer, only trade-offs"
- 不要过度渲染"模型不重要"——原文的立场是 harness 被低估，不是模型不重要

## signature_line
大模型是建筑工人，harness 才是脚手架——你以为在选模型，其实在选操作系统；而这个操作系统还有保质期。
