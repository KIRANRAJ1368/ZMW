import { chromium } from '../node_modules/playwright/index.mjs';

async function main() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  const imgUri = 'file:///C:/Users/KIRAN/.gemini/antigravity/brain/c90ef82c-4779-4196-8ed0-c22ab11401e6/.user_uploaded/media_1791281419654.png';
  await page.goto(imgUri);
  const size = await page.evaluate(() => {
    const img = document.querySelector('img');
    return { width: img.naturalWidth, height: img.naturalHeight };
  });
  console.log('User image dimensions:', size);

  // Take a crop around the dropdown area to see clearly
  // The viewport in screenshot:
  // Let's take a crop of the dropdown area:
  // x: 150 to 550, y: 150 to 550
  await page.setViewportSize({ width: size.width, height: size.height });
  await page.screenshot({
    path: 'Frontend/dropdown-crop.png',
    clip: { x: 100, y: 150, width: 450, height: 400 }
  });
  console.log('Saved crop to Frontend/dropdown-crop.png');

  await browser.close();
}

main().catch(console.error);
