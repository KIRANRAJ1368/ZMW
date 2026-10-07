const assert = require("assert");

async function runTests() {
  const baseUrl = "http://localhost:5000";
  console.log("====================================================");
  console.log("🚚 VERIFYING STRICT PINCODE-ONLY SHIPPING CALCULATION");
  console.log("====================================================");

  // 1. Test Multiple Different Pincodes Across India
  const testCases = [
    { pin: "641004", city: "Coimbatore Local", expectedFee: 40, courier: "BlueDart Express (Shiprocket)" },
    { pin: "600001", city: "Chennai (Tamil Nadu)", expectedFee: 55, courier: "Delhivery Surface (Shiprocket)" },
    { pin: "682001", city: "Kochi (Kerala)", expectedFee: 60, courier: "Shadowfax Express (Shiprocket)" },
    { pin: "560001", city: "Bengaluru (Karnataka)", expectedFee: 65, courier: "DTDC Surface (Shiprocket)" },
    { pin: "500001", city: "Hyderabad (Telangana)", expectedFee: 70, courier: "Xpressbees Surface (Shiprocket)" },
    { pin: "400001", city: "Mumbai (Maharashtra)", expectedFee: 78, courier: "Delhivery Express (Shiprocket)" },
    { pin: "110001", city: "Delhi NCR", expectedFee: 78, courier: "BlueDart Surface (Shiprocket)" },
    { pin: "380001", city: "Ahmedabad (Gujarat)", expectedFee: 85, courier: "Delhivery Surface (Shiprocket)" },
    { pin: "201301", city: "Noida / UP", expectedFee: 90, courier: "Ecom Express (Shiprocket)" },
    { pin: "700001", city: "Kolkata (West Bengal)", expectedFee: 95, courier: "Shiprocket Surface" },
    { pin: "795001", city: "Imphal (Manipur - Remote)", expectedFee: 120, courier: "BlueDart Air (Shiprocket)" }
  ];

  for (const tc of testCases) {
    const res = await fetch(`${baseUrl}/api/shipping/calculate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ pincode: tc.pin })
    });
    const json = await res.json();
    assert.strictEqual(json.success, true);
    assert.strictEqual(json.data.is_serviceable, true);
    assert.strictEqual(json.data.shipping_fee, tc.expectedFee);
    assert.strictEqual(json.data.delivery_pincode, tc.pin);
    // Verify no customer-facing zone, weight, or delivery_days fields
    assert.strictEqual(json.data.zone, undefined);
    assert.strictEqual(json.data.is_free_shipping, undefined);
    assert.strictEqual(json.data.free_shipping_threshold, undefined);
    console.log(`✅ PIN ${tc.pin} (${tc.city}): Fee = ₹${json.data.shipping_fee} (${json.data.courier_name})`);
  }

  // 2. Verify: NO Free Shipping even on very large cart subtotal (e.g. ₹50,000)
  const highSubtotalRes = await fetch(`${baseUrl}/api/shipping/calculate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ pincode: "600001", subtotal: 50000 })
  });
  const highSubtotalData = await highSubtotalRes.json();
  assert.strictEqual(highSubtotalData.success, true);
  assert.strictEqual(highSubtotalData.data.shipping_fee, 55, "High subtotal must NOT zero out shipping fee");
  assert.strictEqual(highSubtotalData.data.is_free_shipping, undefined);
  console.log("✅ High Subtotal (₹50,000) for PIN 600001: Still strictly ₹55 (Free Shipping completely removed)");

  // 3. Verify: Unserviceable PIN (e.g. starting with 9 or 0 or invalid)
  const invalidPinRes = await fetch(`${baseUrl}/api/shipping/calculate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ pincode: "999999" })
  });
  const invalidPinData = await invalidPinRes.json();
  assert.strictEqual(invalidPinData.success, true);
  assert.strictEqual(invalidPinData.data.is_serviceable, false);
  assert.strictEqual(invalidPinData.data.shipping_fee, null);
  console.log("✅ Invalid/Unserviceable PIN 999999 returns is_serviceable: false with null shipping_fee");

  // 4. Verify Razorpay Order Creation uses exact calculated shipping amount
  const catalogRes = await fetch(`${baseUrl}/api/products`);
  const catalogData = await catalogRes.json();
  const testProduct = catalogData.data.find((p) => p.price && p.stock_count > 2) || catalogData.data[0];

  // 4a. Razorpay Order with Coimbatore PIN 641004 (Fee: ₹40)
  const rzpLocalRes = await fetch(`${baseUrl}/api/orders/razorpay/create-order`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      items: [{ product_id: testProduct.id, quantity: 1 }],
      pincode: "641004"
    })
  });
  const rzpLocalData = await rzpLocalRes.json();
  assert.strictEqual(rzpLocalData.success, true);
  const expectedLocalTotal = Number(testProduct.price) + 40;
  assert.strictEqual(rzpLocalData.data.amount, Math.round(expectedLocalTotal * 100));
  console.log(`✅ Razorpay Order (PIN 641004): Product ₹${testProduct.price} + Shipping ₹40 = Total ₹${expectedLocalTotal} (Amount in paise: ${rzpLocalData.data.amount})`);

  // 4b. Razorpay Order with Mumbai PIN 400001 (Fee: ₹78)
  const rzpMumbaiRes = await fetch(`${baseUrl}/api/orders/razorpay/create-order`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      items: [{ product_id: testProduct.id, quantity: 1 }],
      pincode: "400001"
    })
  });
  const rzpMumbaiData = await rzpMumbaiRes.json();
  assert.strictEqual(rzpMumbaiData.success, true);
  const expectedMumbaiTotal = Number(testProduct.price) + 78;
  assert.strictEqual(rzpMumbaiData.data.amount, Math.round(expectedMumbaiTotal * 100));
  console.log(`✅ Razorpay Order (PIN 400001): Product ₹${testProduct.price} + Shipping ₹78 = Total ₹${expectedMumbaiTotal} (Amount in paise: ${rzpMumbaiData.data.amount})`);

  // 4c. Razorpay Order with Manipur PIN 795001 (Fee: ₹120)
  const rzpManipurRes = await fetch(`${baseUrl}/api/orders/razorpay/create-order`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      items: [{ product_id: testProduct.id, quantity: 1 }],
      pincode: "795001"
    })
  });
  const rzpManipurData = await rzpManipurRes.json();
  assert.strictEqual(rzpManipurData.success, true);
  const expectedManipurTotal = Number(testProduct.price) + 120;
  assert.strictEqual(rzpManipurData.data.amount, Math.round(expectedManipurTotal * 100));
  console.log(`✅ Razorpay Order (PIN 795001): Product ₹${testProduct.price} + Shipping ₹120 = Total ₹${expectedManipurTotal} (Amount in paise: ${rzpManipurData.data.amount})`);

  // 5. Verify Final Order Placement via COD with PIN 560001 (Bengaluru, ₹65)
  const codRes = await fetch(`${baseUrl}/api/orders`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      customer_name: "Test Customer",
      email: "test.customer@example.com",
      phone: "9876543210",
      shipping_address: "123 MG Road",
      city: "Bengaluru",
      state: "Karnataka",
      pincode: "560001",
      payment_method: "COD",
      items: [{ product_id: testProduct.id, quantity: 1 }]
    })
  });
  const codData = await codRes.json();
  assert.strictEqual(codData.success, true);
  assert.strictEqual(Number(codData.data.shipping_fee), 65);
  const expectedCodTotal = Number(testProduct.price) + 65;
  assert.strictEqual(Number(codData.data.total), expectedCodTotal);
  console.log(`✅ Final COD Order Placed: Product ₹${testProduct.price} + Shipping ₹65 = Total ₹${expectedCodTotal} (Order: ${codData.data.order_number})`);

  console.log("====================================================");
  console.log("🎉 ALL TESTS PASSED! STRICT PINCODE SHIPPING IS FULLY OPERATIONAL.");
  console.log("====================================================");
}

runTests().catch((err) => {
  console.error("Test execution failed:", err);
  process.exit(1);
});
