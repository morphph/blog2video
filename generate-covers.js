const { chromium } = require('playwright');
const path = require('path');

const covers = [
  {
    file: 'obsidian-claude-code-life/video_1_cover_photo.png',
    tag: '精读AI · AI工具',
    line1: { text: '一个命令', colors: [['一个命令', '#fff']] },
    line2: { text: '', colors: [['加载你的', '#E8A838'], ['整个人生', '#E04040']] },
    subtitle: '这个人做到了',
    source: 'Vin《How I Use Obsidian + Claude Code to Run My Life》',
  },
  {
    file: 'obsidian-claude-code-life/video_2_cover_photo.png',
    tag: '精读AI · AI工具',
    line1: { text: '', colors: [['AI读完', '#fff'], ['一年笔记', '#E04040']] },
    line2: { text: '', colors: [['发现他自己', '#E8A838'], ['都不知道的事', '#fff']] },
    subtitle: '笔记里藏着你看不到的模式',
    source: 'Vin《How I Use Obsidian + Claude Code to Run My Life》',
  },
  {
    file: 'obsidian-claude-code-life/video_3_cover_photo.png',
    tag: '精读AI · AI工具',
    line1: { text: '', colors: [['AI', '#fff'], ['5分钟', '#E04040'], ['扫完所有笔记', '#fff']] },
    line2: { text: '', colors: [['给了张', '#fff'], ['人生规划', '#E8A838']] },
    subtitle: '不教AI做什么，让AI教你该做什么',
    source: 'Vin《How I Use Obsidian + Claude Code to Run My Life》',
  },
  {
    file: 'ivanhzhao-notion-thoughts/video_1_cover_photo.png',
    tag: '精读AI · AI思想',
    line1: { text: '', colors: [['1个人', '#fff']] },
    line2: { text: '', colors: [['顶', '#fff'], ['40个', '#E04040'], ['工程师', '#E8A838']] },
    subtitle: 'Notion创始人怎么做到的',
    source: 'Ivan Zhao《Steam, Steel, and Infinite Minds》',
  },
  {
    file: 'ivanhzhao-notion-thoughts/video_2_cover_photo.png',
    tag: '精读AI · AI思想',
    line1: { text: '', colors: [['Notion招了', '#fff'], ['700个AI', '#E04040']] },
    line2: { text: '', colors: [['你的岗位', '#E8A838'], ['还安全吗？', '#fff']] },
    subtitle: '这不是未来，这是现在',
    source: 'Ivan Zhao《Steam, Steel, and Infinite Minds》',
  },
  {
    file: 'superpowers/video_1_cover_photo.png',
    tag: '精读AI · AI编程',
    line1: { text: '', colors: [['用AI', '#fff'], ['写代码', '#E8A838']] },
    line2: { text: '', colors: [['反而', '#fff'], ['更慢了？', '#E04040']] },
    subtitle: '你可能犯了这个错',
    source: 'GitHub · Superpowers',
  },
  {
    file: 'superpowers/video_2_cover_photo.png',
    tag: '精读AI · AI编程',
    line1: { text: '', colors: [['AI说', '#fff'], ['测试通过', '#E04040']] },
    line2: { text: '', colors: [['它在', '#fff'], ['骗你', '#E8A838']] },
    subtitle: '11条经典借口反制表',
    source: 'GitHub · Superpowers',
  },
  {
    file: 'superpowers/video_3_cover_photo.png',
    tag: '精读AI · AI编程',
    line1: { text: '', colors: [['别人让AI', '#fff'], ['更快', '#E04040']] },
    line2: { text: '', colors: [['他偏让AI', '#E8A838'], ['更慢', '#fff']] },
    subtitle: '凭啥赢了6.7万星？',
    source: 'GitHub · Superpowers',
  },
];

function renderLine(colors) {
  return colors.map(([text, color]) => `<span style="color:${color}">${text}</span>`).join('');
}

function buildHTML(cover) {
  return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>
  @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+SC:wght@400;700;900&display=swap');
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body {
    width: 1080px; height: 1920px;
    background: #1A1A2E;
    display: flex; flex-direction: column;
    align-items: center; justify-content: center;
    font-family: 'Noto Sans SC', -apple-system, sans-serif;
    position: relative;
    overflow: hidden;
  }
  .glow {
    position: absolute;
    width: 900px; height: 900px;
    top: 45%; left: 50%;
    transform: translate(-50%, -50%);
    background: radial-gradient(ellipse, rgba(107,92,231,0.2) 0%, rgba(107,92,231,0.08) 40%, transparent 70%);
    pointer-events: none;
  }
  .content {
    position: relative; z-index: 1;
    display: flex; flex-direction: column;
    align-items: center; gap: 36px;
    padding: 0 50px;
  }
  .tag {
    display: inline-block;
    border: 1.5px solid rgba(139,127,212,0.6);
    border-radius: 50px;
    padding: 14px 36px;
    color: #8B7FD4;
    font-size: 36px;
    letter-spacing: 3px;
    background: rgba(107,92,231,0.08);
  }
  .title-block {
    display: flex; flex-direction: column;
    align-items: center; gap: 8px;
  }
  .title-line {
    font-size: 96px;
    font-weight: 900;
    line-height: 1.35;
    text-align: center;
    text-shadow: 0 4px 30px rgba(0,0,0,0.6);
    letter-spacing: 3px;
    white-space: nowrap;
  }
  .subtitle {
    font-size: 44px;
    color: #9A96B0;
    text-align: center;
    letter-spacing: 2px;
    margin-top: 12px;
  }
  .source {
    display: inline-block;
    background: rgba(255,255,255,0.06);
    border-radius: 50px;
    padding: 14px 36px;
    color: #6B6880;
    font-size: 30px;
    letter-spacing: 1px;
    margin-top: 8px;
  }
</style>
</head>
<body>
  <div class="glow"></div>
  <div class="content">
    <div class="tag">${cover.tag}</div>
    <div class="title-block">
      <div class="title-line">${renderLine(cover.line1.colors)}</div>
      <div class="title-line">${renderLine(cover.line2.colors)}</div>
    </div>
    <div class="subtitle">${cover.subtitle}</div>
    <div class="source">${cover.source}</div>
  </div>
</body>
</html>`;
}

(async () => {
  const browser = await chromium.launch({ headless: true });

  for (const cover of covers) {
    const page = await browser.newPage();
    await page.setViewportSize({ width: 1080, height: 1920 });
    await page.setContent(buildHTML(cover), { waitUntil: 'networkidle' });
    await page.waitForTimeout(1500);
    const outPath = path.join('/home/ubuntu/blog2video/queue', cover.file);
    await page.screenshot({ path: outPath, type: 'png' });
    console.log(`✅ ${cover.file}`);
    await page.close();
  }

  await browser.close();
  console.log('Done! All 8 covers generated.');
})();
