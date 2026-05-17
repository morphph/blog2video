# Insight Memo: OpenAI Cookbook — Agent Improvement Loop with Traces, Evals, and Codex

## title_zh
Agent 不是改 prompt，是改 5 个面

## one_sentence_thesis
让一个 Agent 越用越强的关键，不是反复调 prompt，而是建立一条把"每次失败的反馈"自动转化为"未来可复用的 eval"的飞轮——而这条飞轮要改的，是包含指令、工具、路由、输出契约、校验五个面的整套 harness，不是单一 prompt。

## why_this_video_exists
绝大多数团队迭代 Agent 的方式是：跑一次、出问题、在 Slack 里留几句"下次要注意 X"，下次还是踩同样的坑。这篇 cookbook 第一次把"Agent 自我改进"这件事拆成了一条可运行的 6 段流水线，并且把最反直觉的一步——"反馈转 eval"——写成了可以照抄的代码。观众从其他 Agent 教程拿不到的认知是：harness 是 5 个表面、不是 1 个 prompt；以及"反馈不入 eval 就等于白给"这条让经验复利的工程纪律。

## judgment_lines
- "改 prompt 修不好 Agent，因为 Agent 不止是 prompt" — 来源：原文明确把 harness 定义为 "instructions, tools, routing, output requirements, and validation checks" 五个面的完整契约，prompt 只是其中之一。
- "反馈如果不变成 eval，就是一次性消耗品" — 来源：原文核心卖点 "preserves learnings through each iteration rather than leaving them as disconnected comments"；feedback → Promptfoo eval 这一步是整条飞轮中信息复用的唯一接口。
- "5 条 trace 必须打的是失败模式，不是 happy path" — 来源：原文五条 traced runs 全部围绕失败场景设计（融资风险、ARR 对账、客户集中度归并、SOC 2 缺位、不可推断指标），没有一条是"演示成功"。
- "Agent 完成"不是模型说完就算，而是 6 件输出物加 2 道校验都通过 — 来源：required artifacts 明确列出 6 个文件（summary_answer.md / investment_memo.md / risk_register.json / open_questions.md / citations.json / evidence_table.csv），并由 check_evidence_coverage.py 和 validate_output_contract.py 两个独立校验器把关。
- "20 分钟跑完一次完整自我改进循环"本身是个反常识数据 — 来源：原文 prerequisites 写明 "Approximately 20 minutes runtime with default settings"，意味着一条完整的 trace → feedback → eval → HALO 排序 → Codex PR 闭环可以在午休时间内跑完。

## evidence_map
- [具体事实] Harness 的五个面被明文枚举："instructions, tools, routing, output requirements, and validation checks"——这是整篇 cookbook 对"改 Agent 到底改什么"的官方定义。
- [具体事实] 输出契约由 6 个文件构成：`summary_answer.md`、`investment_memo.md`、`risk_register.json`、`open_questions.md`、`citations.json`、`evidence_table.csv`。
- [具体事实] 两个独立校验器：`check_evidence_coverage.py`（审计每条 claim 是否引用了真实 dataroom 文件）+ `validate_output_contract.py`（校验文件存在、JSON/CSV 结构、引用合法）。
- [具体事实] 5 条 traced runs 各自对应一个失败模式：burn/runway 推融资风险、ARR bridge 对账、parent-account rollups 后的客户集中度、SOC 2 缺位下的企业安全准备、不该被推断的指标。
- [具体数字] 完整运行一次循环 "Approximately 20 minutes runtime with default settings"。
- [具体事实] 6 个组件的栈：OpenAI Agents SDK（Agent 本体）+ 自定义 `HaloJsonlTraceProcessor`（把 spans 转成 OpenTelemetry JSONL）+ 人类与 LLM feedback 收集 + Promptfoo（把 feedback 变 eval 并复跑）+ HALO（对 harness 改动建议排序）+ Codex（把建议落地成 PR）。
- [具体事实] AgentConfig / ToolPolicy / ModelSettings 三个数据结构定义了 allowed data roots、writable output dirs、required artifacts、evidence preferences——也就是说 harness 是"数据结构化"的，不是写在 prompt 里的。
- [对比数据] 原文反复对比的两种姿态：disconnected comments（一次性 Slack 评论） vs preserved learnings（沉淀到 eval 中复用）。

