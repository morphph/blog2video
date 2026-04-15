# Insight Memo: Claude Code Routines

## title_zh
Claude Code能自动修Bug了？Routines把AI变成7×24员工

## one_sentence_thesis
Claude Code Routines 的核心价值不是"定时任务"，而是把 AI 编程从"人坐在终端前交互"升级为"事件驱动的自主后台代理"——这意味着 AI 的工作单位从"对话"变成了"持续运行的服务"。

## why_this_video_exists
大多数人对 AI 编程助手的认知还停留在"我问它写代码"。这篇博客揭示了一个范式转换：AI 编程代理不再需要人类在线，它可以像一个真正的后台服务一样，响应 GitHub 事件、接收 API 调用、按计划执行——这彻底改变了"AI 辅助编程"的操作模型。观众需要理解的不只是功能，而是这代表 AI 工具从"被动助手"到"主动代理"的跨越。

## judgment_lines
- Routines 的真正突破不是自动化，而是"去交互化"——它消除了 AI 编程必须有人类在场的前提 — 来源：Routines 运行在 Anthropic 托管的云基础设施上，笔记本合上也能继续工作；无权限选择器，无审批弹窗
- 三种触发器（Schedule/API/GitHub）的组合能力意味着 AI 代理可以嵌入现有 DevOps 工具链，而不是独立存在 — 来源：一个 routine 可以同时绑定定时触发、API 触发和 GitHub 事件触发；示例中直接对接 Sentry 告警、CD pipeline、issue tracker
- Routine 以个人身份执行所有操作——这是一个刻意的信任边界设计，而不是技术限制 — 来源：commits 和 PR 使用你的 GitHub 用户名，Slack 消息使用你的账号；routine 属于个人账户，不与团队共享
- 日运行次数的严格限制（Pro 5次/Max 15次/Enterprise 25次）暗示 Anthropic 把 Routines 定位为高价值精准任务，而非廉价批量自动化 — 来源：Usage and Limits 表格中明确的每日上限，且用完后需要 metered overage

## evidence_map
- [具体事实] Routines 运行在 Anthropic 管理的云基础设施上，笔记本关闭后仍继续运行
- [具体事实] 三种触发器类型：Schedule（最短间隔1小时）、API（HTTP POST + Bearer token）、GitHub（PR 和 Release 事件）
- [数字] 日运行次数上限：Pro 5次、Max 15次、Team/Enterprise 25次
- [具体事实] Routine 默认只能 push 到 `claude/` 前缀的分支，需手动启用才能推送到任意分支
- [具体事实] 所有连接的 MCP connectors 默认包含，需手动移除不需要的
- [具体事实] API 触发返回 session URL，可以直接查看 AI 做了什么并继续对话
- [具体事实] Schedule 触发可能延迟几分钟启动，但每个 routine 的偏移量是固定的
- [具体事实] GitHub 触发支持 9 种 PR 过滤条件（作者、标题、正文、目标分支、来源分支、标签、草稿状态、合并状态、是否来自 fork）
- [bug场景] Alert triage 示例：监控系统触发 API → routine 拉取堆栈追踪 → 关联最近 commits → 开 draft PR 并附上告警链接
- [具体事实] CLI 的 `/schedule` 命令只能创建定时触发，API 和 GitHub 触发必须在 Web 界面配置

## non_obvious_points
- 每次 GitHub 事件都启动独立 session（无 session 复用），意味着每个 routine 运行都是无状态的——它必须每次重新 clone 仓库、重新理解上下文。这迫使 prompt 必须完全自包含，也暗示了运行成本不低。 — 为什么这不显而易见：大多数人会假设 AI 代理有记忆或持久化状态，但 Routines 的架构是刻意无状态的，这既是限制也是安全设计。
- Routine 以你的个人身份执行一切操作，但属于个人账户不与团队共享——这意味着团队协作场景下，你需要一个"服务账号"式的个人账户来承载共享 Routines，或者每个人各自维护。 — 为什么这不显而易见：功能看起来像团队工具，但权限模型是个人的，这会造成组织落地时的摩擦。
- MCP connectors 默认全部包含的设计，意味着一个新建的 routine 默认拥有你所有外部服务的访问权限——安全最小权限原则需要用户主动操作才能实现。 — 为什么这不显而易见：文档轻描淡写地提到"remove any that aren't needed"，但默认全开的设计在安全敏感场景下是一个值得警惕的默认值。

## tradeoffs_and_limits
- [每日运行次数严格受限] Pro 用户每天只有 5 次，即使是 Enterprise 也只有 25 次。对于需要高频响应的场景（如每个 PR 都触发 review），一个活跃仓库很容易一天超过 25 个 PR。 — 具体表现：用完次数后需要启用 metered overage（额外付费）才能继续
- [无状态架构的效率代价] 每次运行都要重新 clone 仓库，对于大型 monorepo 这意味着显著的启动开销。Routine 没有持久化记忆，无法"记住"上次运行的结果，必须依赖外部存储（如 issue tracker）来传递状态 — 具体表现：文档中的 backlog maintenance 示例需要 routine 自己判断"since the last run"，实现方式未说明
- [个人身份绑定的协作摩擦] Routine 的所有操作以个人 GitHub 身份执行，不支持团队共享。如果创建者离职或账号变更，routine 会失效 — 具体表现：commits 和 PR 都挂在个人名下，团队审计时难以区分人工操作和 AI 自动操作

## what_to_leave_out
- Web/CLI/Desktop 创建 routine 的详细步骤不应进入视频，这是操作手册内容，观众在官方文档能找到
- API 请求/响应的具体 JSON 格式和 curl 命令不适合口播
- GitHub trigger 的 9 种过滤条件的逐一列举过于琐碎，提到"支持精细过滤"即可
- 不要把视频变成 Anthropic 产品发布会式的功能介绍，应该围绕"AI 代理从交互式变成事件驱动"的认知转换展开
- Environment 配置（网络访问、环境变量、Setup script）的细节太偏运维，不适合通识技术受众

## signature_line
AI 编程助手的下一步不是写得更好，而是不需要你在场就能工作。
