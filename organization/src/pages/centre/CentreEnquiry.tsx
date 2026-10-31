import { useCallback, useEffect, useMemo, useState } from "react";
import { Pencil, Printer } from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import {
  DceBadge,
  DceButton,
  DceField,
  DceGrid,
  DceInput,
  DcePanel,
  DceSelect,
  DceTable,
  DceTextarea,
  shortDate,
  type DceColumn,
} from "@/components/dce/Dce";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase/client";
import { createEnquiry, getBranches, getCourses, updateEnquiry } from "@/lib/supabase/data";
import { ENQUIRY_STATUSES, toDepartmentEnum } from "@/lib/supabase/reception";

// Rows as PostgREST returns them, embeds included; the columns vary by deployment.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Raw = Record<string, any>;

const PAGE_SIZE = 50;
/** Kept on `enquiryReason`, the only free column visit_enquiries has for it. */
const COURSE_PREFIX = "Course: ";

const STATUS_LABEL: Record<string, string> = { NEW: "New", CONTACTED: "Follow-up", CONVERTED: "Admitted", CLOSED: "Closed" };
const STATUS_TONE: Record<string, string> = { NEW: "PENDING", CONTACTED: "IN_PROGRESS", CONVERTED: "APPROVED", CLOSED: "CLOSED" };

interface EnquiryForm {
  branchId: string;
  name: string;
  phone: string;
  address: string;
  course: string;
  remarks: string;
  followUpDate: string;
  status: string;
}

const blank: EnquiryForm = { branchId: "", name: "", phone: "", address: "", course: "", remarks: "", followUpDate: "", status: "NEW" };

const esc = (value: unknown) =>
  String(value ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c] as string);

const courseOf = (row: Raw) => {
  const reason = String(row.enquiryReason || "");
  return reason.startsWith(COURSE_PREFIX) ? reason.slice(COURSE_PREFIX.length) : reason;
};

const dateInput = (value: unknown) => {
  if (!value) return "";
  const d = new Date(String(value));
  if (Number.isNaN(d.getTime())) return "";
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};

function printSlip(row: Raw, branchName: string) {
  const win = window.open("", "_blank", "width=680,height=760");
  if (!win) return false;
  const lines: Array<[string, unknown]> = [
    ["Enquiry Date", shortDate(row.createdAt || row.visitDate)],
    ["Name", row.visitorName],
    ["Mobile", row.phone],
    ["Address", row.address],
    ["Course Interested", courseOf(row)],
    ["Remarks", row.remarks],
    ["Follow-up Date", row.followUpDate ? shortDate(row.followUpDate) : "—"],
    ["Status", STATUS_LABEL[String(row.status)] || row.status],
  ];
  win.document.write(`<!doctype html><html><head><title>Enquiry Slip</title><style>
    body{font-family:Arial,Helvetica,sans-serif;margin:28px;color:#222}
    .slip{max-width:600px;margin:0 auto;border:1px solid #999;padding:22px}
    h1{font-size:20px;margin:0;text-align:center}
    h2{font-size:13px;margin:4px 0 16px;text-align:center;font-weight:normal;color:#555}
    table{width:100%;border-collapse:collapse}
    td{border:1px solid #ccc;padding:7px 10px;font-size:13px;vertical-align:top}
    td:first-child{width:36%;font-weight:bold;background:#f5f5f5}
    .sign{margin-top:46px;text-align:right;font-size:12px}
    @media print{button{display:none}}
  </style></head><body><div class="slip">
    <h1>${esc(branchName || "Enquiry Slip")}</h1>
    <h2>ADMISSION ENQUIRY SLIP</h2>
    <table>${lines.map(([k, v]) => `<tr><td>${esc(k)}</td><td>${esc(v || "—")}</td></tr>`).join("")}</table>
    <div class="sign">Authorised Signatory</div>
  </div><p style="text-align:center"><button onclick="window.print()">Print</button></p>
  <script>window.onload=function(){window.print()}</script></body></html>`);
  win.document.close();
  return true;
}

