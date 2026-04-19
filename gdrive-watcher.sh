#!/bin/bash
# gdrive-watcher.sh - Watch queue dir and auto-upload new folders to Google Drive
# Runs as a background service via systemd

QUEUE_DIR="/home/ubuntu/blog2video/queue"
UPLOAD_SCRIPT="/home/ubuntu/blog2video/sync-to-gdrive.sh"
LOG_FILE="/home/ubuntu/blog2video/logs/gdrive-watcher.log"

mkdir -p "$(dirname "$LOG_FILE")"

log() {
  echo "[$(date '+%Y-%m-%d %H:%M:%S')] $*" | tee -a "$LOG_FILE"
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

  # Wait for meta.json to exist (folder might still be writing)
  local retries=0
  while [ ! -f "$folder/meta.json" ] && [ $retries -lt 30 ]; do
    sleep 2
    retries=$((retries + 1))
  done

  if [ ! -f "$folder/meta.json" ]; then
    log "⚠️  No meta.json in $name after 60s, skipping"
    return
  fi

  # Extra wait to ensure all files are written
  sleep 5

  log "📤 New folder detected: $name — uploading to Google Drive..."
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
