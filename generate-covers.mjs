import { chromium } from '/home/ubuntu/blog2video/node_modules/playwright/index.mjs';
import path from 'path';

const covers = [
  {
    file: 'obsidian-claude-code-life/video_1_cover_photo.png',
    tag: '精读AI · AI工具',
    lines: [
      { text: '一个命令', color: '#fff' },
      { text: '加载你的', color: '#E8A838' },
      { text: '整个人生？', color: '#E04040' },
    ],
    subtitle: '这个人做到了',
    source: 'Vin《How I Use Obsidian + Claude Code to Run My Life》',
  },
  {
    file: 'obsidian-claude-code-life/video_2_cover_photo.png',
    tag: '精读AI · AI工具',
    lines: [
      { text: 'AI读完', color: '#fff' },
      { text: '他一年笔记', color: '#E04040' },
    ],
    lines2: [
      { text: '发现了他', color: '#E8A838' },
      { text: '自己', color: '#fff' },
    ],
    lines3: [
      { text: '不知道的事', color: '#E8A838' },
    ],
    subtitle: '笔记里藏着你看不到的模式',
    source: 'Vin《How I Use Obsidian + Claude Code to Run My Life》',
  },
  {
    file: 'obsidian-claude-code-life/video_3_cover_photo.png',
    tag: '精读AI · AI工具',
    lines: [
      { text: '让AI', color: '#fff' },
      { text: '自己', color: '#E04040' },
    ],
    lines2: [
      { text: '给你造工具', color: '#E8A838' },
      { text: '？', color: '#fff' },
    ],
    subtitle: 'Meta-prompting太离谱了',
    source: 'Vin《How I Use Obsidian + Claude Code to Run My Life》',
  },
  {
    file: 'ivanhzhao-notion-thoughts/video_1_cover_photo.png',
    tag: '精读AI · AI思想',
    lines: [
      { text: '写了', color: '#fff' },
      { text: '20年代码', color: '#E04040' },
    ],
    lines2: [
      { text: '突然不写了', color: '#E8A838' },
    ],
    subtitle: '一人顶40个工程师',
    source: 'Ivan Zhao《Steam, Steel, and Infinite Minds》',
  },
  {
    file: 'ivanhzhao-notion-thoughts/video_2_cover_photo.png',
    tag: '精读AI · AI思想',
    lines: [
      { text: '1000', color: '#E04040' },
      { text: '员工旁边', color: '#fff' },
    ],
    lines2: [
      { text: '有', color: '#fff' },
      { text: '700个AI', color: '#E8A838' },
    ],
    lines3: [
      { text: '在上班', color: '#E04040' },
    ],
    subtitle: 'Notion怎么做到的',
    source: 'Ivan Zhao《Steam, Steel, and Infinite Minds》',
  },
  {
    file: 'superpowers/video_1_cover_photo.png',
    tag: '精读AI · AI编程',
    lines: [
      { text: 'AI写代码', color: '#fff' },
      { text: '45分钟', color: '#E04040' },
    ],
    lines2: [
      { text: '白干？', color: '#E8A838' },
    ],
    subtitle: '6.7万人找到了解药',
    source: 'GitHub · Superpowers',
  },
  {
    file: 'superpowers/video_2_cover_photo.png',
    tag: '精读AI · AI编程',
    lines: [
      { text: 'AI说', color: '#fff' },
      { text: '测试通过', color: '#E04040' },
    ],
    lines2: [
      { text: '——它在', color: '#fff' },
      { text: '骗你', color: '#E8A838' },
    ],
    subtitle: '11条经典借口反制表',
    source: 'GitHub · Superpowers',
  },
  {
    file: 'superpowers/video_3_cover_photo.png',
    tag: '精读AI · AI编程',
    lines: [
      { text: '所有人让AI', color: '#fff' },
      { text: '更快', color: '#E04040' },
    ],
    lines2: [
      { text: '他偏让AI', color: '#E8A838' },
      { text: '更慢', color: '#fff' },
    ],
    subtitle: '凭啥赢了6.7万星？',
    source: 'GitHub · Superpowers',
  },
];

function renderLine(items) {
  return items.map(l => `<span style="color:${l.color}">${l.text}</span>`).join('');
}

function buildHTML(cover) {
  let titleLines = `<div class="title-line">${renderLine(cover.lines)}</div>`;
  if (cover.lines2) titleLines += `<div class="title-line">${renderLine(cover.lines2)}</div>`;
  if (cover.lines3) titleLines += `<div class="title-line">${renderLine(cover.lines3)}</div>`;

  return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body {
    width: 1080px; height: 1920px;
    background: #1A1A2E;
    display: flex; flex-direction: column;
    align-items: center; justify-content: center;
    font-family: -apple-system, 'PingFang SC', 'Noto Sans SC', 'Microsoft YaHei', sans-serif;
    position: relative; overflow: hidden;
  }
  .glow {
    position: absolute;
    width: 700px; height: 700px;
    top: 38%; left: 50%;
    transform: translate(-50%, -50%);
    background: radial-gradient(ellipse, rgba(107,92,231,0.18) 0%, rgba(140,80,200,0.06) 40%, transparent 70%);
    pointer-events: none;
  }
  .content {
    position: relative; z-index: 1;
    display: flex; flex-direction: column;
    align-items: center; gap: 30px;
    padding: 0 80px;
    margin-top: -180px;
  }
  .tag {
    display: inline-block;
    border: 1.5px solid rgba(139,127,212,0.5);
    border-radius: 50px;
    padding: 12px 32px;
    color: #8B7FD4;
    font-size: 30px;
    letter-spacing: 3px;
    background: rgba(107,92,231,0.08);
  }
  .title { text-align: center; }
  .title-line {
    font-size: 76px;
    font-weight: 900;
    line-height: 1.35;
    text-shadow: 0 3px 24px rgba(0,0,0,0.5);
    letter-spacing: 3px;
  }
  .subtitle {
    font-size: 36px;
    color: #9A96B0;
    text-align: center;
    letter-spacing: 2px;
    margin-top: 4px;
  }
  .source {
    display: inline-block;
    background: rgba(255,255,255,0.06);
    border-radius: 50px;
    padding: 14px 32px;
    color: #6B6880;
    font-size: 24px;
    letter-spacing: 1px;
    margin-top: 8px;
    max-width: 800px;
    text-align: center;
  }
</style>
</head>
<body>
  <div class="glow"></div>
  <div class="content">
    <div class="tag">${cover.tag}</div>
    <div class="title">${titleLines}</div>
    <div class="subtitle">${cover.subtitle}</div>
    <div class="source">${cover.source}</div>
  </div>
</body>
</html>`;
}

const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({ viewport: { width: 1080, height: 1920 } });

for (const cover of covers) {
  const page = await context.newPage();
  await page.setContent(buildHTML(cover), { waitUntil: 'networkidle' });
  await page.waitForTimeout(500);
  const outPath = path.join('/home/ubuntu/blog2video/queue', cover.file);
  await page.screenshot({ path: outPath, type: 'png' });
  console.log(`✅ ${cover.file}`);
  await page.close();
}

await browser.close();
console.log('Done! All 8 covers generated.');
