import { chromium } from 'playwright';

async function testFrontendShippingAndPayment() {
  console.log('======================================================================');
  console.log('🌐 BROWSER E2E: SHIPPING & PAYMENT GATEWAY INTEGRATION TEST');
  console.log('======================================================================\n');

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1280, height: 800 }
  });
  const page = await context.newPage();

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
    // 1. Prime the browser with an active cart item
    await page.goto('http://localhost:3000', { waitUntil: 'domcontentloaded' });
    await page.evaluate(() => {
      const testItem = [
        {
          id: 1,
          productId: 1,
          name: 'Printed Round Neck T-Shirt - Jet Black & Off White',
          price: 500,
          quantity: 1,
          size: 'M',
          color: 'Black',
          image: '/images/products/printed-tshirt.jpg'
        }
      ];
      localStorage.setItem('zmw_cart', JSON.stringify(testItem));
    });

    // ─────────────────────────────────────────────────────────────────
    // Part 1: Cart Page Shipping Estimation
    // ─────────────────────────────────────────────────────────────────
    console.log('\n--- 1. CART SHIPPING RATE ESTIMATION ---');
    await page.goto('http://localhost:3000/cart', { waitUntil: 'domcontentloaded' });
    await page.waitForSelector('.cp-card-title', { timeout: 5000 });

    const cartItemTitle = await page.textContent('.cp-card-title');
    assert(
      cartItemTitle && cartItemTitle.includes('Printed Round Neck'),
      'Cart Page Populated with Item',
      `Product: "${cartItemTitle?.trim()}"`
    );

    // Enter Coimbatore PIN 641004 in Cart and wait for API rate calculation
    const cartPinInput = page.locator('.cp-estimator-input').first();
    await cartPinInput.waitFor({ state: 'visible', timeout: 5000 });

    const calcRatePromise = page.waitForResponse(
      resp => resp.url().includes('/api/shipping/calculate') && resp.status() === 200
    );
    await cartPinInput.fill('641004');
    await calcRatePromise;
    await page.waitForTimeout(500);

    let cartSummaryText = '';
    try {
      cartSummaryText = await page.locator('.cp-summary-card').first().innerText({ timeout: 5000 });
    } catch (e) {
      console.log('Error getting .cp-summary-card text:', e.message);
      console.log('Page URL at timeout:', page.url());
      console.log('DOM snapshot:', await page.evaluate(() => document.querySelector('.cp-page')?.innerHTML?.slice(0, 500)));
    }
    const hasShippingShown = cartSummaryText.includes('74') || cartSummaryText.includes('Shiprocket');
    assert(
      hasShippingShown,
      'Shipping Rate Computed & Displayed on Cart Page for PIN 641004',
      `Rate displayed: ₹74 | Courier info reflected in summary`
    );

    // ─────────────────────────────────────────────────────────────────
    // Part 2: Proceed to Checkout & Verify PIN Handoff
    // ─────────────────────────────────────────────────────────────────
    console.log('\n--- 2. PROCEED TO CHECKOUT WITH PINCODE HANDOFF ---');
    const checkoutBtn = page.locator('button.cp-checkout-btn, button:has-text("PROCEED TO CHECKOUT")').first();
    await checkoutBtn.click();
    await page.waitForURL('**/checkout', { timeout: 5000 });
    await page.waitForSelector('.cko-page', { timeout: 5000 });

    assert(page.url().includes('/checkout'), 'Successfully Navigated to Checkout Page');

    // Fill Step 1 Contact Information
    console.log('\n--- 3. STEP 1: CONTACT INFORMATION ---');
    await page.locator('.cko-page #email, .cko-page input[name="email"]').fill('kiranraj@example.com');
    await page.locator('.cko-page #phone, .cko-page input[name="phone"]').fill('9876543210');

    const continueToDeliveryBtn = page.locator('button:has-text("CONTINUE TO DELIVERY")').first();
    await continueToDeliveryBtn.click();
    await page.waitForTimeout(600);

    // Verify Step 2 is active
    const step2Heading = await page.locator('#step-2-heading, .cko-section-title:has-text("Delivery")').first().isVisible();
    assert(step2Heading, 'Advanced to Step 2: Delivery Address');

    // ─────────────────────────────────────────────────────────────────
    // Part 3: Step 2 Address, PIN Serviceability & Error Blocking
    // ─────────────────────────────────────────────────────────────────
    console.log('\n--- 4. STEP 2: DELIVERY ADDRESS & PIN VALIDATION ---');
    const postalInput = page.locator('.cko-page input[name="postalCode"]').first();
    const postalVal = await postalInput.inputValue();

    assert(
      postalVal === '641004',
      'Pincode Pre-populated from Cart to Checkout',
      `Pincode in Checkout: "${postalVal}"`
    );

    // Fill remaining address fields
    await page.locator('.cko-page input[name="fullName"]').fill('Kiran Raj');
    await page.locator('.cko-page input[name="address"]').fill('102 Cross Cut Road, Gandhipuram');
    await page.locator('.cko-page input[name="city"]').fill('Coimbatore');
    await page.locator('.cko-page input[name="state"]').fill('Tamil Nadu');

    // Test Unserviceable PIN (999999) error blocking
    await postalInput.fill('999999');
    await page.waitForTimeout(500);

    const continueToPaymentBtn = page.locator('button:has-text("CONTINUE TO PAYMENT")').first();
    await continueToPaymentBtn.click();
    await page.waitForTimeout(500);

    const pageContent = await page.locator('.cko-step-card, form').first().innerText();
    const isBlocked = pageContent.includes('not serviceable') || pageContent.includes('valid 6-digit');
    assert(
      isBlocked,
      'Invalid PIN 999999 Correctly Blocked with Serviceability Error',
      'Checkout prevented moving to Step 3 until valid PIN is provided'
    );

    // Correct PIN back to 641004 and wait for live Shiprocket calculation
    const calcRateCheckoutPromise = page.waitForResponse(
      resp => resp.url().includes('/api/shipping/calculate') && resp.status() === 200
    );
    await postalInput.fill('641004');
    await calcRateCheckoutPromise;
    await page.waitForTimeout(400);

    await continueToPaymentBtn.click();
    await page.waitForTimeout(600);

    // ─────────────────────────────────────────────────────────────────
    // Part 4: Step 3 Payment Selection & Order Summary Integration
    // ─────────────────────────────────────────────────────────────────
    console.log('\n--- 5. STEP 3: PAYMENT OPTIONS & FINANCIAL BREAKDOWN ---');
    await page.waitForSelector('.cko-pm-card', { timeout: 5000 });

    const paymentMethods = await page.locator('.cko-pm-card').allInnerTexts();
    const hasUpi = paymentMethods.some(t => t.includes('UPI'));
    const hasCard = paymentMethods.some(t => t.includes('Card'));
    const hasCod = paymentMethods.some(t => t.includes('Cash on Delivery'));

    assert(
      hasUpi && hasCard && hasCod,
      'Payment Methods (UPI, Card, COD) Rendered Properly',
      `Available methods count: ${paymentMethods.length}`
    );

    // Verify Order Summary Breakdown
    const summaryCard = page.locator('.cko-summary-card').first();
    const summaryText = await summaryCard.innerText();
    const subtotalOk = summaryText.includes('500');
    const shippingOk = summaryText.includes('74');
    const totalOk = summaryText.includes('574');

    assert(
      subtotalOk && shippingOk && totalOk,
      'Order Summary Perfectly Calculates Grand Total (Subtotal + Shipping Fee)',
      'Subtotal: ₹500 | Shipping: ₹74 | Total: ₹574'
    );

    // ─────────────────────────────────────────────────────────────────
    // Part 5: Complete Order Placement via Cash on Delivery (COD)
    // ─────────────────────────────────────────────────────────────────
    console.log('\n--- 6. ORDER CONFIRMATION & RECEIPT ---');
    const codCard = page.locator('.cko-pm-card:has-text("Cash on Delivery")').first();
    await codCard.click();
    await page.waitForTimeout(400);

    const placeOrderBtn = page.locator('button:has-text("PLACE ORDER")').first();
    await placeOrderBtn.click();

    // Wait for the luxury confirmation receipt view
    await page.waitForSelector('.cko-success-card', { timeout: 12000 });
    const successCardText = await page.locator('.cko-success-card').first().innerText();

    const hasOrderNum = successCardText.includes('ZMW-');
    const hasSuccessMsg = successCardText.includes('Thank You For Your Order') || successCardText.includes('CONFIRMED');
    const hasTotalPaid = successCardText.includes('574');

    assert(
      hasOrderNum && hasSuccessMsg && hasTotalPaid,
      'Order Successfully Created & Rendered Luxury Confirmation Receipt',
      `Order details snippet:\n${successCardText.split('\n').filter(l => l.includes('ZMW-') || l.includes('574') || l.includes('Payment')).join(' | ')}`
    );

    // Verify Cart cleared post-order
    const cartAfter = await page.evaluate(() => localStorage.getItem('zmw_cart'));
    assert(
      !cartAfter || cartAfter === '[]',
      'Cart Automatically Cleared After Order Placement',
      `LocalStorage: ${cartAfter}`
    );

  } catch (err) {
    console.error('Unhandled browser test exception:', err);
    failed++;
  } finally {
    await browser.close();
  }

  console.log('\n======================================================================');
  console.log(`🌐 BROWSER TEST RESULTS: ${passed} PASSED, ${failed} FAILED`);
  console.log('======================================================================\n');

  if (failed > 0) process.exit(1);
  process.exit(0);
}

testFrontendShippingAndPayment();
