import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useShop } from "../../context/ShopContext";
import { imageUrl } from "../../utils/imageUrl";

export default function CuratedCard({ product, badgeLabel, badgeTone = "hot" }) {
  const navigate = useNavigate();
  const {
    formatPrice,
    addToCart,
    wishlist,
    toggleWishlist,
    setQuickViewProduct
  } = useShop();

  const isSaved = wishlist.includes(product.id);
  const [addedAnimation, setAddedAnimation] = useState(false);

  const primaryImg =
    (product.images && product.images[0]) ||
    product.image ||
    "/images/photo-1521572163474-6864f9cf17ab.jpg";
  const secondaryImg =
    (product.images && product.images[1]) || null;

  const handleQuickAdd = (e) => {
    e.stopPropagation();
    addToCart(product);
    setAddedAnimation(true);
    setTimeout(() => setAddedAnimation(false), 1400);
  };

  // Map badgeTone to high-converting badges
  const getBadgeClass = () => {
    if (badgeTone === "new" || (badgeLabel && badgeLabel.toLowerCase().includes("new"))) return "badge-new";
    if (badgeTone === "sale" || (badgeLabel && badgeLabel.toLowerCase().includes("sale"))) return "badge-sale";
    if (badgeTone === "gold" || (badgeLabel && badgeLabel.toLowerCase().includes("best"))) return "badge-gold";
    return "badge-hot";
  };

  const discountPercent =
    product.originalPrice && product.originalPrice > product.price
      ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
      : null;

  return (
    <div className="curated-card">
      {/* Media Box */}
      <div
        className="curated-media-box"
        onClick={() => navigate(`/product/${product.id}`)}
        role="button"
        tabIndex={0}
        aria-label={`View details for ${product.name}`}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            navigate(`/product/${product.id}`);
          }
        }}
      >
        {/* Dynamic Badge */}
        {badgeLabel && (
          <span className={`curated-badge ${getBadgeClass()}`}>
            {typeof badgeLabel === "string"
              ? badgeLabel.replace(/^#\d+\s*[-–—:]?\s*/i, "").trim()
              : badgeLabel}
          </span>
        )}

        {/* Primary & Secondary Hover Images */}
        <img
          src={imageUrl(primaryImg)}
          alt={product.name}
          className="curated-img primary"
          loading="eager"
          onError={(e) => {
            e.currentTarget.onerror = null;
            e.currentTarget.src = "/images/photo-1521572163474-6864f9cf17ab.jpg";
          }}
        />
        {secondaryImg && (
          <img
            src={imageUrl(secondaryImg)}
            alt={`${product.name} alternate view`}
            className="curated-img secondary"
            loading="lazy"
            onError={(e) => {
              e.currentTarget.style.display = "none";
            }}
          />
        )}

        {/* Quick Action Floating Bar */}
        <div className="curated-action-bar" onClick={(e) => e.stopPropagation()}>
          <button
            type="button"
            className="curated-action-btn"
            onClick={(e) => {
              e.stopPropagation();
              setQuickViewProduct(product);
            }}
            title="Quick View"
            aria-label={`Quick view ${product.name}`}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
              <circle cx="12" cy="12" r="3"></circle>
            </svg>
          </button>

          <button
            type="button"
            className={`curated-action-btn ${isSaved ? "saved" : ""}`}
            onClick={(e) => {
              e.stopPropagation();
              toggleWishlist(product.id);
            }}
            title={isSaved ? "Remove from Wishlist" : "Add to Wishlist"}
            aria-label="Wishlist toggle"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill={isSaved ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
            </svg>
          </button>

          <button
            type="button"
            className={`curated-action-btn quick-buy-btn ${addedAnimation ? "added" : ""}`}
            onClick={handleQuickAdd}
            title="Quick Add to Bag"
            aria-label={`Add ${product.name} to bag`}
          >
            {addedAnimation ? (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
            ) : (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>
                <line x1="3" y1="6" x2="21" y2="6"></line>
                <path d="M16 10a4 4 0 0 1-8 0"></path>
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Info Section */}
      <div className="curated-info">
        {/* Rating & Reviews */}
        <div className="curated-rating-row">
          <div className="curated-star-box">
            <span className="curated-star">★</span>
            <span className="curated-rating-num">{product.rating || "4.9"}</span>
            <span className="curated-review-count">({product.reviewCount || "120"})</span>
          </div>
          {discountPercent && (
            <span className="curated-save-tag">{discountPercent}% OFF</span>
          )}
        </div>

        {/* Title */}
        <h3
          className="curated-title"
          onClick={() => navigate(`/product/${product.id}`)}
        >
          {product.name}
        </h3>

        {/* Pricing Row */}
        <div className="curated-pricing-row">
          <div className="curated-price-box">
            <span className="curated-price-current">{formatPrice(product.price)}</span>
            {product.originalPrice && (
              <span className="curated-price-original">{formatPrice(product.originalPrice)}</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
