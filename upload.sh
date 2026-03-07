#!/bin/bash
# upload.sh - Upload video folder to blog2video server queue
# Usage: ./upload.sh /path/to/video/folder
# 
# The folder should contain:
#   - meta.json (required)
#   - *.mp4 video files
#   - *.jpg cover images (optional)

set -euo pipefail

# ========== Configuration ==========
SERVER_USER="${B2V_SERVER_USER:-ubuntu}"
SERVER_HOST="${B2V_SERVER_HOST:-172.31.93.57}"
SERVER_PORT="${B2V_SERVER_PORT:-22}"
SERVER_QUEUE_DIR="${B2V_QUEUE_DIR:-/home/ubuntu/blog2video/queue}"
SSH_KEY="${B2V_SSH_KEY:-~/.ssh/id_rsa}"
# ====================================

if [ $# -lt 1 ]; then
  echo "Usage: $0 /path/to/video/folder"
  echo ""
  echo "Environment variables:"
  echo "  B2V_SERVER_HOST  Server IP/hostname (required)"
  echo "  B2V_SERVER_USER  SSH user (default: ubuntu)"
  echo "  B2V_SERVER_PORT  SSH port (default: 22)"
  echo "  B2V_QUEUE_DIR    Remote queue dir (default: /home/ubuntu/blog2video/queue)"
  echo "  B2V_SSH_KEY      SSH key path (default: ~/.ssh/id_rsa)"
  exit 1
fi

FOLDER="$1"
FOLDER_NAME=$(basename "$FOLDER")

if [ ! -d "$FOLDER" ]; then
  echo "❌ Error: $FOLDER is not a directory"
  exit 1
fi

if [ ! -f "$FOLDER/meta.json" ]; then
  echo "❌ Error: $FOLDER/meta.json not found"
  exit 1
fi

if [ "$SERVER_HOST" = "your-server-ip" ]; then
  echo "❌ Error: Set B2V_SERVER_HOST environment variable"
  echo "  export B2V_SERVER_HOST=1.2.3.4"
  exit 1
fi

echo "📦 Uploading: $FOLDER_NAME"
echo "   → ${SERVER_USER}@${SERVER_HOST}:${SERVER_QUEUE_DIR}/${FOLDER_NAME}/"

# Create remote directory
ssh -i "$SSH_KEY" -p "$SERVER_PORT" "${SERVER_USER}@${SERVER_HOST}" \
  "mkdir -p ${SERVER_QUEUE_DIR}/${FOLDER_NAME}"

# Upload files
scp -i "$SSH_KEY" -P "$SERVER_PORT" -r \
  "$FOLDER"/* \
  "${SERVER_USER}@${SERVER_HOST}:${SERVER_QUEUE_DIR}/${FOLDER_NAME}/"

echo "✅ Uploaded successfully!"
echo "   Videos will be auto-scheduled for publishing."
