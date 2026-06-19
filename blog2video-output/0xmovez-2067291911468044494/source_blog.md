# The Self-Improving Loop: a 300-agent swarm on Kimi K2.6, verified by Opus 4.8

**Author:** Movez (@0xMovez) · X long-form article
**Source:** https://x.com/0xMovez/status/2067291911468044494

> Quoted announcement — Kimi.ai (@Kimi_Moonshot), Apr 23:
> Meet Kimi K2.6 Agent Swarm. Swarms, elevated — 300 parallel sub-agents × 4,000 steps per run (up from 100 / 1,500 in K2.5). Outputs are real files, not chat — one run delivers 100+ files, 100,000-word literature reviews, or 20,000-row datasets.

---

A free open-source model is running 300 parallel agents across 4,000 coordinated steps from a single prompt, and it scores higher on real research tasks than models you pay 5x more for.

Most people have never opened it.

They open Kimi, type a question, get an answer, close the tab. That's the chatbox. It works. It's also about 10% of what the product does.

Here's the part most people skip:
The swarm doesn't just run fast. Run it right and it leaves something behind every time — a reusable skill, a sharper spec, a constraint that stops the next run from repeating today's mistake.
The swarm that ran your task yesterday should be smarter than the one running it today.

That's the loop. Kimi does the work and the learning. Opus 4.8 sits at one gate — the verify gate — and its only job is to stop garbage from getting saved as a skill. The engine learns. The closer keeps it honest.

Some people pick one model and marry it. Some chase the top benchmark line. Others wire up LangGraph and spend a weekend debugging a DAG.
The result is usually the same: a workflow that does the exact same thing on run #50 as it did on run #1.

This is not that. This is the complete playbook for a swarm that compounds. 10 steps. Every prompt is copy-paste. Every number is verified.

![五拍架构总览图](images/img-01.png)

> 图示（作者自制信息图）：标题 "THE ARCHITECTURE IN ONE FRAME — The loop has five beats. Four are pure Kimi."（这套循环有五拍，其中四拍纯属 Kimi）。五个环节横排：①BRIEF — 你写一份 spec，Kimi 自行拆解任务；②SWARM — 最多 300 个 agent、4,000 步、产出真实文件；③VERIFY — Opus 4.8 在结果被保存前猎杀隐藏缺陷；④DISTILL — Kimi 把这次运行蒸馏成可复用的 Skill；⑤REPLAY — 下一次从 skill 起步，更快、更准。底部注脚：第 1/2/4/5 拍全程在 Kimi 内完成，第 3 拍 verify 是唯一让"第二个模型"上场的位置。

## Part 1 — Build the loop once. Run it forever.

### 01. Write a spec, not a prompt

When most people hear "300 agents" they fire off a one-liner — "research the fitness app market" — and expect brilliance. That's the fastest way to burn credits and get junk.
A one-line prompt gives the swarm permission to decide everything, and it will decide wrong.

Treat the swarm like a contractor, not a genie. A spec defines what to collect, what counts as valid, which sources are allowed, the exact output format, and what to do on conflict. Here's the part most people skip: Kimi decides the decomposition itself.
You don't build the agents like you would in CrewAI, you don't wire the graph like LangGraph, you don't define structure like AutoGen. You describe the goal — the swarm builds the org chart.

The spec is the single highest-leverage artifact in the whole loop, because in step 4 it becomes the seed of your reusable skill.

```
# PROJECT: [name]
GOAL: [one sentence — the deliverable, not the topic]
SCOPE: [what's in, what's explicitly out]
RULES: [validation — what counts as a verified row/finding]
SOURCES: [official posts, papers, primary only — no aggregators]
OUTPUT: [file type / count / naming / format details]
ON CONFLICT: flag the row, never resolve silently
STOP CONDITION: [when to halt and report instead of guessing]
```

![Kimi 中输入 spec 的界面](images/img-02.png)

> 图示（Kimi Work 真实界面截图）：示例任务 "Cross-Sectional Factor Decay Audit"（横截面因子衰减审计，一个量化金融研究任务）。输入框里写着结构化的 spec：SOURCES 限定 SSRN、Journal of Finance、AQR / Fama-French 数据库等一手来源，明确写 "No aggregators, no blog summaries"；OUTPUT 要求 1 个 .xlsx，每行一个因子，列含 in-sample Sharpe、OOS Sharpe、衰减%、t-stat、capacity note，外加 200 词简报，文件名 factor_decay_audit_q2_2026.xlsx；ON CONFLICT 标记该行绝不静默处理；STOP CONDITION 任一 sub-agent 卡住超 10 分钟或不足 25 个因子达到三来源标准就停下汇报。右下角模式选择器显示 "Agent Swarm"。

