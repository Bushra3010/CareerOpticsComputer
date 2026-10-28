import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";
import { PageHeader } from "@/components/ui/PageHeader";
import { StatsCard } from "@/components/ui/StatsCard";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { DataTable, type Column, type TableFilter } from "@/components/ui/DataTable";
import { ContactActions } from "@/components/ui/ContactActions";
import { DatePicker } from "@/components/ui/date-picker";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  CalendarClock,
  CheckCircle2,
  Download,
  GraduationCap,
  MessageSquare,
  Plus,
  TrendingUp,
  UserPlus,
  Users,
  XCircle,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { downloadCsv } from "@/lib/export";
import { formatPhone } from "@/lib/phone";
import { INDIAN_STATES, canonicalState, districtsFor } from "@/data/indianStates";
import { blocksFor } from "@/data/indianCities";
import {
  followUpBucket,
  followUpQueue,
  leadProblem,
  leadSummary,
  monthlyEnquiries,
  admissionPipeline,
  sourceBreakdown,
} from "@/lib/leads";
import {
  LEAD_CLOSED_STAGES,
  LEAD_STAGES,
  createAdmissionLead,
  getAdmissionLeads,
  getBranchDirectory,
  getLeadActivities,
  logLeadActivity,
  updateAdmissionLead,
  type AdmissionLead,
  type LeadActivity,
  type LeadStage,
} from "@/lib/supabase/data";

const ALL_STAGES = [...LEAD_STAGES, ...LEAD_CLOSED_STAGES];

const SOURCES = ["Walk-in", "Website", "Facebook", "Instagram", "WhatsApp", "Google", "Referral", "Existing Student"];
const QUALIFICATIONS = ["10th", "12th", "Graduate", "Post Graduate", "Other"];
const BATCH_PREFERENCES = ["Morning", "Afternoon", "Evening", "Weekend"];
const FOLLOW_UP_TYPES = ["Phone Call", "WhatsApp", "Counselling", "Demo Class", "Fee Discussion", "Admission"];

/* Colour carries the stage, and the closed ones are deliberately grey: a lost
   lead in red reads as an alarm, when it is simply finished. */
const STAGE_STYLE: Record<string, string> = {
  New: "border-info/25 bg-info/12 text-info",
  Contacted: "border-brand/25 bg-brand/12 text-brand-ink",
  Interested: "border-warning/25 bg-warning/12 text-warning",
  Counselling: "border-purple-500/25 bg-purple-500/10 text-purple-600",
  "Demo Class": "border-orange-500/25 bg-orange-500/10 text-orange-600",
  Admission: "border-success/25 bg-success/12 text-success",
  "Not Interested": "border-border bg-muted text-muted-foreground",
  Lost: "border-border bg-muted text-muted-foreground",
};

const blankLead = {
  studentName: "",
  parentName: "",
  phone: "",
  whatsapp: "",
  email: "",
  qualification: "",
  city: "",
  address: "",
  courseInterested: "",
  preferredBatch: "",
  source: "Walk-in",
  counsellor: "",
  expectedAdmissionAt: "",
  status: "New" as LeadStage,
  remarks: "",
};

const initials = (name: string) =>
  name.split(" ").filter(Boolean).map((p) => p[0]).slice(0, 2).join("").toUpperCase() || "?";

type LeadRow = AdmissionLead & { branch: string; state: string; district: string };

