import React, { useState, useEffect, useRef, useCallback } from "react";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import { useShop } from "../../context/ShopContext";
import { MEN_SUBCATEGORIES, WOMEN_SUBCATEGORIES, KIDS_SUBCATEGORIES, MEN_FLYOUT } from "../../data/products";
import "./Navbar.css";

const PROMO_MESSAGES = [
  "✨ NEW CUSTOMERS SAVE 10% WITH CODE WELCOME10 | FREE SHIPPING OVER ₹6,225",
  "🌿 100% ORGANIC & SUSTAINABLY SOURCED NATURAL FIBRES",
  "✈️ COMPLIMENTARY EXPRESS WORLDWIDE SHIPPING ON ORDERS ₹12,450+"
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
    formatPrice
  } = useShop();

  const [promoIndex, setPromoIndex] = useState(0);
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [openDesktopMenu, setOpenDesktopMenu] = useState(null);
  const [openFlyout, setOpenFlyout] = useState(null);
  const [mobileMenExpanded, setMobileMenExpanded] = useState(false);
  const [mobileWomenExpanded, setMobileWomenExpanded] = useState(false);
  const [mobileKidsExpanded, setMobileKidsExpanded] = useState(false);
  const [mobileMenFlyout, setMobileMenFlyout] = useState(null);

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
        el.scrollIntoView({ behavior: "smooth" });
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

          <Link to="/" className="brand-logo" onClick={closeAllMenus}>
            <span className="brand-main">ZMW</span>
          </Link>

          <ul className="nav-links">
            <li>
              <NavLink to="/" end className="nav-link">
                Home
              </NavLink>
            </li>

            {/* Men */}
            <li className="nav-item has-dropdown">
              <div className="nav-item-row">
                <NavLink
                  to="/men"
                  className="nav-link"
                  onClick={() => toggleDesktopMenu("men")}
                >
                  Men
                </NavLink>
                <button
                  type="button"
                  className="nav-caret-btn"
                  onClick={() => toggleDesktopMenu("men")}
                  aria-haspopup="true"
                  aria-expanded={openDesktopMenu === "men"}
                  aria-label="Open Men menu"
                >
                  <svg className="nav-caret" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4">
                    <polyline points="6 9 12 15 18 9"></polyline>
                  </svg>
                </button>
              </div>

              {openDesktopMenu === "men" && (
                <div className="mega-dropdown">
                  <ul className="dropdown-col">
                    {MEN_SUBCATEGORIES.map((sub) => {
                      const hasFlyout = Boolean(MEN_FLYOUT[sub]);
                      return (
                        <li
                          key={sub}
                          className={hasFlyout ? "has-flyout" : ""}
                          onMouseEnter={() => hasFlyout && setOpenFlyout(sub)}
                          onMouseLeave={() => hasFlyout && setOpenFlyout(null)}
                        >
                          <Link
                            to={`/men?category=${encodeURIComponent(sub)}`}
                            onClick={(e) => {
                              if (hasFlyout) {
                                e.preventDefault();
                                setOpenFlyout((prev) => (prev === sub ? null : sub));
                                return;
                              }
                              closeAllMenus();
                            }}
                          >
                            {sub}
                            {hasFlyout && (
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <polyline points="9 18 15 12 9 6"></polyline>
                              </svg>
                            )}
                          </Link>

                          {hasFlyout && openFlyout === sub && (
                            <ul className="dropdown-col dropdown-flyout">
                              <li className="dropdown-flyout-heading">{sub}</li>
                              {MEN_FLYOUT[sub].map((item) => (
                                <li key={item}>
                                  <Link
                                    to={`/men?category=${encodeURIComponent(sub)}&subcategory=${encodeURIComponent(item)}`}
                                    onClick={closeAllMenus}
                                  >
                                    {item}
                                  </Link>
                                </li>
                              ))}
                            </ul>
                          )}
                        </li>
                      );
                    })}
                  </ul>
                </div>
              )}
            </li>

            {/* Women */}
            <li className="nav-item has-dropdown">
              <div className="nav-item-row">
                <NavLink
                  to="/women"
                  className="nav-link"
                  onClick={() => toggleDesktopMenu("women")}
                >
                  Women
                </NavLink>
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
                  <ul className="dropdown-col">
                    {WOMEN_SUBCATEGORIES.map((sub) => (
                      <li key={sub}>
                        <Link
                          to={`/women?category=${encodeURIComponent(sub)}`}
                          onClick={closeAllMenus}
                        >
                          {sub}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </li>

            {/* Kids */}
            <li className="nav-item has-dropdown">
              <div className="nav-item-row">
                <NavLink
                  to="/kids"
                  className="nav-link"
                  onClick={() => toggleDesktopMenu("kids")}
                >
                  Kids
                </NavLink>
                <button
                  type="button"
                  className="nav-caret-btn"
                  onClick={() => toggleDesktopMenu("kids")}
                  aria-haspopup="true"
                  aria-expanded={openDesktopMenu === "kids"}
                  aria-label="Open Kids menu"
                >
                  <svg className="nav-caret" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4">
                    <polyline points="6 9 12 15 18 9"></polyline>
                  </svg>
                </button>
              </div>

              {openDesktopMenu === "kids" && (
                <div className="mega-dropdown">
                  <ul className="dropdown-col">
                    {KIDS_SUBCATEGORIES.map((sub) => (
                      <li key={sub}>
                        <Link
                          to={`/kids?category=${encodeURIComponent(sub)}`}
                          onClick={closeAllMenus}
                        >
                          {sub}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </li>

            <li>
              <Link
                to="/#most-loved-pieces"
                className="nav-link"
                onClick={(e) => handleSectionClick(e, "most-loved-pieces")}
              >
                Best Seller
              </Link>
            </li>
            <li>
              <Link
                to="/#whats-new-this-season"
                className="nav-link"
                onClick={(e) => handleSectionClick(e, "whats-new-this-season")}
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

            <button
              className="action-btn"
              onClick={() => setAuthModalState("login")}
              aria-label="Account Login"
              title="Customer Login / Register"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                <circle cx="12" cy="7" r="4"></circle>
              </svg>
            </button>

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

            <button
              className="action-btn cart-btn"
              onClick={() => setIsCartOpen(true)}
              aria-label="Shopping Bag"
              title="View Bag"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>
                <line x1="3" y1="6" x2="21" y2="6"></line>
                <path d="M16 10a4 4 0 0 1-8 0"></path>
              </svg>
              {cartItemCount > 0 && (
                <span className="badge-count">{cartItemCount}</span>
              )}
              <span className="cart-preview-price hide-mobile">
                {formatPrice(cartSubtotal)}
              </span>
            </button>
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
          <span className="brand-main">ZMW</span>
          <button
            className="drawer-close-btn"
            onClick={() => setMobileMenuOpen(false)}
            aria-label="Close menu"
          >
            ✕
          </button>
        </div>

        <ul className="mobile-nav-list">
          <li>
            <Link to="/" onClick={() => setMobileMenuOpen(false)}>
              Home
            </Link>
          </li>

          <li className="mobile-nav-expandable">
            <div className="mobile-nav-expand-row">
              <Link
                to="/men"
                onClick={() => setMobileMenExpanded((v) => !v)}
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
                {MEN_SUBCATEGORIES.map((sub) => {
                  const flyoutItems = MEN_FLYOUT[sub];
                  return flyoutItems ? (
                    <li key={sub} className="mobile-nav-expandable">
                      <div className="mobile-nav-expand-row">
                        <Link
                          to={`/men?category=${encodeURIComponent(sub)}`}
                          onClick={() => setMobileMenuOpen(false)}
                        >
                          {sub}
                        </Link>
                        <button
                          className="mobile-nav-expand-toggle"
                          onClick={() =>
                            setMobileMenFlyout((prev) => (prev === sub ? null : sub))
                          }
                          aria-label={`Expand ${sub} submenu`}
                          aria-expanded={mobileMenFlyout === sub}
                        >
                          <svg
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            style={{
                              transform: mobileMenFlyout === sub ? "rotate(180deg)" : "none"
                            }}
                          >
                            <polyline points="9 18 15 12 9 6"></polyline>
                          </svg>
                        </button>
                      </div>
                      {mobileMenFlyout === sub && (
                        <ul className="mobile-nav-submenu">
                          {flyoutItems.map((item) => (
                            <li key={item}>
                              <Link
                                to={`/men?category=${encodeURIComponent(sub)}&subcategory=${encodeURIComponent(item)}`}
                                onClick={() => setMobileMenuOpen(false)}
                              >
                                {item}
                              </Link>
                            </li>
                          ))}
                        </ul>
                      )}
                    </li>
                  ) : (
                    <li key={sub}>
                      <Link
                        to={`/men?category=${encodeURIComponent(sub)}`}
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        {sub}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            )}
          </li>

          <li className="mobile-nav-expandable">
            <div className="mobile-nav-expand-row">
              <Link
                to="/women"
                onClick={() => setMobileWomenExpanded((v) => !v)}
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
                      to={`/women?category=${encodeURIComponent(sub)}`}
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      {sub}
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </li>

          <li className="mobile-nav-expandable">
            <div className="mobile-nav-expand-row">
              <Link
                to="/kids"
                onClick={() => setMobileKidsExpanded((v) => !v)}
              >
                Kids
              </Link>
              <button
                className="mobile-nav-expand-toggle"
                onClick={() => setMobileKidsExpanded((v) => !v)}
                aria-label="Expand Kids submenu"
                aria-expanded={mobileKidsExpanded}
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  style={{ transform: mobileKidsExpanded ? "rotate(180deg)" : "none" }}
                >
                  <polyline points="6 9 12 15 18 9"></polyline>
                </svg>
              </button>
            </div>
            {mobileKidsExpanded && (
              <ul className="mobile-nav-submenu">
                {KIDS_SUBCATEGORIES.map((sub) => (
                  <li key={sub}>
                    <Link
                      to={`/kids?category=${encodeURIComponent(sub)}`}
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
              to="/#most-loved-pieces"
              onClick={(e) => handleSectionClick(e, "most-loved-pieces")}
            >
              Best Seller
            </Link>
          </li>
          <li>
            <Link
              to="/#whats-new-this-season"
              onClick={(e) => handleSectionClick(e, "whats-new-this-season")}
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
          <button
            className="btn btn-primary btn-sm"
            style={{ width: "100%", marginBottom: "12px" }}
            onClick={() => {
              setMobileMenuOpen(false);
              setAuthModalState("login");
            }}
          >
            Sign In / Register
          </button>
          <button
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