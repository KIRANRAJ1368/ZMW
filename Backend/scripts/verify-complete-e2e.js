const http = require('http');
const https = require('https');
const crypto = require('crypto');

function request(options, body = null) {
  return new Promise((resolve, reject) => {
    const lib = options.protocol === 'https:' ? https : http;
    const req = lib.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          resolve({ status: res.statusCode, headers: res.headers, body: json, raw: data });
        } catch (e) {
          resolve({ status: res.statusCode, headers: res.headers, body: data, raw: data });
        }
      });
    });
    req.on('error', reject);
    if (body) {
      req.write(typeof body === 'string' ? body : JSON.stringify(body));
    }
    req.end();
  });
}

async function runTests() {
  console.log('====================================================');
  console.log('🚀 RUNNING COMPREHENSIVE E2E VERIFICATION TEST SUITE');
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

  // 1. Health check
  try {
    const health = await request({
      hostname: 'localhost',
      port: 5000,
      path: '/health',
      method: 'GET'
    });
    assert(health.status === 200 && health.body.data.status === 'ok', 'Backend server is running healthy');
  } catch (err) {
    assert(false, `Backend health check failed: ${err.message}`);
  }

  // 2. Products Catalog API check
  let selectedProduct = null;
  try {
    const prodRes = await request({
      hostname: 'localhost',
      port: 5000,
      path: '/api/products?limit=50',
      method: 'GET'
    });
    const products = prodRes.body.data?.products || prodRes.body.data || [];
    assert(prodRes.status === 200 && products.length > 0, `Products API returns ${products.length} catalog items`);
    selectedProduct = products.find(p => (p.in_stock || p.stock_count > 0) && p.id === 2) || products.find(p => p.stock_count > 0) || products[0];
  } catch (err) {
    assert(false, `Products API error: ${err.message}`);
  }

  // 3. Shiprocket Shipping Rate Calculation
  // Test local Coimbatore pincode 641004 (Rs. 40)
  try {
    const resLocal = await request({
      hostname: 'localhost',
      port: 5000,
      path: '/api/shipping/calculate',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, {
      pincode: '641004',
      subtotal: 500
    });
    const fee = resLocal.body.data?.shipping_fee;
    assert(resLocal.status === 200 && fee === 40, `Shipping rate for local (641004) = ₹40 (Actual: ₹${fee}, Zone: ${resLocal.body.data?.zone})`);
  } catch (err) {
    assert(false, `Shipping calculate (local) failed: ${err.message}`);
  }

  // Test metro Mumbai pincode 400001 (Rs. 75)
  try {
    const resMetro = await request({
      hostname: 'localhost',
      port: 5000,
      path: '/api/shipping/calculate',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, {
      pincode: '400001',
      subtotal: 700
    });
    const fee = resMetro.body.data?.shipping_fee;
    assert(resMetro.status === 200 && fee === 75, `Shipping rate for metro (400001) = ₹75 (Actual: ₹${fee}, Zone: ${resMetro.body.data?.zone})`);
  } catch (err) {
    assert(false, `Shipping calculate (metro) failed: ${err.message}`);
  }

  // Test free shipping threshold (subtotal >= 1499)
  try {
    const resFree = await request({
      hostname: 'localhost',
      port: 5000,
      path: '/api/shipping/calculate',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, {
      pincode: '400001',
      subtotal: 1600
    });
    const fee = resFree.body.data?.shipping_fee;
    const isFree = resFree.body.data?.is_free_shipping;
    assert(resFree.status === 200 && fee === 0 && isFree === true, `Free shipping threshold (> ₹1499) returns ₹0 (is_free_shipping: true)`);
  } catch (err) {
    assert(false, `Free shipping calculation failed: ${err.message}`);
  }

  // 4. Admin Login to acquire auth token
  let adminToken = null;
  try {
    const loginRes = await request({
      hostname: 'localhost',
      port: 5000,
      path: '/api/auth/login',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, {
      email: 'adminzmw@gmail.com',
      password: 'Admin@2026'
    });
    if (loginRes.status === 200 && loginRes.body.data?.token) {
      adminToken = loginRes.body.data.token;
      assert(true, `Admin authentication successful (Role: ${loginRes.body.data.user?.role})`);
    } else {
      assert(false, `Admin login failed: ${JSON.stringify(loginRes.body)}`);
    }
  } catch (err) {
    assert(false, `Admin login error: ${err.message}`);
  }

  // 5. Razorpay Payment Flow: Create Order & Verify Payment
  let testOrderNumber = null;
  let testOrderId = null;
  try {
    const rzpCreate = await request({
      hostname: 'localhost',
      port: 5000,
      path: '/api/orders/razorpay/create-order',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, {
      customer: {
        name: 'Automated Tester',
        email: 'tester_auto@example.com',
        phone: '9876543210',
        shippingAddress: {
          name: 'Automated Tester',
          phone: '9876543210',
          addressLine1: '123 Test Avenue, Suite 10',
          city: 'Mumbai',
          state: 'Maharashtra',
          postalCode: '400001',
          country: 'India'
        }
      },
      items: [
        {
          product_id: selectedProduct ? selectedProduct.id : 2,
          quantity: 1,
          size: 'XL',
          color: 'Off White',
          unitPrice: selectedProduct ? Number(selectedProduct.price) : 500,
          title: selectedProduct ? selectedProduct.name : 'Test Watch'
        }
      ],
      shipping_fee: 75,
      courier_name: 'Shiprocket Surface Metro',
      estimated_delivery: '3-4 business days'
    });

    const rzpOrderId = rzpCreate.body.data?.razorpay_order_id || rzpCreate.body.data?.razorpayOrderId;
    assert(rzpCreate.status === 200 && !!rzpOrderId, `Razorpay Order Created: ${rzpOrderId} (Amount: ₹${(rzpCreate.body.data?.amount || 0) / 100})`);

    const testPaymentId = 'pay_test_' + Math.random().toString(36).substring(2, 10);
    const keySecret = '93C5GlOnEIHr19OhtD960RLX';
    const testSignature = crypto
      .createHmac('sha256', keySecret)
      .update(`${rzpOrderId}|${testPaymentId}`)
      .digest('hex');

    const rzpVerify = await request({
      hostname: 'localhost',
      port: 5000,
      path: '/api/orders/razorpay/verify-payment',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, {
      razorpay_order_id: rzpOrderId,
      razorpay_payment_id: testPaymentId,
      razorpay_signature: testSignature,
      order_data: {
        customer_name: 'Automated Tester',
        email: 'tester_auto@example.com',
        phone: '9876543210',
        shipping_address: '123 Test Avenue, Suite 10',
        city: 'Mumbai',
        state: 'Maharashtra',
        pincode: '400001',
        shipping_fee: 75,
        courier_name: 'Shiprocket Surface Metro',
        estimated_delivery: '3-4 business days',
        items: [
          {
            product_id: selectedProduct ? selectedProduct.id : 2,
            quantity: 1,
            size: 'XL',
            color: 'Off White',
            unitPrice: selectedProduct ? Number(selectedProduct.price) : 500,
            title: selectedProduct ? selectedProduct.name : 'Test Product'
          }
        ]
      }
    });

    testOrderNumber = rzpVerify.body.data?.order_number || rzpVerify.body.data?.orderNumber;
    testOrderId = rzpVerify.body.data?.id;
    const totalAmt = rzpVerify.body.data?.total_amount || rzpVerify.body.data?.totalAmount;
    const shippingFee = rzpVerify.body.data?.shipping_fee || rzpVerify.body.data?.shippingFee;

    assert(
      rzpVerify.status === 201 && testOrderNumber && rzpVerify.body.data?.status === 'confirmed',
      `Payment Verified & Order Placed: ${testOrderNumber} (Total: ₹${totalAmt}, Shipping: ₹${shippingFee})`
    );
  } catch (err) {
    assert(false, `Razorpay order/verify flow error: ${err.message}`);
  }

  // 6. Public Order Tracking check
  if (testOrderNumber) {
    try {
      const trackRes = await request({
        hostname: 'localhost',
        port: 5000,
        path: `/api/orders/track?orderNumber=${testOrderNumber}`,
        method: 'GET'
      });
      const returnedOrderNumber = trackRes.body.data?.order_number || trackRes.body.data?.orderNumber;
      assert(trackRes.status === 200 && returnedOrderNumber === testOrderNumber, `Public Order Tracking returns live order state for ${testOrderNumber} (Status: ${trackRes.body.data?.status})`);
    } catch (err) {
      assert(false, `Tracking endpoint failed: ${err.message}`);
    }
  }

  // 7. Admin Shipping API: List Shipments
  if (adminToken) {
    try {
      const shipList = await request({
        hostname: 'localhost',
        port: 5000,
        path: '/api/shipping/shipments?limit=10',
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${adminToken}`
        }
      });
      const shipments = shipList.body.data?.shipments || [];
      const total = shipList.body.data?.pagination?.total || shipments.length;
      assert(
        shipList.status === 200 && Array.isArray(shipments),
        `Admin Shipping API lists ${shipments.length} shipments (Total records in DB: ${total})`
      );
    } catch (err) {
      assert(false, `Admin shipping list failed: ${err.message}`);
    }

    // 8. Admin Shipping AWB Generation
    if (testOrderId) {
      try {
        const awbRes = await request({
          hostname: 'localhost',
          port: 5000,
          path: `/api/shipping/shipments/${testOrderId}/generate-awb`,
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${adminToken}`,
            'Content-Type': 'application/json'
          }
        }, {
          courierCode: 'SR_SURFACE'
        });
        const awb = awbRes.body.data?.awb_code;
        const shipStatus = awbRes.body.data?.shipping_status;
        assert(
          awbRes.status === 200 && !!awb,
          `Shiprocket AWB Generated for Order #${testOrderId}: AWB Code = ${awb} (Shipping Status: ${shipStatus})`
        );
      } catch (err) {
        assert(false, `Admin AWB generation failed: ${err.message}`);
      }

      // 9. Admin Shipping Status Update
      try {
        const statusRes = await request({
          hostname: 'localhost',
          port: 5000,
          path: `/api/shipping/shipments/${testOrderId}/status`,
          method: 'PATCH',
          headers: {
            'Authorization': `Bearer ${adminToken}`,
            'Content-Type': 'application/json'
          }
        }, {
          shipping_status: 'in_transit'
        });
        const newStatus = statusRes.body.data?.shipping_status;
        assert(
          statusRes.status === 200 && newStatus === 'in_transit',
          `Shipping Status for Order #${testOrderId} updated to '${newStatus}'`
        );
      } catch (err) {
        assert(false, `Admin shipping status update failed: ${err.message}`);
      }

      // 10. Admin Shipment Detail API
      try {
        const detailRes = await request({
          hostname: 'localhost',
          port: 5000,
          path: `/api/shipping/shipments/${testOrderId}`,
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${adminToken}`
          }
        });
        const shipmentData = detailRes.body.data?.shipment || detailRes.body.data;
        assert(
          detailRes.status === 200 && shipmentData && shipmentData.id === testOrderId,
          `Admin Shipment Detail API returns complete tracking & order info for Order #${testOrderId} (Shipping Status: ${shipmentData?.shipping_status})`
        );
      } catch (err) {
        assert(false, `Admin shipment detail failed: ${err.message}`);
      }
    }
  }

  console.log('\n====================================================');
  console.log(`FINAL RESULT: ${passed} PASSED, ${failed} FAILED`);
  console.log('====================================================\n');

  if (failed > 0) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}

runTests();
