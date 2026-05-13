
    const puppeteer = require('puppeteer');
    (async () => {
      const browser = await puppeteer.launch({
        headless: 'new',
        args: ['--no-sandbox', '--disable-setuid-sandbox']
      });
      const page = await browser.newPage();
      await page.setViewport({ width: 1080, height: 1920 });

      const files = [{"html":"/home/ubuntu/blog2video/blog2video-output/agent-view-in-claude-code/cover_photo.html","png":"/home/ubuntu/blog2video/blog2video-remotion/public/cover_photo.png","outputPng":"/home/ubuntu/blog2video/blog2video-output/agent-view-in-claude-code/video_1_cover_photo.png"},{"html":"/home/ubuntu/blog2video/blog2video-output/agent-view-in-claude-code/slide_1.html","png":"/home/ubuntu/blog2video/blog2video-remotion/public/slide_1.png"},{"html":"/home/ubuntu/blog2video/blog2video-output/agent-view-in-claude-code/slide_2.html","png":"/home/ubuntu/blog2video/blog2video-remotion/public/slide_2.png"},{"html":"/home/ubuntu/blog2video/blog2video-output/agent-view-in-claude-code/slide_3.html","png":"/home/ubuntu/blog2video/blog2video-remotion/public/slide_3.png"},{"html":"/home/ubuntu/blog2video/blog2video-output/agent-view-in-claude-code/slide_4.html","png":"/home/ubuntu/blog2video/blog2video-remotion/public/slide_4.png"},{"html":"/home/ubuntu/blog2video/blog2video-output/agent-view-in-claude-code/slide_5.html","png":"/home/ubuntu/blog2video/blog2video-remotion/public/slide_5.png"},{"html":"/home/ubuntu/blog2video/blog2video-output/agent-view-in-claude-code/slide_6.html","png":"/home/ubuntu/blog2video/blog2video-remotion/public/slide_6.png"},{"html":"/home/ubuntu/blog2video/blog2video-output/agent-view-in-claude-code/slide_7.html","png":"/home/ubuntu/blog2video/blog2video-remotion/public/slide_7.png"}];
      for (const file of files) {
        console.log('  Screenshot:', file.html);
        await page.goto('file://' + file.html, { waitUntil: 'networkidle0' });
        await page.screenshot({ path: file.png, type: 'png' });
        if (file.outputPng) {
          require('fs').copyFileSync(file.png, file.outputPng);
        }
      }
      await browser.close();
    })();
  