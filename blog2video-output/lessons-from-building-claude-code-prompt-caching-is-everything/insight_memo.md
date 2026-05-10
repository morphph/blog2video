# Insight Memo: Lessons from building Claude Code — Prompt caching is everything

## title_zh
Claude Code 的省钱命门：缓存

## one_sentence_thesis
Agent 的成本和延迟天花板不取决于模型本身，而取决于你是否把整个系统的每一个字节都按"前缀缓存"的规则来设计——一旦这个约束被忽视，模型再强也救不回来。

## why_this_video_exists
大部分关于 Agent 工程的内容讨论 prompt 写得多好、tool 设计多巧，但很少有人讲：在长会话场景里，真正决定一个 Agent 产品能不能跑得起的是 prompt cache hit rate。这篇博客来自 Claude Code 团队内部实践，揭示了几条反直觉的工程原则——比如"切到便宜模型反而更贵"、"Plan Mode 不应该换工具集"、"压缩对话不能用新 prompt"——这些是只有真正在生产规模上跑过 Agent 的团队才会踩到的坑。

## judgment_lines
- "Prompt cache 不是优化项，是 Agent 产品的基础设施" — 来源：Claude Code 把 cache hit rate 当 SLI 监控，掉了就发 SEV（事故等级告警）
- "切到更便宜的模型反而可能更贵，因为 cache 不能跨模型复用" — 来源：在 Opus 跑了 100k token 后切 Haiku 回答简单问题，比让 Opus 继续答还贵
- "Plan Mode 不应该是换一套工具，而应该是加一个状态工具" — 来源：直觉做法是切只读工具集，但那会击穿 cache；正确做法是 EnterPlanMode/ExitPlanMode 作为工具本身存在
- "压缩对话最直觉的做法（独立 API call + 新 system prompt）正是最贵的做法" — 来源：用不同 system prompt 调用会让 prefix 从第一个 token 就发散，整段对话按未缓存费率计费
- "缓存的脆弱性来自看不见的细节" — 来源：在 system prompt 里插时间戳、工具定义顺序非确定、改 Agent tool 的子 agent 列表，都会无声地击穿全部缓存

## evidence_map
- [具体事实] Prompt caching 按"前缀匹配"工作：从请求开始到每个 `cache_control` breakpoint 之间的内容都被缓存，任何位置的修改都会让其后所有内容失效
- [具体数字] 100k token Opus 对话切到 Haiku 答简单问题，比 Opus 继续答更贵——因为要为 Haiku 重建整段 prefix 缓存
- [具体 bug 场景] 团队踩过的击穿缓存的坑：(1) 在 static system prompt 里塞精确时间戳；(2) 工具定义顺序非确定性 shuffle；(3) 修改 Agent tool 可调用的子 agent 参数列表
- [运维数据] Claude Code 对 prompt cache hit rate 设告警，hit rate 过低会被定为 SEV（事故）
- [架构事实] Claude Code prompt 分层顺序：静态 system prompt + tools（全局缓存）→ CLAUDE.md（项目级缓存）→ session context（会话级缓存）→ 对话消息
- [机制设计] 信息更新走 message 而非改 prompt：用 `<system-reminder>` tag 在下一个 user message 或 tool result 里插入更新（如时间、文件变化），保留缓存
- [机制设计] `defer_loading`：MCP 工具不真删，发轻量 stub（只有工具名 + `defer_loading: true`），让模型通过 tool search 发现，需要时才加载完整 schema——保证 prefix 顺序稳定
- [机制设计] Cache-safe forking 的压缩做法：用与父对话**完全相同**的 system prompt / user context / tool 定义，prepend 父对话历史，append 一条压缩 prompt 作为新 user message——API 看上去几乎和父请求最后一次 call 一样，整段 prefix 命中缓存，只为新加的压缩 prompt 付费
- [配套代价] Cache-safe 压缩需要预留 "compaction buffer"——在 context window 里留出位置容纳压缩 message 和 summary 输出 token
- [一手引用] "cache rules everything around me"（作者引用 Wu-Tang 改编句作为开篇 thesis）
- [一手引用] EnterPlanMode 作为模型自己可调用的工具有"附加好处"：模型可以在察觉到难题时**自主进入** Plan Mode，而不需要任何 cache break
- [产品化] 团队把这套压缩 pattern 直接做进了 Anthropic 的 API（compaction API），开发者不用自己重新踩坑

