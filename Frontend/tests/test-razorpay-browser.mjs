import { chromium } from 'playwright';

async function testRazorpayBrowserFlow() {
  console.log('======================================================================');
  console.log('💳 BROWSER E2E: RAZORPAY PAYMENT GATEWAY MODAL & DISMISS / SUCCESS TEST');
  console.log('======================================================================\n');

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1280, height: 800 } });
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
    // 1. Prime browser with item
    await page.goto('http://localhost:3000', { waitUntil: 'domcontentloaded' });
    await page.evaluate(() => {
      localStorage.setItem('zmw_cart', JSON.stringify([
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
      ]));
    });

    // 2. Go to checkout directly
    await page.goto('http://localhost:3000/checkout', { waitUntil: 'domcontentloaded' });
    await page.waitForSelector('.cko-page', { timeout: 5000 });

    // Step 1: Contact Info
    await page.locator('.cko-page #email, .cko-page input[name="email"]').fill('kiranraj@example.com');
    await page.locator('.cko-page #phone, .cko-page input[name="phone"]').fill('9876543210');
    await page.locator('button:has-text("CONTINUE TO DELIVERY")').first().click();
    await page.waitForTimeout(500);

    // Step 2: Delivery Address with PIN 641004
    await page.locator('.cko-page input[name="fullName"]').fill('Kiran Raj');
    await page.locator('.cko-page input[name="address"]').fill('102 Avinashi Road');
    await page.locator('.cko-page input[name="city"]').fill('Coimbatore');
    await page.locator('.cko-page input[name="state"]').fill('Tamil Nadu');

    const calcPromise = page.waitForResponse(
      resp => resp.url().includes('/api/shipping/calculate') && resp.status() === 200
    );
    await page.locator('.cko-page input[name="postalCode"]').fill('641004');
    await calcPromise;
    await page.waitForTimeout(300);

    await page.locator('button:has-text("CONTINUE TO PAYMENT")').first().click();
    await page.waitForTimeout(600);

    // Step 3: Payment Method
    await page.waitForSelector('.cko-pm-card', { timeout: 5000 });

    // Select UPI / Razorpay (default)
    const upiCard = page.locator('.cko-pm-card:has-text("UPI")').first();
    await upiCard.click();
    await page.waitForTimeout(300);

    const rzpPayBtn = page.locator('button:has-text("PAY WITH RAZORPAY")').first();
    const btnText = await rzpPayBtn.innerText();
    assert(
      btnText.includes('574'),
      'Razorpay Pay Button Reflects Exact Total (₹500 + ₹74 Shipping)',
      `Button text: "${btnText}"`
    );

    // Track API call to create Razorpay Order
    let rzpOrderPayload = null;
    let rzpOrderResponse = null;

    page.on('request', req => {
      if (req.url().includes('/api/orders/razorpay/create-order')) {
        try { rzpOrderPayload = JSON.parse(req.postData()); } catch (e) {}
      }
    });

    page.on('response', async resp => {
      if (resp.url().includes('/api/orders/razorpay/create-order')) {
        try { rzpOrderResponse = await resp.json(); } catch (e) {}
      }
    });

    // Mock window.Razorpay to test dismissal and callback handling without requiring an actual bank OTP
    await page.evaluate(() => {
      window.__mockRazorpayInstances = [];
      window.Razorpay = function (options) {
        window.__mockRazorpayInstances.push(options);
        this.options = options;
        this.open = function () {
          window.__lastRazorpayOptions = options;
        };
        this.on = function (event, handler) {
          this[`_${event}`] = handler;
        };
      };
    });

    // Click "PAY WITH RAZORPAY • ₹574 →"
    await rzpPayBtn.click();
    await page.waitForTimeout(1000);

    // Verify create-order payload had pincode and shipping fee
    assert(
      rzpOrderPayload && rzpOrderPayload.pincode === '641004' && rzpOrderPayload.shipping_fee === 74,
      'storefrontApi.createRazorpayOrder Invoked with Correct Pincode & Shipping Fee',
      `Payload: ${JSON.stringify({ pincode: rzpOrderPayload?.pincode, fee: rzpOrderPayload?.shipping_fee })}`
    );

    // Verify backend returned genuine Razorpay Order
    assert(
      rzpOrderResponse?.success && rzpOrderResponse?.data?.razorpay_order_id?.startsWith('order_'),
      'Backend Created Authentic Razorpay Order',
      `Order ID: ${rzpOrderResponse?.data?.razorpay_order_id} | Amount: ₹${rzpOrderResponse?.data?.amount / 100} | Fee: ₹${rzpOrderResponse?.data?.shipping_fee}`
    );

    // Test Scenario A: Customer Dismisses / Cancels Razorpay Modal
    console.log('\n--- SCENARIO A: MODAL CANCELLATION / DISMISSAL ---');
    await page.evaluate(() => {
      if (window.__lastRazorpayOptions?.modal?.ondismiss) {
        window.__lastRazorpayOptions.modal.ondismiss();
      }
    });
    await page.waitForTimeout(500);

    const cancelErrorMsg = await page.locator('.cko-submit-error').first().innerText();
    assert(
      cancelErrorMsg.includes('cancelled') || cancelErrorMsg.includes('retry'),
      'Payment Cancellation Handled Gracefully',
      `Notice displayed: "${cancelErrorMsg}"`
    );

    // Test Scenario B: Successful Payment Verification Callback
    console.log('\n--- SCENARIO B: SUCCESSFUL PAYMENT VERIFICATION ---');
    const razorpayOrderId = rzpOrderResponse?.data?.razorpay_order_id;
    const testPaymentId = 'pay_browser_' + Math.random().toString(36).substring(2, 10);
    const crypto = await import('crypto');
    const testSignature = crypto.default
      .createHmac('sha256', '93C5GlOnEIHr19OhtD960RLX')
      .update(`${razorpayOrderId}|${testPaymentId}`)
      .digest('hex');

    // Trigger Razorpay handler callback with genuine HMAC signature
    await page.evaluate(({ orderId, paymentId, signature }) => {
      if (window.__lastRazorpayOptions?.handler) {
        window.__lastRazorpayOptions.handler({
          razorpay_order_id: orderId,
          razorpay_payment_id: paymentId,
          razorpay_signature: signature
        });
      }
    }, { orderId: razorpayOrderId, paymentId: testPaymentId, signature: testSignature });

    // Wait for the luxury confirmation view
    await page.waitForSelector('.cko-success-card', { timeout: 12000 });
    const successText = await page.locator('.cko-success-card').first().innerText();

    assert(
      successText.includes('ZMW-') && successText.includes('574') && successText.includes('Paid'),
      'Successful Payment Verified & Rendered Luxury Order Confirmation',
      `Confirmation Snippet:\n${successText.split('\n').filter(l => l.includes('ZMW-') || l.includes('574') || l.includes('Paid') || l.includes('Payment')).join(' | ')}`
    );

  } catch (err) {
    console.error('Unhandled Razorpay browser test error:', err);
    failed++;
  } finally {
    await browser.close();
  }

  console.log('\n======================================================================');
  console.log(`💳 RAZORPAY BROWSER RESULTS: ${passed} PASSED, ${failed} FAILED`);
  console.log('======================================================================\n');

  if (failed > 0) process.exit(1);
  process.exit(0);
}

testRazorpayBrowserFlow();
