const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

async function request(path, options = {}) {
  const response = await fetch(`${API_URL}/api${path}`, options);
  if (!response.ok) throw new Error(`Storefront request failed (${response.status})`);
  const payload = await response.json();
  return payload.data;
}

function get(path) {
  return request(path);
}

export const storefrontApi = {
  home: () => get("/home"),
  products: () => get("/products?limit=100"),
  createOrder: (order) => request("/orders", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(order)
  })
};
