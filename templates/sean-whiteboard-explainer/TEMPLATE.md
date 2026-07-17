---
title: Sean's AI Stories — whiteboard explainer (style reference)
source: https://www.youtube.com/watch?v=GrNbuWWJYiI
channel: Sean's AI Stories (@SeanAIStories)
status: production
---

# 模板卡 — Sean 白板讲解(sean-whiteboard-explainer)

一支真实参照视频,逆向拆成两半:`transcript.md`(旁白口吻/结构靶子)+ `visual-style-prompt.md`(视觉 DNA),另附 `captions.srt`(原始时间轴字幕)。

## The essence to reproduce (don't lose these)

- **Single continuous Excalidraw canvas**, hand-drawn/sketchy style — not slides, not polished corporate graphics.
- **Color system**: red/orange handwritten section titles, orange dashed grouping borders, pink/coral central nodes (`#FFB3B3`), green input/output nodes (`#B2F2BB`), gray database cylinders, black arrows. Full palette in `visual-style-prompt.md`.
- **Zoom-and-pan** across one big diagram as each concept is explained; progressive reveal. No hard cuts.
- **Narration**: solo presenter, conversational-but-knowledgeable, one running concrete example throughout, analogies over jargon.
- **Format**: the "*You Can Learn X in N Min*" framing — a whole system built from simple blocks, non-technical-friendly.

## What is NOT part of the style target

The webcam picture-in-picture and the presenter's face are in the reference but are
**out of scope** for an automated pipeline — reproduce the whiteboard + narration + captions,
not a talking head. (If the skill later adds an avatar, that's a separate decision.)

## 生产件指针(status: production)

wb-kit(`.claude/skills/blog2video/design/wb-kit/`)· 旁白 prompt `script-writer-tutor.md` · `render-wb` verb · WF1 lane=whiteboard

## 冻结副本

content-ops 仓库根目录的 `example_transcript.md` / `example_visual-style-prompt.md` 是本模板的冻结副本(wb-kit 建设时的验收基准,spec 在引用,勿动勿删)。
