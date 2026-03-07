import { chromium, Page } from 'playwright';
import * as path from 'path';
import { loadCookies, saveCookies } from './cookie-manager';
import { VideoMeta, CookieExpiredError, log, sleep } from './utils';

const CHANNELS_URL = 'https://channels.weixin.qq.com/platform/post/create';

async function checkLogin(page: Page): Promise<void> {
  const url = page.url();
  if (url.includes('login') || url.includes('passport') || url.includes('weixin.qq.com/cgi-bin')) {
    throw new CookieExpiredError('weixin');
  }
}

/**
 * Weixin Channels (视频号) uses wujie micro-frontend.
 * The UI renders inside the micro frame but many elements
 * (file inputs, textareas, buttons) are reflected in the main frame
 * as hidden elements. Playwright locators see them as invisible.
 * 
 * Strategy:
 * 1. Upload: use hidden input[type=file] in main frame (setInputFiles works on hidden inputs)
 * 2. Wait for upload: poll for textarea/buttons to appear in DOM
 * 3. Fill description & click publish: use page.evaluate() to directly manipulate DOM
 */
export async function publishToWeixin(
  videoPath: string,
  meta: VideoMeta,
  coverPath?: string
): Promise<void> {
  log(`[视频号] Publishing: ${meta.title}`);

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1280, height: 900 },
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  });

  try {
    await loadCookies(context, 'weixin');
    const page = await context.newPage();

    await page.goto(CHANNELS_URL, { waitUntil: 'networkidle', timeout: 60000 });
    await sleep(3000);
    await checkLogin(page);
    log('[视频号] Page loaded, logged in');

    // Step 1: Upload video via hidden file input
    log(`[视频号] Uploading video: ${videoPath}`);
    
    // Wait for file input to be attached (it's hidden)
    await page.waitForSelector('input[type="file"]', { state: 'attached', timeout: 30000 });
    
    const fileInput = page.locator('input[type="file"]').first();
    await fileInput.setInputFiles(videoPath);
    await fileInput.dispatchEvent('change');
    log('[视频号] File input set');

    // Step 2: Wait for upload form to appear (textarea for description)
    log('[视频号] Waiting for upload to process...');
    
    // Poll until we see textarea in any frame (wujie renders in micro frame)
    let formReady = false;
    let formFrame = page.mainFrame();
    for (let i = 0; i < 60; i++) {
      await sleep(5000);
      
      for (const f of page.frames()) {
        const textareaCount = await f.locator('textarea').count().catch(() => 0);
        const btnCount = await f.locator('button:has-text("发表")').count().catch(() => 0);
        if (textareaCount > 0 && btnCount > 0) {
          log(`[视频号] Form ready at ${(i + 1) * 5}s in frame ${f.url().slice(0, 60)}: ${textareaCount} textareas, ${btnCount} publish btns`);
          formReady = true;
          formFrame = f;
          break;
        }
      }
      if (formReady) break;
      
      // Check for upload error
      for (const f of page.frames()) {
        const hasError = await f.locator('text=网络出错').count().catch(() => 0);
        if (hasError > 0) {
          throw new Error('[视频号] Upload failed: 网络出错，请重新上传');
        }
      }
      
      if (i % 6 === 0) log(`[视频号] Still waiting... (${(i + 1) * 5}s)`);
    }

    if (!formReady) {
      await page.screenshot({ path: '/tmp/weixin-debug-form-timeout.png' });
      throw new Error('Form did not appear after upload');
    }

    // Step 3: Wait for upload + processing to finish
    // Wait for "取消上传" / "正在处理" to disappear and "删除" to appear
    log('[视频号] Waiting for upload & processing...');
    for (let i = 0; i < 72; i++) {
      await sleep(5000);
      
      const status = await (async () => {
        const uploading = await formFrame.locator('text=取消上传').count().catch(() => 0);
        const processing = await formFrame.locator('text=正在处理').count().catch(() => 0);
        const error = await formFrame.locator('text=网络出错').count().catch(() => 0);
        const deleteBtn = await formFrame.locator('text=删除').count().catch(() => 0);
        // Also check via page screenshot for progress bar
        const progressText = await formFrame.locator('text=/\\d+%/').count().catch(() => 0);
        return { uploading, processing, error, deleteBtn, progressText };
      })();

      if (status.error > 0) {
        await page.screenshot({ path: '/tmp/weixin-debug-upload-error.png' });
        throw new Error('[视频号] Upload failed: 网络出错');
      }

      if (status.uploading === 0 && status.processing === 0 && status.progressText === 0 && status.deleteBtn > 0) {
        log(`[视频号] Upload & processing complete at ${(i + 1) * 5}s`);
        break;
      }

      if (i % 6 === 0) {
        log(`[视频号] Status at ${(i + 1) * 5}s: uploading=${status.uploading} processing=${status.processing} progress=${status.progressText} delete=${status.deleteBtn}`);
      }
    }
    await sleep(3000);

    // Step 4: Fill description
    // Playwright locators can pierce shadow DOM (wujie), so use locator().evaluate()
    log('[视频号] Filling description...');
    const hashTags = (meta.tags || []).map(t => `#${t}`).join(' ');
    const fullText = `${meta.title}\n\n${meta.description}\n\n${hashTags}`;

    // Find all textareas via Playwright (pierces shadow DOM)
    const textareas = await formFrame.locator('textarea').all();
    log(`[视频号] Found ${textareas.length} textareas`);
    let filled = false;
    for (const ta of textareas) {
      const placeholder = await ta.getAttribute('placeholder').catch(() => '') || '';
      log(`[视频号]   textarea placeholder: "${placeholder}"`);
      // Skip product link textarea, find the description one
      if (placeholder.includes('商品') || placeholder.includes('链接')) {
        log('[视频号]   skipping product link textarea');
        continue;
      }
      if (placeholder.includes('描述') || placeholder.includes('添加') || placeholder === '') {
        // Use element-level evaluate to set value on the actual DOM node
        await ta.evaluate((el, text) => {
          const nativeSetter = Object.getOwnPropertyDescriptor(
            window.HTMLTextAreaElement.prototype, 'value'
          )?.set;
          if (nativeSetter) {
            nativeSetter.call(el, text);
          } else {
            (el as HTMLTextAreaElement).value = text;
          }
          el.dispatchEvent(new Event('input', { bubbles: true }));
          el.dispatchEvent(new Event('change', { bubbles: true }));
        }, fullText);
        log(`[视频号] Description filled via element evaluate`);
        filled = true;
        break;
      }
    }
    
    if (!filled) {
      // Try contenteditable
      const editables = await formFrame.locator('[contenteditable="true"]').all();
      for (const ed of editables) {
        await ed.evaluate((el, text) => {
          (el as HTMLElement).innerText = text;
          el.dispatchEvent(new Event('input', { bubbles: true }));
        }, fullText);
        log('[视频号] Description filled via contenteditable');
        filled = true;
        break;
      }
    }
    
    if (!filled) {
      log('[视频号] WARNING: Could not fill description');
    }

    await sleep(2000);
    await page.screenshot({ path: '/tmp/weixin-debug-after-fill.png' });

    // Step 5: Click publish button using Playwright locator + element evaluate
    log('[视频号] Clicking publish...');
    
    const publishBtns = await formFrame.locator('button:has-text("发表")').all();
    log(`[视频号] Found ${publishBtns.length} publish buttons`);
    let clicked = false;
    for (const btn of publishBtns) {
      const text = await btn.textContent().catch(() => '');
      log(`[视频号]   button text: "${text?.trim()}"`);
      if (text?.trim() === '发表') {
        await btn.evaluate((el) => (el as HTMLButtonElement).click());
        log('[视频号] Publish button clicked via element evaluate');
        clicked = true;
        break;
      }
    }
    
    if (!clicked && publishBtns.length > 0) {
      // Click the first one
      await publishBtns[0].evaluate((el) => (el as HTMLButtonElement).click());
      log('[视频号] Clicked first publish button');
      clicked = true;
    }
    
    if (!clicked) {
      log('[视频号] WARNING: Could not find 发表 button');
    }

    // Wait for publish confirmation
    log('[视频号] Waiting for publish confirmation...');
    await sleep(10000);
    await page.screenshot({ path: '/tmp/weixin-debug-final.png' });
    
    const finalUrl = page.url();
    const finalText = await formFrame.evaluate(() => document.body?.innerText?.slice(0, 200) || '').catch(() => '');
    log(`[视频号] Final URL: ${finalUrl}`);
    log(`[视频号] Final page text: ${finalText.slice(0, 100)}`);

    await saveCookies(context, 'weixin');
    log(`[视频号] Published successfully: ${meta.title}`);
  } finally {
    await browser.close();
  }
}

if (require.main === module) {
  const args = process.argv.slice(2);
  if (args.length < 2) {
    console.error('Usage: node publish-weixin.js <video_path> <meta_json_path>');
    process.exit(1);
  }
  const videoPath = path.resolve(args[0]);
  const videoFile = path.basename(videoPath);
  const rawMeta = require(path.resolve(args[1]));
  // Support both direct meta and { videos: [...] } format
  let meta: VideoMeta;
  if (rawMeta.videos && Array.isArray(rawMeta.videos)) {
    const found = rawMeta.videos.find((v: any) => v.file === videoFile);
    if (!found) {
      console.error(`Video "${videoFile}" not found in meta.json videos array`);
      process.exit(1);
    }
    meta = found;
  } else {
    meta = rawMeta;
  }
  publishToWeixin(videoPath, meta).catch(err => {
    console.error(err);
    process.exit(1);
  });
}
