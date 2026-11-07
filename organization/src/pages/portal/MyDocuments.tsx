import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Download, FileText, IdCard, Printer, Send } from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { PageHeader } from "@/components/ui/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { getPortalRequests, getStudentProfile, getStudentPortalInvoices, getStudentPortalResults, submitPortalRequest } from "@/lib/supabase/data";
import { useAuth } from "@/contexts/AuthContext";
import { downloadHtml, printHtml } from "@/lib/export";
import { admissionPdf } from "@/lib/documents";
import { blankAdmitCardTemplate, type Exam } from "@/data/admit-card-templates";
import { getPublicAdmitCard, type PublicAdmitCard } from "@/lib/supabase/examWorkflow";
import { termLabel, termPlan } from "@/lib/examWorkflow";
import { studentCardsPdf } from "@/lib/brand/brandDocuments";
import { admitCardsPdf } from "@/lib/admit-card-pdf";
import {
  REQUEST_KINDS,
  asAdmitCardStudent,
  asIdCardStudent,
  asStudentDocument,
  feeSummary,
  money,
  type PortalInvoice,
  type PortalResult,
  type StudentProfile,
} from "@/data/student-portal";

interface PortalRequest {
  id: string;
  kind: string;
  detail: string;
  raisedAt: string;
  status: "open" | "resolved";
}

