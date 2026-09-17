import React from "react";
import { Link } from "react-router-dom";
import "./CategoryVisuals.css";

const CATEGORIES_DATA = [
  {
    id: "cat-men",
    badge: "⚡ TRENDING",
    title: "MEN",
    subtitle: "Oversized Tees, Polos & Hoodies",
    cta: "Shop Men",
    image: "/images/dept-mens.jpg",
    imagePosition: "center 18%",
    link: "/men"
  },
  {
    id: "cat-women",
    badge: "🔥 HOT DROP",
    title: "WOMEN",
    subtitle: "Crop Tops, Tees & Chic Fits",
    cta: "Explore Women",
    image: "/images/dept-womens.jpg",
    imagePosition: "center 18%",
    link: "/women"
  },
  {
    id: "cat-boys",
    badge: "✨ STREETWEAR",
    title: "BOYS",
    subtitle: "Skate Tees, Sets & Shorts",
    cta: "Shop Boys",
    image: "/images/dept-boys.jpg",
    imagePosition: "center 10%",
    link: "/kids?category=Boys"
  },
  {
    id: "cat-girls",
    badge: "🌸 NEW STYLES",
    title: "GIRLS",
    subtitle: "Dresses, Sets & Pretty Tees",
    cta: "Shop Girls",
    image: "/images/dept-girls.jpg",
    imagePosition: "center 18%",
    link: "/kids?category=Girls"
  },
  {
    id: "cat-babies",
    badge: "🍼 100% SOFT",
    title: "BABIES",
    subtitle: "Rompers, Pyjamas & Soft Knits",
    cta: "Shop Babies",
    image: "/images/dept-babies.jpg",
    imagePosition: "center 15%",
    link: "/kids?category=Babies"
  }
];

export default function CategoryVisuals() {
  return (
    <section className="category-visuals-section" aria-label="Shop by Department">
      <div className="container">
        {/* Left-Aligned Section Header */}
        <div className="section-header-left">
          <div className="section-eyebrow-badge">
            <span className="eyebrow-dot" />
            <span className="eyebrow-text">DISCOVER APPAREL</span>
          </div>
          <h2 className="section-heading-title">Explore by Department</h2>
          <p className="section-heading-subtitle">
            Curated wardrobe essentials crafted for iconic style — Men, Women, Boys, Girls &amp; Babies.
          </p>
        </div>

        {/* 2+3 Hero Banner Grid */}
        <div className="category-hero-grid">
          {/* Row 1 — 2 Flagship Cards (Men & Women) */}
          <div className="cat-hero-row cat-hero-row-top">
            {CATEGORIES_DATA.slice(0, 2).map((cat) => (
              <Link key={cat.id} to={cat.link} className="cat-hero-card cat-hero-card--wide">
                <div
                  className="cat-hero-backdrop"
                  style={{ backgroundImage: `url(${cat.image})`, backgroundPosition: cat.imagePosition }}
                />
                <div className="cat-hero-scrim" />
                <div className="cat-hero-content">
                  <span className="cat-hero-badge">{cat.badge}</span>
                  <h3 className="cat-hero-title">{cat.title}</h3>
                  <p className="cat-hero-desc">{cat.subtitle}</p>
                  <span className="cat-hero-btn">
                    {cat.cta}
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
                      <line x1="5" y1="12" x2="19" y2="12" />
                      <polyline points="12 5 19 12 12 19" />
                    </svg>
                  </span>
                </div>
              </Link>
            ))}
          </div>

          {/* Row 2 — 3 Featured Cards (Boys, Girls, Babies) */}
          <div className="cat-hero-row cat-hero-row-bottom">
            {CATEGORIES_DATA.slice(2).map((cat) => (
              <Link key={cat.id} to={cat.link} className="cat-hero-card cat-hero-card--standard">
                <div
                  className="cat-hero-backdrop"
                  style={{ backgroundImage: `url(${cat.image})`, backgroundPosition: cat.imagePosition }}
                />
                <div className="cat-hero-scrim" />
                <div className="cat-hero-content">
                  <span className="cat-hero-badge">{cat.badge}</span>
                  <h3 className="cat-hero-title">{cat.title}</h3>
                  <p className="cat-hero-desc">{cat.subtitle}</p>
                  <span className="cat-hero-btn">
                    {cat.cta}
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
                      <line x1="5" y1="12" x2="19" y2="12" />
                      <polyline points="12 5 19 12 12 19" />
                    </svg>
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
