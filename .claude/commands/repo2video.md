# /repo2video — GitHub Repo to Video Series Pipeline

将 GitHub 仓库转化为中文技术视频系列的策划与预制产物（全景篇 + 子系统深挖）。

## 使用方式
```
/repo2video <github-repo-url>
```

支持的输入：
- **GitHub 仓库 URL** — `https://github.com/org/repo`

## 执行步骤

请按照以下步骤严格执行。每个 Stage 使用独立的 subagent 完成。

---

### Step 0: 准备工作

1. 读取输入参数 `$ARGUMENTS`，提取 GitHub 仓库 URL。

2. 从 URL 提取 slug（例如 `https://github.com/ultraworkers/claw-code` → `claw-code`）。

3. 创建输出目录结构：
   ```bash
   mkdir -p ./blog2video-output/<slug>/repo_mode/episodes
   ```

4. 克隆仓库到本地（shallow clone 以节省时间）：
   ```bash
   git clone --depth 1 <repo-url> ./blog2video-output/<slug>/repo_clone
   ```
   如果仓库已存在，跳过克隆：`git -C ./blog2video-output/<slug>/repo_clone pull` 更新即可。

5. 生成仓库文件树（保存以供后续 subagent 使用）：
   ```bash
   find ./blog2video-output/<slug>/repo_clone -type f \
     -not -path '*/node_modules/*' \
     -not -path '*/.git/*' \
     -not -path '*/target/*' \
     -not -path '*/dist/*' \
     -not -path '*/__pycache__/*' \
     -not -path '*/vendor/*' \
     | head -2000 \
     | sed "s|./blog2video-output/<slug>/repo_clone/||" \
     | sort \
     > ./blog2video-output/<slug>/repo_mode/file_tree.txt
   ```

6. 提取语言统计信息（简易方式）：
   ```bash
   find ./blog2video-output/<slug>/repo_clone -type f \
     -not -path '*/node_modules/*' -not -path '*/.git/*' \
     -not -path '*/target/*' -not -path '*/dist/*' \
     | grep -E '\.(ts|tsx|js|jsx|py|rs|go|java|rb|swift|kt|c|cpp|h|hpp|cs|md)$' \
     | sed 's/.*\.//' | sort | uniq -c | sort -rn
   ```
   将结果保存为变量供后续使用。

7. 提取关键文档内容摘要：
   - 检查是否存在：README.md, CLAUDE.md, ARCHITECTURE.md, CONTRIBUTING.md, docs/ 目录
   - 对每个存在的文档，读取内容（如果太长，取前 200 行）
   - 整合为 `key_docs_summary` 变量

---

### Step R0: Repo Census（仓库清查）

**使用 subagent 执行。** subagent 类型使用 `general-purpose`，以便它可以读取仓库文件。

读取 `.claude/skills/blog2video/prompts/repo-census.md` 获取完整 prompt。

对 subagent 的指令：
```
你是 Repo Census Agent。请阅读以下 prompt 规范，然后对给定的 GitHub 仓库进行清查分析。

<prompt_spec>
{repo-census.md 的内容}
</prompt_spec>

<repo_info>
repo_url: {GitHub URL}
repo_path: {本地克隆路径}
</repo_info>

<file_tree>
{file_tree.txt 的内容}
</file_tree>

<language_stats>
{语言统计结果}
</language_stats>

<key_docs>
{关键文档摘要}
</key_docs>

请输出两个文件：
1. repo_manifest.json（纯 JSON）— 写入 ./blog2video-output/<slug>/repo_mode/repo_manifest.json
2. repo_inventory.md（Markdown）— 写入 ./blog2video-output/<slug>/repo_mode/repo_inventory.md

你可以通过 Read 工具读取仓库中的文件来辅助判断。仓库路径是 {本地克隆路径}。
```

验证两个文件已生成：
- `repo_manifest.json` 是有效 JSON
- `repo_inventory.md` 非空
- 打印摘要：主要语言、入口数量、分析 warnings 数量

---

### Step R1: Architecture Mapper（架构拆解）

