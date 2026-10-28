import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import {
  Search,
  Download,
  MapPin,
  Eye,
  Pencil,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Users,
  KeyRound,
  FileText,
} from "lucide-react";
import { StudentContact } from "@/components/student/StudentContact";
import { formatPhone, normalisePhone, telHref } from "@/lib/phone";
import { rupees } from "@/lib/fees";
import { matchesSearch } from "@/lib/search";
import type { StudentRosterRow } from "@/lib/supabase/data";

/** Radix Select needs a non-empty value for "every branch". */
const ALL_BRANCHES = "__all__";

const PAGE_SIZE = 10;

/* Colour here is the design system's, not decoration: --success for a student
   who is on roll, --warning for one still being processed, --info for a course
   that has ended, and warm neutral for one switched off. Gold is reserved for
   the single primary action on the screen, which is "Add Student" in the page
   header -- nothing in this table competes with it. */
const STATUS_STYLES: Record<StudentRosterRow["status"], string> = {
  Active: "border-success/25 bg-success/12 text-success",
  Pending: "border-warning/25 bg-warning/12 text-warning",
  Completed: "border-info/25 bg-info/12 text-info",
  Inactive: "border-border bg-muted text-muted-foreground",
};

export const formatAdmissionDate = (value: string) => {
  const date = value ? new Date(value) : null;
  if (!date || Number.isNaN(date.getTime())) return "—";
  return date.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
};

/** The square icon affordance the roster repeats down the actions column. */
function IconAction({
  label,
  className,
  onClick,
  children,
}: {
  label: string;
  className: string;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      onClick={onClick}
      className={`inline-flex h-8 w-8 items-center justify-center rounded-md transition ${className}`}
    >
      {children}
    </button>
  );
}

/**
 * The father's / guardian's own number, under their name. Kept separate from
 * `StudentContact` on purpose: this column is the parent line, the Contact
 * column is the student's, and the two must never be mistaken for each other.
 */
function GuardianPhone({ name, phone }: { name: string; phone: string }) {
  const call = telHref(phone);
  if (!call) {
    return <p className="mt-0.5 text-xs text-muted-foreground">No number on record</p>;
  }
  return (
    <a
      href={call}
      title={`Call ${name}`}
      className="mt-0.5 block whitespace-nowrap text-xs text-brand-ink hover:underline"
    >
      {formatPhone(phone)}
    </a>
  );
}

interface StudentRosterProps {
  rows: StudentRosterRow[];
  loading?: boolean;
  onView: (student: StudentRosterRow) => void;
  /** Opens the student's uploaded documents; omitted where not offered. */
  onDocuments?: (student: StudentRosterRow) => void;
  onEdit: (student: StudentRosterRow) => void;
  onDelete: (student: StudentRosterRow) => void;
  onExport: (rows: StudentRosterRow[]) => void;
  /** Omitted for a caller who may not issue portal logins. */
  onSetLogin?: (student: StudentRosterRow) => void;
  /** Turns a student's profile on or off; omitted where that is not allowed. */
  onToggleActive?: (student: StudentRosterRow, active: boolean) => void;
}

