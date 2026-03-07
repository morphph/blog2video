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
  await page.goto(CHANNELS_URL, { waitUntil: 'networkidle', timeout: 60000 });
  
  // Wait for file input
  await page.waitForSelector('input[type="file"]', { timeout: 30000, state: 'attached' });
  log('File input found');
  
  const fileInput = page.locator('input[type="file"]').first();
  const accept = await fileInput.getAttribute('accept');
  log(`accept: ${accept}`);
  
  // Upload
  const videoPath = path.resolve('queue/2028gic/video_2.mp4');
  await fileInput.setInputFiles(videoPath);
  await fileInput.dispatchEvent('change');
  log('File set');
  
  // Wait for upload + editor to appear
  for (let i = 0; i < 24; i++) {
    await sleep(10000);
    
    // Check main frame for editables
    const editables = await page.locator('[contenteditable="true"]').count();
    const textareas = await page.locator('textarea').count();
    const publishBtns = await page.locator('button:has-text("发表")').count();
    const descArea = await page.locator('text=添加描述').count();
    const descArea2 = await page.locator('text=视频描述').count();
    
    log(`${(i+1)*10}s: editables=${editables} textareas=${textareas} 发表btn=${publishBtns} 添加描述=${descArea} 视频描述=${descArea2}`);
    
    if (editables > 0 || publishBtns > 0) {
      await page.screenshot({ path: '/tmp/weixin-ready.png' });
      
      // Dump all editable elements
      const eds = await page.locator('[contenteditable="true"]').all();
      for (let j = 0; j < eds.length; j++) {
        const tag = await eds[j].evaluate(e => `${e.tagName}.${e.className}`);
        const vis = await eds[j].isVisible();
        log(`  editable[${j}]: ${tag} visible=${vis}`);
      }
      
      // Dump buttons
      const btns = await page.locator('button').all();
      for (const b of btns.slice(0, 15)) {
        const txt = await b.textContent().catch(() => '');
        const vis = await b.isVisible().catch(() => false);
        if (txt?.trim()) log(`  btn: "${txt.trim()}" visible=${vis}`);
      }
      break;
    }
  }

  await browser.close();
}

main().catch(e => { console.error(e); process.exit(1); });
