import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ShoppingBag, Eye, Filter, IndianRupee, Clock, CheckCircle2 } from "lucide-react";
import { ordersApi } from "../../services/resources";
import { useToast } from "../../context/ToastContext";
import DataTable from "../../components/DataTable/DataTable";
import StatusBadge from "../../components/StatusBadge/StatusBadge";
import Pagination from "../../components/Pagination/Pagination";

const STATUSES = ["pending", "confirmed", "packed", "shipped", "delivered", "cancelled", "returned"];

export default function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [meta, setMeta] = useState({ page: 1, totalPages: 1, total: 0 });
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const toast = useToast();

  async function load() {
    setIsLoading(true);
    try {
      const { data, meta } = await ordersApi.list({ status: status || undefined, page, limit: 15 });
      setOrders(data || []);
      setMeta(meta || { page: 1, totalPages: 1, total: 0 });
    } catch (err) {
      toast.error(err.message);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, page]);

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">
            <span>Customer Orders & Fulfillment</span>
            <span className="pill-badge badge-gold">{meta.total} Order{meta.total === 1 ? "" : "s"}</span>
          </h1>
          <p className="page-subtitle">
            Track customer checkouts, dispatch shipments, verify payments, and inspect invoice snapshots.
          </p>
        </div>
      </div>

      <div className="card">
        {/* Filter Toolbar */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 12,
            padding: "16px 22px",
            borderBottom: "1px solid var(--border)",
            flexWrap: "wrap",
            background: "var(--surface)"
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <Filter size={15} style={{ color: "var(--text-muted)" }} />
            <span style={{ fontSize: "13px", fontWeight: 600, color: "var(--text-main)" }}>Filter Status:</span>
            <select
              value={status}
              onChange={(e) => {
                setPage(1);
                setStatus(e.target.value);
              }}
              style={{
                minWidth: 190,
                padding: "8px 12px",
                border: "1.5px solid var(--border)",
                borderRadius: "var(--radius-sm)",
                background: "var(--surface)",
                fontSize: "13px",
                fontWeight: 500
              }}
            >
              <option value="">All Fulfillment Statuses</option>
              {STATUSES.map((s) => (
                <option key={s} value={s}>
                  {s.charAt(0).toUpperCase() + s.slice(1)}
                </option>
              ))}
            </select>
          </div>
          <span className="hint">
            Page {meta.page} of {meta.totalPages || 1}
          </span>
        </div>

        <DataTable
          isLoading={isLoading}
          rows={orders}
          rowKey={(row) => row.id}
          emptyTitle="No orders found"
          emptyDescription="When customers place orders on the ZMW storefront, they will immediately appear here for fulfillment."
          columns={[
            {
              key: "order_number",
              label: "Order Reference",
              render: (row) => (
                <code
                  style={{
                    fontFamily: "monospace",
                    fontSize: 12.5,
                    fontWeight: 700,
                    background: "var(--surface-alt)",
                    padding: "3px 7px",
                    borderRadius: 4,
                    border: "1px solid var(--border)",
                    color: "var(--dark)"
                  }}
                >
                  {row.order_number}
                </code>
              )
            },
            {
              key: "customer_name",
              label: "Customer & Destination",
              render: (row) => (
                <div>
                  <span className="cell-title">{row.customer_name}</span>
                  <div className="cell-muted" style={{ fontSize: 11.5 }}>
                    {row.city ? `${row.city}, ` : ""}{row.state || "India"}
                  </div>
                </div>
              )
            },
            {
              key: "email",
              label: "Customer Contact",
              render: (row) => (
                <div style={{ fontSize: 12.5 }}>
                  <div style={{ color: "var(--text-main)", fontWeight: 500 }}>{row.email}</div>
                  <div className="cell-muted">{row.phone}</div>
                </div>
              )
            },
            {
              key: "payment_method",
              label: "Payment",
              render: (row) => (
                <span className="pill-badge" style={{ background: "var(--surface-alt)", color: "var(--text-main)", border: "1px solid var(--border)" }}>
                  {row.payment_method || "COD"}
                </span>
              )
            },
            {
              key: "total",
              label: "Order Amount",
              render: (row) => (
                <span style={{ fontWeight: 800, color: "var(--text-main)", fontSize: 14.5 }}>
                  ₹{row.total}
                </span>
              )
            },
            {
              key: "status",
              label: "Pipeline Status",
              render: (row) => <StatusBadge value={row.status} />
            },
            {
              key: "created_at",
              label: "Date Placed",
              render: (row) => (
                <span style={{ fontSize: 12.5, color: "var(--text-muted)" }}>
                  {new Date(row.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                </span>
              )
            },
            {
              key: "actions",
              label: "",
              render: (row) => (
                <Link to={`/orders/${row.id}`} className="btn btn-secondary btn-sm" title="View Order Details">
                  <Eye size={13} />
                  <span>Inspect</span>
                </Link>
              )
            }
          ]}
        />

        <Pagination page={meta.page} totalPages={meta.totalPages} total={meta.total} onChange={setPage} />
      </div>
    </div>
  );
}