## non_obvious_points
- **切到便宜模型可能更贵** — 为什么这不显而易见：直觉是"用 Haiku 回答简单问题省钱"，但缓存按模型分隔，跨模型必须重建 prefix。在长会话里，这笔重建成本可能远超模型差价。一手实践才会反应过来：模型选择的成本计算单位不是单 call，是 cache 生命周期。
- **删工具比加工具更危险** — 为什么这不显而易见：直觉是"只给模型当下需要的工具更干净"，但工具定义在 cached prefix 里，任何增删都会让整段会话从工具改动点之后全部 cache miss。所以"按需工具"这个看似优雅的设计在长会话里是反模式。
- **压缩这个操作本身要走父请求的 prefix** — 为什么这不显而易见：压缩在心智模型里是"独立的总结任务"，自然会想到独立 API call + 新 system prompt + 不要 tool。但这正是最贵做法——分叉操作必须和父对话共享 prefix（包括它"用不到"的工具定义），才能命中缓存。"分叉"和"独立任务"的边界是反直觉的。

## tradeoffs_and_limits
- **Cache-safe 设计带来 context window 浪费** — 具体表现：压缩时为了命中父 prefix，必须把"用不到"的完整工具定义也带上；同时还要预留 compaction buffer 容纳压缩指令和 summary 输出 token。代价是有效上下文容量缩水。
- **架构刚性升高** — 具体表现：static system prompt 里不能有时间戳，工具定义必须确定性排序，工具集中途不能改，Plan Mode 这种"看似该换工具"的功能必须改用状态工具实现。任何"动态调整"的诱惑都得抵抗，否则缓存优化会无声失效。
- **缓存优化要求"缓存可见性"基础设施** — 具体表现：必须监控 cache hit rate，把它当 uptime 一样运维，掉几个百分点就触发告警。没有这套监控，缓存击穿是看不见的——成本会涨、延迟会升，但定位不到原因。

## what_to_leave_out

### 不该进入的素材
- 文末"Get started with Claude Code"等推广链接和作者署名（Thariq Shihipar）——与 thesis 无关
- "cache rules everything around me" 的 Wu-Tang 梗——中文观众可能 get 不到，强行翻译会稀释 thesis
- 文中所有外链（Plan Mode 文档、tool search tool 文档、compaction API 文档）——细节落地资源，视频不该跳出去
- "我们在 Explore agents 里用 Haiku 做 hand-off"这句——属于团队内部具体做法，对观众的认知增量不如 thesis 本身大

### 应避免的叙事方向
- **不要写成"Prompt Caching 入门教程"**——这篇博客的价值不在解释 cache 是什么，而在揭示 cache 改写了 Agent 工程的设计原则。叙述重心应是"反直觉的工程决策"，不是"什么是 prompt cache"。
- **不要把全片框架建在某一个数字上**——文中没有诸如"成本下降 90%"这种主打数字，硬抓数字会失真。重点是"机制级别的反直觉"。
- **不要把 5 个原则平铺成清单**——博客末尾的 "Lessons learned" 已经是清单形式，视频再复述等于摘抄。应挑出最反直觉的 2-3 个机制（切模型反而更贵 / Plan Mode 不换工具 / 压缩共享 prefix）展开讲透。
- **不要塑造"Anthropic 自家产品很厉害"的口吻**——这会让 thesis 变成营销。重心是"Agent 工程的普适约束"，Claude Code 只是案例。
- **不要假设观众懂 KV cache / prefix 匹配的底层机制**——叙事要从"为什么改一个时间戳就让所有人变贵"这种症状切入，而不是从底层算法切入。

## signature_line
"Agent 不是给模型加工具，是给缓存让路——你能不能让一段对话从头到尾共享同一个前缀，决定了它能不能跑得起。"
