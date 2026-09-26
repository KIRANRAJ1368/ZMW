import LoadingState from "../LoadingState/LoadingState";
import EmptyState from "../EmptyState/EmptyState";
import "./DataTable.css";

/**
 * columns: [{ key, label, render?(row), width?, align? }]
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
            {columns.map((col, idx) => {
              const label = col.label ?? col.header ?? "";
              const key = col.key ?? col.id ?? label ?? idx;
              return (
                <th
                  key={key}
                  style={{
                    ...(col.width ? { width: col.width, minWidth: col.width } : {}),
                    ...(col.align ? { textAlign: col.align } : {})
                  }}
                >
                  {label}
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, idx) => (
            <tr key={rowKey(row)}>
              {columns.map((col, colIdx) => {
                const key = col.key ?? col.id ?? col.label ?? col.header ?? colIdx;
                const cellContent = col.render
                  ? col.render(row, idx)
                  : col.cell
                  ? col.cell(row, idx)
                  : col.key
                  ? row[col.key]
                  : null;

                return (
                  <td
                    key={key}
                    style={{
                      ...(col.width ? { width: col.width, minWidth: col.width } : {}),
                      ...(col.align ? { textAlign: col.align } : {})
                    }}
                  >
                    {cellContent}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
