[SLIDE 1: cover] (0:00 - 0:30)

你往Obsidian里存了几年笔记，结果AI生成的格式在里面全是乱的。

Callout语法不对，wikilink失效，折腾半天还不如自己手打。

你不是一个人——几乎每个用Obsidian的人都踩过这个坑。

但最近，Obsidian的CEO亲自出手了。他发布了一个官方Skills包，专门教Claude怎么说Obsidian的语言。

这是史上第一个由主流工具厂商官方维护的Agent Skills。AI生成的笔记，终于能在Obsidian里「原生」打开，而不是像从别处复制来的外来户。

这里是精读AI。AI世界很吵，每期帮你从全球顶级AI团队的一手文献里，读透一篇最值得读的。

今天我们精读的，是Obsidian官方技术博客和社区发布的Claude Code集成方案。

今天要讲的是：你只需要15分钟，就能让Claude真正读懂你的知识库。


[SLIDE 2: principle] (0:30 - 2:00)

先说一个很多人没意识到的事：你的Obsidian vault，本质上就是一个代码仓库。

不是比喻，是字面意思。

一个代码仓库是什么？一堆纯文本文件，按文件夹组织，文件之间互相引用。

你的Obsidian vault呢？一堆纯文本Markdown文件，按文件夹组织，用双链互相引用。

结构是一样的。

这就是为什么Claude Code和Obsidian天然匹配——Claude Code本来就是为读写代码仓库设计的。你的笔记库，对它来说是同一种东西。

而且，Obsidian的笔记是存在本地文件系统里的。没有API，没有账号验证，没有速率限制。

你打开终端，输入`cd ~/my-vault && claude`，就接上了。

就这么简单。


[SLIDE 3: comparison_cards] (2:00 - 5:30)

好，那具体怎么接？有三种模式，你可以根据自己的习惯选。

**第一种：直接文件系统访问。**

最简单，零配置。打开终端，进入你的vault目录，运行claude。完成。

适合大多数人，特别是已经习惯命令行的用户。

**第二种：MCP Bridge。**

通过一个叫`obsidian-claude-code-mcp`的插件，在Obsidian内部运行一个MCP服务器。用WebSocket连接Claude Code和Obsidian。

这种模式的好处是：Claude能直接感知到Obsidian的运行状态，比如你当前打开的是哪个文件。

**第三种：嵌入式终端。**

直接在Obsidian界面里内嵌一个终端，左边是笔记，右边是Claude Code，并排工作。

如果你不喜欢来回切窗口，这种模式最顺手。


三种模式选好之后，第一件事：运行`/init`。

这会在你的vault根目录创建一个`CLAUDE.md`文件。

这个文件是Claude的「记忆」。你在里面写清楚你的vault结构、命名规范、常用模板，Claude每次开新session都会自动加载。

不用每次都重新解释一遍"我的日记文件夹在哪、tag怎么写"。


接下来是今天最关键的一步：安装官方Skills包。

运行这条命令：`/plugin marketplace add kepano/obsidian-skills`

这是Obsidian CEO Steph Ango亲自发布和维护的。史上第一个由主流工具厂商官方出品的Agent Skills包。

里面包含三个核心Skill：

第一个教Claude认识完整的Obsidian Markdown语法——wikilink、callout、YAML属性、Mermaid图表、LaTeX公式，全覆盖。

第二个处理`.base`文件格式，也就是Obsidian的结构化数据视图。

第三个让Claude能新建和编辑`.canvas`文件，也就是Obsidian的白板格式。

安装好之后，Claude就不会再写出那种「看起来像Markdown但在Obsidian里打开全是乱的」内容了。


这里有个技术细节值得单独讲一下，因为它解释了为什么你可以安心安装很多Skills而不担心把Claude的上下文撑爆。

Skills使用的是「渐进加载」机制。

Claude启动时，每个Skill只加载名称和描述——大约100个Token。只有当Claude判断某个Skill和当前任务相关，才会把完整指令加载进来。

这意味着你可以安装几十个Skills，但Claude的工作内存里同时只有真正用到的那几个。


[SLIDE 4: checklist] (5:30 - 6:30)

好，到这里我们把整个15分钟的安装路径梳理一下。

你需要按顺序做四件事：

第一，确认你有Claude Pro、Max、Team或者Enterprise订阅——Claude Code需要这个级别的访问权限。

第二，打开终端，`cd`进入你的Obsidian vault目录，运行`claude`启动Claude Code。

第三，执行`/init`，让Claude在vault根目录创建`CLAUDE.md`文件。

第四，运行`/plugin marketplace add kepano/obsidian-skills`，安装官方Skills包。

完成。


[SLIDE 5: summary] (6:30 - 7:00)

今天的核心结论很简单：

你的Obsidian vault从来就不需要一个专门的AI接口。它本身就是个文件系统，Claude Code天生就能读。

你缺的只是让Claude说正确语法的那本「词典」——官方Skills包就是这本词典。

现在你就可以做的一件事：打开终端，`cd`进你的vault目录，运行`claude`，然后执行`/init`创建你的CLAUDE.md文件。

就这一步，你的AI工作流就跑起来了。

下期我们来看，配好之后Claude到底能帮你做哪些以前要花15分钟的事？

别忘了收藏这个系列，我们下期见。

AI世界很吵，精读一篇，胜过刷一百条。我们下期再见。
