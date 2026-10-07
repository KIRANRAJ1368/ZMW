import { chromium } from '../node_modules/playwright/index.mjs';

async function runTest() {
  console.log('======================================================================');
  console.log('💳 CHECKOUT: CASH ON DELIVERY & RAZORPAY VERIFICATION');
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
    const context = await browser.newContext({ viewport: { width: 1280, height: 800 } });
    const page = await context.newPage();

    // 1. Prime cart in localStorage and navigate to /cart
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

    await page.goto('http://localhost:3000/cart', { waitUntil: 'domcontentloaded' });
    await page.waitForSelector('.cp-card-title', { timeout: 5000 });

    // Click Proceed to Checkout
    const checkoutBtn = page.locator('button:has-text("PROCEED TO CHECKOUT"), .cp-checkout-btn').first();
    await checkoutBtn.click();
    await page.waitForURL('**/checkout', { timeout: 5000 });
    await page.waitForSelector('.cko-page', { timeout: 5000 });

    // 2. Complete Step 1: Contact
    console.log('--- STEP 1: CONTACT DETAILS ---');
    await page.locator('#email').fill('tester@zmwclothing.com');
    await page.locator('#phone').fill('9876543210');
    await page.locator('button:has-text("CONTINUE TO DELIVERY")').first().click();
    await page.waitForTimeout(600);

    // 3. Complete Step 2: Delivery & Shipping Calculation
    console.log('--- STEP 2: DELIVERY ADDRESS & PINCODE CALCULATION ---');
    await page.locator('#fullName').fill('QA Tester');
    await page.locator('#deliveryPhone').fill('9876543210');
    await page.locator('#address').fill('123 Cross Cut Road');
    await page.locator('#city').fill('Coimbatore');
    await page.locator('#state').fill('Tamil Nadu');
    await page.locator('#postalCode').fill('641004');

    // Wait for Shiprocket rate calculation
    await page.waitForTimeout(1200);
    await page.locator('button:has-text("CONTINUE TO PAYMENT")').first().click();
    await page.waitForTimeout(600);

    // 4. Inspect Step 3: Payment Methods
    console.log('--- STEP 3: PAYMENT METHOD SELECTION ---');
    const paymentCards = page.locator('.cko-pm-card');
    const cardCount = await paymentCards.count();
    assert(cardCount === 2, `Exactly 2 Payment Methods Rendered (Razorpay & COD)`, `Count: ${cardCount}`);

    const cardTexts = await paymentCards.allInnerTexts();
    console.log('Payment Methods Found:', cardTexts.map(t => t.split('\n')[0]));

    const hasRazorpay = cardTexts.some(t => t.includes('Razorpay'));
    const hasCod = cardTexts.some(t => t.includes('Cash on Delivery'));
    assert(hasRazorpay, 'Razorpay Payment Option is Present');
    assert(hasCod, 'Cash on Delivery (COD) Payment Option is Present');

    // Verify Razorpay selected by default
    const rzpSelected = await page.locator('.cko-pm-card.--selected:has-text("Razorpay")').isVisible();
    assert(rzpSelected, 'Razorpay is Selected by Default');

    // Verify Razorpay Info Box and Button text
    const rzpInfoBox = await page.locator('.cko-razorpay-info-box').isVisible();
    assert(rzpInfoBox, 'Razorpay Security Info Box is Visible');
    const rzpBtnText = await page.locator('.cko-btn-primary').innerText();
    assert(rzpBtnText.includes('PAY WITH RAZORPAY'), 'Submit Button Displays "PAY WITH RAZORPAY"', `Text: "${rzpBtnText}"`);

    // Switch to COD
    console.log('--- SWITCHING TO CASH ON DELIVERY ---');
    await page.click('.cko-pm-card:has-text("Cash on Delivery")');
    await page.waitForTimeout(300);

    const codSelected = await page.locator('.cko-pm-card.--selected:has-text("Cash on Delivery")').isVisible();
    assert(codSelected, 'Cash on Delivery is Now Selected');

    const codInfoBox = await page.locator('.cko-cod-info-box').isVisible();
    assert(codInfoBox, 'Cash on Delivery Info Box is Visible');
    const codBtnText = await page.locator('.cko-btn-primary').innerText();
    assert(codBtnText.includes('PLACE ORDER (COD)'), 'Submit Button Displays "PLACE ORDER (COD)"', `Text: "${codBtnText}"`);

    // 5. Test Cash on Delivery Order Placement & Execution
    console.log('--- EXECUTING CASH ON DELIVERY ORDER PLACEMENT ---');
    await page.locator('.cko-btn-primary').click();
    await page.waitForSelector('.cko-success-container', { timeout: 10000 });

    const isOrderSuccess = await page.locator('.cko-success-container').isVisible();
    assert(isOrderSuccess, 'COD Order Placed and Receipt Displayed');

    const orderNumber = await page.locator('.cko-rr-value').first().innerText();
    assert(orderNumber.startsWith('ZMW-'), `Valid Order Number Generated: ${orderNumber}`);

    const paymentMethodReceipt = await page.locator('.cko-rr-row:has-text("Payment Method") .cko-rr-value').innerText();
    assert(paymentMethodReceipt.toLowerCase().includes('cash on delivery'), `Receipt Displays Payment Method: "${paymentMethodReceipt}"`);

    // 6. Test Razorpay Backend API Flow directly
    console.log('--- TESTING RAZORPAY BACKEND API FLOW ---');
    const rzpOrderRes = await page.evaluate(async () => {
      const resp = await fetch('http://localhost:5000/api/orders/razorpay/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: [{ product_id: 1, quantity: 1, size: 'M', color: 'Navy Blue' }],
          customer_name: 'QA Tester',
          email: 'tester@zmwclothing.com',
          phone: '9876543210',
          pincode: '641004'
        })
      });
      return resp.json();
    });

    assert(rzpOrderRes.success && rzpOrderRes.data?.razorpay_order_id, 'Razorpay Order Created on Backend', `ID: ${rzpOrderRes.data?.razorpay_order_id}`);

    // Verify HMAC verification on backend
    const crypto = await import('crypto');
    const keySecret = 'D2f9B7q1A5x8K3m6L0p4N7v2'; // test secret from .env
    const fakePaymentId = 'pay_test_' + Date.now();
    const signature = crypto.createHmac('sha256', keySecret)
      .update(`${rzpOrderRes.data.razorpay_order_id}|${fakePaymentId}`)
      .digest('hex');

    const verifyRes = await page.evaluate(async (payload) => {
      const resp = await fetch('http://localhost:5000/api/orders/razorpay/verify-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      return resp.json();
    }, {
      razorpay_order_id: rzpOrderRes.data.razorpay_order_id,
      razorpay_payment_id: fakePaymentId,
      razorpay_signature: signature,
      order_data: {
        customer_name: 'QA Tester',
        email: 'tester@zmwclothing.com',
        phone: '9876543210',
        shipping_address: '123 Cross Cut Road',
        city: 'Coimbatore',
        state: 'Tamil Nadu',
        pincode: '641004',
        shipping_fee: 60,
        items: [{ product_id: 1, quantity: 1, size: 'M', color: 'Navy Blue' }]
      }
    });

    assert(verifyRes.success && verifyRes.data?.order_number, 'Razorpay Payment Verified & Order Saved in DB', `Order: ${verifyRes.data?.order_number}, Status: ${verifyRes.data?.status}`);
    assert(verifyRes.data?.payment_method === 'PREPAID', 'Order Saved as PREPAID in Database');

    await context.close();
  } catch (err) {
    console.error('Test error:', err);
    failed++;
  } finally {
    await browser.close();
  }

  console.log('\n======================================================================');
  console.log(`👑 RESULTS: ${passed} PASSED, ${failed} FAILED`);
  console.log('======================================================================');

  if (failed > 0) process.exit(1);
}

runTest().catch(console.error);
