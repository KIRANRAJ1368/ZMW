import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { Link, useLocation } from "react-router-dom";
import { useShop } from "../../context/ShopContext";
import { MEN_SUBCATEGORIES, WOMEN_SUBCATEGORIES, BOYS_SUBCATEGORIES, GIRLS_SUBCATEGORIES, BABIES_SUBCATEGORIES } from "../../data/products";
import "./Navbar.css";

export default function Navbar() {
  const {
    homeData,
    cartItemCount,
    wishlist,
    wishlistCount,
    setIsCartOpen,
    setIsWishlistOpen,
    setIsSearchOpen,
    setAuthModalState,
    setIsOrderTrackOpen,
    customerUser,
    logoutCustomer
  } = useShop();

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

  const getSubcategories = useCallback((categoryKey, fallbackList) => {
    if (!homeData?.categories?.length) {
      return fallbackList.map((name) => ({ name, type: name.toLowerCase() }));
    }
    const cat = homeData.categories.find(
      (c) =>
        c.slug?.toLowerCase() === categoryKey.toLowerCase() ||
        c.name?.toLowerCase() === categoryKey.toLowerCase() ||
        (categoryKey === "mens" && (c.slug?.toLowerCase() === "men" || c.name?.toLowerCase() === "men")) ||
        (categoryKey === "women" && (c.slug?.toLowerCase() === "womens" || c.name?.toLowerCase() === "women"))
    );
    if (cat?.subcategories && cat.subcategories.length > 0) {
      return cat.subcategories.map((s) => ({
        name: s.name,
        type: (s.name || s.slug).toLowerCase()
      }));
    }
    return fallbackList.map((name) => ({ name, type: name.toLowerCase() }));
  }, [homeData]);

  const menSubcategories = useMemo(() => getSubcategories("mens", MEN_SUBCATEGORIES), [getSubcategories]);
  const womenSubcategories = useMemo(() => getSubcategories("women", WOMEN_SUBCATEGORIES), [getSubcategories]);
  const boysSubcategories = useMemo(() => getSubcategories("boys", BOYS_SUBCATEGORIES), [getSubcategories]);
  const girlsSubcategories = useMemo(() => getSubcategories("girls", GIRLS_SUBCATEGORIES), [getSubcategories]);
  const babiesSubcategories = useMemo(() => getSubcategories("babies", BABIES_SUBCATEGORIES), [getSubcategories]);

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
    setUserDropdownOpen(false);
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

  // Close menus & drawer on route / search changes
  useEffect(() => {
    setMobileMenuOpen(false);
    closeAllMenus();
  }, [location.pathname, location.search, closeAllMenus]);

  // Close menus & user dropdown on outside click
  useEffect(() => {
    if (!openDesktopMenu && !userDropdownOpen) return;
    const handleClickOutside = (e) => {
      if (desktopNavRef.current && !desktopNavRef.current.contains(e.target)) {
        closeAllMenus();
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [openDesktopMenu, userDropdownOpen, closeAllMenus]);

  // Close menus on Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        setMobileMenuOpen(false);
        closeAllMenus();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [closeAllMenus]);

  // Automatically close mobile menu if window resizes to desktop width
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 992) {
        setMobileMenuOpen(false);
      } else {
        closeAllMenus();
      }
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [closeAllMenus]);

  // Lock body scroll when mobile menu drawer is open
  useEffect(() => {
    if (mobileMenuOpen) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [mobileMenuOpen]);

  const toggleDesktopMenu = (menu) => {
    setOpenDesktopMenu((prev) => (prev === menu ? null : menu));
    setOpenFlyout(null);
  };

  const handleCategoryNameClick = (_e, menu) => {
    toggleDesktopMenu(menu);
  };

  return (
    <>
      <header className="site-header">
        <nav className={`main-navbar ${isScrolled ? "navbar-scrolled" : ""}`}>
        <div className="container navbar-inner" ref={desktopNavRef}>
          <button
            className={`hamburger-btn ${mobileMenuOpen ? "active" : ""}`}
            onClick={() => {
              setMobileMenuOpen((prev) => !prev);
              closeAllMenus();
            }}
            aria-label="Toggle navigation menu"
            aria-expanded={mobileMenuOpen}
            aria-controls="mobile-nav-drawer"
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
                      {menSubcategories.map((sub) => (
                        <li key={sub.name}>
                          <Link
                            to={`/collection?category=mens&type=${encodeURIComponent(sub.type)}`}
                            onClick={closeAllMenus}
                          >
                            {sub.name}
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
                      {womenSubcategories.map((sub) => (
                        <li key={sub.name}>
                          <Link
                            to={`/collection?category=women&type=${encodeURIComponent(sub.type)}`}
                            onClick={closeAllMenus}
                          >
                            {sub.name}
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
                      {boysSubcategories.map((sub) => (
                        <li key={sub.name}>
                          <Link
                            to={`/collection?category=boys&type=${encodeURIComponent(sub.type)}`}
                            onClick={closeAllMenus}
                          >
                            {sub.name}
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
                      {girlsSubcategories.map((sub) => (
                        <li key={sub.name}>
                          <Link
                            to={`/collection?category=girls&type=${encodeURIComponent(sub.type)}`}
                            onClick={closeAllMenus}
                          >
                            {sub.name}
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
                      {babiesSubcategories.map((sub) => (
                        <li key={sub.name}>
                          <Link
                            to={`/collection?category=babies&type=${encodeURIComponent(sub.type)}`}
                            onClick={closeAllMenus}
                          >
                            {sub.name}
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
              aria-label={`View Wishlist (${wishlistCount} items)`}
              title="Wishlist"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
              </svg>
              {wishlistCount > 0 && (
                <span className="badge-count">{wishlistCount}</span>
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
      <div
        id="mobile-nav-drawer"
        role="dialog"
        aria-modal="true"
        aria-label="Navigation menu"
        aria-hidden={!mobileMenuOpen}
        className={`mobile-nav-drawer ${mobileMenuOpen ? "open" : ""}`}
      >
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
                {menSubcategories.map((sub) => (
                  <li key={sub.name}>
                    <Link
                      to={`/collection?category=mens&type=${encodeURIComponent(sub.type)}`}
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      {sub.name}
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
                {womenSubcategories.map((sub) => (
                  <li key={sub.name}>
                    <Link
                      to={`/collection?category=women&type=${encodeURIComponent(sub.type)}`}
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      {sub.name}
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
                {boysSubcategories.map((sub) => (
                  <li key={sub.name}>
                    <Link
                      to={`/collection?category=boys&type=${encodeURIComponent(sub.type)}`}
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      {sub.name}
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
                {girlsSubcategories.map((sub) => (
                  <li key={sub.name}>
                    <Link
                      to={`/collection?category=girls&type=${encodeURIComponent(sub.type)}`}
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      {sub.name}
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
                {babiesSubcategories.map((sub) => (
                  <li key={sub.name}>
                    <Link
                      to={`/collection?category=babies&type=${encodeURIComponent(sub.type)}`}
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      {sub.name}
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
              Wishlist {wishlistCount > 0 ? `(${wishlistCount})` : ""}
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
    <div className="site-header-spacer" aria-hidden="true" />
  </>
  );
}