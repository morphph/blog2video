# Agent Harness 不该是框架，是 11 个可换的 Worker？

## Hook

你在 LangChain 上搭了三个月的 Agent，开始想推倒重来。你以为是自己技术选型错了，下一次换 CrewAI，换自家 SDK，半年后又想换一次。这个循环不是你团队的问题。iii.dev 创始人 Mike Piccolo 把它拆开了——harness 从来不是一个 framework，是 15 个独立的 production job，你只是被框架忽悠你打包了。

## 为什么 Agent 团队最终都会重写 Harness

我先把 Mike 文章的起点抛给你。

今天主流的做法是什么？LangChain、LangGraph、OpenAI Agents SDK、Anthropic SDK、CrewAI、AutoGen——你挑一个，把它整体装进项目里。这一个决定，等于一次性接受了它内置的循环、它内置的工具、它内置的记忆、它内置的编排。

听起来很方便。但 Mike 给的判断是这个形状本身就错了。

为什么？因为 Harness 根本不是一件东西。它是十几件不同的事情被打包到了一起。打包的原因不是它们天然属于一起，而是底层基础设施没给你一个把它们拆开的办法。

所以一年之后，几乎每个长跑的 Agent 团队都会发现同一个问题。你想要的 policy engine，不是框架里的那个 policy engine。你想要的 approval UI，不是框架内置的 chat surface。你想要的预算追踪器，不在框架的可观测链路里。

然后呢？你只有三个选择。fork 它，跟它对着干，或者绕开它。最后大家都走到了第四条路——把整个 Harness 推倒重写。

## Harness 到底有多少个责任

那 Harness 里到底装了多少件事？

Mike 在文章里列了一份非常具体的清单。一份生产级 Agent Harness，剥到只剩责任，大概有 15 件事。

我念几条给你听，你感受一下它们之间的关系。

接收前端发来的 turn 请求，把它持久化。解析当前要调用的那个模型对应的 credentials。查这个模型到底支不支持 vision、能不能流式、context window 多大。

驱动每一轮对话的状态机——从分配资源、流式吐 token、跑工具调用、决定是否继续、到收尾。

加载并提供每个函数的 skill 说明——这个工具的请求是什么形状、错误码是什么、用法注意事项。组装系统提示词，要拼模式段、要拼身份前缀、要拼工作目录、要拼默认 skill 索引。

把 token 流式吐给前端。在工具调用真正执行前，过一遍 policy。需要人工审批的工具，挂起来等人决定，决定回来之后路由到正确的那一轮对话上。

追踪每个 workspace、每个 Agent 的预算消耗。在工具调用前后跑 hook，做日志、做脱敏、做副作用。把 session 持久化成一棵分支树，这样你能 fork、能 resume。context 满了的时候做压缩。

往前端推一条事件流。最后一条，把一整条 OpenTelemetry trace 串到底，让你能 debug。

15 件事。

Mike 的观察是这样的。所有严肃的 Agent Harness 都做了其中大部分。贵的那些都做了。便宜的那些是先省了几件，到生产里再补上。而框架的做法是——把这 15 件事打成一个 monolith，每件事只 ship 一个版本。

最后那句是关键。当你一年后发现框架内置的 policy engine 不是你想要的那个，你为了换它，得把整个 Harness 一起换走。

## iii 的下注：单一原语，一组 Worker

那 iii 这套架构是怎么做的？

它把这 15 件事每一件都拆成一个独立的 Worker。每个 Worker 是一个独立进程，通过 WebSocket 连到一个共享的 engine bus。每个 Worker 在 bus 上注册一些函数，注册一些触发器。

所有 Worker 之间互相调用，只用一个原语——iii.trigger。

我重复一下这个判断，因为它是文章的核心。Harness 不是你 import 的一个 SDK。Harness 是你装的一组 Worker。它们跑在同一条 bus 上，每一个都可以独立替换，每一个都有独立版本号。

而且 Mike 强调了一句让我印象很深的话——这些 Worker 跟你业务逻辑里的 Worker 用的是同一套原语。换句话说，Harness 不是一个"特殊的东西"，它跟你自己写的应用 Worker 完全平起平坐。

