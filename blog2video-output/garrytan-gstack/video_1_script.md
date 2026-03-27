[SLIDE 1: cover] (0:00 - 0:30)

YC的CEO，60天写了60万行代码。不是全职写，是兼职。他白天管着全球最大的创业加速器，晚上一个人产出超过20人团队。怎么做到的？

这里是精读AI。AI 世界很吵，每期帮你从全球顶级 AI 团队的一手文献里，读透一篇最值得读的。今天我们精读的是 Y Combinator CEO Garry Tan 开源的 gstack 项目文档。

[SLIDE 2: principle] (0:30 - 2:30)

先说一下这个人有多离谱。Garry Tan，YC 的掌门人，之前是 Palantir 的早期工程师，投过 Coinbase、Instacart、Rippling。现在这个人每天写一万到两万行生产代码。他上周的 retro 数据：14万行代码新增、362次 commit、大约11.5万行净代码。一周。

你可能会说，这数字太夸张了吧？是不是水代码？不是。其中百分之35是测试代码。而且他同时还在全职运营 YC。

这背后不是什么天才程序员的故事。Karpathy 说过一句话：2025年12月以来，他基本没手写过一行代码。Peter Steinberger 一个人用 AI 做出了 OpenClaw，拿了24.7万 GitHub 星标。

规律很明显：一个人加上正确的工具链，产出可以碾压传统团队。Garry Tan 的武器，就是 gstack。

[SLIDE 3: comparison_cards] (2:30 - 4:30)

gstack 是什么？简单说，它把 Claude Code 变成了一个虚拟工程团队。怎么理解？

想象你一个人开餐厅。以前对着空白厨房，想做什么菜全靠自己琢磨。这就是大多数人用 AI 编程的状态：打开对话框，想到哪写到哪。

gstack 完全不同。它给你配了20个专家角色：CEO帮你重新定义产品、工程经理锁住架构、设计师抓 AI 生成的质量问题、QA 打开真实浏览器测试、安全官跑 OWASP 审计。全部用 slash 命令调度，全部 Markdown 实现。

但关键不是工具多。关键是流程：Think、Plan、Build、Review、Test、Ship、Reflect。每一步的产出自动喂给下一步。/office-hours 生成设计文档，/plan-ceo-review 自动读取。/review 找到的 bug 被 /ship 验证修复。

没有东西掉在地上，因为每一步都知道前一步做了什么。

[SLIDE 4: checklist] (4:30 - 5:30)

说到这里，你可能想试试。判断 gstack 适不适合你，看三个信号。

第一，你是不是经常对着 AI 不知道该说什么？gstack 的结构化角色，就是给你一本岗位手册。不用从空白对话框开始。

第二，你写完代码有没有人帮你 review？/review 能找到通过 CI 但上线会炸的 bug，而且自动修复明显的问题。

第三，你敢不敢让 AI 测试你的产品？/qa 打开真实 Chromium 浏览器，点击、填表、截图。Claude 看到问题会说"I SEE THE ISSUE"，然后直接修 bug、写回归测试、验证修复。这个能力让 Garry Tan 从6个并行任务扩展到12个。AI 终于有了眼睛。

[SLIDE 5: summary] (5:30 - 6:00)

总结一下。2026年，一个人加上正确的 AI 工具链，产出可以超越20人团队。关键不是 AI 多聪明，而是你给它什么样的角色和流程。

现在就可以做一件事：去 GitHub 搜 garrytan/gstack，花30秒安装，跑一下 /office-hours，描述你正在做的产品，体验一次 AI 虚拟团队的感觉。

下期我们来拆解 gstack 的完整 sprint 流程，看看20个 AI 专家到底怎么配合工作。别忘了收藏这个系列，我们下期见。

AI 世界很吵，精读一篇，胜过刷一百条。我们下期再见。
