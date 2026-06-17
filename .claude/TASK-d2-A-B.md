# TASK: 把 d2「终端霓影」管线正式接进工作流（A + B）

> 在新 session 里 `@`-引用本文件即可执行。这是改 prompt/命令/脚本（文档 + 小脚本），**不要为验证去跑整条 ~50min 渲染**。

你是 blog2video 项目的维护者。任务：把已验证的 d2「终端霓影」管线正式接进工作流，做两件事 A + B。

## 背景

blog2video 把英文技术内容转成中文口播竖屏视频。视觉引擎自 2026-06 起是 d2「终端霓影」（签名色酸性绿 `#ccff4d`、只用 MiSans + JetBrains Mono、逐场景 hyperframes 渲染）。d2 管线的全部构件已在 `.claude/skills/blog2video/` 里、已提交，并于 2026-06-17 用 brainsandtennis「Building a Good Vertical Agent」端到端跑通验证（产物在 `blog2video-output/brainsandtennis-2065190286519906657/`，是完整参考）。但有两个 gap 没接进工作流，本任务就是修它们。

## 已核实的关键事实

- `/blog2video` 命令文件 `.claude/commands/blog2video.md` 仍是【旧 Remotion 链路】：0 处 d2 引用、3 处 Remotion，调用 `blog2video-remotion/scripts/render-all.mjs` 截图链路。
- d2 编排的真源是 `.claude/skills/blog2video/SKILL.md` 的「Orchestrator 调度逻辑」(d2 path，Step 0→7) + 强制 Hook review 检查点 Step 3.5。
- 封面：`prompts/slide-html-generator.md` 的「封面图（Cover Photo）」段还是旧 Remotion 暗紫风；且 d2 path 里【没有】自动把封面截成 `video_N_cover_photo.png` 的步骤。上次是临时手搓 `blog2video-output/brainsandtennis-2065190286519906657/cover_d2.html` + puppeteer 截图补的。

## 任务 A —— 把 /blog2video 接到 d2 path

重写 `.claude/commands/blog2video.md`，让它驱动 SKILL.md 的 d2 编排，不再走 Remotion `render-all.mjs`：

- DRY：命令只保留命令级职责（参数 = url/file、Twitter/X 的 Playwright MCP 前置检查、各 Gate、**强制 Hook review 检查点 Step 3.5**、单集时长决策、Post-Render Delivery 规则），阶段细节 defer 到 SKILL.md，不要把整条 pipeline 在两处重复。
- 渲染段改为：`npm run tts` → `build-scenes-data.mjs` → d2 scene-generator ×N → `render-d2.sh`（细节见 SKILL.md / prompts/scene-generator.md / scripts/render-d2.sh）。
- Remotion 仅作 fallback 保留（文档里标明，不要删）。
- 同时检查并对齐 sibling 命令 `blog2video-continue.md / blog2video-render.md / blog2video-slides.md`（它们也引用 Remotion）：至少在顶部标注「d2 为主、Remotion 为 fallback」，或按需改造，以一致为准。

## 任务 B —— 把 d2 封面做进 skill（自动、可复用）

- **B1**：把 `prompts/slide-html-generator.md` 的「封面图」段改成产出【d2「终端霓影」风格的 cover_photo.html】。参考 working 样例 `blog2video-output/brainsandtennis-2065190286519906657/cover_d2.html`（酸性绿签名色 + 任一帧 ≤1 辅助色、MiSans Heavy 大标题、JetBrains Mono 标签、点阵底、字体走 `assets/fonts/` symlink、背景 `#121212`）。模板要【参数化、可复用】：大标题取 `video_plan.json` 的 `title_zh`（或 Hook 第一句），来源胶囊取英文原标题，可选 1–2 个 hook 数据 chip——但没有干净数字时要优雅降级，不要硬塞。topbar 用 `精读AI · <系列名大写>`。
- **B2**：在 d2 path 里加一个【自动把封面截成 `video_N_cover_photo.png`】的步骤（目前没有）。写个可复用小脚本放 `.claude/skills/blog2video/scripts/`（参考上次：用 `blog2video-remotion/node_modules/puppeteer`，viewport 1080×1920，deviceScaleFactor 1，waitUntil networkidle0），挂在 `render-d2.sh` 末尾或作为独立步骤。**注意陷阱**：cover_photo.html 的字体走 `assets/fonts/` symlink，而该 symlink 是 `build-scene.mjs` 建场景时才创建的——所以截封面要在 symlink 存在之后跑（或截图步骤自己确保 symlink 在）。
- 更新 `SKILL.md` 调度逻辑，把「生成 d2 封面 + 截成 PNG」这步写进 d2 path 对应位置。

## 动手前先读

- `.claude/skills/blog2video/SKILL.md`（d2 编排真源）
- `.claude/commands/blog2video.md` + 三个 sibling 命令
- `.claude/skills/blog2video/prompts/slide-html-generator.md`（封面段在这）和 `prompts/scene-generator.md`（d2 风格作业书）
- `.claude/skills/blog2video/scripts/render-d2.sh` 和 `scripts/build-scene.mjs`
- `.claude/skills/blog2video/design/d2-kit/d2-base.css`（令牌/类定义）
- `blog2video-output/brainsandtennis-2065190286519906657/cover_d2.html`（d2 封面 working 样例）+ 该目录整体
- 项目记忆 `.claude/projects/-Users-yufanp-Desktop-Project-blog2video/memory/` 下的 `project_d2_coverphoto_gap.md`、`project_hyperframes_d2_direction.md`、`project_hyperframes_render_constraints.md`

## 铁律 / 约束

- 开始前 `git pull`；改完 `git commit + git push`（项目有 auto-sync，但你也要显式提交并写清楚的 message）。
- 任何 shell 命令前缀 `export PATH="/opt/homebrew/opt/node@22/bin:$PATH"`（node 必须 v22.x）。
- 不要破坏 Remotion fallback（保留，只降级为 fallback）。
- 沿用 NEVER 条款：音频不做 loudnorm；`meta.json` 不加 title/description/tags；交付的 PNG 只有 `*_cover_photo.png`（slide 截图不传）。
- d2 渲染硬约束不变（逐场景渲、串行、node22、`--max-old-space-size=5120`）——本任务不改渲染逻辑，但命令文档要保留这些说明。

## 验证

- **A**：重读改后的命令，确认它不再调 `render-all.mjs`、清楚驱动 d2 path、保留了 Step 3.5 Hook gate 和单集时长决策、Remotion 已标为 fallback。grep 确认命令里 d2 引用 > 0。
- **B**：用【现有】brainsandtennis 产物（`blog2video-output/brainsandtennis-2065190286519906657/`，已有 title_zh / source_blog / Hook）跑一次你新做的「d2 封面生成 + 截图」，产出 `video_1_cover_photo.png`，用 Read 工具目检：风格是否「终端霓影」、是否真正参数化（不是 brainsandtennis 硬编码）、字体生效、酸性绿每帧在场且辅助色 ≤1。不要碰 `video_1.mp4`。
- 完成后：git commit + push，并一句话总结改了哪些文件 + 验证结果。

不确定就先问，不要假设。