那"build your own harness"这件事，就被压缩成了一个非常小的操作——你不是 fork 一个框架，你是换掉几个 Worker。

## 一轮对话在 11 个 Worker 之间是怎么走的

光这么说有点抽象。Mike 在文章里直接走了一遍——一轮对话在他们的 11 个 Worker 之间是怎么流动的。我挑最有信息量的几步给你讲。

前端发一个 turn 请求过来，最先到的是一个叫 harness 的元 Worker。它把请求转给 turn-orchestrator。

为什么要多这一跳？因为 OpenTelemetry 的 trace 要在这里把 session_id 和 message_id 注入成 baggage。之后所有 Worker 之间互相调用，这两个 ID 会自动跟着传。最后你在 trace UI 里看到的是一棵完整连通的图，而不是一堆断开的片段。

turn-orchestrator 接到请求之后做什么？它把状态写到 iii state 的一个固定路径下，然后立刻返回。真正的工作是在一个可持久的状态机里跑，由队列里的消息驱动一步一步前进。

provisioning 这一步做三件事。它启动一个微型沙箱给工具执行用。它去 iii-directory 那个 Worker 预下载这次需要的 skill。然后它组装系统提示词——拼模式段、拼身份前缀、拼 skill 索引。

然后是 assistant_streaming。orchestrator 调 provider 那个 Worker——比如 provider-anthropic、provider-openai、provider-kimi——让它去拉 SSE 流。provider 自己去 auth-credentials 那个 Worker 拿 token。流式数据一边吐回 orchestrator，一边推给前端。

每个 Worker 各管一件事。它们之间不互相 import，只通过 bus 上的函数名互相调用。

## 工具调用前的那道门

我觉得整篇文章最值得讲的一段，是工具调用经过的那道门。

每一个工具调用，不管来自哪个模型、不管最后要打哪个函数，都要先过一个统一的入口。这个入口直接调 policy::check_permissions——一个 5 秒超时的同步调用。

policy Worker 读一份 YAML 配置，匹配这个函数 ID，返回三个结果之一——allow、deny、或者 needs_approval。

allow，直接派发，工具跑，结果写回去。deny，短路掉，把拒绝信封写回结果。needs_approval，这一个调用挂到这一轮的"等待审批"列表里。批次里的其他调用继续派发，不卡住其他工具。只有当至少一个调用还在等审批，这一轮的状态才转到 function_awaiting_approval。

这里有个细节我觉得设计得非常聪明。

orchestrator 全局只注册了一个触发器——turn::on_approval。它监听的是 approvals/ 这个 scope 下的所有写入。当用户在控制台点了批准，approval-gate Worker 把决定写到 iii state 里。这个写入立刻 fire 那个全局触发器，触发器把对应的 session 唤醒，那一轮对话从挂起的地方继续往前。

为什么这个设计聪明？因为它替代的是另一种很自然但很难维护的方案——每一个挂起的调用单独注册一个唤醒触发器。那种方案的问题是，你重启服务之后要扫一遍所有挂起的状态，重新注册所有触发器。Mike 这个版本不需要。一个全局触发器覆盖所有 session。

而且这套机制是"fail-closed by construction"。policy Worker 不可达了？5 秒超时？默认就是 deny。事件发布本身失败了？也当 deny 处理。

我把这段拎出来讲，是因为它展示了一个具体的工程后果——当 Harness 是由 Worker 拼出来的，单一职责的 Worker 可以做得很扎实。

## 滑块，不是分叉路

接下来是 Mike 论点里我最喜欢的一节。

行业里讨论 Agent Harness 有一个长期的二元对立——Anthropic 派的 thin loop 极简主义，对阵 LangGraph 派的 explicit DAG 复杂主义。这个对立的前提是你必须选一边。

Mike 说，当 Harness 是 Worker 拼出来的时候，thin 和 thick 不是一道选择题，它是一根滑块。

什么叫滑块？

thin Harness 在他这套架构里，等于 turn-orchestrator + provider + auth-credentials + 一个最小的 meta-worker——四个 Worker。没有审批、没有预算、没有 policy、没有 hook 分发。运行任何东西。信任模型。

