import { useEffect, useState } from "react";
import { Plus, Edit2, Trash2, Eye, Image as ImageIcon } from "lucide-react";
import { categoriesApi } from "../../services/resources";
import { useToast } from "../../context/ToastContext";
import { useConfirm } from "../../components/ConfirmDialog/ConfirmDialog";
import DataTable from "../../components/DataTable/DataTable";
import StatusBadge from "../../components/StatusBadge/StatusBadge";
import CategoryFormModal from "./CategoryFormModal";
import CategoryViewModal from "../../components/EntityViewModal/CategoryViewModal";
import ImageLightboxModal from "../../components/ImageLightboxModal/ImageLightboxModal";
import { resolveImageUrl } from "../../utils/imageUrl";
import { getCategoryImageUrl } from "../../utils/categoryImageResolver";

export default function CategoriesPage() {
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editing, setEditing] = useState(null); // null = closed, {} = new, {...} = edit
  const [viewing, setViewing] = useState(null);
  const [lightboxImg, setLightboxImg] = useState(null);
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
            Configure primary store navigational categories (Men, Women, Boys, Girls, Babies) and cover imagery.
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
              key: "image_url",
              label: "Cover Image",
              width: "80px",
              align: "center",
              render: (row) => {
                const img = getCategoryImageUrl(row);
                return (
                  <img
                    src={resolveImageUrl(img)}
                    alt={row.name}
                    className="cell-thumb"
                    style={{ width: 46, height: 58, borderRadius: 8, objectFit: "cover", cursor: "pointer" }}
                    onClick={(e) => {
                      e.stopPropagation();
                      setLightboxImg(resolveImageUrl(img));
                    }}
                    title="Click to inspect cover image in Full HD"
                    onError={(e) => {
                      e.target.src = "/images/dept-family-banner.jpg";
                    }}
                  />
                );
              }
            },
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
              label: "Visibility",
              width: "120px",
              align: "center",
              render: (row) => <StatusBadge value={row.is_active ? "active" : "inactive"} />
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
      {lightboxImg && (
        <ImageLightboxModal
          src={lightboxImg}
          alt="Category Preview"
          onClose={() => setLightboxImg(null)}
        />
      )}
      <ConfirmModal />
    </div>
  );
}
