import { useState, useRef } from "react";
import { UploadCloud, Image as ImageIcon, X } from "lucide-react";
import Modal from "../../components/Modal/Modal";
import FormField from "../../components/FormField/FormField";
import { subcategoriesApi, uploadApi } from "../../services/resources";
import { useToast } from "../../context/ToastContext";
import { ApiError } from "../../services/api";
import { slugify } from "../../utils/slugify";

export default function SubcategoryFormModal({ subcategory, categories, onClose, onSaved }) {
  const isEdit = !!subcategory.id;
  const [form, setForm] = useState({
    category_id: subcategory.category_id || subcategory.category?.id || categories[0]?.id || "",
    name: subcategory.name || "",
    slug: subcategory.slug || "",
    image_url: subcategory.image_url || "",
    sort_order: subcategory.sort_order ?? 0,
    is_active: subcategory.is_active ?? true
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
      const result = await uploadApi.upload("subcategories", files);
      const url = result?.data?.files?.[0]?.url || result?.files?.[0]?.url;
      if (url) {
        update("image_url", url);
        toast.success("Subcategory photo uploaded successfully");
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
      const payload = { ...form, category_id: Number(form.category_id) };
      if (isEdit) {
        await subcategoriesApi.update(subcategory.id, payload);
        toast.success("Subcategory updated successfully");
      } else {
        await subcategoriesApi.create(payload);
        toast.success("Subcategory created successfully");
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
      title={isEdit ? "Edit Subcategory" : "Add New Subcategory"}
      onClose={onClose}
      width={600}
    >
      <form onSubmit={handleSubmit}>
        <FormField label="Parent Category *" htmlFor="sub-category" error={errors.category_id}>
          <select
            id="sub-category"
            value={form.category_id}
            onChange={(e) => update("category_id", e.target.value)}
            required
          >
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </FormField>

        <div className="form-grid">
          <FormField label="Subcategory Title *" htmlFor="sub-name" error={errors.name}>
            <input
              id="sub-name"
              placeholder="e.g. Oversized Hoodies, Vintage Tees, Cargos"
              value={form.name}
              onChange={(e) => handleNameChange(e.target.value)}
              className={errors.name ? "has-error" : ""}
              required
            />
          </FormField>

          <FormField label="URL Slug *" htmlFor="sub-slug" error={errors.slug} hint="Collection filter path">
            <input
              id="sub-slug"
              placeholder="oversized-hoodies"
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

        {/* Subcategory Image */}
        <FormField
          label="Subcategory Thumbnail"
          htmlFor="sub-image"
          error={errors.image_url}
          hint="Recommended: 3:4 portrait (e.g. 600 × 800px). Used for filter pill previews."
        >
          <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
            <input
              id="sub-image"
              value={form.image_url}
              onChange={(e) => update("image_url", e.target.value)}
              placeholder="Paste image URL or upload →"
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
                alt="Subcategory Preview"
                style={{
                  width: 48,
                  height: 60,
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
                  Thumbnail Preview
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
          <FormField label="Display Order" htmlFor="sub-sort" hint="Sequence within parent category">
            <input
              id="sub-sort"
              type="number"
              value={form.sort_order}
              onChange={(e) => update("sort_order", Number(e.target.value))}
            />
          </FormField>

          <div style={{ display: "flex", alignItems: "center", paddingTop: 20 }}>
            <label className="checkbox-row" style={{ marginBottom: 0 }}>
              <input
                id="sub-active"
                type="checkbox"
                checked={form.is_active}
                onChange={(e) => update("is_active", e.target.checked)}
              />
              <span>
                <strong>Active in Storefront Filter Pills</strong>
              </span>
            </label>
          </div>
        </div>

        <div className="form-actions">
          <button type="button" className="btn btn-secondary" onClick={onClose}>
            Cancel
          </button>
          <button type="submit" className="btn btn-accent" disabled={isSaving}>
            {isSaving ? "Saving..." : isEdit ? "Save Subcategory" : "Create Subcategory"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
