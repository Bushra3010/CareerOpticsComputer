import { useCallback, useEffect, useMemo, useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { PageHeader } from "@/components/ui/PageHeader";
import { StatsCard } from "@/components/ui/StatsCard";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CalendarClock, CheckCircle2, Download, Laptop, Pencil, Plus, School, Trash2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { downloadCsv } from "@/lib/export";
import {
  getBatches,
  getBatchesByOrg,
  getBatchTimings,
  createBatchTiming,
  updateBatchTiming,
  deleteBatchTiming,
  getCourses,
} from "@/lib/supabase/data";
import {
  CLASS_MODES,
  DAYS,
  DAY_SHORT,
  TIMING_COLOURS,
  formatRange,
  formatTime,
  groupIntoTimings,
  timingProblem,
  timingsOnDay,
  type ClassMode,
  type Day,
  type Timing,
  type TimingColour,
  type TimingRow,
} from "@/lib/batchSchedule";

interface BatchOption {
  id: string;
  name: string;
  code?: string;
  courseId?: string | null;
}

/* Tokens rather than raw palette values, so the grid reads in both themes. */
const COLOUR_STYLE: Record<TimingColour, string> = {
  blue: "border-l-info bg-info/8",
  green: "border-l-success bg-success/8",
  purple: "border-l-brand bg-brand/8",
  amber: "border-l-warning bg-warning/8",
  cyan: "border-l-info bg-info/12",
};

const blankDraft = () => ({
  batchId: "",
  subject: "",
  instructor: "",
  roomNo: "",
  startTime: "09:00",
  endTime: "11:00",
  breakStart: "",
  breakEnd: "",
  classMode: "Offline" as ClassMode,
  colour: "blue" as TimingColour,
  active: true,
  notes: "",
  days: [] as Day[],
});

export default function BatchTiming() {
  const { user } = useAuth();
  const { toast } = useToast();
  const branchId = user?.branchId || "";
  const orgId = user?.organizationId || null;

  const [batches, setBatches] = useState<BatchOption[]>([]);
  const [courses, setCourses] = useState<Array<{ id: string; name: string }>>([]);
  const [rows, setRows] = useState<TimingRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [search, setSearch] = useState("");
  const [courseFilter, setCourseFilter] = useState("all");
  const [batchFilter, setBatchFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [modeFilter, setModeFilter] = useState("all");

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Timing | null>(null);
  const [draft, setDraft] = useState(blankDraft);
  const [pendingDelete, setPendingDelete] = useState<Timing | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const batchResult = branchId ? await getBatches(branchId) : await getBatchesByOrg(orgId);
      const batchList = (batchResult.data ?? []) as unknown as BatchOption[];
      setBatches(batchList);

      const [timingResult, courseResult] = await Promise.all([
        getBatchTimings(branchId, branchId ? undefined : { batchIds: batchList.map((b) => b.id) }),
        getCourses(orgId, branchId || null),
      ]);
      setRows(timingResult.data as unknown as TimingRow[]);
      setCourses(courseResult.data as Array<{ id: string; name: string }>);
    } catch (error) {
      setRows([]);
      toast({
        title: "Could not load the timetable",
        description: error instanceof Error ? error.message : "Please try again",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [branchId, orgId, toast]);

  useEffect(() => {
    void load();
  }, [load]);

  const batchById = useMemo(() => new Map(batches.map((b) => [b.id, b])), [batches]);
  const courseNameFor = useCallback(
    (batchId: string) => {
      const courseId = batchById.get(batchId)?.courseId;
      return courses.find((c) => c.id === courseId)?.name ?? "";
    },
    [batchById, courses],
  );
  const batchNameFor = useCallback(
    (batchId: string) => batchById.get(batchId)?.name ?? "Unassigned batch",
    [batchById],
  );

  const allTimings = useMemo(() => groupIntoTimings(rows), [rows]);

  const timings = useMemo(() => {
    const q = search.trim().toLowerCase();
    return allTimings.filter((timing) => {
      if (courseFilter !== "all" && batchById.get(timing.batchId)?.courseId !== courseFilter) return false;
      if (batchFilter !== "all" && timing.batchId !== batchFilter) return false;
      if (statusFilter !== "all" && (statusFilter === "Active") !== timing.active) return false;
      if (modeFilter !== "all" && timing.classMode !== modeFilter) return false;
      if (!q) return true;
      return [
        batchNameFor(timing.batchId),
        courseNameFor(timing.batchId),
        timing.subject,
        timing.instructor,
        timing.roomNo,
        timing.classMode,
      ]
        .join(" ")
        .toLowerCase()
        .includes(q);
    });
  }, [allTimings, search, courseFilter, batchFilter, statusFilter, modeFilter, batchById, batchNameFor, courseNameFor]);

  const resetFilters = () => {
    setSearch("");
    setCourseFilter("all");
    setBatchFilter("all");
    setStatusFilter("all");
    setModeFilter("all");
  };

  const openAdd = () => {
    setEditing(null);
    setDraft({ ...blankDraft(), batchId: batches[0]?.id ?? "" });
    setDialogOpen(true);
  };

  const openEdit = (timing: Timing) => {
    setEditing(timing);
    setDraft({
      batchId: timing.batchId,
      subject: timing.subject,
      instructor: timing.instructor,
      roomNo: timing.roomNo,
      startTime: timing.startTime,
      endTime: timing.endTime,
      breakStart: timing.breakStart,
      breakEnd: timing.breakEnd,
      classMode: timing.classMode,
      colour: timing.colour,
      active: timing.active,
      notes: timing.notes,
      days: [...timing.days],
    });
    setDialogOpen(true);
  };

  const toggleDay = (day: Day) =>
    setDraft((d) => ({
      ...d,
      days: d.days.includes(day) ? d.days.filter((x) => x !== day) : [...d.days, day],
    }));

  /**
   * One timing is one row per day, so a save reconciles rather than replaces:
   * days that stayed are updated in place, days that were added are inserted,
   * days that were dropped are deleted. Deleting the lot and re-inserting would
   * be simpler and would throw away every id — and PostgREST has no transaction
   * to put them back if the re-insert failed halfway.
   */
  const save = async () => {
    const problem = timingProblem(draft);
    if (problem) {
      toast({ title: "Check the timing", description: problem, variant: "destructive" });
      return;
    }
    setSaving(true);
    try {
      const body = {
        batchId: draft.batchId,
        startTime: draft.startTime,
        endTime: draft.endTime,
        subject: draft.subject.trim(),
        instructor: draft.instructor.trim(),
        roomNo: draft.roomNo.trim(),
        classMode: draft.classMode,
        breakStart: draft.breakStart || null,
        breakEnd: draft.breakEnd || null,
        colour: draft.colour,
        description: draft.notes.trim(),
        status: draft.active ? "scheduled" : "Inactive",
      };

      const existing = editing
        ? rows.filter((row) => editing.ids.includes(row.id))
        : [];
      const keptFor = new Map(existing.map((row) => [String(row.day).toUpperCase(), row.id]));

      for (const day of draft.days) {
        const id = keptFor.get(day);
        if (id) await updateBatchTiming(id, { ...body, day });
        else await createBatchTiming({ ...body, day });
      }
      for (const [day, id] of keptFor) {
        if (!draft.days.includes(day as Day)) await deleteBatchTiming(id);
      }

      toast({
        title: editing ? "Timing updated" : "Timing added",
        description: `${draft.days.length} ${draft.days.length === 1 ? "day" : "days"} on ${batchNameFor(draft.batchId)}.`,
      });
      setDialogOpen(false);
      await load();
    } catch (error) {
      toast({
        title: "Could not save the timing",
        description: error instanceof Error ? error.message : "Please try again",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = async () => {
    if (!pendingDelete) return;
    try {
      for (const id of pendingDelete.ids) await deleteBatchTiming(id);
      toast({ title: "Timing removed", description: `${pendingDelete.subject || "The class"} is off the timetable.` });
      await load();
    } catch (error) {
      toast({
        title: "Could not remove the timing",
        description: error instanceof Error ? error.message : "Please try again",
        variant: "destructive",
      });
    } finally {
      setPendingDelete(null);
    }
  };

  const exportTimings = () => {
    if (!timings.length) {
      toast({ title: "Nothing to export", description: "No timings match these filters." });
      return;
    }
    downloadCsv(
      "batch-timings.csv",
      timings.map((timing) => ({
        Batch: batchNameFor(timing.batchId),
        Course: courseNameFor(timing.batchId),
        Class: timing.subject,
        Trainer: timing.instructor,
        Room: timing.roomNo,
        Mode: timing.classMode,
        Days: timing.days.map((d) => DAY_SHORT[d]).join(" "),
        Start: timing.startTime,
        End: timing.endTime,
        Break: [timing.breakStart, timing.breakEnd].filter(Boolean).join(" – "),
        Status: timing.active ? "Active" : "Inactive",
        Notes: timing.notes,
      })),
    );
    toast({ title: "Timetable exported", description: `${timings.length} rows written to CSV.` });
  };

  const selectClass = "h-10 w-full";

  return (
    <AppLayout>
      <PageHeader
        title="Batch Timing"
        description="Manage class timings, trainers, rooms and weekly schedules"
        breadcrumbs={[{ label: "Courses & Batches", href: "/course/view" }, { label: "Batch Timing" }]}
        actions={
          <div className="flex gap-2">
            <Button variant="outline" className="gap-2" onClick={exportTimings} disabled={!timings.length}>
              <Download className="h-4 w-4" />
              Export
            </Button>
            <Button className="gap-2" onClick={openAdd} disabled={!batches.length}>
              <Plus className="h-4 w-4" />
              Add New Timing
            </Button>
          </div>
        }
      />

      <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Total Timings"
          value={allTimings.length}
          subtitle="All scheduled classes"
          icon={CalendarClock}
          variant="primary"
        />
        <StatsCard
          title="Active Timings"
          value={allTimings.filter((t) => t.active).length}
          subtitle="Currently running"
          icon={CheckCircle2}
          variant="success"
        />
        <StatsCard
          title="Offline Classes"
          value={allTimings.filter((t) => t.classMode === "Offline").length}
          subtitle="Taught in the centre"
          icon={School}
          variant="warning"
        />
        <StatsCard
          title="Online Classes"
          value={allTimings.filter((t) => t.classMode !== "Offline").length}
          subtitle="Online and hybrid"
          icon={Laptop}
          variant="info"
        />
      </div>

      <Card className="mb-6">
        <CardContent className="grid gap-3 p-4 md:grid-cols-2 lg:grid-cols-6">
          <div className="lg:col-span-2">
            <Label className="mb-1.5 block text-xs">Search</Label>
            <Input
              className="h-10"
              placeholder="Batch, trainer, room…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div>
            <Label className="mb-1.5 block text-xs">Course</Label>
            <Select value={courseFilter} onValueChange={setCourseFilter}>
              <SelectTrigger className={selectClass}><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All courses</SelectItem>
                {courses.map((c) => (
                  <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="mb-1.5 block text-xs">Batch</Label>
            <Select value={batchFilter} onValueChange={setBatchFilter}>
              <SelectTrigger className={selectClass}><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All batches</SelectItem>
                {batches.map((b) => (
                  <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="mb-1.5 block text-xs">Mode</Label>
            <Select value={modeFilter} onValueChange={setModeFilter}>
              <SelectTrigger className={selectClass}><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All modes</SelectItem>
                {CLASS_MODES.map((mode) => (
                  <SelectItem key={mode} value={mode}>{mode}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-end gap-2">
            <div className="flex-1">
              <Label className="mb-1.5 block text-xs">Status</Label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className={selectClass}><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All status</SelectItem>
                  <SelectItem value="Active">Active</SelectItem>
                  <SelectItem value="Inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button variant="ghost" className="h-10" onClick={resetFilters}>Reset</Button>
          </div>
        </CardContent>
      </Card>

      <Card className="mb-6">
        <CardHeader className="flex-row items-center justify-between space-y-0">
          <div>
            <CardTitle>Weekly timetable</CardTitle>
            <p className="mt-1 text-xs text-muted-foreground">Monday to Saturday, as the week runs.</p>
          </div>
          <Badge variant="secondary">{timings.length} showing</Badge>
        </CardHeader>
        <CardContent className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {DAYS.map((day) => {
            const onDay = timingsOnDay(timings, day);
            return (
              <div key={day} className="rounded-xl border bg-muted/25 p-3">
                <div className="mb-3 flex items-center justify-between">
                  <h3 className="text-sm font-semibold">{DAY_SHORT[day]}</h3>
                  <span className="rounded-full bg-background px-2 py-0.5 text-[10px] font-semibold text-muted-foreground">
                    {onDay.length} {onDay.length === 1 ? "class" : "classes"}
                  </span>
                </div>
                {onDay.length === 0 ? (
                  <p className="py-5 text-center text-xs text-muted-foreground">No class</p>
                ) : (
                  <div className="space-y-2">
                    {onDay.map((timing) => (
                      <button
                        key={timing.key}
                        type="button"
                        onClick={() => openEdit(timing)}
                        className={`w-full rounded-lg border-l-4 p-2 text-left transition hover:brightness-95 ${COLOUR_STYLE[timing.colour]} ${timing.active ? "" : "opacity-60"}`}
                      >
                        <p className="truncate text-xs font-semibold">{batchNameFor(timing.batchId)}</p>
                        <p className="mt-1 text-[11px] font-medium">
                          {formatRange(timing.startTime, timing.endTime)}
                        </p>
                        <p className="mt-0.5 truncate text-[10px] text-muted-foreground">
                          {timing.instructor || "No trainer set"}
                        </p>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex-row items-center justify-between space-y-0">
          <div>
            <CardTitle>All batch timings</CardTitle>
            <p className="mt-1 text-xs text-muted-foreground">Every timing, managed from one place.</p>
          </div>
          <Badge variant="secondary">{timings.length} records</Badge>
        </CardHeader>
        <CardContent className="grid gap-4 lg:grid-cols-2">
          {loading && <p className="py-10 text-center text-sm text-muted-foreground">Loading the timetable…</p>}
          {!loading && timings.length === 0 && (
            <div className="col-span-full rounded-xl border border-dashed py-12 text-center">
              <p className="font-semibold">No timings found</p>
              <p className="mt-1 text-sm text-muted-foreground">
                {allTimings.length
                  ? "Try changing the filters."
                  : batches.length
                    ? "Use “Add New Timing” to put a class on the timetable."
                    : "Create a batch first — a timing hangs off one."}
              </p>
            </div>
          )}
          {timings.map((timing) => (
            <article key={timing.key} className={`rounded-xl border border-l-4 p-4 ${COLOUR_STYLE[timing.colour]}`}>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="mb-2 flex flex-wrap items-center gap-2">
                    {courseNameFor(timing.batchId) && (
                      <Badge variant="outline">{courseNameFor(timing.batchId)}</Badge>
                    )}
                    <Badge variant={timing.active ? "default" : "secondary"}>
                      {timing.active ? "Active" : "Inactive"}
                    </Badge>
                    <Badge variant="secondary">{timing.classMode}</Badge>
                  </div>
                  <h3 className="font-semibold">{timing.subject || batchNameFor(timing.batchId)}</h3>
                  <p className="mt-0.5 text-xs text-muted-foreground">{batchNameFor(timing.batchId)}</p>
                </div>
                <div className="flex shrink-0 gap-1">
                  <Button variant="outline" size="icon" className="h-8 w-8" aria-label={`Edit ${timing.subject || "timing"}`} onClick={() => openEdit(timing)}>
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8 text-muted-foreground hover:text-destructive"
                    aria-label={`Delete ${timing.subject || "timing"}`}
                    onClick={() => setPendingDelete(timing)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <dl className="mt-4 grid gap-3 sm:grid-cols-2">
                <div className="rounded-lg bg-background/70 p-3">
                  <dt className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Class timing</dt>
                  <dd className="mt-1 text-sm font-semibold">{formatRange(timing.startTime, timing.endTime)}</dd>
                  {timing.breakStart && timing.breakEnd && (
                    <dd className="mt-0.5 text-[11px] text-muted-foreground">
                      Break {formatRange(timing.breakStart, timing.breakEnd)}
                    </dd>
                  )}
                </div>
                <div className="rounded-lg bg-background/70 p-3">
                  <dt className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Class days</dt>
                  <dd className="mt-1 text-sm font-semibold">
                    {timing.days.map((d) => DAY_SHORT[d]).join(", ")}
                  </dd>
                </div>
                <div className="rounded-lg bg-background/70 p-3">
                  <dt className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Trainer</dt>
                  <dd className="mt-1 text-xs font-semibold">{timing.instructor || "Not assigned"}</dd>
                </div>
                <div className="rounded-lg bg-background/70 p-3">
                  <dt className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Room / mode</dt>
                  <dd className="mt-1 text-xs font-semibold">
                    {timing.roomNo || "Not assigned"} · {timing.classMode}
                  </dd>
                </div>
              </dl>

              {timing.notes && (
                <p className="mt-3 rounded-lg border bg-background/70 p-3 text-xs">{timing.notes}</p>
              )}
            </article>
          ))}
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-h-[92vh] max-w-3xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editing ? "Edit batch timing" : "Add new timing"}</DialogTitle>
            <DialogDescription>
              One timing covers every day the class runs on — pick them all below.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Batch *</Label>
              <Select value={draft.batchId} onValueChange={(v) => setDraft((d) => ({ ...d, batchId: v }))}>
                <SelectTrigger><SelectValue placeholder="Select batch" /></SelectTrigger>
                <SelectContent>
                  {batches.map((b) => (
                    <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Class / subject</Label>
              <Input
                placeholder="e.g. Trade theory"
                value={draft.subject}
                onChange={(e) => setDraft((d) => ({ ...d, subject: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label>Trainer / faculty</Label>
              <Input
                value={draft.instructor}
                onChange={(e) => setDraft((d) => ({ ...d, instructor: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label>Room / class number</Label>
              <Input
                placeholder="e.g. Lab-01"
                value={draft.roomNo}
                onChange={(e) => setDraft((d) => ({ ...d, roomNo: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="startTime">Start time *</Label>
              <Input
                id="startTime"
                type="time"
                value={draft.startTime}
                onChange={(e) => setDraft((d) => ({ ...d, startTime: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="endTime">End time *</Label>
              <Input
                id="endTime"
                type="time"
                value={draft.endTime}
                onChange={(e) => setDraft((d) => ({ ...d, endTime: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="breakStart">Break start</Label>
              <Input
                id="breakStart"
                type="time"
                value={draft.breakStart}
                onChange={(e) => setDraft((d) => ({ ...d, breakStart: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="breakEnd">Break end</Label>
              <Input
                id="breakEnd"
                type="time"
                value={draft.breakEnd}
                onChange={(e) => setDraft((d) => ({ ...d, breakEnd: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label>Class mode</Label>
              <Select
                value={draft.classMode}
                onValueChange={(v) => setDraft((d) => ({ ...d, classMode: v as ClassMode }))}
              >
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {CLASS_MODES.map((mode) => (
                    <SelectItem key={mode} value={mode}>{mode}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Status</Label>
              <Select
                value={draft.active ? "Active" : "Inactive"}
                onValueChange={(v) => setDraft((d) => ({ ...d, active: v === "Active" }))}
              >
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Active">Active</SelectItem>
                  <SelectItem value="Inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Colour on the grid</Label>
              <Select
                value={draft.colour}
                onValueChange={(v) => setDraft((d) => ({ ...d, colour: v as TimingColour }))}
              >
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {TIMING_COLOURS.map((colour) => (
                    <SelectItem key={colour} value={colour} className="capitalize">{colour}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2 sm:col-span-2">
              <Label>Class days *</Label>
              <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">
                {DAYS.map((day) => {
                  const on = draft.days.includes(day);
                  return (
                    <Button
                      key={day}
                      type="button"
                      variant={on ? "default" : "outline"}
                      aria-pressed={on}
                      onClick={() => toggleDay(day)}
                    >
                      {DAY_SHORT[day]}
                    </Button>
                  );
                })}
              </div>
            </div>

            <div className="space-y-2 sm:col-span-2">
              <Label>Notes</Label>
              <Textarea
                rows={3}
                placeholder="Any instruction for this class…"
                value={draft.notes}
                onChange={(e) => setDraft((d) => ({ ...d, notes: e.target.value }))}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={save} disabled={saving}>
              {saving ? "Saving…" : "Save timing"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!pendingDelete} onOpenChange={(open) => !open && setPendingDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove this timing?</AlertDialogTitle>
            <AlertDialogDescription>
              {pendingDelete
                ? `${pendingDelete.subject || "The class"} comes off ${pendingDelete.days.length} ${pendingDelete.days.length === 1 ? "day" : "days"} of the timetable. Attendance already marked against it is untouched.`
                : ""}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete}>Remove</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AppLayout>
  );
}
