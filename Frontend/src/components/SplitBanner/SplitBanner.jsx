import React from "react";
import { Link } from "react-router-dom";
import "./SplitBanner.css";

export default function SplitBanner() {
  return (
    <section className="split-banner-section" aria-label="Featured Streetwear Collections">
      <div className="container">
        <div className="split-banner-grid">
          {/* Left Banner — Oversized Streetwear */}
          <div className="split-card left-banner">
            <img
              src="/images/hero-mens-tshirt-banner-2.jpg"
              alt="Heavyweight Oversized Streetwear Tees"
              className="split-bg-img"
              loading="lazy"
              decoding="async"
            />
            <div className="split-card-overlay" />
            <div className="split-card-content">
              <span className="split-kicker">
                <span className="split-dot" /> 240+ GSM HEAVYWEIGHT
              </span>
              <h3 className="split-title">Oversized Streetwear Tees</h3>
              <p className="split-desc">
                Architectural boxy cuts, drop-shoulder seams, and breathable bio-washed combed cotton.
              </p>
              <Link to="/collection?category=mens" className="btn btn-split-cta">
                Shop Oversized Drops
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <line x1="5" y1="12" x2="19" y2="12"></line>
                  <polyline points="12 5 19 12 12 19"></polyline>
                </svg>
              </Link>
            </div>
          </div>

          {/* Right Banner — Winter Hoodies */}
          <div className="split-card right-banner">
            <img
              src="/images/photo-1556821840-3a63f95609a7.jpg"
              alt="Thermal Fleece Hoodies and Sweatshirts"
              className="split-bg-img"
              loading="lazy"
              decoding="async"
            />
            <div className="split-card-overlay" />
            <div className="split-card-content">
              <span className="split-kicker">
                <span className="split-dot" /> WINTER '25 EDITION
              </span>
              <h3 className="split-title">Thermal Fleece Hoodies</h3>
              <p className="split-desc">
                380 GSM brushed interior fleece with ribbed trims and relaxed athletic silhouette.
              </p>
              <Link to="/collection?category=mens" className="btn btn-split-cta">
                Shop Winter Drops
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <line x1="5" y1="12" x2="19" y2="12"></line>
                  <polyline points="12 5 19 12 12 19"></polyline>
                </svg>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
