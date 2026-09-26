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
  IndianRupee,
  ZoomIn
} from "lucide-react";
import { productsApi, categoriesApi, subcategoriesApi, uploadApi } from "../../services/resources";
import { useToast } from "../../context/ToastContext";
import { ApiError } from "../../services/api";
import { slugify } from "../../utils/slugify";
import { resolveImageUrl } from "../../utils/imageUrl";
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
  images: [],
  colors: [],
  sizes: []
};

const FASHION_COLOR_PRESETS = [
  { name: "Jet Black", hex: "#111827" },
  { name: "Crisp White", hex: "#FFFFFF" },
  { name: "Off White", hex: "#F3EFE4" },
  { name: "Charcoal", hex: "#374151" },
  { name: "Heather Grey", hex: "#9CA3AF" },
  { name: "Navy Blue", hex: "#1E3A8A" },
  { name: "Sky Blue", hex: "#9BB8CC" },
  { name: "Olive Green", hex: "#4B5A3F" },
  { name: "Sage Green", hex: "#84A98C" },
  { name: "Sand Beige", hex: "#D8CDBC" },
  { name: "Espresso Brown", hex: "#3A2A1E" },
  { name: "Mustard Gold", hex: "#C89D3C" },
  { name: "Crimson Red", hex: "#DC2626" },
  { name: "Burgundy Wine", hex: "#800020" },
  { name: "Dusty Rose", hex: "#DCAE96" },
  { name: "Forest Green", hex: "#1E3A2F" }
];

function normalizeHex(val) {
  if (!val || typeof val !== "string") return "#111827";
  let h = val.trim();
  if (!h.startsWith("#")) h = "#" + h;
  if (/^#[0-9A-Fa-f]{3}$/.test(h)) {
    h = "#" + h[1] + h[1] + h[2] + h[2] + h[3] + h[3];
  }
  if (/^#[0-9A-Fa-f]{6}$/.test(h)) {
    return h.toUpperCase();
  }
  return "#111827";
}

function isValidHex(val) {
  if (!val || typeof val !== "string") return false;
  let h = val.trim();
  if (!h.startsWith("#")) h = "#" + h;
  return /^#[0-9A-Fa-f]{6}$/.test(h) || /^#[0-9A-Fa-f]{3}$/.test(h);
}

function getClosestColorName(hex) {
  const norm = normalizeHex(hex);
  const r = parseInt(norm.slice(1, 3), 16);
  const g = parseInt(norm.slice(3, 5), 16);
  const b = parseInt(norm.slice(5, 7), 16);

  let closest = FASHION_COLOR_PRESETS[0].name;
  let minDist = Infinity;

  for (const preset of FASHION_COLOR_PRESETS) {
    const pr = parseInt(preset.hex.slice(1, 3), 16);
    const pg = parseInt(preset.hex.slice(3, 5), 16);
    const pb = parseInt(preset.hex.slice(5, 7), 16);
    const dist = (r - pr) ** 2 + (g - pg) ** 2 + (b - pb) ** 2;
    if (dist < minDist) {
      minDist = dist;
      closest = preset.name;
    }
  }
  return closest;
}

