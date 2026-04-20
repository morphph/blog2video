#!/bin/bash
# gdrive-watcher.sh - Watch queue dir and auto-upload new folders to Google Drive
# Runs as a background service via systemd

QUEUE_DIR="/home/ubuntu/blog2video/queue"
UPLOAD_SCRIPT="/home/ubuntu/blog2video/sync-to-gdrive.sh"
LOG_FILE="/home/ubuntu/blog2video/logs/gdrive-watcher.log"

mkdir -p "$(dirname "$LOG_FILE")"

log() {
  echo "[$(date '+%Y-%m-%d %H:%M:%S')] $*" >> "$LOG_FILE" 2>&1
}

log "🚀 gdrive-watcher started, watching: $QUEUE_DIR"

# Track already-uploaded folders
UPLOADED_STATE="/home/ubuntu/blog2video/.gdrive-uploaded"
touch "$UPLOADED_STATE"

upload_if_new() {
  local folder="$1"
  local name
  name=$(basename "$folder")

  # Skip if already uploaded
  if grep -qxF "$name" "$UPLOADED_STATE" 2>/dev/null; then
    return
  fi

  # Check for meta marker file (support both formats)
  local marker=""
  local retries=0
  while [ $retries -lt 30 ]; do
    if [ -f "$folder/meta.json" ]; then
      marker="meta.json"
      break
    elif [ -f "$folder/wechat_meta.json" ]; then
      marker="wechat_meta.json"
      break
    fi
    sleep 2
    retries=$((retries + 1))
  done

  if [ -z "$marker" ]; then
    log "⚠️  No meta.json or wechat_meta.json in $name after 60s, skipping"
    return
  fi

  # Wait for at least one .mp4 file to exist and be stable
  retries=0
  while [ $retries -lt 60 ]; do
    if ls "$folder"/*.mp4 &>/dev/null; then
      # Check no file is still being written (size stable for 3s)
      local size1=$(du -sb "$folder" 2>/dev/null | cut -f1)
      sleep 3
      local size2=$(du -sb "$folder" 2>/dev/null | cut -f1)
      if [ "$size1" = "$size2" ] && [ "$size1" -gt 0 ]; then
        break
      fi
    fi
    sleep 2
    retries=$((retries + 1))
  done

  log "📤 New folder detected: $name (marker: $marker) — uploading to Google Drive..."
  if "$UPLOAD_SCRIPT" "$folder" >> "$LOG_FILE" 2>&1; then
    echo "$name" >> "$UPLOADED_STATE"
    log "✅ Uploaded: $name"
  else
    log "❌ Upload failed: $name"
  fi
}

# First pass: upload any existing folders not yet uploaded
for folder in "$QUEUE_DIR"/*/; do
  [ -d "$folder" ] && upload_if_new "$folder"
done

# Watch for new folders
inotifywait -m -e create -e moved_to --format '%w%f' "$QUEUE_DIR" 2>/dev/null | while read -r path; do
  if [ -d "$path" ]; then
    upload_if_new "$path"
  fi
done
