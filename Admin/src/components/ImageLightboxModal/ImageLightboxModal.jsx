import { useEffect } from "react";
import { X, ExternalLink, Image as ImageIcon } from "lucide-react";
import { resolveImageUrl } from "../../utils/imageUrl";
import "./ImageLightboxModal.css";

export default function ImageLightboxModal({ src, alt, onClose }) {
  useEffect(() => {
    function onKeyDown(e) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  if (!src) return null;

  const fullUrl = resolveImageUrl(src);

  return (
    <div className="lightbox-backdrop" onClick={onClose} role="dialog" aria-modal="true" aria-label="Image Preview">
      <div className="lightbox-modal" onClick={(e) => e.stopPropagation()}>
        <div className="lightbox-header">
          <div className="lightbox-title-wrap">
            <ImageIcon size={16} className="lightbox-title-icon" />
            <span className="lightbox-title" title={alt || "Image Preview"}>
              {alt || "Image Preview"}
            </span>
          </div>
          <div className="lightbox-actions">
            <a
              href={fullUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="lightbox-btn"
              title="Open full size in new tab"
            >
              <ExternalLink size={16} />
              <span>Full Size</span>
            </a>
            <button
              type="button"
              className="lightbox-btn lightbox-close-btn"
              onClick={onClose}
              aria-label="Close image preview"
              title="Close (Esc)"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        <div className="lightbox-content">
          <img
            src={fullUrl}
            alt={alt || "Full Preview"}
            className="lightbox-img"
            onError={(e) => {
              e.currentTarget.style.display = "none";
              const fb = e.currentTarget.parentElement.querySelector(".lightbox-error");
              if (fb) fb.style.display = "flex";
            }}
          />
          <div className="lightbox-error" style={{ display: "none" }}>
            <ImageIcon size={36} />
            <p>Could not load high-resolution image preview.</p>
            <code>{fullUrl}</code>
          </div>
        </div>
      </div>
    </div>
  );
}
