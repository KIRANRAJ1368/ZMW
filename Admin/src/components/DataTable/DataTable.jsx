import LoadingState from "../LoadingState/LoadingState";
import EmptyState from "../EmptyState/EmptyState";
import "./DataTable.css";

/**
 * columns: [{ key, label, render?(row), width? }]
 * rows: array of data objects
 * rowKey: (row) => string|number
 */
export default function DataTable({
  columns,
  rows,
  rowKey,
  isLoading,
  emptyTitle = "Nothing here yet",
  emptyDescription,
  emptyAction
}) {
  if (isLoading) return <LoadingState />;
  if (!rows || rows.length === 0) {
    return <EmptyState title={emptyTitle} description={emptyDescription} action={emptyAction} />;
  }

  return (
    <div className="data-table-wrap">
      <table className="data-table">
        <thead>
          <tr>
            {columns.map((col) => (
              <th key={col.key} style={col.width ? { width: col.width } : undefined}>
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, idx) => (
            <tr key={rowKey(row)}>
              {columns.map((col) => (
                <td key={col.key}>{col.render ? col.render(row, idx) : row[col.key]}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
