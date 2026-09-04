import React, { useState } from "react";
import { useShop } from "../../context/ShopContext";
import "./AuthModal.css";

export default function AuthModal() {
  const { authModalState, setAuthModalState, addToast } = useShop();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: ""
  });

  if (!authModalState) return null;

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (authModalState === "login") {
      addToast(`Welcome back, ${formData.email || "valued customer"}! ✨`, "success");
    } else if (authModalState === "register") {
      addToast(`Welcome to ZMW Studio, ${formData.name || "friend"}! 🎁 10% coupon WELCOME10 unlocked.`, "success");
    } else {
      addToast(`Password reset link sent to ${formData.email || "your email"}.`, "info");
    }
    setAuthModalState(null);
  };

  return (
    <div className="modal-overlay active" onClick={() => setAuthModalState(null)}>
      <div className="auth-modal-container" onClick={(e) => e.stopPropagation()}>
        {/* Close Button */}
        <button
          className="auth-close-btn"
          onClick={() => setAuthModalState(null)}
          aria-label="Close"
        >
          ✕
        </button>

        {/* Modal Header */}
        <div className="auth-header">
          <span className="auth-kicker">ZMW</span>
          <h2 className="auth-title">
            {authModalState === "login" && "Customer Sign In"}
            {authModalState === "register" && "Create An Account"}
            {authModalState === "forgot" && "Reset Your Password"}
          </h2>
          <p className="auth-desc">
            {authModalState === "login" && "Access your saved wishlists, express checkout, and order history."}
            {authModalState === "register" && "Join our private client circle for early drops and VIP offers."}
            {authModalState === "forgot" && "Enter your email address to receive secure password reset instructions."}
          </p>
        </div>

        {/* Auth Form */}
        <form className="auth-form" onSubmit={handleSubmit}>
          {authModalState === "register" && (
            <div className="form-group">
              <label htmlFor="name">Full Name</label>
              <input
                id="name"
                name="name"
                type="text"
                required
                placeholder="e.g. Clara Dupont"
                value={formData.name}
                onChange={handleChange}
                className="auth-input"
              />
            </div>
          )}

          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <input
              id="email"
              name="email"
              type="email"
              required
              placeholder="name@example.com"
              value={formData.email}
              onChange={handleChange}
              className="auth-input"
            />
          </div>

          {authModalState !== "forgot" && (
            <div className="form-group">
              <div className="password-label-row">
                <label htmlFor="password">Password</label>
                {authModalState === "login" && (
                  <button
                    type="button"
                    className="forgot-link-btn"
                    onClick={() => setAuthModalState("forgot")}
                  >
                    Forgot?
                  </button>
                )}
              </div>
              <input
                id="password"
                name="password"
                type="password"
                required
                placeholder="••••••••"
                value={formData.password}
                onChange={handleChange}
                className="auth-input"
              />
            </div>
          )}

          {authModalState === "register" && (
            <div className="form-group">
              <label htmlFor="confirmPassword">Confirm Password</label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                required
                placeholder="••••••••"
                value={formData.confirmPassword}
                onChange={handleChange}
                className="auth-input"
              />
            </div>
          )}

          <button type="submit" className="btn btn-primary auth-submit-btn">
            {authModalState === "login" && "Sign In"}
            {authModalState === "register" && "Create Account"}
            {authModalState === "forgot" && "Send Reset Link"}
          </button>
        </form>

        {/* Tab Switcher Footer */}
        <div className="auth-footer">
          {authModalState === "login" ? (
            <p>
              Don't have an account?{" "}
              <button
                type="button"
                className="switch-tab-btn"
                onClick={() => setAuthModalState("register")}
              >
                Sign Up
              </button>
            </p>
          ) : (
            <p>
              Already have an account?{" "}
              <button
                type="button"
                className="switch-tab-btn"
                onClick={() => setAuthModalState("login")}
              >
                Sign In
              </button>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
