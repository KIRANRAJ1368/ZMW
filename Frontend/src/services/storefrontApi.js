const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

async function request(path, options = {}, includeMeta = false) {
  // Catalog/home content is admin-managed, so never reuse a browser cache.
  // Cart and wishlist continue to use their separate localStorage keys.
  const response = await fetch(`${API_URL}/api${path}`, { cache: "no-store", ...options });
  const payload = await response.json().catch(() => null);

  if (!response.ok) {
    const errorMsg =
      payload?.error?.message ||
      payload?.message ||
      `Storefront request failed (${response.status})`;
    throw new Error(errorMsg);
  }

  return includeMeta ? payload : payload.data;
}

function get(path) {
  return request(path);
}

export const storefrontApi = {
  home: () => get("/home"),
  products: async () => {
    // The public endpoint is paginated (at most 100 items per request).
    // Fetch every page so new admin products are never silently omitted.
    const first = await request("/products?limit=100", {}, true);
    const totalPages = first?.meta?.totalPages || 1;
    if (totalPages <= 1) return first?.data || [];

    const pages = await Promise.all(
      Array.from({ length: totalPages - 1 }, (_, index) =>
        request(`/products?limit=100&page=${index + 2}`, {}, true)
      )
    );
    return [first?.data || [], ...pages.map((page) => page?.data || [])].flat();
  },
  product: (idOrSlug) => get(`/products/${encodeURIComponent(idOrSlug)}`),
  createOrder: (order, token = null) => {
    const headers = { "Content-Type": "application/json" };
    if (token) headers["Authorization"] = `Bearer ${token}`;
    return request("/orders", {
      method: "POST",
      headers,
      body: JSON.stringify(order)
    });
  },
  loginCustomer: (credentials) =>
    request("/auth/customer/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(credentials)
    }),
  registerCustomer: (data) =>
    request("/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data)
    }),
  getCustomerProfile: (token) =>
    request("/auth/customer/me", {
      headers: { Authorization: `Bearer ${token}` }
    }),
  updateCustomerProfile: (data, token) =>
    request("/auth/customer/profile", {
      method: "PUT",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify(data)
    }),
  getMyOrders: (token) =>
    request("/orders/my-orders", {
      headers: { Authorization: `Bearer ${token}` }
    }),
  forgotPassword: (email) =>
    request("/auth/customer/forgot-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email })
    }),
  verifyOtp: (payload) =>
    request("/auth/customer/verify-otp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    }),
  resetPassword: (payload) =>
    request("/auth/customer/reset-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    }),
  trackOrder: (orderNumber, email) =>
    request(
      `/orders/track?orderNumber=${encodeURIComponent(orderNumber)}${email ? `&email=${encodeURIComponent(email)}` : ""}`
    ),
  cancelOrder: (orderId, reason, token) =>
    request(`/orders/${orderId}/cancel`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ reason })
    }),
  validateCoupon: (code, subtotal) =>
    request("/coupons/validate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code, subtotal })
    }),
  submitContact: (payload) =>
    request("/contact", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    })
};

