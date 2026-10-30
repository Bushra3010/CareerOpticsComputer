import { AppLayout } from "@/components/layout/AppLayout";
import { PageHeader } from "@/components/ui/PageHeader";
import { DataTable, Column, type TableFilter } from "@/components/ui/DataTable";
import { StatsCard } from "@/components/ui/StatsCard";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { DatePicker } from "@/components/ui/date-picker";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { SelectWithCustom } from "@/components/ui/select-with-custom";
import { Plus, MessageSquare, UserPlus, Clock, CheckCircle, Phone, Download } from "lucide-react";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { getEnquiries, createEnquiry, updateEnquiry, getBranches } from "@/lib/supabase/data";
import { downloadCsv } from "@/lib/export";

interface Enquiry {
  id: string;
  /** Which branch the enquiry came in at. Head office sees every branch's, so
   *  without this the list is a pile of enquiries from nowhere in particular. */
  branchId?: string;
  visitorName: string;
  phone: string;
  email?: string;
  purpose: string;
  personToMeet: string;
  department: string;
  enquiryReason?: string;
  remarks?: string;
  followUpDate?: string;
  followUpNotes?: string;
  status: "NEW" | "CONTACTED" | "CONVERTED" | "CLOSED";
  visitDate: string;
  visitTime: string;
  createdAt: string;
}

const BLANK = {
  visitorName: "",
  phone: "",
  email: "",
  purpose: "OTHER" as Enquiry["purpose"],
  personToMeet: "",
  department: "ADMINISTRATION" as Enquiry["department"],
  enquiryReason: "",
  remarks: "",
  followUpDate: "",
};

