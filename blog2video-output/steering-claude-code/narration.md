# 调教 Claude Code 的 7 种武器，你用错了几个？

## Hook

Anthropic 官方刚发布 Claude Code 最全指令调教指南——7 个不同的官方机制，决定你写的每一句话住在哪、什么时候加载、能不能被压缩、有多强的强制力。多数人都在把指令塞进错的口子里：该是护栏的写成了软规则，该按需加载的住进了 token 黑洞。今天我们就把这 7 个口子全部拆开，告诉你哪句话该住哪里。

## 一句话被塞错位置会发生什么

我读完这篇官博，最有冲击的不是它列出了 7 种机制。是它把"指令"和"护栏"这两件事，彻底分开讲了。

绝大多数人用 Claude Code 都是一样的习惯。想到什么规矩，就往 CLAUDE.md 里塞一句。想让它跑测试，塞一句。想让它别动数据库迁移，塞一句。想让它部署前先 lint，再塞一句。塞着塞着，文件就上千行了。

但官方说，这套做法有两个反直觉的代价。第一个代价，每多写一行，你团队里每个工程师，每一次开 session，都要为这一行付 token。哪怕这行规矩跟他这次任务八竿子打不着，它也加载进上下文。第二个代价更狠——文件越长，真正重要的那几条指令，遵循率反而越低。Claude 的注意力被稀释了。

更扎心的是第三件事。你以为你写在 CLAUDE.md 里的"永远不要执行危险命令"是护栏。其实不是。官方原话是：长对话里、压力情境里、或者读到一个被污染的文件，模型就可能跳过这条规矩。**写在 prompt 里的规则是建议。要做护栏，必须是 deterministic 的——也就是必须由代码强制执行，而不是由模型自觉遵守。**

所以这期的主轴只有一句话：**同一句话，住进 CLAUDE.md 是 token 黑洞，住进 hook 才是不可破的护栏。** 接下来这 7 个口子，就是教你怎么选住址。

## CLAUDE.md：不是放规则的地方，是放索引的地方

先说大家最熟的 CLAUDE.md。它是项目根目录下的一个 markdown 文件，开 session 的时候自动加载，整个 session 全程常驻。压缩对话之后还会重新读一遍——它不会丢。

正因为它不会丢，它就特别贵。每一行都全程占着上下文。所以官方给了一条非常硬的建议：**CLAUDE.md 保持在 200 行以内，给它指定一个 owner，每次改动都要像改代码一样 review。**

200 行是什么概念？基本就是装项目骨架——构建命令、目录结构、monorepo 怎么划分、团队的代码风格规范。这种"全程都要知道"的事实，才配住进 CLAUDE.md。

那不该住这里的是什么？官方给了三个非常清晰的信号。第一，**写了 30 行的部署流程**——那是 procedure，该搬去 skill。第二，**写了"每次 X 之后都要 Y"**——那是确定性自动化，该搬去 hook。第三，**写了"永远不要做 X"**——那不是护栏，是 wishful thinking。

官方还提了一个特别实用的设计。CLAUDE.md 可以分两种。根目录那个是常驻型，全程加载。但子目录里也可以放，比如 `app/api/CLAUDE.md`。这种是按需型——只有当 Claude 真的去读 `app/api` 下面的文件时，它才加载。不读那个目录，它就一直休眠。

在 monorepo 里，这招特别关键。每个团队管自己的子目录，自己的规矩只在动到自己代码时才进上下文。前端工程师不用为后端的规矩付 token。

## Rules：把约束精确钉到路径上

第二种叫 rules，住在 `.claude/rules/` 文件夹里。它们是带 frontmatter 的 markdown 文件，专门用来表达"在某种情况下必须遵守的约束"。

rules 有两种用法。没加 paths 的，叫 unscoped rule。它的行为跟 CLAUDE.md 几乎一样——session 开始就加载，压缩后重新注入。官方说得很直白：**没有 paths 的 rule，跟把内容写在 CLAUDE.md 里在机制上完全等价。** 一样常驻，一样烧 token。

真正值钱的是带 paths 的 path-scoped rule。frontmatter 里写一行 `paths: ["src/api/**"]`，这条规矩就只在 Claude 读到 `src/api` 下的文件时才进上下文。

举个例子。你想强制所有 API handler 在处理之前必须用 Zod 校验输入。这条规矩写在 CLAUDE.md 里，每次写文档、改前端、跑测试，它都加载一遍。但你给它套上 `paths: ["src/api/**", "**/*.handler.ts"]`，它就只在真的写 API 的时候才出现。其它 session 里它根本不存在。

判断要不要用 path-scoped rule，有一条干脆的标准——**这条约束是不是跟某些特定路径绑定的？**"迁移文件只能 append，不能改" 这种就是。它只跟 migrations 目录有关，跟其它代码一点关系都没有。这种约束写进 paths，比塞进 CLAUDE.md 干净一百倍。

