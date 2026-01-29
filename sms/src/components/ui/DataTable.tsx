"use client";

import type { ReactNode } from "react";
import { useMemo, useState } from "react";

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
  pageSize,
}: {
  columns: Column<T>[];
  rows: T[];
  emptyMessage?: string;
  pageSize?: number;
}) {
  const [page, setPage] = useState(1);

  const total = rows.length;
  const totalPages = pageSize ? Math.max(1, Math.ceil(total / pageSize)) : 1;

  const safePage = Math.min(Math.max(1, page), totalPages);

  const pagedRows = useMemo(() => {
    if (!pageSize) return rows;
    const start = (safePage - 1) * pageSize;
    return rows.slice(start, start + pageSize);
  }, [rows, pageSize, safePage]);

  const showingLabel = useMemo(() => {
    if (!pageSize) return `${total}`;
    if (total === 0) return "0";
    const start = (safePage - 1) * pageSize + 1;
    const end = Math.min(total, safePage * pageSize);
    return `${start}–${end} of ${total}`;
  }, [pageSize, total, safePage]);

  return (
    <div className="space-y-3">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="text-foreground/70">
            <tr className="border-b border-foreground/10">
              {columns.map((c) => (
                <th
                  key={c.key}
                  className={`sticky top-0 z-10 bg-background/95 py-2.5 pr-4 text-xs font-semibold uppercase tracking-wide backdrop-blur ${
                    c.widthClassName || ""
                  }`}
                >
                  {c.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {pagedRows.map((row, idx) => (
              <tr
                key={idx}
                className="border-b border-foreground/10 transition-colors hover:bg-foreground/5"
              >
                {columns.map((c) => (
                  <td
                    key={c.key}
                    className="py-3 pr-4 align-top text-foreground"
                  >
                    {c.cell(row)}
                  </td>
                ))}
              </tr>
            ))}

            {pagedRows.length === 0 ? (
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

      {pageSize ? (
        <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-foreground/60">
          <span>Showing {showingLabel}</span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              className="rounded-md border border-foreground/10 px-2 py-1 text-foreground/80 disabled:opacity-50"
              disabled={safePage <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >
              Prev
            </button>
            <span>
              Page {safePage} / {totalPages}
            </span>
            <button
              type="button"
              className="rounded-md border border-foreground/10 px-2 py-1 text-foreground/80 disabled:opacity-50"
              disabled={safePage >= totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            >
              Next
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
