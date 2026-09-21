import { useEffect, useState } from "react";
import { SlidersHorizontal, Check, Save, Eye, EyeOff, Sparkles } from "lucide-react";
import { homepageApi } from "../../services/resources";
import { useToast } from "../../context/ToastContext";
import LoadingState from "../../components/LoadingState/LoadingState";
import "./HomepageSectionsPage.css";

export default function HomepageSectionsPage() {
  const [sections, setSections] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [savingKey, setSavingKey] = useState(null);
  const toast = useToast();

  async function load() {
    setIsLoading(true);
    try {
      const { data } = await homepageApi.sections();
      setSections(data || []);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function saveSection(section, changes) {
    setSavingKey(section.section_key);
    try {
      const { data } = await homepageApi.updateSection(section.section_key, changes);
      setSections((prev) => prev.map((s) => (s.section_key === section.section_key ? data : s)));
      toast.success(`Section "${section.section_key}" updated successfully`);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSavingKey(null);
    }
  }

  if (isLoading) return <LoadingState label="Loading homepage section controls..." />;

  const sortedSections = sections.slice().sort((a, b) => a.sort_order - b.sort_order);

  return (
    <div className="homepage-sections-page">
      <div className="page-header">
        <div>
          <h1 className="page-title">
            <span>Storefront Homepage Sections</span>
            <span className="pill-badge badge-gold">{sortedSections.length} Sections</span>
          </h1>
          <p className="page-subtitle">
            Configure section sequence, headlines, and toggle visibility across the ZMW storefront homepage.
          </p>
        </div>
      </div>

      <div className="section-list-container">
        {sortedSections.map((section) => (
          <SectionRow
            key={section.section_key}
            section={section}
            isSaving={savingKey === section.section_key}
            onSave={(changes) => saveSection(section, changes)}
          />
        ))}
      </div>
    </div>
  );
}

function SectionRow({ section, isSaving, onSave }) {
  const [title, setTitle] = useState(section.title || "");
  const [subtitle, setSubtitle] = useState(section.subtitle || "");
  const [sortOrder, setSortOrder] = useState(section.sort_order);

  useEffect(() => {
    setTitle(section.title || "");
    setSubtitle(section.subtitle || "");
    setSortOrder(section.sort_order);
  }, [section]);

  const isDirty =
    title !== (section.title || "") ||
    subtitle !== (section.subtitle || "") ||
    sortOrder !== section.sort_order;

  return (
    <div className={`section-row-card card ${section.is_active ? "is-active" : "is-inactive"}`}>
      {/* Switch & Status */}
      <div className="section-toggle-col">
        <label className="toggle-switch" title={section.is_active ? "Visible on homepage" : "Hidden from homepage"}>
          <input
            type="checkbox"
            checked={section.is_active}
            onChange={(e) => onSave({ is_active: e.target.checked })}
          />
          <span />
        </label>
        <span className={`section-status-tag ${section.is_active ? "tag-live" : "tag-off"}`}>
          {section.is_active ? "LIVE" : "OFF"}
        </span>
      </div>

      {/* Main Fields */}
      <div className="section-inputs-col">
        <div className="section-badge-line">
          <span className="section-key-chip">{section.section_key}</span>
          <span className="section-sub-label">Homepage Layout Block</span>
        </div>

        <div className="section-fields-grid">
          <div className="field" style={{ marginBottom: 0 }}>
            <label>Heading Title</label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Featured Drops (uses default if blank)"
            />
          </div>
          <div className="field" style={{ marginBottom: 0 }}>
            <label>Subheading / Tagline</label>
            <input
              value={subtitle}
              onChange={(e) => setSubtitle(e.target.value)}
              placeholder="e.g. Crafted for modern luxury aesthetics"
            />
          </div>
        </div>
      </div>

      {/* Order & Action */}
      <div className="section-order-col">
        <label>Order</label>
        <input
          type="number"
          value={sortOrder}
          onChange={(e) => setSortOrder(Number(e.target.value))}
          className="order-number-input"
        />
      </div>

      <div className="section-action-col">
        <button
          type="button"
          className={`btn btn-sm ${isDirty ? "btn-accent" : "btn-secondary"}`}
          disabled={!isDirty || isSaving}
          onClick={() => onSave({ title, subtitle, sort_order: sortOrder })}
        >
          {isSaving ? (
            <span>Saving...</span>
          ) : isDirty ? (
            <>
              <Save size={14} />
              <span>Save</span>
            </>
          ) : (
            <>
              <Check size={14} style={{ color: "var(--success)" }} />
              <span>Saved</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
