import { useEffect, useState } from "react";
import { Plus, Edit2, Trash2, Image as ImageIcon, Filter, Tags } from "lucide-react";
import { subcategoriesApi, categoriesApi } from "../../services/resources";
import { useToast } from "../../context/ToastContext";
import { useConfirm } from "../../components/ConfirmDialog/ConfirmDialog";
import DataTable from "../../components/DataTable/DataTable";
import StatusBadge from "../../components/StatusBadge/StatusBadge";
import SubcategoryFormModal from "./SubcategoryFormModal";

export default function SubcategoriesPage() {
  const [subcategories, setSubcategories] = useState([]);
  const [categories, setCategories] = useState([]);
  const [categoryFilter, setCategoryFilter] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [editing, setEditing] = useState(null);
  const toast = useToast();
  const [confirm, ConfirmModal] = useConfirm();

  async function loadCategories() {
    try {
      const { data } = await categoriesApi.list();
      setCategories(data || []);
    } catch (err) {
      toast.error("Failed to load categories");
    }
  }

  async function load() {
    setIsLoading(true);
    try {
      const { data } = await subcategoriesApi.list(categoryFilter ? { category: categoryFilter } : {});
      setSubcategories(data || []);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadCategories();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [categoryFilter]);

  async function handleDelete(subcategory) {
    const ok = await confirm({
      title: "Delete Subcategory?",
      message: `"${subcategory.name}" will be removed. Ensure no products are currently assigned to this category.`
    });
    if (!ok) return;
    try {
      await subcategoriesApi.remove(subcategory.id);
      toast.success("Subcategory deleted successfully");
      load();
    } catch (err) {
      toast.error(err.message);
    }
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">
            <span>Subcategories & Item Groups</span>
            <span className="pill-badge badge-gold">{subcategories.length} Group{subcategories.length === 1 ? "" : "s"}</span>
          </h1>
          <p className="page-subtitle">
            Manage product classifications within each category (e.g. Hoodies, T-Shirts, Bottoms, Jackets).
          </p>
        </div>
        <button
          type="button"
          className="btn btn-accent btn-lg"
          onClick={() => setEditing({})}
          disabled={categories.length === 0}
        >
          <Plus size={17} />
          <span>Add Subcategory</span>
        </button>
      </div>

      <div className="card">
        {/* Filter Toolbar */}
        <div
          style={{
            padding: "16px 22px",
            borderBottom: "1px solid var(--border)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: 12,
            background: "var(--surface)"
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <Filter size={15} style={{ color: "var(--text-muted)" }} />
            <span style={{ fontSize: "13px", fontWeight: 600, color: "var(--text-main)" }}>Filter by Category:</span>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              style={{
                minWidth: 220,
                padding: "8px 12px",
                border: "1.5px solid var(--border)",
                borderRadius: "var(--radius-sm)",
                background: "var(--surface)",
                fontSize: "13px",
                fontWeight: 500
              }}
            >
              <option value="">All Categories</option>
              {categories.map((c) => (
                <option key={c.id} value={c.slug}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
          <span className="hint">
            Showing {subcategories.length} subcategor{subcategories.length === 1 ? "y" : "ies"}
          </span>
        </div>

        <DataTable
          isLoading={isLoading}
          rows={subcategories}
          rowKey={(row) => row.id}
          emptyTitle="No subcategories found"
          emptyDescription={
            categories.length === 0
              ? "Create a category first before adding subcategories."
              : "Add a subcategory to organize products in this category."
          }
          emptyAction={
            <button
              type="button"
              className="btn btn-accent"
              onClick={() => setEditing({})}
              disabled={categories.length === 0}
            >
              <Plus size={16} />
              <span>Add Subcategory</span>
            </button>
          }
          columns={[
            {
              key: "image_url",
              label: "Thumbnail",
              width: 80,
              render: (row) =>
                row.image_url ? (
                  <img
                    src={row.image_url}
                    alt={row.name}
                    className="cell-thumb"
                    style={{ width: 44, height: 52, borderRadius: 6, objectFit: "cover" }}
                    onError={(e) => {
                      e.target.style.display = "none";
                    }}
                  />
                ) : (
                  <div
                    style={{
                      width: 44,
                      height: 52,
                      borderRadius: 6,
                      background: "var(--surface-alt)",
                      border: "1px dashed var(--border)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "var(--text-subtle)"
                    }}
                    title="No image uploaded"
                  >
                    <ImageIcon size={16} />
                  </div>
                )
            },
            {
              key: "name",
              label: "Subcategory Name",
              render: (row) => <span className="cell-title">{row.name}</span>
            },
            {
              key: "category",
              label: "Parent Category",
              render: (row) => (
                <span className="pill-badge badge-gold">
                  {row.category?.name || "Unassigned"}
                </span>
              )
            },
            {
              key: "slug",
              label: "URL Slug",
              render: (row) => <code>{row.slug}</code>
            },
            {
              key: "sort_order",
              label: "Sequence",
              render: (row) => <strong>{row.sort_order}</strong>
            },
            {
              key: "is_active",
              label: "Filter Pill Status",
              render: (row) => <StatusBadge value={row.is_active ? "active" : "inactive"} />
            },
            {
              key: "actions",
              label: "",
              render: (row) => (
                <div className="table-actions">
                  <button
                    type="button"
                    className="btn btn-secondary btn-sm"
                    onClick={() => setEditing(row)}
                    title="Edit subcategory"
                  >
                    <Edit2 size={13} />
                    <span>Edit</span>
                  </button>
                  <button
                    type="button"
                    className="btn btn-danger btn-sm"
                    onClick={() => handleDelete(row)}
                    title="Delete subcategory"
                  >
                    <Trash2 size={13} />
                    <span>Delete</span>
                  </button>
                </div>
              )
            }
          ]}
        />
      </div>

      {editing && (
        <SubcategoryFormModal
          subcategory={editing}
          categories={categories}
          onClose={() => setEditing(null)}
          onSaved={() => {
            setEditing(null);
            load();
          }}
        />
      )}
      <ConfirmModal />
    </div>
  );
}
