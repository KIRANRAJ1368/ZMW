const http = require('http');
const crypto = require('crypto');

const BASE_URL = 'http://localhost:5000';
const KEY_SECRET = '93C5GlOnEIHr19OhtD960RLX'; // Razorpay test secret

function request(options, body = null) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, body: JSON.parse(data), raw: data });
        } catch (e) {
          resolve({ status: res.statusCode, body: data, raw: data });
        }
      });
    });
    req.on('error', reject);
    if (body) req.write(typeof body === 'string' ? body : JSON.stringify(body));
    req.end();
  });
}

async function runVerification() {
  console.log('======================================================================');
  console.log('🚀 COMPREHENSIVE SHIPPING & PAYMENT GATEWAY VERIFICATION SUITE');
  console.log('======================================================================\n');

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

  // ─────────────────────────────────────────────────────────────────
  // 1. PINCODE SHIPPING CALCULATION ACROSS MULTIPLE INDIAN REGIONS
  // ─────────────────────────────────────────────────────────────────
  console.log('\n--- 1. PINCODE SHIPPING RATE CALCULATION ---');
  const pincodeTestCases = [
    { pin: '641004', name: 'Coimbatore (Local Hub)' },
    { pin: '600001', name: 'Chennai (Tamil Nadu)' },
    { pin: '560001', name: 'Bengaluru (Karnataka)' },
    { pin: '400001', name: 'Mumbai (Maharashtra)' },
    { pin: '110001', name: 'Delhi (NCR)' },
    { pin: '795001', name: 'Imphal (Manipur / North-East)' }
  ];

  const calculatedRates = {};

  for (const tc of pincodeTestCases) {
    try {
      const res = await request({
        hostname: 'localhost',
        port: 5000,
        path: '/api/shipping/calculate',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      }, { pincode: tc.pin });

      const d = res.body?.data;
      const ok = res.status === 200 && d?.is_serviceable === true && typeof d?.shipping_fee === 'number' && d.shipping_fee > 0;
      calculatedRates[tc.pin] = d?.shipping_fee;
      assert(
        ok,
        `Serviceable PIN ${tc.pin} (${tc.name})`,
        `Fee: ₹${d?.shipping_fee} | Courier: ${d?.courier_name} | ETD: ${d?.estimated_delivery} | Source: ${d?.calculation_source}`
      );
    } catch (err) {
      assert(false, `Serviceable PIN ${tc.pin} (${tc.name})`, err.message);
    }
  }

  // Test Invalid / Unserviceable PIN codes
  const invalidPins = [
    { pin: '999999', reason: 'Non-existent / Unserviceable PIN' },
    { pin: '000000', reason: 'Invalid starting digit 0' },
    { pin: '12345', reason: '5 digits (too short)' },
    { pin: 'ABCDEF', reason: 'Alphanumeric invalid' }
  ];

  for (const inv of invalidPins) {
    try {
      const res = await request({
        hostname: 'localhost',
        port: 5000,
        path: '/api/shipping/calculate',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      }, { pincode: inv.pin });

      const d = res.body?.data;
      const errMsg = res.body?.error?.message || d?.message;
      const ok = (res.status === 400 && errMsg?.includes('valid 6-digit')) ||
                 (res.status === 200 && d?.is_serviceable === false);
      assert(
        ok,
        `Rejected Invalid PIN "${inv.pin}" (${inv.reason})`,
        `Status: ${res.status} | is_serviceable: ${d?.is_serviceable ?? false} | message: "${errMsg}"`
      );
    } catch (err) {
      assert(false, `Rejected Invalid PIN "${inv.pin}"`, err.message);
    }
  }

  // ─────────────────────────────────────────────────────────────────
  // 2. SHIPPING FEE CARRIED TO CHECKOUT & RAZORPAY ORDER CREATION
  // ─────────────────────────────────────────────────────────────────
  console.log('\n--- 2. RAZORPAY ORDER CREATION & DYNAMIC SHIPPING INTEGRATION ---');

  // Fetch product 1 info to know exact price
  let productPrice = 500;
  let p1StockBefore = 0;
  let p1VariantStockBefore = 0;
  try {
    const prodRes = await request({
      hostname: 'localhost',
      port: 5000,
      path: '/api/products/1',
      method: 'GET'
    });
    if (prodRes.body?.data) {
      productPrice = Number(prodRes.body.data.price);
      p1StockBefore = Number(prodRes.body.data.stockCount);
      p1VariantStockBefore = Number(prodRes.body.data.variants?.[0]?.stockCount || 0);
      console.log(`ℹ️ Test Product: "${prodRes.body.data.name}" | Price: ₹${productPrice} | Overall Stock: ${p1StockBefore} | Variant M-Black Stock: ${p1VariantStockBefore}`);
    }
  } catch (e) {
    console.warn('Could not fetch product 1 info:', e.message);
  }

  // 2A. Create Razorpay order with PIN 641004 (Coimbatore)
  let rzpOrder641004 = null;
  const expectedFee641004 = calculatedRates['641004'] || 74;
  const expectedTotal641004 = productPrice + expectedFee641004;
  try {
    const res = await request({
      hostname: 'localhost',
      port: 5000,
      path: '/api/orders/razorpay/create-order',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, {
      customer_name: 'Kiran Raj',
      email: 'kiran@example.com',
      phone: '9876543210',
      pincode: '641004',
      items: [{ product_id: 1, quantity: 1, size: 'M', color: 'Black' }]
    });

    rzpOrder641004 = res.body?.data;
    const expectedPaise = Math.round(expectedTotal641004 * 100);
    const ok = res.status === 200 &&
               rzpOrder641004?.razorpay_order_id?.startsWith('order_') &&
               rzpOrder641004?.amount === expectedPaise &&
               rzpOrder641004?.shipping_fee === expectedFee641004;

    assert(
      ok,
      `Razorpay Order Created for Coimbatore (PIN 641004)`,
      `Order ID: ${rzpOrder641004?.razorpay_order_id} | Product: ₹${productPrice} + Shipping: ₹${rzpOrder641004?.shipping_fee} = Total: ₹${expectedTotal641004} (${rzpOrder641004?.amount} paise)`
    );
  } catch (err) {
    assert(false, 'Razorpay Order Created for PIN 641004', err.message);
  }

  // 2B. Create Razorpay order with PIN 400001 (Mumbai) - verify dynamic rate change!
  const expectedFee400001 = calculatedRates['400001'] || 112;
  const expectedTotal400001 = productPrice + expectedFee400001;
  try {
    const res = await request({
      hostname: 'localhost',
      port: 5000,
      path: '/api/orders/razorpay/create-order',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, {
      customer_name: 'Aarav Sharma',
      email: 'aarav@example.com',
      phone: '9876543211',
      pincode: '400001',
      items: [{ product_id: 1, quantity: 1, size: 'M', color: 'Black' }]
    });

    const d = res.body?.data;
    const expectedPaise = Math.round(expectedTotal400001 * 100);
    const ok = res.status === 200 &&
               d?.razorpay_order_id?.startsWith('order_') &&
               d?.amount === expectedPaise &&
               d?.shipping_fee === expectedFee400001;

    assert(
      ok,
      `Razorpay Order Dynamically Adjusted for Mumbai (PIN 400001)`,
      `Order ID: ${d?.razorpay_order_id} | Product: ₹${productPrice} + Shipping: ₹${d?.shipping_fee} = Total: ₹${expectedTotal400001} (${d?.amount} paise)`
    );
  } catch (err) {
    assert(false, 'Razorpay Order Dynamically Adjusted for Mumbai', err.message);
  }

  // ─────────────────────────────────────────────────────────────────
  // 3. COMPLETE PAYMENT FLOW, SIGNATURE VERIFICATION & ORDER CREATION
  // ─────────────────────────────────────────────────────────────────
  console.log('\n--- 3. PAYMENT VERIFICATION & ORDER CREATION (SUCCESS FLOW) ---');
  let confirmedOrder = null;
  const testPaymentId = 'pay_test_' + Math.random().toString(36).substring(2, 12);
  const validSignature = crypto
    .createHmac('sha256', KEY_SECRET)
    .update(`${rzpOrder641004?.razorpay_order_id}|${testPaymentId}`)
    .digest('hex');

  try {
    const verifyRes = await request({
      hostname: 'localhost',
      port: 5000,
      path: '/api/orders/razorpay/verify-payment',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, {
      razorpay_order_id: rzpOrder641004?.razorpay_order_id,
      razorpay_payment_id: testPaymentId,
      razorpay_signature: validSignature,
      order_data: {
        customer_name: 'Kiran Raj',
        email: 'kiran@example.com',
        phone: '9876543210',
        shipping_address: '102 Avinashi Road, Peelamedu',
        city: 'Coimbatore',
        state: 'Tamil Nadu',
        pincode: '641004',
        shipping_fee: expectedFee641004,
        courier_name: 'Shiprocket Express',
        estimated_delivery: '3-5 Business Days',
        items: [{ product_id: 1, quantity: 1, size: 'M', color: 'Black' }]
      }
    });

    confirmedOrder = verifyRes.body?.data;
    const ok = verifyRes.status === 201 &&
               confirmedOrder &&
               confirmedOrder.status === 'confirmed' &&
               confirmedOrder.payment_method === 'PREPAID' &&
               Number(confirmedOrder.shipping_fee) === expectedFee641004 &&
               Number(confirmedOrder.total) === expectedTotal641004 &&
               confirmedOrder.order_number?.startsWith('ZMW-');

    assert(
      ok,
      `Payment Verified & Order Confirmed on Database`,
      `Order #: ${confirmedOrder?.order_number} | Status: ${confirmedOrder?.status} | Payment: ${confirmedOrder?.payment_method} | Shipping: ₹${confirmedOrder?.shipping_fee} | Total: ₹${confirmedOrder?.total}`
    );
  } catch (err) {
    assert(false, 'Payment Verified & Order Confirmed', err.message);
  }

  // 3B. Verify Stock Decrement
  try {
    const prodResAfter = await request({
      hostname: 'localhost',
      port: 5000,
      path: '/api/products/1',
      method: 'GET'
    });
    const p1StockAfter = Number(prodResAfter.body?.data?.stockCount);
    const p1VariantStockAfter = Number(prodResAfter.body?.data?.variants?.[0]?.stockCount || 0);

    const stockDecremented = (p1StockAfter === p1StockBefore - 1) && (p1VariantStockAfter === p1VariantStockBefore - 1);
    assert(
      stockDecremented,
      `Inventory Correctly Decremented Post-Payment`,
      `Overall Stock: ${p1StockBefore} → ${p1StockAfter} (-1) | Variant Stock: ${p1VariantStockBefore} → ${p1VariantStockAfter} (-1)`
    );
  } catch (err) {
    assert(false, 'Inventory Correctly Decremented', err.message);
  }

  // ─────────────────────────────────────────────────────────────────
  // 4. PAYMENT FAILURE, SECURITY & CANCEL SCENARIOS
  // ─────────────────────────────────────────────────────────────────
  console.log('\n--- 4. PAYMENT FAILURE, SECURITY & CANCEL SCENARIOS ---');

  // 4A. Tampered / Bad HMAC Signature Rejection (Security check)
  try {
    const tamperedSig = 'bad_forged_signature_1234567890abcdef0123456789abcdef';
    const fakeVerifyRes = await request({
      hostname: 'localhost',
      port: 5000,
      path: '/api/orders/razorpay/verify-payment',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, {
      razorpay_order_id: rzpOrder641004?.razorpay_order_id,
      razorpay_payment_id: 'pay_fraud_' + Math.random().toString(36).substring(2, 8),
      razorpay_signature: tamperedSig,
      order_data: {
        customer_name: 'Attacker',
        email: 'attacker@example.com',
        phone: '9999999999',
        shipping_address: 'Fake Address',
        city: 'Fake City',
        pincode: '641004',
        items: [{ product_id: 1, quantity: 1, size: 'M', color: 'Black' }]
      }
    });

    const isRejected = fakeVerifyRes.status === 400 &&
                       fakeVerifyRes.body?.error?.message?.includes('signature verification failed');
    assert(
      isRejected,
      `Tampered Signature Correctly Rejected (HTTP 400 Bad Request)`,
      `Status: ${fakeVerifyRes.status} | Response: "${fakeVerifyRes.body?.error?.message}"`
    );
  } catch (err) {
    assert(false, 'Tampered Signature Rejected', err.message);
  }

  // 4B. Missing Required Parameters Rejection
  try {
    const missingParamsRes = await request({
      hostname: 'localhost',
      port: 5000,
      path: '/api/orders/razorpay/verify-payment',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, {
      razorpay_order_id: rzpOrder641004?.razorpay_order_id
      // Missing razorpay_payment_id and razorpay_signature!
    });

    const isRejected = missingParamsRes.status === 400 &&
                       missingParamsRes.body?.error?.message?.includes('Missing required');
    assert(
      isRejected,
      `Missing Payment Parameters Correctly Rejected (HTTP 400 Bad Request)`,
      `Status: ${missingParamsRes.status} | Response: "${missingParamsRes.body?.error?.message}"`
    );
  } catch (err) {
    assert(false, 'Missing Payment Parameters Rejected', err.message);
  }

  // 4C. Idempotency Check (Duplicate Verification Request)
  try {
    const duplicateRes = await request({
      hostname: 'localhost',
      port: 5000,
      path: '/api/orders/razorpay/verify-payment',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, {
      razorpay_order_id: rzpOrder641004?.razorpay_order_id,
      razorpay_payment_id: testPaymentId,
      razorpay_signature: validSignature,
      order_data: {
        customer_name: 'Kiran Raj',
        email: 'kiran@example.com',
        phone: '9876543210',
        shipping_address: '102 Avinashi Road, Peelamedu',
        city: 'Coimbatore',
        state: 'Tamil Nadu',
        pincode: '641004',
        shipping_fee: expectedFee641004,
        items: [{ product_id: 1, quantity: 1, size: 'M', color: 'Black' }]
      }
    });

    const isDuplicateHandled = duplicateRes.status === 200 &&
                               duplicateRes.body?.data?.order_number === confirmedOrder?.order_number;
    assert(
      isDuplicateHandled,
      `Idempotency Guard: Duplicate Verification Request Safely Handled`,
      `Returned Existing Order #${duplicateRes.body?.data?.order_number} without re-processing or double charge`
    );
  } catch (err) {
    assert(false, 'Idempotency Guard', err.message);
  }

  // ─────────────────────────────────────────────────────────────────
  // 5. CASH ON DELIVERY (COD) SHIPPING INTEGRATION
  // ─────────────────────────────────────────────────────────────────
  console.log('\n--- 5. CASH ON DELIVERY (COD) ORDER PLACEMENT ---');
  const expectedFeeBengaluru = calculatedRates['560001'] || 65;
  const expectedTotalBengaluru = productPrice + expectedFeeBengaluru;
  try {
    const codRes = await request({
      hostname: 'localhost',
      port: 5000,
      path: '/api/orders',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, {
      customer_name: 'Vikram Sundaram',
      email: 'vikram@example.com',
      phone: '9876543212',
      shipping_address: '45 MG Road, Indiranagar',
      city: 'Bengaluru',
      state: 'Karnataka',
      pincode: '560001',
      payment_method: 'COD',
      items: [{ product_id: 1, quantity: 1, size: 'M', color: 'Black' }]
    });

    const codOrder = codRes.body?.data;
    const ok = codRes.status === 201 &&
               codOrder &&
               codOrder.payment_method === 'COD' &&
               codOrder.status === 'pending' &&
               Number(codOrder.shipping_fee) === expectedFeeBengaluru &&
               Number(codOrder.total) === expectedTotalBengaluru &&
               codOrder.order_number?.startsWith('ZMW-');

    assert(
      ok,
      `Cash on Delivery Order with Dynamic Shipping Fee (PIN 560001)`,
      `Order #: ${codOrder?.order_number} | Payment: COD | Shipping: ₹${codOrder?.shipping_fee} | Total: ₹${codOrder?.total}`
    );
  } catch (err) {
    assert(false, 'COD Order with Dynamic Shipping', err.message);
  }

  // ─────────────────────────────────────────────────────────────────
  // SUMMARY
  // ─────────────────────────────────────────────────────────────────
  console.log('\n======================================================================');
  console.log(`📊 TEST EXECUTION SUMMARY: ${passed} PASSED, ${failed} FAILED`);
  console.log('======================================================================\n');

  if (failed > 0) process.exit(1);
  process.exit(0);
}

runVerification().catch(err => {
  console.error('Fatal test error:', err);
  process.exit(1);
});
