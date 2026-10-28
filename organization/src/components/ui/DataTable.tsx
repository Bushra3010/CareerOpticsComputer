import { createContext, useContext, useState } from "react";
import { matchesSearch } from "@/lib/search";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Search, MoreHorizontal, ChevronLeft, ChevronRight, Filter, X, Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import * as Router from "react-router-dom";
import { usePermissionsOrNull } from "@/contexts/PermissionsContext";
import { labelAllowed } from "@/lib/permissions";

export interface Column<T> {
  key: keyof T | string;
  header: string;
  cell?: (item: T) => React.ReactNode;
  sortable?: boolean;
  className?: string;
}

/**
 * One named filter over the rows.
 *
 * The table has always had a filter, but only one, and it picked the column
 * itself -- "status" if there was one, otherwise the first sortable column.
 * A register that needs to be narrowed by state *and* district *and* status
 * could not say so, so pages that needed more than one either went without or
 * grew their own bar. Passing `filters` replaces the guess; passing nothing
 * keeps the old behaviour, so no existing table changes.
 */
export interface TableFilter<T> {
  /** Shown above the choices, and in the count on the Filters button. */
  label: string;
  /** Distinct values are read off this field unless `value` says otherwise. */
  key: keyof T | string;
  /** For a field that is not a plain string, or that needs relabelling. */
  value?: (item: T) => string;
  /** Fixes the choices instead of reading whatever the rows happen to hold. */
  options?: string[];
}

interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  /** Named filters, in the order they should appear. */
  filters?: TableFilter<T>[];
  searchable?: boolean;
  searchPlaceholder?: string;
  selectable?: boolean;
  /** Notified whenever the checkbox selection changes, for bulk-action toolbars. */
  onSelectionChange?: (ids: (string | number)[]) => void;
  actions?: (item: T) => { label: string; onClick: () => void; destructive?: boolean }[];
  emptyMessage?: string;
  pageSize?: number;
}

type LocationValue = { location?: { pathname?: string } } | null;
const NoLocation = createContext<LocationValue>(null);
/** The router's location context, read without useLocation() so a table
 *  rendered outside a router (or under a stubbed router) still works. */
const LocationContext: React.Context<LocationValue> = (() => {
  try {
    return ((Router as Record<string, unknown>).UNSAFE_LocationContext as React.Context<LocationValue>) || NoLocation;
  } catch {
    return NoLocation;
  }
})();

/** The page's path, or "" when the table is rendered outside a router. */
function useCurrentPath() {
  return useContext(LocationContext)?.location?.pathname ?? "";
}

