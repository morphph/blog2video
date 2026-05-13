# WeChat Video Publisher Workflow

This workflow turns delivered `gdrive:blog2video/<slug>/` folders into scheduled WeChat Channels posts.

## Data Flow

Configuration lives in `config/wechat-publisher.json`.

1. `npm run wechat:intake` scans `gdrive:blog2video/`.
2. New folders are downloaded to `queue/<slug>/`.
3. `meta.json` supplies `topic`, `blog_url`, `source`, and per-video file names.
4. `video_N_script.md` supplies the first narration paragraph used as the WeChat description hook.
5. Fixed tags are appended.
6. The row is written to:
   - `published/wechat_publish_log.json`
   - `published/wechat_publish_log.csv`
   - `published/wechat_publish_queue.json`
7. Codex uses Computer Use on WeChat desktop to upload the video, upload the custom cover photo, schedule, check `声明原创`, and publish.
8. Google Sheet mirrors the CSV and adds preview/final URL updates.

The intake scan now persists `published/wechat_intake_state.json` with the last successful sync time plus seen folder modtimes. On normal runs it prefers "folders modified since the last successful intake" instead of relying only on the CSV log. If no state file exists yet, it falls back to Drive folders modified in the last `3d`. Set `BLOG2VIDEO_INTAKE_MAX_AGE` to tune that bootstrap/backfill window.

The CLI expects an `rclone` remote named `gdrive:`. If the local machine does not have that remote, or the machine temporarily cannot resolve Google hosts such as `www.googleapis.com`, Drive scanning will fail before any queue mutation. In that case, restore network/DNS first, or use the Google Drive connector to stage the folder manually.

`npm run wechat:intake:dry-run` now copies candidate folders into a temporary local directory before parsing `meta.json`, so it can validate truly new remote folders instead of only whatever already exists under `queue/`.

## Schedule

All times are Singapore time.

- Slot 1: `13:00`
- Slot 2: `22:30`

If a slot is already occupied or has passed, the next available slot is used.

## Sheet Columns

The Google Sheet must include:

- `source_slug`
- `video_number`
- `topic`
- `source_blog_url`
- `drive_folder`
- `video_file`
- `cover_file`
- `script_file`
- `subtitle_file`
- `description`
- `collection`
- `scheduled_at_sgt`
- `status`
- `wechat_preview_url`
- `final_video_url`
- `error`
- `created_at`
- `updated_at`

## Status Values

- `queued`: intake prepared the video.
- `staged`: files are ready and UI publishing is next.
- `scheduled`: WeChat accepted the scheduled publish.
- `published`: final public URL has been recorded.
- `failed`: publishing failed; see `error`.
- `needs_review`: manual decision needed.

## Notes

WeChat Channels does not have a reliable public publishing API for this workflow, so the final publishing step uses WeChat desktop and Computer Use. Keep deterministic work in scripts; use UI automation only for the WeChat form.

`upload_cover_photo` is enabled by default in `config/wechat-publisher.json`. During UI publishing, click `封面预览` -> `编辑`, choose the dashed `上传封面` tile, upload the delivered `cover_file`, confirm the preview, and only then continue. If the custom cover is not visible in the preview, stop and mark the row `needs_review`.

`declare_original` is enabled by default in `config/wechat-publisher.json`. During UI publishing, check `声明原创`; when WeChat shows the originality rights modal, accept the agreement and confirm the declaration before clicking `发表`.

The native Google Sheet is configured at `config/wechat-publisher.json.google_sheet_url`.
