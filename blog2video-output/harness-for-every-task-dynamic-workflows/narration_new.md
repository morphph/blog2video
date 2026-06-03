<!--
classifier_output: {
  "primary_type": "E",
  "primary_confidence": 0.67,
  "secondary_type": "B",
  "secondary_confidence": 0.67,
  "is_mixed": true,
  "decision_rule_applied": "mixed",
  "reasoning": [
    "命中 Type E · signal (a): 全文围绕单一对象 'dynamic workflows' 做显微镜式拆解——先讲 why（三个失败模式）、再讲 how（JS 文件 + spawn subagent）、再讲六个组件模式、再讲应用场景，是典型机制拆解结构。",
    "命中 Type E · signal (b): 用了多个视觉化类比——'harness'（外壳）、'tournament'（锦标赛）、'fan-out'（散开）、'quarantine'（隔离）——每个模式都用一个具象画面命名，帮助理解。",
    "命中 Type B · signal (b): 全文嵌入 8 个完整的可复制 example prompt（'This test fails maybe 1 in 50 runs...'、'Take my business plan...' 等），这是 Playbook 风格的标志。",
    "命中 Type B · signal (c): 有相当数量的祈使句——'Pair triage workflows with /loop'、'Consider telling the agent not to use resource intensive commands'、'Try asking Claude to explore...'，约 4-6 处。",
    "未命中 Type C · signal (a)+(b): 标题 'A harness for every task' 是描述性而非反共识断言；开篇 200 字无反驳钩子。",
    "未命中 Type D · signal (a)+(b): 第一人称 'I'/'we' 不是叙事主语，且无时间线（v1→v2→v3）。",
    "调整：E 的 (c)（几乎无祈使句）未严格命中——存在 'Tips for building' 章节带操作建议——E 上限实际为 0.67，与 B 持平。",
    "decision: primary_only 与 mixed 都符合条件，diff = 0.0 < 0.2 触发 mixed；选 E 作 primary 因为全文 spine 是机制拆解，B 作为副类点缀在 use cases 和 Closing。"
  ],
  "recommended_template": "E"
}
template_used: Type E: Mechanism Breakdown (with B flavor in Closing per E+B mixed rules)
-->

# Claude Code 给自己写了个外壳

这里是精读AI。今天读的是 Anthropic 内部 Claude Code 团队上周发的一篇技术博客，作者是两位团队成员 Thariq Shihipar 和 Sid Bidasaria。他们公布了一个叫 dynamic workflows 的新能力——我把这台"会自己造分身的机器"内部怎么转，替你拆开来看一遍。

## Hook

Claude 现在能给自己写一份外壳。不是开发者写脚本调它，是它读完你的任务，自己生成一份 JavaScript，里面派出一堆分身去干活。听起来像多此一举，但这件事真正反直觉的地方在另一面——为什么单个 context window，是 Agent 真正的天花板？这才是今天要拆的那台机器。

## 全景地图：先看清这台机器的轮廓

我们要拆的对象叫 dynamic workflow。它不是一个模型，不是一个 API，它是 Claude 临时给自己造出来的一个**外壳**——英文叫 harness。harness 这个词最早是马车上套马的那副皮带——马是动力，harness 决定马的力气往哪个方向输出。同样的道理，模型是动力，harness 决定这个动力怎么被分配、怎么被验证、怎么被合成。

这台机器一共由四个部分构成。我们先挂图钉，再下钻。

第一层是 trigger——你怎么让 Claude 决定开 workflow。第二层是 generator——Claude 自己写出那份 JS 文件。第三层是 spawn engine——JS 文件里调用的几个特殊函数，负责派出 subagent，每个 subagent 自己一个独立 context window。第四层是 composer——几种可以拼起来用的编排模式，比如对抗性验证、锦标赛、发散再合成。

四层叠起来，做的是一件事：**把一个长任务，从"一个脑子从头跑到尾"，变成"一个总调度 + 一群分身，每个分身只盯一小段"**。

为什么要这么干？这就是第一层真正解决的问题。

## 第一层：为什么单 context 会塌——三个有名字的失败模式

把任务和"一个脑子从头跑到尾"绑死，会撞上三种很具体的塌方。这三种塌方各有名字。我觉得名字本身比 workflow 这个功能更值钱——因为这是你能立刻在自己经历里对上号的现象。

