# Video 3: Claude Code + API 开发者武器库：省90%token的秘密

[SLIDE 1: cover] (0:00 - 0:08)

一行配置，token 账单直接砍掉九成。

这不是标题党，这是 Anthropic API 里一个大多数人没打开的开关。

这期，我带你把 Claude Code 的开发者武器库拆个底朝天。

[SLIDE 2: principle] (0:08 - 0:30)

这里是精读AI。AI 世界很吵，每期帮你从全球顶级 AI 团队的一手文献里，读透一篇最值得读的。

上期讲了 Cowork 如何10天内被 Claude 自己造出来，并让 SaaS 市值蒸发千亿。这期，我们来看开发者手里的武器库。

Claude Code 从今年二月一个命令行工具，长成了一个年收入25亿美金的完整开发平台。但多数人只会用它写代码，真正的杀手锏藏在配置层和 API 层。

[SLIDE 3: principle] (0:30 - 1:15)

先说 CLAUDE.md。你可以把它理解成你给 Claude 写的一份"入职手册"。新员工第一天上班，你不会让他自己猜公司规矩，对吧？CLAUDE.md 就是这个作用——它会被加载进系统提示词，告诉 Claude 你的项目怎么构建、怎么测试、有哪些坑要避开。

关键是写"为什么"，不只是写"什么"。比如别写"用 pnpm"，要写"我们用 pnpm 因为 npm 在 monorepo 里处理依赖有 bug"。控制在200行以内，别把文档全塞进去。

[SLIDE 4: principle] (1:15 - 2:05)

但大多数人不知道的是，CLAUDE.md 有一套完整的层级体系。这就像公司的规章制度：集团有集团的，部门有部门的，你个人还能有自己的偏好。

四层结构：最顶层是 Managed Policy，组织强制执行，谁都不能改。第二层是你个人的全局配置，放在 ~/.claude/CLAUDE.md。第三层是项目根目录的 CLAUDE.md，提交到 git，团队共享。第四层是 CLAUDE.local.md，你自己的项目偏好，gitignore 掉。冲突时上层优先。

[SLIDE 5: comparison_cards] (2:05 - 2:45)

这里有个真实的坑。有个团队花了两天 debug"Claude 行为不稳定"——同样的代码库，资深开发用着很顺，新人接手就各种乱。最后发现原因特别简单：资深开发在个人全局配置里写了一堆指令，但这些没进 git。新人克隆仓库，根本拿不到那些配置。

所以记住：团队共享的规则，必须放在项目级 CLAUDE.md 里，提交到版本控制。

[SLIDE 6: comparison_cards] (2:45 - 3:35)

接下来是三个容易混淆的概念：Commands、Skills 和 Agents。

Commands 是你手动触发的斜杠命令，比如 /project:review，相当于快捷键。Skills 是 Claude 自动识别并调用的能力，你不用喊它，它看到合适的场景自己上。Agents 是独立的子智能体，有自己的系统提示词、工具权限，甚至可以指定用不同的模型。

一句话总结：Commands 等你下令，Skills 自己判断时机，Agents 是你的专属团队成员。

[SLIDE 7: principle] (3:35 - 4:10)

说到模型，别什么活都让最贵的干。Anthropic 自己的建议是这样分配：只读分析、代码审查这种轻活，用 Haiku，便宜快。日常编码任务，用 Sonnet，性价比最好。架构设计、复杂推理，才上 Opus。这就像公司里不是每件事都需要 CTO 亲自干，合理分工才高效。

[SLIDE 8: checklist] (4:10 - 5:00)

现在进入 API 武器库。第一个大招：Token-efficient tool use。

普通的工具调用，每次都要把完整的工具定义重新发给模型，来回搬运大量重复 token。打开这个选项后，模型会缓存工具的 schema，后续调用只传增量信息。官方数据：最高减少百分之九十的 token 消耗。如果你的应用大量调用工具，这一个开关就能让你的 API 账单断崖式下降。

第二个：Files API。以前每次对话都要重新上传文件，现在上传一次，拿到一个 file ID，跨会话反复引用。省带宽，省 token，省时间。

[SLIDE 9: principle] (5:00 - 5:35)

最后是 MCP，Model Context Protocol。你可以把它想成 AI 世界的 USB 接口——一个通用标准，让 AI 模型能连接任何外部工具和数据源。数据库、API、内部系统，只要实现了 MCP 协议，Claude 就能直接调用。不用再为每个工具单独写对接代码。

Anthropic 还在 GitHub 上开源了17个官方 Skills，仓库名 anthropics/skills，直接拿来用。

[SLIDE 10: summary] (5:35 - 6:00)

总结一下你今天就能做的三件事：第一，建立 CLAUDE.md 三层指令体系，团队规则进版本控制。第二，把重复工作流封装成 Skills，让 Claude 自动识别调用。第三，API 项目立刻打开 token-efficient tool use，账单立减。

AI 世界很吵，精读一篇，胜过刷一百条。我们下期再见。
