import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useShop } from "../context/ShopContext";
import { storefrontApi } from "../services/storefrontApi";
import InvoiceModal from "../components/Modals/InvoiceModal";
import "./CustomerProfile.css";

const STATUS_BADGES = {
  pending: { label: "Order Placed", color: "var(--color-accent, #FAA703)", bg: "#FFFBEB" },
  confirmed: { label: "Confirmed", color: "#2563EB", bg: "#EFF6FF" },
  packed: { label: "Packed", color: "#7C3AED", bg: "#F5F3FF" },
  shipped: { label: "In Transit", color: "#D97706", bg: "#FFFBEB" },
  delivered: { label: "Delivered", color: "#059669", bg: "#ECFDF5" },
  cancelled: { label: "Cancelled", color: "#DC2626", bg: "#FEF2F2" },
  returned: { label: "Returned", color: "#4B5563", bg: "#F3F4F6" }
};

export default function CustomerProfile() {
  const {
    customerUser,
    customerToken,
    logoutCustomer,
    setAuthModalState,
    addToast,
    formatPrice
  } = useShop();

  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState("orders"); // 'orders' | 'profile' | 'addresses'
  const [orders, setOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [ordersError, setOrdersError] = useState("");
  const [selectedInvoiceOrder, setSelectedInvoiceOrder] = useState(null);
  const [cancelModalOrder, setCancelModalOrder] = useState(null);
  const [cancelReason, setCancelReason] = useState("");
  const [isCancelling, setIsCancelling] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: ""
  });
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    if (customerUser) {
      setFormData({
        name: customerUser.name || "",
        email: customerUser.email || "",
        phone: customerUser.phone || ""
      });
    }
  }, [customerUser]);

  useEffect(() => {
    if (!customerToken) {
      setLoadingOrders(false);
      return;
    }

    setLoadingOrders(true);
    setOrdersError("");
    storefrontApi
      .getMyOrders(customerToken)
      .then((data) => {
        setOrders(data || []);
      })
      .catch((err) => {
        setOrdersError(err.message || "Failed to load orders");
      })
      .finally(() => {
        setLoadingOrders(false);
      });
  }, [customerToken]);

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    if (!customerToken) return;

    setIsUpdating(true);
    try {
      const res = await storefrontApi.updateCustomerProfile(
        {
          name: formData.name.trim(),
          phone: formData.phone.trim()
        },
        customerToken
      );

      if (res?.user) {
        addToast("Profile updated successfully ✨", "success");
      }
    } catch (err) {
      addToast(err.message || "Failed to update profile", "error");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleConfirmCancel = async () => {
    if (!cancelModalOrder || !customerToken) return;
    setIsCancelling(true);
    try {
      const res = await storefrontApi.cancelOrder(
        cancelModalOrder.id,
        cancelReason || "Cancelled by client",
        customerToken
      );
      addToast(res.message || "Order cancelled successfully.", "success");
      const updated = await storefrontApi.getMyOrders(customerToken);
      setOrders(updated || []);
      setCancelModalOrder(null);
      setCancelReason("");
    } catch (err) {
      addToast(err.message || "Failed to cancel order.", "error");
    } finally {
      setIsCancelling(false);
    }
  };

  if (!customerUser) {
    return (
      <div className="account-unauth-container">
        <div className="account-unauth-box">
          <span className="account-kicker">ZMW CLOTHING</span>
          <h1 className="account-unauth-title">Customer Account</h1>
          <p className="account-unauth-desc">
            Sign in to track orders, manage your shipping addresses, and experience seamless luxury shopping.
          </p>
          <div className="account-unauth-actions">
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => setAuthModalState("login")}
            >
              Sign In to Your Account
            </button>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => setAuthModalState("register")}
            >
              Create An Account
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="account-page-wrapper">
      {/* Account Hero Bar */}
      <div className="account-hero">
        <div className="account-hero-content">
          <span className="account-kicker">MEMBER PORTAL</span>
          <h1 className="account-hero-title">Welcome, {customerUser.name}</h1>
          <p className="account-hero-email">{customerUser.email}</p>
        </div>
        <button
          type="button"
          className="account-logout-btn"
          onClick={() => {
            logoutCustomer();
            navigate("/");
          }}
        >
          Sign Out
        </button>
      </div>

      <div className="account-layout">
        {/* Navigation Sidebar */}
        <aside className="account-sidebar">
          <button
            type="button"
            className={`account-nav-btn ${activeTab === "orders" ? "active" : ""}`}
            onClick={() => setActiveTab("orders")}
          >
            <span className="nav-icon">📦</span>
            <span>My Orders</span>
            {orders.length > 0 && <span className="nav-badge">{orders.length}</span>}
          </button>
          <button
            type="button"
            className={`account-nav-btn ${activeTab === "profile" ? "active" : ""}`}
            onClick={() => setActiveTab("profile")}
          >
            <span className="nav-icon">👤</span>
            <span>Account Details</span>
          </button>
          <button
            type="button"
            className={`account-nav-btn ${activeTab === "addresses" ? "active" : ""}`}
            onClick={() => setActiveTab("addresses")}
          >
            <span className="nav-icon">📍</span>
            <span>Delivery Addresses</span>
          </button>
        </aside>

        {/* Tab Content */}
        <main className="account-content">
          {/* TAB 1: MY ORDERS */}
          {activeTab === "orders" && (
            <div className="tab-pane">
              <div className="pane-header">
                <h2>Order History</h2>
                <span className="pane-subtitle">
                  {orders.length} {orders.length === 1 ? "order" : "orders"} placed
                </span>
              </div>

              {loadingOrders ? (
                <div className="account-loading">
                  <div className="loading-spinner"></div>
                  <p>Loading your orders...</p>
                </div>
              ) : ordersError ? (
                <div className="account-error-box">
                  <p>⚠️ {ordersError}</p>
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => window.location.reload()}
                  >
                    Try Again
                  </button>
                </div>
              ) : orders.length === 0 ? (
                <div className="empty-orders-view">
                  <div className="empty-icon">🛍️</div>
                  <h3>No Orders Yet</h3>
                  <p>You haven't placed any orders yet. Discover our curated collections.</p>
                  <Link to="/collection" className="btn btn-primary" style={{ marginTop: "16px" }}>
                    Explore Catalog
                  </Link>
                </div>
              ) : (
                <div className="orders-list">
                  {orders.map((order) => {
                    const statusMeta = STATUS_BADGES[order.status] || {
                      label: order.status,
                      color: "#111827",
                      bg: "#F3F4F6"
                    };

                    const orderDate = new Date(order.createdAt || order.created_at).toLocaleDateString(
                      "en-IN",
                      {
                        day: "numeric",
                        month: "short",
                        year: "numeric"
                      }
                    );

                    return (
                      <div key={order.id} className="order-card">
                        <div className="order-card-header">
                          <div className="order-info-group">
                            <span className="order-number">{order.order_number}</span>
                            <span className="order-date">Placed on {orderDate}</span>
                          </div>
                          <div className="order-status-group">
                            <span
                              className="order-status-badge"
                              style={{ color: statusMeta.color, backgroundColor: statusMeta.bg }}
                            >
                              ● {statusMeta.label}
                            </span>
                          </div>
                        </div>

                        <div className="order-card-body">
                          {/* Line Items */}
                          <div className="order-items-col">
                            {order.items &&
                              order.items.map((item) => (
                                <div key={item.id} className="order-item-row">
                                  <div className="order-item-thumb">
                                    {item.product?.images?.[0]?.url ? (
                                      <img
                                        src={item.product.images[0].url}
                                        alt={item.product_name_snapshot}
                                      />
                                    ) : (
                                      <div className="thumb-placeholder">ZMW</div>
                                    )}
                                  </div>
                                  <div className="order-item-details">
                                    <h4 className="item-title">{item.product_name_snapshot}</h4>
                                    <div className="item-meta">
                                      {item.size && <span>Size: {item.size}</span>}
                                      {item.color && <span>Color: {item.color}</span>}
                                      <span>Qty: {item.quantity}</span>
                                    </div>
                                    <div className="item-price">
                                      {formatPrice(item.unit_price)}
                                    </div>
                                  </div>
                                </div>
                              ))}
                          </div>

                          {/* Order Summary & Address Details */}
                          <div className="order-summary-col">
                            <div className="summary-block">
                              <span className="summary-label">Shipping Address</span>
                              <p className="summary-val">{order.shipping_address}</p>
                              {order.city && (
                                <p className="summary-val">
                                  {order.city}
                                  {order.pincode ? ` - ${order.pincode}` : ""}
                                </p>
                              )}
                            </div>

                            <div className="summary-block">
                              <span className="summary-label">Payment</span>
                              <p className="summary-val">
                                {order.payment_method === "COD"
                                  ? "Cash on Delivery"
                                  : "Prepaid / Online"}
                              </p>
                            </div>

                            <div className="summary-total-row">
                              <span>Total Paid:</span>
                              <strong>{formatPrice(order.total)}</strong>
                            </div>

                            <div className="order-card-actions">
                              <button
                                type="button"
                                className="btn-order-action"
                                onClick={() => setSelectedInvoiceOrder(order)}
                              >
                                📄 Tax Invoice
                              </button>
                              {(order.status === "pending" || order.status === "confirmed") && (
                                <button
                                  type="button"
                                  className="btn-order-action cancel"
                                  onClick={() => setCancelModalOrder(order)}
                                >
                                  ✕ Cancel Order
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: PROFILE DETAILS */}
          {activeTab === "profile" && (
            <div className="tab-pane">
              <div className="pane-header">
                <h2>Account Details</h2>
                <span className="pane-subtitle">Update your personal contact details</span>
              </div>

              <form className="account-form" onSubmit={handleProfileSubmit}>
                <div className="form-group">
                  <label htmlFor="acc-name">Full Name</label>
                  <input
                    id="acc-name"
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="account-input"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="acc-email">Email Address</label>
                  <input
                    id="acc-email"
                    type="email"
                    disabled
                    value={formData.email}
                    className="account-input disabled"
                  />
                  <span className="input-helper">Email address cannot be modified.</span>
                </div>

                <div className="form-group">
                  <label htmlFor="acc-phone">Mobile Phone</label>
                  <input
                    id="acc-phone"
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="account-input"
                  />
                </div>

                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={isUpdating}
                  style={{ alignSelf: "flex-start", marginTop: "12px" }}
                >
                  {isUpdating ? "Saving Changes..." : "Save Changes"}
                </button>
              </form>
            </div>
          )}

          {/* TAB 3: SAVED ADDRESSES */}
          {activeTab === "addresses" && (
            <div className="tab-pane">
              <div className="pane-header">
                <h2>Saved Delivery Addresses</h2>
                <span className="pane-subtitle">Delivery destinations from your recent orders</span>
              </div>

              {orders.length === 0 ? (
                <div className="empty-orders-view">
                  <div className="empty-icon">📍</div>
                  <h3>No Saved Addresses</h3>
                  <p>When you place an order, your delivery address will automatically be recorded here.</p>
                </div>
              ) : (
                <div className="addresses-grid">
                  {Array.from(new Set(orders.map((o) => o.shipping_address))).map(
                    (address, idx) => {
                      const matchedOrder = orders.find((o) => o.shipping_address === address);
                      return (
                        <div key={idx} className="address-card">
                          <div className="address-card-header">
                            <span className="address-type">Address {idx + 1}</span>
                            {idx === 0 && <span className="default-pill">Most Recent</span>}
                          </div>
                          <p className="address-recipient">
                            <strong>{matchedOrder?.customer_name || customerUser.name}</strong>
                          </p>
                          <p className="address-lines">{address}</p>
                          {matchedOrder?.city && (
                            <p className="address-lines">
                              {matchedOrder.city}
                              {matchedOrder.pincode ? ` - ${matchedOrder.pincode}` : ""}
                            </p>
                          )}
                          <p className="address-phone">
                            Phone: {matchedOrder?.phone || customerUser.phone}
                          </p>
                        </div>
                      );
                    }
                  )}
                </div>
              )}
            </div>
          )}
        </main>
      </div>

      {/* Invoice Modal */}
      {selectedInvoiceOrder && (
        <InvoiceModal
          order={selectedInvoiceOrder}
          onClose={() => setSelectedInvoiceOrder(null)}
        />
      )}

      {/* Cancellation Confirmation Modal */}
      {cancelModalOrder && (
        <div className="cancel-confirm-modal-overlay" onClick={() => setCancelModalOrder(null)}>
          <div className="cancel-confirm-modal" onClick={(e) => e.stopPropagation()}>
            <h3>Cancel Order</h3>
            <p>
              Are you sure you wish to cancel order <strong>{cancelModalOrder.order_number}</strong>?
              If already paid, a full refund will be initiated to your original payment method.
            </p>
            <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 600, marginBottom: "6px" }}>
              Reason for Cancellation (Optional)
            </label>
            <textarea
              className="cancel-reason-textarea"
              placeholder="e.g. Ordered by mistake, found alternative, etc."
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
            />
            <div className="cancel-modal-actions">
              <button
                type="button"
                className="btn btn-secondary"
                disabled={isCancelling}
                onClick={() => setCancelModalOrder(null)}
              >
                Keep Order
              </button>
              <button
                type="button"
                className="btn btn-primary"
                style={{ background: "#DC2626", borderColor: "#DC2626", color: "#fff" }}
                disabled={isCancelling}
                onClick={handleConfirmCancel}
              >
                {isCancelling ? "Cancelling..." : "Confirm Cancellation"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
