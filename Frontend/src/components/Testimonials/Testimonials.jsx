import React, { useState } from "react";
import { TESTIMONIALS_DATA } from "../../data/products";
import "./Testimonials.css";

export default function Testimonials() {
  const [activeIndex, setActiveIndex] = useState(0);

  return (
    <section id="testimonials" className="section-padding testimonials-section">
      <div className="container">
        {/* Header */}
        <div className="section-header">
          <span className="section-eyebrow">COMMUNITY VOICES</span>
          <h2 className="section-title">What People Are Saying</h2>
          <p className="section-subtitle">
            Authentic words from individuals who value considered design, sustainable materials, and enduring quality.
          </p>
        </div>

        {/* Testimonials Grid */}
        <div className="testimonials-grid">
          {TESTIMONIALS_DATA.map((item, index) => (
            <div
              key={item.id}
              className={`testimonial-card ${index === activeIndex ? "active" : ""}`}
              onClick={() => setActiveIndex(index)}
            >
              {/* Top rating row */}
              <div className="testimonial-top">
                <div className="star-rating">
                  {"★".repeat(item.rating)}
                </div>
                <span className="verified-badge">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                    <polyline points="20 6 9 17 4 12"></polyline>
                  </svg>
                  {item.role}
                </span>
              </div>

              {/* Title & Comment */}
              <h3 className="testimonial-title">"{item.title}"</h3>
              <p className="testimonial-comment">{item.comment}</p>

              {/* Product purchased tag */}
              <div className="testimonial-product">
                <span className="product-tag-label">Purchased:</span>
                <span className="product-tag-name">{item.productPurchased}</span>
              </div>

              {/* Author footer */}
              <div className="testimonial-author">
                <div className="author-avatar">
                  {item.author.split(" ").map((n) => n[0]).join("")}
                </div>
                <div className="author-details">
                  <span className="author-name">{item.author}</span>
                  <span className="author-location">{item.city} • {item.date}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
