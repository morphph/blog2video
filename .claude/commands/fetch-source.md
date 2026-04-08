# /fetch-source — Fetch Source Content from URL

从给定的 URL 抓取源内容（博客、PDF、YouTube 视频、Twitter/X 长文章），输出干净的 Markdown 文本。

## 使用方式
```
/fetch-source <url-or-file>
```

支持的输入格式：
- **博客 URL** — `https://example.com/blog-post`
- **PDF** — 远程 URL（`https://.../*.pdf`）或本地路径（`./paper.pdf`）
- **YouTube 视频** — `https://www.youtube.com/watch?v=...` 或 `https://youtu.be/...`
- **Twitter/X 长文章** — `https://x.com/...` 或 `https://twitter.com/...`
- **本地文件** — 任意文本文件路径

## 执行步骤

读取输入参数 `$ARGUMENTS`，按以下顺序检测输入类型并抓取内容：

### a) YouTube 视频（参数包含 `youtube.com` 或 `youtu.be`）

1. 获取视频标题作为 slug：`yt-dlp --print title "<url>"` → 转为 kebab-case slug
2. 创建输出目录：`./blog2video-output/<slug>/`
3. 下载英文字幕（VTT格式）：`yt-dlp --write-auto-sub --sub-lang en --skip-download -o "./blog2video-output/<slug>/transcript" "<url>"`
4. 解析 `.vtt` 文件提取纯文本：用 Python 去掉 WEBVTT 头部、时间戳行、`<c>`/`<00:...>` 标签、重复行，只保留唯一的文字内容
5. 保存为 `./blog2video-output/<slug>/source_raw.md`
6. **Step 0.5 — Transcript Organizer subagent**：
   - 读取 `.claude/skills/blog2video/prompts/transcript-organizer.md` 获取 prompt
   - 调用 subagent 将 `source_raw.md` 整理为结构化 Markdown
   - 输出保存为 `./blog2video-output/<slug>/source_blog.md`

### b) PDF 文件（参数以 `.pdf` 结尾，不区分大小写）

1. 如果是远程 URL（以 `http` 开头）：下载文件 `curl -sL "<url>" -o "/tmp/source.pdf"`
2. 从文件名提取 slug
3. 创建输出目录：`./blog2video-output/<slug>/`
4. 使用 pdfminer 提取文本：`python3 -c "from pdfminer.high_level import extract_text; print(extract_text('<pdf-path>'))"`
5. 保存为 `./blog2video-output/<slug>/source_raw.md`
6. **Step 0.5 — PDF Cleaner subagent**（如果 pdfminer 输出较乱）：
   - 读取 `.claude/skills/blog2video/prompts/pdf-cleaner.md` 获取 prompt（如果存在）
   - 调用 subagent 清洗格式
   - 输出保存为 `./blog2video-output/<slug>/source_blog.md`
   - 如果没有 pdf-cleaner prompt，直接将 `source_raw.md` 复制为 `source_blog.md`

### c) Twitter/X（参数包含 `x.com` 或 `twitter.com`）

1. 从 URL 提取 slug（作者名-推文ID，如 `akshay-pachaar-2041146899319971922`）
2. 创建输出目录：`./blog2video-output/<slug>/`