export default function AdmissionLeads() {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const branchId = user?.branchId || null;
  const orgId = user?.organizationId || null;
  // An organisation account sees every centre's leads, so it picks the
  // district and centre a lead belongs to and can read and filter by them.
  const showBranch = !branchId;
  const [directory, setDirectory] = useState<Array<{ id: string; name: string; state: string; district: string; block: string }>>([]);
  // State, then district, then block, then the centre: each narrows the next.
  const [leadState, setLeadState] = useState("");
  const [leadDistrict, setLeadDistrict] = useState("");
  const [leadBlock, setLeadBlock] = useState("");
  const [leadBranchId, setLeadBranchId] = useState("");
  useEffect(() => {
    if (!showBranch) return;
    let cancelled = false;
    getBranchDirectory(orgId)
      .then((r) => { if (!cancelled) setDirectory(r.data); })
      .catch(() => { if (!cancelled) setDirectory([]); });
    return () => { cancelled = true; };
  }, [showBranch, orgId]);
  const distinct = (values: string[]) => [...new Set(values.filter(Boolean))].sort();
  const states = useMemo(() => distinct(directory.map((b) => b.state)), [directory]);
  const districts = useMemo(() => distinct(directory.map((b) => b.district)), [directory]);
  // The form offers every state, that state's districts and that district's
  // blocks from the reference lists, plus any place a centre is recorded under.
  const sameText = (a: string, b: string) => a.trim().toLowerCase() === b.trim().toLowerCase();
  const inState = directory.filter((b) => !leadState || canonicalState(b.state) === leadState);
  const inDistrict = inState.filter((b) => !leadDistrict || sameText(b.district, leadDistrict));
  const inBlock = inDistrict.filter((b) => !leadBlock || sameText(b.block, leadBlock));
  // A centre with no address recorded cannot be ruled out by the place picked,
  // so it stays on offer below the centres that do match.
  const placePicked = Boolean(leadState || leadDistrict || leadBlock);
  const unplaced = placePicked ? directory.filter((b) => !b.state && !b.district && !b.block) : [];
  const formStates = useMemo(
    () => distinct([...INDIAN_STATES, ...directory.map((b) => canonicalState(b.state))]),
    [directory],
  );
  const formDistricts = leadState ? distinct([...districtsFor(leadState), ...inState.map((b) => b.district)]) : [];
  const formBlocks = leadDistrict ? distinct([...blocksFor(leadDistrict, leadState), ...inDistrict.map((b) => b.block)]) : [];

  const [leads, setLeads] = useState<AdmissionLead[]>([]);
  const [ready, setReady] = useState(true);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [draft, setDraft] = useState({ ...blankLead });
  const [addOpen, setAddOpen] = useState(false);

  const [detail, setDetail] = useState<AdmissionLead | null>(null);
  const [activities, setActivities] = useState<LeadActivity[]>([]);

  const [followingUp, setFollowingUp] = useState<AdmissionLead | null>(null);
  const [followUp, setFollowUp] = useState({ at: "", time: "", type: FOLLOW_UP_TYPES[0], status: "", note: "" });

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const result = await getAdmissionLeads(orgId, branchId);
      setLeads(result.data);
      setReady(result.ready);
    } catch (error) {
      toast({
        title: "Could not load leads",
        description: error instanceof Error ? error.message : "Please try again",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [orgId, branchId, toast]);

  useEffect(() => {
    void load();
  }, [load]);

  const summary = useMemo(() => leadSummary(leads), [leads]);
  const board = useMemo(() => admissionPipeline(leads), [leads]);
  const sources = useMemo(() => sourceBreakdown(leads), [leads]);
  const months = useMemo(() => monthlyEnquiries(leads), [leads]);
  const queue = useMemo(() => followUpQueue(leads), [leads]);
  const busiestMonth = Math.max(1, ...months.map((m) => m.count));

  const openDetail = async (lead: AdmissionLead) => {
    setDetail(lead);
    setActivities([]);
    try {
      const result = await getLeadActivities(lead.id);
      setActivities(result.data);
    } catch {
      // The timeline is context, not the record — the panel still opens.
      setActivities([]);
    }
  };

  const saveLead = async () => {
    const problem = leadProblem(draft) ?? (showBranch && !leadBranchId ? "Choose the centre this enquiry is for." : null);
    if (problem) {
      toast({ title: "Check the enquiry", description: problem, variant: "destructive" });
      return;
    }
    setSaving(true);
    try {
      await createAdmissionLead({
        ...draft,
        organizationId: orgId,
        branchId: branchId || leadBranchId || null,
        expectedAdmissionAt: draft.expectedAdmissionAt || null,
      });
      toast({ title: "Enquiry saved", description: draft.studentName });
      setAddOpen(false);
      setDraft({ ...blankLead });
      setLeadState("");
      setLeadDistrict("");
      setLeadBlock("");
      setLeadBranchId("");
      await load();
    } catch (error) {
      toast({
        title: "Could not save the enquiry",
        description: error instanceof Error ? error.message : "Please try again",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  /**
   * Opens the admission form filled from the lead -- a website application
   * already has the name, mobile and centre -- and, once the admission is
   * saved there, the lead moves to Admission against the new student.
   */
  const convertToAdmission = (lead: AdmissionLead) => {
    const [firstName, ...rest] = lead.studentName.trim().split(/\s+/);
    // Only the admission form's own fields: it saves every key of its draft.
    const draft = {
      firstName: firstName || "",
      lastName: rest.join(" "),
      phone: lead.phone || "",
      whatsappNumber: lead.whatsapp || lead.phone || "",
      email: lead.email || "",
      city: lead.city || "",
      fatherName: lead.parentName || "",
      branchId: lead.branchId || "",
    };
    try {
      localStorage.setItem("admission-draft", JSON.stringify(draft));
    } catch {
      /* the form simply opens empty */
    }
    navigate(`/student/add?lead=${encodeURIComponent(lead.id)}`);
  };

  const moveStage = async (lead: AdmissionLead, status: LeadStage) => {
    if (lead.status === status) return;
    try {
      await updateAdmissionLead(lead.id, { status });
      await logLeadActivity({
        leadId: lead.id,
        kind: `Moved to ${status}`,
        status,
        actorId: user?.id ?? null,
      }).catch(() => undefined);
      toast({ title: `Moved to ${status}`, description: lead.studentName });
      if (detail?.id === lead.id) void openDetail({ ...lead, status });
      await load();
    } catch (error) {
      toast({
        title: "Could not move the lead",
        description: error instanceof Error ? error.message : "Please try again",
        variant: "destructive",
      });
    }
  };

  const openFollowUp = (lead: AdmissionLead) => {
    setFollowingUp(lead);
    setFollowUp({
      at: lead.followUpAt ? lead.followUpAt.slice(0, 10) : "",
      time: lead.followUpAt ? new Date(lead.followUpAt).toTimeString().slice(0, 5) : "",
      type: lead.followUpType || FOLLOW_UP_TYPES[0],
      status: lead.status,
      note: "",
    });
  };

  const saveFollowUp = async () => {
    if (!followingUp) return;
    if (!followUp.at) {
      toast({ title: "Pick a date", description: "A follow-up needs a day to fall on.", variant: "destructive" });
      return;
    }
    setSaving(true);
    try {
      // Built as a local time so a 4pm call is 4pm at the centre, not in UTC.
      const at = new Date(`${followUp.at}T${followUp.time || "10:00"}:00`);
      const nextStatus = (followUp.status || followingUp.status) as LeadStage;
      await updateAdmissionLead(followingUp.id, {
        followUpAt: at.toISOString(),
        followUpType: followUp.type,
        status: nextStatus,
      });
      await logLeadActivity({
        leadId: followingUp.id,
        kind: followUp.type,
        note: followUp.note || undefined,
        status: nextStatus,
        actorId: user?.id ?? null,
      }).catch(() => undefined);
      toast({ title: "Follow-up scheduled", description: `${followingUp.studentName} · ${followUp.type}` });
      setFollowingUp(null);
      await load();
    } catch (error) {
      toast({
        title: "Could not save the follow-up",
        description: error instanceof Error ? error.message : "Please try again",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const exportLeads = () => {
    if (!leads.length) {
      toast({ title: "Nothing to export", description: "No enquiries logged yet." });
      return;
    }
    downloadCsv(
      "admission-leads.csv",
      leads.map((lead) => ({
        Student: lead.studentName,
        Parent: lead.parentName,
        Mobile: lead.phone,
        WhatsApp: lead.whatsapp,
        Email: lead.email,
        City: lead.city,
        Course: lead.courseInterested,
        Batch: lead.preferredBatch,
        Source: lead.source,
        Counsellor: lead.counsellor,
        Status: lead.status,
        FollowUp: lead.followUpAt,
        Remarks: lead.remarks,
      })),
    );
    toast({ title: "Leads exported", description: `${leads.length} rows written to CSV.` });
  };

  const centreOf = useMemo(() => new Map(directory.map((b) => [b.id, b])), [directory]);
  const rows: LeadRow[] = useMemo(
    () =>
      leads.map((l) => ({
        ...l,
        branch: centreOf.get(l.branchId)?.name ?? "",
        state: centreOf.get(l.branchId)?.state ?? "",
        district: centreOf.get(l.branchId)?.district ?? "",
      })),
    [leads, centreOf],
  );

  const columns: Column<LeadRow>[] = [
    {
      key: "studentName",
      header: "Student",
      sortable: true,
      cell: (lead) => (
        <div className="flex items-center gap-3">
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-brand/12 text-xs font-semibold text-brand-ink">
            {initials(lead.studentName)}
          </span>
          <div className="min-w-0">
            <p className="font-medium">{lead.studentName}</p>
            <p className="text-xs text-muted-foreground">{lead.city || "—"}</p>
          </div>
        </div>
      ),
    },
    {
      key: "phone",
      header: "Contact",
      cell: (lead) => <ContactActions name={lead.studentName} phone={lead.phone} whatsapp={lead.whatsapp} />,
    },
    { key: "courseInterested", header: "Course", sortable: true, cell: (l) => l.courseInterested || "—" },
    {
      key: "source",
      header: "Source",
      sortable: true,
      cell: (lead) => <Badge variant="outline">{lead.source || "Not recorded"}</Badge>,
    },
    {
      key: "counsellor",
      header: "Counsellor",
      sortable: true,
      // Which centre the counsellor is following this lead up for.
      cell: (l) => (
        <div>
          <p>{l.counsellor || "—"}</p>
          {showBranch && l.branch && <p className="text-xs text-muted-foreground">{l.branch}</p>}
        </div>
      ),
    },
    ...(showBranch
      ? [{
          key: "branch" as const,
          header: "Branch",
          sortable: true,
          cell: (l: LeadRow) => (
            <div>
              <p className="whitespace-nowrap">{l.branch || "—"}</p>
              {l.district && <p className="text-xs text-muted-foreground">{l.district}</p>}
            </div>
          ),
        }]
      : []),
    {
      key: "status",
      header: "Status",
      cell: (lead) => (
        <span className={`inline-flex whitespace-nowrap rounded-full border px-2.5 py-1 text-xs font-semibold ${STAGE_STYLE[lead.status] ?? ""}`}>
          {lead.status}
        </span>
      ),
    },
    {
      key: "followUpAt",
      header: "Follow-up",
      sortable: true,
      cell: (lead) => {
        const bucket = followUpBucket(lead.followUpAt);
        if (bucket === "None") return <span className="text-xs text-muted-foreground">Not set</span>;
        return (
          <div>
            <p className="text-sm">{new Date(lead.followUpAt).toLocaleDateString("en-IN")}</p>
            <p className={`text-xs ${bucket === "Overdue" ? "text-destructive" : "text-muted-foreground"}`}>
              {bucket === "Overdue" ? "Overdue" : new Date(lead.followUpAt).toLocaleTimeString("en-IN", { hour: "numeric", minute: "2-digit" })}
            </p>
          </div>
        );
      },
    },
  ];

  const filters: TableFilter<LeadRow>[] = [
    ...(showBranch
      ? [
          { label: "State", key: "state" as const, options: states },
          { label: "District", key: "district" as const, options: districts },
          { label: "Branch", key: "branch" as const, options: directory.map((b) => b.name) },
        ]
      : []),
    { label: "Status", key: "status", options: [...ALL_STAGES] },
    { label: "Course", key: "courseInterested" },
    { label: "Source", key: "source" },
    { label: "Counsellor", key: "counsellor" },
    {
      label: "Follow-up",
      key: "followUpAt",
      options: ["Overdue", "Today", "Upcoming", "None"],
      value: (lead) => followUpBucket(lead.followUpAt),
    },
  ];

  return (
    <AppLayout>
      <PageHeader
        title="Admission Lead Dashboard"
        description="Manage student enquiries, counselling, demo classes and admissions"
        breadcrumbs={[{ label: "Enquiry Management", href: "/enquiry/branch" }, { label: "Admission Leads" }]}
        actions={
          <div className="flex gap-2">
            <Button variant="outline" className="gap-2" onClick={exportLeads} disabled={!leads.length}>
              <Download className="h-4 w-4" />
              Export
            </Button>
            <Button className="gap-2" onClick={() => setAddOpen(true)}>
              <Plus className="h-4 w-4" />
              Add enquiry
            </Button>
          </div>
        }
      />

      {!ready && (
        <Card className="mb-6 border-warning/40 bg-warning/5">
          <CardContent className="p-4 text-sm">
            <strong>The lead tables are not in the database yet.</strong> Run{" "}
            <code>supabase/schema/admission-leads.sql</code> in the Supabase SQL editor — until then
            this page cannot store an enquiry.
          </CardContent>
        </Card>
      )}

      <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatsCard title="Total leads" value={summary.total} subtitle="All time" icon={Users} variant="primary" />
        <StatsCard title="New this month" value={summary.newThisMonth} subtitle="Fresh enquiries" icon={UserPlus} variant="info" />
        <StatsCard title="Follow-ups due" value={summary.followUpsDue} subtitle="Today and overdue" icon={CalendarClock} variant="warning" />
        <StatsCard title="Admissions" value={summary.admissions} subtitle="Converted" icon={CheckCircle2} variant="success" />
        <StatsCard title="Counselling" value={summary.counselling} subtitle="In counselling" icon={MessageSquare} variant="info" />
        <StatsCard title="Demo class" value={summary.demo} subtitle="Scheduled" icon={GraduationCap} variant="primary" />
        <StatsCard title="Lost" value={summary.lost} subtitle="Closed without admission" icon={XCircle} variant="warning" />
        <StatsCard
          title="Conversion"
          value={summary.total ? `${Math.round((summary.admissions / summary.total) * 100)}%` : "—"}
          subtitle="Leads that became students"
          icon={TrendingUp}
          variant="success"
        />
      </div>

      <div className="mb-6 grid gap-6 xl:grid-cols-3">
        <Card className="xl:col-span-2">
          <CardHeader>
            <CardTitle>Enquiry performance</CardTitle>
            <p className="text-xs text-muted-foreground">Enquiries logged each month.</p>
          </CardHeader>
          <CardContent>
            <div className="flex h-48 items-end gap-3 border-b border-l pl-3">
              {months.map((month) => (
                <div key={month.label} className="flex flex-1 flex-col items-center justify-end gap-2">
                  <span className="text-xs font-semibold">{month.count}</span>
                  <div
                    className="w-full rounded-t-lg bg-brand/70"
                    /* Scaled against the busiest month so a quiet six months
                       still reads as a shape rather than as six flat lines. */
                    style={{ height: `${Math.max(4, (month.count / busiestMonth) * 100)}%` }}
                  />
                </div>
              ))}
            </div>
            <div className="mt-3 flex justify-around text-xs text-muted-foreground">
              {months.map((month) => (
                <span key={month.label}>{month.label}</span>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Enquiry sources</CardTitle>
            <p className="text-xs text-muted-foreground">Where students find the centre.</p>
          </CardHeader>
          <CardContent className="space-y-4">
            {sources.length === 0 && (
              <p className="py-8 text-center text-sm text-muted-foreground">
                No enquiries logged yet.
              </p>
            )}
            {sources.map((row) => (
              <div key={row.source}>
                <div className="mb-1 flex justify-between text-sm">
                  <span>{row.source}</span>
                  <strong>{row.percent}%</strong>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-muted">
                  <div className="h-full rounded-full bg-brand" style={{ width: `${row.percent}%` }} />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Admission lead pipeline</CardTitle>
          <p className="text-xs text-muted-foreground">
            Track students from enquiry to admission. Closed leads are off the board.
          </p>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-6">
            {board.map(({ stage, leads: staged }) => (
              <section key={stage} className="rounded-xl bg-muted/40 p-3">
                <div className="mb-3 flex items-center justify-between">
                  <span className="text-sm font-semibold">{stage}</span>
                  <Badge variant="secondary">{staged.length}</Badge>
                </div>
                <div className="space-y-2">
                  {staged.slice(0, 6).map((lead) => (
                    <button
                      key={lead.id}
                      type="button"
                      onClick={() => void openDetail(lead)}
                      className="w-full rounded-lg border bg-card p-3 text-left transition hover:border-brand/40"
                    >
                      <p className="truncate text-sm font-semibold">{lead.studentName}</p>
                      <p className="mt-0.5 truncate text-xs text-muted-foreground">
                        {lead.courseInterested || "Course not set"}
                      </p>
                      <div className="mt-2 flex items-center justify-between gap-2">
                        <Badge variant="outline" className="text-[10px]">{lead.source || "—"}</Badge>
                        {followUpBucket(lead.followUpAt) === "Overdue" && (
                          <span className="text-[10px] font-semibold text-destructive">Overdue</span>
                        )}
                      </div>
                    </button>
                  ))}
                  {staged.length === 0 && (
                    <p className="py-6 text-center text-xs text-muted-foreground">Nothing here</p>
                  )}
                  {staged.length > 6 && (
                    <p className="pt-1 text-center text-[11px] text-muted-foreground">
                      +{staged.length - 6} more in the table below
                    </p>
                  )}
                </div>
              </section>
            ))}
          </div>
        </CardContent>
      </Card>

      {queue.length > 0 && (
        <Card className="mb-6">
          <CardHeader className="flex-row items-center justify-between space-y-0">
            <div>
              <CardTitle>Today's follow-ups</CardTitle>
              <p className="mt-1 text-xs text-muted-foreground">Overdue first, then due today.</p>
            </div>
            <Badge variant="secondary">{queue.length} pending</Badge>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {queue.slice(0, 8).map((lead) => {
              const bucket = followUpBucket(lead.followUpAt);
              return (
                <div key={lead.id} className="rounded-xl border p-4">
                  <div className="flex items-center justify-between">
                    <Badge
                      variant="outline"
                      className={bucket === "Overdue" ? "border-destructive/40 text-destructive" : "border-warning/40 text-warning"}
                    >
                      {bucket === "Overdue" ? "OVERDUE" : "TODAY"}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {new Date(lead.followUpAt).toLocaleTimeString("en-IN", { hour: "numeric", minute: "2-digit" })}
                    </span>
                  </div>
                  <p className="mt-3 font-semibold">{lead.studentName}</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {lead.followUpType || "Follow-up"} · {lead.courseInterested || "Course not set"}
                  </p>
                  <div className="mt-3">
                    <ContactActions name={lead.studentName} phone={lead.phone} whatsapp={lead.whatsapp} showNumber={false} />
                  </div>
                  <Button size="sm" className="mt-3 w-full" onClick={() => openFollowUp(lead)}>
                    Update follow-up
                  </Button>
                </div>
              );
            })}
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Student enquiries</CardTitle>
          <p className="text-xs text-muted-foreground">Every enquiry, including closed ones.</p>
        </CardHeader>
        <CardContent>
          <DataTable
            data={rows}
            columns={columns}
            filters={filters}
            searchPlaceholder="Search student, mobile, course…"
            actions={(lead) => [
              { label: "View details", onClick: () => void openDetail(lead) },
              { label: "Schedule follow-up", onClick: () => openFollowUp(lead) },
              ...(lead.studentId ? [] : [{ label: "Convert to admission", onClick: () => convertToAdmission(lead) }]),
            ]}
            emptyMessage={loading ? "Loading enquiries…" : "No enquiries logged yet."}
          />
        </CardContent>
      </Card>

      {/* ---------- add enquiry ---------- */}
      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent className="max-h-[92vh] max-w-3xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>New student enquiry</DialogTitle>
            <DialogDescription>Create an admission lead.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {showBranch && (
              <>
                <PlacePicker
                  label="State"
                  value={leadState}
                  options={formStates}
                  onChange={(v) => { setLeadState(v); setLeadDistrict(""); setLeadBlock(""); setLeadBranchId(""); }}
                />
                <PlacePicker
                  label="District"
                  value={leadDistrict}
                  options={formDistricts}
                  disabled={!leadState}
                  onChange={(v) => { setLeadDistrict(v); setLeadBlock(""); setLeadBranchId(""); }}
                />
                <PlacePicker
                  label="Block"
                  value={leadBlock}
                  options={formBlocks}
                  disabled={!leadDistrict}
                  onChange={(v) => { setLeadBlock(v); setLeadBranchId(""); }}
                />
                <div className="space-y-2">
                  <Label>Branch *</Label>
                  <Select value={leadBranchId} onValueChange={setLeadBranchId}>
                    <SelectTrigger aria-label="Branch"><SelectValue placeholder="Select branch" /></SelectTrigger>
                    <SelectContent searchable searchPlaceholder="Search centre…">
                      {inBlock.map((b) => (
                        <SelectItem key={b.id} value={b.id}>{b.district && !leadDistrict ? `${b.name} · ${b.district}` : b.name}</SelectItem>
                      ))}
                      {unplaced.length > 0 && (
                        <SelectGroup>
                          <SelectLabel className="text-xs text-muted-foreground">Address not set</SelectLabel>
                          {unplaced.map((b) => (
                            <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>
                          ))}
                        </SelectGroup>
                      )}
                      {inBlock.length + unplaced.length === 0 && (
                        <p className="px-2 py-1.5 text-sm text-muted-foreground">No centre found here</p>
                      )}
                    </SelectContent>
                  </Select>
                </div>
                <div className="hidden sm:block lg:col-span-2" />
              </>
            )}
            <div className="space-y-2">
              <Label>Student name *</Label>
              <Input value={draft.studentName} onChange={(e) => setDraft((d) => ({ ...d, studentName: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label>Father / mother name</Label>
              <Input value={draft.parentName} onChange={(e) => setDraft((d) => ({ ...d, parentName: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label>Mobile *</Label>
              <Input value={draft.phone} onChange={(e) => setDraft((d) => ({ ...d, phone: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label>WhatsApp</Label>
              <Input
                placeholder="Same as mobile if left blank"
                value={draft.whatsapp}
                onChange={(e) => setDraft((d) => ({ ...d, whatsapp: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label>Email</Label>
              <Input type="email" value={draft.email} onChange={(e) => setDraft((d) => ({ ...d, email: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label>Qualification</Label>
              <Select value={draft.qualification} onValueChange={(v) => setDraft((d) => ({ ...d, qualification: v }))}>
                <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                <SelectContent>
                  {QUALIFICATIONS.map((q) => <SelectItem key={q} value={q}>{q}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Course interested</Label>
              <Input value={draft.courseInterested} onChange={(e) => setDraft((d) => ({ ...d, courseInterested: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label>Preferred batch</Label>
              <Select value={draft.preferredBatch} onValueChange={(v) => setDraft((d) => ({ ...d, preferredBatch: v }))}>
                <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                <SelectContent>
                  {BATCH_PREFERENCES.map((b) => <SelectItem key={b} value={b}>{b}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Lead source</Label>
              <Select value={draft.source} onValueChange={(v) => setDraft((d) => ({ ...d, source: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {SOURCES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Counsellor</Label>
              <Input value={draft.counsellor} onChange={(e) => setDraft((d) => ({ ...d, counsellor: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label>City</Label>
              <Input value={draft.city} onChange={(e) => setDraft((d) => ({ ...d, city: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label>Expected admission</Label>
              <DatePicker value={draft.expectedAdmissionAt} onChange={(v) => setDraft((d) => ({ ...d, expectedAdmissionAt: v }))} />
            </div>
            <div className="space-y-2">
              <Label>Initial status</Label>
              <Select value={draft.status} onValueChange={(v) => setDraft((d) => ({ ...d, status: v as LeadStage }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {LEAD_STAGES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2 sm:col-span-2 lg:col-span-3">
              <Label>Address</Label>
              <Textarea rows={2} value={draft.address} onChange={(e) => setDraft((d) => ({ ...d, address: e.target.value }))} />
            </div>
            <div className="space-y-2 sm:col-span-2 lg:col-span-3">
              <Label>Enquiry remarks</Label>
              <Textarea
                rows={3}
                placeholder="Course requirement, fee discussion, what they are looking for…"
                value={draft.remarks}
                onChange={(e) => setDraft((d) => ({ ...d, remarks: e.target.value }))}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddOpen(false)}>Cancel</Button>
            <Button onClick={saveLead} disabled={saving}>{saving ? "Saving…" : "Save enquiry"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ---------- follow-up ---------- */}
      <Dialog open={!!followingUp} onOpenChange={(open) => !open && setFollowingUp(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Follow up with {followingUp?.studentName}</DialogTitle>
            <DialogDescription>Book the next call, and record this one.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Date *</Label>
                <DatePicker value={followUp.at} onChange={(v) => setFollowUp((f) => ({ ...f, at: v }))} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="followUpTime">Time</Label>
                <Input
                  id="followUpTime"
                  type="time"
                  value={followUp.time}
                  onChange={(e) => setFollowUp((f) => ({ ...f, time: e.target.value }))}
                />
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Follow-up type</Label>
                <Select value={followUp.type} onValueChange={(v) => setFollowUp((f) => ({ ...f, type: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {FOLLOW_UP_TYPES.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Lead status</Label>
                <Select value={followUp.status} onValueChange={(v) => setFollowUp((f) => ({ ...f, status: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {ALL_STAGES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Notes</Label>
              <Textarea
                rows={4}
                placeholder="What was discussed…"
                value={followUp.note}
                onChange={(e) => setFollowUp((f) => ({ ...f, note: e.target.value }))}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setFollowingUp(null)}>Cancel</Button>
            <Button onClick={saveFollowUp} disabled={saving}>{saving ? "Saving…" : "Save follow-up"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ---------- lead details ---------- */}
      <Dialog open={!!detail} onOpenChange={(open) => !open && setDetail(null)}>
        <DialogContent className="max-h-[92vh] max-w-2xl overflow-y-auto">
          {detail && (
            <>
              <DialogHeader>
                <DialogTitle>{detail.studentName}</DialogTitle>
                <DialogDescription>
                  {detail.courseInterested || "No course set"} · {detail.source || "Source not recorded"}
                </DialogDescription>
              </DialogHeader>

              <div className="flex flex-wrap items-center gap-3 rounded-xl border p-4">
                <ContactActions name={detail.studentName} phone={detail.phone} whatsapp={detail.whatsapp} />
                <Button size="sm" variant="outline" className="ml-auto" onClick={() => { openFollowUp(detail); setDetail(null); }}>
                  Schedule follow-up
                </Button>
              </div>

              <div className="space-y-2 rounded-xl border p-4">
                <Label>Pipeline stage</Label>
                <Select value={detail.status} onValueChange={(v) => void moveStage(detail, v as LeadStage)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {ALL_STAGES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>

              <dl className="grid grid-cols-2 gap-x-4 gap-y-3 text-sm sm:grid-cols-3">
                {[
                  ["Mobile", detail.phone ? formatPhone(detail.phone) : "—"],
                  ["Parent", detail.parentName || "—"],
                  ["Qualification", detail.qualification || "—"],
                  ["Preferred batch", detail.preferredBatch || "—"],
                  ["Counsellor", detail.counsellor || "—"],
                  ["City", detail.city || "—"],
                  ["Expected admission", detail.expectedAdmissionAt ? new Date(detail.expectedAdmissionAt).toLocaleDateString("en-IN") : "—"],
                  ["Next follow-up", detail.followUpAt ? new Date(detail.followUpAt).toLocaleString("en-IN") : "Not set"],
                  ["Email", detail.email || "—"],
                ].map(([label, value]) => (
                  <div key={String(label)}>
                    <dt className="text-xs text-muted-foreground">{label}</dt>
                    <dd className="mt-0.5 font-medium">{value}</dd>
                  </div>
                ))}
              </dl>

              {detail.remarks && (
                <div className="rounded-xl bg-muted/40 p-4">
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Remarks</p>
                  <p className="mt-1 whitespace-pre-line text-sm">{detail.remarks}</p>
                </div>
              )}

              <div>
                <p className="mb-3 text-sm font-semibold">Activity timeline</p>
                {activities.length === 0 ? (
                  <p className="text-sm text-muted-foreground">Nothing logged against this lead yet.</p>
                ) : (
                  <ol className="ml-2 space-y-4 border-l-2 pl-5">
                    {activities.map((activity) => (
                      <li key={activity.id} className="relative">
                        <span className="absolute -left-[27px] top-1.5 h-3 w-3 rounded-full border-2 border-background bg-brand" />
                        <p className="text-sm font-medium">{activity.kind}</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(activity.occurredAt).toLocaleString("en-IN")}
                          {activity.status ? ` · ${activity.status}` : ""}
                        </p>
                        {activity.note && <p className="mt-1 text-sm">{activity.note}</p>}
                      </li>
                    ))}
                  </ol>
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}

/** One step of the State → District → Block picker; each step waits for the one before it. */
function PlacePicker({ label, value, options, disabled, onChange }: { label: string; value: string; options: string[]; disabled?: boolean; onChange: (v: string) => void }) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <Select value={value} onValueChange={onChange} disabled={disabled}>
        <SelectTrigger aria-label={label}><SelectValue placeholder={`Select ${label.toLowerCase()}`} /></SelectTrigger>
        <SelectContent>
          {options.map((o) => <SelectItem key={o} value={o}>{o}</SelectItem>)}
        </SelectContent>
      </Select>
    </div>
  );
}
