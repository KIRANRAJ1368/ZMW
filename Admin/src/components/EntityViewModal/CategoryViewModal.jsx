import { Image as ImageIcon } from "lucide-react";
import Modal from "../Modal/Modal";
import StatusBadge from "../StatusBadge/StatusBadge";
import "./EntityViewModal.css";

const formatDate = (value) =>
  value
    ? new Date(value).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
    : "—";

export default function CategoryViewModal({ category, onClose }) {
  const data = category || null;

  if (!data) {
    return (
      <Modal title="Category Details" onClose={onClose} width={560}>
        <div className="ev-error">
          <p>Category not found.</p>
          <button type="button" className="btn btn-secondary" onClick={onClose}>
            Close
          </button>
        </div>
      </Modal>
    );
  }

  const subcategories = data.subcategories || [];

  return (
    <Modal title="Category Details" onClose={onClose} width={760}>
      <div className="ev">
        {/* Header */}
        <div className="ev-header">
          <div className="ev-heading">
            <h2 className="ev-name">{data.name}</h2>
            <div className="ev-meta-line">
              <code>{data.slug || "—"}</code>
              <span className="ev-sep">•</span>
              <span>
                {subcategories.length} subcategor{subcategories.length === 1 ? "y" : "ies"}
              </span>
            </div>
          </div>
          <div className="ev-status-col">
            <StatusBadge value={data.is_active ? "active" : "inactive"} />
          </div>
        </div>

        {/* Image + details */}
        <div className="ev-grid">
          <div className="ev-media">
            <div className="ev-section-label">Cover Image</div>
            {data.image_url ? (
              <div className="ev-image-frame ev-image-frame-portrait">
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
                <span className="ev-attr-label">Category Name</span>
                <span className="ev-attr-value">{data.name}</span>
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
                <span className="ev-attr-label">Visibility</span>
                <span className="ev-attr-value">{data.is_active ? "Active" : "Inactive"}</span>
              </div>
              <div className="ev-attr">
                <span className="ev-attr-label">Subcategories</span>
                <span className="ev-attr-value">{subcategories.length}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Description */}
        <div className="ev-desc">
          <div className="ev-section-label">Description</div>
          <p>{data.description || "No description provided."}</p>
        </div>

        {/* Subcategory chips */}
        {subcategories.length > 0 && (
          <div>
            <div className="ev-section-label">
              Subcategories <span className="ev-section-count">({subcategories.length})</span>
            </div>
            <div className="ev-chip-row">
              {subcategories.map((s) => (
                <span className="ev-chip" key={s.id}>
                  {s.name}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Footer meta */}
        <div className="ev-footer">
          <span className="ev-footer-item">
            Category ID: <strong>{data.id}</strong>
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
