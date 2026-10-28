import { AppLayout } from "@/components/layout/AppLayout";
import { PageHeader } from "@/components/ui/PageHeader";
import { DataTable, Column } from "@/components/ui/DataTable";
import { StatsCard } from "@/components/ui/StatsCard";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Globe, Building2, Clock, CheckCircle, Download } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { downloadCsv } from "@/lib/export";
import { getBranches, getEnquiries, updateEnquiry } from "@/lib/supabase/data";

/**
 * Backed by the live `visit_enquiries` table. Only columns that actually exist on
 * that table are read or written: id, branchId, visitorName, phone, email, address,
 * purpose, personToMeet, department, enquiryReason, remarks, source, status,
 * visitDate, visitTime, followUpDate, followUpNotes, closeNote, createdAt, updatedAt.
 */
interface OnlineEnquiry {
  id: string;
  visitorName: string | null;
  phone: string | null;
  email: string | null;
  enquiryReason: string | null;
  remarks: string | null;
  source: string | null;
  purpose: string | null;
  department: string | null;
  followUpNotes: string | null;
  status: string | null;
  branchId: string | null;
  visitDate: string | null;
  visitTime: string | null;
}

const BADGE_STATUSES = new Set([
  "new", "contacted", "interested", "converted", "closed", "visited", "reviewed", "responded",
]);

/** Never throws and never renders "Invalid Date". */
function formatDate(value: string | null | undefined) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
}

function statusCell(status: string | null | undefined) {
  const key = (status ?? "").toLowerCase();
  if (BADGE_STATUSES.has(key)) {
    return <StatusBadge status={key as "new"} />;
  }
  return <Badge variant="outline">{status || "Unknown"}</Badge>;
}

