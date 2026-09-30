import { useState } from "react";
import { Sparkles, AlertCircle } from "lucide-react";
import Modal from "../../components/Modal/Modal";
import FormField from "../../components/FormField/FormField";
import ImageUploadField from "../../components/ImageUploadField/ImageUploadField";
import { bannersApi } from "../../services/resources";
import { useToast } from "../../context/ToastContext";
import { ApiError } from "../../services/api";

const PLACEMENTS = [
  { value: "hero", label: "Hero Carousel (Storefront Homepage Top)" },
  { value: "mens", label: "Men's Collection Header" },
  { value: "women", label: "Women's Collection Header" },
  { value: "kids", label: "Kids Collection Header" },
  { value: "boys", label: "Boys Collection Header" },
  { value: "girls", label: "Girls Collection Header" },
  { value: "babies", label: "Babies Collection Header" },
  { value: "best-sellers", label: "Best Sellers Promo Banner" },
  { value: "new-arrivals", label: "New Arrivals Promo Banner" },
  { value: "default", label: "Default Fallback Banner" }
];

/**
 * Destinations for the primary "Explore Now" button — one per department.
 * Paths mirror the public routes in Frontend/src/App.jsx and use the same
 * /collection?category=... query format as the Navbar so the click stays a
 * client-side navigation.
 */
const CTA_DEPARTMENTS = [
  { value: "/collection?category=mens", label: "Men" },
  { value: "/collection?category=women", label: "Women" },
  { value: "/collection?category=boys", label: "Boys" },
  { value: "/collection?category=girls", label: "Girls" },
  { value: "/collection?category=babies", label: "Babies" }
];

const CTA_DEPARTMENT_VALUES = CTA_DEPARTMENTS.map((option) => option.value);

