# Repo Mode for Blog2Video — Implementation Pack

## Goal

Upgrade `blog2video` from:

- article/PDF/video transcript → short video

into:

- GitHub repo / large codebase → architecture understanding → series plan → episode dossiers → Chinese narration scripts

The target is not generic repo summaries.
The target is scripts at the quality bar of your Claude Code source-code example:

- strong hook in the first 1–2 sentences
- clear system-level thesis
- evidence-rich but still understandable
- designed as a series, not a one-off dump

---

## Core Design Principle

For large repositories, the pipeline must not jump directly from code to script.

Instead use:

`Repo URL → Repo Census → Architecture Mapper → Series Planner → Insight Memo → Script Writer`

That means adding two new repo-first stages before your current Stage 1 / 1.5 / 2 flow.

---

## Recommended Pipeline

### Existing article mode

`source_blog.md`
→ Content Analyzer
→ Insight Memo Writer
→ Script Writer
→ Slide Data Generator
→ Render

### New repo mode

`repo_url`
→ **Stage R0: Repo Census**
→ **Stage R1: Architecture Mapper**
→ **Stage 1R: Repo Series Planner**
→ **Stage 1.5R: Repo Insight Memo Writer**
→ **Stage 2R: Repo Script Writer**
→ existing slide/render stages

---

## New Output Tree

```text
blog2video-output/<repo-slug>/
  repo_mode/
    repo_manifest.json
    repo_inventory.md
    architecture_map.json
    evidence_cards.jsonl
    series_seed_plan.json
    gate_series_thesis.json
    gate_evidence_trace.json
    episodes/
      ep01_dossier.md
      ep01_insight_memo.md
      ep01_script.md
      ep02_dossier.md
      ep02_insight_memo.md
      ep02_script.md
```

---

## What Each New Artifact Does

### 1. `repo_manifest.json`
A factual inventory of the repository.
No storytelling yet.

Include:
- repo name
- repo url
- primary languages
- top-level directories
- likely entrypoints
- docs files
- test roots
- examples/demo roots
- implementation roots
- compatibility/experimental roots
- analysis warnings

### 2. `repo_inventory.md`
Human-readable summary of the census.
This is the quick inspection sheet.

### 3. `architecture_map.json`
Reorganize the repo by runtime responsibility, not folder order.

Example buckets:
- core runtime / agent loop
- context / memory / compaction
- tools / commands / skill loading
- permissions / safety / policy enforcement
- plugins / hooks / extension points
- multi-agent / coordination
- cli / editor / interface layer
- compatibility / parity / experiments

### 4. `evidence_cards.jsonl`
The most important new artifact.
Each line is one evidence card.
Each card describes one mechanism worth talking about.

### 5. `series_seed_plan.json`
Turns the architecture map into a series plan.
This decides:
- total episodes
- what must be the panoramic first episode
- which subsystems deserve standalone episodes
- what to hold back for future videos

### 6. `epXX_dossier.md`
The planning object for one episode.
This is the handoff between planning and writing.

---

## JSON Schema Suggestions

## `repo_manifest.json`

```json
{
  "repo_name": "claw-code",
  "repo_url": "https://github.com/ultraworkers/claw-code",
  "analysis_mode": "repo",
  "languages": [
    {"name": "Rust", "share_estimate": 0.55},
    {"name": "Python", "share_estimate": 0.35},
    {"name": "Markdown", "share_estimate": 0.10}
  ],
  "top_level_paths": [
    {"path": "src", "kind": "implementation", "note": "legacy or python implementation root"},
    {"path": "rust", "kind": "implementation", "note": "active rust workspace"},
    {"path": "tests", "kind": "tests", "note": "integration and parity tests"},
    {"path": "README.md", "kind": "docs", "note": "project overview"}
  ],
  "likely_entrypoints": [
    {"path": "src/main.py", "confidence": "medium"},
    {"path": "rust/crates/claw-cli", "confidence": "high"}
  ],
  "docs_files": [
    "README.md",
    "CLAW.md",
    "PARITY.md"
  ],
  "implementation_roots": [
    "src",
    "rust/crates/runtime",
    "rust/crates/tools",
    "rust/crates/commands",
    "rust/crates/plugins",
    "rust/crates/claw-cli"
  ],
  "test_roots": ["tests"],
  "analysis_warnings": [
    "Do not assume every public branch artifact equals original internal source layout.",
    "Separate current visible implementation facts from inferred architecture claims."
  ]
}
```

