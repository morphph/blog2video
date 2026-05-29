# Insight Memo: How to build your own agent harness — Mike Piccolo (iii.dev)

## title_zh
Agent Harness 不该是框架，是 11 个可换的 Worker？

## one_sentence_thesis
Agent Harness 之所以总被推倒重写，是因为整个行业都把它当成"一个要 import 的框架"——而它本来应该是"一组在同一条总线上、可独立替换的 Worker 拼装出来的东西"，把 thin/thick 之争从"二选一的分叉路"变成"加减 Worker 数量的滑块"。

## why_this_video_exists
这是市面上极少数把"Agent Harness 到底由哪些零件组成"写到生产级颗粒度的文章。Mike 直接给出了一份 **15 项责任清单**和一份**11 个 Worker 的真实生产栈**，并展示了"换掉 model catalogue / 换掉 approval gate / 换掉 policy engine"在他们架构下分别长什么样。

观众从其他渠道几乎拿不到的认知：
1. 把"harness 由哪些 job 组成"写到生产清单的粒度（15 条，不是抽象的"loop/tools/memory"）
2. "thin vs thick 是一根可拖动的滑块，不是单选题"——一个对 Anthropic 极简派 vs LangGraph 重量派之争的全新框架
3. "Worker 替换 = 注册同一个 function id"这个最小操作单元，把"重写 harness"的成本降到"写一个 Worker"
4. 一组具体的延迟数据（500ms/次函数调用、FSM 11→7 状态）证明这套架构在真实生产里被持续优化

## judgment_lines

- "Agent 团队最终都重写 Harness，不是因为框架做错了什么，而是因为把 10-15 个本应独立的关注点打包成了一个 import" — 来源：原文 "the harness isn't one thing. It's ten or twelve different things bundled together because the surrounding ecosystem doesn't give you a way to compose them"

- "Thin vs Thick Harness 不是一个选择题，而是一根滑块——滑块的位置等于你装了几个 Worker" — 来源：原文 "thin vs thick is just a count of how many workers you install"；thin = orchestrator + provider + auth + meta 4 个 Worker，thick = 全部 13 个加自定义 policy/Slack 审批

- "Framework 替你预先选好了滑块位置然后把它焊死了，Worker 模型把那根滑块还给你" — 来源：原文 "A framework picks a position on the slider for you and locks you in. The worker model leaves the slider in your hand"

- "重写一个 Worker 的 FSM 状态机（11 状态→7 状态）能在不动其他 Worker 一行代码的情况下完成，前提是大家只通过 bus 上的 function id 通信" — 来源：turn-orchestrator 把 `turn::approval_resume::<sid>/<cid>` 改成单个 `turn::on_approval` state trigger，approval-gate / session / llm-budget / providers 全部不动

- "Build your own harness 不应该等于 fork a framework，应该等于 swap a few workers" — 来源：原文 "'build your own' stops meaning 'fork a framework.' It means 'swap a few workers.'"

## evidence_map

- [类型: 具体清单] 15 项 Agent Harness 责任清单：accept turn / 解析 credentials / 查 model capability / 驱动 per-turn 状态机 / 加载 skill bodies / 组装 system prompt / 流式返回 token / policy 校验每个 tool call / 暂停 + 路由人工审批 / 跟踪 LLM 花费 / 跑 hook / 持久化 session 为分支树 / 压缩 context / 发 event stream 给 UI / 全链路 OTel trace

- [类型: 具体架构] 11 个 Worker 组成生产栈，全部在 workers.iii.dev 注册表上，每个独立版本，每个用同一个 WebSocket 协议连接 engine bus

- [类型: 具体函数名 / 代码片段]
  - `iii.trigger('approval::resolve', { session_id, function_call_id, decision: 'allow'|'deny'|'aborted', reason })`
  - `policy::check_permissions` / `models::list` / `provider::<name>::stream` / `auth::get_token` / `directory::skills::get` / `budget::record`
  - 状态写入路径：`session/<sid>/turn_state`、`approvals/<sid>/<cid> = {decision, reason}`

- [类型: 具体延迟数据] 移除 hook fanout 的 publish_collect 短路掉 subscriber-presence cache 没有订阅者的 topic，**节省约 500ms / 每个函数调用**

- [类型: 具体重构数字] turn-orchestrator 把 FSM **从 11 个状态合并成 7 个**，删掉了 per-call 的 `turn::approval_resume::<sid>/<cid>` 机制，改用一个 `turn::on_approval` state trigger

- [类型: 具体 fail-closed 行为] 如果 policy worker 不可达或 5 秒超时，consultBefore 用 `gate_unavailable` envelope 直接拒绝；如果 `iii::durable::publish` 报错，hook fanout 返回 `publish_failed: true`，orchestrator 当 deny 处理

- [类型: 具体替换案例] 把 console 审批换成 Slack 审批 = 写一个 Slack Worker 监听 `/approve <id>` 和 `/deny <id>`，调用同一个 `approval::resolve`。orchestrator 完全不知道差别

- [类型: 一手引用] "A framework picks a position on the slider for you and locks you in. The worker model leaves the slider in your hand."

