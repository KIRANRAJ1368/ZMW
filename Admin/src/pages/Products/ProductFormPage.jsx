import { useEffect, useMemo, useState, useRef } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import {
  ArrowLeft,
  UploadCloud,
  Plus,
  Trash2,
  Image as ImageIcon,
  Check,
  Star,
  Sparkles,
  Tag,
  Palette,
  Ruler,
  Layers,
  IndianRupee
} from "lucide-react";
import { productsApi, categoriesApi, subcategoriesApi, uploadApi } from "../../services/resources";
import { useToast } from "../../context/ToastContext";
import { ApiError } from "../../services/api";
import { slugify } from "../../utils/slugify";
import FormField from "../../components/FormField/FormField";
import LoadingState from "../../components/LoadingState/LoadingState";
import "./ProductFormPage.css";

const BLANK_FORM = {
  name: "",
  slug: "",
  sku: "",
  category_id: "",
  subcategory_id: "",
  product_type: "",
  description: "",
  price: "",
  original_price: "",
  stock_count: 0,
  in_stock: true,
  is_best_seller: false,
  is_new_arrival: false,
  is_sale: false,
  badge_label: "",
  badge_type: "",
  is_active: true,
  images: [],
  colors: [],
  sizes: []
};

const COMMON_SIZES = ["XS", "S", "M", "L", "XL", "XXL", "3XL"];

