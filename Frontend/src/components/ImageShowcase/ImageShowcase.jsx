import React from "react";
import { useShop } from "../../context/ShopContext";
import { INSTAGRAM_SHOWCASE, BRAND_LOGOS } from "../../data/products";
import "./ImageShowcase.css";

export default function ImageShowcase() {
  const { openLightbox } = useShop();

  return (
    <section id="instagram" className="section-padding instagram-section">
      <div className="container">
        {/* Section Header */}
        <div className="section-header">
          <span className="section-eyebrow">@ZMW</span>
          <h2 className="section-title">ZMW on Instagram</h2>
          <p className="section-subtitle">
            Tag #ZMWStyle and #ZMWSummer on Instagram for a chance to be featured in our seasonal editorial gallery.
          </p>
        </div>

        {/* 5-Column Instagram Grid */}
        <div className="instagram-grid">
          {INSTAGRAM_SHOWCASE.map((item, index) => (
            <div
              key={item.id}
              className="instagram-card"
              onClick={() => openLightbox(index)}
              title="Click to expand photo"
            >
              <img
                src={item.image}
                alt={`Instagram post by ${item.handle}`}
                className="instagram-img"
                loading="lazy"
              />

              {/* Glass Overlay on Hover */}
              <div className="instagram-card-overlay">
                <div className="insta-icon-box">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
                  </svg>
                </div>
                <span className="insta-handle">{item.handle}</span>
                <span className="insta-likes">❤️ {item.likes}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Brand Partner Strip */}
        <div className="brand-partners-strip">
          <span className="partners-label">AS FEATURED IN & PARTNERED WITH:</span>
          <div className="partners-list">
            {BRAND_LOGOS.map((brand, i) => (
              <span key={i} className="brand-logo-text">
                {brand}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
