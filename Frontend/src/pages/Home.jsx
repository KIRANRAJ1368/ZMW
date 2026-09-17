import Hero from "../components/Hero/Hero";
import CategoryVisuals from "../components/CategoryShowcase/CategoryVisuals";
import { NewArrivalsSection, BestSellersSection } from "../components/CuratedShowcase/CuratedShowcase";
import {
  MensCategoriesSection,
  WomensCategoriesSection,
  BoysCategoriesSection,
  GirlsCategoriesSection,
  BabiesCategoriesSection
} from "../components/CategoryShowcase/CategoryFeatureGrid";
import Newsletter from "../components/Newsletter/Newsletter";
import ImageShowcase from "../components/ImageShowcase/ImageShowcase";
import "./Home.css";

export default function Home() {
  return (
    <>
      {/* 1. Hero Banner */}
      <Hero />

      {/* 2. Explore by Department */}
      <CategoryVisuals />

      {/* 3. New Arrivals */}
      <NewArrivalsSection />

      {/* 4. Men's Categories */}
      <MensCategoriesSection />

      {/* 5. Women's Categories */}
      <WomensCategoriesSection />

      {/* 6. Boys' Categories */}
      <BoysCategoriesSection />

      {/* 7. Girls' Categories */}
      <GirlsCategoriesSection />

      {/* 8. Babies' Categories */}
      <BabiesCategoriesSection />

      {/* 9. Best Sellers */}
      <BestSellersSection />

      {/* 10. Promotional Benefits Section */}
      <section className="home-benefits-section" aria-label="Shopping Benefits">
        <div className="container">
          <div className="home-benefits-grid">
            <div className="home-benefit-card">
              <div className="home-benefit-icon-box" aria-hidden="true">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="1" y="3" width="15" height="13" rx="1" />
                  <polygon points="16 8 20 8 23 11 23 16 16 16 16 8" />
                  <circle cx="5.5" cy="18.5" r="2.5" />
                  <circle cx="18.5" cy="18.5" r="2.5" />
                </svg>
              </div>
              <div className="home-benefit-content">
                <h3 className="home-benefit-title">Free Shipping</h3>
                <p className="home-benefit-desc">On all prepaid orders</p>
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

      {/* 7. Newsletter */}
      {/* <Newsletter /> */}

      {/* 8. ZMW on Instagram */}
      {/* <ImageShowcase /> */}
    </>
  );
}

