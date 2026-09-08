import React from "react";
import "./SplitBanner.css";

export default function SplitBanner() {
  return (
    <section className="split-banner-section">
      <div className="container">
        <div className="split-banner-grid">
          {/* Left Banner */}
          <div className="split-card left-banner">
            <img
              src="/images/photo-1560243563-062bfc001d68.jpg"
              alt="Best Sellers Editorial"
              className="split-bg-img"
              loading="lazy"
              decoding="async"
            />
            <div className="split-card-overlay" />
            <div className="split-card-content">
              <span className="split-kicker">CURATED CLASSICS</span>
              <h3 className="split-title">Best Sellers of the Season</h3>
              <p className="split-desc">
                Invest in foundational linen and knit pieces made to outlive seasonal trends.
              </p>
              <a href="#whats-new" className="btn btn-white btn-sm">
                Shop Best Sellers
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <line x1="5" y1="12" x2="19" y2="12"></line>
                  <polyline points="12 5 19 12 12 19"></polyline>
                </svg>
              </a>
            </div>
          </div>

          {/* Right Banner */}
          <div className="split-card right-banner">
            <img
              src="/images/photo-1544441893-675973e31985.jpg"
              alt="New Arrivals Editorial"
              className="split-bg-img"
              loading="lazy"
              decoding="async"
            />
            <div className="split-card-overlay" />
            <div className="split-card-content">
              <span className="split-kicker">SUMMER DROP 2026</span>
              <h3 className="split-title">Pure Silk & Fluid Tailoring</h3>
              <p className="split-desc">
                Sculpted drape and lightweight elegance for golden hour evenings.
              </p>
              <a href="#tabbed-showcase" className="btn btn-white btn-sm">
                Discover New Drop
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <line x1="5" y1="12" x2="19" y2="12"></line>
                  <polyline points="12 5 19 12 12 19"></polyline>
                </svg>
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
