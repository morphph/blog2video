import * as fs from 'fs';
import * as path from 'path';
import { QUEUE_DIR, ensureDir, log, logError, formatSGT } from './utils';
import { generateMeta } from './auto-meta';

/**
 * Queue Watcher
 * 
 * Scans the queue directory for newly delivered video folders.
 * For each new delivery:
 * 1. Detects new folders (has .mp4 files but no publish_meta_generated_at in meta.json)
 * 2. Reads script.md + source_blog.md to generate publish-ready title/description/tags
 * 3. Writes a notification file for Claudiny to pick up and send to Bella
 * 
 * Designed to be run as a cron job (e.g., every 5 minutes)
 */

const WATCHER_STATE_FILE = path.join(QUEUE_DIR, '.watcher-state.json');
const NOTIFY_DIR = path.join(QUEUE_DIR, '.notifications');

interface WatcherState {
  knownFolders: string[];
  lastScanAt: string;
}

function loadState(): WatcherState {
  if (fs.existsSync(WATCHER_STATE_FILE)) {
    try {
      return JSON.parse(fs.readFileSync(WATCHER_STATE_FILE, 'utf-8'));
    } catch { /* ignore */ }
  }
  return { knownFolders: [], lastScanAt: '' };
}

function saveState(state: WatcherState): void {
  fs.writeFileSync(WATCHER_STATE_FILE, JSON.stringify(state, null, 2));
}

function writeNotification(folderName: string, meta: any): void {
  ensureDir(NOTIFY_DIR);
  const notifyFile = path.join(NOTIFY_DIR, `${folderName}-${Date.now()}.json`);
  fs.writeFileSync(notifyFile, JSON.stringify({
    type: 'new_delivery',
    folder: folderName,
    topic: meta.topic || '未知主题',
    videoCount: meta.videos?.length || 0,
    videos: (meta.videos || []).map((v: any) => ({
      file: v.file,
      title: v.title,
      description: v.description,
      tags: v.tags,
      cover: v.cover,
    })),
    detectedAt: new Date().toISOString(),
    publishMetaReady: !!meta.publish_meta_generated_at,
  }, null, 2));
  log(`[Watcher] Notification written: ${notifyFile}`);
}

async function scanForNewDeliveries(): Promise<void> {
  ensureDir(QUEUE_DIR);
  const state = loadState();

  const allEntries = fs.readdirSync(QUEUE_DIR);
  const folders = allEntries.filter(entry => {
    const fullPath = path.join(QUEUE_DIR, entry);
    if (!fs.statSync(fullPath).isDirectory()) return false;
    if (entry.startsWith('.')) return false;
    // Must have at least one .mp4 file
    const files = fs.readdirSync(fullPath);
    return files.some(f => f.toLowerCase().endsWith('.mp4'));
  });

  const newFolders = folders.filter(f => !state.knownFolders.includes(f));

  if (newFolders.length === 0) {
    log(`[Watcher] No new deliveries found. ${folders.length} known folders in queue.`);
    state.lastScanAt = new Date().toISOString();
    saveState(state);
    return;
  }

  log(`[Watcher] Found ${newFolders.length} new delivery(ies): ${newFolders.join(', ')}`);

  for (const folder of newFolders) {
    const folderPath = path.join(QUEUE_DIR, folder);

    try {
      // Check if meta.json needs publish info generated
      const metaPath = path.join(folderPath, 'meta.json');
      let meta: any = null;

      if (fs.existsSync(metaPath)) {
        meta = JSON.parse(fs.readFileSync(metaPath, 'utf-8'));
      }

      const needsPublishMeta = !meta?.publish_meta_generated_at &&
        (!meta?.videos?.every((v: any) => v.title && v.description && v.tags?.length > 0));

      if (needsPublishMeta) {
        log(`[Watcher] Generating publish meta for ${folder}...`);
        // Mark that we need publish meta
        if (meta && fs.existsSync(metaPath)) {
          meta._needs_publish_meta = true;
          fs.writeFileSync(metaPath, JSON.stringify(meta, null, 2));
        }
        await generateMeta(folderPath);
      }

      // Re-read meta after generation
      if (fs.existsSync(metaPath)) {
        meta = JSON.parse(fs.readFileSync(metaPath, 'utf-8'));
      }

      // Write notification for Claudiny
      writeNotification(folder, meta || {});

      // Add to known folders
      state.knownFolders.push(folder);
      log(`[Watcher] ✓ Processed ${folder}`);

    } catch (err) {
      logError(`[Watcher] Failed to process ${folder}`, err);
      // Still add to known to avoid re-processing broken folders
      state.knownFolders.push(folder);
    }
  }

  state.lastScanAt = new Date().toISOString();
  saveState(state);
  log(`[Watcher] Scan complete. Total known folders: ${state.knownFolders.length}`);
}

// ============== Read pending notifications ==============

export function readPendingNotifications(): any[] {
  ensureDir(NOTIFY_DIR);
  const files = fs.readdirSync(NOTIFY_DIR).filter(f => f.endsWith('.json')).sort();
  const notifications: any[] = [];

  for (const file of files) {
    try {
      const data = JSON.parse(fs.readFileSync(path.join(NOTIFY_DIR, file), 'utf-8'));
      notifications.push({ ...data, _file: file });
    } catch { /* skip */ }
  }

  return notifications;
}

export function clearNotification(fileName: string): void {
  const filePath = path.join(NOTIFY_DIR, fileName);
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
  }
}

// Entry point
if (require.main === module) {
  scanForNewDeliveries().catch(err => {
    logError('[Watcher] Crashed', err);
    process.exit(1);
  });
}

export { scanForNewDeliveries };
