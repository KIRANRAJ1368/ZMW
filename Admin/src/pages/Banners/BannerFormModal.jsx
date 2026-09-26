import { useState } from "react";
import { Sparkles } from "lucide-react";
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

export default function BannerFormModal({ banner, onClose, onSaved }) {
  const isEdit = !!banner.id;
  const [form, setForm] = useState({
    placement: banner.placement || "hero",
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
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setErrors({});
    setIsSaving(true);
    try {
      if (isEdit) {
        await bannersApi.update(banner.id, form);
        toast.success("Banner updated successfully");
      } else {
        await bannersApi.create(form);
        toast.success("Banner created successfully");
      }
      onSaved();
    } catch (err) {
      if (err instanceof ApiError && err.details?.length) {
        setErrors(Object.fromEntries(err.details.map((d) => [d.field, d.message])));
      }
      toast.error(err.message);
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <Modal
      title={isEdit ? "Edit Banner" : "Create New Banner"}
      onClose={onClose}
      width={700}
    >
      <form onSubmit={handleSubmit}>
        {/* Placement & Sequence */}
        <div className="form-grid">
          <FormField label="Banner Placement / Target *" htmlFor="b-placement" error={errors.placement}>
            <select
              id="b-placement"
              value={form.placement}
              onChange={(e) => update("placement", e.target.value)}
            >
              {PLACEMENTS.map((p) => (
                <option key={p.value} value={p.value}>
                  {p.label}
                </option>
              ))}
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

          <FormField label="Primary CTA Link" htmlFor="b-cta1-link">
            <input
              id="b-cta1-link"
              placeholder="e.g. /collection?category=mens"
              value={form.primary_cta_link}
              onChange={(e) => update("primary_cta_link", e.target.value)}
            />
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
          <button type="submit" className="btn btn-accent" disabled={isSaving}>
            {isSaving ? "Saving..." : isEdit ? "Save Changes" : "Create Banner"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
