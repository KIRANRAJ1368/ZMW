import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Users, Eye, Search, ShoppingBag, Mail, Phone, Calendar, IndianRupee } from "lucide-react";
import { customersApi } from "../../services/resources";
import { useToast } from "../../context/ToastContext";
import DataTable from "../../components/DataTable/DataTable";
import Pagination from "../../components/Pagination/Pagination";
import Modal from "../../components/Modal/Modal";
import StatusBadge from "../../components/StatusBadge/StatusBadge";

export default function CustomersPage() {
  const [customers, setCustomers] = useState([]);
  const [meta, setMeta] = useState({ page: 1, totalPages: 1, total: 0 });
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [viewingCustomer, setViewingCustomer] = useState(null);
  const [customerDetail, setCustomerDetail] = useState(null);
  const [loadingDetail, setLoadingDetail] = useState(false);

  const toast = useToast();

  async function loadCustomers() {
    setIsLoading(true);
    try {
      const { data, meta } = await customersApi.list({
        search: search.trim() || undefined,
        page,
        limit: 15
      });
      setCustomers(data || []);
      setMeta(meta || { page: 1, totalPages: 1, total: 0 });
    } catch (err) {
      toast.error(err.message || "Failed to load customers");
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadCustomers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    loadCustomers();
  };

  const handleViewCustomer = async (cust) => {
    setViewingCustomer(cust);
    setLoadingDetail(true);
    try {
      const { data } = await customersApi.getById(cust.id);
      setCustomerDetail(data);
    } catch (err) {
      toast.error(err.message || "Failed to load customer details");
    } finally {
      setLoadingDetail(false);
    }
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">
            <span>Registered Customers</span>
            <span className="pill-badge badge-gold">
              {meta.total} Customer{meta.total === 1 ? "" : "s"}
            </span>
          </h1>
          <p className="page-subtitle">
            Manage your registered customer accounts, view lifetime spend, and track order histories.
          </p>
        </div>
      </div>

      <div className="card">
        {/* Search Toolbar */}
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
          <form onSubmit={handleSearchSubmit} style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ position: "relative", minWidth: 260 }}>
              <Search
                size={15}
                style={{
                  position: "absolute",
                  left: 12,
                  top: "50%",
                  transform: "translateY(-50%)",
                  color: "var(--text-muted)"
                }}
              />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by name, email, mobile..."
                style={{
                  width: "100%",
                  padding: "8px 12px 8px 34px",
                  border: "1.5px solid var(--border)",
                  borderRadius: "var(--radius-sm)",
                  background: "var(--surface)",
                  fontSize: "13px"
                }}
              />
            </div>
            <button type="submit" className="btn btn-secondary btn-sm">
              Search
            </button>
            {search && (
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={() => {
                  setSearch("");
                  setPage(1);
                  setTimeout(loadCustomers, 0);
                }}
              >
                Clear
              </button>
            )}
          </form>
          <span className="hint">
            Page {meta.page} of {meta.totalPages || 1}
          </span>
        </div>

        <DataTable
          isLoading={isLoading}
          rows={customers}
          rowKey={(row) => row.id}
          emptyTitle="No registered customers found"
          emptyDescription="When shoppers sign up on the storefront, their accounts will automatically appear here."
          columns={[
            {
              key: "name",
              label: "Customer",
              render: (row) => (
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: "50%",
                      background: "var(--surface-alt)",
                      border: "1px solid var(--border)",
                      color: "var(--dark)",
                      fontWeight: 700,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 13,
                      flexShrink: 0
                    }}
                  >
                    {row.name ? row.name.charAt(0).toUpperCase() : "C"}
                  </div>
                  <div>
                    <span className="cell-title">{row.name}</span>
                    <div className="cell-muted" style={{ fontSize: 11.5 }}>
                      ID: #{row.id}
                    </div>
                  </div>
                </div>
              )
            },
            {
              key: "contact",
              label: "Contact Details",
              render: (row) => (
                <div style={{ fontSize: 12.5 }}>
                  <div style={{ color: "var(--text-main)", fontWeight: 500 }}>{row.email}</div>
                  <div className="cell-muted">{row.phone || "—"}</div>
                </div>
              )
            },
            {
              key: "order_count",
              label: "Total Orders",
              render: (row) => (
                <span
                  className="pill-badge"
                  style={{
                    background: "var(--surface-alt)",
                    border: "1px solid var(--border)",
                    color: "var(--text-main)"
                  }}
                >
                  {Number(row.order_count || 0)} Order{Number(row.order_count) === 1 ? "" : "s"}
                </span>
              )
            },
            {
              key: "total_spent",
              label: "Total Spend",
              render: (row) => (
                <span style={{ fontWeight: 800, color: "var(--text-main)", fontSize: 14 }}>
                  ₹{Number(row.total_spent || 0).toLocaleString("en-IN")}
                </span>
              )
            },
            {
              key: "created_at",
              label: "Member Since",
              render: (row) => (
                <span style={{ fontSize: 12.5, color: "var(--text-muted)" }}>
                  {new Date(row.created_at).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric"
                  })}
                </span>
              )
            },
            {
              key: "actions",
              label: "Actions",
              width: "120px",
              align: "right",
              render: (row) => (
                <div className="table-actions">
                  <button
                    type="button"
                    className="btn btn-secondary btn-sm"
                    onClick={() => handleViewCustomer(row)}
                    title="View Customer Profile"
                  >
                    <Eye size={13} />
                    <span>View</span>
                  </button>
                </div>
              )
            }
          ]}
        />

        <Pagination page={meta.page} totalPages={meta.totalPages} total={meta.total} onChange={setPage} />
      </div>

      {/* Customer Detail Modal */}
      {viewingCustomer && (
        <Modal
          title={`Customer Profile: ${viewingCustomer.name}`}
          width={700}
          onClose={() => {
            setViewingCustomer(null);
            setCustomerDetail(null);
          }}
        >
          {loadingDetail ? (
            <div style={{ padding: "40px 0", textAlign: "center", color: "var(--text-muted)" }}>
              Loading customer account details...
            </div>
          ) : (
            <div>
              {/* Profile Card Header */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
                  gap: 14,
                  marginBottom: 20
                }}
              >
                <div
                  style={{
                    background: "var(--surface-alt)",
                    padding: "14px 16px",
                    borderRadius: "var(--radius-sm)",
                    border: "1px solid var(--border)"
                  }}
                >
                  <span style={{ fontSize: 11, color: "var(--text-muted)", textTransform: "uppercase", fontWeight: 700 }}>
                    Email
                  </span>
                  <div style={{ fontSize: 13.5, fontWeight: 600, color: "var(--text-main)", marginTop: 4 }}>
                    {customerDetail?.email || viewingCustomer.email}
                  </div>
                </div>

                <div
                  style={{
                    background: "var(--surface-alt)",
                    padding: "14px 16px",
                    borderRadius: "var(--radius-sm)",
                    border: "1px solid var(--border)"
                  }}
                >
                  <span style={{ fontSize: 11, color: "var(--text-muted)", textTransform: "uppercase", fontWeight: 700 }}>
                    Mobile Number
                  </span>
                  <div style={{ fontSize: 13.5, fontWeight: 600, color: "var(--text-main)", marginTop: 4 }}>
                    {customerDetail?.phone || viewingCustomer.phone || "—"}
                  </div>
                </div>

                <div
                  style={{
                    background: "var(--surface-alt)",
                    padding: "14px 16px",
                    borderRadius: "var(--radius-sm)",
                    border: "1px solid var(--border)"
                  }}
                >
                  <span style={{ fontSize: 11, color: "var(--text-muted)", textTransform: "uppercase", fontWeight: 700 }}>
                    Lifetime Spend
                  </span>
                  <div style={{ fontSize: 14.5, fontWeight: 800, color: "var(--text-main)", marginTop: 4 }}>
                    ₹{Number(customerDetail?.total_spent || viewingCustomer.total_spent || 0).toLocaleString("en-IN")}
                  </div>
                </div>
              </div>

              {/* Order History */}
              <h4 style={{ fontSize: 14, fontWeight: 700, marginBottom: 10, color: "var(--text-main)" }}>
                Order History ({customerDetail?.orders?.length || 0})
              </h4>

              {customerDetail?.orders?.length === 0 ? (
                <p style={{ color: "var(--text-muted)", fontSize: 13 }}>No orders placed yet by this customer.</p>
              ) : (
                <div style={{ maxHeight: 280, overflowY: "auto", border: "1px solid var(--border)", borderRadius: "var(--radius-sm)" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                    <thead>
                      <tr style={{ background: "var(--surface-alt)", borderBottom: "1px solid var(--border)", textAlign: "left" }}>
                        <th style={{ padding: "8px 12px" }}>Order Ref</th>
                        <th style={{ padding: "8px 12px" }}>Date</th>
                        <th style={{ padding: "8px 12px" }}>Status</th>
                        <th style={{ padding: "8px 12px" }}>Total</th>
                        <th style={{ padding: "8px 12px", textAlign: "right" }}>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(customerDetail?.orders || []).map((o) => (
                        <tr key={o.id} style={{ borderBottom: "1px solid var(--border)" }}>
                          <td style={{ padding: "10px 12px" }}>
                            <code style={{ fontWeight: 700 }}>{o.order_number}</code>
                          </td>
                          <td style={{ padding: "10px 12px", color: "var(--text-muted)" }}>
                            {new Date(o.created_at).toLocaleDateString("en-IN")}
                          </td>
                          <td style={{ padding: "10px 12px" }}>
                            <StatusBadge value={o.status} />
                          </td>
                          <td style={{ padding: "10px 12px", fontWeight: 700 }}>₹{o.total}</td>
                          <td style={{ padding: "10px 12px", textAlign: "right" }}>
                            <Link to={`/orders/${o.id}`} className="btn btn-secondary btn-sm" style={{ padding: "4px 8px" }}>
                              View Order
                            </Link>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </Modal>
      )}
    </div>
  );
}
