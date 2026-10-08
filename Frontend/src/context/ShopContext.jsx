import React, { createContext, useContext, useState, useEffect, useMemo, useCallback, useRef } from "react";
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
    const [homeResult, productResult] = await Promise.allSettled([
      storefrontApi.home(),
      storefrontApi.products()
    ]);
    if (homeResult.status === "fulfilled") setHomeData(homeResult.value);
    if (productResult.status === "fulfilled" && Array.isArray(productResult.value)) {
      setAllProducts(productResult.value);
    }
    setStorefrontStatus(productResult.status === "fulfilled" ? "ready" : "fallback");
    return homeResult.status === "fulfilled" ? homeResult.value : null;
  }, []);

  useEffect(() => {
    refreshHomeData();

    const handleFocus = () => {
      refreshHomeData();
    };

    window.addEventListener("focus", handleFocus);
    document.addEventListener("visibilitychange", handleFocus);
    const refreshInterval = window.setInterval(() => {
      if (document.visibilityState === "visible") refreshHomeData();
    }, 30000);

    return () => {
      window.clearInterval(refreshInterval);
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
      if (!saved) return [];
      const parsed = JSON.parse(saved);
      if (!Array.isArray(parsed)) return [];
      return parsed
        .map(String)
        .filter((id) => {
          if (!id) return false;
          const clean = id.trim().toLowerCase();
          // Discard any legacy mock IDs (e.g. zmw-001, zmw-002, zmw-m01)
          if (clean.startsWith("zmw-")) return false;
          // Genuine database IDs are positive integer numbers
          return /^\d+$/.test(clean);
        });
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

  // Auto-prune orphaned or phantom IDs from wishlist when catalogue loads
  useEffect(() => {
    if (storefrontStatus === "ready" && allProducts.length > 0 && wishlist.length > 0) {
      setWishlist((prev) => {
        const clean = prev.filter((id) => {
          const str = String(id).trim();
          if (!str || str.toLowerCase().startsWith("zmw-") || !/^\d+$/.test(str)) {
            return false;
          }
          return allProductsMap.has(str) || allProductsMap.has(str.toLowerCase());
        });
        if (clean.length !== prev.length) {
          try {
            localStorage.setItem("zmw_wishlist", JSON.stringify(clean));
          } catch (e) {
            console.warn("Storage error", e);
          }
          return clean;
        }
        return prev;
      });
    }
  }, [storefrontStatus, allProducts, allProductsMap]);

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
    let color = selectedColor || (product.colors && (product.colors[0]?.name || product.colors[0])) || "";
    let size = selectedSize || (product.sizes && (product.sizes[0]?.label || product.sizes[0])) || "";
    // Variant stock and price always come from the Admin-managed variant.
    const hasVariants = Array.isArray(product.variants) && product.variants.length > 0;
    let match = null;
    if (hasVariants) {
      if (color && size) {
        match = product.variants.find(
          (v) =>
            (!v.color || v.color.toLowerCase() === color.toLowerCase()) &&
            (!v.size || v.size.toLowerCase() === size.toLowerCase()) &&
            Number(v.stockCount ?? v.stock_count ?? 0) > 0
        );
      }
      if (!match) {
        match =
          product.variants.find((v) => Number(v.stockCount ?? v.stock_count ?? 0) > 0) ||
          product.variants[0];
      }
      if (match) {
        if (match.color) color = match.color;
        if (match.size) size = match.size;
      }
    }

    const image = match?.imageUrl || match?.image_url || (product.images && product.images[0]) || "";
    const maxStock = hasVariants
      ? Number(match?.stockCount ?? match?.stock_count ?? 0)
      : Number(product.stockCount ?? 0);
    if (maxStock <= 0) {
      addToast("This item is currently out of stock.", "warning");
      return;
    }
    const price = Number(match?.priceOverride ?? match?.price_override ?? product.price);

    setCart((prevCart) => {
      const existingIndex = prevCart.findIndex(
        (item) => String(item.id) === String(product.id) && item.color === color && item.size === size
      );

      if (existingIndex > -1) {
        const updated = [...prevCart];
        const currentQty = updated[existingIndex].quantity;
        const availableMax = maxStock !== null ? maxStock : (updated[existingIndex].maxStock ?? 0);
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
            price,
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

    addToast(`Added "${product.name}" (${size || "Std"} / ${color || "Std"}) to your bag!`, "success");
    setIsCartOpen(true);
  };

  const updateQuantity = (id, color, size, delta) => {
    setCart((prev) =>
      prev
        .map((item) => {
          if (String(item.id) === String(id) && item.color === color && item.size === size) {
            let maxLimit = item.maxStock ?? 0;
            const prod = allProducts.find((p) => String(p.id) === String(id));
            if (prod?.variants?.length > 0) {
              const mv = prod.variants.find(
                (v) =>
                  (!v.color || v.color.toLowerCase() === color.toLowerCase()) &&
                  (!v.size || v.size.toLowerCase() === size.toLowerCase())
              );
              maxLimit = Number(mv?.stockCount ?? mv?.stock_count ?? 0);
            } else if (prod?.stockCount !== undefined) {
              maxLimit = Number(prod.stockCount);
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

  // Last action timestamp ref to shield against mobile double-tap / shifted-item ghost clicks
  const lastWishlistActionRef = useRef(0);

  // Wishlist operations
  const isInWishlist = (productId) => {
    if (productId === undefined || productId === null) return false;
    const target = String(productId).trim().toLowerCase();
    return wishlist.some((id) => String(id).trim().toLowerCase() === target);
  };

  const toggleWishlist = (productId) => {
    if (productId === undefined || productId === null) return;
    const target = String(productId).trim();
    if (!target) return;

    // Mobile ghost-click & double-tap shield: throttle rapid invocations within 400ms
    const now = Date.now();
    if (now - lastWishlistActionRef.current < 400) {
      return;
    }
    lastWishlistActionRef.current = now;

    const product = findProduct(productId);
    const name = product ? product.name : "Product";
    const exists = wishlist.some((id) => String(id).trim().toLowerCase() === target.toLowerCase());

    if (exists) {
      setWishlist((prev) => prev.filter((id) => String(id).trim().toLowerCase() !== target.toLowerCase()));
      addToast(`Removed "${name}" from Wishlist`, "info");
    } else {
      setWishlist((prev) => [...prev, target]);
      addToast(`Saved "${name}" to your Wishlist ❤️`, "success");
    }
  };

  const moveToCartFromWishlist = (productId) => {
    if (productId === undefined || productId === null) return;
    const target = String(productId).trim().toLowerCase();

    // Mobile ghost-click shield
    const now = Date.now();
    if (now - lastWishlistActionRef.current < 400) {
      return;
    }
    lastWishlistActionRef.current = now;

    const product = findProduct(productId);
    if (product) {
      addToCart(product);
      setWishlist((prev) => prev.filter((id) => String(id).trim().toLowerCase() !== target));
    }
  };

  const clearWishlist = useCallback(() => {
    setWishlist([]);
    try {
      localStorage.removeItem("zmw_wishlist");
    } catch (e) {
      console.warn("Storage error", e);
    }
  }, []);

  const wishlistCount = useMemo(() => {
    if (storefrontStatus === "loading") {
      return wishlist.filter((id) => /^\d+$/.test(String(id).trim())).length;
    }
    return wishlist.filter((id) => {
      const p = findProduct(id);
      return p !== null && p !== undefined;
    }).length;
  }, [wishlist, storefrontStatus, findProduct]);

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
      const hasVariants = Array.isArray(live.variants) && live.variants.length > 0;
      const variant = hasVariants
        ? live.variants.find(
            (v) =>
              (!v.color || v.color.toLowerCase() === item.color.toLowerCase()) &&
              (!v.size || v.size.toLowerCase() === item.size.toLowerCase())
          )
        : null;
      const price = Number(variant?.priceOverride ?? live.price);
      if (!Number.isFinite(price)) return item;
      const originalPrice = Number(live.originalPrice) > price
        ? Number(live.originalPrice)
        : null;
      const maxStock = hasVariants
        ? Number(variant?.stockCount ?? variant?.stock_count ?? 0)
        : Number(live.stockCount ?? 0);
      if (maxStock <= 0) return null;
      const liveImage = variant?.imageUrl || variant?.image_url || (live.images && live.images[0]) || item.image;
      if (
        price === Number(item.price) &&
        originalPrice === Number(item.originalPrice) &&
        maxStock === Number(item.maxStock) &&
        liveImage === item.image
      ) return item;
      return { ...item, price, originalPrice, maxStock, image: liveImage, quantity: Math.min(item.quantity, maxStock) };
    }).filter((item) => item && item.quantity > 0);
  }, [cart, allProductsMap]);

  // Cart Calculations
  const cartItemCount = cartLines.reduce((sum, item) => sum + item.quantity, 0);
  const cartSubtotal = cartLines.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const discountAmount = appliedCoupon
    ? appliedCoupon.discountAmount !== undefined
      ? appliedCoupon.discountAmount
      : (cartSubtotal * (appliedCoupon.discountPercent || 0)) / 100
    : 0;
  const isFreeShipping = false;
  const shippingCost = cartSubtotal === 0 ? 0 : SHIPPING_FEE;
  const cartTotal = Math.max(0, cartSubtotal - discountAmount + shippingCost);
  const freeShippingRemaining = 0;
  const freeShippingPercent = 0;

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
        categories: homeData?.categories || [],
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
        wishlistCount,
        isInWishlist,
        toggleWishlist,
        moveToCartFromWishlist,
        clearWishlist,
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
