import React, { useState } from "react";
import { useShop } from "../../context/ShopContext";
import "./OrderTrackModal.css";

export default function OrderTrackModal() {
  const { isOrderTrackOpen, setIsOrderTrackOpen } = useShop();

  const [orderId, setOrderId] = useState("ZMW-89421");
  const [email, setEmail] = useState("customer@domain.com");
  const [trackingResult, setTrackingResult] = useState(null);

  if (!isOrderTrackOpen) return null;

  const handleTrackSubmit = (e) => {
    e.preventDefault();
    setTrackingResult({
      orderId: orderId.toUpperCase(),
      status: "In Transit — Express Air Freight",
      carrier: "DHL Express Global",
      estimatedDelivery: "September 05, 2026",
      origin: "ZMW Dispatch Hub, 123, Avinashi Road, Peelamedu, Coimbatore, Tamil Nadu, India",
      destination: "Bengaluru, India",
      steps: [
        { label: "Order Confirmed & Payment Verified", date: "Sept 01, 10:30 AM", done: true },
        { label: "Hand-inspected & Packed in Linen Box", date: "Sept 01, 04:15 PM", done: true },
        { label: "Dispatched via Express Courier", date: "Sept 02, 08:45 AM", done: true },
        { label: "Customs Clearance Completed", date: "In Progress", done: false, active: true },
        { label: "Delivered to Doorstep", date: "Estimated Sept 05", done: false }
      ]
    });
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
          <button type="submit" className="btn btn-primary btn-sm">
            Search Order Status
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
