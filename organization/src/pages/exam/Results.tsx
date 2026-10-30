import { useCallback, useEffect, useMemo, useState } from "react";
import { Printer } from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { PageHeader } from "@/components/ui/PageHeader";
import { DataTable, type Column } from "@/components/ui/DataTable";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DatePicker } from "@/components/ui/date-picker";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import {
  hasPractical,
  hasTheory,
  isFinalTerm,
  lineFor,
  lineProblem,
  summarise,
  termLabel,
  termPlan,
  termsOf,
  type CourseSubject,
  type MarkLine,
} from "@/lib/examWorkflow";
import {
  deleteMarksheet,
  getAdmitCards,
  getCourseSubjects,
  getExamSchedules,
  getPrintApprovals,
  approvalFor,
  type PrintApproval,
  getMarksheets,
  saveMarksheet,
  type AdmitCardRecord,
  type ExamSchedule,
  type MarksheetRecord,
} from "@/lib/supabase/examWorkflow";
import { printMarksheet, printMarksheets } from "./printMarksheet";
import { studentName, useExamData } from "./useExamData";

const today = () => new Date().toLocaleDateString("en-CA");

/**
 * The result of a term: a student's theory and practical marks for each paper,
 * with the total, percentage, grade and PASS / FAIL worked out as they are
 * typed. The final term's passed marksheet is what a certificate is issued on.
 */
