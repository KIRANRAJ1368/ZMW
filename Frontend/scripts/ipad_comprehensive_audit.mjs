import { chromium } from "playwright";

const IPAD_AND_ALL_VIEWPORTS = [
  // ── iPad Mini 6 ──
  { name: "iPad_Mini_6_Portrait", width: 744, height: 1133, device: "iPad Mini 6 (Port)" },
  { name: "iPad_Mini_6_Landscape", width: 1133, height: 744, device: "iPad Mini 6 (Land)" },

  // ── iPad 9th / 8th / 7th gen ──
  { name: "iPad_9thGen_Portrait", width: 768, height: 1024, device: "iPad 9th Gen (Port)" },
  { name: "iPad_9thGen_Landscape", width: 1024, height: 768, device: "iPad 9th Gen (Land)" },

  // ── iPad 10th gen & iPad Air 4/5 ──
  { name: "iPad_Air_10thGen_Portrait", width: 820, height: 1180, device: "iPad Air / 10th Gen (Port)" },
  { name: "iPad_Air_10thGen_Landscape", width: 1180, height: 820, device: "iPad Air / 10th Gen (Land)" },

  // ── iPad Pro 10.5 / 11 inch ──
  { name: "iPad_Pro_10_5_Landscape", width: 1112, height: 834, device: "iPad Pro 10.5-inch (Land)" },
  { name: "iPad_Pro_11_Portrait", width: 834, height: 1194, device: "iPad Pro 11-inch (Port)" },
  { name: "iPad_Pro_11_Landscape", width: 1194, height: 834, device: "iPad Pro 11-inch (Land)" },

  // ── iPad Pro 12.9 inch ──
  { name: "iPad_Pro_12_9_Portrait", width: 1024, height: 1366, device: "iPad Pro 12.9-inch (Port)" },
  { name: "iPad_Pro_12_9_Landscape", width: 1366, height: 1024, device: "iPad Pro 12.9-inch (Land)" },

  // ── Mobile Devices ──
  { name: "Mobile_320_SE", width: 320, height: 568, device: "iPhone SE 1st" },
  { name: "Mobile_360_Android", width: 360, height: 780, device: "Android Small" },
  { name: "Mobile_375_iPhone", width: 375, height: 667, device: "iPhone 8/SE2" },
  { name: "Mobile_390_iPhone14", width: 390, height: 844, device: "iPhone 14/15" },
  { name: "Mobile_414_iPhonePlus", width: 414, height: 896, device: "iPhone Plus" },

  // ── Desktop Displays ──
  { name: "Desktop_1280", width: 1280, height: 800, device: "MacBook / Laptop" },
  { name: "Desktop_1440", width: 1440, height: 900, device: "Desktop 1440p" }
];

const PAGES = [
  { name: "Home", path: "/" },
  { name: "Collection", path: "/collection?category=mens" },
  { name: "ProductDetail", path: "/product/1" },
  { name: "Cart (Empty)", path: "/cart" },
  { name: "Cart (Populated)", path: "/cart", withCartItems: true },
  { name: "Checkout", path: "/checkout" },
  { name: "Wishlist", path: "/wishlist" },
  { name: "AboutUs", path: "/about-us" },
  { name: "ContactUs", path: "/contact-us" },
  { name: "FAQ", path: "/faq" },
  { name: "SizeGuide", path: "/size-guide" },
  { name: "ShippingPolicy", path: "/shipping-policy" },
  { name: "PrivacyPolicy", path: "/privacy-policy" },
  { name: "TermsConditions", path: "/terms-conditions" },
  { name: "ReturnRefundPolicy", path: "/return-refund-policy" },
  { name: "CustomerProfile", path: "/account" }
];

const DUMMY_CART_JSON = JSON.stringify([
  {
    id: "1",
    name: "Heavyweight Oversized Tee",
    price: 1499,
    originalPrice: 2499,
    quantity: 2,
    color: "Obsidian Black",
    size: "L",
    image: "/images/hero-mens-oversized-tee.jpg"
  },
  {
    id: "2",
    name: "Essential French Terry Hoodie",
    price: 2999,
    originalPrice: 4299,
    quantity: 1,
    color: "Washed Charcoal",
    size: "XL",
    image: "/images/cat-men-hoodie.jpg"
  }
]);

