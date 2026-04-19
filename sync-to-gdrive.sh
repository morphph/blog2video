#!/bin/bash
# sync-to-gdrive.sh - Upload a video folder to Google Drive (blog2video)
# Usage: ./sync-to-gdrive.sh /path/to/queue/folder-name

set -euo pipefail

FOLDER="${1:-}"
if [ -z "$FOLDER" ]; then
  echo "Usage: $0 /path/to/queue/folder"
  exit 1
fi

if [ ! -d "$FOLDER" ]; then
  echo "❌ Error: $FOLDER is not a directory"
  exit 1
fi

FOLDER_NAME=$(basename "$FOLDER")
GDRIVE_DEST="gdrive:blog2video/${FOLDER_NAME}"

echo "📤 Uploading: $FOLDER_NAME → $GDRIVE_DEST"

rclone copy "$FOLDER" "$GDRIVE_DEST" \
  --progress \
  --transfers 4 \
  --checkers 8 \
  --retries 3 \
  --log-level INFO

echo "✅ Done: $FOLDER_NAME uploaded to Google Drive"
