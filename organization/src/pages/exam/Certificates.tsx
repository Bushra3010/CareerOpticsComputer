import { useCallback, useEffect, useState } from "react";
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
import { DatePicker } from "@/components/ui/date-picker";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { certificatePdf, certificatesPdf, marksheetPdf, marksheetSummary, type StudentDocument } from "@/lib/documents";
import { matchesSearch } from "@/lib/search";
import { printFromTemplate, printManyFromTemplate } from "@/lib/studentTemplateDocument";
import { Link } from "react-router-dom";
import { getCertificateFees, getStudentDocument, getWallet, issueCertificate } from "@/lib/supabase/data";
import {
  approvalFor,
  getAdmitCards,
  getIssuedCertificates,
  getMarksheets,
  getPrintApprovals,
  requestCertificateApproval,
  type AdmitCardRecord,
  type IssuedCertificate,
  type MarksheetRecord,
  type PrintApproval,
} from "@/lib/supabase/examWorkflow";
import { printMarksheet, printMarksheets } from "./printMarksheet";
import { studentName, useExamData } from "./useExamData";

const today = () => new Date().toLocaleDateString("en-CA");
const shown = (iso: string) =>
  iso ? new Date(`${iso.slice(0, 10)}T00:00:00`).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "—";

/**
 * Issues a student's completion certificate on their passed final-term result,
 * charges the centre's wallet once, and prints it in the institute's own
 * certificate format. Every student issued one is a passout.
 */
