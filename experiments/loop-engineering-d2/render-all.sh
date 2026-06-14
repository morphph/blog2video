#!/bin/zsh
# 逐场景串行渲染(8GB 内存安全)。跳过已存在的 clip。进度写 render-progress.log。
export PATH="/opt/homebrew/opt/node@22/bin:$PATH"
cd /Users/yufanp/Desktop/Project/blog2video/experiments/loop-engineering-d2
mkdir -p clips
LOG=render-progress.log
: > "$LOG"
echo "START $(date +%T)  node=$(node -v)" >> "$LOG"
for n in $(seq -w 1 25); do
  if [ -f "clips/scene-$n.mp4" ]; then
    echo "skip   scene-$n (exists)" >> "$LOG"; continue
  fi
  t0=$(date +%s)
  NODE_OPTIONS="--max-old-space-size=5120" hyperframes render "scenes/scene-$n" -o "clips/scene-$n.mp4" --quiet > /dev/null 2>>render-errors.log
  rc=$?
  t1=$(date +%s)
  dur=$(ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 "clips/scene-$n.mp4" 2>/dev/null)
  echo "render scene-$n rc=$rc  clip_dur=${dur:-FAIL}  took=$((t1-t0))s  $(date +%T)" >> "$LOG"
done
echo "DONE   $(date +%T)" >> "$LOG"
