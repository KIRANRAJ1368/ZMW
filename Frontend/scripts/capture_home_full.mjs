import { chromium } from "playwright";

async function captureFullPage() {
  const browser = await chromium.launch({ headless: true });
  const viewports = [
    { name: "home_full_mobile_375", width: 375, height: 667 },
    { name: "home_full_tablet_768", width: 768, height: 1024 },
    { name: "home_full_desktop_1440", width: 1440, height: 900 }
  ];

  for (const vp of viewports) {
    const page = await browser.newPage({ viewport: { width: vp.width, height: vp.height } });
    await page.goto("http://localhost:3000/", { waitUntil: "networkidle" });
    await page.waitForTimeout(1000);

    const outPath = `C:/Users/KIRAN/.gemini/antigravity/brain/09a6fe57-d0f2-4dae-a523-d94ef2724b12/${vp.name}.png`;
    await page.screenshot({ path: outPath, fullPage: true });
    console.log(`Saved full page: ${outPath}`);
    await page.close();
  }

  await browser.close();
}

captureFullPage().catch(console.error);