3. **文本提取 — Fallback Chain**（按优先级顺序尝试，成功则停止）：

   **方法 A：Playwright MCP（最高精度）**
   如果 Playwright MCP 工具可用（`browser_navigate` 等工具存在）：
   - 调用 `browser_navigate` 打开 Twitter/X URL
   - 等待页面加载完成后，调用 `browser_snapshot` 获取页面无障碍树
   - 从无障碍树中提取推文正文、作者信息、日期
   - 如果检测到登录页面（内容包含 "Log in" / "Sign up" 且无推文正文），提示用户在弹出的浏览器窗口中登录 X，登录后重试
   - **成功判定**：提取到 >100 字符的实质性内容（排除 Twitter UI 样板文字如 "Log in", "Sign up", "Explore", "Repost", "Like"）
   - 成功后保存为 `source_raw.md`，记录 `method_used: "playwright_mcp"`

   **方法 B：WebFetch（内置工具，无需配置）**
   - 使用 WebFetch 工具获取页面内容，prompt 要求提取推文全文
   - **成功判定**：返回内容 >100 字符，且非纯登录/注册页面样板
   - 成功后保存为 `source_raw.md`，记录 `method_used: "webfetch"`

   **方法 C：Puppeteer 脚本（图片可靠，文字可能失败）**
   - 运行：`node blog2video-remotion/scripts/fetch-twitter.mjs "<url>" "./blog2video-output/<slug>/"`
   - 读取 `twitter_metadata.json` 检查 `paragraph_count`
   - **成功判定**：`paragraph_count >= 2`
   - 成功后记录 `method_used: "puppeteer"`
   - **注意**：即使文字提取失败，此步骤通常能成功下载图片到 `images/` 目录

   **方法 D：图片视觉转录（兜底方案）**
   如果上述方法均未提取到文字，但 `images/` 目录存在图片文件：
   - 对每张图片使用 Read 工具（多模态视觉）读取内容
   - 详细转录图片中可见的所有文字和图表内容
   - 将所有图片转录内容组合成 `source_raw.md`
   - 记录 `method_used: "image_transcription"`

   **方法 E：中止并提供指引**
   如果所有方法均失败且无图片可用：
   - 报错：「无法从此 Twitter/X URL 提取内容」
   - 建议：在浏览器中打开链接，手动复制文本粘贴到 `source_raw.md`

4. **确保图片已下载**：如果文本通过方法 A/B 提取成功但 `images/` 目录为空，额外运行 Puppeteer 脚本仅下载图片：`node blog2video-remotion/scripts/fetch-twitter.mjs "<url>" "./blog2video-output/<slug>/"`

5. 保存/更新 `twitter_metadata.json`（包含 `url`, `author`, `handle`, `method_used`, `paragraph_count`, `image_count`）

6. **Step 0.5 — Twitter Cleaner subagent**：
   - 读取 `.claude/skills/blog2video/prompts/twitter-cleaner.md` 获取 prompt
   - 调用 subagent 将原始文本清洗为干净 Markdown
   - 如果 `method_used` 为 `image_transcription`，在 subagent 指令中注明：输入来自图片视觉转录，需要重构自然行文流畅度
   - 输出保存为 `./blog2video-output/<slug>/source_blog.md`

### d) 博客 URL（参数以 `http` 开头，非 PDF、非 YouTube、非 Twitter/X）

1. 使用 `curl -sL` 获取页面 HTML
2. 从 URL 提取 slug
3. 创建输出目录：`./blog2video-output/<slug>/`
4. 将 HTML 转为干净的 Markdown：
   - 提取 `<article>` 或 `<main>` 或 `<body>` 内容
   - 移除导航、sidebar、footer 等非正文元素
   - 保留正文文本、标题层级、代码块、列表、图片引用
   - 图片 URL 保留为 Markdown 图片语法
5. 保存为 `./blog2video-output/<slug>/source_blog.md`

### e) 本地文件（其他情况）

1. 读取文件内容
2. 从文件名提取 slug
3. 创建输出目录：`./blog2video-output/<slug>/`
4. 复制内容为 `./blog2video-output/<slug>/source_blog.md`

## 完成后输出

1. 验证 `source_blog.md` 已生成且非空
2. 打印输出路径和内容摘要：
   - 文件路径
   - 文章标题（如果能从内容中提取）
   - 总字数/字符数
   - 是否包含图片
3. 显示 `source_blog.md` 的前 500 字符作为预览

## 注意事项

- 这个命令**只做内容抓取**，不进行视频生成
- 输出的 `source_blog.md` 可以直接作为 `/blog2video` 的输入使用
- 如果抓取失败，输出具体错误信息和建议（如网页需要 JS 渲染、PDF 加密等）
