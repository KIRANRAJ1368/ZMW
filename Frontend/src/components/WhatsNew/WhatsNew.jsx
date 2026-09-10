import React, { useState } from "react";
import { useShop } from "../../context/ShopContext";
import ProductCard from "../ProductCard/ProductCard";
import "./WhatsNew.css";

const CATEGORIES = ["All", "T-Shirt", "Dress", "Top", "Skirt"];

export default function WhatsNew() {
  const { products } = useShop();
  const [activeCategory, setActiveCategory] = useState("All");

  const filteredProducts =
    activeCategory === "All"
      ? products
      : products.filter((p) => p.category.toLowerCase() === activeCategory.toLowerCase());

  return (
    <section id="whats-new-this-season" className="section-padding whats-new-section">
      <span id="whats-new" aria-hidden="true" style={{ position: "absolute" }} />
      <div className="container">
        {/* Section Header */}
        <div className="section-header">
          <span className="section-eyebrow">SUMMER COLLECTION 2026</span>
          <h2 className="section-title">What's New This Season</h2>
          <p className="section-subtitle">
            Thoughtfully engineered garments in pure flax linen, ribbed merino, and fluid silks.
          </p>
        </div>

        {/* Category Filter Pills */}
        <div className="category-filter-bar">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              className={`category-pill ${activeCategory === cat ? "active" : ""}`}
              onClick={() => setActiveCategory(cat)}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Product Grid */}
        <div className="product-grid">
          {filteredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </section>
  );
}
