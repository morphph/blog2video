# Insight Memo: Agentic Design Patterns —— Agent 的四级分层与可复用模式

## title_zh
你的 Agent 到 Level 几了？

## one_sentence_thesis
"你的 Agent 不好用"几乎从来不是模型问题，而是它根本还停留在 Level 0 或 Level 1：你以为在用 Agent，其实只是在用聊天机器人——Agent 有清晰的四级分层，跳过任何一级都会让上面的努力白费。

## why_this_video_exists
这篇文章给了观众一把"自我诊断尺"：用 Level 0/1/2/3 四级框架对照自己手上的 AI 应用，立刻能看出它卡在哪一层。市面上大量讨论"Agent 怎么做"的内容，但很少有人先把"什么不算 Agent"这一刀切得这么干净——书里直接判定 Level 0 的裸 LLM 不是 Agent，这个反常识的边界比任何"完整指南"都更有助于读者校准认知。同时还给出三个立刻可落地的动作：加 Critic / 做 Context Engineering / 别急着上 Multi-Agent，每个都有具体阈值（比如 Reflection 最大迭代 3 次）。

## judgment_lines
- "Level 0 的裸 LLM 根本不是 Agent" — 来源：书里直接判定没有工具、没有记忆、不会行动的纯对话式 LLM 不属于 Agent；问 2025 年奥斯卡最佳影片它只能"猜"
- "Producer 和 Critic 必须是两个不同的 system prompt，不是同一个 Agent 自审" — 来源：书里给出明确的 rigid rule + Python 代码示例；同一 persona 审自己一定有盲区，"挺好的"是默认输出
- "Context Engineering 不是堆信息，而是裁剪、降噪、打包" — 来源：找咖啡店的例子，Agent 拿到地图原始数据后主动裁成"只剩街道名"的短列表再喂下游，每一步都在做信息降噪
- "大多数人 Agent 不好用，不是 Agent 数量不够，而是一个都没调到 Level 2" — 来源：作者反复强调 Level 2 的单 Agent + Producer-Critic + Context Engineering 已能覆盖绝大多数场景，Level 3 是给跨领域多阶段任务准备的
- "Reflection 不是越多越好，迭代次数是硬性成本——书里默认 3 次封顶" — 来源：每次反射循环是一次新的 LLM 调用，上下文窗口被前期版本和批评意见占满，可用推理空间反而缩小

## evidence_map
- [具体数字] 书 453 页，21 种设计模式，Springer 2025 出版
- [具体数字] 作者 Antonio Gullí 是 Google 工程总监；前言是 Google Cloud AI VP 写的，推荐序来自 Goldman Sachs CIO
- [具体数字] Reflection 最佳实践最大迭代次数：3 次
- [具体框架] Agent 四级分层：Level 0 裸 LLM（不是 Agent）/ Level 1 工具使用者 / Level 2 战略思考者（规划 + Context Engineering + Reflection）/ Level 3 多 Agent 协作
- [具体框架] Context Engineering 四层：system prompt / 外部数据（RAG、工具返回值、实时 API）/ 隐式数据（用户身份、交互历史、环境状态）/ 反馈回路（自动化 context 优化）
- [具体框架] Memory 三层：Session（对话窗口，临时）/ State（任务进行中的临时数据）/ Memory（跨会话长期记忆，需要设计"存什么、什么时候存、怎么检索"）
- [具体场景] Level 1 例子：用户问"最近有什么新剧"，Agent 自己意识到训练数据没有，主动调搜索工具——关键在"自己意识到"
- [具体场景] Level 2 例子：找两地中间的咖啡店，Agent 调地图工具后主动把数据裁成"只剩街道名"再喂本地搜索工具
- [具体代码场景] Producer prompt："你是 Python 开发者，写计算阶乘的函数，处理边界条件和异常"；Critic prompt："你是吹毛求疵的高级工程师，逐行审查 Bug、风格、遗漏边界条件；完美就输出 CODE_IS_PERFECT，否则列出所有问题"
- [具体拓扑] Multi-Agent 六种通信拓扑：单 Agent / 对等 P2P / Supervisor 中心调度 / Supervisor-as-Tool / 层级式 / 自定义混合
- [一手引用] 书里原话："要让 AI 达到最高准确率，必须给它短小、聚焦、有力的上下文"
- [具体工程化案例] Google Vertex AI Prompt Optimizer 是 Context Engineering 第四层（反馈回路）的工程化实现
- [具体未来假设] 变形 Multi-Agent：用户只声明目标"做精品咖啡电商"，系统自动创建市场研究 Agent + 品牌 Agent → 跑一轮数据后自己拆品牌 Agent 成 Logo/建站/供应链三个 → 建站 Agent 成瓶颈就复制三个并行；过程中持续自动调优每个 Agent 的 prompt
- [对照引用] Karpathy AutoResearch：写 program.md，定义目标/指标/边界，按启动；但本书更激进——连团队怎么组建/重组都交给系统

