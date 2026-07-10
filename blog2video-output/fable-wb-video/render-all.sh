#!/bin/zsh
# render-all.sh — 8 场高质量渲染 → concat → 混 narration 音轨。幂等:已渲且时长合格的场景跳过。
set -e
cd "${0:A:h}"

durations=$(python3 -c "
import json
for m in json.load(open('manifest.json')): print(m['scene'], m['duration'])")

echo "$durations" | while read n dur; do
  nn=$(printf '%02d' $n)
  out="scene-$nn.mp4"
  if [ -s "$out" ]; then
    have=$(ffprobe -v error -show_entries format=duration -of csv=p=0 "$out")
    if python3 -c "import sys; sys.exit(0 if abs($have-$dur)<0.2 else 1)"; then
      echo "SKIP scene $nn (already $have s)"; continue
    fi
  fi
  echo "RENDER scene $nn (target ${dur}s)"
   npx hyperframes render "scene-$nn" --quality high --output "$out" < /dev/null 2>&1 | tail -2
  have=$(ffprobe -v error -show_entries format=duration -of csv=p=0 "$out")
  python3 -c "import sys; ok=abs($have-$dur)<0.2; print(f'scene $nn: {$have}s vs {$dur}s ->', 'OK' if ok else 'DURATION MISMATCH'); sys.exit(0 if ok else 1)"
done

: > concat.txt
for n in 01 02 03 04 05 06 07 08; do echo "file 'scene-$n.mp4'" >> concat.txt; done
ffmpeg -y -v error -f concat -safe 0 -i concat.txt -c copy video_silent.mp4
vdur=$(ffprobe -v error -show_entries format=duration -of csv=p=0 video_silent.mp4)
echo "concat done: ${vdur}s"
ffmpeg -y -v error -i video_silent.mp4 -i audio.mp3 \
  -filter_complex "[1:a]apad[a]" -map 0:v -map "[a]" \
  -c:v copy -c:a aac -b:a 192k -t "$vdur" fable-finding-your-unknowns-wb.mp4
ffprobe -v error -show_entries format=duration -of csv=p=0 fable-finding-your-unknowns-wb.mp4
echo "✅ fable-finding-your-unknowns-wb.mp4"
