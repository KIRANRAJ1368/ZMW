import React, { useState } from "react";
import { Link } from "react-router-dom";
import "./Footer.css";

const QUICK_LINKS = [
  { label: "Summer Collection", href: "/#whats-new-this-season" },
  { label: "Best Sellers", href: "/#most-loved-pieces" },
  { label: "New Arrivals", href: "/#whats-new-this-season" }
];

const INFO_LINKS = [
  { label: "About Our Atelier", href: "/#features" },
  { label: "Sustainability Commitment", href: "#" },
  { label: "Size Guide", href: "#" },
  { label: "Fabric Care Manual", href: "#" },
  { label: "Gift Cards", href: "#" },
  { label: "Press & Media", href: "#" }
];

const SUPPORT_LINKS = [
  { label: "Track My Order", href: "#" },
  { label: "Returns & Exchanges", href: "#" },
  { label: "Shipping Policy", href: "#" },
  { label: "Privacy Policy", href: "#" },
  { label: "Terms & Conditions", href: "#" },
  { label: "Client Care & Concierge", href: "#" }
];

const PAYMENT_ICONS = ["VISA", "MC", "AMEX", "PAYPAL", "APPLE PAY", "GPAY", "UPI"];

export default function Footer() {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);
  const [emailError, setEmailError] = useState("");

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (!email || !email.includes("@")) {
      setEmailError("Please enter a valid email address.");
      return;
    }
    setSubscribed(true);
    setEmailError("");
    setEmail("");
  };

  return (
    <footer className="site-footer" id="footer">
      {/* Main Footer Grid */}
      <div className="container">
        <div className="footer-grid">
          {/* Brand Column */}
          <div className="footer-brand-col">
            <Link to="/" className="footer-logo">
              <span className="footer-brand-main">ZMW</span>
            </Link>


            <p className="footer-brand-tagline">
              Considered clothing for people who dress on purpose. Each piece is a deliberate study in natural material, superior fit, and enduring craft.
            </p>

            <div className="footer-contact-list">
              <div className="footer-contact-item">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                  <circle cx="12" cy="10" r="3"></circle>
                </svg>
                <span>16 Via Tornabuoni, Florence, Italy</span>
              </div>
              <div className="footer-contact-item">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72"></path>
                </svg>
                <span>+39 055 987 6543</span>
              </div>
              <div className="footer-contact-item">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                  <polyline points="22,6 12,13 2,6"></polyline>
                </svg>
                <span>concierge@zmw.com</span>
              </div>
            </div>

            {/* Social Icons */}
            <div className="footer-social">
              {[
                { name: "Instagram", icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg> },
                { name: "Pinterest", icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"></circle><path d="M8 12c0-2.5 2-4.5 4.5-4.5s4.5 2 4.5 4.5c0 3-2 5.5-4.5 5.5-.8 0-1.5-.3-2.1-.8L9.5 20"></path></svg> },
                { name: "TikTok", icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5"></path></svg> },
                { name: "Facebook", icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path></svg> }
              ].map((s) => (
                <a
                  key={s.name}
                  href={`https://${s.name.toLowerCase()}.com`}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={s.name}
                  className="footer-social-link"
                >
                  {s.icon}
                </a>
              ))}
            </div>
          </div>

          {/* Quick Shop Links */}
          <div className="footer-links-col">
            <h4 className="footer-col-heading">Quick Shop</h4>
            <ul className="footer-link-list">
              {QUICK_LINKS.map((l) => (
                <li key={l.label}>
                  <a href={l.href} className="footer-nav-link">{l.label}</a>
                </li>
              ))}
            </ul>
          </div>

          {/* Information Links */}
          <div className="footer-links-col">
            <h4 className="footer-col-heading">Information</h4>
            <ul className="footer-link-list">
              {INFO_LINKS.map((l) => (
                <li key={l.label}>
                  <a href={l.href} className="footer-nav-link">{l.label}</a>
                </li>
              ))}
            </ul>
          </div>

          {/* Customer Service Links */}
          <div className="footer-links-col">
            <h4 className="footer-col-heading">Client Services</h4>
            <ul className="footer-link-list">
              {SUPPORT_LINKS.map((l) => (
                <li key={l.label}>
                  <a href={l.href} className="footer-nav-link">{l.label}</a>
                </li>
              ))}
            </ul>
          </div>

          {/* Newsletter Column */}
          <div className="footer-newsletter-col">
            <h4 className="footer-col-heading">Private Client Circle</h4>
            <p className="footer-newsletter-desc">
              Subscribe for early access to new collections, exclusive lookbooks, and VIP member promotions.
            </p>

            {subscribed ? (
              <div className="newsletter-success">
                <span className="success-check">✓</span>
                <span>Thank you — welcome to the circle!</span>
              </div>
            ) : (
              <form className="newsletter-form" onSubmit={handleSubscribe}>
                <input
                  type="email"
                  placeholder="Your email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="newsletter-input"
                  aria-label="Email for newsletter"
                />
                {emailError && <p className="newsletter-error">{emailError}</p>}
                <button type="submit" className="btn btn-primary btn-sm newsletter-btn">
                  Subscribe
                </button>
              </form>
            )}

            <p className="privacy-note">
              By subscribing you agree to our Privacy Policy. Unsubscribe at any time.
            </p>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="footer-bottom">
        <div className="container footer-bottom-inner">
          <p className="footer-copyright">
            © 2026 ZMW. All rights reserved.
          </p>

          {/* Payment Icons */}
          <div className="payment-icons-strip">
            {PAYMENT_ICONS.map((pm) => (
              <span key={pm} className="payment-icon-tag">{pm}</span>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}