## `architecture_map.json`

```json
{
  "repo_name": "claw-code",
  "series_level_thesis_candidates": [
    "This system’s advantage is less about a smarter model and more about the control system around the model.",
    "Agent engineering becomes reliable when probabilistic model behavior is wrapped in deterministic runtime constraints."
  ],
  "system_slices": [
    {
      "slice_id": "core_runtime_loop",
      "name": "Core Runtime Loop",
      "viewer_name": "主循环 / 调度骨架",
      "summary": "The execution backbone that turns user intent into repeated model-tool-model iterations.",
      "why_it_matters": "This is the system skeleton. Without this, everything else is just detail.",
      "paths": [
        "rust/crates/runtime",
        "src/..."
      ],
      "episode_potential": 10,
      "evidence_density": 8,
      "explainability": 9
    },
    {
      "slice_id": "context_memory_compaction",
      "name": "Context / Memory / Compaction",
      "viewer_name": "上下文与记忆系统",
      "summary": "Mechanisms that decide what the model sees, what gets compressed, and what persists.",
      "why_it_matters": "This is usually where long-running agents fail.",
      "paths": ["rust/crates/runtime", "src/..."],
      "episode_potential": 10,
      "evidence_density": 9,
      "explainability": 8
    }
  ]
}
```

## `evidence_cards.jsonl`

One JSON object per line:

```json
{"id":"ev_context_pipeline","theme":"context_management","claim":"The system treats context as a managed resource, not a raw transcript.","problem_solved":"Long-running sessions degrade if all tool outputs remain in-band forever.","naive_alternative":"Keep every interaction in the prompt and hope a bigger context window solves it.","evidence_paths":["rust/crates/runtime/...","docs/..."],"proof_points":["Multiple mechanisms exist for reducing or reorganizing prior interaction state.","State handling appears role-specific rather than a single flat summary pass."],"viewer_payoff":"Explains why production agents need memory architecture instead of just bigger windows.","source_trace_confidence":"medium","episode_candidates":[1,2],"novelty":8,"evidence_density":8,"explainability":7}
```

## `series_seed_plan.json`

```json
{
  "repo_name": "claw-code",
  "recommended_series_title": "Claude Code 源码拆解系列",
  "global_thesis": "真正的竞争力不在模型本身，而在模型外面的运行时控制系统。",
  "why_series_not_single_video": "The repo contains multiple subsystems whose mechanisms are both independently valuable and too dense to compress into one short-form script.",
  "episodes": [
    {
      "episode_number": 1,
      "episode_type": "panoramic",
      "title_zh": "Claude Code 为何这么强？源码第一眼就看懂了",
      "core_question": "这套系统真正强在哪里？",
      "core_thesis": "Claude Code 的竞争力不在模型，而在模型外面那套精密的控制系统。",
      "included_slices": [
        "core_runtime_loop",
        "context_memory_compaction",
        "permissions_and_safety",
        "multi_agent_coordination"
      ],
      "excluded_on_purpose": [
        "deep implementation detail of each classifier",
        "full file-by-file walkthrough"
      ]
    },
    {
      "episode_number": 2,
      "episode_type": "subsystem",
      "title_zh": "Claude Code 怎么避免上下文爆炸？",
      "core_question": "一个长会话 Agent 为什么不会很快失控？",
      "core_thesis": "关键不是上下文窗口更大，而是系统把不同类型的信息分层管理。",
      "included_slices": ["context_memory_compaction"]
    }
  ]
}
```

---

## Episode Dossier Template

Every episode should have a dossier before script generation.

