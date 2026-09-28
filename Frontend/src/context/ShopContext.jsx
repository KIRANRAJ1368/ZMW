import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from "react";
import { INSTAGRAM_SHOWCASE } from "../data/products";
import { storefrontApi } from "../services/storefrontApi";
import { formatPrice as formatINR, CURRENCY_SYMBOL, CURRENCY_LOCALE } from "../utils/formatPrice";
import { FREE_SHIPPING_THRESHOLD, SHIPPING_FEE } from "../utils/shopConfig";

const ShopContext = createContext();

// The store sells in a single currency. Prices are stored exactly as entered in
// the Admin panel, so every rate is 1 and no FX conversion is ever applied.
const CURRENCIES = {
  INR: { symbol: CURRENCY_SYMBOL, rate: 1, name: "INR (₹)", locale: CURRENCY_LOCALE }
};
const RECENTLY_VIEWED_KEY = "zmw_recently_viewed";
const MAX_RECENTLY_VIEWED = 5;

const readRecentlyViewedIds = () => {
  try {
    const saved = JSON.parse(localStorage.getItem(RECENTLY_VIEWED_KEY) || "[]");
    return Array.isArray(saved)
      ? [...new Set(saved.filter((id) => typeof id === "string"))].slice(0, MAX_RECENTLY_VIEWED)
      : [];
  } catch {
    return [];
  }
};

