const { chromium } = require('playwright');

const covers = [
  {
    file: '/home/ubuntu/blog2video/queue/obsidian-claude-code-life/video_1_cover_photo.png',
    tag: '精读AI · AI工具',
    line1: { colors: [['Obsidian', '#7C3AED'], [' + ', '#fff'], ['Claude Code', '#E8A838']] },
    line2: { colors: [['一个命令', '#fff'], ['加载整个人生', '#E04040']] },
    subtitle: '这个人做到了',
    source: 'Vin《How I Use Obsidian + Claude Code to Run My Life》',
  },
  {
    file: '/home/ubuntu/blog2video/queue/obsidian-claude-code-life/video_2_cover_photo.png',
    tag: '精读AI · AI工具',
    line1: { colors: [['Obsidian', '#7C3AED'], [' + ', '#fff'], ['Claude Code', '#E8A838']] },
    line2: { colors: [['读完笔记', '#fff'], ['发现了秘密', '#E04040']] },
    subtitle: '连他自己都不知道的事',
    source: 'Vin《How I Use Obsidian + Claude Code to Run My Life》',
  },
  {
    file: '/home/ubuntu/blog2video/queue/obsidian-claude-code-life/video_3_cover_photo.png',
    tag: '精读AI · AI工具',
    line1: { colors: [['Obsidian', '#7C3AED'], [' + ', '#fff'], ['Claude Code', '#E8A838']] },
    line2: { colors: [['5分钟', '#E04040'], ['给了张', '#fff'], ['人生规划', '#E8A838']] },
    subtitle: '不教AI做什么，让AI教你该做什么',
    source: 'Vin《How I Use Obsidian + Claude Code to Run My Life》',
  },
];

const rl = (colors) => colors.map(([t,c]) => `<span style="color:${c}">${t}</span>`).join('');

function buildHTML(cover) {
  return `<!DOCTYPE html><html><head><meta charset="utf-8"><style>
@import url('https://fonts.googleapis.com/css2?family=Noto+Sans+SC:wght@400;700;900&display=swap');
*{margin:0;padding:0;box-sizing:border-box}
body{width:1080px;height:1920px;background:#1A1A2E;display:flex;flex-direction:column;align-items:center;justify-content:center;font-family:'Noto Sans SC',sans-serif;position:relative;overflow:hidden}
.glow{position:absolute;width:900px;height:900px;top:45%;left:50%;transform:translate(-50%,-50%);background:radial-gradient(ellipse,rgba(107,92,231,0.2) 0%,rgba(107,92,231,0.08) 40%,transparent 70%);pointer-events:none}
.content{position:relative;z-index:1;display:flex;flex-direction:column;align-items:center;gap:36px;padding:0 50px}
.tag{display:inline-block;border:1.5px solid rgba(139,127,212,0.6);border-radius:50px;padding:14px 36px;color:#8B7FD4;font-size:36px;letter-spacing:3px;background:rgba(107,92,231,0.08)}
.title-line{font-size:96px;font-weight:900;line-height:1.35;text-align:center;text-shadow:0 4px 30px rgba(0,0,0,0.6);letter-spacing:3px;white-space:nowrap}
.title-line.brand{font-size:72px;letter-spacing:4px}
.subtitle{font-size:44px;color:#9A96B0;text-align:center;letter-spacing:2px;margin-top:12px}
.source{display:inline-block;background:rgba(255,255,255,0.06);border-radius:50px;padding:14px 36px;color:#6B6880;font-size:30px;letter-spacing:1px;margin-top:8px}
</style></head><body>
<div class="glow"></div>
<div class="content">
  <div class="tag">${cover.tag}</div>
  <div><div class="title-line brand">${rl(cover.line1.colors)}</div><div class="title-line">${rl(cover.line2.colors)}</div></div>
  <div class="subtitle">${cover.subtitle}</div>
  <div class="source">${cover.source}</div>
</div>
</body></html>`;
}

(async () => {
  const browser = await chromium.launch({ headless: true });
  for (const cover of covers) {
    const page = await browser.newPage();
    await page.setViewportSize({ width: 1080, height: 1920 });
    await page.setContent(buildHTML(cover), { waitUntil: 'networkidle' });
    await page.waitForTimeout(1500);
    await page.screenshot({ path: cover.file, type: 'png' });
    console.log('✅ ' + cover.file.split('/').pop());
    await page.close();
  }
  await browser.close();
  console.log('Done');
})();
