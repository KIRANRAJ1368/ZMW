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
  const mainFileInputRef = useRef(null);
  const galleryFileInputRef = useRef(null);

  const [form, setForm] = useState(BLANK_FORM);
  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(isEdit);
  const [isSaving, setIsSaving] = useState(false);
  const [mainImage, setMainImage] = useState("");
  const [galleryImages, setGalleryImages] = useState([]);
  const [isUploadingMain, setIsUploadingMain] = useState(false);
  const [isUploadingGallery, setIsUploadingGallery] = useState(false);
  const [isDraggingMain, setIsDraggingMain] = useState(false);
  const [isDraggingGallery, setIsDraggingGallery] = useState(false);
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
        const loadedImgs = Array.isArray(p.images) ? p.images : [];
        setMainImage(loadedImgs[0] || "");
        setGalleryImages(loadedImgs.slice(1) || []);

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
          images: loadedImgs,
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
    setForm((f) => {
      const nextForm = { ...f, [field]: value };
      return nextForm;
    });

    setErrors((previous) => {
      const next = { ...previous };
      if (field === "price" || field === "original_price") {
        delete next.price;
        delete next.original_price;

        const currentPriceVal = field === "price" ? value : form.price;
        const currentMrpVal = field === "original_price" ? value : form.original_price;

        const sPrice = Number(currentPriceVal);
        const oPrice = Number(currentMrpVal);

        if (currentPriceVal !== "" && Number.isFinite(sPrice) && sPrice < 500) {
          next.price = "Selling price must be at least ₹500";
        }
        if (currentMrpVal !== "" && Number.isFinite(oPrice) && oPrice < 500) {
          next.original_price = "Original / MRP price must be at least ₹500";
        }

        if (
          currentPriceVal !== "" &&
          currentMrpVal !== "" &&
          Number.isFinite(sPrice) &&
          Number.isFinite(oPrice) &&
          sPrice > 0 &&
          oPrice > 0
        ) {
          if (sPrice >= oPrice) {
            next.original_price = `Original / MRP price (₹${oPrice}) must be higher than selling price (₹${sPrice})`;
            next.price = `Selling price (₹${sPrice}) must be lower than original price (₹${oPrice})`;
          }
        }
      } else {
        delete next[field];
      }
      return next;
    });
  }

  function handleNameChange(value) {
    update("name", value);
    if (!slugTouched) update("slug", slugify(value));
  }

  // ── Images Management ──
  async function handleMainImageUpload(fileList) {
    if (!fileList || fileList.length === 0) return;
    const file = Array.from(fileList).find((f) => f.type.startsWith("image/"));
    if (!file) {
      toast.error("Please select a valid image file (JPG, PNG, or WEBP).");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      toast.error(`"${file.name}" exceeds 10MB. Please choose an image under 10MB.`);
      return;
    }
    setIsUploadingMain(true);
    try {
      const { data } = await uploadApi.upload("products", [file]);
      const url = data.files?.[0]?.url;
      if (url) {
        setMainImage(url);
        setErrors((prev) => {
          const next = { ...prev };
          delete next.mainImage;
          delete next.images;
          return next;
        });
        toast.success("Main Product Image uploaded successfully!");
      }
    } catch (err) {
      toast.error(err.message || "Failed to upload main product image. Please try again.");
    } finally {
      setIsUploadingMain(false);
      if (mainFileInputRef.current) mainFileInputRef.current.value = "";
    }
  }

  function handleMainPhotoDrop(e) {
    e.preventDefault();
    setIsDraggingMain(false);
    if (isUploadingMain) return;
    if (e.dataTransfer.files?.length) {
      handleMainImageUpload(e.dataTransfer.files);
    }
  }

  async function handleGalleryImageUpload(fileList) {
    if (!fileList || fileList.length === 0) return;
    const files = Array.from(fileList).filter((f) => f.type.startsWith("image/"));
    if (files.length === 0) {
      toast.error("Please select valid image files (JPG, PNG, or WEBP).");
      return;
    }
    const oversized = files.filter((f) => f.size > 10 * 1024 * 1024);
    if (oversized.length > 0) {
      toast.error(`"${oversized[0].name}" exceeds 10MB. Please choose images under 10MB.`);
      return;
    }
    const maxGallery = 9; // 1 Main + up to 9 Gallery = 10 total images
    const remainingSlots = maxGallery - galleryImages.length;
    if (remainingSlots <= 0) {
      toast.error("Maximum 9 gallery images already attached. Total 10 images limit reached.");
      return;
    }
    if (files.length > remainingSlots) {
      toast.error(`You can only add up to ${remainingSlots} more gallery image(s). Maximum 10 images total allowed.`);
      return;
    }

    setIsUploadingGallery(true);
    try {
      const { data } = await uploadApi.upload("products", files);
      const newUrls = (data.files || []).map((f) => f.url);
      setGalleryImages((prev) => [...prev, ...newUrls]);
      setErrors((prev) => {
        const next = { ...prev };
        delete next.galleryImages;
        delete next.images;
        return next;
      });
      toast.success(`${newUrls.length} gallery image(s) uploaded successfully!`);
    } catch (err) {
      toast.error(err.message || "Failed to upload gallery images. Please try again.");
    } finally {
      setIsUploadingGallery(false);
      if (galleryFileInputRef.current) galleryFileInputRef.current.value = "";
    }
  }

  function handleGalleryPhotoDrop(e) {
    e.preventDefault();
    setIsDraggingGallery(false);
    if (isUploadingGallery) return;
    if (e.dataTransfer.files?.length) {
      handleGalleryImageUpload(e.dataTransfer.files);
    }
  }

  function removeMainImage() {
    setMainImage("");
    toast.info("Main Product Image removed.");
  }

  function removeGalleryImage(idx) {
    setGalleryImages((prev) => prev.filter((_, i) => i !== idx));
    toast.info("Gallery thumbnail removed.");
  }

  function promoteToMainImage(idx) {
    const selected = galleryImages[idx];
    const rest = galleryImages.filter((_, i) => i !== idx);
    if (mainImage) {
      setGalleryImages([mainImage, ...rest]);
    } else {
      setGalleryImages(rest);
    }
    setMainImage(selected);
    toast.success("Cover photo updated! This photo is now the Main Product Image.");
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

    if (form.price === "" || form.price === null || form.price === undefined) {
      validationErrors.price = "Selling price is required";
    } else if (!Number.isFinite(sellingPrice) || sellingPrice <= 0) {
      validationErrors.price = "Please enter a valid selling price";
    } else if (sellingPrice < 500) {
      validationErrors.price = "Selling price must be at least ₹500";
    }

    if (form.original_price === "" || form.original_price === null || form.original_price === undefined) {
      validationErrors.original_price = "Original / MRP price is required";
    } else if (!Number.isFinite(originalPrice) || originalPrice <= 0) {
      validationErrors.original_price = "Please enter a valid original / MRP price";
    } else if (originalPrice < 500) {
      validationErrors.original_price = "Original / MRP price must be at least ₹500";
    } else if (sellingPrice >= originalPrice) {
      validationErrors.original_price = `Original / MRP price (₹${originalPrice}) must be higher than selling price (₹${sellingPrice})`;
      validationErrors.price = `Selling price (₹${sellingPrice}) must be lower than original price (₹${originalPrice})`;
    }

    // Image Validations:
    // 2 images compulsory (Main image + at least 1 Gallery image).
    // Maximum 10 images total (1 Main + up to 9 Gallery images).
    // Remaining up to 8 thumbnails are optional.
    if (!mainImage) {
      validationErrors.mainImage = "Main Product Image is required (Compulsory).";
    }
    if (galleryImages.length === 0) {
      validationErrors.galleryImages = "At least 1 Gallery thumbnail image is required (Compulsory).";
    }
    const combinedImages = [mainImage, ...galleryImages].filter(Boolean);
    if (combinedImages.length < 2) {
      validationErrors.images = "At least 2 product images are compulsory (1 Main image + at least 1 thumbnail).";
    } else if (combinedImages.length > 10) {
      validationErrors.images = "Maximum 10 images allowed per product (1 Main + up to 9 gallery photos).";
    }

    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) {
      if (validationErrors.mainImage && validationErrors.galleryImages) {
        toast.error("Both Main Image and at least 1 Gallery thumbnail are compulsory (Minimum 2 images).");
      } else if (validationErrors.mainImage) {
        toast.error("Please upload the compulsory Main Product Image.");
      } else if (validationErrors.galleryImages) {
        toast.error("Please upload at least 1 compulsory Gallery thumbnail image.");
      } else if (validationErrors.images) {
        toast.error(validationErrors.images);
      } else if (validationErrors.price?.includes("lower than") || validationErrors.original_price?.includes("higher than")) {
        toast.error("Selling price must be lower than the Original / MRP price.");
      } else {
        toast.error("Please fill in all required fields properly.");
      }
      return;
    }

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
        images: combinedImages
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
        const firstMsg = err.details[0]?.message || err.details[0]?.msg;
        toast.error(firstMsg || "Please check the form fields and try again.");
      } else {
        toast.error(err.message || "Failed to save product. Please try again.");
      }
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

      <form onSubmit={handleSubmit} className="product-form-layout" noValidate>
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
            <FormField
              label="Selling Price (₹) *"
              htmlFor="p-price"
              error={errors.price}
              hint="Active price charged at checkout (must be lower than MRP)"
            >
              <input
                id="p-price"
                type="number"
                min="0"
                step="1"
                placeholder="e.g. 500"
                value={form.price}
                onChange={(e) => update("price", e.target.value)}
              />
            </FormField>

            <FormField
              label="Original / MRP Price (₹) *"
              htmlFor="p-original-price"
              error={errors.original_price}
              hint={
                form.original_price && form.price && Number(form.original_price) > Number(form.price)
                  ? `Discount: ${Math.round(((Number(form.original_price) - Number(form.price)) / Number(form.original_price)) * 100)}% OFF (Save ${formatINR(Number(form.original_price) - Number(form.price))})`
                  : form.original_price && form.price && Number(form.price) >= Number(form.original_price)
                  ? "Original price must be greater than selling price to offer a discount"
                  : "Displays as strikethrough comparison price"
              }
            >
              <input
                id="p-original-price"
                type="number"
                min="0"
                step="1"
                placeholder="e.g. 600"
                value={form.original_price}
                onChange={(e) => update("original_price", e.target.value)}
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

        {/* Section 4: Product Images (Dual Card: Main Image + Gallery Thumbnails) */}
        <div className="product-images-dual-container">
          {/* Card 1: Main Product Image (Compulsory #1) */}
          <div className={`card product-image-card main-image-card ${errors.mainImage || errors.images ? "has-image-error" : ""}`}>
            <div className="product-image-card-header">
              <div>
                <h3 className="section-title">
                  Main Product Image <span className="required-asterisk">* (Compulsory #1)</span>
                </h3>
                <p className="section-sub">Primary image shown in catalog &amp; search cards.</p>
              </div>
              {mainImage && (
                <span className="badge-primary-cover">★ Main Image (Compulsory #1)</span>
              )}
            </div>

            {mainImage ? (
              <div className="main-image-preview-block">
                <div
                  className="main-image-frame"
                  onClick={() => setLightboxImg(resolveImageUrl(mainImage))}
                  title="Click to view full image"
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => e.key === "Enter" && setLightboxImg(resolveImageUrl(mainImage))}
                >
                  <img
                    src={resolveImageUrl(mainImage)}
                    alt="Main Product Preview"
                    className="main-image-img"
                    onError={(e) => {
                      e.currentTarget.style.display = "none";
                      const fb = e.currentTarget.parentElement.querySelector(".main-image-fallback");
                      if (fb) fb.style.display = "flex";
                    }}
                  />
                  <div className="main-image-fallback" style={{ display: "none" }}>
                    <ImageIcon size={32} />
                    <span>Preview Unavailable</span>
                  </div>
                  <div className="image-hover-zoom-overlay">
                    <ZoomIn size={20} />
                    <span>View Larger</span>
                  </div>
                </div>

                <div className="main-image-toolbar">
                  <button
                    type="button"
                    className="btn btn-secondary btn-sm"
                    onClick={() => mainFileInputRef.current?.click()}
                    disabled={isUploadingMain}
                  >
                    <UploadCloud size={14} />
                    <span>{isUploadingMain ? "Uploading..." : "Change Image"}</span>
                  </button>
                  <button
                    type="button"
                    className="btn btn-ghost btn-sm btn-delete-img"
                    onClick={removeMainImage}
                    title="Remove main image"
                  >
                    <Trash2 size={15} />
                    <span>Remove</span>
                  </button>
                </div>
              </div>
            ) : (
              <div
                className={`main-image-upload-box ${isDraggingMain ? "is-dragging" : ""} ${isUploadingMain ? "is-uploading" : ""}`}
                onClick={() => !isUploadingMain && mainFileInputRef.current?.click()}
                onDrop={handleMainPhotoDrop}
                onDragOver={(e) => {
                  e.preventDefault();
                  if (!isDraggingMain) setIsDraggingMain(true);
                }}
                onDragLeave={(e) => {
                  e.preventDefault();
                  setIsDraggingMain(false);
                }}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => e.key === "Enter" && !isUploadingMain && mainFileInputRef.current?.click()}
              >
                <div className="main-upload-arrow-wrap">
                  <span className="main-upload-arrow">↑</span>
                </div>
                <strong className="main-upload-title">
                  {isUploadingMain ? "Uploading Main Image..." : "Upload Main Product Image"}
                </strong>
                <p className="main-upload-sub">PNG, JPG or WEBP up to 10MB</p>
                <span className="main-compulsory-tag">Compulsory #1 (Required)</span>
              </div>
            )}

            <input
              ref={mainFileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              hidden
              onChange={(e) => handleMainImageUpload(e.target.files)}
              disabled={isUploadingMain}
            />

            {errors.mainImage && (
              <div className="field-error-text" style={{ marginTop: 8 }}>{errors.mainImage}</div>
            )}
          </div>

          {/* Card 2: Gallery Images (Thumbnails - 1 compulsory, up to 8 optional) */}
          <div className={`card product-image-card gallery-image-card ${errors.galleryImages ? "has-image-error" : ""}`}>
            <div className="product-image-card-header">
              <div>
                <div className="gallery-header-title-row">
                  <h3 className="section-title">Gallery Thumbnails</h3>
                  <span className="gallery-counter-pill">
                    {galleryImages.length}/9 ({galleryImages.length > 0 ? "1 Compulsory" : "0/1 Compulsory"} + {Math.max(0, galleryImages.length - 1)}/8 Optional)
                  </span>
                </div>
                <p className="section-sub">Thumb #1 is compulsory (#2 required photo). Up to 8 more are optional.</p>
              </div>
              <span className="gallery-max-note">2 Compulsory + 8 Optional = 10 Max</span>
            </div>

            {/* Gallery Upload & Thumbnail Tiles */}
            <div className="gallery-tiles-layout">
              {/* Golden dashed "+ Add Image" tile matching reference screenshot */}
              {galleryImages.length < 9 && (
                <div
                  className={`gallery-gold-add-tile ${isUploadingGallery ? "is-uploading" : ""}`}
                  onClick={() => !isUploadingGallery && galleryFileInputRef.current?.click()}
                  onDrop={handleGalleryPhotoDrop}
                  onDragOver={(e) => {
                    e.preventDefault();
                    if (!isDraggingGallery) setIsDraggingGallery(true);
                  }}
                  onDragLeave={(e) => {
                    e.preventDefault();
                    setIsDraggingGallery(false);
                  }}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => e.key === "Enter" && !isUploadingGallery && galleryFileInputRef.current?.click()}
                  title="Click to add thumbnail image"
                >
                  <span className="gold-plus-icon">+</span>
                  <span className="gold-plus-label">
                    {isUploadingGallery ? "Uploading..." : "Add Image"}
                  </span>
                </div>
              )}

              {/* Uploaded Gallery Thumbnails */}
              {galleryImages.map((url, idx) => {
                const resolved = resolveImageUrl(url);
                const isCompulsoryThumb = idx === 0;
                return (
                  <div key={idx} className="gallery-thumb-tile">
                    <div
                      className="gallery-thumb-media"
                      onClick={() => setLightboxImg(resolved)}
                      title="Click to view larger image"
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => e.key === "Enter" && setLightboxImg(resolved)}
                    >
                      <img
                        src={resolved}
                        alt={`Thumb #${idx + 1}`}
                        className="gallery-thumb-img"
                        onError={(e) => {
                          e.currentTarget.style.display = "none";
                          const fb = e.currentTarget.parentElement.querySelector(".gallery-thumb-fallback");
                          if (fb) fb.style.display = "flex";
                        }}
                      />
                      <div className="gallery-thumb-fallback" style={{ display: "none" }}>
                        <ImageIcon size={20} />
                      </div>
                      <div className="image-hover-zoom-overlay">
                        <ZoomIn size={16} />
                      </div>
                      <span className="gallery-thumb-num">#{idx + 1}</span>
                      <span className={`gallery-role-pill ${isCompulsoryThumb ? "compulsory" : "optional"}`}>
                        {isCompulsoryThumb ? "Compulsory #2" : `Optional #${idx}`}
                      </span>
                    </div>

                    <div className="gallery-thumb-bar">
                      <button
                        type="button"
                        className="btn-set-main"
                        onClick={() => promoteToMainImage(idx)}
                        title="Set this thumbnail as Main Product Image"
                      >
                        ★ Set as Main
                      </button>
                      <button
                        type="button"
                        className="btn btn-ghost btn-sm btn-delete-img"
                        onClick={() => removeGalleryImage(idx)}
                        title="Remove photo"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            <input
              ref={galleryFileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              multiple
              hidden
              onChange={(e) => handleGalleryImageUpload(e.target.files)}
              disabled={isUploadingGallery || galleryImages.length >= 9}
            />

            {/* Gallery Guidance / Rule Status Strip */}
            <div className="gallery-status-footer">
              {galleryImages.length === 0 ? (
                <div className="gallery-rule-alert warning">
                  <span>⚠️ <strong>1 Gallery Thumbnail is compulsory</strong> (1 Main + 1 Gallery = 2 minimum). Up to 8 more thumbnails are optional.</span>
                </div>
              ) : (
                <div className="gallery-rule-alert success">
                  <span>✓ <strong>{galleryImages.length} gallery image(s) attached</strong> (1 Compulsory + {Math.max(0, galleryImages.length - 1)}/8 Optional) • Total: <strong>{(mainImage ? 1 : 0) + galleryImages.length}/10 images</strong> ({9 - galleryImages.length} slots left)</span>
                </div>
              )}
            </div>

            {errors.galleryImages && (
              <div className="field-error-text" style={{ marginTop: 8 }}>{errors.galleryImages}</div>
            )}
          </div>
        </div>

        {errors.images && (
          <div className="card-error-banner" style={{ marginTop: 12, padding: "10px 14px", background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 8, color: "#b91c1c", fontSize: 13, fontWeight: 500 }}>
            {errors.images}
          </div>
        )}

        {lightboxImg && (
          <ImageLightboxModal
            src={lightboxImg}
            alt="Product Photo Preview"
            onClose={() => setLightboxImg(null)}
          />
        )}

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
