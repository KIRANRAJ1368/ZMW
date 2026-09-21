import { Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { ToastProvider } from "./context/ToastContext";
import ProtectedRoute from "./routes/ProtectedRoute";
import AdminLayout from "./layouts/AdminLayout";

import Login from "./pages/Login/Login";
import Dashboard from "./pages/Dashboard/Dashboard";
import CategoriesPage from "./pages/Categories/CategoriesPage";
import SubcategoriesPage from "./pages/Subcategories/SubcategoriesPage";
import ProductsPage from "./pages/Products/ProductsPage";
import ProductFormPage from "./pages/Products/ProductFormPage";
import BannersPage from "./pages/Banners/BannersPage";
import HomepageSectionsPage from "./pages/HomepageSections/HomepageSectionsPage";
import OrdersPage from "./pages/Orders/OrdersPage";
import OrderDetailPage from "./pages/Orders/OrderDetailPage";
import ContactPage from "./pages/Contact/ContactPage";

export default function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <Routes>
          <Route path="/login" element={<Login />} />

          <Route
            path="/"
            element={
              <ProtectedRoute>
                <AdminLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Dashboard />} />
            <Route path="categories" element={<CategoriesPage />} />
            <Route path="subcategories" element={<SubcategoriesPage />} />
            <Route path="products" element={<ProductsPage />} />
            <Route path="products/new" element={<ProductFormPage />} />
            <Route path="products/:id/edit" element={<ProductFormPage />} />
            <Route path="banners" element={<BannersPage />} />
            <Route path="homepage-sections" element={<HomepageSectionsPage />} />
            <Route path="orders" element={<OrdersPage />} />
            <Route path="orders/:id" element={<OrderDetailPage />} />
            <Route path="contact" element={<ContactPage />} />
          </Route>
        </Routes>
      </ToastProvider>
    </AuthProvider>
  );
}
