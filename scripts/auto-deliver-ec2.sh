#!/bin/bash
# Auto-deliver rendered video to EC2 Claudiny queue
# Called by PostToolUse hook after render-all.mjs completes
# Works from both local Mac and VPS (EC2) sessions
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

QUEUE="/home/ubuntu/blog2video/queue"
SERVER_IP="54.172.152.187"

# Detect if running on the EC2 server itself (VPS mode)
LOCAL_IP=$(hostname -I 2>/dev/null | tr ' ' '\n' | head -1 || echo "")
PRIVATE_IP="172.31.93.57"

if [ "$LOCAL_IP" = "$PRIVATE_IP" ] || [ "$LOCAL_IP" = "$SERVER_IP" ] || [ "$(whoami)" = "ubuntu" -a -d "$QUEUE" ]; then
  # Running on EC2 — local copy
  mkdir -p "$QUEUE/$SLUG"
  for f in "$OUTPUT_DIR"/video_*.mp4 \
           "$OUTPUT_DIR"/video_*_cover_photo.png \
           "$OUTPUT_DIR"/video_*_script.md \
           "$OUTPUT_DIR"/video_*_audio.vtt \
           "$OUTPUT_DIR"/source_blog.md \
           "$OUTPUT_DIR"/meta.json; do
    [ -f "$f" ] && cp "$f" "$QUEUE/$SLUG/"
  done
else
  # Running remotely — SCP to EC2
  SERVER="ubuntu@$SERVER_IP"
  ssh -o ConnectTimeout=5 "$SERVER" "mkdir -p $QUEUE/$SLUG" 2>/dev/null || exit 0
  for f in "$OUTPUT_DIR"/video_*.mp4 \
           "$OUTPUT_DIR"/video_*_cover_photo.png \
           "$OUTPUT_DIR"/video_*_script.md \
           "$OUTPUT_DIR"/video_*_audio.vtt \
           "$OUTPUT_DIR"/source_blog.md \
           "$OUTPUT_DIR"/meta.json; do
    [ -f "$f" ] && scp -o ConnectTimeout=5 "$f" "$SERVER:$QUEUE/$SLUG/" 2>/dev/null
  done
fi

echo "{\"systemMessage\": \"Video delivered to Claudiny queue ($SLUG)\"}"
