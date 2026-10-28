import { useCallback, useEffect, useMemo, useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { PageHeader } from "@/components/ui/PageHeader";
import { StatsCard } from "@/components/ui/StatsCard";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Building2, CalendarClock, CheckCircle2, Download, FileSignature, MapPin, Plus, TrendingUp, Users } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { downloadCsv } from "@/lib/export";
import { INDIAN_STATES, districtsFor } from "@/data/indianStates";
import { blocksFor, citiesFor } from "@/data/indianCities";
import { SelectWithCustom } from "@/components/ui/select-with-custom";
import { followUpBucket, followUpQueue, monthlyEnquiries, pipeline } from "@/lib/leads";
import {
  FRANCHISE_STAGES,
  createFranchiseLead,
  getFranchiseLeadActivities,
  getFranchiseLeads,
  logFranchiseActivity,
  updateFranchiseLead,
  type FranchiseLead,
  type FranchiseStage,
  type LeadActivity,
} from "@/lib/supabase/data";

const ALL_STAGES: FranchiseStage[] = [...FRANCHISE_STAGES, "Lost"];

const BUDGETS = ["Below ₹3 Lakh", "₹3–5 Lakh", "₹5–10 Lakh", "₹10–15 Lakh", "₹15–25 Lakh", "Above ₹25 Lakh"];
const EXPERIENCE = ["No Experience", "Education", "Computer Institute", "Cyber Cafe", "Digital Services", "Other Business"];
const FRANCHISE_TYPES = ["Computer Education Centre", "Cyber Cafe + Education", "AI & Automation Centre", "Multi-Service Centre", "Full Franchise"];
const ACTIVITIES = ["Call", "WhatsApp", "Meeting", "Site Visit", "Document Collection", "Agreement Discussion", "Payment Discussion"];
const FACILITIES = ["Internet", "Printer / Scanner", "White board", "Washroom"];

const STAGE_STYLE: Record<string, string> = {
  "New Lead": "border-info/25 bg-info/12 text-info",
  Contacted: "border-brand/25 bg-brand/12 text-brand-ink",
  Interested: "border-purple-500/25 bg-purple-500/10 text-purple-600",
  "Site Visit": "border-orange-500/25 bg-orange-500/10 text-orange-600",
  Verification: "border-warning/25 bg-warning/12 text-warning",
  Agreement: "border-warning/25 bg-warning/12 text-warning",
  Converted: "border-success/25 bg-success/12 text-success",
  Lost: "border-border bg-muted text-muted-foreground",
};

const blank = {
  directorName: "",
  ownerName: "",
  phone: "",
  whatsapp: "",
  email: "",
  qualification: "",
  state: "",
  district: "",
  block: "",
  city: "",
  pincode: "",
  landmark: "",
  wardNo: "",
  address: "",
  investmentBudget: "",
  centreAreaSqFt: "",
  computers: "",
  expectedOpeningAt: "",
  facilities: [] as string[],
  businessExperience: "",
  franchiseType: "",
  executive: "",
  remarks: "",
  status: "New Lead" as FranchiseStage,
};

const initials = (name: string) =>
  name.split(" ").filter(Boolean).map((p) => p[0]).slice(0, 2).join("").toUpperCase() || "?";

