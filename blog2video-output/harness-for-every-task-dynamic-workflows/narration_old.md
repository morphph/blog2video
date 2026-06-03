# Claude Code 给自己写了个外壳

## Hook

Claude Code 现在能给自己写一个临时的外壳。不是开发者写脚本去调它，是它读完你的任务，自己生成一份 JavaScript，里面派出一堆分身去干活。这个能力上周刚被 Anthropic 内部 Claude Code 团队的 Thariq Shihipar 和 Sid Bidasaria 写了一篇博客解释。今天不聊产品发布，只聊一个问题——为什么单一 context window 是 Agent 真正的天花板。

## 单 context 为什么会塌

我们先把背景铺一下。你现在用 Claude Code 跑一个任务，它会在同一个上下文窗口里又规划又执行。对于绝大多数写代码的活儿，这一套很顺。但只要任务变长、变复杂、需要并行、或者需要互相校验，事情就开始走样。

作者把走样总结成三个失败模式，每个都有名字。我觉得这三个名字本身比 workflow 这个新功能更值钱——因为这是你能在自己经历里马上对上号的现象。

第一个叫 **agentic laziness**——智能体偷懒。最有代表性的例子是这样：你让 Claude 跑一个安全审查，五十条 issue 要查。它查到第三十五条，突然就说"好了，搞定了"，然后宣告任务完成。剩下十五条它没碰，但它觉得自己已经差不多了。

第二个叫 **self-preferential bias**——自我偏好。你拿一份 rubric 让 Claude 评估自己产出的结果，它会倾向于给自己打高分。这不是它狡猾，是模型本身的归纳偏置。**让一个 agent 既当运动员又当裁判，结果通常不可信。**

第三个叫 **goal drift**——目标漂移。这个最隐蔽。一个长任务跑了几十轮，每过几轮就要做一次 compaction，把前面的对话压缩成摘要。每一次 compaction 都是有损的。最容易丢的是什么？是边界条件——"不要做 X" 这类约束。最初你说"千万别动数据库 schema"，跑了五十轮之后这一句早就被压缩没了，模型就动了。

把这三个放一起看，会发现一个共同点：根都在"plan 和 execute 挤在同一个 context window 里"。窗口越长，模型自我蒙蔽的空间越大。所以原文给的解法不是堆模型、不是加长 context，而是**把任务拆给多个 subagent，每个 subagent 自己一个独立的 context window**。

## Workflow 到底是个什么东西

说到这里你可能会想——多 agent 编排早就有人在做啊，Claude Agent SDK、`claude -p` 这些静态写法也能拼出多 agent 流程。区别在哪？

区别在"通用 vs 量身定做"。静态 workflow 因为要适配各种 case，写出来必然偏通用。Dynamic workflow 是反过来——Claude 读完你这一次的任务，**为这一次现写一份 JS 文件**。文件里有几个特殊函数用来 spawn subagent，加上 JSON、Math、Array 这些标准库就够了。它还能决定每个 subagent 用 Sonnet 还是 Opus，决定是不是要跑在独立的 git worktree 里。

我读到这里的第一反应是："为什么以前没人这么做？" 后来想明白了——以前的模型不够强，让模型自己写编排系统等于让它自己挖坑。**Opus 4.8 才让动态写 harness 这件事真的 work**。这是模型能力提升后产品形态的反转——"为所有 case 写一套通用 workflow"输给了"为这一个 case 现写一个临时脚手架"。这违反我们对软件工程 DRY 原则的直觉，但事实就是这样。

顺手提一句：workflow 中断可以续跑。关掉终端、按了 Ctrl+C，重新进 session 它会接着干。这一点说起来轻巧，但对长跑任务来说是救命功能。

## 六种模式里最值得记住的三种

原文给了六种常用模式。我不打算六种全念一遍——那会塌成 PPT 目录。挑三种最能说明问题的展开。

第一种叫 **fan-out and synthesize**——发散再汇总。一个任务能切成几十个小步骤，就开几十个 subagent 并行，每个干一个小步骤，然后有一个汇总 agent 等所有人跑完，把结构化输出合成一个结果。汇总那一步是 barrier，它必须等所有 fan-out 都回来。这一招的精髓不是"并行"，是"**每个 subagent 一个干净的 context**，互相不污染"。

第二种叫 **adversarial verification**——对抗性验证。每开一个 subagent 干活，就再开一个 subagent 拿 rubric 来挑刺。听起来像工程洁癖对吧？但回到刚才那个 self-preferential bias 的问题：让同一个 agent 验证自己的产出，模型本能地会袒护自己。**只有派另一个 agent 来挑刺，才能绕开这个偏见**。所以对抗性验证不是为了"双保险"这种朴素动机，是为了对冲模型的归纳偏置。

