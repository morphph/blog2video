#!/bin/bash
# Auto-deliver rendered video to EC2 Claudiny queue
# Called by PostToolUse hook after render-all.mjs completes
set -euo pipefail

INPUT=$(cat)
CMD=$(echo "$INPUT" | jq -r '.tool_input.command // ""')

# Only trigger on render-all.mjs commands
echo "$CMD" | grep -q "render-all.mjs" || exit 0

# Extract output dir path from command
OUTPUT_DIR=$(echo "$CMD" | grep -oE '/[^ "]*blog2video-output/[a-zA-Z0-9_-]+' | head -1)
if [ -z "$OUTPUT_DIR" ]; then
  OUTPUT_DIR=$(echo "$CMD" | grep -oE 'blog2video-output/[a-zA-Z0-9_-]+' | head -1)
  [ -n "$OUTPUT_DIR" ] && OUTPUT_DIR="$(cd "$(dirname "$0")/.." && pwd)/$OUTPUT_DIR"
fi

SLUG=$(basename "$OUTPUT_DIR")

# Must have meta.json and at least one mp4
[ -f "$OUTPUT_DIR/meta.json" ] || exit 0
ls "$OUTPUT_DIR"/video_*.mp4 >/dev/null 2>&1 || exit 0

SERVER="ubuntu@54.172.152.187"
QUEUE="/home/ubuntu/blog2video/queue"

ssh -o ConnectTimeout=5 "$SERVER" "mkdir -p $QUEUE/$SLUG" 2>/dev/null || exit 0

for f in "$OUTPUT_DIR"/video_*.mp4 \
         "$OUTPUT_DIR"/video_*_cover_photo.png \
         "$OUTPUT_DIR"/video_*_script.md \
         "$OUTPUT_DIR"/video_*_audio.vtt \
         "$OUTPUT_DIR"/source_blog.md \
         "$OUTPUT_DIR"/meta.json; do
  [ -f "$f" ] && scp -o ConnectTimeout=5 "$f" "$SERVER:$QUEUE/$SLUG/" 2>/dev/null
done

echo "{\"systemMessage\": \"Video delivered to Claudiny queue ($SLUG)\"}"
