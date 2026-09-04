import React, { useState } from "react";
import { useShop } from "../../context/ShopContext";
import "./TabbedShowcase.css";

const TABS = [
  { id: "bestsellers", label: "Best Sellers" },
  { id: "onsale", label: "On Sale" },
  { id: "newarrivals", label: "New Arrivals" }
];

export default function TabbedShowcase() {
  const {
    products,
    formatPrice,
    addToCart,
    wishlist,
    toggleWishlist,
    setQuickViewProduct
  } = useShop();

  const [activeTab, setActiveTab] = useState("bestsellers");

  const filteredProducts = products.filter((p) => {
    if (activeTab === "bestsellers") return p.isBestSeller;
    if (activeTab === "onsale") return p.isSale;
    if (activeTab === "newarrivals") return p.isNew;
    return true;
  });

  return (
    <section id="tabbed-showcase" className="section-padding tabbed-showcase-section">
      <div className="container">
        {/* Section Header */}
        <div className="section-header">
          <span className="section-eyebrow">MOST LOVED PIECES</span>
          <h2 className="section-title">Curated For You</h2>
          <p className="section-subtitle">
            Explore our iconic wardrobe essentials, limited promotional offerings, and freshest runway releases.
          </p>
        </div>

        {/* Segmented Control Tabs */}
        <div className="showcase-tabs-wrapper">
          <div className="showcase-tabs">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                className={`showcase-tab ${activeTab === tab.id ? "active" : ""}`}
                onClick={() => setActiveTab(tab.id)}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Product Grid */}
        <div className="tabbed-product-grid">
          {filteredProducts.map((product) => {
            const isSaved = wishlist.includes(product.id);

            return (
              <div key={product.id} className="tabbed-product-card">
                <div className="tabbed-img-box">
                  {product.badge && (
                    <span className={`product-badge badge-${product.badgeType || "new"}`}>
                      {product.badge}
                    </span>
                  )}
                  <img
                    src={product.images[0]}
                    alt={product.name}
                    className="tabbed-img"
                    loading="lazy"
                  />

                  <div className="tabbed-actions">
                    <button
                      className="tabbed-action-btn"
                      onClick={() => setQuickViewProduct(product)}
                      title="Quick View"
                    >
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                        <circle cx="12" cy="12" r="3"></circle>
                      </svg>
                    </button>
                    <button
                      className={`tabbed-action-btn ${isSaved ? "saved" : ""}`}
                      onClick={() => toggleWishlist(product.id)}
                      title={isSaved ? "Remove from Wishlist" : "Add to Wishlist"}
                    >
                      <svg width="18" height="18" viewBox="0 0 24 24" fill={isSaved ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2">
                        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                      </svg>
                    </button>
                  </div>
                </div>

                <div className="tabbed-info">
                  <div className="tabbed-meta">
                    <span className="tabbed-category">{product.category}</span>
                    <div className="star-rating">
                      <span>★</span>
                      <span>{product.rating}</span>
                    </div>
                  </div>

                  <h3
                    className="tabbed-title"
                    onClick={() => setQuickViewProduct(product)}
                  >
                    {product.name}
                  </h3>

                  <div className="tabbed-price-row">
                    <span className="price-current">{formatPrice(product.price)}</span>
                    {product.originalPrice && (
                      <span className="price-original">
                        {formatPrice(product.originalPrice)}
                      </span>
                    )}
                  </div>

                  <button
                    className="btn-quick-add"
                    onClick={() => addToCart(product)}
                  >
                    <span>+ Quick Add to Bag</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
