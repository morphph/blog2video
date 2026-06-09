# Loop Engineering：把自己从 prompt 循环里拆出来

这里是精读AI。今天读的这篇 X 长文来自 Addy Osmani——Google Cloud AI 的 Director、带 Gemini Agents 那条线。他不是讲新闻，是把 Codex 和 Claude Code 这一两个月新塞进去的几样东西，拼成了一张让你自己设计 loop 的零件图。我把它拆开讲给你听。

## Hook

一年前，你想让 coding agent 自己跑起来，得自己写一堆 bash 脚本，自己维护，自己 debug，这堆脚本是你的也只是你的。现在不用了。Codex 和 Claude Code 都把同样的五块拼图，直接塞进了产品里。

更有意思的是，两家产品里的名字不一样，形状是一样的。同样的 automation、同样的 worktree、同样的 skill、同样的 sub-agent。你坐在哪家工具前，长得不一样，零件是同一套。

所以你不再需要选哪个工具，你需要设计的是 loop 本身。

## 全景地图：什么是 Loop

先把对象立起来。一个能自己跑下去的 loop，需要五件东西，外加一个第六——记忆。

五件东西是这样的：Automations 让它按时启动，Worktrees 让多个 agent 并行时不打架，Skills 把项目知识写在外面，Plugins 和 Connectors 把它接上你已经在用的工具，Sub-agents 让写代码的那个 agent 和检查代码的那个 agent 分开。第六件是 memory——一个 markdown 文件、一块 Linear 看板、任何能在两次运行之间存活下来的地方，记着干完了什么、下一步是什么。

为什么必须有 memory？因为模型在两次 run 之间是失忆的。它每次启动都是冷的。如果你不把状态写在硬盘上，loop 永远只能跑一次。agent 会忘，repo 不会忘。

这就是为什么它跟你之前听过的 agent harness 不一样。harness 是一个 agent 住的那间房子——prompts、tools、sandbox、context 策略，包在模型外面那一层。loop engineering 是房子的上面一层，是给这栋房子接上水电、装上定时器、让它自己换灯泡的那一层。

我们一层一层往下钻。

## 第一层 Automations：心跳

Automations 是让一个 run 变成 loop 的东西。没有它，你只是手动跑了一次。

在 Codex 里，你在 Automations 那个 tab 配置一条：选项目、选要跑的 prompt、选频率、选是跑在本地还是后台 worktree。跑出来发现东西就进 Triage 收件箱，啥也没发现就自己归档。OpenAI 内部就在用这个跑每日 issue triage、总结 CI 失败、写每日 commit 简报、扫上周谁埋的 bug。

Claude Code 走的是另一条路，但到同一个地方。它有 `/loop`——按间隔重复跑一段 prompt。有 cron task。有 hooks——在 agent 生命周期某些点上自己触发 shell 命令。如果你想让它在你合上笔记本之后还接着跑，就推到 GitHub Actions 上去。

这里有个细节值得单独拎出来。`/loop` 是定时器型的，到点就再跑一次。还有一个叫 `/goal`，它跟 `/loop` 是兄弟但不是一回事。`/goal` 是你给它一个可验证的停止条件，比如 "test/auth 下所有测试通过并且 lint 干净"，它就一直跑，每一轮跑完用另一个小模型来判它有没有完成。写代码的那个 agent，不是判它自己完没完成的那个 agent。

没有 Automations 这层会怎样？loop 退化成你手动重启的一次性脚本。你又回到了那个"我得记得早上九点点一下"的状态。

## 第二层 Worktrees：并行不变成混乱

只要你同时跑两个 agent，文件冲突就是迟早的事。两个 agent 改同一个文件，跟两个工程师不沟通就直接 commit 同一行，是完全一样的麻烦。

git worktree 解决的是这个。它是同一个 repo 历史下、不同目录、不同分支的隔离副本。一个 agent 在它自己的 checkout 里改文件，物理上碰不到另一个 agent 的 checkout。

