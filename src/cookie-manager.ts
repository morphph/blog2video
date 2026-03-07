import { chromium, BrowserContext } from 'playwright';
import * as path from 'path';
import * as fs from 'fs';
import { COOKIES_DIR, ensureDir, log, logError, sleep } from './utils';

type Platform = 'xiaohongshu' | 'weixin';

const PLATFORM_CONFIG = {
  xiaohongshu: {
    loginUrl: 'https://creator.xiaohongshu.com/login',
    checkUrl: 'https://creator.xiaohongshu.com/publish/publish',
    name: '小红书',
  },
  weixin: {
    loginUrl: 'https://channels.weixin.qq.com/',
    checkUrl: 'https://channels.weixin.qq.com/platform/post/create',
    name: '微信视频号',
  },
};

function getCookiePath(platform: Platform): string {
  return path.join(COOKIES_DIR, `${platform}.json`);
}

export async function loadCookies(context: BrowserContext, platform: Platform): Promise<boolean> {
  const cookiePath = getCookiePath(platform);
  if (!fs.existsSync(cookiePath)) {
    return false;
  }
  try {
    const cookies = JSON.parse(fs.readFileSync(cookiePath, 'utf-8'));
    await context.addCookies(cookies);
    return true;
  } catch {
    return false;
  }
}

export async function saveCookies(context: BrowserContext, platform: Platform): Promise<void> {
  ensureDir(COOKIES_DIR);
  const cookies = await context.cookies();
  fs.writeFileSync(getCookiePath(platform), JSON.stringify(cookies, null, 2));
  log(`Cookies saved for ${platform}`);
}

export async function checkCookieValid(platform: Platform): Promise<boolean> {
  const config = PLATFORM_CONFIG[platform];
  const browser = await chromium.launch({ headless: true });
  try {
    const context = await browser.newContext();
    const loaded = await loadCookies(context, platform);
    if (!loaded) return false;

    const page = await context.newPage();
    await page.goto(config.checkUrl, { waitUntil: 'domcontentloaded', timeout: 30000 });
    await sleep(3000);

    const url = page.url();
    // If redirected to login page, cookies are invalid
    const isValid = !url.includes('login') && !url.includes('passport');
    await browser.close();
    return isValid;
  } catch (err) {
    logError(`Cookie check failed for ${platform}`, err);
    await browser.close();
    return false;
  }
}

/**
 * Interactive login flow:
 * 1. Opens login page
 * 2. Takes screenshot of QR code
 * 3. Waits for user to scan
 * 4. Saves cookies
 * 
 * Returns the screenshot path for sending via Telegram
 */
export async function loginFlow(platform: Platform): Promise<string> {
  const config = PLATFORM_CONFIG[platform];
  log(`Starting login flow for ${config.name}...`);

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1280, height: 800 },
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  });

  const page = await context.newPage();
  await page.goto(config.loginUrl, { waitUntil: 'domcontentloaded', timeout: 30000 });
  await sleep(3000);

  // Screenshot the QR code
  const screenshotDir = path.join(COOKIES_DIR, 'screenshots');
  ensureDir(screenshotDir);
  const screenshotPath = path.join(screenshotDir, `${platform}-qr-${Date.now()}.png`);
  await page.screenshot({ path: screenshotPath, fullPage: false });
  log(`QR code screenshot saved: ${screenshotPath}`);

  // Wait for login (poll for URL change, max 120 seconds)
  log('Waiting for QR code scan...');
  const maxWait = 120;
  for (let i = 0; i < maxWait; i++) {
    await sleep(1000);
    const url = page.url();
    if (!url.includes('login') && !url.includes('passport')) {
      log(`Login successful for ${config.name}!`);
      await saveCookies(context, platform);
      await browser.close();
      return screenshotPath;
    }
  }

  await browser.close();
  throw new Error(`Login timeout for ${config.name} (${maxWait}s)`);
}

// CLI entry point
if (require.main === module) {
  const platform = process.argv[2] as Platform;
  if (!platform || !PLATFORM_CONFIG[platform]) {
    console.error('Usage: node cookie-manager.js <xiaohongshu|weixin>');
    process.exit(1);
  }
  loginFlow(platform).catch(err => {
    logError('Login failed', err);
    process.exit(1);
  });
}
