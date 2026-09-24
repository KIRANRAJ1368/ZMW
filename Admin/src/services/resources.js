import { api } from "./api";

export const authApi = {
  login: (email, password) => api.post("/auth/login", { email, password }),
  me: () => api.get("/auth/me")
};

export const dashboardApi = {
  summary: (params) => api.get("/admin/dashboard/summary", params)
};

export const categoriesApi = {
  list: (params) => api.get("/categories", { includeInactive: true, ...params }),
  create: (data) => api.post("/categories", data),
  update: (id, data) => api.put(`/categories/${id}`, data),
  remove: (id) => api.delete(`/categories/${id}`)
};

export const subcategoriesApi = {
  list: (params) => api.get("/subcategories", { includeInactive: true, ...params }),
  create: (data) => api.post("/subcategories", data),
  update: (id, data) => api.put(`/subcategories/${id}`, data),
  remove: (id) => api.delete(`/subcategories/${id}`)
};

export const productsApi = {
  list: (params) => api.get("/products", { limit: 20, ...params }),
  getById: (id) => api.get(`/products/admin/${id}`),
  create: (data) => api.post("/products", data),
  update: (id, data) => api.put(`/products/${id}`, data),
  remove: (id) => api.delete(`/products/${id}`),
  toggleBestSeller: (id, value) => api.patch(`/products/${id}/best-seller`, { value }),
  toggleNewArrival: (id, value) => api.patch(`/products/${id}/new-arrival`, { value }),
  updateStock: (id, data) => api.patch(`/products/${id}/stock`, data)
};

export const bannersApi = {
  list: (params) => api.get("/banners", { includeInactive: true, ...params }),
  create: (data) => api.post("/banners", data),
  update: (id, data) => api.put(`/banners/${id}`, data),
  remove: (id) => api.delete(`/banners/${id}`)
};

export const homepageApi = {
  sections: () => api.get("/home/admin/sections"),
  updateSection: (key, data) => api.put(`/home/admin/sections/${key}`, data)
};

export const ordersApi = {
  list: (params) => api.get("/orders", params),
  getById: (id) => api.get(`/orders/${id}`),
  updateStatus: (id, status) => api.patch(`/orders/${id}/status`, { status })
};

export const contactApi = {
  list: (params) => api.get("/contact", params),
  getById: (id) => api.get(`/contact/${id}`),
  updateStatus: (id, status) => api.patch(`/contact/${id}/status`, { status }),
  remove: (id) => api.delete(`/contact/${id}`)
};

export const customersApi = {
  list: (params) => api.get("/customers", params),
  getById: (id) => api.get(`/customers/${id}`)
};

export const uploadApi = {
  upload: (folder, files) => {
    const formData = new FormData();
    Array.from(files).forEach((file) => formData.append("files", file));
    return api.upload(`/admin/uploads/${folder}`, formData);
  }
};

export const couponsApi = {
  list: (params) => api.get("/coupons", params),
  getById: (id) => api.get(`/coupons/${id}`),
  create: (data) => api.post("/coupons", data),
  update: (id, data) => api.put(`/coupons/${id}`, data),
  remove: (id) => api.delete(`/coupons/${id}`)
};

export const reportsApi = {
  sales: (params) => api.get("/admin/reports/sales", params),
  products: (params) => api.get("/admin/reports/products", params),
  orders: (params) => api.get("/admin/reports/orders", params)
};

