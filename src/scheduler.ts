import * as fs from 'fs';
import * as path from 'path';
import {
  QueueMeta, VideoMeta, PublishRecord, CookieExpiredError,
  QUEUE_DIR, PUBLISHED_DIR,
  ensureDir, readJson, writeJson, log, logError, sleep,
  formatSGT, getNextSlot,
} from './utils';
import { publishToXiaohongshu } from './publish-xiaohongshu';
import { publishToWeixin } from './publish-weixin';
import { checkCookieValid } from './cookie-manager';
import { generateMeta } from './auto-meta';

// ============== Tag optimization ==============

async function optimizeTags(tags: string[], _platform: string): Promise<string[]> {
  // In production, this would use web_search to find trending tags
  // For now, return original tags with common high-traffic suffixes
  const optimized = [...tags];
  // Placeholder: real implementation would call an API or web search
  log(`[Tags] Using tags: ${optimized.map(t => '#' + t).join(' ')}`);
  return optimized;
}

// ============== Telegram notification ==============

async function notifyTelegram(message: string): Promise<void> {
  // Uses openclaw message tool via CLI, or can be called from the main agent
  log(`[Telegram] ${message}`);
  // The scheduler is designed to be run by openclaw which handles notifications
  // Write notification to a file that can be picked up
  const notifyPath = path.join(PUBLISHED_DIR, 'notifications.jsonl');
  fs.appendFileSync(notifyPath, JSON.stringify({ time: new Date().toISOString(), message }) + '\n');
}

// ============== Core scheduler ==============

interface ScheduleEntry {
  folder: string;
  video: VideoMeta;
  scheduledAt: Date;
  meta: QueueMeta;
}

async function scanQueue(): Promise<{ folder: string; meta: QueueMeta }[]> {
  ensureDir(QUEUE_DIR);
  const items: { folder: string; meta: QueueMeta }[] = [];

  const dirs = fs.readdirSync(QUEUE_DIR);
  for (const dir of dirs) {
    const fullDir = path.join(QUEUE_DIR, dir);
    if (!fs.statSync(fullDir).isDirectory()) continue;

    const metaPath = path.join(fullDir, 'meta.json');
    if (!fs.existsSync(metaPath)) {
      // Try to auto-generate meta.json
      log(`[Queue] No meta.json in ${dir}, attempting auto-generation...`);
      try {
        await generateMeta(fullDir);
      } catch (err) {
        logError(`[Queue] Failed to auto-generate meta.json for ${dir}`, err);
      }
      if (!fs.existsSync(metaPath)) {
        log(`[Queue] Skipping ${dir}: meta.json generation failed`);
        continue;
      }
    }

    try {
      const meta = readJson<QueueMeta>(metaPath);
      items.push({ folder: dir, meta });
    } catch (err) {
      logError(`Failed to read meta.json in ${dir}`, err);
    }
  }

  return items;
}

function buildSchedule(items: { folder: string; meta: QueueMeta }[]): ScheduleEntry[] {
  const now = new Date();
  const occupiedSlots = new Set<string>();
  const schedule: ScheduleEntry[] = [];

  // Load already-occupied slots from published records
  ensureDir(PUBLISHED_DIR);
  const publishedFiles = fs.readdirSync(PUBLISHED_DIR).filter(f => f.endsWith('.json'));
  for (const f of publishedFiles) {
    try {
      const record = readJson<PublishRecord>(path.join(PUBLISHED_DIR, f));
      if (record.publishedAt) {
        occupiedSlots.add(new Date(record.publishedAt).toISOString());
      }
    } catch { /* skip */ }
  }

  let nextSlotAfter = now;

  for (const item of items) {
    for (const video of item.meta.videos) {
      const slot = getNextSlot(nextSlotAfter, occupiedSlots);
      occupiedSlots.add(slot.toISOString());
      schedule.push({
        folder: item.folder,
        video,
        scheduledAt: slot,
        meta: item.meta,
      });
      nextSlotAfter = slot;
    }
  }

  return schedule;
}

