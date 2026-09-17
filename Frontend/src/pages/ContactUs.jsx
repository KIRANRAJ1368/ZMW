import React, { useState } from "react";
import "./ContactUs.css";

export default function ContactUs() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    category: "general",
    message: ""
  });
  const [submittedData, setSubmittedData] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) return;
    setSubmittedData({
      ...formData,
      timestamp: new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })
    });
  };

  const handleReset = () => {
    setSubmittedData(null);
    setFormData({
      name: "",
      email: "",
      phone: "",
      subject: "",
      category: "general",
      message: ""
    });
  };

  return (
    <div className="contact-page">
      {/* Header */}
      <section className="contact-hero" aria-label="Contact ZMW Support">
        <div className="container">
          <span className="contact-eyebrow">CUSTOMER CARE & ASSISTANCE</span>
          <h1 className="contact-title">Contact Us</h1>
          <p className="contact-subtitle">
            Have a question about your order, sizing, or delivery? Reach out to the ZMW / ZWMStore team and we'll get back to you promptly.
          </p>
        </div>
      </section>

      {/* Main Form & Info Section */}
      <section className="contact-section">
        <div className="container">
          <div className="contact-layout">
            {/* Info Cards Column */}
            <div className="contact-info-col">
              <div className="contact-info-card">
                <h3>Get In Touch</h3>

                <div className="contact-detail-row">
                  <div className="contact-detail-icon">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                      <polyline points="22,6 12,13 2,6"></polyline>
                    </svg>
                  </div>
                  <div className="contact-detail-text">
                    <strong>Support Email</strong>
                    <a href="mailto:zmw@gmail.com" style={{ color: "inherit", textDecoration: "none" }}>
                      zmw@gmail.com
                    </a>
                  </div>
                </div>

                <div className="contact-detail-row">
                  <div className="contact-detail-icon">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72"></path>
                    </svg>
                  </div>
                  <div className="contact-detail-text">
                    <strong>Mobile / Helpline</strong>
                    <a href="tel:+919876543210" style={{ color: "inherit", textDecoration: "none" }}>
                      +91 9876543210
                    </a>
                  </div>
                </div>

                <div className="contact-detail-row">
                  <div className="contact-detail-icon">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                      <circle cx="12" cy="10" r="3"></circle>
                    </svg>
                  </div>
                  <div className="contact-detail-text">
                    <strong>Address</strong>
                    <p>123, Avinashi Road, Peelamedu, Coimbatore, Tamil Nadu – 641004, India</p>
                  </div>
                </div>
              </div>

              {/* Support Availability */}
              <div className="contact-info-card">
                <h3>Support Availability</h3>
                <div className="contact-detail-row">
                  <div className="contact-detail-icon">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="12" cy="12" r="10"></circle>
                      <polyline points="12 6 12 12 16 14"></polyline>
                    </svg>
                  </div>
                  <div className="contact-detail-text">
                    <strong>Business Hours</strong>
                    <p>10:00 AM to 5:00 PM IST</p>
                    <p style={{ marginTop: "4px", fontSize: "0.82rem", color: "#6B7280" }}>
                      Monday through Saturday (IST)
                    </p>
                  </div>
                </div>
              </div>

              {/* Social Media Links */}
              <div className="contact-info-card">
                <h3>Connect With Us</h3>
                <p style={{ fontSize: "0.86rem", color: "#6B7280", marginBottom: "14px" }}>
                  Follow our official channels for drop announcements and lookbooks:
                </p>
                <div className="contact-social-links">
                  <a
                    href="#facebook-placeholder"
                    className="contact-social-btn"
                    title="Facebook (Placeholder Link - Official Account Pending)"
                    aria-label="Facebook"
                    onClick={(e) => e.preventDefault()}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path>
                    </svg>
                    <span>Facebook (Placeholder)</span>
                  </a>
                  <a
                    href="#instagram-placeholder"
                    className="contact-social-btn"
                    title="Instagram (Placeholder Link - Official Account Pending)"
                    aria-label="Instagram"
                    onClick={(e) => e.preventDefault()}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
                    </svg>
                    <span>Instagram (Placeholder)</span>
                  </a>
                  <a
                    href="#twitter-placeholder"
                    className="contact-social-btn"
                    title="Twitter/X (Placeholder Link - Official Account Pending)"
                    aria-label="Twitter / X"
                    onClick={(e) => e.preventDefault()}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M4 4l16 16m0-16L4 20"></path>
                    </svg>
                    <span>Twitter / X (Placeholder)</span>
                  </a>
                </div>
              </div>

              {/* WhatsApp Support CTA Card */}
              <div className="contact-info-card contact-whatsapp-card">
                <div className="contact-whatsapp-header">
                  <div className="contact-whatsapp-icon">
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.816 9.816 0 0 0 12.04 2z"/>
                    </svg>
                  </div>
                  <div>
                    <h3 className="contact-whatsapp-title">WhatsApp Instant Support</h3>
                    <span className="contact-whatsapp-status">● Online • 10 AM – 5 PM IST</span>
                  </div>
                </div>
                <p className="contact-whatsapp-desc">
                  Need direct assistance with sizing, delivery timelines, or COD? Chat directly with us on WhatsApp.
                </p>
                <a
                  href={`https://api.whatsapp.com/send?phone=919876543210&text=${encodeURIComponent("Hello ZWMStore! I would like to inquire about products and orders.")}`}
                  target="_blank"
                  rel="noreferrer"
                  className="contact-whatsapp-btn"
                >
                  <span>Chat on WhatsApp (+91 9876543210)</span>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <line x1="5" y1="12" x2="19" y2="12"></line>
                    <polyline points="12 5 19 12 12 19"></polyline>
                  </svg>
                </a>
              </div>
            </div>

            {/* Form Column */}
            <div className="contact-form-card">
              <h3>Send A Message</h3>
              <p>Fill in the form below and our team will respond during support hours (10:00 AM to 5:00 PM IST).</p>

              {submittedData ? (
                <div className="contact-submitted-box">
                  <div className="contact-alert-success">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                    <div>
                      <strong>Message Received!</strong>
                      <p style={{ margin: "2px 0 0 0", fontSize: "0.88rem" }}>
                        Thank you for reaching out. We have logged your message with the details you entered below.
                      </p>
                    </div>
                  </div>

                  <div className="customer-data-summary">
                    <h4 className="customer-data-title">Summary of Your Submitted Message:</h4>
                    <div className="customer-data-grid">
                      <div className="customer-data-item">
                        <span className="customer-data-label">Full Name:</span>
                        <span className="customer-data-val">{submittedData.name}</span>
                      </div>
                      <div className="customer-data-item">
                        <span className="customer-data-label">Email:</span>
                        <span className="customer-data-val">{submittedData.email}</span>
                      </div>
                      {submittedData.phone && (
                        <div className="customer-data-item">
                          <span className="customer-data-label">Phone:</span>
                          <span className="customer-data-val">{submittedData.phone}</span>
                        </div>
                      )}
                      <div className="customer-data-item">
                        <span className="customer-data-label">Inquiry Topic:</span>
                        <span className="customer-data-val" style={{ textTransform: "capitalize" }}>
                          {submittedData.category}
                        </span>
                      </div>
                      {submittedData.subject && (
                        <div className="customer-data-item">
                          <span className="customer-data-label">Subject / Order:</span>
                          <span className="customer-data-val">{submittedData.subject}</span>
                        </div>
                      )}
                      <div className="customer-data-item full-width">
                        <span className="customer-data-label">Submitted Message:</span>
                        <div className="customer-data-message-body">{submittedData.message}</div>
                      </div>
                      <div className="customer-data-item full-width">
                        <span className="customer-data-label">Recorded At:</span>
                        <span className="customer-data-val" style={{ fontSize: "0.82rem", color: "#6B7280" }}>
                          {submittedData.timestamp}
                        </span>
                      </div>
                    </div>

                    <button
                      type="button"
                      className="btn btn-outline"
                      onClick={handleReset}
                      style={{ marginTop: "20px", width: "100%" }}
                    >
                      Send Another Message
                    </button>
                  </div>
                </div>
              ) : (
                <form className="contact-form" onSubmit={handleSubmit}>
                  <div className="contact-form-row">
                    <div className="contact-input-group">
                      <label htmlFor="contact-name">Full Name *</label>
                      <input
                        id="contact-name"
                        name="name"
                        type="text"
                        required
                        placeholder="Enter your name"
                        value={formData.name}
                        onChange={handleChange}
                      />
                    </div>
                    <div className="contact-input-group">
                      <label htmlFor="contact-email">Email Address *</label>
                      <input
                        id="contact-email"
                        name="email"
                        type="email"
                        required
                        placeholder="Enter your email"
                        value={formData.email}
                        onChange={handleChange}
                      />
                    </div>
                  </div>

                  <div className="contact-form-row">
                    <div className="contact-input-group">
                      <label htmlFor="contact-phone">Phone Number</label>
                      <input
                        id="contact-phone"
                        name="phone"
                        type="tel"
                        placeholder="+91 XXXXX XXXXX"
                        value={formData.phone}
                        onChange={handleChange}
                      />
                    </div>
                    <div className="contact-input-group">
                      <label htmlFor="contact-category">Inquiry Topic</label>
                      <select
                        id="contact-category"
                        name="category"
                        value={formData.category}
                        onChange={handleChange}
                      >
                        <option value="general">General Question</option>
                        <option value="sizing">Product Sizing & Fit</option>
                        <option value="order">Order Status & Tracking</option>
                        <option value="returns">Returns & Refunds</option>
                        <option value="payment">Payment & COD Availability</option>
                      </select>
                    </div>
                  </div>

                  <div className="contact-input-group">
                    <label htmlFor="contact-subject">Order ID / Subject</label>
                    <input
                      id="contact-subject"
                      name="subject"
                      type="text"
                      placeholder="e.g. ZMW-10492 or Sizing help"
                      value={formData.subject}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="contact-input-group">
                    <label htmlFor="contact-message">Your Message *</label>
                    <textarea
                      id="contact-message"
                      name="message"
                      rows="4"
                      required
                      placeholder="Type your message with any specific details..."
                      value={formData.message}
                      onChange={handleChange}
                    ></textarea>
                  </div>

                  <button type="submit" className="btn btn-primary contact-submit-btn">
                    Send Customer Message
                  </button>
                </form>
              )}
            </div>
          </div>

          {/* Google Map Embed Section */}
          <div className="contact-map-section">
            <div className="contact-map-header">
              <h3>Operating Region & Dispatch Hub</h3>
              <p>
                Serving customers nationwide across India. Hub: 123, Avinashi Road, Peelamedu, Coimbatore, Tamil Nadu – 641004, India.
              </p>
            </div>
            <iframe
              title="ZMW Operating Hub Location"
              src="https://www.google.com/maps?q=123%20Avinashi%20Road%2C%20Peelamedu%2C%20Coimbatore%2C%20Tamil%20Nadu%20641004%2C%20India&output=embed"
              className="contact-map-frame"
              allowFullScreen=""
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            ></iframe>
          </div>
        </div>
      </section>
    </div>
  );
}