export function StudentRoster({
  rows,
  loading = false,
  onView,
  onDocuments,
  onEdit,
  onDelete,
  onExport,
  onSetLogin,
  onToggleActive,
}: StudentRosterProps) {
  const [search, setSearch] = useState("");
  const [courseFilter, setCourseFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [branchFilter, setBranchFilter] = useState("");
  const [selected, setSelected] = useState<string[]>([]);
  const [page, setPage] = useState(1);

  // Course options come from the roster itself rather than a fixed list, so a
  // branch only ever filters by courses it actually runs.
  const courseOptions = useMemo(() => Array.from(new Set(rows.map((s) => s.course))).sort(), [rows]);
  // Likewise the branches. A branch account's roster holds only its own, so
  // the filter appears only when there is more than one to choose between.
  const branchOptions = useMemo(
    () => Array.from(new Set(rows.map((s) => s.branch).filter(Boolean))).sort(),
    [rows],
  );

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    // Digits are matched against the bare subscriber number as well as the
    // stored text, so "9822041100" finds a student saved as "+91 98220 41100".
    const digits = q.replace(/\D/g, "");
    return rows.filter((s) => {
      if (branchFilter && s.branch !== branchFilter) return false;
      if (courseFilter && s.course !== courseFilter) return false;
      if (statusFilter && s.status !== statusFilter) return false;
      if (!q) return true;
      const haystack = [
        s.name,
        s.fatherName,
        s.phone,
        s.whatsapp,
        s.fatherPhone,
        s.course,
        s.admissionNo,
        s.address,
        ...(digits ? [s.phone, s.whatsapp, s.fatherPhone].map((p) => normalisePhone(p) ?? "") : []),
      ]
        .join(" ")
        .toLowerCase();
      return matchesSearch(haystack, q) || (digits.length >= 4 && haystack.includes(digits));
    });
  }, [rows, search, branchFilter, courseFilter, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const pageRows = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  // Narrowing the filters can leave the user on a page that no longer exists.
  useEffect(() => setPage(1), [search, branchFilter, courseFilter, statusFilter]);

  const allOnPageSelected = pageRows.length > 0 && pageRows.every((s) => selected.includes(s.id));
  const toggleAll = () =>
    setSelected((prev) =>
      allOnPageSelected
        ? prev.filter((id) => !pageRows.some((s) => s.id === id))
        : [...new Set([...prev, ...pageRows.map((s) => s.id)])],
    );

  const selectClass =
    "h-10 rounded-lg border border-input bg-background px-3 text-sm outline-none transition focus:ring-2 focus:ring-ring focus:ring-offset-1 focus:ring-offset-background";

  // The app overrides Tailwind's radius scale, so `rounded-sm` renders a 16px
  // checkbox as a circle. Pin these to a real square.
  const checkboxClass = "rounded-[3px]";

  return (
    <section className="overflow-hidden rounded-lg border bg-card shadow-sm">
      {/* Toolbar */}
      <div className="border-b p-4 sm:p-5">
        <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
          <div className="relative w-full xl:max-w-md">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search student, father, phone, course…"
              className="h-10 pl-9"
            />
          </div>

          <div className="flex flex-wrap gap-2">
            {branchOptions.length > 1 && (
              <Select value={branchFilter || ALL_BRANCHES} onValueChange={(v) => setBranchFilter(v === ALL_BRANCHES ? "" : v)}>
                <SelectTrigger aria-label="Filter by branch" className="h-10 w-auto min-w-[10rem] max-w-[16rem]">
                  <SelectValue placeholder="All branches" />
                </SelectTrigger>
                <SelectContent searchable searchPlaceholder="Search centre…">
                  <SelectItem value={ALL_BRANCHES}>All branches</SelectItem>
                  {branchOptions.map((branch) => (
                    <SelectItem key={branch} value={branch}>
                      {branch}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}

            <select
              value={courseFilter}
              onChange={(e) => setCourseFilter(e.target.value)}
              className={selectClass}
              aria-label="Filter by course"
            >
              <option value="">All courses</option>
              {courseOptions.map((course) => (
                <option key={course} value={course}>
                  {course}
                </option>
              ))}
            </select>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className={selectClass}
              aria-label="Filter by status"
            >
              <option value="">All status</option>
              <option value="Active">Active</option>
              <option value="Pending">Pending</option>
              <option value="Completed">Completed</option>
              <option value="Inactive">Inactive</option>
            </select>

            <Button
              variant="outline"
              className="h-10"
              onClick={() => {
                setSearch("");
                setBranchFilter("");
                setCourseFilter("");
                setStatusFilter("");
              }}
            >
              Reset
            </Button>

            <Button variant="outline" className="h-10 gap-2" onClick={() => onExport(filtered)}>
              <Download className="h-4 w-4" />
              Export
            </Button>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <label className="flex cursor-pointer items-center gap-2 text-sm text-muted-foreground">
              <Checkbox
                className={checkboxClass}
                checked={allOnPageSelected}
                onCheckedChange={toggleAll}
                aria-label="Select all"
              />
              Select all
            </label>
            {selected.length > 0 && (
              <span className="text-xs font-semibold text-brand-ink">{selected.length} selected</span>
            )}
          </div>

          <div className="text-sm text-muted-foreground">
            Showing <span className="font-semibold text-foreground">{filtered.length}</span>{" "}
            {filtered.length === 1 ? "student" : "students"}
          </div>
        </div>
      </div>

      {/* Roster */}
      <div className="overflow-x-auto">
        <table className="w-full min-w-[1560px]">
          <thead className="border-b bg-muted/50">
            <tr className="text-left">
              <th className="w-10 px-5 py-3">
                <span className="sr-only">Select</span>
              </th>
              {/* The three money headings are right-aligned over their figures:
                  columns of rupees only compare at a glance when the last digit
                  of each lines up. */}
              {[
                "Student",
                "Admission",
                "Branch",
                "Course",
                "Father / Guardian",
                "Contact",
                "Location",
                { label: "Course fee", align: "right" as const },
                { label: "Paid", align: "right" as const },
                { label: "Balance", align: "right" as const },
                "Status",
                "Portal",
                "Actions",
              ].map((heading) => {
                const { label, align } =
                  typeof heading === "string" ? { label: heading, align: "left" as const } : heading;
                return (
                  <th
                    key={label}
                    className={`whitespace-nowrap px-4 py-3 ${align === "right" ? "text-right" : ""}`}
                  >
                    <span className="eyebrow-muted">{label}</span>
                  </th>
                );
              })}
            </tr>
          </thead>

          <tbody className="divide-y">
            {pageRows.map((student) => (
              <tr key={student.id} className="transition-colors hover:bg-muted/40">
                <td className="px-5 py-3.5">
                  <Checkbox
                    className={checkboxClass}
                    checked={selected.includes(student.id)}
                    onCheckedChange={(checked) =>
                      setSelected((prev) =>
                        checked ? [...prev, student.id] : prev.filter((id) => id !== student.id),
                      )
                    }
                    aria-label={`Select ${student.name}`}
                  />
                </td>

                <td className="px-4 py-3.5">
                  <div className="flex items-center gap-3">
                    <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-brand/15 text-xs font-semibold text-brand-ink ring-1 ring-inset ring-brand/25">
                      {student.initials}
                    </span>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold">{student.name}</p>
                      <p className="truncate text-xs text-muted-foreground">{student.address}</p>
                    </div>
                  </div>
                </td>

                <td className="px-4 py-3.5">
                  <span className="whitespace-nowrap text-sm font-medium">{student.admissionNo}</span>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {formatAdmissionDate(student.admissionDate)}
                  </p>
                </td>

                {/* An organisation admin sees every branch's students in one
                    list, where nothing on the row said which branch a student
                    belonged to. */}
                <td className="px-4 py-3.5">
                  <span className="whitespace-nowrap text-sm">
                    {student.branch || "—"}
                  </span>
                </td>

                {/* The course reads as a name, not a tag: a pill around a short
                    name like "ADCA AI" is indistinguishable from a code, and the
                    branch could not tell which of the two it was looking at. The
                    code, when the course has one, sits under it labelled. */}
                <td className="max-w-[15rem] px-4 py-3.5">
                  <p className="text-sm font-medium">{student.course}</p>
                  {student.courseCode && (
                    <p className="mt-0.5 text-xs text-muted-foreground">{student.courseCode}</p>
                  )}
                </td>

                <td className="px-4 py-3.5">
                  <p className="whitespace-nowrap text-sm font-medium">{student.fatherName}</p>
                  <GuardianPhone name={student.fatherName} phone={student.fatherPhone} />
                </td>

                <td className="px-4 py-3.5">
                  <StudentContact
                    name={student.name}
                    phone={student.phone}
                    whatsapp={student.whatsapp}
                  />
                </td>

                <td className="px-4 py-3.5">
                  <a
                    href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                      student.mapQuery || student.address,
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    title="Open location in Google Maps"
                    className="inline-flex items-center gap-1.5 rounded-md bg-info/12 px-2.5 py-1.5 text-xs font-medium text-info transition-colors hover:bg-info/20"
                  >
                    <MapPin className="h-3.5 w-3.5" />
                    Map
                  </a>
                </td>

                {/* What the course costs, what has come in, what is left. The
                    fee is the course's own price -- billing the first instalment
                    does not make the course cheaper -- with what has actually
                    been invoiced named under it when the two differ. */}
                <td className="px-4 py-3.5 text-right">
                  <span className="text-sm font-semibold tabular">{rupees(student.fee)}</span>
                  {student.invoiced > 0 && student.invoiced !== student.fee && (
                    <p className="mt-0.5 whitespace-nowrap text-xs text-muted-foreground">
                      {rupees(student.invoiced)} invoiced
                    </p>
                  )}
                </td>

                <td className="px-4 py-3.5 text-right">
                  <span
                    className={`text-sm tabular ${
                      student.paid > 0 ? "font-medium text-success" : "text-muted-foreground"
                    }`}
                  >
                    {rupees(student.paid)}
                  </span>
                </td>

                <td className="px-4 py-3.5 text-right">
                  {student.balance > 0 ? (
                    <span className="text-sm font-semibold tabular text-destructive">
                      {rupees(student.balance)}
                    </span>
                  ) : (
                    <span className="inline-flex whitespace-nowrap rounded-md bg-success/12 px-2 py-1 text-xs font-medium text-success">
                      Cleared
                    </span>
                  )}
                </td>

                <td className="px-4 py-3.5">
                  <div className="flex items-center gap-2">
                    {onToggleActive && (
                      <Switch
                        checked={student.status !== "Inactive"}
                        onCheckedChange={(on) => onToggleActive(student, on)}
                        aria-label={student.status === "Inactive" ? `Activate ${student.name}` : `Deactivate ${student.name}`}
                      />
                    )}
                    <span
                      className={`inline-flex items-center whitespace-nowrap rounded-full border px-2.5 py-1 text-xs font-semibold ${
                        STATUS_STYLES[student.status]
                      }`}
                    >
                      <span className="mr-1.5 h-1.5 w-1.5 rounded-full bg-current" />
                      {student.status}
                    </span>
                  </div>
                </td>

                <td className="px-4 py-3.5">
                  {student.hasLogin ? (
                    <span className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-md bg-success/12 px-2.5 py-1 text-xs font-medium text-success">
                      <KeyRound className="h-3.5 w-3.5" />
                      Has login
                    </span>
                  ) : (
                    <span className="whitespace-nowrap text-xs text-muted-foreground">No login</span>
                  )}
                </td>

                <td className="px-4 py-3.5">
                  <div className="flex items-center gap-1.5">
                    {onSetLogin && (
                      <IconAction
                        label={student.hasLogin ? "Reset portal password" : "Create portal login"}
                        onClick={() => onSetLogin(student)}
                        className="bg-muted text-muted-foreground hover:bg-accent hover:text-foreground"
                      >
                        <KeyRound className="h-4 w-4" />
                      </IconAction>
                    )}
                    <IconAction
                      label="View student"
                      onClick={() => onView(student)}
                      className="bg-muted text-muted-foreground hover:bg-accent hover:text-foreground"
                    >
                      <Eye className="h-4 w-4" />
                    </IconAction>
                    {onDocuments && (
                      <IconAction
                        label="Student documents"
                        onClick={() => onDocuments(student)}
                        className="bg-muted text-muted-foreground hover:bg-accent hover:text-foreground"
                      >
                        <FileText className="h-4 w-4" />
                      </IconAction>
                    )}
                    <IconAction
                      label="Edit student"
                      onClick={() => onEdit(student)}
                      className="bg-muted text-muted-foreground hover:bg-accent hover:text-foreground"
                    >
                      <Pencil className="h-4 w-4" />
                    </IconAction>
                    {/* Neutral until hover: ten red buttons down the page read
                        as a warning about the data rather than an action. */}
                    <IconAction
                      label="Delete student"
                      onClick={() => onDelete(student)}
                      className="bg-muted text-muted-foreground hover:bg-destructive/15 hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </IconAction>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {pageRows.length === 0 && (
        <div className="py-14 text-center">
          <span className="mx-auto grid h-14 w-14 place-items-center rounded-xl bg-muted">
            <Users className="h-6 w-6 text-muted-foreground" />
          </span>
          <p className="mt-4 font-semibold">{loading ? "Loading students…" : "No students found"}</p>
          {!loading && (
            <p className="mt-1 text-sm text-muted-foreground">
              {rows.length === 0
                ? "No admissions on this branch yet."
                : "Try a different search or clear the filters."}
            </p>
          )}
        </div>
      )}

      {filtered.length > 0 && (
        <div className="flex flex-wrap items-center justify-between gap-3 border-t px-5 py-3.5">
          <p className="text-sm text-muted-foreground">
            Page <span className="font-semibold text-foreground">{currentPage}</span> of {totalPages}
          </p>
          <div className="flex items-center gap-1.5">
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              aria-label="Previous page"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
              <Button
                key={n}
                variant={n === currentPage ? "secondary" : "ghost"}
                size="sm"
                className={`h-8 min-w-8 px-2.5 ${n === currentPage ? "font-semibold" : "text-muted-foreground"}`}
                onClick={() => setPage(n)}
              >
                {n}
              </Button>
            ))}
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              aria-label="Next page"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </section>
  );
}
