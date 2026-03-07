import { chromium } from 'playwright';
import { loadCookies } from './src/cookie-manager';
import { sleep, log } from './src/utils';
import * as path from 'path';

const CHANNELS_URL = 'https://channels.weixin.qq.com/platform/post/create';

async function main() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1280, height: 900 },
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  });

  await loadCookies(context, 'weixin');
  const page = await context.newPage();
  await page.goto(CHANNELS_URL, { waitUntil: 'domcontentloaded', timeout: 30000 });
  await sleep(8000);

  // Upload video
  const videoPath = path.resolve('queue/2028gic/video_2.mp4');
  
  // Find file input in main frame
  const fileInput = page.locator('input[type="file"][accept*="video"]').first();
  if (await fileInput.count() > 0) {
    await fileInput.setInputFiles(videoPath);
    await fileInput.dispatchEvent('change');
    log('File set via input[type=file]');
  } else {
    log('No file input found!');
    await browser.close();
    return;
  }

  // Wait and take periodic screenshots + dump DOM
  for (let i = 0; i < 12; i++) {
    await sleep(10000);
    await page.screenshot({ path: `/tmp/weixin-debug-${i}.png` });
    log(`Screenshot ${i} saved (${(i+1)*10}s)`);
    
    // Check all frames for interesting elements
    for (const f of page.frames()) {
      const url = f.url().slice(0, 60);
      
      // Check for contenteditable
      const editables = await f.locator('[contenteditable]').count().catch(() => 0);
      const textareas = await f.locator('textarea').count().catch(() => 0);
      const qlEditors = await f.locator('.ql-editor').count().catch(() => 0);
      const buttons = await f.locator('button').all().catch(() => []);
      const btnTexts = [];
      for (const b of buttons.slice(0, 10)) {
        const t = await b.textContent().catch(() => '');
        if (t && t.trim()) btnTexts.push(t.trim());
      }
      
      if (editables || textareas || qlEditors || btnTexts.length) {
        log(`Frame ${url}: editables=${editables} textareas=${textareas} ql=${qlEditors} buttons=[${btnTexts.join(',')}]`);
      }
    }
    
    // Also check shadow DOM in main page
    const shadowInfo = await page.evaluate(() => {
      const hosts = document.querySelectorAll('*');
      const shadows: string[] = [];
      hosts.forEach(h => {
        if (h.shadowRoot) {
          const editables = h.shadowRoot.querySelectorAll('[contenteditable]');
          const textareas = h.shadowRoot.querySelectorAll('textarea');
          if (editables.length || textareas.length) {
            shadows.push(`${h.tagName}#${h.id}: editables=${editables.length} textareas=${textareas.length}`);
          }
        }
      });
      return shadows;
    }).catch(() => []);
    if (shadowInfo.length) {
      log(`Shadow DOM: ${shadowInfo.join('; ')}`);
    }
  }

  await browser.close();
}

main().catch(e => { console.error(e); process.exit(1); });
