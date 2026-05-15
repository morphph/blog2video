# Claude Code 把 session 当进程管，不当 tab

[SLIDE 1: cover] (0:00 - 0:24)

Anthropic 刚把 Claude Code 的 agent view 文档放出来了。我读完之后最想跟你聊一件事：每一个 session 行尾那条总结，是一个独立的 Haiku 模型，每 15 秒帮你刷一次。账单算在你自己头上。今天不讲快捷键怎么按，只讲这份文档里藏着的几个设计赌注。

[SLIDE 2: comparison_cards] (0:24 - 2:03)

你打开 agent view，看到每行前面有一个小图标。第一反应会觉得，这就是状态指示灯嘛，绿色完成，红色失败，灰色停了。

但你认真读 docs 会发现，颜色和形状是两套表，两条维度。

颜色这条管的是语义。Working 是动画，Needs input 是黄色，Completed 是绿色，Failed 是红色，Stopped 是灰色。这条很正常。

奇怪的是形状这条。`✻` 表示进程还活着，可以立刻回话。`∙` 表示进程已经被回收了，但状态还在磁盘上，你点它还能从中断点续起。`✢` 是 `/loop` session 在两次迭代之间睡着了。

两条维度组合在一起，意思就完全不同了。一个绿色的 `✻` 是"任务完成、进程还活着"。一个绿色的 `∙` 是"任务完成、进程被回收了"——你看到的是文件，不是进程。这两个对你的心智模型完全不一样。

为什么要做成两层？因为团队心里有一个判断：语义状态和进程生死，是两件独立的事，不能合并成一个颜色码。你不需要知道进程活着没活着才能判断任务完没完。但你需要知道点过去会不会立刻有反应。

[SLIDE 3: principle] (2:03 - 3:27)

接着说那个行末的一句话总结。"Edit src/physics/CollisionSystem.ts"、"needs input: double jump or wall climb"——你扫一眼就懂这个 session 在干嘛。

文档里写得非常诚实：这一行总结，是一次独立的 Haiku-class 模型调用。最多每 15 秒刷一次，外加每个 turn 结束的时候再刷一次。走的是你自己的 provider，按 data usage terms 走和 session 同一份账。

这条信息我读到的时候停了一下。它意味着团队做了一个选择：为了让你"扫一眼就懂"这个体验，他们愿意让你为额外的小模型调用付钱。不是 Anthropic 偷偷给你的免费 UX 糖，是明确进了你的配额。

你如果同时开 10 个 session，背景就是 10 路独立计费的 Haiku 在那儿循环跑。每 15 秒一刷。

这个选择我觉得反而是真诚的。如果不刷新，你就得 peek 进每个 session 看；如果刷得太快，账单受不了。15 秒这个数字大概就是他们权衡出来的最低节流——既不会让你感觉行总结过时，又不会让 Haiku 账单爆炸。

[SLIDE 4: principle] (3:27 - 5:03)

往下读到 hosting 这一段，整篇文档的架构判断就浮出来了。

Background session 不挂任何终端。它由一个 per-user 的 supervisor 进程托管。你关掉 agent view，关掉 shell，session 照常跑。

更狠的一条：supervisor 会盯着磁盘上的 Claude Code 二进制文件，auto-updater 一替换，supervisor 就 restart into the new version。这不是网络检查，是本地文件 watch。

这条意味着什么？意味着 background session 必须设计成可以被无感重启的对象。状态全部存在 `~/.claude/jobs/<id>/state.json`、`daemon/roster.json` 这些文件里。supervisor 死了，下一个 supervisor 起来，照样能把所有 session 接回去。

session 不是"长跑的进程"，是"随时可以被 cold-start 的对象"。

这跟我们平时对 agent 的理解是反过来的。我们以为 agent 跑起来就是一个活着的进程，关掉了就没了。Claude Code 的设计是：进程是临时的，对象是永久的。空闲一小时左右，supervisor 会主动把进程杀掉释放资源。你下次 peek 或者 attach 的时候，从磁盘上的 state 重启一个新进程出来。

所以 docs 里那条 `claude respawn --all` 才有意义——机器睡眠或者关机之后，所有 session 需要批量重启。supervisor 能跨 auto-update 幸存，但跨不了机器重启。

