import { chromium } from 'playwright';
import { loadCookies } from './src/cookie-manager';
import { sleep, log } from './src/utils';

const CHANNELS_URL = 'https://channels.weixin.qq.com/platform/post/create';

async function main() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1280, height: 900 },
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  });

  await loadCookies(context, 'weixin');
  const page = await context.newPage();
  
  // Try networkidle
  await page.goto(CHANNELS_URL, { waitUntil: 'networkidle', timeout: 60000 });
  log('Page loaded (networkidle)');

  // Poll for file input appearing
  for (let i = 0; i < 12; i++) {
    await sleep(5000);
    await page.screenshot({ path: `/tmp/weixin-poll-${i}.png` });
    
    for (const f of page.frames()) {
      const inputs = await f.locator('input[type="file"]').count().catch(() => 0);
      if (inputs > 0) {
        log(`Found ${inputs} file input(s) in ${f.url().slice(0, 60)} at ${(i+1)*5}s`);
      }
    }
    
    // Also check via evaluate in micro frame
    const microFrame = page.frames().find(f => f.url().includes('/micro/content/'));
    if (microFrame) {
      const html = await microFrame.evaluate(() => document.body?.innerHTML?.slice(0, 500) || '(empty)').catch(() => '(error)');
      log(`Micro frame body (${(i+1)*5}s): ${html.slice(0, 200)}`);
    }
  }

  await browser.close();
}

main().catch(e => { console.error(e); process.exit(1); });
