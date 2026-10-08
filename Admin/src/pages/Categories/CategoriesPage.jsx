import { useEffect, useState } from "react";
import { Plus, Edit2, Trash2, Eye } from "lucide-react";
import { categoriesApi } from "../../services/resources";
import { useToast } from "../../context/ToastContext";
import { useConfirm } from "../../components/ConfirmDialog/ConfirmDialog";
import DataTable from "../../components/DataTable/DataTable";
import StatusBadge from "../../components/StatusBadge/StatusBadge";
import CategoryFormModal from "./CategoryFormModal";
import CategoryViewModal from "../../components/EntityViewModal/CategoryViewModal";

export default function CategoriesPage() {
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editing, setEditing] = useState(null); // null = closed, {} = new, {...} = edit
  const [viewing, setViewing] = useState(null);
  const [togglingId, setTogglingId] = useState(null);
  const toast = useToast();
  const [confirm, ConfirmModal] = useConfirm();

  async function load() {
    setIsLoading(true);
    try {
      const { data } = await categoriesApi.list();
      setCategories(data || []);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleToggleHomepage(category, nextValue) {
    setTogglingId(category.id);
    setCategories((prev) =>
      prev.map((c) => (c.id === category.id ? { ...c, show_on_homepage: nextValue } : c))
    );
    try {
      await categoriesApi.update(category.id, { show_on_homepage: nextValue });
      toast.success(
        nextValue
          ? `☑ ${category.name} → Show on Homepage (Enabled)`
          : `☐ ${category.name} → Hide from Homepage (Disabled)`
      );
    } catch (err) {
      setCategories((prev) =>
        prev.map((c) => (c.id === category.id ? { ...c, show_on_homepage: !nextValue } : c))
      );
      toast.error(err.message || "Failed to update homepage category status");
    } finally {
      setTogglingId(null);
    }
  }

  async function handleDelete(category) {
    const ok = await confirm({
      title: "Delete Category?",
      message: `"${category.name}" and all category linkages will be permanently removed. Ensure no products or subcategories are currently assigned to it.`
    });
    if (!ok) return;
    try {
      await categoriesApi.remove(category.id);
      toast.success("Category successfully deleted");
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
            <span>Categories</span>
            <span className="pill-badge badge-gold">
              {categories.length} Categor{categories.length === 1 ? "y" : "ies"}
            </span>
          </h1>
          <p className="page-subtitle">
            Configure primary store navigational categories.
          </p>
        </div>
        <button type="button" className="btn btn-accent btn-lg" onClick={() => setEditing({})}>
          <Plus size={17} />
          <span>Add Category</span>
        </button>
      </div>

      <div className="card">
        <DataTable
          isLoading={isLoading}
          rows={categories}
          rowKey={(row) => row.id}
          emptyTitle="No categories found"
          emptyDescription="Create your first clothing category to organize your catalog."
          emptyAction={
            <button type="button" className="btn btn-accent" onClick={() => setEditing({})}>
              <Plus size={16} />
              <span>Create Category</span>
            </button>
          }
          columns={[
            {
              key: "name",
              label: "Category Title",
              align: "left",
              render: (row) => (
                <div>
                  <span className="cell-title">{row.name}</span>
                  {row.description && (
                    <div
                      className="cell-muted"
                      style={{ maxWidth: 320, textOverflow: "ellipsis", overflow: "hidden", whiteSpace: "nowrap" }}
                    >
                      {row.description}
                    </div>
                  )}
                </div>
              )
            },
            {
              key: "slug",
              label: "URL Slug",
              align: "left",
              render: (row) => <code>{row.slug}</code>
            },
            {
              key: "subcategories",
              label: "Subcategories",
              width: "130px",
              align: "center",
              render: (row) => (
                <span className="pill-badge badge-dark">
                  {row.subcategories?.length ?? 0} groups
                </span>
              )
            },
            {
              key: "sort_order",
              label: "Sequence",
              width: "90px",
              align: "center",
              render: (row) => <strong>{row.sort_order}</strong>
            },
            {
              key: "is_active",
              label: "Catalog Status",
              width: "120px",
              align: "center",
              render: (row) => <StatusBadge value={row.is_active ? "active" : "inactive"} />
            },
            {
              key: "show_on_homepage",
              label: "Show on Homepage",
              width: "185px",
              align: "center",
              render: (row) => {
                const isShown = row.show_on_homepage !== false;
                const isBusy = togglingId === row.id;
                return (
                  <label
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 8,
                      cursor: isBusy ? "wait" : "pointer",
                      padding: "4px 8px",
                      borderRadius: 6,
                      background: isShown ? "rgba(16, 185, 129, 0.08)" : "rgba(148, 163, 184, 0.08)",
                      border: `1px solid ${isShown ? "rgba(16, 185, 129, 0.25)" : "rgba(148, 163, 184, 0.25)"}`,
                      transition: "all 0.15s ease"
                    }}
                    title={isShown ? "Visible on Homepage (Click to hide)" : "Hidden from Homepage (Click to show)"}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <input
                      type="checkbox"
                      checked={isShown}
                      disabled={isBusy}
                      onChange={(e) => handleToggleHomepage(row, e.target.checked)}
                      style={{ cursor: "pointer", accentColor: "#059669" }}
                    />
                    <span
                      style={{
                        fontSize: 12,
                        fontWeight: 600,
                        color: isShown ? "#059669" : "#64748b"
                      }}
                    >
                      {isShown ? "Show on Homepage" : "Hide from Homepage"}
                    </span>
                  </label>
                );
              }
            },
            {
              key: "actions",
              label: "Actions",
              width: "220px",
              align: "right",
              render: (row) => (
                <div className="table-actions">
                  <button
                    type="button"
                    className="btn btn-secondary btn-sm"
                    onClick={() => setViewing(row)}
                    title="View category details"
                  >
                    <Eye size={13} />
                    <span>View</span>
                  </button>
                  <button
                    type="button"
                    className="btn btn-secondary btn-sm"
                    onClick={() => setEditing(row)}
                    title="Edit category"
                  >
                    <Edit2 size={13} />
                    <span>Edit</span>
                  </button>
                  <button
                    type="button"
                    className="btn btn-danger btn-sm"
                    onClick={() => handleDelete(row)}
                    title="Delete category"
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
        <CategoryFormModal
          category={editing}
          onClose={() => setEditing(null)}
          onSaved={() => {
            setEditing(null);
            load();
          }}
        />
      )}
      {viewing && (
        <CategoryViewModal
          category={viewing}
          onEdit={(cat) => setEditing(cat)}
          onClose={() => setViewing(null)}
        />
      )}
      <ConfirmModal />
    </div>
  );
}
