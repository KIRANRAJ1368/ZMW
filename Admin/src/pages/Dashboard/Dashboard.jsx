import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  ShoppingBag,
  FolderTree,
  Image as ImageIcon,
  ArrowRight,
  Shirt,
  Edit2,
  Eye,
  Tag,
  Users,
  Wallet,
  CalendarClock,
  CalendarRange,
  TrendingUp,
  Clock,
  BarChart3,
  RefreshCw,
  Store
} from "lucide-react";
import { dashboardApi, productsApi } from "../../services/resources";
import LoadingState from "../../components/LoadingState/LoadingState";
import StatusBadge from "../../components/StatusBadge/StatusBadge";
import EmptyState from "../../components/EmptyState/EmptyState";
import ProductViewModal from "../../components/ProductViewModal/ProductViewModal";
import "./Dashboard.css";

const formatINR = (value) =>
  "₹" + Number(value ?? 0).toLocaleString("en-IN", { maximumFractionDigits: 2 });

/* ── Animated count-up number display ── */
function StatNumber({ value, prefix = "", suffix = "" }) {
  return (
    <span className="dash-stat-number">
      {prefix}{Number(value ?? 0).toLocaleString("en-IN")}{suffix}
    </span>
  );
}

/* ── Small trend chip ── */
function TrendChip({ label, positive = true }) {
  return (
    <span className={`dash-trend-chip ${positive ? "--up" : "--neutral"}`}>
      <TrendingUp size={11} />
      {label}
    </span>
  );
}