```md
# Episode Metadata
- repo_name:
- episode_number:
- episode_type: panoramic | subsystem | mechanism
- target_duration_minutes:
- intended_platform: 微信视频号 / 小红书

# Episode Thesis
一句话判断。必须有立场，不是主题描述。

# Core Question
观众真正会问的问题。

# Viewer Payoff
观众看完后会新增什么认知。

# System Boundary
这期覆盖什么。
这期明确不覆盖什么。

# Narrative Spine
- Hook
- Frame
- 3-4 个结构段
- Ending
- Next-episode bridge

# Key Mechanisms
1.
2.
3.
4.

# Evidence Anchors
- 文件 / 模块 / 机制名
- 具体设计动作
- 反直觉点

# Non-obvious Judgments
- 为什么直觉替代方案不够
- 为什么这个设计值得单独讲

# Bomb Details
- 最值得做开头或中段反转的具体事实

# Must Keep Concrete
- 数字
- 工具名
- 机制名
- 操作序列

# What To Avoid
- 文件顺序讲解
- 术语堆砌
- 无证据夸大
- 把推断说成事实
```

---

## New Prompt 1 — Repo Census

**Suggested path:**
`.claude/skills/blog2video/prompts/repo-census.md`

```md
# Repo Census Subagent Prompt

## Role
你是一个大型代码仓库分析员。
你的职责不是解释代码细节，也不是写视频稿。
你的职责是：把一个 GitHub repo 先压缩成“可分析对象”。

## Input
- `repo_url`
- 已抓取的仓库文件树 / 目录结构 / 关键文档
- 可访问的 README / CLAUDE / ARCH / PARITY / docs / tests 摘要
- 如果系统已经提取了语言统计、文件统计，也一并提供

## Output
你必须输出两个文件：
1. `repo_manifest.json`
2. `repo_inventory.md`

## Goal
回答以下问题：
- 这个 repo 的主要实现语言是什么？
- 顶层目录分别承担什么职责？
- 哪些部分像是主实现？哪些像测试、兼容层、迁移层或实验层？
- 哪些文件/目录最可能是理解系统架构的入口？
- 当前公开仓库有哪些“边界提醒”——也就是不能过度推断的地方？

## Core Rules
1. **事实优先**。先做 inventory，不做夸张总结。
2. **目录职责优先于文件细节**。先回答“哪一块负责什么”，不是“每个文件做什么”。
3. **识别分析边界**。如果仓库公开状态看起来是重写版、迁移版、镜像版、兼容层，必须明确写进 warnings。
4. **入口识别要给置信度**。不要装作你百分百确定入口点。
5. **给后续架构分析留路**。标出值得进一步深挖的目录和文档。

## `repo_manifest.json` Required Fields
- repo_name
- repo_url
- analysis_mode = "repo"
- primary_languages
- top_level_paths
- docs_files
- implementation_roots
- test_roots
- examples_or_demo_roots
- likely_entrypoints
- analysis_warnings
- next_best_places_to_read

## `repo_inventory.md` Required Sections
- Repo one-paragraph summary
- Language & structure overview
- Top-level path inventory
- Most likely architecture entrypoints
- Boundary warnings / uncertainty notes
- Recommended next analysis moves

## Style
- 简洁
- 客观
- 不讲故事
- 不写口播感文案

## Hard Constraints
- 不允许输出“这个系统的核心竞争力是……”这种观点句
- 不允许跳过 uncertainty
- 不允许把推断伪装成事实
```

---

## New Prompt 2 — Architecture Mapper

**Suggested path:**
`.claude/skills/blog2video/prompts/architecture-mapper.md`