export function DataTable<T extends { id: string | number }>({
  data,
  columns,
  filters,
  searchable = true,
  searchPlaceholder = "Search...",
  selectable = false,
  onSelectionChange,
  actions,
  emptyMessage = "No data available",
  pageSize = 10,
}: DataTableProps<T>) {
  // Row actions the signed-in role may not perform on this page (Access
  // Control) are left out of the menu rather than refused after a click.
  const permissions = usePermissionsOrNull();
  const path = useCurrentPath();
  const rowActions = actions
    ? (item: T) => actions(item).filter((action) => labelAllowed(permissions, path, action.label))
    : undefined;
  const [search, setSearch] = useState("");
  const [selectedIds, setSelectedIds] = useState<(string | number)[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [showFilters, setShowFilters] = useState(false);
  const [quickFilter, setQuickFilter] = useState("");
  /** Chosen value per named filter, keyed by its label. */
  const [picked, setPicked] = useState<Record<string, string>>({});

  const readFilter = (filter: TableFilter<T>, item: T) =>
    filter.value
      ? filter.value(item)
      : String((item as Record<string, unknown>)[String(filter.key)] ?? "");

  const named = filters ?? [];
  const usingNamed = named.length > 0;
  // The old single filter stays exactly as it was for every table that has not
  // been given `filters`, so adding this prop changed no existing page.
  const filterColumn = usingNamed
    ? undefined
    : columns.find((column) => String(column.key).toLowerCase() === "status") || columns.find((column) => column.sortable);
  const filterOptions = filterColumn ? Array.from(new Set(data.map(item => String((item as Record<string, unknown>)[String(filterColumn.key)] ?? "")).filter(Boolean))).slice(0, 8) : [];

  /**
   * Filters narrow in order: District lists only the districts of the chosen
   * State, Block only the blocks of the chosen District. Fixed options are
   * offered whole, since they do not come from the rows.
   */
  const choicesFor = (filter: TableFilter<T>, picks: Record<string, string> = picked) => {
    if (filter.options) return filter.options;
    const before = named.slice(0, named.indexOf(filter));
    const rows = data.filter((item) =>
      before.every((f) => !picks[f.label] || readFilter(f, item) === picks[f.label]),
    );
    return Array.from(new Set(rows.map((item) => readFilter(filter, item)).filter(Boolean))).sort();
  };

  /** Choosing the chosen value again clears it, as the old chips did. */
  const pick = (filter: TableFilter<T>, choice: string) => {
    setPicked((current) => {
      const next = { ...current, [filter.label]: current[filter.label] === choice ? "" : choice };
      // A district from another state no longer fits once the state changes.
      for (const later of named.slice(named.indexOf(filter) + 1)) {
        if (next[later.label] && !choicesFor(later, next).includes(next[later.label])) {
          next[later.label] = "";
        }
      }
      return next;
    });
    setCurrentPage(1);
  };

  const activeCount = usingNamed
    ? Object.values(picked).filter(Boolean).length
    : quickFilter
      ? 1
      : 0;

  const clearFilters = () => {
    setPicked({});
    setQuickFilter("");
    setCurrentPage(1);
  };

  const filteredData = data.filter(
    (item) =>
      (!quickFilter ||
        String((item as Record<string, unknown>)[String(filterColumn?.key)] ?? "") === quickFilter) &&
      // Every chosen filter has to hold, not just the last one touched.
      named.every((filter) => !picked[filter.label] || readFilter(filter, item) === picked[filter.label]) &&
      // Every word of the search, across the row's own values: "abhishek gupta"
      // and "gupta 0012" both find a row whatever the spacing of the name.
      matchesSearch(
        Object.values(item)
          .filter((value) => value === null || typeof value !== "object")
          .join(" "),
        search,
      )
  );

  const sortedData = sortKey
    ? [...filteredData].sort((a, b) => {
        const aValue = (a as Record<string, unknown>)[sortKey];
        const bValue = (b as Record<string, unknown>)[sortKey];
        if (sortDirection === "asc") {
          return String(aValue).localeCompare(String(bValue));
        }
        return String(bValue).localeCompare(String(aValue));
      })
    : filteredData;

  const totalPages = Math.ceil(sortedData.length / pageSize);
  const paginatedData = sortedData.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const allSelected = paginatedData.every((item) => selectedIds.includes(item.id));

  const handleSort = (key: string) => {
    if (sortKey === key) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortKey(key);
      setSortDirection("asc");
    }
  };

  const applySelection = (ids: (string | number)[]) => {
    setSelectedIds(ids);
    onSelectionChange?.(ids);
  };

  const toggleSelectAll = () => {
    applySelection(
      allSelected
        ? selectedIds.filter((id) => !paginatedData.some((item) => item.id === id))
        : [...selectedIds, ...paginatedData.map((item) => item.id)]
    );
  };

  const toggleSelect = (id: string | number) => {
    applySelection(
      selectedIds.includes(id)
        ? selectedIds.filter((selectedId) => selectedId !== id)
        : [...selectedIds, id]
    );
  };

  return (
    <div className="space-y-4">
      {searchable && (
        <div className="flex items-center gap-2 sm:gap-4">
          <div className="relative min-w-0 flex-1 sm:max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder={searchPlaceholder}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button variant={showFilters || activeCount ? "secondary" : "outline"} size="sm" className="shrink-0 gap-2" onClick={() => setShowFilters(value => !value)}>
            <Filter className="h-4 w-4" />
            Filters {activeCount > 0 && `· ${activeCount}`}
          </Button>
        </div>
      )}

      {showFilters && usingNamed && (
        <div className="grid grid-cols-2 items-end gap-3 rounded-[18px] bg-card p-3 shadow-card animate-slide-up sm:grid-cols-3 lg:grid-cols-5">
          {named.map((filter) => (
            <div key={filter.label} className="min-w-0">
              <p className="mb-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                {filter.label}
              </p>
              <FilterSelect
                label={filter.label}
                value={picked[filter.label] ?? ""}
                choices={choicesFor(filter)}
                onPick={(choice) => pick(filter, choice)}
              />
            </div>
          ))}
          {activeCount > 0 && (
            <Button variant="ghost" size="sm" className="justify-self-start" onClick={clearFilters}>
              <X className="h-3.5 w-3.5" />
              Clear
            </Button>
          )}
        </div>
      )}

      {showFilters && filterColumn && filterOptions.length > 0 && (
        <div className="flex flex-wrap items-center gap-2 rounded-[18px] bg-card p-3 shadow-card animate-slide-up">
          <span className="mr-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">{filterColumn.header}</span>
          {filterOptions.map(option => <Button key={option} variant={quickFilter === option ? "default" : "outline"} size="sm" onClick={() => { setQuickFilter(current => current === option ? "" : option); setCurrentPage(1); }}>{option}</Button>)}
          {quickFilter && <Button variant="ghost" size="sm" onClick={() => setQuickFilter("")}><X className="h-3.5 w-3.5"/>Clear</Button>}
        </div>
      )}

      <div className="space-y-2 md:hidden">
        {paginatedData.length === 0 ? <div className="rounded-[18px] bg-card p-10 text-center text-sm text-muted-foreground shadow-card">{emptyMessage}</div> : paginatedData.map(item => <article key={item.id} className="press rounded-[18px] bg-card p-4 shadow-card">
          <div className="flex items-start gap-3">
            {selectable && <Checkbox className="mt-1" checked={selectedIds.includes(item.id)} onCheckedChange={()=>toggleSelect(item.id)}/>}
            <div className="min-w-0 flex-1">
              <div className="min-w-0 font-semibold">{columns[0]?.cell ? columns[0].cell(item) : String((item as Record<string,unknown>)[String(columns[0]?.key)] ?? "")}</div>
              <dl className="mt-3 grid grid-cols-2 gap-x-4 gap-y-3">
                {columns.slice(1,5).map(column => <div key={String(column.key)} className="min-w-0"><dt className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">{column.header}</dt><dd className="mt-1 break-words text-sm">{column.cell ? column.cell(item) : String((item as Record<string,unknown>)[String(column.key)] ?? "-")}</dd></div>)}
              </dl>
            </div>
            {actions && <DropdownMenu><DropdownMenuTrigger asChild><Button variant="ghost" size="icon" aria-label="Row actions" className="-mr-2 -mt-2 h-10 w-10 shrink-0"><MoreHorizontal className="h-4 w-4"/></Button></DropdownMenuTrigger><DropdownMenuContent align="end">{rowActions!(item).map((action,index)=><DropdownMenuItem key={index} onClick={action.onClick} className={action.destructive?"text-destructive":""}>{action.label}</DropdownMenuItem>)}</DropdownMenuContent></DropdownMenu>}
          </div>
        </article>)}
      </div>

      <div className="hidden overflow-x-auto rounded-[18px] bg-card p-1 shadow-card md:block">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              {selectable && (
                <TableHead className="w-12">
                  <Checkbox checked={allSelected} onCheckedChange={toggleSelectAll} />
                </TableHead>
              )}
              {columns.map((column) => (
                <TableHead
                  key={String(column.key)}
                  className={cn(
                    column.sortable && "cursor-pointer select-none hover:bg-muted/70",
                    column.className
                  )}
                  onClick={() => column.sortable && handleSort(String(column.key))}
                >
                  <div className="flex items-center gap-1">
                    {column.header}
                    {sortKey === column.key && (
                      <span className="text-xs">{sortDirection === "asc" ? "↑" : "↓"}</span>
                    )}
                  </div>
                </TableHead>
              ))}
              {actions && <TableHead className="w-12"></TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedData.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={columns.length + (selectable ? 1 : 0) + (actions ? 1 : 0)}
                  className="h-32 text-center text-muted-foreground"
                >
                  {emptyMessage}
                </TableCell>
              </TableRow>
            ) : (
              paginatedData.map((item) => (
                <TableRow key={item.id} className="transition-colors hover:bg-muted/30">
                  {selectable && (
                    <TableCell>
                      <Checkbox
                        checked={selectedIds.includes(item.id)}
                        onCheckedChange={() => toggleSelect(item.id)}
                      />
                    </TableCell>
                  )}
                  {columns.map((column) => (
                    <TableCell key={String(column.key)} className={column.className}>
                      {column.cell
                        ? column.cell(item)
                        : String((item as Record<string, unknown>)[String(column.key)] ?? "")}
                    </TableCell>
                  ))}
                  {actions && (
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" aria-label="Row actions" className="h-8 w-8">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          {rowActions!(item).map((action, index) => (
                            <DropdownMenuItem
                              key={index}
                              onClick={action.onClick}
                              className={action.destructive ? "text-destructive" : ""}
                            >
                              {action.label}
                            </DropdownMenuItem>
                          ))}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  )}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {totalPages > 1 && (
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-center text-xs text-muted-foreground sm:text-left sm:text-sm">
            Showing {(currentPage - 1) * pageSize + 1} to{" "}
            {Math.min(currentPage * pageSize, sortedData.length)} of {sortedData.length} entries
          </p>
          <div className="flex items-center justify-center gap-1 sm:gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(currentPage - 1)}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              let page: number;
              if (totalPages <= 5) {
                page = i + 1;
              } else if (currentPage <= 3) {
                page = i + 1;
              } else if (currentPage >= totalPages - 2) {
                page = totalPages - 4 + i;
              } else {
                page = currentPage - 2 + i;
              }
              return (
                <Button
                  key={page}
                  variant={currentPage === page ? "default" : "outline"}
                  size="sm"
                  onClick={() => setCurrentPage(page)}
                  className="w-8"
                >
                  {page}
                </Button>
              );
            })}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(currentPage + 1)}
              disabled={currentPage === totalPages}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * One filter as a dropdown with a search box, so a register with forty
 * districts is narrowed by typing rather than by scanning a row of buttons.
 */
function FilterSelect({
  label,
  value,
  choices,
  onPick,
}: {
  label: string;
  value: string;
  choices: string[];
  onPick: (choice: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const needle = query.trim().toLowerCase();
  const visible = needle ? choices.filter((c) => c.toLowerCase().includes(needle)) : choices;

  const choose = (choice: string) => {
    onPick(choice);
    setOpen(false);
    setQuery("");
  };

  return (
    <Popover open={open} onOpenChange={(next) => { setOpen(next); if (!next) setQuery(""); }}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          size="sm"
          role="combobox"
          aria-expanded={open}
          aria-label={label}
          disabled={choices.length === 0 && !value}
          className="w-full justify-between font-normal"
        >
          <span className={cn("truncate", !value && "text-muted-foreground")}>
            {value || (choices.length ? `All` : "Nothing yet")}
          </span>
          <ChevronsUpDown className="ml-2 h-3.5 w-3.5 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[max(var(--radix-popover-trigger-width),12rem)] p-0" align="start">
        <div className="border-b p-2">
          <Input
            autoFocus
            value={query}
            placeholder={`Search ${label.toLowerCase()}…`}
            aria-label={`Search ${label}`}
            onChange={(event) => setQuery(event.target.value)}
            className="h-8"
          />
        </div>
        <div role="listbox" aria-label={label} className="max-h-60 overflow-y-auto p-1">
          {!needle && (
            <FilterOption selected={!value} onSelect={() => value && choose(value)}>
              All
            </FilterOption>
          )}
          {visible.length === 0 ? (
            <p className="p-3 text-sm text-muted-foreground">Nothing matches “{query}”.</p>
          ) : (
            visible.map((choice) => (
              <FilterOption key={choice} selected={value === choice} onSelect={() => choose(choice)}>
                {choice}
              </FilterOption>
            ))
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}

function FilterOption({
  selected,
  onSelect,
  children,
}: {
  selected: boolean;
  onSelect: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      role="option"
      aria-selected={selected}
      onClick={onSelect}
      className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm hover:bg-accent"
    >
      <Check className={cn("h-3.5 w-3.5 shrink-0", selected ? "opacity-100" : "opacity-0")} />
      <span className="truncate">{children}</span>
    </button>
  );
}
