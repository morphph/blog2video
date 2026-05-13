# Insight Memo: Claude Code `/goal` —— 把"判断做完没"这件事，外包给另一个模型

## title_zh

让另一个模型来判断"做完了没"？

## one_sentence_thesis

`/goal` 真正的设计要点不是"自动多轮"，而是**把"判断完成"这件事从干活的模型手里拿走，交给一个独立的、不能动工具的小模型——这是 turn-level 的 generator-evaluator 分离**。

## why_this_video_exists

大多数人看到 `/goal` 会当成又一个"自动循环"开关，和 `/loop` 混为一谈。这条视频提供的认知是：`/goal`、`/loop`、Stop hook 三者的区别不在"能不能跑很久"，而在**谁来决定下一轮是否开始**——条件达成、时间到了、还是你自己的脚本说了算。这三种触发器分别对应三类不同的自动化场景，选错就是浪费 token 或永远停不下来。再往下挖一层：evaluator 不能跑工具，只能看 Claude 自己在 conversation 里"晒出来"的东西——这一条约束决定了什么条件能写、什么条件写了等于没写。

## judgment_lines

- "评估完成度的模型，不应该是干活的那一个" —— 来源：`/goal` 每轮结束后调用 small fast model（默认 Haiku）做 yes/no 判断，主模型只负责执行；这是 turn 级别的 generator-evaluator 分离
- "三种自动循环的差别不在能跑多久，而在谁触发下一轮" —— 来源：文档里的对比表明确写出 `/goal`（上一轮结束触发）、`/loop`（时间间隔触发）、Stop hook（你自己的脚本/prompt 触发）
- "条件能不能被验证，取决于 Claude 自己在对话里晒了什么" —— 来源：评估器不调用工具，只能 judge "what Claude has already surfaced in the conversation"，所以"all tests pass"有效是因为 Claude 会真的跑测试并把结果打到 transcript 里
- "`/goal` 不是新功能，是 prompt-based Stop hook 的一个 session 级语法糖" —— 来源：文档明确说 `/goal` is a wrapper around a session-scoped prompt-based Stop hook
- "no 不只是停下信号，是下一轮的指令注入" —— 来源：评估器返回 "no" 时，会把 reason 作为 guidance 喂回下一轮——形成闭环反馈，不是简单的开关

## evidence_map

- [具体命令] `/goal <condition>` 设置完成条件，设置后立即开始一个 turn，条件本身作为 directive；`/goal` 不带参数查状态；`/goal clear` 提前清除（aliases: stop/off/reset/none/cancel）
- [具体机制] 每轮结束后，condition + 对话历史 → small fast model（默认 Haiku）→ 返回 yes/no + 一句 reason
- [具体数字] condition 最多 4,000 字符
- [具体行为] yes → 自动清除 goal，记录 achieved entry；no → reason 作为下一轮的 guidance 喂回主模型
- [对比表，原文最有立场的部分]
  - `/goal`: next turn starts when 上一轮结束 / stops when 模型确认条件达成
  - `/loop`: next turn starts when 时间间隔到 / stops when 你停它，或 Claude 判断做完了
  - Stop hook: next turn starts when 上一轮结束 / stops when 你自己的脚本或 prompt 决定
- [作用域差别] `/goal` 是 session-scoped 临时命令；Stop hook 写在 settings 文件里，对该 scope 下所有 session 生效
- [关键约束] evaluator does not call tools——只能判断 Claude 已经"晒"到对话里的内容
- [配套机制] auto mode 移除"每个工具调用确认"，`/goal` 移除"每轮确认"——两者互补
- [具体命令] headless 模式：`claude -p "/goal CHANGELOG.md has an entry for every PR merged this week"` 一次调用跑到完成
- [实现细节] `/goal` is a wrapper around a session-scoped prompt-based Stop hook——不是新机制，是已有机制的语法糖
- [成本说明] 评估 token 在 small fast model 上计费，相对主轮花费 typically negligible
- [限制条件] 需要 trust dialog 已接受；`disableAllHooks` 或 `allowManagedHooksOnly` 设置时不可用，且命令会告诉你原因（不静默失败）
- [Resume 行为] `--resume`/`--continue` 恢复 session 时，condition 保留，但 turn count、timer、token 基线全部重置
- [写条件的方法论] 好 condition 有三件东西：one measurable end state（测试结果/build exit code/file count/空队列）、a stated check（如 `npm test` exits 0、`git status` is clean）、constraints that matter（"不要改其他测试文件"）
- [兜底机制] 可在 condition 里写 "or stop after 20 turns" 来限定预算，Claude 每轮汇报进度

