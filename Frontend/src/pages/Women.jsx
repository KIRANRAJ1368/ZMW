import { useMemo, useState, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useShop } from "../context/ShopContext";
import { WOMEN_PRODUCTS, WOMEN_SUBCATEGORIES } from "../data/products";
import ProductCard from "../components/ProductCard/ProductCard";
import RecentlyViewed from "../components/RecentlyViewed/RecentlyViewed";
import TrustFeatures from "../components/TrustFeatures/TrustFeatures";
import "../components/Hero/Hero.css";
import "./Women.css";


const SORT_OPTIONS = [
  { value: "featured", label: "Featured" },
  { value: "best-selling", label: "Best Selling" },
  { value: "price-asc", label: "Price: Low to High" },
  { value: "price-desc", label: "Price: High to Low" },
  { value: "title-asc", label: "Alphabetically: A-Z" },
  { value: "title-desc", label: "Alphabetically: Z-A" },
  { value: "newest", label: "Date: New to Old" },
  { value: "rating", label: "Customer Rating" }
];

const INITIAL_PAGE_SIZE = 12;

export default function Women() {
  const { formatPrice, currency, currencies } = useShop();
  const [searchParams] = useSearchParams();
  const categoryFromUrl = searchParams.get("category");
  const hasCategorySelection = Boolean(categoryFromUrl);

  const rate = (currencies && currencies[currency]?.rate) || 83;
  const currencySymbol = (currencies && currencies[currency]?.symbol) || "₹";

  // Calculate dynamic price ceiling
  const priceCeiling = useMemo(
    () => Math.ceil(Math.max(...WOMEN_PRODUCTS.map((p) => p.price * rate)) / 100) * 100,
    [rate]
  );

  // Filter States
  const [activeSubCategory, setActiveSubCategory] = useState(
    categoryFromUrl && WOMEN_SUBCATEGORIES.includes(categoryFromUrl) ? categoryFromUrl : "All"
  );
  const [selectedColors, setSelectedColors] = useState([]);
  const [selectedSizes, setSelectedSizes] = useState([]);
  const [availability, setAvailability] = useState("all"); // all | inStock | outOfStock
  const [minPrice, setMinPrice] = useState(0);
  const [maxPrice, setMaxPrice] = useState(priceCeiling);
  const [sortBy, setSortBy] = useState("featured");

  // Reset price range when currency / priceCeiling changes
  useEffect(() => {
    setMaxPrice(priceCeiling);
    setMinPrice(0);
  }, [priceCeiling]);

  // Layout & Pagination States — desktop only supports 3 or 4 columns
  const [gridDensity, setGridDensity] = useState(4); // 3 or 4 columns
  const [visibleCount, setVisibleCount] = useState(INITIAL_PAGE_SIZE);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);

  // Accordion open/collapse states in filters
  const [openFilters, setOpenFilters] = useState({
    price: true,
    color: true,
    size: true,
    availability: true,
    category: true
  });

  // Sync active subcategory when URL param changes
  useEffect(() => {
    if (categoryFromUrl && WOMEN_SUBCATEGORIES.includes(categoryFromUrl)) {
      setActiveSubCategory(categoryFromUrl);
    }
  }, [categoryFromUrl]);

  // Lock body scroll when mobile filter drawer is open
  useEffect(() => {
    if (isMobileDrawerOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isMobileDrawerOpen]);

  // Reset page size to initial whenever any filter criteria changes
  useEffect(() => {
    setVisibleCount(INITIAL_PAGE_SIZE);
  }, [activeSubCategory, selectedColors, selectedSizes, availability, minPrice, maxPrice, sortBy]);

  // Build the color filter list with live counts from the current catalog
  const colorOptions = useMemo(() => {
    const map = new Map();
    WOMEN_PRODUCTS.forEach((p) => {
      (p.colors || []).forEach((c) => {
        if (!map.has(c.name)) map.set(c.name, { ...c, count: 0 });
        map.get(c.name).count += 1;
      });
    });
    return Array.from(map.values()).sort((a, b) => b.count - a.count);
  }, []);

  // Extract all available sizes
  const sizeOptions = useMemo(() => {
    const set = new Set();
    WOMEN_PRODUCTS.forEach((p) => (p.sizes || []).forEach((s) => set.add(s)));
    return Array.from(set).sort((a, b) => {
      const order = ["XS", "S", "M", "L", "XL", "XXL", "3XL"];
      const iA = order.indexOf(a);
      const iB = order.indexOf(b);
      if (iA !== -1 && iB !== -1) return iA - iB;
      return a.localeCompare(b);
    });
  }, []);

  const inStockCount = useMemo(
    () => WOMEN_PRODUCTS.filter((p) => p.inStock).length,
    []
  );
  const outOfStockCount = WOMEN_PRODUCTS.length - inStockCount;

  // Toggle helpers
  const toggleColor = (name) => {
    setSelectedColors((prev) =>
      prev.includes(name) ? prev.filter((c) => c !== name) : [...prev, name]
    );
  };

  const toggleSize = (size) => {
    setSelectedSizes((prev) =>
      prev.includes(size) ? prev.filter((s) => s !== size) : [...prev, size]
    );
  };

  const toggleFilterAccordion = (name) => {
    setOpenFilters((prev) => ({ ...prev, [name]: !prev[name] }));
  };

  const clearFilters = () => {
    setActiveSubCategory("All");
    setSelectedColors([]);
    setSelectedSizes([]);
    setAvailability("all");
    setMinPrice(0);
    setMaxPrice(priceCeiling);
    setSortBy("featured");
  };

  // Count active filters for badge
  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (activeSubCategory !== "All") count += 1;
    if (selectedColors.length > 0) count += selectedColors.length;
    if (selectedSizes.length > 0) count += selectedSizes.length;
    if (availability !== "all") count += 1;
    if (minPrice > 0 || maxPrice < priceCeiling) count += 1;
    return count;
  }, [activeSubCategory, selectedColors, selectedSizes, availability, minPrice, maxPrice, priceCeiling]);

  const hasActiveFilters = activeFiltersCount > 0;

  // Filter & Sort Pipeline
  const filteredProducts = useMemo(() => {
    let list = WOMEN_PRODUCTS.filter((p) => {
      if (activeSubCategory !== "All" && p.subCategory !== activeSubCategory) return false;
      if (
        selectedColors.length > 0 &&
        !p.colors.some((c) => selectedColors.includes(c.name))
      )
        return false;
      if (selectedSizes.length > 0 && !p.sizes.some((s) => selectedSizes.includes(s)))
        return false;
      if (availability === "inStock" && !p.inStock) return false;
      if (availability === "outOfStock" && p.inStock) return false;
      const pPrice = Math.round(p.price * rate);
      if (pPrice < minPrice || pPrice > maxPrice) return false;
      return true;
    });

    switch (sortBy) {
      case "price-asc":
        list = [...list].sort((a, b) => a.price - b.price);
        break;
      case "price-desc":
        list = [...list].sort((a, b) => b.price - a.price);
        break;
      case "title-asc":
        list = [...list].sort((a, b) => a.name.localeCompare(b.name));
        break;
      case "title-desc":
        list = [...list].sort((a, b) => b.name.localeCompare(a.name));
        break;
      case "newest":
        list = [...list].sort((a, b) => Number(b.isNew) - Number(a.isNew));
        break;
      case "best-selling":
        list = [...list].sort((a, b) => Number(b.isBestSeller) - Number(a.isBestSeller));
        break;
      case "rating":
        list = [...list].sort((a, b) => b.rating - a.rating);
        break;
      case "featured":
      default:
        break;
    }
    return list;
  }, [activeSubCategory, selectedColors, selectedSizes, availability, minPrice, maxPrice, sortBy, rate]);

  // Paginated visible slice
  const displayedProducts = useMemo(() => {
    return filteredProducts.slice(0, visibleCount);
  }, [filteredProducts, visibleCount]);

  const handleLoadMore = () => {
    setIsLoadingMore(true);
    setTimeout(() => {
      setVisibleCount((prev) => prev + INITIAL_PAGE_SIZE);
      setIsLoadingMore(false);
    }, 400);
  };

  const progressPercentage = Math.min(
    100,
    Math.round((displayedProducts.length / Math.max(1, filteredProducts.length)) * 100)
  );

  // Shared Filters Form component (used in both desktop sidebar and mobile drawer)
  const renderFilterWidgets = () => (
    <>
      {/* Category Filter */}
      <div className={`filter-accordion-block ${openFilters.category ? "open" : ""}`}>
        <button
          type="button"
          className="filter-accordion-header"
          onClick={() => toggleFilterAccordion("category")}
          aria-expanded={openFilters.category}
        >
          <span>Category / Style</span>
          <svg className="filter-chevron" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="6 9 12 15 18 9"></polyline>
          </svg>
        </button>
        {openFilters.category && (
          <div className="filter-accordion-content">
            <ul className="filter-category-list">
              {["All", ...WOMEN_SUBCATEGORIES].map((cat) => {
                const count = cat === "All"
                  ? WOMEN_PRODUCTS.length
                  : WOMEN_PRODUCTS.filter((p) => p.subCategory === cat).length;
                return (
                  <li key={cat}>
                    <button
                      type="button"
                      className={`filter-category-row ${activeSubCategory === cat ? "active" : ""}`}
                      onClick={() => setActiveSubCategory(cat)}
                    >
                      <span className="filter-checkbox-custom">
                        {activeSubCategory === cat && <span className="filter-checkbox-dot" />}
                      </span>
                      <span className="filter-cat-name">{cat}</span>
                      <span className="filter-item-count">({count})</span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        )}
      </div>

      {/* Price Range */}
      <div className={`filter-accordion-block ${openFilters.price ? "open" : ""}`}>
        <button
          type="button"
          className="filter-accordion-header"
          onClick={() => toggleFilterAccordion("price")}
          aria-expanded={openFilters.price}
        >
          <span>Price</span>
          <svg className="filter-chevron" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="6 9 12 15 18 9"></polyline>
          </svg>
        </button>
        {openFilters.price && (
          <div className="filter-accordion-content">
            <div className="price-inputs-row">
              <div className="price-input-group">
                <span className="price-input-prefix">{currencySymbol}</span>
                <input
                  type="number"
                  min={0}
                  max={maxPrice}
                  value={minPrice}
                  onChange={(e) => setMinPrice(Math.max(0, Number(e.target.value)))}
                  className="price-number-input"
                  aria-label="Minimum price"
                />
              </div>
              <span className="price-separator">to</span>
              <div className="price-input-group">
                <span className="price-input-prefix">{currencySymbol}</span>
                <input
                  type="number"
                  min={minPrice}
                  max={priceCeiling}
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(Math.min(priceCeiling, Number(e.target.value)))}
                  className="price-number-input"
                  aria-label="Maximum price"
                />
              </div>
            </div>
            <input
              type="range"
              min={0}
              max={priceCeiling}
              step={50}
              value={maxPrice}
              onChange={(e) => setMaxPrice(Number(e.target.value))}
              className="price-slider"
              aria-label="Maximum price range"
            />
            <div className="price-range-labels">
              <span>{currencySymbol}0</span>
              <span>up to {currencySymbol}{maxPrice.toLocaleString("en-IN")}</span>
            </div>
          </div>
        )}
      </div>

      {/* Color Filter */}
      <div className={`filter-accordion-block ${openFilters.color ? "open" : ""}`}>
        <button
          type="button"
          className="filter-accordion-header"
          onClick={() => toggleFilterAccordion("color")}
          aria-expanded={openFilters.color}
        >
          <span>Color</span>
          <svg className="filter-chevron" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="6 9 12 15 18 9"></polyline>
          </svg>
        </button>
        {openFilters.color && (
          <div className="filter-accordion-content">
            <ul className="filter-color-list">
              {colorOptions.map((c) => {
                const isActive = selectedColors.includes(c.name);
                return (
                  <li key={c.name}>
                    <button
                      type="button"
                      className={`filter-color-option ${isActive ? "active" : ""}`}
                      onClick={() => toggleColor(c.name)}
                      aria-pressed={isActive}
                    >
                      <span
                        className="filter-color-dot"
                        style={{ backgroundColor: c.hex }}
                        aria-hidden="true"
                      >
                        {isActive && (
                          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3">
                            <polyline points="20 6 9 17 4 12"></polyline>
                          </svg>
                        )}
                      </span>
                      <span className="filter-color-name">{c.name}</span>
                      <span className="filter-item-count">({c.count})</span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        )}
      </div>

      {/* Size Filter */}
      <div className={`filter-accordion-block ${openFilters.size ? "open" : ""}`}>
        <button
          type="button"
          className="filter-accordion-header"
          onClick={() => toggleFilterAccordion("size")}
          aria-expanded={openFilters.size}
        >
          <span>Size</span>
          <svg className="filter-chevron" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="6 9 12 15 18 9"></polyline>
          </svg>
        </button>
        {openFilters.size && (
          <div className="filter-accordion-content">
            <div className="filter-size-grid">
              {sizeOptions.map((size) => {
                const isActive = selectedSizes.includes(size);
                return (
                  <button
                    key={size}
                    type="button"
                    className={`filter-size-chip ${isActive ? "active" : ""}`}
                    onClick={() => toggleSize(size)}
                    aria-pressed={isActive}
                  >
                    {size}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Availability Filter */}
      <div className={`filter-accordion-block ${openFilters.availability ? "open" : ""}`}>
        <button
          type="button"
          className="filter-accordion-header"
          onClick={() => toggleFilterAccordion("availability")}
          aria-expanded={openFilters.availability}
        >
          <span>Availability</span>
          <svg className="filter-chevron" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="6 9 12 15 18 9"></polyline>
          </svg>
        </button>
        {openFilters.availability && (
          <div className="filter-accordion-content">
            <label className="filter-checkbox-row">
              <input
                type="checkbox"
                checked={availability === "inStock"}
                onChange={() =>
                  setAvailability((prev) => (prev === "inStock" ? "all" : "inStock"))
                }
              />
              <span>In stock</span>
              <span className="filter-item-count">({inStockCount})</span>
            </label>
            <label className="filter-checkbox-row">
              <input
                type="checkbox"
                checked={availability === "outOfStock"}
                onChange={() =>
                  setAvailability((prev) => (prev === "outOfStock" ? "all" : "outOfStock"))
                }
              />
              <span>Out of stock</span>
              <span className="filter-item-count">({outOfStockCount})</span>
            </label>
          </div>
        )}
      </div>
    </>
  );

  return (
    <div className="women-collection-page">
      {/* ── Category Hero Banner — Premium Single Banner with Modern Female Model ── */}
      {!hasCategorySelection && <section className="hero-section hero-single-banner women-hero" aria-label="Women's Collection Banner">
        <div className="hero-backdrop">
          <img
            src="/images/cat-banner-womens.jpg"
            alt="Stylish female model wearing a modern graphic T-shirt"
            className="hero-backdrop-img"
            style={{ objectPosition: "80% 20%" }}
            loading="eager"
          />
          <div className="hero-backdrop-scrim" />
          <div className="hero-radial-glow" />
        </div>

        <div className="container hero-container">
          <div className="hero-content">
            <div className="hero-kicker-wrapper">
              <span className="hero-kicker-badge">
                <span className="kicker-pulse-dot" />
                WOMEN'S EDIT · CONTEMPORARY TEES
              </span>
            </div>
            <h1 className="hero-title">
              Artistic Prints, <br />
              <span className="hero-title-highlight">Deliberately Styled.</span>
            </h1>
            <p className="hero-subtitle">
              Chic relaxed fits, breathable combed cotton, and modern minimalist artwork.
            </p>
            <div className="hero-cta-group">
              <a href="#women-catalog" className="btn btn-hero-primary btn-lg">
                Shop the Collection
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" aria-hidden="true">
                  <line x1="5" y1="12" x2="19" y2="12"></line>
                  <polyline points="12 5 19 12 12 19"></polyline>
                </svg>
              </a>
              <Link to="/oversized-t-shirts" className="btn btn-hero-secondary btn-lg">
                View Lookbook
              </Link>
            </div>
          </div>
        </div>
      </section>}


      {/* Main Catalog Section: Toolbar, Filters, & Product Grid */}
      <section id="women-catalog" className="section-padding m-catalog-section">
        <div className="container">
          <div className="section-header">
            <span className="section-eyebrow">WOMENSWEAR</span>
            <h2 className="section-title">Shop All Women's</h2>
            <p className="section-subtitle">
              {WOMEN_PRODUCTS.length} pieces across women's tees.
            </p>
          </div>

          {/* Collection Toolbar */}
          <div className="m-collection-toolbar">
            <div className="m-toolbar-left">
              {/* Filter Drawer Toggle Button (Mobile & Tablet) */}
              <button
                type="button"
                className="m-btn-filter-trigger"
                onClick={() => setIsMobileDrawerOpen(true)}
                aria-label="Open filter menu"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="4" y1="21" x2="4" y2="14"></line>
                  <line x1="4" y1="10" x2="4" y2="3"></line>
                  <line x1="12" y1="21" x2="12" y2="12"></line>
                  <line x1="12" y1="8" x2="12" y2="3"></line>
                  <line x1="20" y1="21" x2="20" y2="16"></line>
                  <line x1="20" y1="12" x2="20" y2="3"></line>
                  <line x1="1" y1="14" x2="7" y2="14"></line>
                  <line x1="9" y1="8" x2="15" y2="8"></line>
                  <line x1="17" y1="16" x2="23" y2="16"></line>
                </svg>
                <span>Filter</span>
                {activeFiltersCount > 0 && (
                  <span className="m-filter-badge-count">{activeFiltersCount}</span>
                )}
              </button>

              {/* Product Counter */}
              <span className="m-toolbar-total">
                Showing {Math.min(displayedProducts.length, filteredProducts.length)} of {filteredProducts.length} {filteredProducts.length === 1 ? "product" : "products"}
              </span>
            </div>

            <div className="m-toolbar-right">
              {/* Column Switcher (3 or 4 columns only on desktop) */}
              <div className="m-column-switcher" role="group" aria-label="Layout column switcher">
                <button
                  type="button"
                  className={`m-col-btn ${gridDensity === 3 ? "active" : ""}`}
                  onClick={() => setGridDensity(3)}
                  title="3 columns"
                  aria-label="3 columns view"
                  aria-pressed={gridDensity === 3}
                >
                  <svg width="18" height="18" viewBox="0 0 16 16" fill="currentColor">
                    <rect x="1" y="2" width="4" height="12" rx="1" />
                    <rect x="6" y="2" width="4" height="12" rx="1" />
                    <rect x="11" y="2" width="4" height="12" rx="1" />
                  </svg>
                </button>
                <button
                  type="button"
                  className={`m-col-btn ${gridDensity === 4 ? "active" : ""}`}
                  onClick={() => setGridDensity(4)}
                  title="4 columns"
                  aria-label="4 columns view"
                  aria-pressed={gridDensity === 4}
                >
                  <svg width="18" height="18" viewBox="0 0 16 16" fill="currentColor">
                    <rect x="1" y="2" width="2.8" height="12" rx="0.8" />
                    <rect x="4.8" y="2" width="2.8" height="12" rx="0.8" />
                    <rect x="8.4" y="2" width="2.8" height="12" rx="0.8" />
                    <rect x="12.2" y="2" width="2.8" height="12" rx="0.8" />
                  </svg>
                </button>
              </div>

              {/* Sort Dropdown */}
              <div className="m-sort-wrapper">
                <label htmlFor="m-sort-select" className="m-sort-label">Sort by:</label>
                <div className="m-sort-select-box">
                  <select
                    id="m-sort-select"
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="m-sort-select"
                  >
                    {SORT_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                  <svg className="m-sort-arrow" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <polyline points="6 9 12 15 18 9"></polyline>
                  </svg>
                </div>
              </div>
            </div>
          </div>

          {/* Active Filter Tags Row */}
          {hasActiveFilters && (
            <div className="m-active-filters-bar" aria-label="Active filters">
              <span className="m-active-label">Active filters:</span>
              <div className="m-active-tags-list">
                {activeSubCategory !== "All" && (
                  <button
                    type="button"
                    className="m-active-tag"
                    onClick={() => setActiveSubCategory("All")}
                    title="Remove subcategory filter"
                  >
                    <span>{activeSubCategory}</span>
                    <span className="m-tag-close">✕</span>
                  </button>
                )}
                {(minPrice > 0 || maxPrice < priceCeiling) && (
                  <button
                    type="button"
                    className="m-active-tag"
                    onClick={() => {
                      setMinPrice(0);
                      setMaxPrice(priceCeiling);
                    }}
                    title="Reset price filter"
                  >
                    <span>
                      {currencySymbol}{minPrice.toLocaleString("en-IN")} - {currencySymbol}{maxPrice.toLocaleString("en-IN")}
                    </span>
                    <span className="m-tag-close">✕</span>
                  </button>
                )}
                {selectedColors.map((color) => (
                  <button
                    key={color}
                    type="button"
                    className="m-active-tag"
                    onClick={() => toggleColor(color)}
                    title={`Remove ${color} filter`}
                  >
                    <span>{color}</span>
                    <span className="m-tag-close">✕</span>
                  </button>
                ))}
                {selectedSizes.map((size) => (
                  <button
                    key={size}
                    type="button"
                    className="m-active-tag"
                    onClick={() => toggleSize(size)}
                    title={`Remove size ${size} filter`}
                  >
                    <span>Size: {size}</span>
                    <span className="m-tag-close">✕</span>
                  </button>
                ))}
                {availability !== "all" && (
                  <button
                    type="button"
                    className="m-active-tag"
                    onClick={() => setAvailability("all")}
                    title="Remove stock filter"
                  >
                    <span>{availability === "inStock" ? "In Stock" : "Out of Stock"}</span>
                    <span className="m-tag-close">✕</span>
                  </button>
                )}
                <button
                  type="button"
                  className="m-clear-all-btn"
                  onClick={clearFilters}
                >
                  Clear all
                </button>
              </div>
            </div>
          )}

          {/* Catalog Layout: Desktop Sidebar + Product Grid */}
          <div className="m-collection-layout">
            {/* Desktop Filters Sidebar */}
            <aside className="m-filters-sidebar" aria-label="Desktop filters">
              <div className="m-sidebar-header">
                <h3>Filters</h3>
                {hasActiveFilters && (
                  <button type="button" className="m-sidebar-clear" onClick={clearFilters}>
                    Clear all
                  </button>
                )}
              </div>
              {renderFilterWidgets()}
            </aside>

            {/* Product Grid & Pagination Area */}
            <div className="m-grid-column">
              {displayedProducts.length > 0 ? (
                <>
                  <div className={`m-product-grid density-${gridDensity}`}>
                    {displayedProducts.map((product) => (
                      <ProductCard key={product.id} product={product} />
                    ))}
                  </div>

                  {/* Load More Pagination Section */}
                  <div className="m-pagination-wrap">
                    <div className="m-pagination-progress">
                      <p className="m-progress-text">
                        Showing {displayedProducts.length} of {filteredProducts.length} products
                      </p>
                      <div className="m-progress-bar-track">
                        <div
                          className="m-progress-bar-fill"
                          style={{ width: `${progressPercentage}%` }}
                        />
                      </div>
                    </div>

                    {displayedProducts.length < filteredProducts.length ? (
                      <button
                        type="button"
                        className="btn btn-primary m-btn-load-more"
                        onClick={handleLoadMore}
                        disabled={isLoadingMore}
                      >
                        {isLoadingMore ? (
                          <span className="m-btn-loader">
                            <span className="m-spinner-circle" />
                            Loading...
                          </span>
                        ) : (
                          <span>Load More</span>
                        )}
                      </button>
                    ) : (
                      <p className="m-pagination-end">You’ve viewed all available designs in this selection.</p>
                    )}
                  </div>
                </>
              ) : (
                <div className="m-empty-state">
                  <div className="m-empty-icon">
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <circle cx="11" cy="11" r="8"></circle>
                      <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                      <line x1="8" y1="11" x2="14" y2="11"></line>
                    </svg>
                  </div>
                  <h3>No matching styles found</h3>
                  <p>Try clearing some filters or selecting a different category to see more designs.</p>
                  <button type="button" className="btn btn-secondary btn-sm" onClick={clearFilters}>
                    Clear all filters
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Mobile & Tablet Slide-Out Filter Drawer */}
      <div
        className={`m-filter-drawer-backdrop ${isMobileDrawerOpen ? "open" : ""}`}
        onClick={() => setIsMobileDrawerOpen(false)}
        aria-hidden={!isMobileDrawerOpen}
      />
      <div
        className={`m-filter-drawer ${isMobileDrawerOpen ? "open" : ""}`}
        role="dialog"
        aria-modal="true"
        aria-label="Filter products"
      >
        <div className="m-drawer-header">
          <div className="m-drawer-title-group">
            <h3>Filters</h3>
            {activeFiltersCount > 0 && (
              <span className="m-filter-badge-count">{activeFiltersCount}</span>
            )}
          </div>
          <button
            type="button"
            className="m-drawer-close"
            onClick={() => setIsMobileDrawerOpen(false)}
            aria-label="Close filters"
          >
            ✕
          </button>
        </div>

        <div className="m-drawer-body">
          {renderFilterWidgets()}
        </div>

        <div className="m-drawer-footer">
          {hasActiveFilters && (
            <button
              type="button"
              className="btn btn-secondary m-drawer-clear-btn"
              onClick={clearFilters}
            >
              Clear all
            </button>
          )}
          <button
            type="button"
            className="btn btn-primary m-drawer-apply-btn"
            onClick={() => setIsMobileDrawerOpen(false)}
          >
            View ({filteredProducts.length}) Products
          </button>
        </div>
      </div>

      {/* Fabric & Fit Guide & Editorial Section */}
      <section className="section-padding m-editorial-section">
        <div className="container">
          <div className="section-header">
            <span className="section-eyebrow">CRAFTSMANSHIP & FIT</span>
            <h2 className="section-title">What Makes Our Women's Edit Different?</h2>
            <p className="section-subtitle">
              Our tops and co-ords are engineered from the ground up for soft handfeel, considered
              drape, and prints that hold their color wash after wash.
            </p>
          </div>

          <div className="m-editorial-grid">
            <div className="m-editorial-card">
              <div className="m-card-icon">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"></path>
                </svg>
              </div>
              <h3 className="m-card-title">Soft-Washed Combed Cotton</h3>
              <p className="m-card-desc">
                Woven from long-staple combed cotton yarns and pre-washed for softness from the first
                wear. Holds its shape and color through repeated washing without stiffening.
              </p>
            </div>

            <div className="m-editorial-card">
              <div className="m-card-icon">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <path d="M20.38 3.46L16 2a4 4 0 0 1-8 0L3.62 3.46a2 2 0 0 0-1.34 2.23l.58 3.47a1 1 0 0 0 .99.84H6v10c0 1.1.9 2 2 2h8a2 2 0 0 0 2-2V10h2.15a1 1 0 0 0 .99-.84l.58-3.47a2 2 0 0 0-1.34-2.23z"></path>
                </svg>
              </div>
              <h3 className="m-card-title">Considered, Relaxed Silhouettes</h3>
              <p className="m-card-desc">
                Cut with just enough room to move — boxy where it should be, fitted where it counts —
                so every piece layers easily with the rest of your wardrobe.
              </p>
            </div>

            <div className="m-editorial-card">
              <div className="m-card-icon">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <circle cx="12" cy="12" r="10"></circle>
                  <line x1="2" y1="12" x2="22" y2="12"></line>
                  <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>
                </svg>
              </div>
              <h3 className="m-card-title">Fade-Proof Prints & Dyes</h3>
              <p className="m-card-desc">
                High-density inks and colorfast dye processes cured at precise temperatures. Won't
                crack, peel, or lose vibrancy, keeping graphics and color crisp wear after wear.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Shared Trust Strip from ZMW */}
      <TrustFeatures />
      <RecentlyViewed />
    </div>
  );
}
