import { lazy, Suspense } from "react";
import { Routes, Route } from "react-router-dom";
import { ShopProvider } from "./context/ShopContext";
import "./styles/global.css";

import Navbar from "./components/Navbar/Navbar";
import Footer from "./components/Footer/Footer";
import ScrollToTop from "./components/ScrollToTop/ScrollToTop";
import Home from "./pages/Home";
import Men from "./pages/Men";
import Women from "./pages/Women";
import Kids from "./pages/Kids";
import ComingSoon from "./pages/ComingSoon";
import ProductDetail from "./pages/ProductDetail";

// Modals & Drawers (lazy-loaded for performance)
const CartDrawer = lazy(() => import("./components/Modals/CartDrawer"));
const WishlistDrawer = lazy(() => import("./components/Modals/WishlistDrawer"));
const QuickViewModal = lazy(() => import("./components/Modals/QuickViewModal"));
const SearchModal = lazy(() => import("./components/Modals/SearchModal"));
const AuthModal = lazy(() => import("./components/Modals/AuthModal"));
const OrderTrackModal = lazy(() => import("./components/Modals/OrderTrackModal"));
const CheckoutModal = lazy(() => import("./components/Modals/CheckoutModal"));
const LightboxModal = lazy(() => import("./components/Modals/LightboxModal"));
const ToastContainer = lazy(() => import("./components/Widgets/ToastContainer"));


export default function App() {
  return (
    <ShopProvider>
      <ScrollToTop />
      <Navbar />

      <main id="main-content">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/men" element={<Men />} />
          <Route path="/women" element={<Women />} />
          <Route path="/product/:productId" element={<ProductDetail />} />
          <Route path="/kids" element={<Kids />} />
          <Route
            path="/oversized-t-shirts"
            element={<ComingSoon title="Oversized T-Shirts" />}
          />
          <Route path="*" element={<ComingSoon title="Page Not Found" />} />
        </Routes>
      </main>

      <Footer />

      {/* Global Interactive Layer — Modals, Drawers, Toasts */}
      <Suspense fallback={null}>
        <CartDrawer />
        <WishlistDrawer />
        <QuickViewModal />
        <SearchModal />
        <AuthModal />
        <OrderTrackModal />
        <CheckoutModal />
        <LightboxModal />
        <ToastContainer />
      </Suspense>
    </ShopProvider>
  );
}