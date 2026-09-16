import React, { useMemo, useState, useEffect, useRef } from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import { useShop } from "../context/ShopContext";
import { UNIFIED_PRODUCTS } from "../data/products";
import ProductCard from "../components/ProductCard/ProductCard";
import RecentlyViewed from "../components/RecentlyViewed/RecentlyViewed";
import TrustFeatures from "../components/TrustFeatures/TrustFeatures";
import "../components/Hero/Hero.css";
import "./Collection.css";

const SORT_OPTIONS = [
  { value: "featured", label: "Featured" },
  { value: "relevant", label: "Most relevant" },
  { value: "best-selling", label: "Best selling" },
  { value: "alpha-asc", label: "Alphabetically, A-Z" },
  { value: "alpha-desc", label: "Alphabetically, Z-A" },
  { value: "price-asc", label: "Price, low to high" },
  { value: "price-desc", label: "Price, high to low" },
  { value: "date-asc", label: "Date, old to new" },
  { value: "date-desc", label: "Date, new to old" }
];


const INITIAL_PAGE_SIZE = 12;

const CATEGORY_ALIASES = { men: "mens" };

const BANNER_CONFIG = {
  mens: {
    image: "/images/banner-mens.jpg",
    imagePosition: "center center",
    tag: "MENS' EDIT · EVERYDAY ESSENTIALS",
    badgePromo: "STARTING AT ₹899 · CODE ZMW200",
    title: "Round Necks, Polos & Hoodies.",
    subtitle: "Heavyweight cotton tees, crisp polos, and premium hoodies cut for a clean, modern everyday fit.",
    primaryText: "Shop the Collection",
    primaryHash: "#collection-catalog",
    secondaryText: "Shop Best Sellers",
    secondaryLink: "/collection?collection=best-sellers"
  },
  boys: {
    image: "/images/banner-boys.jpg",
    imagePosition: "center center",
    tag: "BOYS' EDIT · PLAYFUL ESSENTIALS",
    badgePromo: "STARTING AT ₹599 · FREE SHIPPING",
    title: "Built For Play, Made To Last.",
    subtitle: "Round necks, high necks, shorts, sweatshirts and hoodies in super-soft organic cotton.",
    primaryText: "Shop the Collection",
    primaryHash: "#collection-catalog",
    secondaryText: "Shop Girl's Edit",
    secondaryLink: "/collection?category=girls"
  },
  girls: {
    image: "/images/banner-girls.jpg",
    imagePosition: "center center",
    tag: "GIRLS' EDIT · SWEET ESSENTIALS",
    badgePromo: "STARTING AT ₹599 · FLAT ₹200 OFF",
    title: "Fresh & Playful, Comfort First.",
    subtitle: "Round necks, high necks, shorts, nightwear and long gowns in breathable soft cotton.",
    primaryText: "Shop the Collection",
    primaryHash: "#collection-catalog",
    secondaryText: "Shop Boys' Edit",
    secondaryLink: "/collection?category=boys"
  },
  babies: {
    image: "/images/banner-babies.jpg",
    imagePosition: "center center",
    tag: "BABIES' EDIT · TINY & SOFT",
    badgePromo: "STARTING AT ₹449 · CODE ZMW10",
    title: "Gentle Layers, Made For Baby.",
    subtitle: "Rompers, tees, pyjamas, sweatshirts, hoodies and bottoms in buttery-soft baby-safe cotton.",
    primaryText: "Shop the Collection",
    primaryHash: "#collection-catalog",
    secondaryText: "Shop Girl's Edit",
    secondaryLink: "/collection?category=girls"
  },
  women: {
    image: "/images/banner-womens.jpg",
    imagePosition: "center center",
    tag: "WOMEN'S EDIT · CONTEMPORARY TEES",
    badgePromo: "STARTING AT ₹799 · FLAT 10% OFF",
    title: "Artistic Prints, Deliberately Styled.",
    subtitle: "Chic relaxed fits, breathable combed cotton, and modern minimalist artwork.",
    primaryText: "Shop the Collection",
    primaryHash: "#collection-catalog",
    secondaryText: "Shop Best Sellers",
    secondaryLink: "/collection?collection=best-sellers"
  },
  kids: {
    image: "/images/banner-kids.jpg",
    imagePosition: "center center",
    tag: "KIDS' EDIT · PLAYFUL ESSENTIALS",
    badgePromo: "STARTING AT ₹499 · FREE SHIPPING",
    title: "Built For Play, Made To Last.",
    subtitle: "Super-soft 100% organic cotton, cheerful artwork, and all-day comfort.",
    primaryText: "Shop the Collection",
    primaryHash: "#collection-catalog",
    secondaryText: "Shop Best Sellers",
    secondaryLink: "/collection?collection=best-sellers"
  },
  "best-sellers": {
    image: "/images/hero-mens-tshirt-banner-2.jpg",
    imagePosition: "center 20%",
    tag: "HAND-PICKED FAVOURITES · COMMUNITY TOP PICKS",
    badgePromo: "TOP RATED · BEST LOVED",
    title: "The Ones Everyone's Talking About.",
    subtitle: "Curated from real reviews, real wears, and real bestselling data across our full catalogue.",
    primaryText: "Shop Best Sellers",
    primaryHash: "#collection-catalog",
    secondaryText: "Explore New Arrivals",
    secondaryLink: "/collection?collection=new-arrivals"
  },
  "new-arrivals": {
    image: "/images/hero-mens-tshirt-banner-3.jpg",
    imagePosition: "center 20%",
    tag: "FRESH DROP · JUST LANDED",
    badgePromo: "NEW SEASON · NEW DROPS",
    title: "New Season, New Drops.",
    subtitle: "First to the edit — our latest styles, just off the press and into your wardrobe.",
    primaryText: "Shop New Arrivals",
    primaryHash: "#collection-catalog",
    secondaryText: "Explore Best Sellers",
    secondaryLink: "/collection?collection=best-sellers"
  },
  default: {
    image: "/images/hero-mens-oversized-tee.jpg",
    imagePosition: "center 20%",
    tag: "ZMW STORE · ALL COLLECTIONS",
    badgePromo: "ONE STORE · EVERY STYLE",
    title: "One Store, Every Style.",
    subtitle: "Mens, Boys, Girls, Babies — all of ZMW's finest essentials in one unified catalogue.",
    primaryText: "Explore All",
    primaryHash: "#collection-catalog",
    secondaryText: "Best Sellers",
    secondaryLink: "/collection?collection=best-sellers"
  }
};