async function publishVideo(entry: ScheduleEntry): Promise<void> {
  const folderPath = path.join(QUEUE_DIR, entry.folder);
  const videoPath = path.join(folderPath, entry.video.file);
  const coverPath = entry.video.cover ? path.join(folderPath, entry.video.cover) : undefined;

  if (!fs.existsSync(videoPath)) {
    throw new Error(`Video file not found: ${videoPath}`);
  }

  // Optimize tags
  const optimizedTags = await optimizeTags(entry.video.tags, 'all');
  const videoWithTags = { ...entry.video, tags: optimizedTags };

  // Publish to both platforms in parallel
  const results = await Promise.allSettled([
    publishToXiaohongshu(videoPath, videoWithTags, coverPath),
    publishToWeixin(videoPath, videoWithTags, coverPath),
  ]);

  const xhsResult = results[0];
  const wxResult = results[1];

  // Check for cookie errors
  for (const result of results) {
    if (result.status === 'rejected' && result.reason instanceof CookieExpiredError) {
      throw result.reason;
    }
  }

  // Record results
  const record: PublishRecord = {
    folder: entry.folder,
    video: entry.video,
    platform: 'all',
    publishedAt: new Date().toISOString(),
    success: xhsResult.status === 'fulfilled' && wxResult.status === 'fulfilled',
    error: [
      xhsResult.status === 'rejected' ? `XHS: ${xhsResult.reason}` : null,
      wxResult.status === 'rejected' ? `WX: ${wxResult.reason}` : null,
    ].filter(Boolean).join('; ') || undefined,
  };

  ensureDir(PUBLISHED_DIR);
  const recordFile = `${entry.folder}-${entry.video.file}-${Date.now()}.json`;
  writeJson(path.join(PUBLISHED_DIR, recordFile), record);

  if (record.success) {
    // Delete video file to save space
    if (fs.existsSync(videoPath)) fs.unlinkSync(videoPath);
    if (coverPath && fs.existsSync(coverPath)) fs.unlinkSync(coverPath);
    
    await notifyTelegram(`✅ Published: ${entry.video.title}\n小红书 ✓ | 视频号 ✓\n${formatSGT(new Date())}`);
  } else {
    await notifyTelegram(`⚠️ Partial publish: ${entry.video.title}\nXHS: ${xhsResult.status} | WX: ${wxResult.status}\n${record.error}`);
  }
}

async function runScheduler(): Promise<void> {
  log('=== Blog2Video Scheduler Started ===');

  // Check cookies first
  for (const platform of ['xiaohongshu', 'weixin'] as const) {
    const valid = await checkCookieValid(platform);
    if (!valid) {
      const msg = `🔐 ${platform} cookie 已过期，请扫码登录！\nRun: npm run login:${platform === 'xiaohongshu' ? 'xhs' : 'weixin'}`;
      await notifyTelegram(msg);
      logError(msg);
      return;
    }
    log(`✓ ${platform} cookie is valid`);
  }

  // Scan queue
  const items = await scanQueue();
  if (items.length === 0) {
    log('No items in queue. Exiting.');
    return;
  }
  log(`Found ${items.length} items in queue`);

  // Build schedule
  const schedule = buildSchedule(items);
  log(`Scheduled ${schedule.length} videos:`);
  for (const entry of schedule) {
    log(`  ${formatSGT(entry.scheduledAt)} - ${entry.video.title}`);
  }

  // Process scheduled items
  const now = new Date();
  for (const entry of schedule) {
    if (entry.scheduledAt.getTime() > now.getTime()) {
      const waitMs = entry.scheduledAt.getTime() - now.getTime();
      log(`Waiting ${Math.round(waitMs / 60000)} minutes for next slot: ${formatSGT(entry.scheduledAt)}`);
      await sleep(waitMs);
    }

    try {
      await publishVideo(entry);
    } catch (err) {
      if (err instanceof CookieExpiredError) {
        await notifyTelegram(`🔐 ${err.platform} cookie 过期！请扫码重新登录。`);
        logError(`Cookie expired for ${err.platform}, stopping scheduler`);
        return;
      }
      logError(`Failed to publish ${entry.video.title}`, err);
      await notifyTelegram(`❌ Failed: ${entry.video.title}\n${err instanceof Error ? err.message : err}`);
    }
  }

  log('=== Scheduler completed ===');
}

// Entry point
if (require.main === module) {
  runScheduler().catch(err => {
    logError('Scheduler crashed', err);
    process.exit(1);
  });
}

export { runScheduler, scanQueue, buildSchedule };
