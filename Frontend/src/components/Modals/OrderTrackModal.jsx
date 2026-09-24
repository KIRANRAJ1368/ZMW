import React, { useState } from "react";
import { useShop } from "../../context/ShopContext";
import { storefrontApi } from "../../services/storefrontApi";
import "./OrderTrackModal.css";

export default function OrderTrackModal() {
  const { isOrderTrackOpen, setIsOrderTrackOpen } = useShop();

  const [orderId, setOrderId] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [trackingResult, setTrackingResult] = useState(null);

  if (!isOrderTrackOpen) return null;

  const handleTrackSubmit = async (e) => {
    e.preventDefault();
    if (!orderId.trim()) return;
    setLoading(true);
    setError("");
    setTrackingResult(null);

    try {
      const data = await storefrontApi.trackOrder(orderId.trim(), email.trim());
      setTrackingResult({
        orderId: data.orderNumber,
        status: data.status ? data.status.toUpperCase() : "PROCESSING",
        carrier: data.trackingCarrier || "DHL Express Global",
        trackingNumber: data.trackingNumber,
        estimatedDelivery: data.estimatedDelivery ? new Date(data.estimatedDelivery).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "In 3-5 Business Days",
        destination: data.destination || "Customer Address",
        steps: data.steps || []
      });
    } catch (err) {
      setError(err.message || "Order not found. Please verify your Order Number and Email.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay active" onClick={() => setIsOrderTrackOpen(false)}>
      <div className="order-track-container" onClick={(e) => e.stopPropagation()}>
        <button
          className="order-track-close-btn"
          onClick={() => setIsOrderTrackOpen(false)}
          aria-label="Close"
        >
          ✕
        </button>

        <div className="order-track-header">
          <span className="order-track-kicker">CONCIERGE LOGISTICS</span>
          <h2 className="order-track-title">Track Your Shipment</h2>
          <p className="order-track-desc">
            Enter your Order Number and Email to view real-time courier tracking details.
          </p>
        </div>

        {/* Form */}
        <form className="order-track-form" onSubmit={handleTrackSubmit}>
          <div className="track-form-row">
            <div className="form-group">
              <label htmlFor="orderId">Order Number</label>
              <input
                id="orderId"
                type="text"
                required
                placeholder="e.g. ZMW-89421"
                value={orderId}
                onChange={(e) => setOrderId(e.target.value)}
                className="auth-input"
              />
            </div>
            <div className="form-group">
              <label htmlFor="trackEmail">Email Address</label>
              <input
                id="trackEmail"
                type="email"
                required
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="auth-input"
              />
            </div>
          </div>
          {error && <div style={{ color: "#d9534f", fontSize: "0.85rem", marginBottom: "1rem" }}>{error}</div>}
          <button type="submit" className="btn btn-primary btn-sm" disabled={loading}>
            {loading ? "Searching Dispatch Records..." : "Search Order Status"}
          </button>
        </form>

        {/* Tracking Results View */}
        {trackingResult && (
          <div className="tracking-results-card">
            <div className="tracking-meta-banner">
              <div>
                <span className="meta-sub">ORDER ID</span>
                <span className="meta-val">{trackingResult.orderId}</span>
              </div>
              <div>
                <span className="meta-sub">ESTIMATED ARRIVAL</span>
                <span className="meta-val highlight">{trackingResult.estimatedDelivery}</span>
              </div>
              <div>
                <span className="meta-sub">CARRIER</span>
                <span className="meta-val">{trackingResult.carrier}</span>
              </div>
            </div>

            {/* Timeline */}
            <div className="tracking-timeline">
              {trackingResult.steps.map((step, index) => (
                <div
                  key={index}
                  className={`timeline-step ${step.done ? "done" : ""} ${step.active ? "active" : ""}`}
                >
                  <div className="timeline-marker">
                    {step.done ? "✓" : index + 1}
                  </div>
                  <div className="timeline-info">
                    <span className="timeline-label">{step.label}</span>
                    <span className="timeline-date">{step.date}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
