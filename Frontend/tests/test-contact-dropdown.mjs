import { chromium } from '../node_modules/playwright/index.mjs';

const SIZES = [
  { name: 'small-mobile', width: 320, height: 650 },
  { name: 'iphone-se', width: 375, height: 667 },
  { name: 'iphone-14', width: 390, height: 844 },
  { name: 'ipad-portrait', width: 768, height: 1024 },
  { name: 'desktop', width: 1280, height: 800 }
];

async function runTests() {
  console.log('======================================================================');
  console.log('📱 CONTACT US: RESPONSIVE ALIGNMENT & CUSTOM DROPDOWN VERIFICATION');
  console.log('======================================================================\n');

  const browser = await chromium.launch({ headless: true });
  let passed = 0;
  let failed = 0;

  function assert(condition, message, details = '') {
    if (condition) {
      console.log(`✅ PASS: ${message}`);
      if (details) console.log(`   └─ ${details}`);
      passed++;
    } else {
      console.error(`❌ FAIL: ${message}`);
      if (details) console.error(`   └─ ${details}`);
      failed++;
    }
  }

  try {
    for (const size of SIZES) {
      console.log(`\n--- TESTING VIEWPORT: ${size.name.toUpperCase()} (${size.width}x${size.height}) ---`);
      const context = await browser.newContext({ viewport: { width: size.width, height: size.height } });
      const page = await context.newPage();

      await page.goto('http://localhost:3000/contact', { waitUntil: 'networkidle' });

      // Check horizontal scroll
      const hasHorizontalScroll = await page.evaluate(() => {
        return document.documentElement.scrollWidth > window.innerWidth;
      });
      assert(!hasHorizontalScroll, `No Horizontal Scrolling on ${size.name}`, `scrollWidth: ${size.width}`);

      // Scroll to form
      await page.evaluate(() => {
        document.querySelector('.contact-form-card').scrollIntoView();
      });
      await page.waitForTimeout(300);

      // Verify custom trigger rendered
      const trigger = page.locator('#contact-category-trigger');
      const isTriggerVisible = await trigger.isVisible();
      assert(isTriggerVisible, `Category Dropdown Trigger is Visible on ${size.name}`);

      // Get trigger bounding box before clicking
      const triggerBox = await trigger.boundingBox();
      assert(triggerBox.width > 200, `Trigger has full field width`, `Width: ${Math.round(triggerBox.width)}px`);

      // Click trigger to open dropdown
      await trigger.click();
      await page.waitForTimeout(300);

      // Verify menu rendered
      const menu = page.locator('.contact-custom-select-menu');
      const isMenuVisible = await menu.isVisible();
      assert(isMenuVisible, `Dropdown Menu Opens on Click on ${size.name}`);

      // Check menu bounding box - must stay strictly within viewport
      const menuBox = await menu.boundingBox();
      const menuRight = menuBox.x + menuBox.width;
      const isWithinBounds = menuRight <= size.width && menuBox.x >= 0;
      assert(isWithinBounds, `Menu is 100% Inside Viewport on ${size.name}`, `Left: ${Math.round(menuBox.x)}px, Right: ${Math.round(menuRight)}px, Viewport: ${size.width}px`);

      // Take screenshot of opened dropdown
      await page.screenshot({ path: `Frontend/contact-dropdown-open-${size.name}.png` });

      // Verify options count
      const options = menu.locator('.contact-custom-select-option');
      const count = await options.count();
      assert(count === 5, `All 5 Categories Present in Dropdown`, `Found ${count} options`);

      // Select "Product Sizing & Fit"
      const sizingOption = menu.locator('.contact-custom-select-option:has-text("Product Sizing & Fit")');
      await sizingOption.click();
      await page.waitForTimeout(300);

      // Verify menu closed after selection
      const isMenuClosed = !(await menu.isVisible());
      assert(isMenuClosed, `Dropdown Closes After Option Selection on ${size.name}`);

      // Verify trigger displays selected option
      const selectedLabel = await trigger.locator('.contact-custom-select-label').innerText();
      assert(selectedLabel === 'Product Sizing & Fit', `Trigger Displays Updated Selection`, `Selected: "${selectedLabel}"`);

      // Verify hidden native select value updated
      const hiddenVal = await page.locator('#contact-category').inputValue();
      assert(hiddenVal === 'sizing', `Hidden Form State Synced`, `Value: "${hiddenVal}"`);

      // Test outside click closes menu
      await trigger.click();
      await page.waitForTimeout(200);
      assert(await menu.isVisible(), `Menu Re-opens on Second Click`);

      // Click on heading outside
      await page.locator('.contact-form-card h3').click();
      await page.waitForTimeout(200);
      assert(!(await menu.isVisible()), `Menu Closes on Outside Click`);

      await context.close();
    }

    // ─────────────────────────────────────────────────────────────────
    // TEST: FORM SUBMISSION INTEGRATION WITH CUSTOM DROPDOWN
    // ─────────────────────────────────────────────────────────────────
    console.log('\n--- TESTING FORM SUBMISSION WITH CUSTOM DROPDOWN ---');
    const submitContext = await browser.newContext({ viewport: { width: 375, height: 667 } });
    const submitPage = await submitContext.newPage();
    await submitPage.goto('http://localhost:3000/contact', { waitUntil: 'networkidle' });

    // Fill form
    await submitPage.fill('#contact-name', 'Test Customer');
    await submitPage.fill('#contact-email', 'test@example.com');
    await submitPage.fill('#contact-phone', '9876543210');
    
    // Select "Returns & Refunds" from dropdown
    await submitPage.click('#contact-category-trigger');
    await submitPage.click('.contact-custom-select-option:has-text("Returns & Refunds")');
    await submitPage.fill('#contact-subject', 'Return Size Request');
    await submitPage.fill('#contact-message', 'I would like to exchange size M for size L.');

    // Submit form
    await submitPage.click('.contact-submit-btn');
    await submitPage.waitForSelector('.contact-submitted-box', { timeout: 5000 });

    const isSubmitted = await submitPage.locator('.contact-submitted-box').isVisible();
    assert(isSubmitted, 'Contact Form Submitted Successfully With Custom Dropdown');

    const summaryTopic = await submitPage.locator('.customer-data-item:has-text("Inquiry Topic") .customer-data-val').innerText();
    assert(summaryTopic.toLowerCase().includes('returns'), 'Submitted Summary Captures Selected Topic', `Topic: "${summaryTopic}"`);

    await submitContext.close();

  } catch (err) {
    console.error('Test error:', err);
    failed++;
  } finally {
    await browser.close();
  }

  console.log('\n======================================================================');
  console.log(`👑 TEST RESULTS: ${passed} PASSED, ${failed} FAILED`);
  console.log('======================================================================');

  if (failed > 0) process.exit(1);
}

runTests().catch(console.error);
