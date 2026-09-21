import { useState, useEffect } from "react";
import { NavLink, Outlet, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Shirt,
  FolderTree,
  Tags,
  Image as ImageIcon,
  SlidersHorizontal,
  ShoppingBag,
  Mail,
  LogOut,
  Menu,
  X,
  ChevronRight,
  ExternalLink,
  Sparkles
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import "./AdminLayout.css";

const NAV_ITEMS = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "/products", label: "Products", icon: Shirt },
  { to: "/categories", label: "Categories", icon: FolderTree },
  { to: "/subcategories", label: "Subcategories", icon: Tags },
  { to: "/banners", label: "Hero & Banners", icon: ImageIcon },
  { to: "/homepage-sections", label: "Home Layout", icon: SlidersHorizontal },
  { to: "/orders", label: "Orders & Shipping", icon: ShoppingBag },
  { to: "/contact", label: "Customer Inquiries", icon: Mail }
];

export default function AdminLayout() {
  const { admin, logout } = useAuth();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const location = useLocation();

  // Close mobile drawer on route change
  useEffect(() => {
    setMobileNavOpen(false);
  }, [location.pathname]);

  // Current section title for breadcrumb
  const currentItem = NAV_ITEMS.find((item) =>
    item.end ? location.pathname === item.to : location.pathname.startsWith(item.to)
  );

  return (
    <div className="admin-shell">
      {/* Mobile Backdrop */}
      {mobileNavOpen && (
        <div
          className="admin-sidebar-backdrop"
          onClick={() => setMobileNavOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Floating Luxury Sidebar */}
      <aside className={`admin-sidebar ${mobileNavOpen ? "open" : ""}`}>
        {/* Brand Header */}
        <div className="admin-sidebar-brand">
          <div className="admin-brand-left">
            <div className="admin-brand-emblem">
              <img
                src="/images/zmw-logo-transparent.png"
                alt="ZMW"
                className="admin-sidebar-logo-img"
                onError={(e) => {
                  e.target.style.display = "none";
                }}
              />
            </div>
            <div className="admin-badge-atelier">
              <Sparkles size={10} />
              <span>CONSOLE</span>
            </div>
          </div>
          <button
            type="button"
            className="admin-sidebar-close-btn"
            onClick={() => setMobileNavOpen(false)}
            aria-label="Close navigation"
          >
            <X size={18} />
          </button>
        </div>

        {/* Section Heading */}
        <div className="admin-nav-section-title">Store Management</div>

        {/* Navigation links */}
        <nav className="admin-nav">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) => "admin-nav-link" + (isActive ? " active" : "")}
              >
                <span className="admin-nav-icon-wrap">
                  <Icon size={18} className="admin-nav-icon" />
                </span>
                <span className="admin-nav-text">{item.label}</span>
                <span className="admin-nav-active-pip" />
              </NavLink>
            );
          })}
        </nav>

        {/* Sidebar Footer */}
        <div className="admin-sidebar-footer">
          <a
            href="http://localhost:5173"
            target="_blank"
            rel="noopener noreferrer"
            className="admin-storefront-link"
            title="Launch storefront in new window"
          >
            <span>Live Storefront</span>
            <ExternalLink size={13} className="admin-storefront-ext" />
          </a>

          <div className="admin-system-status">
            <span className="admin-status-dot" />
            <span>Store Online &bull; Syncing</span>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="admin-main">
        <header className="admin-header">
          <div className="admin-header-left">
            <button
              type="button"
              className="admin-menu-toggle"
              onClick={() => setMobileNavOpen(true)}
              aria-label="Open navigation menu"
            >
              <Menu size={22} />
            </button>
            <div className="admin-breadcrumbs">
              <span className="breadcrumb-root">ZMW Store</span>
              <ChevronRight size={14} className="breadcrumb-arrow" />
              <span className="breadcrumb-current">{currentItem?.label || "Console"}</span>
            </div>
          </div>

          <div className="admin-header-user">
            <div className="admin-live-badge" title="Fulfillment engine active">
              <span className="admin-status-dot" />
              <span>Production Live</span>
            </div>

            <div className="admin-user-pill">
              <div className="admin-avatar">
                {admin?.name?.[0]?.toUpperCase() || "A"}
              </div>
              <div className="admin-header-info">
                <span className="admin-header-name">{admin?.name || "Store Admin"}</span>
                <span className="admin-header-role">{admin?.role || "Administrator"}</span>
              </div>
            </div>

            <button
              type="button"
              className="btn btn-secondary btn-sm admin-logout-btn"
              onClick={logout}
              title="Sign out of Admin Portal"
            >
              <LogOut size={15} />
              <span>Log out</span>
            </button>
          </div>
        </header>

        <main className="admin-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