**使用 subagent 执行。** subagent 类型使用 `general-purpose`。

读取 `.claude/skills/blog2video/prompts/architecture-mapper.md` 获取完整 prompt。
读取 Step R0 产出的 `repo_manifest.json` 和 `repo_inventory.md`。

对 subagent 的指令：
```
你是 Architecture Mapper Agent。请阅读以下 prompt 规范，然后对仓库进行架构拆解。

<prompt_spec>
{architecture-mapper.md 的内容}
</prompt_spec>

<repo_manifest>
{repo_manifest.json 的内容}
</repo_manifest>

<repo_inventory>
{repo_inventory.md 的内容}
</repo_inventory>

<key_docs>
{关键文档摘要}
</key_docs>

<repo_info>
repo_path: {本地克隆路径}
</repo_info>

请输出三个文件：
1. architecture_map.json — 写入 ./blog2video-output/<slug>/repo_mode/architecture_map.json
2. evidence_cards.jsonl — 写入 ./blog2video-output/<slug>/repo_mode/evidence_cards.jsonl
3. series_seed_plan.json — 写入 ./blog2video-output/<slug>/repo_mode/series_seed_plan.json

你可以通过 Read 工具深入阅读仓库源码。仓库路径是 {本地克隆路径}。
按照 repo_inventory.md 中的 "Recommended Next Analysis Moves" 开始深读。
```

验证三个文件已生成：
- `architecture_map.json` 是有效 JSON，包含 `system_slices` 数组
- `evidence_cards.jsonl` 每行是有效 JSON，至少 10 张卡片
- `series_seed_plan.json` 是有效 JSON，包含 `episodes` 数组
- 打印摘要：切片数量、evidence card 数量、建议集数

---

### Step G1: Series Thesis Gate（系列结构审查）

**使用 subagent 执行。**

读取 `.claude/skills/blog2video/prompts/series-thesis-gate.md` 获取完整 prompt。
读取 Step R1 产出的三个文件。

对 subagent 的指令：
```
你是 Series Thesis Gate Reviewer。请审查以下系列规划材料。

<prompt_spec>
{series-thesis-gate.md 的内容}
</prompt_spec>

<architecture_map>
{architecture_map.json 的内容}
</architecture_map>

<evidence_cards>
{evidence_cards.jsonl 的内容}
</evidence_cards>

<series_seed_plan>
{series_seed_plan.json 的内容}
</series_seed_plan>

请输出 gate_series_thesis.json — 写入 ./blog2video-output/<slug>/repo_mode/gate_series_thesis.json
```

读取 `gate_series_thesis.json`，检查 `pass` 字段：

**如果 `pass: true`**：
- 打印 global_score 和各维度分数
- 如果有 `severity: medium` findings，打印提醒
- 继续下一步

**如果 `pass: false`**（第一次）：
- 打印所有 `severity: high` findings
- 重新运行 Step R1 Architecture Mapper，将 gate 的 findings 作为额外输入：
  ```
  <gate_feedback>
  上一轮 Series Thesis Gate 未通过。以下是审查意见，请在这一轮中修正：
  {gate_series_thesis.json 中的 findings 列表}
  </gate_feedback>
  ```
- 重新运行 Step G1 检查修改后的结果

**如果 `pass: false`**（第二次，即 retry 后仍然 fail）：
- 打印完整的 gate 结果
- 输出已生成的所有中间产物路径
- 停止 pipeline，提示用户手动审查：
  ```
  ⚠️ Series Thesis Gate 两次未通过。请手动审查：
  - ./blog2video-output/<slug>/repo_mode/gate_series_thesis.json
  - ./blog2video-output/<slug>/repo_mode/architecture_map.json
  - ./blog2video-output/<slug>/repo_mode/series_seed_plan.json
  建议：检查 global thesis 是否足够有力，第 1 期是否真的在建框架而非列功能。
  ```

---

### Step 1R: Repo Series Planner（系列策划）

**使用 subagent 执行。**

