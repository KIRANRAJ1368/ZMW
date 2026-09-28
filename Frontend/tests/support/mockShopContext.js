/**
 * Test double for src/context/ShopContext.
 *
 * Aliased in by tests/support/vite.ssr.config.js so the real components can be
 * rendered against fixture data without booting the API. Provides the slice of
 * the context that the header, product card and collection page read.
 *
 * `formatPrice` is the real implementation, not a stand-in, so tests exercise
 * the same Admin/DB price rendering the storefront ships.
 */
import { formatPrice } from "../../src/utils/formatPrice";

const defaults = () => ({
  homeData: null,
  allProducts: [],
  products: [],
  productsByCategory: (slug) =>
    slug == null
      ? shopValue.allProducts
      : shopValue.allProducts.filter((p) => p.category === slug),
  cartItemCount: 0,
  cart: [],
  wishlist: [],
  recentlyViewed: [],
  customerUser: null,
  formatPrice,
  addToCart: () => {},
  toggleWishlist: () => {},
  setIsCartOpen: () => {},
  setIsWishlistOpen: () => {},
  setIsSearchOpen: () => {},
  setAuthModalState: () => {},
  setIsOrderTrackOpen: () => {},
  setQuickViewProduct: () => {},
  logoutCustomer: () => {},
  trackRecentlyViewed: () => {}
});

let shopValue = defaults();

export function __setShop(next) {
  shopValue = { ...defaults(), ...next };
}

export function __getShop() {
  return shopValue;
}

export function useShop() {
  return shopValue;
}

export function ShopProvider({ children }) {
  return children;
}

export default ShopProvider;
