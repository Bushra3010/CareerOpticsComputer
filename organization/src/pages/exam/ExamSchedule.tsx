import { useCallback, useEffect, useMemo, useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { PageHeader } from "@/components/ui/PageHeader";
import { DataTable, type Column } from "@/components/ui/DataTable";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DatePicker } from "@/components/ui/date-picker";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { termLabel, termPlan, termsOf, type CourseSubject } from "@/lib/examWorkflow";
import {
  deleteExamSchedule,
  getCourseSubjects,
  getExamSchedules,
  saveExamSchedule,
  type ExamSchedule as Schedule,
  type ScheduleItem,
} from "@/lib/supabase/examWorkflow";
import { useExamData } from "./useExamData";

type Pick = { branchId: string; courseId: string; term: number; session: string; examCentreId: string };

/**
 * The date and time of every paper of a term, for one centre's batch of a
 * course in a session, at an exam centre. Admit cards are issued from this.
 */
export default function ExamSchedule() {
  const { toast } = useToast();
  const { user, ownBranch, branches, courses, sessions, examCentres, courseOf, branchOf, centreOf } = useExamData();
  const [pick, setPick] = useState<Pick>({ branchId: "", courseId: "", term: 1, session: "", examCentreId: "" });
  const [subjects, setSubjects] = useState<CourseSubject[]>([]);
  const [items, setItems] = useState<Record<string, { date: string; time: string }>>({});
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (ownBranch) setPick((p) => ({ ...p, branchId: ownBranch }));
  }, [ownBranch]);
  useEffect(() => {
    if (!pick.session && sessions[0]) setPick((p) => ({ ...p, session: sessions[0] }));
  }, [sessions, pick.session]);

  const loadSchedules = useCallback(async () => {
    try {
      setSchedules(await getExamSchedules(ownBranch));
    } catch (e) {
      toast({ title: "Could not load schedules", description: e instanceof Error ? e.message : "", variant: "destructive" });
    }
  }, [ownBranch, toast]);
  useEffect(() => {
    void loadSchedules();
  }, [loadSchedules]);

  const course = courseOf.get(pick.courseId) || null;
  const terms = useMemo(() => termsOf(course), [course]);

  useEffect(() => {
    if (!pick.courseId) return setSubjects([]);
    getCourseSubjects(pick.courseId)
      .then(setSubjects)
      .catch((e) => toast({ title: "Could not load subjects", description: e.message, variant: "destructive" }));
  }, [pick.courseId, toast]);

  const termSubjects = subjects.filter((s) => s.term === pick.term);
  const existing = schedules.find(
    (s) => s.branchId === pick.branchId && s.courseId === pick.courseId && s.term === pick.term && s.session === pick.session,
  );

  // An existing schedule for the same choice opens with its dates filled in.
  useEffect(() => {
    if (existing) {
      setItems(Object.fromEntries(existing.items.map((i) => [i.subjectId, { date: i.date, time: i.time }])));
      if (existing.examCentreId) setPick((p) => (p.examCentreId ? p : { ...p, examCentreId: existing.examCentreId }));
    } else {
      setItems({});
    }
  }, [existing]);

  const setItem = (subjectId: string, patch: Partial<{ date: string; time: string }>) =>
    setItems((prev) => ({ ...prev, [subjectId]: { date: "", time: "10:00", ...prev[subjectId], ...patch } }));

  const fillAll = () => {
    const first = termSubjects.map((s) => items[s.id]).find((i) => i?.date);
    if (!first) return toast({ title: "Set the first paper's date", description: "Then it is copied to the rest." });
    setItems((prev) => {
      const next = { ...prev };
      termSubjects.forEach((s) => {
        if (!next[s.id]?.date) next[s.id] = { date: first.date, time: first.time || "10:00" };
      });
      return next;
    });
  };

  const save = async () => {
    setSaving(true);
    try {
      const list: ScheduleItem[] = termSubjects.map((s) => ({
        subjectId: s.id,
        date: items[s.id]?.date || "",
        time: items[s.id]?.time || "",
      }));
      await saveExamSchedule({ ...pick, items: list }, user?.name);
      toast({ title: existing ? "Schedule updated" : "Schedule saved", description: `${course?.name} · ${termLabel(termPlan(course).type, pick.term)} · ${pick.session}` });
      await loadSchedules();
    } catch (e) {
      toast({ title: "Could not save schedule", description: e instanceof Error ? e.message : "", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const remove = async (s: Schedule) => {
    if (!window.confirm("Delete this schedule? Admit cards already issued keep their roll numbers.")) return;
    try {
      await deleteExamSchedule(s.id);
      await loadSchedules();
    } catch (e) {
      toast({ title: "Could not delete", description: e instanceof Error ? e.message : "", variant: "destructive" });
    }
  };

  type Row = Schedule & { centre: string; courseName: string; termName: string; examCentre: string; papers: number };
  const rows: Row[] = schedules.map((s) => {
    const c = courseOf.get(s.courseId);
    return {
      ...s,
      centre: branchOf.get(s.branchId)?.name || "—",
      courseName: c?.name || "—",
      termName: termLabel(termPlan(c).type, s.term),
      examCentre: centreOf.get(s.examCentreId)?.name || "—",
      papers: s.items.length,
    };
  });
  const columns: Column<Row>[] = [
    { key: "centre", header: "Centre", sortable: true },
    { key: "courseName", header: "Course", sortable: true },
    { key: "termName", header: "Year / Sem" },
    { key: "session", header: "Session", sortable: true },
    { key: "examCentre", header: "Exam centre" },
    {
      key: "papers",
      header: "Papers",
      cell: (s) => {
        const dates = s.items.map((i) => i.date).filter(Boolean).sort();
        return <span className="text-xs">{s.papers} · {dates[0] || "—"}{dates.length > 1 ? ` → ${dates[dates.length - 1]}` : ""}</span>;
      },
    },
  ];

  const select = (label: string, value: string, onChange: (v: string) => void, options: Array<[string, string]>, placeholder: string, disabled = false) => (
    <div className="space-y-2">
      <Label>{label}</Label>
      <Select value={value} onValueChange={onChange} disabled={disabled}>
        <SelectTrigger><SelectValue placeholder={placeholder} /></SelectTrigger>
        <SelectContent searchable={label === "Centre" || label === "Exam centre" || undefined} searchPlaceholder={`Search ${label.toLowerCase()}…`}>
          {options.map(([v, l]) => <SelectItem key={v} value={v}>{l}</SelectItem>)}
        </SelectContent>
      </Select>
    </div>
  );

  return (
    <AppLayout>
      <PageHeader
        title="Exam Schedule"
        description="Date and time of every paper, centre and course wise"
        breadcrumbs={[{ label: "Exam & Marks" }, { label: "Exam Schedule" }]}
      />
      <Card className="mb-4">
        <CardHeader><CardTitle>{existing ? "Edit schedule" : "Add schedule"}</CardTitle></CardHeader>
        <CardContent className="space-y-5">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {select("Centre", pick.branchId, (v) => setPick((p) => ({ ...p, branchId: v })), branches.map((b) => [b.id, b.name]), "Select centre", !!ownBranch)}
            {select("Course", pick.courseId, (v) => setPick((p) => ({ ...p, courseId: v, term: 1 })), courses.map((c) => [c.id, c.name]), "Select course")}
            {select("Year / Semester", String(pick.term), (v) => setPick((p) => ({ ...p, term: Number(v) })), terms.map((t) => [String(t.term), t.label]), "Select", !course)}
            {select("Session", pick.session, (v) => setPick((p) => ({ ...p, session: v })), sessions.map((s) => [s, s]), sessions.length ? "Select session" : "Add sessions first")}
            {select("Exam centre", pick.examCentreId, (v) => setPick((p) => ({ ...p, examCentreId: v })), examCentres.map((c) => [c.id, `${c.name}${c.code ? ` (${c.code})` : ""}`]), examCentres.length ? "Select exam centre" : "Add exam centres first")}
          </div>

          {course && (
            <div className="overflow-x-auto rounded-xl border">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/40 text-left text-xs text-muted-foreground">
                    <th className="p-2">Code</th>
                    <th className="p-2">Subject</th>
                    <th className="p-2">Date</th>
                    <th className="p-2">Time</th>
                  </tr>
                </thead>
                <tbody>
                  {termSubjects.map((s) => (
                    <tr key={s.id} className="border-b last:border-0">
                      <td className="p-2 font-mono text-xs">{s.code || "—"}</td>
                      <td className="p-2 font-medium">{s.name}</td>
                      <td className="p-2 min-w-[170px]"><DatePicker value={items[s.id]?.date || ""} onChange={(v) => setItem(s.id, { date: v })} /></td>
                      <td className="p-2 w-32"><Input type="time" value={items[s.id]?.time || "10:00"} onChange={(e) => setItem(s.id, { time: e.target.value })} /></td>
                    </tr>
                  ))}
                  {!termSubjects.length && (
                    <tr><td colSpan={4} className="p-6 text-center text-muted-foreground">No subjects for this term. Add them under Course Management → Course Subjects.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
          <div className="flex flex-wrap gap-2">
            <Button onClick={save} disabled={saving || !termSubjects.length}>{saving ? "Saving…" : existing ? "Update schedule" : "Save schedule"}</Button>
            {termSubjects.length > 1 && <Button variant="outline" onClick={fillAll}>Copy first date to empty rows</Button>}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Schedules</CardTitle></CardHeader>
        <CardContent>
          <DataTable
            data={rows}
            columns={columns}
            searchPlaceholder="Search centre, course, session…"
            actions={(s) => [
              { label: "Edit", onClick: () => setPick({ branchId: s.branchId, courseId: s.courseId, term: s.term, session: s.session, examCentreId: s.examCentreId }) },
              { label: "Delete", onClick: () => void remove(s), destructive: true },
            ]}
            emptyMessage="No exam schedules yet."
          />
        </CardContent>
      </Card>
    </AppLayout>
  );
}
