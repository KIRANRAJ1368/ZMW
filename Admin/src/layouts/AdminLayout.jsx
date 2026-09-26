import { useState, useEffect } from "react";
import { NavLink, Outlet, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Shirt,
  FolderTree,
  Tags,
  Image as ImageIcon,
  ShoppingBag,
  Mail,
  Users,
  LogOut,
  Menu,
  X,
  ChevronRight,
  Tag,
  TrendingUp,
  ExternalLink,
  ShieldCheck
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import "./AdminLayout.css";

const NAV_ITEMS = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "/products", label: "Products", icon: Shirt },
  { to: "/categories", label: "Categories", icon: FolderTree },
  { to: "/subcategories", label: "Subcategories", icon: Tags },
  { to: "/banners", label: "Hero & Banners", icon: ImageIcon },
  { to: "/orders", label: "Orders & Shipping", icon: ShoppingBag },
  { to: "/coupons", label: "Coupons & Discounts", icon: Tag },
  { to: "/reports", label: "Reports & Analytics", icon: TrendingUp },
  { to: "/customers", label: "Customers", icon: Users },
  { to: "/contact", label: "Customer Inquiries", icon: Mail }
];

export default function AdminLayout() {
  const { logout } = useAuth();
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
        {/* Brand Header — Centered, clear, prominent logo */}
        <div className="admin-sidebar-brand">
          <div className="admin-brand-center">
            <img
              src="/images/zmw-logo-transparent.png"
              alt="ZMW Clothing"
              className="admin-sidebar-logo-img"
              onError={(e) => {
                e.target.style.display = "none";
              }}
            />
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
        <div className="admin-nav-section-title">Navigation</div>

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

        {/* Redesigned Sidebar Footer with Logout & Live Store link */}
        <div className="admin-sidebar-footer">
          <button
            type="button"
            className="admin-logout-card-btn"
            onClick={logout}
            title="Sign out of Admin Portal"
          >
            <div className="admin-logout-icon-box">
              <LogOut size={16} />
            </div>
            <div className="admin-logout-info">
              <span className="admin-logout-title">Logout</span>
              {/* <span className="admin-logout-role">Admin Session</span> */}
            </div>
          </button>
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
            {/* <a
              href="http://localhost:3000"
              target="_blank"
              rel="noreferrer"
              className="admin-header-store-btn"
              title="Open customer storefront in a new tab"
            >
              <span>Storefront</span>
              <ExternalLink size={13} />
            </a> */}

            <div className="admin-profile-pill">
              <div className="admin-avatar">
                <ShieldCheck size={16} />
              </div>
              <div className="admin-profile-info">
                <span className="admin-profile-role">Admin</span>
              </div>
            </div>

            {/* <button
              type="button"
              className="admin-header-logout-btn"
              onClick={logout}
              title="Sign out of Admin Portal"
            >
              <LogOut size={14} />
              <span>Logout</span>
            </button> */}
          </div>
        </header>

        <main className="admin-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
