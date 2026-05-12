---
name: wechat-video-publisher
description: Use when preparing, scheduling, publishing, or reviewing Blog2Video videos on WeChat Channels from Google Drive deliveries. Covers Drive intake, Google Sheet logging, schedule slots, source URL tracking, and Computer Use steps for the WeChat desktop 视频号助手 UI.
---

# WeChat Video Publisher

Use this skill for the Blog2Video -> 微信视频号 publishing workflow.

## Defaults

- Source Drive folder: `gdrive:blog2video/`
- Local staging: `queue/<source_slug>/`
- Publish log files: `published/wechat_publish_log.csv` and `published/wechat_publish_log.json`
- Queue manifest: `published/wechat_publish_queue.json`
- Config: `config/wechat-publisher.json`
- Time zone: Singapore, `Asia/Singapore`
- Schedule slots: `13:00` and `22:30`
- Collections: `aicoding` or `harness`
- Cover photo upload: required. Use `cover_file`, do not rely on WeChat's auto-selected video frame.
- Declare original: enabled by default. Check `声明原创`, accept the originality terms modal, then continue publishing.
- Final target: set scheduled publishing, then click publish so the item enters the WeChat scheduled publish queue.

## Intake

Run:

```bash
npm run build
npm run wechat:intake:init-log
npm run wechat:intake
```

The intake script:

1. Scans `gdrive:blog2video/`.
2. Downloads new delivery folders into `queue/`.
3. Reads `meta.json`, including `blog_url`.
4. Extracts the first narration paragraph from `video_N_script.md` as the hook.
5. Appends fixed tags.
6. Assigns `aicoding` or `harness`.
7. Schedules videos into `13:00` and `22:30` Singapore slots.
8. Writes rows with `source_blog_url`, `wechat_preview_url`, and `final_video_url` fields.

By default it only considers Drive folders modified in the last `3d`. Override with `BLOG2VIDEO_INTAKE_MAX_AGE`, for example `BLOG2VIDEO_INTAKE_MAX_AGE=12h npm run wechat:intake`.

Use `npm run wechat:intake:dry-run` before changing the queue if uncertain.

If intake fails with `didn't find section in config file ("gdrive")`, configure the local `rclone` Google Drive remote as `gdrive:` or use the Google Drive connector to fetch the target folder manually before running the WeChat UI step.

## Google Sheet

Keep a native Google Sheet in the Drive `blog2video/` folder. It should mirror `published/wechat_publish_log.csv`.

Required columns:

`source_slug`, `video_number`, `topic`, `source_blog_url`, `drive_folder`, `video_file`, `cover_file`, `script_file`, `subtitle_file`, `description`, `collection`, `scheduled_at_sgt`, `status`, `wechat_preview_url`, `final_video_url`, `error`, `created_at`, `updated_at`

After publishing, update:

- `status`: `scheduled`, `published`, `failed`, or `needs_review`
- `wechat_preview_url`: the WeChat preview URL when available
- `final_video_url`: final public video URL after it is visible
- `error`: any issue that needs manual review

## Computer Use WeChat Steps

Use WeChat desktop, not browser, because browser URLs may be blocked for Computer Use.

1. Open WeChat and enter 视频号.
2. Open the account page / 视频号助手.
3. Choose `发表视频`.
4. Upload `queue/<source_slug>/<video_file>`.
5. Fill `description`.
6. Upload `cover_file`:
   - Click `封面预览` -> `编辑`.
   - In `编辑封面`, click the dashed `上传封面` tile with the plus icon.
   - Select `queue/<source_slug>/<cover_file>`.
   - Wait until the uploaded cover is visible in the preview, then click `确认`.
   - If the uploaded cover is not visible, stop and mark the row `needs_review`; do not publish.
7. Select collection: `aicoding` or `harness`.
8. Select `定时` and set `scheduled_at_sgt`.
9. Check `声明原创`; if the originality rights modal appears, check the agreement box and click `声明原创`.
10. Before final publish, verify all four required UI states are present: custom cover preview, collection, scheduled time, and originality declaration.
11. Click the final publish button to enter the scheduled publish queue after user confirmation when required by Computer Use policy.
12. Record preview/final URL in the Google Sheet when available.

## Review

Daily review should read the last 14 days of rows and performance exports, then summarize:

- Best hooks and common language patterns.
- `aicoding` vs `harness` performance.
- `13:00` vs `22:30` performance.
- Follow-up experiments for next week.
