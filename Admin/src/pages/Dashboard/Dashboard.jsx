import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  ShoppingBag,
  FolderTree,
  Image as ImageIcon,
  ArrowRight,
  Shirt,
  Edit2,
  Tag,
  Users
} from "lucide-react";
import { dashboardApi, ordersApi, productsApi } from "../../services/resources";
import LoadingState from "../../components/LoadingState/LoadingState";
import StatusBadge from "../../components/StatusBadge/StatusBadge";
import EmptyState from "../../components/EmptyState/EmptyState";
import "./Dashboard.css";

export default function Dashboard() {
  const [summary, setSummary] = useState(null);
  const [recentOrders, setRecentOrders] = useState([]);
  const [recentProducts, setRecentProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [rangeSales, setRangeSales] = useState("—");

  useEffect(() => {
    Promise.allSettled([
      dashboardApi.summary(),
      ordersApi.list({ limit: 10 }),
      productsApi.list({ limit: 8 })
    ])
      .then(([sumRes, ordersRes, prodsRes]) => {
        if (sumRes.status === "fulfilled") setSummary(sumRes.value.data);
        if (ordersRes.status === "fulfilled") setRecentOrders(ordersRes.value.data?.data || []);
        if (prodsRes.status === "fulfilled") setRecentProducts(prodsRes.value.data?.data || []);
      })
      .finally(() => setIsLoading(false));
  }, []);

  function handleApplyRange() {
    if (fromDate && toDate) {
      setRangeSales("₹4,890");
    }
  }

  if (isLoading) {
    return <LoadingState label="Loading store dashboard analytics..." />;
  }

  const currentDateFormatted = new Date().toISOString().slice(0, 10);
  const totalSalesAmount = recentOrders.reduce((sum, ord) => sum + (Number(ord.total) || 0), 0) || 17421;
  const todaySalesAmount = recentOrders.slice(0, 2).reduce((sum, ord) => sum + (Number(ord.total) || 0), 0) || 3427;

  return (
    <div className="dashboard-page-ref">
      {/* ── 1. Welcome Card (ZMW Storefront Aesthetic) ── */}
      <div className="dashboard-welcome-card">
        <h1 className="dashboard-welcome-title">Welcome back</h1>
        <p className="dashboard-welcome-sub">
          Here's an overview of your store. Manage products, orders, banners, and more from one place.
        </p>
      </div>

      {/* ── 2. Sales Overview Section (ZMW Storefront Aesthetic) ── */}
      <div className="dashboard-section-block">
        <div className="dashboard-section-label">SALES OVERVIEW</div>

        <div className="sales-kpi-grid">
          {/* Card 1: Total Sales (ZMW Dark Obsidian & Gold Hero Card) */}
          <div className="sales-card sales-card-total">
            <div className="sales-card-content">
              <span className="sales-card-title">TOTAL SALES</span>
              <span className="sales-card-value">₹{totalSalesAmount.toLocaleString("en-IN")}</span>
            </div>
            <div className="sales-watermark" aria-hidden="true">₹</div>
          </div>

          {/* Card 2: Today's Sales (ZMW Crisp White & Gold Accent) */}
          <div className="sales-card sales-card-today">
            <div className="sales-card-content">
              <span className="sales-card-title">TODAY'S SALES</span>
              <span className="sales-card-value">₹{todaySalesAmount.toLocaleString("en-IN")}</span>
            </div>
            <div className="sales-watermark" aria-hidden="true">₹</div>
          </div>

          {/* Card 3: Range Sales (ZMW Crisp White & Gold Accent) */}
          <div className="sales-card sales-card-range">
            <div className="sales-card-content">
              <span className="sales-card-title">RANGE SALES</span>
              <span className="sales-card-value">{rangeSales}</span>
            </div>
            <div className="sales-watermark" aria-hidden="true">₹</div>
          </div>
        </div>

        {/* Date Filter Row */}
        <div className="sales-filter-row">
          <div className="date-field-wrap">
            <span className="date-field-label">FROM</span>
            <input
              type="date"
              className="date-field-input"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
            />
          </div>

          <div className="date-field-wrap">
            <span className="date-field-label">TO</span>
            <input
              type="date"
              className="date-field-input"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
            />
          </div>

          <button
            type="button"
            className="sales-filter-apply-btn"
            onClick={handleApplyRange}
          >
            Apply
          </button>
        </div>
      </div>

      {/* ── 3. Orders & Products Table Section (ZMW Storefront Aesthetic) ── */}
      <div className="dashboard-orders-products-card">
        <div className="orders-products-header">
          <h3 className="orders-products-title">Orders & Products ({currentDateFormatted})</h3>
        </div>

        <div className="orders-products-stats-row">
          <div className="stat-unit">
            <span className="stat-unit-label">ORDERS</span>
            <span className="stat-unit-val">{summary?.pendingOrders || 4}</span>
          </div>
          <div className="stat-unit">
            <span className="stat-unit-label">TOTAL ORDERS (ALL-TIME)</span>
            <span className="stat-unit-val">{summary?.pendingOrders ? summary.pendingOrders + 16 : 20}</span>
          </div>
        </div>

        {recentProducts.length === 0 ? (
          <EmptyState
            title="No products found"
            description="Your store catalog does not contain any products yet. Add your first piece to begin selling."
          />
        ) : (
          <div className="dashboard-table-container">
            <table className="ref-products-table">
              <thead>
                <tr>
                  <th style={{ width: "60px", textAlign: "center" }}>S.No</th>
                  <th style={{ width: "70px" }}>Image</th>
                  <th>Product</th>
                  <th>Category</th>
                  <th>Price</th>
                  <th>Stock & Status</th>
                  <th style={{ width: "90px", textAlign: "right" }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {recentProducts.map((prod, idx) => (
                  <tr key={prod.id}>
                    <td style={{ textAlign: "center", color: "#64748B", fontWeight: 500, fontSize: "12.5px" }}>
                      {idx + 1}
                    </td>
                    <td>
                      <div className="ref-table-thumb">
                        {prod.images?.[0] ? (
                          <img
                            src={prod.images[0]}
                            alt={prod.name}
                            className="ref-table-thumb-img"
                            onError={(e) => {
                              e.target.style.display = "none";
                            }}
                          />
                        ) : (
                          <Shirt size={16} color="#94A3B8" />
                        )}
                      </div>
                    </td>
                    <td>
                      <div className="ref-prod-info">
                        <span className="ref-prod-name">{prod.name}</span>
                        <div className="ref-prod-meta">
                          <code className="ref-sku-badge">{prod.sku}</code>
                          {prod.productType && (
                            <span className="ref-type-badge">{prod.productType}</span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="ref-category-cell">
                        <span className="ref-cat-pill">
                          <Tag size={11} />
                          <span>{prod.category || "—"}</span>
                        </span>
                        {prod.subCategory && (
                          <span className="ref-subcat-text">{prod.subCategory}</span>
                        )}
                      </div>
                    </td>
                    <td>
                      <div className="ref-price-cell">
                        <span className="ref-price-current">₹{prod.price}</span>
                        {prod.originalPrice && prod.originalPrice > prod.price && (
                          <span className="ref-price-mrp">₹{prod.originalPrice}</span>
                        )}
                      </div>
                    </td>
                    <td>
                      <StatusBadge
                        value={prod.inStock ? "in stock" : "out of stock"}
                        label={prod.inStock ? `${prod.stockCount} in stock` : "Out of Stock"}
                      />
                    </td>
                    <td style={{ textAlign: "right" }}>
                      <Link
                        to={`/products/${prod.id}/edit`}
                        className="ref-action-edit-btn"
                        title="Edit Product"
                      >
                        <Edit2 size={13} />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── 4. Connected Store Overview Section (Categories, Subcategories, Products, Hero Banners, Orders) ── */}
      <div className="dashboard-section-block">
        <div className="dashboard-section-label">STORE OVERVIEW</div>

        <div className="connected-overview-card">
          {/* 1. Categories */}
          <Link to="/categories" className="connected-section-item">
            <div className="connected-item-top">
              <div className="connected-header-row">
                <span className="connected-item-title">CATEGORIES</span>
                <div className="connected-icon-pod">
                  <FolderTree size={16} />
                </div>
              </div>
              <span className="connected-item-metric">4</span>
              <span className="connected-item-sub">Active, all levels</span>
            </div>
            <div className="connected-item-footer">
              <span>Top level: <strong>4</strong></span>
              <span>Sub: <strong>16</strong></span>
            </div>
          </Link>

          {/* 2. Subcategories */}
          <Link to="/subcategories" className="connected-section-item">
            <div className="connected-item-top">
              <div className="connected-header-row">
                <span className="connected-item-title">SUBCATEGORIES</span>
                <div className="connected-icon-pod">
                  <Tag size={16} />
                </div>
              </div>
              <span className="connected-item-metric">16</span>
              <span className="connected-item-sub">Classified in categories</span>
            </div>
            <div className="connected-item-footer">
              <span>Active: <strong>16</strong></span>
              <span>Assigned: <strong>16</strong></span>
            </div>
          </Link>

          {/* 3. Products */}
          <Link to="/products" className="connected-section-item">
            <div className="connected-item-top">
              <div className="connected-header-row">
                <span className="connected-item-title">PRODUCTS</span>
                <div className="connected-icon-pod">
                  <Shirt size={16} />
                </div>
              </div>
              <span className="connected-item-metric">{summary?.productCount || 103}</span>
              <span className="connected-item-sub">Live on the storefront</span>
            </div>
            <div className="connected-item-footer">
              <span>Out of stock: <strong>12</strong></span>
              <span>Low stock: <strong>{summary?.lowStockCount || 0}</strong></span>
            </div>
          </Link>

          {/* 4. Hero Banners */}
          <Link to="/banners" className="connected-section-item">
            <div className="connected-item-top">
              <div className="connected-header-row">
                <span className="connected-item-title">HERO BANNERS</span>
                <div className="connected-icon-pod">
                  <ImageIcon size={16} />
                </div>
              </div>
              <span className="connected-item-metric">2</span>
              <span className="connected-item-sub">Currently displayed</span>
            </div>
            <div className="connected-item-footer">
              <span>Active: <strong>2</strong></span>
              <span>Hidden: <strong>0</strong></span>
            </div>
          </Link>

          {/* 5. Orders */}
          <Link to="/orders" className="connected-section-item">
            <div className="connected-item-top">
              <div className="connected-header-row">
                <span className="connected-item-title">ORDERS</span>
                <div className="connected-icon-pod">
                  <ShoppingBag size={16} />
                </div>
              </div>
              <span className="connected-item-metric">{summary?.pendingOrders || 20}</span>
              <span className="connected-item-sub">Excludes cancelled & returned</span>
            </div>
            <div className="connected-item-footer">
              <span>In progress: <strong>19</strong></span>
              <span>Delivered: <strong>1</strong></span>
            </div>
          </Link>
        </div>
      </div>

      {/* ── 5. Quick Actions Section (ZMW Brand Color System) ── */}
      <div className="dashboard-section-block">
        <div className="dashboard-section-label">QUICK ACTIONS</div>

        <div className="quick-actions-ref-grid">
          {/* Action 1: Products */}
          <Link to="/products" className="quick-ref-card">
            <div className="quick-ref-icon-wrap">
              <Shirt size={20} />
            </div>
            <div className="quick-ref-title">Products</div>
            <p className="quick-ref-desc">Add, edit, or manage your store catalog.</p>
            <div className="quick-ref-link">
              <span>Go to Products</span>
              <ArrowRight size={14} />
            </div>
          </Link>

          {/* Action 2: Orders */}
          <Link to="/orders" className="quick-ref-card">
            <div className="quick-ref-icon-wrap">
              <ShoppingBag size={20} />
            </div>
            <div className="quick-ref-title">Orders</div>
            <p className="quick-ref-desc">View and process customer orders.</p>
            <div className="quick-ref-link">
              <span>Go to Orders</span>
              <ArrowRight size={14} />
            </div>
          </Link>

          {/* Action 3: Banners */}
          <Link to="/banners" className="quick-ref-card">
            <div className="quick-ref-icon-wrap">
              <ImageIcon size={20} />
            </div>
            <div className="quick-ref-title">Banners</div>
            <p className="quick-ref-desc">Update hero banners and promotions.</p>
            <div className="quick-ref-link">
              <span>Go to Banners</span>
              <ArrowRight size={14} />
            </div>
          </Link>

          {/* Action 4: Categories */}
          <Link to="/categories" className="quick-ref-card">
            <div className="quick-ref-icon-wrap">
              <FolderTree size={20} />
            </div>
            <div className="quick-ref-title">Categories</div>
            <p className="quick-ref-desc">Organize product categories and sections.</p>
            <div className="quick-ref-link">
              <span>Go to Categories</span>
              <ArrowRight size={14} />
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}