export default function OnlineBranchEnquiry() {
  const { toast } = useToast();
  const { user } = useAuth();
  const branchId = user?.branchId || "";
  const organizationId = user?.organizationId || "";
  const [enquiries, setEnquiries] = useState<OnlineEnquiry[]>([]);
  const [branchNames, setBranchNames] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [details, setDetails] = useState<OnlineEnquiry | null>(null);
  const [responding, setResponding] = useState<OnlineEnquiry | null>(null);
  const [response, setResponse] = useState("");
  const [converting, setConverting] = useState<OnlineEnquiry | null>(null);
  const [closing, setClosing] = useState<OnlineEnquiry | null>(null);

  const fetchEnquiries = useCallback(async () => {
    const result = await getEnquiries(branchId || null, 1, 200);
    return (result.data ?? []) as unknown as OnlineEnquiry[];
  }, [branchId]);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    fetchEnquiries()
      .then((rows) => { if (!cancelled) setEnquiries(rows); })
      .catch((err: unknown) => {
        if (!cancelled) {
          toast({
            title: "Failed to load enquiries",
            description: err instanceof Error ? err.message : "Unknown error",
            variant: "destructive",
          });
        }
      })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [fetchEnquiries, toast]);

  // Branch names are looked up so the table shows a name rather than a raw id.
  // The `branches` table can legitimately be empty, in which case we fall back to the id.
  useEffect(() => {
    let cancelled = false;
    getBranches(organizationId || null)
      .then((result) => {
        if (cancelled) return;
        const map: Record<string, string> = {};
        for (const branch of (result.data ?? []) as Array<{ id: string; name?: string | null }>) {
          if (branch?.id) map[branch.id] = branch.name || branch.id;
        }
        setBranchNames(map);
      })
      .catch(() => { /* branch names are cosmetic; ids remain readable */ });
    return () => { cancelled = true; };
  }, [organizationId]);

  const refreshEnquiries = useCallback(async () => {
    try {
      setEnquiries(await fetchEnquiries());
    } catch {
      /* the mutation already reported success/failure; a stale list is recoverable */
    }
  }, [fetchEnquiries]);

  const branchLabel = useCallback(
    (id: string | null) => (id ? branchNames[id] ?? id : "—"),
    [branchNames],
  );

  const columns: Column<OnlineEnquiry>[] = useMemo(() => [
    {
      key: "visitDate",
      header: "Received",
      sortable: true,
      cell: (enquiry) => <span className="text-sm">{formatDate(enquiry.visitDate)}</span>,
    },
    {
      key: "branchId",
      header: "Branch",
      cell: (enquiry) => <Badge variant="outline">{branchLabel(enquiry.branchId)}</Badge>,
    },
    {
      key: "visitorName",
      header: "Visitor",
      cell: (enquiry) => (
        <div>
          <p className="font-medium">{enquiry.visitorName || "Unnamed"}</p>
          <p className="text-xs text-muted-foreground">{enquiry.phone || "no phone"}</p>
        </div>
      ),
    },
    {
      key: "enquiryReason",
      header: "Reason",
      cell: (enquiry) => (
        <p className="text-sm text-muted-foreground truncate max-w-[200px]">
          {enquiry.enquiryReason || enquiry.remarks || "—"}
        </p>
      ),
    },
    {
      key: "status",
      header: "Status",
      cell: (enquiry) => statusCell(enquiry.status),
    },
  ], [branchLabel]);

  const markReviewed = async (enquiry: OnlineEnquiry) => {
    if (enquiry.status !== "NEW") {
      toast({ title: "Already reviewed", description: `This enquiry is ${enquiry.status ?? "unknown"}.` });
      return;
    }
    try {
      await updateEnquiry(enquiry.id, enquiry.branchId ?? branchId, { status: "CONTACTED" });
      await refreshEnquiries();
      toast({ title: "Marked as contacted", description: enquiry.visitorName ?? "Enquiry updated" });
    } catch (err) {
      toast({
        title: "Failed to update enquiry",
        description: err instanceof Error ? err.message : "Unknown error",
        variant: "destructive",
      });
    }
  };

  // NOTE: `visit_enquiries` has no `response` column, so the note is stored in
  // `followUpNotes` (which does exist). Nothing is emailed from here.
  const saveFollowUpNote = async () => {
    if (!responding) return;
    if (!response.trim()) {
      toast({ title: "Write a note first", variant: "destructive" });
      return;
    }
    try {
      await updateEnquiry(responding.id, responding.branchId ?? branchId, {
        status: "CONTACTED",
        followUpNotes: response.trim(),
      });
      await refreshEnquiries();
      toast({ title: "Follow-up note saved", description: responding.visitorName ?? "Enquiry updated" });
      setResponding(null);
      setResponse("");
    } catch (err) {
      toast({
        title: "Failed to save note",
        description: err instanceof Error ? err.message : "Unknown error",
        variant: "destructive",
      });
    }
  };

  const flagAsLead = async () => {
    if (!converting) return;
    const existing = converting.remarks?.trim();
    const remarks = existing?.startsWith("[LEAD]") ? existing : `[LEAD] ${existing ?? ""}`.trim();
    try {
      await updateEnquiry(converting.id, converting.branchId ?? branchId, {
        status: "CONTACTED",
        remarks,
      });
      await refreshEnquiries();
      toast({
        title: "Flagged for follow-up",
        description: `${converting.visitorName ?? "Enquiry"} is marked as a lead in its remarks.`,
      });
      setConverting(null);
    } catch (err) {
      toast({
        title: "Failed to update enquiry",
        description: err instanceof Error ? err.message : "Unknown error",
        variant: "destructive",
      });
    }
  };

  const closeEnquiry = async () => {
    if (!closing) return;
    try {
      await updateEnquiry(closing.id, closing.branchId ?? branchId, {
        status: "CLOSED",
        closeNote: "Closed from Online Branch Enquiries",
      });
      await refreshEnquiries();
      toast({ title: "Enquiry closed", description: closing.visitorName ?? "Enquiry updated" });
    } catch (err) {
      toast({
        title: "Failed to close enquiry",
        description: err instanceof Error ? err.message : "Unknown error",
        variant: "destructive",
      });
    }
    setClosing(null);
  };

  const exportAll = () => {
    if (enquiries.length === 0) {
      toast({ title: "Nothing to export", description: "No enquiries loaded yet." });
      return;
    }
    downloadCsv(
      "online-branch-enquiries.csv",
      enquiries.map((enquiry) => ({
        Visitor: enquiry.visitorName ?? "",
        Phone: enquiry.phone ?? "",
        Email: enquiry.email ?? "",
        Reason: enquiry.enquiryReason ?? "",
        Remarks: enquiry.remarks ?? "",
        Source: enquiry.source ?? "",
        Branch: branchLabel(enquiry.branchId),
        VisitDate: enquiry.visitDate ?? "",
        VisitTime: enquiry.visitTime ?? "",
        FollowUpNotes: enquiry.followUpNotes ?? "",
        Status: enquiry.status ?? "",
      })),
    );
    toast({ title: "Enquiries exported", description: `${enquiries.length} rows written to CSV.` });
  };

  const handleActions = (enquiry: OnlineEnquiry) => [
    { label: "View Details", onClick: () => setDetails(enquiry) },
    { label: "Mark as Contacted", onClick: () => markReviewed(enquiry) },
    {
      label: "Add Follow-up Note",
      onClick: () => {
        setResponse(enquiry.followUpNotes ?? "");
        setResponding(enquiry);
      },
    },
    { label: "Flag for Lead", onClick: () => setConverting(enquiry) },
    { label: "Close", onClick: () => setClosing(enquiry), destructive: true },
  ];

  const branchCount = new Set(enquiries.map((enquiry) => enquiry.branchId).filter(Boolean)).size;

  return (
    <AppLayout>
      <PageHeader
        title="Online Branch Enquiries"
        description="Manage enquiries received from branch websites"
        breadcrumbs={[
          { label: "Enquiry Management", href: "/enquiry/branch" },
          { label: "Online Branch Enquiry" },
        ]}
        actions={
          <Button variant="outline" className="gap-2" onClick={exportAll}>
            <Download className="h-4 w-4" />
            Export Data
          </Button>
        }
      />

      <div className="grid gap-4 md:grid-cols-4 mb-6">
        <StatsCard title="Total Online Enquiries" value={enquiries.length} subtitle="All records" icon={Globe} />
        <StatsCard
          title="New Enquiries"
          value={enquiries.filter((e) => e.status === "NEW").length}
          subtitle="Needs attention"
          icon={Clock}
        />
        <StatsCard
          title="Contacted"
          value={enquiries.filter((e) => e.status === "CONTACTED").length}
          subtitle="In progress"
          icon={CheckCircle}
        />
        <StatsCard title="By Branch" value={branchCount} subtitle="Branches with enquiries" icon={Building2} />
      </div>

      <DataTable
        data={enquiries}
        columns={columns}
        searchPlaceholder="Search online enquiries..."
        actions={handleActions}
        emptyMessage={loading ? "Loading enquiries..." : "No online enquiries received"}
      />

      <Dialog open={!!details} onOpenChange={(open) => !open && setDetails(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{details?.visitorName || "Enquiry"}</DialogTitle>
            <DialogDescription>
              {details?.phone || "no phone"} · {details?.email || "no email on file"}
            </DialogDescription>
          </DialogHeader>
          {details && (
            <dl className="grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
              {([
                ["Visit date", formatDate(details.visitDate)],
                ["Visit time", details.visitTime || "—"],
                ["Branch", branchLabel(details.branchId)],
                ["Source", details.source || "—"],
                ["Department", details.department || "—"],
                ["Status", details.status || "—"],
                ["Reason", details.enquiryReason || "—"],
                ["Remarks", details.remarks || "—"],
                ["Follow-up notes", details.followUpNotes || "—"],
              ] as Array<[string, string]>).map(([label, value]) => (
                <div key={label}>
                  <dt className="text-xs text-muted-foreground">{label}</dt>
                  <dd className="font-medium">{value}</dd>
                </div>
              ))}
            </dl>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setDetails(null)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!responding} onOpenChange={(open) => !open && setResponding(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add follow-up note</DialogTitle>
            <DialogDescription>
              Saved to this enquiry's follow-up notes for {responding?.visitorName || "this visitor"}. No email is sent.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <p className="rounded-lg border bg-muted/40 p-3 text-sm text-muted-foreground">
              {responding?.enquiryReason || responding?.remarks || "No details provided."}
            </p>
            <div className="space-y-2">
              <Label>Notes</Label>
              <Textarea
                rows={4}
                placeholder="Add follow-up notes..."
                value={response}
                onChange={(e) => setResponse(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setResponding(null)}>Cancel</Button>
            <Button onClick={saveFollowUpNote}>Save note</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!converting} onOpenChange={(open) => !open && setConverting(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Flag for lead</DialogTitle>
            <DialogDescription>
              Marks {converting?.visitorName || "this enquiry"} as contacted and tags its remarks with [LEAD].
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConverting(null)}>Cancel</Button>
            <Button onClick={flagAsLead}>Confirm</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!closing} onOpenChange={(open) => !open && setClosing(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Close this enquiry?</AlertDialogTitle>
            <AlertDialogDescription>
              {closing?.visitorName || "This enquiry"} will be marked closed and drop out of the pending queue.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Keep open</AlertDialogCancel>
            <AlertDialogAction onClick={closeEnquiry}>Close enquiry</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AppLayout>
  );
}
