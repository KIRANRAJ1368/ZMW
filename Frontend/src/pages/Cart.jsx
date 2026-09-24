import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useShop } from "../context/ShopContext";
import { imageUrl } from "../utils/imageUrl";
import "./Cart.css";

/* ─────────────────────────────────────────────
   Inline SVG icons
───────────────────────────────────────────── */
const TrashIcon = () => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6" />
    <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
    <path d="M10 11v6M14 11v6" />
    <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
  </svg>
);

const ArrowRightIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="5" y1="12" x2="19" y2="12" />
    <polyline points="12 5 19 12 12 19" />
  </svg>
);

const ArrowLeftIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="19" y1="12" x2="5" y2="12" />
    <polyline points="12 19 5 12 12 5" />
  </svg>
);

/* ─────────────────────────────────────────────
   ZMW Clothing Cart Page Component
───────────────────────────────────────────── */
export default function Cart() {
  const navigate = useNavigate();

  const {
    cart,
    cartItemCount,
    cartSubtotal,
    discountAmount,
    shippingCost,
    cartTotal,
    appliedCoupon,
    couponError,
    applyCoupon,
    removeCoupon,
    updateQuantity,
    removeFromCart,
    clearCart,
    formatPrice,
    proceedToCheckout,
  } = useShop();

  const [couponInput, setCouponInput] = useState("");

  const handleCouponSubmit = (e) => {
    e.preventDefault();
    if (couponInput.trim()) {
      applyCoupon(couponInput);
      setCouponInput("");
    }
  };

  const handleProceedToCheckout = () => {
    navigate("/checkout");
  };

  /* ─── EMPTY STATE ─── */
  if (cart.length === 0) {
    return (
      <div className="cp-page">
        <div className="container">
          <div className="cp-header-center">
            <h1 className="cp-page-main-title">Your Shopping Cart</h1>
            <p className="cp-page-sub-title">REVIEW YOUR SELECTED ITEMS</p>
          </div>

          <div className="cp-empty">
            <div className="cp-empty-inner">
              <div className="cp-empty-icon" aria-hidden="true">
                <svg width="68" height="68" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.3">
                  <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
                  <line x1="3" y1="6" x2="21" y2="6" />
                  <path d="M16 10a4 4 0 0 1-8 0" />
                </svg>
              </div>

              <h2 className="cp-empty-title">Your cart is empty</h2>
              <p className="cp-empty-subtitle">
                Looks like you haven't added anything yet.<br />
                Explore our curated luxury collections and find your signature style.
              </p>

              <Link to="/collection" className="cp-empty-cta">
                Continue Shopping <ArrowRightIcon />
              </Link>

              <div className="cp-empty-links">
                <span className="cp-empty-links-label">POPULAR CATEGORIES</span>
                <div className="cp-empty-chips">
                  <Link to="/collection?category=mens" className="cp-chip">Men</Link>
                  <Link to="/collection?category=women" className="cp-chip">Women</Link>
                  <Link to="/collection?category=boys" className="cp-chip">Boys</Link>
                  <Link to="/collection?category=girls" className="cp-chip">Girls</Link>
                  <Link to="/collection?category=babies" className="cp-chip">Babies</Link>
                  <Link to="/collection?collection=new-arrivals" className="cp-chip">New Arrivals</Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  /* ─── POPULATED CART ─── */
  return (
    <div className="cp-page">
      <div className="container">
        {/* 1. Page Header (Centered) */}
        <header className="cp-header-center">
          <h1 className="cp-page-main-title">Your Shopping Cart</h1>
          <p className="cp-page-sub-title">REVIEW YOUR SELECTED ITEMS</p>
        </header>

        {/* 2. Main Content Area (Two-Column Desktop) */}
        <div className="cp-layout">

          {/* ════════════════════════════════
              LEFT SIDE — Cart Items
          ════════════════════════════════ */}
          <div className="cp-items-col">

            {/* Meta Row: Item count on left, CLEAR CART on right */}
            <div className="cp-items-meta-row">
              <span className="cp-items-meta-text">
                {cart.length} {cart.length === 1 ? "item" : "items"} • {cartItemCount} total {cartItemCount === 1 ? "unit" : "units"}
              </span>
              <button
                type="button"
                className="cp-clear-cart-link"
                onClick={clearCart}
              >
                CLEAR CART
              </button>
            </div>

            {/* Cart Product Cards List */}
            <div className="cp-cards-list">
              {cart.map((item) => {
                const key = `${item.id}-${item.color}-${item.size}`;
                const lineTotal = item.price * item.quantity;
                const isLinkable = Boolean(item.id && !String(item.id).startsWith("zmw-"));

                return (
                  <article className="cp-cart-card" key={key}>
                    {/* Product image on left */}
                    <div
                      className={`cp-card-img-wrap${isLinkable ? " --clickable" : ""}`}
                      onClick={() => isLinkable && navigate(`/product/${item.id}`)}
                      role={isLinkable ? "button" : undefined}
                      tabIndex={isLinkable ? 0 : undefined}
                      aria-label={isLinkable ? `View ${item.name}` : undefined}
                      onKeyDown={(e) => {
                        if (isLinkable && (e.key === "Enter" || e.key === " ")) {
                          navigate(`/product/${item.id}`);
                        }
                      }}
                    >
                      <img
                        src={imageUrl(item.image) || "/images/photo-1521572163474-6864f9cf17ab.jpg"}
                        alt={item.name}
                        className="cp-card-img"
                        loading="lazy"
                        onError={(e) => {
                          e.currentTarget.onerror = null;
                          e.currentTarget.src = "/images/photo-1521572163474-6864f9cf17ab.jpg";
                        }}
                      />
                    </div>

                    {/* Product Details & Controls */}
                    <div className="cp-card-content">
                      {/* Product Name + Delete/Trash Icon */}
                      <div className="cp-card-top-row">
                        <h3 className="cp-card-title">
                          {isLinkable ? (
                            <Link to={`/product/${item.id}`}>{item.name}</Link>
                          ) : (
                            item.name
                          )}
                        </h3>
                        <button
                          type="button"
                          className="cp-card-delete-btn"
                          onClick={() => removeFromCart(item.id, item.color, item.size)}
                          title="Remove item"
                          aria-label={`Remove ${item.name} from cart`}
                        >
                          <TrashIcon />
                        </button>
                      </div>

                      {/* Selected Color & Size */}
                      <div className="cp-card-variants">
                        {item.color && item.color !== "Standard" && (
                          <span>Color: <strong>{item.color}</strong></span>
                        )}
                        {item.color && item.color !== "Standard" && item.size && item.size !== "Standard" && (
                          <span className="cp-var-sep"> | </span>
                        )}
                        {item.size && item.size !== "Standard" && (
                          <span>Size: <strong>{item.size}</strong></span>
                        )}
                      </div>

                      {/* Stock Status */}
                      <div className="cp-card-stock">
                        <span className="cp-stock-dot">●</span> In stock
                      </div>

                      {/* Bottom row: Quantity Selector on left, Pricing on right */}
                      <div className="cp-card-bottom-row">
                        {/* Quantity Selector: −   1   + */}
                        <div className="cp-stepper-box" aria-label="Quantity selector">
                          <button
                            type="button"
                            className="cp-step-btn"
                            onClick={() => updateQuantity(item.id, item.color, item.size, -1)}
                            aria-label="Decrease quantity"
                          >−</button>
                          <span className="cp-step-num" aria-live="polite">{item.quantity}</span>
                          <button
                            type="button"
                            className="cp-step-btn"
                            onClick={() => updateQuantity(item.id, item.color, item.size, 1)}
                            aria-label="Increase quantity"
                          >+</button>
                        </div>

                        {/* Price Display */}
                        <div className="cp-card-price-box">
                          {/* Original / MRP price with strikethrough if available */}
                          {item.originalPrice && Number(item.originalPrice) > Number(item.price) && (
                            <span className="cp-card-orig-price">
                              {formatPrice(item.originalPrice * item.quantity)}
                            </span>
                          )}
                          {/* Current selling price */}
                          <span className="cp-card-current-price">
                            {formatPrice(lineTotal)}
                          </span>
                          {/* Price per item if quantity > 1 */}
                          {item.quantity > 1 && (
                            <span className="cp-card-unit-price">
                              {formatPrice(item.price)} each
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>

            {/* Bottom Continue Shopping Link */}
            <div className="cp-items-bottom-action">
              <Link to="/collection" className="cp-continue-shopping-link">
                <ArrowLeftIcon />
                Continue Shopping
              </Link>
            </div>
          </div>

          {/* ════════════════════════════════
              RIGHT SIDE — ORDER SUMMARY
          ════════════════════════════════ */}
          <aside className="cp-summary-col" aria-label="Order Summary">
            <div className="cp-summary-card">
              <h2 className="cp-summary-heading">ORDER SUMMARY</h2>

              {/* Summary Rows */}
              <div className="cp-summary-rows">
                <div className="cp-summary-row">
                  <span className="cp-sr-label">Items ({cart.length})</span>
                  <span className="cp-sr-value">{cartItemCount} {cartItemCount === 1 ? "unit" : "units"}</span>
                </div>

                <div className="cp-summary-row">
                  <span className="cp-sr-label">Subtotal</span>
                  <span className="cp-sr-value">{formatPrice(cartSubtotal)}</span>
                </div>

                <div className="cp-summary-row">
                  <span className="cp-sr-label">Estimated Shipping</span>
                  <span className="cp-sr-value --shipping-val">
                    {shippingCost === 0 ? "Calculated at checkout" : formatPrice(shippingCost)}
                  </span>
                </div>

                <div className="cp-summary-row">
                  <span className="cp-sr-label">Estimated Taxes</span>
                  <span className="cp-sr-value">Calculated at checkout</span>
                </div>

                {appliedCoupon && (
                  <div className="cp-summary-row --coupon-row">
                    <span className="cp-sr-label">Discount ({appliedCoupon.code})</span>
                    <span className="cp-sr-value --discount-val">−{formatPrice(discountAmount)}</span>
                  </div>
                )}
              </div>

              {/* 4. Coupon Section Inside Order Summary */}
              <div className="cp-coupon-box">
                <div className="cp-coupon-box-title">HAVE A COUPON CODE?</div>
                {appliedCoupon ? (
                  <div className="cp-coupon-active">
                    <span><strong>{appliedCoupon.code}</strong> applied ({appliedCoupon.discountPercent}% OFF)</span>
                    <button
                      type="button"
                      className="cp-coupon-remove-btn"
                      onClick={removeCoupon}
                      aria-label="Remove coupon"
                    >
                      ✕
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleCouponSubmit} className="cp-coupon-form">
                    <div className="cp-coupon-input-wrap">
                      <input
                        type="text"
                        placeholder="ENTER CODE"
                        value={couponInput}
                        onChange={(e) => setCouponInput(e.target.value)}
                        className="cp-coupon-input"
                        aria-label="Coupon code"
                        autoCapitalize="characters"
                      />
                      <button type="submit" className="cp-coupon-apply-btn">APPLY</button>
                    </div>
                    {couponError && <p className="cp-coupon-error">{couponError}</p>}
                  </form>
                )}
              </div>

              {/* Divider */}
              <div className="cp-summary-divider" />

              {/* Grand Total */}
              <div className="cp-grand-total-row">
                <span className="cp-grand-total-label">Grand Total</span>
                <span className="cp-grand-total-value">{formatPrice(cartTotal)}</span>
              </div>
              <p className="cp-tax-inclusive-note">Inclusive of all taxes</p>

              {/* Primary Button: PROCEED TO CHECKOUT → */}
              <button
                type="button"
                className="cp-checkout-btn"
                onClick={handleProceedToCheckout}
              >
                PROCEED TO CHECKOUT &rarr;
              </button>
            </div>
          </aside>

        </div>{/* end cp-layout */}
      </div>{/* end container */}
    </div>
  );
}
