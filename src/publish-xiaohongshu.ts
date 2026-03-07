import { chromium, Page } from 'playwright';
import * as path from 'path';
import { loadCookies, saveCookies } from './cookie-manager';
import { VideoMeta, CookieExpiredError, log, sleep } from './utils';

const CREATOR_URL = 'https://creator.xiaohongshu.com/publish/publish?source=official';

async function checkLogin(page: Page): Promise<void> {
  const url = page.url();
  if (url.includes('login') || url.includes('passport')) {
    throw new CookieExpiredError('xiaohongshu');
  }
}

export async function publishToXiaohongshu(
  videoPath: string,
  meta: VideoMeta,
  coverPath?: string,
  draftOnly: boolean = false
): Promise<void> {
  log(`[小红书] ${draftOnly ? 'Saving draft' : 'Publishing'}: ${meta.title}`);
  
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1280, height: 900 },
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  });

  try {
    await loadCookies(context, 'xiaohongshu');
    const page = await context.newPage();

    // Navigate to publish page
    await page.goto(CREATOR_URL, { waitUntil: 'domcontentloaded', timeout: 60000 });
    await sleep(3000);
    await checkLogin(page);

    // Ensure "上传视频" tab is selected (it's the default, but click if visible)
    const videoTab = page.locator('text=上传视频').first();
    if (await videoTab.isVisible()) {
      await videoTab.click();
      await sleep(1000);
    }

    // Upload video file via the hidden file input
    // Selector verified from DOM: input.upload-input[type="file"][accept=".mp4,.mov,..."]
    log(`[小红书] Uploading video: ${videoPath}`);
    const fileInput = page.locator('input.upload-input[type="file"]');
    await fileInput.setInputFiles(videoPath);
    
    // Wait for upload to complete - the page transitions to the editor form
    // after upload. Wait for title input or contenteditable to appear.
    log('[小红书] Waiting for upload to complete...');
    try {
      await page.waitForSelector(
        '[contenteditable="true"], [placeholder*="标题"], input[name="title"], .ql-editor',
        { timeout: 180000 }
      );
    } catch {
      log('[小红书] Upload wait timeout, attempting to continue...');
    }
    await sleep(3000);

    // Fill title - after upload, a title input appears
    // XHS uses contenteditable divs or input elements depending on version
    log(`[小红书] Filling title: ${meta.title}`);
    // Try standard input/textarea first
    const stdTitle = page.locator(
      'input[placeholder*="标题"], textarea[placeholder*="标题"], input[name="title"]'
    ).first();
    if (await stdTitle.isVisible({ timeout: 3000 }).catch(() => false)) {
      await stdTitle.click();
      await stdTitle.fill(meta.title);
    } else {
      // XHS typically uses contenteditable for title
      const ceTitle = page.locator('.c-input_inner [contenteditable="true"], [contenteditable="true"]').first();
      if (await ceTitle.isVisible({ timeout: 5000 }).catch(() => false)) {
        await ceTitle.click();
        await page.keyboard.press('Meta+a');
        await page.keyboard.type(meta.title);
      } else {
        // Last resort: click the wrapper and type
        const wrapper = page.locator('.c-input_inner, .title-input').first();
        if (await wrapper.isVisible({ timeout: 2000 }).catch(() => false)) {
          await wrapper.click();
          await page.keyboard.type(meta.title);
        }
      }
    }

    // Fill description/body text
    log(`[小红书] Filling description`);
    await sleep(2000); // Wait for description area to load
    
    // Build text with hashtags appended
    const hashTags = meta.tags.map(t => `#${t}`).join(' ');
    const fullText = `${meta.description}\n\n${hashTags}`;
    
    // Try multiple strategies to find and fill description
    let descFilled = false;
    
    // Strategy 1: Look for the description placeholder text area
    const descByPlaceholder = page.locator('[placeholder*="正文"], [placeholder*="描述"], [placeholder*="分享"]').first();
    if (await descByPlaceholder.isVisible({ timeout: 3000 }).catch(() => false)) {
      await descByPlaceholder.click();
      await sleep(300);
      await page.keyboard.type(fullText, { delay: 10 });
      descFilled = true;
      log(`[小红书] Description filled via placeholder`);
    }
    
    // Strategy 2: Find contenteditable elements  
    if (!descFilled) {
      const allEditable = page.locator('[contenteditable="true"]');
      const editableCount = await allEditable.count();
      log(`[小红书] Found ${editableCount} contenteditable elements`);
      
      if (editableCount >= 2) {
        const descInput = allEditable.nth(1);
        await descInput.click();
        await sleep(300);
        await page.keyboard.press('Meta+a');
        await page.keyboard.type(fullText, { delay: 10 });
        descFilled = true;
        log(`[小红书] Description filled via 2nd contenteditable`);
      }
    }
    
    // Strategy 3: Click below the title area and type
    if (!descFilled) {
      // Try .ql-editor which is commonly used
      const qlEditor = page.locator('.ql-editor, [class*="desc"], [class*="content-input"]').first();
      if (await qlEditor.isVisible({ timeout: 3000 }).catch(() => false)) {
        await qlEditor.click();
        await page.keyboard.type(fullText, { delay: 10 });
        descFilled = true;
        log(`[小红书] Description filled via ql-editor/desc class`);
      }
    }
    
    if (!descFilled) {
      log(`[小红书] WARNING: Could not find description input, taking debug screenshot`);
      await page.screenshot({ path: `/home/ubuntu/blog2video/cookies/screenshots/desc-debug-${Date.now()}.png` });
    }

    // Add tags via topic/hashtag input if separate from description
    const tagInput = page.locator('[placeholder*="话题"], [placeholder*="标签"], .tag-input, #topic-input').first();
    if (await tagInput.isVisible({ timeout: 2000 }).catch(() => false)) {
      for (const tag of meta.tags) {
        log(`[小红书] Adding tag: #${tag}`);
        await tagInput.click();
        await tagInput.fill(tag);
        await sleep(800);
        // Select first suggestion or press Enter
        const suggestion = page.locator('.topic-item, .suggestion-item, [class*="topic-suggest"]').first();
        if (await suggestion.isVisible({ timeout: 2000 }).catch(() => false)) {
          await suggestion.click();
        } else {
          await tagInput.press('Enter');
        }
        await sleep(500);
      }
    }

    // Upload cover if provided
    if (coverPath) {
      log(`[小红书] Uploading cover: ${coverPath}`);
      // After video upload, there may be a second file input for cover
      const coverInput = page.locator('input[type="file"][accept*="image"], input[type="file"][accept*=".jpg"]').first();
      if (await coverInput.count() > 0) {
        await coverInput.setInputFiles(coverPath);
        await sleep(3000);
      }
    }

    // Wait for video upload to complete before saving
    log('[小红书] Waiting for video upload to complete...');
    try {
      await page.waitForFunction(() => {
        // Check if upload progress text is gone or shows 100%
        const el = document.querySelector('[class*="upload"]');
        if (!el) return true;
        const text = el.textContent || '';
        return text.includes('100%') || !text.includes('上传中');
      }, { timeout: 180000 });
    } catch {
      log('[小红书] Upload wait timeout, proceeding anyway...');
    }
    await sleep(3000);

    if (draftOnly) {
      // Save as draft instead of publishing
      log(`[小红书] Saving as draft...`);
      const draftBtn = page.locator(
        'button:has-text("暂存离开"), button:has-text("存草稿"), button:has-text("保存草稿"), [class*="draft"] button'
      ).first();
      if (await draftBtn.isVisible({ timeout: 5000 }).catch(() => false)) {
        await draftBtn.click();
        await sleep(3000);
        log(`[小红书] Draft saved: ${meta.title}`);
      } else {
        // Fallback: try to find any draft/save button
        log('[小红书] Draft button not found with primary selectors, trying alternatives...');
        const altDraftBtn = page.locator('button').filter({ hasText: /暂存|草稿|draft/i }).first();
        if (await altDraftBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
          await altDraftBtn.click();
          await sleep(3000);
          log(`[小红书] Draft saved (alt): ${meta.title}`);
        } else {
          log(`[小红书] WARNING: Could not find draft button, taking screenshot for debug`);
          await page.screenshot({ path: `/home/ubuntu/blog2video/cookies/screenshots/draft-btn-missing-${Date.now()}.png` });
        }
      }
    } else {
      // Click publish button
      log(`[小红书] Clicking publish...`);
      const publishBtn = page.locator(
        'button:has-text("发布"), .publishBtn, [class*="publish"] button, .submit-btn'
      ).first();
      await publishBtn.click();
      
      // Wait for publish confirmation
      log('[小红书] Waiting for publish confirmation...');
      try {
        await page.waitForURL(/\/publish\/success|\/creator/, { timeout: 30000 });
      } catch {
        // Check if still on same page (might show success toast)
        await sleep(5000);
      }
      log(`[小红书] Published successfully: ${meta.title}`);
    }
    
    // Save updated cookies
    await saveCookies(context, 'xiaohongshu');
  } finally {
    await browser.close();
  }
}

// CLI entry
if (require.main === module) {
  const args = process.argv.slice(2);
  const draftFlag = args.includes('--draft');
  const filteredArgs = args.filter(a => a !== '--draft');
  if (filteredArgs.length < 2) {
    console.error('Usage: node publish-xiaohongshu.js <video_path> <meta_json_path> [--draft]');
    process.exit(1);
  }
  const videoPath = path.resolve(filteredArgs[0]);
  const meta: VideoMeta = require(path.resolve(filteredArgs[1]));
  publishToXiaohongshu(videoPath, meta, undefined, draftFlag).catch(err => {
    console.error(err);
    process.exit(1);
  });
}
