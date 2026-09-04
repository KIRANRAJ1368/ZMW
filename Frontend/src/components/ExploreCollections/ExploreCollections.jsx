import React from "react";
import { COLLECTIONS_DATA } from "../../data/products";
import "./ExploreCollections.css";

export default function ExploreCollections() {
  return (
    <section id="collections" className="section-padding collections-section">
      <div className="container">
        {/* Header */}
        <div className="section-header">
          <span className="section-eyebrow">CURATED CAPSULES</span>
          <h2 className="section-title">Explore Collections</h2>
          <p className="section-subtitle">
            Distinct design narratives constructed from organic fibers and tailored for everyday luxury.
          </p>
        </div>

        {/* Collections Grid */}
        <div className="collections-grid">
          {COLLECTIONS_DATA.map((col) => (
            <div key={col.id} className="collection-card">
              <div className="collection-image-wrapper">
                <img
                  src={col.image}
                  alt={col.title}
                  className="collection-img"
                  loading="lazy"
                />
                <div className="collection-overlay" />
                {col.tag && <span className="collection-tag">{col.tag}</span>}
              </div>

              {/* Floating Pill Label & Details */}
              <div className="collection-content">
                <a href="#whats-new" className="collection-pill-btn">
                  <span>{col.title}</span>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <line x1="5" y1="12" x2="19" y2="12"></line>
                    <polyline points="12 5 19 12 12 19"></polyline>
                  </svg>
                </a>
                <span className="collection-count">{col.itemCount}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
