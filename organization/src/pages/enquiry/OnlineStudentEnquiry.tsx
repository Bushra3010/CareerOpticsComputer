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
import { GraduationCap, Clock, Phone, Download } from "lucide-react";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { downloadCsv } from "@/lib/export";
import { getEnquiries, updateEnquiry } from "@/lib/supabase/data";

/**
 * Backed by the live `visit_enquiries` table. Every field below is a real column on
 * that table. Values are nullable because the table allows nulls.
 */
interface StudentEnquiry {
  id: string;
  visitorName: string | null;
  phone: string | null;
  email: string | null;
  enquiryReason: string | null;
  remarks: string | null;
  followUpNotes: string | null;
  status: string | null;
  branchId: string | null;
  visitDate: string | null;
  visitTime?: string | null;
  purpose?: string | null;
  personToMeet?: string | null;
  department?: string | null;
}

const BADGE_STATUSES = new Set([
  "new", "contacted", "interested", "converted", "closed", "visited", "reviewed", "responded",
]);

/** Never throws and never renders "Invalid Date". */
function formatDate(value: string | null | undefined) {
  if (!value) return "\u2014";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "\u2014";
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

const columns: Column<StudentEnquiry>[] = [
  {
    key: "visitDate",
    header: "Visit Date",
    sortable: true,
    cell: (enquiry) => <span className="text-sm">{formatDate(enquiry.visitDate)}</span>,
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
      <p className="text-sm text-muted-foreground truncate max-w-[200px]">{enquiry.enquiryReason || enquiry.remarks || "—"}</p>
    ),
  },
  {
    key: "purpose",
    header: "Purpose",
    cell: (enquiry) => <Badge variant="secondary">{enquiry.purpose || "General"}</Badge>,
  },
  {
    key: "status",
    header: "Status",
    cell: (enquiry) => {
      const key = (enquiry.status ?? "").toLowerCase();
      return BADGE_STATUSES.has(key)
        ? <StatusBadge status={key as "new"} />
        : <Badge variant="outline">{enquiry.status || "Unknown"}</Badge>;
    },
  },
];

const statusLabel = (status: StudentEnquiry["status"]) => {
  const key = (status ?? "").toLowerCase();
  return key ? key.charAt(0).toUpperCase() + key.slice(1) : "Unknown";
};

