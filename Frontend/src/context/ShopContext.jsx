import React, { createContext, useContext, useState, useEffect, useMemo } from "react";
import {
  PRODUCTS,
  MEN_PRODUCTS,
  WOMEN_PRODUCTS,
  KIDS_PRODUCTS,
  INSTAGRAM_SHOWCASE
} from "../data/products";

const ShopContext = createContext();

const CURRENCIES = {
  INR: { symbol: "₹", rate: 83, name: "INR (₹)", locale: "en-IN" },
  USD: { symbol: "$", rate: 1.0, name: "USD ($)", locale: "en-US" },
  EUR: { symbol: "€", rate: 0.92, name: "EUR (€)", locale: "de-DE" },
  GBP: { symbol: "£", rate: 0.78, name: "GBP (£)", locale: "en-GB" }
};

const FREE_SHIPPING_THRESHOLD = 75; // in USD

export const ShopProvider = ({ children }) => {
  // Unified product lookup across all catalogs
  const allProducts = useMemo(() => {
    const seen = new Set();
    const list = [];
    [...PRODUCTS, ...MEN_PRODUCTS, ...WOMEN_PRODUCTS, ...KIDS_PRODUCTS].forEach((p) => {
      if (!seen.has(p.id)) {
        seen.add(p.id);
        list.push(p);
      }
    });
    return list;
  }, []);

  const allProductsMap = useMemo(() => {
    const map = new Map();
    allProducts.forEach((p) => {
      map.set(p.id, p);
    });
    return map;
  }, [allProducts]);

  const findProduct = (productId) => allProductsMap.get(productId) || null;

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

  // Format Price with selected Currency (Indian Rupee number grouping via Intl)
  const formatPrice = (amountInUsd) => {
    if (amountInUsd === null || amountInUsd === undefined) return "";
    const curr = CURRENCIES[currency] || CURRENCIES.INR;
    const converted = Math.round(amountInUsd * curr.rate);
    return `${curr.symbol}${new Intl.NumberFormat(curr.locale).format(converted)}`;
  };

  // Cart operations
  const addToCart = (product, selectedColor = null, selectedSize = null, quantity = 1) => {
    const color = selectedColor || (product.colors && product.colors[0]?.name) || "Standard";
    const size = selectedSize || (product.sizes && product.sizes[0]) || "Standard";
    const image = (product.images && product.images[0]) || "";

    setCart((prevCart) => {
      const existingIndex = prevCart.findIndex(
        (item) => item.id === product.id && item.color === color && item.size === size
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
          if (item.id === id && item.color === color && item.size === size) {
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
      prev.filter((item) => !(item.id === id && item.color === color && item.size === size))
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
  const applyCoupon = (code) => {
    const cleanCode = code.trim().toUpperCase();
    if (cleanCode === "WELCOME10") {
      setAppliedCoupon({ code: "WELCOME10", discountPercent: 10 });
      setCouponError("");
      addToast("✨ Coupon WELCOME10 applied! 10% discount added.", "success");
      return true;
    } else if (cleanCode === "LUXURY20") {
      setAppliedCoupon({ code: "LUXURY20", discountPercent: 20 });
      setCouponError("");
      addToast("✨ VIP Coupon LUXURY20 applied! 20% discount added.", "success");
      return true;
    } else {
      setCouponError("Invalid coupon code. Try WELCOME10 for 10% off!");
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
  const discountAmount = appliedCoupon ? (cartSubtotal * appliedCoupon.discountPercent) / 100 : 0;
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
        products: PRODUCTS,
        allProducts,
        findProduct,
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