export default function Dashboard() {
  const [summary, setSummary] = useState(null);
  const [recentProducts, setRecentProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [rangeSales, setRangeSales] = useState(null);
  const [rangeLoading, setRangeLoading] = useState(false);
  const [lastRefreshed, setLastRefreshed] = useState(new Date());
  const [viewing, setViewing] = useState(null);

  const fetchData = () => {
    setIsLoading(true);
    Promise.allSettled([
      dashboardApi.summary(),
      productsApi.list({ limit: 8 })
    ]).then(([sumRes, prodsRes]) => {
      if (sumRes.status === "fulfilled") setSummary(sumRes.value.data);
      if (prodsRes.status === "fulfilled") setRecentProducts(prodsRes.value.data?.data || []);
      setLastRefreshed(new Date());
    }).finally(() => setIsLoading(false));
  };

  useEffect(() => { fetchData(); }, []);

  async function handleApplyRange() {
    if (!fromDate || !toDate) return;
    setRangeLoading(true);
    try {
      const res = await dashboardApi.summary({ from: fromDate, to: toDate });
      setRangeSales(res.data?.rangeSales ?? null);
    } catch {
      setRangeSales(null);
    } finally {
      setRangeLoading(false);
    }
  }

  if (isLoading) {
    return <LoadingState label="Loading store dashboard analytics..." />;
  }

  /* ── Derived values ── */
  const totalSales        = summary?.totalSales ?? 0;
  const todaySales        = summary?.todaySales ?? 0;
  const pendingOrders     = summary?.pendingOrders ?? 0;
  const confirmedOrders   = summary?.confirmedOrders ?? 0;
  const packedOrders      = summary?.packedOrders ?? 0;
  const shippedOrders     = summary?.shippedOrders ?? 0;
  const orderCount        = summary?.orderCount ?? 0;
  const deliveredOrders   = summary?.deliveredOrders ?? 0;
  const cancelledOrders   = summary?.cancelledOrders ?? 0;
  const returnedOrders    = summary?.returnedOrders ?? 0;
  const activeOrders      = orderCount - cancelledOrders - returnedOrders;
  const inProgressOrders  = (confirmedOrders + packedOrders + shippedOrders + pendingOrders);
  const newContactCount   = summary?.newContactCount ?? 0;

  const currentDateFormatted = new Date().toISOString().slice(0, 10);
  const refreshedAt = lastRefreshed.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });

  return (
    <div className="dash-page">

      {/* ═══════════════════════════════════════════
          1. WELCOME HEADER
      ═══════════════════════════════════════════ */}
      <div className="dash-welcome">
        <div className="dash-welcome-left">
          <div className="dash-welcome-icon">
            <Store size={22} />
          </div>
          <div>
            <h1 className="dash-welcome-title">Store Dashboard</h1>
            <p className="dash-welcome-sub">
              Real-time overview of your ZMW Clothing storefront
            </p>
          </div>
        </div>
        <div className="dash-welcome-right">
          <span className="dash-refresh-hint">
            <Clock size={12} />
            Updated at {refreshedAt}
          </span>
          <button
            type="button"
            className="dash-refresh-btn"
            onClick={fetchData}
            title="Refresh dashboard data"
          >
            <RefreshCw size={14} />
            Refresh
          </button>
        </div>
      </div>

      {/* ═══════════════════════════════════════════
          2. SALES KPI CARDS
      ═══════════════════════════════════════════ */}
      <section className="dash-section">
        <div className="dash-section-head">
          <BarChart3 size={15} className="dash-section-icon" />
          <span className="dash-section-label">Sales Overview</span>
        </div>

        <div className="dash-sales-grid">
          {/* Total Sales — hero dark card */}
          <div className="dash-kpi-card --dark">
            <div className="dash-kpi-header">
              <div>
                <p className="dash-kpi-label">Total Revenue</p>
                <p className="dash-kpi-note">Excl. cancelled &amp; returned</p>
              </div>
              <div className="dash-kpi-icon-box --gold">
                <Wallet size={18} />
              </div>
            </div>
            <div className="dash-kpi-body">
              <span className="dash-kpi-value --large">{formatINR(totalSales)}</span>
              <TrendChip label="All-time" />
            </div>
          </div>

          {/* Today's Sales */}
          <div className="dash-kpi-card --light">
            <div className="dash-kpi-header">
              <div>
                <p className="dash-kpi-label">Today's Sales</p>
                <p className="dash-kpi-note">Last 24 hours</p>
              </div>
              <div className="dash-kpi-icon-box --amber">
                <CalendarClock size={18} />
              </div>
            </div>
            <div className="dash-kpi-body">
              <span className="dash-kpi-value">{formatINR(todaySales)}</span>
              <TrendChip label="Today" positive={todaySales > 0} />
            </div>
          </div>

          {/* Range Sales */}
          <div className="dash-kpi-card --light">
            <div className="dash-kpi-header">
              <div>
                <p className="dash-kpi-label">Range Sales</p>
                <p className="dash-kpi-note">Selected date period</p>
              </div>
              <div className="dash-kpi-icon-box --amber">
                <CalendarRange size={18} />
              </div>
            </div>
            <div className="dash-kpi-body">
              <span className="dash-kpi-value">
                {rangeSales === null || rangeSales === undefined ? "—" : formatINR(rangeSales)}
              </span>
              {(fromDate && toDate) && (
                <span className="dash-kpi-range-dates">{fromDate} → {toDate}</span>
              )}
            </div>

            {/* Date filter inline */}
            <div className="dash-date-filter">
              <input
                type="date"
                className="dash-date-input"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
                aria-label="From date"
              />
              <span className="dash-date-sep">→</span>
              <input
                type="date"
                className="dash-date-input"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
                aria-label="To date"
              />
              <button
                type="button"
                className="dash-date-apply"
                onClick={handleApplyRange}
                disabled={rangeLoading}
              >
                {rangeLoading ? "…" : "Apply"}
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          3. FOUR PREMIUM SUMMARY CARDS
      ═══════════════════════════════════════════ */}
      <section className="dash-section">
        <div className="dash-section-head">
          <Store size={15} className="dash-section-icon" />
          <span className="dash-section-label">Store Overview</span>
        </div>

        <div className="dash-summary-cards">

          {/* ── Total Products ── */}
          <Link to="/products" className="dash-scard" data-accent="amber">
            <div className="dash-scard-icon-col">
              <div className="dash-scard-icon-ring">
                <Shirt size={22} />
              </div>
            </div>
            <div className="dash-scard-body">
              <p className="dash-scard-label">Total Products</p>
              <p className="dash-scard-value">
                {Number(summary?.productCount ?? 0).toLocaleString("en-IN")}
              </p>
              <p className="dash-scard-sub">
                {summary?.activeProductCount ?? 0} active
                {(summary?.outOfStockCount ?? 0) > 0 && ` · ${summary.outOfStockCount} out of stock`}
              </p>
            </div>
            <div className="dash-scard-arrow">
              <ArrowRight size={15} />
            </div>
          </Link>

          {/* ── Total Orders ── */}
          <Link to="/orders" className="dash-scard" data-accent="green">
            <div className="dash-scard-icon-col">
              <div className="dash-scard-icon-ring">
                <ShoppingBag size={22} />
              </div>
            </div>
            <div className="dash-scard-body">
              <p className="dash-scard-label">Total Orders</p>
              <p className="dash-scard-value">
                {Number(summary?.orderCount ?? 0).toLocaleString("en-IN")}
              </p>
              <p className="dash-scard-sub">
                {summary?.pendingOrders ?? 0} pending
                {(summary?.deliveredOrders ?? 0) > 0 && ` · ${summary.deliveredOrders} delivered`}
              </p>
            </div>
            <div className="dash-scard-arrow">
              <ArrowRight size={15} />
            </div>
          </Link>

          {/* ── Total Registered Customers ── */}
          <Link to="/customers" className="dash-scard" data-accent="rose">
            <div className="dash-scard-icon-col">
              <div className="dash-scard-icon-ring">
                <Users size={22} />
              </div>
            </div>
            <div className="dash-scard-body">
              <p className="dash-scard-label">Registered Customers</p>
              <p className="dash-scard-value">
                {Number(summary?.customerCount ?? 0).toLocaleString("en-IN")}
              </p>
              <p className="dash-scard-sub">
                {Number(summary?.guestOrderCount ?? 0).toLocaleString("en-IN")} guest orders · {Number(summary?.registeredOrderCount ?? 0).toLocaleString("en-IN")} client orders
              </p>
            </div>
            <div className="dash-scard-arrow">
              <ArrowRight size={15} />
            </div>
          </Link>

          {/* ── Total Categories ── */}
          <Link to="/categories" className="dash-scard" data-accent="indigo">
            <div className="dash-scard-icon-col">
              <div className="dash-scard-icon-ring">
                <FolderTree size={22} />
              </div>
            </div>
            <div className="dash-scard-body">
              <p className="dash-scard-label">Total Categories</p>
              <p className="dash-scard-value">
                {Number(summary?.categoryCount ?? 0).toLocaleString("en-IN")}
              </p>
              <p className="dash-scard-sub">
                {summary?.activeCategoryCount ?? 0} active
                {(summary?.subcategoryCount ?? 0) > 0 && ` · ${summary.subcategoryCount} subcategories`}
              </p>
            </div>
            <div className="dash-scard-arrow">
              <ArrowRight size={15} />
            </div>
          </Link>

        </div>
      </section>

      {/* ═══════════════════════════════════════════
          4. ORDERS QUICK-STATS + PRODUCTS TABLE
      ═══════════════════════════════════════════ */}
      <section className="dash-section">
        <div className="dash-section-head">
          <ShoppingBag size={15} className="dash-section-icon" />
          <span className="dash-section-label">Orders &amp; Products</span>
          <span className="dash-section-date">{currentDateFormatted}</span>
        </div>

        <div className="dash-order-stats">
          <div className="dash-order-stat-card">
            <span className="dash-order-stat-label">Pending</span>
            <span className="dash-order-stat-val --warning">{pendingOrders}</span>
          </div>
          <div className="dash-order-stat-card">
            <span className="dash-order-stat-label">In Progress</span>
            <span className="dash-order-stat-val --info">{inProgressOrders}</span>
          </div>
          <div className="dash-order-stat-card">
            <span className="dash-order-stat-label">Delivered</span>
            <span className="dash-order-stat-val --success">{deliveredOrders}</span>
          </div>
          <div className="dash-order-stat-card">
            <span className="dash-order-stat-label">All Orders</span>
            <span className="dash-order-stat-val --dark">{orderCount}</span>
          </div>
          {newContactCount > 0 && (
            <div className="dash-order-stat-card">
              <span className="dash-order-stat-label">New Messages</span>
              <span className="dash-order-stat-val --danger">{newContactCount}</span>
            </div>
          )}
        </div>

        {/* Recent Products Table */}
        <div className="dash-products-card">
          <div className="dash-products-header">
            <h3 className="dash-products-title">Recent Products</h3>
            <Link to="/products" className="dash-products-view-all">
              View All <ArrowRight size={13} />
            </Link>
          </div>

          {recentProducts?.length === 0 ? (
            <EmptyState
              title="No products found"
              description="Your store catalog does not contain any products yet. Add your first piece to begin selling."
            />
          ) : (
            <div className="dash-table-wrap">
              <table className="dash-table">
                <thead>
                  <tr>
                    <th style={{ width: "48px", textAlign: "center" }}>#</th>
                    <th style={{ width: "60px" }}>Image</th>
                    <th>Product</th>
                    <th>Category</th>
                    <th>Price</th>
                    <th>Stock</th>
                    <th style={{ width: "150px", textAlign: "right" }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {recentProducts.slice(0, 8).map((prod, idx) => (
                    <tr key={prod.id}>
                      <td style={{ textAlign: "center" }}>
                        <span className="dash-table-idx">{idx + 1}</span>
                      </td>
                      <td>
                        <div className="dash-table-thumb">
                          {prod.images?.[0] ? (
                            <img
                              src={prod.images[0]}
                              alt={prod.name}
                              className="dash-table-thumb-img"
                              onError={(e) => { e.target.style.display = "none"; }}
                            />
                          ) : (
                            <Shirt size={15} color="#94A3B8" />
                          )}
                        </div>
                      </td>
                      <td>
                        <div className="dash-table-prod">
                          <span className="dash-table-prod-name">{prod.name}</span>
                          <div className="dash-table-prod-meta">
                            <code className="dash-table-sku">{prod.sku}</code>
                            {prod.productType && (
                              <span className="dash-table-type">{prod.productType}</span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td>
                        <div className="dash-table-cats">
                          <span className="dash-table-cat-pill">
                            <Tag size={10} />
                            {prod.category || "—"}
                          </span>
                          {prod.subCategory && (
                            <span className="dash-table-subcat">{prod.subCategory}</span>
                          )}
                        </div>
                      </td>
                      <td>
                        <div className="dash-table-price">
                          <span className="dash-table-price-current">₹{prod.price}</span>
                          {prod.originalPrice && prod.originalPrice > prod.price && (
                            <span className="dash-table-price-mrp">₹{prod.originalPrice}</span>
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
                        <div className="table-actions">
                          <button
                            type="button"
                            className="btn btn-secondary btn-sm"
                            onClick={() => setViewing(prod)}
                            title="View product details"
                          >
                            <Eye size={13} />
                            <span>View</span>
                          </button>
                          <Link
                            to={`/products/${prod.id}/edit`}
                            className="btn btn-secondary btn-sm"
                            title="Edit Product"
                          >
                            <Edit2 size={13} />
                            <span>Edit</span>
                          </Link>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          5. QUICK ACTIONS
      ═══════════════════════════════════════════ */}
      <section className="dash-section">
        <div className="dash-section-head">
          <ArrowRight size={15} className="dash-section-icon" />
          <span className="dash-section-label">Quick Actions</span>
        </div>

        <div className="dash-actions-grid">
          <Link to="/products" className="dash-action-card">
            <div className="dash-action-icon">
              <Shirt size={20} />
            </div>
            <div className="dash-action-body">
              <span className="dash-action-title">Products</span>
              <p className="dash-action-desc">Add, edit, or manage your catalog</p>
            </div>
            <ArrowRight size={16} className="dash-action-arrow" />
          </Link>

          <Link to="/orders" className="dash-action-card">
            <div className="dash-action-icon">
              <ShoppingBag size={20} />
            </div>
            <div className="dash-action-body">
              <span className="dash-action-title">Orders</span>
              <p className="dash-action-desc">View and process customer orders</p>
            </div>
            <ArrowRight size={16} className="dash-action-arrow" />
          </Link>

          <Link to="/banners" className="dash-action-card">
            <div className="dash-action-icon">
              <ImageIcon size={20} />
            </div>
            <div className="dash-action-body">
              <span className="dash-action-title">Banners</span>
              <p className="dash-action-desc">Update hero banners &amp; promotions</p>
            </div>
            <ArrowRight size={16} className="dash-action-arrow" />
          </Link>

          <Link to="/categories" className="dash-action-card">
            <div className="dash-action-icon">
              <FolderTree size={20} />
            </div>
            <div className="dash-action-body">
              <span className="dash-action-title">Categories</span>
              <p className="dash-action-desc">Organize product categories</p>
            </div>
            <ArrowRight size={16} className="dash-action-arrow" />
          </Link>
        </div>
      </section>

      {viewing && (
        <ProductViewModal product={viewing} onClose={() => setViewing(null)} />
      )}
    </div>
  );
}