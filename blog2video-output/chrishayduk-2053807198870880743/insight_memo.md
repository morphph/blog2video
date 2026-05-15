# Insight Memo: Using Codex Goals Effectively

## title_zh
Agent 死循环？目标定错了

## one_sentence_thesis
Codex 的 /goal 模式之所以容易翻车，不是因为模型不够强，而是因为它本质是一个"循环"——循环没有明确的停止条件时，Agent 要么提前放弃，要么永远瞎转，而绝大多数人还在用对话式模型那套模糊提示来喂它。

## why_this_video_exists
大多数人把 /goal 当成"更强的对话框"来用——以为模型变聪明了就能猜出他要什么。这篇博客是 OpenAI FDE 自己内部用 goal mode 总结出的反直觉发现：模糊提示在 Agent 循环里不是"效果差一点"，而是出现两种相反的失败模式（早退 vs 死循环）。还给出了三个具体可复制的工程动作：量化目标、压缩反馈循环、用三个 markdown 文件外置长程记忆。这是普通 Codex 教程拿不到的"内部用法"。

## judgment_lines
- "Goal mode 不是更聪明的对话框，而是一个需要停止条件的循环" — 来源：作者把 /goal 拆解为 execute → score → check → continue/terminate 四步循环，明确指出 step 3"检查分数是否满足目标"是整个机制的核心
- "提示模糊在 Agent 循环里不是效果打折，而是触发两种相反的崩溃模式" — 来源：作者明确指出 underspecified goals 会让模型要么"工作几分钟就放弃"，要么"永远不停地瞎改"
- "不是模型不会评估自己，而是评分标准不够量化时它没法评估自己" — 来源：作者用 Codex 自己把 NeurIPS LaTeX 排版规则提取成 200+ 条 markdown checklist，模型就能自我评分
- "EXPERIMENTS.md 比 PLAN.md 更重要，因为 Agent 需要的是失败记忆而不是路线图" — 来源：作者明确写"I tend to think EXPERIMENTS.md is the most important of the three"，理由是它让 Agent 能复盘哪些尝试为什么没成功
- "反馈循环的快慢决定 Agent 能跑多久，而不是模型上下文窗口" — 来源：作者用 NanoFold 把蛋白质结构模型的评分时间从"天"压到"分钟"，才让 goal mode 能持续运行多天

## evidence_map
- [具体数字] 量化目标的范例："reduce the runtime of the code contained in `specific_file` by 20% without causing any regressions in existing unit tests and integration tests"——明确给出 20% 这个数字 + 测试不回归这个硬约束
- [具体数字] ICML 论文格式 checklist 包含 over 200 条格式和文风规则，由 Codex 自己从 LaTeX 文件中提取生成
- [具体对比数据] NanoFold 数据集让蛋白质结构模型评分时间从 days for a full training set run 压缩到 just minutes
- [具体场景] 作者用 goal mode 把 NeurIPS preprint 自动改成 ICML workshop paper 格式，prompt 是"change the NeurIPS paper to ICML format based on the provided checklist.md without changing any of the technical content of the paper"
- [具体事实] goal mode 可以让 GPT-5.5 连续运行 multiple days at a time
- [具体失败模式] 模糊目标下模型的两种崩溃："give up early, working for only a few minutes before giving up" 与 "never stop working, making changes that flail about blindly as it tries to satisfy an unsatisfiable target"
- [具体产品名] 三个 markdown 文件的精确文件名：`PLAN.md`（高层计划）、`EXPERIMENTS.md`（实验记录，含 hypothesis/mechanism/decision rule/result 四段结构）、`EXPERIMENT_NOTES.md`（时间序的实时思考 scratchpad）
- [一手引用] EXPERIMENTS.md 真实样例 E15 实验：从 step 6000 续训到 9000，将 simplex_aux_weight 从 1.0 ramp 到 0.5，最终 val_lddt_ca 从 0.3472 提升到 0.3556，FoldScore 0.3025
- [作者原话] "the whole playbook" 就是三件事：clear measurable goal + tight feedback loop + markdown files

