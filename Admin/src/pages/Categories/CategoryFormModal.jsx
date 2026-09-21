import { useState, useRef } from "react";
import { UploadCloud, Image as ImageIcon, X, Check } from "lucide-react";
import Modal from "../../components/Modal/Modal";
import FormField from "../../components/FormField/FormField";
import { categoriesApi, uploadApi } from "../../services/resources";
import { useToast } from "../../context/ToastContext";
import { ApiError } from "../../services/api";
import { slugify } from "../../utils/slugify";

export default function CategoryFormModal({ category, onClose, onSaved }) {
  const isEdit = !!category.id;
  const [form, setForm] = useState({
    name: category.name || "",
    slug: category.slug || "",
    description: category.description || "",
    image_url: category.image_url || "",
    sort_order: category.sort_order ?? 0,
    is_active: category.is_active ?? true
  });
  const [errors, setErrors] = useState({});
  const [isSaving, setIsSaving] = useState(false);
  const [slugTouched, setSlugTouched] = useState(isEdit);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef(null);
  const toast = useToast();

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  function handleNameChange(value) {
    update("name", value);
    if (!slugTouched) update("slug", slugify(value));
  }

  async function handleImageUpload(e) {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    setIsUploading(true);
    try {
      const result = await uploadApi.upload("categories", files);
      const url = result?.data?.files?.[0]?.url || result?.files?.[0]?.url;
      if (url) {
        update("image_url", url);
        toast.success("Category cover photo uploaded successfully");
      }
    } catch (err) {
      toast.error("Image upload failed: " + err.message);
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setErrors({});
    setIsSaving(true);
    try {
      if (isEdit) {
        await categoriesApi.update(category.id, form);
        toast.success("Category updated successfully");
      } else {
        await categoriesApi.create(form);
        toast.success("Category created successfully");
      }
      onSaved();
    } catch (err) {
      if (err instanceof ApiError && err.details?.length) {
        setErrors(Object.fromEntries(err.details.map((d) => [d.field, d.message])));
      }
      toast.error(err.message);
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <Modal
      title={isEdit ? "Edit Category" : "Add New Category"}
      onClose={onClose}
      width={600}
    >
      <form onSubmit={handleSubmit}>
        <div className="form-grid">
          <FormField label="Category Name *" htmlFor="cat-name" error={errors.name}>
            <input
              id="cat-name"
              placeholder="e.g. Men, Women, Kids, Unisex"
              value={form.name}
              onChange={(e) => handleNameChange(e.target.value)}
              className={errors.name ? "has-error" : ""}
              required
            />
          </FormField>

          <FormField
            label="URL Slug *"
            htmlFor="cat-slug"
            error={errors.slug}
            hint="Path on storefront (e.g. mens)"
          >
            <input
              id="cat-slug"
              placeholder="mens"
              value={form.slug}
              onChange={(e) => {
                setSlugTouched(true);
                update("slug", e.target.value);
              }}
              className={errors.slug ? "has-error" : ""}
              required
            />
          </FormField>
        </div>

        <FormField label="Description (Optional)" htmlFor="cat-desc" hint="Tagline or overview for collection cards">
          <textarea
            id="cat-desc"
            rows={2}
            placeholder="Contemporary luxury silhouettes crafted for discerning lifestyles..."
            value={form.description}
            onChange={(e) => update("description", e.target.value)}
          />
        </FormField>

        {/* Category Cover Photo */}
        <FormField
          label="Category Cover Photo"
          htmlFor="cat-image"
          error={errors.image_url}
          hint="Recommended: 4:5 portrait ratio (e.g. 800 × 1000px). Displayed across category cards."
        >
          <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
            <input
              id="cat-image"
              value={form.image_url}
              onChange={(e) => update("image_url", e.target.value)}
              placeholder="Paste direct image URL or upload →"
              style={{ flex: 1 }}
            />
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
            >
              <UploadCloud size={16} />
              <span>{isUploading ? "Uploading..." : "Upload Photo"}</span>
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              style={{ display: "none" }}
              onChange={handleImageUpload}
            />
          </div>

          {form.image_url && (
            <div
              style={{
                marginTop: 12,
                display: "flex",
                alignItems: "center",
                gap: 14,
                padding: 12,
                background: "var(--surface-alt)",
                borderRadius: "var(--radius-sm)",
                border: "1px solid var(--border)"
              }}
            >
              <img
                src={form.image_url}
                alt="Category Preview"
                style={{
                  width: 54,
                  height: 68,
                  borderRadius: 6,
                  objectFit: "cover",
                  border: "1px solid var(--border)"
                }}
                onError={(e) => {
                  e.target.style.display = "none";
                }}
              />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text-main)" }}>
                  Cover Image Preview
                </div>
                <div
                  style={{
                    fontSize: 11.5,
                    color: "var(--text-muted)",
                    textOverflow: "ellipsis",
                    overflow: "hidden",
                    whiteSpace: "nowrap"
                  }}
                >
                  {form.image_url}
                </div>
              </div>
              <button
                type="button"
                className="btn btn-ghost btn-sm"
                onClick={() => update("image_url", "")}
                title="Remove image"
                style={{ color: "var(--danger)" }}
              >
                <X size={16} />
                <span>Remove</span>
              </button>
            </div>
          )}
        </FormField>

        <div className="form-grid">
          <FormField label="Display Order" htmlFor="cat-sort" hint="Lower sequence numbers appear first">
            <input
              id="cat-sort"
              type="number"
              value={form.sort_order}
              onChange={(e) => update("sort_order", Number(e.target.value))}
            />
          </FormField>

          <div style={{ display: "flex", alignItems: "center", paddingTop: 20 }}>
            <label className="checkbox-row" style={{ marginBottom: 0 }}>
              <input
                id="cat-active"
                type="checkbox"
                checked={form.is_active}
                onChange={(e) => update("is_active", e.target.checked)}
              />
              <span>
                <strong>Active on Storefront</strong>
              </span>
            </label>
          </div>
        </div>

        <div className="form-actions">
          <button type="button" className="btn btn-secondary" onClick={onClose}>
            Cancel
          </button>
          <button type="submit" className="btn btn-accent" disabled={isSaving}>
            {isSaving ? "Saving..." : isEdit ? "Save Category" : "Create Category"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
