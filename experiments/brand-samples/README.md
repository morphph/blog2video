# 品牌方向样片对比(HyperFrames 动画)

三支 **同内容、同口播、同字幕、同故事板** 的 40.6s 竖屏样片,只有视觉语言不同。
内容取自 loop-engineering video_1 开头(hook → 现状循环 → Boris 金句)。
目的:用真实成片对比三个品牌方向,替代过去「HTML 静态截图」的呈现方式。

技术栈:HeyGen HyperFrames 0.6.91(HTML + GSAP 逐帧确定性渲染),Node 22,音轨为 MiniMax TTS 原始输出(无响度处理)。

## 三个方向

| | d1 纸面信号 Paper Signal | d2 终端霓影 Terminal v2 | d3 高亮笔记 Highlighter Pop |
|---|---|---|---|
| 气质 | 暖编辑部·书卷·可信 | 精修暗色·开发者·工程感 | 明亮玩趣·大字报·停手指 |
| 背景 | 暖奶油 `#F6F2E9` | 暖近黑 `#121212` | 暖骨白 `#F2EFE6` |
| 签名色 | 陶土橙 `#D9603B` | 酸性黄绿 `#CCFF4D` | 荧光黄 `#FFD43A` |
| 大标题字体 | 思源宋体 Heavy | MiSans Heavy | 得意黑(倾斜) |
| 动效性格 | 编辑部式从容,零弹跳 | 工程式利落,打字机+光标 | 弹性贴纸,荧光笔实扫 |
| 适配考量 | 小红书暖色信任系 + 在暗色 AI 堆里差异化;视频号大龄友好 | 暗色仍被小红书推荐给 AI 内容;开发者身份最强;延续现有资产 | 小红书 CTR 杠杆全中;最停手指;视频号大龄接受度最低 |

各方向完整规格见各自目录的 `DESIGN.md`;共用故事板/时间轴/字幕表见 `BRIEF.md`。

## 成片

- `d1-paper-signal/renders/*.mp4`
- `d2-terminal-v2/renders/*.mp4`
- `d3-highlighter-pop/renders/*.mp4`
- 三方向并排对比:`compare-3up.mp4`(本目录)

## 复现

```bash
export PATH="/usr/local/opt/node@22/bin:$PATH"   # 需要 Node 22 + 全局 hyperframes 0.6.91
cd d1-paper-signal   # 或 d2 / d3
hyperframes lint && hyperframes snapshot --at 2,6,11,14,18,24,27,31,36,39.5 && hyperframes render --workers 2
```

字体文件(`*/assets/fonts/`)未入库(`.gitignore`),复现时需重新下载:
思源宋体(Adobe OFL)、MiSans(小米免费商用)、JetBrains Mono(OFL)、得意黑 SmileySans(OFL)。
