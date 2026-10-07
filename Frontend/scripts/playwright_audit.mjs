import { chromium } from "playwright";

const VIEWPORTS = [
  { name: "mobile_375", width: 375, height: 667 },
  { name: "mobile_412", width: 412, height: 915 },
  { name: "tablet_768", width: 768, height: 1024 },
  { name: "desktop_1440", width: 1440, height: 900 }
];

const PAGES = [
  { name: "Home", path: "/" },
  { name: "Collection", path: "/collection?category=mens" },
  { name: "ProductDetail", path: "/product/1" },
  { name: "Cart", path: "/cart" },
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

async function runAudit() {
  console.log("=== STARTING PLAYWRIGHT RESPONSIVE AUDIT ===");
  const browser = await chromium.launch({ headless: true });
  const report = [];

  for (const vp of VIEWPORTS) {
    console.log(`\n========================================`);
    console.log(`DEVICE VIEWPORT: ${vp.name} (${vp.width}x${vp.height})`);
    console.log(`========================================`);
    const context = await browser.newContext({
      viewport: { width: vp.width, height: vp.height },
      deviceScaleFactor: 1
    });
    const page = await context.newPage();

    for (const p of PAGES) {
      const url = `http://localhost:3000${p.path}`;
      const consoleErrors = [];
      page.on("pageerror", (err) => consoleErrors.push(err.message));

      try {
        await page.goto(url, { waitUntil: "domcontentloaded", timeout: 15000 });
        await page.waitForTimeout(600);

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
                const cls = el.className && typeof el.className === "string" ? "." + el.className.split(" ").slice(0, 2).join(".") : "";
                offenders.push({
                  selector: `${tag}${cls}`,
                  right: Math.round(r.right),
                  width: Math.round(r.width)
                });
                if (offenders.length >= 6) break;
              }
            }
          }

          return {
            docWidth,
            maxScroll,
            hasOverflow,
            offenders
          };
        });

        report.push({
          page: p.name,
          viewport: vp.name,
          width: vp.width,
          ...check,
          errors: consoleErrors
        });

        const icon = check.hasOverflow ? "❌ OVERFLOW" : "✅ OK";
        console.log(`[${vp.name}] ${p.name.padEnd(20)}: ${icon} (viewport=${check.docWidth}px, scroll=${check.maxScroll}px)`);
        if (check.hasOverflow) {
          console.log(`   --> Offending elements:`, JSON.stringify(check.offenders));
        }
        if (consoleErrors.length > 0) {
          console.log(`   --> Console Errors:`, consoleErrors);
        }
      } catch (e) {
        console.error(`[${vp.name}] ${p.name} Error:`, e.message);
      }
    }
    await context.close();
  }

  await browser.close();
  console.log("\n=== AUDIT COMPLETED ===");
}

runAudit().catch(console.error);