这种配置适合什么？自动化的研究 Agent，内部的实验循环，你不想被任何安全机制减速的场景。

thick Harness 是另一极。全部 13 个核心 Worker 上齐，再加一个自定义的 policy Worker、一个自定义的 approval-gate、一个集成到 Slack 的审批表面、一个把消费滚到 finance dashboard 的预算 Worker。

这种配置适合什么？给客户跑工作流的 Agent，每一次工具调用都要被审计，每一笔模型消耗都要被归账。

而 thin 到 thick 之间的距离，不是一次重写。

是一个 config 文件的改动。同样的协议、同样的 trace 形状、同样的可观测故事。你往配置里加几个 Worker，你就更厚一点；你删掉几个 Worker，你就更薄一点。

我读到这里的反应是——这是我看到过的对 thin-thick 之争最干净的瓦解。它不是说哪一边对，而是说这个二元对立本身就建立在一个错误的架构假设上。

## 把内部重构变成单 Worker 的私事

光说"可以替换"是一个口号。Mike 给了一个具体证据，证明这个解耦是真的。

最近 turn-orchestrator 自己做了一次重构。它把 FSM 从 11 个状态合并到 7 个状态，删掉了原来 per-call 注册唤醒触发器的那个老机制，换成刚才讲的那个全局 turn::on_approval。tearing_down 那一步直接内联进 finishSession。

这是 orchestrator 内部的一次重大改造。

结果是什么？approval-gate Worker 没动。session Worker 没动。llm-budget Worker 没动。provider 系列 Worker 没动。models-catalog 没动。auth-credentials 没动。hook-fanout 没动。context-compaction 没动。

因为大家不互相 import，大家只调 bus 上的函数 ID。approval::resolve 这个函数 ID 没变，wire schema 没变，所有外面的 Worker 都不知道里面发生了什么。

这个性质很特别。它意味着一个单 Worker 内部的大规模重构，和升级一个独立服务的小版本，在工程意义上是同一件事。

## Tradeoff——别只听爽点

我必须给你讲代价。Mike 文章本身就有一节谈这个，我也不会跳过。

第一，复杂度前置。13 个 Worker 各跑一个进程、走 WebSocket、注册到 engine bus，这个 substrate 的运维成本不低。如果你只是周末写一个小 Agent demo，这套架构是巨大过度工程。Mike 自己也说，最 thin 的版本至少要 4 个 Worker。

第二，你换了一种锁定。框架时代的锁定是被 LangChain 或 LangGraph 锁住。iii 这套架构的锁定是被 iii engine 这个 substrate 锁住——它的 bus、它的 state、它的 channel、它的 trigger。如果 iii 这个项目自身的演进方向以后不符合你的需求，你想搬走的代价是不小的。

第三，"build your own"不等于零成本切换。真要换 policy engine——比方说从默认的 YAML 换成 OPA、Cedar、或者自家 DSL——你还是要写一个 Worker、实现 wire schema、处理 fail-closed 语义、把 5 秒超时这些不变量都接好。

这套架构的真正卖点不是切换成本为零，而是切换的影响半径被压在一个 Worker 内部。这两件事观众容易混。

## 合在一起看

把这一切合在一起，我读完的感觉是这样的。

Mike 在做的事情，跟现在主流 Agent 框架在做的事情，主语不一样。

主流框架的主语是工程师。框架在告诉你——这是我给你准备好的 Harness，你只管 import。

Mike 的主语是 Harness 本身。他在告诉你——Harness 不应该长成一坨打包好的东西，它应该长成一组可以在同一条 bus 上拼装的零件。

这两个论点是不冲突的。但它们决定了你过两年的命运。

如果你接受框架的主语，那你过两年大概率还是在重写 Harness。

如果你接受 Mike 的主语，那"换 Harness"这件事就不是一个项目，是一个 PR——换掉那一个 Worker。

我最后留你一句话。Harness 不是你 import 的框架，是你装的几个 Worker。thin 和 thick 不是分叉路，是同一根滑块上的两个位置。下一次你团队再想"重写 Harness"的时候，先问一句——是真的要重写，还是只要换掉某一个 Worker。

## Closing

AI 世界很吵，精读一篇，胜过刷一百条。我们下期再见。
