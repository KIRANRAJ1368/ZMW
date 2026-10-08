import { useEffect, useState, useMemo, useCallback, useRef } from "react";
import { Link, useSearchParams } from "react-router-dom";
import {
  Layers,
  Search,
  Plus,
  Trash2,
  Edit2,
  X,
  ChevronDown,
  ChevronRight,
  Check,
  UploadCloud,
  AlertCircle,
  Image as ImageIcon
} from "lucide-react";
import { productsApi, uploadApi } from "../../services/resources";
import { useToast } from "../../context/ToastContext";
import { useConfirm } from "../../components/ConfirmDialog/ConfirmDialog";
import { resolveImageUrl } from "../../utils/imageUrl";
import LoadingState from "../../components/LoadingState/LoadingState";
import Pagination from "../../components/Pagination/Pagination";
import "./VariantManagementPage.css";

const PRODUCTS_PER_PAGE = 20;

const SIZE_PRESETS = ["Free Size", "XS", "S", "M", "L", "XL", "XXL", "3XL"];

const POPULAR_COLORS = [
  { name: "Sunflower Yellow", hex: "#EAB308" },
  { name: "Midnight Blue", hex: "#1E3A8A" },
  { name: "Jet Black", hex: "#181715" },
  { name: "Off White", hex: "#F3EFE4" },
  { name: "Cherry Red", hex: "#DC2626" },
  { name: "Military Green", hex: "#4B5A3F" },
  { name: "Charcoal Grey", hex: "#374151" },
  { name: "Beige", hex: "#D4C5B9" },
  { name: "Royal Blue", hex: "#1D4ED8" },
  { name: "Forest Green", hex: "#166534" },
];

const GST_OPTIONS = [
  { label: "5% (SGST 2.5% + CGST 2.5%)", value: "5" },
  { label: "12% (SGST 6% + CGST 6%)", value: "12" },
  { label: "18% (SGST 9% + CGST 9%)", value: "18" },
  { label: "0% (Exempted)", value: "0" },
];