读取 `.claude/skills/blog2video/prompts/repo-series-planner.md` 获取完整 prompt。
读取所有前置产出。
读取 `.claude/skills/blog2video/examples/example-plan.json` 作为现有 video_plan 格式参考。

对 subagent 的指令：
```
你是 Repo Series Planner。请阅读以下 prompt 规范，然后为这个仓库规划视频系列。

<prompt_spec>
{repo-series-planner.md 的内容}
</prompt_spec>

<existing_plan_format_reference>
{example-plan.json 的内容 — 仅作格式参考，不是内容参考}
</existing_plan_format_reference>

<repo_manifest>
{repo_manifest.json 的内容}
</repo_manifest>

<architecture_map>
{architecture_map.json 的内容}
</architecture_map>

<evidence_cards>
{evidence_cards.jsonl 的内容}
</evidence_cards>

<series_seed_plan>
{series_seed_plan.json 的内容}
</series_seed_plan>

<gate_feedback>
{gate_series_thesis.json 的内容}
</gate_feedback>

请输出：
1. video_plan.json — 写入 ./blog2video-output/<slug>/video_plan.json
2. 每集的 dossier — 写入 ./blog2video-output/<slug>/repo_mode/episodes/ep{NN}_dossier.md
   （NN 为两位数集号：01, 02, 03...）

video_plan.json 格式必须兼容现有 blog2video 下游（参考 existing_plan_format_reference 的结构）。
同时包含 repo mode 扩展字段（episode_type, system_boundary, included_slices 等）。
```

验证输出：
- `video_plan.json` 是有效 JSON，包含 `video_plan.videos` 数组
- 每集有对应的 `epXX_dossier.md` 文件
- 每个 dossier 的 Evidence Anchors 至少 3 行
- 打印最终系列规划摘要：
  - 系列标题
  - Global thesis
  - 每集：编号、标题、类型、预计时长
  - 总集数

---

### Step 2: 输出汇总

打印所有生成的文件：
```
📁 blog2video-output/<slug>/
├── repo_clone/                ← 克隆的仓库
├── video_plan.json            ← 视频系列计划
└── repo_mode/
    ├── file_tree.txt          ← 仓库文件树
    ├── repo_manifest.json     ← 仓库结构清单
    ├── repo_inventory.md      ← 仓库可读摘要
    ├── architecture_map.json  ← 架构切片图
    ├── evidence_cards.jsonl   ← 证据卡片（{N} 张）
    ├── series_seed_plan.json  ← 初版系列规划
    ├── gate_series_thesis.json ← 系列审查结果
    └── episodes/
        ├── ep01_dossier.md    ← 第 1 集策划 dossier
        ├── ep02_dossier.md    ← 第 2 集策划 dossier
        └── ...
```

打印系列一览：
```
🎬 系列: {series_title}
📌 总论断: {global_thesis}

第 1 期 [{episode_type}]: {title_zh} (~{duration}分钟)
   Thesis: {core_thesis}
第 2 期 [{episode_type}]: {title_zh} (~{duration}分钟)
   Thesis: {core_thesis}
...
```

提示后续步骤：
```
✅ Phase 1 完成。已生成仓库分析和系列策划产物。

后续步骤（Phase 2/3）：
- 对每集生成 insight memo: 使用 repo-insight-memo-writer
- 对每集生成口播稿: 使用 repo-script-writer
- 生成 slides 和渲染视频: 使用现有 blog2video 渲染流程

要生成第 1 集的完整视频，运行：
/repo2video-episode <slug> 1
```

---

## 注意事项

- 每个 subagent 都是独立的，不要在 subagent 之间共享上下文
- subagent 需要读取仓库文件时，使用 `general-purpose` 类型（有 Read 工具访问权限）
- 如果某个 Stage 失败，先输出已完成的文件，再报告错误
- Architecture Mapper 是最关键且最耗时的步骤——给它足够的时间深入读代码
- Gate 失败最多重试 1 次，第 2 次 fail 就停止等待人工干预
- repo_clone 目录在整个 pipeline 期间保留，供 subagent 读取源码