- [类型: 一手引用] "The harness is built on the same primitive your business logic is built on."

- [类型: 业界对比] Anthropic thin loop vs LangGraph explicit DAG 被作为传统二元对立的代表

## non_obvious_points

- **"Worker 模型把内部重构变成自包含变更"** — 为什么这不显而易见：大多数人讨论"模块化"停留在"接口稳定就行"，Mike 的具体例子（FSM 11→7 状态，删掉一个机制换成另一个，但 approval-gate / session / budget / provider 全部零改动）展示了一个反常识结果：**单 Worker 内部的大规模重构和单 Worker 升级版本是同一件事**——这是 bus + function id 协议给的，框架给不了。

- **"Skills 和 System Prompt 是两个不在 Worker 表里但被同样 bus 化的层"** — 为什么这不显而易见：大家想到 harness 模块化时通常想到 policy / approval / budget 这种"服务"，但 Mike 把 skill 分发（`iii://<worker>/<function>` 路径下的 skill body）和 system prompt 组装（mode + identity preamble + skills appendix）也做成了 bus 上可替换的层。这意味着"覆盖 system prompt"和"换一个 model provider"在他们架构里是同一种操作。

- **"Trace 自动注入是 Proxy 包 registerFunction 实现的"** — 为什么这不显而易见：很多人写 OTel 仪表都靠每个 Worker 自己记得加 span。Mike 的实现是 `src/runtime/worker.ts` 用 Proxy 包了 `registerFunction`，所以"每个 Worker 都参与了 trace"是 SDK 强制的，不是文化纪律。这把"全链路可观测"从约定变成了机制。

## tradeoffs_and_limits

- **复杂度前置** — 具体表现：11 个 Worker 各跑一个进程、走 WebSocket、注册函数到 engine bus，这个 substrate 的运维成本高于 import 一个 SDK；对一个 weekend hack 的小 agent 显然过度工程。"thin harness = 4 个 Worker"已经是底线，再下面 iii 这套架构就不划算了。

- **强绑定 iii engine 这个 substrate** — 具体表现：Worker 之间互通靠的是 iii engine bus、iii state、iii channel、iii.trigger 这些原语，本质上是把"框架锁定"换成了"基础设施锁定"。如果未来 iii 项目自身演进方向不符合你的需求，你换走的代价比换一个 framework 要大。

- **"build your own"≠零开发量** — 具体表现：真要换 policy engine（OPA / Cedar / 自家 DSL）或换 approval gate UI，仍然要写 Worker、实现 wire schema、处理 fail-closed 语义。文章卖点不是"零成本切换"，而是"切换的影响半径被压到一个 Worker 内"。这两件事观众容易混。

## what_to_leave_out

### 不该进入的素材
- iii engine 内部具体目录结构（`packages/coding-agent`、`crates/iii-worker/src/sandbox_daemon`）——细节，与观众无关
- 详细的 FSM 转换路径（function_execute → function_awaiting_approval → assistant_streaming）——技术 deep dive，视频塞不下
- iii-sandbox microVM 的细节——属于 provisioning 一层的实现，与 harness 组合性论点无关
- 文末的 Discord、文档、GitHub 链接矩阵——promo，不进视频
- "Pi agent packages are on the right track but..." 这段对 Pi 的对比——会让视频陷入产品比较的口水仗

### 应避免的叙事方向
- **不要写成 iii 产品宣传**——文章本身就是 iii 创始人的 launch post，视频如果跟着重复"iii 多好"就成了广告。Hook 必须从"你的 agent 团队"切入，不是从"iii 发布了什么"切入。
- **不要把全片建立在 "15 jobs" 清单上**——这是文章的展示工具，但作为视频结构会变成念清单。视频的中心论点是"滑块 vs 分叉路"+"composition 是 substrate"。
- **不要陷入和 Addy "Harness Engineering" 同构的元论述**——Addy 谈的是 "harness 是工程学科"、五种框架（ratchet/behavior-driven/migration/training loop/HaaS）。Mike 谈的是 "harness 应该长什么形状（composition over framework）"。两者主语不同：Addy 主语 = 工程师，Mike 主语 = harness 本身的架构。视频要锚在 Mike 这边。
- **不要把"换 Worker"讲成"很简单"**——文章本身已经在 tradeoff 章节注意到 substrate 绑定问题，视频如果一味讲爽点，会让懂行的人立刻反弹。

## signature_line

Harness 不是你 import 的框架，是你装的几个 Worker——thin 和 thick 不是分叉路，是同一根滑块上的两个位置。

## hot_keywords

- Agent Harness — 全文核心概念，标题即关键词，是当下行业讨论高频词
- Claude Code — 未直接提及，但 Anthropic SDK / thin loop 在第六节作为对比对象出现
- MCP — 未提及，可不强行套
- Codex — 未提及
- Subagent — 未提及（这里的"worker"是 iii 自创概念，不要和 Claude Code subagent 混用）

主热词锚点：**Agent Harness**（直接命中），**Worker / 组件化 / 可替换**（作为反框架阵营的新阵地词，可作为 Hook 第二句的差异化锚点）。
