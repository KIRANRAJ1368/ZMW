import { Image as ImageIcon } from "lucide-react";
import Modal from "../Modal/Modal";
import StatusBadge from "../StatusBadge/StatusBadge";
import "./EntityViewModal.css";

const formatDate = (value) =>
  value
    ? new Date(value).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
    : "—";

export default function SubcategoryViewModal({ subcategory, onClose }) {
  const data = subcategory || null;

  if (!data) {
    return (
      <Modal title="Subcategory Details" onClose={onClose} width={560}>
        <div className="ev-error">
          <p>Subcategory not found.</p>
          <button type="button" className="btn btn-secondary" onClick={onClose}>
            Close
          </button>
        </div>
      </Modal>
    );
  }

  const parent = data.category || null;

  return (
    <Modal title="Subcategory Details" onClose={onClose} width={760}>
      <div className="ev">
        {/* Header */}
        <div className="ev-header">
          <div className="ev-heading">
            <h2 className="ev-name">{data.name}</h2>
            <div className="ev-meta-line">
              <code>{data.slug || "—"}</code>
              <span className="ev-sep">•</span>
              <span>{parent?.name || "Unassigned"}</span>
            </div>
          </div>
          <div className="ev-status-col">
            <span className="pill-badge badge-gold">{parent?.name || "Unassigned"}</span>
            <StatusBadge value={data.is_active ? "active" : "inactive"} />
          </div>
        </div>

        {/* Image + details */}
        <div className="ev-grid">
          <div className="ev-media">
            <div className="ev-section-label">Thumbnail Image</div>
            {data.image_url ? (
              <div className="ev-image-frame ev-image-frame-tall">
                <img
                  src={data.image_url}
                  alt={data.name}
                  loading="lazy"
                  onError={(e) => {
                    e.currentTarget.style.display = "none";
                  }}
                />
              </div>
            ) : (
              <div className="ev-no-image">
                <ImageIcon size={22} />
                <span>No image uploaded</span>
              </div>
            )}
          </div>

          <div className="ev-details">
            <div className="ev-section-label">Details</div>
            <div className="ev-attr-list">
              <div className="ev-attr">
                <span className="ev-attr-label">Subcategory Name</span>
                <span className="ev-attr-value">{data.name}</span>
              </div>
              <div className="ev-attr">
                <span className="ev-attr-label">Parent Category</span>
                <span className="ev-attr-value">{parent?.name || "Unassigned"}</span>
              </div>
              <div className="ev-attr">
                <span className="ev-attr-label">Category Slug</span>
                {parent?.slug ? (
                  <code className="ev-attr-code">{parent.slug}</code>
                ) : (
                  <span className="ev-none">—</span>
                )}
              </div>
              <div className="ev-attr">
                <span className="ev-attr-label">URL Slug</span>
                <code className="ev-attr-code">{data.slug || "—"}</code>
              </div>
              <div className="ev-attr">
                <span className="ev-attr-label">Sequence</span>
                <span className="ev-attr-value">{data.sort_order ?? 0}</span>
              </div>
              <div className="ev-attr">
                <span className="ev-attr-label">Filter Pill Status</span>
                <span className="ev-attr-value">{data.is_active ? "Active" : "Inactive"}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Description (only if the field exists on the record) */}
        {data.description && (
          <div className="ev-desc">
            <div className="ev-section-label">Description</div>
            <p>{data.description}</p>
          </div>
        )}

        {/* Footer meta */}
        <div className="ev-footer">
          <span className="ev-footer-item">
            Subcategory ID: <strong>{data.id}</strong>
            {data.category_id ? (
              <>
                <span className="ev-sep">•</span>
                <span>
                  Category ID: <strong>{data.category_id}</strong>
                </span>
              </>
            ) : null}
          </span>
          <span className="ev-footer-item">
            Added {formatDate(data.createdAt)}
            {data.updatedAt ? ` • Updated ${formatDate(data.updatedAt)}` : ""}
          </span>
        </div>
      </div>
    </Modal>
  );
}
