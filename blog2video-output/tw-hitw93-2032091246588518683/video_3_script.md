# Video 3: Claude Code高手都在用的防翻车秘籍

[SLIDE 1: cover] (0:00 - 0:50)

你在 CLAUDE.md 里写了一堆规则，Claude 有时候听，有时候不听。为什么？因为那只是建议，不是强制。有一种方法能让规则百分之百执行，Claude 想跳过都跳不过。

这里是精读AI。AI 世界很吵，每期帮你从全球顶级 AI 团队的一手文献里，读透一篇最值得读的。今天我们继续精读 Tw93 的这篇 Claude Code 深度指南。

上期我们发现，5个 MCP Server 光工具定义就吃掉百分之12.5的上下文窗口，还没开始干活。这期，我们来聊最后也是最关键的一步：怎么让规则强制执行，怎么避免踩坑，以及怎么真正从工具使用者变成系统设计者。

[SLIDE 2: principle] (0:50 - 2:30)

先说一个很多人忽略的东西：Hooks。

你在 CLAUDE.md 里写"提交前必须跑测试"，本质上是在拜托 Claude 自觉。上下文一挤、任务一复杂，它就"忘了"。

Hooks 不一样。它是硬编码的拦截器，挂在生命周期事件上。打个比方：CLAUDE.md 里的规则是跟孩子说"别碰插座"，Hooks 是直接装上插座保护盖。物理阻断，不靠 Claude 自觉。

它支持五种事件：PreToolUse、PostToolUse、PostToolUseFailure、Notification、UserPromptSubmit。最实用的是前两个。

比如设一个 PostToolUse Hook，每次编辑完文件自动触发格式检查。不合规范？立刻阻断。

这叫 Shift-Left 验证。没有 Hook，Claude 编辑十几个文件，编译才发现第三个就写错了，花大量时间回溯。有了 Hook，每次编辑当场校验。原文说，100 次编辑累积省一到两个小时。

[SLIDE 3: comparison_cards] (2:30 - 5:30)

Hooks 解决了规则执行。但 Claude Code 内部还有一个影响成本的隐藏机制：Prompt Caching 和 Compaction。

System Prompt 是分层缓存的：基础指令全局缓存，工具定义全局缓存，CLAUDE.md 按项目缓存，对话消息每轮递增。

当对话越来越长、窗口快满时，Compaction 自动触发。它把整段对话发给模型做摘要，压缩到约两万 token，替换掉旧消息。

这里有个反直觉的事实：你觉得"把整段对话从头发一遍做摘要"很贵？实际上，因为 System Prompt 和工具定义已经在缓存里，命中 cache 只需十分之一的价格。你以为的巨额账单，便宜十倍。

再看任务编排的演进。Claude Code 从 Todos 进化到了 Tasks。Todos 是单 Agent 线性清单。Tasks 是多 Agent 并行，任务之间有依赖关系，支持状态跟踪。这就是 Isolation Surface 的核心：隔离上下文和权限，实现受控自治。

[SLIDE 4: checklist] (5:30 - 7:00)

知道了这些进阶机制，接下来更重要的是：别过度工程化。

原文分享了一个经典 meme：初学者和真正的高手都选择 Keep It Simple。只有中间层的人会堆砌 20 个 Skills、1000 行 CLAUDE.md、100 个 Subagents。

来看几个常见的反模式，你可以对照自查。

第一，CLAUDE.md 当百科全书。所有知识都塞进去，关键指令被稀释。修复：只放契约和禁止项，资料拆到 Skills 和 rules 里。

第二，Skill 大杂烩。又像知识库又像部署脚本，触发不稳定。修复：一个 Skill 只做一类事。

第三，没有验证闭环。Claude 只能"觉得自己做完了"。修复：每类任务绑一个 verifier。

第四，已批准命令不清理。settings.json 里残留危险权限，一旦触发不可逆。定期审查 allowedTools 列表。

[SLIDE 5: summary] (7:00 - 8:00)

三期内容全部讲完了。从七层架构，到上下文经济学，再到今天的 Hooks、Compaction 和反模式修复。

原文总结了三个阶段。工具使用者关注"功能怎么用"。流程优化者开始写 CLAUDE.md 和 Skills。而系统设计者思考的是"如何让 Agent 在约束下自主运作"。

真正的质变不是学会更多命令，而是用系统思维设计人与 AI 的协作界面。

你现在可以做的一件事：给最常出错的操作写一个 PreToolUse Hook。比如每次文件编辑前自动检查项目规范。从这一个 Hook 开始，你就踏进了系统设计者的门槛。

AI 世界很吵，精读一篇，胜过刷一百条。我们下期再见。