export default function CentreEnquiry() {
  const { branchId, organizationId } = useAuth();
  const { toast } = useToast();
  const isAdmin = !branchId;

  const [rows, setRows] = useState<Raw[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [branches, setBranches] = useState<Array<{ id: string; name: string }>>([]);
  const [courses, setCourses] = useState<string[]>([]);
  const [mode, setMode] = useState<"list" | "new" | "edit">("list");
  const [editing, setEditing] = useState<Raw | null>(null);
  const [form, setForm] = useState<EnquiryForm>(blank);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState("");

  const branchName = useMemo(() => new Map(branches.map((b) => [b.id, b.name])), [branches]);

  useEffect(() => {
    getBranches(organizationId)
      .then((r) => setBranches((r.data || []).map((b: Raw) => ({ id: String(b.id), name: String(b.name || "") }))))
      .catch(() => setBranches([]));
  }, [organizationId]);

  useEffect(() => {
    getCourses(organizationId, branchId)
      .then((r) => setCourses((r.data as Raw[]).filter((c) => c.isActive !== false).map((c) => String(c.name))))
      .catch(() => setCourses([]));
  }, [organizationId, branchId]);

  const load = useCallback(
    async (limit = PAGE_SIZE) => {
      setLoading(true);
      try {
        // Admission enquiries only: the reception register shares this table
        // with deliveries, meetings and complaints, which are not a centre's leads.
        let query = supabase
          .from("visit_enquiries")
          .select("*", { count: "exact" })
          .eq("purpose", "ADMISSION")
          .order("createdAt", { ascending: false })
          .range(0, limit - 1);
        if (branchId) query = query.eq("branchId", branchId);
        const { data, error, count } = await query;
        if (error) throw new Error(error.message);
        setRows((data || []) as Raw[]);
        setTotal(count ?? (data || []).length);
      } catch (e) {
        setRows([]);
        toast({ title: "Could not load enquiries", description: e instanceof Error ? e.message : "Please try again", variant: "destructive" });
      } finally {
        setLoading(false);
      }
    },
    [branchId, toast],
  );

  useEffect(() => {
    void load();
  }, [load]);

  const shown = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return rows;
    return rows.filter((r) =>
      [r.visitorName, r.phone, r.address, r.remarks, courseOf(r)].some((v) => String(v || "").toLowerCase().includes(term)),
    );
  }, [rows, search]);

  const startNew = () => {
    setEditing(null);
    setForm(blank);
    setMode("new");
  };

  const startEdit = (row: Raw) => {
    setEditing(row);
    setForm({
      branchId: String(row.branchId || ""),
      name: String(row.visitorName || ""),
      phone: String(row.phone || "").replace(/\D/g, "").slice(-10),
      address: String(row.address || ""),
      course: courseOf(row),
      remarks: String(row.remarks || ""),
      followUpDate: dateInput(row.followUpDate),
      status: String(row.status || "NEW"),
    });
    setMode("edit");
  };

  const cancel = () => {
    setMode("list");
    setEditing(null);
    setForm(blank);
  };

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    const target = branchId || form.branchId || String(editing?.branchId || "");
    if (!form.name.trim()) return toast({ title: "Name is required", variant: "destructive" });
    if (!/^[6-9]\d{9}$/.test(form.phone.trim())) return toast({ title: "Enter a valid 10-digit mobile number", variant: "destructive" });
    if (!target) return toast({ title: "Choose the branch", description: "An enquiry is filed against a branch.", variant: "destructive" });

    const common = {
      visitorName: form.name.trim(),
      phone: form.phone.trim(),
      address: form.address.trim() || null,
      enquiryReason: form.course ? `${COURSE_PREFIX}${form.course}` : null,
      remarks: form.remarks.trim() || null,
      // The day as picked. Converting local midnight to UTC (toIsoTimestamp)
      // lands on the previous day east of UTC in this zone-less column.
      followUpDate: form.followUpDate ? `${form.followUpDate}T00:00:00` : null,
    };
    setSaving(true);
    try {
      if (mode === "edit" && editing) {
        await updateEnquiry(String(editing.id), target, { ...common, status: form.status });
        toast({ title: "Enquiry updated", description: form.name });
      } else {
        // visit_enquiries is the reception register too, so it needs the
        // columns reception fills: who is being met and the department enum.
        const payload: Raw = {
          ...common,
          purpose: "ADMISSION",
          source: "Centre panel",
          personToMeet: "Reception",
          department: toDepartmentEnum("Administration"),
          status: "NEW",
        };
        for (const k of Object.keys(payload)) if (payload[k] === null) delete payload[k];
        await createEnquiry(target, payload);
        toast({ title: "Enquiry saved", description: form.name });
      }
      cancel();
      await load(Math.max(PAGE_SIZE, rows.length + 1));
    } catch (err) {
      toast({ title: "Could not save the enquiry", description: err instanceof Error ? err.message : "Please try again", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const columns: DceColumn<Raw>[] = [
    { key: "n", label: "#", render: (_r, i) => i + 1, className: "w-10" },
    {
      key: "name",
      label: "Name",
      render: (r) => (
        <div>
          <div className="font-bold text-slate-800">{r.visitorName || "—"}</div>
          {courseOf(r) && <div className="text-[12px] text-[#f5a623]">{courseOf(r)}</div>}
        </div>
      ),
    },
    { key: "phone", label: "Mobile", render: (r) => r.phone || "—" },
    ...(isAdmin ? [{ key: "branch", label: "Branch", render: (r: Raw) => branchName.get(String(r.branchId)) || "—" }] : []),
    { key: "address", label: "Address", render: (r) => <span className="line-clamp-2 max-w-[220px]">{r.address || "—"}</span> },
    {
      key: "remarks",
      label: "Remarks",
      render: (r) => (
        <div className="max-w-[240px]">
          <span className="line-clamp-2">{r.remarks || "—"}</span>
          {r.followUpDate && <div className="text-[12px] text-slate-500">Follow-up: {shortDate(r.followUpDate)}</div>}
        </div>
      ),
    },
    {
      key: "status",
      label: "Status",
      render: (r) => <DceBadge status={STATUS_TONE[String(r.status)] || String(r.status || "NEW")} label={STATUS_LABEL[String(r.status)] || String(r.status || "New")} />,
    },
    { key: "created", label: "Created At", render: (r) => <span className="whitespace-nowrap">{shortDate(r.createdAt || r.visitDate)}</span> },
    {
      key: "action",
      label: "Action",
      render: (r) => (
        <div className="flex gap-1.5">
          <DceButton
            tone="slate"
            size="sm"
            aria-label={`Print enquiry ${r.visitorName || ""}`}
            onClick={() => {
              if (!printSlip(r, branchName.get(String(r.branchId)) || "")) {
                toast({ title: "Pop-up blocked", description: "Allow pop-ups for this site to print the slip.", variant: "destructive" });
              }
            }}
          >
            <Printer className="h-3.5 w-3.5" /> Print
          </DceButton>
          <DceButton tone="blue" size="sm" aria-label={`Edit enquiry ${r.visitorName || ""}`} onClick={() => startEdit(r)}>
            <Pencil className="h-3.5 w-3.5" /> Edit
          </DceButton>
        </div>
      ),
    },
  ];

  const set = <K extends keyof EnquiryForm>(key: K, value: EnquiryForm[K]) => setForm((p) => ({ ...p, [key]: value }));

  return (
    <AppLayout>
      <div className="space-y-5">
        {mode !== "list" && (
          <DcePanel
            title={mode === "edit" ? "Edit Enquiry" : "New Enquiry"}
            actions={<DceButton tone="light" size="sm" onClick={cancel}>Cancel</DceButton>}
          >
            <form onSubmit={save} noValidate>
              <DceGrid>
                {isAdmin && mode === "new" && (
                  <DceField label="Branch" required>
                    <DceSelect aria-label="Branch" value={form.branchId} onChange={(e) => set("branchId", e.target.value)}>
                      <option value="">Select branch</option>
                      {branches.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
                    </DceSelect>
                  </DceField>
                )}
                <DceField label="Name" required>
                  <DceInput aria-label="Name" value={form.name} onChange={(e) => set("name", e.target.value)} />
                </DceField>
                <DceField label="Mobile" required>
                  <DceInput aria-label="Mobile" inputMode="numeric" maxLength={10} value={form.phone} onChange={(e) => set("phone", e.target.value.replace(/\D/g, ""))} />
                </DceField>
                <DceField label="Course Interested">
                  <DceSelect aria-label="Course Interested" value={form.course} onChange={(e) => set("course", e.target.value)}>
                    <option value="">Select course</option>
                    {[...new Set([...courses, form.course].filter(Boolean))].map((c) => <option key={c} value={c}>{c}</option>)}
                  </DceSelect>
                </DceField>
                <DceField label="Follow-up Date">
                  <DceInput aria-label="Follow-up Date" type="date" value={form.followUpDate} onChange={(e) => set("followUpDate", e.target.value)} />
                </DceField>
                {mode === "edit" && (
                  <DceField label="Status">
                    <DceSelect aria-label="Status" value={form.status} onChange={(e) => set("status", e.target.value)}>
                      {ENQUIRY_STATUSES.map((s) => <option key={s} value={s}>{STATUS_LABEL[s]}</option>)}
                    </DceSelect>
                  </DceField>
                )}
                <DceField label="Address" span={2}>
                  <DceTextarea aria-label="Address" className="min-h-[60px]" value={form.address} onChange={(e) => set("address", e.target.value)} />
                </DceField>
                <DceField label="Remarks" span={2}>
                  <DceTextarea aria-label="Remarks" className="min-h-[60px]" value={form.remarks} onChange={(e) => set("remarks", e.target.value)} />
                </DceField>
              </DceGrid>
              <div className="mt-5 flex gap-2">
                <DceButton type="submit" tone="blue" disabled={saving}>{saving ? "Saving…" : mode === "edit" ? "Update Enquiry" : "Save Enquiry"}</DceButton>
                <DceButton tone="light" onClick={cancel}>Cancel</DceButton>
              </div>
            </form>
          </DcePanel>
        )}

        <DcePanel
          title="Manage Enquiry"
          actions={mode === "list" ? <DceButton tone="red" size="sm" onClick={startNew}>New Enquiry</DceButton> : undefined}
        >
          <div className="mb-4 flex flex-wrap items-center gap-2">
            <DceInput
              aria-label="Search enquiries"
              className="w-auto min-w-[240px]"
              placeholder="Search name, mobile, course…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <span className="ml-auto text-[12.5px] text-slate-500">{loading ? "" : `${rows.length} of ${total}`}</span>
          </div>
          <DceTable columns={columns} rows={shown} rowKey={(r) => String(r.id)} loading={loading} empty="No enquiries yet." />
          {!loading && rows.length < total && (
            <div className="mt-4 text-center">
              <DceButton tone="light" onClick={() => void load(rows.length + PAGE_SIZE)}>Load more</DceButton>
            </div>
          )}
        </DcePanel>
      </div>
    </AppLayout>
  );
}
