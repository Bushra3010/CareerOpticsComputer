import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { DatePicker, DateTimePicker } from "@/components/ui/date-picker";
import { telHref, whatsappHref } from "@/lib/phone";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { EditableSelect } from "@/components/ui/EditableSelect";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  ChevronDown,
  Download,
  Filter,
  MoreHorizontal,
  Plus,
  Save,
  Search,
  SlidersHorizontal,
  UserRoundCheck,
  Users,
  X,
  MessageCircle,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import {
  getEnquiries,
  createEnquiry,
  updateEnquiry,
  deleteEnquiry,
  getBranches,
} from "@/lib/supabase/data";
import {
  ENQUIRY_STATUSES,
  ENQUIRY_STATUS_LABEL,
  formatDate,
  formatDateTime,
  isToday,
  toDepartmentEnum,
  toIdTypeEnum,
  toIsoTimestamp,
  toPurposeEnum,
} from "@/lib/supabase/reception";
import { downloadCsv } from "@/lib/export";

/**
 * One row of the visitor log, already flattened out of `visit_enquiries`.
 * `status` holds the raw EnquiryStatus enum value — labels come from
 * ENQUIRY_STATUS_LABEL so filtering and writing use the same vocabulary.
 */
type EnquiryRow = {
  id: string;
  /** The row's own branchId — updateEnquiry/deleteEnquiry filter on it. */
  branchIdRef: string;
  name: string;
  phone: string;
  whatsappNumber: string;
  purpose: string;
  owner: string;
  status: string;
  date: string;
  source: string;
  visitDate: string | null;
  followUpDate: string | null;
  followUpTime: string;
  followUpNotes: string;
  callType: string;
  checkOut: string | null;
};

const stages = ["Visitor", "Visit", "Verification", "Follow-up", "Review"];
const CALL_TYPES = ["Incoming", "Outgoing"];

type Draft = {
  name: string;
  phone: string;
  whatsappNumber: string;
  email: string;
  candidateName: string;
  address: string;
  registrationDate: string;
  visitDate: string;
  visitTime: string;
  purpose: string;
  person: string;
  department: string;
  idType: string;
  idNumber: string;
  source: string;
  enquiryReason: string;
  location: string;
  remarks: string;
  followUpDate: string;
  followUpTime: string;
  followUpNotes: string;
  callType: string;
  notes: string;
};
const emptyDraft: Draft = {
  name: "",
  phone: "",
  whatsappNumber: "",
  email: "",
  candidateName: "",
  address: "",
  registrationDate: new Date().toLocaleDateString("en-CA"),
  // Today on the local calendar: toISOString's date is yesterday until 5:30 am in India.
  visitDate: new Date().toLocaleDateString("en-CA"),
  visitTime: new Date().toTimeString().slice(0, 5),
  purpose: "",
  person: "",
  department: "",
  idType: "",
  idNumber: "",
  source: "",
  enquiryReason: "",
  location: "",
  remarks: "",
  followUpDate: "",
  followUpTime: "",
  followUpNotes: "",
  callType: "",
  notes: "",
};

/** The status pill, in the one style the row and the card both wear. */
const statusBadge = (status: string) =>
  `inline-block shrink-0 whitespace-nowrap rounded-full px-2.5 py-1 text-[10px] font-medium ${
    status === "NEW"
      ? "bg-brand text-brand-foreground"
      : status === "CONTACTED"
        ? "bg-amber-500/15 text-amber-600"
        : status === "CONVERTED"
          ? "bg-success/15 text-success"
          : "bg-muted"
  }`;

/** How long a visitor was in the building, once they have been stamped out. */
const stayed = (row: { visitDate?: string; checkOut?: string | null }): string => {
  if (!row.checkOut || !row.visitDate) return "";
  const minutes = Math.round(
    (new Date(row.checkOut).getTime() - new Date(row.visitDate).getTime()) / 60000,
  );
  // A clock-out earlier than the arrival is a typo, not a negative visit.
  if (!Number.isFinite(minutes) || minutes <= 0) return "";
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  return rest ? `${hours}h ${rest}m` : `${hours}h`;
};

