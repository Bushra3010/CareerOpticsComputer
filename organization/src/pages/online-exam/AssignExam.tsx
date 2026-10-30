import { useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";
import { PageHeader } from "@/components/ui/PageHeader";
import { DataTable, type Column } from "@/components/ui/DataTable";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { PHASE_LABELS, examPhase, whenShown, type OnlineExam } from "@/lib/onlineExam";
import { assignExam, getExamAssignments, getOnlineExams, removeExamAssignment, type ExamAssignment } from "@/lib/supabase/onlineExams";
import { matchesSearch } from "@/lib/search";
import { studentName, useExamData } from "../exam/useExamData";

const shown = (iso: string) => (iso ? new Date(iso).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "—");

/**
 * Who sits which online exam: the head office gives an exam to a whole
 * centre (every student, or one course's), or to named students. A centre
 * may put its own students on an exam the head office has given it.
 */
export default function AssignExam() {
  const { toast } = useToast();
  const [params] = useSearchParams();
  const { user, isAdmin, ownBranch, branches, courses, students, courseOf, branchOf, studentOf } = useExamData();
  const [exams, setExams] = useState<OnlineExam[]>([]);
  const [assignments, setAssignments] = useState<ExamAssignment[]>([]);
  const [examId, setExamId] = useState(params.get("exam") || "");
  const [branchId, setBranchId] = useState("");
  const [mode, setMode] = useState<"all" | "selected">(isAdmin ? "all" : "selected");
  const [courseId, setCourseId] = useState("");
  const [query, setQuery] = useState("");
  const [picked, setPicked] = useState<Set<string>>(new Set());
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (ownBranch) {
      setBranchId(ownBranch);
      setMode("selected");
    }
  }, [ownBranch]);

  const load = useCallback(async () => {
    try {
      const [e, a] = await Promise.all([getOnlineExams(), getExamAssignments(ownBranch)]);
      setExams(e);
      setAssignments(a);
    } catch (e) {
      toast({ title: "Could not load assignments", description: e instanceof Error ? e.message : "", variant: "destructive" });
    }
  }, [ownBranch, toast]);
  useEffect(() => {
    void load();
  }, [load]);

  const exam = exams.find((e) => e.id === examId) || null;
  // An exam set for one course offers that course's students first.
  useEffect(() => {
    if (exam?.courseId) setCourseId(exam.courseId);
  }, [exam?.courseId]);

  const needle = query.trim().toLowerCase();
  const candidates = useMemo(
    () =>
      students.filter(
        (s) =>
          (!branchId || s.branchId === branchId) &&
          (!courseId || s.courseId === courseId) &&
          matchesSearch(`${studentName(s)} ${s.enrollmentNo || ""} ${s.applicationNo || ""}`, needle),
      ),
    [students, branchId, courseId, needle],
  );
  const alreadyOn = (sid: string) => assignments.some((a) => a.examId === examId && a.studentId === sid);
  const centreWide = (bid: string) => assignments.filter((a) => a.examId === examId && a.branchId === bid && !a.studentId);

  const toggle = (sid: string, on: boolean) =>
    setPicked((prev) => {
      const next = new Set(prev);
      if (on) next.add(sid);
      else next.delete(sid);
      return next;
    });
  const toggleAll = (on: boolean) => setPicked(on ? new Set(candidates.map((s) => s.id)) : new Set());

  const assign = async () => {
    setBusy(true);
    try {
      const added = await assignExam(
        { examId, branchId, studentIds: mode === "selected" ? [...picked] : null, courseId: mode === "all" ? courseId || null : null },
        user?.name,
      );
      toast({
        title: added ? "Exam assigned" : "Already assigned",
        description: added
          ? mode === "selected"
            ? `${added} student(s) put on ${exam?.title || "the exam"}.`
            : `${courseId ? `${courseOf.get(courseId)?.name || "The course"}'s students` : "Every student"} of ${branchOf.get(branchId)?.name || "the centre"} may sit ${exam?.title || "the exam"}.`
          : "Everyone chosen was already on this exam.",
      });
      setPicked(new Set());
      await load();
    } catch (e) {
      toast({ title: "Could not assign the exam", description: e instanceof Error ? e.message : "", variant: "destructive" });
    } finally {
      setBusy(false);
    }
  };

  const remove = async (a: ExamAssignment) => {
    if (!window.confirm("Remove this assignment? Sittings already made are kept.")) return;
    try {
      await removeExamAssignment(a.id);
      await load();
    } catch (e) {
      toast({ title: "Could not remove", description: e instanceof Error ? e.message : "", variant: "destructive" });
    }
  };

  type Row = ExamAssignment & { examTitle: string; centre: string; who: string; kind: string; by: string };
  const rows: Row[] = assignments.map((a) => {
    const st = a.studentId ? studentOf.get(a.studentId) : null;
    return {
      ...a,
      examTitle: exams.find((e) => e.id === a.examId)?.title || "—",
      centre: branchOf.get(a.branchId)?.name || "—",
      who: a.studentId
        ? `${studentName(st) || "Student"}${st?.enrollmentNo ? ` · ${st.enrollmentNo}` : ""}`
        : a.courseId
          ? `All students of ${courseOf.get(a.courseId)?.name || "the course"}`
          : "All students of the centre",
      kind: a.studentId ? "Student" : "Centre",
      by: a.assignedBy || "—",
    };
  });
  const columns: Column<Row>[] = [
    { key: "examTitle", header: "Exam", sortable: true, cell: (r) => <span className="font-medium">{r.examTitle}</span> },
    { key: "centre", header: "Centre", sortable: true },
    { key: "who", header: "Assigned to", cell: (r) => <span>{r.who} <Badge variant="outline" className="ml-1">{r.kind}</Badge></span> },
    { key: "assignedAt", header: "Assigned on", sortable: true, cell: (r) => shown(r.assignedAt) },
    { key: "by", header: "By" },
  ];

  const canAssign = !!examId && !!branchId && !busy && (mode === "all" || picked.size > 0);

  return (
    <AppLayout>
      <PageHeader
        title="Assign Exam"
        description="Give an online exam to a centre's students, or to particular students"
        breadcrumbs={[{ label: "Online Exam" }, { label: "Assign Exam" }]}
      />
      <Card className="mb-4">
        <CardHeader><CardTitle>Assign an exam</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="space-y-2 lg:col-span-2">
              <Label>Exam</Label>
              <Select value={examId} onValueChange={setExamId}>
                <SelectTrigger aria-label="Exam"><SelectValue placeholder={exams.length ? "Select exam" : "No exams yet"} /></SelectTrigger>
                <SelectContent>
                  {exams.map((e) => (
                    <SelectItem key={e.id} value={e.id}>{e.title} · {PHASE_LABELS[examPhase(e)]}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Centre</Label>
              <Select value={branchId} onValueChange={(v) => { setBranchId(v); setPicked(new Set()); }} disabled={!!ownBranch}>
                <SelectTrigger aria-label="Centre"><SelectValue placeholder="Select centre" /></SelectTrigger>
                <SelectContent searchable searchPlaceholder="Search centre…">{branches.map((b) => <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Course</Label>
              <Select value={courseId || "all"} onValueChange={(v) => { setCourseId(v === "all" ? "" : v); setPicked(new Set()); }}>
                <SelectTrigger aria-label="Course"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All courses</SelectItem>
                  {courses.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>
          {exam && (
            <p className="text-sm text-muted-foreground">
              {exam.title}: {exam.durationMinutes} min · {exam.questions.length} question(s) · window {exam.startAt || exam.endAt ? `${whenShown(exam.startAt)} → ${whenShown(exam.endAt)}` : "any time"} · {PHASE_LABELS[examPhase(exam)]}
            </p>
          )}

          {isAdmin && (
            <RadioGroup value={mode} onValueChange={(v) => setMode(v as "all" | "selected")} className="flex flex-wrap gap-6">
              <label className="flex items-center gap-2 text-sm"><RadioGroupItem value="all" aria-label="Every student of the centre" /> Every student of the centre{courseId ? ` on ${courseOf.get(courseId)?.name || "this course"}` : ""}</label>
              <label className="flex items-center gap-2 text-sm"><RadioGroupItem value="selected" aria-label="Selected students" /> Selected students</label>
            </RadioGroup>
          )}
          {!isAdmin && exam && branchId && !centreWide(branchId).length && (
            <p className="text-sm text-destructive">The head office has not given this exam to your centre yet, so students cannot be put on it here.</p>
          )}

          {mode === "selected" && branchId && (
            <div className="space-y-2 rounded-xl border p-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <label className="flex items-center gap-2 text-sm font-medium">
                  <Checkbox checked={candidates.length > 0 && candidates.every((s) => picked.has(s.id))} onCheckedChange={(v) => toggleAll(v === true)} aria-label="Select all students shown" />
                  Select all shown ({candidates.length})
                </label>
                <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search name or enrollment…" aria-label="Search students" className="sm:w-64" />
              </div>
              <div className="grid max-h-72 gap-1 overflow-y-auto sm:grid-cols-2 lg:grid-cols-3">
                {candidates.map((s) => (
                  <label key={s.id} className="flex items-center gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-muted/60">
                    <Checkbox checked={picked.has(s.id)} onCheckedChange={(v) => toggle(s.id, v === true)} aria-label={studentName(s)} />
                    <span className="min-w-0 flex-1 truncate">{studentName(s)}{(s.enrollmentNo || s.applicationNo) ? <span className="text-xs text-muted-foreground"> · {(s.enrollmentNo || s.applicationNo)}</span> : null}</span>
                    {examId && alreadyOn(s.id) && <Badge variant="secondary" className="text-[10px]">on exam</Badge>}
                  </label>
                ))}
                {!candidates.length && <p className="p-3 text-sm text-muted-foreground">No students match.</p>}
              </div>
            </div>
          )}

          <Button onClick={assign} disabled={!canAssign}>{busy ? "Assigning…" : mode === "selected" ? `Assign to ${picked.size} student(s)` : "Assign to the centre"}</Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Assignments <Badge variant="secondary" className="ml-2">{rows.length}</Badge></CardTitle></CardHeader>
        <CardContent>
          <DataTable
            data={rows}
            columns={columns}
            searchPlaceholder="Search exam, centre, student…"
            filters={[{ label: "Exam", key: "examTitle" }, { label: "Centre", key: "centre" }, { label: "Type", key: "kind" }]}
            actions={(r) => [{ label: "Remove", onClick: () => void remove(r), destructive: true }]}
            emptyMessage="No exam has been assigned yet."
          />
        </CardContent>
      </Card>
    </AppLayout>
  );
}
