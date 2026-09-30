import { useEffect, useMemo, useState, useRef } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import {
  ArrowLeft,
  UploadCloud,
  Plus,
  Trash2,
  Image as ImageIcon,
  Sparkles,
  Layers,
  IndianRupee,
  ZoomIn,
  Check,
  Package2
} from "lucide-react";
import { productsApi, categoriesApi, subcategoriesApi, uploadApi } from "../../services/resources";
import { useToast } from "../../context/ToastContext";
import { ApiError } from "../../services/api";
import { slugify } from "../../utils/slugify";
import { resolveImageUrl } from "../../utils/imageUrl";
import { formatINR } from "../../utils/formatPrice";
import ImageLightboxModal from "../../components/ImageLightboxModal/ImageLightboxModal";
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
  images: []
};

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
  const [isDraggingPhotos, setIsDraggingPhotos] = useState(false);
  const [lightboxImg, setLightboxImg] = useState(null);
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
    setErrors((previous) => {
      const fieldsToClear = field === "price" || field === "original_price"
        ? ["price", "original_price"]
        : [field];
      if (!fieldsToClear.some((key) => previous[key])) return previous;
      const next = { ...previous };
      fieldsToClear.forEach((key) => delete next[key]);
      return next;
    });
  }

  function handleNameChange(value) {
    update("name", value);
    if (!slugTouched) update("slug", slugify(value));
  }

  // ── Images ──
  function removeImage(idx) {
    update("images", form.images.filter((_, i) => i !== idx));
  }

  function makeCoverPhoto(idx) {
    if (idx === 0) return;
    const target = form.images[idx];
    const rest = form.images.filter((_, i) => i !== idx);
    update("images", [target, ...rest]);
    toast.success("Cover photo updated");
  }

  async function handlePhotoFiles(fileList) {
    if (!fileList || fileList.length === 0) return;
    const files = Array.from(fileList).filter((f) => f.type.startsWith("image/"));
    if (files.length === 0) {
      toast.error("Please select valid image files (JPG, PNG, WEBP, GIF)");
      return;
    }
    if (form.images.length + files.length > 2) {
      toast.error("Maximum 2 images are allowed.");
      return;
    }
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
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  function handlePhotoDrop(e) {
    e.preventDefault();
    setIsDraggingPhotos(false);
    if (isUploading) return;
    if (e.dataTransfer.files?.length) {
      handlePhotoFiles(e.dataTransfer.files);
    }
  }

  const isValid = useMemo(
    () => form.name && form.slug && form.category_id && form.price !== "",
    [form]
  );

  async function handleSubmit(e) {
    e.preventDefault();
    const validationErrors = {};
    const sellingPrice = Number(form.price);
    const originalPrice = Number(form.original_price);
    if (!Number.isFinite(sellingPrice) || sellingPrice < 500) {
      validationErrors.price = "Selling price must be at least ₹500";
    }
    if (!Number.isFinite(originalPrice) || originalPrice <= sellingPrice) {
      validationErrors.original_price = "Original price must be higher than selling price";
    }
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) return;

    setIsSaving(true);
    try {
      const payload = {
        ...form,
        category_id: Number(form.category_id),
        subcategory_id: form.subcategory_id ? Number(form.subcategory_id) : null,
        price: Number(form.price),
        original_price: form.original_price === "" ? null : Number(form.original_price),
        stock_count: Number(form.stock_count),
        in_stock: Boolean(form.in_stock),
        badge_type: form.badge_type || null,
        images: form.images.filter(Boolean)
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
        const errObj = Object.fromEntries(err.details.map((d) => [d.field, d.message]));
        setErrors(errObj);
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
                ? `SKU: ${form.sku} • Adjust pricing, photos, and product details`
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

        {/* Section 2: Pricing */}
        <div className="card form-section-card">
          <div className="section-card-heading">
            <div className="section-icon-wrap">
              <IndianRupee size={18} />
            </div>
            <div>
              <h3 className="section-title">Pricing</h3>
              <p className="section-sub">Selling price in ₹ and original comparison / MRP price</p>
            </div>
          </div>

          <div className="form-grid">
            <FormField label="Selling Price (₹) *" htmlFor="p-price" error={errors.price} hint="Active price charged at checkout">
              <input
                id="p-price"
                type="number"
                min="500"
                step="0.01"
                placeholder="e.g. 500"
                value={form.price}
                onChange={(e) => update("price", e.target.value)}
                required
              />
            </FormField>

            <FormField
              label="Original / MRP Price (₹) *"
              htmlFor="p-original-price"
              error={errors.original_price}
              hint={
                form.original_price && Number(form.original_price) > Number(form.price)
                  ? `Discount: ${Math.round(((Number(form.original_price) - Number(form.price)) / Number(form.original_price)) * 100)}% OFF (Save ${formatINR(Number(form.original_price) - Number(form.price))})`
                  : "Displays as strikethrough comparison price"
              }
            >
              <input
                id="p-original-price"
                type="number"
                min="500"
                step="0.01"
                placeholder="e.g. 600"
                value={form.original_price}
                onChange={(e) => update("original_price", e.target.value)}
                required
              />
            </FormField>
          </div>

          {/* Navigation links to dedicated management pages */}
          <div className="variant-inventory-link-row">
            <Link
              to={isEdit ? `/variants?productId=${id}` : "/variants"}
              className="inventory-deep-link"
            >
              <Layers size={15} />
              <span>
                Manage Size &amp; Color combinations in{" "}
                <strong>Variant Management</strong> ➔
              </span>
            </Link>
            <Link
              to={isEdit ? `/stock?productId=${id}` : "/stock"}
              className="inventory-deep-link"
              style={{ marginTop: 6 }}
            >
              <Package2 size={15} />
              <span>
                Manage inventory quantities and stock availability in{" "}
                <strong>Stock Management</strong> ➔
              </span>
            </Link>
          </div>
        </div>

        {/* Section 3: Merchandising & Badges */}
        <div className="card form-section-card">
          <div className="section-card-heading">
            <div className="section-icon-wrap">
              <Sparkles size={18} />
            </div>
            <div>
              <h3 className="section-title">Storefront Merchandising &amp; Highlights</h3>
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
                Portrait 3:4 ratio photography (minimum 900 × 1200px recommended). The first image serves as the storefront cover. Click any photo to view full resolution.
              </p>
            </div>
          </div>

          {/* Device Dropzone / Upload Area */}
          <div
            className={`gallery-dropzone ${isDraggingPhotos ? "is-dragging" : ""} ${isUploading ? "is-uploading" : ""}`}
            onClick={() => !isUploading && fileInputRef.current?.click()}
            onDrop={handlePhotoDrop}
            onDragOver={(e) => {
              e.preventDefault();
              if (!isDraggingPhotos) setIsDraggingPhotos(true);
            }}
            onDragLeave={(e) => {
              e.preventDefault();
              setIsDraggingPhotos(false);
            }}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === "Enter" && !isUploading && fileInputRef.current?.click()}
          >
            <div className="gallery-dropzone-icon">
              <UploadCloud size={28} className={isUploading ? "spin" : ""} />
            </div>
            <div className="gallery-dropzone-text">
              <strong>{isUploading ? "Uploading photos..." : "Click to select or drag & drop product photos"}</strong>
              <p>Upload directly from your device (JPG, PNG, WEBP, GIF). Multiple files supported.</p>
            </div>
            <button
              type="button"
              className="btn btn-secondary btn-sm gallery-upload-btn"
              onClick={(e) => {
                e.stopPropagation();
                fileInputRef.current?.click();
              }}
              disabled={isUploading}
            >
              <UploadCloud size={14} />
              <span>{isUploading ? "Uploading..." : "Browse Device Photos"}</span>
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              multiple
              hidden
              onChange={(e) => handlePhotoFiles(e.target.files)}
              disabled={isUploading}
            />
          </div>

          {/* Image Cards Grid */}
          {form.images.length > 0 ? (
            <div className="image-gallery-grid">
              {form.images.map((url, idx) => {
                const resolved = resolveImageUrl(url);
                return (
                  <div key={idx} className="image-gallery-card">
                    <div
                      className="image-preview-wrap"
                      onClick={() => setLightboxImg(resolved)}
                      title="Click to view larger image"
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => e.key === "Enter" && setLightboxImg(resolved)}
                    >
                      <img
                        src={resolved}
                        alt={`Product #${idx + 1}`}
                        className="image-preview-img"
                        onError={(e) => {
                          e.currentTarget.style.display = "none";
                          const fallback = e.currentTarget.parentElement.querySelector(".image-preview-empty");
                          if (fallback) fallback.style.display = "flex";
                        }}
                      />
                      <div className="image-preview-empty" style={{ display: "none" }}>
                        <ImageIcon size={26} />
                        <span>Preview Unavailable</span>
                      </div>
                      <div className="image-gallery-hover-overlay">
                        <ZoomIn size={18} />
                        <span>Enlarge</span>
                      </div>
                      {idx === 0 && <span className="image-primary-badge">Cover Photo</span>}
                      <span className="image-order-badge">#{idx + 1}</span>
                    </div>
                    <div className="image-card-footer">
                      <div className="image-card-actions-left">
                        {idx > 0 ? (
                          <button
                            type="button"
                            className="btn-make-cover"
                            onClick={() => makeCoverPhoto(idx)}
                            title="Set this photo as primary cover"
                          >
                            Set as Cover
                          </button>
                        ) : (
                          <span className="cover-label-pill">Main Cover</span>
                        )}
                      </div>
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
                );
              })}
            </div>
          ) : (
            <div className="no-images-notice">
              <ImageIcon size={22} />
              <span>No product photos attached yet. Use the upload area above to attach photos from your device.</span>
            </div>
          )}

          {lightboxImg && (
            <ImageLightboxModal
              src={lightboxImg}
              alt="Product Photo Preview"
              onClose={() => setLightboxImg(null)}
            />
          )}
        </div>

        {/* Sticky Footer */}
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