Codex 把 worktree 直接做进了产品，几条线程同时打同一个 repo 不会撞。Claude Code 给你 `--worktree` 这个 flag，开一个独立 checkout 的 session；还有一个 `isolation: worktree` 的设置贴在 subagent 上，每个 helper 开始时拿到一份干净的副本，结束时自动清理。

但有个事得说清楚：worktree 只解决了机械冲突。它没解决人的瓶颈。你的 review 带宽决定了你真正能同时跑几个 agent，不是工具决定的。worktree 让 agent 之间不打架，但你这一个人，本来就是 review 队列的天花板。

## 第三层 Skills：别每次都从零解释你的项目

Skill 是让 agent 别像金鱼一样每次都问"这个项目用什么 lint 规则、build 怎么跑、为什么这里要这么写"。

格式很简单：一个文件夹，里面有个 SKILL.md，写指令、写 metadata；外加可选的脚本、参考资料、素材。Codex 和 Claude Code 用的是同一个格式。Codex 里你用 `$` 或者 `/skills` 主动调，或者它根据 skill 的描述自己匹配上。

这里有个反直觉的点。skill 的 description 越无聊越精确越好。写得花哨没用——匹配是机器在做的，你写一句"格式化 Python 代码并跑 ruff"远比"让代码焕发新生"有用。

skill 真正解决的失败模式是 intent debt——意图债。agent 每次启动都是冷的，凡是你没写在外面的项目知识，它都会用一个自信的猜测来填空。猜对了你看不见，猜错了你来 debug。skill 是把项目里的约定、build 步骤、"我们不这么干因为去年踩过一次"这种东西写在外面，loop 每一圈都读一次。没有 skill，loop 就是在每一圈都重新推导你的项目；有了 skill，它才会复利。

顺便澄清一个常见混淆：skill 是写作格式，plugin 是分发方式。你想把几个 skill 打包发给同事，就装进 plugin 里。

## 第四层 Plugins 和 Connectors：让 loop 摸到你真实的工具

只能看文件系统的 loop，是个很小的 loop。它顶多帮你改改 repo，碰不到外面的世界。

Connectors 是基于 MCP 这个协议建的——agent 可以读你的 issue tracker、查数据库、打你 staging 环境的 API、往 Slack 扔条消息。Codex 和 Claude Code 都说 MCP，所以你给一个写的 connector，另一个基本能直接用。Plugins 把 connectors 和 skills 打成一个包，同事一次装好，不用从头拼一遍。

这一层是有和没有的差别。没有它，agent 只能告诉你"这里应该改"。有了它，loop 自己开 PR，自己关联 Linear ticket，CI 一变绿，自己在频道里 ping 一下。它从"建议者"变成了"执行者"。

代价也很现实。loop 一旦能动你真实的环境，写错一个 connector，它就能往生产数据库里发奇怪的 query，往 Slack 里 ping 错人。所以你给它哪些连接、给到什么权限，是你的设计选择，不是它的。

## 第五层 Sub-agents：写代码的那个，别让它给自己打分

这是整个 loop 里最有用的一刀。

写代码的那个 agent，给自己打分的时候永远过于宽容。这不是它笨，是结构问题。同一个上下文里，它先说服自己这个方案是对的，再来评分，那分数就是自己人。

Codex 是你要求的时候才 spawn subagent，几个并行跑完，把结果合回一个回答。你在 `.codex/agents/` 下放 TOML 文件定义自己的 agent——名字、描述、指令、可选模型、reasoning effort——所以你的安全审查 agent 可以是个高推理强度的强模型，你的快速 explorer 可以是个只读的 fast model。Claude Code 在 `.claude/agents/` 下同样做这件事，外加 agent teams 让任务在它们之间流转。

两边最常见的分法是：一个 explore，一个 implement，一个 verify。

