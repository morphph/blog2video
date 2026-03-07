import * as path from 'path';
import { publishToXiaohongshu } from './publish-xiaohongshu';
import { log, sleep } from './utils';

async function retryFailed() {
  const queueDir = path.resolve(__dirname, '..', 'queue');

  const failed = [
    { series: 'obsidian-claude-code-life', idx: 0 }, // video_1
    { series: 'obsidian-claude-code-life', idx: 2 }, // video_3
  ];

  for (const { series, idx } of failed) {
    const metaPath = path.join(queueDir, series, 'meta.json');
    const meta = require(metaPath);
    const video = meta.videos[idx];
    const videoPath = path.join(queueDir, series, video.file);
    const coverPath = video.cover ? path.join(queueDir, series, video.cover) : undefined;

    try {
      log(`[Retry] Uploading: ${video.title}`);
      await publishToXiaohongshu(videoPath, video, coverPath, true);
      log(`[Retry] ✅ Done: ${video.title}`);
    } catch (err: any) {
      log(`[Retry] ❌ Failed again: ${video.title} — ${err.message}`);
    }
    await sleep(10000);
  }
}

retryFailed().catch(e => { console.error(e); process.exit(1); });
