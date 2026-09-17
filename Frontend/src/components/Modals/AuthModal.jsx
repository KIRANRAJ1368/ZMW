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

  const [forgotSubmitted, setForgotSubmitted] = useState(false);

  if (!authModalState) return null;

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (authModalState === "login") {
      addToast(`Welcome back, ${formData.email || "valued customer"}! ✨`, "success");
      setAuthModalState(null);
    } else if (authModalState === "register") {
      addToast(`Welcome to ZMW Studio, ${formData.name || "friend"}! 🎁 10% coupon WELCOME10 unlocked.`, "success");
      setAuthModalState(null);
    } else if (authModalState === "forgot") {
      // Step 2: Show confirmation screen
      setForgotSubmitted(true);
      addToast(`Password reset link sent to ${formData.email || "your email"}.`, "info");
    }
  };

  const handleReturnToSignIn = () => {
    setForgotSubmitted(false);
    setAuthModalState("login");
  };

  const handleClose = () => {
    setForgotSubmitted(false);
    setAuthModalState(null);
  };

  return (
    <div className="modal-overlay active" onClick={handleClose}>
      <div className="auth-modal-container" onClick={(e) => e.stopPropagation()}>
        {/* Close Button */}
        <button
          className="auth-close-btn"
          onClick={handleClose}
          aria-label="Close"
        >
          ✕
        </button>

        {/* Forgot Password Confirmation Screen */}
        {authModalState === "forgot" && forgotSubmitted ? (
          <div className="auth-confirmation-view" style={{ textAlign: "center", padding: "12px 0" }}>
            <div
              style={{
                width: "56px",
                height: "56px",
                borderRadius: "50%",
                background: "#ECFDF5",
                color: "#10B981",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 18px auto"
              }}
            >
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
            </div>
            <h2 className="auth-title">Reset Link Sent</h2>
            <p className="auth-desc" style={{ marginBottom: "24px" }}>
              We've dispatched password reset instructions to{" "}
              <strong>{formData.email || "your email address"}</strong>. Please check your inbox and spam folder.
            </p>
            <button
              type="button"
              className="btn btn-primary auth-submit-btn"
              onClick={handleReturnToSignIn}
              style={{ width: "100%", marginBottom: "12px" }}
            >
              Return to Sign In
            </button>
            <button
              type="button"
              className="forgot-link-btn"
              onClick={() => setForgotSubmitted(false)}
              style={{ background: "none", border: "none", cursor: "pointer", fontSize: "0.85rem" }}
            >
              Change email or resend link
            </button>
          </div>
        ) : (
          <>
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
                {authModalState === "forgot" && "Enter your registered email address to receive password reset instructions."}
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
                    placeholder="Enter your name"
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
                        onClick={() => {
                          setForgotSubmitted(false);
                          setAuthModalState("forgot");
                        }}
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
              {authModalState === "login" && (
                <p>
                  Don't have an account?{" "}
                  <button
                    type="button"
                    className="switch-tab-btn"
                    onClick={() => {
                      setForgotSubmitted(false);
                      setAuthModalState("register");
                    }}
                  >
                    Sign Up
                  </button>
                </p>
              )}
              {authModalState === "register" && (
                <p>
                  Already have an account?{" "}
                  <button
                    type="button"
                    className="switch-tab-btn"
                    onClick={() => {
                      setForgotSubmitted(false);
                      setAuthModalState("login");
                    }}
                  >
                    Sign In
                  </button>
                </p>
              )}
              {authModalState === "forgot" && (
                <p>
                  Remember your password?{" "}
                  <button
                    type="button"
                    className="switch-tab-btn"
                    onClick={handleReturnToSignIn}
                  >
                    Sign In
                  </button>
                </p>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
