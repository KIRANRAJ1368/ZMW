import React, { useState, useEffect } from "react";
import { useShop } from "../../context/ShopContext";
import "./QuickViewModal.css";

export default function QuickViewModal() {
  const {
    quickViewProduct,
    setQuickViewProduct,
    formatPrice,
    addToCart,
    wishlist,
    toggleWishlist
  } = useShop();

  const [activeImgIndex, setActiveImgIndex] = useState(0);
  const [selectedColor, setSelectedColor] = useState(null);
  const [selectedSize, setSelectedSize] = useState(null);
  const [quantity, setQuantity] = useState(1);

  // Initialize defaults when product changes
  useEffect(() => {
    if (quickViewProduct) {
      setActiveImgIndex(0);
      setSelectedColor(quickViewProduct.colors ? quickViewProduct.colors[0]?.name : null);
      setSelectedSize(quickViewProduct.sizes ? quickViewProduct.sizes[0] : null);
      setQuantity(1);
    }
  }, [quickViewProduct]);

  if (!quickViewProduct) return null;

  const isSaved = wishlist.includes(quickViewProduct.id);

  const handleAddToCart = () => {
    addToCart(quickViewProduct, selectedColor, selectedSize, quantity);
    setQuickViewProduct(null);
  };

  return (
    <div className="modal-overlay active" onClick={() => setQuickViewProduct(null)}>
      <div className="quickview-container" onClick={(e) => e.stopPropagation()}>
        {/* Close button */}
        <button
          className="quickview-close-btn"
          onClick={() => setQuickViewProduct(null)}
          aria-label="Close Quick View"
        >
          ✕
        </button>

        <div className="quickview-grid">
          {/* Image Gallery Column */}
          <div className="quickview-gallery">
            <div className="quickview-main-image">
              {quickViewProduct.badge && (
                <span className={`product-badge badge-${quickViewProduct.badgeType || "new"}`}>
                  {quickViewProduct.badge}
                </span>
              )}
              <img
                src={quickViewProduct.images[activeImgIndex] || quickViewProduct.images[0]}
                alt={quickViewProduct.name}
                className="main-view-img"
              />
            </div>

            {/* Thumbnail Row */}
            {quickViewProduct.images && quickViewProduct.images.length > 1 && (
              <div className="quickview-thumbnails">
                {quickViewProduct.images.map((img, i) => (
                  <button
                    key={i}
                    className={`thumb-btn ${i === activeImgIndex ? "active" : ""}`}
                    onClick={() => setActiveImgIndex(i)}
                  >
                    <img src={img} alt={`Angle ${i + 1}`} />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Details & Variant Selectors */}
          <div className="quickview-details">
            <span className="quickview-category">{quickViewProduct.category}</span>
            <h2 className="quickview-title">{quickViewProduct.name}</h2>

            {/* Rating & SKU */}
            <div className="quickview-meta-row">
              <div className="star-rating">
                <span>★</span>
                <span>{quickViewProduct.rating}</span>
                <span className="review-count">({quickViewProduct.reviewCount} reviews)</span>
              </div>
              <span className="sku-tag">SKU: {quickViewProduct.sku}</span>
            </div>

            {/* Pricing */}
            <div className="quickview-price-row">
              <span className="price-current">{formatPrice(quickViewProduct.price)}</span>
              {quickViewProduct.originalPrice && (
                <span className="price-original">
                  {formatPrice(quickViewProduct.originalPrice)}
                </span>
              )}
            </div>

            <p className="quickview-description">{quickViewProduct.description}</p>

            {/* Color Selector */}
            {quickViewProduct.colors && quickViewProduct.colors.length > 0 && (
              <div className="variant-block">
                <span className="variant-label">
                  Color: <strong>{selectedColor}</strong>
                </span>
                <div className="color-swatch-list">
                  {quickViewProduct.colors.map((c) => (
                    <button
                      key={c.name}
                      className={`color-swatch-btn ${selectedColor === c.name ? "active" : ""}`}
                      style={{ backgroundColor: c.hex }}
                      onClick={() => setSelectedColor(c.name)}
                      title={c.name}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Size Selector */}
            {quickViewProduct.sizes && quickViewProduct.sizes.length > 0 && (
              <div className="variant-block">
                <div className="size-header">
                  <span className="variant-label">
                    Size: <strong>{selectedSize}</strong>
                  </span>
                  <button className="size-guide-btn" type="button">Size Guide</button>
                </div>
                <div className="size-pill-list">
                  {quickViewProduct.sizes.map((s) => (
                    <button
                      key={s}
                      className={`size-pill ${selectedSize === s ? "active" : ""}`}
                      onClick={() => setSelectedSize(s)}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity & CTA */}
            <div className="quickview-actions">
              <div className="qty-control">
                <button
                  className="qty-btn"
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  disabled={quantity <= 1}
                >
                  -
                </button>
                <span className="qty-value">{quantity}</span>
                <button
                  className="qty-btn"
                  onClick={() => setQuantity((q) => q + 1)}
                >
                  +
                </button>
              </div>

              <button
                className="btn btn-primary btn-add-bag"
                onClick={handleAddToCart}
              >
                Add To Bag • {formatPrice(quickViewProduct.price * quantity)}
              </button>

              <button
                className={`btn-wishlist-round ${isSaved ? "saved" : ""}`}
                onClick={() => toggleWishlist(quickViewProduct.id)}
                title={isSaved ? "Saved to Wishlist" : "Save to Wishlist"}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill={isSaved ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2">
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                </svg>
              </button>
            </div>

            {/* Stock indicator */}
            <div className="stock-indicator">
              <span className="stock-dot"></span>
              <span>In stock ready to ship ({quickViewProduct.stockCount} units remaining)</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
