
    const puppeteer = require('puppeteer');
    (async () => {
      const browser = await puppeteer.launch({
        headless: 'new',
        args: ['--no-sandbox', '--disable-setuid-sandbox']
      });
      const page = await browser.newPage();
      await page.setViewport({ width: 1080, height: 1920 });

      const files = [{"html":"/Users/yufanp/Desktop/Project/blog2video/blog2video-output/thin-harness-fat-skills/cover_photo.html","png":"/Users/yufanp/Desktop/Project/blog2video/blog2video-remotion/public/cover_photo.png","outputPng":"/Users/yufanp/Desktop/Project/blog2video/blog2video-output/thin-harness-fat-skills/video_1_cover_photo.png"},{"html":"/Users/yufanp/Desktop/Project/blog2video/blog2video-output/thin-harness-fat-skills/slide_1.html","png":"/Users/yufanp/Desktop/Project/blog2video/blog2video-remotion/public/slide_1.png"},{"html":"/Users/yufanp/Desktop/Project/blog2video/blog2video-output/thin-harness-fat-skills/slide_2.html","png":"/Users/yufanp/Desktop/Project/blog2video/blog2video-remotion/public/slide_2.png"},{"html":"/Users/yufanp/Desktop/Project/blog2video/blog2video-output/thin-harness-fat-skills/slide_3.html","png":"/Users/yufanp/Desktop/Project/blog2video/blog2video-remotion/public/slide_3.png"},{"html":"/Users/yufanp/Desktop/Project/blog2video/blog2video-output/thin-harness-fat-skills/slide_4.html","png":"/Users/yufanp/Desktop/Project/blog2video/blog2video-remotion/public/slide_4.png"},{"html":"/Users/yufanp/Desktop/Project/blog2video/blog2video-output/thin-harness-fat-skills/slide_5.html","png":"/Users/yufanp/Desktop/Project/blog2video/blog2video-remotion/public/slide_5.png"},{"html":"/Users/yufanp/Desktop/Project/blog2video/blog2video-output/thin-harness-fat-skills/slide_6.html","png":"/Users/yufanp/Desktop/Project/blog2video/blog2video-remotion/public/slide_6.png"},{"html":"/Users/yufanp/Desktop/Project/blog2video/blog2video-output/thin-harness-fat-skills/slide_7.html","png":"/Users/yufanp/Desktop/Project/blog2video/blog2video-remotion/public/slide_7.png"},{"html":"/Users/yufanp/Desktop/Project/blog2video/blog2video-output/thin-harness-fat-skills/slide_8.html","png":"/Users/yufanp/Desktop/Project/blog2video/blog2video-remotion/public/slide_8.png"},{"html":"/Users/yufanp/Desktop/Project/blog2video/blog2video-output/thin-harness-fat-skills/slide_9.html","png":"/Users/yufanp/Desktop/Project/blog2video/blog2video-remotion/public/slide_9.png"},{"html":"/Users/yufanp/Desktop/Project/blog2video/blog2video-output/thin-harness-fat-skills/slide_10.html","png":"/Users/yufanp/Desktop/Project/blog2video/blog2video-remotion/public/slide_10.png"},{"html":"/Users/yufanp/Desktop/Project/blog2video/blog2video-output/thin-harness-fat-skills/slide_11.html","png":"/Users/yufanp/Desktop/Project/blog2video/blog2video-remotion/public/slide_11.png"},{"html":"/Users/yufanp/Desktop/Project/blog2video/blog2video-output/thin-harness-fat-skills/slide_12.html","png":"/Users/yufanp/Desktop/Project/blog2video/blog2video-remotion/public/slide_12.png"},{"html":"/Users/yufanp/Desktop/Project/blog2video/blog2video-output/thin-harness-fat-skills/slide_13.html","png":"/Users/yufanp/Desktop/Project/blog2video/blog2video-remotion/public/slide_13.png"},{"html":"/Users/yufanp/Desktop/Project/blog2video/blog2video-output/thin-harness-fat-skills/slide_14.html","png":"/Users/yufanp/Desktop/Project/blog2video/blog2video-remotion/public/slide_14.png"}];
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
  