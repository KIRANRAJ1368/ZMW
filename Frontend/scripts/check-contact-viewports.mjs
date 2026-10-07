import { chromium } from '../node_modules/playwright/index.mjs';

const VIEWPORTS = [
  { name: 'small-mobile', width: 320, height: 600 },
  { name: 'iphone-se', width: 375, height: 667 },
  { name: 'iphone-14', width: 390, height: 844 },
  { name: 'ipad-portrait', width: 768, height: 1024 },
  { name: 'ipad-landscape', width: 1024, height: 768 },
  { name: 'desktop', width: 1440, height: 900 }
];

async function checkContactPage() {
  const browser = await chromium.launch({ headless: true });

  for (const vp of VIEWPORTS) {
    const page = await browser.newPage({ viewport: { width: vp.width, height: vp.height } });
    await page.goto('http://localhost:3000/contact', { waitUntil: 'networkidle' });

    const report = await page.evaluate(() => {
      const scrollWidth = document.documentElement.scrollWidth;
      const clientWidth = document.documentElement.clientWidth;
      const hasHorizontalScroll = scrollWidth > clientWidth;

      const elements = Array.from(document.querySelectorAll('.contact-page *'));
      const misaligned = [];

      elements.forEach(el => {
        const rect = el.getBoundingClientRect();
        if (rect.right > window.innerWidth + 1) {
          misaligned.push({
            tag: el.tagName,
            cls: el.className,
            right: rect.right,
            diff: rect.right - window.innerWidth
          });
        }
      });

      return {
        hasHorizontalScroll,
        scrollWidth,
        clientWidth,
        misaligned
      };
    });

    console.log(`Viewport: ${vp.name} (${vp.width}x${vp.height}):`);
    console.log(`  Horizontal scroll: ${report.hasHorizontalScroll ? 'YES (OVERFLOW!)' : 'No'}`);
    if (report.misaligned.length > 0) {
      console.log('  Misaligned elements:', report.misaligned);
    } else {
      console.log('  All .contact-page elements within bounds.');
    }
    
    // Screenshot
    await page.screenshot({ path: `Frontend/contact-${vp.name}.png`, fullPage: false });
    await page.close();
  }

  await browser.close();
}

checkContactPage().catch(console.error);
