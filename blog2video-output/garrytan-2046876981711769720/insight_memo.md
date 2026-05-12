# Insight Memo: Garry Tan "How to really stop your agents from making the same mistakes" (Skillify)

## title_zh
1.6 亿美金没解决的 Agent 顽疾？

## one_sentence_thesis
Agent 不可靠的根本原因不是模型能力，而是没有把"失败"转化为"结构性约束"的工程闭环——LangChain 给了工具，没给方法论，而 Skillify 用 10 步流程让每次踩坑都成为永久不可复发的护栏。

## why_this_video_exists
大多数观众听过"Agent 要写 eval"、"要写 skill"，但没有人把"一个失败如何变成永不重犯的结构"拆到 10 步的颗粒度。这篇博客提供的不是抽象主张，而是两个真实 bug 的复盘加一条可照搬的工程清单，并明确指出：行业里最有钱的框架（LangChain $160M）恰恰漏掉了这一层。这是一份从"vibes-based 调 prompt"升级到"软件工程化 Agent"的具体跃迁路径。

## judgment_lines
- "Agent 的 bug 不是答错了，而是答在了错的机器空间里" — 来源：日历查询本该是 deterministic 工作（grep 本地文件 sub-100ms），却被 Agent 放进 latent space 反复推理、调 API、绕五分钟。
- "$1.6 亿美金买到的是测试零件，不是测试方法论" — 来源：LangChain/LangSmith 提供 trajectory eval、trace pipeline、LLM-as-judge 等所有 primitives，却从不告诉用户"先测什么、按什么顺序测、什么时候算完"。
- "Agent 自我进化的关键动作不是模型升级，而是一个动词：skillify" — 来源：作者把"prototype → 看到它 work → 说一句 skillify"变成日常工作流，一句话触发 10 步固化，把一次性对话变成永久基础设施。
- "Latent 写 Deterministic，Deterministic 反过来约束 Latent——这是闭环本体" — 来源：Agent 用判断力写出 calendar-recall.mjs，之后 skill 强制 Agent 必须运行该脚本，"模型的智能创造了防止模型变蠢的约束"。
- "一个没过 10 步的 feature 不是 skill，是今天碰巧能跑的代码" — 来源：作者明确给出 10 项 checklist，缺任何一项（尤其是 resolver eval、check-resolvable、DRY audit）都会让 skill 在几周内悄悄腐烂。

