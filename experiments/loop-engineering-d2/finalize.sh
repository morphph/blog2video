#!/bin/zsh
# 校验所有 clip → concat 成静音整片 → 混入完整音频(不 -shortest,视频为主轨,保留 5s 静音尾卡)→ ffprobe 核验
export PATH="/opt/homebrew/opt/node@22/bin:$PATH"
cd /Users/yufanp/Desktop/Project/blog2video/experiments/loop-engineering-d2
mkdir -p renders

# 1) 校验 25 个 clip 都在,并打印每个时长 vs brief
echo "=== clip 校验 ==="
miss=0
python3 - <<'PY'
import json,subprocess,os
data=json.load(open('scenes-data.json'))
tot=0
for i,s in enumerate(data,1):
    f=f"clips/scene-{i:02d}.mp4"
    if not os.path.exists(f):
        print(f"  scene-{i:02d}  MISSING"); continue
    d=float(subprocess.run(["ffprobe","-v","error","-show_entries","format=duration","-of","default=noprint_wrappers=1:nokey=1",f],capture_output=True,text=True).stdout.strip())
    tot+=d
    print(f"  scene-{i:02d}  clip={d:7.3f}  brief={s['dur']:7.3f}  Δ={d-s['dur']:+.3f}")
print(f"  TOTAL video ≈ {tot:.3f}s")
PY
for n in $(seq -w 1 25); do [ -f "clips/scene-$n.mp4" ] || { echo "ABORT: clips/scene-$n.mp4 missing"; miss=1; }; done
[ "$miss" = "1" ] && exit 1

# 2) concat 列表(顺序)
printf "file 'clips/scene-%02d.mp4'\n" $(seq 1 25) > concat.txt

# 3) concat → 静音整片(同编码参数,-c copy 无损拼接)
echo "=== concat → silent master ==="
ffmpeg -y -f concat -safe 0 -i concat.txt -c copy renders/loop-engineering-d2-silent.mp4 2>&1 | tail -2

# 4) 混入完整音频(不 -shortest:视频更长,音频放完转静音,CTA 尾卡保留)
echo "=== mux audio → FINAL ==="
ffmpeg -y -i renders/loop-engineering-d2-silent.mp4 -i full_audio.mp3 \
  -map 0:v -map 1:a -c:v copy -c:a aac -b:a 192k \
  renders/loop-engineering-d2-FINAL.mp4 2>&1 | tail -2

# 5) 核验
echo "=== FINAL 核验 ==="
ffprobe -v error -show_entries format=duration:stream=codec_type,codec_name,width,height \
  -of default=noprint_wrappers=1 renders/loop-engineering-d2-FINAL.mp4
echo "audio_dur=$(ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 full_audio.mp3)"
ls -la renders/loop-engineering-d2-FINAL.mp4
