import React, { useState, useEffect, useRef } from "react";
import { useShop } from "../../context/ShopContext";
import "./SearchModal.css";

const TRENDING_SEARCHES = ["Linen Boxy", "Silk Dress", "Merino Mockneck", "Calfskin Bag", "Linen Skirt", "Organic Cotton"];

export default function SearchModal() {
  const {
    isSearchOpen,
    setIsSearchOpen,
    products,
    formatPrice,
    setQuickViewProduct
  } = useShop();

  const [query, setQuery] = useState("");
  const inputRef = useRef(null);

  useEffect(() => {
    if (isSearchOpen && inputRef.current) {
      setTimeout(() => inputRef.current.focus(), 100);
    }
  }, [isSearchOpen]);

  if (!isSearchOpen) return null;

  const filteredProducts = query.trim()
    ? products.filter(
        (p) =>
          p.name.toLowerCase().includes(query.toLowerCase()) ||
          p.category.toLowerCase().includes(query.toLowerCase()) ||
          p.description.toLowerCase().includes(query.toLowerCase())
      )
    : [];

  const handleProductClick = (product) => {
    setIsSearchOpen(false);
    setQuickViewProduct(product);
  };

  return (
    <div className="modal-overlay active" onClick={() => setIsSearchOpen(false)}>
      <div className="search-modal-container" onClick={(e) => e.stopPropagation()}>
        {/* Search Header */}
        <div className="search-modal-header">
          <div className="search-input-wrapper">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
            <input
              ref={inputRef}
              type="text"
              placeholder="Search garments, fabrics, colors, silhouettes..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="search-main-input"
            />
            {query && (
              <button className="clear-query-btn" onClick={() => setQuery("")}>
                ✕
              </button>
            )}
          </div>
          <button
            className="search-close-btn"
            onClick={() => setIsSearchOpen(false)}
            aria-label="Close search"
          >
            Esc
          </button>
        </div>

        {/* Search Content */}
        <div className="search-modal-body">
          {/* Trending Searches */}
          {!query && (
            <div className="trending-searches-box">
              <span className="trending-label">POPULAR SEARCHES:</span>
              <div className="trending-chips">
                {TRENDING_SEARCHES.map((term) => (
                  <button
                    key={term}
                    className="trending-chip"
                    onClick={() => setQuery(term)}
                  >
                    {term}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Results List */}
          {query && (
            <div className="search-results-box">
              <span className="results-count">
                Found {filteredProducts.length} results for "{query}"
              </span>

              {filteredProducts.length === 0 ? (
                <div className="search-no-results">
                  <p>No products match your search. Try searching for "Linen", "Silk", or "Tee".</p>
                </div>
              ) : (
                <div className="search-results-grid">
                  {filteredProducts.map((p) => (
                    <div
                      key={p.id}
                      className="search-result-card"
                      onClick={() => handleProductClick(p)}
                    >
                      <img src={p.images[0]} alt={p.name} className="search-res-img" />
                      <div className="search-res-info">
                        <span className="search-res-category">{p.category}</span>
                        <h4 className="search-res-title">{p.name}</h4>
                        <span className="search-res-price">{formatPrice(p.price)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
