# Claude 现在自己写 Harness——每个任务一份

## Hook

过去你打开 Claude Code，里面那套脚手架是 Anthropic 工程师写好的。现在变了——Claude 自己会在每个任务开始之前，临时写一份只属于这个任务的 harness 出来。这是 Anthropic Claude Code 团队的 Thariq 上周宣布的 dynamic workflows。今天这期，我想跟你聊清楚一件事：为什么 harness 这个东西，开始从工程师手里交到模型手里。

## 这是 harness 这个词的一次定义迁移

我先说为什么这件事值得专门做一期。我们之前已经讲过四期 harness——Tw93 的源码拆解、Improvement Loop 的 5 个面、Addy Osmani 的 ratchet、Mike Piccolo 的 worker bus。这四期里，harness 都是一个静态的、工程师设计好的东西。区别只在于谁来设计、设计成什么形状。

Thariq 这一期不一样。他在文章开头说了一句很轻但很关键的话——Claude can now write its own harness on the fly, custom-built for the task at hand。翻译过来就是，Claude 现在能自己写 harness，每个任务都现写一份。

这是 harness 这个概念第一次进入"由模型生成"的范畴。我之前讲过，harness 是模型周围的脚手架，是工程师的设计产物。今天它跨过了一条线——它本身变成了 LLM 的 output。

## 为什么单纯的 Claude Code 不够用

你可能会想，Claude Code 本来就挺强的，为什么还要让它再写一层 harness？

Thariq 给出了一个非常具体的诊断。当你让默认的 Claude Code 干一件事，它要在同一个上下文窗口里同时规划和执行。对很多日常的编码任务这都没问题，毕竟"想清楚怎么改，然后就改"这件事本来就一气呵成。但对长跑任务、大规模并行任务、或者需要对抗式验证的任务，这套机制会暴露三个具体的失败模式。Anthropic 这次给它们都起了正式的名字。

第一个叫 agentic laziness——agent 偷懒。比如你让它做一份五十项的安全审查，它做完前二十项就跟你说"完成了"。剩下三十项它没碰，但它会用一种听起来很自信的语气宣布结束。你不细看根本发现不了。

第二个叫 self-preferential bias——自我偏袒。让 Claude 用一份 rubric 来验证它自己刚才的输出，它会倾向于打高分。这不是 prompt 写得不好，是模型层面的结构性偏差。让它当运动员同时当裁判，它就会偏向自己。这一条我觉得特别重要，因为很多人写 agent 默认用的就是"先生成再让自己检查"这套流程。

第三个叫 goal drift——目标漂移。长对话经过 compaction 之后，最先丢的就是那些 "don't do X" 这类负向约束。每一次摘要都是有损的，正向描述容易留下来，边界条件一轮一轮被磨掉。等模型干完十几个 turn，原始的"不要改 auth 模块"可能已经不在它视野里了。

## 单窗口的死路

这三个失败模式我觉得最有意思的地方是，Anthropic 这次明确地把它们归因到结构上，而不是模型能力上。

不是说"模型不够聪明"。是说"在一个上下文窗口里同时规划和执行"这个架构选择，本身就会必然产出这三种失败。无论你用什么 prompt，无论模型多强，只要 plan 和 execute 共用一个 context，它们就会出现。

所以 dynamic workflows 给出的解药也是结构性的——把任务拆给多个 Claude，每个 Claude 跑在自己的 context window 里，目标隔离、视野隔离。一个 Claude 不会被另一个 Claude 的偏袒污染，也不会在自己漫长的会话里把约束磨掉。

这是这套设计的底层动机。不是"让 agent 更聪明"，是"让 agent 没机会在长跑里变笨"。

## Dynamic workflow 到底是什么

讲到机制。dynamic workflow 本质上是一份 JavaScript 文件。Claude 自己写的。文件里调用几个特殊的函数——spawn 子 agent、决定子 agent 跑哪个模型、决定子 agent 是否跑在独立的 worktree 里。再加上标准的 JSON、Math、Array，足够处理一般的数据流。