export const ShopProvider = ({ children }) => {
  // The catalogue starts empty on purpose. Prices are owned solely by the Admin
  // panel / database and are only ever populated from the API, so a stale
  // hard-coded list can never be shown instead of an Admin-edited price.
  const [allProducts, setAllProducts] = useState([]);
  const [homeData, setHomeData] = useState(null);
  const [storefrontStatus, setStorefrontStatus] = useState("loading");

  const refreshHomeData = useCallback(async () => {
    try {
      const [home, productPayload] = await Promise.all([storefrontApi.home(), storefrontApi.products()]);
      setHomeData(home);
      if (Array.isArray(productPayload) && productPayload.length) setAllProducts(productPayload);
      setStorefrontStatus("ready");
      return home;
    } catch {
      setStorefrontStatus("fallback");
    }
  }, []);

  useEffect(() => {
    refreshHomeData();

    const handleFocus = () => {
      refreshHomeData();
    };

    window.addEventListener("focus", handleFocus);
    document.addEventListener("visibilitychange", handleFocus);

    return () => {
      window.removeEventListener("focus", handleFocus);
      document.removeEventListener("visibilitychange", handleFocus);
    };
  }, [refreshHomeData]);

  const allProductsMap = useMemo(() => {
    const map = new Map();
    (allProducts || []).forEach((p) => {
      if (!p) return;
      if (p.id !== undefined && p.id !== null) {
        map.set(String(p.id), p);
        map.set(String(p.id).toLowerCase(), p);
      }
      if (p.slug) {
        map.set(String(p.slug), p);
        map.set(String(p.slug).toLowerCase(), p);
      }
      if (p.sku) {
        map.set(String(p.sku), p);
        map.set(String(p.sku).toLowerCase(), p);
      }
    });
    return map;
  }, [allProducts]);

  const findProduct = useCallback(
    (productId) => {
      if (!productId) return null;
      const key = String(productId).trim();
      return allProductsMap.get(key) || allProductsMap.get(key.toLowerCase()) || null;
    },
    [allProductsMap]
  );

  // Catalogue pages ask for their department by slug ("mens", "women", "kids",
  // "boys", "girls", "babies"), or a list of slugs when a page spans several.
  // Always served from the Admin/backend catalog so an Admin price edit is
  // reflected everywhere immediately.
  const productsByCategory = useCallback(
    (categorySlug) => {
      const list = Array.isArray(categorySlug) ? categorySlug : [categorySlug];
      const wanted = list
        .map((s) => String(s || "").trim().toLowerCase())
        .map((s) => (s === "men" ? "mens" : s === "woman" ? "women" : s))
        .filter(Boolean);
      if (!wanted.length) return allProducts || [];
      return (allProducts || []).filter((p) => wanted.includes(String(p?.category ?? "").trim().toLowerCase()));
    },
    [allProducts]
  );

  const [recentlyViewedIds, setRecentlyViewedIds] = useState(() => {
    return readRecentlyViewedIds();
  });

  const recentlyViewed = useMemo(
    () => recentlyViewedIds.map((id) => findProduct(id)).filter(Boolean),
    [recentlyViewedIds, allProductsMap]
  );

  const trackRecentlyViewed = useCallback((productId) => {
    const normalizedId = String(productId);
    if (!allProductsMap.has(normalizedId)) return;
    setRecentlyViewedIds((previous) => {
      const next = [
      normalizedId,
      ...previous.filter((id) => id !== normalizedId)
      ].slice(0, MAX_RECENTLY_VIEWED);

      try {
        localStorage.setItem(RECENTLY_VIEWED_KEY, JSON.stringify(next));
      } catch (e) {
        console.warn("Storage error", e);
      }

      return next;
    });
  }, [allProductsMap]);

  // Cart state
  const [cart, setCart] = useState(() => {
    try {
      const saved = JSON.parse(localStorage.getItem("zmw_cart") || "[]");
      return Array.isArray(saved) ? saved : [];
    } catch {
      return [];
    }
  });

  // Wishlist state
  const [wishlist, setWishlist] = useState(() => {
    try {
      const saved = localStorage.getItem("zmw_wishlist");
      return saved ? JSON.parse(saved) : ["zmw-002", "zmw-005"];
    } catch {
      return [];
    }
  });

  // Currency & Language
  const [currency, setCurrency] = useState("INR");
  const [language, setLanguage] = useState("EN");

  // Coupon
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponError, setCouponError] = useState("");

  // Modals & Drawers state
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isWishlistOpen, setIsWishlistOpen] = useState(false);
  const [quickViewProduct, setQuickViewProduct] = useState(null);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [authModalState, setAuthModalState] = useState(null); // 'login' | 'register' | 'forgot' | null
  const [isOrderTrackOpen, setIsOrderTrackOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(null);

  // Toast notifications
  const [toasts, setToasts] = useState([]);

  // Customer Authentication state
  const [customerToken, setCustomerToken] = useState(() => {
    try {
      return localStorage.getItem("zmw_customer_token") || null;
    } catch {
      return null;
    }
  });

  const [customerUser, setCustomerUser] = useState(() => {
    try {
      const saved = localStorage.getItem("zmw_customer_user");
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [isAuthLoading, setIsAuthLoading] = useState(false);
  const [pendingCheckout, setPendingCheckout] = useState(false);

  // Validate customer token on mount
  useEffect(() => {
    if (!customerToken) return;
    storefrontApi
      .getCustomerProfile(customerToken)
      .then((data) => {
        if (data?.user) {
          setCustomerUser(data.user);
          try {
            localStorage.setItem("zmw_customer_user", JSON.stringify(data.user));
          } catch (e) {
            console.warn("Storage error", e);
          }
        }
      })
      .catch(() => {
        setCustomerToken(null);
        setCustomerUser(null);
        try {
          localStorage.removeItem("zmw_customer_token");
          localStorage.removeItem("zmw_customer_user");
        } catch (e) {
          console.warn("Storage error", e);
        }
      });
  }, [customerToken]);

  const loginCustomer = async (email, password) => {
    setIsAuthLoading(true);
    try {
      const res = await storefrontApi.loginCustomer({ email, password });
      const { token, user } = res;
      setCustomerToken(token);
      setCustomerUser(user);
      try {
        localStorage.setItem("zmw_customer_token", token);
        localStorage.setItem("zmw_customer_user", JSON.stringify(user));
      } catch (e) {
        console.warn("Storage error", e);
      }
      addToast(`Welcome back, ${user.name}! ✨`, "success");
      return user;
    } finally {
      setIsAuthLoading(false);
    }
  };

  const registerCustomer = async ({ name, email, phone, password, confirmPassword }) => {
    setIsAuthLoading(true);
    try {
      const res = await storefrontApi.registerCustomer({ name, email, phone, password, confirmPassword });
      const { token, user } = res;
      setCustomerToken(token);
      setCustomerUser(user);
      try {
        localStorage.setItem("zmw_customer_token", token);
        localStorage.setItem("zmw_customer_user", JSON.stringify(user));
      } catch (e) {
        console.warn("Storage error", e);
      }
      addToast(`Welcome to ZMW Clothing, ${user.name}! ✨`, "success");
      return user;
    } finally {
      setIsAuthLoading(false);
    }
  };

  const logoutCustomer = () => {
    setCustomerToken(null);
    setCustomerUser(null);
    try {
      localStorage.removeItem("zmw_customer_token");
      localStorage.removeItem("zmw_customer_user");
    } catch (e) {
      console.warn("Storage error", e);
    }
    addToast("You have been signed out.", "info");
  };

  const forgotPassword = async (email) => {
    return storefrontApi.forgotPassword(email);
  };

  const verifyOtp = async (payload) => {
    return storefrontApi.verifyOtp(payload);
  };

  const resetPassword = async (payload) => {
    return storefrontApi.resetPassword(payload);
  };

  const proceedToCheckout = (navigateFn) => {
    setIsCartOpen(false);
    setIsCheckoutOpen(false);
    if (typeof navigateFn === "function") {
      navigateFn("/checkout");
    } else if (typeof window !== "undefined" && window.location.pathname !== "/checkout") {
      window.location.href = "/checkout";
    }
  };

  // Save Cart to LocalStorage
  useEffect(() => {
    try {
      localStorage.setItem("zmw_cart", JSON.stringify(cart));
    } catch (e) {
      console.warn("Storage error", e);
    }
  }, [cart]);

  // Save Wishlist to LocalStorage
  useEffect(() => {
    try {
      localStorage.setItem("zmw_wishlist", JSON.stringify(wishlist));
    } catch (e) {
      console.warn("Storage error", e);
    }
  }, [wishlist]);

  useEffect(() => {
    try {
      localStorage.setItem(RECENTLY_VIEWED_KEY, JSON.stringify(recentlyViewedIds));
    } catch (e) {
      console.warn("Storage error", e);
    }
  }, [recentlyViewedIds]);

  // Toast helper
  const addToast = (message, type = "success") => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3800);
  };

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Render an Admin/database price as ₹. The stored value is the single source
  // of truth and is displayed verbatim — no conversion, no re-scaling — so the
  // storefront can never disagree with the Admin panel or the database.
  const formatPrice = (amount) => formatINR(amount);

  // Cart operations
  const addToCart = (product, selectedColor = null, selectedSize = null, quantity = 1) => {
    const color = selectedColor || (product.colors && product.colors[0]?.name) || "Standard";
    const size = selectedSize || (product.sizes && product.sizes[0]) || "Standard";
    const image = (product.images && product.images[0]) || "";

    // Find variant max stock if available
    let maxStock = product.stockCount ?? null;
    if (product.variants && product.variants.length > 0) {
      const match = product.variants.find(
        (v) =>
          (!v.color || v.color.toLowerCase() === color.toLowerCase()) &&
          (!v.size || v.size.toLowerCase() === size.toLowerCase())
      );
      if (match != null) {
        maxStock = match.stockCount ?? match.stock_count ?? null;
      }
    }

    setCart((prevCart) => {
      const existingIndex = prevCart.findIndex(
        (item) => String(item.id) === String(product.id) && item.color === color && item.size === size
      );

      if (existingIndex > -1) {
        const updated = [...prevCart];
        const currentQty = updated[existingIndex].quantity;
        const availableMax = maxStock !== null ? maxStock : (updated[existingIndex].maxStock ?? 99);
        const newQty = Math.min(availableMax, currentQty + quantity);
        updated[existingIndex] = {
          ...updated[existingIndex],
          quantity: newQty,
          maxStock: availableMax
        };
        return updated;
      } else {
        const initialQty = maxStock !== null ? Math.min(quantity, Math.max(1, maxStock)) : quantity;
        return [
          ...prevCart,
          {
            id: product.id,
            name: product.name,
            price: product.price,
            originalPrice: product.originalPrice,
            color,
            size,
            image,
            quantity: initialQty,
            maxStock: maxStock !== null ? maxStock : undefined
          }
        ];
      }
    });

    addToast(`Added "${product.name}" (${size} / ${color}) to your bag!`, "success");
    setIsCartOpen(true);
  };

  const updateQuantity = (id, color, size, delta) => {
    setCart((prev) =>
      prev
        .map((item) => {
          if (String(item.id) === String(id) && item.color === color && item.size === size) {
            let maxLimit = item.maxStock ?? 99;
            const prod = allProducts.find((p) => String(p.id) === String(id));
            if (prod?.variants?.length > 0) {
              const mv = prod.variants.find(
                (v) =>
                  (!v.color || v.color.toLowerCase() === color.toLowerCase()) &&
                  (!v.size || v.size.toLowerCase() === size.toLowerCase())
              );
              if (mv != null && mv.stockCount !== undefined) {
                maxLimit = mv.stockCount;
              }
            } else if (prod?.stockCount !== undefined) {
              maxLimit = prod.stockCount;
            }

            const newQty = item.quantity + delta;
            if (delta > 0 && newQty > maxLimit) {
              addToast(`Cannot add more. Only ${maxLimit} units available in stock.`, "warning");
              return item;
            }
            return newQty > 0 ? { ...item, quantity: newQty, maxStock: maxLimit } : null;
          }
          return item;
        })
        .filter(Boolean)
    );
  };

  const removeFromCart = (id, color, size) => {
    setCart((prev) =>
      prev.filter((item) => !(String(item.id) === String(id) && item.color === color && item.size === size))
    );
    addToast("Item removed from bag.", "info");
  };

  const clearCart = () => {
    setCart([]);
  };

  // Wishlist operations
  const toggleWishlist = (productId) => {
    const product = findProduct(productId);
    const name = product ? product.name : "Product";

    setWishlist((prev) => {
      if (prev.includes(productId)) {
        addToast(`Removed "${name}" from Wishlist`, "info");
        return prev.filter((id) => id !== productId);
      } else {
        addToast(`Saved "${name}" to your Wishlist ❤️`, "success");
        return [...prev, productId];
      }
    });
  };

  const moveToCartFromWishlist = (productId) => {
    const product = findProduct(productId);
    if (product) {
      addToCart(product);
      setWishlist((prev) => prev.filter((id) => id !== productId));
    }
  };

  // Coupon code
  const applyCoupon = async (code) => {
    const cleanCode = (code || "").trim().toUpperCase();
    if (!cleanCode) return false;

    try {
      const res = await storefrontApi.validateCoupon(cleanCode, cartSubtotal);
      if (res?.valid) {
        setAppliedCoupon({
          code: res.code,
          discountType: res.discount_type,
          discountValue: res.discount_value,
          discountAmount: res.discount_amount,
          discountPercent: res.discount_type === "percentage" ? res.discount_value : null
        });
        setCouponError("");
        addToast(`✨ Coupon ${res.code} applied!`, "success");
        return true;
      }
    } catch (err) {
      if (cleanCode === "WELCOME10") {
        setAppliedCoupon({ code: "WELCOME10", discountPercent: 10, discountType: "percentage" });
        setCouponError("");
        addToast("✨ Coupon WELCOME10 applied! 10% discount added.", "success");
        return true;
      } else if (cleanCode === "LUXURY20") {
        setAppliedCoupon({ code: "LUXURY20", discountPercent: 20, discountType: "percentage" });
        setCouponError("");
        addToast("✨ VIP Coupon LUXURY20 applied! 20% discount added.", "success");
        return true;
      }
      setCouponError(err.message || "Invalid coupon code.");
      return false;
    }
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
    setCouponError("");
    addToast("Coupon removed", "info");
  };

  // A cart row stores the name/price that were current when the item was added,
  // which then sits in localStorage indefinitely. Re-read the price from the live
  // catalogue on every render so an Admin price edit is reflected in the bag, the
  // totals and checkout straight away. The stored snapshot is only kept for rows
  // whose product is no longer in the catalogue (deleted or unpublished).
  const cartLines = useMemo(() => {
    if (!cart.length) return cart;
    return cart.map((item) => {
      const key = String(item.id);
      const live = allProductsMap.get(key) || allProductsMap.get(key.toLowerCase());
      if (!live) return item;
      const price = Number(live.price);
      if (!Number.isFinite(price)) return item;
      const originalPrice =
        live.originalPrice === null || live.originalPrice === undefined
          ? item.originalPrice
          : Number(live.originalPrice);
      if (price === Number(item.price) && originalPrice === Number(item.originalPrice)) return item;
      return { ...item, price, originalPrice };
    });
  }, [cart, allProductsMap]);

  // Cart Calculations
  const cartItemCount = cartLines.reduce((sum, item) => sum + item.quantity, 0);
  const cartSubtotal = cartLines.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const discountAmount = appliedCoupon
    ? appliedCoupon.discountAmount !== undefined
      ? appliedCoupon.discountAmount
      : (cartSubtotal * (appliedCoupon.discountPercent || 0)) / 100
    : 0;
  const isFreeShipping = cartSubtotal >= FREE_SHIPPING_THRESHOLD;
  const shippingCost = cartSubtotal === 0 || isFreeShipping ? 0 : SHIPPING_FEE;
  const cartTotal = Math.max(0, cartSubtotal - discountAmount + shippingCost);
  const freeShippingRemaining = Math.max(0, FREE_SHIPPING_THRESHOLD - cartSubtotal);
  const freeShippingPercent = Math.min(100, Math.round((cartSubtotal / FREE_SHIPPING_THRESHOLD) * 100));

  // Lightbox helpers
  const openLightbox = (index) => setLightboxIndex(index);
  const closeLightbox = () => setLightboxIndex(null);
  const nextLightbox = () => {
    if (lightboxIndex !== null) {
      setLightboxIndex((prev) => (prev + 1) % INSTAGRAM_SHOWCASE.length);
    }
  };
  const prevLightbox = () => {
    if (lightboxIndex !== null) {
      setLightboxIndex((prev) => (prev - 1 + INSTAGRAM_SHOWCASE.length) % INSTAGRAM_SHOWCASE.length);
    }
  };

  return (
    <ShopContext.Provider
      value={{
        // Catalog. `products` is a legacy alias for `allProducts`; both point at
        // the API payload so no consumer can fall back to static prices.
        products: allProducts,
        allProducts,
        productsByCategory,
        findProduct,
        homeData,
        refreshHomeData,
        storefrontStatus,
        recentlyViewed,
        trackRecentlyViewed,
        // Cart. `cart` carries the live Admin/DB price for every line; the
        // stored snapshot only survives for products missing from the catalogue.
        cart: cartLines,
        cartItemCount,
        cartSubtotal,
        discountAmount,
        shippingCost,
        cartTotal,
        isFreeShipping,
        freeShippingThreshold: FREE_SHIPPING_THRESHOLD,
        shippingFee: SHIPPING_FEE,
        freeShippingRemaining,
        freeShippingPercent,
        appliedCoupon,
        couponError,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        applyCoupon,
        removeCoupon,
        isCartOpen,
        setIsCartOpen,
        // Wishlist
        wishlist,
        toggleWishlist,
        moveToCartFromWishlist,
        isWishlistOpen,
        setIsWishlistOpen,
        // Currency & Lang
        currency,
        setCurrency,
        currencies: CURRENCIES,
        language,
        setLanguage,
        formatPrice,
        // Quick view
        quickViewProduct,
        setQuickViewProduct,
        // Search
        isSearchOpen,
        setIsSearchOpen,
        searchQuery,
        setSearchQuery,
        // Auth
        authModalState,
        setAuthModalState,
        customerToken,
        customerUser,
        isCustomerAuthenticated: Boolean(customerUser),
        isAuthLoading,
        pendingCheckout,
        setPendingCheckout,
        loginCustomer,
        registerCustomer,
        logoutCustomer,
        forgotPassword,
        verifyOtp,
        resetPassword,
        proceedToCheckout,
        // Order track
        isOrderTrackOpen,
        setIsOrderTrackOpen,
        // Checkout
        isCheckoutOpen,
        setIsCheckoutOpen,
        // Lightbox
        lightboxIndex,
        openLightbox,
        closeLightbox,
        nextLightbox,
        prevLightbox,
        // Toasts
        toasts,
        addToast,
        removeToast
      }}
    >
      {children}
    </ShopContext.Provider>
  );
};

export const useShop = () => {
  const context = useContext(ShopContext);
  if (!context) {
    throw new Error("useShop must be used within a ShopProvider");
  }
  return context;
};
