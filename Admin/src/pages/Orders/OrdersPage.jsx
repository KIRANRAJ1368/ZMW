import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ShoppingBag, Eye, Filter, IndianRupee, Clock, CheckCircle2, UserCheck, UserX } from "lucide-react";
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
  const [customerType, setCustomerType] = useState(""); // "" | "registered" | "guest"
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const toast = useToast();

  async function load() {
    setIsLoading(true);
    try {
      const isGuestParam =
        customerType === "guest" ? true : customerType === "registered" ? false : undefined;

      const { data, meta } = await ordersApi.list({
        status: status || undefined,
        is_guest: isGuestParam,
        page,
        limit: 15
      });
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
  }, [status, customerType, page]);

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
          <div style={{ display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <Filter size={15} style={{ color: "var(--text-muted)" }} />
              <span style={{ fontSize: "13px", fontWeight: 600, color: "var(--text-main)" }}>Status:</span>
              <select
                value={status}
                onChange={(e) => {
                  setPage(1);
                  setStatus(e.target.value);
                }}
                style={{
                  minWidth: 170,
                  padding: "7px 10px",
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

            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ fontSize: "13px", fontWeight: 600, color: "var(--text-main)" }}>Checkout Type:</span>
              <select
                value={customerType}
                onChange={(e) => {
                  setPage(1);
                  setCustomerType(e.target.value);
                }}
                style={{
                  minWidth: 170,
                  padding: "7px 10px",
                  border: "1.5px solid var(--border)",
                  borderRadius: "var(--radius-sm)",
                  background: "var(--surface)",
                  fontSize: "13px",
                  fontWeight: 500
                }}
              >
                <option value="">All Orders</option>
                <option value="registered">Registered Customers Only</option>
                <option value="guest">Guest Checkouts Only</option>
              </select>
            </div>
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
              width: "165px",
              render: (row) => (
                <code
                  style={{
                    fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
                    fontSize: 11.5,
                    fontWeight: 700,
                    background: "#f8fafc",
                    padding: "3px 8px",
                    borderRadius: 6,
                    border: "1px solid #e2e8f0",
                    color: "#0f172a",
                    whiteSpace: "nowrap",
                    display: "inline-block"
                  }}
                >
                  {row.order_number}
                </code>
              )
            },
            {
              key: "customer_name",
              label: "Customer & Destination",
              width: "165px",
              render: (row) => (
                <div>
                  <div className="cell-title" style={{ fontSize: 13, fontWeight: 600 }}>{row.customer_name}</div>
                  <div className="cell-muted" style={{ fontSize: 11.5, marginTop: 2, whiteSpace: "nowrap" }}>
                    {row.city ? `${row.city}, ` : ""}{row.state || "India"}
                  </div>
                </div>
              )
            },
            {
              key: "customer_type",
              label: "Account Type",
              width: "135px",
              align: "center",
              render: (row) =>
                row.is_guest ? (
                  <span
                    className="pill-badge"
                    style={{
                      background: "#f1f5f9",
                      color: "#475569",
                      border: "1px solid #cbd5e1",
                      fontSize: 11,
                      whiteSpace: "nowrap"
                    }}
                  >
                    Guest Checkout
                  </span>
                ) : (
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
                    Registered Client
                  </span>
                )
            },
            {
              key: "email",
              label: "Customer Contact",
              width: "195px",
              render: (row) => (
                <div style={{ maxWidth: 190 }}>
                  <div
                    style={{
                      color: "var(--text-main)",
                      fontWeight: 500,
                      fontSize: 12,
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap"
                    }}
                    title={row.email}
                  >
                    {row.email}
                  </div>
                  <div className="cell-muted" style={{ fontSize: 11.5, marginTop: 1, whiteSpace: "nowrap" }}>
                    {row.phone || "—"}
                  </div>
                </div>
              )
            },
            {
              key: "payment_method",
              label: "Payment",
              width: "85px",
              align: "center",
              render: (row) => (
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
                  {row.payment_method || "COD"}
                </span>
              )
            },
            {
              key: "total",
              label: "Order Amount",
              width: "115px",
              align: "right",
              render: (row) => (
                <span style={{ fontWeight: 800, color: "var(--text-main)", fontSize: 14, whiteSpace: "nowrap" }}>
                  ₹{Number(row.total).toFixed(2)}
                </span>
              )
            },
            {
              key: "status",
              label: "Pipeline Status",
              width: "135px",
              align: "center",
              render: (row) => <StatusBadge value={row.status} />
            },
            {
              key: "created_at",
              label: "Date Placed",
              width: "115px",
              align: "center",
              render: (row) => (
                <span style={{ fontSize: 12, color: "var(--text-muted)", whiteSpace: "nowrap" }}>
                  {new Date(row.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                </span>
              )
            },
            {
              key: "actions",
              label: "Actions",
              width: "90px",
              align: "right",
              render: (row) => (
                <div className="table-actions">
                  <Link
                    to={`/orders/${row.id}`}
                    className="btn btn-secondary btn-sm"
                    title="View Order Details"
                  >
                    <Eye size={13} />
                    <span>View</span>
                  </Link>
                </div>
              )
            }
          ]}
        />

        <Pagination page={meta.page} totalPages={meta.totalPages} total={meta.total} onChange={setPage} />
      </div>
    </div>
  );
}
