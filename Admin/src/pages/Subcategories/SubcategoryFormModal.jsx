import { useState } from "react";
import Modal from "../../components/Modal/Modal";
import FormField from "../../components/FormField/FormField";
import ImageUploadField from "../../components/ImageUploadField/ImageUploadField";
import { subcategoriesApi } from "../../services/resources";
import { useToast } from "../../context/ToastContext";
import { ApiError } from "../../services/api";
import { slugify } from "../../utils/slugify";
import { getSubcategoryImageUrl } from "../../utils/categoryImageResolver";

export default function SubcategoryFormModal({ subcategory, categories, onClose, onSaved }) {
  const isEdit = !!subcategory.id;
  const [form, setForm] = useState({
    category_id: subcategory.category_id || subcategory.category?.id || categories[0]?.id || "",
    name: subcategory.name || "",
    slug: subcategory.slug || "",
    image_url: subcategory.image_url || (isEdit ? getSubcategoryImageUrl(subcategory) : ""),
    sort_order: subcategory.sort_order ?? 0,
    is_active: subcategory.is_active ?? true
  });
  const [errors, setErrors] = useState({});
  const [isSaving, setIsSaving] = useState(false);
  const [slugTouched, setSlugTouched] = useState(isEdit);
  const toast = useToast();

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  }

  function handleNameChange(value) {
    update("name", value);
    if (!slugTouched) update("slug", slugify(value));
  }

  function validate() {
    const errs = {};
    const trimmedName = (form.name || "").trim();
    const trimmedSlug = (form.slug || "").trim();
    const trimmedImage = (form.image_url || "").trim();
    const catId = Number(form.category_id);

    if (!catId) {
      errs.category_id = "Please select a parent category";
    }

    if (!trimmedName) {
      errs.name = "Subcategory title is required";
    } else if (trimmedName.length > 80) {
      errs.name = "Subcategory title must be under 80 characters";
    }

    if (!trimmedSlug) {
      errs.slug = "URL slug is required";
    } else if (!/^[a-z0-9-]+$/.test(trimmedSlug)) {
      errs.slug = "Slug may only contain lowercase letters, numbers, and hyphens";
    }

    if (!trimmedImage) {
      errs.image_url = "Subcategory thumbnail is required. Please upload an image.";
    }

    return errs;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      const firstError = Object.values(validationErrors)[0];
      toast.error(firstError || "Please fill in all required fields.");
      return;
    }

    setErrors({});
    setIsSaving(true);
    try {
      const payload = {
        category_id: Number(form.category_id),
        name: form.name.trim(),
        slug: form.slug.trim(),
        image_url: form.image_url.trim(),
        sort_order: Number(form.sort_order) || 0,
        is_active: Boolean(form.is_active)
      };

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
      toast.error(err.message || "Failed to save subcategory");
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
            className={errors.category_id ? "has-error" : ""}
            required
          >
            <option value="">Select a Parent Category...</option>
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
        <ImageUploadField
          label="Subcategory Thumbnail"
          value={form.image_url}
          onChange={(url) => update("image_url", url)}
          folder="subcategories"
          hint="Recommended: 3:4 portrait (e.g. 600 × 800px). Used for filter pill previews."
          error={errors.image_url}
          required
        />

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
