import type { ReactNode } from "react";

export type Column<T> = {
  key: string;
  header: string;
  widthClassName?: string;
  cell: (row: T) => ReactNode;
};

export function DataTable<T>({
  columns,
  rows,
  emptyMessage = "No records found.",
}: {
  columns: Column<T>[];
  rows: T[];
  emptyMessage?: string;
}) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-sm">
        <thead className="text-foreground/70">
          <tr className="border-b border-foreground/10">
            {columns.map((c) => (
              <th key={c.key} className={`py-2 pr-4 ${c.widthClassName || ""}`}>
                {c.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, idx) => (
            <tr key={idx} className="border-b border-foreground/10">
              {columns.map((c) => (
                <td key={c.key} className="py-2 pr-4 text-foreground">
                  {c.cell(row)}
                </td>
              ))}
            </tr>
          ))}

          {rows.length === 0 ? (
            <tr>
              <td
                className="py-6 text-sm text-foreground/60"
                colSpan={columns.length}
              >
                {emptyMessage}
              </td>
            </tr>
          ) : null}
        </tbody>
      </table>
    </div>
  );
}