### 02. Read the decomposition plan before you spend a cent

This is the step first-timers skip, and it's the most expensive one to skip.
After you submit the spec, Kimi shows you the execution plan before it runs — how many sub-agents, what each handles, the dependency order, the step budget.

Read it. A 200-agent swarm decomposed wrong costs real money and real hours. Checking the plan costs nothing. You're looking for three things: does it understand the scope, is the agent count sane for the task size, and does the output plan match what you actually need.

One detail worth knowing: the 4,000 steps is a total coordinated budget across the swarm, not 4,000 steps per agent. A 300-agent run averages ~13 steps each — short, specialized subtasks. That tells you whether your task fits the shape.

```
Show me the proposed decomposition before running:
- how many sub-agents, and what each one handles
- the dependency order (what blocks what)
- estimated step budget
- where the biggest quality-drop risk sits
Do NOT execute yet. Wait for my confirmation.
```

A one-line prompt is a wish. A spec is an order. The swarm executes orders.

![Kimi 返回的拆解计划表](images/img-03.png)

> 图示（Kimi 真实界面截图）：Kimi 在运行前给出的拆解计划 "Phase 1: Parallel Factor Discovery (5 agents, ~80–100 total searches)"。一张表列出 5 个 agent 各自的角色与负责的候选因子：A1 Classic_FF_AQR（HML、SMB、MKT-RF、UMD、QMJ、BAB…）、A2 Profitability_Investment、A3 LowVol_Value_Yield、A4 Reversal_Momentum_Behavioral、A5 Additional_Anomalies。每个 agent 处理 8–10 个候选因子，任务统一：定位来源论文→提取样本内 Sharpe→找≥1 个 2010 年后的独立复现研究→数来源、少于 3 个就标记。右侧 Progress 面板分 Stage 1/2/3 显示进度，Context 里挂着多个 SKILL.md。

### 03. Let it be wasteful — that's the point

Now you run it. Up to 300 sub-agents fire in parallel waves. The first wave handles fully independent subtasks.
As results land, the orchestrator launches the next wave on whatever depended on them, until the dependency graph resolves.

Each sub-agent works in its own bounded context window. That's the structural trick: a single agent on a long task fills its window until it drowns and starts lossy summarization, and every reasoning step after that gets worse.
The swarm gives each subtask its own scoped context, so only structured output flows back to the coordinator. That's why it doesn't collapse on tasks that break a single agent.

Because Kimi runs at $0.95/M in and $4.00/M out — with cache hits at $0.16 — you can afford to throw the first attempt away and run it again. Cheap volume changes what you're willing to attempt.

```
Execute the spec end to end.
Parallelize wherever the plan allows.
Report progress every 30 steps.
Flag any blocker immediately — do not work around it silently.
If a sub-agent stalls >10 min, reassign or report.
Merge everything into the OUTPUT defined in the spec.
```

![5 个子 agent 并行运行的界面](images/img-04.png)

> 图示（Kimi 真实界面截图）："Using subagents"，5 个子 agent（01 Research classic Fama-French + AQR factors、02 profitability + investment、03 low-vol value yield、04 reversal momentum behavioral、05 additional anomalies）全部 "In progress" 并行推进。上方有一行系统消息："BLOCKER: Background agents disabled. Re-dispatching in foreground mode. All 5 agents will run in parallel."（后台 agent 被禁用，改为前台并行重新派发）——直观展示了并行波次和遇阻即报、不静默绕过的执行纪律。

### 04. Demand real files, not a chat answer

The output of a swarm is not text in a window. It's structured deliverables that go straight into your work — and this is the part most articles miss.
One run lands PDFs, spreadsheets, datasets, slide decks, and working code, all from a single launch, because Kimi emits those formats natively.

So lead the spec with the output, always.
"A comprehensive report" gives agents permission to stop early. "A 40-page PDF + one CSV with 20,000 rows + 14 export-ready PNG charts" gives them a quality target to hit.
Specificity at the output level is the difference.

