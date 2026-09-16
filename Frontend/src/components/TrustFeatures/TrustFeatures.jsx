import React from "react";
import "./TrustFeatures.css";

const FEATURES = [
  {
    icon: (
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="1" y="3" width="15" height="13"></rect>
        <polygon points="16 8 20 8 23 11 23 16 16 16 16 8"></polygon>
        <circle cx="5.5" cy="18.5" r="2.5"></circle>
        <circle cx="18.5" cy="18.5" r="2.5"></circle>
      </svg>
    ),
    title: "Free Express Shipping",
    description: "Across India on all orders. Dispatched in 24 hours"
  },
  {
    icon: (
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <polyline points="23 4 23 10 17 10"></polyline>
        <polyline points="1 20 1 14 7 14"></polyline>
        <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path>
      </svg>
    ),
    title: "7 Days Easy Returns",
    description: "Hassle-free doorstep pickup & instant exchanges"
  },
  {
    icon: (
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
        <path d="M9 12l2 2 4-4"></path>
      </svg>
    ),
    title: "100% Combed Cotton",
    description: "Heavyweight 240+ GSM bio-washed pre-shrunk fabric"
  },
  {
    icon: (
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="2" y="4" width="20" height="16" rx="2"></rect>
        <line x1="2" y1="10" x2="22" y2="10"></line>
        <path d="M6 15h2"></path>
        <path d="M12 15h4"></path>
      </svg>
    ),
    title: "Cash On Delivery",
    description: "Verified doorstep COD across 25,000+ Indian pincodes"
  }
];

export default function TrustFeatures() {
  return (
    <section id="features" className="trust-section" aria-label="Brand Guarantees">
      <div className="container">
        {/* CrazyMonk Inspired Handcrafted in India Banner */}
        <div className="handcrafted-india-strip">
          <div className="india-badge-pill">PROUDLY DESIGNED & HANDCRAFTED IN INDIA</div>
          <p className="india-customers-subtitle">Over 1 Lakh Happy Streetwear Enthusiasts Across India</p>
        </div>

        <div className="trust-grid">
          {FEATURES.map((item, index) => (
            <div key={index} className="trust-card">
              <div className="trust-icon-wrapper">{item.icon}</div>
              <div className="trust-text">
                <h3 className="trust-title">{item.title}</h3>
                <p className="trust-desc">{item.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