第三种叫 **tournament**——锦标赛。不分头干活，让多个 agent 同时尝试同一个任务，用不同的方法，然后两两比对、判出胜负。这里有个反直觉的工程细节——原文专门指出，**pairwise comparison（两两比较）比 absolute scoring（绝对打分）更可靠**。

为什么？因为让 Claude 拿 rubric 给每条打 1 到 10 分，它的打分会漂。今天打 8 分的标准，跑半小时后可能就成了 7 分。但你让它说"A 比 B 严重还是 B 比 A 严重"，这种二选一稳定得多。这套思路其实是从心理测量学借来的，但在 agent 上才被普遍验证。

## 真正打动我的几个用例

原文列了一堆用例。我挑两个我看完以后觉得"原来还能这么用"的。

一个是 **Bun**——那个对标 Node.js 的 JavaScript runtime——从 Zig 重写到 Rust。这种规模的语言迁移，按传统做法要一支团队干几个月。他们的做法是把任务拆成一堆 callsite、一堆失败的测试、一堆模块，每个开一个 subagent 在独立的 git worktree 里改，再让另一个 agent 对抗性 review。这里有一个工程细节我特别欣赏——他们专门嘱咐 agent **不要用资源密集的命令**，否则你机器并行十几个 worktree 就直接卡死了。

另一个我没想到的应用是 **triage**——工单分诊。每个团队都有处理不完的 bug report 或者支持工单，靠人手永远清不完。Triage workflow 就是：分类 → 去重 → 决定动作（自己改还是给人）。这里面有一个很妙的设计模式叫 **quarantine**——隔离。**读那些不可信公开内容的 agent，不允许做高权限动作；高权限动作交给另一组只接收处理过的信息的 agent。**

这一招看上去顺手，但其实是把多 agent 编排当成 security boundary 来用。我们都听过 prompt injection 多危险，但很少有人把对策具象化成"读外部内容的 agent 和有权限动手的 agent 必须是两个 agent"。Workflow 把这种隔离变得几乎免费——这可能是它最被低估的副产品。

## 不要把它当万能解

讲到这里你可能已经想立刻去试。先收一下。原文自己第一段就提醒——**dynamic workflow 烧的 token 量比单 context 多很多**。开五个 subagent 每个独立 context，token 是单跑的好几倍。所以原文专门有一节叫"When not to use"——日常的 coding 任务不要动不动就开 workflow，问自己一句"这件事真的需要更多算力吗？大多数传统 coding 任务不需要 5 个 reviewer 的 panel"。

还有一个代价是**本机资源**。我刚才提了一句，refactor 类用例里如果你最大化并行，机器内存和 CPU 会很快撑不住。所以原文专门嘱咐限制 subagent 调用资源密集命令。

另外原文反复说 "best practices are still developing"——这是个还在摸索的能力，不是已经定型的 API。值得现在就试，但别指望第一次就调对。

如果你要试，原文有几个实用 tip：在 prompt 里写 "use 10k tokens" 可以设 token 上限；workflow 可以和 `/loop` 配合定时跑，和 `/goal` 配合设硬性完成条件；写好的 workflow 可以存进 skill 分发出去——但**最好把它当成 template 而不是逐字执行的脚本**，给模型留改写空间。

## Synthesis

我把这整篇博客读完最大的收获不是"又多了一个功能"，而是认知层面的一次校正。

我们这一年都在讲 context engineering——怎么往 context 里塞对的信息、怎么用 MCP 接外部工具、怎么压缩对话历史。这些都对，但都在"如何用好单个 context window"这一层。Dynamic workflow 是更上一层——**它在问，这个任务该不该只用一个 context window**。

三个失败模式——agentic laziness、self-preferential bias、goal drift——本质都是"窗口太长，自我蒙蔽"。解法是结构性的：把窗口切碎，给每个子目标一个干净的窗口，再让另一组 agent 来挑刺。

所以这件事的本质判断是：**长 context 不是天花板，单一 context 才是。** Agent 的极限不在于它"能不能想到"，在于它"能不能给自己分身"。

## Closing

下次你交给 Claude 一个跑了一天还没出结果的任务，别先去骂模型笨。问自己一个问题——这事是不是应该开一个 workflow？把它拆成五个 subagent，每个一个干净的窗口，再让另一个 agent 来挑刺。如果答案是肯定的，今天就可以试。

AI 世界很吵，精读一篇，胜过刷一百条。我们下期再见。
