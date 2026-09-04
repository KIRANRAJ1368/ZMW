import React, { useState } from "react";
import { useShop } from "../../context/ShopContext";
import "./CheckoutModal.css";

const PAYMENT_METHODS = [
  { id: "card", name: "Credit / Debit Card", icon: "💳", desc: "Visa, Mastercard, Amex" },
  { id: "upi", name: "UPI / QR Payment", icon: "⚡", desc: "Google Pay, PhonePe, Paytm" },
  { id: "applepay", name: "Apple Pay / Wallet", icon: "", desc: "Express 1-Click biometric" },
  { id: "netbanking", name: "Net Banking", icon: "🏦", desc: "All major international banks" },
  { id: "cod", name: "Cash on Delivery", icon: "📦", desc: "Pay upon physical receipt" }
];

export default function CheckoutModal() {
  const {
    isCheckoutOpen,
    setIsCheckoutOpen,
    cart,
    cartTotal,
    cartSubtotal,
    discountAmount,
    shippingCost,
    appliedCoupon,
    formatPrice,
    clearCart,
    addToast
  } = useShop();

  const [paymentMethod, setPaymentMethod] = useState("card");
  const [formData, setFormData] = useState({
    firstName: "Elena",
    lastName: "Rostova",
    email: "elena.rostova@atelier.com",
    address: "740 Park Avenue, Apt 14B",
    city: "New York",
    postalCode: "10021",
    country: "United States",
    phone: "+1 (555) 234-8901",
    cardNumber: "•••• •••• •••• 4242",
    cardExp: "12/28",
    cardCvc: "888"
  });

  const [isOrdered, setIsOrdered] = useState(false);
  const [orderRef, setOrderRef] = useState("");

  if (!isCheckoutOpen) return null;

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handlePlaceOrder = (e) => {
    e.preventDefault();
    const generatedOrder = "ZMW-" + Math.floor(10000 + Math.random() * 90000);
    setOrderRef(generatedOrder);
    setIsOrdered(true);
    clearCart();
    addToast(`Order ${generatedOrder} confirmed! Thank you for choosing ZMW.`, "success");
  };

  const handleClose = () => {
    setIsCheckoutOpen(false);
    setIsOrdered(false);
  };

  return (
    <div className="modal-overlay active" onClick={handleClose}>
      <div className="checkout-modal-container" onClick={(e) => e.stopPropagation()}>
        <button className="checkout-close-btn" onClick={handleClose} aria-label="Close Checkout">
          ✕
        </button>

        {isOrdered ? (
          <div className="checkout-success-view">
            <div className="success-check-icon">✓</div>
            <span className="success-kicker">PAYMENT CONFIRMED</span>
            <h2 className="success-title">Thank You For Your Order</h2>
            <p className="success-desc">
              Your order <strong>{orderRef}</strong> has been successfully placed and routed to our master atelier for hand packaging.
            </p>

            <div className="order-receipt-box">
              <div className="receipt-row">
                <span>Confirmation Sent To</span>
                <strong>{formData.email}</strong>
              </div>
              <div className="receipt-row">
                <span>Shipping Address</span>
                <strong>{formData.address}, {formData.city}</strong>
              </div>
              <div className="receipt-row">
                <span>Payment Method</span>
                <strong>{paymentMethod.toUpperCase()}</strong>
              </div>
              <div className="receipt-row total-highlight">
                <span>Total Amount Paid</span>
                <strong>{formatPrice(cartTotal)}</strong>
              </div>
            </div>

            <button className="btn btn-primary" onClick={handleClose}>
              Continue Shopping
            </button>
          </div>
        ) : (
          <div className="checkout-grid">
            {/* Left Column: Form & Payment */}
            <div className="checkout-form-col">
              <span className="checkout-kicker">SECURE CHECKOUT</span>
              <h2 className="checkout-heading">Shipping & Payment</h2>

              <form onSubmit={handlePlaceOrder} id="checkout-form">
                <h3 className="form-subheading">1. Contact & Shipping Details</h3>
                <div className="form-grid-2">
                  <div className="form-group">
                    <label>First Name</label>
                    <input
                      name="firstName"
                      type="text"
                      required
                      value={formData.firstName}
                      onChange={handleChange}
                      className="auth-input"
                    />
                  </div>
                  <div className="form-group">
                    <label>Last Name</label>
                    <input
                      name="lastName"
                      type="text"
                      required
                      value={formData.lastName}
                      onChange={handleChange}
                      className="auth-input"
                    />
                  </div>
                </div>

                <div className="form-grid-2">
                  <div className="form-group">
                    <label>Email Address</label>
                    <input
                      name="email"
                      type="email"
                      required
                      value={formData.email}
                      onChange={handleChange}
                      className="auth-input"
                    />
                  </div>
                  <div className="form-group">
                    <label>Phone</label>
                    <input
                      name="phone"
                      type="tel"
                      required
                      value={formData.phone}
                      onChange={handleChange}
                      className="auth-input"
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>Street Address</label>
                  <input
                    name="address"
                    type="text"
                    required
                    value={formData.address}
                    onChange={handleChange}
                    className="auth-input"
                  />
                </div>

                <div className="form-grid-3">
                  <div className="form-group">
                    <label>City</label>
                    <input
                      name="city"
                      type="text"
                      required
                      value={formData.city}
                      onChange={handleChange}
                      className="auth-input"
                    />
                  </div>
                  <div className="form-group">
                    <label>Postal Code</label>
                    <input
                      name="postalCode"
                      type="text"
                      required
                      value={formData.postalCode}
                      onChange={handleChange}
                      className="auth-input"
                    />
                  </div>
                  <div className="form-group">
                    <label>Country</label>
                    <input
                      name="country"
                      type="text"
                      required
                      value={formData.country}
                      onChange={handleChange}
                      className="auth-input"
                    />
                  </div>
                </div>

                <h3 className="form-subheading" style={{ marginTop: "24px" }}>
                  2. Select Payment Method
                </h3>
                <div className="payment-options-list">
                  {PAYMENT_METHODS.map((pm) => (
                    <label
                      key={pm.id}
                      className={`payment-option-card ${paymentMethod === pm.id ? "selected" : ""}`}
                    >
                      <input
                        type="radio"
                        name="paymentMethod"
                        value={pm.id}
                        checked={paymentMethod === pm.id}
                        onChange={() => setPaymentMethod(pm.id)}
                      />
                      <span className="pm-icon">{pm.icon}</span>
                      <div className="pm-info">
                        <span className="pm-name">{pm.name}</span>
                        <span className="pm-desc">{pm.desc}</span>
                      </div>
                    </label>
                  ))}
                </div>

                {paymentMethod === "card" && (
                  <div className="card-input-box">
                    <div className="form-group">
                      <label>Card Number</label>
                      <input
                        name="cardNumber"
                        type="text"
                        value={formData.cardNumber}
                        onChange={handleChange}
                        className="auth-input"
                      />
                    </div>
                    <div className="form-grid-2">
                      <div className="form-group">
                        <label>Expiry (MM/YY)</label>
                        <input
                          name="cardExp"
                          type="text"
                          value={formData.cardExp}
                          onChange={handleChange}
                          className="auth-input"
                        />
                      </div>
                      <div className="form-group">
                        <label>CVV / CVC</label>
                        <input
                          name="cardCvc"
                          type="text"
                          value={formData.cardCvc}
                          onChange={handleChange}
                          className="auth-input"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </form>
            </div>

            {/* Right Column: Order Summary */}
            <div className="checkout-summary-col">
              <h3 className="summary-title">Order Summary ({cart.length} items)</h3>
              <div className="checkout-items-mini">
                {cart.map((item) => (
                  <div key={`${item.id}-${item.size}-${item.color}`} className="mini-item">
                    <img src={item.image} alt={item.name} className="mini-item-img" />
                    <div className="mini-item-details">
                      <span className="mini-name">{item.name}</span>
                      <span className="mini-qty">
                        Qty: {item.quantity} • {item.size} / {item.color}
                      </span>
                    </div>
                    <span className="mini-price">
                      {formatPrice(item.price * item.quantity)}
                    </span>
                  </div>
                ))}
              </div>

              <div className="checkout-breakdown">
                <div className="breakdown-row">
                  <span>Subtotal</span>
                  <span>{formatPrice(cartSubtotal)}</span>
                </div>
                {appliedCoupon && (
                  <div className="breakdown-row discount">
                    <span>Discount ({appliedCoupon.code})</span>
                    <span>-{formatPrice(discountAmount)}</span>
                  </div>
                )}
                <div className="breakdown-row">
                  <span>Express Shipping</span>
                  <span>{shippingCost === 0 ? "FREE" : formatPrice(shippingCost)}</span>
                </div>
                <div className="breakdown-row total-highlight">
                  <span>Total Amount</span>
                  <span>{formatPrice(cartTotal)}</span>
                </div>
              </div>

              <button
                type="submit"
                form="checkout-form"
                className="btn btn-primary btn-lg"
                style={{ width: "100%", marginTop: "20px" }}
              >
                Complete Order • {formatPrice(cartTotal)}
              </button>

              <div className="checkout-trust-icons">
                <span>🔒 Encrypted 256-bit SSL</span>
                <span>🛡️ Money-Back Guarantee</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
