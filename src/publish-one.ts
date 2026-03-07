import * as path from 'path';
import * as fs from 'fs';
import { publishToXiaohongshu } from './publish-xiaohongshu';
import { log, logError, QUEUE_DIR } from './utils';

/**
 * Publish a single video to xiaohongshu only.
 * Usage: node dist/publish-one.js <folder> <video_number>
 */

async function main() {
  const folder = process.argv[2];
  const videoNum = parseInt(process.argv[3], 10);

  if (!folder || isNaN(videoNum)) {
    console.error('Usage: node dist/publish-one.js <folder> <video_number>');
    process.exit(1);
  }

  const dir = path.join(QUEUE_DIR, folder);
  const metaPath = path.join(dir, 'meta.json');

  if (!fs.existsSync(metaPath)) {
    console.error(`meta.json not found in ${dir}`);
    process.exit(1);
  }

  const meta = JSON.parse(fs.readFileSync(metaPath, 'utf-8'));
  const video = meta.videos[videoNum - 1];

  if (!video) {
    console.error(`Video ${videoNum} not found in meta.json`);
    process.exit(1);
  }

  const videoPath = path.join(dir, video.file);
  const coverPath = video.cover ? path.join(dir, video.cover) : undefined;

  log(`Publishing to 小红书: ${video.title}`);

  try {
    await publishToXiaohongshu(videoPath, video, coverPath);
    log(`✅ 小红书发布成功: ${video.title}`);
  } catch (err) {
    logError(`❌ 小红书发布失败: ${video.title}`, err);
    process.exit(1);
  }
}

main().catch(err => {
  logError('Publish failed', err);
  process.exit(1);
});
