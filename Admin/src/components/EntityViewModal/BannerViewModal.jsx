import { Image as ImageIcon, Sparkles } from "lucide-react";
import Modal from "../Modal/Modal";
import StatusBadge from "../StatusBadge/StatusBadge";
import "./EntityViewModal.css";

const formatDate = (value) =>
  value
    ? new Date(value).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
    : "—";

export default function BannerViewModal({ banner, onClose }) {
  const data = banner || null;

  if (!data) {
    return (
      <Modal title="Banner Details" onClose={onClose} width={560}>
        <div className="ev-error">
          <p>Banner not found.</p>
          <button type="button" className="btn btn-secondary" onClick={onClose}>
            Close
          </button>
        </div>
      </Modal>
    );
  }

  return (
    <Modal title="Banner Details" onClose={onClose} width={840}>
      <div className="ev">
        {/* Header */}
        <div className="ev-header">
          <div className="ev-heading">
            <h2 className="ev-name">{data.title}</h2>
            <div className="ev-meta-line">
              {data.tag && (
                <>
                  <span>{data.tag}</span>
                  <span className="ev-sep">•</span>
                </>
              )}
              <code>{data.placement}</code>
            </div>
          </div>
          <div className="ev-status-col">
            {data.placement === "hero" ? (
              <span className="pill-badge badge-gold">
                <Sparkles size={11} />
                <span>Hero Slider</span>
              </span>
            ) : (
              <span className="pill-badge badge-dark">
                <span>{data.placement}</span>
              </span>
            )}
            <StatusBadge value={data.is_active ? "active" : "inactive"} />
          </div>
        </div>

        {/* Promo badges */}
        {(data.tag || data.badge_promo) && (
          <div className="ev-badges">
            {data.tag && <span className="pill-badge badge-dark">{data.tag}</span>}
            {data.badge_promo && <span className="pill-badge badge-gold">{data.badge_promo}</span>}
          </div>
        )}

        {/* Banner image (full width, no distortion) */}
        <div>
          <div className="ev-section-label">Banner Image</div>
          {data.image_url ? (
            <div className="ev-image-frame ev-image-frame-banner">
              <img
                src={data.image_url}
                alt={data.title}
                loading="lazy"
                style={{ objectPosition: data.image_position || "center center" }}
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

        {/* Subtitle / description */}
        <div className="ev-desc">
          <div className="ev-section-label">Subtitle / Description</div>
          <p>{data.subtitle || "No subtitle provided."}</p>
        </div>

        {/* Details grid */}
        <div>
          <div className="ev-section-label">Details</div>
          <div className="ev-attr-cols">
            <div className="ev-attr-list">
              <div className="ev-attr">
                <span className="ev-attr-label">Banner Title</span>
                <span className="ev-attr-value">{data.title}</span>
              </div>
              <div className="ev-attr">
                <span className="ev-attr-label">Placement</span>
                <code className="ev-attr-code">{data.placement}</code>
              </div>
              <div className="ev-attr">
                <span className="ev-attr-label">Eyebrow Tag</span>
                {data.tag ? (
                  <span className="ev-attr-value">{data.tag}</span>
                ) : (
                  <span className="ev-none">—</span>
                )}
              </div>
              <div className="ev-attr">
                <span className="ev-attr-label">Promo Badge</span>
                {data.badge_promo ? (
                  <span className="ev-attr-value">{data.badge_promo}</span>
                ) : (
                  <span className="ev-none">—</span>
                )}
              </div>
              <div className="ev-attr">
                <span className="ev-attr-label">Image Position</span>
                {data.image_position ? (
                  <span className="ev-attr-value">{data.image_position}</span>
                ) : (
                  <span className="ev-none">—</span>
                )}
              </div>
            </div>

            <div className="ev-attr-list">
              <div className="ev-attr">
                <span className="ev-attr-label">Primary Button Text</span>
                {data.primary_cta_text ? (
                  <span className="ev-attr-value">{data.primary_cta_text}</span>
                ) : (
                  <span className="ev-none">—</span>
                )}
              </div>
              <div className="ev-attr">
                <span className="ev-attr-label">Primary Button Link</span>
                {data.primary_cta_link ? (
                  <code className="ev-attr-code">{data.primary_cta_link}</code>
                ) : (
                  <span className="ev-none">—</span>
                )}
              </div>
              <div className="ev-attr">
                <span className="ev-attr-label">Secondary Button Text</span>
                {data.secondary_cta_text ? (
                  <span className="ev-attr-value">{data.secondary_cta_text}</span>
                ) : (
                  <span className="ev-none">—</span>
                )}
              </div>
              <div className="ev-attr">
                <span className="ev-attr-label">Secondary Button Link</span>
                {data.secondary_cta_link ? (
                  <code className="ev-attr-code">{data.secondary_cta_link}</code>
                ) : (
                  <span className="ev-none">—</span>
                )}
              </div>
              <div className="ev-attr">
                <span className="ev-attr-label">Display Order</span>
                <span className="ev-attr-value">{data.sort_order ?? 0}</span>
              </div>
              <div className="ev-attr">
                <span className="ev-attr-label">Status</span>
                <span className="ev-attr-value">{data.is_active ? "Active" : "Inactive"}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer meta */}
        <div className="ev-footer">
          <span className="ev-footer-item">
            Banner ID: <strong>{data.id}</strong>
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