export default function BannerFormModal({ banner, heroCount = 0, onClose, onSaved }) {
  const isEdit = !!banner.id;

  function defaultPlacement() {
    if (banner.placement) return banner.placement;
    if (heroCount >= 3) return "mens";
    return "hero";
  }

  const [form, setForm] = useState({
    placement: defaultPlacement(),
    title: banner.title || "",
    subtitle: banner.subtitle || "",
    tag: banner.tag || "",
    badge_promo: banner.badge_promo || "",
    image_url: banner.image_url || "",
    image_position: banner.image_position || "center center",
    primary_cta_text: banner.primary_cta_text || "",
    primary_cta_link: banner.primary_cta_link || "",
    secondary_cta_text: banner.secondary_cta_text || "",
    secondary_cta_link: banner.secondary_cta_link || "",
    sort_order: banner.sort_order ?? 0,
    is_active: banner.is_active ?? true
  });
  const [errors, setErrors] = useState({});
  const [isSaving, setIsSaving] = useState(false);
  const toast = useToast();

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (form.placement === "hero" && (!isEdit || banner.placement !== "hero") && heroCount >= 3) {
      toast.error("Maximum 3 Hero Banners can be added.");
      setErrors((prev) => ({ ...prev, placement: "Maximum 3 Hero Banners can be added." }));
      return;
    }

    setErrors({});
    setIsSaving(true);
    try {
      // Keep an existing non-department link unless the admin actively chose a
      // department, so simply opening and saving cannot drop it.
      const payload = ctaLinkChanged ? form : { ...form, primary_cta_link: storedCtaLink };

      if (isEdit) {
        await bannersApi.update(banner.id, payload);
        toast.success("Banner updated successfully");
      } else {
        await bannersApi.create(payload);
        toast.success("Banner created successfully");
      }
      onSaved();
    } catch (err) {
      if (err instanceof ApiError && err.details?.length) {
        setErrors(Object.fromEntries(err.details.map((d) => [d.field, d.message])));
      }
      toast.error(err.message || "Failed to save banner");
    } finally {
      setIsSaving(false);
    }
  }

  const currentIsHeroCapped =
    form.placement === "hero" && (!isEdit || banner.placement !== "hero") && heroCount >= 3;

  // Banners saved before the dropdown existed may point somewhere that is not a
  // department (e.g. the seeded "#collection-catalog"). Those have no matching
  // <option>, so the select falls back to the placeholder for display and the
  // stored value is preserved on save unless the admin actually picks one.
  const storedCtaLink = banner.primary_cta_link || "";
  const ctaLinkValue = form.primary_cta_link || "";
  const ctaLinkSelectValue = CTA_DEPARTMENT_VALUES.includes(ctaLinkValue) ? ctaLinkValue : "";
  const ctaLinkIsUnmapped =
    isEdit && ctaLinkValue !== "" && !CTA_DEPARTMENT_VALUES.includes(ctaLinkValue);
  const ctaLinkChanged = ctaLinkValue !== storedCtaLink;

  return (
    <Modal
      title={isEdit ? "Edit Banner" : "Create New Banner"}
      onClose={onClose}
      width={700}
    >
      <form onSubmit={handleSubmit}>
        {currentIsHeroCapped && (
          <div
            style={{
              background: "#fef2f2",
              border: "1px solid #fecaca",
              color: "#991b1b",
              padding: "10px 14px",
              borderRadius: 8,
              marginBottom: 16,
              fontSize: 13,
              display: "flex",
              alignItems: "center",
              gap: 8
            }}
          >
            <AlertCircle size={16} style={{ flexShrink: 0 }} />
            <span><strong>Maximum 3 Hero Banners can be added.</strong> Please choose another placement or remove an existing hero banner first.</span>
          </div>
        )}

        {/* Placement & Sequence */}
        <div className="form-grid">
          <FormField
            label="Banner Placement / Target *"
            htmlFor="b-placement"
            error={errors.placement || (currentIsHeroCapped ? "Maximum 3 Hero Banners can be added." : null)}
          >
            <select
              id="b-placement"
              value={form.placement}
              onChange={(e) => update("placement", e.target.value)}
            >
              {PLACEMENTS.map((p) => {
                const isHeroOptionDisabled =
                  p.value === "hero" && (!isEdit || banner.placement !== "hero") && heroCount >= 3;
                return (
                  <option key={p.value} value={p.value} disabled={isHeroOptionDisabled}>
                    {p.label}{isHeroOptionDisabled ? " — (Max 3 reached)" : ""}
                  </option>
                );
              })}
            </select>
          </FormField>

          <FormField label="Display Order Sequence" htmlFor="b-sort" hint="Lower appears first in slider">
            <input
              id="b-sort"
              type="number"
              value={form.sort_order}
              onChange={(e) => update("sort_order", Number(e.target.value))}
            />
          </FormField>
        </div>

        {/* Banner Imagery */}
        <ImageUploadField
          label="Banner Image"
          value={form.image_url}
          onChange={(url) => update("image_url", url)}
          folder="banners"
          aspectRatio="16/9"
          previewHeight={180}
          hint="Recommended: 1920 × 800px (16:9 / 21:9 wide landscape). Supports JPG, PNG, WEBP."
          error={errors.image_url}
          required
        />

        <div className="form-grid">
          <FormField
            label="Image Focal Position"
            htmlFor="b-image-position"
            hint="CSS object-position, e.g. center center, right top"
          >
            <input
              id="b-image-position"
              value={form.image_position}
              onChange={(e) => update("image_position", e.target.value)}
              placeholder="center center"
            />
          </FormField>

          <FormField
            label="Promo Badge Tag"
            htmlFor="b-badge"
            hint="e.g. FLAT 20% OFF &bull; LIMITED DROP"
          >
            <input
              id="b-badge"
              placeholder="e.g. LUXURY EDITION &bull; NEW SEASON"
              value={form.badge_promo}
              onChange={(e) => update("badge_promo", e.target.value)}
            />
          </FormField>
        </div>

        {/* Copy / Typography */}
        <FormField
          label="Tagline / Eyebrow Text"
          htmlFor="b-tag"
          hint="Small uppercase kicker above headline, e.g. AUTUMN / WINTER 2026"
        >
          <input
            id="b-tag"
            placeholder="e.g. AUTUMN / WINTER 2026"
            value={form.tag}
            onChange={(e) => update("tag", e.target.value)}
          />
        </FormField>

        <FormField label="Headline Title *" htmlFor="b-title" error={errors.title}>
          <input
            id="b-title"
            placeholder="e.g. Redefine Your Wardrobe"
            value={form.title}
            onChange={(e) => update("title", e.target.value)}
            required
          />
        </FormField>

        <FormField label="Subtitle / Description Copy" htmlFor="b-subtitle">
          <textarea
            id="b-subtitle"
            rows={2}
            placeholder="Crafted with 450+ GSM heavyweight cotton for timeless silhouette and warmth."
            value={form.subtitle}
            onChange={(e) => update("subtitle", e.target.value)}
          />
        </FormField>

        {/* Buttons / CTA */}
        <div className="form-grid">
          <FormField label="Primary CTA Text" htmlFor="b-cta1-text">
            <input
              id="b-cta1-text"
              placeholder="e.g. Shop Collection"
              value={form.primary_cta_text}
              onChange={(e) => update("primary_cta_text", e.target.value)}
            />
          </FormField>

          <FormField
            label="Primary CTA Link"
            htmlFor="b-cta1-link"
            hint="Department the Explore Now button opens"
            error={
              errors.primary_cta_link ||
              (ctaLinkIsUnmapped
                ? `Currently set to "${ctaLinkValue}" — pick a department to change it.`
                : null)
            }
          >
            <select
              id="b-cta1-link"
              value={ctaLinkSelectValue}
              onChange={(e) => update("primary_cta_link", e.target.value)}
            >
              <option value="">— Select department —</option>
              {CTA_DEPARTMENTS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </FormField>
        </div>

        <div className="form-grid">
          <FormField label="Secondary CTA Text (Optional)" htmlFor="b-cta2-text">
            <input
              id="b-cta2-text"
              placeholder="e.g. View Lookbook"
              value={form.secondary_cta_text}
              onChange={(e) => update("secondary_cta_text", e.target.value)}
            />
          </FormField>

          <FormField label="Secondary CTA Link" htmlFor="b-cta2-link">
            <input
              id="b-cta2-link"
              placeholder="e.g. /collection?collection=new-arrivals"
              value={form.secondary_cta_link}
              onChange={(e) => update("secondary_cta_link", e.target.value)}
            />
          </FormField>
        </div>

        <div className="checkbox-row" style={{ marginTop: 6 }}>
          <input
            id="b-active"
            type="checkbox"
            checked={form.is_active}
            onChange={(e) => update("is_active", e.target.checked)}
          />
          <label htmlFor="b-active">
            <strong>Active & Visible on Storefront</strong>
          </label>
        </div>

        <div className="form-actions">
          <button type="button" className="btn btn-secondary" onClick={onClose}>
            Cancel
          </button>
          <button type="submit" className="btn btn-accent" disabled={isSaving || currentIsHeroCapped}>
            {isSaving ? "Saving..." : isEdit ? "Save Changes" : "Create Banner"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
