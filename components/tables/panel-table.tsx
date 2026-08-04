import * as React from "react";
import { cn } from "@/lib/utils";

/**
 * Panel table — the compact summary list used inside dashboard cards.
 *
 * Distinct from `DataTable`: these panels are read-only, have no sorting,
 * selection or pagination, and §8.3 warns against putting important work inside
 * narrow cards. The real work happens on the "View all" page.
 *
 * Like every wide table in this system it has a **designed mobile composition**
 * rather than a horizontal scrollbar (§10.4: "Do not horizontally scroll
 * ordinary student, fee or order lists"; §6: "No unintended horizontal
 * scrolling at 360px"). Below `lg` each row becomes a stacked block with its
 * cells rendered as label/value pairs; at `lg` and above it is a real table
 * with real headers, which §14 requires.
 *
 * Both compositions render server-side and are swapped with CSS, so there is no
 * hydration mismatch.
 */

export type CellAlign = "left" | "right" | "center";

export interface PanelCell {
  /** Column header on desktop, and the inline label on mobile. */
  label: string;
  value: React.ReactNode;
  align?: CellAlign;
  /** Hide this cell on mobile when the row would otherwise get too busy. */
  desktopOnly?: boolean;
}

export interface PanelRow {
  id: string;
  /** Identity line — the thing the row is about. */
  primary: React.ReactNode;
  /** Optional second identity line, e.g. an owner name or a reference number. */
  secondary?: React.ReactNode;
  cells: PanelCell[];
  /** Status badge or similar. Sits in the last column, top-right on mobile. */
  trailing?: React.ReactNode;
}

const alignClass = (a: CellAlign = "left") =>
  a === "right"
    ? "text-right tabular"
    : a === "center"
      ? "text-center"
      : "text-left";

export function PanelTable({
  primaryHeader,
  trailingHeader,
  rows,
  className,
}: {
  primaryHeader: string;
  trailingHeader?: string;
  rows: PanelRow[];
  className?: string;
}) {
  const columns = rows[0]?.cells ?? [];

  return (
    <div className={className}>
      {/* --- Mobile: stacked blocks -------------------------------------- */}
      <ul className="divide-border divide-y lg:hidden">
        {rows.map((row) => (
          <li key={row.id} className="flex items-start gap-3 py-3 first:pt-0">
            <div className="min-w-0 flex-1">
              <p className="text-body text-text truncate font-medium">
                {row.primary}
              </p>
              {row.secondary ? (
                <p className="text-meta text-text-secondary truncate">
                  {row.secondary}
                </p>
              ) : null}

              <dl className="mt-1 flex flex-wrap gap-x-4 gap-y-0.5">
                {row.cells
                  .filter((c) => !c.desktopOnly)
                  .map((cell) => (
                    <div key={cell.label} className="flex items-baseline gap-1">
                      <dt className="text-meta text-text-muted">
                        {cell.label}
                      </dt>
                      <dd
                        className={cn(
                          "text-meta text-text",
                          cell.align === "right" && "tabular",
                        )}
                      >
                        {cell.value}
                      </dd>
                    </div>
                  ))}
              </dl>
            </div>
            {row.trailing ? (
              <div className="shrink-0">{row.trailing}</div>
            ) : null}
          </li>
        ))}
      </ul>

      {/* --- Desktop: real table with real headers ------------------------ */}
      <table className="hidden w-full border-collapse lg:table">
        <thead>
          <tr className="border-border border-b">
            <th
              scope="col"
              className="text-meta text-text-secondary pb-2 text-left font-semibold"
            >
              {primaryHeader}
            </th>
            {columns.map((c) => (
              <th
                key={c.label}
                scope="col"
                className={cn(
                  "text-meta text-text-secondary pb-2 pl-3 font-semibold",
                  alignClass(c.align),
                )}
              >
                {c.label}
              </th>
            ))}
            {trailingHeader ? (
              <th
                scope="col"
                className="text-meta text-text-secondary pb-2 pl-3 text-center font-semibold"
              >
                {trailingHeader}
              </th>
            ) : null}
          </tr>
        </thead>
        <tbody className="divide-border divide-y">
          {rows.map((row) => (
            <tr key={row.id}>
              <th
                scope="row"
                className="min-w-0 py-2.5 pr-3 text-left font-normal"
              >
                <span className="text-body text-text block truncate font-medium">
                  {row.primary}
                </span>
                {row.secondary ? (
                  <span className="text-meta text-text-secondary block truncate">
                    {row.secondary}
                  </span>
                ) : null}
              </th>
              {row.cells.map((cell) => (
                <td
                  key={cell.label}
                  className={cn(
                    "text-body text-text py-2.5 pl-3 whitespace-nowrap",
                    alignClass(cell.align),
                  )}
                >
                  {cell.value}
                </td>
              ))}
              {trailingHeader ? (
                <td className="py-2.5 pl-3 text-center">{row.trailing}</td>
              ) : null}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
