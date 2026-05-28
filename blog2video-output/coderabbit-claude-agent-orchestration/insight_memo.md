# Insight Memo: CodeRabbit 在 Claude Code 之前再插一层规划编排

## title_zh
每周审 200 万 PR，他们在 Claude Code 前加了一层

## one_sentence_thesis
AI 写代码最常见的失败不是"代码错了"，而是"代码对了但解错了题"——CodeRabbit 的解法是把质量关从 code review 提前到 plan review，在 Claude Code 之前再插一层多模型编排。

## why_this_video_exists
大多数 Agent 内容停在"Claude Code 怎么用"。这篇是一个每周审 200 万 PR、服务 15000+ 客户的工具公司给出的生产级答案：他们把"规划"做成了一个独立的产品层，跑在 Claude Code 自带的 Plan Mode 之上。揭示了一个反直觉事实——AI 编码真正的瓶颈不在模型生成阶段，而在需求被翻译为意图的那一步，而开发者本人是这步失败的主要原因。

## judgment_lines
- "AI 写代码最大的失败模式不是写错，而是写对了别人没问的题" — 来源：CodeRabbit 跨客户分析显示，最常见的失败是功能上正确但没解决实际问题的代码
- "开发者自己是 AI 编码失败的最大来源" — 来源：David Loker 自述他做记忆系统时忘了说明登录机制，Agent 自己脑补了一套，浪费几小时
- "Plan Mode 不够，因为 Plan Mode 之上还需要一层 Plan Mode" — 来源："This planning system is not meant to replace Claude Code's Plan Mode. It's a higher level orchestration that happens before Claude Code"
- "规划的抽象层级本身就是一个超参数" — 来源：过细的 plan 很快失效，过粗的 plan 给假设留缝隙，又把原问题搬了回来
- "把 review 从代码搬到 plan，因为代码评审的边际收益正在塌方" — 来源："The plan itself becomes a quality gate. The downstream effect is very pronounced."

## evidence_map
- [类型: 具体数字] 每周审 2,000,000 个 PR，覆盖 15,000+ 客户
- [类型: 一手引用] "As we gain experience as developers, we internalize knowledge. All those things are in our head, and we assume other developers know them too." — David Loker, VP of AI
- [类型: 具体 bug 场景] Loker 自己用 Agent 搭一个 memory system，忘了规定登录机制，Agent 自己脑补一套实现，几小时工作作废
- [类型: 模型路由矩阵] Opus 跑顶层编排循环 / Sonnet 做规划步骤的工作流编排 / Haiku 处理 context 蒸馏这类窄范围操作
- [类型: 一手引用] "If Haiku does as well as Sonnet on a given task, we use Haiku." — 成本/延迟优化的明确判据
- [类型: 一手引用] "This planning system is not meant to replace Claude Code's Plan Mode. It's a higher level orchestration that happens before Claude Code, to point it in a really narrow and right direction."
- [类型: Eval 维度清单] LLM judge 评估：生成代码的功能完备度 / scope creep（范围蔓延）/ token 用量
- [类型: 失败模式描述] Plan 太细 → 很快 stale；Plan 太粗 → 给隐含假设留缝隙 → 退化回原问题
- [类型: 一手引用] "The plan itself becomes a quality gate. If we can make sure the quality of that plan is really good upfront, the downstream effect is very pronounced."
- [类型: 产出形态] 规划层最终产物是一份 collaborative PRD，可以承载团队决策、上下文，方便 onboarding 新同事

## non_obvious_points
- AI 编码失败的真正瓶颈是"开发者内化但没写出来的知识"，不是模型能力 — 为什么不显而易见：行业普遍把焦点放在 prompt 写法、模型选型、上下文窗口；但 CodeRabbit 在 200 万 PR 数据里看到的最大问题是开发者自己跳过了对他们而言"显而易见"的需求描述
- 规划层不是"在 Claude Code 之前做点 prompt 工程"，而是一个独立的多模型编排系统，跟 Claude Code 自带的 Plan Mode 是分层关系 — 为什么不显而易见：很多人会以为"既然 Claude Code 有 Plan Mode 就够了"，但 CodeRabbit 明确划分了"高一层编排"和"工具内部规划"两个不同位置
- 评估规划质量的 metric 之一是"scope creep" — 为什么不显而易见：scope creep 通常是项目管理概念，但 CodeRabbit 把它做成了 LLM judge 的硬指标——意味着他们认为"AI 规划自动扩张范围"是一个需要被持续监控的稳定失败模式

## tradeoffs_and_limits
- 规划层不是免费的——它增加一层延迟、多消耗多模型 token，且需要团队配套搭建 eval harness 维护 plan 质量 — 具体表现：CodeRabbit 专门搭了一套 eval 基础设施，包括手调样本、人工巡检、多维度 LLM judge，这是一项额外工程投入
- "Plan 抽象层级"这个超参数没有银弹，要靠迭代 — 具体表现：原文明确说"Finding the right abstraction level required iteration"，意味着每个团队/每类任务可能都得自己调
- 这套架构的前提是"团队愿意接受一个 plan review 环节"——这跟很多团队"AI 直接写代码、人审 diff"的现有流程会产生摩擦

## what_to_leave_out

**不该进入的素材**：
- CodeRabbit 公司创立年份、CEO 姓名（除非用作 hook 凭据）—— 与核心 thesis 无关
- "collaborative PRD 可以帮助 onboarding"这一点 —— 是顺带价值，不是核心机制
- "Best Practices" 段落里的 4 条清单 —— 是文末总结型内容，不要做成教程式列举

**应避免的叙事方向**：
- 不要把视频做成"Claude Code 之外的另一种 Plan Mode 教程"——核心不是工具，是失败模式被前移的工程哲学
- 不要重复"Harness > Model"这个已经讲过的结论——本片新角度是"Plan-level Harness 在 Code-level Harness 之前"
- 不要把"多模型路由"做成爽点——这只是工程实现细节，反派是"开发者内化知识"
- 不要堆 200 万这个数字撑全片——它只是凭据，不是论点

## signature_line
代码评审的下半场，是 plan 评审。AI 写错的那行代码，错从你没说出口的那一句开始。

## hot_keywords
- Claude Code — 全文核心，是 CodeRabbit 规划层下游接的执行工具，明确划分了"在它之前"的位置
- Subagent / Multi-Agent Orchestration — 核心机制，三个 Claude 模型按角色分工的多 Agent 编排
- Plan Mode — 文中显式对比对象，规划层"不是替代"Claude Code Plan Mode，而是更上一层
- Eval Harness — 一个独立小节专门讲他们怎么搭 plan quality 的评估基础设施
- Context Engineering — 隐含主线：开发者内化但没写出的知识 = 缺失的 context
