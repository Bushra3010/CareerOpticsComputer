import { useCallback, useEffect, useMemo, useState } from "react";
import { Printer } from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { PageHeader } from "@/components/ui/PageHeader";
import { DataTable, type Column } from "@/components/ui/DataTable";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { matchesSearch } from "@/lib/search";
import { getStudentDocument } from "@/lib/supabase/data";
import { isFinalTerm, termLabel, termPlan, termsOf, type CourseSubject } from "@/lib/examWorkflow";
import {
  deleteAdmitCard,
  getAdmitCards,
  getCourseSubjects,
  getExamSchedules,
  saveAdmitCard,
  type AdmitCardRecord,
  type ExamSchedule,
} from "@/lib/supabase/examWorkflow";
import { brandAdmitCardsPdf, type AdmitCard } from "@/lib/brand/brandDocuments";
import { studentName, useExamData, type ExamStudent } from "./useExamData";

const day = (iso: string) =>
  iso ? new Date(`${iso}T00:00:00`).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "";

/**
 * Issues each student's admit card for a term: the roll number, tied to the
 * exam schedule of their centre, course, term and session. Printing uses the
 * institute's own admit card template.
 */
export default function AdmitCards() {
  const { toast } = useToast();
  const { user, ownBranch, branches, courses, sessions, students, courseOf, branchOf, studentOf, centreOf } = useExamData();
  const [branchId, setBranchId] = useState("");
  const [courseId, setCourseId] = useState("");
  const [term, setTerm] = useState(1);
  const [session, setSession] = useState("");
  const [studentId, setStudentId] = useState("");
  const [rollNo, setRollNo] = useState("");
  const [cards, setCards] = useState<AdmitCardRecord[]>([]);
  const [schedules, setSchedules] = useState<ExamSchedule[]>([]);
  const [subjects, setSubjects] = useState<CourseSubject[]>([]);
  const [busy, setBusy] = useState(false);
  // One student at a time, or many ticked at once.
  const [many, setMany] = useState(false);
  const [picked, setPicked] = useState<Set<string>>(new Set());
  const [query, setQuery] = useState("");
  // Issued cards ticked in the list below, for printing together.
  const [printIds, setPrintIds] = useState<string[]>([]);

  useEffect(() => {
    if (ownBranch) setBranchId(ownBranch);
  }, [ownBranch]);
  useEffect(() => {
    if (!session && sessions[0]) setSession(sessions[0]);
  }, [sessions, session]);

  const load = useCallback(async () => {
    try {
      const [c, s, sub] = await Promise.all([getAdmitCards({ branchId: ownBranch }), getExamSchedules(ownBranch), getCourseSubjects()]);
      setCards(c);
      setSchedules(s);
      setSubjects(sub);
    } catch (e) {
      toast({ title: "Could not load admit cards", description: e instanceof Error ? e.message : "", variant: "destructive" });
    }
  }, [ownBranch, toast]);
  useEffect(() => {
    void load();
  }, [load]);

  const course = courseOf.get(courseId) || null;
  const terms = useMemo(() => termsOf(course), [course]);
  const candidates = students.filter((s) => (!branchId || s.branchId === branchId) && (!courseId || s.courseId === courseId));
  const schedule = schedules.find((s) => s.branchId === branchId && s.courseId === courseId && s.term === term && s.session === session);
  const issuedFor = (sid: string) => cards.find((c) => c.studentId === sid && c.term === term);

  useEffect(() => {
    const s = studentOf.get(studentId);
    setRollNo(issuedFor(studentId)?.rollNo || s?.rollNo || s?.enrollmentNo || s?.applicationNo || "");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [studentId, term, cards]);

  const issue = async (target: ExamStudent, roll: string) => {
    await saveAdmitCard(
      {
        studentId: target.id,
        branchId: target.branchId,
        courseId: target.courseId,
        term,
        session,
        rollNo: roll,
        examCentreId: schedule?.examCentreId || "",
        scheduleId: schedule?.id || "",
        isFinal: isFinalTerm(courseOf.get(target.courseId), term),
      },
      user?.name,
    );
  };

  const issueOne = async () => {
    const target = studentOf.get(studentId);
    if (!target) return toast({ title: "Choose the student", variant: "destructive" });
    setBusy(true);
    try {
      await issue(target, rollNo);
      toast({ title: "Admit card issued", description: `${studentName(target)} · Roll ${rollNo}` });
      await load();
    } catch (e) {
      toast({ title: "Could not issue admit card", description: e instanceof Error ? e.message : "", variant: "destructive" });
    } finally {
      setBusy(false);
    }
  };

  const listed = candidates.filter((s) => matchesSearch(`${studentName(s)} ${s.enrollmentNo || ""} ${s.applicationNo || ""}`, query));
  const chosen = listed.filter((s) => picked.has(s.id));
  const toggle = (sid: string, on: boolean) =>
    setPicked((prev) => {
      const next = new Set(prev);
      if (on) next.add(sid);
      else next.delete(sid);
      return next;
    });

  /** Issues (or updates) the ticked students' cards; each roll number is the student's own number. */
  const issueMany = async () => {
    if (!chosen.length) return;
    if (!schedule) return toast({ title: "No exam schedule", description: "Create the schedule for this course, term and session first.", variant: "destructive" });
    setBusy(true);
    let done = 0;
    let skipped = 0;
    try {
      for (const s of chosen) {
        const roll = issuedFor(s.id)?.rollNo || s.rollNo || s.enrollmentNo || s.applicationNo;
        if (!roll) {
          skipped += 1;
          continue;
        }
        await issue(s, roll);
        done += 1;
      }
      toast({ title: "Admit cards issued", description: `${done} of ${chosen.length} issued${skipped ? `; ${skipped} have no enrolment or application number yet` : ""}.` });
      setPicked(new Set());
      await load();
    } catch (e) {
      toast({ title: `Stopped after ${done} of ${chosen.length}`, description: e instanceof Error ? e.message : "", variant: "destructive" });
    } finally {
      setBusy(false);
    }
  };

  const print = async (records: AdmitCardRecord[]) => {
    if (!records.length) return;
    try {
      const built: AdmitCard[] = [];
      for (const card of records) {
        const st = studentOf.get(card.studentId);
        const c = courseOf.get(card.courseId);
        const sch = schedules.find((s) => s.id === card.scheduleId);
        const centre = centreOf.get(card.examCentreId);
        const dates = (sch?.items || []).map((i) => i.date).filter(Boolean).sort();
        // The photo is not in the pick list (it would carry every student's
        // upload); it comes with the card's own document record.
        const docRecord = await getStudentDocument(card.studentId, ownBranch);
        built.push({
          name: studentName(st),
          enrollmentNo: st?.enrollmentNo || st?.applicationNo || card.rollNo,
          rollNo: card.rollNo,
          course: c?.name || "",
          term: termLabel(termPlan(c).type, card.term),
          session: card.session || undefined,
          examWindow: dates.length ? `${day(dates[0])}${dates.length > 1 ? ` to ${day(dates[dates.length - 1])}` : ""}` : "To be announced",
          examCentre: centre ? [centre.name, centre.address].filter(Boolean).join(", ") : undefined,
          schedule: (sch?.items || []).map((i) => ({
            subject: subjects.find((s) => s.id === i.subjectId)?.name || "Paper",
            when: `${day(i.date)} ${i.time}`,
          })),
          photo: docRecord.data.photo || null,
          fatherName: docRecord.data.fatherName || undefined,
        });
      }
      await brandAdmitCardsPdf(built, records.length > 1 ? `admit-cards-${records.length}` : `admit-card-${records[0].rollNo}`);
    } catch (e) {
      toast({ title: "Could not print", description: e instanceof Error ? e.message : "", variant: "destructive" });
    }
  };

  const remove = async (card: AdmitCardRecord) => {
    if (!window.confirm("Delete this admit card?")) return;
    try {
      await deleteAdmitCard(card.id);
      await load();
    } catch (e) {
      toast({ title: "Could not delete", description: e instanceof Error ? e.message : "", variant: "destructive" });
    }
  };

  type Row = AdmitCardRecord & { name: string; enrollmentNo: string; courseName: string; termName: string; centre: string; examCentre: string };
  const rows: Row[] = cards.map((c) => {
    const st = studentOf.get(c.studentId);
    const co = courseOf.get(c.courseId);
    return {
      ...c,
      name: studentName(st) || "—",
      enrollmentNo: st?.enrollmentNo || st?.applicationNo || "—",
      courseName: co?.name || "—",
      termName: termLabel(termPlan(co).type, c.term),
      centre: branchOf.get(c.branchId)?.name || "—",
      examCentre: centreOf.get(c.examCentreId)?.name || "—",
    };
  });
  const columns: Column<Row>[] = [
    { key: "enrollmentNo", header: "Enrollment No", sortable: true, cell: (r) => <span className="font-mono text-xs">{r.enrollmentNo}</span> },
    { key: "name", header: "Student", sortable: true, cell: (r) => <span className="font-medium">{r.name}</span> },
    { key: "rollNo", header: "Roll No", cell: (r) => <span className="font-mono text-xs">{r.rollNo}</span> },
    { key: "courseName", header: "Course" },
    { key: "termName", header: "Year / Sem", cell: (r) => <span>{r.termName} {r.isFinal && <Badge variant="secondary" className="ml-1">Final</Badge>}</span> },
    { key: "session", header: "Session" },
    { key: "examCentre", header: "Exam centre" },
    { key: "centre", header: "Institute" },
  ];

  const pick = (label: string, value: string, onChange: (v: string) => void, options: Array<[string, string]>, placeholder: string, disabled = false) => (
    <div className="space-y-2">
      <Label>{label}</Label>
      <Select value={value} onValueChange={onChange} disabled={disabled}>
        <SelectTrigger><SelectValue placeholder={placeholder} /></SelectTrigger>
        <SelectContent searchable={label === "Centre" || label === "Student" || undefined} searchPlaceholder={label === "Student" ? "Search student or enrollment…" : `Search ${label.toLowerCase()}…`}>
          {options.map(([v, l]) => <SelectItem key={v} value={v}>{l}</SelectItem>)}
        </SelectContent>
      </Select>
    </div>
  );

  return (
    <AppLayout>
      <PageHeader
        title="Admit Cards"
        description="Issue roll numbers from the exam schedule and print admit cards"
        breadcrumbs={[{ label: "Exam & Marks" }, { label: "Admit Cards" }]}
      />
      <Card className="mb-4">
        <CardHeader className="flex flex-row flex-wrap items-center justify-between gap-3 space-y-0">
          <CardTitle>Issue admit card</CardTitle>
          <div className="inline-flex rounded-lg border p-0.5" role="group" aria-label="How many students">
            {([[false, "One student"], [true, "Multiple students"]] as const).map(([value, label]) => (
              <Button
                key={label}
                type="button"
                size="sm"
                variant={many === value ? "default" : "ghost"}
                aria-pressed={many === value}
                onClick={() => { setMany(value); setPicked(new Set()); setStudentId(""); }}
              >
                {label}
              </Button>
            ))}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {pick("Centre", branchId, (v) => { setBranchId(v); setStudentId(""); }, branches.map((b) => [b.id, b.name]), "Select centre", !!ownBranch)}
            {pick("Course", courseId, (v) => { setCourseId(v); setTerm(1); setStudentId(""); }, courses.map((c) => [c.id, c.name]), "Select course")}
            {pick("Year / Semester", String(term), (v) => setTerm(Number(v)), terms.map((t) => [String(t.term), t.label]), "Select", !course)}
            {pick("Session", session, setSession, sessions.map((s) => [s, s]), "Select session")}
            {!many && pick("Student", studentId, setStudentId, candidates.map((s) => [s.id, `${studentName(s)}${(s.enrollmentNo || s.applicationNo) ? ` · ${(s.enrollmentNo || s.applicationNo)}` : ""}${issuedFor(s.id) ? " ✓" : ""}`]), candidates.length ? "Select student" : "No students for this course")}
            {!many && (
              <div className="space-y-2">
                <Label>Roll No.</Label>
                <Input value={rollNo} onChange={(e) => setRollNo(e.target.value)} placeholder="Enter roll no." />
              </div>
            )}
          </div>
          {many && !courseId && <p className="text-sm text-muted-foreground">Choose the centre and course to list their students.</p>}
          {many && courseId && (
            <div className="space-y-2 rounded-xl border p-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <label className="flex items-center gap-2 text-sm font-medium">
                  <Checkbox
                    checked={listed.length > 0 && listed.every((s) => picked.has(s.id))}
                    onCheckedChange={(v) => setPicked(v === true ? new Set(listed.map((s) => s.id)) : new Set())}
                    aria-label="Select all students shown"
                  />
                  Select all shown ({listed.length})
                </label>
                <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search name or enrollment…" aria-label="Search students" className="sm:w-64" />
              </div>
              <div className="grid max-h-72 gap-1 overflow-y-auto sm:grid-cols-2 lg:grid-cols-3">
                {listed.map((s) => (
                  <label key={s.id} className="flex items-center gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-muted/60">
                    <Checkbox checked={picked.has(s.id)} onCheckedChange={(v) => toggle(s.id, v === true)} aria-label={studentName(s)} />
                    <span className="min-w-0 flex-1 truncate">
                      {studentName(s)}
                      {(s.enrollmentNo || s.applicationNo) ? <span className="text-xs text-muted-foreground"> · {s.enrollmentNo || s.applicationNo}</span> : null}
                    </span>
                    {issuedFor(s.id) && <Badge variant="secondary" className="text-[10px]">issued</Badge>}
                  </label>
                ))}
                {!listed.length && <p className="p-3 text-sm text-muted-foreground">No students{query ? " match the search" : " on this course at this centre"}.</p>}
              </div>
              <p className="text-xs text-muted-foreground">Each roll number is the student's enrollment number (or application number); an issued card keeps its own.</p>
            </div>
          )}
          {course && (
            <p className={`text-sm ${schedule ? "text-muted-foreground" : "text-destructive"}`}>
              {schedule
                ? `Schedule found: ${schedule.items.length} paper(s) at ${centreOf.get(schedule.examCentreId)?.name || "the exam centre"}.`
                : "No exam schedule for this centre, course, term and session yet — create it under Exam Schedule first."}
            </p>
          )}
          <div className="flex flex-wrap gap-2">
            {many ? (
              <Button onClick={issueMany} disabled={busy || !chosen.length || !schedule}>
                {busy ? "Issuing…" : `Issue ${chosen.length || ""} admit card${chosen.length === 1 ? "" : "s"}`.replace("  ", " ")}
              </Button>
            ) : (
              <Button onClick={issueOne} disabled={busy || !studentId || !schedule}>{issuedFor(studentId) ? "Update admit card" : "Issue admit card"}</Button>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row flex-wrap items-center justify-between gap-2">
          <CardTitle>Issued admit cards <Badge variant="secondary" className="ml-2">{rows.length}</Badge></CardTitle>
          <div className="flex flex-wrap items-center gap-2">
            <Button size="sm" disabled={!printIds.length} onClick={() => void print(cards.filter((c) => printIds.includes(c.id)))}>
              <Printer className="mr-2 h-4 w-4" />
              Print selected ({printIds.length})
            </Button>
            <Button size="sm" variant="outline" disabled={!cards.length} onClick={() => void print(cards)}>
              Print all ({cards.length})
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <DataTable
            data={rows}
            columns={columns}
            selectable
            onSelectionChange={(ids) => setPrintIds(ids.map(String))}
            searchPlaceholder="Search name, enrollment, roll no…"
            filters={[
              { label: "Course", key: "courseName" },
              { label: "Session", key: "session" },
              { label: "Institute", key: "centre" },
            ]}
            actions={(r) => [
              { label: "Print", onClick: () => void print([r]) },
              { label: "Delete", onClick: () => void remove(r), destructive: true },
            ]}
            emptyMessage="No admit cards issued yet."
          />
        </CardContent>
      </Card>
    </AppLayout>
  );
}
