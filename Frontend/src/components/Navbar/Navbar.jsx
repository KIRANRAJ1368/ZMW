import React, { useState, useEffect, useRef, useCallback } from "react";
import { Link, useLocation } from "react-router-dom";
import { useShop } from "../../context/ShopContext";
import { MEN_SUBCATEGORIES, WOMEN_SUBCATEGORIES, BOYS_SUBCATEGORIES, GIRLS_SUBCATEGORIES, BABIES_SUBCATEGORIES } from "../../data/products";
import "./Navbar.css";

const PROMO_MESSAGES = [
  "🔥 FREE SHIPPING ON ALL PREPAID ORDERS | EXPRESS DELIVERY IN 2-4 DAYS 🚀",
  "⚡ BUY 2 GET 10% OFF AUTO-APPLIED · USE CODE: ZMW10",
  "👕 240+ GSM HEAVYWEIGHT COMBED COTTON · OVERSIZED STREETWEAR DROPS",
  "📦 CASH ON DELIVERY (COD) AVAILABLE ACROSS 25,000+ PINCODES"
];

export default function Navbar() {
  const {
    cartItemCount,
    cartSubtotal,
    wishlist,
    setIsCartOpen,
    setIsWishlistOpen,
    setIsSearchOpen,
    setAuthModalState,
    setIsOrderTrackOpen,
    currency,
    setCurrency,
    currencies,
    language,
    setLanguage,
    formatPrice,
    customerUser,
    logoutCustomer
  } = useShop();

  const [promoIndex, setPromoIndex] = useState(0);
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [openDesktopMenu, setOpenDesktopMenu] = useState(null);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [openFlyout, setOpenFlyout] = useState(null);
  const [mobileMenExpanded, setMobileMenExpanded] = useState(false);
  const [mobileWomenExpanded, setMobileWomenExpanded] = useState(false);
  const [mobileBoysExpanded, setMobileBoysExpanded] = useState(false);
  const [mobileGirlsExpanded, setMobileGirlsExpanded] = useState(false);
  const [mobileBabiesExpanded, setMobileBabiesExpanded] = useState(false);

  const desktopNavRef = useRef(null);

  useEffect(() => {
    const timer = setInterval(() => {
      setPromoIndex((prev) => (prev + 1) % PROMO_MESSAGES.length);
    }, 4500);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      const scrolled = window.scrollY > 40;
      setIsScrolled((prev) => (prev !== scrolled ? scrolled : prev));
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const location = useLocation();

  // Compute exactly one active nav key from pathname + query params
  const activeNav = (() => {
    if (location.pathname === "/") return "home";
    if (location.pathname === "/mens" || location.pathname === "/men") return "men";
    if (location.pathname === "/womens" || location.pathname === "/women") return "women";
    if (location.pathname === "/boys") return "boys";
    if (location.pathname === "/kids") return "kids";
    if (location.pathname === "/girls") return "girls";
    if (location.pathname === "/babies") return "babies";
    if (location.pathname === "/best-sellers" || location.pathname === "/best-seller") return "best-sellers";
    if (location.pathname === "/new-arrivals" || location.pathname === "/new-arrival") return "new-arrivals";
    if (location.pathname === "/collection") {
      const sp = new URLSearchParams(location.search);
      const cat = sp.get("category")?.toLowerCase();
      const col = sp.get("collection")?.toLowerCase();
      if (cat === "mens" || cat === "men") return "men";
      if (cat === "womens" || cat === "women") return "women";
      if (cat === "boys") return "boys";
      if (cat === "kids") return "kids";
      if (cat === "girls") return "girls";
      if (cat === "babies") return "babies";
      if (col === "best-sellers" || col === "best-seller") return "best-sellers";
      if (col === "new-arrivals" || col === "new-arrival") return "new-arrivals";
    }
    return null;
  })();

  const closeAllMenus = useCallback(() => {
    setOpenDesktopMenu(null);
    setOpenFlyout(null);
  }, []);

  const handleSectionClick = (e, sectionId) => {
    closeAllMenus();
    setMobileMenuOpen(false);

    if (location.pathname === "/") {
      e.preventDefault();
      const el = document.getElementById(sectionId);
      if (el) {
        el.scrollIntoView();
        window.history.pushState(null, "", `/#${sectionId}`);
      }
    }
  };

  useEffect(() => {
    if (!openDesktopMenu) return;
    const handleClickOutside = (e) => {
      if (desktopNavRef.current && !desktopNavRef.current.contains(e.target)) {
        closeAllMenus();
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [openDesktopMenu, closeAllMenus]);

  const toggleDesktopMenu = (menu) => {
    setOpenDesktopMenu((prev) => (prev === menu ? null : menu));
    setOpenFlyout(null);
  };

  const handleCategoryNameClick = (_e, menu) => {
    toggleDesktopMenu(menu);
  };

  return (
    <header className="site-header">
      <div className="announcement-bar">
        <div className="container announcement-inner">
          <div className="announcement-social">
            <a href="https://instagram.com" target="_blank" rel="noreferrer" aria-label="Instagram">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
            </a>
            <a href="https://pinterest.com" target="_blank" rel="noreferrer" aria-label="Pinterest">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"></circle><path d="M8 12c0-2.5 2-4.5 4.5-4.5s4.5 2 4.5 4.5c0 3-2 5.5-4.5 5.5-.8 0-1.5-.3-2.1-.8L9.5 20"></path></svg>
            </a>
            <a href="https://tiktok.com" target="_blank" rel="noreferrer" aria-label="TikTok">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5"></path></svg>
            </a>
            <a href="https://facebook.com" target="_blank" rel="noreferrer" aria-label="Facebook">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path></svg>
            </a>
          </div>

          <div className="announcement-message">
            <span key={promoIndex} className="promo-text-fade">
              {PROMO_MESSAGES[promoIndex]}
            </span>
          </div>

          <div className="announcement-right">
            <button
              className="announcement-link"
              onClick={() => setIsOrderTrackOpen(true)}
            >
              Track Order
            </button>
            <span className="announcement-divider">|</span>
            <div className="currency-selector">
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                aria-label="Currency Selector"
              >
                {Object.keys(currencies).map((curr) => (
                  <option key={curr} value={curr}>
                    {curr} ({currencies[curr].symbol})
                  </option>
                ))}
              </select>
            </div>
            <span className="announcement-divider">|</span>
            <div className="language-selector">
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                aria-label="Language Selector"
              >
                <option value="EN">EN</option>
                <option value="FR">FR</option>
                <option value="DE">DE</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      <nav className={`main-navbar ${isScrolled ? "navbar-scrolled" : ""}`}>
        <div className="container navbar-inner" ref={desktopNavRef}>
          <button
            className={`hamburger-btn ${mobileMenuOpen ? "active" : ""}`}
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle navigation menu"
          >
            <span className="hamburger-line"></span>
            <span className="hamburger-line"></span>
            <span className="hamburger-line"></span>
          </button>

          <Link to="/" className="brand-logo" onClick={closeAllMenus} aria-label="ZMW">
            <img
              src={process.env.PUBLIC_URL + "/images/zmw-logo-transparent.png"}
              alt="ZMW"
              className="brand-logo-img"
              width="142"
              height="44"
            />
          </Link>

          <ul className="nav-links">
            {/* Men */}
            <li className="nav-item has-dropdown">
              <div className="nav-item-row">
                <Link
                  to="/collection?category=mens"
                  className={"nav-link" + (activeNav === "men" ? " active" : "")}
                  onClick={(e) => handleCategoryNameClick(e, "mens")}
                >
                  Men
                </Link>
                <button
                  type="button"
                  className="nav-caret-btn"
                  onClick={() => toggleDesktopMenu("mens")}
                  aria-haspopup="true"
                  aria-expanded={openDesktopMenu === "mens"}
                  aria-label="Open Men menu"
                >
                  <svg className="nav-caret" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4">
                    <polyline points="6 9 12 15 18 9"></polyline>
                  </svg>
                </button>
              </div>

              {openDesktopMenu === "mens" && (
                <div className="mega-dropdown">
                  <div className="mega-dropdown-inner">
                    <ul className="dropdown-col">
                      <li className="dropdown-heading">Men's Apparel</li>
                      {MEN_SUBCATEGORIES.map((sub) => (
                        <li key={sub}>
                          <Link
                            to={`/collection?category=mens&type=${encodeURIComponent(sub.toLowerCase())}`}
                            onClick={closeAllMenus}
                          >
                            {sub}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}
            </li>

            {/* Women */}
            <li className="nav-item has-dropdown">
              <div className="nav-item-row">
                <Link
                  to="/collection?category=women"
                  className={"nav-link" + (activeNav === "women" ? " active" : "")}
                  onClick={(e) => handleCategoryNameClick(e, "women")}
                >
                  Women
                </Link>
                <button
                  type="button"
                  className="nav-caret-btn"
                  onClick={() => toggleDesktopMenu("women")}
                  aria-haspopup="true"
                  aria-expanded={openDesktopMenu === "women"}
                  aria-label="Open Women menu"
                >
                  <svg className="nav-caret" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4">
                    <polyline points="6 9 12 15 18 9"></polyline>
                  </svg>
                </button>
              </div>

              {openDesktopMenu === "women" && (
                <div className="mega-dropdown">
                  <div className="mega-dropdown-inner">
                    <ul className="dropdown-col">
                      <li className="dropdown-heading">Women's Apparel</li>
                      {WOMEN_SUBCATEGORIES.map((sub) => (
                        <li key={sub}>
                          <Link
                            to={`/collection?category=women&type=${encodeURIComponent(sub.toLowerCase())}`}
                            onClick={closeAllMenus}
                          >
                            {sub}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}
            </li>

            {/* Boys */}
            <li className="nav-item has-dropdown">
              <div className="nav-item-row">
                <Link
                  to="/collection?category=boys"
                  className={"nav-link" + (activeNav === "boys" ? " active" : "")}
                  onClick={(e) => handleCategoryNameClick(e, "boys")}
                >
                  Boys
                </Link>
                <button
                  type="button"
                  className="nav-caret-btn"
                  onClick={() => toggleDesktopMenu("boys")}
                  aria-haspopup="true"
                  aria-expanded={openDesktopMenu === "boys"}
                  aria-label="Open Boys menu"
                >
                  <svg className="nav-caret" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4">
                    <polyline points="6 9 12 15 18 9"></polyline>
                  </svg>
                </button>
              </div>

              {openDesktopMenu === "boys" && (
                <div className="mega-dropdown">
                  <div className="mega-dropdown-inner">
                    <ul className="dropdown-col">
                      <li className="dropdown-heading">Boys' Apparel</li>
                      {BOYS_SUBCATEGORIES.map((sub) => (
                        <li key={sub}>
                          <Link
                            to={`/collection?category=boys&type=${encodeURIComponent(sub.toLowerCase())}`}
                            onClick={closeAllMenus}
                          >
                            {sub}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}
            </li>

            {/* Girls */}
            <li className="nav-item has-dropdown">
              <div className="nav-item-row">
                <Link
                  to="/collection?category=girls"
                  className={"nav-link" + (activeNav === "girls" ? " active" : "")}
                  onClick={(e) => handleCategoryNameClick(e, "girls")}
                >
                  Girls
                </Link>
                <button
                  type="button"
                  className="nav-caret-btn"
                  onClick={() => toggleDesktopMenu("girls")}
                  aria-haspopup="true"
                  aria-expanded={openDesktopMenu === "girls"}
                  aria-label="Open Girls menu"
                >
                  <svg className="nav-caret" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4">
                    <polyline points="6 9 12 15 18 9"></polyline>
                  </svg>
                </button>
              </div>

              {openDesktopMenu === "girls" && (
                <div className="mega-dropdown">
                  <div className="mega-dropdown-inner">
                    <ul className="dropdown-col">
                      <li className="dropdown-heading">Girls' Apparel</li>
                      {GIRLS_SUBCATEGORIES.map((sub) => (
                        <li key={sub}>
                          <Link
                            to={`/collection?category=girls&type=${encodeURIComponent(sub.toLowerCase())}`}
                            onClick={closeAllMenus}
                          >
                            {sub}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}
            </li>

            {/* Babies */}
            <li className="nav-item has-dropdown">
              <div className="nav-item-row">
                <Link
                  to="/collection?category=babies"
                  className={"nav-link" + (activeNav === "babies" ? " active" : "")}
                  onClick={(e) => handleCategoryNameClick(e, "babies")}
                >
                  Babies
                </Link>
                <button
                  type="button"
                  className="nav-caret-btn"
                  onClick={() => toggleDesktopMenu("babies")}
                  aria-haspopup="true"
                  aria-expanded={openDesktopMenu === "babies"}
                  aria-label="Open Babies menu"
                >
                  <svg className="nav-caret" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4">
                    <polyline points="6 9 12 15 18 9"></polyline>
                  </svg>
                </button>
              </div>

              {openDesktopMenu === "babies" && (
                <div className="mega-dropdown">
                  <div className="mega-dropdown-inner">
                    <ul className="dropdown-col">
                      <li className="dropdown-heading">Baby Essentials</li>
                      {BABIES_SUBCATEGORIES.map((sub) => (
                        <li key={sub}>
                          <Link
                            to={`/collection?category=babies&type=${encodeURIComponent(sub.toLowerCase())}`}
                            onClick={closeAllMenus}
                          >
                            {sub}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}
            </li>

            <li>
              <Link
                to="/collection?collection=best-sellers"
                className={"nav-link" + (activeNav === "best-sellers" ? " active" : "")}
                onClick={closeAllMenus}
              >
                Best Seller
              </Link>
            </li>
            <li>
              <Link
                to="/collection?collection=new-arrivals"
                className={"nav-link" + (activeNav === "new-arrivals" ? " active" : "")}
                onClick={closeAllMenus}
              >
                New Arrival
              </Link>
            </li>
          </ul>

          <div className="nav-actions">
            <button
              className="action-btn"
              onClick={() => setIsSearchOpen(true)}
              aria-label="Search Catalog"
              title="Search Catalog"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                <circle cx="11" cy="11" r="8"></circle>
                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
              </svg>
            </button>

            <div style={{ position: "relative" }}>
              <button
                className="action-btn"
                onClick={() => {
                  if (customerUser) {
                    setUserDropdownOpen((prev) => !prev);
                  } else {
                    setAuthModalState("login");
                  }
                }}
                aria-label={customerUser ? `Account: ${customerUser.name}` : "Account Login"}
                title={customerUser ? `Logged in as ${customerUser.name}` : "Customer Login / Register"}
              >
                {customerUser ? (
                  <span
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                      width: 26,
                      height: 26,
                      borderRadius: "50%",
                      background: "var(--color-accent, #FAA703)",
                      color: "#111",
                      fontSize: 12,
                      fontWeight: 700
                    }}
                  >
                    {customerUser.name ? customerUser.name.charAt(0).toUpperCase() : "U"}
                  </span>
                ) : (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                    <circle cx="12" cy="7" r="4"></circle>
                  </svg>
                )}
              </button>

              {customerUser && userDropdownOpen && (
                <div
                  style={{
                    position: "absolute",
                    top: "100%",
                    right: 0,
                    marginTop: 8,
                    background: "var(--color-white, #fff)",
                    border: "1px solid var(--color-grey-200, #e5e7eb)",
                    borderRadius: "8px",
                    boxShadow: "0 10px 25px rgba(0,0,0,0.12)",
                    width: 220,
                    padding: "14px",
                    zIndex: 100,
                    textAlign: "left"
                  }}
                >
                  <div style={{ fontSize: 13, fontWeight: 700, color: "var(--color-ink, #111)" }}>
                    {customerUser.name}
                  </div>
                  <div style={{ fontSize: 11, color: "var(--color-grey-600, #666)", marginBottom: 10, wordBreak: "break-all" }}>
                    {customerUser.email}
                  </div>
                  <div style={{ borderTop: "1px solid var(--color-grey-100, #f3f4f6)", paddingTop: 8, display: "flex", flexDirection: "column", gap: 6 }}>
                    <Link
                      to="/account"
                      style={{ textDecoration: "none", fontSize: 12, textAlign: "left", cursor: "pointer", padding: "4px 0", color: "var(--color-ink, #111)", fontWeight: 600, display: "block" }}
                      onClick={() => setUserDropdownOpen(false)}
                    >
                      📦 My Account & Orders
                    </Link>
                    <button
                      type="button"
                      style={{ background: "none", border: "none", fontSize: 12, textAlign: "left", cursor: "pointer", padding: "4px 0", color: "var(--color-ink, #111)" }}
                      onClick={() => {
                        setUserDropdownOpen(false);
                        setIsOrderTrackOpen(true);
                      }}
                    >
                      Track My Order
                    </button>
                    <button
                      type="button"
                      style={{ background: "none", border: "none", fontSize: 12, textAlign: "left", cursor: "pointer", padding: "4px 0", color: "#dc2626", fontWeight: 600 }}
                      onClick={() => {
                        setUserDropdownOpen(false);
                        logoutCustomer();
                      }}
                    >
                      Sign Out
                    </button>
                  </div>
                </div>
              )}
            </div>

            <Link
              to="/wishlist"
              className="action-btn wishlist-nav-link"
              aria-label={`View Wishlist (${wishlist.length} items)`}
              title="Wishlist"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
              </svg>
              {wishlist.length > 0 && (
                <span className="badge-count">{wishlist.length}</span>
              )}
            </Link>

            <Link
              to="/cart"
              className="action-btn cart-btn"
              aria-label={`Shopping Bag (${cartItemCount} items)`}
              title="View Cart"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>
                <line x1="3" y1="6" x2="21" y2="6"></line>
                <path d="M16 10a4 4 0 0 1-8 0"></path>
              </svg>
              {cartItemCount > 0 && (
                <span className="badge-count">{cartItemCount}</span>
              )}
            </Link>
          </div>
        </div>
      </nav>

      {/* Mobile Slide-Out Menu Drawer */}
      <div
        className={`drawer-backdrop ${mobileMenuOpen ? "active" : ""}`}
        onClick={() => setMobileMenuOpen(false)}
      />
      <div className={`mobile-nav-drawer ${mobileMenuOpen ? "open" : ""}`}>
        <div className="mobile-nav-header">
          <Link
            to="/"
            className="mobile-brand-logo"
            onClick={() => setMobileMenuOpen(false)}
            aria-label="ZMW"
          >
            <img
              src={process.env.PUBLIC_URL + "/images/zmw-logo-transparent.png"}
              alt="ZMW"
              className="mobile-brand-logo-img"
              width="120"
              height="38"
            />
          </Link>
          <button
            className="drawer-close-btn"
            onClick={() => setMobileMenuOpen(false)}
            aria-label="Close menu"
          >
            ✕
          </button>
        </div>

        <ul className="mobile-nav-list">
          {/* Men */}
          <li className="mobile-nav-expandable">
            <div className="mobile-nav-expand-row">
              <Link
                to="/collection?category=mens"
                className={activeNav === "men" ? "mobile-nav-active" : ""}
                onClick={() => setMobileMenuOpen(false)}
              >
                Men
              </Link>
              <button
                className="mobile-nav-expand-toggle"
                onClick={() => setMobileMenExpanded((v) => !v)}
                aria-label="Expand Men submenu"
                aria-expanded={mobileMenExpanded}
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  style={{ transform: mobileMenExpanded ? "rotate(180deg)" : "none" }}
                >
                  <polyline points="6 9 12 15 18 9"></polyline>
                </svg>
              </button>
            </div>
            {mobileMenExpanded && (
              <ul className="mobile-nav-submenu">
                {MEN_SUBCATEGORIES.map((sub) => (
                  <li key={sub}>
                    <Link
                      to={`/collection?category=mens&type=${encodeURIComponent(sub.toLowerCase())}`}
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      {sub}
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </li>

          {/* Women */}
          <li className="mobile-nav-expandable">
            <div className="mobile-nav-expand-row">
              <Link
                to="/collection?category=women"
                className={activeNav === "women" ? "mobile-nav-active" : ""}
                onClick={() => setMobileMenuOpen(false)}
              >
                Women
              </Link>
              <button
                className="mobile-nav-expand-toggle"
                onClick={() => setMobileWomenExpanded((v) => !v)}
                aria-label="Expand Women submenu"
                aria-expanded={mobileWomenExpanded}
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  style={{ transform: mobileWomenExpanded ? "rotate(180deg)" : "none" }}
                >
                  <polyline points="6 9 12 15 18 9"></polyline>
                </svg>
              </button>
            </div>
            {mobileWomenExpanded && (
              <ul className="mobile-nav-submenu">
                {WOMEN_SUBCATEGORIES.map((sub) => (
                  <li key={sub}>
                    <Link
                      to={`/collection?category=women&type=${encodeURIComponent(sub.toLowerCase())}`}
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      {sub}
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </li>

          {/* Boys */}
          <li className="mobile-nav-expandable">
            <div className="mobile-nav-expand-row">
              <Link
                to="/collection?category=boys"
                className={activeNav === "boys" ? "mobile-nav-active" : ""}
                onClick={() => setMobileMenuOpen(false)}
              >
                Boys
              </Link>
              <button
                className="mobile-nav-expand-toggle"
                onClick={() => setMobileBoysExpanded((v) => !v)}
                aria-label="Expand Boys submenu"
                aria-expanded={mobileBoysExpanded}
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  style={{ transform: mobileBoysExpanded ? "rotate(180deg)" : "none" }}
                >
                  <polyline points="6 9 12 15 18 9"></polyline>
                </svg>
              </button>
            </div>
            {mobileBoysExpanded && (
              <ul className="mobile-nav-submenu">
                {BOYS_SUBCATEGORIES.map((sub) => (
                  <li key={sub}>
                    <Link
                      to={`/collection?category=boys&type=${encodeURIComponent(sub.toLowerCase())}`}
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      {sub}
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </li>

          {/* Girls */}
          <li className="mobile-nav-expandable">
            <div className="mobile-nav-expand-row">
              <Link
                to="/collection?category=girls"
                className={activeNav === "girls" ? "mobile-nav-active" : ""}
                onClick={() => setMobileMenuOpen(false)}
              >
                Girls
              </Link>
              <button
                className="mobile-nav-expand-toggle"
                onClick={() => setMobileGirlsExpanded((v) => !v)}
                aria-label="Expand Girls submenu"
                aria-expanded={mobileGirlsExpanded}
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  style={{ transform: mobileGirlsExpanded ? "rotate(180deg)" : "none" }}
                >
                  <polyline points="6 9 12 15 18 9"></polyline>
                </svg>
              </button>
            </div>
            {mobileGirlsExpanded && (
              <ul className="mobile-nav-submenu">
                {GIRLS_SUBCATEGORIES.map((sub) => (
                  <li key={sub}>
                    <Link
                      to={`/collection?category=girls&type=${encodeURIComponent(sub.toLowerCase())}`}
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      {sub}
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </li>

          {/* Babies */}
          <li className="mobile-nav-expandable">
            <div className="mobile-nav-expand-row">
              <Link
                to="/collection?category=babies"
                className={activeNav === "babies" ? "mobile-nav-active" : ""}
                onClick={() => setMobileMenuOpen(false)}
              >
                Babies
              </Link>
              <button
                className="mobile-nav-expand-toggle"
                onClick={() => setMobileBabiesExpanded((v) => !v)}
                aria-label="Expand Babies submenu"
                aria-expanded={mobileBabiesExpanded}
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  style={{ transform: mobileBabiesExpanded ? "rotate(180deg)" : "none" }}
                >
                  <polyline points="6 9 12 15 18 9"></polyline>
                </svg>
              </button>
            </div>
            {mobileBabiesExpanded && (
              <ul className="mobile-nav-submenu">
                {BABIES_SUBCATEGORIES.map((sub) => (
                  <li key={sub}>
                    <Link
                      to={`/collection?category=babies&type=${encodeURIComponent(sub.toLowerCase())}`}
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      {sub}
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </li>

          <li>
            <Link
              to="/collection?collection=best-sellers"
              className={activeNav === "best-sellers" ? "mobile-nav-active" : ""}
              onClick={() => setMobileMenuOpen(false)}
            >
              Best Seller
            </Link>
          </li>
          <li>
            <Link
              to="/collection?collection=new-arrivals"
              className={activeNav === "new-arrivals" ? "mobile-nav-active" : ""}
              onClick={() => setMobileMenuOpen(false)}
            >
              New Arrival
            </Link>
          </li>
          <li>
            <Link
              to="/wishlist"
              onClick={() => setMobileMenuOpen(false)}
            >
              Wishlist {wishlist.length > 0 ? `(${wishlist.length})` : ""}
            </Link>
          </li>
        </ul>

        <div className="mobile-nav-footer">
          {customerUser ? (
            <div style={{ marginBottom: 12 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: "var(--color-ink)", marginBottom: 8 }}>
                Signed in as <strong>{customerUser.name}</strong>
              </div>
              <Link
                to="/account"
                className="btn btn-secondary btn-sm"
                style={{ width: "100%", marginBottom: "8px", display: "block", textAlign: "center", textDecoration: "none" }}
                onClick={() => setMobileMenuOpen(false)}
              >
                📦 My Account & Orders
              </Link>
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                style={{ width: "100%", marginBottom: "8px" }}
                onClick={() => {
                  setMobileMenuOpen(false);
                  logoutCustomer();
                }}
              >
                Sign Out
              </button>
            </div>
          ) : (
            <button
              type="button"
              className="btn btn-primary btn-sm"
              style={{ width: "100%", marginBottom: "12px" }}
              onClick={() => {
                setMobileMenuOpen(false);
                setAuthModalState("login");
              }}
            >
              Sign In / Register
            </button>
          )}
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            style={{ width: "100%" }}
            onClick={() => {
              setMobileMenuOpen(false);
              setIsOrderTrackOpen(true);
            }}
          >
            Track My Order
          </button>
        </div>
      </div>
    </header>
  );
}