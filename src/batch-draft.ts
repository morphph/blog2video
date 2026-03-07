import * as path from 'path';
import * as fs from 'fs';
import { publishToXiaohongshu } from './publish-xiaohongshu';
import { log, sleep } from './utils';

interface QueueMeta {
  source: string;
  series_name?: string;
  videos: Array<{
    file: string;
    cover?: string;
    title: string;
    description: string;
    tags: string[];
  }>;
}

async function batchDraft() {
  const queueDir = path.resolve(__dirname, '..', 'queue');
  const series = ['obsidian-claude-code-life', 'ivanhzhao-notion-thoughts', 'superpowers'];
  
  const results: { title: string; status: string }[] = [];

  for (const seriesName of series) {
    const seriesDir = path.join(queueDir, seriesName);
    const metaPath = path.join(seriesDir, 'meta.json');
    
    if (!fs.existsSync(metaPath)) {
      log(`[Batch] Skipping ${seriesName}: no meta.json`);
      continue;
    }

    const meta: QueueMeta = JSON.parse(fs.readFileSync(metaPath, 'utf-8'));
    log(`\n[Batch] === ${meta.series_name || seriesName} (${meta.videos.length} videos) ===`);

    for (const video of meta.videos) {
      const videoPath = path.join(seriesDir, video.file);
      const coverPath = video.cover ? path.join(seriesDir, video.cover) : undefined;

      if (!fs.existsSync(videoPath)) {
        log(`[Batch] SKIP: ${video.file} not found`);
        results.push({ title: video.title, status: 'MISSING' });
        continue;
      }

      try {
        log(`[Batch] Uploading draft: ${video.title}`);
        await publishToXiaohongshu(videoPath, video, coverPath, true);
        results.push({ title: video.title, status: 'DRAFT_SAVED' });
        log(`[Batch] ✅ Draft saved: ${video.title}`);
      } catch (err: any) {
        log(`[Batch] ❌ Failed: ${video.title} — ${err.message}`);
        results.push({ title: video.title, status: `FAILED: ${err.message}` });
      }

      // Wait between uploads to avoid rate limiting
      log('[Batch] Waiting 10s before next upload...');
      await sleep(10000);
    }
  }

  // Print summary
  log('\n[Batch] ========== SUMMARY ==========');
  for (const r of results) {
    log(`  ${r.status === 'DRAFT_SAVED' ? '✅' : '❌'} ${r.title} → ${r.status}`);
  }
  log(`[Batch] Total: ${results.length} | Success: ${results.filter(r => r.status === 'DRAFT_SAVED').length} | Failed: ${results.filter(r => r.status !== 'DRAFT_SAVED').length}`);
}

batchDraft().catch(err => {
  console.error('Batch draft failed:', err);
  process.exit(1);
});
