import { lazy, Suspense } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { ShopProvider } from "./context/ShopContext";
import "./styles/global.css";

import Navbar from "./components/Navbar/Navbar";
import Footer from "./components/Footer/Footer";
import ScrollToTop from "./components/ScrollToTop/ScrollToTop";
import SocialFloatWidget from "./components/Widgets/SocialFloatWidget";

import Home from "./pages/Home";
import Collection from "./pages/Collection";
import Wishlist from "./pages/Wishlist";
import ComingSoon from "./pages/ComingSoon";
import ProductDetail from "./pages/ProductDetail";

// Modals & Drawers (lazy-loaded for performance) — these only render on
// demand, so lazy-loading does not cause any navigation/route flash.
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
          <Route path="/collection" element={<Collection />} />
          <Route path="/men" element={<Navigate to="/collection?category=mens" replace />} />
          <Route path="/mens" element={<Navigate to="/collection?category=mens" replace />} />
          <Route path="/women" element={<Navigate to="/collection?category=women" replace />} />
          <Route path="/kids" element={<Navigate to="/collection?category=kids" replace />} />
          <Route path="/boys" element={<Navigate to="/collection?category=boys" replace />} />
          <Route path="/girls" element={<Navigate to="/collection?category=girls" replace />} />
          <Route path="/babies" element={<Navigate to="/collection?category=babies" replace />} />
          <Route path="/best-sellers" element={<Navigate to="/collection?collection=best-sellers" replace />} />
          <Route path="/best-seller" element={<Navigate to="/collection?collection=best-sellers" replace />} />
          <Route path="/new-arrivals" element={<Navigate to="/collection?collection=new-arrivals" replace />} />
          <Route path="/new-arrival" element={<Navigate to="/collection?collection=new-arrivals" replace />} />
          <Route path="/product/:productId" element={<ProductDetail />} />
          <Route path="/wishlist" element={<Wishlist />} />
          <Route path="*" element={<ComingSoon title="Page Not Found" />} />
        </Routes>
      </main>

      <Footer />

      <SocialFloatWidget />

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