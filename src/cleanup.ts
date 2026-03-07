import * as fs from 'fs';
import * as path from 'path';
import { QUEUE_DIR, PUBLISHED_DIR, ensureDir, log } from './utils';

/**
 * Cleanup old video files to save disk space.
 * 
 * Rules:
 * - Published videos: delete mp4/mp3/png files after 7 days, keep meta.json
 * - Queue folders with all videos published: archive meta.json to published/, delete folder
 */

const MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

export function cleanupOldFiles(): void {
  ensureDir(QUEUE_DIR);
  ensureDir(PUBLISHED_DIR);

  const now = Date.now();
  const dirs = fs.readdirSync(QUEUE_DIR);

  for (const dir of dirs) {
    const fullDir = path.join(QUEUE_DIR, dir);
    if (!fs.statSync(fullDir).isDirectory()) continue;
    if (dir.startsWith('.')) continue;

    const metaPath = path.join(fullDir, 'meta.json');
    if (!fs.existsSync(metaPath)) continue;

    // Check folder age
    const stat = fs.statSync(fullDir);
    const ageMs = now - stat.mtimeMs;

    if (ageMs < MAX_AGE_MS) continue;

    // Check if all videos are gone (already published and deleted)
    const files = fs.readdirSync(fullDir);
    const mp4Files = files.filter(f => f.endsWith('.mp4'));

    if (mp4Files.length === 0) {
      // No videos left, archive meta and remove folder
      const archivePath = path.join(PUBLISHED_DIR, `${dir}-meta.json`);
      fs.copyFileSync(metaPath, archivePath);

      // Remove entire folder
      fs.rmSync(fullDir, { recursive: true });
      log(`[Cleanup] Archived and removed: ${dir}`);
    } else {
      // Videos still present after 7 days — likely failed to publish
      // Delete large media files, keep meta
      let freedBytes = 0;
      for (const file of files) {
        if (file.endsWith('.mp4') || file.endsWith('.mp3') || file.endsWith('.wav')) {
          const filePath = path.join(fullDir, file);
          freedBytes += fs.statSync(filePath).size;
          fs.unlinkSync(filePath);
        }
      }
      if (freedBytes > 0) {
        log(`[Cleanup] Deleted media from ${dir}, freed ${Math.round(freedBytes / 1024 / 1024)}MB`);
      }
    }
  }
}

if (require.main === module) {
  cleanupOldFiles();
}
