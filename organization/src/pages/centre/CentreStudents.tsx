import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Download, Eye, Pencil, Search, X } from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import {
  DceBadge,
  DceButton,
  DceInput,
  DceLinkButton,
  DcePanel,
  DceSelect,
  DceTable,
  inr,
  shortDate,
  type DceColumn,
} from "@/components/dce/Dce";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase/client";
import { getBranches } from "@/lib/supabase/data";
import { paidFromPayments, type InvoiceRow } from "@/lib/supabase/studentFee";
import { feeStanding } from "@/lib/fees";
import { downloadCsv } from "@/lib/export";
import { cn } from "@/lib/utils";

const STUDENT_TYPES = ["all", "registered", "request", "approved", "online", "deactivated"] as const;
export type StudentType = (typeof STUDENT_TYPES)[number];

const TYPE_LABEL: Record<StudentType, string> = {
  all: "All",
  registered: "Registered",
  request: "Request",
  approved: "Approved",
  online: "Online",
  deactivated: "Deactivated",
};

/** Same split as the centre dashboard (centreDashboard.ts), so its counts and these lists agree. */
const REQUESTED = ["SUBMITTED", "PENDING_PAYMENT"];
// The AdmissionStatus enum is DRAFT | SUBMITTED | PENDING_PAYMENT | APPROVED |
// REJECTED; filtering on a value outside it makes Postgres reject the query.
const APPROVED = ["APPROVED"];

const PAGE_SIZE = 25;
const EXPORT_LIMIT = 5000;

// Rows as PostgREST returns them, embeds included; the columns vary by deployment.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Raw = Record<string, any>;

export interface CentreStudentRow {
  id: string;
  code: string;
  name: string;
  fatherName: string;
  phone: string;
  course: string;
  branch: string;
  admissionDate: string;
  status: { key: string; label: string };
  total: number;
  paid: number;
  dues: number;
  raw: Raw;
}

function studentStatus(row: Raw): { key: string; label: string } {
  if (row.isActive === false) return { key: "DEACTIVATED", label: "Deactivated" };
  const status = String(row.admissionStatus || "").toUpperCase();
  if (REQUESTED.includes(status)) return { key: "PENDING", label: "Request" };
  if (status === "APPROVED") return { key: "ACTIVE", label: "Active" };
  if (status === "COMPLETED") return { key: "COMPLETED", label: "Completed" };
  if (status === "REJECTED") return { key: "REJECTED", label: "Rejected" };
  return { key: "IN_PROGRESS", label: "Registered" };
}

/** PostgREST's `or=` grammar treats commas and brackets as syntax, so they cannot reach it from a search box. */
const cleanSearch = (text: string) => text.replace(/[,()%*\\]/g, " ").trim();

async function queryStudents(
  branchId: string | null,
  type: StudentType,
  search: string,
  from: number,
  to: number,
) {
  const run = (select: string, bySource: boolean) => {
    let query = supabase
      .from("students")
      .select(select, { count: "exact" })
      .is("deletedAt", null)
      .order("createdAt", { ascending: false })
      .range(from, to);
    if (branchId) query = query.eq("branchId", branchId);
    if (type === "registered") query = query.not("admissionStatus", "in", `(${[...REQUESTED, ...APPROVED].join(",")})`);
    if (type === "request" || type === "online") query = query.in("admissionStatus", REQUESTED);
    if (type === "online" && bySource) query = query.eq("applicationSource", "ONLINE");
    if (type === "approved") query = query.in("admissionStatus", APPROVED);
    if (type === "deactivated") query = query.eq("isActive", false);
    const term = cleanSearch(search);
    if (term) {
      query = query.or(
        ["firstName", "lastName", "phone", "enrollmentNo", "applicationNo", "fatherName"]
          .map((column) => `${column}.ilike.%${term}%`)
          .join(","),
      );
    }
    return query;
  };

  // The embeds are tried first so the course and branch names come in one
  // round trip; a deployment that does not expose a relationship still lists
  // its students, and `applicationSource` arrives only with online-admission.sql.
  const attempts: Array<[string, boolean]> = [
    ["*, course:courses(id,name,code,baseFee), branch:branches(name)", true],
    ["*, course:courses(id,name,code,baseFee)", true],
    ["*", true],
    ["*", false],
  ];
  let lastError: { message?: string } | null = null;
  for (const [select, bySource] of attempts) {
    if (!bySource && type !== "online") break;
    const { data, error, count } = await run(select, bySource);
    if (!error) return { data: (data || []) as Raw[], count: count ?? (data || []).length };
    lastError = error;
  }
  throw new Error(lastError?.message || "Could not load students.");
}

