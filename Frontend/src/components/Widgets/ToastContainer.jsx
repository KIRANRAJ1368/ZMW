import React from "react";
import { useShop } from "../../context/ShopContext";
import "./ToastContainer.css";

const TOAST_ICONS = {
  success: "✓",
  info: "ℹ",
  error: "✕",
  warning: "!"
};

export default function ToastContainer() {
  const { toasts, removeToast } = useShop();

  if (!toasts.length) return null;

  return (
    <div className="toast-container" role="region" aria-label="Notifications">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`toast-card toast-${toast.type || "success"}`}
        >
          <span className="toast-icon">{TOAST_ICONS[toast.type] || "✓"}</span>
          <p className="toast-message">{toast.message}</p>
          <button
            className="toast-dismiss"
            onClick={() => removeToast(toast.id)}
            aria-label="Dismiss notification"
          >
            ✕
          </button>
        </div>
      ))}
    </div>
  );
}
