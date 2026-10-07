/**
 * Comprehensive verification for Shiprocket Pincode Shipping Calculation
 */

const assert = require("assert");

async function runTests() {
  console.log("====================================================");
  console.log("🚚 VERIFYING SHIPROCKET PINCODE SHIPPING RATE CALCULATION");
  console.log("====================================================");

  const baseUrl = "http://localhost:5000";

  // Test 1: Local Coimbatore Pincode (641004) -> ₹40
  const localRes = await fetch(`${baseUrl}/api/shipping/calculate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ pincode: "641004", items: [{ quantity: 1 }], subtotal: 500 })
  });
  const localData = await localRes.json();
  assert.strictEqual(localData.success, true);
  assert.strictEqual(localData.data.zone, "Local");
  assert.strictEqual(localData.data.shipping_fee, 40);
  assert.strictEqual(localData.data.is_free_shipping, false);
  console.log("✅ PASS 1: Local PIN 641004 (Coimbatore) calculated rate = ₹40 (Zone: Local, 1–2 Days)");

  // Test 2: Regional Tamil Nadu Pincode (625001 - Madurai) -> ₹60
  const regionalRes = await fetch(`${baseUrl}/api/shipping/calculate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ pincode: "625001", items: [{ quantity: 1 }], subtotal: 500 })
  });
  const regionalData = await regionalRes.json();
  assert.strictEqual(regionalData.success, true);
  assert.strictEqual(regionalData.data.zone, "Regional");
  assert.strictEqual(regionalData.data.shipping_fee, 60);
  console.log("✅ PASS 2: Regional PIN 625001 (Madurai, TN) calculated rate = ₹60 (Zone: Regional)");

  // Test 3: Key Metro Pincode (400001 - Mumbai) -> ₹75
  const metroRes = await fetch(`${baseUrl}/api/shipping/calculate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ pincode: "400001", items: [{ quantity: 1 }], subtotal: 500 })
  });
  const metroData = await metroRes.json();
  assert.strictEqual(metroData.success, true);
  assert.strictEqual(metroData.data.zone, "Metro");
  assert.strictEqual(metroData.data.shipping_fee, 75);
  console.log("✅ PASS 3: Metro PIN 400001 (Mumbai) calculated rate = ₹75 (Zone: Metro)");

  // Test 4: Special Remote Zone Pincode (795001 - Manipur) -> ₹120
  const specialRes = await fetch(`${baseUrl}/api/shipping/calculate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ pincode: "795001", items: [{ quantity: 1 }], subtotal: 500 })
  });
  const specialData = await specialRes.json();
  assert.strictEqual(specialData.success, true);
  assert.strictEqual(specialData.data.zone, "Special");
  assert.strictEqual(specialData.data.shipping_fee, 120);
  console.log("✅ PASS 4: Special Remote PIN 795001 (Manipur) calculated rate = ₹120 (Zone: Special)");

  // Test 5: Free shipping threshold (Subtotal >= ₹1,499) -> ₹0
  const freeRes = await fetch(`${baseUrl}/api/shipping/calculate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ pincode: "400001", items: [{ quantity: 1 }], subtotal: 1500 })
  });
  const freeData = await freeRes.json();
  assert.strictEqual(freeData.success, true);
  assert.strictEqual(freeData.data.shipping_fee, 0);
  assert.strictEqual(freeData.data.is_free_shipping, true);
  console.log("✅ PASS 5: Orders >= ₹1,499 qualify for Free Shipping (Fee = ₹0, is_free_shipping: true)");

  // Test 6: Alias route /api/shipping/rate works identically
  const aliasRes = await fetch(`${baseUrl}/api/shipping/rate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ pincode: "641004", items: [{ quantity: 1 }], subtotal: 500 })
  });
  const aliasData = await aliasRes.json();
  assert.strictEqual(aliasData.success, true);
  assert.strictEqual(aliasData.data.shipping_fee, 40);
  console.log("✅ PASS 6: Alias route /api/shipping/rate verified successfully");

  // Test 7: Razorpay Order Creation calculates shipping based on pincode 641004
  const catalogRes = await fetch(`${baseUrl}/api/products`);
  const catalogData = await catalogRes.json();
  const testProduct = catalogData.data.find((p) => p.price && p.stock_count > 2) || catalogData.data[0];

  const rzpRes = await fetch(`${baseUrl}/api/orders/razorpay/create-order`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      items: [{ product_id: testProduct.id, quantity: 1 }],
      pincode: "641004"
    })
  });
  const rzpData = await rzpRes.json();
  assert.strictEqual(rzpData.success, true);
  const expectedTotal = testProduct.price >= 1499 ? testProduct.price : testProduct.price + 40;
  assert.strictEqual(rzpData.data.amount, Math.round(expectedTotal * 100));
  console.log(`✅ PASS 7: Razorpay Order with Local PIN 641004 total = ₹${expectedTotal} (Paise: ${rzpData.data.amount})`);

  // Test 8: Razorpay Order Creation with Metro PIN 400001
  const rzpMetroRes = await fetch(`${baseUrl}/api/orders/razorpay/create-order`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      items: [{ product_id: testProduct.id, quantity: 1 }],
      pincode: "400001"
    })
  });
  const rzpMetroData = await rzpMetroRes.json();
  assert.strictEqual(rzpMetroData.success, true);
  const expectedMetroTotal = testProduct.price >= 1499 ? testProduct.price : testProduct.price + 75;
  assert.strictEqual(rzpMetroData.data.amount, Math.round(expectedMetroTotal * 100));
  console.log(`✅ PASS 8: Razorpay Order with Metro PIN 400001 total = ₹${expectedMetroTotal} (Paise: ${rzpMetroData.data.amount})`);

  console.log("====================================================");
  console.log("TOTAL PINCODE TESTS: 8 PASSED, 0 FAILED");
  console.log("====================================================");
}

runTests().catch((err) => {
  console.error("Test failed:", err);
  process.exit(1);
});