/** Billed, paid and owing per student, from their own invoices -- voided ones are withdrawn charges. */
async function feeTotals(ids: string[]) {
  const totals = new Map<string, { total: number; paid: number }>();
  if (!ids.length) return totals;
  const run = (select: string) =>
    supabase.from("fee_invoices").select(select).in("studentId", ids).neq("status", "VOID");
  // Payments embedded because `paidAmount` is only rolled forward by the fee
  // pages; a receipt booked elsewhere would otherwise be missed.
  let { data, error } = await run("studentId, totalAmount, paidAmount, payments:fee_payments(amount, reversedAt)");
  if (error) ({ data, error } = await run("studentId, totalAmount, paidAmount"));
  if (error) return totals;
  for (const invoice of (data || []) as unknown as InvoiceRow[]) {
    const id = String(invoice.studentId);
    const current = totals.get(id) || { total: 0, paid: 0 };
    current.total += Number(invoice.totalAmount) || 0;
    current.paid += paidFromPayments(invoice);
    totals.set(id, current);
  }
  return totals;
}

function toRow(row: Raw, fees: Map<string, { total: number; paid: number }>): CentreStudentRow {
  const billed = fees.get(String(row.id)) || { total: 0, paid: 0 };
  // The rule the branch roster and the student's portal use, so all three
  // read the same balance: the course fee, unless more has been invoiced.
  const fee = feeStanding({ courseFee: (row.course as { baseFee?: unknown } | undefined)?.baseFee, invoiced: billed.total, paid: billed.paid });
  return {
    id: String(row.id),
    code: String(row.enrollmentNo || row.applicationNo || "—"),
    name: [row.firstName, row.middleName, row.lastName].filter(Boolean).join(" ") || "Unnamed",
    fatherName: String(row.fatherName || ""),
    phone: String(row.phone || ""),
    course: row.course?.name || "—",
    branch: row.branch?.name || "",
    admissionDate: String(row.admissionDate || row.createdAt || ""),
    status: studentStatus(row),
    total: fee.total,
    paid: fee.paid,
    dues: fee.balance,
    raw: row,
  };
}

