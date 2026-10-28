import { useEffect, useMemo, useState } from "react";
import { Award, Download, Printer } from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { PageHeader } from "@/components/ui/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { getStudentPortalInvoices, getStudentProfile, getStudentPortalResults, issueCertificate, submitPortalRequest } from "@/lib/supabase/data";
import { useAuth } from "@/contexts/AuthContext";
import { certificatePdf, marksheetPdf } from "@/lib/documents";
import { downloadCsv, printHtml } from "@/lib/export";
import {
  resultSummary,
  asStudentDocument,
  type StudentProfile,
} from "@/data/student-portal";
import type { StudentDocument } from "@/lib/documents";


interface PortalInvoice {
  id: string;
  invoiceNo: string;
  description: string;
  amount: number;
  paid: number;
  dueDate: string;
  method?: string;
  paidAt?: string;
  receiptNo?: string;
}

interface PortalResult {
  id: string;
  exam: string;
  subject: string;
  maxMarks: number;
  passMarks: number;
  marks: number;
  examDate: string;
}

const grade = (percentage: number) =>
  percentage >= 85 ? "A+" : percentage >= 75 ? "A" : percentage >= 60 ? "B" : percentage >= 45 ? "C" : percentage >= 40 ? "D" : "F";

export default function MyResults() {
  const { toast } = useToast();
  const { user } = useAuth();
  const userId = user?.id;
  const branchId = user?.branchId;
  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const [results, setResults] = useState<PortalResult[]>([]);
  const [invoices, setInvoices] = useState<PortalInvoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [exam, setExam] = useState("");
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    let cancelled = false;
    // The signed-in student arrives a render after the page mounts, so a fetch
    // that does not wait for it queries `userId = undefined`, fails, and — with
    // no dependency on the id — never runs again once the session resolves.
    if (!userId || !branchId) return;
    setLoading(true);
    setError(null);
    Promise.all([
      getStudentProfile(userId, branchId),
      getStudentPortalResults(userId, branchId),
      getStudentPortalInvoices(userId, branchId),
    ])
      .then(([profileResult, resultsResult, invoicesResult]) => {
        if (cancelled) return;
        const profileData = profileResult.data;
        const resultsData = resultsResult.data;
        const invoicesData = invoicesResult.data;
        setProfile(profileData);
        setResults(resultsData);
        setInvoices(invoicesData);
        const exams = [...new Set(resultsData.map((r) => r.exam))];
        setExam(exams[0] ?? "");
      })
      .catch((err) => {
        if (cancelled) return;
        setError(err.message || "Failed to load results");
        toast({ title: "Could not load results", description: err.message || "Please try again.", variant: "destructive" });
      })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [toast, userId, branchId]);

  const exams = useMemo(() => [...new Set(results.map((result) => result.exam))], [results]);

  const rows = useMemo(() => results.filter((result) => result.exam === exam), [results, exam]);
  const summary = useMemo(() => resultSummary(rows), [rows]);
  const overall = useMemo(() => resultSummary(results), [results]);
  const dues = useMemo(() => {
    const billed = invoices.reduce((sum, inv) => sum + inv.amount, 0);
    const paid = invoices.reduce((sum, inv) => sum + inv.paid, 0);
    return billed - paid;
  }, [invoices]);

  const asDoc = (): StudentDocument | null => {
    if (!profile) return null;
    return asStudentDocument(profile, invoices, exam ? rows : results);
  };

  const marksheet = async () => {
    if (!rows.length) return;
    const doc = asDoc();
    if (!doc) return;
    setProcessing(true);
    try {
      // Awaited: the marksheet renders a QR of the enrolment, so the file is
      // not on disk when the call returns and the toast would precede it.
      await marksheetPdf(doc);
      toast({ title: "Marksheet downloaded", description: `${exam} · ${rows.length} subjects` });
    } catch (err) {
      toast({
        title: "Marksheet failed",
        description: err instanceof Error ? err.message : "Please try again",
        variant: "destructive",
      });
    } finally {
      setProcessing(false);
    }
  };

  const print = () => {
    if (!profile || !rows.length) return;
    printHtml(`${exam} result — ${profile.name}`, `
      <h1 style="font:600 20px/1.2 system-ui;margin:0 0 4px">${profile.name}</h1>
      <p style="font:13px system-ui;color:#555;margin:0 0 18px">${profile.course} · ${profile.batch} · Enrolment ${profile.enrollmentNo} · ${exam}</p>
      <table style="width:100%;border-collapse:collapse;font:13px system-ui">
        <thead><tr style="background:#f4f4f5;text-align:left"><th style="padding:8px">Subject</th><th style="padding:8px">Max</th><th style="padding:8px">Pass</th><th style="padding:8px">Marks</th><th style="padding:8px">Result</th></tr></thead>
        <tbody>${rows.map((result) => `<tr style="border-bottom:1px solid #e4e4e7"><td style="padding:8px">${result.subject}</td><td style="padding:8px">${result.maxMarks}</td><td style="padding:8px">${result.passMarks}</td><td style="padding:8px"><b>${result.marks}</b></td><td style="padding:8px">${result.marks >= result.passMarks ? "PASS" : "REVIEW"}</td></tr>`).join("")}</tbody>
      </table>
      <p style="font:600 14px system-ui;margin-top:18px">Total ${summary.scored} / ${summary.max} · ${summary.percentage}% · Grade ${grade(summary.percentage)}</p>
      <p style="font:11px system-ui;color:#777">Generated from the student portal. Verify against institute records.</p>
    `);
  };

  const certificate = async () => {
    if (overall.failed) return toast({ title: "Certificate not available yet", description: `${overall.failed} subject${overall.failed === 1 ? "" : "s"} still need a pass before the certificate is issued.`, variant: "destructive" });
    if (dues > 0) return toast({ title: "Clear your dues first", description: "The certificate is released once the fee account is settled.", variant: "destructive" });
    const doc = asDoc();
    if (!doc) return;
    setProcessing(true);
    try {
      // The first certificate a student receives is paid for by their centre's
      // wallet, whoever generates it; a wallet that cannot cover it holds the
      // download until the centre recharges.
      await issueCertificate(profile?.id ?? "", user?.name);
      await certificatePdf(doc);
      toast({ title: "Certificate downloaded" });
    } catch (err) {
      const message = err instanceof Error ? err.message : "";
      toast({
        title: "Certificate not available yet",
        description: /wallet balance/i.test(message)
          ? "Your centre has not released the certificate yet. Please contact your centre."
          : message || "Please try again.",
        variant: "destructive",
      });
    } finally {
      setProcessing(false);
    }
  };

  if (error) {
    return (
      <AppLayout>
        <PageHeader title="Results & marksheets" description="Your marks for every assessment, with the marksheet you can print or download." breadcrumbs={[{ label: "Results & marksheets" }]} />
        <Card><CardContent className="py-12 text-center text-sm text-destructive">{error}</CardContent></Card>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <PageHeader
        title="Results & marksheets"
        description="Your marks for every assessment, with the marksheet you can print or download."
        breadcrumbs={[{ label: "Results & marksheets" }]}
        actions={<>
          <Button variant="outline" onClick={() => downloadCsv("my-results.csv", results)} disabled={loading || processing || !results.length}><Download />Export CSV</Button>
          <Button variant="outline" onClick={certificate} disabled={loading || processing || !results.length}><Award />Certificate</Button>
        </>}
      />

      {loading ? (
        <Card><CardContent className="py-12 text-center text-sm text-muted-foreground">Loading results…</CardContent></Card>
      ) : (
        <>
          <div className="mb-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {[
              { label: "Overall", value: `${overall.percentage}%`, note: `${overall.scored} of ${overall.max} marks` },
              { label: "Grade", value: grade(overall.percentage), note: "across all assessments" },
              { label: "Assessments", value: overall.exams.length, note: `${results.length} subject entries` },
              { label: "Needs a re-attempt", value: overall.failed, note: overall.failed ? "below the pass mark" : "nothing pending" },
            ].map((stat) => (
              <Card key={stat.label}><CardContent className="p-4"><p className="eyebrow">{stat.label}</p><p className="metric mt-3">{stat.value}</p><p className="mt-2 text-xs text-muted-foreground">{stat.note}</p></CardContent></Card>
            ))}
          </div>

          <Card>
            <CardHeader className="flex-col items-start gap-3 space-y-0 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-3">
                <CardTitle className="whitespace-nowrap">Result sheet</CardTitle>
                <Select value={exam} onValueChange={setExam}>
                  <SelectTrigger className="w-[190px]"><SelectValue placeholder="Assessment" /></SelectTrigger>
                  <SelectContent>{exams.map((value) => <SelectItem key={value} value={value}>{value}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={print} disabled={!rows.length || processing}><Printer className="mr-1.5 h-3.5 w-3.5" />Print</Button>
                <Button size="sm" onClick={marksheet} disabled={!rows.length || processing}><Download className="mr-1.5 h-3.5 w-3.5" />Marksheet PDF</Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="mb-4 flex flex-wrap items-end gap-4">
                <div><p className="metric">{summary.percentage}%</p><p className="text-xs text-muted-foreground">{summary.scored} of {summary.max} marks · grade {grade(summary.percentage)}</p></div>
                <Progress value={summary.percentage} className="h-2 min-w-[180px] flex-1" />
              </div>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader><TableRow><TableHead>Subject</TableHead><TableHead>Date</TableHead><TableHead className="text-right">Max</TableHead><TableHead className="text-right">Pass</TableHead><TableHead className="text-right">Marks</TableHead><TableHead>Result</TableHead></TableRow></TableHeader>
                  <TableBody>
                    {rows.map((result) => (
                      <TableRow key={result.id}>
                        <TableCell className="font-medium">{result.subject}</TableCell>
                        <TableCell className="whitespace-nowrap">{new Date(result.examDate).toLocaleDateString("en-IN")}</TableCell>
                        <TableCell className="tabular text-right">{result.maxMarks}</TableCell>
                        <TableCell className="tabular text-right">{result.passMarks}</TableCell>
                        <TableCell className="tabular text-right font-semibold">{result.marks}</TableCell>
                        <TableCell><Badge variant={result.marks >= result.passMarks ? "secondary" : "destructive"}>{result.marks >= result.passMarks ? "Pass" : "Review"}</Badge></TableCell>
                      </TableRow>
                    ))}
                    {!rows.length && <TableRow><TableCell colSpan={6} className="py-10 text-center text-sm text-muted-foreground">No results published for this assessment yet.</TableCell></TableRow>}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </AppLayout>
  );
}
