import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from "react";
import {
  PRODUCTS,
  MEN_PRODUCTS,
  WOMEN_PRODUCTS,
  KIDS_PRODUCTS,
  UNIFIED_PRODUCTS,
  INSTAGRAM_SHOWCASE
} from "../data/products";
import { storefrontApi } from "../services/storefrontApi";

const ShopContext = createContext();

const CURRENCIES = {
  INR: { symbol: "₹", rate: 83, name: "INR (₹)", locale: "en-IN" },
  USD: { symbol: "$", rate: 1.0, name: "USD ($)", locale: "en-US" },
  EUR: { symbol: "€", rate: 0.92, name: "EUR (€)", locale: "de-DE" },
  GBP: { symbol: "£", rate: 0.78, name: "GBP (£)", locale: "en-GB" }
};

const FREE_SHIPPING_THRESHOLD = 75; // in USD
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
  // Keep the local catalogue as a resilient first-render fallback, then replace
  // it with the admin-managed API catalogue as soon as it is available.
  const [allProducts, setAllProducts] = useState(UNIFIED_PRODUCTS);
  const [homeData, setHomeData] = useState(null);
  const [storefrontStatus, setStorefrontStatus] = useState("loading");

  useEffect(() => {
    let mounted = true;
    Promise.all([storefrontApi.home(), storefrontApi.products()])
      .then(([home, productPayload]) => {
        if (!mounted) return;
        setHomeData(home);
        if (Array.isArray(productPayload) && productPayload.length) setAllProducts(productPayload);
        setStorefrontStatus("ready");
      })
      .catch(() => {
        // The existing local data remains visible if the API is temporarily unavailable.
        if (mounted) setStorefrontStatus("fallback");
      });
    return () => { mounted = false; };
  }, []);

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
      const saved = localStorage.getItem("zmw_cart");
      return saved ? JSON.parse(saved) : [
        {
          id: "zmw-001",
          name: "Linen Boxy Oversized Tee",
          price: 68,
          color: "Cream Linen",
          size: "M",
          image: "/images/photo-1521572267360-ee0c2909d518.jpg",
          quantity: 1
        }
      ];
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

  // Format all storefront prices consistently as Indian Rupees.
  const formatPrice = (amountInUsd) => {
    if (amountInUsd === null || amountInUsd === undefined) return "";
    const inr = CURRENCIES.INR;
    const converted = Math.round(amountInUsd * inr.rate);
    return `₹${new Intl.NumberFormat("en-IN").format(converted)}`;
  };

  // Cart operations
  const addToCart = (product, selectedColor = null, selectedSize = null, quantity = 1) => {
    const color = selectedColor || (product.colors && product.colors[0]?.name) || "Standard";
    const size = selectedSize || (product.sizes && product.sizes[0]) || "Standard";
    const image = (product.images && product.images[0]) || "";

    setCart((prevCart) => {
      const existingIndex = prevCart.findIndex(
        (item) => String(item.id) === String(product.id) && item.color === color && item.size === size
      );

      if (existingIndex > -1) {
        const updated = [...prevCart];
        updated[existingIndex].quantity += quantity;
        return updated;
      } else {
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
            quantity
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
            const newQty = item.quantity + delta;
            return newQty > 0 ? { ...item, quantity: newQty } : null;
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

  // Cart Calculations
  const cartItemCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const cartSubtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const discountAmount = appliedCoupon
    ? appliedCoupon.discountAmount !== undefined
      ? appliedCoupon.discountAmount
      : (cartSubtotal * (appliedCoupon.discountPercent || 0)) / 100
    : 0;
  const isFreeShipping = cartSubtotal >= FREE_SHIPPING_THRESHOLD;
  const shippingCost = cartSubtotal === 0 || isFreeShipping ? 0 : 15;
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
        // Catalog
        products: allProducts.length ? allProducts : PRODUCTS,
        allProducts,
        findProduct,
        homeData,
        storefrontStatus,
        recentlyViewed,
        trackRecentlyViewed,
        // Cart
        cart,
        cartItemCount,
        cartSubtotal,
        discountAmount,
        shippingCost,
        cartTotal,
        isFreeShipping,
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
