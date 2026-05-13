# Insight Memo: OpenAI Symphony — 50 张 ticket 换一晚上的代码重写

## title_zh
睡前推 50 张 ticket，醒来 7000 行没了

## one_sentence_thesis
Symphony 让 Agent 群跑通了"工程产能"这道坎，但真正起决定作用的不是 OpenAI 这个编排器，而是开发者自己写的那段 WORKFLOW.md prompt。

## why_this_video_exists
大多数 Agent 教程在讲"怎么用"，这条博客提供的是一个被忽略的事实：当编排器把工程流程标准化到 Linear 看板这一层之后，Agent 的能力不是被"模型"决定的，而是被"那段提示词"决定的——而作者明确说，他写的 prompt 才是大脑，Symphony 只是水管。这个判断只有亲手跑过 50 张 ticket 才说得出口，是观众从工具介绍文里拿不到的认知。

## judgment_lines
- "不是 Agent 工具变强了，而是工程流程被压成了 ticket 形状" — 来源：作者把整个 Electron 重构拆成 50 张 Linear ticket、每张限定一个可审 PR，Symphony 才能并行
- "Linear 看板被当成了人机协作的 UI，而不是项目管理工具" — 来源：原文 "The Linear board is your control surface"——Todo 触发 / Rework 反馈 / Backlog 暂停，全都是状态切换式交互
- "Agent 的能力下限不是模型，是你愿不愿意合并你没逐行看过的 PR" — 来源：30 个 PR 一晚上合掉、两天没坏，意味着审查标准已经下沉到 prompt 和 CI，而不是人眼
- "决定 Agent 工作质量的不是编排器，而是那段没被开源出来的 prompt" — 来源：原文最后一段 "Symphony is plumbing... the prompt teaches the agent how to plan, test, handle review feedback"
- "Agent 自主补齐了人类不会做的步骤" — 来源：ChatDisplay 那张 ticket 根本没写要测试，Agent 自己接 CDP、注入探针、截图、清理探针

## evidence_map
- [具体数字] 睡前推 50 张 ticket 到 Linear，醒来 30 个 PR 已合并，净删 7,000 行代码，两天没出问题
- [具体数字] 推文 222.7K views / 840 likes / 1,996 bookmarks / 65 reposts / 22 replies——bookmark 数远高于 like 数（约 2.4 倍），属于"被收藏研究"型内容而不是"被点赞围观"型
- [具体 bug 场景] ChatDisplay 重构 ticket 没提测试要求，Agent 自己 attach 到运行中的 Electron 进程，走 CDP via agent-browser，注入临时探针强制触发渲染错误，验证错误被隔离，点击恢复路径，前后两个状态都截图，最后清理探针——全程 self-directed
- [具体事实] 每个 worker 拿独立的 workspace clone，先读 ticket，把执行计划作为 Linear comment 发出来，再写代码，跑验证，开 PR，结束时附 demo 视频
- [具体配置] WORKFLOW.md 一秒内热重载，不需要重启；`agent.max_concurrent_agents` 从 2-3 起步；`agent.max_turns` 控 token 上限
- [具体工作流] 让 Agent 扮演 tech lead，输入"this is the tech debt, this is what I want the codebase to look like after"，由 Agent 拆 ticket、标依赖、限定单 PR 范围，人只做审核与微调
- [一手引用] "Most of what makes this effective isn't the orchestrator — it's the prompt in WORKFLOW.md. Symphony is plumbing."
- [具体事实] 作者自己原本不知道怎么测 Electron app，是通过读 Agent 的执行日志反过来学会的

## non_obvious_points
- "Linear 看板被设计成 Agent 的 UI" — 为什么这不显而易见：表面看这就是项目管理工具，但 Todo / Rework / Backlog 这三个状态其实分别对应"派单"、"返工"、"暂停"，等于把异步消息队列做成了人能读懂的看板。换 Slack 或 IDE 都做不到这种"状态即指令"的清晰边界。
- "Bookmark / Like ≈ 2.4 这个比例本身就是信号" — 为什么这不显而易见：观众不是在围观一个 demo，而是在"我等回家试一下"地收藏。1,996 个 bookmark 对应的是一群正在攒生产力工具栈的开发者——也就是说，这篇内容能跑动是因为它解决的是一个被低估的瓶颈：合并 PR 比写 PR 更难。
- "Agent 自己学会了测试，反过来教人怎么测自己的 app" — 为什么这不显而易见：通常我们假设人教 Agent，结果原文里作者承认是他通过读 Agent 的日志学会怎么测 Electron。这个反向流动意味着：能力门槛不在"Agent 会不会做"，在"人愿不愿意让它先做、自己事后再看懂"。

## tradeoffs_and_limits
- 需要把工作切成 ticket 形状 — 具体表现：每张 ticket 必须能映射到一个可审 PR，依赖关系要前置写清楚；非 ticket 化的工作（探索性、模糊需求、跨多个仓库）跑不动
- 需要 Linear 作为外部状态机 — 具体表现：整个控制面绑死在 Linear 上，没接 Linear 的团队等于先要换项目管理工具
- 需要"合并未逐行审查的 PR"的信任 — 具体表现：30 个 PR 一晚上合掉、净删 7,000 行——人不可能逐行 review，等于把审查权委托给了 Agent 的 plan + 测试 + WORKFLOW.md 里写的约束
- WORKFLOW.md 是没被讲清楚的"暗物质" — 具体表现：作者承认编排器只是水管，真正起作用的是 prompt，但这段 prompt 在博客里只说了"follow-up 再聊"，等于这套方案的核心被留了悬念
- `max_concurrent_agents` 要从 2-3 起步 — 具体表现：意味着不能一开始就跑满，得花时间建立信任和调 prompt，速度的红利不是开箱即得

## what_to_leave_out

### 不该进入的素材
- Symphony 的安装命令、fork 链接、MCP 配置步骤——这是教程内容，视频不是教程
- "set up Symphony for my repo" 这种具体一句话指令——脱离上下文没意义
- Backlog / Todo / Rework 状态的逐一介绍——观众不需要看板教程
- 作者自己维护的 fork 这件事——细节，且和 thesis 无关

### 应避免的叙事方向
- 不要把视频做成"OpenAI 出了一个新工具"——这是新闻播报，不是判断
- 不要把全片框架建立在"50 / 30 / 7000"三个数字上——这些是钩子素材，开头用就好，主体要回到"为什么这套方案能跑"
- 不要把 ChatDisplay 那个 bug 故事讲成"Agent 多智能"——它是 Agent 自我补全人类没指定步骤的证据，不是炫技
- 不要在视频里假装讲清楚 WORKFLOW.md——原文作者自己说留到 follow-up，视频也只能"指出它的关键性"而不是"展示它"
- 不要把 Linear 看板当成可有可无的细节——它是这套方案的 UI 决策，不展开就讲不通

## signature_line
真正决定 Agent 能不能干活的，不是 OpenAI 写的编排器，是你自己写的那段 prompt——Symphony 是水管，WORKFLOW.md 才是大脑。