export default function CentreStudents() {
  const { branchId, organizationId } = useAuth();
  const { toast } = useToast();
  const [params] = useSearchParams();
  const rawType = (params.get("type") || "all").toLowerCase();
  const type: StudentType = (STUDENT_TYPES as readonly string[]).includes(rawType) ? (rawType as StudentType) : "all";

  const [branches, setBranches] = useState<Array<{ id: string; name: string }>>([]);
  const [branchFilter, setBranchFilter] = useState("");
  const [searchBox, setSearchBox] = useState("");
  const [search, setSearch] = useState("");
  const [rows, setRows] = useState<CentreStudentRow[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [viewing, setViewing] = useState<CentreStudentRow | null>(null);

  const isAdmin = !branchId;
  const scope = branchId || branchFilter || null;
  const branchName = useMemo(() => new Map(branches.map((b) => [b.id, b.name])), [branches]);

  useEffect(() => {
    if (!isAdmin) return;
    getBranches(organizationId)
      .then((r) => setBranches((r.data || []).map((b: Raw) => ({ id: String(b.id), name: String(b.name || "") }))))
      .catch(() => setBranches([]));
  }, [isAdmin, organizationId]);

  const fetchRows = useCallback(
    async (from: number, to: number) => {
      const { data, count } = await queryStudents(scope, type, search, from, to);
      const fees = await feeTotals(data.map((r) => String(r.id)));
      return { rows: data.map((r) => toRow(r, fees)), count };
    },
    [scope, type, search],
  );

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    fetchRows(0, PAGE_SIZE - 1)
      .then((result) => {
        if (cancelled) return;
        setRows(result.rows);
        setTotal(result.count);
      })
      .catch((error) => {
        if (cancelled) return;
        setRows([]);
        setTotal(0);
        toast({ title: "Could not load students", description: error instanceof Error ? error.message : "Please try again", variant: "destructive" });
      })
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [fetchRows, toast]);

  const loadMore = async () => {
    setLoadingMore(true);
    try {
      const result = await fetchRows(rows.length, rows.length + PAGE_SIZE - 1);
      setRows((prev) => [...prev, ...result.rows]);
      setTotal(result.count);
    } catch (error) {
      toast({ title: "Could not load more", description: error instanceof Error ? error.message : "Please try again", variant: "destructive" });
    } finally {
      setLoadingMore(false);
    }
  };

  const exportCsv = async () => {
    setExporting(true);
    try {
      // The whole list, not just the page on screen.
      const { rows: all } = await fetchRows(0, EXPORT_LIMIT - 1);
      if (!all.length) {
        toast({ title: "Nothing to export", description: "This list is empty." });
        return;
      }
      downloadCsv(
        `students-${type}.csv`,
        all.map((r, i) => ({
          "#": i + 1,
          Code: r.code,
          Name: r.name,
          "Father Name": r.fatherName,
          Mobile: r.phone,
          Course: r.course,
          ...(isAdmin ? { Branch: r.branch || branchName.get(String(r.raw.branchId)) || "" } : {}),
          "Total Fees": r.total,
          "Total Paid": r.paid,
          Dues: r.dues,
          Date: r.admissionDate ? shortDate(r.admissionDate) : "",
          Status: r.status.label,
        })),
      );
    } catch (error) {
      toast({ title: "Export failed", description: error instanceof Error ? error.message : "Please try again", variant: "destructive" });
    } finally {
      setExporting(false);
    }
  };

  const columns: DceColumn<CentreStudentRow>[] = [
    { key: "n", label: "#", render: (_r, i) => i + 1, className: "w-10" },
    { key: "code", label: "Code", render: (r) => <span className="whitespace-nowrap font-medium">{r.code}</span> },
    {
      key: "name",
      label: "NAME",
      render: (r) => (
        <div className="min-w-[160px]">
          <div className="font-bold text-slate-800">{r.name}</div>
          {r.fatherName && <div className="text-[12px] text-[#f5a623]">{r.fatherName}</div>}
          {r.phone && <div className="text-[12px] text-slate-500">{r.phone}</div>}
        </div>
      ),
    },
    { key: "course", label: "Course", render: (r) => r.course },
    ...(isAdmin
      ? [{ key: "branch", label: "Branch", render: (r: CentreStudentRow) => r.branch || branchName.get(String(r.raw.branchId)) || "—" }]
      : []),
    {
      key: "fees",
      label: "Fees",
      render: (r) => (
        <div className="whitespace-nowrap text-[12.5px] leading-5">
          <div className="text-[#f26b6b]">Dues: <b>{inr(r.dues)}</b></div>
          <div className="text-[#2fb878]">Total Paid: <b>{inr(r.paid)}</b></div>
          <div className="text-slate-700">Total Fees: <b>{inr(r.total)}</b></div>
        </div>
      ),
    },
    { key: "date", label: "Date", render: (r) => <span className="whitespace-nowrap">{shortDate(r.admissionDate || null)}</span> },
    { key: "status", label: "Status", render: (r) => <DceBadge status={r.status.key} label={r.status.label} /> },
    {
      key: "action",
      label: "Action",
      render: (r) => (
        <div className="flex flex-wrap items-center gap-1.5">
          <DceButton tone="green" size="sm" aria-label={`View ${r.name}`} title="View" onClick={() => setViewing(r)}>
            <Eye className="h-3.5 w-3.5" />
          </DceButton>
          <DceLinkButton tone="blue" size="sm" to={`/student/add?id=${encodeURIComponent(r.id)}`}>
            <Pencil className="h-3.5 w-3.5" />
            <span className="sr-only">Edit {r.name}</span>
          </DceLinkButton>
          <DceLinkButton tone="orange" size="sm" to={`/centre/student-payments?id=${encodeURIComponent(r.id)}`}>
            Payments
          </DceLinkButton>
        </div>
      ),
    },
  ];

  return (
    <AppLayout>
      <DcePanel
        title={`MANAGE Students - ${type.toUpperCase()}`}
        actions={
          <>
            <DceButton tone="light" size="sm" onClick={exportCsv} disabled={exporting}>
              <Download className="h-3.5 w-3.5" /> {exporting ? "Exporting…" : "Export"}
            </DceButton>
            <DceLinkButton tone="red" size="sm" to="/centre/student-add">Create New</DceLinkButton>
          </>
        }
      >
        <nav className="mb-4 flex flex-wrap gap-1.5" aria-label="Student lists">
          {STUDENT_TYPES.map((t) => (
            <Link
              key={t}
              to={`/centre/students?type=${t}`}
              className={cn(
                "rounded px-3 py-1.5 text-[12.5px] font-medium",
                t === type ? "bg-[#38c3be] text-white" : "border border-slate-300 bg-white text-slate-700 hover:bg-slate-50",
              )}
              aria-current={t === type ? "page" : undefined}
            >
              {TYPE_LABEL[t]}
            </Link>
          ))}
        </nav>

        <form
          className="mb-4 flex flex-wrap items-center gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            setSearch(searchBox);
          }}
        >
          {isAdmin && (
            <DceSelect aria-label="Branch" className="w-auto min-w-[180px]" value={branchFilter} onChange={(e) => setBranchFilter(e.target.value)}>
              <option value="">All branches</option>
              {branches.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
            </DceSelect>
          )}
          <DceInput
            aria-label="Search students"
            className="w-auto min-w-[240px] flex-1 sm:flex-none"
            placeholder="Name, mobile, code or father name"
            value={searchBox}
            onChange={(e) => setSearchBox(e.target.value)}
          />
          <DceButton type="submit" tone="slate" size="sm"><Search className="h-3.5 w-3.5" /> Search</DceButton>
          {search && (
            <DceButton tone="light" size="sm" onClick={() => { setSearch(""); setSearchBox(""); }}>Clear</DceButton>
          )}
          <span className="ml-auto text-[12.5px] text-slate-500">{loading ? "" : `${rows.length} of ${total} shown`}</span>
        </form>

        <DceTable columns={columns} rows={rows} rowKey={(r) => r.id} loading={loading} empty="No students in this list." />

        {!loading && rows.length < total && (
          <div className="mt-4 text-center">
            <DceButton tone="light" onClick={loadMore} disabled={loadingMore}>{loadingMore ? "Loading…" : "Load more"}</DceButton>
          </div>
        )}
      </DcePanel>

      {viewing && <StudentDrawer row={viewing} onClose={() => setViewing(null)} />}
    </AppLayout>
  );
}

