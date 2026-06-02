
    const puppeteer = require('puppeteer');
    (async () => {
      const browser = await puppeteer.launch({
        headless: 'new',
        args: ['--no-sandbox', '--disable-setuid-sandbox']
      });
      const page = await browser.newPage();
      await page.setViewport({ width: 1080, height: 1920 });

      const files = [{"html":"/home/ubuntu/blog2video/blog2video-output/pejmanjohn-2061091767030825003/cover_photo.html","png":"/home/ubuntu/blog2video/blog2video-remotion/public/cover_photo.png","outputPng":"/home/ubuntu/blog2video/blog2video-output/pejmanjohn-2061091767030825003/video_1_cover_photo.png"},{"html":"/home/ubuntu/blog2video/blog2video-output/pejmanjohn-2061091767030825003/slide_1.html","png":"/home/ubuntu/blog2video/blog2video-remotion/public/slide_1.png"},{"html":"/home/ubuntu/blog2video/blog2video-output/pejmanjohn-2061091767030825003/slide_2.html","png":"/home/ubuntu/blog2video/blog2video-remotion/public/slide_2.png"},{"html":"/home/ubuntu/blog2video/blog2video-output/pejmanjohn-2061091767030825003/slide_3.html","png":"/home/ubuntu/blog2video/blog2video-remotion/public/slide_3.png"},{"html":"/home/ubuntu/blog2video/blog2video-output/pejmanjohn-2061091767030825003/slide_4.html","png":"/home/ubuntu/blog2video/blog2video-remotion/public/slide_4.png"},{"html":"/home/ubuntu/blog2video/blog2video-output/pejmanjohn-2061091767030825003/slide_5.html","png":"/home/ubuntu/blog2video/blog2video-remotion/public/slide_5.png"},{"html":"/home/ubuntu/blog2video/blog2video-output/pejmanjohn-2061091767030825003/slide_6.html","png":"/home/ubuntu/blog2video/blog2video-remotion/public/slide_6.png"},{"html":"/home/ubuntu/blog2video/blog2video-output/pejmanjohn-2061091767030825003/slide_7.html","png":"/home/ubuntu/blog2video/blog2video-remotion/public/slide_7.png"},{"html":"/home/ubuntu/blog2video/blog2video-output/pejmanjohn-2061091767030825003/slide_8.html","png":"/home/ubuntu/blog2video/blog2video-remotion/public/slide_8.png"},{"html":"/home/ubuntu/blog2video/blog2video-output/pejmanjohn-2061091767030825003/slide_9.html","png":"/home/ubuntu/blog2video/blog2video-remotion/public/slide_9.png"},{"html":"/home/ubuntu/blog2video/blog2video-output/pejmanjohn-2061091767030825003/slide_10.html","png":"/home/ubuntu/blog2video/blog2video-remotion/public/slide_10.png"},{"html":"/home/ubuntu/blog2video/blog2video-output/pejmanjohn-2061091767030825003/slide_11.html","png":"/home/ubuntu/blog2video/blog2video-remotion/public/slide_11.png"},{"html":"/home/ubuntu/blog2video/blog2video-output/pejmanjohn-2061091767030825003/slide_12.html","png":"/home/ubuntu/blog2video/blog2video-remotion/public/slide_12.png"}];
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
  