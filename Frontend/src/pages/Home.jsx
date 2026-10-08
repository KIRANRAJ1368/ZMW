import { useMemo } from "react";
import Hero from "../components/Hero/Hero";
import { NewArrivalsSection, BestSellersSection } from "../components/CuratedShowcase/CuratedShowcase";
import { CategorySection } from "../components/CategoryShowcase/CategoryFeatureGrid";
import { useShop } from "../context/ShopContext";
import "./Home.css";

export default function Home() {
  const { homeData } = useShop();

  // Section configs from Admin
  const sectionMap = useMemo(() => {
    return new Map((homeData?.sections || []).map((s) => [s.section_key, s]));
  }, [homeData]);

  // Dynamic active categories from Admin database, ordered by sort_order
  const categories = useMemo(() => {
    return (homeData?.categories || [])
      .filter((c) => c.is_active !== false && c.show_on_homepage !== false)
      .sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0));
  }, [homeData]);

  const isHeroActive = sectionMap.get("hero")?.is_active ?? true;
  const isNewArrivalsActive = sectionMap.get("new_arrivals")?.is_active ?? true;
  const isBestSellersActive = sectionMap.get("best_sellers")?.is_active ?? true;

  return (
    <>
      {/* 1. Hero Banners (Dynamic) */}
      {isHeroActive && <Hero />}

      {/* 2. New Arrivals (Dynamic) */}
      {isNewArrivalsActive && <NewArrivalsSection />}

      {/* 4. Dynamic Category Sections (All Active Categories from Admin) */}
      {categories.map((category) => {
        const sectionKey =
          category.slug === "mens" || category.slug === "men"
            ? "mens_categories"
            : category.slug === "women" || category.slug === "womens"
            ? "womens_categories"
            : `${category.slug}_categories`;

        const sectionConfig = sectionMap.get(sectionKey) || sectionMap.get(category.slug);
        if (sectionConfig && sectionConfig.is_active === false) {
          return null;
        }

        return (
          <CategorySection
            key={category.id || category.slug}
            category={category}
            section={sectionConfig}
          />
        );
      })}

      {/* 5. Best Sellers (Dynamic) */}
      {isBestSellersActive && <BestSellersSection />}

      {/* 6. Promotional Benefits Section (Static as requested in requirement 4) */}
      <section className="home-benefits-section" aria-label="Shopping Benefits">
        <div className="container">
          <div className="home-benefits-grid">
            <div className="home-benefit-card">
              <div className="home-benefit-icon-box" aria-hidden="true">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="1" y="3" width="15" height="13" rx="1" />
                  <polygon points="16 8 20 8 23 11 23 16 16 16 8" />
                  <circle cx="5.5" cy="18.5" r="2.5" />
                  <circle cx="18.5" cy="18.5" r="2.5" />
                </svg>
              </div>
              <div className="home-benefit-content">
                <h3 className="home-benefit-title">Pan-India Shipping</h3>
                <p className="home-benefit-desc">Fast courier delivery</p>
              </div>
            </div>

            <div className="home-benefit-card">
              <div className="home-benefit-icon-box" aria-hidden="true">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
                </svg>
              </div>
              <div className="home-benefit-content">
                <h3 className="home-benefit-title">Express Delivery</h3>
                <p className="home-benefit-desc">Fast 2–4 day delivery</p>
              </div>
            </div>

            <div className="home-benefit-card">
              <div className="home-benefit-icon-box" aria-hidden="true">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="1 4 1 10 7 10" />
                  <polyline points="23 20 23 14 17 14" />
                  <path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 0 1 3.51 15" />
                </svg>
              </div>
              <div className="home-benefit-content">
                <h3 className="home-benefit-title">Easy Returns</h3>
                <p className="home-benefit-desc">Hassle-free returns</p>
              </div>
            </div>

            <div className="home-benefit-card">
              <div className="home-benefit-icon-box" aria-hidden="true">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
              </div>
              <div className="home-benefit-content">
                <h3 className="home-benefit-title">Secure Payment</h3>
                <p className="home-benefit-desc">Safe & secure checkout</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