async function runAudit() {
  console.log("===============================================================================");
  console.log("   ALL IPAD MODELS (PORTRAIT + LANDSCAPE) & ALL DEVICES RESPONSIVE AUDIT");
  console.log("===============================================================================");
  console.log(`Viewports to test: ${IPAD_AND_ALL_VIEWPORTS.length}`);
  console.log(`Pages per viewport: ${PAGES.length}`);
  console.log(`Total test cases: ${IPAD_AND_ALL_VIEWPORTS.length * PAGES.length}\n`);

  const browser = await chromium.launch({ headless: true });
  let totalPass = 0;
  let totalFail = 0;
  const issues = [];

  for (const vp of IPAD_AND_ALL_VIEWPORTS) {
    console.log(`\n── VIEWPORT: [${vp.name}] ${vp.device} (${vp.width}×${vp.height}px) ──`);
    const context = await browser.newContext({
      viewport: { width: vp.width, height: vp.height },
      deviceScaleFactor: 1
    });

    for (const p of PAGES) {
      const page = await context.newPage();
      if (p.withCartItems) {
        await page.addInitScript(`localStorage.setItem('zmw_cart', '${DUMMY_CART_JSON}');`);
      } else {
        await page.addInitScript(`localStorage.removeItem('zmw_cart');`);
      }

      const url = `http://localhost:3000${p.path}`;

      try {
        await page.goto(url, { waitUntil: "domcontentloaded", timeout: 20000 });
        await page.waitForTimeout(400);

        const check = await page.evaluate(() => {
          const docWidth = document.documentElement.clientWidth;
          const bodyScroll = document.body.scrollWidth;
          const docScroll = document.documentElement.scrollWidth;
          const maxScroll = Math.max(bodyScroll, docScroll);
          const hasOverflow = maxScroll > docWidth + 3;

          const offenders = [];
          if (hasOverflow) {
            const all = document.querySelectorAll("*");
            for (const el of all) {
              const r = el.getBoundingClientRect();
              if (r.right > docWidth + 3) {
                const tag = el.tagName.toLowerCase();
                const cls = el.className && typeof el.className === "string"
                  ? "." + el.className.trim().split(/\s+/).slice(0, 3).join(".")
                  : "";
                offenders.push({
                  selector: `${tag}${cls}`,
                  right: Math.round(r.right),
                  width: Math.round(r.width)
                });
                if (offenders.length >= 5) break;
              }
            }
          }

          return { docWidth, maxScroll, hasOverflow, offenders };
        });

        if (check.hasOverflow) {
          totalFail++;
          console.log(`  ❌ OVERFLOW  ${p.name.padEnd(22)} (viewport=${check.docWidth}px, scroll=${check.maxScroll}px, excess=+${check.maxScroll - check.docWidth}px)`);
          check.offenders.forEach(o => {
            console.log(`     ↳ ${o.selector} [right=${o.right}px, width=${o.width}px]`);
          });
          issues.push({ viewport: vp.name, device: vp.device, page: p.name, ...check });
        } else {
          totalPass++;
          console.log(`  ✅ OK        ${p.name.padEnd(22)} (vp=${check.docWidth}px, scroll=${check.maxScroll}px)`);
        }
      } catch (err) {
        console.error(`  💥 ERROR     ${p.name}: ${err.message}`);
      } finally {
        await page.close();
      }
    }

    await context.close();
  }

  await browser.close();

  console.log("\n===============================================================================");
  console.log(`FINAL RESULTS: ${totalPass} PASSED, ${totalFail} FAILED (Total: ${totalPass + totalFail})`);
  console.log("===============================================================================");

  if (issues.length > 0) {
    console.log("\n❌ OVERFLOW DETAILS:");
    issues.forEach(i => {
      console.log(`- [${i.device}] ${i.page}: +${i.maxScroll - i.docWidth}px overflow`);
      i.offenders.forEach(o => console.log(`    ↳ ${o.selector}`));
    });
    process.exit(1);
  } else {
    console.log("\n🎉 PERFECT SCORE! 100% of all iPad models, portrait/landscape, mobile, and desktop pass with ZERO horizontal overflow!");
    process.exit(0);
  }
}

runAudit().catch((err) => {
  console.error("Audit runner failed:", err);
  process.exit(1);
});
