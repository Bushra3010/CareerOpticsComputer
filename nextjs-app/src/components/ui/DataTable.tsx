import { useState } from "react";
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
import { Search, MoreHorizontal, ChevronLeft, ChevronRight, Filter, X } from "lucide-react";
import { cn } from "@/lib/utils";

export interface Column<T> {
  key: keyof T | string;
  header: string;
  cell?: (item: T) => React.ReactNode;
  sortable?: boolean;
  className?: string;
}

interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  searchable?: boolean;
  searchPlaceholder?: string;
  selectable?: boolean;
  /** Notified whenever the checkbox selection changes, for bulk-action toolbars. */
  onSelectionChange?: (ids: (string | number)[]) => void;
  actions?: (item: T) => { label: string; onClick: () => void; destructive?: boolean }[];
  emptyMessage?: string;
  pageSize?: number;
}

export function DataTable<T extends { id: string | number }>({
  data,
  columns,
  searchable = true,
  searchPlaceholder = "Search...",
  selectable = false,
  onSelectionChange,
  actions,
  emptyMessage = "No data available",
  pageSize = 10,
}: DataTableProps<T>) {
  const [search, setSearch] = useState("");
  const [selectedIds, setSelectedIds] = useState<(string | number)[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [showFilters, setShowFilters] = useState(false);
  const [quickFilter, setQuickFilter] = useState("");
  const filterColumn = columns.find((column) => String(column.key).toLowerCase() === "status") || columns.find((column) => column.sortable);
  const filterOptions = filterColumn ? Array.from(new Set(data.map(item => String((item as Record<string, unknown>)[String(filterColumn.key)] ?? "")).filter(Boolean))).slice(0, 8) : [];

  const filteredData = data.filter((item) =>
    (!quickFilter || String((item as Record<string, unknown>)[String(filterColumn?.key)] ?? "") === quickFilter) && Object.values(item).some((value) =>
      String(value).toLowerCase().includes(search.toLowerCase())
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
          <Button variant={showFilters || quickFilter ? "secondary" : "outline"} size="sm" className="shrink-0 gap-2" onClick={() => setShowFilters(value => !value)}>
            <Filter className="h-4 w-4" />
            Filters {quickFilter && "· 1"}
          </Button>
        </div>
      )}

      {showFilters && filterColumn && filterOptions.length > 0 && (
        <div className="flex flex-wrap items-center gap-2 rounded-2xl border bg-card p-3 animate-slide-up">
          <span className="mr-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">{filterColumn.header}</span>
          {filterOptions.map(option => <Button key={option} variant={quickFilter === option ? "default" : "outline"} size="sm" onClick={() => { setQuickFilter(current => current === option ? "" : option); setCurrentPage(1); }}>{option}</Button>)}
          {quickFilter && <Button variant="ghost" size="sm" onClick={() => setQuickFilter("")}><X className="h-3.5 w-3.5"/>Clear</Button>}
        </div>
      )}

      <div className="space-y-2 md:hidden">
        {paginatedData.length === 0 ? <div className="rounded-2xl border bg-card p-10 text-center text-sm text-muted-foreground">{emptyMessage}</div> : paginatedData.map(item => <article key={item.id} className="rounded-2xl border bg-card p-4 shadow-sm">
          <div className="flex items-start gap-3">
            {selectable && <Checkbox className="mt-1" checked={selectedIds.includes(item.id)} onCheckedChange={()=>toggleSelect(item.id)}/>}
            <div className="min-w-0 flex-1">
              <div className="min-w-0 font-semibold">{columns[0]?.cell ? columns[0].cell(item) : String((item as Record<string,unknown>)[String(columns[0]?.key)] ?? "")}</div>
              <dl className="mt-3 grid grid-cols-2 gap-x-4 gap-y-3">
                {columns.slice(1,5).map(column => <div key={String(column.key)} className="min-w-0"><dt className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">{column.header}</dt><dd className="mt-1 break-words text-sm">{column.cell ? column.cell(item) : String((item as Record<string,unknown>)[String(column.key)] ?? "-")}</dd></div>)}
              </dl>
            </div>
            {actions && <DropdownMenu><DropdownMenuTrigger asChild><Button variant="ghost" size="icon" className="-mr-2 -mt-2 h-10 w-10 shrink-0"><MoreHorizontal className="h-4 w-4"/></Button></DropdownMenuTrigger><DropdownMenuContent align="end">{actions(item).map((action,index)=><DropdownMenuItem key={index} onClick={action.onClick} className={action.destructive?"text-destructive":""}>{action.label}</DropdownMenuItem>)}</DropdownMenuContent></DropdownMenu>}
          </div>
        </article>)}
      </div>

      <div className="hidden overflow-x-auto rounded-lg border bg-card md:block">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
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
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          {actions(item).map((action, index) => (
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
