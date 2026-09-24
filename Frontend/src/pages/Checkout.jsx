import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useShop } from "../context/ShopContext";
import { storefrontApi } from "../services/storefrontApi";
import { imageUrl } from "../utils/imageUrl";
import "./Checkout.css";

/* ─────────────────────────────────────────────
   Supported Payment Methods (ZMW Supported)
───────────────────────────────────────────── */
const PAYMENT_METHODS = [
  {
    id: "upi",
    name: "UPI / Instant Pay",
    icon: "⚡",
    desc: "Google Pay, PhonePe, Paytm, BHIM & UPI ID"
  },
  {
    id: "card",
    name: "Credit / Debit Card",
    icon: "💳",
    desc: "Visa, Mastercard, RuPay & Corporate Cards"
  },
  {
    id: "cod",
    name: "Cash on Delivery",
    icon: "📦",
    desc: "Pay in cash upon physical receipt at your door"
  },
  {
    id: "netbanking",
    name: "Net Banking",
    icon: "🏦",
    desc: "HDFC, ICICI, SBI, Axis & all major Indian banks"
  }
];

export default function Checkout() {
  const navigate = useNavigate();

  const {
    cart,
    cartTotal,
    cartSubtotal,
    cartItemCount,
    discountAmount,
    shippingCost,
    appliedCoupon,
    couponError,
    applyCoupon,
    removeCoupon,
    formatPrice,
    clearCart,
    addToast,
    customerUser,
    customerToken,
    setAuthModalState,
    logoutCustomer
  } = useShop();

  // Progress Step: 1 = Contact, 2 = Delivery, 3 = Payment
  const [currentStep, setCurrentStep] = useState(1);

  // Form Fields
  const [formData, setFormData] = useState({
    email: "",
    phone: "",
    keepUpdated: true,
    fullName: "",
    address: "",
    apartment: "",
    city: "",
    state: "",
    postalCode: "",
    country: "India",
    cardNumber: "•••• •••• •••• 4242",
    cardExp: "12/28",
    cardCvc: "888"
  });

  const [paymentMethod, setPaymentMethod] = useState("upi");
  const [couponInput, setCouponInput] = useState("");
  const [stepErrors, setStepErrors] = useState({});

  // Submission / Confirmation State
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [isOrdered, setIsOrdered] = useState(false);
  const [orderReceipt, setOrderReceipt] = useState(null);

  // Auto-populate customer fields if signed in
  useEffect(() => {
    if (customerUser) {
      setFormData((prev) => ({
        ...prev,
        fullName: customerUser.name || prev.fullName,
        email: customerUser.email || prev.email,
        phone: customerUser.phone || prev.phone
      }));
    }
  }, [customerUser]);

  // Form change handler
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value
    }));
    if (stepErrors[name]) {
      setStepErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  /* ── Step 1 Validation & Proceed ── */
  const handleContinueToDelivery = (e) => {
    e.preventDefault();
    const errors = {};

    const trimmedEmail = (formData.email || "").trim();
    if (!trimmedEmail) {
      errors.email = "Email address is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      errors.email = "Please enter a valid email address";
    }

    const trimmedPhone = (formData.phone || "").trim();
    if (!trimmedPhone) {
      errors.phone = "Phone number is required";
    } else if (trimmedPhone.replace(/\D/g, "").length < 10) {
      errors.phone = "Please enter a valid 10-digit phone number";
    }

    if (Object.keys(errors).length > 0) {
      setStepErrors(errors);
      return;
    }

    setStepErrors({});
    setCurrentStep(2);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  /* ── Step 2 Validation & Proceed ── */
  const handleContinueToPayment = (e) => {
    e.preventDefault();
    const errors = {};

    if (!formData.fullName.trim()) {
      errors.fullName = "Full name is required";
    }
    if (!formData.phone.trim()) {
      errors.phone = "Phone number is required";
    }
    if (!formData.address.trim()) {
      errors.address = "Street address is required";
    }
    if (!formData.city.trim()) {
      errors.city = "City is required";
    }
    if (!formData.state.trim()) {
      errors.state = "State is required";
    }
    if (!formData.postalCode.trim()) {
      errors.postalCode = "PIN code is required";
    } else if (formData.postalCode.trim().length < 5) {
      errors.postalCode = "Please enter a valid PIN code";
    }

    if (Object.keys(errors).length > 0) {
      setStepErrors(errors);
      return;
    }

    setStepErrors({});
    setCurrentStep(3);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  /* ── Coupon Submission ── */
  const handleCouponSubmit = (e) => {
    e.preventDefault();
    if (couponInput.trim()) {
      applyCoupon(couponInput.trim());
      setCouponInput("");
    }
  };

  /* ── Step 3 Order Placement ── */
  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    if (!cart.length || isSubmitting) return;

    setIsSubmitting(true);
    setSubmitError("");

    try {
      const canSubmitToApi = cart.every((item) => Number.isInteger(Number(item.id)));
      let orderNumber;

      if (canSubmitToApi) {
        const fullAddress = formData.apartment
          ? `${formData.address}, ${formData.apartment}`
          : formData.address;

        const order = await storefrontApi.createOrder(
          {
            customer_name: formData.fullName.trim(),
            email: formData.email.trim(),
            phone: formData.phone.trim(),
            shipping_address: fullAddress,
            city: formData.city.trim(),
            state: formData.state.trim() || null,
            pincode: formData.postalCode.trim(),
            payment_method: paymentMethod === "cod" ? "COD" : "PREPAID",
            discount_amount: discountAmount,
            shipping_fee: shippingCost,
            items: cart.map((item) => ({
              product_id: Number(item.id),
              quantity: item.quantity,
              size: item.size,
              color: item.color
            }))
          },
          customerToken
        );
        orderNumber = order.order_number;
      } else {
        // Fallback reference for static catalog items
        orderNumber = "ZMW-" + Math.floor(10000 + Math.random() * 90000);
      }

      const receipt = {
        orderNumber,
        customerName: formData.fullName,
        email: formData.email,
        phone: formData.phone,
        address: `${formData.address}${formData.apartment ? ", " + formData.apartment : ""}, ${formData.city}, ${formData.state} - ${formData.postalCode}`,
        paymentMethod: PAYMENT_METHODS.find((p) => p.id === paymentMethod)?.name || paymentMethod.toUpperCase(),
        totalAmount: cartTotal,
        itemsCount: cartItemCount
      };

      setOrderReceipt(receipt);
      setIsOrdered(true);
      clearCart();
      addToast(`Order ${orderNumber} placed successfully!`, "success");
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err) {
      setSubmitError(err.message || "Failed to process order. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  /* ─────────────────────────────────────────────
     RENDER: ORDER SUCCESSFUL CONFIRMATION VIEW
  ───────────────────────────────────────────── */
  if (isOrdered && orderReceipt) {
    return (
      <div className="cko-page">
        <div className="container">
          <div className="cko-success-card">
            <div className="cko-success-badge">✓</div>
            <span className="cko-kicker">SECURE ORDER CONFIRMED</span>
            <h1 className="cko-success-title">Thank You For Your Order!</h1>
            <p className="cko-success-subtitle">
              Your order <strong className="cko-highlight">{orderReceipt.orderNumber}</strong> has been received and routed to our central dispatch hub.
            </p>

            <div className="cko-receipt-table">
              <div className="cko-receipt-row">
                <span className="cko-rr-label">Order Number</span>
                <span className="cko-rr-value font-mono">#{orderReceipt.orderNumber}</span>
              </div>
              <div className="cko-receipt-row">
                <span className="cko-rr-label">Confirmation Dispatched To</span>
                <span className="cko-rr-value">{orderReceipt.email}</span>
              </div>
              <div className="cko-receipt-row">
                <span className="cko-rr-label">Delivery Address</span>
                <span className="cko-rr-value">{orderReceipt.address}</span>
              </div>
              <div className="cko-receipt-row">
                <span className="cko-rr-label">Payment Mode</span>
                <span className="cko-rr-value">{orderReceipt.paymentMethod}</span>
              </div>
              <div className="cko-receipt-row cko-receipt-total">
                <span className="cko-rr-label">Total Amount Paid</span>
                <span className="cko-rr-value">{formatPrice(orderReceipt.totalAmount)}</span>
              </div>
            </div>

            <div className="cko-success-actions">
              <Link to="/collection" className="cko-btn-primary">
                CONTINUE SHOPPING →
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  /* ─────────────────────────────────────────────
     RENDER: EMPTY CART GUARD (Redirects to /cart)
  ───────────────────────────────────────────── */
  if (cart.length === 0) {
    return (
      <div className="cko-page">
        <div className="container">
          <div className="cko-header-center">
            <h1 className="cko-page-title">SECURE DISPATCH CHECKOUT</h1>
            <p className="cko-page-subtitle">Shipping & Payment</p>
          </div>

          <div className="cko-empty-card">
            <div className="cko-empty-icon" aria-hidden="true">🛒</div>
            <h2 className="cko-empty-title">Your Shopping Cart is Empty</h2>
            <p className="cko-empty-text">
              There are no items currently in your cart ready for checkout.<br />
              Please return to your cart or explore our collections.
            </p>
            <div className="cko-empty-actions">
              <Link to="/cart" className="cko-btn-primary">
                ← RETURN TO CART
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  /* ─────────────────────────────────────────────
     RENDER: DEDICATED FULL CHECKOUT PAGE
  ───────────────────────────────────────────── */
  return (
    <div className="cko-page">
      <div className="container">
        {/* Page Top Heading & Subtitle */}
        <header className="cko-header-center">
          <h1 className="cko-page-title">SECURE DISPATCH CHECKOUT</h1>
          <p className="cko-page-subtitle">Shipping & Payment</p>
          <div className="cko-trust-pill">
            <span>🔒 256-Bit Bank-Grade SSL Secured Checkout</span>
            <span className="cko-trust-dot">•</span>
            <span>Fast Insured Dispatch</span>
            <span className="cko-trust-dot">•</span>
            <span>100% Quality Inspected</span>
          </div>
        </header>

        {/* Main 2-Column Checkout Layout */}
        <div className="cko-layout">

          {/* ══════════════════════════════════════════
              LEFT SIDE — CHECKOUT STEPS CARD
          ══════════════════════════════════════════ */}
          <main className="cko-steps-col">
            <div className="cko-card cko-steps-card">

              {/* 3-Step Progress Indicator */}
              <nav className="cko-stepper-nav" aria-label="Checkout Progress">
                {/* Step 1 Indicator */}
                <button
                  type="button"
                  className={`cko-step-tab ${currentStep === 1 ? "--active" : ""} ${currentStep > 1 ? "--completed" : ""}`}
                  onClick={() => setCurrentStep(1)}
                >
                  <span className="cko-step-circle">
                    {currentStep > 1 ? "✓" : "1"}
                  </span>
                  <span className="cko-step-name">CONTACT</span>
                </button>

                <div className={`cko-step-line ${currentStep >= 2 ? "--active" : ""}`} />

                {/* Step 2 Indicator */}
                <button
                  type="button"
                  className={`cko-step-tab ${currentStep === 2 ? "--active" : ""} ${currentStep > 2 ? "--completed" : ""} ${currentStep < 2 ? "--disabled" : ""}`}
                  onClick={() => currentStep > 2 && setCurrentStep(2)}
                  disabled={currentStep < 2}
                >
                  <span className="cko-step-circle">
                    {currentStep > 2 ? "✓" : "2"}
                  </span>
                  <span className="cko-step-name">DELIVERY</span>
                </button>

                <div className={`cko-step-line ${currentStep >= 3 ? "--active" : ""}`} />

                {/* Step 3 Indicator */}
                <button
                  type="button"
                  className={`cko-step-tab ${currentStep === 3 ? "--active" : ""} ${currentStep < 3 ? "--disabled" : ""}`}
                  disabled={currentStep < 3}
                >
                  <span className="cko-step-circle">3</span>
                  <span className="cko-step-name">PAYMENT</span>
                </button>
              </nav>

              {/* ──────────────────────────────────
                  STEP 1 — CONTACT INFORMATION
              ────────────────────────────────── */}
              {currentStep === 1 && (
                <section className="cko-step-content" aria-labelledby="step-1-heading">
                  <div className="cko-section-title-row">
                    <span className="cko-badge-num">1</span>
                    <h2 id="step-1-heading" className="cko-section-title">Contact Information</h2>
                  </div>

                  {/* Customer Status Banner */}
                  {customerUser ? (
                    <div className="cko-auth-banner --signed-in">
                      <div className="cko-ab-icon">✓</div>
                      <div className="cko-ab-text">
                        <span className="cko-ab-name">Signed in as <strong>{customerUser.name}</strong></span>
                        <span className="cko-ab-sub">{customerUser.email} • Order will be linked to your account</span>
                      </div>
                      <button type="button" className="cko-ab-btn" onClick={logoutCustomer}>
                        Sign Out
                      </button>
                    </div>
                  ) : (
                    <div className="cko-auth-banner --guest">
                      <div className="cko-ab-icon">⚡</div>
                      <div className="cko-ab-text">
                        <span className="cko-ab-name">Checking out as <strong>Guest</strong></span>
                        <span className="cko-ab-sub">Fast and direct checkout. Have an account?</span>
                      </div>
                      <button
                        type="button"
                        className="cko-ab-btn"
                        onClick={() => setAuthModalState("login")}
                      >
                        Sign In
                      </button>
                    </div>
                  )}

                  <form onSubmit={handleContinueToDelivery} className="cko-form">
                    <div className="cko-form-group">
                      <label htmlFor="email" className="cko-label">
                        EMAIL ADDRESS <span className="cko-req">*</span>
                      </label>
                      <input
                        id="email"
                        name="email"
                        type="email"
                        placeholder="e.g. logank7129@gmail.com"
                        value={formData.email}
                        onChange={handleInputChange}
                        className={`cko-input ${stepErrors.email ? "--error" : ""}`}
                        required
                        autoComplete="email"
                      />
                      {stepErrors.email && <p className="cko-field-error">{stepErrors.email}</p>}
                    </div>

                    <div className="cko-form-group">
                      <label htmlFor="phone" className="cko-label">
                        PHONE NUMBER <span className="cko-req">*</span>
                      </label>
                      <input
                        id="phone"
                        name="phone"
                        type="tel"
                        placeholder="e.g. 9876543210"
                        value={formData.phone}
                        onChange={handleInputChange}
                        className={`cko-input ${stepErrors.phone ? "--error" : ""}`}
                        required
                        autoComplete="tel"
                      />
                      {stepErrors.phone && <p className="cko-field-error">{stepErrors.phone}</p>}
                    </div>

                    <label className="cko-checkbox-label">
                      <input
                        type="checkbox"
                        name="keepUpdated"
                        checked={formData.keepUpdated}
                        onChange={handleInputChange}
                        className="cko-checkbox"
                      />
                      <span className="cko-checkbox-text">
                        Keep me updated with order tracking & exclusive offers
                      </span>
                    </label>

                    <button type="submit" className="cko-btn-primary cko-submit-step-btn">
                      CONTINUE TO DELIVERY →
                    </button>
                  </form>

                  {/* Collapsed Inactive Step Headers */}
                  <div className="cko-inactive-step-row" onClick={() => {}}>
                    <span className="cko-badge-num --inactive">2</span>
                    <span className="cko-inactive-title">Delivery Address</span>
                  </div>
                  <div className="cko-inactive-step-row" onClick={() => {}}>
                    <span className="cko-badge-num --inactive">3</span>
                    <span className="cko-inactive-title">Payment Method</span>
                  </div>
                </section>
              )}

              {/* ──────────────────────────────────
                  STEP 2 — DELIVERY ADDRESS
              ────────────────────────────────── */}
              {currentStep === 2 && (
                <section className="cko-step-content" aria-labelledby="step-2-heading">
                  {/* Summary of Completed Step 1 */}
                  <div className="cko-completed-summary-bar">
                    <div className="cko-cs-info">
                      <span className="cko-cs-tag">Contact:</span>
                      <span className="cko-cs-val">{formData.email} • {formData.phone}</span>
                    </div>
                    <button
                      type="button"
                      className="cko-edit-step-btn"
                      onClick={() => setCurrentStep(1)}
                    >
                      Edit
                    </button>
                  </div>

                  <div className="cko-section-title-row">
                    <span className="cko-badge-num">2</span>
                    <h2 id="step-2-heading" className="cko-section-title">Delivery Address</h2>
                  </div>

                  <form onSubmit={handleContinueToPayment} className="cko-form">
                    <div className="cko-grid-2">
                      <div className="cko-form-group">
                        <label htmlFor="fullName" className="cko-label">
                          FULL NAME <span className="cko-req">*</span>
                        </label>
                        <input
                          id="fullName"
                          name="fullName"
                          type="text"
                          placeholder="e.g. Rahul Sharma"
                          value={formData.fullName}
                          onChange={handleInputChange}
                          className={`cko-input ${stepErrors.fullName ? "--error" : ""}`}
                          required
                          autoComplete="name"
                        />
                        {stepErrors.fullName && <p className="cko-field-error">{stepErrors.fullName}</p>}
                      </div>

                      <div className="cko-form-group">
                        <label htmlFor="deliveryPhone" className="cko-label">
                          PHONE NUMBER <span className="cko-req">*</span>
                        </label>
                        <input
                          id="deliveryPhone"
                          name="phone"
                          type="tel"
                          placeholder="e.g. 9876543210"
                          value={formData.phone}
                          onChange={handleInputChange}
                          className={`cko-input ${stepErrors.phone ? "--error" : ""}`}
                          required
                        />
                        {stepErrors.phone && <p className="cko-field-error">{stepErrors.phone}</p>}
                      </div>
                    </div>

                    <div className="cko-form-group">
                      <label htmlFor="address" className="cko-label">
                        STREET ADDRESS <span className="cko-req">*</span>
                      </label>
                      <input
                        id="address"
                        name="address"
                        type="text"
                        placeholder="House / Flat no., street, landmark"
                        value={formData.address}
                        onChange={handleInputChange}
                        className={`cko-input ${stepErrors.address ? "--error" : ""}`}
                        required
                        autoComplete="street-address"
                      />
                      {stepErrors.address && <p className="cko-field-error">{stepErrors.address}</p>}
                    </div>

                    <div className="cko-form-group">
                      <label htmlFor="apartment" className="cko-label">
                        APARTMENT / BUILDING / AREA (OPTIONAL)
                      </label>
                      <input
                        id="apartment"
                        name="apartment"
                        type="text"
                        placeholder="Suite, unit, floor, building name"
                        value={formData.apartment}
                        onChange={handleInputChange}
                        className="cko-input"
                      />
                    </div>

                    <div className="cko-grid-3">
                      <div className="cko-form-group">
                        <label htmlFor="city" className="cko-label">
                          CITY <span className="cko-req">*</span>
                        </label>
                        <input
                          id="city"
                          name="city"
                          type="text"
                          placeholder="e.g. Coimbatore"
                          value={formData.city}
                          onChange={handleInputChange}
                          className={`cko-input ${stepErrors.city ? "--error" : ""}`}
                          required
                        />
                        {stepErrors.city && <p className="cko-field-error">{stepErrors.city}</p>}
                      </div>

                      <div className="cko-form-group">
                        <label htmlFor="state" className="cko-label">
                          STATE <span className="cko-req">*</span>
                        </label>
                        <input
                          id="state"
                          name="state"
                          type="text"
                          placeholder="e.g. Tamil Nadu"
                          value={formData.state}
                          onChange={handleInputChange}
                          className={`cko-input ${stepErrors.state ? "--error" : ""}`}
                          required
                        />
                        {stepErrors.state && <p className="cko-field-error">{stepErrors.state}</p>}
                      </div>

                      <div className="cko-form-group">
                        <label htmlFor="postalCode" className="cko-label">
                          PIN CODE <span className="cko-req">*</span>
                        </label>
                        <input
                          id="postalCode"
                          name="postalCode"
                          type="text"
                          placeholder="e.g. 641004"
                          value={formData.postalCode}
                          onChange={handleInputChange}
                          className={`cko-input ${stepErrors.postalCode ? "--error" : ""}`}
                          required
                        />
                        {stepErrors.postalCode && <p className="cko-field-error">{stepErrors.postalCode}</p>}
                      </div>
                    </div>

                    {/* Delivery Method Option Card */}
                    <div className="cko-delivery-option-box">
                      <div className="cko-dob-left">
                        <span className="cko-dob-radio">●</span>
                        <div>
                          <strong className="cko-dob-title">Standard Express Delivery</strong>
                          <span className="cko-dob-sub">Estimated Delivery: 3–5 Business Days (Insured Dispatch)</span>
                        </div>
                      </div>
                      <span className="cko-dob-price">
                        {shippingCost === 0 ? "FREE" : formatPrice(shippingCost)}
                      </span>
                    </div>

                    <div className="cko-step-btn-row">
                      <button
                        type="button"
                        className="cko-btn-outline"
                        onClick={() => setCurrentStep(1)}
                      >
                        ← BACK TO CONTACT
                      </button>
                      <button type="submit" className="cko-btn-primary">
                        CONTINUE TO PAYMENT →
                      </button>
                    </div>
                  </form>

                  {/* Collapsed Inactive Step 3 */}
                  <div className="cko-inactive-step-row">
                    <span className="cko-badge-num --inactive">3</span>
                    <span className="cko-inactive-title">Payment Method</span>
                  </div>
                </section>
              )}

              {/* ──────────────────────────────────
                  STEP 3 — PAYMENT METHOD
              ────────────────────────────────── */}
              {currentStep === 3 && (
                <section className="cko-step-content" aria-labelledby="step-3-heading">
                  {/* Summary of Completed Steps 1 & 2 */}
                  <div className="cko-completed-summary-bar">
                    <div className="cko-cs-info">
                      <span className="cko-cs-tag">Deliver To:</span>
                      <span className="cko-cs-val">{formData.fullName} • {formData.city}, {formData.postalCode}</span>
                    </div>
                    <button
                      type="button"
                      className="cko-edit-step-btn"
                      onClick={() => setCurrentStep(2)}
                    >
                      Edit
                    </button>
                  </div>

                  <div className="cko-section-title-row">
                    <span className="cko-badge-num">3</span>
                    <h2 id="step-3-heading" className="cko-section-title">Payment Method</h2>
                  </div>

                  <form onSubmit={handlePlaceOrder} className="cko-form">
                    {/* Selectable Payment Cards */}
                    <div className="cko-payment-methods-grid">
                      {PAYMENT_METHODS.map((pm) => {
                        const isSelected = paymentMethod === pm.id;
                        return (
                          <label
                            key={pm.id}
                            className={`cko-pm-card ${isSelected ? "--selected" : ""}`}
                          >
                            <input
                              type="radio"
                              name="paymentMethod"
                              value={pm.id}
                              checked={isSelected}
                              onChange={() => setPaymentMethod(pm.id)}
                              className="cko-pm-radio"
                            />
                            <span className="cko-pm-icon">{pm.icon}</span>
                            <div className="cko-pm-details">
                              <span className="cko-pm-name">{pm.name}</span>
                              <span className="cko-pm-desc">{pm.desc}</span>
                            </div>
                            <span className="cko-pm-check">{isSelected ? "●" : "○"}</span>
                          </label>
                        );
                      })}
                    </div>

                    {/* Credit / Debit Card Interactive Mock */}
                    {paymentMethod === "card" && (
                      <div className="cko-card-details-box">
                        <div className="cko-form-group">
                          <label className="cko-label">CARD NUMBER</label>
                          <input
                            type="text"
                            name="cardNumber"
                            value={formData.cardNumber}
                            onChange={handleInputChange}
                            className="cko-input"
                          />
                        </div>
                        <div className="cko-grid-2">
                          <div className="cko-form-group">
                            <label className="cko-label">EXPIRY (MM/YY)</label>
                            <input
                              type="text"
                              name="cardExp"
                              value={formData.cardExp}
                              onChange={handleInputChange}
                              className="cko-input"
                            />
                          </div>
                          <div className="cko-form-group">
                            <label className="cko-label">CVV</label>
                            <input
                              type="text"
                              name="cardCvc"
                              value={formData.cardCvc}
                              onChange={handleInputChange}
                              className="cko-input"
                            />
                          </div>
                        </div>
                      </div>
                    )}

                    {paymentMethod === "upi" && (
                      <div className="cko-upi-box">
                        <p className="cko-upi-instruction">
                          Scan the QR code or accept the authorization request on your preferred UPI App (GPay, PhonePe, Paytm) upon clicking Place Order.
                        </p>
                      </div>
                    )}

                    {submitError && (
                      <p role="alert" className="cko-submit-error">
                        ⚠️ {submitError}
                      </p>
                    )}

                    <div className="cko-step-btn-row">
                      <button
                        type="button"
                        className="cko-btn-outline"
                        onClick={() => setCurrentStep(2)}
                        disabled={isSubmitting}
                      >
                        ← BACK TO DELIVERY
                      </button>
                      <button
                        type="submit"
                        className="cko-btn-primary"
                        disabled={isSubmitting || !cart.length}
                      >
                        {isSubmitting
                          ? "PROCESSING ORDER..."
                          : `PLACE ORDER • ${formatPrice(cartTotal)} →`}
                      </button>
                    </div>
                  </form>
                </section>
              )}

            </div>
          </main>

          {/* ══════════════════════════════════════════
              RIGHT SIDE — ORDER SUMMARY CARD
          ══════════════════════════════════════════ */}
          <aside className="cko-summary-col" aria-label="Order Summary">
            <div className="cko-card cko-summary-card">
              {/* Header with Item Count Badge */}
              <div className="cko-summary-top">
                <h2 className="cko-summary-heading">ORDER SUMMARY</h2>
                <span className="cko-item-badge">
                  {cartItemCount} {cartItemCount === 1 ? "item" : "items"}
                </span>
              </div>

              {/* Compact Cart Product Items */}
              <div className="cko-items-list">
                {cart.map((item) => {
                  const itemKey = `${item.id}-${item.color}-${item.size}`;
                  const lineTotal = item.price * item.quantity;
                  return (
                    <div key={itemKey} className="cko-item-row">
                      <div className="cko-item-img-wrap">
                        <img
                          src={imageUrl(item.image) || "/images/photo-1521572163474-6864f9cf17ab.jpg"}
                          alt={item.name}
                          className="cko-item-img"
                          onError={(e) => {
                            e.currentTarget.onerror = null;
                            e.currentTarget.src = "/images/photo-1521572163474-6864f9cf17ab.jpg";
                          }}
                        />
                        <span className="cko-item-qty-badge">{item.quantity}</span>
                      </div>

                      <div className="cko-item-details">
                        <h3 className="cko-item-name">{item.name}</h3>
                        <p className="cko-item-variants">
                          {item.color && item.color !== "Standard" ? item.color : "Default"}
                          {item.size && item.size !== "Standard" ? ` • ${item.size}` : ""}
                        </p>
                        <span className="cko-item-price">{formatPrice(lineTotal)}</span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Coupon Box */}
              <div className="cko-coupon-section">
                <div className="cko-coupon-label">HAVE A COUPON CODE?</div>
                {appliedCoupon ? (
                  <div className="cko-coupon-active-badge">
                    <span>
                      <strong>{appliedCoupon.code}</strong> applied ({appliedCoupon.discountPercent}% OFF)
                    </span>
                    <button
                      type="button"
                      className="cko-coupon-remove-btn"
                      onClick={removeCoupon}
                      aria-label="Remove coupon"
                    >
                      ✕
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleCouponSubmit} className="cko-coupon-form">
                    <div className="cko-coupon-input-wrap">
                      <input
                        type="text"
                        placeholder="ENTER CODE (E.G. ZMW10)"
                        value={couponInput}
                        onChange={(e) => setCouponInput(e.target.value)}
                        className="cko-coupon-input"
                        autoCapitalize="characters"
                        aria-label="Coupon code"
                      />
                      <button type="submit" className="cko-coupon-apply-btn">
                        APPLY
                      </button>
                    </div>
                    {couponError && <p className="cko-coupon-error">{couponError}</p>}
                  </form>
                )}
              </div>

              {/* Price Details Breakdown */}
              <div className="cko-pricing-rows">
                <div className="cko-price-row">
                  <span className="cko-pr-label">Subtotal</span>
                  <span className="cko-pr-value">{formatPrice(cartSubtotal)}</span>
                </div>

                <div className="cko-price-row">
                  <span className="cko-pr-label">Shipping (Express Courier)</span>
                  <span className="cko-pr-value cko-pr-green">
                    {shippingCost === 0 ? "FREE" : formatPrice(shippingCost)}
                  </span>
                </div>

                {appliedCoupon && (
                  <div className="cko-price-row --discount">
                    <span className="cko-pr-label">Discount ({appliedCoupon.code})</span>
                    <span className="cko-pr-value cko-pr-green">−{formatPrice(discountAmount)}</span>
                  </div>
                )}
              </div>

              {/* Divider & Grand Total */}
              <div className="cko-summary-divider" />

              <div className="cko-total-row">
                <span className="cko-total-label">TOTAL AMOUNT</span>
                <span className="cko-total-value">{formatPrice(cartTotal)}</span>
              </div>
              <p className="cko-total-subnote">Inclusive of all applicable taxes & GST</p>

              {/* Trust Features */}
              <div className="cko-trust-footer">
                <div className="cko-tf-item">
                  <span className="cko-tf-icon">🔒</span>
                  <span>256-Bit Bank-Grade SSL Secured Checkout</span>
                </div>
                <div className="cko-tf-item">
                  <span className="cko-tf-icon">🛡️</span>
                  <span>100% Genuine Quality Guaranteed</span>
                </div>
              </div>
            </div>
          </aside>

        </div>{/* End cko-layout */}
      </div>{/* End container */}
    </div>
  );
}
