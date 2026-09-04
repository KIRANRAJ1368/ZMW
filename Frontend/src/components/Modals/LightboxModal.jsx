import React, { useEffect } from "react";
import { useShop } from "../../context/ShopContext";
import { INSTAGRAM_SHOWCASE } from "../../data/products";
import "./LightboxModal.css";

export default function LightboxModal() {
  const { lightboxIndex, closeLightbox, nextLightbox, prevLightbox } = useShop();

  // Keyboard navigation
  useEffect(() => {
    if (lightboxIndex === null) return;

    const handleKeyDown = (e) => {
      if (e.key === "Escape") closeLightbox();
      if (e.key === "ArrowRight") nextLightbox();
      if (e.key === "ArrowLeft") prevLightbox();
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [lightboxIndex, closeLightbox, nextLightbox, prevLightbox]);

  if (lightboxIndex === null) return null;

  const currentItem = INSTAGRAM_SHOWCASE[lightboxIndex];

  return (
    <div className="lightbox-modal active" onClick={closeLightbox}>
      <div className="lightbox-container" onClick={(e) => e.stopPropagation()}>
        {/* Close Button */}
        <button
          className="lightbox-close-btn"
          onClick={closeLightbox}
          aria-label="Close Lightbox"
        >
          ✕
        </button>

        {/* Previous Button */}
        <button
          className="lightbox-nav-btn lightbox-prev-btn"
          onClick={prevLightbox}
          aria-label="Previous image"
        >
          ‹
        </button>

        {/* Content Box */}
        <div className="lightbox-content">
          <div className="lightbox-image-box">
            <img
              src={currentItem.image}
              alt={currentItem.caption}
              className="lightbox-img"
            />
          </div>

          <div className="lightbox-details">
            <div className="lightbox-header">
              <span className="lightbox-handle">{currentItem.handle}</span>
              <span className="lightbox-counter">
                {lightboxIndex + 1} / {INSTAGRAM_SHOWCASE.length}
              </span>
            </div>
            <p className="lightbox-caption">{currentItem.caption}</p>
            <div className="lightbox-footer">
              <span className="lightbox-likes">❤️ {currentItem.likes} likes</span>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noreferrer"
                className="btn btn-secondary btn-sm"
              >
                View on Instagram
              </a>
            </div>
          </div>
        </div>

        {/* Next Button */}
        <button
          className="lightbox-nav-btn lightbox-next-btn"
          onClick={nextLightbox}
          aria-label="Next image"
        >
          ›
        </button>
      </div>
    </div>
  );
}
