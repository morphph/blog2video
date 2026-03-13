#!/usr/bin/env node
/**
 * Fetch Twitter/X article or tweet thread content using Puppeteer.
 * Usage: node fetch-twitter.mjs <twitter-url> <output-dir>
 * Outputs: source_raw.md (text), images/ (downloaded images), twitter_metadata.json
 */

import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';
import https from 'https';
import http from 'http';

const [url, outputDir] = process.argv.slice(2);
if (!url || !outputDir) {
  console.error('Usage: node fetch-twitter.mjs <twitter-url> <output-dir>');
  process.exit(1);
}

fs.mkdirSync(outputDir, { recursive: true });
fs.mkdirSync(path.join(outputDir, 'images'), { recursive: true });

function downloadImage(imgUrl, filepath) {
  return new Promise((resolve, reject) => {
    const mod = imgUrl.startsWith('https') ? https : http;
    mod.get(imgUrl, { headers: { 'User-Agent': 'Mozilla/5.0' } }, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        return downloadImage(res.headers.location, filepath).then(resolve).catch(reject);
      }
      if (res.statusCode !== 200) {
        reject(new Error(`HTTP ${res.statusCode} for ${imgUrl}`));
        return;
      }
      const ws = fs.createWriteStream(filepath);
      res.pipe(ws);
      ws.on('finish', () => { ws.close(); resolve(filepath); });
      ws.on('error', reject);
    }).on('error', reject);
  });
}

async function fetchArticle(browser, articleUrl) {
  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 900 });
  await page.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');

  console.log(`Navigating to ${articleUrl}...`);
  await page.goto(articleUrl, { waitUntil: 'networkidle2', timeout: 60000 });

  // Wait for article content to load
  await page.waitForFunction(() => {
    const article = document.querySelector('article') || document.querySelector('[data-testid="tweetText"]');
    return article && article.textContent.length > 10;
  }, { timeout: 30000 }).catch(() => console.log('Warning: article selector not found, will try extracting anyway'));

  // Scroll to load all content
  await autoScroll(page);

  // Extract content
  const data = await page.evaluate(() => {
    const result = { title: '', author: '', handle: '', date: '', paragraphs: [], images: [] };

    // Try article format first
    const articleEl = document.querySelector('article');
    if (articleEl) {
      // Get all text blocks
      const textBlocks = articleEl.querySelectorAll('div[data-testid="tweetText"], span, p');
      const seen = new Set();
      for (const el of textBlocks) {
        const text = el.textContent.trim();
        if (text.length > 5 && !seen.has(text)) {
          seen.add(text);
          result.paragraphs.push(text);
        }
      }
    }

    // If article approach didn't get much, try broader selectors
    if (result.paragraphs.length < 3) {
      result.paragraphs = [];
      // Twitter article pages
      const articleContent = document.querySelectorAll('[class*="article"] p, [class*="article"] h1, [class*="article"] h2, [class*="article"] h3, [class*="Article"] p, [role="article"] p');
      if (articleContent.length > 0) {
        for (const el of articleContent) {
          const text = el.textContent.trim();
          if (text) result.paragraphs.push(text);
        }
      }
    }

    // If still not much, get all visible text
    if (result.paragraphs.length < 3) {
      result.paragraphs = [];
      const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, null);
      const seen = new Set();
      while (walker.nextNode()) {
        const text = walker.currentNode.textContent.trim();
        if (text.length > 20 && !seen.has(text) && !text.includes('{') && !text.includes('function')) {
          seen.add(text);
          result.paragraphs.push(text);
        }
      }
    }

    // Get images
    const imgs = document.querySelectorAll('img[src*="pbs.twimg.com/media"], img[src*="twimg.com/media"]');
    for (const img of imgs) {
      const src = img.src || img.getAttribute('src');
      if (src && !src.includes('profile_images') && !src.includes('emoji')) {
        result.images.push(src.replace(/&name=\w+/, '&name=large'));
      }
    }

    // Author info
    const authorEl = document.querySelector('[data-testid="User-Name"]') || document.querySelector('a[role="link"][href*="/"]');
    if (authorEl) {
      result.author = authorEl.textContent.split('@')[0]?.trim() || '';
      const handleMatch = authorEl.textContent.match(/@(\w+)/);
      if (handleMatch) result.handle = handleMatch[1];
    }

    // Title
    const titleEl = document.querySelector('h1') || document.querySelector('[role="heading"]');
    if (titleEl) result.title = titleEl.textContent.trim();

    return result;
  });

  await page.close();
  return data;
}

