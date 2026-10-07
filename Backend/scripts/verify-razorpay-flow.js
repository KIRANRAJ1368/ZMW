const http = require('http');
const crypto = require('crypto');

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

async function testRazorpayEndToEnd() {
  console.log('====================================================');
  console.log('💳 IN-DEPTH RAZORPAY PAYMENT GATEWAY VERIFICATION');
  console.log('====================================================\n');

  let passed = 0;
  let failed = 0;

  function assert(condition, message) {
    if (condition) {
      console.log(`✅ PASS: ${message}`);
      passed++;
    } else {
      console.error(`❌ FAIL: ${message}`);
      failed++;
    }
  }

  // 1. Test create-order with Product 1 (which previously had 0 stock)
  let rzpOrderData = null;
  try {
    const createRes = await request({
      hostname: 'localhost',
      port: 5000,
      path: '/api/orders/razorpay/create-order',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, {
      customer_name: 'Kiran Raj',
      email: 'kiranraj@example.com',
      phone: '9876543210',
      pincode: '641004',
      shipping_fee: 40,
      items: [
        {
          product_id: 1,
          quantity: 1,
          size: 'M',
          color: 'Black'
        }
      ]
    });

    rzpOrderData = createRes.body.data;
    assert(
      createRes.status === 200 && rzpOrderData && rzpOrderData.razorpay_order_id.startsWith('order_'),
      `Order 1 created on Razorpay: ${rzpOrderData?.razorpay_order_id} (Amount: ₹${(rzpOrderData?.amount || 0) / 100}, Fee: ₹${rzpOrderData?.shipping_fee})`
    );
  } catch (err) {
    assert(false, `Product 1 create-order failed: ${err.message}`);
  }

  // 2. Test create-order with unselected size/color (graceful fallback)
  try {
    const fallbackRes = await request({
      hostname: 'localhost',
      port: 5000,
      path: '/api/orders/razorpay/create-order',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, {
      customer_name: 'Kiran Raj',
      email: 'kiranraj@example.com',
      phone: '9876543210',
      pincode: '400001',
      shipping_fee: 75,
      items: [
        {
          product_id: 2,
          quantity: 1
          // Notice: no size or color specified!
        }
      ]
    });
    assert(
      fallbackRes.status === 200 && fallbackRes.body.data?.razorpay_order_id,
      `Order with unselected variant combination gracefully matches available stock: ${fallbackRes.body.data?.razorpay_order_id}`
    );
  } catch (err) {
    assert(false, `Fallback variant create-order failed: ${err.message}`);
  }

  // 3. Test genuine payment verification with correct HMAC SHA256 signature
  let verifiedOrder = null;
  const testPaymentId = 'pay_rzptest_' + Math.random().toString(36).substring(2, 10);
  const keySecret = '93C5GlOnEIHr19OhtD960RLX';

  if (rzpOrderData?.razorpay_order_id) {
    const validSignature = crypto
      .createHmac('sha256', keySecret)
      .update(`${rzpOrderData.razorpay_order_id}|${testPaymentId}`)
      .digest('hex');

    try {
      const verifyRes = await request({
        hostname: 'localhost',
        port: 5000,
        path: '/api/orders/razorpay/verify-payment',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      }, {
        razorpay_order_id: rzpOrderData.razorpay_order_id,
        razorpay_payment_id: testPaymentId,
        razorpay_signature: validSignature,
        order_data: {
          customer_name: 'Kiran Raj',
          email: 'kiranraj@example.com',
          phone: '9876543210',
          shipping_address: '123 Cross Street, Peelamedu',
          city: 'Coimbatore',
          state: 'Tamil Nadu',
          pincode: '641004',
          shipping_fee: 40,
          courier_name: 'Shiprocket Express',
          estimated_delivery: '2-3 Business Days',
          items: [
            {
              product_id: 1,
              quantity: 1,
              size: 'M',
              color: 'Black'
            }
          ]
        }
      });

      verifiedOrder = verifyRes.body.data;
      assert(
        verifyRes.status === 201 && verifiedOrder && verifiedOrder.status === 'confirmed',
        `Payment verified & confirmed: ${verifiedOrder?.order_number} (Status: ${verifiedOrder?.status}, Shipping: ${verifiedOrder?.shipping_status})`
      );
    } catch (err) {
      assert(false, `Payment verification failed: ${err.message}`);
    }

    // 4. Test idempotency (duplicate payment verification request)
    try {
      const duplicateRes = await request({
        hostname: 'localhost',
        port: 5000,
        path: '/api/orders/razorpay/verify-payment',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      }, {
        razorpay_order_id: rzpOrderData.razorpay_order_id,
        razorpay_payment_id: testPaymentId,
        razorpay_signature: validSignature,
        order_data: {
          customer_name: 'Kiran Raj',
          email: 'kiranraj@example.com',
          phone: '9876543210',
          shipping_address: '123 Cross Street, Peelamedu',
          city: 'Coimbatore',
          state: 'Tamil Nadu',
          pincode: '641004',
          shipping_fee: 40,
          items: [{ product_id: 1, quantity: 1 }]
        }
      });

      assert(
        duplicateRes.status === 200 && duplicateRes.body.data?.order_number === verifiedOrder?.order_number,
        `Idempotency verified: Duplicate verification request gracefully returns existing order ${duplicateRes.body.data?.order_number}`
      );
    } catch (err) {
      assert(false, `Idempotency check failed: ${err.message}`);
    }

    // 5. Test tamper resistance (fake signature rejection)
    try {
      const fakeSignature = 'bad_tampered_signature_1234567890abcdef';
      const fakeVerifyRes = await request({
        hostname: 'localhost',
        port: 5000,
        path: '/api/orders/razorpay/verify-payment',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      }, {
        razorpay_order_id: rzpOrderData.razorpay_order_id,
        razorpay_payment_id: 'pay_fraud_12345',
        razorpay_signature: fakeSignature,
        order_data: {
          customer_name: 'Hacker',
          email: 'fraud@example.com',
          phone: '9999999999',
          shipping_address: 'Fake St',
          city: 'Fake',
          pincode: '641004',
          items: [{ product_id: 1, quantity: 1 }]
        }
      });

      assert(
        fakeVerifyRes.status === 400 && fakeVerifyRes.body.error?.message.includes('signature verification failed'),
        `Tamper security verified: Tampered/invalid signature correctly rejected with 400 Bad Request`
      );
    } catch (err) {
      assert(false, `Tamper test failed: ${err.message}`);
    }
  }

  console.log('\n====================================================');
  console.log(`RAZORPAY TEST RESULTS: ${passed} PASSED, ${failed} FAILED`);
  console.log('====================================================\n');

  if (failed > 0) process.exit(1);
}

testRazorpayEndToEnd();
