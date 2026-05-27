# Insight Memo: Addy Osmani — Agent Harness Engineering

## title_zh
模型不再决定 Agent 的胜负

## one_sentence_thesis
Agent 行业正在从"比模型"转向"比 Harness"——决定一个 Agent 能不能干活的，不再是它用的是 Claude、GPT 还是 Gemini，而是包在模型外面那层一边运行一边被打磨的脚手架，而这层脚手架正在变成一种新的标准化产品（HaaS），让"换模型"这件事的边际收益持续衰减。

## why_this_video_exists
Addy Osmani 是 Google Cloud AI 与 Gemini Agents 的 Director（之前是 Google Chrome 的工程负责人），他是站在"模型方"那一边的——他完全可以替自家 Gemini 站台，但他没有，反而郑重其事地告诉你：模型已经不是 Agent 系统的胜负手了。这种来自模型厂商内部的反向告白，本身就是值得讲的信号。

更重要的是，这篇文章给出了 Tw93 那篇国内主流 Agent 长文里没有的几个新框架：
- "棘轮（Ratchet）"——每一次失败都被永久编码进规则，所以系统提示里每一行都必须能追溯到一次具体翻车
- "从行为反推 Harness"——每个组件存在的理由必须是一个能命名的具体行为
- "Harness 不会缩小，只会迁移"——模型变强不让你少写脚手架，而是让你在更高的天花板上重新搭脚手架
- "训练循环和 Harness 是耦合的"——模型在训练时就被针对特定 Harness 微调，所以"最好的 Harness"是一个会反过来影响下一代模型的活系统
- "HaaS 取代 LLM API"——SDK 不再卖 completion，开始卖 runtime
- "现在最顶的 Agent 们，彼此之间比它们用的模型更像"——这是一个非常强的预测

## judgment_lines
- "一个普通模型加一个好 Harness，能稳定打败一个好模型加一个差 Harness" — 来源：Addy 原文，相同模型放进定制 Harness 后，benchmark 分数会出现"剧烈"差距
- "AGENTS.md 里每一行都应该可以追溯到一次具体失败" — 来源：Ratchet 原则——约束只在观察到真实失败后才加进去，模型变强后才删掉
- "Agent 的失败不是模型问题，是配置问题" — 来源：HumanLayer 的原话，被 Addy 拿来作为整篇文章的认知锚
- "模型变强不让 Harness 消失，只让它往上挪一层" — 来源：Addy 原文，floor 升高的同时 ceiling 也升高，新的失败模式会取代旧的
- "今天市面上最强的几个 coding Agent，它们彼此之间比它们用的模型还像" — 来源：Addy 在结尾对行业收敛趋势的判断
- "你不是在调模型，你是在维护一份属于你这套代码库的失败史" — 来源：Addy 明确说 Harness 是"discipline rather than framework"，由"独特的失败历史"塑造