async function fetchTweet(browser, tweetUrl) {
  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 900 });
  await page.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');

  console.log(`Navigating to tweet ${tweetUrl}...`);
  await page.goto(tweetUrl, { waitUntil: 'networkidle2', timeout: 60000 });

  await page.waitForSelector('[data-testid="tweetText"]', { timeout: 30000 })
    .catch(() => console.log('Warning: tweet text not found'));

  await autoScroll(page);

  const data = await page.evaluate(() => {
    const result = { title: '', author: '', handle: '', date: '', paragraphs: [], images: [] };

    // Get tweet texts (thread)
    const tweets = document.querySelectorAll('[data-testid="tweetText"]');
    for (const t of tweets) {
      const text = t.textContent.trim();
      if (text) result.paragraphs.push(text);
    }

    // Get images
    const imgs = document.querySelectorAll('img[src*="pbs.twimg.com/media"], img[src*="twimg.com/media"]');
    for (const img of imgs) {
      const src = img.src || img.getAttribute('src');
      if (src && !src.includes('profile_images') && !src.includes('emoji')) {
        result.images.push(src.replace(/&name=\w+/, '&name=large'));
      }
    }

    // Author
    const authorEl = document.querySelector('[data-testid="User-Name"]');
    if (authorEl) {
      result.author = authorEl.textContent.split('@')[0]?.trim() || '';
      const handleMatch = authorEl.textContent.match(/@(\w+)/);
      if (handleMatch) result.handle = handleMatch[1];
    }

    return result;
  });

  await page.close();
  return data;
}

async function autoScroll(page) {
  await page.evaluate(async () => {
    await new Promise((resolve) => {
      let totalHeight = 0;
      const distance = 500;
      const timer = setInterval(() => {
        window.scrollBy(0, distance);
        totalHeight += distance;
        if (totalHeight >= document.body.scrollHeight || totalHeight > 20000) {
          clearInterval(timer);
          resolve();
        }
      }, 200);
    });
  });
  // Wait for any lazy-loaded content
  await new Promise(r => setTimeout(r, 2000));
}

async function main() {
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  try {
    const isArticle = url.includes('/article/') || url.includes('/i/article/');
    let data;

    if (isArticle) {
      data = await fetchArticle(browser, url);
    } else {
      // For tweet URLs, first fetch the tweet, then check if it links to an article
      data = await fetchTweet(browser, url);

      // If tweet has very little text but links to an article, follow it
      if (data.paragraphs.length <= 2) {
        const articleMatch = data.paragraphs.join(' ').match(/https:\/\/t\.co\/\w+/);
        if (articleMatch) {
          console.log('Tweet contains a link, attempting to follow...');
        }
      }
    }

    // Download images
    const imageFiles = [];
    for (let i = 0; i < data.images.length; i++) {
      const ext = data.images[i].includes('.png') ? 'png' : 'jpg';
      const filename = `image_${i + 1}.${ext}`;
      const filepath = path.join(outputDir, 'images', filename);
      try {
        await downloadImage(data.images[i], filepath);
        imageFiles.push(filename);
        console.log(`Downloaded ${filename}`);
      } catch (e) {
        console.log(`Failed to download image ${i + 1}: ${e.message}`);
      }
    }

    // Build markdown
    let md = '';
    if (data.title) md += `# ${data.title}\n\n`;
    if (data.author) md += `**Author:** ${data.author}`;
    if (data.handle) md += ` (@${data.handle})`;
    if (data.author) md += '\n\n';
    md += '---\n\n';

    for (const p of data.paragraphs) {
      md += `${p}\n\n`;
    }

    if (imageFiles.length > 0) {
      md += '\n---\n\n## Images\n\n';
      for (const img of imageFiles) {
        md += `![${img}](images/${img})\n\n`;
      }
    }

    fs.writeFileSync(path.join(outputDir, 'source_raw.md'), md);
    fs.writeFileSync(path.join(outputDir, 'twitter_metadata.json'), JSON.stringify({
      url,
      author: data.author,
      handle: data.handle,
      title: data.title,
      date: data.date,
      image_count: imageFiles.length,
      paragraph_count: data.paragraphs.length
    }, null, 2));

    console.log(`\nDone! Extracted ${data.paragraphs.length} paragraphs, ${imageFiles.length} images`);
    console.log(`Output: ${outputDir}/source_raw.md`);

  } finally {
    await browser.close();
  }
}

main().catch(e => { console.error(e); process.exit(1); });
