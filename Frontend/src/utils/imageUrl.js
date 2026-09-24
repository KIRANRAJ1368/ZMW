const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

/**
 * Public catalogue images (/images/...) belong to the storefront build,
 * while upload paths belong to the API server. Keep absolute Admin URLs
 * unchanged and make relative upload URLs work in every deployment.
 */
export function imageUrl(value) {
  if (!value || typeof value !== "string") return "";
  const normalized = value.trim().replace(/\\/g, "/");
  if (!normalized) return "";
  if (normalized.startsWith("http://") || normalized.startsWith("https://") || normalized.startsWith("data:")) {
    return normalized;
  }
  if (normalized.startsWith("/uploads/")) {
    return `${API_URL}${normalized}`;
  }
  if (normalized.startsWith("uploads/")) {
    return `${API_URL}/${normalized}`;
  }
  if (normalized.startsWith("/images/") || normalized.startsWith("/")) {
    return normalized;
  }
  if (normalized.startsWith("images/")) {
    return `/${normalized}`;
  }
  return normalized;
}