function GridIcon({ columns }) {
  const configs = {
    2: { rects: [0, 12], w: 8 },
    3: { rects: [0, 8, 16], w: 5 },
    4: { rects: [0, 6, 12, 18], w: 3.5 },
  };
  const { rects, w } = configs[columns];
  return (
    <svg className="coll-grid-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <g className="icon-inactive">
        {rects.map((x, i) => (
          <rect key={i} x={x + 1} y="3" width={w} height="18" rx="1.5" fill="#94A3B8" />
        ))}
      </g>
      <g className="icon-active">
        {rects.map((x, i) => (
          <rect key={i} x={x + 1} y="3" width={w} height="18" rx="1.5" fill="#fff" />
        ))}
      </g>
    </svg>
  );
}

export default function Collection() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { currency, currencies } = useShop();

  const rate = (currencies && currencies[currency]?.rate) || 83;
  const currencySymbol = (currencies && currencies[currency]?.symbol) || "₹";

  const priceCeiling = useMemo(
    () => Math.ceil(Math.max(...UNIFIED_PRODUCTS.map((p) => p.price * rate)) / 100) * 100,
    [rate]
  );

  const rawCategoryParam = (searchParams.get("category") || "all").toLowerCase();
  const categoryParam = CATEGORY_ALIASES[rawCategoryParam] || rawCategoryParam;
  const collectionParam = (searchParams.get("collection") || "all").toLowerCase();
  const typeParam = (searchParams.get("type") || "all").toLowerCase();
  const colorParam = searchParams.getAll("color");
  const sizeParam = searchParams.getAll("size");
  const availabilityParam = searchParams.get("availability") || "all";
  const minPriceParam = searchParams.get("minPrice") ? Number(searchParams.get("minPrice")) : 0;
  const maxPriceParam = searchParams.get("maxPrice") ? Number(searchParams.get("maxPrice")) : priceCeiling;
  const sortParam = searchParams.get("sort") || (collectionParam === "best-sellers" ? "best-selling" : collectionParam === "new-arrivals" ? "newest" : "featured");

  const [openSections, setOpenSections] = useState({ price: true, color: true, size: true, availability: true });
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);
  const [visibleCount, setVisibleCount] = useState(INITIAL_PAGE_SIZE);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [gridCols, setGridCols] = useState(4);
  const [isSortOpen, setIsSortOpen] = useState(false);
  const sortRef = useRef(null);

  const currentSortOption = useMemo(() => {
    return SORT_OPTIONS.find((opt) => opt.value === sortParam) || SORT_OPTIONS[0];
  }, [sortParam]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (sortRef.current && !sortRef.current.contains(e.target)) {
        setIsSortOpen(false);
      }
    };
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        setIsSortOpen(false);
      }
    };
    if (isSortOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("touchstart", handleClickOutside);
      document.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isSortOpen]);

  useEffect(() => {
    document.body.style.overflow = isMobileDrawerOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [isMobileDrawerOpen]);

  useEffect(() => {
    setVisibleCount(INITIAL_PAGE_SIZE);
  }, [searchParams]);

  const bannerKey = collectionParam !== "all" ? collectionParam : categoryParam !== "all" ? categoryParam : "default";
  const banner = BANNER_CONFIG[bannerKey] || BANNER_CONFIG.default;

  const updateParams = (updates) => {
    const next = new URLSearchParams(searchParams);
    Object.entries(updates).forEach(([key, val]) => {
      if (val === null || val === undefined || val === "" || val === "all") {
        next.delete(key);
      } else if (Array.isArray(val)) {
        next.delete(key);
        val.forEach((item) => { if (item) next.append(key, item); });
      } else {
        next.set(key, val);
      }
    });
    setSearchParams(next);
  };

  const toggleArrayParam = (key, item) => {
    const current = searchParams.getAll(key);
    const updated = current.includes(item) ? current.filter((x) => x !== item) : [...current, item];
    updateParams({ [key]: updated });
  };

  const clearAllFilters = () => {
    const next = new URLSearchParams();
    if (categoryParam !== "all") next.set("category", categoryParam);
    if (collectionParam !== "all") next.set("collection", collectionParam);
    if (typeParam !== "all") next.set("type", typeParam);
    setSearchParams(next);
  };
  const toggleSection = (key) => setOpenSections((prev) => ({ ...prev, [key]: !prev[key] }));

  const matchesCategory = (p) => {
    if (categoryParam === "all") return true;
    if (categoryParam === "kids") return p.category === "boys" || p.category === "girls";
    return p.category === categoryParam;
  };

  const baseCategoryProducts = useMemo(() => {
    return UNIFIED_PRODUCTS.filter(matchesCategory);
  }, [categoryParam]);

  const availableColors = useMemo(() => {
    const map = new Map();
    baseCategoryProducts.forEach((p) => {
      (p.colors || p.color || []).forEach((c) => {
        if (!map.has(c.name)) map.set(c.name, { ...c, count: 0 });
        map.get(c.name).count += 1;
      });
    });
    return Array.from(map.values()).sort((a, b) => b.count - a.count);
  }, [baseCategoryProducts]);

  const availableSizes = useMemo(() => {
    const map = new Map();
    baseCategoryProducts.forEach((p) => {
      (p.sizes || []).forEach((s) => {
        map.set(s, (map.get(s) || 0) + 1);
      });
    });
    const order = ["XS", "S", "M", "L", "XL", "XXL", "3XL", "0-1Y", "1-2Y", "2-3Y", "3-4Y", "4-5Y", "5-6Y", "6-7Y", "7-8Y", "38R", "40R", "42R", "44R"];
    return Array.from(map.entries())
      .map(([size, count]) => ({ name: size, count }))
      .sort((a, b) => {
        const iA = order.indexOf(a.name);
        const iB = order.indexOf(b.name);
        if (iA !== -1 && iB !== -1) return iA - iB;
        return a.name.localeCompare(b.name);
      });
  }, [baseCategoryProducts]);

  const toggleAvailability = (val) => {
    if (availabilityParam === val) {
      updateParams({ availability: "all" });
    } else {
      updateParams({ availability: val });
    }
  };

  const inStockCount = useMemo(() => baseCategoryProducts.filter((p) => p.inStock).length, [baseCategoryProducts]);
  const outOfStockCount = baseCategoryProducts.length - inStockCount;

  const filteredProducts = useMemo(() => {
    let list = UNIFIED_PRODUCTS.filter((p) => {
      if (categoryParam !== "all" && !matchesCategory(p)) return false;
      if (collectionParam === "best-sellers" && !p.isBestSeller) return false;
      if (collectionParam === "new-arrivals" && !p.isNewArrival) return false;
      if (typeParam !== "all") {
        const sub = (p.subCategory || "").toLowerCase();
        if (!(p.productType || "").toLowerCase().includes(typeParam) && !sub.includes(typeParam)) return false;
      }
      if (colorParam.length > 0) {
        const pColors = (p.colors || p.color || []).map((c) => c.name.toLowerCase());
        if (!colorParam.some((col) => pColors.includes(col.toLowerCase()))) return false;
      }
      if (sizeParam.length > 0) {
        if (!sizeParam.some((s) => (p.sizes || []).includes(s))) return false;
      }
      if (availabilityParam === "inStock" && !p.inStock) return false;
      if (availabilityParam === "outOfStock" && p.inStock) return false;
      const pPrice = Math.round(p.price * rate);
      if (pPrice < minPriceParam || pPrice > maxPriceParam) return false;
      return true;
    });
    switch (sortParam) {
      case "price-asc":
        list = [...list].sort((a, b) => a.price - b.price);
        break;
      case "price-desc":
        list = [...list].sort((a, b) => b.price - a.price);
        break;
      case "alpha-asc":
        list = [...list].sort((a, b) => (a.name || a.title || "").localeCompare(b.name || b.title || ""));
        break;
      case "alpha-desc":
        list = [...list].sort((a, b) => (b.name || b.title || "").localeCompare(a.name || a.title || ""));
        break;
      case "date-asc":
        list = [...list].sort((a, b) => {
          const dA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
          const dB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
          return dA - dB;
        });
        break;
      case "date-desc":
      case "newest":
        list = [...list].sort((a, b) => {
          if (b.isNewArrival !== a.isNewArrival) return b.isNewArrival ? 1 : -1;
          const dA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
          const dB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
          return dB - dA;
        });
        break;
      case "best-selling":
        list = [...list].sort((a, b) => {
          if (b.isBestSeller !== a.isBestSeller) return b.isBestSeller ? 1 : -1;
          return (b.reviewCount || 0) - (a.reviewCount || 0);
        });
        break;
      case "relevant":
        list = [...list].sort((a, b) => {
          const rB = (b.rating || 0) * 10 + (b.reviewCount || 0);
          const rA = (a.rating || 0) * 10 + (a.reviewCount || 0);
          return rB - rA;
        });
        break;
      case "featured":
      default:
        list = [...list].sort((a, b) => {
          const sB = (b.isBestSeller ? 2 : 0) + (b.isNewArrival ? 1 : 0);
          const sA = (a.isBestSeller ? 2 : 0) + (a.isNewArrival ? 1 : 0);
          if (sB !== sA) return sB - sA;
          return (b.reviewCount || 0) - (a.reviewCount || 0);
        });
        break;
    }
    return list;
  }, [categoryParam, collectionParam, typeParam, colorParam, sizeParam, availabilityParam, minPriceParam, maxPriceParam, sortParam, rate]);

  const activeFiltersCount = useMemo(() => {
    let count = 0;
    count += colorParam.length + sizeParam.length;
    if (availabilityParam !== "all") count += 1;
    if (minPriceParam > 0 || maxPriceParam < priceCeiling) count += 1;
    return count;
  }, [colorParam, sizeParam, availabilityParam, minPriceParam, maxPriceParam, priceCeiling]);

  const displayedProducts = useMemo(() => filteredProducts.slice(0, visibleCount), [filteredProducts, visibleCount]);

  const handleLoadMore = () => {
    setIsLoadingMore(true);
    setTimeout(() => { setVisibleCount((prev) => prev + INITIAL_PAGE_SIZE); setIsLoadingMore(false); }, 350);
  };

  const progressPercentage = Math.min(100, Math.round((displayedProducts.length / Math.max(1, filteredProducts.length)) * 100));

  const SectionCaret = ({ sectionKey }) => (
    <svg
      className={"coll-accordion-caret" + (openSections[sectionKey] ? " open" : "")}
      width="10"
      height="10"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.4"
      aria-hidden="true"
    >
      <polyline points="6 9 12 15 18 9" />
    </svg>
  );

  const renderFilterWidgets = () => (
    <>
      {/* 1. Price */}
      <div className="coll-sidebar-section">
        <button type="button" className="coll-sidebar-heading" onClick={() => toggleSection("price")}>
          <span>Price</span>
          <div className="coll-heading-right">
            {(minPriceParam > 0 || maxPriceParam < priceCeiling) && (
              <span className="coll-heading-badge">1</span>
            )}
            <SectionCaret sectionKey="price" />
          </div>
        </button>
        {openSections.price && (
          <div className="coll-price-filter">
            <div className="coll-dual-slider-wrap">
              <div className="coll-slider-track" />
              <div
                className="coll-slider-fill"
                style={{
                  left: `${priceCeiling > 0 ? (minPriceParam / priceCeiling) * 100 : 0}%`,
                  right: `${priceCeiling > 0 ? Math.max(0, 100 - (maxPriceParam / priceCeiling) * 100) : 0}%`
                }}
              />
              <input
                type="range"
                min={0}
                max={priceCeiling}
                step={50}
                value={minPriceParam}
                onChange={(e) => {
                  const val = Math.min(Number(e.target.value), maxPriceParam - 50);
                  updateParams({ minPrice: Math.max(0, val) });
                }}
                className="coll-range-thumb coll-range-min"
                aria-label="Minimum price range"
              />
              <input
                type="range"
                min={0}
                max={priceCeiling}
                step={50}
                value={maxPriceParam}
                onChange={(e) => {
                  const val = Math.max(Number(e.target.value), minPriceParam + 50);
                  updateParams({ maxPrice: Math.min(priceCeiling, val) });
                }}
                className="coll-range-thumb coll-range-max"
                aria-label="Maximum price range"
              />
            </div>

            <div className="coll-price-inputs-row">
              <div className="coll-price-box">
                <span className="coll-price-prefix">{currencySymbol}</span>
                <input
                  type="number"
                  min={0}
                  max={maxPriceParam}
                  value={minPriceParam}
                  className="coll-price-input"
                  aria-label="Minimum price input"
                  onChange={(e) => updateParams({ minPrice: Math.max(0, Number(e.target.value)) })}
                />
              </div>
              <span className="coll-price-sep">–</span>
              <div className="coll-price-box">
                <span className="coll-price-prefix">{currencySymbol}</span>
                <input
                  type="number"
                  min={minPriceParam}
                  max={priceCeiling}
                  value={maxPriceParam}
                  className="coll-price-input"
                  aria-label="Maximum price input"
                  onChange={(e) => updateParams({ maxPrice: Math.min(priceCeiling, Number(e.target.value)) })}
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 2. Color */}
      {availableColors.length > 0 && (
        <div className="coll-sidebar-section">
          <button type="button" className="coll-sidebar-heading" onClick={() => toggleSection("color")}>
            <span>Color</span>
            <div className="coll-heading-right">
              {colorParam.length > 0 && <span className="coll-heading-badge">{colorParam.length}</span>}
              <SectionCaret sectionKey="color" />
            </div>
          </button>
          {openSections.color && (
            <ul className="coll-ref-list coll-color-list" role="group" aria-label="Filter by color">
              {availableColors.map((c) => {
                const isActive = colorParam.some((cp) => cp.toLowerCase() === c.name.toLowerCase());
                const isWhite = c.hex && (c.hex.toLowerCase() === "#ffffff" || c.hex.toLowerCase() === "#fff");
                return (
                  <li key={c.name}>
                    <button
                      type="button"
                      className={"coll-ref-row" + (isActive ? " active" : "")}
                      onClick={() => toggleArrayParam("color", c.name)}
                      aria-pressed={isActive}
                    >
                      <span
                        className={"coll-ref-color-circle" + (isWhite ? " is-white" : "")}
                        style={{ backgroundColor: c.hex || "#ccc" }}
                      >
              {isActive && (
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    )}
                  </span>
                  <span className="coll-ref-label">{c.name}</span>
                      <span className="coll-ref-count">({c.count})</span>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      )}

      {/* 3. Size */}
      {availableSizes.length > 0 && (
        <div className="coll-sidebar-section">
          <button type="button" className="coll-sidebar-heading" onClick={() => toggleSection("size")}>
            <span>Size</span>
            <div className="coll-heading-right">
              {sizeParam.length > 0 && <span className="coll-heading-badge">{sizeParam.length}</span>}
              <SectionCaret sectionKey="size" />
            </div>
          </button>
          {openSections.size && (
            <ul className="coll-ref-list coll-size-list" role="group" aria-label="Filter by size">
              {availableSizes.map((item) => {
                const isActive = sizeParam.includes(item.name);
                return (
                  <li key={item.name}>
                    <button
                      type="button"
                      className={"coll-ref-row" + (isActive ? " active" : "")}
                      onClick={() => toggleArrayParam("size", item.name)}
                      aria-pressed={isActive}
                    >
                      <span className={"coll-ref-checkbox" + (isActive ? " checked" : "")}>
                        {isActive && (
                          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5">
                            <polyline points="20 6 9 17 4 12" />
                          </svg>
                        )}
                      </span>
                      <span className="coll-ref-label">{item.name}</span>
                      <span className="coll-ref-count">({item.count})</span>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      )}

      {/* 4. Availability */}
      <div className="coll-sidebar-section coll-sidebar-section--last">
        <button type="button" className="coll-sidebar-heading" onClick={() => toggleSection("availability")}>
          <span>Availability</span>
          <div className="coll-heading-right">
            {availabilityParam !== "all" && <span className="coll-heading-badge">1</span>}
            <SectionCaret sectionKey="availability" />
          </div>
        </button>
        {openSections.availability && (
          <ul className="coll-ref-list" role="group" aria-label="Filter by availability">
            <li>
              <button
                type="button"
                className={"coll-ref-row" + (availabilityParam === "inStock" ? " active" : "")}
                onClick={() => toggleAvailability("inStock")}
                aria-pressed={availabilityParam === "inStock"}
              >
                <span className={"coll-ref-checkbox" + (availabilityParam === "inStock" ? " checked" : "")}>
                  {availabilityParam === "inStock" && (
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  )}
                </span>
                <span className="coll-ref-label">In Stock</span>
                <span className="coll-ref-count">({inStockCount})</span>
              </button>
            </li>
            <li>
              <button
                type="button"
                className={"coll-ref-row" + (availabilityParam === "outOfStock" ? " active" : "")}
                onClick={() => toggleAvailability("outOfStock")}
                aria-pressed={availabilityParam === "outOfStock"}
              >
                <span className={"coll-ref-checkbox" + (availabilityParam === "outOfStock" ? " checked" : "")}>
                  {availabilityParam === "outOfStock" && (
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  )}
                </span>
                <span className="coll-ref-label">Out of Stock</span>
                <span className="coll-ref-count">({outOfStockCount})</span>
              </button>
            </li>
          </ul>
        )}
      </div>
    </>
  );

  return (
    <div className="collection-page">

      <section className="hero-section hero-clean-banner" aria-label="Collection Banner">
        <div className="hero-backdrop">
          <img
            src={banner.image}
            alt={banner.tag}
            className="hero-backdrop-img"
            style={{ objectPosition: banner.imagePosition }}
            loading="eager"
          />
          <div className="hero-backdrop-scrim" />
        </div>
        <div className="container hero-container">
          <div className="hero-content-box">
            <div className="hero-tag-wrap">
              <span className="hero-tag-badge">{banner.tag}</span>
              <span className="hero-promo-pill">{banner.badgePromo}</span>
            </div>
            <h1 className="hero-headline">{banner.title}</h1>
            <p className="hero-subtitle">{banner.subtitle}</p>
            <div className="hero-cta-group">
              <a href={banner.primaryHash} className="hero-btn-primary">
                {banner.primaryText}
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <line x1="7" y1="17" x2="17" y2="7" />
                  <polyline points="7 7 17 7 17 17" />
                </svg>
              </a>
              <Link to={banner.secondaryLink} className="hero-btn-secondary">
                {banner.secondaryText}
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section id="collection-catalog" className="coll-catalog-section section-padding" aria-label="Product catalog">
        <div className="container">

          <div className="coll-toolbar">
            <p className="coll-toolbar-count">
              {filteredProducts.length === 0
                ? "No products found"
                : `${filteredProducts.length} ${filteredProducts.length === 1 ? "Product" : "Products"}`}
            </p>
            <div className="coll-toolbar-right">
              {/* Featured Custom Sort Dropdown */}
              <div className="coll-custom-sort" ref={sortRef}>
                <button
                  type="button"
                  className={`coll-custom-sort-trigger ${isSortOpen ? "open" : ""}`}
                  onClick={() => setIsSortOpen((prev) => !prev)}
                  aria-expanded={isSortOpen}
                  aria-haspopup="listbox"
                  aria-label="Sort options"
                >
                  <span className="coll-sort-trigger-label">{currentSortOption.label}</span>
                  <svg
                    className={`coll-sort-trigger-caret ${isSortOpen ? "open" : ""}`}
                    width="11"
                    height="11"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                  >
                    <polyline points="6 9 12 15 18 9" />
                  </svg>
                </button>
                {isSortOpen && (
                  <ul className="coll-custom-sort-menu" role="listbox" aria-label="Sort options">
                    {SORT_OPTIONS.map((opt) => {
                      const isSelected = sortParam === opt.value;
                      return (
                        <li
                          key={opt.value}
                          role="option"
                          aria-selected={isSelected}
                          className={`coll-sort-option ${isSelected ? "selected" : ""}`}
                          onClick={() => {
                            updateParams({ sort: opt.value });
                            setIsSortOpen(false);
                          }}
                        >
                          <span className="coll-sort-option-label">{opt.label}</span>
                          {isSelected && (
                            <svg className="coll-sort-check" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                              <polyline points="20 6 9 17 4 12" />
                            </svg>
                          )}
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>

              {/* 2 | 3 | 4 Product Grid Column Selector */}
              <div className="coll-col-switcher" role="radiogroup" aria-label="Product grid columns">
                {[2, 3, 4].map((cols) => (
                  <button
                    key={cols}
                    type="button"
                    className={`coll-col-btn ${gridCols === cols ? "active" : ""}`}
                    onClick={() => setGridCols(cols)}
                    role="radio"
                    aria-checked={gridCols === cols}
                    aria-label={`${cols} columns`}
                    data-col={cols}
                  >
                    <GridIcon columns={cols} />
                  </button>
                ))}
              </div>

              <button type="button" className="coll-mobile-filter-btn" onClick={() => setIsMobileDrawerOpen(true)} aria-label="Open filters">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="4" y1="21" x2="4" y2="14" /><line x1="4" y1="10" x2="4" y2="3" />
                  <line x1="12" y1="21" x2="12" y2="12" /><line x1="12" y1="8" x2="12" y2="3" />
                  <line x1="20" y1="21" x2="20" y2="16" /><line x1="20" y1="12" x2="20" y2="3" />
                  <line x1="1" y1="14" x2="7" y2="14" /><line x1="9" y1="8" x2="15" y2="8" /><line x1="17" y1="16" x2="23" y2="16" />
                </svg>
                <span>Filter{activeFiltersCount > 0 ? ` (${activeFiltersCount})` : ""}</span>
              </button>
            </div>
          </div>

          {activeFiltersCount > 0 && (
            <div className="coll-active-chips" aria-label="Active filters">
              {(minPriceParam > 0 || maxPriceParam < priceCeiling) && (
                <button type="button" className="coll-chip" onClick={() => updateParams({ minPrice: null, maxPrice: null })}>
                  Price: {currencySymbol}{minPriceParam.toLocaleString()} – {currencySymbol}{maxPriceParam.toLocaleString()} <span>✕</span>
                </button>
              )}
              {colorParam.map((c) => (
                <button key={c} type="button" className="coll-chip" onClick={() => toggleArrayParam("color", c)}>
                  Color: {c} <span>✕</span>
                </button>
              ))}
              {sizeParam.map((s) => (
                <button key={s} type="button" className="coll-chip" onClick={() => toggleArrayParam("size", s)}>
                  Size: {s} <span>✕</span>
                </button>
              ))}
              {availabilityParam !== "all" && (
                <button type="button" className="coll-chip" onClick={() => updateParams({ availability: "all" })}>
                  {availabilityParam === "inStock" ? "In Stock" : "Out of Stock"} <span>✕</span>
                </button>
              )}
              <button type="button" className="coll-clear-all" onClick={clearAllFilters}>Clear All</button>
            </div>
          )}

          <div className="coll-layout">
            <aside className="coll-sidebar" aria-label="Filter sidebar">
              <div className="coll-sidebar-inner">
                <div className="coll-sidebar-header">
                  <h2 className="coll-sidebar-title">Filters</h2>
                  {activeFiltersCount > 0 && (
                    <button type="button" className="coll-sidebar-clear" onClick={clearAllFilters}>
                      Clear ({activeFiltersCount})
                    </button>
                  )}
                </div>
                {renderFilterWidgets()}
              </div>
            </aside>

            <div className="coll-grid-area">
              {displayedProducts.length > 0 ? (
                <>
                  <div className={`coll-product-grid coll-grid-cols-${gridCols}`}>
                    {displayedProducts.map((product) => (
                      <ProductCard key={product.id} product={product} />
                    ))}
                  </div>
                  <div className="coll-pagination">
                    <div className="coll-pagination-progress">
                      <p className="coll-progress-text">Showing {displayedProducts.length} of {filteredProducts.length} Products</p>
                      <div className="coll-progress-track">
                        <div className="coll-progress-fill" style={{ width: `${progressPercentage}%` }} />
                      </div>
                    </div>
                    {displayedProducts.length < filteredProducts.length ? (
                      <button type="button" className="btn btn-primary coll-load-more-btn" onClick={handleLoadMore} disabled={isLoadingMore}>
                        {isLoadingMore ? (<span className="btn-loader-content"><span className="spinner-circle" /> Loading...</span>) : (<span>Load More</span>)}
                      </button>
                    ) : (
                      <p className="coll-end-text">You have viewed all {filteredProducts.length} items.</p>
                    )}
                  </div>
                </>
              ) : (
                <div className="coll-empty-state">
                  <div className="coll-empty-icon">
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /><line x1="8" y1="11" x2="14" y2="11" />
                    </svg>
                  </div>
                  <h3 className="coll-empty-title">No products found</h3>
                  <p className="coll-empty-desc">No designs match your current filter combination. Try adjusting your filters.</p>
                  <button type="button" className="btn btn-primary" onClick={() => { clearAllFilters(); navigate("/collection"); }}>
                    Clear Filters
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      <div className={"coll-drawer-backdrop" + (isMobileDrawerOpen ? " open" : "")}
        onClick={() => setIsMobileDrawerOpen(false)} aria-hidden={!isMobileDrawerOpen} />
      <div className={"coll-mobile-drawer" + (isMobileDrawerOpen ? " open" : "")}
        role="dialog" aria-modal="true" aria-label="Filter collection">
        <div className="coll-drawer-header">
          <div className="coll-drawer-title-row">
            <h3>Filters</h3>
            {activeFiltersCount > 0 && <span className="coll-drawer-badge">{activeFiltersCount}</span>}
          </div>
          <button type="button" className="coll-drawer-close" onClick={() => setIsMobileDrawerOpen(false)} aria-label="Close filter drawer">✕</button>
        </div>
        <div className="coll-drawer-body">
          {renderFilterWidgets()}
        </div>
        <div className="coll-drawer-footer">
          <button type="button" className="btn btn-secondary coll-drawer-clear" onClick={clearAllFilters}>Clear All</button>
          <button type="button" className="btn btn-primary coll-drawer-apply" onClick={() => setIsMobileDrawerOpen(false)}>
            View ({filteredProducts.length}) Products
          </button>
        </div>
      </div>

      <TrustFeatures />
      <RecentlyViewed />
    </div>
  );
}
