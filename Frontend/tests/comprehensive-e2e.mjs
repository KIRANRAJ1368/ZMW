import assert from "node:assert/strict";

const BASE_URL = "http://localhost:5000";

async function req(path, options = {}) {
  const url = `${BASE_URL}${path}`;
  const res = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {})
    }
  });
  const data = await res.json().catch(() => null);
  return { status: res.status, ok: res.ok, data };
}

async function run() {
  console.log("=== STARTING FULL END-TO-END SYSTEM TEST ===");

  // 1. Health check
  const health = await req("/health");
  assert.equal(health.status, 200, "Health check must be 200");
  assert.equal(health.data.data.status, "ok");
  console.log("✓ Health check passed");

  // 2. Admin Login
  const adminLogin = await req("/api/auth/login", {
    method: "POST",
    body: JSON.stringify({ email: "adminzmw@gmail.com", password: "Admin@2026" })
  });
  assert.equal(adminLogin.status, 200, "Admin login should succeed");
  const adminToken = adminLogin.data.data.token;
  assert.ok(adminToken, "Admin token must be returned");
  console.log("✓ Admin login passed");

  const adminHeaders = { Authorization: `Bearer ${adminToken}` };

  // 3. Category CRUD
  const catSlug = `test-cat-${Date.now()}`;
  const createCat = await req("/api/categories", {
    method: "POST",
    headers: adminHeaders,
    body: JSON.stringify({
      name: "E2E Test Category",
      slug: catSlug,
      description: "Category created during E2E testing",
      sort_order: 99,
      is_active: true,
      show_on_homepage: true
    })
  });
  assert.equal(createCat.status, 201, "Category creation must return 201");
  const createdCategory = createCat.data.data;
  assert.equal(createdCategory.slug, catSlug);
  console.log("✓ Category creation passed");

  // 4. Subcategory CRUD
  const subSlug = `test-sub-${Date.now()}`;
  const createSub = await req("/api/subcategories", {
    method: "POST",
    headers: adminHeaders,
    body: JSON.stringify({
      category_id: createdCategory.id,
      name: "E2E Test Subcategory",
      slug: subSlug,
      sort_order: 1,
      is_active: true,
      show_on_homepage: true
    })
  });
  assert.equal(createSub.status, 201, "Subcategory creation must return 201");
  const createdSubcategory = createSub.data.data;
  assert.equal(createdSubcategory.slug, subSlug);
  console.log("✓ Subcategory creation passed");

  // 5. Product Creation with SKU Generation, Pricing, Colors, Sizes & Variants
  const productSlug = `test-product-${Date.now()}`;
  const createProd = await req("/api/products", {
    method: "POST",
    headers: adminHeaders,
    body: JSON.stringify({
      name: "E2E Test Luxury Tee",
      slug: productSlug,
      category_id: createdCategory.id,
      subcategory_id: createdSubcategory.id,
      product_type: "T-Shirts",
      description: "End to end test product description",
      price: 550,
      original_price: 750,
      stock_count: 50,
      in_stock: true,
      is_active: true,
      is_new_arrival: true,
      is_best_seller: false,
      images: [
        "/images/cat-men-round-neck.jpg",
        "/images/cat-men-polo.jpg"
      ],
      colors: [
        { name: "Jet Black", hex: "#181715" },
        { name: "Off White", hex: "#F3EFE4" }
      ],
      sizes: ["M", "L", "XL"],
      variants: [
        {
          color: "Jet Black",
          colorHex: "#181715",
          size: "M",
          sku_suffix: "BLK-M",
          stock_count: 20,
          price_override: null
        },
        {
          color: "Jet Black",
          colorHex: "#181715",
          size: "L",
          sku_suffix: "BLK-L",
          stock_count: 15,
          price_override: null
        },
        {
          color: "Off White",
          colorHex: "#F3EFE4",
          size: "XL",
          sku_suffix: "WHT-XL",
          stock_count: 15,
          price_override: 600
        }
      ]
    })
  });
  assert.equal(createProd.status, 201, `Product creation failed: ${JSON.stringify(createProd.data)}`);
  const createdProd = createProd.data.data;
  assert.ok(createdProd.sku.startsWith("ZMW-"), "Generated SKU should start with ZMW-");
  assert.equal(createdProd.variants.length, 3, "3 variants should be created");
  assert.equal(createdProd.stockCount, 50, "Total stock should be synchronized to 50");
  console.log(`✓ Product creation passed (Generated SKU: ${createdProd.sku}, stock: ${createdProd.stockCount})`);

  // 6. Test Variant Stock & Price Overrides
  const xlVariant = createdProd.variants.find((v) => v.size === "XL" && v.color === "Off White");
  assert.ok(xlVariant, "XL variant must exist");
  assert.equal(xlVariant.priceOverride, 600, "Variant price override should be 600");
  assert.equal(xlVariant.stockCount, 15, "Variant stock should be 15");
  console.log("✓ Variant pricing & stock verified");

  // 7. Test Public Storefront Product Endpoint (by slug)
  const storefrontProduct = await req(`/api/products/${productSlug}`);
  assert.equal(storefrontProduct.status, 200, "Storefront should fetch product by slug");
  assert.equal(storefrontProduct.data.data.name, "E2E Test Luxury Tee");
  assert.equal(storefrontProduct.data.data.variants.length, 3);
  console.log("✓ Public storefront product fetch verified");

  // 8. Test Coupon Creation & Validation
  const couponCode = `TEST${Math.floor(1000 + Math.random() * 9000)}`;
  const createCoupon = await req("/api/coupons", {
    method: "POST",
    headers: adminHeaders,
    body: JSON.stringify({
      code: couponCode,
      description: "E2E Coupon Test",
      discount_type: "percentage",
      discount_value: 10,
      min_spend: 500,
      is_active: true
    })
  });
  assert.equal(createCoupon.status, 201, "Coupon creation should succeed");

  const validateCoupon = await req("/api/coupons/validate", {
    method: "POST",
    body: JSON.stringify({ code: couponCode, subtotal: 1000 })
  });
  assert.equal(validateCoupon.status, 200, "Coupon validate should succeed");
  assert.equal(validateCoupon.data.data.discount_amount, 100, "10% of 1000 should be 100");
  console.log("✓ Coupon creation & validation verified");

  // 9. Customer Registration & Login
  const customerEmail = `e2ecustomer${Date.now()}@example.com`;
  const registerCustomer = await req("/api/auth/register", {
    method: "POST",
    body: JSON.stringify({
      name: "E2E Test Customer",
      email: customerEmail,
      phone: "9876543210",
      password: "CustomerPassword123"
    })
  });
  assert.equal(registerCustomer.status, 201, "Customer registration should succeed");
  const customerToken = registerCustomer.data.data.token;
  assert.ok(customerToken, "Customer token must be returned");

  const customerHeaders = { Authorization: `Bearer ${customerToken}` };
  const customerProfile = await req("/api/auth/customer/me", { headers: customerHeaders });
  assert.equal(customerProfile.status, 200, "Customer profile fetch should succeed");
  assert.equal(customerProfile.data.data.user.email, customerEmail);
  console.log("✓ Customer registration, login & profile verified");

  // 10. Order Placement & Stock Decrement
  const createOrder = await req("/api/orders", {
    method: "POST",
    headers: customerHeaders,
    body: JSON.stringify({
      customer_name: "E2E Test Customer",
      email: customerEmail,
      phone: "9876543210",
      shipping_address: "123 Test Street, Suite 400",
      city: "Bangalore",
      state: "Karnataka",
      pincode: "560001",
      payment_method: "PREPAID",
      discount_amount: 100,
      shipping_fee: 0,
      items: [
        {
          product_id: createdProd.id,
          quantity: 2,
          size: "XL",
          color: "Off White"
        }
      ]
    })
  });
  assert.equal(createOrder.status, 201, `Order placement failed: ${JSON.stringify(createOrder.data)}`);
  const orderData = createOrder.data.data;
  assert.ok(orderData.order_number, "Order number should be returned");
  console.log(`✓ Order placed successfully (${orderData.order_number})`);

  // Verify stock decreased
  const productAfterOrder = await req(`/api/products/${productSlug}`);
  const updatedXlVariant = productAfterOrder.data.data.variants.find((v) => v.size === "XL" && v.color === "Off White");
  assert.equal(updatedXlVariant.stockCount, 13, "Variant stock should decrease by 2 (15 - 2 = 13)");
  assert.equal(productAfterOrder.data.data.stockCount, 48, "Overall stock should decrease by 2 (50 - 2 = 48)");
  console.log("✓ Stock decrement after order verified");

  // 11. Order Tracking
  const trackRes = await req(`/api/orders/track?orderNumber=${encodeURIComponent(orderData.order_number)}&email=${encodeURIComponent(customerEmail)}`);
  assert.equal(trackRes.status, 200, "Order tracking should succeed");
  assert.equal(trackRes.data.data.orderNumber, orderData.order_number);
  console.log("✓ Order tracking verified");

  // 12. Order Cancellation and Stock Restitution
  const cancelRes = await req(`/api/orders/${orderData.id}/cancel`, {
    method: "POST",
    headers: customerHeaders,
    body: JSON.stringify({ reason: "Changed my mind" })
  });
  assert.equal(cancelRes.status, 200, "Order cancellation should succeed");

  // Verify stock restored
  const productAfterCancel = await req(`/api/products/${productSlug}`);
  const restoredXlVariant = productAfterCancel.data.data.variants.find((v) => v.size === "XL" && v.color === "Off White");
  assert.equal(restoredXlVariant.stockCount, 15, "Variant stock should be restored to 15");
  assert.equal(productAfterCancel.data.data.stockCount, 50, "Overall stock should be restored to 50");
  console.log("✓ Stock restoration after order cancellation verified");

  // 13. Clean up Test Data
  await req(`/api/products/${createdProd.id}`, { method: "DELETE", headers: adminHeaders });
  await req(`/api/subcategories/${createdSubcategory.id}`, { method: "DELETE", headers: adminHeaders });
  await req(`/api/categories/${createdCategory.id}`, { method: "DELETE", headers: adminHeaders });
  await req(`/api/coupons/${createCoupon.data.data.id}`, { method: "DELETE", headers: adminHeaders });
  console.log("✓ Test data cleaned up cleanly");

  console.log("=== ALL END-TO-END TESTS PASSED SUCCESSFULLY! ===");
}

run().catch((err) => {
  console.error("Test failed:", err);
  process.exit(1);
});