## non_obvious_points

- **Evaluator 不能调工具，这条约束反过来决定了"什么条件值得写"** —— 为什么这不显而易见：直觉上你会写"代码没有 bug"作为 condition，但这种条件评估器没法判断（它没法跑代码）。真正能用的条件必须是"Claude 在对话里会自己晒出证据"的那种——"npm test exits 0"之所以工作，是因为 Claude 真的会跑测试、结果会落到 transcript 里给评估器看。这把"写条件"从一个意图表达问题，变成了一个"如何让 agent 主动产生可验证证据"的设计问题。
- **`/goal` 在 turn 这一层复刻了 generator-evaluator 分离模式** —— 为什么这不显而易见：generator-evaluator 通常被理解为 LLM 系统设计里的高阶模式（一个模型产出，另一个模型评分），但很少有人意识到 `/goal` 把这个模式直接搬到了"每一轮 agent 对话"的粒度上：干活的是大模型，判断完成的是小模型，两者职责彻底隔离。这不是"功能"，是"架构选择"——任何 agentic loop 都可以套用。
- **`no` 不是简单的停止信号，是下一轮的 prompt 注入** —— 为什么这不显而易见：表面看评估器只是个二值开关（yes 停 / no 继续），但实际上 reason 会被作为 guidance 喂回主模型——这是一个闭环反馈系统：评估器既是裁判，又在隐式地"指导"下一轮该做什么。这意味着评估器的 prompt 质量直接影响 agent 的工作方向，不是被动观察者。

## tradeoffs_and_limits

- **评估器可能判错** —— 具体表现：small fast model（默认 Haiku）能力有限，可能给出 false yes（条件没达成却判通过）或 false no（达成了还在跑），前者直接污染产出，后者烧 token
- **条件必须"自带证据"才有用** —— 具体表现：评估器不能跑工具，所以"代码质量好"、"性能优化了"这类无法在对话里直接呈现证据的条件，写了等于没写；condition 必须可以被 Claude 的输出 demonstrate
- **不主动设预算会让 token 累积** —— 具体表现：评估本身廉价（small fast model），但主轮一直跑就一直烧；文档建议在 condition 里加 "or stop after 20 turns" 这种兜底
- **需要 trust dialog 已接受** —— 具体表现：`/goal` 本质是 prompt-based Stop hook 的语法糖，受 hooks 系统约束；`disableAllHooks` 或 `allowManagedHooksOnly` 设置时直接不可用——在受管环境里可能根本启用不了

## what_to_leave_out

**不该进入的素材**：
- 完整命令列表（`/goal`/`/goal clear`/aliases 一长串）—— 太工具说明书，观众记不住
- Resume 行为细节（`--resume`/`--continue` 后 timer 和 token 基线如何重置）—— 太边缘，干扰主线
- Headless 模式（`claude -p "/goal ..."`）的具体调用形式 —— 一笔带过即可，不要展开
- 所有 use case 罗列（API migration、设计文档验收、文件拆分、issue 队列）—— 选 1 个最有画面感的当例子就够，全列就是教程化
- "Auto mode 和 /goal 互补"这条细节 —— 概念不熟的观众听了反而混乱

**应避免的叙事方向**：
- ❌ 不要写成 `/goal` 使用教程（"第一步设置条件，第二步检查状态…"）—— 文档已经写了，视频不需要复读
- ❌ 不要把 thesis 建立在"自动跑多轮"这个表面 feature 上 —— 真正的洞察是 evaluator 分离和"谁触发下一轮"，不是 autonomy
- ❌ 不要假设观众已经熟悉 generator-evaluator 模式 —— 用一句话点破 turn 级别的职责分离即可，不要展开讲 LLM 系统设计理论
- ❌ 不要做成"`/goal` vs `/loop` vs Stop hook 哪个好"的对比评测 —— 它们不是替代关系，是触发器选择问题；叙事重点是"按谁触发下一轮来选"
- ❌ 不要忽略"evaluator 不能调工具"这个约束 —— 这是写出有效 condition 的关键前提，如果略过，观众会带着错误的心智模型去用

## signature_line

让 agent 跑下去的开关，不该握在干活的那个模型手里。