## non_obvious_points
- 大多数自称"在用 Agent"的人其实卡在 Level 0 — 为什么不显而易见：人们直觉上把"和 LLM 对话"就叫"用 Agent"，但书里给的标准是工具调用 + 自主判断 + 行动闭环，这条线把 ChatGPT 网页版直接划出 Agent 范畴。这个"删除式定义"比任何加法式定义都更让人坐不住
- Reflection 失败的根因不是 Critic 不够严，而是 Producer 和 Critic 用了同一个 persona — 为什么不显而易见：直觉觉得"让 AI 自我审查"就好了，没意识到 system prompt 是 Agent 的"人格"——同人格审同人格的输出，盲区会被继承；必须强制让 Critic 用一个完全对立的 persona（"吹毛求疵的高级工程师"），盲区才会被打破
- Context Engineering 和 Prompt Engineering 不是同一层的事 — 为什么不显而易见：很多人会把两者当同义词。但 Prompt Engineering 只管"你怎么问"，Context Engineering 管的是"问之前 Agent 眼前摆着什么"——前者是台词，后者是布景。书里把它列为 Level 2 的核心能力之一，不是修辞升级
- Multi-Agent 的拓扑选择，本质上是在权衡"通信成本 vs 容错性" — 为什么不显而易见：表面看是"用哪种架构图"，实际上 P2P 容错好但协调成本高、Supervisor 好管理但是单点瓶颈——任务越拆越碎，通信成本会反过来吞掉拆分带来的并行收益

## tradeoffs_and_limits
- Reflection 的成本是线性增长的 LLM 调用费用 + 上下文窗口被前期版本占满 — 具体表现：迭代次数越多越贵，且随着对话历史膨胀，实际可用的推理空间在缩小；书里明确建议最大迭代 3 次，"一旦 Critic 满意就停，不要追求完美"
- Multi-Agent 不是免费的 — 具体表现：很多人花 80% 时间在通信协议上，反而忘了问"这个任务真的需要多个 Agent 吗"；Supervisor 拓扑有单点故障和性能瓶颈，P2P 协调成本高容易乱
- Memory 不是"存下来就行" — 具体表现：存太多噪声大，存少了不够用；需要单独设计"存什么、什么时候存、怎么检索"的策略，否则 Memory 层会从资产变负债
- 第五种"变形 Multi-Agent"目前还停留在假设层面 — 具体表现：书末五个未来假设里，前四个还在合理推演范围，第五个（系统自己决定 Agent 怎么组建和重组）作者自己也承认是激进推演，没有成熟工程实现

## what_to_leave_out

### 不该进入的素材
- 书的具体出版社、定价、推荐序作者头衔等元信息（除非用一句话提一下 453 页/Springer 2025/Google 工程总监建立权威，但不展开）
- 代码示例的具体语法细节（LangChain/LangGraph/Google ADK/CrewAI 的 API 写法）——观众要的是"为什么这么设计"，不是"怎么写这一行"
- Memory 章节里 Google ADK State 机制的完整 demo 流程（提到分层即可，不要演示代码）
- Multi-Agent 六种拓扑里后三种（Supervisor-as-Tool、层级式、自定义混合）的细节——讲清前三种足够，后三种说"是前三种的变体组合"带过
- 五个未来假设里的前四个（通用型 Agent / 个性化主动发现 / 具身智能 / Agent 成独立经济实体）——只讲第五个最离谱的"变形 Multi-Agent"，其他四个会稀释

### 应避免的叙事方向
- **不要走"读书笔记/书评"路线。** 这本书是引子，视频的主角是"四级分层这把诊断尺"——视频结尾要让观众想自检，不是想买书
- **不要复用 Khairallah Context Engineering 那期的叙事框架。** 那期主线是"Prompt 是语法，Context 是基建，记忆分 immediate/session/persistent"；这期 Context Engineering 是 Level 2 的一个组件，且四层分法不同（system prompt / 外部数据 / 隐式数据 / 反馈回路）——绝对不能让观众感觉"这不是上次讲过吗"
- **不要把全片建立在"Reflection 教程"上。** Producer/Critic 是非常有力的素材，但只能作为 Level 2 的代表性证据，不能让整集变成"教你怎么写两个 prompt"
- **不要把 Multi-Agent 讲成"未来很酷"。** 书里的立场恰恰相反："先别急着上 Multi-Agent"——这条反直觉的克制态度比"未来很酷"更有价值
- **不要罗列六种拓扑、四级分层、四层 Context、三层 Memory 这些清单。** 清单是 memo，不是视频；选 1-2 个最能撑住 thesis 的展开讲透
- **不要走"哈林克斯/Tw93/sairahul1 已经讲过"的方向。** 已规避：harness > model、grep vs RAG、7-Agent vibe coding、delta-as-signal、failure modes——这期独有的是"四级诊断框架"和"Level 0 不是 Agent"的边界判定

## signature_line
你以为你在用 Agent，其实大多数人连 Level 1 都没到——问题从来不是模型不行，是你根本没让它走出聊天框。

## hot_keywords
- Agent — 全文核心，反复出现在四级分层、多 Agent 协作等所有章节
- Context Engineering — 书中专章概念，与 Prompt Engineering 形成对照，是 Level 2 的核心组件
- Multi-Agent — 全文 Level 3 的主题，含六种通信拓扑
- Claude Code — 在"三件可以马上做的事"中作为加 Critic 的载体被点名（"不管你用 Claude Code、CrewAI 还是自己搭的框架"）
- Subagent — 概念上贯穿 Multi-Agent 章节（Worker Agent / 研究员 Agent / 设计师 Agent 等），但作者未使用 "subagent" 这个 term
- MCP — 原文未出现
- Skills — 原文未出现
- /goal 模式 — 原文未出现
- Codex — 原文未出现
- Agent Harness — 原文未直接使用该 term，但作者自述写过 Harness Engineering，且明确说 Context Engineering 是 Harness Engineering 在 prompt 层的映射
- Computer Use — 原文未出现
