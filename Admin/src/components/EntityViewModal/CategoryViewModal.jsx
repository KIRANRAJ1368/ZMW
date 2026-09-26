import { useState } from "react";
import { ZoomIn, FolderTree, ArrowUpRight, Hash, Layers, Eye } from "lucide-react";
import Modal from "../Modal/Modal";
import StatusBadge from "../StatusBadge/StatusBadge";
import ImageLightboxModal from "../ImageLightboxModal/ImageLightboxModal";
import { resolveImageUrl } from "../../utils/imageUrl";
import { getCategoryImageUrl } from "../../utils/categoryImageResolver";
import "./EntityViewModal.css";

const formatDate = (value) =>
  value
    ? new Date(value).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
    : "—";

export default function CategoryViewModal({ category, onEdit, onClose }) {
  const [showLightbox, setShowLightbox] = useState(false);
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
  const imageUrl = getCategoryImageUrl(data);
  const resolvedImg = resolveImageUrl(imageUrl);

  return (
    <Modal title="Category Overview" onClose={onClose} width={740}>
      <div className="ev">
        {/* Header Banner */}
        <div className="ev-header">
          <div className="ev-heading">
            <div className="ev-title-row">
              <h2 className="ev-name">{data.name}</h2>
              <span className="pill-badge badge-gold">Primary Department</span>
            </div>
            <div className="ev-meta-line">
              <code>/{data.slug || "—"}</code>
              <span className="ev-sep">•</span>
              <span>
                {subcategories.length} item group{subcategories.length === 1 ? "" : "s"}
              </span>
            </div>
          </div>
          <div className="ev-status-col">
            <StatusBadge value={data.is_active ? "active" : "inactive"} />
          </div>
        </div>

        {/* 2-Column Body: Spotlight + Stat Cards */}
        <div className="ev-grid">
          <div className="ev-media">
            <div className="ev-section-label">Department Photography</div>
            <div
              className="ev-image-frame ev-image-frame-portrait ev-image-clickable"
              onClick={() => setShowLightbox(true)}
              title="Click to inspect in Full HD"
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === "Enter" && setShowLightbox(true)}
            >
              <span className="ev-image-badge">Storefront Cover</span>
              <img
                src={resolvedImg}
                alt={data.name}
                loading="lazy"
                onError={(e) => {
                  e.currentTarget.src = "/images/dept-family-banner.jpg";
                }}
              />
              <div className="ev-image-hover-hint">
                <ZoomIn size={14} />
                <span>Enlarge HD</span>
              </div>
            </div>
          </div>

          <div className="ev-details">
            <div className="ev-section-label">Storefront Specifications</div>

            <div className="ev-stat-grid">
              <div className="ev-stat-card">
                <span className="ev-stat-label">Navigation Slug</span>
                <span className="ev-stat-value">
                  <code>/{data.slug || "—"}</code>
                </span>
              </div>

              <div className="ev-stat-card">
                <span className="ev-stat-label">Sort Priority</span>
                <span className="ev-stat-value">
                  <Hash size={14} style={{ color: "var(--indigo)" }} />
                  <span>Sequence #{data.sort_order ?? 0}</span>
                </span>
              </div>

              <div className="ev-stat-card">
                <span className="ev-stat-label">Subcategories</span>
                <span className="ev-stat-value">
                  <Layers size={14} style={{ color: "var(--indigo)" }} />
                  <span>{subcategories.length} Classified Groups</span>
                </span>
              </div>

              <div className="ev-stat-card">
                <span className="ev-stat-label">Catalog Status</span>
                <span className="ev-stat-value">
                  <Eye size={14} style={{ color: data.is_active ? "#059669" : "#94a3b8" }} />
                  <span>{data.is_active ? "Live on Store" : "Hidden"}</span>
                </span>
              </div>
            </div>

            {/* Editorial Description */}
            <div>
              <div className="ev-section-label">Department Overview</div>
              <div className="ev-desc-card">
                <p>
                  {data.description ||
                    `Bespoke wardrobe essentials curated for iconic fashion and luxury lifestyle within the ${data.name} department.`}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Subcategories Chips */}
        {subcategories.length > 0 && (
          <div>
            <div className="ev-section-label">
              <FolderTree size={13} />
              <span>Assigned Subcategories & Item Groups</span>
              <span className="ev-section-count">({subcategories.length})</span>
            </div>
            <div className="ev-chip-row">
              {subcategories.map((s) => (
                <span className="ev-chip" key={s.id || s.slug}>
                  <span className="ev-chip-dot" />
                  <span>{s.name}</span>
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Footer Meta & Actions */}
        <div className="ev-footer">
          <div className="ev-footer-meta">
            <span>
              Category ID: <strong>#{data.id}</strong>
            </span>
            <span className="ev-sep">•</span>
            <span>Created {formatDate(data.createdAt || data.created_at)}</span>
          </div>

          <div className="ev-footer-actions">
            {onEdit && (
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={() => {
                  onClose();
                  onEdit(data);
                }}
              >
                Edit Category
              </button>
            )}
            <button type="button" className="btn btn-accent btn-sm" onClick={onClose}>
              Done
            </button>
          </div>
        </div>
      </div>

      {showLightbox && (
        <ImageLightboxModal
          src={resolvedImg}
          alt={data.name}
          onClose={() => setShowLightbox(false)}
        />
      )}
    </Modal>
  );
}