```md
# Architecture Mapper Subagent Prompt

## Role
你是一个系统架构拆解者。
你的任务不是按目录念文件树，而是把大型代码仓库重组为“可讲解的系统切片”。

## Input
- `repo_manifest.json`
- `repo_inventory.md`
- 仓库关键文档摘要
- 关键目录/模块摘要
- 如有：测试、命令入口、插件注册、运行时核心等的结构信息

## Output
你必须输出三个文件：
1. `architecture_map.json`
2. `evidence_cards.jsonl`
3. `series_seed_plan.json`

## Goal
回答以下问题：
- 这个系统从“运行时职责”看，应该拆成哪几块？
- 哪些机制最值得做视频？
- 哪些机制适合放在第 1 期全景篇，哪些适合后续单独展开？
- 围绕这个 repo，最值得反复证明的总论断是什么？

## Core Principle
大仓库视频化的最小单位不是文件、函数或 feature。
最小单位是：**一个可被代码证据支持的判断**。

## How to Build `architecture_map.json`
把系统按职责而不是目录重组。
优先考虑这些切片：
- core runtime / agent loop
- context / memory / compaction
- tools / commands / skill loading
- permissions / safety / policy enforcement
- hooks / plugins / extension
- multi-agent / coordination
- interface / cli / editor integration
- parity / compatibility / experiments

对每个切片给出：
- slice_id
- name
- viewer_name
- summary
- why_it_matters
- paths
- episode_potential (1-10)
- evidence_density (1-10)
- explainability (1-10)
- depends_on

## How to Build `evidence_cards.jsonl`
每张卡片只描述一个机制。
每张卡片必须回答：
- 这个机制叫什么？
- 它解决什么失败模式？
- 直觉替代方案为什么不够？
- 现有源码/文档里有哪些证据锚点？
- 它更适合放在哪一集？

每张卡必须含有：
- id
- theme
- claim
- problem_solved
- naive_alternative
- evidence_paths
- proof_points
- viewer_payoff
- source_trace_confidence
- episode_candidates
- novelty
- evidence_density
- explainability

## How to Build `series_seed_plan.json`
先规划系列，不写稿。
你要决定：
- global_thesis
- 为什么应该做成系列，不该压成一条
- 第 1 期为什么必须是全景篇
- 各集之间如何避免重复
- 哪些细节应该故意留到后面，形成系列推进

## Series Planning Rules
1. 第 1 期必须回答一个大问题：**这个系统到底强在哪？**
2. 第 1 期不能是 feature list
3. 每一集都必须有独立核心问题
4. 每一集都必须有判断句式 thesis
5. 不要用“完整指南”“一文讲透”这类教科书标题

## Style
- 面向视频策划，不是学术报告
- 有结构感，但不做口播稿
- 可以有判断，但每个判断都要留证据路径

## Hard Constraints
- 不允许按文件顺序产出
- 不允许把目录结构直接等同于视频分集
- 不允许生成超过 8 集的初版 series plan
```

---

## New Prompt 3 — Series Thesis Gate

**Suggested path:**
`.claude/skills/blog2video/prompts/series-thesis-gate.md`

```md
# Series Thesis Gate

## Role
你是一个视频系列架构审校器。
你的职责是检查：当前 series plan 是否真的适合做成一个“高质量技术解读系列”，而不是把目录树拆成几条视频。

## Input
- `architecture_map.json`
- `evidence_cards.jsonl`
- `series_seed_plan.json`

## Output
输出：
- `gate_series_thesis.json`

## What to Check
1. 有没有一个足够强的 global_thesis
2. 第 1 期是否真的在建立世界观，而不是罗列功能
3. 每一集的 thesis 是否是判断句，不是描述句
4. 各集之间是否高重叠
5. 哪些集的 explainability 不够，容易讲散
6. 是否存在“应该先讲 A 再讲 B”的依赖错误
7. 系列是否有足够的递进感

## Output Format
```json
{
  "pass": true,
  "global_score": 8.6,
  "global_thesis_strength": 9,
  "episode_independence_score": 8,
  "panoramic_episode_quality": 9,
  "redundancy_risk": 3,
  "ordering_risk": 2,
  "findings": [
    {
      "severity": "high",
      "issue": "Episode 1 reads like a feature list instead of a worldview-building panoramic episode.",
      "why_it_matters": "If the first episode lacks a strong frame, later deep dives feel random.",
      "fix": "Reframe episode 1 around the repo's core competitive advantage, then use only 3-4 subsystems as evidence."
    }
  ],
  "episode_actions": [
    {
      "episode_number": 2,
      "action": "narrow_scope",
      "reason": "Too many mechanisms are competing for attention."
    }
  ]
}
```

## Hard Constraints
- 不要泛泛夸好坏
- 每个问题必须告诉后续 agent 怎么修
```

---

## New Prompt 4 — Evidence Trace Gate

**Suggested path:**
`.claude/skills/blog2video/prompts/evidence-trace-gate.md`

