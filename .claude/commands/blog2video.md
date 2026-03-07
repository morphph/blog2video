# /blog2video — Blog to Video Pipeline

将英文技术内容（博客、PDF文档、YouTube视频、GitHub仓库、Twitter/X文章）自动转化为中文口播视频（小红书/视频号风格）。

## 使用方式
```
/blog2video <URL>
```

## 流程

### 1. 内容抓取
- 用 WebFetch 抓取 URL 内容
- 如果是 Twitter/X 链接，提取推文全文
- 如果是 YouTube，提取视频描述和字幕
- 如果是博客/GitHub，提取正文

### 2. 生成脚本 (video_1_script.md)
- 用中文改写，口播风格（像给朋友讲故事）
- 目标字数：1020-1380 字（约5-6分钟口播）
- 包含 [SLIDE X] 标记，每个 slide 对应一个画面
- 开头要有吸引力的 hook
- 结尾要有总结和行动号召

### 3. 生成幻灯片配置 (video_1_config.json)
- 根据脚本的 [SLIDE X] 标记生成
- 每个 slide 包含：标题、要点、时长
- 风格：简洁有力，大字报风格

### 4. 输出
- 所有文件存到 queue/<slug>/ 目录下
- 包含：meta.json, source_blog.md, video_1_script.md

### 5. 通知
- 完成后告诉用户脚本已就绪
- 询问是否需要调整