## non_obvious_points
- 模糊提示在 Agent 循环里制造的是两种相反的崩溃，而不是单纯的"效果差" — 为什么这不显而易见：对话式模型时代，模糊提示的代价是"输出质量打折"，是一个连续的劣化。但在 Agent 循环里，缺少停止条件会让同一种"模糊"分裂成两个对立的极端——早退或死循环。这是一种"质变"而不是"量变"，普通用户根本不会预期到
- 模型自己可以当裁判，前提是评分标准被翻译成可勾选的清单 — 为什么这不显而易见：直觉上"自己给自己打分"听起来不可靠（裁判和选手是同一个）。但作者发现，模型不擅长判断一个抽象目标是否达成，却擅长判断 200 条具体规则里每一条是否勾选——把质性目标拆成量性 checklist 后，自评变得可行。这绕开了"需要外部 evaluator"的传统假设
- EXPERIMENTS.md 是三个文件里最关键的那个，因为长程 Agent 最缺的是"失败记忆"而不是"规划能力" — 为什么这不显而易见：人类直觉会觉得 PLAN.md（指明方向）最重要。但作者明确说 EXPERIMENTS.md 才是核心，因为 Agent 在多天运行中真正会丢失的不是"我要去哪"，而是"我已经试过哪些路、为什么不通"。没有结构化的失败档案，Agent 会反复尝试已经验证过的死胡同

## tradeoffs_and_limits
- 不是所有问题都能被量化 — 具体表现：博客给出的所有正面案例（代码加速 20%、论文格式 checklist、蛋白质结构 lDDT 评分）都有清晰的可量化指标。但创意类、探索类、需要审美判断的任务（写一篇有"味道"的文章、设计一个"漂亮"的界面）天然抗拒被压成数字，作者没有给出 goal mode 在这类任务上的用法
- 搭建紧凑反馈循环本身是前置工程成本 — 具体表现：作者用 NanoFold 把评分从"天"压到"分钟"——但 NanoFold 是他自己事先准备好的小但采样良好的数据集（"a small but well-sampled dataset"），这本身就是非平凡的数据工程工作。不是开 /goal 就能用，使用者需要先投资搭建一个轻量评估管道
- 即便有三个 markdown 文件，Agent 仍然会跑偏 — 具体表现：作者保留 EXPERIMENT_NOTES.md（实时思考 scratchpad）的明确理由就是"so that you can audit the agent's thought process and see if you need to nudge it back in another direction"——也就是说，长程 Agent 仍然需要人类周期性介入校正方向，不是完全自动驾驶

## what_to_leave_out

**不该进入的素材：**
- NanoFold 数据集 Hugging Face 链接 — 太具体的产品引用，跟核心 thesis 无关，观众不会去下载
- ICML 论文格式 checklist 的具体规则示例（Type-1 字体、US letter 等）— 细节太琐碎，是论文圈内部话题，会让普通开发者出戏
- E15 实验的具体超参（simplex_aux_weight 从 1.0 ramp 到 0.5、step 6000-9000）— 蛋白质结构建模的领域细节，不应该出现在非该领域的视频里，只保留"这是一份结构化实验档案"这个抽象信号即可
- "六个月以来模型变得太好导致大家变懒"这段时代背景吐槽 — 是作者口语化铺垫，不是核心机制，删掉不影响 thesis

**应避免的叙事方向：**
- 不要把整片框架建立在"20%"或"200 条"这样的单一数字上 — 这些数字是证据不是 thesis，thesis 是"循环需要停止条件"
- 不要写成"Codex /goal 使用教程" — 这是一篇编辑判断稿的素材，不是工具说明书；重心在"为什么这种 prompt 风格变了"，不在"怎么敲命令"
- 不要把"自我评分"讲成新闻热点（"模型已经可以自己当裁判了！"）— 这会误导，正确叙事是"自我评分有前提条件，前提是评分标准被拆成可勾选清单"
- 不要把 PLAN.md / EXPERIMENTS.md / EXPERIMENT_NOTES.md 三个文件并列讲 — 作者明确表态 EXPERIMENTS.md 最重要，视频应该保留这个 ranking 而不是平均用力
- 不要使用"OpenAI 内部秘籍"之类的标题党框架 — 作者只是 FDE 分享个人使用心得，过度神化会让内容显得不可信

## signature_line
模型现在能跑几天不停了，但循环需要一个停下来的理由——你给它的是清单，还是雾。
