import { useNavigate } from "react-router-dom";
import { useShop } from "../../context/ShopContext";
import "./ProductCard.css";

/**
 * ProductCard
 * The single source of truth for how a product tile looks and behaves
 * anywhere in the app (Home's "What's New" grid, the Men's page grid,
 * and any future category grid). Extracted from the original WhatsNew
 * markup so every product grid stays pixel-identical by construction
 * instead of by copy-pasted CSS that can drift out of sync.
 */
export default function ProductCard({ product }) {
  const navigate = useNavigate();
  const { formatPrice, addToCart, wishlist, toggleWishlist, setQuickViewProduct } = useShop();

  const isSaved = wishlist.includes(product.id);
  const hasSecondaryImg = product.images && product.images.length > 1;

  return (
    <div className="product-card">
      {/* Image Container */}
      <div
        className="product-image-box"
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
        style={{ cursor: "pointer" }}
      >
        {/* Badge */}
        {product.badge && (
          <span className={`product-badge badge-${product.badgeType || "new"}`}>
            {product.badge}
          </span>
        )}

        {/* Primary & Secondary Images */}
        <img
          src={product.images[0]}
          alt={product.name}
          className="product-img-primary"
          loading="lazy"
        />
        {hasSecondaryImg && (
          <img
            src={product.images[1]}
            alt={`${product.name} alternate view`}
            className="product-img-secondary"
            loading="lazy"
          />
        )}

        {/* Hover Floating Action Bar */}
        <div className="product-card-actions" onClick={(e) => e.stopPropagation()}>
          {/* Quick View */}
          <button
            type="button"
            className="card-action-btn"
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

          {/* Wishlist Toggle */}
          <button
            type="button"
            className={`card-action-btn ${isSaved ? "saved" : ""}`}
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

          {/* Quick Add To Cart */}
          <button
            type="button"
            className="card-action-btn"
            onClick={(e) => {
              e.stopPropagation();
              addToCart(product);
            }}
            title="Add to Bag"
            aria-label={`Add ${product.name} to bag`}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>
              <line x1="3" y1="6" x2="21" y2="6"></line>
              <path d="M16 10a4 4 0 0 1-8 0"></path>
            </svg>
          </button>
        </div>
      </div>

      {/* Card Info */}
      <div className="product-info">
        {/* Category & Rating */}
        <div className="product-meta">
          <span className="product-category-label">{product.category}</span>
          <div className="star-rating">
            <span>★</span>
            <span className="rating-num">{product.rating}</span>
            <span className="review-count">({product.reviewCount})</span>
          </div>
        </div>

        {/* Title */}
        <h3 className="product-name" onClick={() => navigate(`/product/${product.id}`)}>
          {product.name}
        </h3>

        {/* Price Row */}
        <div className="product-pricing">
          <span className="price-current">{formatPrice(product.price)}</span>
          {product.originalPrice && (
            <span className="price-original">{formatPrice(product.originalPrice)}</span>
          )}
        </div>

        {/* Color Swatches */}
        {product.colors && product.colors.length > 0 && (
          <div className="product-swatches">
            {product.colors.map((c, i) => (
              <span
                key={i}
                className="color-dot"
                style={{ backgroundColor: c.hex }}
                title={c.name}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