## Skills：把"过程性知识"挪出常驻区

第三种是 skills，住在 `.claude/skills/` 文件夹里。每个 skill 是一个目录，里面有一个 `SKILL.md`，包含 name、description 和 body。

skill 最妙的地方是它的加载方式。session 一开始，**只有 name 和 description 进上下文**。body 那一大堆细节，要等到 Claude 真的调用这个 skill 才加载——可以通过 slash command 比如 `/code-review`，也可以让 Claude 根据任务自动匹配。

这个机制专门治一种病：CLAUDE.md 里塞了一段 30 行的部署流程。

那段流程是 procedure，是"做这件事的时候需要按步骤走"的知识。它不是你每次开 session 都需要的——你绝大多数时间在写代码，不在部署。但它住在 CLAUDE.md 里，就意味着每个 session 都全额付费。

搬进 skill 之后，name 和 description 这两行常驻，告诉 Claude "我这里有套部署流程，如果你要用就调我"。真要部署了，完整流程才加载进来。同一段内容，token 成本从 high 降到 low。

部署流程、发布 checklist、code review 流程，这些都是 skill 的典型场景。一句话总结：**程序性的东西放 skill，事实性的东西放 CLAUDE.md。**

## Subagents：把中间过程挡在主上下文之外

第四种是 subagents，住在 `.claude/agents/` 文件夹里。每个 subagent 是一个带 YAML frontmatter 的 markdown 文件——frontmatter 写 name、description、还可以指定它用什么模型、能调用哪些工具。body 就是这个 subagent 自己的 system prompt。

subagent 跟 skill 有点像，name、description、工具列表 session 开始就加载。但有一个根本区别——**subagent 的 body 永远不会进父对话的上下文。** Claude 调用 subagent 的时候，它在一个全新的、独立的 context window 里跑。所有中间过程、所有工具调用、所有思考，都关在那个独立窗口里。回到主会话的，只有 subagent 的最终一条消息，加一些 metadata。

理解了这一点，就理解了 subagent 为什么省 token。它不是因为"代码更短"，是因为它的中间结果根本没进主上下文。

这让一种之前不可能的 scale 成为可能。subagent 可以嵌套 5 层深，配合 dynamic workflows，**可以编排几十到几百个后台 agent 同时跑**。如果这些 agent 的中间结果全部塞进主会话，单条 session 早就爆窗了。但靠 subagent 把它们隔离掉，主会话只看到最终汇总。

什么场景该用 subagent？官方给的几个例子很典型——深度搜索、日志分析、依赖审计。这些任务的特点是：中间会产生大量你后续不会再回头看的过程信息。让它跑在 subagent 里，主上下文干干净净。

什么时候不用 subagent，反而用 skill？当你**希望流程在主线程里展开**，每一步你都能看见、能引导。这时候 skill 才合适。

## Hooks：从指令升级成代码

第五种是 hooks，这是整篇博客我认为最重要的一节。

hook 是你用代码定义的、在 Claude 生命周期某个事件触发时自动执行的东西。它可以是一个命令、一个 HTTP 请求、一段 LLM prompt。注册位置在 `settings.json` 里，或者管理员部署的 policy settings，或者 skill / agent 的 frontmatter。

hook 有五种类型——command、HTTP、mcp_tool、prompt、agent。前三种是纯 deterministic 的，规则一旦写好，就机械式执行，不依赖模型的判断。后两种用 Claude 的判断来决定输出。

为什么 hook 是这篇博客的 thesis？因为它是**唯一能做到 deterministic 护栏的机制**。

记得前面说过"永远不要执行危险命令"写在 CLAUDE.md 里不可靠吗？真正可靠的做法是：注册一个 `PreToolUse` hook。每次 Claude 要调用工具之前，这个 hook 先 inspect 这次调用的内容。如果命令危险，hook **exit code 2**，调用直接被拒，根本到不了执行那一步。

官方说了一句话特别精确：**"模型选择跑 formatter，和 formatter 自动跑，是两回事。"** 写在 CLAUDE.md 里的 "每次编辑后跑 prettier"，是前者——模型可能跑，也可能忘了跑。注册成 PostToolUse hook，就是后者——edit 一发生，formatter 一定跑，不依赖模型记不记得。

hook 还有一个特别值得注意的特性——**它的上下文成本几乎为零**。因为 hook 是 harness 直接执行的代码，不是塞进 Claude 上下文的指令。配置住在主上下文之外，运行结果默认也不回主上下文。

这就引出一个 trap。如果你写了一个 PreCompact hook，把聊天历史备份到一个文件，Claude **不知道你存到了哪个文件里**——除非这个 hook 显式 return。少数会回主上下文的，是 blocking hook 的标准错误——这是为了让 Claude 知道为什么这次调用被拒了。