这是把 session 当系统对象，不当终端 tab。tab 关了就没了，对象关了还在磁盘上。

[SLIDE 5: principle] (5:03 - 5:58)

agent view 底部就一个输入框。你打字按回车，是派一个新 session。但你打 `a:foo`，是按 agent 名字过滤；打 `s:blocked`，是只看等你输入的 session；打 `#1234` 或者贴一个 PR URL，是跳到正在做这个 PR 的 session。

一个输入框，根据语法前缀切换语义。

这种"上下文相关解释"的设计有它的代价。代价是你要记住几个前缀规则——`a:` 是 agent，`s:` 是 state，`#` 是 PR。

但团队选了这条路而不是再开一行搜索框，原因很明显：屏幕空间。agent view 已经被状态分组、PR 状态点、行总结塞得很满了，再加一行 filter input 体验就糟了。

省下来的不是按键，是屏幕预算。

[SLIDE 6: principle] (5:58 - 7:16)

这条我读 docs 的时候差点漏掉，但它是整个设计的关键证据。

文档里专门写了一句："Typing another prompt and pressing Enter launches a second session alongside the first rather than sending a follow-up to it."

翻译成大白话：你在底部输入框打一句话回车，不是给已有 session 继续发消息，是开一个全新的 session。

为什么要专门写一句？因为这反直觉。你看着 agent view 这个界面，本能反应就是把它当聊天室，回车继续对话。团队心里清楚这是反直觉的，所以特地用一整句话警告你。

你想给已有 session 加 instruction，只能 peek 进去或者 attach 进去。底部那个输入框只做两件事：派新 session 或者筛选。

这条限制说明什么？说明在团队的心智模型里，session 不是一个对话窗，是一个对象。对象创建出来就是独立的，不会因为你长得像它就被合并进去。每个 prompt 等于一个新对象、独立的订阅配额、独立的 worktree、独立的进程生命周期。

[SLIDE 7: checklist] (7:16 - 8:16)

讲爽点必须讲代价。这几个设计的账单、风险，文档里都写了，我挑三条最该提醒你的。

第一，并发派单的真实瓶颈不是你的机器，是你的订阅配额。docs 在 quick start 第二步就写了："Each session uses your subscription quota independently"。10 个并发 session = 10 份配额在烧，外加 10 路 Haiku 行总结在背景刷。

第二，删除 session 等于删除 worktree。`Ctrl+X` 按一次停，两秒内再按一次就删。worktree 里没 commit 的改动全部丢掉。docs 反复强调 push or commit before delete——这是 worktree 隔离的副作用，便利和危险绑在同一个键上。

第三，supervisor 这套架构虽然解决了 session 持久化的问题，但排错路径变长了。状态散在三个地方：`~/.claude/daemon.log`、`daemon/roster.json`、`jobs/<id>/state.json`。不是一个文件能看全。一旦出问题，你得知道去哪儿翻日志。

[SLIDE 8: quote] (8:16 - 9:24)

读完整份 docs，我最大的感受是：这不是一个 TUI，是一个会话管理系统。

颜色告诉你 session 在想什么，形状告诉你它还活不活着。supervisor 把进程和终端剥离，session 因此变成了磁盘上的对象，可以被无感重启、被批量恢复、被跨项目可见。底部输入框被压成两个角色，省屏幕不省语义。每个 prompt 都是新对象，回车不是 follow-up，是 instantiation。

这些选择放在一起看，团队在做的事情很明确：把 session 从终端 tab 提升成系统里的一类对象。tab 是 UI 概念，对象是架构概念。从 tab 到对象，中间隔的是 supervisor 这个常驻进程、是 state.json 这种持久化合约、是双层 indicator 这种维度拆分。

Agent view 表面上是给你看 session 在干嘛，本质上是把 session 从终端里抽出来，变成可以被管理的对象。

[SLIDE 9: summary] (9:24 - 9:46)

下次你打开 `claude agents`，别只看那张表，看看那个 `✻` 还是 `∙`，想想 supervisor 此刻在不在听磁盘上的二进制。这份 docs 真正告诉你的，不是怎么用 agent view，是 Anthropic 怎么想 session 这件事。

AI 世界很吵，精读一篇，胜过刷一百条。我们下期再见。
