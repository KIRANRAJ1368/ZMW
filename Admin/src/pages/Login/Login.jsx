import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  LogIn,
  AlertCircle
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { ApiError } from "../../services/api";
import "./Login.css";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Guarantee fields start 100% empty on mount, preventing unwanted browser autofill
  useEffect(() => {
    setEmail("");
    setPassword("");
    const timer = setTimeout(() => {
      setEmail("");
      setPassword("");
    }, 80);
    return () => clearTimeout(timer);
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);
    try {
      await login(email, password);
      navigate(location.state?.from?.pathname || "/", { replace: true });
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : "Invalid email or password. Please check your credentials."
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="login-viewport">
      {/* ── Luxury Fashion Ambient Background (Smooth, Line-Free, Balanced) ── */}
      {/* Top Ambient Studio Keylight */}
      <div className="login-bg-runway-light" aria-hidden="true" />

      {/* Symmetrical Balanced Ambient Lighting Orbs */}
      <div className="login-bg-glow login-bg-glow-left" aria-hidden="true" />
      <div className="login-bg-glow login-bg-glow-right" aria-hidden="true" />

      {/* Center Clean Spotlight Behind Login Card */}
      <div className="login-bg-center-spotlight" aria-hidden="true" />

      {/* Abstract Flowing Organic Shapes (Pure Silky Gradients, Zero Lines) */}
      <svg
        className="login-bg-silk-svg"
        viewBox="0 0 1440 900"
        fill="none"
        preserveAspectRatio="xMidYMid slice"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <defs>
          <filter id="smoothBlur" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="24" />
          </filter>

          {/* Left Flank Soft Gradients */}
          <linearGradient id="silkSoftLeft1" x1="0%" y1="0%" x2="100%" y2="80%">
            <stop offset="0%" stopColor="#FAA703" stopOpacity="0.09" />
            <stop offset="50%" stopColor="#FAA703" stopOpacity="0.03" />
            <stop offset="100%" stopColor="#FAA703" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="silkSoftLeft2" x1="0%" y1="30%" x2="80%" y2="90%">
            <stop offset="0%" stopColor="#F59E0B" stopOpacity="0.07" />
            <stop offset="60%" stopColor="#FAA703" stopOpacity="0.015" />
            <stop offset="100%" stopColor="#FAA703" stopOpacity="0" />
          </linearGradient>

          {/* Right Flank Soft Gradients */}
          <linearGradient id="silkSoftRight1" x1="100%" y1="0%" x2="0%" y2="80%">
            <stop offset="0%" stopColor="#FAA703" stopOpacity="0.09" />
            <stop offset="50%" stopColor="#FAA703" stopOpacity="0.03" />
            <stop offset="100%" stopColor="#FAA703" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="silkSoftRight2" x1="100%" y1="30%" x2="20%" y2="90%">
            <stop offset="0%" stopColor="#F59E0B" stopOpacity="0.07" />
            <stop offset="60%" stopColor="#FAA703" stopOpacity="0.015" />
            <stop offset="100%" stopColor="#FAA703" stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* ── LEFT FLANK: Smooth Abstract Fluid Curves (No lines, only soft silky fills) ── */}
        <path
          d="M -50 -50 Q 220 80 260 420 T -50 950 Z"
          fill="url(#silkSoftLeft1)"
          filter="url(#smoothBlur)"
        />
        <path
          d="M -30 180 Q 240 320 180 620 T -30 920 Z"
          fill="url(#silkSoftLeft2)"
          filter="url(#smoothBlur)"
        />

        {/* ── RIGHT FLANK: Balanced Smooth Abstract Fluid Curves ── */}
        <path
          d="M 1490 -50 Q 1220 80 1180 420 T 1490 950 Z"
          fill="url(#silkSoftRight1)"
          filter="url(#smoothBlur)"
        />
        <path
          d="M 1470 180 Q 1200 320 1260 620 T 1470 920 Z"
          fill="url(#silkSoftRight2)"
          filter="url(#smoothBlur)"
        />
      </svg>

      <div className="login-wrapper">
        <div className="login-card">
          {/* Brand Logo - ONLY the official emblem, large, sharp & centered */}
          <div className="login-logo-section">
            <div className="login-logo-glow" />
            <img
              src="/images/zmw-logo-transparent.png"
              alt="Brand Logo"
              className="login-logo-image"
            />
          </div>

          {/* Validation & Error Alert */}
          {error && (
            <div className="login-error-alert" role="alert">
              <AlertCircle size={18} className="login-alert-icon" />
              <span>{error}</span>
            </div>
          )}

          {/* Clean Minimal Login Form */}
          <form
            onSubmit={handleSubmit}
            className="login-form"
            autoComplete="off"
            noValidate
          >
            {/* Hidden decoy fields to divert aggressive browser password autofill */}
            <input
              type="text"
              name="prevent_autofill_username"
              tabIndex={-1}
              autoComplete="off"
              style={{ position: "absolute", opacity: 0, height: 0, width: 0, zIndex: -1, pointerEvents: "none" }}
              aria-hidden="true"
            />
            <input
              type="password"
              name="prevent_autofill_password"
              tabIndex={-1}
              autoComplete="new-password"
              style={{ position: "absolute", opacity: 0, height: 0, width: 0, zIndex: -1, pointerEvents: "none" }}
              aria-hidden="true"
            />

            {/* Email / Username Field */}
            <div className="login-form-group">
              <label htmlFor="login-email" className="login-label">
                Email or Username
              </label>
              <div className="login-input-container">
                <Mail size={18} className="login-input-icon" />
                <input
                  id="login-email"
                  name="zmw_admin_login_email"
                  type="text"
                  placeholder="Enter your email or username"
                  autoComplete="off"
                  autoCorrect="off"
                  autoCapitalize="off"
                  spellCheck="false"
                  data-lpignore="true"
                  data-form-type="other"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="login-input"
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="login-form-group">
              <label htmlFor="login-password" className="login-label">
                Password
              </label>
              <div className="login-input-container">
                <Lock size={18} className="login-input-icon" />
                <input
                  id="login-password"
                  name="zmw_admin_login_secret"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  autoComplete="new-password"
                  data-lpignore="true"
                  data-form-type="other"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="login-input login-input-password"
                />
                <button
                  type="button"
                  className="login-toggle-password"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  title={showPassword ? "Hide password" : "Show password"}
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Gold Action Button */}
            <button
              type="submit"
              className="login-button"
              disabled={isSubmitting || !email.trim() || !password.trim()}
            >
              {isSubmitting ? (
                <>
                  <span className="login-spinner" />
                  <span>Signing In...</span>
                </>
              ) : (
                <>
                  <LogIn size={18} />
                  <span>Sign In</span>
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
