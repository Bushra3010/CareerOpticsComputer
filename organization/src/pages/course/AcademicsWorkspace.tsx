import { useState, useEffect, useCallback, useMemo } from "react";
import { useLocation } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { DatePicker } from "@/components/ui/date-picker";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { BookOpen, Calendar, Download, Pencil, Plus, Trash2, Upload, X } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { EditableSelect } from "@/components/ui/EditableSelect";
import { useAuth } from "@/contexts/AuthContext";
import { canManageCourses } from "@/lib/roles";
import { DataTable, type Column, type TableFilter } from "@/components/ui/DataTable";
import { courseCategoryLabel } from "@/lib/courseCategories";
import { useToast } from "@/hooks/use-toast";
import { downloadCsv, parseCsv, pickFile } from "@/lib/export";
import {
  getCourses,
  createCourse,
  updateCourse,
  deleteCourse,
  getBatches,
  getBatchesByOrg,
  createBatch,
  updateBatch,
  deleteBatch,
  getBranches,
} from "@/lib/supabase/data";

type Course = {
  id: string;
  name: string;
  code: string;
  category?: string;
  description?: string;
  durationMonths: number;
  baseFee?: number;
  isActive: boolean;
};

type Batch = {
  id: string;
  name: string;
  code: string;
  branchId: string;
  courseId: string;
  startDate: string;
  endDate?: string;
  maxStudents?: number;
  currentStudents?: number;
  feeDiscount?: number;
  remark?: string;
  isActive: boolean;
};

type Branch = { id: string; name: string };

/** Which form the page opens with, taken from the route. */
const formForPath = (pathname: string): "course" | "batch" | null => {
  if (pathname.startsWith("/course/batch/create")) return "batch";
  if (pathname.startsWith("/course/create")) return "course";
  return null;
};

const REMARK_WORD_LIMIT = 200;
const countWords = (value: string) => value.trim().split(/\s+/).filter(Boolean).length;

