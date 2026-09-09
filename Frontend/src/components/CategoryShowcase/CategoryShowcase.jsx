import React from "react";
import { Link } from "react-router-dom";
import { CATEGORY_SHOWCASE } from "../../data/products";
import "./CategoryShowcase.css";

export default function CategoryShowcase() {
  return (
    <section id="shop-by-category" className="section-padding category-section">
      <div className="container">
        {/* Header */}
        <div className="section-header">
          <span className="section-eyebrow">SHOP BY CATEGORY</span>
          <h2 className="section-title">Curated For Everyone</h2>
          <p className="section-subtitle">
            From sharp men's tailoring to elegant women's dresses and playful kids' clothing — discover premium fashion for every member of the family.
          </p>
        </div>

        {/* Category Cards Grid */}
        <div className="category-grid">
          {CATEGORY_SHOWCASE.map((cat) => (
            <Link key={cat.id} to={cat.href} className="category-card">
              {/* Main Image */}
              <div className="category-image-container">
                <img
                  src={cat.image}
                  alt={`${cat.title} collection`}
                  className="category-main-img"
                  loading="lazy"
                />
                <div className="category-overlay" />

                {/* Accent Image */}
                {/* <div className="category-accent-wrapper">
                  <img
                    src={cat.accentImage}
                    alt={`${cat.title} featured`}
                    className="category-accent-img"
                    loading="lazy"
                  />
                </div> */}

                {/* Content */}
                <div className="category-card-content">
                  <span className="category-count">{cat.itemCount}</span>
                  <h3 className="category-title">{cat.title}</h3>
                  <p className="category-subtitle-text">{cat.subtitle}</p>
                  <p className="category-description">{cat.description}</p>
                  <span className="category-cta">
                    Explore Collection
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <line x1="5" y1="12" x2="19" y2="12"></line>
                      <polyline points="12 5 19 12 12 19"></polyline>
                    </svg>
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
