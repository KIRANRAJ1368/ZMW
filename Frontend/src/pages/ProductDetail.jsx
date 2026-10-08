import { useState, useMemo, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useShop } from "../context/ShopContext";
import ProductCard from "../components/ProductCard/ProductCard";
import SizeGuideModal from "../components/Modals/SizeGuideModal";
import { imageUrl } from "../utils/imageUrl";
import { storefrontApi } from "../services/storefrontApi";
import "./ProductDetail.css";

function availableColors(product) {
  if (product?.variants?.length) {
    const colors = new Map();
    product.variants.forEach((variant) => {
      if (variant.color) {
        const key = variant.color.toLowerCase();
        if (!colors.has(key)) colors.set(key, { name: variant.color, hex: variant.colorHex || "#181715" });
      }
    });
    if (colors.size > 0) return [...colors.values()];
  }
  if (Array.isArray(product?.colors)) {
    return product.colors.map((c) => {
      if (typeof c === "string") return { name: c, hex: "#181715" };
      return { name: c.name || "Default", hex: c.hex || c.hexCode || c.hex_code || "#181715" };
    });
  }
  return [];
}

function availableSizes(product) {
  if (product?.variants?.length) {
    const sizes = [...new Set(product.variants.map((variant) => variant.size).filter(Boolean))];
    if (sizes.length > 0) return sizes;
  }
  if (Array.isArray(product?.sizes)) {
    return product.sizes.map((s) => (typeof s === "object" && s !== null ? (s.label || s.size || s.name) : s)).filter(Boolean);
  }
  return [];
}

function getDefaultSelection(prod) {
  if (!prod) return { color: null, size: null };
  if (prod.variants?.length) {
    const inStock = prod.variants.find((v) => Number(v.stockCount ?? 0) > 0);
    const chosen = inStock || prod.variants[0];
    return {
      color: chosen.color || availableColors(prod)[0]?.name || null,
      size: chosen.size || availableSizes(prod)[0] || null
    };
  }
  return {
    color: availableColors(prod)[0]?.name ?? null,
    size: availableSizes(prod)[0] || null
  };
}