## non_obvious_points
- "feedback → Promptfoo eval"是整条飞轮中最不显眼但杠杆最大的一步 — 为什么不显而易见：表面看 trace、HALO、Codex 都是更"性感"的组件，但只有"把这次的教训变成下次也会跑的 eval"这一步，才让经验从一次性消耗品变成累积资产；其他组件没有这一步全是空转。
- 6 件输出物 + 2 道校验合起来其实是在回答"什么叫 Agent 把任务做完了" — 为什么不显而易见：大多数团队默认"模型回完话就算完"，而这套契约把"完成"重新定义为可机器校验的物理产物，因此才能被 Promptfoo 当成 pass/fail 来跑。
- 5 条 trace 都是失败模式，不是 happy path — 为什么不显而易见：直觉做法是先跑通几个成功例子做 demo，但这套流水线从一开始就把 eval 当成"防回归"工具来设计，因此样本必须覆盖"会出错的地方"而不是"已经能跑的地方"。
- "Harness 是数据结构"这一点藏在 ToolPolicy / AgentConfig 里 — 为什么不显而易见：原文没有把它点出来，但当你看到 allowed data roots、writable output dirs、required artifacts 都被写进 Python dataclass 而不是 system prompt，就意味着这些约束是 Codex 可以改、HALO 可以打分的代码对象，而不是自然语言里的请求。

## tradeoffs_and_limits
- 工具栈重——一次循环要同时跑通 OpenAI Agents SDK、Promptfoo、HALO、Codex 四套系统 — 具体表现：任何一环挂掉整条飞轮停摆，团队要承担四套工具的运维与升级成本。
- HALO 是 OpenAI 专有组件，存在供应商绑定 — 具体表现：排序"该改哪个 harness 表面"这一步目前没有同等替代品，离开 OpenAI 生态需要自己实现优化器。
- "feedback 转 eval"看似自动，实际仍需要人来判断"这条反馈该不该变成永久 eval" — 具体表现：低质量 feedback 直接入库会污染评测集，反而让未来迭代被噪声牵着走。
- 20 分钟/次的循环时间在小规模下很爽，但 eval 数量从 5 涨到 100 时会线性甚至超线性变长 — 具体表现：HALO 排序与 Promptfoo 全量复跑都随 eval 数量增长，飞轮转得越久越慢。

## what_to_leave_out

**不该进入的素材：**
- OpenAI Agents SDK 的安装步骤、`openai-agents` 包名、Node.js / npx 等环境前置（太细节，与核心 thesis 无关）。
- Synthetic dataroom 的具体文件清单（ARR bridge、board deck、org chart、Q&A log 等）（属于演示道具，观众不关心虚构的财务尽调内容）。
- `HaloJsonlTraceProcessor` 把 spans 转 OpenTelemetry JSONL 的字段细节（resource attributes、observation kind 映射、token 计数字段）（实现细节，对"为什么这条飞轮重要"无贡献）。
- ModelSettings 里 reasoning effort level 这种调参细节（与 thesis 无关）。

**应避免的叙事方向：**
- 不要把这条视频讲成"又一个 Agent loop 很厉害"——那是上一条 Iterative Repair Loops 视频的领地，那条讲的是"让 Agent 正确跑完一次任务"的 3 阶段循环；本条讲的是"让 Agent 一次比一次强"的 6 段改进流水线，必须把这两件事在叙事上切干净。
- 不要把全片框架建立在"20 分钟"这个单一数字上——它是支撑性证据，不是中心论点。
- 不要写成 OpenAI Agents SDK 教程——观众不需要知道怎么 `pip install`，需要知道"为什么单改 prompt 永远修不好 Agent"。
- 不要把 harness 翻译成"提示词工程"——这恰好是这篇博客在反对的事。要保留"五个面的完整契约"这个具体框架。
- 不要在结论处回到"Agent 时代来了"的泛泛感叹——结论必须落在"反馈能不能复利"这个可操作的工程纪律上。

## signature_line
别人在改 prompt，他们在搭一条让每次失败都变成下次评测的飞轮——Agent 不是被调出来的，是被沉淀出来的。