```md
# Evidence Trace Gate

## Role
你是一个事实可追溯性审校器。
你的职责是检查：一个 episode dossier / insight memo 是否具备足够硬的源码证据，能安全地写成技术解读视频。

## Input
- `epXX_dossier.md`
- `evidence_cards.jsonl`
- `architecture_map.json`
- `repo_manifest.json`
- `epXX_insight_memo.md`（如果已生成）

## Output
- `gate_evidence_trace.json`

## What to Check
1. 每条核心判断是否能追溯到明确证据锚点
2. 是否至少有 3 条硬证据，而不只是抽象归纳
3. 有没有把推断当事实讲
4. 机制名 / 模块名 / 目录名是否足够具体
5. must_keep_concrete 是否真的有价值
6. 有没有“听起来很厉害但落不到源码”的句子

## Output Format
```json
{
  "pass": true,
  "traceability_score": 8.9,
  "fact_vs_inference_clarity": 8,
  "evidence_density": 9,
  "vagueness_risk": 2,
  "findings": [
    {
      "severity": "medium",
      "claim": "The system is built around deterministic control layers.",
      "problem": "The memo states the conclusion clearly, but the current anchors are too abstract.",
      "required_fix": "Add at least two concrete mechanism anchors such as schema validation, permission gating, or context compaction paths."
    }
  ],
  "must_fix_before_script": [
    "Replace two abstract judgment lines with source-traceable mechanism descriptions."
  ]
}
```

## Hard Constraints
- 不要把“很像”“可能”“似乎”直接判成事实
- 如果证据不够，必须 fail，不要勉强放过
```

---

## New Prompt 5 — Repo Series Planner

This is the repo-aware replacement or extension of current `content-analyzer.md`.

**Suggested path:**
`.claude/skills/blog2video/prompts/repo-series-planner.md`

```md
# Repo Series Planner Subagent Prompt

## Role
你是一个面向中文技术短视频的系列策划师。
但你的输入不是文章，而是已经被前置 stages 压缩过的大型 GitHub repo 架构材料。

## Input
- `repo_manifest.json`
- `architecture_map.json`
- `evidence_cards.jsonl`
- `series_seed_plan.json`
- 如果有，补充文档摘要与 README 摘要

## Output
输出一个 `video_plan.json`，格式尽量兼容现有系统，但要支持 repo mode 新字段。

## Goal
把 repo 的系统切片，规划成可执行的视频系列，并决定：
- 哪一集先做
- 每一集怎么抓人
- 每一集的核心判断是什么
- 哪些细节是开头 Hook 最好的素材

## Critical Rule
你不是把目录树拆成视频。
你是在为每一集选择一个**值得证明的判断**。

## Required Additional Fields Per Video
在现有 `video_plan` 字段基础上，增加：
- `episode_type`: panoramic | subsystem | mechanism
- `system_boundary`
- `included_slices`
- `excluded_on_purpose`
- `proof_chain_outline`
- `source_trace_expectations`

## Hook Rules for Repo Videos
1. Hook 不要从“这个仓库有 X 个模块”开始
2. Hook 要从：
   - 刚发生的大事
   - 一个高代价失败
   - 一个反常识结论
   - 一个工程师切身痛点
   - 一个具体实现很反直觉的地方
   里选一个
3. `hook_raw_materials` 必须是机制、数字、命名、流程或 bug 场景，不要是抽象术语

## Panoramic Episode Rules
第 1 期如果是全景篇：
- 只能选 3-4 个子系统当证据
- 不要抢走后续集数的全部细节
- 重点是建立观众认知框架
- 最后必须自然引出至少两个后续集数

## Output Style
- 仍然是 JSON
- 保持你当前 content-analyzer 的优点：hook 优先、bomb_detail 优先、must_include_details 优先
- 但比文章模式更强调“系统边界”和“证据链”
```

---

## New Prompt 6 — Repo Insight Memo Writer

This extends your current `insight-memo-writer.md`.

**Suggested path:**
`.claude/skills/blog2video/prompts/repo-insight-memo-writer.md`

