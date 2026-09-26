import { useState, useMemo, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useShop } from "../context/ShopContext";
import ProductCard from "../components/ProductCard/ProductCard";
import SizeGuideModal from "../components/Modals/SizeGuideModal";
import { imageUrl } from "../utils/imageUrl";
import { storefrontApi } from "../services/storefrontApi";
import "./ProductDetail.css";

export default function ProductDetail() {
  const { productId } = useParams();
  const navigate = useNavigate();
  const {
    formatPrice,
    addToCart,
    wishlist,
    toggleWishlist,
    setIsCartOpen,
    allProducts,
    findProduct,
    recentlyViewed,
    trackRecentlyViewed
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
      setSelectedColor(initialMatch.colors?.[0]?.name ?? "Standard");
      setSelectedSize(initialMatch.sizes?.[1] || initialMatch.sizes?.[0] || "M");
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
        setSelectedColor((prev) => {
          if (prev && data.colors?.some((c) => c.name === prev)) return prev;
          return data.colors?.[0]?.name ?? "Standard";
        });
        setSelectedSize((prev) => {
          if (prev && data.sizes?.includes(prev)) return prev;
          return data.sizes?.[1] || data.sizes?.[0] || "M";
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

  // Build clean, accurate gallery images using ONLY this product's actual images
  const galleryImages = useMemo(() => {
    if (!product) return [];
    const imgs = [];
    if (Array.isArray(product.images) && product.images.length > 0) {
      product.images.forEach((img) => {
        if (img && typeof img === "string") imgs.push(img);
        else if (img && typeof img.url === "string") imgs.push(img.url);
      });
    } else if (product.image) {
      imgs.push(product.image);
    }

    const unique = [...new Set(imgs)].filter(Boolean);
    if (unique.length === 0) {
      return ["/images/photo-1521572163474-6864f9cf17ab.jpg"];
    }
    return unique;
  }, [product]);

  const recentlyViewedProducts = useMemo(
    () => recentlyViewed.filter((p) => String(p.id) !== String(product?.id)).slice(0, 8),
    [recentlyViewed, product]
  );

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
            <Link to="/collection?category=mens" className="btn btn-primary">
              Browse Mens' Collection
            </Link>
            <Link to="/collection?category=women" className="btn btn-secondary">
              Browse Women's Collection
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const isSaved = wishlist.includes(product.id);
  const discountPct = product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : null;

  // Determine category page navigation
  const CATEGORY_COLLECTION = {
    mens: { path: "/collection?category=mens", label: "Mens' Collection" },
    boys: { path: "/collection?category=boys", label: "Boys' Collection" },
    girls: { path: "/collection?category=girls", label: "Girls' Collection" },
    babies: { path: "/collection?category=babies", label: "Babies' Collection" },
    women: { path: "/collection?category=women", label: "Women's Collection" },
    kids: { path: "/collection?category=kids", label: "Kids' Collection" },
    men: { path: "/collection?category=mens", label: "Mens' Collection" }
  };
  const catKey = (product.category || "mens").toLowerCase();
  const catMeta = CATEGORY_COLLECTION[catKey] || CATEGORY_COLLECTION.mens;
  const collectionPath = catMeta.path;
  const collectionLabel = catMeta.label;

  const isWomensProduct = catKey === "women";
  const isKidsProduct = ["kids", "boys", "girls", "babies"].includes(catKey);
  const isBabiesProduct = catKey === "babies";

  // Add to Cart handler
  const handleAddToCart = () => {
    addToCart(product, selectedColor, selectedSize, quantity);
    setAddedToCart(true);
    setTimeout(() => {
      setAddedToCart(false);
      setIsCartOpen(true);
    }, 500);
  };

  // Instant Buy Now handler
  const handleBuyNow = () => {
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
            {/* ── Left: Dynamic High-Quality Product Image Gallery ── */}
            <div className="pd-gallery-col">
              <div className={`pd-image-grid-2x2 pd-gallery-count-${galleryImages.length}`}>
                {galleryImages.map((img, idx) => (
                  <div
                    key={`${img}-${idx}`}
                    className={`pd-grid-item pd-grid-item-${idx} ${galleryImages.length === 1 ? "pd-grid-single" : ""}`}
                    onClick={() => setPreviewImage(img)}
                    title="Click to view high-resolution image"
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
                    onClick={() => toggleWishlist(product.id)}
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
                  <div className="pd-stars">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <svg key={star} width="15" height="15" viewBox="0 0 24 24" fill={star <= Math.round(product.rating) ? "var(--color-accent)" : "none"} stroke="var(--color-accent)" strokeWidth="1.5">
                        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                      </svg>
                    ))}
                    <span className="pd-rating-val">{product.rating}</span>
                    <span className="pd-rating-count">({product.reviewCount} customer reviews)</span>
                  </div>
                  <span className="pd-sku-label">SKU: <strong>{product.sku}</strong></span>
                </div>
              </div>

              {/* Price & Savings Badge */}
              <div className="pd-price-row">
                <span className="pd-price-current">{formatPrice(product.price)}</span>
                {product.originalPrice && (
                  <>
                    <span className="pd-price-original">{formatPrice(product.originalPrice)}</span>
                    <span className="pd-discount-chip">SAVE {discountPct || 35}%</span>
                  </>
                )}
              </div>
              <p className="pd-tax-caption">Price inclusive of all taxes. Free express shipping on orders over ₹4,150.</p>

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
              {product.colors && product.colors.length > 0 && (
                <div className="pd-selector-block">
                  <span className="pd-selector-heading">
                    Color: <strong>{selectedColor}</strong>
                  </span>
                  <div className="pd-color-swatches">
                    {product.colors.map((c) => (
                      <button
                        key={c.name}
                        type="button"
                        className={`pd-color-dot ${selectedColor === c.name ? "active" : ""}`}
                        style={{ backgroundColor: c.hex }}
                        onClick={() => setSelectedColor(c.name)}
                        title={c.name}
                        aria-pressed={selectedColor === c.name}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Size Selector with Size Guide */}
              {product.sizes && product.sizes.length > 0 && (
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
                    {product.sizes.map((s) => (
                      <button
                        key={s}
                        type="button"
                        className={`pd-size-chip ${selectedSize === s ? "active" : ""}`}
                        onClick={() => setSelectedSize(s)}
                        aria-pressed={selectedSize === s}
                      >
                        {s}
                      </button>
                    ))}
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
                      disabled={quantity <= 1}
                      aria-label="Decrease quantity"
                    >
                      −
                    </button>
                    <span className="pd-qty-display">{quantity}</span>
                    <button
                      type="button"
                      className="pd-qty-btn"
                      onClick={() => setQuantity((q) => q + 1)}
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
                    disabled={!product.inStock}
                  >
                    {addedToCart ? (
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
                    disabled={!product.inStock}
                  >
                    Buy It Now • {formatPrice(product.price * quantity)}
                  </button>
                </div>
              </div>

              {/* Delivery & In-Stock Availability Box */}
              <div className="pd-availability-box">
                <div className={`pd-stock-badge ${product.inStock ? "in-stock" : "out-of-stock"}`}>
                  <span className="pd-stock-indicator-dot" />
                  <span>
                    {product.inStock
                      ? `In Stock — Ready to ship (${product.stockCount || 18} units remaining)`
                      : "Currently Out of Stock — Restock in progress"}
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
                    <span><strong>Free Shipping & 14-Day Returns:</strong> Hassle-free doorstep exchanges</span>
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
            <img src={imageUrl(previewImage)} alt={`${product.name} enlarged`} className="pd-lightbox-img" />
          </div>
        </div>
      )}
    </div>
  );
}
