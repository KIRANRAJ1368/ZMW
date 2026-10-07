const RAW_API_URL = (process.env.REACT_APP_API_URL || process.env.VITE_API_URL || "http://localhost:5000").trim().replace(/\/+$/, "");
const API_URL = RAW_API_URL.replace(/\/api$/, "");

/**
 * Public catalogue images (/images/...) belong to the storefront build,
 * while upload paths belong to the API server. Keep absolute Admin URLs
 * unchanged and make relative upload URLs work in every deployment.
 */
export function imageUrl(value) {
  if (!value || typeof value !== "string") return "";
  const normalized = value.trim().replace(/\\/g, "/");
  if (!normalized) return "";
  if (normalized.startsWith("data:") || normalized.startsWith("blob:")) {
    return normalized;
  }
  if (normalized.includes("/uploads/")) {
    const idx = normalized.indexOf("/uploads/");
    return `${API_URL}${normalized.slice(idx)}`;
  }
  if (normalized.startsWith("uploads/")) {
    return `${API_URL}/${normalized}`;
  }
  if (normalized.startsWith("http://") || normalized.startsWith("https://")) {
    return normalized;
  }
  if (normalized.startsWith("/images/") || normalized.startsWith("/")) {
    return normalized;
  }
  if (normalized.startsWith("images/")) {
    return `/${normalized}`;
  }
  return normalized;
}

