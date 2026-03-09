# /blog2video-render — Render video from existing config

Run TTS + Remotion render from existing script and slide config. No subagents needed.

## 使用方式
```
/blog2video-render <output-dir> [video-number]
```

例如：
```
/blog2video-render ./blog2video-output/effective-harnesses-for-long-running-agents/
/blog2video-render ./blog2video-output/effective-harnesses-for-long-running-agents/ 1
```

## 参数解析

`$ARGUMENTS` 格式：`<output-dir> [video-number]`
- `output-dir`：blog2video-output 下的输出目录路径
- `video-number`：可选。如果省略，渲染目录下所有视频。

## 执行步骤

### 如果指定了 video-number：渲染单个视频

1. 确认 `<output-dir>/video_<N>_script.md` 和 `<output-dir>/video_<N>_config.json` 存在
2. 执行 TTS：
```bash
cd blog2video-remotion
node scripts/tts.mjs "<output-dir>/video_<N>_script.md" "<output-dir>/video_<N>_audio.mp3"
```
3. 复制 config 到 Remotion：
```bash
cp "<output-dir>/video_<N>_config.json" blog2video-remotion/src/data/video_config.json
```
4. 复制音频到 Remotion public：
```bash
cp "<output-dir>/video_<N>_audio.mp3" blog2video-remotion/public/video_<N>_audio.mp3
```
5. 计算总帧数，执行 Remotion 渲染：
```bash
cd blog2video-remotion
npx remotion render BlogVideo "<output-dir>/video_<N>.mp4" --props='<config JSON>' --frames=0-<totalFrames-1>
```

### 如果未指定 video-number：渲染所有视频

使用批量渲染脚本：
```bash
cd blog2video-remotion
node scripts/render-all.mjs "<output-dir>"
```

### 完成后

打印渲染结果：
- 每个视频的文件路径和大小
- 总时长

如果渲染失败但 TTS 成功，报告错误但保留已生成的音频文件。