export default function Certificates({ passoutOnly = false }: { passoutOnly?: boolean }) {
  const { toast } = useToast();
  const { user, isAdmin, ownBranch, branches, students, courseOf, branchOf, studentOf } = useExamData();
  // The head office's decisions on this centre's certificates and marksheets; null when approvals are not set up.
  const [approvals, setApprovals] = useState<PrintApproval[] | null>([]);
  const [branchId, setBranchId] = useState("");
  const [studentId, setStudentId] = useState("");
  const [issueDate, setIssueDate] = useState(today);
  const [examDate, setExamDate] = useState("");
  const [issued, setIssued] = useState<IssuedCertificate[]>([]);
  const [sheets, setSheets] = useState<MarksheetRecord[]>([]);
  // The roll numbers issued on admit cards, which the certificate prints.
  const [cards, setCards] = useState<AdmitCardRecord[]>([]);
  const [fees, setFees] = useState<Map<string, number>>(new Map());
  const [busy, setBusy] = useState(false);
  // One student at a time, or many of a centre's at once.
  const [many, setMany] = useState(false);
  const [picked, setPicked] = useState<Set<string>>(new Set());
  const [query, setQuery] = useState("");
  const [progress, setProgress] = useState("");
  // The paying centre's wallet, read when its student is picked.
  const [balance, setBalance] = useState<number | null>(null);

  useEffect(() => {
    if (ownBranch) setBranchId(ownBranch);
  }, [ownBranch]);

  const load = useCallback(async () => {
    try {
      const [c, m, f, a, p] = await Promise.all([
        getIssuedCertificates(ownBranch),
        getMarksheets({ branchId: ownBranch }),
        getCertificateFees().catch(() => new Map<string, number>()),
        getAdmitCards({ branchId: ownBranch }).catch(() => [] as AdmitCardRecord[]),
        getPrintApprovals(ownBranch).catch(() => null),
      ]);
      setApprovals(p);
      setIssued(c);
      setSheets(m);
      setFees(f);
      setCards(a);
    } catch (e) {
      toast({ title: "Could not load certificates", description: e instanceof Error ? e.message : "", variant: "destructive" });
    }
  }, [ownBranch, toast]);
  useEffect(() => {
    void load();
  }, [load]);

  const finalPass = (sid: string) => sheets.find((s) => s.studentId === sid && s.isFinal && s.result === "PASS");
  const hasSheets = (sid: string) => sheets.some((s) => s.studentId === sid);
  const issuedFor = (sid: string) => issued.find((c) => c.studentId === sid);
  const candidates = students.filter((s) => !branchId || s.branchId === branchId);
  const student = studentOf.get(studentId) || null;
  const fee = student ? fees.get(student.branchId) ?? fees.get("*") ?? 0 : 0;
  const sheet = student ? finalPass(student.id) : undefined;
  const already = student ? issuedFor(student.id) : undefined;

  // Many at once: the centre's students who passed, the issued ones too (a reprint is free).
  const listed = candidates.filter(
    (s) => (finalPass(s.id) || issuedFor(s.id)) && matchesSearch(`${studentName(s)} ${s.enrollmentNo || ""} ${s.applicationNo || ""}`, query),
  );
  const notReady = many ? candidates.filter((s) => !finalPass(s.id) && !issuedFor(s.id)).length : 0;
  const chosen = listed.filter((s) => picked.has(s.id));
  const newOnes = chosen.filter((s) => !issuedFor(s.id));
  const manyFee = branchId ? fees.get(branchId) ?? fees.get("*") ?? 0 : 0;
  const manyCost = manyFee * newOnes.length;
  const toggle = (sid: string, on: boolean) =>
    setPicked((prev) => {
      const next = new Set(prev);
      if (on) next.add(sid);
      else next.delete(sid);
      return next;
    });

  const payingBranch = many ? branchId : student?.branchId || "";
  useEffect(() => {
    setBalance(null);
    if (!payingBranch) return;
    let cancelled = false;
    getWallet(payingBranch)
      .then((r) => { if (!cancelled) setBalance(Number((r.data as { balance?: number } | null)?.balance ?? 0)); })
      .catch(() => { /* the database still refuses a charge it cannot cover */ });
    return () => { cancelled = true; };
  }, [payingBranch, issued]);
  // The head office prints what it likes; a centre waits for approval.
  const certApproval = (sid: string) => (isAdmin ? "APPROVED" : approvalFor(approvals, "CERTIFICATE", sid));
  const certRequest = (sid: string) => approvals?.find((a) => a.kind === "CERTIFICATE" && a.studentId === sid);
  const sheetApproved = (sheet: MarksheetRecord) => isAdmin || approvalFor(approvals, "MARKSHEET", sheet.id) === "APPROVED";
  const waiting = (approvals || []).filter((a) => a.kind === "CERTIFICATE" && a.status !== "APPROVED");
  const studentApproval = student && !already ? certApproval(student.id) : null;

  const short = many
    ? manyCost > 0 && balance !== null && balance < manyCost
    : !already && fee > 0 && balance !== null && balance < fee;

  // The examination date defaults to the final result's date.
  useEffect(() => {
    if (sheet?.issueDate && !examDate) setExamDate(sheet.issueDate);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sheet?.issueDate]);

  type Dates = { issueDate: string; examConductedDate: string; certificateNo?: string };
  // The final term's roll number, else the latest one issued.
  const rollOf = (sid: string) => cards.filter((c) => c.studentId === sid).sort((a, b) => b.term - a.term)[0]?.rollNo;
  const certificateDoc = async (sid: string, dates: Dates) => {
    const { data } = await getStudentDocument(sid, ownBranch);
    const doc = { ...data, rollNo: rollOf(sid) || data.rollNo, issueDate: dates.issueDate, examinationDate: dates.examConductedDate };
    if (!doc.course?.name) throw new Error(`Assign ${studentName(studentOf.get(sid)) || "the student"}'s course first.`);
    // The designer's {{certificate_id}} shows the certificate's own number once issued.
    const extra = { certificate_no: dates.certificateNo || "", ...(dates.certificateNo ? { certificate_id: dates.certificateNo } : {}) };
    return { doc, extra, branchId: data.branchId || ownBranch };
  };
  const printFor = async (sid: string, dates: Dates) => {
    const { doc, extra, branchId: printBranch } = await certificateDoc(sid, dates);
    const printed = await printFromTemplate("certificate", doc, user?.organizationId ?? null, printBranch, extra);
    if (!printed) await certificatePdf(doc);
  };

  /**
   * Issues each chosen student's certificate in turn, then prints them all as
   * one run. A centre's new certificates go to the head office instead, and
   * print here once approved.
   */
  const generateMany = async () => {
    if (!issueDate) return toast({ title: "Choose the issue date", variant: "destructive" });
    setBusy(true);
    const printable: Array<{ doc: StudentDocument; extra: Record<string, string> }> = [];
    let issuedNow = 0;
    let charged = 0;
    let sent = 0;
    try {
      for (const [i, s] of chosen.entries()) {
        setProgress(`${i + 1} of ${chosen.length}: ${studentName(s)}`);
        const examConductedDate = examDate || finalPass(s.id)?.issueDate || "";
        if (!issuedFor(s.id)) {
          const status = await requestCertificateApproval(s.id, user?.name, { issueDate, examConductedDate: examConductedDate || null });
          if (status !== "APPROVED") {
            sent += 1;
            continue;
          }
        }
        const charge = await issueCertificate(s.id, user?.name, { issueDate, examConductedDate: examConductedDate || null });
        if (!charge.alreadyIssued) issuedNow += 1;
        if (charge.charged) charged += charge.amount;
        const prior = issuedFor(s.id);
        printable.push(
          await certificateDoc(s.id, {
            issueDate: prior?.issueDate || issueDate,
            examConductedDate: prior?.examConductedDate || examConductedDate,
            certificateNo: charge.certificateNo,
          }),
        );
      }
    } catch (e) {
      toast({
        title: `Stopped after ${printable.length + sent} of ${chosen.length}`,
        description: e instanceof Error ? e.message : "",
        variant: "destructive",
      });
    }
    if (sent) toast({ title: `${sent} sent for approval`, description: "They print here once the head office approves them." });
    try {
      if (printable.length) {
        setProgress("Preparing the print…");
        const docs = printable.map((p) => p.doc);
        const printed = await printManyFromTemplate("certificate", docs, user?.organizationId ?? null, branchId || ownBranch, printable.map((p) => p.extra));
        if (!printed) await certificatesPdf(docs, `certificates-${branchOf.get(branchId)?.name || "centre"}`);
        toast({
          title: `${printable.length} certificate(s) ready`,
          description: `${issuedNow} newly issued${charged ? `, ₹${charged.toLocaleString("en-IN")} deducted from the centre wallet` : ""}.`,
        });
      }
      setPicked(new Set());
      await load();
    } catch (e) {
      toast({ title: "Could not print the certificates", description: e instanceof Error ? e.message : "", variant: "destructive" });
    } finally {
      setProgress("");
      setBusy(false);
    }
  };

  const generate = async () => {
    if (!student) return toast({ title: "Choose the student", variant: "destructive" });
    if (!issueDate) return toast({ title: "Choose the issue date", variant: "destructive" });
    setBusy(true);
    try {
      // A student still on the older per-paper exams is checked the old way.
      if (!hasSheets(student.id)) {
        const { data } = await getStudentDocument(student.id, ownBranch);
        if (marksheetSummary(data.examResults).result !== "Pass") {
          throw new Error("No passed final result for this student. Create the final term result under Results first.");
        }
      }
      // A centre's new certificate waits for the head office.
      if (!already) {
        const status = await requestCertificateApproval(student.id, user?.name, { issueDate, examConductedDate: examDate || null });
        if (status !== "APPROVED") {
          toast({ title: "Sent for approval", description: `${studentName(student)}'s certificate is waiting for the head office. It prints here once approved.` });
          await load();
          return;
        }
      }
      const charge = await issueCertificate(student.id, user?.name, { issueDate, examConductedDate: examDate || null });
      await printFor(student.id, { issueDate, examConductedDate: examDate, certificateNo: charge.certificateNo });
      toast({
        title: charge.alreadyIssued ? "Certificate reprinted" : "Certificate issued",
        description: charge.charged ? `₹${charge.amount.toLocaleString("en-IN")} was deducted from the centre wallet.` : `${studentName(student)} is now a passout.`,
      });
      await load();
    } catch (e) {
      toast({ title: "Could not generate certificate", description: e instanceof Error ? e.message : "", variant: "destructive" });
    } finally {
      setBusy(false);
    }
  };

  const reprint = async (c: IssuedCertificate) => {
    try {
      await printFor(c.studentId, { issueDate: c.issueDate, examConductedDate: c.examConductedDate, certificateNo: c.certificateNo });
    } catch (e) {
      toast({ title: "Could not print", description: e instanceof Error ? e.message : "", variant: "destructive" });
    }
  };

  /** The marksheet that goes with the certificate: the final passed term, else the latest one. */
  /** The result a student's marksheet prints: the final passed term, else the latest one. */
  const sheetOf = (sid: string) => finalPass(sid) || sheets.filter((s) => s.studentId === sid).sort((a, b) => b.term - a.term)[0];
  const sheetOpts = (sheet: MarksheetRecord, examDate?: string) => ({
    course: courseOf.get(sheet.courseId),
    rollNo: cards.find((a) => a.studentId === sheet.studentId && a.term === sheet.term)?.rollNo,
    examinationDate: examDate || sheet.issueDate,
  });

  /** One student's marksheet, beside their certificate. */
  const printSheetFor = async (sid: string, dates: { issueDate: string; examConductedDate: string }) => {
    try {
      const sheet = sheetOf(sid);
      if (sheet && !sheetApproved(sheet)) {
        throw new Error("This marksheet is waiting for the head office's approval. It prints once approved.");
      }
      if (sheet) {
        await printMarksheet(sheet, { ...sheetOpts(sheet, dates.examConductedDate), organizationId: user?.organizationId ?? null, ownBranch });
        return;
      }
      // A student passed on the older per-paper exams has no term result: their published papers are the marksheet.
      const { data } = await getStudentDocument(sid, ownBranch);
      if (!data.examResults.length) throw new Error("This student has no result to print. Create it under Results first.");
      await marksheetPdf({ ...data, rollNo: rollOf(sid) || data.rollNo, issueDate: dates.issueDate, examinationDate: dates.examConductedDate });
    } catch (e) {
      toast({ title: "Could not print marksheet", description: e instanceof Error ? e.message : "", variant: "destructive" });
    }
  };
  const printSheet = (c: IssuedCertificate) => printSheetFor(c.studentId, { issueDate: c.issueDate, examConductedDate: c.examConductedDate });

  /** The ticked students' marksheets, together in one print run. */
  const printSheetsMany = async () => {
    const all = chosen.map((s) => sheetOf(s.id)).filter((s): s is MarksheetRecord => !!s);
    const withSheets = all.filter(sheetApproved);
    if (!all.length) return toast({ title: "No results to print", description: "None of the ticked students has a result yet.", variant: "destructive" });
    if (!withSheets.length) return toast({ title: "Waiting for approval", description: "None of these marksheets has been approved by the head office yet.", variant: "destructive" });
    if (withSheets.length < all.length) toast({ title: `${all.length - withSheets.length} marksheet(s) left out`, description: "They are waiting for the head office's approval." });
    setBusy(true);
    try {
      await printMarksheets(withSheets.map((sheet) => ({ sheet, opts: sheetOpts(sheet, examDate) })), user?.organizationId ?? null, ownBranch);
    } catch (e) {
      toast({ title: "Could not print marksheets", description: e instanceof Error ? e.message : "", variant: "destructive" });
    } finally {
      setBusy(false);
    }
  };

  type Row = IssuedCertificate & { name: string; enrollmentNo: string; courseName: string; centre: string; phone: string; grade: string };
  const rows: Row[] = issued.map((c) => {
    const st = studentOf.get(c.studentId);
    const fin = finalPass(c.studentId);
    return {
      ...c,
      name: studentName(st) || "—",
      enrollmentNo: st?.enrollmentNo || st?.applicationNo || "—",
      courseName: courseOf.get(st?.courseId || "")?.name || "—",
      centre: branchOf.get(c.branchId)?.name || "—",
      phone: st?.phone || "",
      grade: fin ? `${fin.percentage}% · ${fin.grade}` : "—",
    };
  });
  const columns: Column<Row>[] = [
    { key: "enrollmentNo", header: "Enrollment No", sortable: true, cell: (r) => <span className="font-mono text-xs">{r.enrollmentNo}</span> },
    { key: "name", header: "Student", sortable: true, cell: (r) => <span className="font-medium">{r.name}</span> },
    { key: "courseName", header: "Course" },
    ...(passoutOnly
      ? [{ key: "phone", header: "Contact" } as Column<Row>, { key: "grade", header: "Final result" } as Column<Row>]
      : [
          { key: "certificateNo", header: "Certificate No", cell: (r: Row) => <span className="font-mono text-xs">{r.certificateNo || "—"}</span> } as Column<Row>,
          { key: "issueDate", header: "Issue date", sortable: true, cell: (r: Row) => shown(r.issueDate) } as Column<Row>,
          { key: "amount", header: "Fee", cell: (r: Row) => (r.amount ? `₹${r.amount.toLocaleString("en-IN")}` : "Free") } as Column<Row>,
        ]),
    { key: "centre", header: "Institute" },
  ];

  return (
    <AppLayout>
      <PageHeader
        title={passoutOnly ? "Passout Students" : "Certificates"}
        description={passoutOnly ? "Students whose course completion certificate has been issued" : "Issue completion certificates on the passed final result"}
        breadcrumbs={[{ label: passoutOnly ? "Student Management" : "Certificate & Marksheet" }, { label: passoutOnly ? "Passout Students" : "Certificates" }]}
      />
      {!passoutOnly && (
        <Card className="mb-4">
          <CardHeader className="flex flex-row flex-wrap items-center justify-between gap-3 space-y-0">
            <CardTitle>Generate certificate</CardTitle>
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
              <div className="space-y-2">
                <Label>Centre</Label>
                <Select value={branchId} onValueChange={(v) => { setBranchId(v); setStudentId(""); }} disabled={!!ownBranch}>
                  <SelectTrigger><SelectValue placeholder="Select centre" /></SelectTrigger>
                  <SelectContent searchable searchPlaceholder="Search centre…">{branches.map((b) => <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              {!many && <div className="space-y-2">
                <Label>Student</Label>
                <Select value={studentId} onValueChange={(v) => { setStudentId(v); setExamDate(""); }}>
                  <SelectTrigger><SelectValue placeholder="Select student" /></SelectTrigger>
                  <SelectContent searchable searchPlaceholder="Search student or enrollment…">
                    {candidates.map((s) => (
                      <SelectItem key={s.id} value={s.id}>
                        {studentName(s)}{(s.enrollmentNo || s.applicationNo) ? ` · ${(s.enrollmentNo || s.applicationNo)}` : ""}
                        {issuedFor(s.id) ? " · issued" : finalPass(s.id) ? " · eligible" : ""}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>}
              <div className="space-y-2">
                <Label>Issue date</Label>
                <DatePicker value={issueDate} onChange={setIssueDate} />
              </div>
              <div className="space-y-2">
                <Label>Examination conducted date</Label>
                <DatePicker value={examDate} onChange={setExamDate} />
                {many && <p className="text-xs text-muted-foreground">Left empty, each student's own result date is used.</p>}
              </div>
            </div>
            {many && !branchId && <p className="text-sm text-muted-foreground">Choose the centre to list its students who passed.</p>}
            {many && branchId && (
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
                  {listed.map((s) => {
                    const done = issuedFor(s.id);
                    const fin = finalPass(s.id);
                    return (
                      <label key={s.id} className="flex items-center gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-muted/60">
                        <Checkbox checked={picked.has(s.id)} onCheckedChange={(v) => toggle(s.id, v === true)} aria-label={studentName(s)} />
                        <span className="min-w-0 flex-1 truncate">
                          {studentName(s)}
                          {(s.enrollmentNo || s.applicationNo) ? <span className="text-xs text-muted-foreground"> · {s.enrollmentNo || s.applicationNo}</span> : null}
                        </span>
                        {done ? (
                          <Badge variant="secondary" className="text-[10px]">issued</Badge>
                        ) : certApproval(s.id) === "PENDING" ? (
                          <Badge variant="outline" className="border-amber-300 text-[10px] text-amber-700">awaiting approval</Badge>
                        ) : certApproval(s.id) === "REJECTED" ? (
                          <Badge variant="destructive" className="text-[10px]">rejected</Badge>
                        ) : fin ? (
                          <Badge variant="outline" className="text-[10px]">{fin.percentage}% · {fin.grade}</Badge>
                        ) : null}
                      </label>
                    );
                  })}
                  {!listed.length && <p className="p-3 text-sm text-muted-foreground">No student of this centre has a passed final result{query ? " matching the search" : ""}.</p>}
                </div>
                {notReady > 0 && <p className="text-xs text-muted-foreground">{notReady} other student(s) have no passed final result yet, so they are not listed.</p>}
              </div>
            )}
            {many && chosen.length > 0 && (
              <p className="text-sm text-muted-foreground">
                {newOnes.length} new certificate(s){chosen.length > newOnes.length ? `, ${chosen.length - newOnes.length} reprint(s) (free)` : ""}.{" "}
                {manyCost > 0
                  ? `₹${manyCost.toLocaleString("en-IN")} will be deducted from ${branchOf.get(branchId)?.name || "the centre"}'s wallet${balance !== null ? ` (balance ₹${balance.toLocaleString("en-IN")})` : ""}.`
                  : "No certificate fee for this centre."}
              </p>
            )}
            {!many && student && (
              <div className="rounded-xl bg-muted/40 p-3 text-sm">
                <p className="font-medium">{studentName(student)} · {courseOf.get(student.courseId)?.name || "No course"}</p>
                <p className="text-muted-foreground">
                  {already
                    ? `Certificate ${already.certificateNo || ""} already issued on ${shown(already.issueDate)} — printing it again is free.`
                    : studentApproval === "PENDING"
                      ? `Sent for approval on ${shown(certRequest(student.id)?.requestedAt || "")} — waiting for the head office. It prints here once approved.`
                      : studentApproval === "REJECTED"
                        ? `The head office rejected this request${certRequest(student.id)?.note ? `: "${certRequest(student.id)?.note}"` : ""}. Correct it and send again.`
                    : sheet
                      ? `Final result: ${sheet.percentage}% · Grade ${sheet.grade} · PASS. ${fee > 0 ? `₹${fee.toLocaleString("en-IN")} will be deducted from ${branchOf.get(student.branchId)?.name || "the centre"}'s wallet${balance !== null ? ` (balance ₹${balance.toLocaleString("en-IN")})` : ""}${isAdmin ? "" : " when the head office approves"}.` : "No certificate fee for this centre."}`
                      : hasSheets(student.id)
                        ? "No passed final-term result yet — the certificate cannot be issued."
                        : "No result on the new Results page; the older published exams will be checked."}
                </p>
              </div>
            )}
            {short && (
              <p className="text-sm text-destructive">
                Wallet balance ₹{balance?.toLocaleString("en-IN")} is less than the ₹{(many ? manyCost : fee).toLocaleString("en-IN")} {many ? "these certificates cost" : "certificate fee"}.{" "}
                <Link to="/branch/wallet" className="font-semibold underline">Recharge the wallet</Link> first.
              </p>
            )}
            {many ? (
              <div className="flex flex-wrap items-center gap-3">
                <Button onClick={generateMany} disabled={busy || !chosen.length || short}>
                  {busy
                    ? "Working…"
                    : !isAdmin && newOnes.length
                      ? `Send ${newOnes.length} for approval${chosen.length > newOnes.length ? ` · print ${chosen.length - newOnes.length}` : ""}`
                      : `Generate ${chosen.length || ""} certificate${chosen.length === 1 ? "" : "s"}`.replace("  ", " ")}
                </Button>
                <Button variant="outline" onClick={() => void printSheetsMany()} disabled={busy || !chosen.length}>
                  <Printer className="mr-2 h-4 w-4" />
                  Print {chosen.length || ""} marksheet{chosen.length === 1 ? "" : "s"}
                </Button>
                {progress && <span className="text-sm text-muted-foreground">{progress}</span>}
              </div>
            ) : (
              <div className="flex flex-wrap items-center gap-3">
                <Button onClick={generate} disabled={busy || !student || short || (hasSheets(studentId) && !sheet && !already) || studentApproval === "PENDING"}>
                  {busy
                    ? "Working…"
                    : already
                      ? "Reprint certificate"
                      : isAdmin
                        ? "Generate certificate"
                        : studentApproval === "PENDING"
                          ? "Waiting for approval"
                          : studentApproval === "REJECTED"
                            ? "Send for approval again"
                            : "Send for approval"}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => student && void printSheetFor(student.id, { issueDate: already?.issueDate || issueDate, examConductedDate: already?.examConductedDate || examDate })}
                  disabled={busy || !student}
                >
                  <Printer className="mr-2 h-4 w-4" />
                  Print marksheet
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {!passoutOnly && isAdmin && waiting.some((w) => w.status === "PENDING") && (
        <Card className="mb-4 border-amber-200 bg-amber-50/60">
          <CardContent className="flex flex-wrap items-center justify-between gap-3 pt-6 text-sm">
            <span>{waiting.filter((w) => w.status === "PENDING").length} certificate request(s) from centres are waiting for your approval.</span>
            <Button asChild size="sm"><Link to="/certificate/approvals">Open Print Approvals</Link></Button>
          </CardContent>
        </Card>
      )}

      {!passoutOnly && !isAdmin && waiting.length > 0 && (
        <Card className="mb-4">
          <CardHeader><CardTitle>Sent for approval <Badge variant="secondary" className="ml-2">{waiting.length}</Badge></CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {waiting.map((w) => {
              const st = studentOf.get(w.studentId);
              return (
                <div key={w.id} className="flex flex-wrap items-center justify-between gap-2 rounded-lg border px-3 py-2 text-sm">
                  <span className="min-w-0">
                    <span className="font-medium">{studentName(st) || "Student"}</span>
                    <span className="text-muted-foreground"> · {st?.enrollmentNo || st?.applicationNo || ""} · sent {shown(w.requestedAt)}</span>
                    {w.status === "REJECTED" && w.note && <span className="block text-xs text-destructive">Reason: {w.note}</span>}
                  </span>
                  {w.status === "PENDING" ? (
                    <Badge variant="outline" className="border-amber-300 text-amber-700">Awaiting approval</Badge>
                  ) : (
                    <Badge variant="destructive">Rejected</Badge>
                  )}
                </div>
              );
            })}
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader><CardTitle>{passoutOnly ? "Passout students" : "Issued certificates"} <Badge variant="secondary" className="ml-2">{rows.length}</Badge></CardTitle></CardHeader>
        <CardContent>
          <DataTable
            data={rows}
            columns={columns}
            searchPlaceholder="Search name, enrollment, certificate no…"
            filters={[{ label: "Course", key: "courseName" }, { label: "Institute", key: "centre" }]}
            actions={(r) => [
              { label: "Print certificate", onClick: () => void reprint(r) },
              { label: "Print marksheet", onClick: () => void printSheet(r) },
            ]}
            emptyMessage="No certificates issued yet."
          />
        </CardContent>
      </Card>
    </AppLayout>
  );
}
