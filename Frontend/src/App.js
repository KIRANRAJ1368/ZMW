import { lazy, Suspense } from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
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

import AboutUs from "./pages/AboutUs";
import ContactUs from "./pages/ContactUs";
import FAQ from "./pages/FAQ";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import TermsConditions from "./pages/TermsConditions";
import ReturnRefundPolicy from "./pages/ReturnRefundPolicy";
import ShippingPolicy from "./pages/ShippingPolicy";
import SizeGuide from "./pages/SizeGuide";

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

/**
 * CategoryRedirect preserves any existing query parameters when redirecting
 * from legacy paths like /men?category=Oversized%20T-Shirts to /collection?category=Oversized%20T-Shirts.
 */
function CategoryRedirect({ defaultCategory, defaultCollection }) {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);

  if (defaultCategory && !searchParams.has("category")) {
    searchParams.set("category", defaultCategory);
  }
  if (defaultCollection && !searchParams.has("collection")) {
    searchParams.set("collection", defaultCollection);
  }

  const query = searchParams.toString();
  return <Navigate to={`/collection${query ? `?${query}` : ""}`} replace />;
}

export default function App() {
  return (
    <ShopProvider>
      <ScrollToTop />
      <Navbar />

      <main id="main-content">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/collection" element={<Collection />} />
          
          {/* Query-preserving category redirects */}
          <Route path="/men" element={<CategoryRedirect defaultCategory="mens" />} />
          <Route path="/mens" element={<CategoryRedirect defaultCategory="mens" />} />
          <Route path="/women" element={<CategoryRedirect defaultCategory="women" />} />
          <Route path="/kids" element={<CategoryRedirect defaultCategory="kids" />} />
          <Route path="/boys" element={<CategoryRedirect defaultCategory="boys" />} />
          <Route path="/girls" element={<CategoryRedirect defaultCategory="girls" />} />
          <Route path="/babies" element={<CategoryRedirect defaultCategory="babies" />} />
          <Route path="/best-sellers" element={<CategoryRedirect defaultCollection="best-sellers" />} />
          <Route path="/best-seller" element={<CategoryRedirect defaultCollection="best-sellers" />} />
          <Route path="/new-arrivals" element={<CategoryRedirect defaultCollection="new-arrivals" />} />
          <Route path="/new-arrival" element={<CategoryRedirect defaultCollection="new-arrivals" />} />

          {/* New Informational & Policy Pages */}
          <Route path="/about" element={<AboutUs />} />
          <Route path="/about-us" element={<AboutUs />} />
          <Route path="/contact" element={<ContactUs />} />
          <Route path="/contact-us" element={<ContactUs />} />
          <Route path="/faq" element={<FAQ />} />
          <Route path="/faqs" element={<FAQ />} />
          <Route path="/privacy-policy" element={<PrivacyPolicy />} />
          <Route path="/privacy" element={<PrivacyPolicy />} />
          <Route path="/terms-conditions" element={<TermsConditions />} />
          <Route path="/terms" element={<TermsConditions />} />
          <Route path="/return-refund-policy" element={<ReturnRefundPolicy />} />
          <Route path="/returns" element={<ReturnRefundPolicy />} />
          <Route path="/shipping-policy" element={<ShippingPolicy />} />
          <Route path="/shipping" element={<ShippingPolicy />} />
          <Route path="/size-guide" element={<SizeGuide />} />
          <Route path="/size-chart" element={<SizeGuide />} />

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