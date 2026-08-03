"use client";

import * as React from "react";
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
  type ColumnDef,
  type RowData,
  type RowSelectionState,
} from "@tanstack/react-table";
import { ArrowUpDown, ChevronDown, ChevronUp } from "lucide-react";
import { cn } from "@/lib/utils";
import { TableSkeleton } from "@/components/states";

/**
 * Desktop data table — style guide §10.4 and PRD §8.3.
 *
 * Header 44px with subtle fill and 13px semibold text; body rows minimum 48px,
 * 56px when secondary information is present; sticky header on long pages.
 * Text left, numbers right, short status centred.
 *
 * Sorting, filtering and pagination are **server-side** (PRD §8.3). This
 * component is presentational: it renders the current page and reports sort
 * intent upward. It never receives an unbounded dataset (PRD §13.1).
 */

export type SortDirection = "asc" | "desc";
export interface SortState {
  columnId: string;
  direction: SortDirection;
}

/** Per-column alignment; drives both header and cell alignment. */
export type ColumnAlign = "left" | "right" | "center";

export interface DataTableColumnMeta {
  align?: ColumnAlign;
  /** Column is sortable server-side; renders the sort control in the header. */
  sortable?: boolean;
  /** Accessible header text when the visible header is an icon or empty. */
  srHeader?: string;
}

declare module "@tanstack/react-table" {
  /* Module augmentation: the generic parameters must match TanStack's own
     declaration exactly, so they are unused here by design. */
  // eslint-disable-next-line @typescript-eslint/no-empty-object-type
  interface ColumnMeta<
    TData extends RowData,
    TValue,
  > extends DataTableColumnMeta {}
}

const alignClass: Record<ColumnAlign, string> = {
  left: "text-left",
  right: "text-right",
  center: "text-center",
};

export interface DataTableProps<T> {
  data: T[];
  columns: ColumnDef<T, unknown>[];
  /** Stable row id — required for selection to survive pagination. */
  getRowId: (row: T) => string;
  loading?: boolean;
  /** Rendered in place of the table body when `data` is empty and not loading. */
  empty?: React.ReactNode;
  sort?: SortState;
  onSortChange?: (sort: SortState) => void;
  /** Enables the selection column. Omit for read-only tables. */
  selection?: {
    value: RowSelectionState;
    onChange: (value: RowSelectionState) => void;
    /** Rendered in the selection bar; scope and count are supplied for you. */
    actions?: React.ReactNode;
  };
  /** Denser rows when there is no secondary line (§10.4: 48px vs 56px). */
  density?: "compact" | "comfortable";
  caption: string;
  className?: string;
}

