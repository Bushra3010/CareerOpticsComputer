import { useEffect, useMemo, useState } from "react";
import { Camera, CheckCircle2, Download, Flag, QrCode } from "lucide-react";
import { CameraCheckIn } from "@/components/attendance/CameraCheckIn";
import { AppLayout } from "@/components/layout/AppLayout";
import { PageHeader } from "@/components/ui/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { getPortalRequests, getStudentPortalAttendance, submitPortalRequest } from "@/lib/supabase/data";
import { downloadCsv } from "@/lib/export";
import { useAuth } from "@/contexts/AuthContext";
import { attendanceSummary, type AttendanceDay } from "@/data/student-portal";

interface AttendanceRecord {
  id: string;
  date: string;
  status: string;
  remarks?: string;
  student?: { firstName: string; lastName: string; enrollmentNo: string };
}

interface PortalRequestResponse {
  id: string;
  entity: string;
  action: string;
  userId: string;
  organizationId: string;
  branchId: string;
  after: { detail: string; studentId?: string };
  createdAt: string;
}

interface PortalRequest {
  id: string;
  kind: string;
  detail: string;
  raisedAt: string;
  status: "open" | "resolved";
}

const TONE: Record<AttendanceDay["status"], "default" | "secondary" | "destructive" | "outline"> = {
  present: "secondary", late: "outline", absent: "destructive", holiday: "outline",
};
const monthKey = (date: string) => date.slice(0, 7);
const monthLabel = (key: string) =>
  new Date(`${key}-01`).toLocaleDateString("en-IN", { month: "long", year: "numeric" });

const toFrontendStatus = (backend: string): AttendanceDay["status"] => {
  switch (backend) {
    case "PRESENT": return "present";
    case "LATE": return "late";
    case "ABSENT": return "absent";
    case "EXCUSED": return "holiday";
    default: return "present";
  }
};