export default function AcademicsWorkspace() {
  const { user } = useAuth();
  const { pathname } = useLocation();
  const orgId = user?.organizationId || null;
  const branchId = user?.branchId || null;
  const { toast } = useToast();

  /* A branch runs the courses it has been given; the catalogue itself is the
     organisation's. Batches stay open to everyone — those are a branch's own
     cohorts, and scheduling them is exactly what a branch is for. */
  const mayManageCourses = canManageCourses(user?.role);

  const [courses, setCourses] = useState<Course[]>([]);
  const [batches, setBatches] = useState<Batch[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<"course" | "batch" | null>(null);
  /** Null while creating; the row's id while editing one. */
  const [editingId, setEditingId] = useState<string | null>(null);
  const [pendingDelete, setPendingDelete] = useState<
    { kind: "course" | "batch"; id: string; name: string } | null
  >(null);
  const [d, setD] = useState<Record<string, string>>({});

  // The route decides which form is open, so "Create course" from the menu
  // lands on an open form instead of a list the user has to hunt through.
  useEffect(() => {
    const next = formForPath(pathname);
    setForm(next === "course" && !mayManageCourses ? null : next);
    setEditingId(null);
    setD({});
  }, [pathname, mayManageCourses]);

  const closeForm = () => {
    setForm(null);
    setEditingId(null);
    setD({});
  };

  const openCreate = (kind: "course" | "batch") => {
    setEditingId(null);
    setD({});
    setForm(kind);
  };

  /** Load a course back into the same form the create flow uses. */
  const editCourse = (c: Course) => {
    setEditingId(c.id);
    setForm("course");
    setD({
      name: c.name || "",
      code: c.code || "",
      category: c.category || "",
      description: c.description || "",
      durationMonths: String(c.durationMonths ?? ""),
      baseFee: c.baseFee === undefined || c.baseFee === null ? "" : String(c.baseFee),
      isActive: c.isActive ? "yes" : "no",
    });
  };

  const editBatch = (b: Batch) => {
    setEditingId(b.id);
    setForm("batch");
    setD({
      branchId: b.branchId || "",
      courseId: b.courseId || "",
      name: b.name || "",
      code: b.code || "",
      // The columns are timestamps; the date inputs want a bare yyyy-mm-dd.
      startDate: b.startDate?.slice(0, 10) || "",
      endDate: b.endDate?.slice(0, 10) || "",
      maxStudents: b.maxStudents === undefined || b.maxStudents === null ? "" : String(b.maxStudents),
      feeDiscount: b.feeDiscount ? String(b.feeDiscount) : "",
      remark: b.remark || "",
      isActive: b.isActive ? "yes" : "no",
    });
  };

  const confirmDelete = async () => {
    if (!pendingDelete) return;
    const { kind, id, name } = pendingDelete;
    // The same line the save already drew: a branch deletes its own batches,
    // never the organisation's courses.
    if (kind === "course" && !mayManageCourses) {
      setPendingDelete(null);
      toast({
        title: "Courses are managed by the organisation",
        description: "Your branch runs the courses it is assigned.",
        variant: "destructive",
      });
      return;
    }
    setPendingDelete(null);
    try {
      await (kind === "course" ? deleteCourse(id) : deleteBatch(id));
      toast({ title: `${kind === "course" ? "Course" : "Batch"} deleted`, description: `${name} has been removed.` });
      if (editingId === id) closeForm();
      await load();
    } catch (e) {
      toast({
        title: `Could not delete the ${kind}`,
        description: e instanceof Error ? e.message : "Please try again",
        variant: "destructive",
      });
    }
  };

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [c, b, br] = await Promise.all([
        getCourses(orgId, branchId),
        branchId ? getBatches(branchId) : getBatchesByOrg(orgId),
        orgId ? getBranches(orgId) : Promise.resolve({ success: true, data: [] }),
      ]);
      setCourses(c.data as Course[]);
      setBatches(b.data as Batch[]);
      setBranches(br.data as Branch[]);
    } catch (e) {
      toast({
        title: "Could not load academics",
        description: e instanceof Error ? e.message : "Unknown error",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [orgId, branchId, toast]);

  // Re-runs once auth resolves; the old version fetched once with a null org
  // and left both lists permanently empty.
  useEffect(() => {
    void load();
  }, [load]);

  const targetBranchId = branchId || d.branchId || "";
  const courseName = (id: string) => courses.find((c) => c.id === id)?.name || "—";
  const branchName = (id: string) => branches.find((b) => b.id === id)?.name || "—";

  const remarkWords = useMemo(() => countWords(d.remark || ""), [d.remark]);

  /* ---------- the two registers ---------- */

  const statusOf = (item: { isActive: boolean }) => (item.isActive ? "Active" : "Inactive");

  const courseColumns: Column<Course>[] = [
    {
      key: "name",
      header: "Course",
      sortable: true,
      cell: (c) => (
        <div className="flex items-center gap-3">
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-muted">
            <BookOpen className="h-4 w-4" />
          </span>
          <div className="min-w-0">
            <p className="font-semibold">{c.name}</p>
            <p className="text-xs text-muted-foreground">{c.code}</p>
          </div>
        </div>
      ),
    },
    {
      key: "category",
      header: "Category",
      sortable: true,
      cell: (c) => courseCategoryLabel(c.category || "") || "—",
    },
    { key: "durationMonths", header: "Duration", sortable: true, cell: (c) => `${c.durationMonths} months` },
    {
      key: "baseFee",
      header: "Fee",
      sortable: true,
      cell: (c) => (c.baseFee ? `₹${c.baseFee.toLocaleString("en-IN")}` : "—"),
    },
    { key: "isActive", header: "Status", cell: statusOf },
  ];

  const courseFilters: TableFilter<Course>[] = [
    { label: "Category", key: "category", value: (c) => courseCategoryLabel(c.category || "") || "" },
    { label: "Status", key: "isActive", options: ["Active", "Inactive"], value: statusOf },
  ];

  const batchColumns: Column<Batch>[] = [
    {
      key: "name",
      header: "Batch",
      sortable: true,
      cell: (b) => (
        <div className="flex items-center gap-3">
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-muted">
            <Calendar className="h-4 w-4" />
          </span>
          <div className="min-w-0">
            <p className="font-semibold">{b.name}</p>
            <p className="text-xs text-muted-foreground">{b.code}</p>
          </div>
        </div>
      ),
    },
    { key: "courseId", header: "Course", sortable: true, cell: (b) => courseName(b.courseId) },
    {
      key: "startDate",
      header: "Starts",
      sortable: true,
      cell: (b) => (b.startDate ? new Date(b.startDate).toLocaleDateString("en-IN") : "—"),
    },
    {
      key: "currentStudents",
      header: "Seats",
      cell: (b) => `${b.currentStudents ?? 0}/${b.maxStudents || "∞"}`,
    },
    {
      key: "feeDiscount",
      header: "Discount",
      cell: (b) => (b.feeDiscount ? `₹${b.feeDiscount.toLocaleString("en-IN")} off` : "—"),
    },
    { key: "isActive", header: "Status", cell: statusOf },
  ];

  const batchFilters: TableFilter<Batch>[] = [
    // Keyed on the course's name rather than its id, so the choices read as
    // course names instead of as keys.
    { label: "Course", key: "courseId", value: (b) => courseName(b.courseId) },
    { label: "Status", key: "isActive", options: ["Active", "Inactive"], value: statusOf },
  ];

  // Whatever the existing courses already use, so a category typed earlier is
  // picked rather than retyped. The editable list supplies the rest.
  const usedCategories = useMemo(
    () => [...new Set(courses.map((c) => (c.category || "").trim()).filter(Boolean))],
    [courses],
  );

  const validate = () => {
    const missing: string[] = [];
    if (!d.name?.trim()) missing.push("Name");
    if (!d.code?.trim()) missing.push("Code");
    if (form === "course" && !d.durationMonths) missing.push("Duration");
    if (form === "batch") {
      if (!d.courseId) missing.push("Course");
      if (!targetBranchId) missing.push("Branch");
      if (!d.startDate) missing.push("Start date");
    }
    if (missing.length > 0) {
      toast({
        title: "Missing details",
        description: `${missing.join(", ")} ${missing.length === 1 ? "is" : "are"} required.`,
        variant: "destructive",
      });
      return false;
    }
    if (form === "batch" && d.endDate && d.endDate < d.startDate) {
      toast({ title: "Invalid dates", description: "End date is before the start date.", variant: "destructive" });
      return false;
    }
    if (form === "batch" && remarkWords > REMARK_WORD_LIMIT) {
      toast({
        title: "Remark too long",
        description: `Remarks are limited to ${REMARK_WORD_LIMIT} words (currently ${remarkWords}).`,
        variant: "destructive",
      });
      return false;
    }
    return true;
  };

  const submit = async () => {
    if (!validate()) return;
    // Belt and braces behind the hidden button: whatever opened this form, a
    // branch does not write the organisation's catalogue.
    if (form === "course" && !mayManageCourses) {
      toast({
        title: "Courses are managed by the organisation",
        description: "Your branch runs the courses it is assigned. Ask the organisation to add this one.",
        variant: "destructive",
      });
      setForm(null);
      return;
    }
    setSaving(true);
    try {
      if (form === "course") {
        const payload = {
          name: d.name.trim(),
          code: d.code.trim().toUpperCase(),
          category: (d.category || "").trim() || "COMPUTER",
          description: d.description || "",
          durationMonths: Number(d.durationMonths) || 1,
          baseFee: Number(d.baseFee) || 0,
          isActive: d.isActive !== "no",
        };
        await (editingId ? updateCourse(editingId, payload) : createCourse(orgId, payload));
      } else {
        const payload = {
          courseId: d.courseId,
          name: d.name.trim(),
          code: d.code.trim().toUpperCase(),
          maxStudents: d.maxStudents ? Number(d.maxStudents) : null,
          startDate: new Date(d.startDate).toISOString(),
          endDate: d.endDate ? new Date(d.endDate).toISOString() : null,
          feeDiscount: d.feeDiscount ? Number(d.feeDiscount) : 0,
          remark: d.remark?.trim() || null,
          isActive: d.isActive !== "no",
        };
        await (editingId ? updateBatch(editingId, payload) : createBatch(targetBranchId, payload));
      }
      toast({
        title: `${form === "course" ? "Course" : "Batch"} ${editingId ? "updated" : "created"}`,
        description: editingId ? "The changes are saved." : "The academic record is now active.",
      });
      closeForm();
      await load();
    } catch (e) {
      toast({
        title: `Could not ${editingId ? "update" : "create"} record`,
        description: e instanceof Error ? e.message : "Review the form",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const exportCourses = () => {
    downloadCsv(
      "courses.csv",
      courses.map((c) => ({
        Name: c.name,
        Code: c.code,
        Category: c.category || "",
        DurationMonths: c.durationMonths,
        BaseFee: c.baseFee ?? 0,
        Description: c.description || "",
        Active: c.isActive ? "Yes" : "No",
      })),
    );
    toast({ title: "Courses exported", description: `${courses.length} rows written to CSV.` });
  };

  const exportBatches = () => {
    downloadCsv(
      "batches.csv",
      batches.map((b) => ({
        Name: b.name,
        Code: b.code,
        Course: courseName(b.courseId),
        Branch: branchName(b.branchId),
        StartDate: b.startDate?.slice(0, 10) || "",
        EndDate: b.endDate?.slice(0, 10) || "",
        Capacity: b.maxStudents ?? "",
        Enrolled: b.currentStudents ?? 0,
        FeeDiscount: b.feeDiscount ?? 0,
        Remark: b.remark || "",
      })),
    );
    toast({ title: "Batches exported", description: `${batches.length} rows written to CSV.` });
  };

  /** CSV columns: Name, Code, DurationMonths, Category, BaseFee, Description. */
  const importCourses = async () => {
    const file = await pickFile(".csv");
    if (!file) return;
    const rows = parseCsv(file.text);
    if (rows.length === 0) {
      toast({ title: "Nothing to import", description: "The file had no data rows.", variant: "destructive" });
      return;
    }
    setSaving(true);
    let ok = 0;
    const failures: string[] = [];
    for (const row of rows) {
      const name = row.Name || row.name;
      const code = row.Code || row.code;
      if (!name || !code) {
        failures.push(`${name || code || "(blank row)"}: name and code are both required`);
        continue;
      }
      try {
        await createCourse(orgId, {
          name: name.trim(),
          code: code.trim().toUpperCase(),
          category: row.Category || row.category || "COMPUTER",
          description: row.Description || row.description || "",
          durationMonths: Number(row.DurationMonths || row.durationMonths) || 1,
          baseFee: Number(row.BaseFee || row.baseFee) || 0,
          isActive: true,
        });
        ok += 1;
      } catch (e) {
        failures.push(`${name}: ${e instanceof Error ? e.message : "failed"}`);
      }
    }
    setSaving(false);
    await load();
    toast({
      title: `Imported ${ok} of ${rows.length} courses`,
      description: failures.length > 0 ? failures.slice(0, 3).join(" · ") : "All rows imported.",
      variant: failures.length > 0 ? "destructive" : "default",
    });
  };

  return (
    <AppLayout>
      <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[.16em] text-muted-foreground">
            Academics
          </p>
          <h1 className="mt-1 text-2xl font-semibold tracking-[-.04em] sm:text-3xl">
            Courses &amp; batches
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Plan programmes and cohorts from one workspace.
          </p>
        </div>
        <div className="grid grid-cols-2 gap-2 sm:flex">
          {/* Import writes courses, so it goes where "New course" goes. Export
              only reads, so a branch keeps it. */}
          {mayManageCourses && (
            <Button variant="outline" onClick={importCourses} disabled={saving}>
              <Upload />
              Import
            </Button>
          )}
          <Button variant="outline" onClick={exportCourses} disabled={courses.length === 0}>
            <Download />
            Export
          </Button>
          <Button
            variant={mayManageCourses ? "outline" : "default"}
            onClick={() => openCreate("batch")}
          >
            <Plus />
            New batch
          </Button>
          {mayManageCourses && (
            <Button onClick={() => openCreate("course")}>
              <Plus />
              New course
            </Button>
          )}
        </div>
      </div>

      {form && (
        <Card className="mb-5 border-brand/40">
          <CardContent className="p-5">
            <div className="mb-5 flex justify-between">
              <div>
                <h2 className="font-semibold">
                  {editingId ? "Edit" : "Create"} {form}
                </h2>
                <p className="text-xs text-muted-foreground">Fields marked * are required</p>
              </div>
              <Button variant="ghost" size="icon" aria-label="Close form" onClick={closeForm}>
                <X />
              </Button>
            </div>
            <div className="grid gap-4 md:grid-cols-3">
              {form === "batch" && (
                <>
                  {!branchId && (
                    <Field l="Branch *">
                      <Select value={d.branchId || ""} onValueChange={(v) => setD((p) => ({ ...p, branchId: v }))}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select branch" />
                        </SelectTrigger>
                        <SelectContent searchable searchPlaceholder="Search centre…">
                          {branches.map((b) => (
                            <SelectItem value={b.id} key={b.id}>{b.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </Field>
                  )}
                  <Field l="Course *">
                    <Select value={d.courseId || ""} onValueChange={(v) => setD((p) => ({ ...p, courseId: v }))}>
                      <SelectTrigger>
                        <SelectValue placeholder={courses.length ? "Select course" : "Create a course first"} />
                      </SelectTrigger>
                      <SelectContent>
                        {courses.map((c) => (
                          <SelectItem value={c.id} key={c.id}>{c.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </Field>
                </>
              )}
              <Field l="Name *">
                <Input value={d.name || ""} onChange={(e) => setD((p) => ({ ...p, name: e.target.value }))} />
              </Field>
              <Field l="Code *">
                <Input value={d.code || ""} onChange={(e) => setD((p) => ({ ...p, code: e.target.value }))} />
              </Field>
              {form === "course" ? (
                <>
                  <Field l="Category">
                    <EditableSelect
                      optionKey="courseCategory"
                      placeholder="Category"
                      value={d.category || ""}
                      extraOptions={usedCategories}
                      onChange={(v) => setD((p) => ({ ...p, category: v }))}
                    />
                  </Field>
                  <Field l="Duration (months) *">
                    <Input
                      type="number"
                      min={1}
                      value={d.durationMonths || ""}
                      onChange={(e) => setD((p) => ({ ...p, durationMonths: e.target.value }))}
                    />
                  </Field>
                  <Field l="Base fee (₹)">
                    <Input
                      type="number"
                      min={0}
                      value={d.baseFee || ""}
                      onChange={(e) => setD((p) => ({ ...p, baseFee: e.target.value }))}
                    />
                  </Field>
                  <Field l="Description">
                    <Input
                      value={d.description || ""}
                      onChange={(e) => setD((p) => ({ ...p, description: e.target.value }))}
                    />
                  </Field>
                </>
              ) : (
                <>
                  <Field l="Capacity">
                    <Input
                      type="number"
                      min={1}
                      value={d.maxStudents || ""}
                      onChange={(e) => setD((p) => ({ ...p, maxStudents: e.target.value }))}
                    />
                  </Field>
                  <Field l="Start date *">
                    <DatePicker value={d.startDate || ""} onChange={(v) => setD((p) => ({ ...p, startDate: v }))} />
                  </Field>
                  <Field l="End date">
                    <DatePicker
                      value={d.endDate || ""}
                      onChange={(v) => setD((p) => ({ ...p, endDate: v }))}
                      min={d.startDate || undefined}
                    />
                  </Field>
                  <Field l="Course fee discount (₹)">
                    <Input
                      type="number"
                      min={0}
                      placeholder="0"
                      value={d.feeDiscount || ""}
                      onChange={(e) => setD((p) => ({ ...p, feeDiscount: e.target.value }))}
                    />
                  </Field>
                  <div className="space-y-2 md:col-span-3">
                    <Label>Remark</Label>
                    <Textarea
                      rows={3}
                      placeholder={`Notes about this batch (max ${REMARK_WORD_LIMIT} words)`}
                      value={d.remark || ""}
                      onChange={(e) => setD((p) => ({ ...p, remark: e.target.value }))}
                    />
                    <p
                      className={`text-xs ${remarkWords > REMARK_WORD_LIMIT ? "text-destructive" : "text-muted-foreground"}`}
                    >
                      {remarkWords}/{REMARK_WORD_LIMIT} words
                    </p>
                  </div>
                </>
              )}
              <Field l="Status">
                <Select
                  value={d.isActive === "no" ? "no" : "yes"}
                  onValueChange={(v) => setD((p) => ({ ...p, isActive: v }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="yes">Active</SelectItem>
                    <SelectItem value="no">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </Field>
            </div>
            <div className="mt-5 flex flex-wrap justify-end gap-2">
              {editingId && (
                <Button
                  variant="outline"
                  className="mr-auto text-destructive"
                  onClick={() =>
                    setPendingDelete({ kind: form, id: editingId, name: d.name || "this record" })
                  }
                >
                  <Trash2 />
                  Delete {form}
                </Button>
              )}
              <Button variant="outline" onClick={closeForm}>Cancel</Button>
              <Button onClick={submit} disabled={saving}>
                {saving ? "Saving..." : `${editingId ? "Save" : "Create"} ${form}`}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Stacked rather than side by side: each is a table now, and two of
          them sharing a row left every column too narrow to read. */}
      <div className="space-y-5">
        <Card>
          <CardContent className="p-0">
            <div className="flex items-center justify-between border-b p-4">
              <span className="font-semibold">Courses · {courses.length}</span>
              <Button variant="ghost" size="sm" onClick={exportCourses} disabled={courses.length === 0}>
                <Download className="h-4 w-4" />
              </Button>
            </div>
            <div className="p-4">
              <DataTable
                data={courses}
                columns={courseColumns}
                filters={courseFilters}
                searchPlaceholder="Search course name or code…"
                actions={
                  mayManageCourses
                    ? (c) => [
                        { label: "Edit course", onClick: () => editCourse(c) },
                        {
                          label: "Delete course",
                          destructive: true,
                          onClick: () => setPendingDelete({ kind: "course", id: c.id, name: c.name }),
                        },
                      ]
                    : undefined
                }
                emptyMessage={
                  loading
                    ? "Loading courses…"
                    : mayManageCourses
                      ? "No courses yet. Use “New course” to add the first one."
                      : "No courses assigned to this branch yet. The organisation assigns them from its catalogue."
                }
              />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-0">
            <div className="flex items-center justify-between border-b p-4">
              <span className="font-semibold">Batches · {batches.length}</span>
              <Button variant="ghost" size="sm" onClick={exportBatches} disabled={batches.length === 0}>
                <Download className="h-4 w-4" />
              </Button>
            </div>
            <div className="p-4">
              <DataTable
                data={batches}
                columns={batchColumns}
                filters={batchFilters}
                searchPlaceholder="Search batch name or code…"
                actions={(b) => [
                  { label: "Edit batch", onClick: () => editBatch(b) },
                  {
                    label: "Delete batch",
                    destructive: true,
                    onClick: () => setPendingDelete({ kind: "batch", id: b.id, name: b.name }),
                  },
                ]}
                emptyMessage={loading ? "Loading batches…" : "No batches yet. Use “New batch” to add the first one."}
              />
            </div>
          </CardContent>
        </Card>
      </div>

      <AlertDialog open={!!pendingDelete} onOpenChange={(open) => !open && setPendingDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete {pendingDelete?.name}?</AlertDialogTitle>
            <AlertDialogDescription>
              {pendingDelete?.kind === "course"
                ? "The course stops appearing in every picker. Students and batches already pointing at it keep their records."
                : "The batch is removed for good. A batch with students still enrolled cannot be deleted."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AppLayout>
  );
}

function Field({ l, children }: { l: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <Label>{l}</Label>
      {children}
    </div>
  );
}

function RowActions({
  label,
  onEdit,
  onDelete,
}: {
  label: string;
  onEdit: () => void;
  onDelete: () => void;
}) {
  return (
    <div className="flex shrink-0 items-center gap-0.5">
      <Button variant="ghost" size="icon" aria-label={`Edit ${label}`} onClick={onEdit}>
        <Pencil className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        className="text-destructive"
        aria-label={`Delete ${label}`}
        onClick={onDelete}
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  );
}
