import { useState } from "react";
import Modal from "../../components/Modal/Modal";
import FormField from "../../components/FormField/FormField";
import { categoriesApi } from "../../services/resources";
import { useToast } from "../../context/ToastContext";
import { ApiError } from "../../services/api";
import { slugify } from "../../utils/slugify";

export default function CategoryFormModal({ category, onClose, onSaved }) {
  const isEdit = !!category?.id;
  const [name, setName] = useState(category?.name || "");
  const [sortOrder, setSortOrder] = useState(category?.sort_order ?? 0);
  const [error, setError] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const toast = useToast();

  function handleNameChange(value) {
    setName(value);
    if (error) setError("");
  }

  function validate() {
    const trimmed = (name || "").trim();
    if (!trimmed) {
      return "Category name is required";
    }
    if (trimmed.length > 80) {
      return "Category name must be under 80 characters";
    }
    return "";
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const validationError = validate();
    if (validationError) {
      setError(validationError);
      toast.error(validationError);
      return;
    }

    setError("");
    setIsSaving(true);
    try {
      const cleanName = name.trim();
      const generatedSlug = slugify(cleanName);

      const payload = {
        name: cleanName,
        slug: generatedSlug,
        sort_order: Number(sortOrder) || 0,
        is_active: category?.is_active ?? true,
        show_on_homepage: category?.show_on_homepage ?? true,
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
        const first = err.details[0]?.message;
        if (first) setError(first);
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
      width={460}
    >
      <form onSubmit={handleSubmit}>
        <FormField
          label="Category Name *"
          htmlFor="cat-name"
          error={error}
          hint="Primary storefront category title (e.g. Men, Women, Kids)"
        >
          <input
            id="cat-name"
            placeholder="e.g. Kids, Men, Women, Accessories"
            value={name}
            onChange={(e) => handleNameChange(e.target.value)}
            className={error ? "has-error" : ""}
            autoFocus
            required
          />
        </FormField>

        <FormField
          label="Sequence Number"
          htmlFor="cat-sort-order"
          hint="Controls display order on the storefront (lower number = appears first)"
        >
          <input
            id="cat-sort-order"
            type="number"
            min="0"
            placeholder="e.g. 1, 2, 3"
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value)}
          />
        </FormField>

        <div className="form-actions" style={{ marginTop: 24 }}>
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
