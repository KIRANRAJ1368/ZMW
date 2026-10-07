import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, CheckCircle, Package, User, MapPin, FileText, IndianRupee, Truck, Printer, RefreshCw } from "lucide-react";
import { ordersApi } from "../../services/resources";
import { useToast } from "../../context/ToastContext";
import LoadingState from "../../components/LoadingState/LoadingState";
import StatusBadge from "../../components/StatusBadge/StatusBadge";
import { formatINR } from "../../utils/formatPrice";
import "./OrderDetailPage.css";

const STATUSES = ["pending", "confirmed", "packed", "shipped", "delivered", "cancelled", "returned"];

export default function OrderDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const toast = useToast();

  async function load() {
    setIsLoading(true);
    try {
      const { data } = await ordersApi.getById(id);
      setOrder(data);
    } catch (err) {
      toast.error(err.message);
      navigate("/orders");
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  async function handleStatusChange(status) {
    setIsSaving(true);
    try {
      const { data } = await ordersApi.updateStatus(id, status);
      setOrder((o) => ({ ...o, status: data.status }));
      toast.success(`Fulfillment status updated to "${status}"`);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setIsSaving(false);
    }
  }

  async function handleSyncTracking() {
    setIsSyncing(true);
    try {
      const res = await ordersApi.syncTracking(id);
      setOrder(res.data);
      toast.success(res.message || "Tracking status updated from Shiprocket!");
    } catch (err) {
      toast.error(err.message || "Failed to sync tracking with Shiprocket.");
    } finally {
      setIsSyncing(false);
    }
  }

  if (isLoading) return <LoadingState label="Loading order invoice details..." />;
  if (!order) return null;

  return (
    <div className="order-detail-page">
      {/* Top Header */}
      <div className="order-detail-header">
        <Link to="/orders" className="product-back-link">
          <ArrowLeft size={16} />
          <span>Back to Orders</span>
        </Link>
        <div className="order-header-main-line">
          <div className="order-header-title-group" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", width: "100%" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <h1 className="page-title">{order.order_number}</h1>
              <StatusBadge value={order.status} />
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <Link
                to={`/shipping/${order.id}`}
                className="btn btn-secondary"
                style={{ display: "inline-flex", alignItems: "center", gap: "8px" }}
              >
                <Truck size={16} />
                <span>Shipping Details</span>
              </Link>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => window.print()}
                style={{ display: "inline-flex", alignItems: "center", gap: "8px" }}
              >
                <Printer size={16} />
                <span>Print Tax Invoice</span>
              </button>
            </div>
          </div>
          <p className="page-subtitle">
            Placed on {new Date(order.created_at || order.createdAt || Date.now()).toLocaleString("en-US", { dateStyle: "full", timeStyle: "short" })}
          </p>
        </div>
      </div>

      <div className="order-detail-grid">
        {/* Left Column: Items & Total Breakdown */}
        <div className="order-detail-main">
          <div className="card order-items-card">
            <div className="order-section-header">
              <Package size={18} className="order-section-icon" />
              <h3 className="order-section-title">Purchased Items ({order.items?.length || 0})</h3>
            </div>

            <div className="order-items-table-wrap">
              <table className="order-items-table">
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>Size</th>
                    <th>Color</th>
                    <th>Qty</th>
                    <th>Price</th>
                    <th>Total</th>
                  </tr>
                </thead>
                <tbody>
                  {(order.items || []).map((item) => (
                    <tr key={item.id}>
                      <td>
                        <div className="cell-title">{item.product_name_snapshot}</div>
                        <div className="cell-muted" style={{ fontSize: 11 }}>
                          <code>{item.sku_snapshot}</code>
                        </div>
                      </td>
                      <td>
                        <span className="pill-badge" style={{ background: "var(--surface-alt)", border: "1px solid var(--border)" }}>
                          {item.size || "Standard"}
                        </span>
                      </td>
                      <td>{item.color || "—"}</td>
                      <td>
                        <strong>{item.quantity}</strong>
                      </td>
                      <td>{formatINR(item.unit_price)}</td>
                      <td>
                        <strong style={{ color: "var(--text-main)" }}>{formatINR(item.line_total)}</strong>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="order-totals-box">
              <div className="order-totals-row">
                <span>Product Subtotal</span>
                    <span>{formatINR(order.subtotal)}</span>
              </div>
              {order.discount_amount > 0 && (
                <div className="order-totals-row discount-row">
                  <span>Promotional Discount</span>
                    <span>-{formatINR(order.discount_amount)}</span>
                </div>
              )}
              <div className="order-totals-row">
                <span>Shipping & Delivery Fee</span>
                    <span>{order.shipping_fee > 0 ? formatINR(order.shipping_fee) : "Free Shipping"}</span>
              </div>
              <div className="order-totals-row final-row">
                <span>Total Amount Paid</span>
                    <span className="final-price">{formatINR(order.total)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Status Updater, Customer & Destination */}
        <div className="order-detail-side">
          {/* Automated Fulfillment Pipeline */}
          <div className="card order-panel-card status-updater-card">
            <div className="panel-title-wrap" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <Truck size={17} className="panel-icon" />
                <h3 className="panel-title">Fulfillment Pipeline</h3>
              </div>
              <span
                className="pill-badge"
                style={{
                  background: "#ecfdf5",
                  color: "#059669",
                  border: "1px solid #a7f3d0",
                  fontSize: 11,
                  fontWeight: 600
                }}
              >
                ⚡ Automated
              </span>
            </div>

            <div style={{ margin: "14px 0 10px 0" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                <span style={{ fontSize: 12, color: "var(--text-muted)", fontWeight: 500 }}>Customer Order State:</span>
                <span
                  className="pill-badge"
                  style={{
                    textTransform: "capitalize",
                    fontWeight: 700,
                    fontSize: 12.5,
                    background: order.status === "delivered" ? "#ecfdf5" : order.status === "shipped" || order.status === "packed" ? "#eff6ff" : "#fffbeb",
                    color: order.status === "delivered" ? "#059669" : order.status === "shipped" || order.status === "packed" ? "#2563eb" : "#d97706",
                    border: `1px solid ${order.status === "delivered" ? "#a7f3d0" : order.status === "shipped" || order.status === "packed" ? "#bfdbfe" : "#fde68a"}`
                  }}
                >
                  {order.status}
                </span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: 12, color: "var(--text-muted)", fontWeight: 500 }}>Shiprocket Status:</span>
                <span style={{ fontSize: 12, fontWeight: 600, color: "var(--text-main)", textTransform: "capitalize" }}>
                  {(order.shipping_status || "pending_dispatch").replace(/_/g, " ")}
                </span>
              </div>
            </div>

            <p className="panel-sub" style={{ fontSize: 11.5, color: "var(--text-muted)", lineHeight: 1.4, margin: "10px 0 14px 0" }}>
              Milestones update automatically in real-time as Shiprocket scans courier tracking checkpoints.
            </p>

            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <button
                type="button"
                className="btn btn-primary btn-sm"
                disabled={isSyncing}
                onClick={handleSyncTracking}
                style={{ width: "100%", justifyContent: "center", gap: 6, fontSize: 12.5 }}
              >
                <RefreshCw size={13} className={isSyncing ? "spin-icon" : ""} />
                <span>{isSyncing ? "Syncing with Shiprocket..." : "Sync Live Tracking"}</span>
              </button>

              <Link
                to={`/shipping/${order.id}`}
                className="btn btn-secondary btn-sm"
                style={{ width: "100%", justifyContent: "center", gap: 6, fontSize: 12 }}
              >
                <Truck size={13} />
                <span>View Logistics & AWB</span>
              </Link>
            </div>
          </div>

          {/* Customer Information Card */}
          <div className="card order-panel-card">
            <div className="panel-title-wrap">
              <User size={17} className="panel-icon" />
              <h3 className="panel-title">Customer Information</h3>
            </div>
            <div style={{ margin: "6px 0 10px 0" }}>
              {order.is_guest ? (
                <span
                  className="pill-badge"
                  style={{
                    background: "var(--surface-alt)",
                    color: "var(--text-muted)",
                    border: "1px solid var(--border)",
                    fontSize: 11.5
                  }}
                >
                  Guest Checkout (No Account)
                </span>
              ) : (
                <span className="pill-badge badge-gold" style={{ fontSize: 11.5 }}>
                  Registered Customer {order.user_id ? `(#${order.user_id})` : ""}
                </span>
              )}
            </div>
            <div className="customer-name">{order.customer_name}</div>
            <div className="customer-contact-link">
              <a href={`mailto:${order.email}`}>{order.email}</a>
            </div>
            {order.phone && (
              <div className="customer-contact-link">
                <a href={`tel:${order.phone}`}>{order.phone}</a>
              </div>
            )}
          </div>

          {/* Shipping Destination */}
          <div className="card order-panel-card">
            <div className="panel-title-wrap">
              <MapPin size={17} className="panel-icon" />
              <h3 className="panel-title">Delivery Address</h3>
            </div>
            <p className="destination-text">{order.shipping_address}</p>
            <p className="destination-sub">
              {[order.city, order.state, order.pincode].filter(Boolean).join(", ")}
            </p>
            <div className="payment-method-chip">
              Payment Mode: <strong>{order.payment_method || "Cash On Delivery (COD)"}</strong>
            </div>
          </div>

          {/* Notes Card */}
          {order.notes && (
            <div className="card order-panel-card">
              <div className="panel-title-wrap">
                <FileText size={17} className="panel-icon" />
                <h3 className="panel-title">Customer Instructions</h3>
              </div>
              <p className="customer-notes">"{order.notes}"</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