export default function VariantManagementPage() {
  const [searchParams] = useSearchParams();
  const highlightProductId = searchParams.get("productId");

  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [expandedMap, setExpandedMap] = useState({});

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingVariant, setEditingVariant] = useState(null);

  const toast = useToast();
  const [confirm, ConfirmModal] = useConfirm();

  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await productsApi.list({ limit: 200 });
      setProducts(res.data || []);
    } catch (err) {
      toast.error(err.message || "Failed to load variants");
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Reset page when search query changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  const filteredProducts = useMemo(() => {
    if (!searchQuery.trim()) return products;
    const q = searchQuery.toLowerCase();
    return products.filter((prod) => {
      const matchName = prod.name?.toLowerCase().includes(q);
      const matchSku = prod.sku?.toLowerCase().includes(q);
      const matchCat =
        prod.category?.toLowerCase().includes(q) ||
        prod.subCategory?.toLowerCase().includes(q);
      const matchVar = prod.variants?.some(
        (v) =>
          v.size?.toLowerCase().includes(q) ||
          v.color?.toLowerCase().includes(q) ||
          v.skuSuffix?.toLowerCase().includes(q)
      );
      return matchName || matchSku || matchCat || matchVar;
    });
  }, [products, searchQuery]);

  // Auto-expand and navigate to highlighted product if given
  useEffect(() => {
    if (highlightProductId && filteredProducts.length > 0) {
      const idx = filteredProducts.findIndex(
        (p) => String(p.id) === String(highlightProductId)
      );
      if (idx !== -1) {
        const targetPage = Math.floor(idx / PRODUCTS_PER_PAGE) + 1;
        setCurrentPage(targetPage);
        setExpandedMap((prev) => ({ ...prev, [highlightProductId]: true }));
      }
    }
  }, [highlightProductId, filteredProducts]);

  const totalProducts = filteredProducts.length;
  const totalPages = Math.max(1, Math.ceil(totalProducts / PRODUCTS_PER_PAGE));
  const startIndex = (currentPage - 1) * PRODUCTS_PER_PAGE;
  const endIndex = Math.min(startIndex + PRODUCTS_PER_PAGE, totalProducts);

  const paginatedProducts = useMemo(() => {
    return filteredProducts.slice(startIndex, endIndex);
  }, [filteredProducts, startIndex, endIndex]);

  function isExpanded(productId, idx) {
    if (expandedMap[productId] !== undefined) return expandedMap[productId];
    if (highlightProductId && String(highlightProductId) === String(productId)) return true;
    return idx === 0 && currentPage === 1;
  }

  function toggleExpand(productId, idx) {
    setExpandedMap((prev) => ({
      ...prev,
      [productId]: !isExpanded(productId, idx),
    }));
  }

  const allExpanded =
    paginatedProducts.length > 0 &&
    paginatedProducts.every((p, i) => isExpanded(p.id, i));

  function handleToggleAll() {
    const shouldExpand = !allExpanded;
    const next = {};
    paginatedProducts.forEach((p) => {
      next[p.id] = shouldExpand;
    });
    setExpandedMap((prev) => ({ ...prev, ...next }));
  }

  function handleOpenAdd(targetProduct = null) {
    setEditingVariant(
      targetProduct ? { productId: String(targetProduct.id) } : null
    );
    setIsModalOpen(true);
  }

  function handleOpenEdit(product, variant, variantIdx) {
    setEditingVariant({
      productId: String(product.id),
      variantId: variant.id,
      variantIdx,
      size: variant.size || "Free Size",
      color: variant.color || "Standard",
      colorHex: variant.colorHex || "#181715",
      sku: variant.skuSuffix || variant.sku_suffix || "",
      price: variant.priceOverride ?? product.price,
      originalPrice: product.originalPrice ?? "",
      stockCount: Number(variant.stockCount ?? variant.stock_count ?? 0),
      lowStockThreshold: variant.lowStockThreshold ?? 10,
      gstRate: variant.gstRate || "5",
      imageUrl: variant.imageUrl || variant.image_url || "",
      galleryImages: variant.galleryImages || variant.gallery_images || [],
    });
    setIsModalOpen(true);
  }

  async function handleDeleteVariant(product, variant, variantIdx) {
    const ok = await confirm({
      title: "Delete Variant?",
      message: `Remove "${variant.color || ""} / ${variant.size || ""}" from "${product.name}"? This cannot be undone.`,
      danger: true,
    });
    if (!ok) return;

    const updatedVariants = (product.variants || [])
      .filter((_, idx) => idx !== variantIdx)
      .map((v) => ({
        size: v.size,
        color: v.color,
        colorHex: v.colorHex,
        sku_suffix: v.skuSuffix || v.sku_suffix || null,
        stock_count: Number(v.stockCount ?? v.stock_count ?? 0),
        price_override: v.priceOverride ?? v.price_override ?? null,
        image_url: v.imageUrl || v.image_url || null,
        gallery_images: v.galleryImages || v.gallery_images || [],
      }));

    try {
      await productsApi.saveVariants(product.id, updatedVariants);
      toast.success("Variant deleted successfully");
      loadData();
    } catch (err) {
      toast.error(err.message || "Failed to delete variant");
    }
  }

  async function handleSaveVariant(formData) {
    const targetProduct = products.find(
      (p) => String(p.id) === String(formData.productId)
    );
    if (!targetProduct) {
      toast.error("Selected product not found");
      return;
    }

    const currentVariants = (targetProduct.variants || []).map((v) => ({
      id: v.id,
      size: v.size || "Free Size",
      color: v.color || "Standard",
      colorHex: v.colorHex,
      sku_suffix: v.skuSuffix || v.sku_suffix || null,
      stock_count: Number(v.stockCount ?? v.stock_count ?? 0),
      price_override: v.priceOverride ?? v.price_override ?? null,
      image_url: v.imageUrl || v.image_url || null,
      gallery_images: v.galleryImages || v.gallery_images || [],
    }));

    if (editingVariant && editingVariant.variantIdx !== undefined) {
      const updatedVariants = currentVariants.map((v, idx) => {
        if (idx === editingVariant.variantIdx) {
          return {
            ...v,
            size: formData.size,
            color: formData.color,
            colorHex: formData.colorHex,
            sku_suffix: formData.sku || null,
            stock_count: Number(formData.stockCount || 0),
            price_override: formData.price ? parseFloat(formData.price) : null,
            image_url: formData.imageUrl || null,
            gallery_images: formData.galleryImages || [],
          };
        }
        return v;
      });

      try {
        await productsApi.saveVariants(targetProduct.id, updatedVariants);
        toast.success(
          `Variant "${formData.color} / ${formData.size}" updated successfully`
        );
        setIsModalOpen(false);
        loadData();
      } catch (err) {
        toast.error(err.message || "Failed to update variant");
      }
    } else {
      const isDuplicate = currentVariants.some(
        (v) =>
          v.size?.toLowerCase() === formData.size?.toLowerCase() &&
          v.color?.toLowerCase() === formData.color?.toLowerCase()
      );

      if (isDuplicate) {
        toast.error(
          `Variant "${formData.color} / ${formData.size}" already exists for this product.`
        );
        return;
      }

      const newVariants = [
        ...currentVariants,
        {
          size: formData.size,
          color: formData.color,
          colorHex: formData.colorHex,
          sku_suffix: formData.sku || null,
          stock_count: Number(formData.stockCount || 0),
          price_override: formData.price ? parseFloat(formData.price) : null,
          image_url: formData.imageUrl || null,
          gallery_images: formData.galleryImages || [],
        },
      ];

      try {
        await productsApi.saveVariants(targetProduct.id, newVariants);
        toast.success(
          `Variant "${formData.color} / ${formData.size}" created successfully`
        );
        setIsModalOpen(false);
        loadData();
      } catch (err) {
        toast.error(err.message || "Failed to add variant");
      }
    }
  }

  if (isLoading && products.length === 0) {
    return <LoadingState label="Loading Variants..." />;
  }

  return (
    <div className="v-page">
      {/* Top Header */}
      <div className="v-header-banner">
        <div className="v-header-left">
          <span className="v-eyebrow">PRODUCT VARIANTS</span>
          <div className="v-title-wrap">
            <span className="v-icon-symbol">
              <Layers size={26} color="var(--primary-text)" />
            </span>
            <h1 className="v-main-title">Variants</h1>
          </div>
        </div>

        <div className="v-header-actions">
          <div className="v-search-bar">
            <Search size={15} className="v-search-icon" />
            <input
              type="text"
              placeholder="Search variants..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="v-search-input"
              aria-label="Search variants"
            />
            {searchQuery && (
              <button
                type="button"
                className="v-search-clear"
                onClick={() => setSearchQuery("")}
                aria-label="Clear search"
              >
                <X size={14} />
              </button>
            )}
          </div>

          <button
            type="button"
            className="v-btn-primary"
            onClick={() => handleOpenAdd()}
          >
            <Plus size={16} />
            <span>Add Variant</span>
          </button>
        </div>
      </div>

      {/* Product List Header / Pagination Info */}
      <div className="v-pagination-bar-top">
        <span className="v-pagination-summary">
          Showing <strong>{totalProducts === 0 ? 0 : startIndex + 1}–{endIndex}</strong> of <strong>{totalProducts}</strong> products
        </span>
        {paginatedProducts.length > 0 && (
          <button
            type="button"
            className="v-btn-ghost-sm"
            onClick={handleToggleAll}
          >
            {allExpanded ? "Collapse All on Page" : "Expand All on Page"}
          </button>
        )}
      </div>

      {/* Product Cards */}
      <div className="v-cards-list">
        {paginatedProducts.length > 0 ? (
          paginatedProducts.map((prod, idx) => {
            const variants = prod.variants || [];
            const expanded = isExpanded(prod.id, idx);

            return (
              <div
                key={prod.id}
                className={`v-prod-card ${
                  String(prod.id) === String(highlightProductId)
                    ? "is-highlighted"
                    : ""
                }`}
              >
                {/* Product Card Header */}
                <div
                  className="v-prod-header"
                  onClick={() => toggleExpand(prod.id, idx)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      toggleExpand(prod.id, idx);
                    }
                  }}
                  aria-expanded={expanded}
                >
                  <div className="v-prod-header-left">
                    <button
                      type="button"
                      className="v-arrow-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleExpand(prod.id, idx);
                      }}
                      aria-label={expanded ? `Collapse ${prod.name}` : `Expand ${prod.name}`}
                    >
                      {expanded ? (
                        <ChevronDown size={16} />
                      ) : (
                        <ChevronRight size={16} />
                      )}
                    </button>
                    <img
                      src={resolveImageUrl(prod.image || prod.images?.[0])}
                      alt={prod.name}
                      className="v-prod-avatar"
                      onError={(e) => {
                        e.currentTarget.style.display = "none";
                      }}
                    />
                    <h2 className="v-prod-title">{prod.name}</h2>
                  </div>

                  <div className="v-prod-header-right">
                    <button
                      type="button"
                      className="v-btn-add-variant-inline"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleOpenAdd(prod);
                      }}
                      title="Add variant to this product"
                    >
                      <Plus size={13} />
                      <span>Add Variant</span>
                    </button>
                    <span className="v-variants-count-badge">
                      {variants.length}{" "}
                      {variants.length === 1 ? "variant" : "variants"}{" "}
                      <span className="v-mini-chevron">
                        {expanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                      </span>
                    </span>
                  </div>
                </div>

                {/* Variants Table */}
                {expanded && (
                  <div className="v-table-container">
                    {variants.length > 0 ? (
                      <table className="v-table">
                        <thead>
                          <tr>
                            <th className="v-th-sno">S.NO</th>
                            <th className="v-th-variant">VARIANT</th>
                            <th className="v-th-colorsize">COLOR / SIZE</th>
                            <th className="v-th-sku">SKU</th>
                            <th className="v-th-mrp">MRP</th>
                            <th className="v-th-price">SELLING PRICE</th>
                            <th className="v-th-stock">STOCK</th>
                            <th className="v-th-actions">ACTIONS</th>
                          </tr>
                        </thead>
                        <tbody>
                          {variants.map((v, vIdx) => {
                            const isDefault = vIdx === 0;
                            const sellingPrice = Number(
                              v.priceOverride ?? prod.price
                            );
                            const mrp = Number(prod.originalPrice ?? 0);
                            const discountPct =
                              mrp > sellingPrice
                                ? Math.round(
                                    ((mrp - sellingPrice) / mrp) * 100
                                  )
                                : null;
                            const stockCount = Number(
                              v.stockCount ?? v.stock_count ?? 0
                            );
                            const isLowStock = stockCount > 0 && stockCount <= 5;
                            const isOutOfStock = stockCount === 0;
                            const fullSku =
                              v.skuSuffix || v.sku_suffix
                                ? `${prod.sku}-${v.skuSuffix || v.sku_suffix}`
                                : prod.sku;
                            const variantTitle =
                              v.color ||
                              (isDefault ? "Default" : `Variant ${vIdx + 1}`);

                            return (
                              <tr key={v.id || vIdx}>
                                <td className="v-cell-sno">{vIdx + 1}</td>

                                {/* VARIANT */}
                                <td>
                                  <div className="v-variant-info-cell">
                                    <img
                                      src={resolveImageUrl(
                                        v.imageUrl ||
                                          v.image_url ||
                                          prod.image ||
                                          prod.images?.[0]
                                      )}
                                      alt={variantTitle}
                                      className="v-variant-thumb"
                                      onError={(e) => {
                                        e.currentTarget.style.display = "none";
                                      }}
                                    />
                                    <div className="v-variant-meta">
                                      <span className="v-variant-name">
                                        {variantTitle}
                                      </span>
                                      {isDefault && (
                                        <span className="v-badge-default">
                                          DEFAULT
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                </td>

                                {/* COLOR / SIZE */}
                                <td>
                                  <div className="v-color-size-cell">
                                    <span
                                      className="v-color-dot"
                                      style={{
                                        backgroundColor:
                                          v.colorHex || "#181715",
                                      }}
                                    />
                                    <span className="v-color-size-label">
                                      {v.color || "Standard"} /{" "}
                                      {v.size || "Free Size"}
                                    </span>
                                  </div>
                                </td>

                                {/* SKU */}
                                <td>
                                  <span className="v-sku-tag">{fullSku}</span>
                                </td>

                                {/* MRP */}
                                <td className="v-cell-mrp">
                                  ₹{mrp.toLocaleString("en-IN")}
                                </td>

                                {/* SELLING PRICE */}
                                <td>
                                  <div className="v-price-cell">
                                    <span className="v-selling-val">
                                      ₹{sellingPrice.toLocaleString("en-IN")}
                                    </span>
                                    {discountPct && (
                                      <span className="v-discount-badge">
                                        -{discountPct}%
                                      </span>
                                    )}
                                  </div>
                                </td>

                                {/* STOCK */}
                                <td style={{ textAlign: "center" }}>
                                  <span
                                    className={`v-stock-badge ${
                                      isOutOfStock
                                        ? "v-stock-out"
                                        : isLowStock
                                        ? "v-stock-low"
                                        : "v-stock-ok"
                                    }`}
                                  >
                                    {isOutOfStock
                                      ? "Out of Stock"
                                      : stockCount}
                                  </span>
                                </td>

                                {/* ACTIONS */}
                                <td style={{ textAlign: "right" }}>
                                  <div className="v-actions-group">
                                    <button
                                      type="button"
                                      className="v-btn-action-edit"
                                      onClick={() =>
                                        handleOpenEdit(prod, v, vIdx)
                                      }
                                      title="Edit Variant"
                                    >
                                      <Edit2 size={13} />
                                      <span>Edit</span>
                                    </button>
                                    <button
                                      type="button"
                                      className="v-btn-action-delete"
                                      onClick={() =>
                                        handleDeleteVariant(prod, v, vIdx)
                                      }
                                      title="Delete Variant"
                                    >
                                      <Trash2 size={13} />
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    ) : (
                      <div className="v-empty-card">
                        <ImageIcon size={28} color="var(--text-subtle)" />
                        <p>No variants configured for this product yet.</p>
                        <button
                          type="button"
                          className="v-btn-primary v-btn-sm"
                          onClick={() => handleOpenAdd(prod)}
                        >
                          <Plus size={14} />
                          <span>Add First Variant</span>
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })
        ) : (
          <div className="v-empty-state">
            <Layers size={40} color="var(--primary-text)" />
            <h3>No products found</h3>
            <p>Try adjusting your search query.</p>
          </div>
        )}
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="v-pagination-card">
          <Pagination
            page={currentPage}
            totalPages={totalPages}
            total={totalProducts}
            onChange={(newPage) => {
              setCurrentPage(newPage);
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
          />
        </div>
      )}

      {/* Add / Edit Variant Modal */}
      {isModalOpen && (
        <VariantModal
          editingData={editingVariant}
          products={products}
          onClose={() => setIsModalOpen(false)}
          onSave={handleSaveVariant}
        />
      )}

      <ConfirmModal />
    </div>
  );
}

/* ── Add / Edit Variant Modal ── */
function VariantModal({ editingData, products, onClose, onSave }) {
  const isEdit = Boolean(
    editingData && editingData.variantIdx !== undefined
  );

  const [productId, setProductId] = useState(
    editingData?.productId || String(products[0]?.id) || ""
  );

  const selectedProduct = useMemo(
    () => products.find((p) => String(p.id) === String(productId)),
    [products, productId]
  );

  const [colorName, setColorName] = useState(
    editingData?.color || "Sunflower Yellow"
  );
  const [colorHex, setColorHex] = useState(
    editingData?.colorHex || "#EAB308"
  );
  const [showColorDropdown, setShowColorDropdown] = useState(false);
  const colorDropdownRef = useRef(null);

  const [size, setSize] = useState(editingData?.size || "Free Size");
  const [sku, setSku] = useState(editingData?.sku || "");
  const [skuTouched, setSkuTouched] = useState(!!editingData?.sku);
  const [price, setPrice] = useState(
    editingData?.price !== undefined
      ? String(editingData.price)
      : selectedProduct
      ? String(selectedProduct.price)
      : "0"
  );
  const [originalPrice, setOriginalPrice] = useState(
    editingData?.originalPrice !== undefined
      ? String(editingData.originalPrice)
      : selectedProduct?.originalPrice != null
      ? String(selectedProduct.originalPrice)
      : ""
  );
  const [stockQty, setStockQty] = useState(
    editingData?.stockCount !== undefined
      ? String(editingData.stockCount)
      : "0"
  );
  const [lowStockThreshold, setLowStockThreshold] = useState(
    String(editingData?.lowStockThreshold ?? 10)
  );
  const [gstRate, setGstRate] = useState(editingData?.gstRate || "5");

  // Variant Image
  const [imageUrl, setImageUrl] = useState(editingData?.imageUrl || "");
  const [galleryImages, setGalleryImages] = useState(
    editingData?.galleryImages || []
  );
  const [isUploadingMain, setIsUploadingMain] = useState(false);
  const [isUploadingGallery, setIsUploadingGallery] = useState(false);
  const mainImgRef = useRef(null);
  const galleryImgRef = useRef(null);

  const [errors, setErrors] = useState({});
  const [isSaving, setIsSaving] = useState(false);

  const toast = useToast();

  // Auto-generate SKU when product/color/size changes
  useEffect(() => {
    if (!skuTouched && selectedProduct) {
      const colorShort = (colorName || "DEF").substring(0, 3).toUpperCase();
      const sizeShort = (size || "FS").replace(/\s+/g, "").toUpperCase();
      setSku(`${selectedProduct.sku}-${colorShort}-${sizeShort}`);
    }
  }, [selectedProduct, colorName, size, skuTouched]);

  // Update price when product changes (add mode only)
  useEffect(() => {
    if (!isEdit && selectedProduct) {
      setPrice(String(selectedProduct.price || "0"));
      setOriginalPrice(String(selectedProduct.originalPrice ?? ""));
    }
  }, [selectedProduct, isEdit]);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e) {
      if (
        colorDropdownRef.current &&
        !colorDropdownRef.current.contains(e.target)
      ) {
        setShowColorDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function handleSelectColorPreset(preset) {
    setColorName(preset.name);
    setColorHex(preset.hex);
    setShowColorDropdown(false);
  }

  // Upload main variant image
  async function handleMainImageUpload(files) {
    if (!files || files.length === 0) return;
    const imageFiles = Array.from(files).filter((f) =>
      f.type.startsWith("image/")
    );
    if (imageFiles.length === 0) {
      toast.error("Please select a valid image file (JPG, PNG, or WEBP).");
      return;
    }
    if (imageFiles[0].size > 10 * 1024 * 1024) {
      toast.error(`"${imageFiles[0].name}" exceeds 10MB. Please choose an image under 10MB.`);
      return;
    }
    if (!imageUrl && galleryImages.length >= 10) {
      toast.error("Maximum 10 photos allowed for this variant. Please remove an existing photo first.");
      return;
    }
    setIsUploadingMain(true);
    try {
      const { data } = await uploadApi.upload("variants", imageFiles.slice(0, 1));
      const url = data.files?.[0]?.url || "";
      setImageUrl(url);
      toast.success("Variant photo uploaded successfully!");
    } catch (err) {
      toast.error(err.message || "Failed to upload image. Please try again.");
    } finally {
      setIsUploadingMain(false);
      if (mainImgRef.current) mainImgRef.current.value = "";
    }
  }

  // Upload gallery images
  async function handleGalleryUpload(files) {
    if (!files || files.length === 0) return;
    const imageFiles = Array.from(files).filter((f) =>
      f.type.startsWith("image/")
    );
    if (imageFiles.length === 0) return;
    if (galleryImages.length + (imageUrl ? 1 : 0) + imageFiles.length > 10) {
      toast.error("Maximum 10 images are allowed.");
      return;
    }
    setIsUploadingGallery(true);
    try {
      const { data } = await uploadApi.upload("variants", imageFiles);
      const urls = (data.files || []).map((f) => f.url);
      setGalleryImages((prev) => [...prev, ...urls]);
      toast.success(`${urls.length} gallery image(s) uploaded`);
    } catch (err) {
      toast.error(err.message || "Failed to upload gallery images");
    } finally {
      setIsUploadingGallery(false);
      if (galleryImgRef.current) galleryImgRef.current.value = "";
    }
  }

  function removeGalleryImage(idx) {
    setGalleryImages((prev) => prev.filter((_, i) => i !== idx));
  }

  function handleSubmit(e) {
    e.preventDefault();
    const newErrors = {};

    if (!productId) newErrors.productId = "Please select a product";
    if (!colorName.trim()) newErrors.colorName = "Color name is required";
    if (!size.trim()) newErrors.size = "Size is required";
    const numPrice = parseFloat(price);
    const numOriginal = parseFloat(originalPrice);

    if (!price || isNaN(numPrice) || numPrice < 500)
      newErrors.price = "Selling price must be at least ₹500";
    if (!originalPrice || isNaN(numOriginal) || numOriginal < 500)
      newErrors.originalPrice = "Original / MRP price must be at least ₹500";
    else if (Number.isFinite(numPrice) && numOriginal <= numPrice) {
      newErrors.originalPrice = `Original / MRP price (₹${numOriginal}) must be higher than selling price (₹${numPrice})`;
      if (!newErrors.price) {
        newErrors.price = `Selling price (₹${numPrice}) must be lower than original price (₹${numOriginal})`;
      }
    }
    if (
      !stockQty ||
      isNaN(parseInt(stockQty, 10)) ||
      parseInt(stockQty, 10) < 0
    )
      newErrors.stockQty = "Enter a valid stock quantity";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      // Scroll to first error
      const firstErrEl = document.querySelector(".v-field-error");
      if (firstErrEl) firstErrEl.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }

    setIsSaving(true);
    onSave({
      productId,
      color: colorName.trim(),
      colorHex: colorHex || "#181715",
      size: size.trim(),
      sku: sku.trim(),
      price: parseFloat(price),
      originalPrice: originalPrice ? parseFloat(originalPrice) : null,
      stockCount: Math.max(0, parseInt(stockQty, 10) || 0),
      lowStockThreshold: parseInt(lowStockThreshold, 10) || 10,
      gstRate,
      imageUrl: imageUrl || null,
      galleryImages,
    });
    // Note: modal is closed by parent after successful save
    setIsSaving(false);
  }

  const discountPreview =
    originalPrice &&
    price &&
    parseFloat(originalPrice) > parseFloat(price)
      ? Math.round(
          ((parseFloat(originalPrice) - parseFloat(price)) /
            parseFloat(originalPrice)) *
            100
        )
      : null;

  return (
    <div
      className="v-modal-overlay"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={isEdit ? "Edit Variant" : "Add New Variant"}
    >
      <div
        className="v-modal-box"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="v-modal-header">
          <div>
            <h2 className="v-modal-title">
              {isEdit ? "Edit Variant" : "Add New Variant"}
            </h2>
            {selectedProduct && (
              <p className="v-modal-subtitle">{selectedProduct.name}</p>
            )}
          </div>
          <button
            type="button"
            className="v-modal-close-btn"
            onClick={onClose}
            aria-label="Close modal"
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="v-modal-form" noValidate>
          {/* Section: Basic Info */}
          <div className="v-modal-section">
            <h3 className="v-section-title">Basic Information</h3>

            {/* Product selector */}
            <div className="v-form-row-2">
              <div className="v-field-group">
                <label className="v-label" htmlFor="v-sel-product">
                  Product <span className="v-req">*</span>
                </label>
                <select
                  id="v-sel-product"
                  value={productId}
                  onChange={(e) => setProductId(e.target.value)}
                  className={`v-input v-select ${errors.productId ? "is-invalid" : ""}`}
                  disabled={isEdit}
                  required
                >
                  {products.map((p) => (
                    <option key={p.id} value={String(p.id)}>
                      {p.name}
                    </option>
                  ))}
                </select>
                {errors.productId && (
                  <span className="v-field-error">
                    <AlertCircle size={12} /> {errors.productId}
                  </span>
                )}
              </div>

              <div className="v-field-group">
                <label className="v-label">Audience</label>
                <div className="v-readonly-box">
                  {selectedProduct?.category
                    ? selectedProduct.category.charAt(0).toUpperCase() +
                      selectedProduct.category.slice(1)
                    : "—"}
                </div>
              </div>
            </div>

            {/* Color Name + Color Hex */}
            <div className="v-form-row-2">
              <div
                className="v-field-group"
                style={{ position: "relative" }}
                ref={colorDropdownRef}
              >
                <label className="v-label" htmlFor="v-color-name">
                  Color Name <span className="v-req">*</span>
                </label>
                <div className="v-input-with-toggle">
                  {/* Color swatch preview in input */}
                  <span
                    className="v-input-swatch"
                    style={{ backgroundColor: colorHex || "#181715" }}
                  />
                  <input
                    id="v-color-name"
                    type="text"
                    placeholder="e.g. Cherry Red"
                    value={colorName}
                    onChange={(e) => setColorName(e.target.value)}
                    className={`v-input v-input-with-swatch ${errors.colorName ? "is-invalid" : ""}`}
                    required
                    autoComplete="off"
                  />
                  <button
                    type="button"
                    className="v-toggle-dropdown-btn"
                    onClick={() => setShowColorDropdown(!showColorDropdown)}
                    title="Choose from presets"
                    aria-label="Show color presets"
                  >
                    <ChevronDown size={14} />
                  </button>
                </div>
                {errors.colorName && (
                  <span className="v-field-error">
                    <AlertCircle size={12} /> {errors.colorName}
                  </span>
                )}

                {showColorDropdown && (
                  <div className="v-color-presets-menu">
                    <div className="v-color-presets-grid">
                      {POPULAR_COLORS.map((c) => (
                        <div
                          key={c.name}
                          className="v-color-preset-item"
                          onClick={() => handleSelectColorPreset(c)}
                          role="button"
                          tabIndex={0}
                          onKeyDown={(e) =>
                            e.key === "Enter" && handleSelectColorPreset(c)
                          }
                        >
                          <span
                            className="v-swatch-circle"
                            style={{ backgroundColor: c.hex }}
                          />
                          <span>{c.name}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="v-field-group">
                <label className="v-label" htmlFor="v-color-hex">
                  Color Code
                </label>
                <div className="v-hex-picker-row">
                  <input
                    type="color"
                    value={colorHex}
                    onChange={(e) => setColorHex(e.target.value)}
                    className="v-color-picker-input"
                    title="Click to pick color"
                    aria-label="Color picker"
                  />
                  <input
                    id="v-color-hex"
                    type="text"
                    value={colorHex}
                    onChange={(e) => setColorHex(e.target.value)}
                    className="v-input"
                    placeholder="#000000"
                    maxLength={7}
                  />
                </div>
              </div>
            </div>

            {/* Size */}
            <div className="v-field-group">
              <label className="v-label">
                Size <span className="v-req">*</span>
              </label>
              <div className="v-size-presets-bar">
                {SIZE_PRESETS.map((s) => (
                  <button
                    key={s}
                    type="button"
                    className={`v-size-pill-btn ${size === s ? "is-active" : ""}`}
                    onClick={() => setSize(s)}
                  >
                    {s}
                  </button>
                ))}
              </div>
              <input
                type="text"
                placeholder="Or type a custom size (e.g. 32, 34, 2XL)"
                value={size}
                onChange={(e) => setSize(e.target.value)}
                className={`v-input ${errors.size ? "is-invalid" : ""}`}
              />
              {errors.size && (
                <span className="v-field-error">
                  <AlertCircle size={12} /> {errors.size}
                </span>
              )}
            </div>

            {/* SKU */}
            <div className="v-field-group">
              <label className="v-label" htmlFor="v-input-sku">
                SKU (Unique Code) <span className="v-req">*</span>
              </label>
              <input
                id="v-input-sku"
                type="text"
                placeholder="e.g. TN-SG-001"
                value={sku}
                onChange={(e) => {
                  setSku(e.target.value.toUpperCase());
                  setSkuTouched(true);
                }}
                className={`v-input ${errors.sku ? "is-invalid" : ""}`}
              />
              {errors.sku && (
                <span className="v-field-error">
                  <AlertCircle size={12} /> {errors.sku}
                </span>
              )}
              <span className="v-field-hint">
                Auto-generated from product SKU. Edit to customise.
              </span>
            </div>
          </div>

          {/* Section: Pricing & Inventory */}
          <div className="v-modal-section">
            <h3 className="v-section-title">Pricing & Inventory</h3>

            <div className="v-form-row-2">
              <div className="v-field-group">
                <label className="v-label" htmlFor="v-input-price">
                  Selling Price (₹) <span className="v-req">*</span>
                </label>
                <input
                  id="v-input-price"
                  type="number"
                  step="1"
                  min="0"
                  placeholder="500"
                  value={price}
                  onChange={(e) => {
                    setPrice(e.target.value);
                    if (errors.price) setErrors((prev) => ({ ...prev, price: undefined }));
                    if (errors.originalPrice) setErrors((prev) => ({ ...prev, originalPrice: undefined }));
                  }}
                  className={`v-input ${errors.price ? "is-invalid" : ""}`}
                />
                {errors.price && (
                  <span className="v-field-error">
                    <AlertCircle size={12} /> {errors.price}
                  </span>
                )}
              </div>

              <div className="v-field-group">
                <label className="v-label" htmlFor="v-input-mrp">
                  MRP / Original Price (₹) <span className="v-req">*</span>
                </label>
                <input
                  id="v-input-mrp"
                  type="number"
                  step="1"
                  min="0"
                  placeholder="600"
                  value={originalPrice}
                  onChange={(e) => {
                    setOriginalPrice(e.target.value);
                    if (errors.originalPrice) setErrors((prev) => ({ ...prev, originalPrice: undefined }));
                    if (errors.price) setErrors((prev) => ({ ...prev, price: undefined }));
                  }}
                  className={`v-input ${errors.originalPrice ? "is-invalid" : ""}`}
                />
                {errors.originalPrice && (
                  <span className="v-field-error">
                    <AlertCircle size={12} /> {errors.originalPrice}
                  </span>
                )}
                {discountPreview && (
                  <span className="v-field-hint v-hint-success">
                    {discountPreview}% off will be displayed
                  </span>
                )}
              </div>
            </div>

            <div className="v-form-row-2">
              <div className="v-field-group">
                <label className="v-label" htmlFor="v-input-stock">
                  Stock Quantity <span className="v-req">*</span>
                </label>
                <input
                  id="v-input-stock"
                  type="number"
                  min="0"
                  placeholder="0"
                  value={stockQty}
                  onChange={(e) => setStockQty(e.target.value)}
                  className={`v-input ${errors.stockQty ? "is-invalid" : ""}`}
                />
                {errors.stockQty && (
                  <span className="v-field-error">
                    <AlertCircle size={12} /> {errors.stockQty}
                  </span>
                )}
              </div>

              <div className="v-field-group">
                <label className="v-label" htmlFor="v-input-threshold">
                  Low Stock Alert (Qty)
                </label>
                <input
                  id="v-input-threshold"
                  type="number"
                  min="0"
                  placeholder="10"
                  value={lowStockThreshold}
                  onChange={(e) => setLowStockThreshold(e.target.value)}
                  className="v-input"
                />
                <span className="v-field-hint">
                  Alert when stock falls below this number
                </span>
              </div>
            </div>

            <div className="v-field-group">
              <label className="v-label" htmlFor="v-select-gst">
                GST Rate
              </label>
              <select
                id="v-select-gst"
                value={gstRate}
                onChange={(e) => setGstRate(e.target.value)}
                className="v-input v-select"
              >
                {GST_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Section: Variant Images */}
          <div className="v-modal-section">
            <h3 className="v-section-title">Variant Images</h3>
            <p className="v-section-desc">
              Upload a unique image for this color/variant. This will appear on
              the product page when this variant is selected.
            </p>

            <div className="v-images-row">
              {/* Main Variant Image */}
              <div className="v-main-img-block">
                <label className="v-label">Main Variant Image</label>
                <div
                  className={`v-img-upload-box ${imageUrl ? "has-image" : ""}`}
                  onClick={() => !isUploadingMain && mainImgRef.current?.click()}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) =>
                    e.key === "Enter" &&
                    !isUploadingMain &&
                    mainImgRef.current?.click()
                  }
                  title="Click to upload variant image"
                >
                  {imageUrl ? (
                    <>
                      <img
                        src={resolveImageUrl(imageUrl)}
                        alt="Variant"
                        className="v-img-preview"
                        onError={(e) => {
                          e.currentTarget.style.display = "none";
                        }}
                      />
                      <button
                        type="button"
                        className="v-img-remove-btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          setImageUrl("");
                        }}
                        title="Remove image"
                      >
                        <X size={12} />
                      </button>
                    </>
                  ) : (
                    <div className="v-img-placeholder">
                      {isUploadingMain ? (
                        <>
                          <UploadCloud size={22} className="spin" />
                          <span>Uploading...</span>
                        </>
                      ) : (
                        <>
                          <UploadCloud size={22} />
                          <span>Select Image</span>
                        </>
                      )}
                    </div>
                  )}
                </div>
                <input
                  ref={mainImgRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  hidden
                  onChange={(e) => handleMainImageUpload(e.target.files)}
                  disabled={isUploadingMain}
                />
              </div>

              {/* Gallery Images */}
              <div className="v-gallery-block">
                <div className="v-gallery-header">
                  <label className="v-label">
                    Gallery Images (Optional)
                  </label>
                  <button
                    type="button"
                    className="v-btn-add-gallery"
                    onClick={() =>
                      !isUploadingGallery && galleryImgRef.current?.click()
                    }
                    disabled={isUploadingGallery}
                  >
                    <Plus size={13} />
                    {isUploadingGallery ? "Uploading..." : "Add Images"}
                  </button>
                </div>
                <div className="v-gallery-grid">
                  {galleryImages.map((url, idx) => (
                    <div key={idx} className="v-gallery-thumb-wrap">
                      <img
                        src={resolveImageUrl(url)}
                        alt={`Gallery ${idx + 1}`}
                        className="v-gallery-thumb"
                        onError={(e) => {
                          e.currentTarget.style.display = "none";
                        }}
                      />
                      <button
                        type="button"
                        className="v-gallery-remove-btn"
                        onClick={() => removeGalleryImage(idx)}
                      >
                        <X size={10} />
                      </button>
                    </div>
                  ))}
                  {galleryImages.length === 0 && (
                    <div className="v-gallery-empty">
                      <ImageIcon size={20} color="var(--text-subtle)" />
                      <span>No gallery images yet</span>
                    </div>
                  )}
                </div>
                <input
                  ref={galleryImgRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  multiple
                  hidden
                  onChange={(e) => handleGalleryUpload(e.target.files)}
                  disabled={isUploadingGallery}
                />
              </div>
            </div>
          </div>

          {/* Modal Footer */}
          <div className="v-modal-footer">
            <button
              type="button"
              className="v-btn-cancel"
              onClick={onClose}
              disabled={isSaving}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="v-btn-primary"
              disabled={isSaving}
            >
              <Check size={16} />
              <span>{isEdit ? "Save Changes" : "Create Variant"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
