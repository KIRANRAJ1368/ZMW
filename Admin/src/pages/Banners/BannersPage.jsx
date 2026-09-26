import { useEffect, useState, useMemo } from "react";
import { Plus, Edit2, Trash2, Eye, Image as ImageIcon, Sparkles, Layout, ExternalLink } from "lucide-react";
import { bannersApi } from "../../services/resources";
import { useToast } from "../../context/ToastContext";
import { useConfirm } from "../../components/ConfirmDialog/ConfirmDialog";
import DataTable from "../../components/DataTable/DataTable";
import StatusBadge from "../../components/StatusBadge/StatusBadge";
import BannerFormModal from "./BannerFormModal";
import BannerViewModal from "../../components/EntityViewModal/BannerViewModal";
import ImageLightboxModal from "../../components/ImageLightboxModal/ImageLightboxModal";
import { resolveImageUrl } from "../../utils/imageUrl";

export default function BannersPage() {
  const [banners, setBanners] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editing, setEditing] = useState(null);
  const [viewing, setViewing] = useState(null);
  const [lightboxImg, setLightboxImg] = useState(null);
  const [activeTab, setActiveTab] = useState("all"); // 'all' | 'hero' | 'collection'
  const [isCompact, setIsCompact] = useState(true);
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
        {/* Navigation Tabs & View Mode Switch */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 10,
            padding: "14px 20px",
            borderBottom: "1px solid var(--border)",
            background: "var(--surface)",
            borderTopLeftRadius: "inherit",
            borderTopRightRadius: "inherit",
            flexWrap: "wrap"
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
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

          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={() => setIsCompact(!isCompact)}
              title={isCompact ? "Switch to detailed multiline view" : "Switch to compact view"}
              style={{ fontSize: 12, padding: "5px 12px" }}
            >
              <span>{isCompact ? "Compact Mode: ON" : "Detailed Mode"}</span>
            </button>
          </div>
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
              width: "115px",
              align: "center",
              render: (row) =>
                row.image_url ? (
                  <div
                    onClick={(e) => {
                      e.stopPropagation();
                      setLightboxImg(resolveImageUrl(row.image_url));
                    }}
                    role="button"
                    tabIndex={0}
                    title="Click to view full resolution banner"
                    style={{
                      position: "relative",
                      width: 96,
                      height: 42,
                      overflow: "hidden",
                      borderRadius: 6,
                      border: "1px solid var(--border)",
                      background: "var(--surface-alt)",
                      cursor: "pointer"
                    }}
                  >
                    <img
                      src={resolveImageUrl(row.image_url)}
                      alt={row.title}
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                        objectPosition: row.image_position || "85% top"
                      }}
                      onError={(e) => {
                        e.target.style.display = "none";
                      }}
                    />
                  </div>
                ) : (
                  <div
                    style={{
                      width: 96,
                      height: 42,
                      borderRadius: 6,
                      background: "var(--surface-alt)",
                      border: "1px dashed var(--border)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "var(--text-subtle)"
                    }}
                  >
                    <ImageIcon size={16} />
                  </div>
                )
            },
            {
              key: "title",
              label: "Title & Copy",
              width: "280px",
              render: (row) =>
                isCompact ? (
                  <div
                    style={{ maxWidth: 280 }}
                    title={`${row.title}\n${row.subtitle || ""}\n${row.tag || ""}`}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 2 }}>
                      {row.tag && (
                        <span
                          style={{
                            fontSize: 10,
                            fontWeight: 700,
                            color: "#4f46e5",
                            background: "#eef2ff",
                            padding: "1px 6px",
                            borderRadius: 4,
                            textTransform: "uppercase",
                            letterSpacing: "0.04em",
                            whiteSpace: "nowrap"
                          }}
                        >
                          {row.tag}
                        </span>
                      )}
                      {row.badge_promo && (
                        <span
                          style={{
                            fontSize: 10,
                            fontWeight: 600,
                            color: "#059669",
                            background: "#ecfdf5",
                            padding: "1px 6px",
                            borderRadius: 4,
                            whiteSpace: "nowrap"
                          }}
                        >
                          {row.badge_promo}
                        </span>
                      )}
                    </div>
                    <div
                      className="cell-title"
                      style={{
                        fontSize: 13,
                        fontWeight: 600,
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis"
                      }}
                    >
                      {row.title}
                    </div>
                    {row.subtitle && (
                      <div
                        className="cell-muted"
                        style={{
                          fontSize: 11.5,
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          marginTop: 2
                        }}
                      >
                        {row.subtitle}
                      </div>
                    )}
                  </div>
                ) : (
                  <div style={{ maxWidth: 320 }}>
                    {row.tag && (
                      <div
                        style={{
                          fontSize: 11,
                          fontWeight: 700,
                          color: "#4f46e5",
                          letterSpacing: "0.06em",
                          textTransform: "uppercase",
                          marginBottom: 2
                        }}
                      >
                        {row.tag}
                      </div>
                    )}
                    <div className="cell-title">{row.title}</div>
                    {row.subtitle && (
                      <div className="cell-muted" style={{ fontSize: 12 }}>
                        {row.subtitle}
                      </div>
                    )}
                    {row.badge_promo && (
                      <div style={{ marginTop: 4 }}>
                        <span className="pill-badge" style={{ background: "#ecfdf5", color: "#059669", border: "1px solid #a7f3d0", fontSize: 10 }}>
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
              width: "135px",
              align: "center",
              render: (row) =>
                row.placement === "hero" ? (
                  <span
                    className="pill-badge"
                    style={{
                      background: "#eef2ff",
                      color: "#4f46e5",
                      border: "1px solid #c7d2fe",
                      fontSize: 11,
                      whiteSpace: "nowrap"
                    }}
                  >
                    <Sparkles size={11} />
                    <span>Hero Slider</span>
                  </span>
                ) : (
                  <span
                    className="pill-badge"
                    style={{
                      background: "#f1f5f9",
                      color: "#334155",
                      border: "1px solid #cbd5e1",
                      fontSize: 11,
                      whiteSpace: "nowrap"
                    }}
                  >
                    <span>{row.placement}</span>
                  </span>
                )
            },
            {
              key: "primary_cta_text",
              label: "Call to Action",
              width: "145px",
              render: (row) =>
                row.primary_cta_text ? (
                  <div style={{ fontSize: 12 }}>
                    <span style={{ fontWeight: 600, color: "var(--text-main)", whiteSpace: "nowrap" }}>
                      {row.primary_cta_text}
                    </span>
                    {row.primary_cta_link && (
                      <div className="cell-muted" style={{ fontSize: 11, marginTop: 2 }}>
                        <code style={{ fontSize: 10.5, padding: "1px 5px", whiteSpace: "nowrap" }}>
                          {row.primary_cta_link}
                        </code>
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
              width: "80px",
              align: "center",
              render: (row) => <strong style={{ color: "#475569" }}>{row.sort_order}</strong>
            },
            {
              key: "is_active",
              label: "Status",
              width: "100px",
              align: "center",
              render: (row) => <StatusBadge value={row.is_active ? "active" : "inactive"} />
            },
            {
              key: "actions",
              label: "Actions",
              width: "190px",
              align: "right",
              render: (row) => (
                <div className="table-actions">
                  <button
                    type="button"
                    className="btn btn-secondary btn-sm"
                    onClick={() => setViewing(row)}
                    title="View banner details"
                  >
                    <Eye size={13} />
                    <span>View</span>
                  </button>
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
      {viewing && (
        <BannerViewModal
          banner={viewing}
          onEdit={(b) => {
            setViewing(null);
            setEditing(b);
          }}
          onClose={() => setViewing(null)}
        />
      )}
      {lightboxImg && (
        <ImageLightboxModal
          src={lightboxImg}
          alt="Banner Preview"
          onClose={() => setLightboxImg(null)}
        />
      )}
      <ConfirmModal />
    </div>
  );
}
