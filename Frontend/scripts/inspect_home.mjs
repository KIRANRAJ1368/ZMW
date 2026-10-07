import { chromium } from "playwright";

const VIEWPORTS = [
  { name: "mobile_375", width: 375, height: 667 },
  { name: "mobile_412", width: 412, height: 915 },
  { name: "tablet_768", width: 768, height: 1024 },
  { name: "desktop_1440", width: 1440, height: 900 }
];

async function inspectHome() {
  console.log("=== INSPECTING HOME PAGE UI ACROSS ALL DEVICES ===");
  const browser = await chromium.launch({ headless: true });

  for (const vp of VIEWPORTS) {
    console.log(`\n--------------------------------------------------`);
    console.log(`VIEWPORT: ${vp.name} (${vp.width}x${vp.height})`);
    console.log(`--------------------------------------------------`);

    const context = await browser.newContext({ viewport: { width: vp.width, height: vp.height } });
    const page = await context.newPage();

    await page.goto("http://localhost:3000/", { waitUntil: "networkidle" });
    await page.waitForTimeout(1000);

    const details = await page.evaluate(() => {
      // 1. Hero banner check
      const hero = document.querySelector(".hero, .hero-section, section");
      const heroTitle = document.querySelector(".hero-title, .hero h1, h1");
      const heroButtons = document.querySelectorAll(".hero a, .hero button, .hero-cta");

      // 2. Sections check
      const sections = Array.from(document.querySelectorAll("section")).map((s, idx) => {
        const title = s.querySelector("h2, h3, .section-title")?.textContent?.trim() || `Section #${idx + 1}`;
        const rect = s.getBoundingClientRect();
        return {
          title,
          height: Math.round(rect.height),
          width: Math.round(rect.width)
        };
      });

      // 3. Product cards check
      const cards = document.querySelectorAll(".product-card, .curated-card, article");
      const cardRects = Array.from(cards).slice(0, 4).map((c) => {
        const rect = c.getBoundingClientRect();
        return { width: Math.round(rect.width), height: Math.round(rect.height) };
      });

      // 4. Category Grid cards
      const catCards = document.querySelectorAll(".category-card, .cat-card, .feature-grid-card");
      const catRects = Array.from(catCards).slice(0, 4).map((c) => {
        const rect = c.getBoundingClientRect();
        return { width: Math.round(rect.width), height: Math.round(rect.height) };
      });

      // 5. Benefits grid
      const benefitCards = document.querySelectorAll(".home-benefit-card");
      const benefitGrid = document.querySelector(".home-benefits-grid");
      let benefitGridCols = "unknown";
      if (benefitGrid) {
        benefitGridCols = window.getComputedStyle(benefitGrid).gridTemplateColumns;
      }

      return {
        hero: {
          title: heroTitle?.textContent?.trim(),
          titleFontSize: heroTitle ? window.getComputedStyle(heroTitle).fontSize : null,
          buttonsCount: heroButtons.length
        },
        sections,
        productCardCount: cards.length,
        sampleCardSizes: cardRects,
        categoryCardCount: catCards.length,
        sampleCategorySizes: catRects,
        benefits: {
          count: benefitCards.length,
          columns: benefitGridCols
        }
      };
    });

    console.log("Hero:", JSON.stringify(details.hero));
    console.log("Rendered Sections (" + details.sections.length + "):");
    details.sections.forEach((s) => console.log(`   - ${s.title.padEnd(30)} : ${s.width}x${s.height}px`));
    console.log(`Product Cards: ${details.productCardCount} rendered, sample sizes:`, JSON.stringify(details.sampleCardSizes));
    console.log(`Category Cards: ${details.categoryCardCount} rendered, sample sizes:`, JSON.stringify(details.sampleCategorySizes));
    console.log(`Benefits Grid: ${details.benefits.count} cards, CSS cols: ${details.benefits.columns}`);

    await context.close();
  }

  await browser.close();
  console.log("\n=== INSPECTION COMPLETED ===");
}

inspectHome().catch(console.error);
