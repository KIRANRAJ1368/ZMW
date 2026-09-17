import React from "react";
import { Link } from "react-router-dom";
import "./AboutUs.css";

export default function AboutUs() {
  return (
    <div className="about-page">
      {/* ── 1. Hero / Banner Section (Matching Home Hero Aesthetic) ── */}
      <section className="about-hero-clean" aria-label="About ZWMStore">
        <div className="about-hero-backdrop">
          <img
            src={process.env.PUBLIC_URL + "/images/hero-mens-tailoring.jpg"}
            alt="ZWMStore Streetwear Craftsmanship"
            className="about-hero-img"
          />
          {/* Balanced scrim gradient: keeps model vivid on right, ensures crisp text legibility on left */}
          <div className="about-hero-scrim" />
        </div>

        <div className="container about-hero-container">
          <div className="about-hero-content">
            <div className="about-hero-tag-wrap">
              <span className="about-hero-tag-badge">
                <span className="about-hero-dot" />
                ZWMSTORE • EST. INDIA
              </span>
              <span className="about-hero-promo-pill">
                CRAFTED FOR EVERYDAY PRESENCE
              </span>
            </div>

            <h1 className="about-hero-headline">
              About Us
            </h1>

            <p className="about-hero-subtext">
              Crafted for substance, fit, and longevity. Built for modern daily life and Indian streetwear culture — from yarn selection to the final stitch.
            </p>

            <div className="about-hero-actions">
              <Link to="/collection" className="zmw-primary-cta">
                Explore Our Collection
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <line x1="5" y1="12" x2="19" y2="12"></line>
                  <polyline points="12 5 19 12 12 19"></polyline>
                </svg>
              </Link>
              <Link to="/contact" className="about-hero-secondary-btn">
                Contact Us
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── 2. Company Overview Section ───────────────────────────── */}
      <section className="about-section about-section-white">
        <div className="container">
          <div className="about-grid-2col">
            <div className="about-col-text">
              <div className="section-eyebrow-badge">
                <span className="eyebrow-dot"></span>
                COMPANY OVERVIEW
              </div>
              <h2 className="section-heading-title">
                Rooted In Craft, Designed For Real Life
              </h2>
              <p className="section-heading-subtitle about-lead-text">
                ZWMStore was created to bridge the gap between architectural streetwear silhouettes and everyday wearable durability.
              </p>
              <p className="about-body-text">
                Rather than treating clothing as fast-moving, disposable trends, we approach every collection as foundational wardrobe essentials. We source premium combed cotton yarns, engineer deliberate oversized proportions that flatter natural body movement, and inspect every seam before a garment leaves our dispatch floor.
              </p>
              <p className="about-body-text">
                From our flagship heavyweight drops to curated everyday pieces for men, women, boys, girls, and babies, ZWMStore stands for intentional design that holds its shape wash after wash.
              </p>
            </div>

            <div className="about-col-media">
              <div className="about-image-card">
                <img
                  src={process.env.PUBLIC_URL + "/images/photo-1521572163474-6864f9cf17ab.jpg"}
                  alt="ZWMStore Combed Cotton Texture"
                  className="about-card-img"
                  loading="lazy"
                />
                <div className="about-card-badge">
                  <span>HEAVYWEIGHT 240+ GSM</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 3. Our Quality Section ─────────────────────────────────── */}
      <section className="about-section about-section-slate">
        <div className="container">
          <div className="about-grid-2col about-grid-reverse">
            <div className="about-col-text">
              <div className="section-eyebrow-badge">
                <span className="eyebrow-dot"></span>
                OUR QUALITY
              </div>
              <h2 className="section-heading-title">
                Substance In Every Stitch
              </h2>
              <p className="section-heading-subtitle about-lead-text">
                We obsess over fabric density, yarn stability, and ergonomic cuts so you don't have to compromise.
              </p>

              <div className="about-pillars-list">
                <div className="about-pillar-item">
                  <div className="about-pillar-number">01</div>
                  <div className="about-pillar-body">
                    <h4>Long-Staple Combed Cotton</h4>
                    <p>
                      Combed to eliminate short fibers and impurities, resulting in an exceptionally smooth, dense surface that resists pilling and wear.
                    </p>
                  </div>
                </div>

                <div className="about-pillar-item">
                  <div className="about-pillar-number">02</div>
                  <div className="about-pillar-body">
                    <h4>Bio-Softened & Pre-Shrunk</h4>
                    <p>
                      Treated with eco-conscious silicone bio-washes to lock in dimensions and provide immediate out-of-the-box comfort with zero surprise shrinkage.
                    </p>
                  </div>
                </div>

                <div className="about-pillar-item">
                  <div className="about-pillar-number">03</div>
                  <div className="about-pillar-body">
                    <h4>High-Recovery Ribbed Collars</h4>
                    <p>
                      Reinforced with a precise lycra blend and double-needle topstitching to ensure collars lay flat and never curl, sag, or bacon over time.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="about-col-media">
              <div className="about-image-card">
                <img
                  src={process.env.PUBLIC_URL + "/images/banner-streetwear-tee.jpg"}
                  alt="ZWMStore Streetwear Fit and Fabric"
                  className="about-card-img"
                  loading="lazy"
                />
                <div className="about-card-badge">
                  <span>DURABLE BIO-WASH FINISH</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 4. Our Approach / Manufacturing Section ───────────────── */}
      <section className="about-section about-section-white">
        <div className="container">
          <div className="about-grid-2col">
            <div className="about-col-text">
              <div className="section-eyebrow-badge">
                <span className="eyebrow-dot"></span>
                OUR APPROACH & MANUFACTURING
              </div>
              <h2 className="section-heading-title">
                Crafted In India's Textile Heartland
              </h2>
              <p className="section-heading-subtitle about-lead-text">
                Directly tailored and dispatched from Avinashi Road, Peelamedu, Coimbatore — the epicentre of Indian textile mastery.
              </p>
              <p className="about-body-text">
                Tamil Nadu’s Coimbatore and Tiruppur belt is globally revered for producing the finest knitted cottons and precision garment assembly. By anchoring our manufacturing and dispatch operations right here, we maintain end-to-end quality control across every production stage.
              </p>
              <p className="about-body-text">
                This direct oversight allows us to bypass intermediaries, support skilled domestic textile workers with ethical standards, and offer unmatched heavyweight luxury streetwear at direct-to-consumer prices.
              </p>

              <div className="about-features-inline">
                <div className="about-feature-chip">
                  <span className="chip-check">✓</span>
                  <span>Direct Factory Oversight</span>
                </div>
                <div className="about-feature-chip">
                  <span className="chip-check">✓</span>
                  <span>Fair Trade Production</span>
                </div>
                <div className="about-feature-chip">
                  <span className="chip-check">✓</span>
                  <span>Strict QC In-House</span>
                </div>
              </div>
            </div>

            <div className="about-col-media">
              <div className="about-image-card">
                <img
                  src={process.env.PUBLIC_URL + "/images/photo-1503342217505-b0a15ec3261c.jpg"}
                  alt="Indian Textile Assembly and Manufacturing"
                  className="about-card-img"
                  loading="lazy"
                />
                <div className="about-card-badge">
                  <span>COIMBATORE & TIRUPPUR CORRIDOR</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 5. Brand Vision Section ────────────────────────────────── */}
      <section className="about-section about-section-slate">
        <div className="container">
          <div className="about-grid-2col about-grid-reverse">
            <div className="about-col-text">
              <div className="section-eyebrow-badge">
                <span className="eyebrow-dot"></span>
                BRAND VISION
              </div>
              <h2 className="section-heading-title">
                Substance Over Hype
              </h2>
              <p className="section-heading-subtitle about-lead-text">
                Building India's most dependable destination for contemporary daily streetwear and family essentials.
              </p>
              <p className="about-body-text">
                We envision a wardrobe where you don't have to choose between relaxed streetwear aesthetics and long-lasting garment integrity. Our vision is rooted in longevity: creating versatile silhouettes and timeless colorways that outlive seasonal cycles.
              </p>
              <p className="about-body-text">
                Whether you're reaching for a signature boxy tee, a cozy fleece hoodie, or durable kids' staples, ZWMStore delivers consistent sizing, heavyweight comfort, and honest value.
              </p>
            </div>

            <div className="about-col-media">
              <div className="about-image-card">
                <img
                  src={process.env.PUBLIC_URL + "/images/banner-streetwear-hoodie.jpg"}
                  alt="ZWMStore Vision and Streetwear Aesthetic"
                  className="about-card-img"
                  loading="lazy"
                />
                <div className="about-card-badge">
                  <span>TIMELESS SILHOUETTES</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 6. Factory / Company Address Section ───────────────────── */}
      <section className="about-section about-section-white">
        <div className="container">
          <div className="section-header-left">
            <div className="section-eyebrow-badge">
              <span className="eyebrow-dot"></span>
              OFFICIAL DETAILS
            </div>
            <h2 className="section-heading-title">
              Factory & Company Information
            </h2>
            <p className="section-heading-subtitle">
              Direct and transparent operations from our registered facility and central dispatch headquarters.
            </p>
          </div>

          <div className="about-info-grid">
            <div className="about-info-tile">
              <div className="about-tile-icon-wrap">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                  <circle cx="12" cy="10" r="3"></circle>
                </svg>
              </div>
              <div className="about-tile-body">
                <span className="about-tile-tag">Factory & Operating Address</span>
                <p className="about-tile-main">
                  123, Avinashi Road, Peelamedu, Coimbatore, Tamil Nadu – 641004, India
                </p>
              </div>
            </div>

            <div className="about-info-tile">
              <div className="about-tile-icon-wrap">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                  <polyline points="22,6 12,13 2,6"></polyline>
                </svg>
              </div>
              <div className="about-tile-body">
                <span className="about-tile-tag">Support & Inquiry Email</span>
                <a href="mailto:zmw@gmail.com" className="about-tile-main about-tile-link">
                  zmw@gmail.com
                </a>
              </div>
            </div>

            <div className="about-info-tile">
              <div className="about-tile-icon-wrap">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72"></path>
                </svg>
              </div>
              <div className="about-tile-body">
                <span className="about-tile-tag">Customer Care Helpline</span>
                <a href="tel:+919876543210" className="about-tile-main about-tile-link">
                  +91 9876543210
                </a>
              </div>
            </div>

            <div className="about-info-tile">
              <div className="about-tile-icon-wrap">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10"></circle>
                  <polyline points="12 6 12 12 16 14"></polyline>
                </svg>
              </div>
              <div className="about-tile-body">
                <span className="about-tile-tag">Support Availability</span>
                <p className="about-tile-main">
                  10:00 AM to 5:00 PM IST (Monday – Saturday)
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 7. Final CTA Section (Matching Home Page Newsletter Style) ── */}
      <section className="about-cta-wrapper">
        <div className="container">
          <div className="about-cta-banner">
            <div className="about-cta-text">
              <div className="about-hero-tag-badge">
                <span className="about-hero-dot" />
                FIND YOUR PERFECT FIT
              </div>
              <h2 className="about-cta-title">
                Explore Our Collection
              </h2>
              <p className="about-cta-desc">
                Discover our signature oversized t-shirts, high-density graphic drops, and everyday essentials engineered for real life.
              </p>
            </div>
            <div className="about-cta-action-wrap">
              <Link to="/collection" className="zmw-primary-cta">
                Explore Our Collection
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <line x1="5" y1="12" x2="19" y2="12"></line>
                  <polyline points="12 5 19 12 12 19"></polyline>
                </svg>
              </Link>
              <Link to="/contact" className="about-cta-secondary-link">
                Have questions? Contact us →
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

