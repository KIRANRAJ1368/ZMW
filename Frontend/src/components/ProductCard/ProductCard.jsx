import { useNavigate } from "react-router-dom";
import { useShop } from "../../context/ShopContext";
import "./ProductCard.css";

function getProductBadge(product) {
  const raw = (product.badge || "").trim().toUpperCase();
  if (raw.includes("BEST")) return { text: "BEST SELLER", type: "bestseller" };
  if (raw.includes("DROP") || raw === "NEW" || raw.includes("NEW")) return { text: "NEW DROP", type: "newdrop" };
  if (raw.includes("LIMIT")) return { text: "LIMITED", type: "limited" };
  if (raw.includes("TREND")) return { text: "TRENDING", type: "trending" };
  if (raw.includes("SALE") || product.isSale) return { text: "SALE", type: "sale" };

  if (product.isBestSeller) return { text: "BEST SELLER", type: "bestseller" };
  if (product.isNewArrival) return { text: "NEW DROP", type: "newdrop" };
  return null;
}

export default function ProductCard({ product }) {
  const navigate = useNavigate();
  const { formatPrice, addToCart, wishlist, toggleWishlist, setQuickViewProduct } = useShop();

  const isSaved = wishlist.includes(product.id);
  const hasSecondaryImg = product.images && product.images.length > 1;
  const badgeInfo = getProductBadge(product);

  const handleCardClick = () => {
    navigate(`/product/${product.id}`);
  };

  return (
    <div className="product-card">
      {/* Image Box */}
      <div
        className="product-image-box"
        onClick={handleCardClick}
        role="button"
        tabIndex={0}
        aria-label={`View details for ${product.name}`}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            handleCardClick();
          }
        }}
      >
        {/* Tasteful Brand Badges */}
        {badgeInfo && (
          <span className={`product-badge badge-${badgeInfo.type}`}>
            {badgeInfo.text}
          </span>
        )}

        {/* Primary & Secondary Images */}
        <img
          src={product.images?.[0] || "/images/zmw-logo-transparent.png"}
          alt={product.name}
          className="product-img-primary"
          loading="lazy"
          onError={(event) => { event.currentTarget.src = "/images/zmw-logo-transparent.png"; }}
        />
        {hasSecondaryImg && (
          <img
            src={product.images[1]}
            alt={`${product.name} alternate angle`}
            className="product-img-secondary"
            loading="lazy"
            onError={(event) => { event.currentTarget.src = "/images/zmw-logo-transparent.png"; }}
          />
        )}

        {/* Vertical Icon-Only Action Stack (Eye, Heart, Bag) */}
        <div className="product-card-actions-stack" onClick={(e) => e.stopPropagation()}>
          {/* 1. Eye = Quick View */}
          <button
            type="button"
            className="card-action-icon-btn"
            onClick={(e) => {
              e.stopPropagation();
              setQuickViewProduct(product);
            }}
            title="Quick View"
            aria-label={`Quick view ${product.name}`}
          >
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
              <circle cx="12" cy="12" r="3" />
            </svg>
          </button>

          {/* 2. Heart = Wishlist */}
          <button
            type="button"
            className={`card-action-icon-btn card-wishlist-icon-btn ${isSaved ? "saved" : ""}`}
            onClick={(e) => {
              e.stopPropagation();
              toggleWishlist(product.id);
            }}
            title={isSaved ? "Remove from Wishlist" : "Add to Wishlist"}
            aria-label={isSaved ? "Remove from Wishlist" : "Add to Wishlist"}
          >
            <svg width="17" height="17" viewBox="0 0 24 24" fill={isSaved ? "#DC2626" : "none"} stroke={isSaved ? "#DC2626" : "currentColor"} strokeWidth="2">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
            </svg>
          </button>

          {/* 3. Bag / Cart = Add to Cart */}
          <button
            type="button"
            className="card-action-icon-btn card-cart-icon-btn"
            onClick={(e) => {
              e.stopPropagation();
              addToCart(product);
            }}
            title="Add to Cart"
            aria-label={`Add ${product.name} to cart`}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
              <line x1="3" y1="6" x2="21" y2="6" />
              <path d="M16 10a4 4 0 0 1-8 0" />
            </svg>
          </button>
        </div>
      </div>

      {/* Card Info - Showing strictly Product name, Current price & MRP */}
      <div className="product-info">
        <h3 className="product-name" onClick={handleCardClick} title={product.name}>
          {product.name}
        </h3>

        <div className="product-pricing">
          <span className="price-current">{formatPrice(product.price)}</span>
          {product.originalPrice && product.originalPrice > product.price && (
            <span className="price-original">{formatPrice(product.originalPrice)}</span>
          )}
        </div>
      </div>
    </div>
  );
}