```
OUTPUT: [file type] / [count] / [naming] / [format detail]

# strong examples:
OUTPUT: 1 .xlsx, one row per model, + 200-word brief
OUTPUT: 30 HTML files, one per store, named by business
OUTPUT: 40-page PDF + 20,000-row CSV + 14 PNG charts
```

![OUTPUT CONFIRMED 真实文件交付](images/img-05.png)

> 图示（Kimi 真实界面截图）："OUTPUT CONFIRMED: factor_decay_audit_q2_2026.xlsx — 1 file, 1 sheet with 40 rows, 7 columns (name, source paper, in-sample Sharpe, OOS Sharpe, decay %, t-stat, capacity note) + 200-word brief embedded in a cover sheet."，随后 "Launching the single research + assembly agent now."。证明 swarm 的交付物是可以直接拿去用的真实结构化文件（一个 40 行 7 列的 Excel + 封面页简报），不是聊天框里的一段文字。

### 05. Point the honest model at the output and ask what's wrong

Here's the one beat that isn't Kimi. The swarm's known flaw: unless you explicitly demand verification, it produces confident, under-cited claims, and independent sub-agents sometimes contradict each other. "Looks done" and "is correct" are different planets.

Opus 4.8 is built for exactly this gate. Anthropic reports it's roughly 4x less likely than 4.7 to let a flaw in its own code pass unremarked, and it's the first Claude to score 0% on uncritically reporting flawed results.
Its only job here is to refute, not to praise. You're not paying premium tokens to generate — you're paying them to catch the silent flaw before step 4 saves it into a skill forever.

Cheap volume is only a superpower when something trustworthy is checking the work. Keep the verify gate.

![模型能力对比基准图](images/img-06.png)

> 图示（基准对比柱状图）：四个模型横向对比——Kimi K2.7 Code、Kimi K2.6、GPT-5.5 (xhigh)、Opus 4.8 (xhigh)。左半区 Coding（Kimi Code Bench v2、Program Bench、MLS Bench Lite），右半区 Agents（Kimi Claw 24/7 Bench、MCP Atlas、MCP Mark Verified）。各家互有胜负：在 MCP Mark Verified 上 GPT-5.5 取 92.9、Kimi K2.7 取 81.1、Opus 4.8 取 76.4、Kimi K2.6 取 72.8——说明没有单一模型全面碾压，这正是"用便宜的开源模型干活、用诚实的模型把关"这套分工的现实依据。

### 06. Save the whole workflow as a Skill

This is the beat that makes the loop self-improving. After a run you'll repeat, tell Kimi to capture the entire workflow as a reusable Skill — input format, agent steps, output format.
The first run takes 20 minutes. Every run after it takes 30 seconds.

That's the honest version of "self-learning." The model isn't retraining its weights between your runs.
The system around it is getting smarter — your skill library grows with every project, and every future swarm applies those skills automatically.
A competitor can't copy that library in a week. It's built from months of your real runs.

```
Save this entire workflow as a reusable Skill: "[name]"
Capture:
- input format (what files / spec shape it expects)
- the agent steps that worked
- the output format and naming convention
- the validation rules from the spec
Next time I run this, I attach new files and get the same shape.
```

![把工作流存成 Skill 的界面](images/img-07.png)

> 图示（Kimi 真实界面截图）：正在保存的 "Factor Decay Audit Skill"，右侧 "What we captured" 面板把刚才那次运行抽象成可复用资产，含 Purpose（审计已发布的股权因子、检验衰减）、Input Format、Required Project Spec File 等条目；下方 "Next-time usage" 说明下次只需附上新的 spec 文件即可一键复跑。这就是"自我改进"的真实含义——不是模型在重训权重，而是围绕模型的技能库在变厚。

### 07. Feed your own documents in as swarm knowledge

Skills capture process. Document-to-Skill captures domain. Upload your best work — a closed-deal proposal, a polished report, a deck — and Kimi captures its structural and stylistic fingerprint as a skill every future swarm applies automatically.

Here's where it compounds: every PDF, transcript, or spreadsheet you feed in becomes context that all 300 parallel agents can ground against, instead of falling back on general training data.
The more you feed it, the more accurate every subsequent run becomes. Reports stop reading like generic AI and start reading like your work.

```
Capture this document as a reusable skill. Identify what makes it work:
- structure and section order
- tone and voice register
- depth of analysis per section
- the writing rhythm and formatting decisions
Save it as "[name]". Then produce a new document on [different topic]
using the captured skill — match the quality bar, not the content.
```

