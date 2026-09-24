import { useEffect, useState } from "react";
import { Plus, Edit2, Trash2, Tag, Percent, IndianRupee } from "lucide-react";
import { couponsApi } from "../../services/resources";
import { useToast } from "../../context/ToastContext";
import { useConfirm } from "../../components/ConfirmDialog/ConfirmDialog";
import DataTable from "../../components/DataTable/DataTable";
import StatusBadge from "../../components/StatusBadge/StatusBadge";
import CouponFormModal from "./CouponFormModal";

export default function CouponsPage() {
  const [coupons, setCoupons] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editing, setEditing] = useState(null); // null = closed, {} = new, {...} = edit
  const toast = useToast();
  const [confirm, ConfirmModal] = useConfirm();

  async function load() {
    setIsLoading(true);
    try {
      const res = await couponsApi.list();
      setCoupons(res.data || []);
    } catch (err) {
      toast.error(err.message || "Failed to load coupons");
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleDelete(coupon) {
    const ok = await confirm({
      title: "Delete Coupon?",
      message: `Are you sure you want to delete coupon "${coupon.code}"? Customers will no longer be able to use it.`
    });
    if (!ok) return;
    try {
      await couponsApi.remove(coupon.id);
      toast.success("Coupon code deleted successfully");
      load();
    } catch (err) {
      toast.error(err.message || "Failed to delete coupon");
    }
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">
            <span>Discounts & Coupons</span>
            <span className="pill-badge badge-gold">
              {coupons.length} Code{coupons.length === 1 ? "" : "s"}
            </span>
          </h1>
          <p className="page-subtitle">
            Configure luxury promo vouchers, festive sales discounts, and cart redemption rules.
          </p>
        </div>
        <button type="button" className="btn btn-accent btn-lg" onClick={() => setEditing({})}>
          <Plus size={17} />
          <span>Add Coupon</span>
        </button>
      </div>

      <div className="card">
        <DataTable
          isLoading={isLoading}
          rows={coupons}
          rowKey={(row) => row.id}
          emptyTitle="No discount coupons found"
          emptyDescription="Create your first promotional discount voucher."
          emptyAction={
            <button type="button" className="btn btn-accent" onClick={() => setEditing({})}>
              <Plus size={16} />
              <span>Create Coupon</span>
            </button>
          }
          columns={[
            {
              header: "Coupon Code",
              cell: (row) => (
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <div
                    style={{
                      width: "36px",
                      height: "36px",
                      borderRadius: "6px",
                      background: "rgba(197, 160, 89, 0.12)",
                      color: "#c5a059",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center"
                    }}
                  >
                    <Tag size={18} />
                  </div>
                  <div>
                    <strong style={{ letterSpacing: "0.06em", color: "#111" }}>{row.code}</strong>
                    {row.description && (
                      <div style={{ fontSize: "0.78rem", color: "#666" }}>{row.description}</div>
                    )}
                  </div>
                </div>
              )
            },
            {
              header: "Benefit",
              cell: (row) => (
                <span
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "4px",
                    fontWeight: 600,
                    color: "#111"
                  }}
                >
                  {row.discount_type === "percentage" ? (
                    <>
                      <Percent size={14} color="#c5a059" />
                      {row.discount_value}% OFF
                    </>
                  ) : (
                    <>
                      <IndianRupee size={14} color="#2e7d32" />
                      ₹{Number(row.discount_value).toLocaleString("en-IN")} OFF
                    </>
                  )}
                </span>
              )
            },
            {
              header: "Min Spend",
              cell: (row) =>
                row.min_spend > 0 ? `₹${Number(row.min_spend).toLocaleString("en-IN")}` : "No Min"
            },
            {
              header: "Max Cap",
              cell: (row) =>
                row.max_discount > 0
                  ? `₹${Number(row.max_discount).toLocaleString("en-IN")}`
                  : "Uncapped"
            },
            {
              header: "Usage",
              cell: (row) => (
                <span>
                  {row.used_count || 0} {row.usage_limit ? `/ ${row.usage_limit}` : "times"}
                </span>
              )
            },
            {
              header: "Status",
              cell: (row) => (
                <StatusBadge
                  status={row.is_active ? "active" : "inactive"}
                  label={row.is_active ? "Active" : "Disabled"}
                />
              )
            },
            {
              header: "Actions",
              cell: (row) => (
                <div style={{ display: "flex", gap: "8px" }}>
                  <button
                    type="button"
                    className="btn btn-secondary btn-sm"
                    title="Edit Coupon"
                    onClick={() => setEditing(row)}
                  >
                    <Edit2 size={14} />
                  </button>
                  <button
                    type="button"
                    className="btn btn-secondary btn-sm"
                    title="Delete Coupon"
                    style={{ color: "#DC2626" }}
                    onClick={() => handleDelete(row)}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              )
            }
          ]}
        />
      </div>

      {editing && (
        <CouponFormModal
          coupon={editing}
          onClose={() => setEditing(null)}
          onSaved={load}
        />
      )}

      {ConfirmModal}
    </div>
  );
}