export default function OnlineStudentEnquiry() {
  const { toast } = useToast();
  const { user } = useAuth();
  const branchId = user?.branchId || "";
  const [enquiries, setEnquiries] = useState<StudentEnquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [details, setDetails] = useState<StudentEnquiry | null>(null);
  const [responding, setResponding] = useState<StudentEnquiry | null>(null);
  const [notes, setNotes] = useState("");
  const [closing, setClosing] = useState<StudentEnquiry | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function loadEnquiries() {
      try {
        const result = await getEnquiries(branchId || null, 1, 200);
        if (!cancelled) {
          setEnquiries((result.data ?? []) as unknown as StudentEnquiry[]);
        }
      } catch (err) {
        if (!cancelled) {
          toast({
            title: "Failed to load enquiries",
            description: err instanceof Error ? err.message : "Unknown error",
            variant: "destructive",
          });
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }
    loadEnquiries();
    return () => { cancelled = true; };
  }, [branchId, toast]);

  const refreshEnquiries = async () => {
    try {
      const result = await getEnquiries(branchId || null, 1, 200);
      setEnquiries((result.data ?? []) as unknown as StudentEnquiry[]);
    } catch {
      // silent
    }
  };

  const markContacted = async (enquiry: StudentEnquiry) => {
    if (enquiry.status !== "NEW") {
      toast({ title: "Already updated", description: `Status: ${statusLabel(enquiry.status)}.` });
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

  const saveNotes = async () => {
    if (!responding) return;
    if (!notes.trim()) {
      toast({ title: "Add a note first", variant: "destructive" });
      return;
    }
    try {
      await updateEnquiry(responding.id, responding.branchId ?? branchId, {
        status: "CONTACTED",
        followUpNotes: notes.trim(),
      });
      await refreshEnquiries();
      toast({ title: "Notes saved", description: `Follow-up updated for ${responding.visitorName ?? "this enquiry"}.` });
      setResponding(null);
      setNotes("");
    } catch (err) {
      toast({
        title: "Failed to save notes",
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
        closeNote: "Closed from Online Student Enquiries",
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
      "online-student-enquiries.csv",
      enquiries.map((enquiry) => ({
        Visitor: enquiry.visitorName ?? "",
        Phone: enquiry.phone ?? "",
        Email: enquiry.email ?? "",
        Reason: enquiry.enquiryReason ?? "",
        FollowUpNotes: enquiry.followUpNotes ?? "",
        BranchId: enquiry.branchId ?? "",
        VisitDate: enquiry.visitDate ?? "",
        VisitTime: enquiry.visitTime ?? "",
        Purpose: enquiry.purpose ?? "",
        PersonToMeet: enquiry.personToMeet ?? "",
        Status: enquiry.status ?? "",
      })),
    );
    toast({ title: "Enquiries exported", description: `${enquiries.length} rows written to CSV.` });
  };

  const handleActions = (enquiry: StudentEnquiry) => [
    { label: "View Details", onClick: () => setDetails(enquiry) },
    { label: "Mark Contacted", onClick: () => markContacted(enquiry) },
    {
      label: "Add Notes",
      onClick: () => {
        setNotes(enquiry.followUpNotes ?? "");
        setResponding(enquiry);
      },
    },
    { label: "Close", onClick: () => setClosing(enquiry), destructive: true },
  ];

  return (
    <AppLayout>
      <PageHeader
        title="Online Student Enquiries"
        description="Manage admission enquiries from prospective students"
        breadcrumbs={[
          { label: "Enquiry Management", href: "/enquiry/branch" },
          { label: "Online Student Enquiry" },
        ]}
        actions={
          <Button variant="outline" className="gap-2" onClick={exportAll}>
            <Download className="h-4 w-4" />
            Export Data
          </Button>
        }
      />

      <div className="grid gap-4 md:grid-cols-4 mb-6">
        <StatsCard
          title="Total Enquiries"
          value={enquiries.length}
          subtitle="All records"
          icon={GraduationCap}
          trend={{ value: 18, isPositive: true }}
        />
        <StatsCard
          title="New"
          value={enquiries.filter(e => e.status === "NEW").length}
          subtitle="Needs attention"
          icon={Clock}
        />
        <StatsCard
          title="Contacted"
          value={enquiries.filter(e => e.status === "CONTACTED").length}
          subtitle="In progress"
          icon={Phone}
        />
        <StatsCard
          title="Converted"
          value={enquiries.filter(e => e.status === "ADMITTED").length}
          subtitle="Admitted students"
          icon={GraduationCap}
        />
      </div>

      <DataTable
        data={enquiries}
        columns={columns}
        searchPlaceholder="Search student enquiries..."
        actions={handleActions}
        emptyMessage={loading ? "Loading enquiries..." : "No student enquiries received"}
      />

      <Dialog open={!!details} onOpenChange={(open) => !open && setDetails(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{details?.visitorName || "Enquiry"}</DialogTitle>
            <DialogDescription>{details?.phone || "no phone"} · {details?.email || "no email on file"}</DialogDescription>
          </DialogHeader>
          {details && (
            <dl className="grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
              {[
                ["Visit date", formatDate(details.visitDate)],
                ["Visit time", details.visitTime || "—"],
                ["Purpose", details.purpose || "General"],
                ["Person to meet", details.personToMeet || "—"],
                ["Department", details.department || "—"],
                ["Branch", details.branchId || "—"],
                ["Status", statusLabel(details.status)],
                ["Reason", details.enquiryReason || "—"],
                ["Follow-up notes", details.followUpNotes || "—"],
              ].map(([label, value]) => (
                <div key={String(label)}>
                  <dt className="text-xs text-muted-foreground">{String(label)}</dt>
                  <dd className="font-medium">{String(value)}</dd>
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
            <DialogTitle>Update enquiry</DialogTitle>
            <DialogDescription>Follow-up notes for {responding?.visitorName || "this enquiry"}</DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <Label>Notes</Label>
            <Textarea
              rows={4}
              placeholder="Add follow-up notes..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setResponding(null)}>Cancel</Button>
            <Button onClick={saveNotes}>Save notes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!closing} onOpenChange={(open) => !open && setClosing(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Close this enquiry?</AlertDialogTitle>
            <AlertDialogDescription>
              {closing?.visitorName || "This enquiry"} will be marked closed and removed from the active queue.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Keep open</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={closeEnquiry}
            >
              Close enquiry
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AppLayout>
  );
}