但要付的代价是 token。每个 subagent 独立跑模型、独立调工具，账单是叠加的。所以原则是：只在你真的需要第二意见的地方花这个钱。

子 agent 这件事在 loop 里特别关键，因为 loop 是你不在场的时候跑的。一个你信得过的 verifier，是你敢于真的合上笔记本走人的唯一原因。其实 `/goal` 命令底下做的就是同一件事——另起一个新的模型去判它完成没完成，而不是让做事的那个模型自己说"我做完了"。Maker 和 Checker 分开，被一路应用到了停止条件这一层。

## 把整台机器合上看一遍

把五层加上 memory 拼起来，你脑里应该浮现出一张这样的图。

一条 Automation 每天早上在 repo 上跑。它的 prompt 调一个 triage skill——读昨晚 CI 失败、看 open issues、扫近期 commit，把发现的事写进一个 markdown 文件或者一块 Linear 看板。值得做的每一条，loop 开一个隔离的 worktree，派一个 sub-agent 去起草修复，再派第二个 sub-agent 拿项目 skill 和已有测试去 review 这份草稿。

connector 把它接到外面——开 PR、更 ticket。loop 处理不了的事进 triage 收件箱等你。状态文件是整套东西的脊椎，记着试过哪些、过了哪些、还有哪些没结。第二天早上跑起来，就从昨天停下的地方接着走。

注意一下你刚才做了什么。你把这条 loop 设计了一次。中间那些步骤，没有一步是你 prompt 出来的。triage、worktree、起草、review、开 PR——每一步都是 loop 自己走完的。这就是 Steinberger 那句话和 Cherny 那句话落地的样子——你不再是 loop 里那个不停 prompt 的人，你成了写 loop 的人。

## Loop 没替你做的三件事，反而更难了

但你不能假装 loop 跑起来你就轻松了。有三个问题，loop 越好用，反而越尖锐。

第一是 verification 还是你的事。loop 没人盯着跑，就是没人盯着的犯错。把 verifier 子 agent 和 maker 子 agent 拆开，是为了让 loop 那句"我做完了"有点分量。但"做完"始终是一个声明，不是证明。你的工作是 ship 你自己确认过能 work 的代码。

第二是你对代码的理解会烂掉。loop 越快，它替你写的、你没读过的代码就越多。这叫 comprehension debt——理解债。账永远要还，只是 loop 让它涨得更快。

第三是最舒服的姿势往往是最危险的。loop 自己跑着，你很容易就不再有自己的判断，给什么就收什么。这叫 cognitive surrender——认知投降。同一件事，带着判断去做就是放大器，逃避思考去做就是加速器。一样的动作，反向结果。

## 一句心法：建 loop，留下你

我看下来这件事的本质不是"prompt engineering 死了"。是杠杆点搬家了。

以前你在键盘前给 agent 喂 prompt，agent 是你的工具。现在你设计的是一台自己会找活、自己分活、自己检查、自己写状态、自己决定下一步的小机器。你不再握着工具的手柄，你在画工具的电路图。

而这就是为什么这五块拼图同时出现在 Codex 和 Claude Code 里这件事，比哪一块功能更强，重要得多。它意味着 loop 这个事的形状定下来了——automation 是心跳、worktree 是隔离、skill 是知识、connector 是手脚、subagent 是眼睛。你设计的 loop 在两家工具里都能跑，下一家来了大概率也是这五件。你投资的是设计能力，不是某一家产品的 quirk。

但 loop 是杠杆，它不知道你想用它放大什么。同一条 loop，一个人用它去更快地推进自己理解透的工作，另一个人用它来回避理解工作本身。loop 不分辨这两种人。你分辨。

所以这件事比 prompt engineering 更难，不是更简单。建 loop。但建的时候，别忘了你是想留下当工程师的那个人，不是想从此只按一下"开始"的那个人。

AI 世界很吵，精读一篇，胜过刷一百条。我们下期再见。
