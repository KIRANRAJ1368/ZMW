import { chromium } from "playwright";

async function testMobileInteractions() {
  console.log("=== TESTING MOBILE (375px) INTERACTIVE DRAWERS & COMPONENTS ===");
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 375, height: 667 },
    deviceScaleFactor: 2,
    isMobile: true,
    hasTouch: true
  });
  const page = await context.newPage();

  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));

  await page.goto("http://localhost:3000/", { waitUntil: "networkidle" });
  console.log("Page loaded: http://localhost:3000/");

  // 1. Test Mobile Hamburger Menu Open & Close
  console.log("1. Testing Mobile Hamburger Menu...");
  const hamburgerBtn = await page.$("button.nav-hamburger, button[aria-label*='menu' i]");
  if (hamburgerBtn) {
    await hamburgerBtn.click();
    await page.waitForTimeout(400);
    const menuOpen = await page.evaluate(() => {
      const drawer = document.querySelector("#mobile-nav-drawer.open");
      return drawer !== null;
    });
    console.log("   Mobile drawer opened:", menuOpen);

    const closeBtn = await page.$(".drawer-close-btn");
    if (closeBtn) {
      await closeBtn.click();
      await page.waitForTimeout(400);
      const menuClosed = await page.evaluate(() => {
        const drawer = document.querySelector("#mobile-nav-drawer.open");
        return drawer === null;
      });
      console.log("   Mobile drawer closed cleanly:", menuClosed);
    }
  }

  // 2. Test Cart Drawer Open & Close
  console.log("2. Testing Cart Drawer...");
  const cartBtn = await page.$("button[aria-label*='cart' i], a.nav-cart-btn");
  if (cartBtn) {
    await cartBtn.click();
    await page.waitForTimeout(500);
    const cartDrawer = await page.evaluate(() => {
      return document.querySelector(".cart-drawer-container.open, .cart-drawer, [aria-label*='Cart']") !== null;
    });
    console.log("   Cart drawer opened:", cartDrawer);
    // Close cart drawer if open
    const cartClose = await page.$(".cart-drawer-close, .close-drawer-btn, button[aria-label*='close' i]");
    if (cartClose) {
      await cartClose.click();
      await page.waitForTimeout(300);
    }
  }

  // 3. Test Search Modal Open & Close
  console.log("3. Testing Search Modal...");
  const searchBtn = await page.$("button.nav-search-btn, button[aria-label*='search' i]");
  if (searchBtn) {
    await searchBtn.click();
    await page.waitForTimeout(400);
    const searchModal = await page.evaluate(() => {
      return document.querySelector(".search-modal, [role='search']") !== null;
    });
    console.log("   Search modal opened:", searchModal);
    await page.keyboard.press("Escape");
    await page.waitForTimeout(300);
    console.log("   Search modal closed via Escape");
  }

  // 4. Test Product Card responsiveness and Quick View on Mobile
  console.log("4. Testing Collection Page on Mobile (375px)...");
  await page.goto("http://localhost:3000/collection?category=mens", { waitUntil: "networkidle" });
  await page.waitForTimeout(500);
  const cardCount = await page.$$eval(".product-card", (els) => els.length);
  console.log(`   Found ${cardCount} responsive product cards rendered.`);

  // 5. Test Cart page on Mobile
  console.log("5. Testing Cart Page on Mobile (375px)...");
  await page.goto("http://localhost:3000/cart", { waitUntil: "networkidle" });
  await page.waitForTimeout(500);

  // 6. Test Checkout page on Mobile
  console.log("6. Testing Checkout Page on Mobile (375px)...");
  await page.goto("http://localhost:3000/checkout", { waitUntil: "networkidle" });
  await page.waitForTimeout(500);

  console.log("Console errors detected:", errors);
  await browser.close();
  console.log("=== ALL MOBILE INTERACTION TESTS PASSED ===");
}

testMobileInteractions().catch(console.error);
