import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useShop } from "../../context/ShopContext";
import "./CartDrawer.css";

export default function CartDrawer() {
  const navigate = useNavigate();

  const {
    isCartOpen,
    setIsCartOpen,
    cart,
    cartItemCount,
    cartSubtotal,
    discountAmount,
    shippingCost,
    cartTotal,
    isFreeShipping,
    freeShippingRemaining,
    freeShippingPercent,
    appliedCoupon,
    couponError,
    applyCoupon,
    removeCoupon,
    updateQuantity,
    removeFromCart,
    formatPrice,
    setIsCheckoutOpen,
    proceedToCheckout
  } = useShop();

  const [couponInput, setCouponInput] = useState("");

  if (!isCartOpen) return null;

  const handleCouponSubmit = (e) => {
    e.preventDefault();
    if (couponInput.trim()) {
      applyCoupon(couponInput);
      setCouponInput("");
    }
  };

  const handleProceedCheckout = () => {
    setIsCartOpen(false);
    navigate("/checkout");
  };

  return (
    <>
      <div className="drawer-backdrop active" onClick={() => setIsCartOpen(false)} />
      <div className="cart-drawer-panel active">
        {/* Header */}
        <div className="cart-drawer-header">
          <div className="cart-title-row">
            <h2 className="cart-heading">Your Shopping Bag</h2>
            <span className="cart-items-count">({cartItemCount} items)</span>
          </div>
          <button
            className="drawer-close-btn"
            onClick={() => setIsCartOpen(false)}
            aria-label="Close cart"
          >
            ✕
          </button>
        </div>

        {/* Free Shipping Progress Bar */}
        <div className="free-shipping-bar">
          <div className="shipping-text">
            {isFreeShipping ? (
              <span className="shipping-unlocked">
                🎉 <strong>Congratulations!</strong> You have unlocked Free Express Shipping!
              </span>
            ) : (
              <span>
                Add <strong>{formatPrice(freeShippingRemaining)}</strong> more to get{" "}
                <strong>Free Shipping</strong>
              </span>
            )}
          </div>
          <div className="progress-track">
            <div
              className="progress-fill"
              style={{ width: `${freeShippingPercent}%` }}
            />
          </div>
        </div>

        {/* Cart Items List */}
        <div className="cart-items-container">
          {cart.length === 0 ? (
            <div className="cart-empty-state">
              <div className="empty-cart-icon">🛍️</div>
              <h3>Your bag is empty</h3>
              <p>Looks like you haven't added any luxury pieces yet.</p>
              <button
                className="btn btn-primary btn-sm"
                onClick={() => setIsCartOpen(false)}
              >
                Discover Collection
              </button>
            </div>
          ) : (
            cart.map((item) => (
              <div key={`${item.id}-${item.color}-${item.size}`} className="cart-item-card">
                <img src={item.image} alt={item.name} className="cart-item-img" />

                <div className="cart-item-info">
                  <div className="cart-item-head">
                    <h4 className="cart-item-name">{item.name}</h4>
                    <button
                      className="cart-item-remove"
                      onClick={() => removeFromCart(item.id, item.color, item.size)}
                      title="Remove item"
                      aria-label="Remove item"
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <line x1="18" y1="6" x2="6" y2="18"></line>
                        <line x1="6" y1="6" x2="18" y2="18"></line>
                      </svg>
                    </button>
                  </div>

                  <div className="cart-item-variant">
                    <span>Size: {item.size}</span>
                    <span>•</span>
                    <span>Color: {item.color}</span>
                  </div>

                  <div className="cart-item-bottom">
                    <div className="qty-control-sm">
                      <button
                        onClick={() => updateQuantity(item.id, item.color, item.size, -1)}
                      >
                        -
                      </button>
                      <span>{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.id, item.color, item.size, 1)}
                      >
                        +
                      </button>
                    </div>

                    <span className="cart-item-price">
                      {formatPrice(item.price * item.quantity)}
                    </span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer & Order Summary */}
        {cart.length > 0 && (
          <div className="cart-drawer-footer">
            {/* Coupon Code Form */}
            <form className="coupon-form" onSubmit={handleCouponSubmit}>
              <div className="coupon-input-group">
                <input
                  type="text"
                  placeholder="Coupon code (try WELCOME10)"
                  value={couponInput}
                  onChange={(e) => setCouponInput(e.target.value)}
                  className="coupon-input"
                />
                <button type="submit" className="btn btn-secondary btn-sm">
                  Apply
                </button>
              </div>
              {couponError && <p className="coupon-error">{couponError}</p>}
              {appliedCoupon && (
                <div className="applied-coupon-tag">
                  <span>
                    ✓ Code <strong>{appliedCoupon.code}</strong> applied (-{appliedCoupon.discountPercent}%)
                  </span>
                  <button type="button" onClick={removeCoupon} className="remove-coupon-btn">
                    ✕
                  </button>
                </div>
              )}
            </form>

            {/* Calculations Breakdown */}
            <div className="cart-summary-table">
              <div className="summary-row">
                <span>Subtotal</span>
                <span>{formatPrice(cartSubtotal)}</span>
              </div>
              {appliedCoupon && (
                <div className="summary-row discount-row">
                  <span>Promo Discount ({appliedCoupon.code})</span>
                  <span>-{formatPrice(discountAmount)}</span>
                </div>
              )}
              <div className="summary-row">
                <span>Estimated Shipping</span>
                <span>
                  {shippingCost === 0 ? "FREE" : formatPrice(shippingCost)}
                </span>
              </div>
              <div className="summary-row total-row">
                <span>Total</span>
                <span>{formatPrice(cartTotal)}</span>
              </div>
            </div>

            {/* Checkout Action Button */}
            <button
              className="btn btn-primary btn-checkout"
              onClick={handleProceedCheckout}
            >
              <span>Proceed to Checkout</span>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="5" y1="12" x2="19" y2="12"></line>
                <polyline points="12 5 19 12 12 19"></polyline>
              </svg>
            </button>

            <div className="cart-guarantee-note">
              <span>🔒 256-Bit SSL Encrypted Checkout • 14-Day Free Returns</span>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