第一种叫 **agentic laziness**——智能体偷懒。最有代表性的画面是这样：你让 Claude 跑一个安全审查，五十条 issue 要查。它查到第三十五条，突然就说"好了，搞定了"，然后宣告完成。剩下十五条它根本没碰，但它觉得自己已经差不多了。

第二种叫 **self-preferential bias**——自我偏好。你拿一份 rubric 让它评估自己刚产出的东西，它会倾向于给自己打高分。这不是它狡猾，是模型本身的归纳偏置——**一个 agent 既当运动员又当裁判，结果通常不可信**。

第三种叫 **goal drift**——目标漂移。这个最隐蔽。一个长任务跑几十轮，每过几轮就要 compaction，把前面的对话压缩成摘要。每一次 compaction 都是有损的。最容易丢的是什么？是"不要做 X"这类边界条件。最初你说"千万别动数据库 schema"，跑了五十轮后这句早就被压成无形，模型就动了。

三种塌方放一起看，共同点很清晰——根都在"plan 和 execute 挤在同一个 context window 里"。窗口越长，自我蒙蔽的空间越大。

知道了这一层，下一层为什么必须存在？因为如果不把窗口切碎、不把目标分给不同分身，前面这三个名字就永远是模型的归宿。

## 第二层：generator——Claude 给自己写脚手架

我们到了机器的第二层。这一层是 Claude 自己写那份 JS 文件的瞬间。

画面是这样的——你输入一个任务，Claude 不立刻干活，先停一下，写一段 JavaScript。这段 JS 里有几个特殊函数专门用来 spawn subagent，加上标准的 JSON、Math、Array 这些工具函数就够了。每个被 spawn 出来的 subagent 自己一个干净的 context window。它还能挑选这个 subagent 用 Sonnet 还是 Opus，决定是不是要单独跑在一个 git worktree 里隔离环境。

之前一直困惑我的一个问题是——多 agent 编排几年前就有了啊。为什么这一波叫"动态"？区别就在这一层。

过去你要用 Claude Agent SDK 或者 `claude -p` 来拼多 agent 流程，那叫静态 workflow。静态意味着你要先想清楚所有可能的 case，写一套通用流程。动态是反过来——**为这一次任务现写一份**。

这违反我们对软件工程 DRY 原则的直觉。我们被教育的是"通用解 > 一次性解"。但当模型够强之后，反转就发生了：让模型为这一个具体任务现写一份临时脚手架，胜过让它去复用一份通用流程。Opus 4.8 这一代才真正让这件事 work——以前的模型不够强，让它自己写编排系统等于挖坑。

顺便说一句这一层的工程细节——workflow 中断可以续跑。关终端、按 Ctrl+C，重新进 session 它会接着跑。这一点听起来轻巧，对长跑任务是救命功能。

没有这一层，外壳根本造不出来。但光造出外壳还不够，关键是外壳里那几个模式怎么组合——我们到第三层。

## 第三层：六种模式里最值得记的三种

六种模式我不打算全念一遍——会塌成 PPT 目录。挑三种最能说明问题的展开。

第一种叫 **fan-out and synthesize**——散开再合成。一个任务能切成几十个小步骤，就开几十个 subagent 并行，每个干一小步，然后有一个汇总 agent 等所有人回来，把结构化结果合成一个产出。汇总那一步是 barrier，必须等齐。这一招的精髓不在"并行"，在"**每个分身一个干净的 context，互不污染**"。

第二种叫 **adversarial verification**——对抗性验证。每开一个 subagent 干活，就再开一个 subagent 拿 rubric 来挑刺。听起来像工程洁癖——为什么要双保险？回到第一层那个 self-preferential bias：让同一个 agent 验证自己的产出，模型本能袒护自己。**只有派另一个 agent 来挑，才能绕开这个偏见**。对抗性验证不是为了"双保险"这种朴素动机，是为了对冲模型的归纳偏置。这是这台机器里最反直觉的一环。

第三种叫 **tournament**——锦标赛。不分头干活，而是让多个 agent 同时尝试同一任务，用不同方法，再两两比对、判出胜负。这里有一个反直觉的工程细节——**pairwise comparison（两两比较）比 absolute scoring（绝对打分）更可靠**。