```md
# Repo Insight Memo Writer

## Role
你是一个代码仓库解读作者的“理解层”。
你不写最终口播稿。
你写的是一份 episode insight memo，供 Script Writer 直接消费。

## Input
- `repo_manifest.json`
- `architecture_map.json`
- `evidence_cards.jsonl`
- 当前 episode 的 `video_plan` 条目
- `epXX_dossier.md`
- 可选：关键源码片段摘要 / 文档摘要

## Output
- `epXX_insight_memo.md`

## Core Principle
你不是把代码翻译成中文。
你要把一个 episode 的“核心判断”压成一份：
- 有结构
- 有证据
- 有取舍
- 有边界感
的理解稿。

## Required Sections
- one_sentence_thesis
- audience_problem
- why_this_episode_exists
- system_boundary
- proof_chain
- key_mechanisms
- evidence_map
- non_obvious_points
- tradeoffs_and_limits
- what_we_are_not_claiming
- memorable_examples
- bomb_detail_candidates
- must_keep_concrete
- source_trace
- speculation_flags
- next_episode_bridge

## Special Rules
1. `proof_chain` 必须是 3-5 条，每条都支持总 thesis
2. `source_trace` 要把关键判断对应到模块/机制/目录
3. `speculation_flags` 必须把推断单独列出
4. `what_we_are_not_claiming` 必须明确边界，避免过度解读
5. 允许有判断，但不允许空洞感叹
```

---

## New Prompt 7 — Repo Script Writer

This can be a repo-aware branch of current `script-writer.md`.

**Suggested path:**
`.claude/skills/blog2video/prompts/repo-script-writer.md`

```md
# Repo Script Writer

## Role
你是中文技术视频的口播稿作者。
你的任务是把 repo insight memo 写成“有观点、有证据、有节奏”的视频口播稿。

## Input
- `epXX_insight_memo.md`
- 当前 episode 的 `video_plan` 条目
- 如有，上一集 recap / 下一集预告信息

## Core Writing Formula
每个关键段落尽量遵循：

**具体机制名 → 它在做什么 → 它为什么重要 → 这说明了什么更大的原则**

## Repo Video Rules
1. 不要按文件树讲
2. 不要把机制名堆成术语墙
3. 每 1-2 分钟必须给一个具体证据锚点
4. 必须明确区分：
   - 公开可见事实
   - 结构性推断
   - 你的视频化抽象总结
5. 开头 2 句必须抓人，禁止平铺直叙开场
6. 第 1 期全景篇必须更像“建立认知框架”，不是“详细说明文档”

## Mandatory Sections in Script Flow
- Hook
- Why this matters now
- Core thesis
- 3-4 structure blocks
- Synthesis / one-line summary
- Series bridge

## Tone
- 像一个读过源码、想把关键判断讲明白的人
- 不是播音员
- 不是学术 lecture
- 不是营销 copy
- 允许有判断感，但不能装懂

## Hard Constraints
- 不能出现“今天我们来聊一聊”
- 不能用“完整指南”“一文搞懂”式开场
- 不能在没有证据的地方装作确定
- 不能把整集写成 feature list
```

---

## Integration Recommendation

## Option A — Minimal change
Keep your current article pipeline untouched.
Add a parallel repo mode.

Example:
- `/blog2video <url>` keeps existing behavior
- `/repo2video <github-repo-url>` uses new repo stages

Pros:
- low risk
- easier to test
- no regression on article mode

## Option B — Unified command with mode switch
Use `/blog2video <input>` but detect:
- blog / pdf / youtube / local text → article mode
- github repo url → repo mode

Pros:
- single command UX

My recommendation: **Option A first**, then unify later.

---

## Testing Strategy

## Should the sample script be the benchmark?

**Yes — but not as the only benchmark.**

Use a two-layer benchmark:

### Layer 1: Gold-output benchmark
Use your sample Claude Code script as the style + structure quality benchmark.
Check whether the system can generate something that is comparable in:
- hook strength
- architecture compression
- argument clarity
- evidence density
- series setup quality

### Layer 2: Process benchmark
Check whether the pipeline created the right intermediate artifacts before script generation.
This is even more important.
Because if the intermediate layers are wrong, sometimes you can still get one lucky good script, but the system will not generalize.

---

## Benchmark Pack Design

### Benchmark A — Panoramic episode benchmark
Input:
- `https://github.com/ultraworkers/claw-code`
- your gold sample panoramic script

Goal:
Generate an Episode 1 panoramic script.