export function DataTable<T>({
  data,
  columns,
  getRowId,
  loading = false,
  empty,
  sort,
  onSortChange,
  selection,
  density = "compact",
  caption,
  className,
}: DataTableProps<T>) {
  const table = useReactTable({
    data,
    columns,
    getRowId,
    getCoreRowModel: getCoreRowModel(),
    manualSorting: true,
    manualFiltering: true,
    manualPagination: true,
    enableRowSelection: Boolean(selection),
    state: { rowSelection: selection?.value ?? {} },
    onRowSelectionChange: (updater) => {
      if (!selection) return;
      const next =
        typeof updater === "function" ? updater(selection.value) : updater;
      selection.onChange(next);
    },
  });

  const selectedCount = Object.values(selection?.value ?? {}).filter(
    Boolean,
  ).length;

  const rowHeight = density === "comfortable" ? "h-14" : "h-12";

  return (
    <div
      className={cn(
        "border-border bg-surface overflow-hidden rounded-[var(--radius-card)] border",
        className,
      )}
    >
      {/* Selection bar — §8.3 of the PRD: "Selection must show action scope and
          count." Only rendered when something is selected. */}
      {selection && selectedCount > 0 ? (
        <div
          className="border-border flex flex-wrap items-center justify-between gap-3 border-b bg-blue-100 px-4 py-2.5"
          role="status"
        >
          <p className="text-label text-navy-900 font-semibold">
            {selectedCount} {selectedCount === 1 ? "row" : "rows"} selected on
            this page
          </p>
          <div className="flex items-center gap-2">{selection.actions}</div>
        </div>
      ) : null}

      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <caption className="sr-only">{caption}</caption>

          <thead className="bg-surface-subtle sticky top-0 z-10">
            {table.getHeaderGroups().map((group) => (
              <tr key={group.id} className="h-11">
                {selection ? (
                  <th scope="col" className="w-12 px-4">
                    <span className="sr-only">Select</span>
                    <input
                      type="checkbox"
                      className="size-4 accent-[var(--color-navy-900)]"
                      aria-label="Select all rows on this page"
                      checked={table.getIsAllRowsSelected()}
                      ref={(el) => {
                        if (el)
                          el.indeterminate = table.getIsSomeRowsSelected();
                      }}
                      onChange={table.getToggleAllRowsSelectedHandler()}
                    />
                  </th>
                ) : null}

                {group.headers.map((header) => {
                  const meta = header.column.columnDef.meta;
                  const align = meta?.align ?? "left";
                  const sortable = meta?.sortable && onSortChange;
                  const active = sort?.columnId === header.column.id;

                  const label = flexRender(
                    header.column.columnDef.header,
                    header.getContext(),
                  );

                  return (
                    <th
                      key={header.id}
                      scope="col"
                      aria-sort={
                        active
                          ? sort.direction === "asc"
                            ? "ascending"
                            : "descending"
                          : sortable
                            ? "none"
                            : undefined
                      }
                      className={cn(
                        "text-meta text-text-secondary px-4 font-semibold",
                        alignClass[align],
                      )}
                    >
                      {sortable ? (
                        <button
                          type="button"
                          onClick={() =>
                            onSortChange({
                              columnId: header.column.id,
                              direction:
                                active && sort.direction === "asc"
                                  ? "desc"
                                  : "asc",
                            })
                          }
                          className={cn(
                            "hover:text-text inline-flex items-center gap-1.5 rounded-[var(--radius-chip)] py-2",
                            align === "right" && "flex-row-reverse",
                          )}
                        >
                          {label}
                          {active ? (
                            sort.direction === "asc" ? (
                              <ChevronUp
                                className="size-3.5"
                                aria-hidden="true"
                              />
                            ) : (
                              <ChevronDown
                                className="size-3.5"
                                aria-hidden="true"
                              />
                            )
                          ) : (
                            <ArrowUpDown
                              className="size-3.5 opacity-50"
                              aria-hidden="true"
                            />
                          )}
                        </button>
                      ) : (
                        label
                      )}
                    </th>
                  );
                })}
              </tr>
            ))}
          </thead>

          <tbody className="divide-border divide-y">
            {loading ? (
              <tr>
                <td colSpan={columns.length + (selection ? 1 : 0)}>
                  <TableSkeleton />
                </td>
              </tr>
            ) : data.length === 0 ? (
              <tr>
                <td colSpan={columns.length + (selection ? 1 : 0)}>{empty}</td>
              </tr>
            ) : (
              table.getRowModel().rows.map((row) => (
                <tr
                  key={row.id}
                  data-state={row.getIsSelected() ? "selected" : undefined}
                  className={cn(
                    rowHeight,
                    "hover:bg-surface-subtle transition-colors",
                    "data-[state=selected]:bg-blue-100",
                  )}
                >
                  {selection ? (
                    <td className="px-4">
                      <input
                        type="checkbox"
                        className="size-4 accent-[var(--color-navy-900)]"
                        aria-label="Select row"
                        checked={row.getIsSelected()}
                        onChange={row.getToggleSelectedHandler()}
                      />
                    </td>
                  ) : null}
                  {row.getVisibleCells().map((cell) => {
                    const align = cell.column.columnDef.meta?.align ?? "left";
                    return (
                      <td
                        key={cell.id}
                        className={cn(
                          "text-body text-text px-4",
                          alignClass[align],
                          align === "right" && "tabular",
                        )}
                      >
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext(),
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