export default function MyDocuments() {
  const { toast } = useToast();
  const { user } = useAuth();
  const userId = user?.id;
  const branchId = user?.branchId;
  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const [invoices, setInvoices] = useState<PortalInvoice[]>([]);
  const [results, setResults] = useState<PortalResult[]>([]);
  const [requests, setRequests] = useState<PortalRequest[]>([]);
  const [admitTemplates, setAdmitTemplates] = useState<import("@/data/admit-card-templates").AdmitCardTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [admitTemplateId, setAdmitTemplateId] = useState("");
  // The admit card the centre issued (exam-workflow.sql): roll number, exam
  // centre and the paper-by-paper schedule.
  const [issuedCard, setIssuedCard] = useState<PublicAdmitCard | null>(null);
  const [requestKind, setRequestKind] = useState(REQUEST_KINDS[2]);
  const [requestNote, setRequestNote] = useState("");
  const [requestOpen, setRequestOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    // Admit card templates are still read from this browser (the admit card
    // keeps its field-list layout); the ID card is the academy's own.
    const localAdmitTemplates: import("@/data/admit-card-templates").AdmitCardTemplate[] = (() => {
      try {
        const raw = localStorage.getItem("erp-admit-card-templates");
        return raw ? JSON.parse(raw) : [];
      } catch { return []; }
    })();

    Promise.all([
      getStudentProfile(userId, branchId),
      getStudentPortalInvoices(userId, branchId),
      getStudentPortalResults(userId, branchId),
      // Was a REST call against an API server that is not part of this
      // deployment, so the whole Promise.all rejected and the page never loaded.
      getPortalRequests(userId, branchId),
    ])
      .then(([profileResult, invoicesResult, resultsResult, requestsRes]) => {
        if (cancelled) return;
        setProfile(profileResult.data);
        if (profileResult.data?.enrollmentNo) {
          getPublicAdmitCard(profileResult.data.enrollmentNo)
            .then((card) => { if (!cancelled) setIssuedCard(card); })
            .catch(() => { /* no admit card section rather than a failed page */ });
        }
        setInvoices(invoicesResult.data);
        setResults(resultsResult.data);
        setRequests(
          (requestsRes.data || []).map((req) => {
            const row = req as Record<string, any>;
            return {
              id: String(row.id),
              kind: String(row.action ?? ""),
              detail: String(row.after?.detail ?? ""),
              raisedAt: String(row.createdAt ?? ""),
              status: "open" as const,
            };
          }),
        );
        setAdmitTemplates(localAdmitTemplates);
        const activeAdmits = localAdmitTemplates.filter((t) => t.status === "active");
        if (activeAdmits.length) setAdmitTemplateId(activeAdmits[0].id);
      })
      .catch((err) => {
        if (cancelled) return;
        setError(err.message || "Failed to load documents");
        toast({ title: "Could not load documents", description: err.message || "Please try again.", variant: "destructive" });
      })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [toast, userId, branchId]);

  const activeAdmitTemplates = admitTemplates.filter((template) => template.status === "active");
  const dues = feeSummary(invoices);
  const admitTemplate = activeAdmitTemplates.find((template) => template.id === admitTemplateId);
  const day = (iso: string) =>
    iso ? new Date(`${iso}T00:00:00`).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "";
  const cardDates = (issuedCard?.schedule || []).map((s) => s.date).filter(Boolean).sort();
  const exam: Exam | undefined = issuedCard?.issued
    ? {
        value: "issued",
        label: `${issuedCard.student?.course || "Examination"} — ${termLabel(termPlan(issuedCard.courseTerms).type, issuedCard.term || 1)}${issuedCard.session ? ` (${issuedCard.session})` : ""}`,
        window: cardDates.length ? `${day(cardDates[0])}${cardDates.length > 1 ? ` to ${day(cardDates[cardDates.length - 1])}` : ""}` : "To be announced",
        schedule: [
          ...(issuedCard.examCentre ? [{ subject: "Exam centre", when: [issuedCard.examCentre.name, issuedCard.examCentre.address].filter(Boolean).join(", ") }] : []),
          ...(issuedCard.schedule || []).map((s) => ({ subject: s.subject, when: `${day(s.date)} ${s.time}` })),
        ],
      }
    : undefined;
  const idStudent = profile ? asIdCardStudent(profile) : null;
  const admitBlocked = dues.overdue > 0;
  const baseAdmit = profile ? asAdmitCardStudent(profile, dues.due > 0 ? (admitBlocked ? "overdue" : "pending") : "paid") : null;
  const admitStudent = baseAdmit && issuedCard?.issued ? { ...baseAdmit, rollNo: issuedCard.rollNo || baseAdmit.rollNo } : null;
  // The institute's template when this browser has one, otherwise the standard layout.
  const template = admitTemplate || { ...blankAdmitCardTemplate(), id: "standard", name: "Admit card", status: "active" as const };
  const admitCard = exam ? { ...template, exam: exam.value, liveExam: exam } : undefined;

  const [cardBusy, setCardBusy] = useState(false);
  const saveIdCard = async () => {
    if (!idStudent) return;
    setCardBusy(true);
    try {
      await studentCardsPdf([idStudent], `id-card-${profile?.rollNo || profile?.enrollmentNo}.pdf`);
      toast({ title: "ID card downloaded", description: "Print it at actual size; the back is beside the front." });
    } catch (err) {
      toast({ title: "Could not make the card", description: err instanceof Error ? err.message : undefined, variant: "destructive" });
    } finally {
      setCardBusy(false);
    }
  };
  const downloadAdmitCard = () => {
    if (!admitCard || !admitStudent) return toast({ title: "Admit card not issued yet", description: "Your centre issues it once the exam schedule is out.", variant: "destructive" });
    if (admitBlocked) return toast({ title: "Admit card on hold", description: `${money(dues.overdue)} is overdue. Clear it from Fees & receipts to release the card.`, variant: "destructive" });
    admitCardsPdf(admitCard, [admitStudent], `admit-card-${profile?.rollNo}.pdf`);
    toast({ title: "Admit card downloaded", description: `${exam?.label} · ${exam?.window}` });
  };

  const submitRequest = async () => {
    if (!requestNote.trim()) return toast({ title: "Add a note", description: "Say what you need the document for.", variant: "destructive" });
    setSubmitting(true);
    try {
      const result = await submitPortalRequest(userId, branchId, user?.organizationId, requestKind, requestNote.trim());
      const newRequest: PortalRequest = {
        id: result.data.id,
        kind: result.data.action,
        detail: result.data.after.detail,
        raisedAt: result.data.createdAt,
        status: "open",
      };
      setRequests((prev) => [newRequest, ...prev]);
      toast({ title: "Request sent", description: `${requestKind} · the branch office will respond on your registered email.` });
      setRequestOpen(false);
      setRequestNote("");
    } catch (err) {
      toast({ title: "Request failed", description: err.message || "Please try again.", variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  if (error) {
    return (
      <AppLayout>
        <PageHeader title="ID & admit card" description="The documents the institute has published for you, plus a way to ask for one it has not." breadcrumbs={[{ label: "ID & admit card" }]} actions={<Button variant="outline" onClick={() => setRequestOpen(true)}><Send />Request a document</Button>} />
        <Card><CardContent className="py-12 text-center text-sm text-destructive">{error}</CardContent></Card>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <PageHeader
        title="ID & admit card"
        description="The documents the institute has published for you, plus a way to ask for one it has not."
        breadcrumbs={[{ label: "ID & admit card" }]}
        actions={<Button variant="outline" onClick={() => setRequestOpen(true)}><Send />Request a document</Button>}
      />

      {loading ? (
        <Card><CardContent className="py-12 text-center text-sm text-muted-foreground">Loading documents…</CardContent></Card>
      ) : (
        <div className="grid gap-5 xl:grid-cols-2">
          <Card>
            <CardHeader className="flex-row items-center justify-between space-y-0">
              <CardTitle className="flex items-center gap-2"><IdCard className="h-4 w-4" />Student ID card</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-muted-foreground">
                Your identity card on the academy's design: name, course, enrolment number, photo and a QR code that verifies you. The PDF has the front and the back side by side.
              </p>
              <Button size="sm" onClick={saveIdCard} disabled={!profile || cardBusy}><Download className="mr-1.5 h-3.5 w-3.5" />Download ID card</Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex-row items-center justify-between space-y-0">
              <CardTitle className="flex items-center gap-2"><FileText className="h-4 w-4" />Admit card</CardTitle>
              {issuedCard?.issued && <Badge variant="secondary">Roll {issuedCard.rollNo}</Badge>}
            </CardHeader>
            <CardContent>
              {admitBlocked && <p className="mb-3 rounded-xl border border-destructive/25 bg-destructive/10 p-3 text-xs text-destructive">Held back: {money(dues.overdue)} is overdue. The card is released as soon as the balance is cleared.</p>}
              {admitCard && admitStudent
                ? <p className="text-sm text-muted-foreground">{exam?.label} · {exam?.window}. Your admit card is on the academy's letterhead with your roll number, photo and paper-wise schedule.</p>
                : <p className="py-10 text-center text-sm text-muted-foreground">Your admit card has not been issued yet. It appears here once your centre issues it.</p>}
              <div className="mt-4 flex flex-wrap gap-2">
                <Button size="sm" onClick={downloadAdmitCard} disabled={!admitCard || !profile}><Download className="mr-1.5 h-3.5 w-3.5" />Download PDF</Button>
                {exam && <span className="self-center text-xs text-muted-foreground">{exam.window}</span>}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>Other documents</CardTitle></CardHeader>
            <CardContent className="space-y-2">
              <div className="flex items-center gap-3 rounded-2xl border border-border/70 p-3">
                <div className="min-w-0 flex-1"><p className="text-sm font-semibold">Admission summary</p><p className="text-xs text-muted-foreground">Course, batch and enrolment as recorded on {profile ? new Date(profile.admissionDate).toLocaleDateString("en-IN") : "—"}</p></div>
                <Button size="sm" variant="outline" onClick={() => { if (!profile) return; admissionPdf(asStudentDocument(profile, invoices, results)); toast({ title: "Admission summary downloaded" }); }} disabled={!profile}><Download className="mr-1.5 h-3.5 w-3.5" />PDF</Button>
              </div>
              <div className="flex items-center gap-3 rounded-2xl border border-border/70 p-3">
                <div className="min-w-0 flex-1"><p className="text-sm font-semibold">Marksheet & certificate</p><p className="text-xs text-muted-foreground">Issued from your published results</p></div>
                <Button size="sm" variant="ghost" asChild><Link to="/me/results">Open results</Link></Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>My requests</CardTitle></CardHeader>
            <CardContent className="space-y-2">
              {requests.length
                ? requests.map((request) => (
                    <div key={request.id} className="flex items-start gap-3 border-b py-3 last:border-0">
                      <div className="min-w-0 flex-1"><p className="text-sm font-semibold">{request.kind}</p><p className="text-xs text-muted-foreground">{request.detail}</p><p className="mt-1 text-[11px] text-muted-foreground">Raised {new Date(request.raisedAt).toLocaleString("en-IN")}</p></div>
                      <Badge variant={request.status === "open" ? "default" : "secondary"} className="capitalize">{request.status}</Badge>
                    </div>
                  ))
                : <p className="py-8 text-center text-sm text-muted-foreground">Nothing raised yet. Use "Request a document" for anything not listed here.</p>}
            </CardContent>
          </Card>
        </div>
      )}

      <Dialog open={requestOpen} onOpenChange={setRequestOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Request a document</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Document</Label>
              <Select value={requestKind} onValueChange={setRequestKind}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{REQUEST_KINDS.map((kind) => <SelectItem key={kind} value={kind}>{kind}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="note">Details</Label>
              <Textarea id="note" rows={4} value={requestNote} onChange={(event) => setRequestNote(event.target.value)} placeholder="Needed for a scholarship application; a scanned copy on email is fine." />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRequestOpen(false)} disabled={submitting}>Cancel</Button>
            <Button onClick={submitRequest} disabled={submitting}>{submitting ? "Sending…" : "Send request"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}