export default function BranchEnquiry() {
  const { toast } = useToast();
  const { user } = useAuth();
  const branchId = user?.branchId || "";
  const [enquiries, setEnquiries] = useState<Enquiry[]>([]);
  const [branchNames, setBranchNames] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [form, setForm] = useState(BLANK);
  const [details, setDetails] = useState<Enquiry | null>(null);
  const [followingUp, setFollowingUp] = useState<Enquiry | null>(null);
  const [followUpNote, setFollowUpNote] = useState("");
  const [followUpNext, setFollowUpNext] = useState("");
  const [closing, setClosing] = useState<Enquiry | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      // The branches come along for the names: the enquiry rows carry a
      // `branchId` and nothing a person can read.
      const [result, branches] = await Promise.all([
        getEnquiries(user?.branchId || ""),
        getBranches(user?.organizationId || null).catch(() => ({ data: [] })),
      ]);
      setEnquiries(result.data as unknown as Enquiry[]);
      setBranchNames(
        Object.fromEntries(
          ((branches.data ?? []) as Array<{ id: string; name: string }>).map((branch) => [
            branch.id,
            branch.name,
          ]),
        ),
      );
    } catch {
      toast({ title: "Failed to load enquiries", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const set = <K extends keyof typeof BLANK>(key: K, value: (typeof BLANK)[K]) =>
    setForm((current) => ({ ...current, [key]: value }));

  const saveEnquiry = async () => {
    if (!form.visitorName.trim() || !form.phone.trim()) {
      toast({ title: "Name and phone are required", variant: "destructive" });
      return;
    }
    if (!form.personToMeet.trim()) {
      toast({ title: "Person to meet is required", variant: "destructive" });
      return;
    }
    try {
      const data = await createEnquiry(user?.branchId, {
        visitorName: form.visitorName.trim(),
        phone: form.phone.trim(),
        email: form.email.trim() || undefined,
        purpose: form.purpose,
        personToMeet: form.personToMeet.trim(),
        department: form.department,
        enquiryReason: form.enquiryReason.trim() || undefined,
        remarks: form.remarks.trim() || undefined,
      });
      setEnquiries((list) => [data.data as unknown as Enquiry, ...list]);
      toast({ title: "Enquiry logged", description: `${form.visitorName.trim()} recorded.` });
      setForm(BLANK);
      setIsDialogOpen(false);
    } catch (err) {
      toast({ title: "Failed to save enquiry", description: err instanceof Error ? err.message : "Unknown error", variant: "destructive" });
    }
  };

  const saveFollowUp = async () => {
    if (!followingUp || !followUpNote.trim()) return;
    try {
      const nextDate = followUpNext || new Date(Date.now() + 3 * 86400000).toISOString().slice(0, 10);
      await updateEnquiry(followingUp.id, user?.branchId, {
        followUpDate: nextDate,
        // The column is `followUpNotes`; the local state is what is singular.
        followUpNotes: followUpNote.trim(),
      });
      setEnquiries((list) =>
        list.map((e) =>
          e.id === followingUp.id
            ? { ...e, followUpDate: nextDate, followUpNotes: followUpNote.trim() }
            : e,
        ),
      );
      toast({ title: "Follow-up recorded", description: `Next follow-up on ${nextDate}.` });
      setFollowingUp(null);
      setFollowUpNote("");
      setFollowUpNext("");
    } catch (err) {
      toast({ title: "Failed", description: err instanceof Error ? err.message : "Unknown error", variant: "destructive" });
    }
  };

  const convert = async (enquiry: Enquiry) => {
    if (enquiry.status === "CONVERTED") {
      toast({ title: "Already converted", description: `${enquiry.visitorName} is marked as admitted.` });
      return;
    }
    try {
      await updateEnquiry(enquiry.id, user?.branchId, { status: "CONVERTED" });
      setEnquiries((list) => list.map((e) => (e.id === enquiry.id ? { ...e, status: "CONVERTED" } : e)));
      toast({ title: "Converted to admission", description: `${enquiry.visitorName} — continue at Student Management.` });
    } catch (err) {
      toast({ title: "Failed", description: err instanceof Error ? err.message : "Unknown error", variant: "destructive" });
    }
  };

  const closeEnquiry = async (enquiry: Enquiry) => {
    try {
      await updateEnquiry(enquiry.id, user?.branchId, { status: "CLOSED", closeNote: "Closed by staff" });
      setEnquiries((list) => list.map((e) => (e.id === enquiry.id ? { ...e, status: "CLOSED" } : e)));
      toast({ title: "Enquiry closed", description: enquiry.visitorName });
      setClosing(null);
    } catch (err) {
      toast({ title: "Failed", description: err instanceof Error ? err.message : "Unknown error", variant: "destructive" });
    }
  };

  const handleActions = (enquiry: Enquiry) => [
    { label: "View Details", onClick: () => setDetails(enquiry) },
    {
      label: "Add Follow-up",
      onClick: () => {
        setFollowUpNote("");
        setFollowUpNext(new Date(Date.now() + 3 * 86400000).toISOString().slice(0, 10));
        setFollowingUp(enquiry);
      },
    },
    { label: "Convert to Admission", onClick: () => convert(enquiry) },
    { label: "Mark as Closed", onClick: () => setClosing(enquiry), destructive: true },
  ];

  /** A branch login sees only its own enquiries, so a column repeating its own
   *  name on every row is noise. Head office sees them all, and needs it. */
  const showBranch = !branchId;
  const branchOf = (item: Enquiry) =>
    (item.branchId && branchNames[item.branchId]) || (item.branchId ? "Unknown branch" : "—");

  const today = new Date().toISOString().slice(0, 10);
  const dueCount = enquiries.filter(
    (e) => e.followUpDate && e.followUpDate <= today && e.status !== "CONVERTED" && e.status !== "CLOSED",
  ).length;

  /**
   * The four questions asked of this list: who was it for, which department,
   * what did they want, and where does it stand. Branch joins them at head
   * office, where every branch's enquiries arrive in the same pile.
   *
   * The choices are read off the rows rather than fixed, so a department or a
   * purpose typed into the form appears here without being registered twice.
   */
  const enquiryFilters: TableFilter<Enquiry>[] = [
    ...(showBranch
      ? [{ label: "Branch", key: "branchId" as keyof Enquiry, value: (item: Enquiry) => branchOf(item) }]
      : []),
    { label: "Person to Meet", key: "personToMeet" },
    { label: "Department", key: "department" },
    { label: "Purpose", key: "purpose" },
    { label: "Status", key: "status" },
  ];

  const columns: Column<Enquiry>[] = [
    {
      key: "visitDate",
      header: "Date",
      cell: (item) => new Date(item.visitDate).toLocaleDateString("en-IN"),
    },
    ...(showBranch
      ? [
          {
            key: "branchId" as keyof Enquiry,
            header: "Branch",
            cell: (item: Enquiry) => (
              <span className="whitespace-nowrap text-sm">{branchOf(item)}</span>
            ),
          },
        ]
      : []),
    {
      key: "visitorName",
      header: "Enquirer",
      cell: (item) => (
        <div>
          <p className="font-medium">{item.visitorName}</p>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Phone className="h-3 w-3" />
            {item.phone}
          </div>
        </div>
      ),
    },
    {
      key: "purpose",
      header: "Purpose",
      cell: (item) => <Badge variant="outline">{item.purpose}</Badge>,
    },
    {
      key: "personToMeet",
      header: "Person to Meet",
    },
    {
      key: "department",
      header: "Department",
      cell: (item) => <Badge variant="secondary">{item.department}</Badge>,
    },
    {
      key: "followUpDate",
      header: "Follow-up",
      cell: (item) => (
        <span className={item.followUpDate && item.followUpDate < today ? "text-destructive" : ""}>
          {item.followUpDate ? new Date(item.followUpDate).toLocaleDateString("en-IN") : "—"}
        </span>
      ),
    },
    {
      key: "status",
      header: "Status",
      cell: (item) => (
        <Badge
          variant={
            item.status === "CONVERTED" ? "default" :
            item.status === "CLOSED" ? "secondary" :
            item.status === "CONTACTED" ? "outline" : "destructive"
          }
        >
          {item.status.toLowerCase()}
        </Badge>
      ),
    },
  ];

  const exportEnquiries = () => {
    if (enquiries.length === 0) {
      toast({ title: "Nothing to export", description: "No enquiries loaded yet." });
      return;
    }
    downloadCsv(
      "branch-enquiries.csv",
      enquiries.map((e) => ({
        Branch: branchOf(e),
        Visitor: e.visitorName,
        Phone: e.phone,
        Email: e.email ?? "",
        Purpose: e.purpose,
        PersonToMeet: e.personToMeet,
        Department: e.department,
        Reason: e.enquiryReason ?? "",
        Remarks: e.remarks ?? "",
        FollowUpDate: e.followUpDate ?? "",
        VisitDate: e.visitDate,
        VisitTime: e.visitTime,
        Status: e.status,
      })),
    );
    toast({ title: "Enquiries exported", description: `${enquiries.length} rows written to CSV.` });
  };

  return (
    <AppLayout>
      <PageHeader
        title="Branch Enquiries"
        description="Manage all walk-in and phone enquiries"
        breadcrumbs={[
          { label: "Enquiry Management", href: "/enquiry/branch" },
          { label: "Branch Enquiry" },
        ]}
        actions={
          <div className="flex gap-2">
            <Button variant="outline" className="gap-2" onClick={exportEnquiries}>
              <Download className="h-4 w-4" />
              Export
            </Button>
            <Button className="gap-2" onClick={() => { setForm(BLANK); setIsDialogOpen(true); }}>
              <Plus className="h-4 w-4" />
              New Enquiry
            </Button>
          </div>
        }
      />

      <div className="grid gap-4 md:grid-cols-4 mb-6">
        <StatsCard
          title="Total Enquiries"
          value={enquiries.length}
          subtitle="All time"
          icon={MessageSquare}
        />
        <StatsCard
          title="New Enquiries"
          value={enquiries.filter((e) => e.status === "NEW").length}
          subtitle="Pending contact"
          icon={UserPlus}
        />
        <StatsCard
          title="Follow-ups Due"
          value={dueCount}
          subtitle="Today or overdue"
          icon={Clock}
        />
        <StatsCard
          title="Converted"
          value={enquiries.filter((e) => e.status === "CONVERTED").length}
          subtitle="Admitted"
          icon={CheckCircle}
        />
      </div>

      <DataTable
        data={enquiries}
        columns={columns}
        filters={enquiryFilters}
        searchPlaceholder="Search enquiries..."
        actions={handleActions}
        emptyMessage={loading ? "Loading enquiries..." : "No enquiries logged yet"}
      />

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Add New Enquiry</DialogTitle>
            <DialogDescription>Log a walk-in or phone enquiry and assign it for follow-up.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Visitor Name *</Label>
                <Input placeholder="Enter full name" value={form.visitorName} onChange={(e) => set("visitorName", e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Phone Number *</Label>
                <Input placeholder="+91 XXXXX XXXXX" value={form.phone} onChange={(e) => set("phone", e.target.value)} />
              </div>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Email Address</Label>
                <Input type="email" placeholder="email@example.com" value={form.email} onChange={(e) => set("email", e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Person to Meet *</Label>
                <Input placeholder="e.g. Admission Counsellor" value={form.personToMeet} onChange={(e) => set("personToMeet", e.target.value)} />
              </div>
            </div>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <Label>Purpose</Label>
                <SelectWithCustom
                  value={form.purpose}
                  onValueChange={(value) => set("purpose", value as Enquiry["purpose"])}
                  options={["ADMISSION", "FEE", "MEETING", "COMPLAINT", "DELIVERY", "INTERVIEW"]}
                  placeholder="Select purpose"
                  customPlaceholder="Type the purpose"
                />
              </div>
              <div className="space-y-2">
                <Label>Department</Label>
                <Select value={form.department} onValueChange={(value) => set("department", value as Enquiry["department"])}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ADMINISTRATION">Administration</SelectItem>
                    <SelectItem value="ACADEMICS">Academics</SelectItem>
                    <SelectItem value="ACCOUNTS">Accounts</SelectItem>
                    <SelectItem value="HR">HR</SelectItem>
                    <SelectItem value="IT">IT</SelectItem>
                    <SelectItem value="LIBRARY">Library</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Follow-up Date</Label>
                <DatePicker value={form.followUpDate} onChange={(v) => set("followUpDate", v)} />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Enquiry Reason</Label>
              <Textarea placeholder="Why did they visit?..." rows={3} value={form.enquiryReason} onChange={(e) => set("enquiryReason", e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Remarks</Label>
              <Textarea placeholder="Additional notes..." rows={2} value={form.remarks} onChange={(e) => set("remarks", e.target.value)} />
            </div>
            <div className="flex justify-end gap-3 pt-4">
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
              <Button onClick={saveEnquiry}>Save Enquiry</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={!!details} onOpenChange={(open) => !open && setDetails(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{details?.visitorName}</DialogTitle>
            <DialogDescription>{details?.phone} · {details?.email || "no email on file"}</DialogDescription>
          </DialogHeader>
          {details && (
            <div className="space-y-4">
              <dl className="grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
                {[
                  ["Visit date", new Date(details.visitDate).toLocaleDateString("en-IN")],
                  ["Purpose", details.purpose],
                  ["Person to Meet", details.personToMeet],
                  ["Department", details.department],
                  ["Next follow-up", details.followUpDate ? new Date(details.followUpDate).toLocaleDateString("en-IN") : "—"],
                  ["Status", details.status.toLowerCase()],
                ].map(([label, value]) => (
                  <div key={label}>
                    <dt className="text-xs text-muted-foreground">{label}</dt>
                    <dd className="font-medium capitalize">{value}</dd>
                  </div>
                ))}
              </dl>
              {details.enquiryReason && (
                <div>
                  <p className="text-xs text-muted-foreground">Reason</p>
                  <p className="text-sm">{details.enquiryReason}</p>
                </div>
              )}
              {details.remarks && (
                <div>
                  <p className="text-xs text-muted-foreground">Remarks</p>
                  <p className="text-sm">{details.remarks}</p>
                </div>
              )}
              {details.followUpNotes && (
                <div>
                  <p className="text-xs text-muted-foreground">Last Follow-up</p>
                  <p className="text-sm">{details.followUpNotes}</p>
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                if (!details) return;
                setFollowUpNote("");
                setFollowUpNext(new Date(Date.now() + 3 * 86400000).toISOString().slice(0, 10));
                setFollowingUp(details);
                setDetails(null);
              }}
            >
              Add follow-up
            </Button>
            <Button onClick={() => details && convert(details)}>Convert to admission</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!followingUp} onOpenChange={(open) => !open && setFollowingUp(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add follow-up</DialogTitle>
            <DialogDescription>{followingUp?.visitorName} · {followingUp?.phone}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>What happened?</Label>
              <Textarea
                rows={3}
                placeholder="Called and explained the courses..."
                value={followUpNote}
                onChange={(e) => setFollowUpNote(e.target.value)}
              />
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Next follow-up date</Label>
                <DatePicker value={followUpNext} onChange={(v) => setFollowUpNext(v)} />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setFollowingUp(null)}>Cancel</Button>
            <Button onClick={saveFollowUp}>Save follow-up</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!closing} onOpenChange={(open) => !open && setClosing(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Close this enquiry?</AlertDialogTitle>
            <AlertDialogDescription>
              {closing?.visitorName} will stop appearing in the follow-up queue. The record stays in the list.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Keep open</AlertDialogCancel>
            <AlertDialogAction onClick={() => closing && closeEnquiry(closing)}>
              Close enquiry
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AppLayout>
  );
}
