# Insight Memo: Building Effective AI Agents（Anthropic 工程实践）

## title_zh
最成功的 Agent，都没用框架

## one_sentence_thesis
真正跑通生产的 Agent 不是靠更聪明的框架，而是靠更克制的架构——它们本质只是「大模型带着工具、在环境反馈里循环」，复杂度只在被证明有效时才加。

## why_this_video_exists
市面上讲 Agent 的内容都在教你「怎么搭更复杂的系统」，而这篇是 Anthropic 陪跑几十个团队后的反向结论：先别搭 Agent，先想清楚工作流够不够。它给出了一套「什么时候用、什么时候别用」的判断标尺，以及一个大多数人忽略的胜负手——工具接口（ACI）比 prompt 更值得投入。

## judgment_lines
- 最成功的实现都没用复杂框架，而是用简单可组合的模式 — 来源：Anthropic 陪跑几十个团队跨行业的一手观察
- Workflow 和 Agent 是两种东西：前者路径写死在代码里，后者让模型自己决定怎么用工具、走几步 — 来源：原文架构定义
- Agent 的实现往往很简单，复杂的是任务本身——它就是「LLM + 工具 + 环境反馈 + 循环」 — 来源：原文对 Agent 本质的描述
- 搭 SWE-bench Agent 时，团队花在打磨工具上的时间超过打磨主 prompt — 来源：Appendix 2 一手经验
- 别默认要上框架：框架的抽象层会遮蔽底层 prompt 和响应，是客户出错的常见来源 — 来源：原文对框架的警告

## evidence_map
- [具体 bug 场景] Agent 离开根目录后，用相对路径就会出错；把工具改成强制要求绝对路径后，模型「零失误」使用 — 这是全文最锋利的证据
- [具体事实] 搭 SWE-bench Agent 时，优化工具的时间 > 优化整体 prompt 的时间
- [具体产品/事实] Agent 能仅凭 PR 描述就解决 SWE-bench Verified 里真实的 GitHub issue
- [具体做法] 路由场景：简单问题给 Claude Haiku 4.5，难问题给 Claude Sonnet 4.5，以此平衡成本与性能
- [具体商业模式] 多家公司对客服 Agent 采用「按成功解决付费」的用量定价——只有真解决了才收钱
- [格式细节] 写 diff 需要在写代码前就在 chunk header 里数准改了几行；在 JSON 里写代码需要额外转义换行和引号——这些「格式开销」是模型出错源头
- [三条实施原则] 保持简单、优先透明（显式展示规划步骤）、精心设计 Agent-Computer Interface

## non_obvious_points
- 「工具文档」和「产品 prompt」一样值钱，甚至更值钱 — 为什么不显而易见：大家把精力全砸在 prompt engineering 上，却把工具定义当成写死的 API 接口，从没想过要像给初级工程师写 docstring 那样去打磨它、给样例、标边界、做 poka-yoke（防呆）
- 解决幻觉/出错，有时不是改 prompt 而是改「让模型更难犯错的接口」 — 为什么不显而易见：直觉是「模型不够聪明就多提示」，但绝对路径那个例子说明，改环境约束比改指令更根治
- 该选什么工具格式，取决于「模型写起来累不累」而非「对程序员是否规整」 — 为什么不显而易见：工程师本能选 JSON/diff 这类结构化格式，但这些恰恰是模型最容易写崩的；越接近互联网上自然出现的文本，模型越顺手

## tradeoffs_and_limits
- Agent 的自主性直接换来更高成本和「误差累积」风险 — 具体表现：多步循环里一步错步步错，所以必须在沙盒里充分测试、加护栏、设停止条件（如最大迭代次数）
- Agent 不是万能钥匙 — 具体表现：很多场景优化「单次 LLM 调用 + 检索 + 少样本示例」就够了，硬上 Agent 只是拿延迟和成本换性能

## what_to_leave_out
1. 不该进入的素材：六种 workflow 模式（prompt chaining / routing / parallelization / orchestrator-workers / evaluator-optimizer）的逐个详解——罗列会变成教科书目录，观众记不住；只挑其中一到两个当「复杂度阶梯」的例子即可。框架产品清单（Rivet、Vellum、Strands 等）也不必念名字。
2. 应避免的叙事方向：不要拍成「Agent 搭建完整教程/一文搞懂六种模式」；不要站在「框架 vs 手写」二元对立上带节奏——原文立场是「理解底层再选」，不是「框架都是坏的」。

## signature_line
别急着造更聪明的系统，先造对的系统——最强的 Agent，往往是花最多时间在「怎么让模型少犯错」上，而不是「怎么让模型更聪明」上。

## hot_keywords
- MCP — 原文点名 Model Context Protocol，作为增强型 LLM 接入第三方工具生态的方式
- Claude Code — 未在原文出现（原文提到的是 Claude Agent SDK / coding agent，可作关联但不硬套）
- Computer Use — 原文以「computer use 参考实现」作为 Agent 落地范例
- Subagent — 原文 orchestrator-workers 模式即「中心 LLM 拆任务、分发给 worker LLM」，是 subagent 概念的工程原型
- Agent Harness — 未原词出现，但「LLM + 工具 + 环境反馈 + 循环」正是 harness 的朴素定义，可借词点题