export default function MyAttendance() {
  const { toast } = useToast();
  const { user } = useAuth();
  const userId = user?.id;
  const branchId = user?.branchId;
  const organizationId = user?.organizationId;
  const studentId = userId;
  const [days, setDays] = useState<AttendanceDay[]>([]);
  const [requests, setRequests] = useState<PortalRequest[]>([]);
  const [month, setMonth] = useState("all");
  const [status, setStatus] = useState("all");
  const [dispute, setDispute] = useState<AttendanceDay | null>(null);
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  // Marking today's attendance from the phone: by the centre's QR, or a selfie.
  const [checkIn, setCheckIn] = useState<"QR" | "SELFIE" | null>(null);
  const [reload, setReload] = useState(0);
  const today = new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Kolkata" });

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    // Both of these used to be REST calls against an API server that is not part
    // of this deployment, so the page never loaded anything.
    Promise.all([
      getStudentPortalAttendance(userId, branchId),
      getPortalRequests(studentId, branchId),
    ])
      .then(([daysResult, requestsResult]) => {
        if (cancelled) return;
        const records = (daysResult.data || []) as AttendanceRecord[];
        setDays(
          records.map((record) => ({
            id: record.id,
            date: record.date,
            subject: "",
            status: toFrontendStatus(record.status),
          })),
        );
        const requestRows = (requestsResult.data || []) as unknown as PortalRequestResponse[];
        setRequests(
          requestRows.map((req) => ({
            id: req.id,
            kind: req.action,
            detail: req.after?.detail ?? "",
            raisedAt: req.createdAt,
            status: "open" as const,
          })),
        );
      })
      .catch((err) => {
        if (cancelled) return;
        setError(err.message || "Failed to load attendance");
        toast({ title: "Could not load attendance", description: err.message || "Please try again.", variant: "destructive" });
      })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [toast, studentId, branchId, reload]);

  const months = useMemo(() => [...new Set(days.map((day) => monthKey(day.date)))].sort().reverse(), [days]);
  const rows = days
    .filter((day) => (month === "all" || monthKey(day.date) === month) && (status === "all" || day.status === status))
    .sort((a, b) => b.date.localeCompare(a.date));
  const summary = attendanceSummary(days.filter((day) => month === "all" || monthKey(day.date) === month));
  const raised = new Set(requests.filter((request) => request.kind === "Attendance correction").map((request) => request.detail.split(" — ")[0]));

  const submitDispute = async () => {
    if (!dispute) return;
    if (!reason.trim()) return toast({ title: "Add a reason", description: "Tell the office what happened on that day.", variant: "destructive" });
    setSubmitting(true);
    try {
      const result = await submitPortalRequest(userId, branchId, organizationId, "Attendance correction", `${dispute.date} — ${reason.trim()}`);
      setRequests((prev) => [{ id: result.data.id, kind: result.data.action, detail: result.data.after.detail, raisedAt: result.data.createdAt, status: "open" }, ...prev]);
      toast({ title: "Correction requested", description: `The office will review ${new Date(dispute.date).toLocaleDateString("en-IN")}.` });
      setDispute(null);
      setReason("");
    } catch (err) {
      toast({ title: "Request failed", description: err.message || "Please try again.", variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  if (error) {
    return (
      <AppLayout>
        <PageHeader title="My attendance" description="Every session marked against your roll number, and where to query one." breadcrumbs={[{ label: "My attendance" }]} />
        <Card><CardContent className="py-12 text-center text-sm text-destructive">{error}</CardContent></Card>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <PageHeader
        title="My attendance"
        description="Every session marked against your roll number, and where to query one."
        breadcrumbs={[{ label: "My attendance" }]}
        actions={
          <Button variant="outline" onClick={() => downloadCsv(`attendance-${month === "all" ? "all" : month}.csv`, rows)} disabled={!rows.length}>
            <Download />Export CSV
          </Button>
        }
      />

      {!loading && (() => {
        const mark = days.find((day) => day.date.slice(0, 10) === today);
        return (
          <Card className="mb-5 border-primary/30">
            <CardContent className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="font-semibold">Today's attendance</p>
                {mark ? (
                  <p className="mt-1 flex items-center gap-1.5 text-sm text-emerald-700"><CheckCircle2 className="h-4 w-4" />Marked {mark.status} for today.</p>
                ) : (
                  <p className="mt-1 text-sm text-muted-foreground">At the centre? Scan the QR on its screen, or take a selfie.</p>
                )}
              </div>
              {!mark && (
                <div className="flex gap-2">
                  <Button onClick={() => setCheckIn("QR")}><QrCode className="mr-2 h-4 w-4" />Scan QR</Button>
                  <Button variant="outline" onClick={() => setCheckIn("SELFIE")}><Camera className="mr-2 h-4 w-4" />Selfie</Button>
                </div>
              )}
            </CardContent>
          </Card>
        );
      })()}
      <CameraCheckIn
        mode={checkIn ?? "QR"}
        open={checkIn !== null}
        onClose={() => setCheckIn(null)}
        onDone={() => setReload((n) => n + 1)}
      />

      {loading ? (
        <Card><CardContent className="py-12 text-center text-sm text-muted-foreground">Loading attendance…</CardContent></Card>
      ) : (
        <>
          <div className="mb-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <Card><CardContent className="p-4"><p className="eyebrow">Attendance</p><p className="metric mt-3">{summary.percentage}%</p><Progress value={summary.percentage} className="mt-3 h-2" /><p className="mt-2 text-xs text-muted-foreground">{summary.percentage >= 75 ? "Meets the 75% requirement" : "Below the 75% requirement"}</p></CardContent></Card>
            {[{ label: "Present", value: summary.present }, { label: "Late", value: summary.late }, { label: "Absent", value: summary.absent }].map((cell) => (
              <Card key={cell.label}><CardContent className="p-4"><p className="eyebrow">{cell.label}</p><p className="metric mt-3">{cell.value}</p><p className="mt-2 text-xs text-muted-foreground">of {summary.total} counted sessions</p></CardContent></Card>
            ))}
          </div>

          <Card>
            <CardContent className="p-4">
              <div className="mb-4 flex flex-wrap gap-2">
                <Select value={month} onValueChange={setMonth}>
                  <SelectTrigger className="w-[200px]"><SelectValue placeholder="Month" /></SelectTrigger>
                  <SelectContent><SelectItem value="all">All months</SelectItem>{months.map((key) => <SelectItem key={key} value={key}>{monthLabel(key)}</SelectItem>)}</SelectContent>
                </Select>
                <Select value={status} onValueChange={setStatus}>
                  <SelectTrigger className="w-[170px]"><SelectValue placeholder="Status" /></SelectTrigger>
                  <SelectContent>{["all", "present", "late", "absent", "holiday"].map((value) => <SelectItem key={value} value={value}>{value === "all" ? "All statuses" : value[0].toUpperCase() + value.slice(1)}</SelectItem>)}</SelectContent>
                </Select>
                <span className="self-center text-xs text-muted-foreground">{rows.length} session{rows.length === 1 ? "" : "s"}</span>
              </div>

              <div className="overflow-x-auto">
                <Table>
                  <TableHeader><TableRow><TableHead>Date</TableHead><TableHead>Status</TableHead><TableHead className="text-right">Query</TableHead></TableRow></TableHeader>
                  <TableBody>
                    {rows.map((day) => (
                      <TableRow key={day.id}>
                        <TableCell className="whitespace-nowrap font-medium">{new Date(day.date).toLocaleDateString("en-IN", { weekday: "short", day: "2-digit", month: "short" })}</TableCell>
                        <TableCell><Badge variant={TONE[day.status]} className="capitalize">{day.status}</Badge></TableCell>
                        <TableCell className="text-right">
                          {day.status === "absent" || day.status === "late" ? (
                            raised.has(day.date)
                              ? <span className="text-xs text-muted-foreground">Under review</span>
                              : <Button variant="ghost" size="sm" onClick={() => { setDispute(day); setReason(""); }}><Flag className="mr-1.5 h-3.5 w-3.5" />Raise</Button>
                          ) : <span className="text-xs text-muted-foreground">—</span>}
                        </TableCell>
                      </TableRow>
                    ))}
                    {!rows.length && <TableRow><TableCell colSpan={4} className="py-10 text-center text-sm text-muted-foreground">Nothing marked for this filter.</TableCell></TableRow>}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>

          <Dialog open={!!dispute} onOpenChange={(open) => !open && setDispute(null)}>
            <DialogContent>
              <DialogHeader><DialogTitle>Request an attendance correction</DialogTitle></DialogHeader>
              {dispute && <p className="text-sm text-muted-foreground">{new Date(dispute.date).toLocaleDateString("en-IN", { dateStyle: "full" })} · marked <span className="font-medium text-foreground">{dispute.status}</span></p>}
              <div className="space-y-2">
                <Label htmlFor="reason">What happened?</Label>
                <Textarea id="reason" value={reason} onChange={(event) => setReason(event.target.value)} placeholder="I attended the session but was marked absent — the faculty can confirm." rows={4} />
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setDispute(null)} disabled={submitting}>Cancel</Button>
                <Button onClick={submitDispute} disabled={submitting}>{submitting ? "Sending…" : "Send to office"}</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </>
      )}
    </AppLayout>
  );
}
