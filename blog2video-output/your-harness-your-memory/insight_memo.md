# Insight Memo: Agent Harness 与 Memory 的锁定博弈

## title_zh
你的AI记忆，正在被大厂悄悄锁死？

## one_sentence_thesis
Agent harness 与 memory 的深度耦合意味着，选择一个闭源 harness 等同于把用户数据飞轮的所有权拱手让给模型提供商，而这正是模型厂商刻意推动的锁定策略。

## why_this_video_exists
大多数开发者还停留在"模型会吞掉一切中间件"的直觉里，没有意识到模型提供商正在通过 memory 而非模型本身来构建护城河。这篇博客揭示了一个正在发生的产业结构变化：锁定的战场已经从模型能力转移到了状态与记忆的所有权。

## judgment_lines
- Memory 不是可插拔的独立服务，而是 harness 的核心能力——因为上下文管理（压缩策略、system prompt 加载、跨会话状态）全部由 harness 决定，memory 脱离 harness 无法独立运作。 — 来源：Sarah Wooders 的论述"memory isn't a plugin, it's the harness"，以及文中列举的 compaction、AGENTS.md 加载、skill metadata 展示等具体 harness 职责。
- 模型提供商的真正锁定手段不是模型 API，而是有状态的 memory——因为模型 API 几乎可以互换（改改 prompt 就行），但一旦积累了用户偏好和交互历史，迁移成本急剧上升。 — 来源：作者亲身经历——邮件助手被误删后，重建同一模板的体验"so much worse"，必须从头教会所有偏好和语气。
- Claude Code 泄露的 512k 行代码证明，即使是最强模型的缔造者也在重度投资 harness，"模型会吸收一切 scaffolding"的论点已被事实否定。 — 来源：原文明确引用 Claude Code source code leak，512k lines of code。
- Anthropic 的 Managed Agents 和 OpenAI Codex 的加密 compaction summary 是锁定策略的具体实施——不是技术上的必要选择，而是商业上的刻意设计。 — 来源：原文指出 Codex 生成 encrypted compaction summary "not usable outside of the OpenAI ecosystem"，Anthropic 将"literally everything"放到 API 之后。
- 没有 memory 的 agent 没有壁垒——任何拥有相同工具的人都能复制你的 agent，memory 才是唯一的专有数据资产。 — 来源：原文原句 "Without memory, your agents are easily replicable by anyone who has access to the same tools."

## evidence_map
- [具体数字] Claude Code 源码泄露后，发现有 512k 行代码，全部是 harness 层代码
- [具体产品行为] OpenAI Codex 是开源的，但生成的 compaction summary 是加密的，无法在 OpenAI 生态之外使用
- [具体产品行为] Anthropic 推出 Claude Managed Agents，将整个 harness（包括长期记忆）放到 API 之后
- [具体产品行为] OpenAI Responses API 和 Anthropic server-side compaction 将状态存储在他们的服务器上，切换模型后无法恢复之前的对话线程
- [一手经历/bug场景] 作者的邮件助手被意外删除，用同一模板重建后体验大幅下降，必须重新教会所有偏好和语气
- [具体产品列表] 当前 agent harness 的典型代表：Claude Code、Deep Agents、Pi（驱动 OpenClaw）、OpenCode、Codex、Letta Code
- [具体机制] 模型 API 内置的 web search 并不是"模型的一部分"，而是 API 背后的轻量 harness 通过 tool calling 编排搜索 API 实现的
- [引用] Sarah Wooders: "Managing context, and therefore memory, is a core capability and responsibility of the agent harness."

## non_obvious_points
- OpenAI 把 Codex 开源了，但通过加密 compaction summary 实现了"开源外壳、闭源状态"的锁定——开源 harness 并不等于你拥有 memory，关键看状态格式是否可移植。 — 为什么这不显而易见：大多数人看到"开源"就默认没有锁定，没有意识到加密状态是一种比闭源代码更隐蔽的锁定形式。
- 模型提供商将 web search 等能力"内置到 API"时，实际上是在模型外面包了一层 harness 并以 API 形式呈现——这意味着"模型能力增强"的叙事掩盖了 harness 层膨胀的事实。 — 为什么这不显而易见：用户直觉是"API 变强了 = 模型变强了"，没有意识到这本质上是 harness 代码被隐藏到 API 之后。
- Memory 的锁定效应随时间非线性增长——不是因为技术原因，而是因为用户交互数据的积累使迁移的体验损失越来越大，这是一个"温水煮青蛙"的过程。 — 为什么这不显而易见：作者直到邮件助手被删除才真正感受到 memory 的价值，说明在日常使用中 memory 的积累是无感的，但失去时损失巨大。

## tradeoffs_and_limits
- 开源/开放 harness 的代价是需要自己承担 memory 基础设施的运维复杂度（数据库选型、部署、备份、跨会话状态管理），闭源 API 之所以有吸引力正是因为它把这些全部托管了。 — 具体表现：Deep Agents 需要用户自己选择 Mongo/Postgres/Redis 作为 memory store，自行部署到任意云上，这对中小团队是非平凡的工程负担。
- 当前 memory 仍处于极早期（"infancy"），行业尚未形成通用的 memory 抽象和最佳实践，选择任何 memory 方案（包括开源方案）都有被后续标准淘汰的风险。 — 具体表现：作者承认长期记忆"often not part of the MVP"，且"we are still figuring out memory"，这意味着今天的 memory 架构决策很可能需要在未来重构。
- 本文作者 Harrison Chase 是 LangChain/Deep Agents 的创始人，文章的核心论点直接服务于推广 Deep Agents 这一商业产品，读者需要注意利益相关性对论证中立性的影响。 — 具体表现：全文最终落点是"Try out Deep Agents today"，所有关于闭源 harness 的批评恰好指向竞品（Claude Code、Codex、Managed Agents），而 Deep Agents 被呈现为唯一的解决方案。

## what_to_leave_out
- **Deep Agents 的具体技术特性列表**（开源、model agnostic、支持 Mongo/Postgres/Redis 等）：这是产品广告，不是认知内容。视频应讨论"开放 harness"的理念，但不应变成 Deep Agents 的推介。原因：观众不关心具体产品选型，关心的是认知框架。
- **LangChain → LangGraph → harness 的历史演进**：这段内容是作者的自我叙事（LangChain 就是他的产品），与核心论点"memory 锁定"关联弱。原因：太细节，且有自卖自夸嫌疑。
- **Sarah Wooders 的完整引用和 Letta 的背景**：作为证据来源提一句即可，不需要展开。原因：与核心论点无关的人物背景。
- **应避免的叙事方向**："大厂 vs 开源"的简单二元对立——文章本身就有明显的利益立场偏向，视频如果照搬会变成站队而非分析。应该保持"这是一个值得关注的结构性趋势"的分析视角，而非"闭源邪恶、开源正义"的宣传视角。

## signature_line
模型 API 可以一天换一个，但你的 agent 记忆一旦交出去，就再也拿不回来。
