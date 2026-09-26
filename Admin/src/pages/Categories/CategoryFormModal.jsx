import { useState } from "react";
import Modal from "../../components/Modal/Modal";
import FormField from "../../components/FormField/FormField";
import ImageUploadField from "../../components/ImageUploadField/ImageUploadField";
import { categoriesApi } from "../../services/resources";
import { useToast } from "../../context/ToastContext";
import { ApiError } from "../../services/api";
import { slugify } from "../../utils/slugify";
import { getCategoryImageUrl } from "../../utils/categoryImageResolver";

export default function CategoryFormModal({ category, onClose, onSaved }) {
  const isEdit = !!category.id;
  const [form, setForm] = useState({
    name: category.name || "",
    slug: category.slug || "",
    description: category.description || "",
    image_url: category.image_url || (isEdit ? getCategoryImageUrl(category) : ""),
    sort_order: category.sort_order ?? 0,
    is_active: category.is_active ?? true
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

    if (!trimmedName) {
      errs.name = "Category name is required";
    } else if (trimmedName.length > 80) {
      errs.name = "Category name must be under 80 characters";
    }

    if (!trimmedSlug) {
      errs.slug = "URL slug is required";
    } else if (!/^[a-z0-9-]+$/.test(trimmedSlug)) {
      errs.slug = "Slug may only contain lowercase letters, numbers, and hyphens";
    }

    if (!trimmedImage) {
      errs.image_url = "Category cover photo is required. Please upload an image.";
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
        name: form.name.trim(),
        slug: form.slug.trim(),
        description: form.description ? form.description.trim() : "",
        image_url: form.image_url.trim(),
        sort_order: Number(form.sort_order) || 0,
        is_active: Boolean(form.is_active)
      };

      if (isEdit) {
        await categoriesApi.update(category.id, payload);
        toast.success("Category updated successfully");
      } else {
        await categoriesApi.create(payload);
        toast.success("Category created successfully");
      }
      onSaved();
    } catch (err) {
      if (err instanceof ApiError && err.details?.length) {
        setErrors(Object.fromEntries(err.details.map((d) => [d.field, d.message])));
      }
      toast.error(err.message || "Failed to save category");
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
        <ImageUploadField
          label="Category Cover Photo"
          value={form.image_url}
          onChange={(url) => update("image_url", url)}
          folder="categories"
          hint="Recommended: 4:5 portrait ratio (e.g. 800 × 1000px). Displayed across category cards on storefront."
          error={errors.image_url}
          required
        />

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
