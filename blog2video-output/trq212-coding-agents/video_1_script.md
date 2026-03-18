# Video 1: Claude Code自定义技能：9大类型+4个设计原则？

[SLIDE 1: cover]

你用 Claude Code 写退款接口。它把 invoice ID 传进去了。你纠正了。第二天，同样的错误又来。

一个 Markdown 文件，就能让它永远记住。

这里是精读AI。AI 世界很吵，每期帮你从全球顶级 AI 团队的一手文献里，读透一篇最值得读的。今天精读的是 Anthropic 工程师 Thariq 的 Skills 设计指南。

[SLIDE 2: principle]

SKILL.md 是什么？

想象给新同事写交接文档。不教他用 Git。而是告诉他，退款要用 charge ID。这种踩坑经验，官方文档没有。SKILL.md 就是这样一个文件。Claude 每次启动都会读。

Thariq 总结出 9 大 Skill 类别。像公司不同部门的手册。

[SLIDE 3: comparison_cards]

快速过一遍 9 类。Library 和 API 参考，比如 billing-lib。Product Verification，比如 signup-driver。Data 和 Analysis，比如 funnel-query。

Business Automation，比如 standup。Scaffolding，比如 new-app。Code Quality，比如 bughunt。

CI/CD，比如 babysit-pr。Incident Runbooks，比如 oncall。Infrastructure Ops，比如 orphans。

好的 Skill 归入一类。横跨三类，就该拆。

[SLIDE 4: checklist]

接下来是 4 个设计原则。

第一，Skip Obvious。Claude 本来就会用 Git。只写它猜不到的东西。

第二，Build a Gotchas Section。这是最有价值的部分。

举个例子。一个 billing Skill，第 1 天 Gotchas 是空的。第 2 周加了一条：退款向下取整，不是四舍五入。

到第 3 个月，积累了 4 条。幂等 key 过期是 24 小时不是 7 天。退款要用 charge ID 不是 invoice ID。每次 Claude 犯错就加一行。清单越来越值钱。

第三，Progressive Disclosure。用 hub-and-spoke 模式。SKILL.md 只有 30 行，像分诊台。任务 pending？去读 stuck-jobs.md。消息进死信队列？去读 dead-letters.md。Claude 只加载需要的上下文。

第四，Don't Railroad。不要规定每一步。cherry-pick 的好写法只有一句话：挑到干净分支，保留意图，搞不定就说原因。给目标，不给脚本。

[SLIDE 5: summary]

一句话。好的 SKILL.md 不复制文档。它捕捉踩坑经验，按需加载，给目标不给脚本。

现在就可以做一件事。打开常用项目，建一个 SKILL.md。写下 Claude 最近犯的 3 个错误，作为 Gotchas 起点。

知道了 Skill 类型和结构设计，下一期聊怎么让它真正好用。触发词怎么写，数据怎么存。

AI 世界很吵，精读一篇，胜过刷一百条。我们下期再见。
