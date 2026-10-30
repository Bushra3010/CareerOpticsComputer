import { useEffect, useState } from "react";
import { StudentDocuments } from "@/components/student/StudentDocuments";
import { studentFiles, type StudentFile } from "@/lib/studentDocuments";
import { AppLayout } from "@/components/layout/AppLayout";
import { PageHeader } from "@/components/ui/PageHeader";
import { DataTable, Column } from "@/components/ui/DataTable";
import { StatsCard } from "@/components/ui/StatsCard";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { GraduationCap, Clock, CheckCircle, XCircle, Download, Link2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { getStudents } from "@/lib/supabase/data";
import { storedTime } from "@/lib/storedTime";
import { listBatches, listCourses, type LookupRow } from "@/lib/supabase/examAttendance";
import { listInvoices, updateStudentRow, type InvoiceRow } from "@/lib/supabase/studentFee";
import {
  REQUIRED_DOCUMENTS,
  admissionView,
  paymentFor,
  requestedDocuments,
  uploadedDocuments,
  type AdmissionPayment,
  type AdmissionView,
} from "@/lib/onlineAdmissions";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { downloadCsv } from "@/lib/export";

interface OnlineAdmission {
  id: string;
  applicationNo: string;
  date: string;
  name: string;
  email: string;
  phone: string;
  course: string;
  batch: string;
  documents: string[];
  /** The uploads themselves, to open from the details. */
  files: StudentFile[];
  paymentStatus: AdmissionPayment;
  status: AdmissionView;
  requestedDocuments?: string[];
  decisionNote?: string;
}

/** A students row, as far as this list reads it. */
type StudentRecord = Record<string, unknown> & {
  id: string;
  applicationNo?: string;
  enrollmentNo?: string;
  admissionDate?: string;
  createdAt?: string;
  firstName?: string;
  middleName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  course?: { name?: string } | null;
  batch?: { name?: string } | null;
  decisionNote?: string;
};

/** "24 Oct 2026, 10:27 pm". */
const shortDate = (value: string) => {
  const at = storedTime(value);
  if (!at) return value;
  return at.toLocaleString("en-IN", { day: "2-digit", month: "short", year: "numeric", hour: "numeric", minute: "2-digit" });
};

const columns: Column<OnlineAdmission>[] = [
  {
    key: "applicationNo",
    header: "Application",
    sortable: true,
    cell: (admission) => (
      <div>
        <p className="font-medium">{admission.applicationNo}</p>
        <p className="text-xs text-muted-foreground">{admission.date}</p>
      </div>
    ),
  },
  {
    key: "name",
    header: "Applicant",
    cell: (admission) => (
      <div>
        <p className="font-medium">{admission.name}</p>
        <p className="text-xs text-muted-foreground">{admission.email || admission.phone}</p>
      </div>
    ),
  },
  {
    key: "course",
    header: "Course",
    cell: (admission) => (
      <div>
        <Badge variant="outline">{admission.course}</Badge>
        <p className="text-xs text-muted-foreground mt-1">{admission.batch}</p>
      </div>
    ),
  },
  {
    key: "documents",
    header: "Documents",
    cell: (admission) => (
      <div className="flex items-center gap-1">
        <Badge variant="secondary">{admission.documents.length} uploaded</Badge>
      </div>
    ),
  },
  {
    key: "paymentStatus",
    header: "Payment",
    cell: (admission) => (
      <Badge variant={admission.paymentStatus === "paid" ? "default" : admission.paymentStatus === "pending" ? "destructive" : "secondary"}>
        {admission.paymentStatus === "none" ? "no invoice" : admission.paymentStatus}
      </Badge>
    ),
  },
  {
    key: "status",
    header: "Status",
    cell: (admission) => <StatusBadge status={admission.status} />,
  },
];

export default function OnlineAdmissionList() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const branchId = user?.branchId;
  const [admissions, setAdmissions] = useState<OnlineAdmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [details, setDetails] = useState<OnlineAdmission | null>(null);
  const [requesting, setRequesting] = useState<OnlineAdmission | null>(null);
  const [requested, setRequested] = useState<string[]>([]);
  const [rejecting, setRejecting] = useState<OnlineAdmission | null>(null);
  const [reason, setReason] = useState("");

  useEffect(() => {
    let cancelled = false;
    const fetchStudents = async () => {
      setLoading(true);
      try {
        // Invoices decide the Payment column. A failure there leaves the column
        // unknown rather than the page empty.
        // Students come without their course and batch names; those are looked
        // up here, and a failed lookup only leaves the names out.
        const [result, invoiceResult, courses, batches] = await Promise.all([
          getStudents(branchId, 1, 500),
          listInvoices(branchId ?? null).catch(() => ({ data: [] as InvoiceRow[] })),
          listCourses(user?.organizationId).catch((): LookupRow[] => []),
          listBatches(branchId).catch((): LookupRow[] => []),
        ]);
        const courseName = new Map(courses.map((c) => [c.id, c.name]));
        const batchName = new Map(batches.map((b) => [b.id, b.name]));
        const byStudent = new Map<string, InvoiceRow[]>();
        for (const invoice of invoiceResult.data) {
          const id = String(invoice.studentId ?? "");
          byStudent.set(id, [...(byStudent.get(id) ?? []), invoice]);
        }
        if (cancelled) return;
        // Applications made on the online form, and any admission still waiting
        // for a decision -- not every student a counter admission filed as approved.
        const applications = (result.data as StudentRecord[]).filter(
          (s) => (s as Record<string, unknown>).applicationSource === "ONLINE" || admissionView(s) !== "approved",
        );
        setAdmissions(
          applications.map((s) => ({
            id: s.id,
            applicationNo: s.applicationNo || s.enrollmentNo || "—",
            date: shortDate(s.admissionDate || s.createdAt || ""),
            name: [s.firstName, s.middleName, s.lastName].filter(Boolean).join(" "),
            email: s.email || "",
            phone: s.phone,
            course: s.course?.name || courseName.get(String(s.courseId ?? "")) || "Not assigned",
            batch: s.batch?.name || batchName.get(String(s.batchId ?? "")) || "No batch yet",
            documents: uploadedDocuments(s),
            files: studentFiles(s),
            paymentStatus: paymentFor(byStudent.get(String(s.id)) ?? []),
            status: admissionView(s),
            requestedDocuments: requestedDocuments(s),
            decisionNote: s.decisionNote || "",
          })),
        );
      } catch (error) {
        if (cancelled) return;
        setAdmissions([]);
        toast({
          title: "Could not load applications",
          description: error instanceof Error ? error.message : "Please try again",
          variant: "destructive",
        });
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    void fetchStudents();
    return () => {
      cancelled = true;
    };
  }, [branchId, user?.organizationId, toast]);

  /** Saves the decision, and shows it only once the database has it. */
  const updateAdmission = async (id: string, changes: Partial<OnlineAdmission>) => {
    try {
      // updateStudentRow writes `status` to the real column, admissionStatus,
      // and stores the requested documents as the text the column holds.
      await updateStudentRow(id, changes as Record<string, unknown>);
      setAdmissions((prev) => prev.map((a) => (a.id === id ? { ...a, ...changes } : a)));
      return true;
    } catch (error) {
      const message = error instanceof Error ? error.message : "Please try again";
      const low = /INSUFFICIENT_BALANCE:\s*(.*)/.exec(message);
      toast({
        title: low ? "Centre wallet balance is too low" : "Could not save",
        // Approving charges the centre's admission fee, as a counter admission is charged.
        description: low ? `${low[1]} Recharge the wallet, then approve again.` : message,
        variant: "destructive",
      });
      return false;
    }
  };

  const approve = async (admission: OnlineAdmission) => {
    if (admission.status === "approved") {
      toast({ title: "Already approved", description: admission.applicationNo });
      return;
    }
    if (admission.paymentStatus === "pending") {
      toast({
        title: "Payment not settled",
        description: `${admission.applicationNo} has fees outstanding. Collect them first.`,
        variant: "destructive",
      });
      return;
    }
    if (await updateAdmission(admission.id, { status: "approved", decisionNote: "", requestedDocuments: [] })) {
      toast({ title: "Application approved", description: `${admission.name} · ${admission.course}` });
    }
  };

  const openRequest = (admission: OnlineAdmission) => {
    setRequesting(admission);
    setRequested(REQUIRED_DOCUMENTS.filter((doc) => !admission.documents.includes(doc)));
  };

  const sendRequest = async () => {
    if (!requesting) return;
    if (!requested.length) {
      toast({ title: "Pick at least one document to request", variant: "destructive" });
      return;
    }
    if (await updateAdmission(requesting.id, { status: "under_review", requestedDocuments: requested })) {
      toast({
        title: "Documents requested",
        description: `${requested.length} document(s) requested from ${requesting.name}.`,
      });
      setRequesting(null);
    }
  };

  const confirmReject = async () => {
    if (!rejecting) return;
    if (!reason.trim()) {
      toast({ title: "Add a rejection reason", variant: "destructive" });
      return;
    }
    if (await updateAdmission(rejecting.id, { status: "rejected", decisionNote: reason.trim() })) {
      toast({ title: "Application rejected", description: rejecting.applicationNo });
      setRejecting(null);
      setReason("");
    }
  };

  /** The online form's address, with this centre chosen, to send to students. */
  const copyFormLink = async () => {
    const link = `${window.location.origin}${import.meta.env.BASE_URL.replace(/\/$/, "")}/apply${branchId ? `?centre=${encodeURIComponent(branchId)}` : ""}`;
    try {
      await navigator.clipboard.writeText(link);
      toast({ title: "Form link copied", description: link });
    } catch {
      toast({ title: "Online admission form", description: link });
    }
  };

  const exportData = () => {
    downloadCsv(
      "online-admissions.csv",
      admissions.map((admission) => ({
        Application: admission.applicationNo,
        Date: admission.date,
        Name: admission.name,
        Email: admission.email,
        Phone: admission.phone,
        Course: admission.course,
        Batch: admission.batch,
        Documents: admission.documents.join(" | "),
        Payment: admission.paymentStatus,
        Status: admission.status,
      })),
    );
    toast({ title: "Applications exported", description: `${admissions.length} rows written to CSV.` });
  };

  const handleActions = (admission: OnlineAdmission) => [
    { label: "View Application", onClick: () => setDetails(admission) },
    { label: "Approve", onClick: () => approve(admission) },
    { label: "Request Documents", onClick: () => openRequest(admission) },
    {
      label: "Reject",
      onClick: () => {
        setRejecting(admission);
        setReason("");
      },
      destructive: true,
    },
  ];

  const statusCounts = {
    pending: admissions.filter(a => a.status === "pending").length,
    under_review: admissions.filter(a => a.status === "under_review").length,
    approved: admissions.filter(a => a.status === "approved").length,
    rejected: admissions.filter(a => a.status === "rejected").length,
  };

  if (loading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-64">
          <p className="text-muted-foreground">Loading applications...</p>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <PageHeader
        title="Online Admission List"
        description="Applications students made on the online form, with their documents. Approving confirms the admission and charges the centre's admission fee."
        breadcrumbs={[
          { label: "Student Management", href: "/student/view" },
          { label: "Online Admission List" },
        ]}
        actions={
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" className="gap-2" onClick={copyFormLink}>
              <Link2 className="h-4 w-4" />
              Copy form link
            </Button>
            <Button variant="outline" className="gap-2" onClick={exportData}>
              <Download className="h-4 w-4" />
              Export Data
            </Button>
          </div>
        }
      />

      <div className="grid gap-4 md:grid-cols-4 mb-6">
        <StatsCard
          title="Total Applications"
          value={admissions.length}
          subtitle="Made on the online form"
          icon={GraduationCap}
        />
        <StatsCard
          title="Pending Review"
          value={statusCounts.pending + statusCounts.under_review}
          subtitle="Needs attention"
          icon={Clock}
        />
        <StatsCard
          title="Approved"
          value={statusCounts.approved}
          subtitle="Admission confirmed"
          icon={CheckCircle}
        />
        <StatsCard
          title="Rejected"
          value={statusCounts.rejected}
          subtitle="This session"
          icon={XCircle}
        />
      </div>

      <DataTable
        data={admissions}
        columns={columns}
        searchPlaceholder="Search applications..."
        actions={handleActions}
        emptyMessage="No online applications yet. Share the online admission form (Copy form link) with students."
      />

      <Dialog open={!!details} onOpenChange={(open) => !open && setDetails(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{details?.name}</DialogTitle>
            <DialogDescription>{details?.applicationNo} · applied {details?.date}</DialogDescription>
          </DialogHeader>
          {details && (
            <div className="space-y-4 text-sm">
              <dl className="grid grid-cols-2 gap-x-4 gap-y-3">
                {[
                  ["Email", details.email],
                  ["Phone", details.phone],
                  ["Course", details.course],
                  ["Batch", details.batch],
                  ["Payment", details.paymentStatus],
                  ["Status", details.status.replace("_", " ")],
                ].map(([label, value]) => (
                  <div key={label}>
                    <dt className="text-xs text-muted-foreground">{label}</dt>
                    <dd className="font-medium capitalize">{value}</dd>
                  </div>
                ))}
              </dl>
              <div>
                <p className="mb-1 text-xs text-muted-foreground">Documents uploaded</p>
                <StudentDocuments files={details.files} studentName={details.name} emptyText="No documents uploaded." />
              </div>
              {details.requestedDocuments?.length ? (
                <div>
                  <p className="mb-1 text-xs text-muted-foreground">Requested from applicant</p>
                  <div className="flex flex-wrap gap-1">
                    {details.requestedDocuments.map((doc) => (
                      <Badge key={doc} variant="outline">{doc}</Badge>
                    ))}
                  </div>
                </div>
              ) : null}
              {details.decisionNote && (
                <div>
                  <p className="text-xs text-muted-foreground">Rejection reason</p>
                  <p>{details.decisionNote}</p>
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => navigate("/student/add")}>Open admission form</Button>
            <Button
              onClick={() => {
                if (details) approve(details);
                setDetails(null);
              }}
              disabled={details?.status === "approved"}
            >
              Approve
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!requesting} onOpenChange={(open) => !open && setRequesting(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Request documents</DialogTitle>
            <DialogDescription>
              {requesting?.name} · {requesting?.applicationNo}. Missing documents are pre-selected.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            {REQUIRED_DOCUMENTS.map((doc) => {
              const uploaded = requesting?.documents.includes(doc);
              return (
                <label key={doc} htmlFor={`doc-${doc}`} className="flex cursor-pointer items-center gap-3 text-sm">
                  <Checkbox
                    id={`doc-${doc}`}
                    checked={requested.includes(doc)}
                    onCheckedChange={() =>
                      setRequested((prev) =>
                        prev.includes(doc) ? prev.filter((d) => d !== doc) : [...prev, doc],
                      )
                    }
                  />
                  <span>{doc}</span>
                  {uploaded && <Badge variant="secondary" className="text-xs">already uploaded</Badge>}
                </label>
              );
            })}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRequesting(null)}>Cancel</Button>
            <Button onClick={sendRequest}>Send request</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={!!rejecting}
        onOpenChange={(open) => {
          if (!open) {
            setRejecting(null);
            setReason("");
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject {rejecting?.applicationNo}?</DialogTitle>
            <DialogDescription>The reason is stored against the application.</DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <Label htmlFor="reject-reason">Reason *</Label>
            <Textarea
              id="reject-reason"
              rows={3}
              placeholder="e.g., Marksheet does not meet the minimum percentage."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRejecting(null)}>Cancel</Button>
            <Button variant="destructive" onClick={confirmReject}>Reject application</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}