function StudentDrawer({ row, onClose }: { row: CentreStudentRow; onClose: () => void }) {
  const s = row.raw;
  const address = [s.streetAddress, s.city, s.district, s.state, s.pincode].filter(Boolean).join(", ");
  const fields: Array<[string, unknown]> = [
    ["Code", row.code],
    ["Application No", s.applicationNo],
    ["Enrollment No", s.enrollmentNo],
    ["Father Name", s.fatherName],
    ["Mother Name", s.motherName],
    ["Gender", s.gender],
    ["Date of Birth", s.dateOfBirth ? shortDate(s.dateOfBirth) : ""],
    ["Mobile", s.phone],
    ["Guardian Mobile", s.fatherPhone],
    ["Email", s.email],
    ["Aadhaar", s.aadharNumber],
    ["Category", s.category],
    ["Course", row.course],
    ["Admission Date", row.admissionDate ? shortDate(row.admissionDate) : ""],
    ["Address", address],
  ];
  const photo = typeof s.photo === "string" && /^(data:|https?:)/.test(s.photo) ? s.photo : "";
  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/40" role="dialog" aria-modal="true" aria-label={`Student ${row.name}`} onClick={onClose}>
      <aside className="h-full w-full max-w-md overflow-y-auto bg-white shadow-xl" onClick={(e) => e.stopPropagation()}>
        <header className="flex items-center justify-between bg-[#3d4451] px-5 py-3.5 text-white">
          <h2 className="text-[14.5px] font-bold">Student Details</h2>
          <button type="button" aria-label="Close" onClick={onClose} className="rounded p-1 hover:bg-white/10"><X className="h-4 w-4" /></button>
        </header>
        <div className="p-5">
          <div className="mb-4 flex items-center gap-4">
            {photo ? (
              <img src={photo} alt="" className="h-20 w-20 rounded border object-cover" />
            ) : (
              <div className="flex h-20 w-20 items-center justify-center rounded border bg-slate-100 text-[11px] text-slate-400">No photo</div>
            )}
            <div>
              <div className="text-[16px] font-bold text-slate-800">{row.name}</div>
              <div className="mt-1"><DceBadge status={row.status.key} label={row.status.label} /></div>
            </div>
          </div>
          <dl className="divide-y divide-slate-100 text-[13px]">
            {fields.map(([label, value]) => (
              <div key={label} className="grid grid-cols-[130px_1fr] gap-2 py-2">
                <dt className="font-semibold text-slate-600">{label}</dt>
                <dd className="break-words text-slate-800">{value ? String(value) : "—"}</dd>
              </div>
            ))}
          </dl>
          <div className="mt-4 grid grid-cols-3 gap-2 text-center text-[12.5px]">
            <div className="rounded border p-2"><div className="text-slate-500">Total Fees</div><b>{inr(row.total)}</b></div>
            <div className="rounded border p-2"><div className="text-slate-500">Paid</div><b className="text-[#2fb878]">{inr(row.paid)}</b></div>
            <div className="rounded border p-2"><div className="text-slate-500">Dues</div><b className="text-[#f26b6b]">{inr(row.dues)}</b></div>
          </div>
          <div className="mt-5 flex flex-wrap gap-2">
            <DceLinkButton tone="blue" size="sm" to={`/student/add?id=${encodeURIComponent(row.id)}`}>Edit</DceLinkButton>
            <DceLinkButton tone="orange" size="sm" to={`/centre/student-payments?id=${encodeURIComponent(row.id)}`}>Payments</DceLinkButton>
          </div>
        </div>
      </aside>
    </div>
  );
}