export default function FranchiseLeads() {
  const { user } = useAuth();
  const { toast } = useToast();
  const orgId = user?.organizationId || null;

  const [leads, setLeads] = useState<FranchiseLead[]>([]);
  const [ready, setReady] = useState(true);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [draft, setDraft] = useState({ ...blank });
  const [addOpen, setAddOpen] = useState(false);

  const [detail, setDetail] = useState<FranchiseLead | null>(null);
  const [activities, setActivities] = useState<LeadActivity[]>([]);

  const [followingUp, setFollowingUp] = useState<FranchiseLead | null>(null);
  const [followUp, setFollowUp] = useState({ at: "", time: "", type: ACTIVITIES[0], status: "", note: "" });

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const result = await getFranchiseLeads(orgId);
      setLeads(result.data);
      setReady(result.ready);
    } catch (error) {
      toast({
        title: "Could not load franchise leads",
        description: error instanceof Error ? error.message : "Please try again",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [orgId, toast]);

  useEffect(() => {
    void load();
  }, [load]);

  const board = useMemo(() => pipeline(leads, FRANCHISE_STAGES), [leads]);
  const queue = useMemo(() => followUpQueue(leads), [leads]);
  const months = useMemo(() => monthlyEnquiries(leads), [leads]);
  const busiest = Math.max(1, ...months.map((m) => m.count));
  const siteVisits = useMemo(
    () =>
      leads
        .filter((l) => l.status === "Site Visit" && l.followUpAt)
        .sort((a, b) => new Date(a.followUpAt).getTime() - new Date(b.followUpAt).getTime()),
    [leads],
  );

  const countAt = (stage: FranchiseStage) => leads.filter((l) => l.status === stage).length;
  const converted = countAt("Converted");

  const districtOptions = useMemo(() => districtsFor(draft.state), [draft.state]);
  const blockOptions = useMemo(() => blocksFor(draft.district, draft.state), [draft.district, draft.state]);
  const cityOptions = useMemo(() => citiesFor(draft.district), [draft.district]);

  const openDetail = async (lead: FranchiseLead) => {
    setDetail(lead);
    setActivities([]);
    try {
      const result = await getFranchiseLeadActivities(lead.id);
      setActivities(result.data);
    } catch {
      setActivities([]);
    }
  };

  const save = async () => {
    if (!draft.directorName.trim()) {
      toast({ title: "Name required", description: "Who is applying?", variant: "destructive" });
      return;
    }
    if (draft.phone.replace(/\D/g, "").length < 10) {
      toast({ title: "Check the mobile", description: "At least 10 digits.", variant: "destructive" });
      return;
    }
    setSaving(true);
    try {
      await createFranchiseLead({
        ...draft,
        organizationId: orgId,
        // Empty boxes are left out rather than written as "", so a number
        // column never receives an empty string and a date never an empty day.
        centreAreaSqFt: draft.centreAreaSqFt ? Number(draft.centreAreaSqFt) : null,
        computers: draft.computers ? Number(draft.computers) : null,
        expectedOpeningAt: draft.expectedOpeningAt || null,
        facilities: draft.facilities,
      });
      toast({ title: "Franchise lead added", description: draft.directorName });
      setAddOpen(false);
      setDraft({ ...blank });
      await load();
    } catch (error) {
      toast({
        title: "Could not save the lead",
        description: error instanceof Error ? error.message : "Please try again",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const moveStage = async (lead: FranchiseLead, status: FranchiseStage) => {
    if (lead.status === status) return;
    try {
      await updateFranchiseLead(lead.id, { status });
      await logFranchiseActivity({ leadId: lead.id, kind: `Moved to ${status}`, status, actorId: user?.id ?? null }).catch(() => undefined);
      toast({ title: `Moved to ${status}`, description: lead.directorName });
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

  const openFollowUp = (lead: FranchiseLead) => {
    setFollowingUp(lead);
    setFollowUp({
      at: lead.followUpAt ? lead.followUpAt.slice(0, 10) : "",
      time: lead.followUpAt ? new Date(lead.followUpAt).toTimeString().slice(0, 5) : "",
      type: lead.followUpType || ACTIVITIES[0],
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
      // Local time, so a site visit booked for 11am is 11am at the centre.
      const at = new Date(`${followUp.at}T${followUp.time || "10:00"}:00`);
      const nextStatus = (followUp.status || followingUp.status) as FranchiseStage;
      await updateFranchiseLead(followingUp.id, {
        followUpAt: at.toISOString(),
        followUpType: followUp.type,
        status: nextStatus,
      });
      await logFranchiseActivity({
        leadId: followingUp.id,
        kind: followUp.type,
        note: followUp.note || undefined,
        status: nextStatus,
        actorId: user?.id ?? null,
      }).catch(() => undefined);
      toast({ title: "Follow-up scheduled", description: `${followingUp.directorName} · ${followUp.type}` });
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
      toast({ title: "Nothing to export", description: "No franchise leads yet." });
      return;
    }
    downloadCsv(
      "franchise-leads.csv",
      leads.map((l) => ({
        LeadNo: l.leadNo,
        Director: l.directorName,
        Mobile: l.phone,
        Email: l.email,
        State: l.state,
        District: l.district,
        City: l.city,
        Investment: l.investmentBudget,
        AreaSqFt: l.centreAreaSqFt ?? "",
        Computers: l.computers ?? "",
        FranchiseType: l.franchiseType,
        Executive: l.executive,
        Status: l.status,
        FollowUp: l.followUpAt,
      })),
    );
    toast({ title: "Leads exported", description: `${leads.length} rows written to CSV.` });
  };

  const columns: Column<FranchiseLead>[] = [
    {
      key: "directorName",
      header: "Lead",
      sortable: true,
      cell: (lead) => (
        <div className="flex items-center gap-3">
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-brand/12 text-xs font-semibold text-brand-ink">
            {initials(lead.directorName)}
          </span>
          <div className="min-w-0">
            <p className="font-semibold">{lead.directorName}</p>
            <p className="text-xs text-muted-foreground">{lead.leadNo}</p>
          </div>
        </div>
      ),
    },
    {
      key: "phone",
      header: "Contact",
      cell: (lead) => <ContactActions name={lead.directorName} phone={lead.phone} whatsapp={lead.whatsapp} />,
    },
    {
      key: "city",
      header: "Location",
      sortable: true,
      cell: (lead) => (
        <div>
          <p className="text-sm font-medium">{lead.city || lead.district || "—"}</p>
          <p className="text-xs text-muted-foreground">
            {[lead.district && lead.city ? lead.district : "", lead.state].filter(Boolean).join(", ") || "—"}
          </p>
        </div>
      ),
    },
    { key: "investmentBudget", header: "Investment", sortable: true, cell: (l) => l.investmentBudget || "—" },
    {
      key: "centreAreaSqFt",
      header: "Infrastructure",
      cell: (lead) => (
        <div>
          <p className="text-sm">{lead.centreAreaSqFt ? `${lead.centreAreaSqFt} sq.ft.` : "—"}</p>
          <p className="text-xs text-muted-foreground">
            {lead.computers ? `${lead.computers} computers` : "Computers not stated"}
          </p>
        </div>
      ),
    },
    { key: "executive", header: "Executive", sortable: true, cell: (l) => l.executive || "—" },
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
              {bucket === "Overdue" ? "Overdue" : lead.followUpType || "Call"}
            </p>
          </div>
        );
      },
    },
  ];

  const filters: TableFilter<FranchiseLead>[] = [
    { label: "Status", key: "status", options: ALL_STAGES },
    { label: "State", key: "state" },
    { label: "District", key: "district" },
    { label: "Investment", key: "investmentBudget" },
    { label: "Executive", key: "executive" },
    {
      label: "Follow-up",
      key: "followUpAt",
      options: ["Overdue", "Today", "Upcoming", "None"],
      value: (lead) => followUpBucket(lead.followUpAt),
    },
  ];

  const setField = <K extends keyof typeof blank>(key: K, value: (typeof blank)[K]) =>
    setDraft((d) => ({ ...d, [key]: value }));

  return (
    <AppLayout>
      <PageHeader
        title="Branch Lead Management"
        description="Franchise applicants, from first enquiry to a branch that opens"
        breadcrumbs={[{ label: "Branch Management", href: "/branch/view" }, { label: "Branch Leads" }]}
        actions={
          <div className="flex gap-2">
            <Button variant="outline" className="gap-2" onClick={exportLeads} disabled={!leads.length}>
              <Download className="h-4 w-4" />
              Export
            </Button>
            <Button className="gap-2" onClick={() => setAddOpen(true)}>
              <Plus className="h-4 w-4" />
              Add franchise lead
            </Button>
          </div>
        }
      />

      {!ready && (
        <Card className="mb-6 border-warning/40 bg-warning/5">
          <CardContent className="p-4 text-sm">
            <strong>The franchise lead tables are not in the database yet.</strong> Run{" "}
            <code>supabase/schema/franchise-leads.sql</code> in the Supabase SQL editor — until then
            this page cannot store a lead.
          </CardContent>
        </Card>
      )}

      <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatsCard title="Total leads" value={leads.length} subtitle="All time" icon={Users} variant="primary" />
        <StatsCard title="New" value={countAt("New Lead")} subtitle="Fresh enquiries" icon={Plus} variant="info" />
        <StatsCard title="Site visits" value={countAt("Site Visit")} subtitle="Inspection stage" icon={MapPin} variant="warning" />
        <StatsCard title="Agreement" value={countAt("Agreement")} subtitle="Paperwork stage" icon={FileSignature} variant="warning" />
        <StatsCard title="Converted" value={converted} subtitle="Branches opened" icon={Building2} variant="success" />
        <StatsCard title="Follow-ups due" value={queue.length} subtitle="Today and overdue" icon={CalendarClock} variant="warning" />
        <StatsCard title="Lost" value={countAt("Lost")} subtitle="Closed without a branch" icon={CheckCircle2} variant="info" />
        <StatsCard
          title="Conversion"
          value={leads.length ? `${Math.round((converted / leads.length) * 100)}%` : "—"}
          subtitle="Leads that became branches"
          icon={TrendingUp}
          variant="success"
        />
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Franchise lead pipeline</CardTitle>
          <p className="text-xs text-muted-foreground">
            Every branch enquiry, stage by stage. Lost leads are off the board.
          </p>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-7">
            {board.map(({ stage, leads: staged }, index) => (
              <section key={stage} className="rounded-xl bg-muted/40 p-3">
                <div className="mb-3 flex items-center justify-between">
                  <span className="text-[11px] font-bold text-muted-foreground">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <Badge variant="secondary">{staged.length}</Badge>
                </div>
                <p className="text-sm font-semibold">{stage}</p>
                <p className="mt-1 text-2xl font-bold">{staged.length}</p>
                <div className="mt-3 space-y-2">
                  {staged.slice(0, 3).map((lead) => (
                    <button
                      key={lead.id}
                      type="button"
                      onClick={() => void openDetail(lead)}
                      className="w-full rounded-lg border bg-card p-2 text-left transition hover:border-brand/40"
                    >
                      <p className="truncate text-xs font-semibold">{lead.directorName}</p>
                      <p className="truncate text-[11px] text-muted-foreground">
                        {lead.city || lead.district || "Location not set"}
                      </p>
                    </button>
                  ))}
                  {staged.length > 3 && (
                    <p className="text-center text-[11px] text-muted-foreground">
                      +{staged.length - 3} more
                    </p>
                  )}
                </div>
              </section>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="mb-6 grid gap-6 xl:grid-cols-3">
        <Card className="xl:col-span-2">
          <CardHeader>
            <CardTitle>Lead flow</CardTitle>
            <p className="text-xs text-muted-foreground">Franchise enquiries logged each month.</p>
          </CardHeader>
          <CardContent>
            <div className="flex h-40 items-end gap-3 border-b border-l pl-3">
              {months.map((month) => (
                <div key={month.label} className="flex flex-1 flex-col items-center justify-end gap-2">
                  <span className="text-xs font-semibold">{month.count}</span>
                  <div
                    className="w-full rounded-t-lg bg-brand/70"
                    style={{ height: `${Math.max(4, (month.count / busiest) * 100)}%` }}
                  />
                </div>
              ))}
            </div>
            <div className="mt-3 flex justify-around text-xs text-muted-foreground">
              {months.map((month) => <span key={month.label}>{month.label}</span>)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Upcoming site visits</CardTitle>
            <p className="text-xs text-muted-foreground">Scheduled inspections.</p>
          </CardHeader>
          <CardContent className="space-y-3">
            {siteVisits.length === 0 && (
              <p className="py-8 text-center text-sm text-muted-foreground">Nothing scheduled.</p>
            )}
            {siteVisits.slice(0, 5).map((lead) => (
              <div key={lead.id} className="rounded-xl border p-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="truncate font-semibold">{lead.directorName}</p>
                    <p className="truncate text-xs text-muted-foreground">
                      {[lead.city, lead.district].filter(Boolean).join(" · ") || "Location not set"}
                    </p>
                  </div>
                  <Badge variant="outline" className="shrink-0 text-[10px]">
                    {new Date(lead.followUpAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short" })}
                  </Badge>
                </div>
                <p className="mt-2 text-xs text-muted-foreground">
                  {new Date(lead.followUpAt).toLocaleTimeString("en-IN", { hour: "numeric", minute: "2-digit" })}
                  {lead.executive ? ` · ${lead.executive}` : ""}
                </p>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

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
                  <p className="mt-3 font-semibold">{lead.directorName}</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {lead.followUpType || "Follow-up"} · {lead.investmentBudget || "Budget not stated"}
                  </p>
                  <div className="mt-3">
                    <ContactActions name={lead.directorName} phone={lead.phone} whatsapp={lead.whatsapp} showNumber={false} />
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
          <CardTitle>Franchise branch leads</CardTitle>
          <p className="text-xs text-muted-foreground">Manage applicants and branch enquiries.</p>
        </CardHeader>
        <CardContent>
          <DataTable
            data={leads}
            columns={columns}
            filters={filters}
            searchPlaceholder="Search name, mobile, city…"
            actions={(lead) => [
              { label: "View details", onClick: () => void openDetail(lead) },
              { label: "Schedule follow-up", onClick: () => openFollowUp(lead) },
            ]}
            emptyMessage={loading ? "Loading leads…" : "No franchise leads yet."}
          />
        </CardContent>
      </Card>

      {/* ---------- add lead ---------- */}
      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent className="max-h-[92vh] max-w-4xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add franchise branch lead</DialogTitle>
            <DialogDescription>Create a new franchise enquiry.</DialogDescription>
          </DialogHeader>

          <p className="text-sm font-bold text-brand-ink">01. Applicant information</p>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div className="space-y-2">
              <Label>Director name *</Label>
              <Input value={draft.directorName} onChange={(e) => setField("directorName", e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Father / business owner</Label>
              <Input value={draft.ownerName} onChange={(e) => setField("ownerName", e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Mobile *</Label>
              <Input value={draft.phone} onChange={(e) => setField("phone", e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>WhatsApp</Label>
              <Input placeholder="Same as mobile if blank" value={draft.whatsapp} onChange={(e) => setField("whatsapp", e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Email</Label>
              <Input type="email" value={draft.email} onChange={(e) => setField("email", e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Highest qualification</Label>
              <Input value={draft.qualification} onChange={(e) => setField("qualification", e.target.value)} />
            </div>
          </div>

          <p className="mt-2 text-sm font-bold text-brand-ink">02. Proposed branch location</p>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div className="space-y-2">
              <Label>State</Label>
              <Select
                value={draft.state}
                onValueChange={(v) => setDraft((d) => ({ ...d, state: v, district: "", block: "", city: "" }))}
              >
                <SelectTrigger><SelectValue placeholder="Select state" /></SelectTrigger>
                <SelectContent>
                  {INDIAN_STATES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>District</Label>
              {/* Each list waits for the one before it; a place the bundled
                  lists do not carry is typed in under "Other". */}
              <SelectWithCustom
                value={draft.district}
                onValueChange={(v) => setDraft((d) => ({ ...d, district: v, block: "", city: "" }))}
                options={districtOptions}
                placeholder={draft.state ? "Select district" : "Select a state first"}
                customPlaceholder="Type the district"
                disabled={!draft.state}
              />
            </div>
            <div className="space-y-2">
              <Label>Block / police station</Label>
              <SelectWithCustom
                value={draft.block}
                onValueChange={(v) => setField("block", v)}
                options={blockOptions}
                placeholder={draft.district ? "Select block" : "Select a district first"}
                customPlaceholder="Type the block"
                disabled={!draft.district}
              />
            </div>
            <div className="space-y-2">
              <Label>City / town</Label>
              <SelectWithCustom
                value={draft.city}
                onValueChange={(v) => setField("city", v)}
                options={cityOptions}
                placeholder={draft.district ? "Select city" : "Select a district first"}
                customPlaceholder="Type the city"
                disabled={!draft.district}
              />
            </div>
            <div className="space-y-2">
              <Label>Pincode</Label>
              <Input value={draft.pincode} onChange={(e) => setField("pincode", e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Landmark</Label>
              <Input placeholder="Market / area" value={draft.landmark} onChange={(e) => setField("landmark", e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Flat / ward no</Label>
              <Input value={draft.wardNo} onChange={(e) => setField("wardNo", e.target.value)} />
            </div>
            <div className="space-y-2 sm:col-span-2 lg:col-span-3">
              <Label>Complete address</Label>
              <Textarea rows={2} value={draft.address} onChange={(e) => setField("address", e.target.value)} />
            </div>
          </div>

          <p className="mt-2 text-sm font-bold text-brand-ink">03. Investment &amp; infrastructure</p>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="space-y-2">
              <Label>Investment budget</Label>
              <Select value={draft.investmentBudget} onValueChange={(v) => setField("investmentBudget", v)}>
                <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                <SelectContent>
                  {BUDGETS.map((b) => <SelectItem key={b} value={b}>{b}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Centre area (sq.ft.)</Label>
              <Input type="number" min={0} value={draft.centreAreaSqFt} onChange={(e) => setField("centreAreaSqFt", e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Computers / laptops</Label>
              <Input type="number" min={0} value={draft.computers} onChange={(e) => setField("computers", e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Expected opening</Label>
              <DatePicker value={draft.expectedOpeningAt} onChange={(v) => setField("expectedOpeningAt", v)} />
            </div>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {FACILITIES.map((facility) => (
              <label key={facility} className="flex cursor-pointer items-center gap-2 rounded-xl border p-3 text-sm">
                <Checkbox
                  className="rounded-[3px]"
                  checked={draft.facilities.includes(facility)}
                  onCheckedChange={(on) =>
                    setDraft((d) => ({
                      ...d,
                      facilities: on
                        ? [...d.facilities, facility]
                        : d.facilities.filter((f) => f !== facility),
                    }))
                  }
                />
                {facility}
              </label>
            ))}
          </div>

          <p className="mt-2 text-sm font-bold text-brand-ink">04. Business information</p>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div className="space-y-2">
              <Label>Previous business experience</Label>
              <Select value={draft.businessExperience} onValueChange={(v) => setField("businessExperience", v)}>
                <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                <SelectContent>
                  {EXPERIENCE.map((e) => <SelectItem key={e} value={e}>{e}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Franchise type</Label>
              <Select value={draft.franchiseType} onValueChange={(v) => setField("franchiseType", v)}>
                <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                <SelectContent>
                  {FRANCHISE_TYPES.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Assigned executive</Label>
              <Input value={draft.executive} onChange={(e) => setField("executive", e.target.value)} />
            </div>
            <div className="space-y-2 sm:col-span-2 lg:col-span-3">
              <Label>Remarks</Label>
              <Textarea rows={3} value={draft.remarks} onChange={(e) => setField("remarks", e.target.value)} />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setAddOpen(false)}>Cancel</Button>
            <Button onClick={save} disabled={saving}>{saving ? "Saving…" : "Save franchise lead"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ---------- follow-up ---------- */}
      <Dialog open={!!followingUp} onOpenChange={(open) => !open && setFollowingUp(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Follow up with {followingUp?.directorName}</DialogTitle>
            <DialogDescription>Book the next activity, and record this one.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Activity type</Label>
              <Select value={followUp.type} onValueChange={(v) => setFollowUp((f) => ({ ...f, type: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {ACTIVITIES.map((a) => <SelectItem key={a} value={a}>{a}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Date *</Label>
                <DatePicker value={followUp.at} onChange={(v) => setFollowUp((f) => ({ ...f, at: v }))} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="frTime">Time</Label>
                <Input id="frTime" type="time" value={followUp.time} onChange={(e) => setFollowUp((f) => ({ ...f, time: e.target.value }))} />
              </div>
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
            <div className="space-y-2">
              <Label>Notes</Label>
              <Textarea rows={4} value={followUp.note} onChange={(e) => setFollowUp((f) => ({ ...f, note: e.target.value }))} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setFollowingUp(null)}>Cancel</Button>
            <Button onClick={saveFollowUp} disabled={saving}>{saving ? "Saving…" : "Schedule follow-up"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ---------- details ---------- */}
      <Dialog open={!!detail} onOpenChange={(open) => !open && setDetail(null)}>
        <DialogContent className="max-h-[92vh] max-w-2xl overflow-y-auto">
          {detail && (
            <>
              <DialogHeader>
                <DialogTitle>{detail.directorName}</DialogTitle>
                <DialogDescription>
                  {detail.leadNo} · {[detail.city, detail.district, detail.state].filter(Boolean).join(", ") || "Location not set"}
                </DialogDescription>
              </DialogHeader>

              <div className="flex flex-wrap items-center gap-3 rounded-xl border p-4">
                <ContactActions name={detail.directorName} phone={detail.phone} whatsapp={detail.whatsapp} />
                <Button size="sm" variant="outline" className="ml-auto" onClick={() => { openFollowUp(detail); setDetail(null); }}>
                  Schedule follow-up
                </Button>
              </div>

              <div className="space-y-2 rounded-xl border p-4">
                <Label>Pipeline stage</Label>
                <Select value={detail.status} onValueChange={(v) => void moveStage(detail, v as FranchiseStage)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {ALL_STAGES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>

              <dl className="grid grid-cols-2 gap-x-4 gap-y-3 text-sm sm:grid-cols-3">
                {[
                  ["Investment", detail.investmentBudget || "—"],
                  ["Centre area", detail.centreAreaSqFt ? `${detail.centreAreaSqFt} sq.ft.` : "—"],
                  ["Computers", detail.computers ?? "—"],
                  ["Franchise type", detail.franchiseType || "—"],
                  ["Experience", detail.businessExperience || "—"],
                  ["Executive", detail.executive || "—"],
                  ["Qualification", detail.qualification || "—"],
                  ["Expected opening", detail.expectedOpeningAt ? new Date(detail.expectedOpeningAt).toLocaleDateString("en-IN") : "—"],
                  ["Next follow-up", detail.followUpAt ? new Date(detail.followUpAt).toLocaleString("en-IN") : "Not set"],
                ].map(([label, value]) => (
                  <div key={String(label)}>
                    <dt className="text-xs text-muted-foreground">{label}</dt>
                    <dd className="mt-0.5 font-medium">{value}</dd>
                  </div>
                ))}
              </dl>

              {detail.facilities.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {detail.facilities.map((f) => <Badge key={f} variant="secondary">{f}</Badge>)}
                </div>
              )}

              {detail.remarks && (
                <div className="rounded-xl bg-muted/40 p-4">
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Remarks</p>
                  <p className="mt-1 whitespace-pre-line text-sm">{detail.remarks}</p>
                </div>
              )}

              <div>
                <p className="mb-3 text-sm font-semibold">Lead timeline</p>
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
