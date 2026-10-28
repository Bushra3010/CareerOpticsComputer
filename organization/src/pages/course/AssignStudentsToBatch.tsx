import { useCallback, useEffect, useMemo, useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { PageHeader } from "@/components/ui/PageHeader";
import { StatsCard } from "@/components/ui/StatsCard";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { CheckCircle2, Clock, Download, Search, UserPlus, Users, X } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { downloadCsv } from "@/lib/export";
import { formatPhone } from "@/lib/phone";
import {
  assignmentProblem,
  eligibility,
  enrolledCourses,
  movingFrom,
  placementOf,
  seatsLeft,
  type AssignableStudent,
} from "@/lib/batchAssignment";
import { DAY_SHORT, formatRange, groupIntoTimings, type TimingRow } from "@/lib/batchSchedule";
import {
  getBatches,
  getBatchesByOrg,
  getBatchTimings,
  getCourses,
  updateStudent,
} from "@/lib/supabase/data";
import { listStudents, studentCode, studentName } from "@/lib/supabase/studentFee";

interface BatchOption {
  id: string;
  name: string;
  code?: string;
  courseId?: string | null;
  branchId?: string | null;
  maxStudents?: number;
  currentStudents?: number;
  instructor?: string;
}

const initials = (name: string) =>
  name.split(" ").filter(Boolean).map((part) => part[0]).slice(0, 2).join("").toUpperCase() || "ST";

export default function AssignStudentsToBatch() {
  const { user } = useAuth();
  const { toast } = useToast();
  const branchId = user?.branchId || null;
  const orgId = user?.organizationId || null;

  const [batches, setBatches] = useState<BatchOption[]>([]);
  const [courses, setCourses] = useState<Array<{ id: string; name: string }>>([]);
  const [students, setStudents] = useState<AssignableStudent[]>([]);
  const [timings, setTimings] = useState<TimingRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [assigning, setAssigning] = useState(false);

  const [courseId, setCourseId] = useState("all");
  const [batchId, setBatchId] = useState("");
  const [search, setSearch] = useState("");
  const [placement, setPlacement] = useState("Unassigned");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [confirming, setConfirming] = useState(false);
  const [removing, setRemoving] = useState<AssignableStudent | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const batchResult = branchId ? await getBatches(branchId) : await getBatchesByOrg(orgId);
      const batchList = (batchResult.data ?? []) as unknown as BatchOption[];
      const [studentResult, courseResult, timingResult] = await Promise.all([
        listStudents(branchId, 500),
        getCourses(orgId, branchId),
        getBatchTimings(branchId || "", branchId ? undefined : { batchIds: batchList.map((b) => b.id) }),
      ]);
      setBatches(batchList);
      setCourses(courseResult.data as Array<{ id: string; name: string }>);
      setTimings(timingResult.data as unknown as TimingRow[]);
      setStudents(
        (studentResult.data ?? []).map((row): AssignableStudent => ({
          id: String(row.id),
          name: studentName(row as never, "Unnamed student"),
          code: studentCode(row),
          phone: String(row.phone ?? ""),
          batchId: String(row.batchId ?? ""),
          courseId: String(row.courseId ?? ""),
          courseIds: Array.isArray(row.courseIds) ? (row.courseIds as unknown[]).map(String) : [],
          branchId: String(row.branchId ?? ""),
        })),
      );
    } catch (error) {
      toast({
        title: "Could not load students",
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

  const batchesForCourse = useMemo(
    () => (courseId === "all" ? batches : batches.filter((b) => b.courseId === courseId)),
    [batches, courseId],
  );

  // A batch that the course filter has just excluded must not stay selected,
  // or the summary would describe one batch while the list narrows another.
  useEffect(() => {
    if (batchId && !batchesForCourse.some((b) => b.id === batchId)) setBatchId("");
  }, [batchesForCourse, batchId]);

  const batch = batches.find((b) => b.id === batchId);
  const assigned = useMemo(
    () => students.filter((student) => batchId && student.batchId === batchId),
    [students, batchId],
  );
  const free = seatsLeft(batch?.maxStudents, assigned.length);

  /** The batch's weekly slot, for the summary strip. */
  const batchTiming = useMemo(() => {
    if (!batchId) return null;
    const grouped = groupIntoTimings(timings.filter((row) => row.batchId === batchId));
    return grouped[0] ?? null;
  }, [timings, batchId]);

  const candidates = useMemo(() => {
    const q = search.trim().toLowerCase();
    const digits = q.replace(/\D/g, "");
    return students.filter((student) => {
      if (student.batchId === batchId && batchId) return false;
      // Once a batch is picked, only those who may join it are offered.
      if (batch && eligibility(student, batch)) return false;
      if (courseId !== "all" && !enrolledCourses(student).includes(courseId)) return false;
      const where = placementOf(student, batchId);
      if (placement !== "All" && where !== placement) return false;
      if (!q) return true;
      const haystack = `${student.name} ${student.code} ${student.phone}`.toLowerCase();
      return haystack.includes(q) || (digits.length >= 4 && haystack.includes(digits));
    });
  }, [students, batch, batchId, courseId, placement, search]);

  const selected = useMemo(
    () => students.filter((student) => selectedIds.includes(student.id)),
    [students, selectedIds],
  );

  const batchName = (id: string) => batches.find((b) => b.id === id)?.name ?? "another batch";
  const allShownSelected = candidates.length > 0 && candidates.every((s) => selectedIds.includes(s.id));

  const toggleAll = () =>
    setSelectedIds((prev) =>
      allShownSelected
        ? prev.filter((id) => !candidates.some((s) => s.id === id))
        : [...new Set([...prev, ...candidates.map((s) => s.id)])],
    );

  const startAssign = () => {
    const problem = assignmentProblem({
      batchId,
      selected,
      capacity: batch?.maxStudents,
      taken: assigned.length,
      batch,
    });
    if (problem) {
      toast({ title: "Cannot assign yet", description: problem, variant: "destructive" });
      return;
    }
    setConfirming(true);
  };

  const assign = async () => {
    setConfirming(false);
    setAssigning(true);
    let done = 0;
    const failures: string[] = [];
    try {
      for (const student of selected) {
        try {
          await updateStudent(student.id, branchId, { batchId });
          done += 1;
        } catch (error) {
          failures.push(`${student.name}: ${error instanceof Error ? error.message : "failed"}`);
        }
      }
      toast({
        // Reported per student rather than as one success: a partial failure
        // here means some of them are in the batch and some are not.
        title: failures.length ? `Assigned ${done} of ${selected.length}` : "Students assigned",
        description: failures.length
          ? failures.slice(0, 2).join(" · ")
          : `${done} ${done === 1 ? "student is" : "students are"} now in ${batch?.name ?? "the batch"}.`,
        variant: failures.length ? "destructive" : "default",
      });
      setSelectedIds([]);
      await load();
    } finally {
      setAssigning(false);
    }
  };

  const confirmRemove = async () => {
    if (!removing) return;
    const student = removing;
    setRemoving(null);
    try {
      await updateStudent(student.id, branchId, { batchId: null });
      toast({ title: "Removed from batch", description: `${student.name} is unassigned again.` });
      await load();
    } catch (error) {
      toast({
        title: "Could not remove",
        description: error instanceof Error ? error.message : "Please try again",
        variant: "destructive",
      });
    }
  };

  const exportAssigned = () => {
    if (!assigned.length) {
      toast({ title: "Nothing to export", description: "No students in this batch yet." });
      return;
    }
    downloadCsv(
      "assigned-students.csv",
      assigned.map((student) => ({
        StudentID: student.code,
        Student: student.name,
        Mobile: student.phone,
        Course: courses.find((c) => c.id === student.courseId)?.name ?? "",
        Batch: batch?.name ?? "",
        Status: "Assigned",
      })),
    );
    toast({ title: "Exported", description: `${assigned.length} rows written to CSV.` });
  };

  const moving = movingFrom(selected, batchId);
  const capacityPercent = batch?.maxStudents
    ? Math.min(100, Math.round(((assigned.length + moving.length + selected.filter((s) => !s.batchId).length) / batch.maxStudents) * 100))
    : 0;

  return (
    <AppLayout>
      <PageHeader
        title="Assign Students to Batch"
        description="Select students and assign them to a particular course batch"
        breadcrumbs={[{ label: "Courses & Batches", href: "/course/view" }, { label: "Assign Students" }]}
        actions={
          <Button variant="outline" className="gap-2" onClick={() => setSelectedIds([])} disabled={!selectedIds.length}>
            <X className="h-4 w-4" />
            Clear selection
          </Button>
        }
      />

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Batch information</CardTitle>
          <p className="text-xs text-muted-foreground">Choose where these students are going.</p>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>Course</Label>
              <Select value={courseId} onValueChange={setCourseId}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All courses</SelectItem>
                  {courses.map((c) => (
                    <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Batch *</Label>
              <Select value={batchId} onValueChange={setBatchId}>
                <SelectTrigger>
                  <SelectValue placeholder={batchesForCourse.length ? "Select batch" : "No batch on this course"} />
                </SelectTrigger>
                <SelectContent>
                  {batchesForCourse.map((b) => (
                    <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid gap-3 rounded-xl border bg-muted/30 p-4 sm:grid-cols-2 xl:grid-cols-4">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Batch code</p>
              <p className="mt-1 text-sm font-semibold">{batch?.code || "—"}</p>
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Batch timing</p>
              <p className="mt-1 text-sm font-semibold">
                {batchTiming ? formatRange(batchTiming.startTime, batchTiming.endTime) : "Not scheduled"}
              </p>
              {batchTiming && (
                <p className="text-[11px] text-muted-foreground">
                  {batchTiming.days.map((d) => DAY_SHORT[d]).join(", ")}
                </p>
              )}
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Current students</p>
              <p className="mt-1 text-sm font-semibold">{batchId ? assigned.length : "—"}</p>
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Capacity</p>
              <p className="mt-1 text-sm font-semibold">
                {batch?.maxStudents ? `${batch.maxStudents} seats` : batchId ? "No limit set" : "—"}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatsCard title="Students on roll" value={students.length} subtitle="In this workspace" icon={Users} variant="info" />
        <StatsCard title="Already in batch" value={batchId ? assigned.length : 0} subtitle={batch?.name ?? "No batch chosen"} icon={CheckCircle2} variant="success" />
        <StatsCard
          title="Seats left"
          value={free === null ? "∞" : free}
          subtitle={batch?.maxStudents ? "Before the batch is full" : "No limit set"}
          icon={Clock}
          variant="warning"
        />
        <StatsCard title="Selected" value={selected.length} subtitle="Ready to assign" icon={UserPlus} variant="primary" />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.6fr_1fr]">
        <Card className="min-w-0">
          <CardHeader className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <CardTitle>Select students</CardTitle>
                <p className="mt-1 text-xs text-muted-foreground">
                  Students already in this batch are not listed — they are below.
                </p>
              </div>
              <Button variant="outline" size="sm" onClick={toggleAll} disabled={!candidates.length}>
                {allShownSelected ? "Clear these" : "Select all shown"}
              </Button>
            </div>
            <div className="grid gap-3 sm:grid-cols-[1fr_200px]">
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  className="h-10 pl-9"
                  placeholder="Search name, mobile or student ID…"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              <Select value={placement} onValueChange={setPlacement}>
                <SelectTrigger className="h-10"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Unassigned">Not in any batch</SelectItem>
                  <SelectItem value="In another batch">In another batch</SelectItem>
                  <SelectItem value="All">Everyone</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[620px] text-sm">
                <thead className="border-y bg-muted/40 text-left text-xs text-muted-foreground">
                  <tr>
                    <th className="w-12 px-4 py-3"><span className="sr-only">Select</span></th>
                    <th className="px-3 py-3 font-medium">Student</th>
                    <th className="px-3 py-3 font-medium">Student ID</th>
                    <th className="px-3 py-3 font-medium">Mobile</th>
                    <th className="px-3 py-3 font-medium">Placement</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {candidates.map((student) => {
                    const where = placementOf(student, batchId);
                    const checked = selectedIds.includes(student.id);
                    return (
                      <tr key={student.id} className={checked ? "bg-brand/5" : "hover:bg-muted/30"}>
                        <td className="px-4 py-3">
                          <Checkbox
                            className="rounded-[3px]"
                            checked={checked}
                            aria-label={`Select ${student.name}`}
                            onCheckedChange={(on) =>
                              setSelectedIds((prev) =>
                                on ? [...prev, student.id] : prev.filter((id) => id !== student.id),
                              )
                            }
                          />
                        </td>
                        <td className="px-3 py-3">
                          <div className="flex items-center gap-3">
                            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-brand/12 text-xs font-semibold text-brand-ink">
                              {initials(student.name)}
                            </span>
                            <p className="font-medium">{student.name}</p>
                          </div>
                        </td>
                        <td className="px-3 py-3 text-xs font-semibold text-muted-foreground">{student.code}</td>
                        <td className="px-3 py-3 text-xs text-muted-foreground">
                          {student.phone ? formatPhone(student.phone) : "—"}
                        </td>
                        <td className="px-3 py-3">
                          {/* Named, not implied: assigning someone who is placed
                              moves them out of that batch. */}
                          {where === "In another batch" ? (
                            <Badge variant="outline" className="text-warning">
                              {batchName(student.batchId)}
                            </Badge>
                          ) : (
                            <Badge variant="secondary">Unassigned</Badge>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                  {!candidates.length && (
                    <tr>
                      <td colSpan={5} className="px-4 py-12 text-center text-sm text-muted-foreground">
                        {loading
                          ? "Loading students…"
                          : !batchId
                            ? "Choose a batch to start assigning."
                            : "No students match this search."}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            <p className="border-t px-4 py-3 text-xs text-muted-foreground">
              Showing {candidates.length} of {students.length} students
            </p>
          </CardContent>
        </Card>

        <Card className="min-w-0">
          <CardHeader className="flex-row items-center justify-between space-y-0">
            <div>
              <CardTitle>Selected students</CardTitle>
              <p className="mt-1 text-xs text-muted-foreground">Ready for assignment.</p>
            </div>
            <Badge>{selected.length}</Badge>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="max-h-[360px] space-y-2 overflow-y-auto">
              {selected.length === 0 ? (
                <div className="rounded-xl border border-dashed p-8 text-center">
                  <Users className="mx-auto h-8 w-8 text-muted-foreground" />
                  <p className="mt-3 text-sm font-semibold">No students selected</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Tick students on the left to prepare the assignment.
                  </p>
                </div>
              ) : (
                selected.map((student) => (
                  <div key={student.id} className="flex items-center gap-3 rounded-xl border bg-muted/30 p-3">
                    <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-brand/12 text-xs font-semibold text-brand-ink">
                      {initials(student.name)}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold">{student.name}</p>
                      <p className="text-[11px] text-muted-foreground">{student.code}</p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-muted-foreground hover:text-destructive"
                      aria-label={`Remove ${student.name} from the selection`}
                      onClick={() => setSelectedIds((prev) => prev.filter((id) => id !== student.id))}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))
              )}
            </div>

            {batch?.maxStudents ? (
              <div className="rounded-xl bg-muted/40 p-4">
                <div className="flex items-center justify-between text-xs font-semibold">
                  <span className="text-muted-foreground">After this assignment</span>
                  <span className="text-brand-ink">
                    {assigned.length + moving.length + selected.filter((s) => !s.batchId).length} / {batch.maxStudents}
                  </span>
                </div>
                <div className="mt-3 h-2 overflow-hidden rounded-full bg-muted">
                  <div
                    className={`h-full rounded-full transition-all ${capacityPercent >= 100 ? "bg-destructive" : "bg-brand"}`}
                    style={{ width: `${capacityPercent}%` }}
                  />
                </div>
              </div>
            ) : null}

            <Button className="w-full" onClick={startAssign} disabled={assigning || !selected.length}>
              {assigning ? "Assigning…" : "Assign students to batch"}
            </Button>
          </CardContent>
        </Card>
      </div>

      <Card className="mt-6">
        <CardHeader className="flex-row items-center justify-between space-y-0">
          <div>
            <CardTitle>Assigned students</CardTitle>
            <p className="mt-1 text-xs text-muted-foreground">
              {batch ? `Already in ${batch.name}.` : "Choose a batch to see who is in it."}
            </p>
          </div>
          <Button variant="outline" size="sm" className="gap-2" onClick={exportAssigned} disabled={!assigned.length}>
            <Download className="h-4 w-4" />
            Export CSV
          </Button>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-sm">
              <thead className="border-y bg-muted/40 text-left text-xs text-muted-foreground">
                <tr>
                  <th className="px-4 py-3 font-medium">Student</th>
                  <th className="px-3 py-3 font-medium">Student ID</th>
                  <th className="px-3 py-3 font-medium">Course</th>
                  <th className="px-3 py-3 font-medium">Mobile</th>
                  <th className="px-3 py-3 text-right font-medium">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {assigned.map((student) => (
                  <tr key={student.id} className="hover:bg-muted/30">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-success/12 text-xs font-semibold text-success">
                          {initials(student.name)}
                        </span>
                        <p className="font-medium">{student.name}</p>
                      </div>
                    </td>
                    <td className="px-3 py-3 text-xs font-semibold text-muted-foreground">{student.code}</td>
                    <td className="px-3 py-3 text-xs">
                      {courses.find((c) => c.id === student.courseId)?.name ?? "—"}
                    </td>
                    <td className="px-3 py-3 text-xs text-muted-foreground">
                      {student.phone ? formatPhone(student.phone) : "—"}
                    </td>
                    <td className="px-3 py-3 text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-destructive"
                        onClick={() => setRemoving(student)}
                      >
                        Remove
                      </Button>
                    </td>
                  </tr>
                ))}
                {!assigned.length && (
                  <tr>
                    <td colSpan={5} className="px-4 py-12 text-center text-sm text-muted-foreground">
                      {batchId ? "Nobody is in this batch yet." : "Choose a batch above."}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <AlertDialog open={confirming} onOpenChange={setConfirming}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Assign {selected.length} {selected.length === 1 ? "student" : "students"} to {batch?.name}?
            </AlertDialogTitle>
            <AlertDialogDescription>
              {moving.length > 0
                ? `${moving.length} of them ${moving.length === 1 ? "is" : "are"} currently in another batch and will be moved out of it: ${moving.map((s) => s.name).join(", ")}.`
                : "None of them is in another batch, so nothing is moved."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={assign}>Assign</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={!!removing} onOpenChange={(open) => !open && setRemoving(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove {removing?.name} from {batch?.name}?</AlertDialogTitle>
            <AlertDialogDescription>
              They stay on the roll and keep their admission, fees and results — they are just
              no longer in this batch.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmRemove}>Remove</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AppLayout>
  );
}
