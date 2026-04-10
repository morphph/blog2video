# Insight Memo: Managed Agents 架构设计

## title_zh
Anthropic把Agent拆成"脑"和"手"，性能暴涨90%？

## one_sentence_thesis
Agent 系统的核心瓶颈不是模型能力，而是 harness 把"推理"和"执行"耦合在一起——解耦之后，可靠性、安全性和延迟同时获得结构性改善。

## why_this_video_exists
这篇博客是 Anthropic 首次公开 Managed Agents 的内部架构演进路径，揭示了一个大多数 Agent 开发者没意识到的问题：你精心设计的 harness 本身就是技术债——它编码了对模型能力的假设，而这些假设会随模型升级而失效。文章用具体的工程失败案例（宠物容器、凭证泄露路径、context anxiety 消失）展示了为什么"元 harness"比"好 harness"更重要。

## judgment_lines
- Harness 不是基础设施，而是一组会过期的假设——模型每次升级都可能让 harness 中的某个补丁变成无用的死重量。 — 来源：Claude Sonnet 4.5 的 context anxiety 补丁在 Opus 4.5 上完全多余，context resets 变成 dead weight。
- Agent 系统的安全边界不能靠"限制 token 权限"来实现，因为模型会越来越聪明，能用有限权限做更多事——唯一的结构性修复是让凭证物理上不可达。 — 来源：原文明确指出 narrow scoping "encodes an assumption about what Claude can't do with a limited token—and Claude is getting increasingly smart"，结构性修复是让 sandbox 中永远接触不到 credentials。
- "先推理再分配容器"比"每个 session 预分配容器"高效得多，因为大量 session 根本不需要 sandbox。 — 来源：解耦后 p50 TTFT 下降约 60%，p95 下降超过 90%，原因是不需要容器的 session 不再等待容器启动。
- Session 日志必须独立于 context window 存在，因为所有 context 管理策略（compaction、trimming、memory）都涉及不可逆决策，而你无法预判未来的 turn 需要哪些 token。 — 来源：原文指出 irreversible decisions to selectively retain or discard context can lead to failures，session log 作为 durable context object 提供了可回溯的保底。
- 操作系统的持久力不在于具体实现而在于抽象接口——Managed Agents 的设计赌注是：session、harness、sandbox 三个接口能像 `read()` 一样，比背后的实现活得更久。 — 来源：原文用 `read()` 命令从 1970s disk pack 到现代 SSD 的类比，论证接口稳定性优先于实现。

## evidence_map
- [具体数字] 解耦后 p50 TTFT 下降约 60%，p95 TTFT 下降超过 90%
- [具体 bug 场景] Claude Sonnet 4.5 在感知到 context limit 临近时会提前结束任务（context anxiety），团队在 harness 中加了 context resets，但 Opus 4.5 上该行为消失，补丁变成 dead weight
- [具体 bug 场景] 单容器架构下，harness bug、WebSocket 丢包、容器离线三种故障呈现相同症状，工程师只能通过进入容器 shell 调试，但容器同时持有用户数据，导致实际上无法调试
- [安全攻击路径] 耦合设计中，prompt injection 只需说服 Claude 读取自身环境变量即可获取 credentials，然后可以 spawn 新的无限制 session 并委派任务
- [架构接口] 核心接口集：`execute(name, input) → string`（手）、`wake(sessionId)` + `getSession(id)` + `emitEvent(id, event)`（session）、`provision({resources})`（sandbox）、`getEvents()`（context 回溯）
- [具体事实] Git 凭证通过 clone 时注入到 local remote，sandbox 内 push/pull 可用但 agent 永远不接触 token 本身；MCP OAuth token 存储在 vault 中，通过专用 proxy 调用

## non_obvious_points
- 模型能力提升会让 harness 中的"修复"变成"障碍"——这意味着 harness 的维护成本不是随时间递减而是随模型升级递增，除非你把 harness 本身设计成可替换的。 — 为什么这不显而易见：大多数人认为 harness 优化是累积性的（越改越好），但实际上模型能力跳变会让之前的假设全部作废，好的补丁会变成坏的约束。
- "不需要容器的 session 不等容器"听起来是显然的优化，但在脑手耦合架构下根本不可能实现——因为即使 session 只需要推理，harness 也绑死在容器里，必须先完成 clone repo、boot process 全套流程。 — 为什么这不显而易见：延迟优化通常被归因于"更快的容器启动"或"更好的调度"，但真正的瓶颈是架构强制要求的不必要依赖，90% 的 p95 改善来自消除依赖而非加速依赖。
- 安全问题的根源不是"权限太大"而是"凭证可达"——narrow scoping 只是在赌模型不够聪明，而这个赌注的胜率在持续下降。 — 为什么这不显而易见：行业标准做法是"最小权限原则"，但 Anthropic 的判断是对 AI agent 来说最小权限不够，因为 agent 的能力边界是动态扩展的，必须用物理隔离替代逻辑限制。

## tradeoffs_and_limits
- 解耦引入了网络调用开销和分布式系统复杂性——每次工具调用从本地 syscall 变成了远程 `execute(name, input) → string`，延迟和故障模式都增加了。 — 具体表现：原文承认单容器方案的好处是"file edits are direct syscalls, and there were no service boundaries to design"，解耦后这些都变成了需要设计的分布式接口。
- "多脑多手"要求模型具备在多个执行环境间做决策路由的认知能力——原文明确说这是"a harder cognitive task than operating in a single shell"，早期模型做不到，这意味着架构的收益依赖模型智力的持续提升。 — 具体表现：团队最初选择单容器正是因为早期模型无法胜任多环境推理，架构解耦的可行性本身就是一个随模型能力变化的假设。
- Session log 作为持久 context 对象解决了可回溯性，但没有解决 context 选择的核心难题——"哪些 event 该放进 context window"仍然是 harness 的不可逆决策，只是提供了"犯错后可以重读"的保底。 — 具体表现：`getEvents()` 提供了 positional slices，但如何选择 slice 仍然编码在 harness 中，仍然是"会过期的假设"。

## what_to_leave_out

**不该进入的素材：**
- 操作系统历史类比的展开细节（read() 命令的历史、disk pack vs SSD），点到即止即可，不需要科普操作系统虚拟化
- MCP OAuth 和 Git credential 注入的具体技术实现步骤——观众关心的是"凭证不可达"的设计理念，不是具体的 proxy 和 vault 配置
- Acknowledgements 中的人员信息
- "pets vs cattle" 类比的详细解释——对技术观众来说这是常识，花时间解释会让内容显得初级

**应避免的叙事方向：**
- 不要把这篇文章讲成"Managed Agents 产品介绍"——核心价值是架构思想（接口稳定性 > 实现优化），不是产品功能
- 不要过度聚焦"脑和手"的比喻本身——比喻是入口，不是终点，重点是解耦带来的三个结构性收益（可靠性、安全性、性能）
- 不要把 context engineering 部分讲成独立话题——它是解耦设计的一个推论，不是并列主题

## signature_line
Harness 越好，过期越快——所以 Anthropic 不再优化 harness，而是设计一个能不断替换 harness 的系统。