export default function Results() {
  const { toast } = useToast();
  const { user, isAdmin, ownBranch, branches, sessions, students, courseOf, branchOf, studentOf } = useExamData();
  // The head office's decision on each centre-made marksheet; null when approvals are not set up.
  const [approvals, setApprovals] = useState<PrintApproval[] | null>([]);
  const [branchId, setBranchId] = useState("");
  // Results ticked in the list, for printing their marksheets together.
  const [printIds, setPrintIds] = useState<string[]>([]);
  const [printing, setPrinting] = useState(false);
  const [studentId, setStudentId] = useState("");
  const [term, setTerm] = useState(1);
  const [session, setSession] = useState("");
  const [issueDate, setIssueDate] = useState(today);
  const [lines, setLines] = useState<MarkLine[]>([]);
  const [subjects, setSubjects] = useState<CourseSubject[]>([]);
  const [sheets, setSheets] = useState<MarksheetRecord[]>([]);
  // The exam schedules, so a printed marksheet can say when the exam was held.
  const [schedules, setSchedules] = useState<ExamSchedule[]>([]);
  // The admit cards, for the roll number the marksheet prints.
  const [cards, setCards] = useState<AdmitCardRecord[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (ownBranch) setBranchId(ownBranch);
  }, [ownBranch]);

  const load = useCallback(async () => {
    try {
      const [m, s, a, p] = await Promise.all([
        getMarksheets({ branchId: ownBranch }),
        getExamSchedules(ownBranch).catch(() => [] as ExamSchedule[]),
        getAdmitCards({ branchId: ownBranch }).catch(() => [] as AdmitCardRecord[]),
        getPrintApprovals(ownBranch).catch(() => null),
      ]);
      setApprovals(p);
      setSheets(m);
      setSchedules(s);
      setCards(a);
    } catch (e) {
      toast({ title: "Could not load results", description: e instanceof Error ? e.message : "", variant: "destructive" });
    }
  }, [ownBranch, toast]);
  useEffect(() => {
    void load();
  }, [load]);

  const student = studentOf.get(studentId) || null;
  const course = student ? courseOf.get(student.courseId) || null : null;
  const terms = useMemo(() => termsOf(course), [course]);
  const candidates = students.filter((s) => !branchId || s.branchId === branchId);
  const existing = sheets.find((s) => s.studentId === studentId && s.term === term) || null;

  useEffect(() => {
    if (!course) return setSubjects([]);
    getCourseSubjects(course.id)
      .then(setSubjects)
      .catch((e) => toast({ title: "Could not load subjects", description: e.message, variant: "destructive" }));
  }, [course, toast]);

  // The form opens on the saved marksheet when there is one; otherwise on the
  // term's subjects with empty boxes.
  useEffect(() => {
    const termSubjects = subjects.filter((s) => s.term === term);
    const saved = new Map((existing?.marks || []).map((l) => [l.subjectId, l]));
    const fromSubjects = termSubjects.map((s) => lineFor(s, saved.get(s.id)));
    // A subject removed since the marksheet was made keeps its line.
    const orphaned = (existing?.marks || []).filter((l) => !termSubjects.some((s) => s.id === l.subjectId));
    setLines([...fromSubjects, ...orphaned]);
    if (existing) {
      setIssueDate(existing.issueDate || today());
      setSession(existing.session || student?.academicYear || sessions[0] || "");
    } else {
      setSession(student?.academicYear || sessions[0] || "");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [subjects, term, existing, studentId]);

  const summary = summarise(lines);
  const setMark = (index: number, part: "theory" | "practical", value: string) =>
    setLines((prev) => prev.map((l, i) => (i === index ? { ...l, [part]: value === "" ? null : Number(value) } : l)));

  const save = async () => {
    if (!student) return toast({ title: "Choose the student", variant: "destructive" });
    const problem = lines.map(lineProblem).find(Boolean);
    if (problem) return toast({ title: "Check the marks", description: problem, variant: "destructive" });
    setSaving(true);
    try {
      const result = await saveMarksheet(
        {
          studentId: student.id,
          branchId: student.branchId,
          courseId: student.courseId,
          term,
          session,
          issueDate,
          marks: lines,
          isFinal: isFinalTerm(course, term),
          enrollmentNo: student.enrollmentNo,
        },
        user?.name,
      );
      toast({
        title: existing ? "Result updated" : "Result saved",
        description: `${studentName(student)} · ${result.result} · ${result.percentage}% (${result.grade})${isAdmin || approvals === null ? "" : " · sent to the head office for print approval"}`,
      });
      await load();
    } catch (e) {
      toast({ title: "Could not save result", description: e instanceof Error ? e.message : "", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  /** When the term's exam was held: the last paper of its schedule, else the result's date. */
  const examDateOf = (sheet: MarksheetRecord) => {
    const schedule = schedules.find(
      (s) => s.branchId === sheet.branchId && s.courseId === sheet.courseId && s.term === sheet.term && (!sheet.session || s.session === sheet.session),
    );
    const dates = (schedule?.items || []).map((i) => i.date).filter(Boolean).sort();
    return dates[dates.length - 1] || sheet.issueDate;
  };

  const optsFor = (sheet: MarksheetRecord) => ({
    course: courseOf.get(sheet.courseId),
    rollNo: cards.find((c) => c.studentId === sheet.studentId && c.term === sheet.term)?.rollNo,
    examinationDate: examDateOf(sheet),
  });

  // A centre-made marksheet prints once the head office approves it; the head office prints any.
  const approvalOf = (sheet: MarksheetRecord) => approvalFor(approvals, "MARKSHEET", sheet.id);
  const printable = (sheet: MarksheetRecord) => isAdmin || approvalOf(sheet) === "APPROVED";

  const print = async (sheet: MarksheetRecord) => {
    if (!printable(sheet)) {
      return toast({ title: "Waiting for approval", description: "This marksheet prints once the head office approves it.", variant: "destructive" });
    }
    try {
      await printMarksheet(sheet, { ...optsFor(sheet), organizationId: user?.organizationId ?? null, ownBranch });
    } catch (e) {
      toast({ title: "Could not print marksheet", description: e instanceof Error ? e.message : "", variant: "destructive" });
    }
  };

  /** Several marksheets in one go: one print run, or one PDF with a page per student. */
  const printMany = async (all: MarksheetRecord[]) => {
    const chosen = all.filter(printable);
    if (all.length > chosen.length) {
      toast({ title: `${all.length - chosen.length} marksheet(s) left out`, description: "They are waiting for the head office's approval." });
    }
    if (!chosen.length) return;
    setPrinting(true);
    try {
      await printMarksheets(chosen.map((sheet) => ({ sheet, opts: optsFor(sheet) })), user?.organizationId ?? null, ownBranch);
    } catch (e) {
      toast({ title: "Could not print marksheets", description: e instanceof Error ? e.message : "", variant: "destructive" });
    } finally {
      setPrinting(false);
    }
  };

  const remove = async (sheet: MarksheetRecord) => {
    if (!window.confirm("Delete this result?")) return;
    try {
      await deleteMarksheet(sheet.id);
      await load();
    } catch (e) {
      toast({ title: "Could not delete", description: e instanceof Error ? e.message : "", variant: "destructive" });
    }
  };

  const edit = (sheet: MarksheetRecord) => {
    setBranchId(sheet.branchId);
    setStudentId(sheet.studentId);
    setTerm(sheet.term);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  type Row = MarksheetRecord & { name: string; enrollmentNo: string; courseName: string; termName: string; centre: string; approval: string };
  const rows: Row[] = sheets.map((s) => {
    const st = studentOf.get(s.studentId);
    const c = courseOf.get(s.courseId);
    return {
      ...s,
      name: studentName(st) || "—",
      enrollmentNo: st?.enrollmentNo || st?.applicationNo || "—",
      courseName: c?.name || "—",
      termName: termLabel(termPlan(c).type, s.term),
      centre: branchOf.get(s.branchId)?.name || "—",
      approval: approvalOf(s) === "APPROVED" ? "Approved" : approvalOf(s) === "REJECTED" ? "Rejected" : "Awaiting approval",
    };
  });
  const columns: Column<Row>[] = [
    { key: "enrollmentNo", header: "Enrollment No", sortable: true, cell: (r) => <span className="font-mono text-xs">{r.enrollmentNo}</span> },
    { key: "name", header: "Student", sortable: true, cell: (r) => <span className="font-medium">{r.name}</span> },
    { key: "courseName", header: "Course" },
    { key: "termName", header: "Year / Sem", cell: (r) => <span>{r.termName} {r.isFinal && <Badge variant="secondary" className="ml-1">Final</Badge>}</span> },
    { key: "percentage", header: "Marks", sortable: true, cell: (r) => <span className="text-xs">{r.totalObtained}/{r.totalMax} · {r.percentage}% · {r.grade}</span> },
    { key: "result", header: "Result", cell: (r) => <Badge variant={r.result === "PASS" ? "default" : "destructive"}>{r.result}</Badge> },
    ...(approvals === null
      ? []
      : [{
          key: "approval",
          header: "Print approval",
          cell: (r: Row) => {
            const note = approvals.find((a) => a.kind === "MARKSHEET" && a.marksheetId === r.id)?.note;
            return r.approval === "Approved" ? (
              <Badge variant="secondary">Approved</Badge>
            ) : r.approval === "Rejected" ? (
              <span><Badge variant="destructive">Rejected</Badge>{note && <span className="block text-xs text-destructive">{note}</span>}</span>
            ) : (
              <Badge variant="outline" className="border-amber-300 text-amber-700">Awaiting approval</Badge>
            );
          },
        } as Column<Row>]),
    { key: "centre", header: "Institute" },
  ];

  return (
    <AppLayout>
      <PageHeader
        title="Results & Marksheets"
        description="Enter theory and practical marks term wise; totals, grade and result are worked out"
        breadcrumbs={[{ label: "Exam & Marks" }, { label: "Results" }]}
      />
      <Card className="mb-4">
        <CardHeader><CardTitle>{existing ? "Edit result" : "Create result"}</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            <div className="space-y-2">
              <Label>Centre</Label>
              <Select value={branchId} onValueChange={(v) => { setBranchId(v); setStudentId(""); }} disabled={!!ownBranch}>
                <SelectTrigger><SelectValue placeholder="Select centre" /></SelectTrigger>
                <SelectContent searchable searchPlaceholder="Search centre…">{branches.map((b) => <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-2 lg:col-span-2">
              <Label>Student</Label>
              <Select value={studentId} onValueChange={(v) => { setStudentId(v); setTerm(1); }}>
                <SelectTrigger><SelectValue placeholder={candidates.length ? "Select student" : "No students"} /></SelectTrigger>
                <SelectContent searchable searchPlaceholder="Search student or enrollment…">
                  {candidates.map((s) => (
                    <SelectItem key={s.id} value={s.id}>
                      {studentName(s)}{(s.enrollmentNo || s.applicationNo) ? ` · ${(s.enrollmentNo || s.applicationNo)}` : ""}{courseOf.get(s.courseId) ? ` · ${courseOf.get(s.courseId)?.name}` : ""}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Year / Semester</Label>
              <Select value={String(term)} onValueChange={(v) => setTerm(Number(v))} disabled={!course}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{terms.map((t) => <SelectItem key={t.term} value={String(t.term)}>{t.label}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Issue date</Label>
              <DatePicker value={issueDate} onChange={setIssueDate} />
            </div>
          </div>
          {student && !course && <p className="text-sm text-destructive">This student has no course assigned. Assign the course on the admission first.</p>}

          {course && (
            <>
              <p className="text-sm text-muted-foreground">
                {course.name} · {terms.find((t) => t.term === term)?.label}
                {isFinalTerm(course, term) ? " · final term (the certificate is issued on this result)" : ""}
                {session ? ` · ${/^session/i.test(session) ? session : `Session ${session}`}` : ""}
              </p>
              <div className="overflow-x-auto rounded-xl border">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b bg-muted/40 text-left text-xs text-muted-foreground">
                      <th className="p-2">Code</th>
                      <th className="p-2">Subject</th>
                      <th className="p-2 text-center">Theory (min/max)</th>
                      <th className="p-2">Theory obtained</th>
                      <th className="p-2 text-center">Practical (min/max)</th>
                      <th className="p-2">Practical obtained</th>
                    </tr>
                  </thead>
                  <tbody>
                    {lines.map((l, i) => {
                      const low = (v: number | null, min: number) => v !== null && v < min;
                      // A paper the course no longer has, kept from when this
                      // marksheet was made: shown so its marks are not lost
                      // silently, and removable from here.
                      const dropped = !subjects.some((s) => s.term === term && s.id === l.subjectId);
                      return (
                        <tr key={l.subjectId} className={`border-b last:border-0 ${dropped ? "bg-muted/40" : ""}`}>
                          <td className="p-2 font-mono text-xs">{l.code || "—"}</td>
                          <td className="p-2 font-medium">
                            {l.name}
                            {dropped && (
                              <span className="mt-1 flex flex-wrap items-center gap-2 text-xs font-normal text-muted-foreground">
                                No longer a subject of this course.
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="sm"
                                  className="h-7 px-2 text-xs"
                                  aria-label={`Remove ${l.name} from this marksheet`}
                                  onClick={() => setLines((prev) => prev.filter((_, n) => n !== i))}
                                >
                                  Remove
                                </Button>
                              </span>
                            )}
                          </td>
                          <td className="p-2 text-center text-muted-foreground">{hasTheory(l) ? `${l.theoryMin} / ${l.theoryMax}` : "—"}</td>
                          <td className="p-2 w-32">
                            {hasTheory(l) && (
                              <Input
                                type="number"
                                min={0}
                                max={l.theoryMax}
                                aria-label={`${l.name} theory`}
                                className={low(l.theory, l.theoryMin) ? "border-destructive" : ""}
                                value={l.theory ?? ""}
                                onChange={(e) => setMark(i, "theory", e.target.value)}
                              />
                            )}
                          </td>
                          <td className="p-2 text-center text-muted-foreground">{hasPractical(l) ? `${l.practicalMin} / ${l.practicalMax}` : "—"}</td>
                          <td className="p-2 w-32">
                            {hasPractical(l) && (
                              <Input
                                type="number"
                                min={0}
                                max={l.practicalMax}
                                aria-label={`${l.name} practical`}
                                className={low(l.practical, l.practicalMin) ? "border-destructive" : ""}
                                value={l.practical ?? ""}
                                onChange={(e) => setMark(i, "practical", e.target.value)}
                              />
                            )}
                          </td>
                        </tr>
                      );
                    })}
                    {!lines.length && (
                      <tr><td colSpan={6} className="p-6 text-center text-muted-foreground">No subjects for this term. Add them under Course Management → Course Subjects.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
              {lines.length > 0 && (
                <div className="flex flex-wrap items-center gap-3 rounded-xl bg-muted/40 p-3 text-sm">
                  <span>Total <b>{summary.totalObtained}</b> / {summary.totalMax}</span>
                  <span>Percentage <b>{summary.percentage}%</b></span>
                  <span>Grade <b>{summary.grade}</b></span>
                  <Badge variant={summary.result === "PASS" ? "default" : "destructive"}>{summary.result}</Badge>
                  {summary.failedSubjects.length > 0 && (
                    <span className="text-xs text-destructive">Below minimum: {summary.failedSubjects.join(", ")}</span>
                  )}
                </div>
              )}
              <Button onClick={save} disabled={saving || !lines.length}>{saving ? "Saving…" : existing ? "Update result" : "Save result"}</Button>
            </>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row flex-wrap items-center justify-between gap-2 space-y-0">
          <CardTitle>Results <Badge variant="secondary" className="ml-2">{rows.length}</Badge></CardTitle>
          <div className="flex flex-wrap gap-2">
            <Button size="sm" disabled={printing || !printIds.length} onClick={() => void printMany(sheets.filter((s) => printIds.includes(s.id)))}>
              <Printer className="mr-2 h-4 w-4" />
              {printing ? "Preparing…" : `Print selected (${printIds.length})`}
            </Button>
            <Button size="sm" variant="outline" disabled={printing || !sheets.length} onClick={() => void printMany(sheets)}>
              Print all ({sheets.length})
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <DataTable
            data={rows}
            columns={columns}
            selectable
            onSelectionChange={(ids) => setPrintIds(ids.map(String))}
            searchPlaceholder="Search name, enrollment…"
            filters={[
              { label: "Course", key: "courseName" },
              { label: "Result", key: "result" },
              { label: "Institute", key: "centre" },
              ...(approvals === null ? [] : [{ label: "Print approval", key: "approval" as const }]),
            ]}
            actions={(r) => [
              { label: "Edit", onClick: () => edit(r) },
              { label: "Print marksheet", onClick: () => void print(r) },
              { label: "Delete", onClick: () => void remove(r), destructive: true },
            ]}
            emptyMessage="No results yet."
          />
        </CardContent>
      </Card>
    </AppLayout>
  );
}