最后还有一个组织级的杀器，叫 **managed settings**。这是管理员部署的设置，用户的本地配置无法覆盖。如果你想在整个公司范围内强制一条"任何 Agent 都不能 push 到 main 分支"——只有 managed settings + hook 这个组合能做到。CLAUDE.md 做不到，rule 做不到，skill 也做不到。

## Output styles 和 Append system prompt：最强的指令位，也是最危险的

剩下两种机制，是直接动到 system prompt 那一层。

第六种是 output styles，住在 `.claude/output-styles/` 文件夹。它的内容会被注入到 system prompt 里，**永远不会被压缩掉**，每个 session 都加载。

因为它住在 system prompt 里，它的指令遵循权重，比前面所有方法都高。

但它有个非常重的代价。**自定义 output style 会替换掉默认的 system prompt。** Claude Code 默认的 system prompt 里写了很多关键内容——你在帮人做软件工程、变更的范围怎么界定、什么时候加注释什么时候不加、安全顾虑怎么处理、宣告完成前要不要先跑测试。

你写了一个自定义 output style，这些默认人设全部丢掉。Claude Code 一下子从"软件工程师助手"退化成"通用助手"。写代码的那套纪律全没了。

除非你在 frontmatter 里加一行 `keep-coding-instructions: true`，把默认指令保留下来——但即便如此，自定义 output style 也是高代价的操作。

官方建议特别清醒：在写自定义之前，**先看看内置的三种 output style 够不够用**。它们覆盖了三种最常见的工作模式——autonomy、teaching、collaborative。能用内置的就别自定义。

第七种是 append system prompt，通过 CLI flag 在调用时追加一段内容到 system prompt 后面。它跟 output styles 的区别是：output styles 是替换，append 是叠加。所以它不会破坏默认人设，只是在后面加东西。

但 append system prompt 有一个特别反直觉的限制——**边际递减。** 官方原话是：你给的指令越多，Claude 遵循得越不严格，尤其是指令之间有矛盾的时候。

这话翻译过来就是：append 不是越多越好。到某个阈值，你加的指令开始互相打架，Claude 干脆都不严格执行。

## 一张图把 7 个口子总结清楚

讲到这里，7 个注入口都过了一遍。我们把它们摆在一起看。

按上下文成本分。**高成本的**是 CLAUDE.md 根目录文件、unscoped rule、output styles。它们全程常驻。**低成本的**是子目录 CLAUDE.md、path-scoped rule、skill、subagent、hook。它们要么按需加载，要么压根不进主上下文。**中等成本**的是 append system prompt——会被缓存，但首次请求要付。

按压缩行为分。**永不丢失的**是 CLAUDE.md、rule、output styles。**会被挤出的**是 skill——多个 skill 共享一个 budget，最早调用的最先掉。**完全绕过压缩的**是 hook。**只对单次调用生效的**是 append system prompt。

按强制力分。**只有 hook 是真护栏**——其它六种都是建议。模型在长对话、压力情境、prompt injection 下都可能跳过指令。

所以那条 thesis 现在可以摊开看了。同一句"部署前必须跑测试"，住进 CLAUDE.md，每个 session 都付 token，遵循率随对话变长还会衰减。住进 path-scoped rule，只在动到部署相关文件时才付钱。住进 skill，连描述行常驻，body 调用时才加载。**注册成 PostToolUse hook，它从指令升级成了代码——Claude 想不跑都不行。**

## Synthesis

我读完整篇博客最强的体会是：**你以为你在调教 Claude，其实你在选指令住哪。**

同一句话，住进 CLAUDE.md 是 token 黑洞，住进 hook 是不可破的护栏。措辞写得多严厉、字号放多大、加多少个感叹号，都改变不了它的强制力——强制力由它住在哪个槽决定。

这也是为什么"7 种机制"看起来像个产品功能列表，但本质上是一套 context engineering 的设计语言。每个槽都在回答三个问题——这条指令什么时候进上下文、压缩之后会不会还在、模型敢不敢不听。

如果你今天只能记一句话，就记这个：**事实进 CLAUDE.md，路径约束进 rule，过程进 skill，隔离的副任务进 subagent，确定性的自动化进 hook，角色重塑进 output style，临时调整进 append。**

写错地方的代价，不会立刻显形，但会在每个 session、每个工程师、每条对话里慢慢累积。

## Closing

如果你正在维护一个 Claude Code 项目，今天看完这期可以做一件事——打开你的 CLAUDE.md，数一下行数。超过 200 行的部分，挑出来看哪些是 procedure、哪些是 "永远不要做 X"、哪些是路径相关的约束。把它们搬到该住的地方。光这一步，团队里每个 session 都会变得更便宜、更准确。

AI 世界很吵，精读一篇，胜过刷一百条。我们下期再见。
