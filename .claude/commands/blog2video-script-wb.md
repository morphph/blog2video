# /blog2video-script-wb — wb 白板线 tutor 叙述稿（目录模式专用）

为 wb 白板精读线生成（或修订）tutor 叙述稿。**只接受目录模式**——上游（wf1.py whiteboard lane）
已把精读和原文 staging 好；本命令不抓取任何 URL、不生成 insight memo。

## 使用方式
```
/blog2video-script-wb <output-dir>
```

`$ARGUMENTS` = output-dir（含 `source_blog.md` + `jingdu.md` 的 staged 目录）。

## 执行步骤

### Step 1: 读取输入
1. `<output-dir>/jingdu.md` —— 结构脊柱（必须存在；缺了就报错停止，别退回原文自由发挥）
2. `<output-dir>/source_blog.md` —— 引语/数据的事实真相
3. `<output-dir>/.b2v-task.json` 的 `feedback_log` 末条 —— 作者修订意见（若有，最高优先级）
4. `<output-dir>/narration.md` —— 上一版（若有，保留好的部分）
5. `<output-dir>/diagrams/steps.json` —— 白板图揭示顺序（若有，用于对齐叙述节奏）

### Step 2: Script Writer（tutor）

使用 subagent 生成叙述稿。读取 `.claude/skills/blog2video/prompts/script-writer-tutor.md`
获取完整写作规范（voice 与风格锚的引用路径都在里面，subagent 须照读）。

对 subagent 的指令：
```
你是 tutor Script Writer。先读写作规范，再按规范完成叙述稿。

<prompt_spec>
{script-writer-tutor.md 的内容}
</prompt_spec>

<jingdu>
{jingdu.md 的内容}
</jingdu>

<source_blog>
{source_blog.md 的内容}
</source_blog>

{如果 feedback_log 有末条：}
<author_feedback>
{feedback 文本}
</author_feedback>
作者意见是最高优先级，逐条落实。

{如果有上一版：}
<previous_version>
{narration.md 的内容}
</previous_version>
在上一版基础上改进，保留好的部分。

输出完整叙述稿 Markdown（## 分段、无 [SLIDE] 标记、第一人称 tutor、hook 开场）。
```

输出覆盖写 `<output-dir>/narration.md`。

### Step 3: 汇报（不继续后续步骤）

打印：字数、预计时长（÷320 字/分，minimax speech-02-hd 实测语速）、段落数、hook 前两句。
headless 场景下写完文件即完成；交互场景下等作者意见，有意见回 Step 2 修订。
**绝不自动进入分镜/TTS/渲染。**
