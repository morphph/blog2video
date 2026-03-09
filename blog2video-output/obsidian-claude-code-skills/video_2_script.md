[SLIDE 1: cover] (0:00 - 0:30)

每次写完日记，最耗时间的不是写本身，是维护。

这个人提到过，得补双链。那本书上期记过，得手动关联。

笔记维护的时间，比写笔记本身还长。你有没有这种感觉？

这里是精读AI。每期帮你从全球顶级AI团队的一手文献里，读透一篇最值得读的。今天精读Obsidian社区的真实workflow案例。

上期我们用15分钟把Obsidian变成了AI可以直接读写的知识库，零API、零认证。

这期继续深挖：接入Claude Code后，那些最耗时的维护工作，能不能真正自动化？


[SLIDE 2: principle] (0:30 - 1:30)

先说一个反直觉的事。

Obsidian没有加「问问AI」的按钮。但它的CEO Steph Ango，也就是kepano，发布了开源Skills包，专门教AI怎么说Obsidian的语言。

不是让Obsidian适配AI，而是让AI来适配Obsidian。

背后是一个清醒的判断：你的知识，应该永远是你的。

Markdown文件不被任何公司锁住。今天用Claude Code，明天换别的Agent，文件还在，工作流照常跑。


[SLIDE 3: comparison_cards] (1:30 - 4:00)

那接好之后，Claude能帮你做什么？5个社区真实在用的workflow。

**自动补链。**

写完今天的日记，对Claude说："Read today's journal and add backlinks to all people, places, and books mentioned。"

Claude搜索你的vault，找已有笔记，把双链写进日记。没有的条目，还会帮你新建。

以前要15分钟手动跳转，现在一句话。

**会议记录结构化。**

开完会，散装要点丢给Claude，它按你设定的格式整理好：文件命名`YYYY-MM-DD-topic.md`，存进`/meetings/`，议程、讨论要点、行动项，一套出来。

**每日笔记生成。**

口述你的一天，Claude转成完整日记：实体有双链，任务单独提取，想法归入对应项目笔记。

**跨文件综合搜索。**

有开发者用macOS的`mdfind`命令让Claude搜索vault里积累多年的PDF——研究论文、扫描文档、保存的文章。

Claude跨文件综合信息，生成一篇新笔记。相当于把沉睡的知识库挖出来重新盘活。


[SLIDE 4: checklist] (4:00 - 5:00)

这些workflow背后，有一套可以复用的结构——自定义Skill。

Skill文件分两部分：YAML frontmatter写触发条件，Markdown正文写执行指令。

会议记录Skill为例：命名`YYYY-MM-DD-topic.md`，存到`/meetings/`，依次写摘要、讨论要点、行动项。

写一次，Claude每次都按你的规矩来。

Skill还可以配合MCP扩展：接Google Calendar自动拉会议议程，接Notion同步研究到团队wiki，接Stripe拉客户数据进pre-call笔记。

Skill加MCP，Claude就成了你整个知识工作的调度层。


[SLIDE 5: summary] (5:00 - 6:00)

今天这期，一句话：

**Obsidian没加AI按钮，却成了最好的AI笔记工具。**

原因就是开放格式。笔记是Markdown，流程是Skill文件，AI随时可以换，知识永远属于你。

现在你可以做的一件事：想想你最常重复的笔记操作，把步骤写下来，存成vault里`.claude/skills/`目录下的一个Skill文件。

让Claude下次按你的流程来，而不是每次重新解释。

AI世界很吵，精读一篇，胜过刷一百条。我们下期再见。
