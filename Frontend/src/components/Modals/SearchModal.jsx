import React, { useState, useEffect, useRef, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useShop } from "../../context/ShopContext";
import "./SearchModal.css";

const POPULAR_SEARCHES = ["Linen Shirt", "Silk Slip Dress", "T-Shirt", "Oversized", "Pants", "Blazer"];

export default function SearchModal() {
  const {
    isSearchOpen,
    setIsSearchOpen,
    allProducts,
    products
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

  const filteredProducts = trimmed
    ? productCatalog
        .filter((p) => {
          const nameMatch = p.name?.toLowerCase().includes(trimmed);
          const catMatch = p.category?.toLowerCase().includes(trimmed);
          const descMatch = p.description?.toLowerCase().includes(trimmed);
          const colorMatch = p.colors?.some((c) =>
            c.name?.toLowerCase().includes(trimmed)
          );
          return nameMatch || catMatch || descMatch || colorMatch;
        })
        .slice(0, 8) // Keep compact & fast
    : [];

  const formatINR = (amount) => {
    if (amount === null || amount === undefined) return "";
    const inr = Math.round(amount * 83);
    return `₹${new Intl.NumberFormat("en-IN").format(inr)}`;
  };

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
              placeholder="Search products…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              aria-label="Search products"
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
                    onClick={() => setQuery(term)}
                  >
                    {term}
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
                            {formatINR(product.price)}
                          </span>
                          {product.originalPrice && (
                            <span className="search-item-original-price">
                              {formatINR(product.originalPrice)}
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
