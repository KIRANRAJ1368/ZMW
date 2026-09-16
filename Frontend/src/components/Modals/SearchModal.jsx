import React, { useState, useEffect, useRef, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useShop } from "../../context/ShopContext";
import "./SearchModal.css";

const POPULAR_SEARCHES = [
  "Round Neck T-Shirts",
  "Polo T-Shirts",
  "Hoodies",
  "Sweatshirts",
  "Joggers",
  "New Arrivals",
  "Best Sellers"
];

// Map popular/chip terms to reliable match keys (handles plural/noise).
const CHIP_QUERIES = {
  "round neck t-shirts": "round neck",
  "polo t-shirts": "polo",
  "hoodies": "hoodie",
  "sweatshirts": "sweatshirt",
  "joggers": "joggers",
  "new arrivals": "@new",
  "best sellers": "@best"
};

export default function SearchModal() {
  const {
    isSearchOpen,
    setIsSearchOpen,
    allProducts,
    products,
    formatPrice
  } = useShop();

  const [query, setQuery] = useState("");
  const inputRef = useRef(null);
  const containerRef = useRef(null);
  const navigate = useNavigate();

  // Combine products list safely
  const productCatalog = useMemo(() => {
    return allProducts && allProducts.length > 0 ? allProducts : products || [];
  }, [allProducts, products]);

  // Focus input on open, clear on close
  useEffect(() => {
    if (isSearchOpen) {
      const timer = setTimeout(() => {
        if (inputRef.current) inputRef.current.focus();
      }, 50);
      return () => clearTimeout(timer);
    } else {
      setQuery("");
    }
  }, [isSearchOpen]);

  // Handle ESC key to close
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && isSearchOpen) {
        setIsSearchOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isSearchOpen, setIsSearchOpen]);

  if (!isSearchOpen) return null;

  const trimmed = query.trim().toLowerCase();

  // Resolve chip-friendly terms to reliable match keys
  const searchTerm = CHIP_QUERIES[trimmed] || trimmed;

  const matchesProduct = (p) => {
    if (searchTerm === "@new") {
      return (
        p.isNew ||
        p.badgeType === "new" ||
        (p.badge || "").toLowerCase().includes("new")
      );
    }
    if (searchTerm === "@best") {
      return (
        p.isBestSeller ||
        p.badgeType === "hot" ||
        (p.badge || "").toLowerCase().includes("best")
      );
    }

    const text = [
      p.name,
      p.category,
      p.subCategory,
      p.description,
      p.badge,
      p.sku,
      ...(p.colors || []).map((c) => c.name || "")
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();

    return text.includes(searchTerm);
  };

  const filteredProducts = trimmed
    ? productCatalog.filter(matchesProduct).slice(0, 12)
    : [];

  const handleSelectProduct = (productId) => {
    setIsSearchOpen(false);
    navigate(`/product/${productId}`);
  };

  return (
    <div className="search-dropdown-overlay" onClick={() => setIsSearchOpen(false)}>
      <div
        className="search-dropdown-container"
        ref={containerRef}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label="Search catalog"
      >
        {/* Search Bar Row */}
        <div className="search-bar-row">
          <div className="search-input-box">
            <svg
              className="search-bar-icon"
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              aria-hidden="true"
            >
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>

            <input
              ref={inputRef}
              type="text"
              className="search-input-field"
              placeholder="Search for products…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              aria-label="Search for products"
              autoComplete="off"
            />

            {query && (
              <button
                type="button"
                className="search-clear-btn"
                onClick={() => {
                  setQuery("");
                  if (inputRef.current) inputRef.current.focus();
                }}
                aria-label="Clear search text"
                title="Clear"
              >
                ✕
              </button>
            )}
          </div>

          <button
            type="button"
            className="search-dropdown-close-btn"
            onClick={() => setIsSearchOpen(false)}
            aria-label="Close search"
          >
            Close
          </button>
        </div>

        {/* Instant Suggestions / Results Dropdown */}
        <div className="search-dropdown-content">
          {/* Quick Popular Tags when empty */}
          {!trimmed && (
            <div className="search-popular-section">
              <span className="search-popular-label">Popular Searches</span>
              <div className="search-popular-chips">
                {POPULAR_SEARCHES.map((term) => (
                  <button
                    key={term}
                    type="button"
                    className="search-chip-btn"
                    onClick={() => {
                      setQuery(term);
                      if (inputRef.current) inputRef.current.focus();
                    }}
                  >
                    <span>{term}</span>
                    <span className="search-chip-arrow" aria-hidden="true">
                      &rarr;
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Results List */}
          {trimmed && (
            <div className="search-results-section">
              <div className="search-results-header">
                <span className="search-results-count">
                  {filteredProducts.length === 0
                    ? `No results for "${query}"`
                    : `${filteredProducts.length} ${
                        filteredProducts.length === 1 ? "result" : "results"
                      } found`}
                </span>
              </div>

              {filteredProducts.length > 0 ? (
                <div className="search-results-list">
                  {filteredProducts.map((product) => (
                    <div
                      key={product.id}
                      className="search-result-item"
                      onClick={() => handleSelectProduct(product.id)}
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          handleSelectProduct(product.id);
                        }
                      }}
                    >
                      <div className="search-item-img-wrap">
                        <img
                          src={product.images && product.images[0]}
                          alt={product.name}
                          className="search-item-img"
                          loading="lazy"
                        />
                      </div>

                      <div className="search-item-details">
                        <span className="search-item-category">
                          {product.category}
                        </span>
                        <h4 className="search-item-name">{product.name}</h4>
                        <div className="search-item-price-row">
                          <span className="search-item-price">
                            {formatPrice(product.price)}
                          </span>
                          {product.originalPrice && (
                            <span className="search-item-original-price">
                              {formatPrice(product.originalPrice)}
                            </span>
                          )}
                        </div>
                      </div>

                      <span className="search-item-arrow" aria-hidden="true">
                        &rarr;
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="search-no-results">
                  <p>We couldn't find any products matching your search.</p>
                  <span className="search-no-results-hint">
                    Try checking for spelling errors or using more general terms like "Linen", "Dress", or "Shirt".
                  </span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