## evidence_map
- [作者身份] Addy Osmani 是 Director, Google Cloud AI, Gemini Agents（之前是 Google Chrome 工程负责人）
- [传播数据] 这篇文章在 X 上 832.9K 阅读、3.3K 点赞、7.9K 收藏、565 转发——收藏比点赞多 2.4 倍，是典型的"工程师当成参考资料存下来"的信号
- [概念来源] "Harness engineering"这个词由 @Vtrivedy10 提出，Addy 把它定义清楚并加上自己的扩展
- [具体定义] Agent = Model + Harness；"如果你不是模型，那你就是 Harness"
- [Harness 具体组成] 系统提示、CLAUDE.md、AGENTS.md、Skills、Subagent 指令、Tools、MCP、文件系统、沙箱、Headless 浏览器、Subagent 编排、Hooks、Observability
- [产品例证] Claude Code、Cursor、Codex、Aider、Cline 全部是 Harness——底层模型可能完全一样，但你体验到的行为由 Harness 决定
- [具体失败→具体规则映射] Agent 误合并了一个被注释掉的测试 → AGENTS.md 加一条"绝不注释测试"，pre-commit hook 自动 flag .skip(，reviewer subagent 加入阻断规则
- [反例] HumanLayer 原话："It's not a model problem. It's a configuration problem."
- [Hook 设计原则] "success is silent, and failures are verbose"——类型检查通过 Agent 听不到声音，失败时错误直接注入下一轮
- [CLAUDE.md 定位] "Pilot's checklist, not a style guide"——飞行员清单，不是风格指南；保持短，每条都要有"过往失败"作为出处
- [工具数量] 10 个聚焦工具永远比 50 个重叠工具表现好
- [上下文 rot 三招] Compaction、Tool-call offloading（把 2000 行 log 写文件只在上下文里留 header/footer）、Progressive disclosure
- [长任务三招] Loops（拦截退出强制继续）、Planning（强制写 plan 文件并 self-verify）、Splits（生成和评估分开，避免自评偏向）
- [训练耦合] 今天的模型在 post-training 时就把特定 Harness 拉进训练循环，模型对那些被优先优化的动作（文件操作、bash、subagent dispatch）会出现一定程度的过拟合
- [行业范式] 行业从"建在 LLM API 上"转向"建在 Harness API 上"，SDK 直接提供 loop、tools、context management、hooks、sandbox
- [收敛判断] "If you look at the top coding agents today, they look more like each other than their underlying models do"
- [未来形态] "Harnesses 会从静态配置文件，变得越来越像编译器"
- [引用证据] Fareed Khan 反推过的 Claude Code 架构图，里面每个组件都能对应到 Addy 列出的 Harness 概念

## non_obvious_points
- **"Harness 不会缩小，只会向上迁移"** — 为什么这不显而易见：直觉是"模型更强，外面就要写得更少"，但 Addy 指出这是错的——floor 升高 ceiling 也升高，旧的 context-rot 缓解可以删，但新的多 Agent 编排、自我 trace 修复又会被加上去。脚手架的总质量只增不减，只是位置变了。
- **训练循环和 Harness 是双向反馈** — 为什么这不显而易见：很多人以为模型训练是"先训练，再被 Harness 使用"，但实际上 Harness 在训练阶段就被拉进了 RL 循环，所以模型在文件操作、bash、subagent 这些动作上会出现"过拟合"——这反过来意味着，你越早开始用某种 Harness，未来的模型对你这套调用习惯就越友好，这是一个 first-mover lock-in。
- **顶级 Agent 们彼此之间，比它们用的模型还像** — 为什么这不显而易见：表面看 Cursor、Codex、Claude Code 是在拼模型，但它们的 Harness 模式正在快速收敛到同一组"承重脚手架"。也就是说——模型差异在缩小，Harness 差异也在缩小，最后留下来的核心竞争力不在选模型，也不在写 Harness，而是在你这套 Harness 上沉淀的"失败历史"——也就是这份失败记录。

## tradeoffs_and_limits
- **Harness 是有路径依赖的资产，不能直接抄** — 具体表现：Addy 反复强调 Harness 是 discipline 不是 framework，每一条规则都要绑定一次具体翻车。这意味着你不能把别人的 AGENTS.md 拷过来直接用——拷过来的规则是别人代码库的失败记录，对你的代码库可能毫无意义，甚至有害。代价是：要积累一份高质量 Harness，你必须先经历一段时间的"看着 Agent 翻车然后立刻立规矩"的痛苦期，没有捷径。
- **HaaS 把"换 Harness 框架"变得和"换数据库"一样难** — 具体表现：当 SDK 把 loop、tools、context、hooks、sandbox 都打包卖给你之后，你确实不用从零写 orchestrate，但你也被锁进了那个框架的抽象——它的 hook 生命周期、它的 context 压缩策略、它的 subagent 协议。等你的"失败历史"沉淀够厚再想换框架，迁移成本极高。
- **训练-Harness 耦合带来的 overfitting 隐患** — 具体表现：模型对自己训练时见过的 Harness 动作过拟合，听上去是好事，但反过来意味着：如果你切换到一个训练时没见过的 Harness 模式（比如自己发明的奇怪 subagent 协议），模型的表现可能会突然下降——而你看不出原因。

## what_to_leave_out

**1. 不该进入的素材：**
- Fareed Khan 反推 Claude Code 架构那张图的具体组件名（permission gate、worktree isolator 等）——这些是工程细节，听众不需要记
- "agent = ReAct loop（reason-act-observe-repeat）"——这个抽象已经在 Tw93 那期讲过，不要重复定义，直接用就行
- 上下文压缩三招、长任务三招的逐条展开——Tw93 那期已经讲透了，这里只需要点一下"这些手段都属于 Harness 的一部分"
- 工具数量"10 vs 50"这种细节比较——可以用一句话带过，不要展开
- 关于 MCP 安全（恶意 MCP 注入 prompt）那一小段——和主线无关，砍掉
- Flue 框架的推荐——这是 Addy 给朋友带的货，跟我们听众无关
- @Vtrivedy10、@dexhorthy、Birgitta Böckeler 这些人名——除了 Addy 自己之外，其他人名都不要进口播，听众记不住也不在乎

**2. 应避免的叙事方向：**
- **不要做成"Harness 教程"**——这是一篇思想性文章，不是 how-to。如果你开始一条一条讲"Harness 包括哪些组件"，就变成了第二期 Tw93。我们的角度是：Addy 作为模型方内部人士，预告了一个行业范式转移。
- **不要再讲"Harness > 模型"这个结论本身**——这个结论 Tw93 那期已经讲透了。我们的差异化在于"Harness 接下来会怎样演化"，重点放在 Ratchet、Working backwards、Don't Shrink They Move、HaaS、收敛预测这五个新框架。
- **不要把整期框在一个数字或事件上**——这篇没有强数字（不像 Claude Code 51万行那种），不要硬找一个数字反复回扣。
- **不要用"我们来看一下 Harness 是什么"这种教科书口吻**——听众已经被 Tw93 那期教育过 Harness 是什么了，我们直接进入"接下来会怎样"。
- **不要把 Addy 描述成中立观察者**——他是 Google Cloud AI 和 Gemini Agents 的 Director，他说"模型不是胜负手"是反着自己利益说的，这个反差本身就是看点，要点出来。

## signature_line
"模型是 Agent 的输入，不是 Agent 的胜负手——胜负手是你这份只属于你的失败记录。"

## hot_keywords
- Agent Harness — 全文核心概念，标题词
- Claude Code — 反复出现，被作为成熟 Harness 的范例
- Codex — 与 Cursor、Aider、Cline 并列出现，被定性为 Harness
- Context Engineering — 隐含出现（compaction、progressive disclosure、tool-call offloading 都是其手段）
- MCP — 出现在工具描述/外部集成相关段落，但只是支线提及
- Skills — 在 Harness 构成清单中出现，作为按需加载的知识层
- Subagent — 长任务 splits 设计里反复出现
- Gemini Agents — 不在原文中，但是 Addy 的当前职位标签，是 Hook 权威锚的一部分