export default function EnquiriesWorkspace() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { user } = useAuth();
  const branchId = user?.branchId || "";
  // Org-level accounts are not tied to a branch, so they pick the one the
  // visitor is checking in to before the enquiry can be written.
  const [branches, setBranches] = useState<{ id: string; name: string }[]>([]);
  const [branchesLoading, setBranchesLoading] = useState(!branchId);
  const [pickedBranchId, setPickedBranchId] = useState("");
  const targetBranchId = branchId || pickedBranchId;
  const [mode, setMode] = useState<"list" | "form">("list");
  const [stage, setStage] = useState(0);
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("all");
  const [liveRecords, setLiveRecords] = useState<EnquiryRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [purpose, setPurpose] = useState("all");
  const [owner, setOwner] = useState("all");
  const [source, setSource] = useState("all");
  const [callType, setCallType] = useState("all");
  const [branchFilter, setBranchFilter] = useState("all");
  const [presence, setPresence] = useState("all");
  const [followUpFilter, setFollowUpFilter] = useState("all");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [draft, setDraft] = useState<Draft>(() => {
    try {
      return {
        ...emptyDraft,
        ...JSON.parse(localStorage.getItem("reception-enquiry-draft") || "{}"),
      };
    } catch {
      return emptyDraft;
    }
  });
  const update = (key: keyof Draft, value: string) =>
    setDraft((prev) => ({ ...prev, [key]: value }));
  /**
   * A branch-scoped account only ever sees its own branch, so a column and a
   * filter repeating one value would be noise. An organisation account reads
   * every branch's visitors out of one list, which is where it matters.
   */
  const showBranch = !branchId;
  const branchName = (id: string) => {
    if (!id) return "—";
    const found = branches.find((b) => b.id === id);
    if (found) return found.name;
    // The branch list arrives after the visitors do; calling every row
    // "Unknown branch" for that moment reads as data loss rather than a wait.
    return branchesLoading ? "…" : "Unknown branch";
  };

  const filled = Object.values(draft).filter(Boolean).length;
  const progress = Math.round((filled / Object.keys(draft).length) * 100);
  const filtered = useMemo(
    () =>
      liveRecords.filter((r) => {
        if (status !== "all" && r.status !== status) return false;
        if (purpose !== "all" && r.purpose !== purpose) return false;
        if (owner !== "all" && r.owner !== owner) return false;
        if (source !== "all" && r.source !== source) return false;
        if (callType !== "all" && r.callType !== callType) return false;
        if (branchFilter !== "all" && r.branchIdRef !== branchFilter) return false;
        if (presence === "inside" && (r.status === "CLOSED" || r.checkOut)) return false;
        if (presence === "left" && !r.checkOut) return false;
        if (followUpFilter === "has" && !r.followUpDate) return false;
        if (followUpFilter === "none" && r.followUpDate) return false;
        if (followUpFilter === "due" && !r.followUpDate) return false;
        if (
          followUpFilter === "due" &&
          new Date(r.followUpDate as string).getTime() > Date.now()
        )
          return false;
        const day = r.visitDate ? r.visitDate.slice(0, 10) : "";
        if (dateFrom && (!day || day < dateFrom)) return false;
        if (dateTo && (!day || day > dateTo)) return false;
        return Object.values(r)
          .join(" ")
          .toLowerCase()
          .includes(query.toLowerCase());
      }),
    [
      query,
      status,
      purpose,
      owner,
      source,
      callType,
      branchFilter,
      presence,
      followUpFilter,
      dateFrom,
      dateTo,
      liveRecords,
    ],
  );
  const activeFilterCount = [
    status,
    purpose,
    owner,
    source,
    callType,
    branchFilter,
    presence,
    followUpFilter,
  ].filter((v) => v !== "all").length + [dateFrom, dateTo].filter(Boolean).length;
  /** Live counters — previously hardcoded to "3" / "18" / "5". */
  const stats = useMemo(
    () => [
      {
        label: "On premises",
        value: String(liveRecords.filter((r) => r.status !== "CLOSED" && !r.checkOut).length),
        icon: UserRoundCheck,
      },
      {
        label: "Visitors today",
        value: String(liveRecords.filter((r) => isToday(r.visitDate)).length),
        icon: Users,
      },
      {
        label: "Need follow-up",
        value: String(
          liveRecords.filter((r) => r.status === "CONTACTED" || Boolean(r.followUpDate)).length,
        ),
        icon: ArrowRight,
      },
    ],
    [liveRecords],
  );
  const purposes = useMemo(
    () => Array.from(new Set(liveRecords.map((r) => r.purpose))).filter(Boolean),
    [liveRecords],
  );
  const owners = useMemo(
    () => Array.from(new Set(liveRecords.map((r) => r.owner))).filter(Boolean),
    [liveRecords],
  );
  /** Optimistic status change, rolled back if the write is rejected. */
  /**
   * Flagging a visit for follow-up asks when to follow it up.
   *
   * The column has always had a date to show and the registration form could
   * set one, but marking an existing visitor for follow-up set the status
   * alone -- so the row said "Follow-up" with no day against it, and a list of
   * people to call back with no dates on it is not a list anyone can work.
   */
  const [followingUp, setFollowingUp] = useState<EnquiryRow | null>(null);
  const [followUp, setFollowUp] = useState({ date: "", time: "", notes: "" });

  const openFollowUp = (row: EnquiryRow) => {
    // Tomorrow, which is when a front desk calls somebody back.
    const day = row.followUpDate ? new Date(row.followUpDate) : new Date(Date.now() + 86400000);
    const local = new Date(day.getTime() - day.getTimezoneOffset() * 60000);
    setFollowUp({
      date: local.toISOString().slice(0, 10),
      time: row.followUpTime || "",
      notes: row.followUpNotes || "",
    });
    setFollowingUp(row);
  };

  const saveFollowUp = async (row: EnquiryRow) => {
    const { date, time, notes } = followUp;
    const patch = {
      status: "CONTACTED",
      followUpDate: date ? toIsoTimestamp(date) : null,
      followUpTime: time || null,
      followUpNotes: notes || null,
    };
    const snapshot = liveRecords;
    setLiveRecords((prev) =>
      prev.map((r) =>
        r.id === row.id
          ? {
              ...r,
              status: "CONTACTED",
              followUpDate: patch.followUpDate,
              followUpTime: time,
              followUpNotes: notes,
            }
          : r,
      ),
    );
    setFollowingUp(null);
    try {
      await updateEnquiry(row.id, row.branchIdRef || targetBranchId, patch);
      toast({
        title: "Flagged for follow-up",
        description: date
          ? `${row.name || "Visitor"} to be called back on ${formatDate(patch.followUpDate)}.`
          : `${row.name || "Visitor"} flagged, with no date set.`,
      });
    } catch (error) {
      setLiveRecords(snapshot);
      toast({
        title: "Could not save the follow-up",
        description: error instanceof Error ? error.message : "Please try again",
        variant: "destructive",
      });
    }
  };

  const setRecordStatus = async (row: EnquiryRow, next: string) => {
    // Follow-up is the one status that needs a second answer: when.
    if (next === "CONTACTED") {
      openFollowUp(row);
      return;
    }
    const previous = row.status;
    setLiveRecords((prev) => prev.map((r) => (r.id === row.id ? { ...r, status: next } : r)));
    try {
      await updateEnquiry(row.id, row.branchIdRef || targetBranchId, { status: next });
      toast({
        title: `Marked ${(ENQUIRY_STATUS_LABEL[next] || next).toLowerCase()}`,
        description: `${row.name || "Visitor"} was updated.`,
      });
    } catch (error) {
      setLiveRecords((prev) => prev.map((r) => (r.id === row.id ? { ...r, status: previous } : r)));
      toast({
        title: "Could not update status",
        description: error instanceof Error ? error.message : "Please try again",
        variant: "destructive",
      });
    }
  };
  /**
   * Stamps when a visitor left.
   *
   * The log recorded an arrival and nothing else: `check_out` was read, shown
   * and exported, but no screen could ever write it, so "On premises" only ever
   * counted up. The time is editable rather than fixed to now -- a front desk
   * stamps people out when it gets a moment, which is rarely the moment they
   * walked out -- and a visitor who has left is a visit that is done, so the
   * entry is marked completed with it.
   */
  const [checkingOut, setCheckingOut] = useState<EnquiryRow | null>(null);
  const [checkOutAt, setCheckOutAt] = useState("");

  const openCheckOut = (row: EnquiryRow) => {
    const at = row.checkOut ? new Date(row.checkOut) : new Date();
    // `datetime-local` wants the local wall clock, not an ISO instant.
    const local = new Date(at.getTime() - at.getTimezoneOffset() * 60000);
    setCheckOutAt(local.toISOString().slice(0, 16));
    setCheckingOut(row);
  };

  const saveCheckOut = async (row: EnquiryRow, when: string | null) => {
    const stamp = when ? new Date(when).toISOString() : null;
    const snapshot = liveRecords;
    setLiveRecords((prev) =>
      prev.map((r) =>
        r.id === row.id
          ? { ...r, checkOut: stamp, status: stamp ? "CLOSED" : r.status }
          : r,
      ),
    );
    setCheckingOut(null);
    try {
      await updateEnquiry(row.id, row.branchIdRef || targetBranchId, {
        // snake_case in the live schema, as with check_in.
        check_out: stamp,
        ...(stamp ? { status: "CLOSED" } : {}),
      });
      toast({
        title: stamp ? "Visitor checked out" : "Check-out cleared",
        description: stamp
          ? `${row.name || "Visitor"} left at ${formatDateTime(stamp, "")}.`
          : `${row.name || "Visitor"} is back on the premises list.`,
      });
    } catch (error) {
      setLiveRecords(snapshot);
      toast({
        title: "Could not save the check-out",
        description: error instanceof Error ? error.message : "Please try again",
        variant: "destructive",
      });
    }
  };

  const removeRecord = async (row: EnquiryRow) => {
    if (!window.confirm(`Remove ${row.name || "this visitor"} from the log? This cannot be undone.`)) return;
    const snapshot = liveRecords;
    setLiveRecords((prev) => prev.filter((r) => r.id !== row.id));
    try {
      await deleteEnquiry(row.id, row.branchIdRef || targetBranchId);
      toast({ title: "Entry removed", description: `${row.name || "Visitor"} was taken off the log.` });
    } catch (error) {
      setLiveRecords(snapshot);
      toast({
        title: "Could not remove entry",
        description: error instanceof Error ? error.message : "Please try again",
        variant: "destructive",
      });
    }
  };
  const exportVisitors = () => {
    if (!filtered.length) {
      toast({ title: "Nothing to export", description: "No visitors match these filters.", variant: "destructive" });
      return;
    }
    downloadCsv(
      "visitor-log.csv",
      filtered.map((r) => ({
        ID: r.id,
        Visitor: r.name,
        Branch: branchName(r.branchIdRef),
        Phone: r.phone,
        WhatsApp: r.whatsappNumber,
        Purpose: r.purpose,
        Meeting: r.owner,
        Source: r.source,
        Status: ENQUIRY_STATUS_LABEL[r.status] || r.status,
        "Check-in": r.date,
        "Check-out": r.checkOut ? formatDateTime(r.checkOut, "") : "",
        "Follow-up": r.followUpDate ? formatDate(r.followUpDate, "") : "",
        "Call type": r.callType,
      })),
    );
    toast({ title: "Visitor log exported", description: `${filtered.length} rows written to CSV.` });
  };
  const clearFilters = () => {
    setPurpose("all");
    setOwner("all");
    setStatus("all");
    setBranchFilter("all");
    // These have no control of their own yet, but they do narrow `filtered`.
    // "Clear" that leaves a filter applied is the kind of thing that has people
    // reporting missing records.
    setSource("all");
    setCallType("all");
    setPresence("all");
    setFollowUpFilter("all");
    setDateFrom("");
    setDateTo("");
    setQuery("");
  };
  useEffect(() => {
    localStorage.setItem("reception-enquiry-draft", JSON.stringify(draft));
  }, [draft]);
  /**
   * `visit_enquiries` is mixed-case in the live database: most columns are
   * camelCase but `call_type` / `check_in` / `check_out` are snake_case. Reading
   * `follow_up_date` or `callType` (as this did) always yielded undefined.
   */
  const loadEnquiries = useCallback(async () => {
    setLoading(true);
    try {
      const result = await getEnquiries(branchId || null, 1, 200);
      setLiveRecords(
        (result.data ?? []).map((item: Record<string, unknown>): EnquiryRow => ({
          id: String(item.id ?? ""),
          branchIdRef: String(item.branchId ?? ""),
          name: String(item.visitorName ?? "Unnamed visitor"),
          phone: String(item.phone ?? ""),
          whatsappNumber: String(item.whatsappNumber ?? item.whatsapp_number ?? ""),
          purpose: String(item.purpose ?? "OTHER").replace(/_/g, " "),
          owner: String(item.personToMeet ?? ""),
          status: String(item.status ?? "NEW"),
          date: formatDateTime(item.visitDate ?? item.createdAt),
          source: String(item.source ?? ""),
          visitDate: (item.visitDate as string) ?? null,
          followUpDate: (item.followUpDate as string) ?? null,
          followUpTime: String(item.followUpTime ?? ""),
          followUpNotes: String(item.followUpNotes ?? ""),
          callType: String(item.call_type ?? ""),
          checkOut: (item.check_out as string) ?? null,
        })),
      );
    } catch (error) {
      toast({
        title: "Could not load enquiries",
        description: error instanceof Error ? error.message : "Please try again",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [branchId, toast]);
  useEffect(() => {
    void loadEnquiries();
  }, [loadEnquiries]);
  /** Branch list for the final step. `getBranches` returns { success, data }. */
  const loadBranches = useCallback(async () => {
    if (branchId) return;
    setBranchesLoading(true);
    try {
      const result = await getBranches(user?.organizationId || null);
      const list = (result.data ?? [])
        .map((b: Record<string, unknown>) => ({
          id: String(b.id ?? ""),
          name: String(b.name ?? "Unnamed branch"),
        }))
        // Radix Select items must have a non-empty value.
        .filter((b) => b.id);
      setBranches(list);
      if (list.length === 1) setPickedBranchId(list[0].id);
    } catch (error) {
      setBranches([]);
      toast({
        title: "Could not load branches",
        description: error instanceof Error ? error.message : "Please try again",
        variant: "destructive",
      });
    } finally {
      setBranchesLoading(false);
    }
  }, [branchId, user?.organizationId, toast]);
  useEffect(() => {
    void loadBranches();
  }, [loadBranches]);
  const save = () =>
    toast({
      title: "Draft saved",
      description: `Your enquiry is ${progress}% complete. You can resume it anytime.`,
    });
  const submit = async () => {
    if (!targetBranchId) {
      toast({
        title: "Branch required",
        description: branches.length
          ? "Pick the branch this visitor is checking in to."
          : "No branches exist yet — create one at Branches > Create branch first.",
        variant: "destructive",
      });
      return;
    }
    if (!draft.name.trim() || !draft.phone.trim()) {
      setStage(0);
      toast({
        title: "Visitor name and mobile number are required",
        description: "Both are on the first step.",
        variant: "destructive",
      });
      return;
    }
    setSubmitting(true);
    try {
      // `visit_enquiries` has no `notes` column, so the reception notes are
      // folded into `remarks` rather than being silently dropped.
      const remarks = [draft.remarks.trim(), draft.notes.trim() && `Reception notes: ${draft.notes.trim()}`]
        .filter(Boolean)
        .join("\n");
      await createEnquiry(targetBranchId, {
        visitorName: draft.name.trim(),
        phone: draft.phone.trim(),
        whatsappNumber: draft.whatsappNumber || undefined,
        email: draft.email || undefined,
        candidateName: draft.candidateName || undefined,
        address: draft.address || undefined,
        registrationDate: toIsoTimestamp(draft.registrationDate),
        visitDate: toIsoTimestamp(draft.visitDate, draft.visitTime),
        visitTime: draft.visitTime || undefined,
        purpose: toPurposeEnum(draft.purpose),
        personToMeet: draft.person || "Reception",
        // Department is a Postgres enum: "Administration" is rejected (22P02).
        department: toDepartmentEnum(draft.department),
        // ID type is a Postgres enum too: AADHAR / PAN / DRIVING / VOTER / PASSPORT.
        idType: toIdTypeEnum(draft.idType),
        idNumber: draft.idNumber || undefined,
        source: draft.source || undefined,
        enquiryReason: draft.enquiryReason || undefined,
        location: draft.location || undefined,
        remarks: remarks || undefined,
        followUpDate: draft.followUpDate ? toIsoTimestamp(draft.followUpDate) : undefined,
        followUpTime: draft.followUpTime || undefined,
        followUpNotes: draft.followUpNotes || undefined,
        status: "NEW",
        // snake_case in the live schema — `callType` / `checkIn` fail PGRST204.
        call_type: draft.callType || undefined,
        check_in: toIsoTimestamp(draft.visitDate, draft.visitTime),
      });
      toast({
        title: "Visitor registered",
        description: "The reception log and enquiry record were created together.",
      });
      setDraft(emptyDraft);
      setStage(0);
      setMode("list");
      localStorage.removeItem("reception-enquiry-draft");
      await loadEnquiries();
    } catch (error) {
      toast({
        title: "Registration failed",
        description:
          error instanceof Error ? error.message : "Please try again",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AppLayout>
      <div className="mb-5 flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[.16em] text-muted-foreground">
            Reception
          </p>
          <h1 className="mt-1 text-2xl font-semibold tracking-[-.04em] sm:text-3xl">
            Visitors & enquiries
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            One place to register visits, manage enquiries and follow up.
          </p>
        </div>
        {mode === "list" ? (
          <Button onClick={() => setMode("form")}>
            <Plus />
            Register visitor
          </Button>
        ) : (
          <Button variant="outline" onClick={() => setMode("list")}>
            <X />
            Close form
          </Button>
        )}
      </div>

      {mode === "list" ? (
        <>
          <div className="mb-4 grid gap-3 sm:grid-cols-3">
            {stats.map((item) => (
              <Card key={item.label}>
                <CardContent className="flex items-center justify-between p-4">
                  <div>
                    <p className="text-xs text-muted-foreground">
                      {item.label}
                    </p>
                    <p className="mt-1 text-2xl font-semibold">{item.value}</p>
                  </div>
                  <span className="grid h-10 w-10 place-items-center rounded-xl bg-muted">
                    <item.icon className="h-4 w-4" />
                  </span>
                </CardContent>
              </Card>
            ))}
          </div>
          <Card>
            <CardContent className="p-0">
              <div className="flex flex-col gap-3 border-b p-4 md:flex-row md:items-center">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search name, phone, purpose or owner…"
                    className="pl-9"
                  />
                </div>
                <Select value={status} onValueChange={setStatus}>
                  <SelectTrigger className="w-full md:w-44">
                    <Filter className="mr-2 h-4 w-4" />
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All statuses</SelectItem>
                    {ENQUIRY_STATUSES.map((value) => (
                      <SelectItem key={value} value={value}>
                        {ENQUIRY_STATUS_LABEL[value]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button
                  variant={showFilters ? "secondary" : "outline"}
                  onClick={() => setShowFilters((open) => !open)}
                >
                  <SlidersHorizontal />
                  More filters
                </Button>
              </div>
              {showFilters && (
                <div className="flex flex-col gap-3 border-b bg-muted/20 p-4 md:flex-row md:items-center">
                  <Select value={purpose} onValueChange={setPurpose}>
                    <SelectTrigger className="w-full md:w-52"><SelectValue placeholder="Purpose" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All purposes</SelectItem>
                      {purposes.map((item) => <SelectItem key={item} value={item}>{item}</SelectItem>)}
                    </SelectContent>
                  </Select>
                  <Select value={owner} onValueChange={setOwner}>
                    <SelectTrigger className="w-full md:w-52"><SelectValue placeholder="Meeting with" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Anyone</SelectItem>
                      {owners.map((item) => <SelectItem key={item} value={item}>{item}</SelectItem>)}
                    </SelectContent>
                  </Select>
                  {showBranch && (
                    <Select value={branchFilter} onValueChange={setBranchFilter}>
                      <SelectTrigger className="w-full md:w-52"><SelectValue placeholder="Branch" /></SelectTrigger>
                      <SelectContent searchable searchPlaceholder="Search centre…">
                        <SelectItem value="all">All branches</SelectItem>
                        {branches.map((b) => (
                          <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                  <span className="text-xs text-muted-foreground md:ml-1">
                    {filtered.length} of {liveRecords.length} visitors
                  </span>
                  <div className="flex gap-2 md:ml-auto">
                    <Button variant="ghost" onClick={clearFilters}>Clear</Button>
                    <Button variant="outline" onClick={exportVisitors}>
                      <Download />
                      Export
                    </Button>
                  </div>
                </div>
              )}
              <div className="hidden overflow-x-auto md:block">
                <table className="w-full min-w-[960px] text-sm">
                  <thead>
                    <tr className="border-b bg-muted/35 text-left text-xs text-muted-foreground">
                      <th className="px-4 py-3 font-medium">Visitor</th>
                      {showBranch && <th className="px-4 py-3 font-medium">Branch</th>}
                      <th className="px-4 py-3 font-medium">Mob. Number</th>
                      <th className="px-4 py-3 font-medium">WhatsApp</th>
                      <th className="px-4 py-3 font-medium">Purpose</th>
                      <th className="px-4 py-3 font-medium">Person to Meet</th>
                      <th className="px-4 py-3 font-medium">Source</th>
                      <th className="px-4 py-3 font-medium">Status</th>
                      <th className="px-4 py-3 font-medium">Check-in / out</th>
                      <th className="px-4 py-3 font-medium">Follow-up</th>
                      <th />
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((r) => (
                      <tr
                        key={r.id}
                        className="border-b last:border-0 hover:bg-muted/25"
                      >
                        <td className="px-4 py-3">
                          <p className="font-medium">{r.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {r.id}
                          </p>
                        </td>
                        {showBranch && (
                          <td className="px-4 py-3 whitespace-nowrap text-xs">
                            {branchName(r.branchIdRef)}
                          </td>
                        )}
                        <td className="px-4 py-3 whitespace-nowrap"><ContactLink kind="tel" number={r.phone} /></td>
                        <td className="px-4 py-3 whitespace-nowrap"><ContactLink kind="whatsapp" number={r.whatsappNumber || r.phone} /></td>
                        <td className="px-4 py-3">{r.purpose}</td>
                        <td className="px-4 py-3 text-muted-foreground">
                          {r.owner}
                        </td>
                        <td className="px-4 py-3 text-xs text-muted-foreground">
                          {r.source || "—"}
                        </td>
                        <td className="px-4 py-3">
                          <span className={statusBadge(r.status)}>
                            {ENQUIRY_STATUS_LABEL[r.status] || r.status}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-muted-foreground">
                          <div className="text-xs">{r.date}</div>
                          <div className="text-xs">
                            {r.checkOut ? (
                              <>
                                {`→ ${formatDateTime(r.checkOut)}`}
                                {stayed(r) && (
                                  <span className="ml-1 text-[10px]">({stayed(r)})</span>
                                )}
                              </>
                            ) : (
                              "Still inside"
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-xs text-muted-foreground">
                          {r.followUpDate ? (
                            formatDate(r.followUpDate)
                          ) : r.status === "CONTACTED" ? (
                            <span className="text-warning">No date set</span>
                          ) : (
                            "—"
                          )}
                          {r.callType ? <div className="text-[10px]">{r.callType}</div> : null}
                        </td>
                        <td className="px-4">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreHorizontal />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              {ENQUIRY_STATUSES.map((value) => (
                                <DropdownMenuItem
                                  key={value}
                                  disabled={r.status === value}
                                  onSelect={() => void setRecordStatus(r, value)}
                                >
                                  Mark as {(ENQUIRY_STATUS_LABEL[value] || value).toLowerCase()}
                                </DropdownMenuItem>
                              ))}
                              <DropdownMenuSeparator />
                              <DropdownMenuItem onSelect={() => openCheckOut(r)}>
                                {r.checkOut ? "Edit check-out time" : "Check out now"}
                              </DropdownMenuItem>
                              {r.checkOut && (
                                <DropdownMenuItem onSelect={() => void saveCheckOut(r, null)}>
                                  Clear check-out
                                </DropdownMenuItem>
                              )}
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                onSelect={() => {
                                  navigator.clipboard?.writeText(r.phone);
                                  toast({ title: "Phone copied", description: r.phone });
                                }}
                              >
                                Copy phone number
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                className="text-destructive"
                                onSelect={() => void removeRecord(r)}
                              >
                                Remove from log
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </td>
                      </tr>
                    ))}
                    {!filtered.length && (
                      <tr>
                        <td colSpan={showBranch ? 11 : 10} className="px-4 py-10 text-center text-sm text-muted-foreground">
                          {loading ? "Loading visitors…" : "No visitors match these filters."}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
              <div className="divide-y md:hidden">
                {filtered.map((r) => (
                  <div key={r.id} className="p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0"><p className="font-semibold">{r.name}</p><p className="mt-0.5 text-xs text-muted-foreground"><ContactLink kind="tel" number={r.phone} /> · {r.purpose}</p></div>
                      <span className={statusBadge(r.status)}>{ENQUIRY_STATUS_LABEL[r.status] || r.status}</span>
                    </div>
                    <div className="mt-3 grid grid-cols-2 gap-3 rounded-xl bg-muted/40 p-3 text-xs">
                      <div><p className="text-muted-foreground">WhatsApp</p><p className="mt-1 font-medium"><ContactLink kind="whatsapp" number={r.whatsappNumber || r.phone} /></p></div>
                      <div><p className="text-muted-foreground">Meeting</p><p className="mt-1 font-medium">{r.owner}</p></div>
                      <div><p className="text-muted-foreground">Source</p><p className="mt-1 font-medium">{r.source || "—"}</p></div>
                      <div><p className="text-muted-foreground">Time</p><p className="mt-1 font-medium">{r.date}</p></div>
                      {showBranch && (
                        <div><p className="text-muted-foreground">Branch</p><p className="mt-1 font-medium">{branchName(r.branchIdRef)}</p></div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </>
      ) : (
        <Card className="overflow-hidden">
          <div className="border-b bg-muted/25 px-5 py-4">
            <div className="mb-3 flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold">New visitor & enquiry</p>
                <p className="text-xs text-muted-foreground">
                  Draft saves automatically
                </p>
              </div>
              <strong className="text-sm">{progress}% complete</strong>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-brand transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
            <div className="mt-4 flex gap-2 overflow-x-auto pb-1">
              {stages.map((name, i) => (
                <button
                  key={name}
                  onClick={() => setStage(i)}
                  className={`flex min-w-[140px] items-center gap-2 rounded-xl border px-3 py-2 text-left text-xs transition ${i === stage ? "border-foreground bg-foreground text-background" : i < stage ? "border-brand/35 bg-brand/12" : "bg-card text-muted-foreground"}`}
                >
                  <span
                    className={`grid h-6 w-6 place-items-center rounded-full ${i < stage ? "bg-brand text-brand-foreground" : "bg-muted/60"}`}
                  >
                    {i < stage ? <Check className="h-3 w-3" /> : i + 1}
                  </span>
                  {name}
                </button>
              ))}
            </div>
          </div>
          <CardContent className="p-5 sm:p-7">
            <div className="mx-auto max-w-3xl animate-slide-up">
              {stage === 0 && (
                <Stage
                  title="Who is visiting?"
                  subtitle="Basic contact information is enough to create the record."
                >
                  <div className="space-y-4">
                    <div className="grid gap-4 sm:grid-cols-3">
                      <Field label="Visitor Name *" required>
                        <Input
                          value={draft.name}
                          onChange={(e) => update("name", e.target.value)}
                          placeholder="e.g. Meera Joshi"
                        />
                      </Field>
                      <Field label="Mobile Number *" required>
                        <Input
                          value={draft.phone}
                          onChange={(e) => update("phone", e.target.value)}
                          placeholder="10-digit number"
                        />
                      </Field>
                      <Field label="Email">
                        <Input
                          value={draft.email}
                          onChange={(e) => update("email", e.target.value)}
                          placeholder="name@example.com"
                        />
                      </Field>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-3">
                      <Field label="WhatsApp Number">
                        <Input
                          value={draft.whatsappNumber}
                          onChange={(e) => update("whatsappNumber", e.target.value)}
                          placeholder="WhatsApp number"
                        />
                      </Field>
                      <Field label="Candidate Name">
                        <Input
                          value={draft.candidateName}
                          onChange={(e) => update("candidateName", e.target.value)}
                          placeholder="Candidate name"
                        />
                      </Field>
                      <Field label="Source">
                        <EditableSelect
                          optionKey="enquirySource"
                          value={draft.source}
                          onChange={(v) => update("source", v)}
                          placeholder="Select source"
                        />
                      </Field>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-3">
                      <Field label="Registration Date">
                        <DatePicker value={draft.registrationDate} onChange={(v) => update("registrationDate", v)} />
                      </Field>
                      <Field label="ID Type">
                        <EditableSelect
                          optionKey="idType"
                          value={draft.idType}
                          onChange={(v) => update("idType", v)}
                          placeholder="Select ID type"
                        />
                      </Field>
                      <Field label="ID Number">
                        <Input
                          value={draft.idNumber}
                          onChange={(e) => update("idNumber", e.target.value)}
                          placeholder="Enter ID number"
                        />
                      </Field>
                    </div>

                    <Field label="Address">
                      <Textarea
                        value={draft.address}
                        onChange={(e) => update("address", e.target.value)}
                        placeholder="Full address"
                        className="min-h-20"
                      />
                    </Field>
                  </div>
                </Stage>
              )}
              {stage === 1 && (
                <Stage
                  title="What brings them here?"
                  subtitle="Route the visitor to the right person and record their enquiry details."
                >
                  <div className="space-y-4">
                    <div className="grid gap-4 sm:grid-cols-2">
                      <Field label="Purpose of Visit *" required>
                        <EditableSelect
                          optionKey="enquiryPurpose"
                          value={draft.purpose}
                          onChange={(v) => update("purpose", v)}
                          placeholder="Select purpose"
                        />
                      </Field>
                      <Field label="Person to Meet *" required>
                        <Input
                          value={draft.person}
                          onChange={(e) => update("person", e.target.value)}
                          placeholder="Name or role"
                        />
                      </Field>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                      <Field label="Department *" required>
                        <EditableSelect
                          optionKey="department"
                          value={draft.department}
                          onChange={(v) => update("department", v)}
                          placeholder="Select department"
                        />
                      </Field>
                      <Field label="Visit Location">
                        <Input
                          value={draft.location}
                          onChange={(e) => update("location", e.target.value)}
                          placeholder="e.g. Reception, 2nd floor"
                        />
                      </Field>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                      <Field label="Visit Date">
                        <DatePicker value={draft.visitDate} onChange={(v) => update("visitDate", v)} />
                      </Field>
                      <Field label="Visit Time">
                        <Input
                          type="time"
                          value={draft.visitTime}
                          onChange={(e) => update("visitTime", e.target.value)}
                        />
                      </Field>
                    </div>

                    <Field label="Enquiry Reason">
                      <Textarea
                        value={draft.enquiryReason}
                        onChange={(e) => update("enquiryReason", e.target.value)}
                        placeholder="Describe the enquiry reason"
                        className="min-h-20"
                      />
                    </Field>

                    <Field label="Remarks">
                      <Textarea
                        value={draft.remarks}
                        onChange={(e) => update("remarks", e.target.value)}
                        placeholder="Additional remarks"
                        className="min-h-20"
                      />
                    </Field>
                  </div>
                </Stage>
              )}
              {stage === 2 && (
                <Stage
                  title="Verify identity"
                  subtitle="Record the ID proof shown by the visitor — keep it optional for low-risk or returning visitors."
                >
                  <div className="space-y-4">
                    <div className="grid gap-4 sm:grid-cols-2">
                      <Field label="ID Type">
                        <EditableSelect
                          optionKey="idType"
                          value={draft.idType}
                          onChange={(v) => update("idType", v)}
                          placeholder="Select ID type"
                        />
                      </Field>
                      <Field label="ID Number">
                        <Input
                          value={draft.idNumber}
                          onChange={(e) => update("idNumber", e.target.value)}
                          placeholder="Enter ID number"
                        />
                      </Field>
                    </div>
                  </div>
                </Stage>
              )}
              {stage === 3 && (
                <Stage
                  title="Follow-up details"
                  subtitle="Plan when and how to follow up with this visitor."
                >
                  <div className="grid gap-4 md:grid-cols-2">
                    <Field label="Follow-up Call Date">
                      <DatePicker value={draft.followUpDate} onChange={(v) => update("followUpDate", v)} />
                    </Field>
                    <Field label="Preferred Time">
                      <Input
                        type="time"
                        value={draft.followUpTime}
                        onChange={(e) => update("followUpTime", e.target.value)}
                      />
                    </Field>
                    <Field label="Call Type">
                      <Select
                        value={draft.callType}
                        onValueChange={(v) => update("callType", v)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select call type" />
                        </SelectTrigger>
                        <SelectContent>
                          {CALL_TYPES.map((c) => (
                            <SelectItem key={c} value={c}>
                              {c}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </Field>
                    <Field label="Follow-up Notes" className="md:col-span-2">
                      <Textarea
                        value={draft.followUpNotes}
                        onChange={(e) => update("followUpNotes", e.target.value)}
                        placeholder="What should the next call cover?"
                        className="min-h-24"
                      />
                    </Field>
                  </div>
                </Stage>
              )}
              {stage === 4 && (
                <Stage
                  title="Review & register"
                  subtitle="Add context for the team, then complete check-in."
                >
                  <div className="space-y-4">
                    {!branchId && (
                      <Field label="Branch *" required>
                        {branchesLoading ? (
                          <p className="rounded-xl border border-dashed px-3 py-3 text-sm text-muted-foreground">
                            Loading branches…
                          </p>
                        ) : branches.length ? (
                          <Select
                            value={pickedBranchId}
                            onValueChange={setPickedBranchId}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select the branch for this visit" />
                            </SelectTrigger>
                            <SelectContent searchable searchPlaceholder="Search centre…">
                              {branches.map((b) => (
                                <SelectItem key={b.id} value={b.id}>
                                  {b.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        ) : (
                          <div className="rounded-xl border border-dashed border-amber-500/50 bg-amber-500/5 p-4">
                            <p className="text-sm font-medium">
                              No branches have been created yet.
                            </p>
                            <p className="mt-1 text-sm text-muted-foreground">
                              Every visitor record has to belong to a branch, so check-in
                              stays disabled until at least one exists. Create one, then
                              come back — your draft is saved.
                            </p>
                            <div className="mt-3 flex flex-wrap gap-2">
                              <Button
                                type="button"
                                size="sm"
                                onClick={() => {
                                  save();
                                  navigate("/branch/create");
                                }}
                              >
                                <Plus />
                                Create a branch
                              </Button>
                              <Button
                                type="button"
                                size="sm"
                                variant="outline"
                                onClick={() => void loadBranches()}
                                disabled={branchesLoading}
                              >
                                Retry
                              </Button>
                            </div>
                          </div>
                        )}
                      </Field>
                    )}

                    <Field label="Reception notes">
                      <Textarea
                        value={draft.notes}
                        onChange={(e) => update("notes", e.target.value)}
                        placeholder="Follow-up, access instructions or other context"
                        className="min-h-28"
                      />
                    </Field>

                    <div className="rounded-2xl border bg-muted/30 p-4 text-sm space-y-2">
                      <div>
                        <p className="font-semibold">
                          {draft.name || "Unnamed visitor"}
                        </p>
                        <p className="mt-1 text-muted-foreground">
                          {draft.phone || "No phone"} · {draft.whatsappNumber || "No WhatsApp"}
                        </p>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div><span className="text-muted-foreground">Purpose:</span> {draft.purpose || "—"}</div>
                        <div><span className="text-muted-foreground">Meeting:</span> {draft.person || "—"}</div>
                        <div><span className="text-muted-foreground">Department:</span> {draft.department || "—"}</div>
                        <div><span className="text-muted-foreground">Source:</span> {draft.source || "—"}</div>
                        <div><span className="text-muted-foreground">Visit:</span> {draft.visitDate || "—"} {draft.visitTime || ""}</div>
                        <div><span className="text-muted-foreground">Follow-up:</span> {draft.followUpDate || "—"} {draft.callType || ""}</div>
                      </div>
                    </div>
                  </div>
                </Stage>
              )}
            </div>
          </CardContent>
          {/* Pinned to the foot of the screen on a desktop only. On a phone it
              sat over the last fields (Address, Remarks) and against the
              floating bottom bar, so there it follows the form instead. */}
          <div className="flex flex-col-reverse gap-2 border-t bg-card p-3 sm:flex-row sm:items-center sm:justify-between sm:p-4 md:sticky md:bottom-0 md:bg-card/95 md:backdrop-blur">
            <Button variant="ghost" className="w-full sm:w-auto" onClick={save}>
              <Save />
              Save draft
            </Button>
            <div className={`grid gap-2 sm:flex ${stage > 0 ? "grid-cols-2" : "grid-cols-1"}`}>
              {stage > 0 && (
                <Button
                  variant="outline"
                  onClick={() => setStage((s) => s - 1)}
                >
                  <ArrowLeft />
                  Back
                </Button>
              )}
              {stage < 4 ? (
                <Button onClick={() => setStage((s) => s + 1)}>
                  Continue
                  <ArrowRight />
                </Button>
              ) : (
                <div className="flex flex-col items-stretch gap-1 sm:items-end">
                  <Button onClick={() => void submit()} disabled={!targetBranchId || submitting}>
                    <Check />
                    {submitting ? "Registering…" : "Register & check in"}
                  </Button>
                  {!targetBranchId && !branchesLoading && (
                    <span className="text-[11px] text-muted-foreground">
                      {branches.length
                        ? "Pick a branch above to enable check-in."
                        : "Disabled until a branch exists — create one above."}
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>
        </Card>
      )}

      {/* When to call them back. Defaulted to tomorrow, which is what a front
          desk means by "follow up", and clearable for a flag with no date. */}
      <Dialog open={followingUp !== null} onOpenChange={(open) => !open && setFollowingUp(null)}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Follow up with {followingUp?.name || "visitor"}</DialogTitle>
            <DialogDescription>
              Puts them on the follow-up list, against the day you mean to call.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="follow-up-date">Follow-up date</Label>
                <DatePicker value={followUp.date} onChange={(v) => setFollowUp((f) => ({ ...f, date: v }))} id="follow-up-date" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="follow-up-time">Time</Label>
                <Input
                  id="follow-up-time"
                  type="time"
                  value={followUp.time}
                  onChange={(e) => setFollowUp((f) => ({ ...f, time: e.target.value }))}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="follow-up-notes">Note</Label>
              <Textarea
                id="follow-up-notes"
                rows={2}
                placeholder="What to say when you call."
                value={followUp.notes}
                onChange={(e) => setFollowUp((f) => ({ ...f, notes: e.target.value }))}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setFollowingUp(null)}>
              Cancel
            </Button>
            <Button onClick={() => followingUp && void saveFollowUp(followingUp)}>
              Save follow-up
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* When the visitor left. Defaulted to now, because that is the answer
          most of the time -- and editable, because a front desk stamps people
          out when it gets a moment. */}
      <Dialog open={checkingOut !== null} onOpenChange={(open) => !open && setCheckingOut(null)}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Check out {checkingOut?.name || "visitor"}</DialogTitle>
            <DialogDescription>
              Stamps when they left and marks the visit completed.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <Label htmlFor="check-out-at">Out time</Label>
            <DateTimePicker id="check-out-at" value={checkOutAt} onChange={setCheckOutAt} />
            {checkingOut?.date && (
              <p className="text-xs text-muted-foreground">Checked in {checkingOut.date}.</p>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCheckingOut(null)}>
              Cancel
            </Button>
            <Button
              onClick={() => checkingOut && void saveCheckOut(checkingOut, checkOutAt)}
              disabled={!checkOutAt}
            >
              Save out time
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}

function Stage({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  return (
    <>
      <div className="mb-6">
        <h2 className="text-xl font-semibold tracking-tight">{title}</h2>
        <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>
      </div>
      <div className="space-y-5">{children}</div>
    </>
  );
}
function Field({
  label,
  required,
  className,
  children,
}: {
  label: string;
  required?: boolean;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={`space-y-2 ${className || ""}`}>
      <Label>
        {label}
        {required && <span className="ml-1 text-destructive">*</span>}
      </Label>
      {children}
    </div>
  );
}

/**
 * A number you can act on: a call link, or a chat on WhatsApp (which falls
 * back to the mobile number, as most visitors use one for both).
 */
function ContactLink({ kind, number }: { kind: "tel" | "whatsapp"; number?: string | null }) {
  const href = kind === "tel" ? telHref(number) : whatsappHref(number);
  if (!number || !href) return <span className="text-muted-foreground">—</span>;
  return (
    <a
      href={href}
      target={kind === "whatsapp" ? "_blank" : undefined}
      rel={kind === "whatsapp" ? "noopener noreferrer" : undefined}
      onClick={(e) => e.stopPropagation()}
      className={kind === "whatsapp" ? "inline-flex items-center gap-1 font-medium text-[#128c4a] hover:underline" : "font-medium text-primary hover:underline"}
    >
      {kind === "whatsapp" && <MessageCircle className="h-3.5 w-3.5" />}
      {number}
    </a>
  );
}