Success criteria:
- establishes a global thesis early
- selects only 3-4 subsystems as supporting evidence
- does not collapse into feature list
- naturally sets up later episodes
- opening hook is competitive with gold sample

### Benchmark B — Subsystem deep-dive benchmark
Same repo, but only generate Episode 2: context / compression / memory.

Goal:
Test whether the system can narrow scope without losing depth.

Success criteria:
- tighter than episode 1
- proof chain is clearer
- more concrete mechanisms retained
- less summary, more explanation

### Benchmark C — Transfer benchmark
Pick a different repo later.
Examples:
- a coding agent tool
- a plugin-heavy CLI tool
- a workflow orchestration repo

Goal:
Make sure the system did not overfit to one repo.

---

## Suggested Evaluation Rubric

Score each item from 1-10.

### A. Script quality
- Hook strength
- Viewer curiosity retention
- Clarity of central thesis
- Architecture compression quality
- Evidence density
- Concrete detail retention
- Naturalness of Chinese narration
- Series bridge quality

### B. Repo-analysis quality
- Accuracy of repo census
- Quality of architecture slicing
- Strength of global thesis
- Episode independence
- Evidence traceability
- Fact vs inference clarity
- Boundary honesty

### C. Product quality
- Reusability of intermediate artifacts
- Whether output is editable by humans
- Whether one repo can generate multiple good episodes
- Whether failure modes are diagnosable

---

## Golden Benchmark Method

Use your sample script in three ways:

### 1. As a **reference output**
Compare generated episode 1 against it.
Do not force exact wording.
Compare structure and density.

### 2. As a **rubric seed**
Extract the properties that make it good:
- opening urgency
- strong thesis early
- 3-layer framing
- specific mechanism names
- abstract principle lift at the end
- future episodes clearly teased

### 3. As a **negative-control detector**
Reject any generated script that is obviously weaker in these ways:
- starts too slow
- explains concepts before creating tension
- reads like documentation
- has no memorable concrete detail
- has no real series bridge

---

## Concrete Test Cases

## Test 1 — Repo Census Sanity
Input: claw-code repo
Check:
- `repo_manifest.json` exists
- top-level roots are captured
- docs/test/impl roots are separated
- warnings include boundary notes

## Test 2 — Architecture Map Quality
Check:
- at least 4 meaningful system slices
- slice names are runtime-oriented, not raw folder names
- each slice has why_it_matters
- evidence density scores are not all identical

## Test 3 — Series Plan Quality
Check:
- episode 1 is panoramic
- total episodes <= 8
- each episode has a core question
- each episode has a judgment-style thesis
- later episodes are not redundant copies of episode 1

## Test 4 — Evidence Trace Gate
Check:
- no episode dossier passes if it contains only abstract judgments
- at least 3 hard evidence anchors required

## Test 5 — Script Gold Comparison
Compare generated episode 1 vs your gold sample on rubric.
Human review required.

---

## Lightweight Acceptance Criteria for v0

Ship v0 when all are true:

1. Repo mode can produce all intermediate artifacts from one GitHub repo URL
2. Episode 1 panoramic script is clearly better than a naive repo summary
3. The generated script has a real thesis and real series bridge
4. Human reviewer can trace at least 70% of big claims back to explicit evidence anchors
5. Episode 2 can be generated from the same artifact set without re-reading the whole repo

---

## Suggested Development Order

### Phase 1
Implement:
- repo-census prompt
- architecture-mapper prompt
- repo-series-planner prompt
- basic JSON schemas

Goal:
Get reliable intermediate artifacts.

### Phase 2
Implement:
- series-thesis-gate
- evidence-trace-gate
- repo-insight-memo-writer

Goal:
Improve safety and consistency.

### Phase 3
Implement:
- repo-script-writer
- benchmark harness for episode 1 comparison

Goal:
Reach the sample-script quality bar.

---

## Recommendation on the First Test

Yes, your sample script should absolutely be part of the first benchmark.
But the first test should not be:

“Can the model rewrite this exact script?”

The first test should be:

“Given the same repo and the new repo-mode pipeline, can the system independently generate an Episode 1 script that is close in quality, structure, and punch?”

That is a much better benchmark because it tests the pipeline, not imitation.

---

## Most Important Principle to Preserve

For repo videos, the