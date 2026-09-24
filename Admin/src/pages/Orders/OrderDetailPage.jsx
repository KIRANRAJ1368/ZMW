import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, CheckCircle, Package, User, MapPin, FileText, IndianRupee, Truck, Printer } from "lucide-react";
import { ordersApi } from "../../services/resources";
import { useToast } from "../../context/ToastContext";
import LoadingState from "../../components/LoadingState/LoadingState";
import StatusBadge from "../../components/StatusBadge/StatusBadge";
import "./OrderDetailPage.css";

const STATUSES = ["pending", "confirmed", "packed", "shipped", "delivered", "cancelled", "returned"];

export default function OrderDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
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
          <p className="page-subtitle">
            Placed on {new Date(order.created_at).toLocaleString("en-US", { dateStyle: "full", timeStyle: "short" })}
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
                      <td>₹{item.unit_price}</td>
                      <td>
                        <strong style={{ color: "var(--text-main)" }}>₹{item.line_total}</strong>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="order-totals-box">
              <div className="order-totals-row">
                <span>Product Subtotal</span>
                <span>₹{order.subtotal}</span>
              </div>
              {order.discount_amount > 0 && (
                <div className="order-totals-row discount-row">
                  <span>Promotional Discount</span>
                  <span>-₹{order.discount_amount}</span>
                </div>
              )}
              <div className="order-totals-row">
                <span>Shipping & Delivery Fee</span>
                <span>{order.shipping_fee > 0 ? `₹${order.shipping_fee}` : "Free Shipping"}</span>
              </div>
              <div className="order-totals-row final-row">
                <span>Total Amount Paid</span>
                <span className="final-price">₹{order.total}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Status Updater, Customer & Destination */}
        <div className="order-detail-side">
          {/* Status Pipeline Updater */}
          <div className="card order-panel-card status-updater-card">
            <div className="panel-title-wrap">
              <Truck size={17} className="panel-icon" />
              <h3 className="panel-title">Fulfillment Pipeline</h3>
            </div>
            <p className="panel-sub">Advance customer delivery state:</p>
            <select
              value={order.status}
              disabled={isSaving}
              onChange={(e) => handleStatusChange(e.target.value)}
              className="status-selector"
            >
              {STATUSES.map((s) => (
                <option key={s} value={s}>
                  {s.charAt(0).toUpperCase() + s.slice(1)}
                </option>
              ))}
            </select>
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
