import { useEffect, useState, useMemo, useCallback } from "react";
import { Link, useSearchParams } from "react-router-dom";
import {
  Boxes,
  Search,
  RefreshCw,
  X,
  Layers,
  ArrowRight,
  ChevronDown,
  ChevronRight,
  Plus,
  Minus,
  Check,
  AlertTriangle,
  TrendingDown
} from "lucide-react";
import { productsApi } from "../../services/resources";
import { useToast } from "../../context/ToastContext";
import { resolveImageUrl } from "../../utils/imageUrl";
import LoadingState from "../../components/LoadingState/LoadingState";
import "./StockManagementPage.css";

export default function StockManagementPage() {
  const [searchParams] = useSearchParams();
  const highlightProductId = searchParams.get("productId");

  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [collapsedMap, setCollapsedMap] = useState({});

  // Adjust modal
  const [adjustingItem, setAdjustingItem] = useState(null);
  const [adjustQtyInput, setAdjustQtyInput] = useState("");
  const [adjustNote, setAdjustNote] = useState("");
  const [isSavingAdjust, setIsSavingAdjust] = useState(false);

  const toast = useToast();

  const loadData = useCallback(
    async (silent = false) => {
      if (!silent) setIsLoading(true);
      else setIsRefreshing(true);
      try {
        const res = await productsApi.list({ limit: 200 });
        setProducts(res.data || []);
      } catch (err) {
        toast.error(err.message || "Failed to load stock data");
      } finally {
        setIsLoading(false);
        setIsRefreshing(false);
      }
    },
    [toast]
  );

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Auto-expand highlighted product
  useEffect(() => {
    if (highlightProductId) {
      setCollapsedMap((prev) => ({ ...prev, [highlightProductId]: false }));
    }
  }, [highlightProductId]);

  function toggleCollapse(productId) {
    setCollapsedMap((prev) => ({
      ...prev,
      [productId]: !prev[productId],
    }));
  }

  const filteredProducts = useMemo(() => {
    if (!searchQuery.trim()) return products;
    const q = searchQuery.toLowerCase();
    return products.filter((prod) => {
      const matchName = prod.name?.toLowerCase().includes(q);
      const matchSku = prod.sku?.toLowerCase().includes(q);
      const matchVar = prod.variants?.some(
        (v) =>
          v.size?.toLowerCase().includes(q) ||
          v.color?.toLowerCase().includes(q) ||
          v.skuSuffix?.toLowerCase().includes(q)
      );
      return matchName || matchSku || matchVar;
    });
  }, [products, searchQuery]);

  // Summary stats
  const stats = useMemo(() => {
    let totalVariants = 0;
    let outOfStock = 0;
    let lowStock = 0;
    let totalStock = 0;
    products.forEach((prod) => {
      (prod.variants || []).forEach((v) => {
        totalVariants++;
        const qty = Number(v.stockCount ?? v.stock_count ?? 0);
        totalStock += qty;
        if (qty === 0) outOfStock++;
        else if (qty <= 5) lowStock++;
      });
    });
    return { totalVariants, outOfStock, lowStock, totalStock };
  }, [products]);

  // Update stock quantity for a variant
  async function handleUpdateVariantStock(product, variantIdx, newQty) {
    const validQty = Math.max(0, parseInt(newQty, 10) || 0);

    const updatedVariants = (product.variants || []).map((v, idx) => ({
      size: v.size,
      color: v.color,
      colorHex: v.colorHex,
      sku_suffix: v.skuSuffix || v.sku_suffix || null,
      stock_count: idx === variantIdx ? validQty : Number(v.stockCount ?? v.stock_count ?? 0),
      price_override: v.priceOverride ?? v.price_override ?? null,
      image_url: v.imageUrl || v.image_url || null,
      gallery_images: v.galleryImages || v.gallery_images || [],
    }));

    // Optimistic update
    setProducts((prev) =>
      prev.map((p) => {
        if (p.id !== product.id) return p;
        const updatedVars = (p.variants || []).map((v, idx) => {
          if (idx !== variantIdx) return v;
          return {
            ...v,
            stockCount: validQty,
            stock_count: validQty,
          };
        });
        const totalStock = updatedVars.reduce(
          (sum, v) => sum + Number(v.stockCount ?? v.stock_count ?? 0),
          0
        );
        return {
          ...p,
          variants: updatedVars,
          stockCount: totalStock,
          inStock: totalStock > 0,
        };
      })
    );

    try {
      await productsApi.saveVariants(product.id, updatedVariants);
      toast.success("Stock updated");
    } catch (err) {
      toast.error(err.message || "Failed to update stock");
      loadData();
    }
  }

  // Open adjust modal
  function handleOpenAdjust(product, variant, variantIdx) {
    const currentStock = Number(
      variant.stockCount ?? variant.stock_count ?? 0
    );
    setAdjustingItem({ product, variant, variantIdx, currentQty: currentStock });
    setAdjustQtyInput(String(currentStock));
    setAdjustNote("");
  }

  // Save adjust from modal
  async function handleSaveAdjust() {
    if (!adjustingItem) return;
    const finalQty = Math.max(0, parseInt(adjustQtyInput, 10) || 0);
    setIsSavingAdjust(true);
    await handleUpdateVariantStock(
      adjustingItem.product,
      adjustingItem.variantIdx,
      finalQty
    );
    setIsSavingAdjust(false);
    setAdjustingItem(null);
  }

  if (isLoading && products.length === 0) {
    return <LoadingState label="Loading Stock Management..." />;
  }

  return (
    <div className="s-page">
      {/* Top Header */}
      <div className="s-header-banner">
        <div className="s-header-left">
          <span className="s-eyebrow">INVENTORY & STOCK</span>
          <div className="s-title-wrap">
            <span className="s-icon-symbol">
              <Boxes size={26} color="var(--primary-text)" />
            </span>
            <h1 className="s-main-title">Stock Management</h1>
          </div>
        </div>

        <div className="s-header-actions">
          <div className="s-search-bar">
            <Search size={15} className="s-search-icon" />
            <input
              type="text"
              placeholder="Search products or variants..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="s-search-input"
              aria-label="Search stock"
            />
            {searchQuery && (
              <button
                type="button"
                className="s-search-clear"
                onClick={() => setSearchQuery("")}
                aria-label="Clear search"
              >
                <X size={14} />
              </button>
            )}
          </div>

          <button
            type="button"
            className="s-btn-secondary"
            onClick={() => loadData(true)}
            disabled={isRefreshing}
            title="Refresh stock data"
          >
            <RefreshCw
              size={14}
              className={isRefreshing ? "spin" : ""}
            />
            <span>{isRefreshing ? "Refreshing..." : "Refresh"}</span>
          </button>

          <Link to="/variants" className="s-btn-outline">
            <Layers size={14} />
            <span>Variants</span>
            <ArrowRight size={13} />
          </Link>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="s-stats-bar">
        <div className="s-stat-card">
          <span className="s-stat-value">{stats.totalVariants}</span>
          <span className="s-stat-label">Total Variants</span>
        </div>
        <div className="s-stat-card">
          <span className="s-stat-value">{stats.totalStock.toLocaleString("en-IN")}</span>
          <span className="s-stat-label">Total Units</span>
        </div>
        {stats.lowStock > 0 && (
          <div className="s-stat-card s-stat-warning">
            <TrendingDown size={14} />
            <span className="s-stat-value">{stats.lowStock}</span>
            <span className="s-stat-label">Low Stock</span>
          </div>
        )}
        {stats.outOfStock > 0 && (
          <div className="s-stat-card s-stat-danger">
            <AlertTriangle size={14} />
            <span className="s-stat-value">{stats.outOfStock}</span>
            <span className="s-stat-label">Out of Stock</span>
          </div>
        )}
      </div>

      {/* Product Cards */}
      <div className="s-cards-list">
        {filteredProducts.length > 0 ? (
          filteredProducts.map((prod) => {
            const variants = prod.variants || [];
            const isCollapsed = collapsedMap[prod.id] === true;

            return (
              <div
                key={prod.id}
                className={`s-prod-card ${
                  String(prod.id) === String(highlightProductId)
                    ? "is-highlighted"
                    : ""
                }`}
              >
                {/* Product Card Header */}
                <div
                  className="s-prod-header"
                  onClick={() => toggleCollapse(prod.id)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) =>
                    e.key === "Enter" && toggleCollapse(prod.id)
                  }
                  aria-expanded={!isCollapsed}
                >
                  <div className="s-prod-header-left">
                    <span className="s-collapse-chevron">
                      {isCollapsed ? (
                        <ChevronRight size={16} />
                      ) : (
                        <ChevronDown size={16} />
                      )}
                    </span>
                    <img
                      src={resolveImageUrl(prod.image || prod.images?.[0])}
                      alt={prod.name}
                      className="s-prod-avatar"
                      onError={(e) => {
                        e.currentTarget.style.display = "none";
                      }}
                    />
                    <div>
                      <h2 className="s-prod-title">{prod.name}</h2>
                      <span className="s-prod-sku">SKU: {prod.sku}</span>
                    </div>
                  </div>

                  <div className="s-prod-header-right">
                    <span className="s-variants-count-badge">
                      {variants.length}{" "}
                      {variants.length === 1 ? "variant" : "variants"}{" "}
                      <span className="s-mini-chevron">
                        {isCollapsed ? "›" : "⌵"}
                      </span>
                    </span>
                  </div>
                </div>

                {/* Stock Table */}
                {!isCollapsed && (
                  <div className="s-table-container">
                    {variants.length > 0 ? (
                      <table className="s-table">
                        <thead>
                          <tr>
                            <th style={{ width: "5%" }}>S.NO</th>
                            <th style={{ width: "22%" }}>VARIANT</th>
                            <th style={{ width: "22%" }}>COLOR / SIZE</th>
                            <th style={{ width: "14%" }}>SKU</th>
                            <th
                              style={{ width: "14%", textAlign: "center" }}
                            >
                              STOCK QTY
                            </th>
                            <th
                              style={{ width: "12%", textAlign: "center" }}
                            >
                              LOW STOCK ALERT
                            </th>
                            <th
                              style={{ width: "11%", textAlign: "right" }}
                            >
                              ACTIONS
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {variants.map((v, vIdx) => {
                            const isDefault = vIdx === 0;
                            const stockCount = Number(
                              v.stockCount ?? v.stock_count ?? 0
                            );
                            const threshold = v.lowStockThreshold ?? 5;
                            const isLow = stockCount > 0 && stockCount <= threshold;
                            const isOut = stockCount === 0;
                            const fullSku =
                              v.skuSuffix || v.sku_suffix
                                ? `${prod.sku}-${v.skuSuffix || v.sku_suffix}`
                                : prod.sku;
                            const variantTitle =
                              v.color ||
                              (isDefault ? "Default" : `Variant ${vIdx + 1}`);

                            return (
                              <tr
                                key={v.id || vIdx}
                                className={
                                  isOut
                                    ? "s-row-out"
                                    : isLow
                                    ? "s-row-low"
                                    : ""
                                }
                              >
                                {/* S.NO */}
                                <td className="s-cell-sno">{vIdx + 1}</td>

                                {/* VARIANT: thumbnail + name + DEFAULT badge */}
                                <td>
                                  <div className="s-variant-info-cell">
                                    {v.imageUrl || v.image_url ? (
                                      <img
                                        src={resolveImageUrl(
                                          v.imageUrl || v.image_url
                                        )}
                                        alt={variantTitle}
                                        className="s-variant-thumb"
                                        onError={(e) => {
                                          e.currentTarget.style.display = "none";
                                        }}
                                      />
                                    ) : (
                                      <img
                                        src={resolveImageUrl(
                                          prod.image || prod.images?.[0]
                                        )}
                                        alt={variantTitle}
                                        className="s-variant-thumb"
                                        onError={(e) => {
                                          e.currentTarget.style.display = "none";
                                        }}
                                      />
                                    )}
                                    <div>
                                      <span className="s-variant-name">
                                        {variantTitle}
                                      </span>
                                      {isDefault && (
                                        <span className="s-badge-default">
                                          DEFAULT
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                </td>

                                {/* COLOR / SIZE */}
                                <td>
                                  <div className="s-color-size-cell">
                                    <span
                                      className="s-color-dot"
                                      style={{
                                        backgroundColor:
                                          v.colorHex || "#181715",
                                      }}
                                    />
                                    <span className="s-color-size-label">
                                      {v.color || "Standard"} /{" "}
                                      {v.size || "Free Size"}
                                    </span>
                                  </div>
                                </td>

                                {/* SKU */}
                                <td>
                                  <span className="s-sku-tag">{fullSku}</span>
                                </td>

                                {/* STOCK QTY - Editable inline */}
                                <td style={{ textAlign: "center" }}>
                                  <div className="s-stock-qty-wrap">
                                    {isOut && (
                                      <span className="s-out-badge">OUT</span>
                                    )}
                                    {isLow && !isOut && (
                                      <AlertTriangle
                                        size={12}
                                        className="s-low-icon"
                                        title="Low stock"
                                      />
                                    )}
                                    <input
                                      type="number"
                                      min="0"
                                      value={stockCount}
                                      onChange={(e) => {
                                        // Debounce: only save on blur to avoid excess API calls
                                        // Optimistic local update via state
                                        const newQty = parseInt(e.target.value, 10) || 0;
                                        setProducts((prev) =>
                                          prev.map((p) => {
                                            if (p.id !== prod.id) return p;
                                            const updatedVars = (p.variants || []).map(
                                              (vv, ii) => {
                                                if (ii !== vIdx) return vv;
                                                return {
                                                  ...vv,
                                                  stockCount: newQty,
                                                  stock_count: newQty,
                                                };
                                              }
                                            );
                                            return { ...p, variants: updatedVars };
                                          })
                                        );
                                      }}
                                      onBlur={(e) => {
                                        handleUpdateVariantStock(
                                          prod,
                                          vIdx,
                                          e.target.value
                                        );
                                      }}
                                      className={`s-stock-qty-input ${isOut ? "is-out" : isLow ? "is-low" : ""}`}
                                      aria-label={`Stock for ${prod.name} ${v.color} ${v.size}`}
                                    />
                                  </div>
                                </td>

                                {/* LOW STOCK THRESHOLD */}
                                <td style={{ textAlign: "center" }}>
                                  <input
                                    type="number"
                                    min="1"
                                    defaultValue={threshold}
                                    className="s-threshold-input"
                                    aria-label="Low stock threshold"
                                    title="Alert when stock falls below this number"
                                  />
                                </td>

                                {/* ACTIONS */}
                                <td style={{ textAlign: "right" }}>
                                  <button
                                    type="button"
                                    className="s-btn-adjust"
                                    onClick={() =>
                                      handleOpenAdjust(prod, v, vIdx)
                                    }
                                    title="Adjust stock quantity"
                                  >
                                    + Adjust
                                  </button>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    ) : (
                      <div className="s-empty-card">
                        <p>No variants configured for this product.</p>
                        <Link
                          to={`/variants?productId=${prod.id}`}
                          className="s-btn-secondary"
                        >
                          <Layers size={13} />
                          <span>Configure Variants</span>
                          <ArrowRight size={12} />
                        </Link>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })
        ) : (
          <div className="s-empty-state">
            <Boxes size={40} color="var(--primary-text)" />
            <h3>No products found</h3>
            <p>Try adjusting your search query.</p>
          </div>
        )}
      </div>

      {/* Quick Adjust Stock Modal */}
      {adjustingItem && (
        <div
          className="s-modal-overlay"
          onClick={() => setAdjustingItem(null)}
          role="dialog"
          aria-modal="true"
          aria-label="Adjust Stock"
        >
          <div
            className="s-modal-box"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="s-modal-header">
              <h2 className="s-modal-title">Adjust Stock Quantity</h2>
              <button
                type="button"
                className="s-modal-close-btn"
                onClick={() => setAdjustingItem(null)}
                aria-label="Close"
              >
                <X size={18} />
              </button>
            </div>

            <div className="s-modal-body">
              {/* Product summary */}
              <div className="s-item-summary">
                <img
                  src={resolveImageUrl(
                    adjustingItem.variant.imageUrl ||
                    adjustingItem.variant.image_url ||
                    adjustingItem.product.image ||
                    adjustingItem.product.images?.[0]
                  )}
                  alt={adjustingItem.product.name}
                  className="s-modal-item-thumb"
                  onError={(e) => {
                    e.currentTarget.style.display = "none";
                  }}
                />
                <div className="s-modal-item-info">
                  <div className="s-modal-item-title">
                    {adjustingItem.product.name}
                  </div>
                  <div className="s-modal-item-sub">
                    <span
                      className="s-color-dot-sm"
                      style={{
                        backgroundColor:
                          adjustingItem.variant.colorHex || "#181715",
                      }}
                    />
                    {adjustingItem.variant.color || "Standard"} /{" "}
                    {adjustingItem.variant.size || "Free Size"}
                  </div>
                  <div className="s-modal-item-current">
                    Current stock:{" "}
                    <strong>{adjustingItem.currentQty} units</strong>
                  </div>
                </div>
              </div>

              {/* Quantity Stepper */}
              <div className="s-adjust-field">
                <label className="s-adjust-label">
                  New Stock Quantity
                </label>
                <div className="s-stepper-row">
                  <button
                    type="button"
                    className="s-stepper-btn"
                    onClick={() =>
                      setAdjustQtyInput(
                        String(
                          Math.max(
                            0,
                            (parseInt(adjustQtyInput, 10) || 0) - 1
                          )
                        )
                      )
                    }
                    aria-label="Decrease by 1"
                  >
                    <Minus size={15} />
                  </button>

                  <input
                    type="number"
                    min="0"
                    value={adjustQtyInput}
                    onChange={(e) => setAdjustQtyInput(e.target.value)}
                    className="s-adjust-qty-input"
                    autoFocus
                    aria-label="Stock quantity"
                  />

                  <button
                    type="button"
                    className="s-stepper-btn"
                    onClick={() =>
                      setAdjustQtyInput(
                        String((parseInt(adjustQtyInput, 10) || 0) + 1)
                      )
                    }
                    aria-label="Increase by 1"
                  >
                    <Plus size={15} />
                  </button>
                </div>

                {/* Quick add presets */}
                <div className="s-quick-pill-group">
                  {[5, 10, 25, 50].map((n) => (
                    <button
                      key={n}
                      type="button"
                      className="s-quick-pill"
                      onClick={() =>
                        setAdjustQtyInput(
                          String((parseInt(adjustQtyInput, 10) || 0) + n)
                        )
                      }
                    >
                      +{n}
                    </button>
                  ))}
                  <button
                    type="button"
                    className="s-quick-pill s-pill-zero"
                    onClick={() => setAdjustQtyInput("0")}
                  >
                    Set to 0 (Out of Stock)
                  </button>
                </div>

                {/* Change summary */}
                {adjustQtyInput !== String(adjustingItem.currentQty) && (
                  <div className="s-change-summary">
                    <span>
                      {parseInt(adjustQtyInput, 10) > adjustingItem.currentQty
                        ? "+"
                        : ""}
                      {(parseInt(adjustQtyInput, 10) || 0) -
                        adjustingItem.currentQty}{" "}
                      units from current stock
                    </span>
                  </div>
                )}
              </div>
            </div>

            <div className="s-modal-footer">
              <button
                type="button"
                className="s-btn-cancel"
                onClick={() => setAdjustingItem(null)}
                disabled={isSavingAdjust}
              >
                Cancel
              </button>
              <button
                type="button"
                className="s-btn-primary"
                onClick={handleSaveAdjust}
                disabled={isSavingAdjust}
              >
                <Check size={16} />
                <span>
                  {isSavingAdjust ? "Saving..." : "Save Stock"}
                </span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