![Document-to-Skill 输入界面](images/img-08.png)

> 图示（Kimi 真实界面截图）：输入框里贴着 step 07 的 prompt——"Capture this document as a reusable skill. Identify what makes it work: structure and section order / tone and voice register / depth of analysis per section / the writing rhythm and formatting decisions. Save it as '[name]'."，左上角附着一个 SKILL.md（9.9 KB）文件。直观展示了如何把"你自己的好作品"喂进去、让 Kimi 抓取它的结构与文风指纹，成为之后每次 swarm 都会自动套用的领域技能。

### 08. Turn the verify feedback into a permanent rule

Step 5 catches a flaw once. Step 8 makes sure the swarm never makes it again. Take Opus's fix list and don't just patch the output — bake the lesson into a project-level constraints file Kimi reads automatically at the start of every session.

This is the loop learning from its own failures. The drift that Opus flagged on run #1 becomes a hard rule on run #2.
Over a few projects, your constraints file turns into living documentation that enforces itself — and the verify gate has less and less to catch each time.

```
# CONSTRAINTS.md — loaded automatically
- every claimed figure must trace to a primary source or be flagged
- no silent conflict resolution — surface contradictions
- [rule distilled from last run's Opus feedback]
- [the mistake you never want repeated]
Scope-lock: do not touch anything outside the spec's SCOPE block.
```

### 09. Replay the skill on new inputs — watch the cost collapse

Now the payoff. Run #2 doesn't start from zero. It starts from the skill, the swarm knowledge, and the constraints file you built in steps 6–8.
Same workflow, new files, a fraction of the setup.

This is where "compounding" stops being a buzzword and shows up on the invoice. The first competitive-monitoring run takes a full spec and a verify pass.
The fourth one is a 30-second prompt against the saved skill, and the output is sharper because it inherits every fix from the runs before it.

```
Run the saved skill "[name]" on these new inputs.
Apply CONSTRAINTS.md. Use the captured output format.
[attach new files]
Report only deviations from the skill's expected shape.
```

20 minutes on run one. 30 seconds on run fifty. That gap is the whole reason to build a loop instead of a prompt.

![关键数字面板](images/img-09.png)

> 图示（作者自制信息图）：四个关键数字一字排开——20 min（Run #1：搭 spec、verify、distill 的一次性成本）／30 sec（Run #N：附上新文件、复跑 skill）／$0.16（重复上下文命中缓存时每百万 token 的价格）／86.3%（swarm 在 BrowseComp 上的准确率，且这一能力会被带进之后每一次复跑）。这组数字把"复利"从口号变成了发票上的实数：第一次 20 分钟，第五十次 30 秒。

### 10. Promote the loop to a background agent

The final move: once a loop is stable and skill-backed, you stop launching it by hand.
Point Kimi at the trigger — a schedule, a new file drop, a competitor's pricing page — and let it run the whole loop proactively, surfacing only the deliverable and the deviations.

Competitive monitoring is the clean example.
Run #1 you build and verify by hand. By the time it's a background agent, it's checking every competitor in parallel weekly and dropping a brief in your inbox at zero marginal time cost.
The only human left in the loop is the question you set and the decision you make on the answer.

```
Run skill "[name]" on a weekly schedule.
Trigger: [schedule / new file / monitored URL]
On each run: execute the swarm, apply CONSTRAINTS.md,
verify, then deliver the OUTPUT + a diff vs last run.
Only ping me if a deviation crosses [threshold].
```

## Conclusion

While the closed labs keep shipping one smarter chatbot at a time, an open model is running 300 agents in parallel — and getting smarter at the system level with every run you give it.

We've seen this exact fingerprint once already. An open release reframes what the closed frontier thought it owned, and the whole field recalibrates overnight. It happened with DeepSeek.
A self-learning swarm on an open-weight model has the same shape.

The builders still arguing about which model "won" are answering a question that stopped mattering.
The question now isn't which model is smartest. It's how many you can run at once, who's checking their work, and whether your setup is sharper today than it was yesterday.

Most people will read this and keep using Kimi as a chatbox. A few will build the loop this week. The first run takes 20 minutes. Every run after that is leverage you own.

Build it. Verify it. Distill it. Then watch it get cheaper and sharper every single time you run it.
