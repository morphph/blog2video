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
  await page.goto(CHANNELS_URL, { waitUntil: 'domcontentloaded', timeout: 30000 });
  await sleep(10000);

  await page.screenshot({ path: '/tmp/weixin-debug-page.png' });
  log(`URL: ${page.url()}`);
  log(`Frames: ${page.frames().length}`);
  
  for (const f of page.frames()) {
    log(`Frame: ${f.url()}`);
    const allInputs = await f.locator('input[type="file"]').all().catch(() => []);
    log(`  file inputs: ${allInputs.length}`);
    for (const inp of allInputs) {
      const accept = await inp.getAttribute('accept') || '(none)';
      log(`  accept=${accept}`);
    }
    const editables = await f.locator('[contenteditable]').count().catch(() => 0);
    log(`  contenteditable: ${editables}`);
    const textareas = await f.locator('textarea').count().catch(() => 0);
    log(`  textareas: ${textareas}`);
  }

  await browser.close();
}

main().catch(e => { console.error(e); process.exit(1); });
