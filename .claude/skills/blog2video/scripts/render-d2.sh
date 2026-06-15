#!/bin/zsh
# render-d2.sh —— stage-6 d2 渲染: 逐场景 hyperframes 渲静音 clip → concat → 混入原始音频(不响度处理/不 -shortest)
#
# 用法:  ./render-d2.sh <output-dir> [video-number]
#   例:  .claude/skills/blog2video/scripts/render-d2.sh blog2video-output/loop-engineering 1
#
# 前置: <output-dir>/ 下已有
#   scenes-data.json            (build-scenes-data.mjs 产出,提供场景数 + 每段 dur)
#   scenes/scene-NN/index.html  (scene-generator + build-scene.mjs 产出的自包含场景)
#   video_N_audio.mp3           (tts.mjs 产出的原始音频,raw 不做任何响度处理)
# 产出:
#   clips/scene-NN.mp4          逐场景静音 clip(跳过已存在的,支持断点续渲)
#   renders/<slug>-silent.mp4   concat 后的静音整片(不投递)
#   video_N.mp4                 ★最终交付片(混音后)
#
# 不可推翻的技术决策(Phase 1 踩坑换来):
#   · 逐场景渲、不渲整片: >240s 合成超流式 encode → 8GB 必 OOM。每段静音 clip → concat → 一次混音。
#   · 串行渲(并发叠内存)+ NODE_OPTIONS=--max-old-space-size=5120 防 OOM;只用 MiSans+JetBrains Mono。
#   · 混音不做任何响度处理(CLAUDE.md NEVER 条款);不 -shortest(视频更长,保留 CTA 静音尾卡)。
#   · 帧吸附已在 build-scenes-data.mjs 做掉,逐 clip ceil 取整不累加 → 整片与口播零漂移。
# 注: 不用 `set -e` —— 渲染循环要"渲完全部、失败记 log、再统一校验",首段失败不该中断后续。
#     前置/缺件检查用显式 `|| exit 1`。
export PATH="/opt/homebrew/opt/node@22/bin:$PATH"   # node 必须 v22.x,否则渲染 OOM

OUT="${1:?usage: render-d2.sh <output-dir> [video-number]}"
VN="${2:-1}"
OUT="$(cd "$OUT" && pwd)"          # 转绝对路径
SLUG="$(basename "$OUT")"
cd "$OUT"

NODE_V="$(node -v)"
case "$NODE_V" in v22.*) ;; *) echo "✗ node=$NODE_V,必须 v22.x(否则渲染 OOM)。export PATH 见脚本头。"; exit 1;; esac

[ -f scenes-data.json ] || { echo "✗ 缺 scenes-data.json(先跑 build-scenes-data.mjs)"; exit 1; }
AUDIO="video_${VN}_audio.mp3"
[ -f "$AUDIO" ] || { echo "✗ 缺 $AUDIO(先跑 tts.mjs)"; exit 1; }

N=$(python3 -c "import json;print(len(json.load(open('scenes-data.json'))))")
echo "=== d2 render: $SLUG · $N 场景 · node=$NODE_V ==="

# 1) 逐场景串行渲(跳过已渲),进度/错误写 log
mkdir -p clips renders
LOG=render-progress.log; : > "$LOG"
echo "START $(date +%T)  node=$NODE_V  scenes=$N" >> "$LOG"
for n in $(seq -w 1 "$N"); do
  if [ -f "clips/scene-$n.mp4" ]; then echo "skip   scene-$n (exists)" >> "$LOG"; continue; fi
  [ -f "scenes/scene-$n/index.html" ] || { echo "✗ 缺 scenes/scene-$n/index.html"; exit 1; }
  t0=$(date +%s)
  NODE_OPTIONS="--max-old-space-size=5120" hyperframes render "scenes/scene-$n" -o "clips/scene-$n.mp4" --quiet > /dev/null 2>>render-errors.log
  rc=$?; t1=$(date +%s)
  dur=$(ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 "clips/scene-$n.mp4" 2>/dev/null)
  echo "render scene-$n rc=$rc  clip_dur=${dur:-FAIL}  took=$((t1-t0))s  $(date +%T)" >> "$LOG"
done
echo "DONE   $(date +%T)" >> "$LOG"

# 2) 校验全部 clip 在,并对 clip 时长 vs scenes-data(应 ≤1 帧)
echo "=== clip 校验 (clip_dur vs scenes-data.dur) ==="
python3 - "$N" <<'PY'
import json,subprocess,os,sys
N=int(sys.argv[1]); data=json.load(open('scenes-data.json')); tot=0; miss=0
for i,s in enumerate(data,1):
    f=f"clips/scene-{i:02d}.mp4"
    if not os.path.exists(f): print(f"  scene-{i:02d}  MISSING"); miss+=1; continue
    d=float(subprocess.run(["ffprobe","-v","error","-show_entries","format=duration","-of","default=noprint_wrappers=1:nokey=1",f],capture_output=True,text=True).stdout.strip())
    tot+=d
    print(f"  scene-{i:02d}  clip={d:7.3f}  data={s['dur']:7.3f}  Δ={d-s['dur']:+.3f}")
print(f"  TOTAL video ≈ {tot:.3f}s")
sys.exit(1 if miss else 0)
PY
[ $? -eq 0 ] || { echo "✗ 有 clip 缺失/渲染失败,见 render-errors.log,终止"; exit 1; }

# 3) concat → 静音整片(无损 -c copy)
echo "=== concat → silent master ==="
printf "file 'clips/scene-%02d.mp4'\n" $(seq 1 "$N") > concat.txt
ffmpeg -y -f concat -safe 0 -i concat.txt -c copy "renders/${SLUG}-silent.mp4" 2>&1 | tail -2

# 4) 混入原始音频(不响度处理 / 不 -shortest:视频更长,音频放完转静音,CTA 尾卡保留)→ 最终交付片
echo "=== mux audio (raw, no loudnorm, no -shortest) → video_${VN}.mp4 ==="
ffmpeg -y -i "renders/${SLUG}-silent.mp4" -i "$AUDIO" \
  -map 0:v -map 1:a -c:v copy -c:a aac -b:a 192k \
  "video_${VN}.mp4" 2>&1 | tail -2

# 5) 核验
echo "=== FINAL 核验 ==="
ffprobe -v error -show_entries format=duration:stream=codec_type,codec_name,width,height \
  -of default=noprint_wrappers=1 "video_${VN}.mp4"
echo "audio_dur=$(ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 "$AUDIO")"
ls -la "video_${VN}.mp4"
echo "✓ 交付片: $OUT/video_${VN}.mp4"