const SIZE_CATEGORIES = [
  {
    id: "all",
    label: "Popular Presets",
    sizes: ["XS", "S", "M", "L", "XL", "XXL", "3XL", "28", "30", "32", "34", "36", "Free Size"]
  },
  {
    id: "standard",
    label: "Tops & Outerwear",
    sizes: ["XS", "S", "M", "L", "XL", "XXL", "3XL", "4XL"]
  },
  {
    id: "bottoms",
    label: "Waist / Trousers",
    sizes: ["28", "30", "32", "34", "36", "38", "40", "42"]
  },
  {
    id: "kids",
    label: "Kids Age Bands",
    sizes: ["0-6M", "6-12M", "1-2Y", "2-3Y", "3-4Y", "4-5Y", "5-6Y", "7-8Y", "9-10Y", "11-12Y"]
  },
  {
    id: "universal",
    label: "Universal",
    sizes: ["Free Size", "One Size", "Regular Fit", "Oversized"]
  }
];

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
  const [colorErrors, setColorErrors] = useState({});
  const [activeSizeCategory, setActiveSizeCategory] = useState("all");
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
          colors: (p.colors || []).map((c) => ({
            name: typeof c === "string" ? c : c?.name || "",
            hex: normalizeHex(typeof c === "object" ? c?.hex || c?.hex_code : "#111827")
          })),
          sizes: (p.sizes || [])
            .map((s) => (typeof s === "string" ? s : s?.label || s?.name || String(s)).trim())
            .filter(Boolean),
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

  // ── Colors ──
  function addColor(preset) {
    if (preset) {
      const exists = form.colors.some(
        (c) =>
          c.name.trim().toLowerCase() === preset.name.toLowerCase() ||
          c.hex.toLowerCase() === preset.hex.toLowerCase()
      );
      if (exists) {
        toast.info(`"${preset.name}" is already in the color list`);
        return;
      }
      update("colors", [...form.colors, { name: preset.name, hex: normalizeHex(preset.hex) }]);
    } else {
      update("colors", [...form.colors, { name: "", hex: "#111827" }]);
    }
  }

  function toggleColorPreset(preset) {
    const existingIdx = form.colors.findIndex(
      (c) =>
        c.name.trim().toLowerCase() === preset.name.toLowerCase() ||
        c.hex.toLowerCase() === preset.hex.toLowerCase()
    );
    if (existingIdx !== -1) {
      removeColor(existingIdx);
    } else {
      update("colors", [...form.colors, { name: preset.name, hex: normalizeHex(preset.hex) }]);
    }
  }

  function updateColor(idx, field, value) {
    const next = form.colors.map((c, i) => {
      if (i !== idx) return c;
      const updated = { ...c, [field]: value };
      if (field === "hex") {
        let cleanHex = value.trim();
        if (!cleanHex.startsWith("#") && /^[0-9A-Fa-f]/.test(cleanHex)) {
          cleanHex = "#" + cleanHex;
        }
        updated.hex = cleanHex;
        if (!c.name || c.name.trim() === "" || FASHION_COLOR_PRESETS.some((p) => p.name === c.name)) {
          if (isValidHex(cleanHex)) {
            updated.name = getClosestColorName(cleanHex);
          }
        }
      }
      return updated;
    });
    update("colors", next);

    if (colorErrors[idx]) {
      setColorErrors((prev) => {
        const copy = { ...prev };
        delete copy[idx];
        return copy;
      });
    }
  }

  function removeColor(idx) {
    update("colors", form.colors.filter((_, i) => i !== idx));
    setColorErrors((prev) => {
      const copy = { ...prev };
      delete copy[idx];
      return copy;
    });
  }

  // ── Sizes ──
  const [sizeDraft, setSizeDraft] = useState("");

  const displayedPresetSizes = useMemo(() => {
    const cat = SIZE_CATEGORIES.find((c) => c.id === activeSizeCategory);
    return cat ? cat.sizes : SIZE_CATEGORIES[0].sizes;
  }, [activeSizeCategory]);

  function toggleSize(sizeName) {
    const val = sizeName.trim();
    if (!val) return;
    if (form.sizes.includes(val)) {
      update("sizes", form.sizes.filter((s) => s !== val));
    } else {
      update("sizes", [...form.sizes, val]);
    }
  }

  function addCustomSize() {
    const val = sizeDraft.trim();
    if (!val) {
      toast.warning("Please enter a size label");
      return;
    }
    if (form.sizes.some((s) => s.toLowerCase() === val.toLowerCase())) {
      toast.info(`Size "${val}" is already in the list`);
      return;
    }
    update("sizes", [...form.sizes, val]);
    setSizeDraft("");
  }

  function removeSize(idx) {
    update("sizes", form.sizes.filter((_, i) => i !== idx));
  }

  function addStandardSizes() {
    const standard = ["XS", "S", "M", "L", "XL", "XXL"];
    const merged = Array.from(new Set([...form.sizes, ...standard]));
    update("sizes", merged);
    toast.success("Standard sizes added");
  }

  function clearAllSizes() {
    update("sizes", []);
  }

  const isValid = useMemo(
    () => form.name && form.slug && form.sku && form.category_id && form.price !== "",
    [form]
  );

  async function handleSubmit(e) {
    e.preventDefault();
    setErrors({});
    setColorErrors({});

    // Validate colors
    const newColorErrors = {};
    form.colors.forEach((c, idx) => {
      const nameEmpty = !c.name || !c.name.trim();
      const hexInvalid = !isValidHex(c.hex);
      if (nameEmpty || hexInvalid) {
        newColorErrors[idx] = {
          name: nameEmpty ? "Color display name is required" : null,
          hex: hexInvalid ? "Must be valid 6-char hex (e.g. #111827)" : null
        };
      }
    });

    if (Object.keys(newColorErrors).length > 0) {
      setColorErrors(newColorErrors);
      toast.error("Please complete or fix invalid color swatches before saving.");
      return;
    }

    // Clean & unique sizes
    const cleanedSizes = Array.from(new Set(form.sizes.map((s) => s.trim()).filter(Boolean)));

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
        colors: form.colors.map((c) => ({
          name: c.name.trim(),
          hex: normalizeHex(c.hex)
        })),
        sizes: cleanedSizes
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
        err.details.forEach((d) => {
          const match = d.field.match(/^colors\[(\d+)\]\.(\w+)$/);
          if (match) {
            const idx = Number(match[1]);
            const field = match[2];
            setColorErrors((prev) => ({
              ...prev,
              [idx]: { ...(prev[idx] || {}), [field]: d.message }
            }));
          }
        });
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

        {/* Section 5: Available Colors */}
        <div className="card form-section-card colors-section-card">
          <div className="section-card-heading">
            <div className="section-icon-wrap section-icon-palette">
              <Palette size={18} />
            </div>
            <div className="section-heading-text">
              <div className="section-title-row">
                <h3 className="section-title">Color Swatches</h3>
                <span className="section-count-badge">
                  {form.colors.length} {form.colors.length === 1 ? "color" : "colors"}
                </span>
              </div>
              <p className="section-sub">
                Add fabric colors with accurate hex color codes for customer storefront selection
              </p>
            </div>
          </div>

          {/* Quick Color Presets Palette */}
          <div className="quick-colors-container">
            <div className="quick-colors-header">
              <span className="quick-colors-label">Popular Apparel Palettes (Click to toggle):</span>
            </div>
            <div className="quick-colors-grid">
              {FASHION_COLOR_PRESETS.map((p) => {
                const isActive = form.colors.some(
                  (c) =>
                    c.name.trim().toLowerCase() === p.name.toLowerCase() ||
                    c.hex.toLowerCase() === p.hex.toLowerCase()
                );
                return (
                  <button
                    key={p.name}
                    type="button"
                    className={`quick-color-pill ${isActive ? "active" : ""}`}
                    onClick={() => toggleColorPreset(p)}
                    title={`${p.name} (${p.hex}) — Click to ${isActive ? "remove" : "add"}`}
                  >
                    <span
                      className="quick-color-swatch-dot"
                      style={{ backgroundColor: p.hex }}
                    />
                    <span className="quick-color-name">{p.name}</span>
                    {isActive ? (
                      <Check size={12} className="quick-color-check" />
                    ) : (
                      <span className="quick-color-plus">+</span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Colors List */}
          <div className="colors-management-area">
            {form.colors.length === 0 ? (
              <div className="empty-swatches-box">
                <div className="empty-swatches-icon">
                  <Palette size={26} />
                </div>
                <div className="empty-swatches-text">
                  <strong>No color swatches configured</strong>
                  <p>Choose from popular apparel palettes above or add a custom color below.</p>
                </div>
              </div>
            ) : (
              <div className="color-swatch-list-modern">
                {form.colors.map((color, idx) => {
                  const itemErr = colorErrors[idx];
                  return (
                    <div
                      key={idx}
                      className={`color-swatch-card ${itemErr ? "has-error" : ""}`}
                    >
                      <div className="color-swatch-card-main">
                        {/* Swatch Picker & Visual Preview */}
                        <div className="color-picker-control-wrap">
                          <label
                            className="color-picker-visual-preview"
                            style={{ backgroundColor: color.hex || "#111827" }}
                            title="Click to open color picker"
                          >
                            <input
                              type="color"
                              value={isValidHex(color.hex) ? normalizeHex(color.hex) : "#111827"}
                              onChange={(e) => updateColor(idx, "hex", e.target.value)}
                              className="color-picker-hidden-input"
                              aria-label={`Pick color for item ${idx + 1}`}
                            />
                            <span className="color-picker-overlay-icon">
                              <Palette size={13} />
                            </span>
                          </label>
                        </div>

                        {/* Color Name Input */}
                        <div className="color-field-col color-field-name">
                          <label className="color-mini-label" htmlFor={`c-name-${idx}`}>
                            Color Display Name *
                          </label>
                          <input
                            id={`c-name-${idx}`}
                            value={color.name}
                            onChange={(e) => updateColor(idx, "name", e.target.value)}
                            placeholder="e.g. Jet Black, Vintage Cream"
                            className={`color-name-input ${itemErr?.name ? "input-error" : ""}`}
                            required
                          />
                          {itemErr?.name && <span className="color-field-error">{itemErr.name}</span>}
                        </div>

                        {/* Hex Code Input */}
                        <div className="color-field-col color-field-hex">
                          <label className="color-mini-label" htmlFor={`c-hex-${idx}`}>
                            Hex Code *
                          </label>
                          <div className={`color-hex-input-box ${itemErr?.hex ? "input-error" : ""}`}>
                            <span className="hex-prefix">#</span>
                            <input
                              id={`c-hex-${idx}`}
                              value={color.hex.replace(/^#/, "")}
                              onChange={(e) => {
                                const val = e.target.value.replace(/[^0-9A-Fa-f]/g, "").slice(0, 6);
                                updateColor(idx, "hex", "#" + val);
                              }}
                              placeholder="111827"
                              maxLength={6}
                              className="color-hex-text-input"
                            />
                          </div>
                          {itemErr?.hex && <span className="color-field-error">{itemErr.hex}</span>}
                        </div>

                        {/* Live Storefront Preview Tag */}
                        <div className="color-field-col color-field-preview">
                          <span className="color-mini-label">Storefront Preview</span>
                          <div className="color-live-badge">
                            <span
                              className="live-badge-dot"
                              style={{ backgroundColor: color.hex || "#111827" }}
                            />
                            <span className="live-badge-name">
                              {color.name || "Untitled Color"}
                            </span>
                          </div>
                        </div>

                        {/* Delete Action */}
                        <div className="color-action-col">
                          <button
                            type="button"
                            className="btn btn-ghost btn-sm btn-delete-swatch"
                            onClick={() => removeColor(idx)}
                            title="Remove this color swatch"
                            aria-label={`Remove color ${color.name || idx + 1}`}
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="color-actions-bar">
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={() => addColor()}
            >
              <Plus size={15} />
              <span>Add Custom Color Swatch</span>
            </button>
          </div>
        </div>

        {/* Section 6: Available Sizes */}
        <div className="card form-section-card sizes-section-card">
          <div className="section-card-heading">
            <div className="section-icon-wrap section-icon-ruler">
              <Ruler size={18} />
            </div>
            <div className="section-heading-text">
              <div className="section-title-row">
                <h3 className="section-title">Available Sizing</h3>
                <span className="section-count-badge">
                  {form.sizes.length} {form.sizes.length === 1 ? "size" : "sizes"}
                </span>
              </div>
              <p className="section-sub">
                Define available size options for customer selection on product and quick-view pages
              </p>
            </div>
          </div>

          {/* Sizing Category Tabs */}
          <div className="sizes-category-tabs">
            {SIZE_CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                type="button"
                className={`size-cat-tab ${activeSizeCategory === cat.id ? "active" : ""}`}
                onClick={() => setActiveSizeCategory(cat.id)}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Quick Add Pills */}
          <div className="quick-sizes-bar">
            <div className="quick-sizes-pills">
              {displayedPresetSizes.map((s) => {
                const isSelected = form.sizes.includes(s);
                return (
                  <button
                    key={s}
                    type="button"
                    className={`btn btn-xs quick-size-pill ${isSelected ? "btn-accent is-selected" : "btn-secondary"}`}
                    onClick={() => toggleSize(s)}
                    title={`Click to ${isSelected ? "remove" : "add"} size ${s}`}
                  >
                    {isSelected ? `✓ ${s}` : `+ ${s}`}
                  </button>
                );
              })}
            </div>
            <div className="quick-sizes-actions">
              <button
                type="button"
                className="btn btn-ghost btn-xs"
                onClick={addStandardSizes}
                title="Add S, M, L, XL, XXL in one click"
              >
                + Add Standard Set
              </button>
              {form.sizes.length > 0 && (
                <button
                  type="button"
                  className="btn btn-ghost btn-xs btn-clear-sizes"
                  onClick={clearAllSizes}
                  title="Remove all sizes"
                >
                  Clear All
                </button>
              )}
            </div>
          </div>

          {/* Active Size Chips */}
          <div className="active-sizes-section">
            <span className="active-sizes-heading">
              Active Product Sizes ({form.sizes.length}):
            </span>
            <div className="active-sizes-row">
              {form.sizes.map((size, idx) => (
                <span key={`${size}-${idx}`} className="active-size-chip">
                  <span className="size-chip-text">{size}</span>
                  <button
                    type="button"
                    onClick={() => removeSize(idx)}
                    aria-label={`Remove size ${size}`}
                    className="size-chip-delete"
                    title={`Remove ${size}`}
                  >
                    &times;
                  </button>
                </span>
              ))}
              {form.sizes.length === 0 && (
                <span className="no-sizes-hint">
                  No sizes selected. Click one of the quick options above or enter a custom size below.
                </span>
              )}
            </div>
          </div>

          {/* Custom Size Input */}
          <div className="custom-size-input-row">
            <input
              value={sizeDraft}
              onChange={(e) => setSizeDraft(e.target.value)}
              placeholder="Enter custom size (e.g. 28, 30, Oversized, Free Size, 3-4Y)"
              className="custom-size-input"
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  addCustomSize();
                }
              }}
            />
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={addCustomSize}
            >
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