export default function ProductFormPage() {
  const { id } = useParams();
  const isEdit = !!id;
  const navigate = useNavigate();
  const toast = useToast();
  const fileInputRef = useRef(null);

  const [form, setForm] = useState(BLANK_FORM);
  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(isEdit);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [slugTouched, setSlugTouched] = useState(isEdit);

  useEffect(() => {
    categoriesApi.list().then(({ data }) => setCategories(data || []));
  }, []);

  useEffect(() => {
    if (!isEdit) return;
    productsApi
      .getById(id)
      .then((res) => {
        const p = res?.data;
        if (!p) {
          toast.error("Product not found");
          navigate("/products");
          return;
        }
        setForm({
          name: p.name,
          slug: p.slug,
          sku: p.sku,
          category_id: p.categoryId ?? "",
          subcategory_id: p.subcategoryId ?? "",
          product_type: p.productType || "",
          description: p.description || "",
          price: p.price,
          original_price: p.originalPrice ?? "",
          stock_count: p.stockCount,
          in_stock: p.inStock,
          is_best_seller: p.isBestSeller,
          is_new_arrival: p.isNewArrival,
          is_sale: p.isSale,
          badge_label: p.badge || "",
          badge_type: p.badgeType || "",
          is_active: p.isActive,
          images: p.images || [],
          colors: p.colors || [],
          sizes: p.sizes || [],
          _categorySlug: p.category,
          _subcategoryName: p.subCategory
        });
      })
      .catch((err) => {
        toast.error(err.message || "Product not found");
        navigate("/products");
      })
      .finally(() => setIsLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  // Resolve category slug -> id once categories are loaded (edit mode only).
  useEffect(() => {
    if (!form._categorySlug || categories.length === 0) return;
    const match = categories.find((c) => c.slug === form._categorySlug);
    if (match) setForm((f) => ({ ...f, category_id: match.id }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form._categorySlug, categories]);

  useEffect(() => {
    if (!form.category_id) {
      setSubcategories([]);
      return;
    }
    const category = categories.find((c) => c.id === Number(form.category_id));
    subcategoriesApi.list({ category: category?.slug }).then(({ data }) => {
      setSubcategories(data || []);
      if (form._subcategoryName) {
        const match = data?.find((s) => s.name === form._subcategoryName);
        if (match) setForm((f) => ({ ...f, subcategory_id: match.id, _subcategoryName: undefined }));
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.category_id, categories]);

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  function handleNameChange(value) {
    update("name", value);
    if (!slugTouched) update("slug", slugify(value));
  }

  // ── Images ──
  function addImageUrl() {
    update("images", [...form.images, ""]);
  }
  function updateImage(idx, value) {
    const next = [...form.images];
    next[idx] = value;
    update("images", next);
  }
  function removeImage(idx) {
    update("images", form.images.filter((_, i) => i !== idx));
  }
  async function handleFileUpload(e) {
    const files = e.target.files;
    if (!files?.length) return;
    setIsUploading(true);
    try {
      const { data } = await uploadApi.upload("products", files);
      const newUrls = (data.files || []).map((f) => f.url);
      update("images", [...form.images, ...newUrls]);
      toast.success(`${newUrls.length} product photo(s) uploaded successfully`);
    } catch (err) {
      toast.error(err.message || "Failed to upload product photo");
    } finally {
      setIsUploading(false);
      e.target.value = "";
    }
  }

  // ── Colors ──
  function addColor() {
    update("colors", [...form.colors, { name: "", hex: "#111827" }]);
  }
  function updateColor(idx, field, value) {
    const next = form.colors.map((c, i) => (i === idx ? { ...c, [field]: value } : c));
    update("colors", next);
  }
  function removeColor(idx) {
    update("colors", form.colors.filter((_, i) => i !== idx));
  }

  // ── Sizes ──
  const [sizeDraft, setSizeDraft] = useState("");
  function addSize(sizeName) {
    const val = (sizeName || sizeDraft).trim();
    if (!val || form.sizes.includes(val)) return;
    update("sizes", [...form.sizes, val]);
    setSizeDraft("");
  }
  function removeSize(idx) {
    update("sizes", form.sizes.filter((_, i) => i !== idx));
  }

  const isValid = useMemo(
    () => form.name && form.slug && form.sku && form.category_id && form.price !== "",
    [form]
  );

  async function handleSubmit(e) {
    e.preventDefault();
    setErrors({});
    setIsSaving(true);
    try {
      const payload = {
        ...form,
        category_id: Number(form.category_id),
        subcategory_id: form.subcategory_id ? Number(form.subcategory_id) : null,
        price: Number(form.price),
        original_price: form.original_price === "" ? null : Number(form.original_price),
        stock_count: Number(form.stock_count),
        badge_type: form.badge_type || null,
        images: form.images.filter(Boolean),
        colors: form.colors.filter((c) => c.name && c.hex)
      };
      delete payload._categorySlug;
      delete payload._subcategoryName;

      if (isEdit) {
        await productsApi.update(id, payload);
        toast.success("Product updated successfully");
      } else {
        await productsApi.create(payload);
        toast.success("Product published successfully");
      }
      navigate("/products");
    } catch (err) {
      if (err instanceof ApiError && err.details?.length) {
        setErrors(Object.fromEntries(err.details.map((d) => [d.field, d.message])));
      }
      toast.error(err.message);
    } finally {
      setIsSaving(false);
    }
  }

  if (isLoading) return <LoadingState label="Loading product details..." />;

  return (
    <div className="product-form-page">
      {/* Top Breadcrumb & Header */}
      <div className="product-form-header">
        <Link to="/products" className="product-back-link">
          <ArrowLeft size={16} />
          <span>Back to Products</span>
        </Link>
        <div className="product-form-title-row">
          <div>
            <h1 className="page-title">
              {isEdit ? `Edit Product: ${form.name || form.sku}` : "Add New Product"}
            </h1>
            <p className="page-subtitle">
              {isEdit
                ? `SKU: ${form.sku} &bull; Adjust pricing, photos, swatches, and sizes`
                : "Create and publish a premium apparel piece to the ZMW storefront"}
            </p>
          </div>
          {isEdit && (
            <div className="sku-status-pill">
              <code>SKU: {form.sku}</code>
            </div>
          )}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="product-form-layout">
        {/* Section 1: General Info */}
        <div className="card form-section-card">
          <div className="section-card-heading">
            <div className="section-icon-wrap">
              <Layers size={18} />
            </div>
            <div>
              <h3 className="section-title">General Product Details</h3>
              <p className="section-sub">Name, unique identifiers, and catalog placement</p>
            </div>
          </div>

          <div className="form-grid">
            <FormField label="Product Title *" htmlFor="p-name" error={errors.name}>
              <input
                id="p-name"
                placeholder="e.g. Heavyweight Minimalist Oversized Hoodie"
                value={form.name}
                onChange={(e) => handleNameChange(e.target.value)}
                required
              />
            </FormField>

            <FormField label="SKU (Stock Keeping Unit) *" htmlFor="p-sku" error={errors.sku} hint="Unique store identifier">
              <input
                id="p-sku"
                placeholder="e.g. ZMW-HD-OVR-001"
                value={form.sku}
                onChange={(e) => update("sku", e.target.value)}
                required
              />
            </FormField>
          </div>

          <div className="form-grid">
            <FormField label="URL Slug *" htmlFor="p-slug" error={errors.slug} hint="Web address path on storefront">
              <input
                id="p-slug"
                placeholder="heavyweight-minimalist-oversized-hoodie"
                value={form.slug}
                onChange={(e) => {
                  setSlugTouched(true);
                  update("slug", e.target.value);
                }}
                required
              />
            </FormField>

            <FormField label="Product Type / Silhouette" htmlFor="p-type" hint="e.g. Hoodies, Tees, Cargos, Jackets">
              <input
                id="p-type"
                placeholder="e.g. Hoodies"
                value={form.product_type}
                onChange={(e) => update("product_type", e.target.value)}
              />
            </FormField>
          </div>

          <div className="form-grid">
            <FormField label="Category *" htmlFor="p-category" error={errors.category_id}>
              <select
                id="p-category"
                value={form.category_id}
                onChange={(e) => update("category_id", e.target.value)}
                required
              >
                <option value="">Select a category...</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </FormField>

            <FormField label="Subcategory" htmlFor="p-subcategory" hint="Item classification within category">
              <select
                id="p-subcategory"
                value={form.subcategory_id}
                onChange={(e) => update("subcategory_id", e.target.value)}
                disabled={subcategories.length === 0}
              >
                <option value="">All / None</option>
                {subcategories.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </FormField>
          </div>

          <FormField label="Product Description" htmlFor="p-desc" hint="Fabric composition, fit, GSM weight, washing care instructions">
            <textarea
              id="p-desc"
              rows={4}
              placeholder="e.g. Cut from 450 GSM French Terry cotton for structure and warmth. Features dropped shoulders, double-layered hood, and ribbed cuffs..."
              value={form.description}
              onChange={(e) => update("description", e.target.value)}
            />
          </FormField>
        </div>

        {/* Section 2: Pricing & Inventory */}
        <div className="card form-section-card">
          <div className="section-card-heading">
            <div className="section-icon-wrap">
              <IndianRupee size={18} />
            </div>
            <div>
              <h3 className="section-title">Pricing & Inventory</h3>
              <p className="section-sub">Retail price in ₹, discounts, and real-time stock levels</p>
            </div>
          </div>

          <div className="form-grid">
            <FormField label="Selling Price (₹) *" htmlFor="p-price" error={errors.price} hint="Active price charged at checkout">
              <input
                id="p-price"
                type="number"
                min="0"
                step="0.01"
                placeholder="e.g. 1999"
                value={form.price}
                onChange={(e) => update("price", e.target.value)}
                required
              />
            </FormField>

            <FormField
              label="Original / MRP Price (₹)"
              htmlFor="p-original-price"
              hint={
                form.original_price && Number(form.original_price) > Number(form.price)
                  ? `Discount: ${Math.round(((Number(form.original_price) - Number(form.price)) / Number(form.original_price)) * 100)}% OFF (Save ₹${Number(form.original_price) - Number(form.price)})`
                  : "Displays as strikethrough comparison price"
              }
            >
              <input
                id="p-original-price"
                type="number"
                min="0"
                step="0.01"
                placeholder="e.g. 2999"
                value={form.original_price}
                onChange={(e) => update("original_price", e.target.value)}
              />
            </FormField>
          </div>

          <div className="form-grid">
            <FormField label="Available Stock Units" htmlFor="p-stock" hint="Units currently in distribution center">
              <input
                id="p-stock"
                type="number"
                min="0"
                value={form.stock_count}
                onChange={(e) => update("stock_count", e.target.value)}
              />
            </FormField>

            <div className="instock-checkbox-wrap">
              <label className="checkbox-row" style={{ marginBottom: 0 }}>
                <input
                  id="p-instock"
                  type="checkbox"
                  checked={form.in_stock}
                  onChange={(e) => update("in_stock", e.target.checked)}
                />
                <span>
                  <strong>Mark In Stock & Purchasable</strong> (Visible in cart & checkout)
                </span>
              </label>
            </div>
          </div>
        </div>

        {/* Section 3: Merchandising & Badges */}
        <div className="card form-section-card">
          <div className="section-card-heading">
            <div className="section-icon-wrap">
              <Sparkles size={18} />
            </div>
            <div>
              <h3 className="section-title">Storefront Merchandising & Highlights</h3>
              <p className="section-sub">Feature this product in home carousels, drop sections, and sale categories</p>
            </div>
          </div>

          <div className="merchandising-banner">
            <label className="checkbox-row">
              <input
                id="p-bestseller"
                type="checkbox"
                checked={form.is_best_seller}
                onChange={(e) => update("is_best_seller", e.target.checked)}
              />
              <span>Feature in <strong>Best Sellers</strong> Collection</span>
            </label>

            <label className="checkbox-row">
              <input
                id="p-newarrival"
                type="checkbox"
                checked={form.is_new_arrival}
                onChange={(e) => update("is_new_arrival", e.target.checked)}
              />
              <span>Feature in <strong>New Arrivals</strong> Drop</span>
            </label>

            <label className="checkbox-row">
              <input
                id="p-sale"
                type="checkbox"
                checked={form.is_sale}
                onChange={(e) => update("is_sale", e.target.checked)}
              />
              <span>Mark as <strong>On Sale</strong></span>
            </label>
          </div>

          <div className="form-grid">
            <FormField label="Custom Badge Text" htmlFor="p-badge" hint="e.g. 450 GSM HEAVYWEIGHT, LIMITED DROP">
              <input
                id="p-badge"
                placeholder="e.g. HEAVYWEIGHT EDITION"
                value={form.badge_label}
                onChange={(e) => update("badge_label", e.target.value)}
              />
            </FormField>

            <FormField label="Badge Color Accent" htmlFor="p-badge-type">
              <select
                id="p-badge-type"
                value={form.badge_type}
                onChange={(e) => update("badge_type", e.target.value)}
              >
                <option value="">None (Standard Monochrome)</option>
                <option value="hot">Hot (Amber Gold)</option>
                <option value="new">New Drop (Emerald Green)</option>
                <option value="sale">Sale / Discount (Crimson Red)</option>
              </select>
            </FormField>
          </div>

          <div className="checkbox-row" style={{ marginTop: 6 }}>
            <input
              id="p-active"
              type="checkbox"
              checked={form.is_active}
              onChange={(e) => update("is_active", e.target.checked)}
            />
            <label htmlFor="p-active">
              <strong>Active Product (Live on ZMW Storefront)</strong>
            </label>
          </div>
        </div>

        {/* Section 4: Image Gallery */}
        <div className="card form-section-card">
          <div className="section-card-heading">
            <div className="section-icon-wrap">
              <ImageIcon size={18} />
            </div>
            <div>
              <h3 className="section-title">Product Image Gallery</h3>
              <p className="section-sub">
                Portrait 3:4 ratio photography (minimum 900 × 1200px recommended). The first image serves as the storefront cover.
              </p>
            </div>
          </div>

          <div className="image-gallery-grid">
            {form.images.map((url, idx) => (
              <div key={idx} className="image-gallery-card">
                <div className="image-preview-wrap">
                  {url ? (
                    <img
                      src={url}
                      alt={`Product #${idx + 1}`}
                      className="image-preview-img"
                      onError={(e) => {
                        e.target.style.visibility = "hidden";
                      }}
                    />
                  ) : (
                    <div className="image-preview-empty">
                      <ImageIcon size={26} />
                      <span>No URL Provided</span>
                    </div>
                  )}
                  {idx === 0 && <span className="image-primary-badge">Cover Photo</span>}
                  <span className="image-order-badge">#{idx + 1}</span>
                </div>
                <div className="image-card-footer">
                  <input
                    value={url}
                    onChange={(e) => updateImage(idx, e.target.value)}
                    placeholder="Image URL"
                    className="image-url-input"
                  />
                  <button
                    type="button"
                    className="btn btn-ghost btn-sm btn-delete-img"
                    onClick={() => removeImage(idx)}
                    title="Remove Photo"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="gallery-action-bar">
            <button type="button" className="btn btn-secondary" onClick={addImageUrl}>
              <Plus size={16} />
              <span>Add Direct Image URL</span>
            </button>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
            >
              <UploadCloud size={16} />
              <span>{isUploading ? "Uploading..." : "Upload Device Photos"}</span>
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              hidden
              onChange={handleFileUpload}
              disabled={isUploading}
            />
          </div>
        </div>

        {/* Section 5: Available Colors */}
        <div className="card form-section-card">
          <div className="section-card-heading">
            <div className="section-icon-wrap">
              <Palette size={18} />
            </div>
            <div>
              <h3 className="section-title">Color Swatches</h3>
              <p className="section-sub">Add available fabric colors with exact hex color codes for storefront swatches</p>
            </div>
          </div>

          <div className="color-swatch-list">
            {form.colors.map((color, idx) => (
              <div key={idx} className="color-swatch-item">
                <input
                  type="color"
                  value={color.hex}
                  onChange={(e) => updateColor(idx, "hex", e.target.value)}
                  className="color-picker-input"
                  title="Choose swatch color"
                />
                <input
                  value={color.name}
                  onChange={(e) => updateColor(idx, "name", e.target.value)}
                  placeholder="Color Name, e.g. Jet Black, Vintage Cream"
                  className="color-name-input"
                />
                <code className="color-hex-badge">{color.hex}</code>
                <button
                  type="button"
                  className="btn btn-ghost btn-sm btn-delete-color"
                  onClick={() => removeColor(idx)}
                  title="Remove Color"
                >
                  <Trash2 size={15} />
                </button>
              </div>
            ))}
          </div>

          <button type="button" className="btn btn-secondary btn-sm" onClick={addColor} style={{ marginTop: 12 }}>
            <Plus size={15} />
            <span>Add Color Swatch</span>
          </button>
        </div>

        {/* Section 6: Available Sizes */}
        <div className="card form-section-card">
          <div className="section-card-heading">
            <div className="section-icon-wrap">
              <Ruler size={18} />
            </div>
            <div>
              <h3 className="section-title">Available Sizing</h3>
              <p className="section-sub">Specify available size tags for customer selection on product page</p>
            </div>
          </div>

          {/* Quick Add Pills */}
          <div className="quick-sizes-bar">
            <span className="quick-sizes-label">One-Click Add:</span>
            <div className="quick-sizes-pills">
              {COMMON_SIZES.map((s) => (
                <button
                  key={s}
                  type="button"
                  className={`btn btn-xs ${form.sizes.includes(s) ? "btn-accent" : "btn-secondary"}`}
                  onClick={() => addSize(s)}
                >
                  {form.sizes.includes(s) ? `✓ ${s}` : `+ ${s}`}
                </button>
              ))}
            </div>
          </div>

          {/* Active Size Chips */}
          <div className="active-sizes-row">
            {form.sizes.map((size, idx) => (
              <span key={idx} className="active-size-chip">
                <span>{size}</span>
                <button
                  type="button"
                  onClick={() => removeSize(idx)}
                  aria-label={`Remove size ${size}`}
                  className="size-chip-delete"
                >
                  &times;
                </button>
              </span>
            ))}
            {form.sizes.length === 0 && (
              <span className="hint">No sizes added yet. Click one of the quick options above or enter a custom size below.</span>
            )}
          </div>

          {/* Custom Size Input */}
          <div className="custom-size-input-row">
            <input
              value={sizeDraft}
              onChange={(e) => setSizeDraft(e.target.value)}
              placeholder="e.g. 28, 30, Oversized, Free Size"
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  addSize();
                }
              }}
            />
            <button type="button" className="btn btn-secondary btn-sm" onClick={() => addSize()}>
              <Plus size={15} />
              <span>Add Custom Size</span>
            </button>
          </div>
        </div>

        {/* Sticky Form Footer */}
        <div className="product-form-sticky-footer">
          <button type="button" className="btn btn-secondary" onClick={() => navigate("/products")}>
            Cancel
          </button>
          <button type="submit" className="btn btn-accent btn-lg" disabled={isSaving || !isValid}>
            {isSaving ? (
              <span>Saving Product...</span>
            ) : isEdit ? (
              <>
                <Check size={18} />
                <span>Save Product Changes</span>
              </>
            ) : (
              <>
                <Plus size={18} />
                <span>Publish Product to Store</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
