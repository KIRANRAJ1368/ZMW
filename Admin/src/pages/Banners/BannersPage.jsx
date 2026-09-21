import { useEffect, useState, useMemo } from "react";
import { Plus, Edit2, Trash2, Image as ImageIcon, Sparkles, Layout, ExternalLink } from "lucide-react";
import { bannersApi } from "../../services/resources";
import { useToast } from "../../context/ToastContext";
import { useConfirm } from "../../components/ConfirmDialog/ConfirmDialog";
import DataTable from "../../components/DataTable/DataTable";
import StatusBadge from "../../components/StatusBadge/StatusBadge";
import BannerFormModal from "./BannerFormModal";

export default function BannersPage() {
  const [banners, setBanners] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editing, setEditing] = useState(null);
  const [activeTab, setActiveTab] = useState("all"); // 'all' | 'hero' | 'collection'
  const toast = useToast();
  const [confirm, ConfirmModal] = useConfirm();

  async function load() {
    setIsLoading(true);
    try {
      const { data } = await bannersApi.list();
      setBanners(data || []);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function handleDelete(banner) {
    const ok = await confirm({
      title: "Delete Promotional Banner?",
      message: `The banner "${banner.title}" will be permanently removed from storefront carousels.`
    });
    if (!ok) return;
    try {
      await bannersApi.remove(banner.id);
      toast.success("Banner removed successfully");
      load();
    } catch (err) {
      toast.error(err.message);
    }
  }

  const filteredBanners = useMemo(() => {
    if (activeTab === "hero") {
      return banners.filter((b) => b.placement === "hero");
    }
    if (activeTab === "collection") {
      return banners.filter((b) => b.placement !== "hero");
    }
    return banners;
  }, [banners, activeTab]);

  const heroCount = banners.filter((b) => b.placement === "hero").length;
  const collectionCount = banners.filter((b) => b.placement !== "hero").length;

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">
            <span>Hero & Promo Banners</span>
            <span className="pill-badge badge-gold">{banners.length} Banner{banners.length === 1 ? "" : "s"}</span>
          </h1>
          <p className="page-subtitle">
            Configure homepage hero slider carousels and dedicated collection promotional banners.
          </p>
        </div>
        <button type="button" className="btn btn-accent btn-lg" onClick={() => setEditing({})}>
          <Plus size={17} />
          <span>Add New Banner</span>
        </button>
      </div>

      <div className="card">
        {/* Navigation Tabs */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            padding: "16px 22px",
            borderBottom: "1px solid var(--border)",
            background: "var(--surface)",
            borderTopLeftRadius: "inherit",
            borderTopRightRadius: "inherit",
            flexWrap: "wrap"
          }}
        >
          <button
            type="button"
            className={`btn btn-sm ${activeTab === "all" ? "btn-primary" : "btn-secondary"}`}
            onClick={() => setActiveTab("all")}
          >
            All Banners ({banners.length})
          </button>
          <button
            type="button"
            className={`btn btn-sm ${activeTab === "hero" ? "btn-accent" : "btn-secondary"}`}
            onClick={() => setActiveTab("hero")}
          >
            <Sparkles size={14} />
            <span>Hero Slider ({heroCount})</span>
          </button>
          <button
            type="button"
            className={`btn btn-sm ${activeTab === "collection" ? "btn-primary" : "btn-secondary"}`}
            onClick={() => setActiveTab("collection")}
          >
            <Layout size={14} />
            <span>Collection Banners ({collectionCount})</span>
          </button>
        </div>

        <DataTable
          isLoading={isLoading}
          rows={filteredBanners}
          rowKey={(row) => row.id}
          emptyTitle="No banners match this filter"
          emptyDescription="Create high-res hero banners or collection covers to attract customers."
          emptyAction={
            <button type="button" className="btn btn-accent" onClick={() => setEditing({})}>
              <Plus size={16} />
              <span>Create Banner</span>
            </button>
          }
          columns={[
            {
              key: "image_url",
              label: "Banner Preview",
              width: 150,
              render: (row) =>
                row.image_url ? (
                  <div
                    style={{
                      position: "relative",
                      width: 130,
                      height: 54,
                      overflow: "hidden",
                      borderRadius: 6,
                      border: "1px solid var(--border)",
                      background: "var(--surface-alt)"
                    }}
                  >
                    <img
                      src={row.image_url}
                      alt={row.title}
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                        objectPosition: row.image_position || "center center"
                      }}
                      onError={(e) => {
                        e.target.style.display = "none";
                      }}
                    />
                  </div>
                ) : (
                  <div
                    style={{
                      width: 130,
                      height: 54,
                      borderRadius: 6,
                      background: "var(--surface-alt)",
                      border: "1px dashed var(--border)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "var(--text-subtle)"
                    }}
                  >
                    <ImageIcon size={18} />
                  </div>
                )
            },
            {
              key: "title",
              label: "Title & Copy",
              render: (row) => (
                <div style={{ maxWidth: 320 }}>
                  {row.tag && (
                    <div
                      style={{
                        fontSize: 11,
                        fontWeight: 700,
                        color: "var(--primary-text)",
                        letterSpacing: "0.06em",
                        textTransform: "uppercase",
                        marginBottom: 2
                      }}
                    >
                      {row.tag}
                    </div>
                  )}
                  <div className="cell-title">{row.title}</div>
                  {row.subtitle && <div className="cell-muted" style={{ fontSize: 12 }}>{row.subtitle}</div>}
                  {row.badge_promo && (
                    <div style={{ marginTop: 4 }}>
                      <span className="pill-badge badge-gold" style={{ fontSize: 10 }}>
                        {row.badge_promo}
                      </span>
                    </div>
                  )}
                </div>
              )
            },
            {
              key: "placement",
              label: "Target Placement",
              render: (row) =>
                row.placement === "hero" ? (
                  <span className="pill-badge badge-gold">
                    <Sparkles size={11} />
                    <span>Hero Slider</span>
                  </span>
                ) : (
                  <span className="pill-badge badge-dark">
                    <span>{row.placement}</span>
                  </span>
                )
            },
            {
              key: "primary_cta_text",
              label: "Call to Action",
              render: (row) =>
                row.primary_cta_text ? (
                  <div style={{ fontSize: 12 }}>
                    <span style={{ fontWeight: 600, color: "var(--text-main)" }}>{row.primary_cta_text}</span>
                    {row.primary_cta_link && (
                      <div className="cell-muted" style={{ fontSize: 11 }}>
                        <code>{row.primary_cta_link}</code>
                      </div>
                    )}
                  </div>
                ) : (
                  <span className="cell-muted">—</span>
                )
            },
            {
              key: "sort_order",
              label: "Sequence",
              render: (row) => <strong>{row.sort_order}</strong>
            },
            {
              key: "is_active",
              label: "Status",
              render: (row) => <StatusBadge value={row.is_active ? "active" : "inactive"} />
            },
            {
              key: "actions",
              label: "",
              render: (row) => (
                <div className="table-actions">
                  <button
                    type="button"
                    className="btn btn-secondary btn-sm"
                    onClick={() => setEditing(row)}
                    title="Edit banner"
                  >
                    <Edit2 size={13} />
                    <span>Edit</span>
                  </button>
                  <button
                    type="button"
                    className="btn btn-danger btn-sm"
                    onClick={() => handleDelete(row)}
                    title="Delete banner"
                  >
                    <Trash2 size={13} />
                    <span>Delete</span>
                  </button>
                </div>
              )
            }
          ]}
        />
      </div>

      {editing && (
        <BannerFormModal
          banner={editing}
          onClose={() => setEditing(null)}
          onSaved={() => {
            setEditing(null);
            load();
          }}
        />
      )}
      <ConfirmModal />
    </div>
  );
}