你可以直接让 Claude "做一个 workflow"，或者用一个触发词叫 ultracode，强制它生成 workflow。

中断也不可怕。如果你把终端关了，下次 resume session，workflow 会从断点接着跑。

## 为什么 dynamic 比 static 更强

这里有个我觉得最反直觉的判断。

你可能之前用过 Claude Agent SDK 或者 claude -p 写过 static workflow——固定的多 agent 协调脚本。听起来很专业对吧？

但 Thariq 说，正因为 static workflow 必须能处理所有 edge case，它一定写得很通用。通用的代价就是平均。它给所有任务一个还过得去的方案，但不会给任何一个任务最好的方案。

dynamic workflow 反过来——它只为这一个 prompt 服务。它知道你现在要重命名一个 model 类、知道现在要排序 80 份简历、知道现在要在 worktree 里复现一个 1/50 概率的 flaky test。它可以放弃通用性，针对这一次的任务从零拼一个最贴的 harness。

"专用 vs 通用"在这里出现了一次翻转。我们通常以为写好的东西更专业，临时拼的东西更糙。dynamic workflow 把这个直觉反过来——写好的东西因为要应对所有人，反而平均化了；临时拼的因为只服务一个人，反而更精。

## 六种拼法

Thariq 给了六个 Claude 写 workflow 时常用的 pattern。我不一个一个念，只挑几个最有判断力的讲。

最常用的叫 fan-out-and-synthesize——把一个任务拆成很多小步，每个小步一个 agent，最后有一个合成步当作 barrier，等所有 fan-out 完成才往下走。这适用于子任务多、需要干净 context 防交叉污染的场景。每个子 agent 拿到自己的小问题、自己的小窗口，不会看到也不会被别人的中间步骤干扰。

第二个叫 adversarial verification——对抗式验证。每一个干活的 agent，配一个专门挑刺的 agent，用 rubric 反过来打它。这是 self-preferential bias 的直接解药——让生成和评估永远分离。生成 agent 和评估 agent 是两个不同的 Claude，跑在两个不同的 context 里，互相不知道对方存在。评估的那个不会因为"这是我自己写的"而手下留情。

第三个叫 tournament——锦标赛。当一个任务讲不清"哪个答案最好"，就让 N 个 agent 各做一份，然后用 pairwise 比较两两打擂台，judge agent 选出冠军。Thariq 特意提了一句——比较判断比绝对打分更可靠。这是认知心理学早就知道的事，但放在这里很关键。让 Claude 给一千条 support ticket 按严重程度打绝对分，效果差；让它两两比较，效果好得多。原文里说得很巧——决定性的 loop 在外面，每一次比较是一个独立的 agent，只有比赛的当前进度留在 context 里。

剩下的三种是 classify-and-act、generate-and-filter、loop-until-done，从名字大概都能猜到做什么。classify 用一个分类器决定路由；generate-and-filter 产出一堆再筛；loop-until-done 没有固定轮数，跑到一个停止条件满足才停。重点不是记住六个名字，是建立一个直觉——Claude 写 workflow 不是从零拼，是从这六块乐高里挑、再组合。这六个 pattern 本身就是 Anthropic 在内部踩了很多坑之后总结出来的"已经验证过的拼法"。

## 一个真实的战绩

如果你觉得这些都还停留在概念，Thariq 在文章里放了一个非常硬的事实——Bun，那个跑 JavaScript 的 runtime，从 Zig 重写到 Rust，就是用 dynamic workflow 完成的。

Jarred Sumner 在 X 上专门发了一条 thread 讲怎么做的。核心思路就是把重写任务拆成一系列要操作的点——每个 callsite、每个失败的测试、每个模块。每一个拆出来给一个 subagent，跑在自己的 worktree 里做改写，再有另一个 agent 对抗式 review，过了才 merge。

