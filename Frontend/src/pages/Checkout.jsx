import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useShop } from "../context/ShopContext";
import { storefrontApi } from "../services/storefrontApi";
import { imageUrl } from "../utils/imageUrl";
import { ZMW_LOGO_DATA_URI } from "../utils/zmwLogo";
import "./Checkout.css";

/* ─────────────────────────────────────────────
   Supported Payment Methods (ZMW Supported)
───────────────────────────────────────────── */
const PAYMENT_METHODS = [
  {
    id: "razorpay",
    name: "Razorpay (Online Payment)",
    icon: "⚡",
    badge: "Recommended",
    desc: "UPI (Google Pay, PhonePe, Paytm), Credit & Debit Cards, Net Banking & Wallets"
  },
  {
    id: "cod",
    name: "Cash on Delivery (COD)",
    icon: "📦",
    desc: "Pay in cash upon physical receipt at your door"
  }
];

function loadRazorpayScript() {
  return new Promise((resolve) => {
    if (typeof window !== "undefined" && window.Razorpay) {
      resolve(true);
      return;
    }
    const existing = document.querySelector('script[src*="checkout.razorpay.com"]');
    if (existing) {
      if (typeof window !== "undefined" && window.Razorpay) return resolve(true);
      existing.addEventListener("load", () => resolve(true));
      existing.addEventListener("error", () => resolve(false));
      setTimeout(() => resolve(Boolean(window.Razorpay)), 1500);
      return;
    }
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

export default function Checkout() {
  const navigate = useNavigate();
  const location = useLocation();
  const initialPostalCode = (location.state?.pincode || "").trim();

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
    logoutCustomer,
    setIsOrderTrackOpen
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
    postalCode: initialPostalCode,
    country: "India",
    cardNumber: "•••• •••• •••• 4242",
    cardExp: "12/28",
    cardCvc: "888"
  });

  const [paymentMethod, setPaymentMethod] = useState("razorpay");
  const [couponInput, setCouponInput] = useState("");
  const [stepErrors, setStepErrors] = useState({});

  // Submission / Confirmation State
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [isOrdered, setIsOrdered] = useState(false);
  const [orderReceipt, setOrderReceipt] = useState(null);
  const [copiedOrder, setCopiedOrder] = useState(false);

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

  // Shiprocket Shipping Rate State
  const [shippingRateData, setShippingRateData] = useState(null);
  const [isCalculatingShipping, setIsCalculatingShipping] = useState(false);
  const [calculatedShippingCost, setCalculatedShippingCost] = useState(null);

  // Dynamic Shiprocket shipping calculation when postal code is entered
  useEffect(() => {
    const pin = (formData.postalCode || "").trim().replace(/\D/g, "");
    if (pin.length === 6 && cart.length > 0) {
      let isMounted = true;
      setIsCalculatingShipping(true);
      storefrontApi
        .calculateShippingRate({
          pincode: pin,
          address: formData.address,
          city: formData.city,
          state: formData.state
        })
        .then((res) => {
          if (!isMounted) return;
          const rate = res?.data?.is_serviceable !== undefined ? res.data : (res?.data || res);
          if (rate && rate.is_serviceable && rate.shipping_fee !== null) {
            setShippingRateData(rate);
            setCalculatedShippingCost(rate.shipping_fee);
            if (stepErrors.postalCode) {
              setStepErrors((prev) => ({ ...prev, postalCode: null }));
            }
          } else {
            setShippingRateData(rate || { is_serviceable: false, message: "PIN code is not serviceable by Shiprocket." });
            setCalculatedShippingCost(null);
            setStepErrors((prev) => ({
              ...prev,
              postalCode: rate?.message || "Delivery PIN code is not serviceable by Shiprocket."
            }));
          }
        })
        .catch((err) => {
          console.warn("[CHECKOUT] Shipping rate calculation notice:", err.message);
        })
        .finally(() => {
          if (isMounted) setIsCalculatingShipping(false);
        });
      return () => {
        isMounted = false;
      };
    } else if (pin.length !== 6) {
      setShippingRateData(null);
      setCalculatedShippingCost(null);
    }
  }, [formData.postalCode, cart]);

  const hasValidPincode = (formData.postalCode || "").trim().replace(/\D/g, "").length === 6;
  const effectiveShippingCost = calculatedShippingCost !== null
    ? calculatedShippingCost
    : shippingCost;
  const effectiveTotal = Math.max(0, cartSubtotal - discountAmount + effectiveShippingCost);

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
  const handleContinueToPayment = async (e) => {
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
    const cleanPin = (formData.postalCode || "").trim().replace(/\D/g, "");
    if (!cleanPin) {
      errors.postalCode = "PIN code is required";
    } else if (cleanPin.length !== 6) {
      errors.postalCode = "Please enter a valid 6-digit PIN code";
    } else if (shippingRateData && !shippingRateData.is_serviceable) {
      errors.postalCode = shippingRateData.message || "This PIN code is not serviceable by Shiprocket.";
    }

    if (Object.keys(errors).length > 0) {
      setStepErrors(errors);
      return;
    }

    // Verify shipping calculation if not yet completed
    if (calculatedShippingCost === null) {
      setIsCalculatingShipping(true);
      try {
        const res = await storefrontApi.calculateShippingRate({
          pincode: cleanPin,
          address: formData.address,
          city: formData.city,
          state: formData.state
        });
        const rate = res?.data?.is_serviceable !== undefined ? res.data : (res?.data || res);
        if (rate && rate.is_serviceable && rate.shipping_fee !== null) {
          setShippingRateData(rate);
          setCalculatedShippingCost(rate.shipping_fee);
        } else {
          setShippingRateData(rate || { is_serviceable: false });
          setCalculatedShippingCost(null);
          setStepErrors({
            postalCode: rate?.message || "Delivery PIN code is not serviceable by Shiprocket."
          });
          setIsCalculatingShipping(false);
          return;
        }
      } catch (rateErr) {
        setStepErrors({ postalCode: rateErr.message || "Failed to calculate Shiprocket rate." });
        setIsCalculatingShipping(false);
        return;
      }
      setIsCalculatingShipping(false);
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

    const fullAddress = formData.apartment
      ? `${formData.address}, ${formData.apartment}`
      : formData.address;

    const orderItems = cart.map((item) => ({
      product_id: Number(item.id),
      quantity: item.quantity,
      size: item.size || null,
      color: item.color || null
    }));

    const itemsSnapshot = cart.map((item) => ({
      id: item.id,
      name: item.name,
      image: item.image,
      price: item.price,
      quantity: item.quantity,
      size: item.size,
      color: item.color,
      lineTotal: item.price * item.quantity
    }));

    const orderDateFormatted = new Date().toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric"
    });

    // ─────────────────────────────────────────────
    // CASH ON DELIVERY (COD) FLOW
    // ─────────────────────────────────────────────
    if (paymentMethod === "cod") {
      try {
        const canSubmitToApi = cart.every((item) => Number.isInteger(Number(item.id)));
        let orderNumber;

        if (canSubmitToApi) {
          const order = await storefrontApi.createOrder(
            {
              customer_name: formData.fullName.trim(),
              email: formData.email.trim(),
              phone: formData.phone.trim(),
              shipping_address: fullAddress,
              city: formData.city.trim(),
              state: formData.state.trim() || null,
              pincode: formData.postalCode.trim(),
              payment_method: "COD",
              discount_amount: discountAmount,
              shipping_fee: effectiveShippingCost,
              courier_name: shippingRateData?.courier_name || "Shiprocket Express",
              estimated_delivery: shippingRateData?.estimated_delivery || "3–5 Business Days",
              items: orderItems
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
          customerName: formData.fullName.trim(),
          email: formData.email.trim(),
          phone: formData.phone.trim(),
          address: `${fullAddress}, ${formData.city.trim()}, ${formData.state.trim()} - ${formData.postalCode.trim()}`,
          paymentMethod: "Cash on Delivery",
          paymentStatus: "Payment Due on Delivery",
          subtotal: cartSubtotal,
          discountAmount,
          shippingFee: effectiveShippingCost,
          totalAmount: effectiveTotal,
          itemsCount: cartItemCount,
          items: itemsSnapshot,
          orderDate: orderDateFormatted
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
      return;
    }

    // ─────────────────────────────────────────────
    // RAZORPAY ONLINE PAYMENT FLOW (UPI, Card, NetBanking, Wallet)
    // ─────────────────────────────────────────────
    try {
      // 1. Ensure Razorpay Checkout script is loaded
      const isLoaded = await loadRazorpayScript();
      if (!isLoaded) {
        throw new Error("Razorpay payment gateway failed to load. Please check your internet connection.");
      }

      // 2. Create Razorpay Order securely on the backend
      const rzpData = await storefrontApi.createRazorpayOrder(
        {
          items: orderItems,
          couponCode: appliedCoupon?.code || null,
          customer_name: formData.fullName.trim(),
          email: formData.email.trim(),
          phone: formData.phone.trim(),
          pincode: formData.postalCode.trim(),
          shipping_fee: effectiveShippingCost,
          courier_name: shippingRateData?.courier_name || "Shiprocket Express",
          estimated_delivery: shippingRateData?.estimated_delivery || "3–5 Business Days"
        },
        customerToken
      );

      const razorpayKey =
        process.env.VITE_RAZORPAY_KEY ||
        process.env.REACT_APP_RAZORPAY_KEY ||
        rzpData.key_id ||
        "rzp_test_TBPx9EL1T1aqhC";

      // 3. Configure Razorpay Standard Checkout modal
      const options = {
        key: razorpayKey,
        amount: rzpData.amount, // in paise calculated securely by backend
        currency: rzpData.currency || "INR",
        name: "ZMW Clothing",
        description: `Order Checkout (${cartItemCount} ${cartItemCount === 1 ? "item" : "items"})`,
        image: typeof window !== "undefined" ? `${window.location.origin}/favicon-48x48.png` : "",
        order_id: rzpData.razorpay_order_id,
        prefill: {
          name: formData.fullName.trim(),
          email: formData.email.trim(),
          contact: (formData.phone || "").replace(/\D/g, "").slice(-10) || formData.phone.trim()
        },
        theme: {
          color: "#FAA703" // ZMW signature gold accent
        },
        modal: {
          ondismiss: () => {
            setIsSubmitting(false);
            setSubmitError("Payment was cancelled or closed. Your order was not confirmed. You can retry when ready.");
          }
        },
        handler: async (response) => {
          setIsSubmitting(true);
          setSubmitError("");
          try {
            // 4. Verify payment signature securely on backend before confirming order
            const verifyPayload = {
              razorpay_order_id: response.razorpay_order_id,
              razorpayOrderId: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              razorpaySignature: response.razorpay_signature,
              order_data: {
                customer_name: formData.fullName.trim(),
                email: formData.email.trim(),
                phone: formData.phone.trim(),
                shipping_address: fullAddress,
                city: formData.city.trim(),
                state: formData.state.trim() || null,
                pincode: formData.postalCode.trim(),
                coupon_code: appliedCoupon?.code || null,
                shipping_fee: effectiveShippingCost,
                courier_name: shippingRateData?.courier_name || "Shiprocket Express",
                estimated_delivery: shippingRateData?.estimated_delivery || "3–5 Business Days",
                items: orderItems
              }
            };

            const confirmedOrder = await storefrontApi.verifyRazorpayPayment(verifyPayload, customerToken);

            const receipt = {
              orderNumber: confirmedOrder.order_number,
              customerName: formData.fullName.trim(),
              email: formData.email.trim(),
              phone: formData.phone.trim(),
              address: `${fullAddress}, ${formData.city.trim()}, ${formData.state.trim()} - ${formData.postalCode.trim()}`,
              paymentMethod: PAYMENT_METHODS.find((p) => p.id === paymentMethod)?.name || "Online (Razorpay)",
              paymentId: response.razorpay_payment_id,
              paymentStatus: "Paid",
              subtotal: confirmedOrder.subtotal ?? rzpData.subtotal ?? cartSubtotal,
              discountAmount: confirmedOrder.discount_amount ?? rzpData.discount_amount ?? discountAmount,
              shippingFee: confirmedOrder.shipping_fee ?? rzpData.shipping_fee ?? effectiveShippingCost,
              totalAmount: confirmedOrder.total ?? rzpData.calculated_total ?? effectiveTotal,
              itemsCount: cartItemCount,
              items: itemsSnapshot,
              orderDate: orderDateFormatted
            };

            setOrderReceipt(receipt);
            setIsOrdered(true);
            clearCart();
            addToast(`Payment verified! Order ${confirmedOrder.order_number} confirmed.`, "success");
            window.scrollTo({ top: 0, behavior: "smooth" });
          } catch (verifyErr) {
            setSubmitError(verifyErr.message || "Payment signature verification failed. Please contact support.");
          } finally {
            setIsSubmitting(false);
          }
        }
      };

      const rzpInstance = new window.Razorpay(options);
      rzpInstance.on("payment.failed", (resp) => {
        setIsSubmitting(false);
        const failureReason = resp.error?.description || resp.error?.reason || "Payment declined or failed.";
        setSubmitError(`Payment failed: ${failureReason}`);
      });
      rzpInstance.open();
    } catch (err) {
      setIsSubmitting(false);
      setSubmitError(err.message || "Failed to initiate Razorpay checkout. Please try again.");
    }
  };

  /* ─────────────────────────────────────────────
     RENDER: ORDER SUCCESSFUL CONFIRMATION VIEW
  ───────────────────────────────────────────── */
  if (isOrdered && orderReceipt) {
    const handleCopyOrderNumber = () => {
      if (orderReceipt.orderNumber && navigator.clipboard) {
        navigator.clipboard.writeText(orderReceipt.orderNumber);
        setCopiedOrder(true);
        setTimeout(() => setCopiedOrder(false), 2000);
      }
    };

    return (
      <div className="cko-page">
        <div className="container">
          <div className="cko-success-card">
            <div className="cko-success-badge">✓</div>
            <span className="cko-kicker">SECURE ORDER CONFIRMED</span>
            <h1 className="cko-success-title">Thank You For Your Order!</h1>
            <p className="cko-success-subtitle">
              Your order <strong className="cko-highlight">#{orderReceipt.orderNumber}</strong> has been received and routed to our central dispatch hub.
            </p>

            {/* Quick Summary Strip */}
            <div className="cko-order-quick-strip">
              <div className="cko-oqs-item">
                <span className="cko-oqs-label">Order Number</span>
                <span className="cko-oqs-value font-mono">
                  #{orderReceipt.orderNumber}
                  <button
                    type="button"
                    className="cko-copy-btn"
                    onClick={handleCopyOrderNumber}
                    title="Copy Order Number"
                  >
                    {copiedOrder ? "COPIED ✓" : "COPY"}
                  </button>
                </span>
              </div>
              <div className="cko-oqs-item">
                <span className="cko-oqs-label">Order Date</span>
                <span className="cko-oqs-value">{orderReceipt.orderDate || "Today"}</span>
              </div>
              <div className="cko-oqs-item">
                <span className="cko-oqs-label">Payment Status</span>
                <span className="cko-oqs-value">
                  {orderReceipt.paymentStatus === "Paid" ? (
                    <span className="cko-status-pill --paid">● Paid (Razorpay)</span>
                  ) : (
                    <span className="cko-status-pill --cod">● Cash On Delivery</span>
                  )}
                </span>
              </div>
              <div className="cko-oqs-item">
                <span className="cko-oqs-label">Estimated Delivery</span>
                <span className="cko-oqs-value">3–5 Business Days</span>
              </div>
            </div>

            {/* Ordered Items Snapshot */}
            {orderReceipt.items && orderReceipt.items.length > 0 && (
              <>
                <div className="cko-receipt-section-title">ITEMS ORDERED ({orderReceipt.items.length})</div>
                <div className="cko-receipt-items">
                  {orderReceipt.items.map((item, idx) => (
                    <div key={`${item.id}-${idx}`} className="cko-receipt-item-row">
                      <img
                        src={imageUrl(item.image) || "/images/photo-1521572163474-6864f9cf17ab.jpg"}
                        alt={item.name}
                        className="cko-receipt-item-thumb"
                        onError={(e) => {
                          e.currentTarget.onerror = null;
                          e.currentTarget.src = "/images/photo-1521572163474-6864f9cf17ab.jpg";
                        }}
                      />
                      <div className="cko-receipt-item-info">
                        <div className="cko-receipt-item-name">{item.name}</div>
                        <div className="cko-receipt-item-meta">
                          {item.size && <span>Size: <strong>{item.size}</strong></span>}
                          {item.color && <span>Color: <strong>{item.color}</strong></span>}
                          <span>Qty: <strong>{item.quantity}</strong></span>
                        </div>
                      </div>
                      <div className="cko-receipt-item-price">
                        {formatPrice(item.lineTotal || (item.price * item.quantity))}
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}

            {/* Delivery & Customer Info */}
            <div className="cko-receipt-section-title">DELIVERY & PAYMENT DETAILS</div>
            <div className="cko-receipt-table">
              <div className="cko-receipt-row">
                <span className="cko-rr-label">Recipient Name</span>
                <span className="cko-rr-value">{orderReceipt.customerName}</span>
              </div>
              <div className="cko-receipt-row">
                <span className="cko-rr-label">Contact Email</span>
                <span className="cko-rr-value">{orderReceipt.email}</span>
              </div>
              <div className="cko-receipt-row">
                <span className="cko-rr-label">Contact Phone</span>
                <span className="cko-rr-value">{orderReceipt.phone}</span>
              </div>
              <div className="cko-receipt-row">
                <span className="cko-rr-label">Delivery Address</span>
                <span className="cko-rr-value">{orderReceipt.address}</span>
              </div>
              <div className="cko-receipt-row">
                <span className="cko-rr-label">Payment Mode</span>
                <span className="cko-rr-value">{orderReceipt.paymentMethod}</span>
              </div>
              {orderReceipt.paymentId && (
                <div className="cko-receipt-row">
                  <span className="cko-rr-label">Razorpay Payment ID</span>
                  <span className="cko-rr-value font-mono">{orderReceipt.paymentId}</span>
                </div>
              )}
              <div className="cko-receipt-row">
                <span className="cko-rr-label">Subtotal</span>
                <span className="cko-rr-value">{formatPrice(orderReceipt.subtotal)}</span>
              </div>
              {orderReceipt.discountAmount > 0 && (
                <div className="cko-receipt-row">
                  <span className="cko-rr-label">Coupon Discount</span>
                  <span className="cko-rr-value text-emerald-600">-{formatPrice(orderReceipt.discountAmount)}</span>
                </div>
              )}
              <div className="cko-receipt-row">
                <span className="cko-rr-label">Shipping / Delivery Fee</span>
                <span className="cko-rr-value">
                  {formatPrice(orderReceipt.shippingFee)}
                </span>
              </div>
              <div className="cko-receipt-row cko-receipt-total">
                <span className="cko-rr-label">Total Amount Paid</span>
                <span className="cko-rr-value">{formatPrice(orderReceipt.totalAmount)}</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="cko-success-actions">
              <Link to="/collection?category=mens" className="cko-btn-primary">
                CONTINUE SHOPPING →
              </Link>
              <button
                type="button"
                className="cko-btn-outline"
                onClick={() => setIsOrderTrackOpen(true)}
              >
                TRACK ORDER 🔍
              </button>
              {customerUser && (
                <Link to="/my-orders" className="cko-btn-outline">
                  VIEW MY ORDERS 📦
                </Link>
              )}
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
                          <strong className="cko-dob-title">
                            {shippingRateData?.courier_name
                              ? shippingRateData.courier_name
                              : "Shiprocket Express Logistics"}
                          </strong>
                          <span className="cko-dob-sub">
                            {isCalculatingShipping
                              ? "Calculating real-time Shiprocket freight rates for your PIN code..."
                              : shippingRateData && !shippingRateData.is_serviceable
                              ? (shippingRateData.message || "Delivery PIN code is not serviceable by Shiprocket.")
                              : shippingRateData
                              ? `Delivery to ${shippingRateData.delivery_pincode} via Shiprocket (${shippingRateData.estimated_delivery || '3–5 Days'})`
                              : "Enter 6-digit PIN code above to calculate real-time Shiprocket rates"}
                          </span>
                        </div>
                      </div>
                      <span className="cko-dob-price">
                        {isCalculatingShipping ? (
                          "..."
                        ) : shippingRateData && !shippingRateData.is_serviceable ? (
                          <span style={{ fontSize: "0.82rem", color: "#EF4444" }}>Not Serviceable</span>
                        ) : !hasValidPincode ? (
                          <span style={{ fontSize: "0.85rem", color: "#64748B" }}>By PIN Code</span>
                        ) : (
                          formatPrice(effectiveShippingCost)
                        )}
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
                    {/* Selectable Payment Cards — Razorpay and Cash on Delivery */}
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
                              <div className="cko-pm-title-row">
                                <span className="cko-pm-name">{pm.name}</span>
                                {pm.badge && <span className="cko-pm-badge">{pm.badge}</span>}
                              </div>
                              <span className="cko-pm-desc">{pm.desc}</span>
                            </div>
                            <span className="cko-pm-check">{isSelected ? "●" : "○"}</span>
                          </label>
                        );
                      })}
                    </div>

                    {/* Razorpay Online Payment Info Box */}
                    {paymentMethod === "razorpay" && (
                      <div className="cko-razorpay-info-box">
                        <div className="cko-razorpay-header">
                          <span className="cko-razorpay-badge-lock">🔒 256-bit SSL Secure</span>
                          <span className="cko-razorpay-powered">Powered by <strong>Razorpay</strong></span>
                        </div>
                        <div className="cko-razorpay-tags">
                          <span className="cko-rzp-tag">⚡ UPI (GPay, PhonePe, Paytm, BHIM)</span>
                          <span className="cko-rzp-tag">💳 Credit & Debit Cards (Visa, Mastercard, RuPay)</span>
                          <span className="cko-rzp-tag">🏦 Net Banking (SBI, HDFC, ICICI, Axis & more)</span>
                          <span className="cko-rzp-tag">👛 Digital Wallets (Paytm, Mobikwik, Amazon Pay)</span>
                        </div>
                        <p className="cko-razorpay-instruction">
                          Clicking below will securely open the official Razorpay checkout modal where you can select your preferred payment option.
                        </p>
                      </div>
                    )}

                    {/* Cash on Delivery (COD) Info Box */}
                    {paymentMethod === "cod" && (
                      <div className="cko-cod-info-box">
                        <div className="cko-cod-header">
                          <span className="cko-cod-icon-badge">📦 Cash on Delivery</span>
                          <span className="cko-cod-pay-tag">Pay at Doorstep</span>
                        </div>
                        <p className="cko-cod-instruction">
                          Pay directly in cash to our courier delivery partner upon receiving your order package. Please keep exact change ready.
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
                          ? paymentMethod === "cod"
                            ? "PLACING ORDER..."
                            : "OPENING RAZORPAY..."
                          : paymentMethod === "cod"
                            ? `PLACE ORDER (COD) • ${formatPrice(effectiveTotal)} →`
                            : `PAY WITH RAZORPAY • ${formatPrice(effectiveTotal)} →`}
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
                  <span className="cko-pr-label">
                    Shipping {shippingRateData?.courier_name ? `(${shippingRateData.courier_name})` : "(Shiprocket)"}
                  </span>
                  <span className="cko-pr-value cko-pr-green">
                    {isCalculatingShipping ? (
                      "Calculating..."
                    ) : (
                      formatPrice(effectiveShippingCost)
                    )}
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
                <span className="cko-total-value">{formatPrice(effectiveTotal)}</span>
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