export default function ProductDetail() {
  const { productId } = useParams();
  const navigate = useNavigate();
  const {
    formatPrice,
    addToCart,
    wishlist,
    isInWishlist,
    toggleWishlist,
    setIsCartOpen,
    allProducts,
    findProduct,
    recentlyViewed,
    trackRecentlyViewed,
    categories
  } = useShop();

  const [product, setProduct] = useState(() => findProduct(productId));
  const [isLoading, setIsLoading] = useState(!product);
  const [loadError, setLoadError] = useState(null);

  const [selectedColor, setSelectedColor] = useState(null);
  const [selectedSize, setSelectedSize] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [addedToCart, setAddedToCart] = useState(false);
  const [copiedCoupon, setCopiedCoupon] = useState(null);
  const [isSizeGuideOpen, setIsSizeGuideOpen] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);

  // Accordions state
  const [openAccordions, setOpenAccordions] = useState({
    desc: true,
    specs: true,
    care: false,
    shipping: false
  });

  const toggleAccordion = (key) => {
    setOpenAccordions((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  // Dynamic Product Loader: Guarantees NO previously selected product content leaks
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });

    // Reset selection states immediately on ID change
    setSelectedColor(null);
    setSelectedSize(null);
    setQuantity(1);
    setAddedToCart(false);
    setPreviewImage(null);
    setLoadError(null);

    let isMounted = true;
    const initialMatch = findProduct(productId);

    if (initialMatch) {
      setProduct(initialMatch);
      const defaults = getDefaultSelection(initialMatch);
      setSelectedColor(defaults.color);
      setSelectedSize(defaults.size);
      trackRecentlyViewed(initialMatch.id);
      setIsLoading(false);
    } else {
      setIsLoading(true);
      setProduct(null); // Clear previous product immediately
    }

    // Always fetch fresh dynamic data for this specific product
    storefrontApi
      .product(productId)
      .then((data) => {
        if (!isMounted || !data) return;
        setProduct(data);
        const defaults = getDefaultSelection(data);
        setSelectedColor((prev) => {
          if (prev && availableColors(data).some((c) => c.name.toLowerCase() === prev.toLowerCase())) return prev;
          return defaults.color;
        });
        setSelectedSize((prev) => {
          if (prev && availableSizes(data).some((s) => s.toLowerCase() === prev.toLowerCase())) return prev;
          return defaults.size;
        });
        trackRecentlyViewed(data.id);
        setIsLoading(false);
      })
      .catch((err) => {
        if (!isMounted) return;
        if (!initialMatch) {
          setLoadError(err.message || "Product not found");
          setIsLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [productId, findProduct, trackRecentlyViewed]);

  useEffect(() => {
    const latestProduct = findProduct(productId);
    if (latestProduct) setProduct(latestProduct);
  }, [allProducts, findProduct, productId]);

  // Close Lightbox preview modal on Escape key
  useEffect(() => {
    if (!previewImage) return;
    const handleKeyDown = (e) => {
      if (e.key === "Escape") setPreviewImage(null);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [previewImage]);

  // Resolve one active variant for images, stock, and price alike.
  const currentVariant = useMemo(() => {
    if (!product?.variants || product.variants.length === 0) return null;
    return product.variants.find((v) => {
      const matchColor = !v.color || !selectedColor || v.color.toLowerCase() === selectedColor.toLowerCase();
      const matchSize = !v.size || !selectedSize || v.size.toLowerCase() === selectedSize.toLowerCase();
      return matchColor && matchSize;
    });
  }, [product, selectedColor, selectedSize]);

  // Put the active variant's images first so the selected color/size is visible immediately.
  const galleryImages = useMemo(() => {
    if (!product) return [];
    const productImages = [];
    if (Array.isArray(product.images) && product.images.length > 0) {
      product.images.forEach((img) => {
        if (img && typeof img === "string") productImages.push(img);
        else if (img && typeof img.url === "string") productImages.push(img.url);
      });
    } else if (product.image) {
      productImages.push(product.image);
    }

    const variantImages = [currentVariant?.imageUrl, ...(currentVariant?.galleryImages || [])]
      .filter((image) => typeof image === "string" && image);
    const unique = [...new Set([...variantImages, ...productImages])];
    return unique.length > 0 ? unique : ["/images/photo-1521572163474-6864f9cf17ab.jpg"];
  }, [product, currentVariant]);

  const recentlyViewedProducts = useMemo(
    () => recentlyViewed.filter((p) => String(p.id) !== String(product?.id)).slice(0, 8),
    [recentlyViewed, product]
  );

  const hasVariants = Array.isArray(product?.variants) && product.variants.length > 0;
  const activeStockCount = hasVariants
    ? Number(currentVariant?.stockCount ?? 0)
    : Number(product?.stockCount ?? 0);
  const isOutOfStock = hasVariants
    ? !currentVariant || Number(currentVariant.stockCount ?? 0) <= 0
    : !product?.inStock;
  const activePrice = Number(currentVariant?.priceOverride ?? product?.price ?? 0);
  const displayOriginalPrice = Number(product?.originalPrice ?? 0) > activePrice
    ? Number(product.originalPrice)
    : null;
  const isLowStock = !isOutOfStock && activeStockCount > 0 && activeStockCount <= 5;

  // Clamp quantity if active stock changes or becomes lower
  useEffect(() => {
    if (activeStockCount > 0 && quantity > activeStockCount) {
      setQuantity(activeStockCount);
    }
  }, [activeStockCount, quantity]);

  // Map of unavailable sizes for the currently selected color
  const unavailableSizes = useMemo(() => {
    if (!product?.variants || product.variants.length === 0 || !selectedColor) return new Set();
    const set = new Set();
    availableSizes(product).forEach((s) => {
      const v = product.variants.find(
        (item) =>
          item.size?.toLowerCase() === s.toLowerCase() &&
          item.color?.toLowerCase() === selectedColor.toLowerCase()
      );
      if (!v || Number(v.stockCount ?? 0) <= 0) {
        set.add(s);
      }
    });
    return set;
  }, [product, selectedColor]);

  if (isLoading && !product) {
    return (
      <div className="pd-loading-screen" style={{ minHeight: "60vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ textAlign: "center", color: "var(--color-ink)" }}>
          <div className="pd-spinner" style={{ width: 44, height: 44, border: "3px solid #e5e7eb", borderTopColor: "var(--color-accent, #FAA703)", borderRadius: "50%", margin: "0 auto 16px", animation: "spin 0.8s linear infinite" }} />
          <p style={{ fontSize: 14, fontWeight: 600, color: "var(--color-grey-600)" }}>Loading product details…</p>
        </div>
      </div>
    );
  }

  if (!product && !isLoading) {
    return (
      <div className="pd-not-found">
        <div className="container">
          <h2>Product Not Found</h2>
          <p>{loadError || "The product you are looking for is no longer available."}</p>
          <div className="hero-cta-group" style={{ justifyContent: "center" }}>
            <Link to="/collection" className="btn btn-primary">
              Browse All Products
            </Link>
            <Link to="/" className="btn btn-secondary">
              Return to Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const isSaved = isInWishlist ? isInWishlist(product.id) : wishlist.some((id) => String(id) === String(product.id));
  const discountPct = displayOriginalPrice
    ? Math.round(((displayOriginalPrice - activePrice) / displayOriginalPrice) * 100)
    : null;

  // Determine category page navigation dynamically from real categories
  const catKey = (product.category || "").toLowerCase();
  const matchedCategory = (categories || []).find(
    (c) => c.slug?.toLowerCase() === catKey || (catKey === "mens" && c.slug?.toLowerCase() === "men") || (catKey === "men" && c.slug?.toLowerCase() === "mens")
  );
  const collectionPath = `/collection?category=${encodeURIComponent(matchedCategory?.slug || catKey || "all")}`;
  const formatCollectionLabel = (name) => {
    if (!name) return "Collection";
    const trimmed = name.trim();
    if (trimmed.toLowerCase().endsWith("s")) return `${trimmed}' Collection`;
    return `${trimmed}'s Collection`;
  };
  const collectionLabel = formatCollectionLabel(matchedCategory?.name || (catKey ? catKey.charAt(0).toUpperCase() + catKey.slice(1) : ""));

  const isWomensProduct = catKey === "women" || catKey === "womens";
  const isKidsProduct = ["kids", "boys", "girls", "babies"].includes(catKey);
  const isBabiesProduct = catKey === "babies";

  // Intelligent Color Select: switches to in-stock size if current size isn't available in new color
  const handleColorSelect = (colorName) => {
    setSelectedColor(colorName);
    if (product?.variants?.length) {
      const variantsForColor = product.variants.filter(
        (v) => v.color && v.color.toLowerCase() === colorName.toLowerCase()
      );
      if (variantsForColor.length > 0) {
        const currentSizeHasStock = variantsForColor.some(
          (v) => v.size && v.size.toLowerCase() === selectedSize?.toLowerCase() && Number(v.stockCount ?? 0) > 0
        );
        if (!currentSizeHasStock) {
          const firstInStock = variantsForColor.find((v) => Number(v.stockCount ?? 0) > 0);
          if (firstInStock?.size) {
            setSelectedSize(firstInStock.size);
          } else if (variantsForColor[0]?.size) {
            setSelectedSize(variantsForColor[0].size);
          }
        }
      }
    }
  };

  // Add to Cart handler
  const handleAddToCart = () => {
    if (isOutOfStock) return;
    addToCart(product, selectedColor, selectedSize, quantity);
    setAddedToCart(true);
    setTimeout(() => {
      setAddedToCart(false);
      setIsCartOpen(true);
    }, 500);
  };

  // Instant Buy Now handler
  const handleBuyNow = () => {
    if (isOutOfStock) return;
    addToCart(product, selectedColor, selectedSize, quantity);
    navigate("/checkout");
  };

  // Copy coupon handler
  const handleCopyCoupon = (code) => {
    navigator.clipboard?.writeText(code);
    setCopiedCoupon(code);
    setTimeout(() => setCopiedCoupon(null), 2000);
  };

  // Dynamic Highlights derived from this product's actual information
  const highlights = [
    {
      label: "Silhouette",
      value: (product.subCategory || product.name || "").toLowerCase().includes("oversized")
        ? "Oversized Boxy Fit"
        : (product.subCategory || product.name || "").toLowerCase().includes("polo")
        ? "Classic Tailored Fit"
        : (product.subCategory || product.name || "").toLowerCase().includes("hoodie")
        ? "Relaxed Streetwear Fit"
        : (product.subCategory || product.name || "").toLowerCase().includes("sweatshirt")
        ? "Comfort Streetwear Fit"
        : isBabiesProduct
        ? "Easy-Fit Snug Infant Cut"
        : isKidsProduct
        ? "Kids' Active Comfort Fit"
        : "Relaxed Regular Fit"
    },
    {
      label: "Fabric Composition",
      value: isBabiesProduct
        ? "100% Hypoallergenic Baby-Safe Cotton"
        : isKidsProduct
        ? "100% Super-Soft Bio-Washed Organic Cotton"
        : isWomensProduct
        ? "Soft-Washed Midweight Combed Cotton"
        : (product.subCategory || product.name || "").toLowerCase().includes("hoodie")
        ? "360 GSM Heavyweight French Terry"
        : "240 GSM Pure Combed Cotton"
    },
    {
      label: "Collar / Neckline",
      value: (product.subCategory || product.name || "").toLowerCase().includes("polo")
        ? "Ribbed Knit Polo Collar"
        : (product.subCategory || product.name || "").toLowerCase().includes("high neck")
        ? "Snug Mock High Neck"
        : (product.subCategory || product.name || "").toLowerCase().includes("v-neck")
        ? "Clean Minimalist V-Neck"
        : (product.subCategory || product.name || "").toLowerCase().includes("hoodie")
        ? "Double-Layered Warm Hood"
        : isBabiesProduct
        ? "Envelope / Expandable Soft Ribbed Neck"
        : "Reinforced Crew Neck"
    },
    {
      label: "Sleeve Style",
      value: (product.name || "").toLowerCase().includes("full sleeve") || (product.name || "").toLowerCase().includes("long sleeve")
        ? "Full Length with Ribbed Cuffs"
        : (product.subCategory || product.name || "").toLowerCase().includes("hoodie") || (product.subCategory || product.name || "").toLowerCase().includes("sweatshirt")
        ? "Long Sleeve with Ribbed Cuffs"
        : "Drop-Shoulder Half Sleeve"
    },
    {
      label: "Print & Finish",
      value: isBabiesProduct
        ? "Non-Toxic Skin-Safe Reactive Dye"
        : isWomensProduct
        ? "Colorfast Artistic Pigment Print"
        : "High-Density Screen Print"
    },
    {
      label: "Garment Treatment",
      value: "Pre-Shrunk, Bio-Washed & Colorfast"
    }
  ];

  return (
    <div className="product-detail-page">
      {/* ── Breadcrumb Navigation ─────────────────────────────────── */}
      <div className="pd-breadcrumb-bar">
        <div className="container">
          <nav className="pd-breadcrumb" aria-label="Breadcrumb">
            <Link to="/">Home</Link>
            <span className="pd-sep">/</span>
            <Link to={collectionPath}>{collectionLabel}</Link>
            {product.subCategory && (
              <>
                <span className="pd-sep">/</span>
                <Link to={`/collection?category=${encodeURIComponent(catKey)}&type=${encodeURIComponent(product.subCategory.toLowerCase())}`}>
                  {product.subCategory}
                </Link>
              </>
            )}
            <span className="pd-sep">/</span>
            <span aria-current="page" className="pd-crumb-current">{product.name}</span>
          </nav>
        </div>
      </div>

      {/* ── Main Product Display: Clean Gallery Left + Info Right ── */}
      <section className="pd-main-section">
        <div className="container">
          <div className="pd-layout">
            {/* ── Left: Dual-Image (Two Side-by-Side) Fashion Grid ── */}
            <div className="pd-gallery-col">
              <div className="pd-dual-images-grid">
                {galleryImages.map((img, idx) => (
                  <div
                    key={`${img}-${idx}`}
                    className={`pd-grid-image-item ${galleryImages.length === 1 ? "is-single" : ""}`}
                    onClick={() => setPreviewImage(img)}
                    title="Click to view full resolution"
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => e.key === "Enter" && setPreviewImage(img)}
                  >
                    {idx === 0 && (
                      <>
                        <span className="pd-overlay-badge-top">
                          {product.badge || ((product.subCategory || product.name || "").toLowerCase().includes("oversized") ? "OVERSIZED FIT" : "PREMIUM FIT")}
                        </span>
                        <span className="pd-overlay-badge-bottom">
                          {isBabiesProduct
                            ? "100% ORGANIC COTTON"
                            : isKidsProduct
                            ? "SUPER-SOFT ORGANIC"
                            : isWomensProduct
                            ? "COMBED PURE COTTON"
                            : "240 GSM COMBED COTTON"}
                        </span>
                      </>
                    )}

                    <img
                      src={imageUrl(img)}
                      alt={`${product.name} - view ${idx + 1}`}
                      className="pd-grid-img"
                      loading={idx < 2 ? "eager" : "lazy"}
                      onError={(event) => { event.currentTarget.src = "/images/zmw-logo-transparent.png"; }}
                    />

                    <div className="pd-zoom-hint">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="11" cy="11" r="8" />
                        <line x1="21" y1="21" x2="16.65" y2="16.65" />
                        <line x1="11" y1="8" x2="11" y2="14" />
                        <line x1="8" y1="11" x2="14" y2="11" />
                      </svg>
                      <span>Enlarge</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* ── Right: Product Info & Purchase Form ── */}
            <div className="pd-info-col">
              {/* Category Eyebrow & Title Row */}
              <div className="pd-header-group">
                <span className="pd-category-eyebrow">{product.subCategory}</span>
                <div className="pd-title-row">
                  <h1 className="pd-title">{product.name}</h1>
                  <button
                    type="button"
                    className={`pd-wishlist-icon-btn ${isSaved ? "saved" : ""}`}
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      toggleWishlist(product.id);
                    }}
                    onTouchEnd={(e) => {
                      e.stopPropagation();
                    }}
                    aria-label={isSaved ? "Remove from wishlist" : "Save to wishlist"}
                    title={isSaved ? "Saved to Wishlist" : "Save to Wishlist"}
                  >
                    <svg width="22" height="22" viewBox="0 0 24 24" fill={isSaved ? "var(--color-accent)" : "none"} stroke={isSaved ? "var(--color-accent)" : "var(--color-ink)"} strokeWidth="1.8">
                      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                    </svg>
                  </button>
                </div>

                {/* Rating & SKU */}
                <div className="pd-rating-sku-row">
                  <div className="pd-stars-wrap">
                    <div className="pd-stars">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <svg key={star} width="15" height="15" viewBox="0 0 24 24" fill={star <= Math.round(Number(product.rating || 5)) ? "var(--color-accent)" : "none"} stroke="var(--color-accent)" strokeWidth="1.5">
                          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                        </svg>
                      ))}
                    </div>
                    <span className="pd-rating-val">{product.rating && Number(product.rating) > 0 ? product.rating : "5.0"}</span>
                    <span className="pd-rating-count">({product.reviewCount && Number(product.reviewCount) > 0 ? `${product.reviewCount} customer reviews` : "Verified Collection"})</span>
                  </div>
                  <span className="pd-sku-label">SKU: <strong>{currentVariant?.skuSuffix ? `${product.sku}-${currentVariant.skuSuffix}` : product.sku}</strong></span>
                </div>
              </div>

              {/* Price & Savings Badge */}
              <div className="pd-price-row">
                <span className="pd-price-current">{formatPrice(activePrice)}</span>
                {displayOriginalPrice && (
                  <>
                    <span className="pd-price-original">{formatPrice(displayOriginalPrice)}</span>
                    <span className="pd-discount-chip">SAVE {discountPct}%</span>
                  </>
                )}
              </div>
              <p className="pd-tax-caption">Price inclusive of all taxes. Free express shipping available across India.</p>

              {/* Essential Product Description (Directly Visible) */}
              <div className="pd-main-description-box">
                <p className="pd-main-description-text">{product.description}</p>
              </div>

              {/* Promo Privilege Offers (ZMW Luxury Style) */}
              <div className="pd-offers-wrap">
                <div className="pd-offer-card">
                  <div className="pd-offer-text">
                    <span className="pd-offer-badge">MEMBERS PRIVILEGE</span>
                    <p className="pd-offer-detail">Get ₹830 off on orders over ₹6,225 with coupon</p>
                  </div>
                  <button
                    type="button"
                    className="pd-copy-btn"
                    onClick={() => handleCopyCoupon("ZMW10")}
                  >
                    {copiedCoupon === "ZMW10" ? "COPIED ✓" : "CODE: ZMW10"}
                  </button>
                </div>

                <div className="pd-offer-card">
                  <div className="pd-offer-text">
                    <span className="pd-offer-badge">ATELIER TIER REWARD</span>
                    <p className="pd-offer-detail">Get 15% off on orders over ₹9,960 with coupon</p>
                  </div>
                  <button
                    type="button"
                    className="pd-copy-btn"
                    onClick={() => handleCopyCoupon("ZMW15")}
                  >
                    {copiedCoupon === "ZMW15" ? "COPIED ✓" : "CODE: ZMW15"}
                  </button>
                </div>
              </div>

              {/* Color Selector */}
              {availableColors(product).length > 0 && (
                <div className="pd-selector-block">
                  <span className="pd-selector-heading">
                    Color: <strong>{selectedColor}</strong>
                  </span>
                  <div className="pd-color-swatches">
                    {availableColors(product).map((c) => (
                      <button
                        key={c.name}
                        type="button"
                        className={`pd-color-dot ${selectedColor === c.name ? "active" : ""}`}
                        style={{ backgroundColor: c.hex }}
                        onClick={() => handleColorSelect(c.name)}
                        title={c.name}
                        aria-pressed={selectedColor === c.name}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Size Selector with Size Guide */}
              {availableSizes(product).length > 0 && (
                <div className="pd-selector-block">
                  <div className="pd-size-header">
                    <span className="pd-selector-heading">
                      Select Size: <strong>{selectedSize}</strong>
                    </span>
                    <button
                      type="button"
                      className="pd-size-guide-trigger"
                      onClick={() => setIsSizeGuideOpen(true)}
                    >
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M21.3 15.3l-6.6-6.6a1 1 0 0 0-1.4 0l-10.6 10.6a1 1 0 0 0 0 1.4l4.6 4.6a1 1 0 0 0 1.4 0l12.6-12.6a1 1 0 0 0 0-1.4z" />
                        <path d="M7.5 17.5l2-2" /><path d="M10.5 14.5l2-2" /><path d="M13.5 11.5l2-2" />
                      </svg>
                      Size Chart
                    </button>
                  </div>
                  <div className="pd-size-chips">
                    {availableSizes(product).map((s) => {
                      const isSoldOut = unavailableSizes.has(s);
                      return (
                        <button
                          key={s}
                          type="button"
                          className={`pd-size-chip ${selectedSize === s ? "active" : ""} ${isSoldOut ? "sold-out" : ""}`}
                          onClick={() => setSelectedSize(s)}
                          aria-pressed={selectedSize === s}
                          title={isSoldOut ? `${s} (Out of stock in ${selectedColor || "this color"})` : s}
                        >
                          {s}
                          {isSoldOut && <span className="sold-out-tag">Sold Out</span>}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Quantity Stepper & Dual Action Buttons (Add to Cart + Buy Now) */}
              <div className="pd-cta-action-group">
                <div className="pd-qty-wrapper">
                  <span className="pd-qty-title">Quantity</span>
                  <div className="pd-quantity-stepper">
                    <button
                      type="button"
                      className="pd-qty-btn"
                      onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                      disabled={quantity <= 1 || isOutOfStock}
                      aria-label="Decrease quantity"
                    >
                      −
                    </button>
                    <span className="pd-qty-display">{isOutOfStock ? 0 : quantity}</span>
                    <button
                      type="button"
                      className="pd-qty-btn"
                      onClick={() => setQuantity((q) => Math.min(activeStockCount || 99, q + 1))}
                      disabled={isOutOfStock || (activeStockCount > 0 && quantity >= activeStockCount)}
                      aria-label="Increase quantity"
                    >
                      +
                    </button>
                  </div>
                </div>

                <div className="pd-buttons-stack">
                  {/* Add to Cart Button */}
                  <button
                    type="button"
                    className={`btn pd-add-to-cart-btn ${addedToCart ? "added" : ""}`}
                    onClick={handleAddToCart}
                    disabled={isOutOfStock}
                  >
                    {isOutOfStock ? (
                      <span>Out of Stock</span>
                    ) : addedToCart ? (
                      <>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                        Added to Cart ✓
                      </>
                    ) : (
                      <>Add to Cart</>
                    )}
                  </button>

                  {/* Buy Now Button (Instant Checkout) */}
                  <button
                    type="button"
                    className="btn btn-primary pd-buy-now-btn"
                    onClick={handleBuyNow}
                    disabled={isOutOfStock}
                  >
                    {isOutOfStock
                      ? "Currently Sold Out"
                      : `Buy It Now • ${formatPrice(activePrice * quantity)}`}
                  </button>
                </div>
              </div>

              {/* Delivery & In-Stock Availability Box */}
              <div className="pd-availability-box">
                <div
                  className={`pd-stock-badge ${
                    isOutOfStock ? "out-of-stock" : isLowStock ? "low-stock" : "in-stock"
                  }`}
                >
                  <span className="pd-stock-indicator-dot" />
                  <span>
                    {isOutOfStock
                      ? "Currently Out of Stock — Restock in progress"
                      : isLowStock
                      ? `Low Stock — Only ${activeStockCount} units remaining. Order soon!`
                      : `In Stock — Ready to ship (${activeStockCount} units available)`}
                  </span>
                </div>

                <div className="pd-delivery-perks">
                  <div className="pd-perk-row">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="1" y="3" width="15" height="13" />
                      <polygon points="16 8 20 8 23 11 23 16 16 16 16 8" />
                      <circle cx="5.5" cy="18.5" r="2.5" />
                      <circle cx="18.5" cy="18.5" r="2.5" />
                    </svg>
                    <span><strong>Estimated Delivery:</strong> 3 – 5 Business Days with tracking</span>
                  </div>
                  <div className="pd-perk-row">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                    </svg>
                    <span><strong>Doorstep Delivery & 14-Day Returns:</strong> Hassle-free exchanges</span>
                  </div>
                </div>
              </div>

              {/* Product Specifications Table */}
              <div className="pd-specifications-card">
                <h3 className="pd-spec-title">Product Details & Specifications</h3>
                <div className="pd-spec-grid">
                  {highlights.map((h) => (
                    <div key={h.label} className="pd-spec-cell">
                      <span className="pd-spec-key">{h.label}</span>
                      <span className="pd-spec-val">{h.value}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Expandable Accordion Tabs */}
              <div className="pd-accordion-container">
                {/* Details & Cut */}
                <div className={`pd-acc-row ${openAccordions.desc ? "open" : ""}`}>
                  <button
                    type="button"
                    className="pd-acc-btn"
                    onClick={() => toggleAccordion("desc")}
                    aria-expanded={openAccordions.desc}
                  >
                    <span>Detailed Garment Cut & Fit</span>
                    <svg className="pd-acc-arrow" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="6 9 12 15 18 9" />
                    </svg>
                  </button>
                  {openAccordions.desc && (
                    <div className="pd-acc-content">
                      <p>
                        Engineered with drop-shoulder tailoring, generous chest allowance, and reinforced
                        ribbed crewneck collar. Cut boxy through the torso to provide structured modern streetwear
                        drape without clinging.
                      </p>
                    </div>
                  )}
                </div>

                {/* Fabric & Care */}
                <div className={`pd-acc-row ${openAccordions.care ? "open" : ""}`}>
                  <button
                    type="button"
                    className="pd-acc-btn"
                    onClick={() => toggleAccordion("care")}
                    aria-expanded={openAccordions.care}
                  >
                    <span>Fabric Composition & Washing Care</span>
                    <svg className="pd-acc-arrow" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="6 9 12 15 18 9" />
                    </svg>
                  </button>
                  {openAccordions.care && (
                    <div className="pd-acc-content">
                      <ul className="pd-care-checklist">
                        <li>100% Combed Long-Staple Cotton, 240 GSM double-jersey knit.</li>
                        <li>Machine wash cold (below 30°C / 85°F) inside-out on gentle cycle.</li>
                        <li>Do not bleach or tumble dry on high heat. Line dry in shade.</li>
                        <li>Iron inside-out on medium heat; avoid direct contact with graphics.</li>
                      </ul>
                    </div>
                  )}
                </div>

                {/* Shipping & Delivery */}
                <div className={`pd-acc-row ${openAccordions.shipping ? "open" : ""}`}>
                  <button
                    type="button"
                    className="pd-acc-btn"
                    onClick={() => toggleAccordion("shipping")}
                    aria-expanded={openAccordions.shipping}
                  >
                    <span>Shipping, Delivery & Returns Policy</span>
                    <svg className="pd-acc-arrow" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="6 9 12 15 18 9" />
                    </svg>
                  </button>
                  {openAccordions.shipping && (
                    <div className="pd-acc-content">
                      <p>
                        All orders are carefully inspected and dispatched within 24 hours from our atelier.
                        We offer a 14-day return and exchange policy on unwashed, unworn items with tags intact.
                        Reverse pickup is automatically scheduled at your address.
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Luxury Trust Pillars */}
              <div className="pd-trust-pillars-row">
                <div className="pd-pillar-card">
                  <div className="pd-pillar-icon">
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                    </svg>
                  </div>
                  <div className="pd-pillar-meta">
                    <strong>100% Genuine</strong>
                    <span>Atelier Crafted</span>
                  </div>
                </div>

                <div className="pd-pillar-card">
                  <div className="pd-pillar-icon">
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                      <polyline points="1 4 1 10 7 10" />
                      <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10" />
                    </svg>
                  </div>
                  <div className="pd-pillar-meta">
                    <strong>14-Day Returns</strong>
                    <span>Doorstep Pickup</span>
                  </div>
                </div>

                <div className="pd-pillar-card">
                  <div className="pd-pillar-icon">
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                    </svg>
                  </div>
                  <div className="pd-pillar-meta">
                    <strong>Secure Checkout</strong>
                    <span>Encrypted Payment</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Recently Viewed Products Section ──────────────────────── */}
      {recentlyViewedProducts.length > 0 && (
        <section className="section-padding pd-recently-viewed-section">
          <div className="container">
            <div className="section-header">
              <span className="section-eyebrow">RECENTLY VIEWED</span>
              <h2 className="section-title">Explore More Pieces</h2>
              <p className="section-subtitle">
                Heavyweight staples and contemporary tailoring crafted for longevity.
              </p>
            </div>
            <div className="product-grid">
              {recentlyViewedProducts.map((p) => (
                <ProductCard key={`recent-${p.id}`} product={p} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── Interactive Size Guide Modal ────────────────────────────── */}
      <SizeGuideModal
        isOpen={isSizeGuideOpen}
        onClose={() => setIsSizeGuideOpen(false)}
        selectedSize={selectedSize}
      />

      {/* ── Interactive Image Preview Modal (Lightbox) ─────────────── */}
      {previewImage && (
        <div className="pd-modal-overlay" onClick={() => setPreviewImage(null)}>
          <div className="pd-lightbox-modal" onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              className="pd-lightbox-close"
              onClick={() => setPreviewImage(null)}
              aria-label="Close image preview"
            >
              ✕
            </button>
            {galleryImages.length > 1 && (
              <>
                <button
                  type="button"
                  className="pd-lightbox-arrow pd-lightbox-prev"
                  onClick={(e) => {
                    e.stopPropagation();
                    const curIdx = galleryImages.indexOf(previewImage);
                    const prevIdx = curIdx > 0 ? curIdx - 1 : galleryImages.length - 1;
                    setPreviewImage(galleryImages[prevIdx]);
                  }}
                  aria-label="Previous image"
                >
                  ‹
                </button>
                <button
                  type="button"
                  className="pd-lightbox-arrow pd-lightbox-next"
                  onClick={(e) => {
                    e.stopPropagation();
                    const curIdx = galleryImages.indexOf(previewImage);
                    const nextIdx = curIdx < galleryImages.length - 1 ? curIdx + 1 : 0;
                    setPreviewImage(galleryImages[nextIdx]);
                  }}
                  aria-label="Next image"
                >
                  ›
                </button>
              </>
            )}
            <img src={imageUrl(previewImage)} alt={`${product.name} enlarged`} className="pd-lightbox-img" />
          </div>
        </div>
      )}
    </div>
  );
}