这不是玩具。这是一次真实的、大规模的代码迁移。它能成立的前提就是 worktree 隔离、subagent 并行、adversarial review——这三件事在传统单窗口 agent 里都做不到。

## 真正有意思的不是写代码

Thariq 在文章里有一句话——他说他发现 workflow 对非技术工作甚至更有用。我刚开始没太在意，回头一想，这句话信息量很大。

他举的几个例子：拿你的商业计划书，让不同 agent 分别扮演投资人、客户、竞争对手三个视角撕它一遍；80 份简历按后端岗位排名，挑前 10 让你面试；给 CLI 工具想名字，让一群 agent 头脑风暴然后 tournament 选前 3。

这些都不是编码任务。但都符合 dynamic workflow 的两个核心条件——任务可以拆成多个独立子任务、子任务需要被对抗式或客观地评判。

我觉得这是 Claude Code 的一次定位扩张。它原本是写代码的工具，dynamic workflow 让它变成了一个通用的、可以让 Claude 自己设计多 agent 协作的运行环境。代码只是它最熟悉的一种任务，不是它唯一能做的。

## 一个我特别想讲的安全细节

我挑一个文章里很小的细节放大讲——triage workflow 的 quarantine 模式。

triage 这种任务很容易遇到一个问题——你让 Claude 去读 support ticket、读 Slack 消息，这些内容是用户写的，里面可能藏着 prompt injection。如果读这些内容的 agent 同时拥有高权限，被骗了一句就可以执行危险动作。

quarantine 的做法是——读不可信内容的 agent 不允许做高权限操作，只能产出结构化信息；做高权限操作的 agent 不读原始内容，只读上一步产出的结构化结果。

这个分工本质上和我之前讲过的 dual-LLM 模式是一样的——把"看见外部内容"的能力和"产生外部影响"的能力放在两个 agent 里，一个不能直接调用另一个的能力。dynamic workflow 不仅是为了性能，也顺手把这种安全边界写进了拓扑。

## 代价

讲爽点也要讲代价。Thariq 自己反复警告——dynamic workflow 用的 token 比单 agent 显著多。每个 subagent 都要装一份 context、跑一遍模型、产生一份输出。你用一份对抗式 review，就是双倍的模型调用。

文章最后他直接说——大多数传统编码任务不需要五个 reviewer 组成的 panel。这句话我觉得说得很诚实。dynamic workflow 不是默认开关，是一个你要主动判断"这个任务值不值得"才用的工具。

如果一个任务用单窗口 Claude Code 就能搞定，硬上 workflow 就是过度工程。

## Synthesis

回到一开始那个判断——这是 harness 这个词的一次定义迁移。

过去四期视频里，harness 是工程师写好的脚手架。无论是 Tw93 拆出来的 12 模块、Improvement Loop 的 5 个面、Addy 的 ratchet 规则、Mike Piccolo 的 worker bus——设计者都是人。

dynamic workflow 是 harness 第一次跨过那条线。设计者变成 Claude 自己。每个 prompt 都伴生一份 harness。任务结束，harness 也跟着结束。harness 从一个长期资产，变成了一个一次性使用品。

我觉得这背后的更大变化是这样——当 LLM 智能度跨过某个门槛之后，过去要工程师建模的设计空间，会一格一格地被 LLM 接管。先是 prompt，再是 tool 选择，现在是 harness。下一格会是什么不好说，但方向是清楚的。

一句话总结——过去 harness 是工程师写好的脚手架，现在每个任务都有自己临时拼一个。

## Closing

如果你已经在用 Claude Code，这一期的可执行建议很简单。下次遇到那种你直觉就觉得"单窗口 Claude 会跑偏"的任务——长跑的、需要对抗式验证的、有几十上百个独立子项的——直接打一个 ultracode 让它生成 workflow。看看它怎么拼。

但同时记住代价。token 消耗会显著上涨。常规编码任务不需要这个。

AI 世界很吵，精读一篇，胜过刷一百条。我们下期再见。
