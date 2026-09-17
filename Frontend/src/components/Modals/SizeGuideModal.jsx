import React, { useState } from "react";
import "./SizeGuideModal.css";

export const SIZE_CHART = [
  { size: "XS", chest: "40 in", length: "27.5 in", shoulder: "20.5 in", sleeve: "8.5 in" },
  { size: "S", chest: "42 in", length: "28.5 in", shoulder: "21.5 in", sleeve: "9.0 in" },
  { size: "M", chest: "44 in", length: "29.5 in", shoulder: "22.5 in", sleeve: "9.5 in" },
  { size: "L", chest: "46 in", length: "30.5 in", shoulder: "23.5 in", sleeve: "10.0 in" },
  { size: "XL", chest: "48 in", length: "31.5 in", shoulder: "24.5 in", sleeve: "10.5 in" },
  { size: "XXL", chest: "50 in", length: "32.5 in", shoulder: "25.5 in", sleeve: "11.0 in" }
];

// Helper to convert "XX.X in" to cm
function toCm(inStr) {
  const val = parseFloat(inStr);
  if (isNaN(val)) return inStr;
  return `${(val * 2.54).toFixed(1)} cm`;
}

export default function SizeGuideModal({ isOpen, onClose, selectedSize }) {
  const [unit, setUnit] = useState("in"); // "in" or "cm"

  if (!isOpen) return null;

  return (
    <div className="sg-modal-overlay" onClick={onClose} role="dialog" aria-modal="true">
      <div className="sg-modal-card" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="sg-modal-header">
          <div>
            <span className="sg-modal-eyebrow">FIT & DIMENSIONS</span>
            <h3 className="sg-modal-title">Size & Fit Guide</h3>
          </div>
          <button
            type="button"
            className="sg-modal-close-btn"
            onClick={onClose}
            aria-label="Close size guide"
          >
            ✕
          </button>
        </div>

        {/* Body */}
        <div className="sg-modal-body">
          {/* Fit Tip Banner */}
          <div className="sg-fit-banner">
            <div className="sg-fit-badge">INTENTIONAL OVERSIZED FIT</div>
            <p className="sg-fit-text">
              Our streetwear garments are cut deliberately with drop shoulders and a relaxed chest drape.
              <strong> Order your standard size for the intended oversized look.</strong> If you prefer a classic regular fit, order <strong>one size down</strong>.
            </p>
          </div>

          {/* Unit Toggle Bar */}
          <div className="sg-controls-bar">
            <span className="sg-table-label">Garment Dimensions (Flat Lay)</span>
            <div className="sg-unit-toggle">
              <button
                type="button"
                className={`sg-unit-btn ${unit === "in" ? "active" : ""}`}
                onClick={() => setUnit("in")}
              >
                Inches (in)
              </button>
              <button
                type="button"
                className={`sg-unit-btn ${unit === "cm" ? "active" : ""}`}
                onClick={() => setUnit("cm")}
              >
                Centimeters (cm)
              </button>
            </div>
          </div>

          {/* Table */}
          <div className="sg-table-responsive-wrapper">
            <table className="sg-size-table">
              <thead>
                <tr>
                  <th className="sg-th-size">Size</th>
                  <th>Chest</th>
                  <th>Body Length</th>
                  <th>Shoulder Width</th>
                  <th>Sleeve Length</th>
                </tr>
              </thead>
              <tbody>
                {SIZE_CHART.map((row) => {
                  const isSelected = selectedSize === row.size;
                  return (
                    <tr key={row.size} className={isSelected ? "sg-row-active" : ""}>
                      <td className="sg-td-size">
                        <span className="sg-size-pill">{row.size}</span>
                        {isSelected && <span className="sg-selected-tag">Selected</span>}
                      </td>
                      <td>{unit === "in" ? row.chest : toCm(row.chest)}</td>
                      <td>{unit === "in" ? row.length : toCm(row.length)}</td>
                      <td>{unit === "in" ? row.shoulder : toCm(row.shoulder)}</td>
                      <td>{unit === "in" ? row.sleeve : toCm(row.sleeve)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* How to Measure Grid */}
          <div className="sg-measure-section">
            <h4 className="sg-measure-title">How To Measure Your Best-Fitting Tee:</h4>
            <div className="sg-measure-grid">
              <div className="sg-measure-item">
                <span className="sg-measure-number">1</span>
                <div>
                  <strong>Chest (Width)</strong>
                  <p>Lay garment flat. Measure horizontally 1 inch directly below armholes across the chest.</p>
                </div>
              </div>
              <div className="sg-measure-item">
                <span className="sg-measure-number">2</span>
                <div>
                  <strong>Body Length</strong>
                  <p>Measure straight down from highest point of the shoulder seam to bottom hem.</p>
                </div>
              </div>
              <div className="sg-measure-item">
                <span className="sg-measure-number">3</span>
                <div>
                  <strong>Shoulder Width</strong>
                  <p>Measure horizontally across the back from left shoulder seam to right shoulder seam.</p>
                </div>
              </div>
              <div className="sg-measure-item">
                <span className="sg-measure-number">4</span>
                <div>
                  <strong>Sleeve Length</strong>
                  <p>Measure along the outer sleeve seam from the shoulder junction down to the sleeve cuff.</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="sg-modal-footer">
          <p className="sg-footer-note">
            Still unsure about your fit? Chat with our team on WhatsApp: <strong>+91 9876543210</strong>
          </p>
          <button type="button" className="btn btn-primary btn-sm" onClick={onClose}>
            Got It
          </button>
        </div>
      </div>
    </div>
  );
}