## evidence_map
- [具体数字] LangChain 已融资 $160M，三年时间，独角兽估值，但没有 opinionated workflow。
- [具体数字] 本地知识库有 3,146 个日历文件，覆盖 2013–2026，已索引、已在本地，"one grep away"。
- [Bug 场景 #1：日历回忆] Agent 被问到一次近十年前的商务旅行 → 调用实时日历 API（被拒，时间太远）→ 邮件搜索（噪声大）→ 再次调用 API（仍被拒）→ 5 分钟后才搜索本地知识库，瞬间命中。本应 1 秒钟。
- [Bug 场景 #2：28 分钟] Agent 心算 UTC→PT 时区，告诉作者"下一次会议在 28 分钟后"，真实距离 88 分钟，正好错了 1 小时。已有 context-now.mjs 脚本能直接输出 `minutesUntil: 88`，约 50ms 返回，Agent 没去跑它。
- [具体数字] calendar-recall 脚本运行 sub-100ms（大部分时间是 Bun 启动，grep 本身 sub-millisecond），零 LLM 调用、零网络。
- [具体数字] context-now.mjs 运行约 50ms，输出确定性 JSON。
- [具体数字] 179 个单元测试，跨 5 个 suite，全部 <2 秒跑完。
- [具体数字] context-now 每天跑 35 个 LLM eval。
- [具体数字] Resolver eval suite 包含 50+ 测试用例（intent → expectedSkill 映射）。
- [具体数字] 一个月后系统里有 40+ skills，首次跑 check-resolvable 发现 6 个 unreachable——15% 的能力是"暗的"。
- [具体数字] 10 / 13 个 brain-writing skills 都把文件归错了目录（各自硬编码路径，没查 resolver）。
- [一手引用] "the framework they chose probably gave them a gym membership without a workout plan."（健身房会员但没训练计划——LangChain 的隐喻）。
- [一手引用] "The most honest eval heuristic I've found: search your conversation history for when you said 'fucking shit' or 'wtf.' Those are the test cases you're missing."（最诚实的 eval 启发式）。
- [10 步 checklist] (1) SKILL.md 合约 (2) Deterministic code (3) Unit tests (4) Integration tests (5) LLM evals (6) Resolver trigger (7) Resolver eval (8) Check-resolvable + DRY (9) E2E smoke (10) Brain filing rules。
- [对比对象] Hermes Agent (Nous Research) 提供 skill_manage、progressive disclosure、MEMORY.md 上限 2,200 字符、conditional activation——但完全没有测试层（无 unit / resolver eval / check-resolvable / DRY / daily health check）。
- [作者身份] Garry Tan，Y Combinator 总裁兼 CEO。
- [传播数据] 918K 浏览，4,831 收藏，1,655 赞，222 转发——收藏率显著高于赞，说明读者把它当工具留存。
- [实例引用] Webhook OAuth 集成、headless vs headed 浏览器决策、ngrok 链接 curl 自检、11 点 double-booking——都是一句"skillify it!"触发完整 10 步。

## non_obvious_points
- "Agent 用判断力造出约束自己的脚手架，然后被这个脚手架反向约束"——这个 latent→deterministic→反向锁住 latent 的双向闭环，是整套架构真正成立的地方。大多数人讨论 skill / tool 时只看到单向调用（Agent 调脚本），没意识到决定性的一步是 Agent 写脚本之后 skill 强制它不许再思考。 — 为什么这不显而易见：表面读起来像"给 Agent 加工具"，实际是"让 Agent 替自己设计护栏"，一种递归式的自我约束机制。
- 系统里最危险的不是没有的 skill，而是"存在但路由不到"的 skill——作者称之为 dark skill。40+ skills 里 15% 不可达，意味着你以为系统覆盖了某能力，实际它躺在文件夹里永远不会被调用。这比"压根没有这个能力"更糟，因为它制造虚假安全感。 — 为什么这不显而易见：直觉以为 "写完 skill 就完事了"，但 resolver / 路由层才是 skill 是否被调用的真正瓶颈，这是 check-resolvable 存在的全部理由。
- 收藏率（4831/918K ≈ 0.53%）远超赞数（1655）和转发数（222）——这种"高收藏低互动"的分布说明读者并非把它当观点消费，而是当"操作手册"收存。这反过来印证了内容的"可执行密度"是它真正的杠杆点。 — 为什么这不显而易见：传播数据通常用来证明"火不火"，但这里的指标结构暴露了"它是被当作工具书在传播"，对视频脚本的叙事重心有指导意义——讲清楚"怎么照搬"比讲清楚"为什么牛"更符合受众心智。

## tradeoffs_and_limits
- 10 步 checklist 对个人 prototype / hobby 项目是过度工程：要求同时维护 SKILL.md、deterministic code、单测、集成测、LLM eval（35/day）、resolver、resolver eval、check-resolvable、DRY audit、E2E smoke、filing rules——这是一整套软件工程纪律，对没有 cron / 没有持续运行 agent 的场景纯属负担。
- Skillify 假设你有一个长期、持续、跨会话的 Agent（OpenClaw / GBrain 这类 personal Jarvis）。如果你只是一次性调用 LLM 写邮件，这套结构毫无意义——它的回报曲线只在"同一个 Agent 服役数月到数年、错误会重复出现"的前提下成立。
- LLM eval 每天 35 次只是 context-now 一个 skill 的量；40+ skills 全部按这个量级跑，每天的 eval token / 时间成本非线性上升。文中没有给出整套系统的运行成本，但隐含一个"愿意为可靠性持续付费"的预算前提。
- 早期阶段的"造护栏"会显著拖慢功能开发节奏——每解决一个 bug 都要走 10 步，看似 over-engineering。作者自己也承认这套是踩了"日历 + 时区"两次坑之后才形成的工作流，意味着没踩坑的人很难提前接受这个成本。

## what_to_leave_out

### 不该进入的素材
- 10 步 checklist 的每一步逐条展开（Step 3–10 的具体实现细节）——展开会让视频变成枯燥的教程清单，丧失节奏。视频应聚焦其中 2–3 步（如 resolver eval、check-resolvable 这种最反直觉的）。
- GBrain / GStack 的产品推广段落——博客最后一段是作者推自家开源项目（github.com/garrytan/gbrain、gstack），视频不要变成广告读稿；至多提一句"作者把这套封装成了 GBrain"。
- Hermes Agent 的具体设计细节（progressive disclosure、2200 字符限制、conditional activation）——这些是 Hermes 内部机制，离视频主线（Skillify = 测试纪律）较远。只需用"Hermes 会让 Agent 自己写 skill，但不测它"作为对比锚点即可。
- "skill_manage tool"、"AGENTS.md"、"gbrain doctor --fix"等具体 API/命令名——观众不需要记住这些 token，记住"resolver / eval / 测试纪律"概念即可。
- 919K 浏览量等传播数据本身——可作为 hook 的备用，但不是核心证据。

### 应避免的叙事方向
- ❌ 不要把整片框架建立在"LangChain 烧了 $1.6 亿失败了"这种 hit-piece 上。作者本人也明确说 "Credit where it's due"——LangChain 有测试 primitives，缺的是 workflow。视频立场要保持"它做对了什么、漏了什么"的精确性，而不是"大公司不行"的廉价反派叙事。
- ❌ 不要把这条视频做成"10 步教程"。spec 里全展开 = 信息密度爆炸但无记忆点。叙事应当围绕"两个 bug + 一个反直觉机制（latent ↔ deterministic 闭环）"展开，10 步作为支撑结构出现，不是主线。
- ❌ 不要把"skillify"翻译/解释成"建立技能库"这种泛泛说法。它的特殊性在于"一句话触发完整工程闭环"的工作流形态，要保留这个动词的原始张力。
- ❌ 不要在标题或开头用"如何让 Agent 不再犯错"这种通用承诺。这种说法已经被无数 prompt 工程视频用烂了，无法和"vibes-based"内容区分。要用具体的 bug（28 分钟 vs 88 分钟、3146 个日历文件）或具体的数字（$160M / 15% 暗 skill）切入。
- ❌ 不要按博客原文顺序复述（先 LangChain 批评 → 失败 1 → 失败 2 → 10 步 → Hermes 对比）。叙事可以从"Agent 撒谎说还有 28 分钟"这个最具体的 bug 切入反推机制。

## signature_line
真正让 Agent 进化的不是更聪明的模型，而是一句"skillify it"——把每一次踩坑变成永远不会再踩的护栏。
