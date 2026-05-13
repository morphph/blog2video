# 睡前推 50 张 ticket，醒来 7000 行没了

## Hook

睡前往 Linear 推了 50 张 ticket，醒来 30 个 PR 已经合掉，净删 7000 行代码，两天没出问题。这是 OpenAI 的 George，@odysseus0z，在他自己的 Electron 老项目上跑的真实结果。

工具叫 Symphony，是 OpenAI 刚开源的 Codex agent 编排器。今天不教你怎么装 Symphony——只聊为什么这件事现在能发生。

## 这件事现在能发生，靠的是什么

先把这套方案的骨架拆给你看。它一共四个零件。Symphony，是编排器。Linear，是控制面。Codex，是干活的 agent。还有一份藏在仓库里的 WORKFLOW.md，是 prompt。

四个零件里，前三个都是基础设施。真正决定它能不能跑通的，是第四个，也就是那段 prompt。这是后面我会反复回到的判断。

但在这之前，我们先看一个非显然的设计——Linear 这个看板，到底为什么会成为控制面。

## Linear 作为控制面，是个非显然设计

你想想，要做人和 Agent 群之间的协作界面，第一直觉应该是什么？是 Slack，是 IDE 里的对话框，是命令行。

但 George 选的是 Linear，一个项目管理看板。

为什么这是个聪明的选择。因为看板的三个状态——Todo、Rework、Backlog——天然就是"派单"、"返工"、"暂停"这三个指令。状态本身就是消息。你把 ticket 拖到 Todo，几秒之内有一个空闲的 Agent 自己接走。你写一段 review 评论拖到 Rework，原来那个 Agent 自己回来继续改。

这是异步消息队列的本质，但被包装成了一个人能读得懂的界面。Slack 做不到，IDE 也做不到——状态即指令，是看板独有的清晰边界。

## ChatDisplay 那一段：Agent 自我补齐的证据

接下来这段是这篇博客里我最想让你听到的。

George 推过去一张 ticket，让 Agent 去重构一个叫 ChatDisplay 的组件。整张 ticket，一个字都没提到要测试。

Agent 拿到 ticket 之后做了什么。它通过 CDP，也就是 Chrome DevTools Protocol，attach 到那个正在跑的 Electron app 上。它用一个叫 agent-browser 的工具，往运行中的应用里注入了一个临时的探针，强制触发了一个渲染错误。然后它截图记录失败状态，再点击恢复路径，再截图记录恢复成功，最后把那个临时探针清理干净。

整套流程，self-directed。Ticket 上根本没写。

George 在原文里有一句话，挺让人停顿的。他说：我自己原本都不知道怎么测一个 Electron app，是通过读 Agent 的日志，反过来学会的。

这是一个反向流动。我们一直以为是人教 Agent，但在这一刻是 Agent 教人。

## 真正的关键，不是编排器，是那段 prompt

聊到这里，你可能以为重点是 Symphony 这个编排器写得多巧。

George 自己在文章最后一段，亲口否定了这件事。原文是这样的——Most of what makes this effective isn't the orchestrator. It's the prompt in WORKFLOW.md. Symphony is plumbing.

翻译过来就是：起作用的不是编排器，是那段 prompt。Symphony 只是水管。

水管负责轮询 Linear、派发 worker、管并发槽位。但 Agent 该怎么拆计划、怎么测试、怎么处理 review 反馈、怎么把 scope 控制在一个可审 PR 之内——全是那段 prompt 在教。

而那段 prompt，作者说留到下一篇 follow-up 再讲。这是这套方案的暗物质——核心被留了悬念。

## 代价也得讲清楚

但我得诚实地把代价也讲出来。这套东西不是开箱即用的爽文。

第一，你的工作必须能被切成 ticket 形状。每张 ticket 得映射到一个能审的 PR，依赖关系得提前画清楚。探索性的、模糊的、跨多个仓库的活，跑不动。

第二，你得能接受合并你没逐行 review 的 PR。一晚上 30 个 PR、净删 7000 行——人不可能挨行看。审查权实际上下沉到了 Agent 的 plan、测试，和 WORKFLOW.md 里的那些约束。这是个信任问题，不是技术问题。

第三，那段最关键的 prompt 没公开。George 说留到下一篇，但今天你想复现这件事，得自己摸索。

第四，并发数得从 2 到 3 起步，慢慢往上加。速度的红利不是开箱即得，得花时间建立信任，调 prompt，调 max_turns。

## 我的判断

把这些放在一起看。

我看 Symphony，看到的不是一个新工具。是一个能力门槛被突破的时刻——一个人，在一晚上里，第一次跑通了多个并行的 codebase agent。

但能跑通的前提，是把整套工程流程压成了 ticket 形状。是把 Linear 看板当成了 UI。是写好了那段 prompt。

模型有没有变强？没有特别变。是 Codex，是大家都能用到的那个 Codex。

变的是别的东西。是工程流程被压扁、被对象化，变成了 Agent 能消费的格式。这条博客 222000 浏览、840 点赞、但 1996 个 bookmark——bookmark 比 like 还多两倍多。这个比例本身就是信号：观众不是在围观，是在收藏研究、准备回家自己试。

合并 PR 比写 PR 难。这是被低估的瓶颈。Symphony 没解决"怎么写代码"，它解决的是"怎么让一个人敢合一晚上 30 个 PR"。

## Closing

最后留一句话给你。

真正决定 Agent 能不能干活的，不是 OpenAI 写的编排器，是你自己写的那段 prompt。Symphony 是水管，WORKFLOW.md 才是大脑。

AI 世界很吵，精读一篇，胜过刷一百条。我们下期再见。
