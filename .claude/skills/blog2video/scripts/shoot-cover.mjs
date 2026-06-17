#!/usr/bin/env node
/* shoot-cover.mjs —— 把 d2「终端霓影」封面 HTML 截成交付封面 video_N_cover_photo.png
 *
 * 用法:
 *   node shoot-cover.mjs <output-dir> [video-number] [--html <cover.html>]
 *   例: node shoot-cover.mjs blog2video-output/loop-engineering 1
 *
 * 输入:  <output-dir>/cover_photo.html  (slide-html-generator 产出的 d2 封面;多集时优先 video_N_cover.html)
 * 产出:  <output-dir>/video_N_cover_photo.png  (1080×1920,交付封面,投递的唯一 PNG)
 *
 * 为什么要这个脚本: d2 path 没有自动把封面截成 PNG 的步骤(Remotion fallback 才有)。
 *   封面是小红书/视频号缩略图,必须与正片「终端霓影」风格统一。本脚本挂在 render-d2.sh 末尾(非致命)
 *   或单独跑。
 *
 * ★陷阱: cover_photo.html 的字体走 `assets/fonts/` symlink,该 symlink 由 build-scene.mjs 建场景时才创建。
 *   本脚本自己确保 <output-dir>/assets symlink 存在(指向 skill kit 字体),所以可独立于 build-scene 运行。
 *
 * puppeteer 从 blog2video-remotion/node_modules 解析(createRequire),无需在 skill 里另装。
 * viewport 1080×1920 · deviceScaleFactor 1 · waitUntil networkidle0 · 等 document.fonts.ready。
 */
import { existsSync, mkdirSync, rmSync, symlinkSync } from 'node:fs';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { createRequire } from 'node:module';
import { dirname, join, resolve } from 'node:path';

const SCRIPT_DIR = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = resolve(SCRIPT_DIR, '../../../..');
const KIT_ASSETS = resolve(SCRIPT_DIR, '../design/d2-kit/assets');

// ---- 参数 ----
const argv = process.argv.slice(2);
const positional = [];
let htmlArg = null;
for (let i = 0; i < argv.length; i++) {
  if (argv[i] === '--html') htmlArg = argv[++i];
  else positional.push(argv[i]);
}
const outputDir = positional[0] ? resolve(positional[0]) : null;
const videoNumber = parseInt(positional[1] || '1', 10);
if (!outputDir) {
  console.error('usage: node shoot-cover.mjs <output-dir> [video-number] [--html <cover.html>]');
  process.exit(1);
}
if (!existsSync(outputDir)) { console.error(`✗ 输出目录不存在: ${outputDir}`); process.exit(1); }

// ---- 解析封面 HTML(多集优先 video_N_cover.html,否则 cover_photo.html)----
function resolveCover() {
  if (htmlArg) {
    const p = resolve(outputDir, htmlArg);
    return existsSync(p) ? p : null;
  }
  for (const name of [`video_${videoNumber}_cover.html`, 'cover_photo.html']) {
    const p = join(outputDir, name);
    if (existsSync(p)) return p;
  }
  return null;
}
const coverHtml = resolveCover();
if (!coverHtml) {
  console.error(`✗ 找不到封面 HTML(找过 video_${videoNumber}_cover.html / cover_photo.html)。先跑 Slide HTML Generator。`);
  process.exit(1);
}

// ---- 确保 assets symlink 存在(字体路径 assets/fonts/* 靠它解析;build-scene 也建,这里独立兜底)----
const wsAssets = join(outputDir, 'assets');
if (!existsSync(wsAssets)) {            // 已是有效 symlink 就别动(可能正指向 kit)
  try { rmSync(wsAssets, { force: true, recursive: false }); } catch { /* not present */ }
  symlinkSync(KIT_ASSETS, wsAssets);
}

const outPng = join(outputDir, `video_${videoNumber}_cover_photo.png`);

const require = createRequire(join(REPO_ROOT, 'blog2video-remotion', 'package.json'));
let puppeteer;
try { puppeteer = require('puppeteer'); }
catch (e) {
  console.error('✗ 无法加载 puppeteer(应在 blog2video-remotion/node_modules)。先在 blog2video-remotion 跑 npm install。');
  console.error(String(e.message || e));
  process.exit(1);
}

const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox', '--font-render-hinting=none'] });
try {
  const page = await browser.newPage();
  await page.setViewport({ width: 1080, height: 1920, deviceScaleFactor: 1 });
  await page.goto(pathToFileURL(coverHtml).href, { waitUntil: 'networkidle0' });
  await page.evaluate(() => document.fonts && document.fonts.ready);     // 等字体真正就绪
  await new Promise((r) => setTimeout(r, 300));                          // 等布局/字体上屏
  await page.screenshot({ path: outPng, clip: { x: 0, y: 0, width: 1080, height: 1920 } });
  console.log(`✓ 封面截图: ${outPng}`);
  console.log(`  源: ${coverHtml}`);
} finally {
  await browser.close();
}