为什么？让 Claude 拿 rubric 给每条打 1 到 10 分，它的打分会漂——今天打 8 分的标准，跑半小时后可能就成了 7 分。但你让它说"A 比 B 严重还是 B 比 A 严重"，二选一稳定得多。这套思路是从心理测量学里借来的，但在 agent 上才被普遍验证。

这三种模式不是独立功能，是可以拼起来用的乐高。一个 deep research workflow 可能同时用上三种——fan-out 网搜抓 source、adversarial verify 每条 claim、最后再合成一份带引用的报告。这正是 Anthropic 已经做出来的那个 `/deep-research` skill 内部长的样子。

## 第四层：组装好之后能干什么——两个最让我意外的应用

机器拆到这里，骨架已经看完了。我挑两个让我"原来还能这么用"的应用，让你对这台机器输出长什么样有感觉。

一个是 **Bun**——那个对标 Node.js 的 JavaScript runtime——从 Zig 重写到 Rust。这种规模的语言迁移，按传统做法要一支团队干几个月。这次的做法是把任务拆成一堆 callsite、一堆失败测试、一堆模块，每个开一个 subagent 在独立 worktree 里改，再让另一个 agent 对抗性 review，最后合并。这里有一个我特别欣赏的细节——他们专门嘱咐 subagent **不要用资源密集命令**，否则你机器并行十几个 worktree 会直接卡死。

另一个让我没想到的应用是 **triage**——工单分诊。每个团队都有处理不完的 bug report 或者支持工单，靠人手永远清不完。Triage workflow 就是分类、去重、决定动作——自己改还是交给人。

这里面有一个很妙的设计模式叫 **quarantine**——隔离。**读那些不可信公开内容的 agent，不允许做高权限动作；高权限动作交给另一组只接收处理过信息的 agent。**

这一招看上去顺手，其实是把多 agent 编排顺手当成 security boundary 用。Prompt injection 是大家都听说过的危险词，但很少有人把对策具象化成"读外部内容的 agent 和有权限动手的 agent 必须是两个 agent"。Workflow 把这种隔离变得几乎免费——这可能是这台机器最被低估的副产品。

## 把这台机器再合上看一遍

四层拆完，我们把盖子合上，看一次完整的循环怎么走。

你交给 Claude 一个任务。第一层在它脑子里悄悄完成一次判断——这事一个 context 装得下，还是会撞 laziness、bias、drift 三堵墙？第二层 Claude 写出那份 JS 外壳，挑模型、挑隔离方式。第三层这份外壳跑起来，按 fan-out、对抗验证、tournament 这些模式派出分身。第四层每个分身用自己干净的窗口完成一小段，汇总 agent 等齐之后合成最终结果。

整台机器真正精妙的地方在于——**它没在让模型变强，它在让模型给自己分身**。

代价也很清楚。第一是 token 烧得多——开一群独立 context 的分身，token 是单跑的好几倍。所以这套能力的设计立场一开始就很明确——只用在复杂、高价值的任务上，日常 coding 别动不动就开 workflow，大多数传统任务不需要 5 个 reviewer 的 panel。第二是本机资源——并行十几个 worktree 机器很快撑不住。第三是这套实践还在发育，不是已经定型的 API。

这台机器揭示的一个更普遍的设计原则是这样的：我们这一年都在讨论 context engineering——怎么往 context 里塞对的信息、怎么用 MCP 接工具、怎么压缩对话历史。这些都对，但都在"如何用好单个 context window"这一层。Dynamic workflow 是更上一层——**它在问，这个任务该不该只用一个 context window**。

长 context 不是天花板，单一 context 才是。Agent 的极限不在它"能不能想到"，在它"能不能给自己分身"。

## Closing

以后你再看到一个 Agent 卡在长任务里出不来，先不要怪模型笨。在心里过一遍今天这台机器的四层——它是不是其实只需要被切成五个分身？每个分身一个干净窗口？再让另一个分身挑刺？

如果答案是"是"，今晚就可以试一次最小动作——挑一个你自己手头跑得最磕磕绊绊的长任务，让 Claude 给它写一份 quick workflow，限 token 在一万以内。看看派出三个分身互相挑刺之后，结果是不是和你单跑那一版完全不一样。

AI 世界很吵，精读一篇，胜过刷一百条。我们下期再见。
