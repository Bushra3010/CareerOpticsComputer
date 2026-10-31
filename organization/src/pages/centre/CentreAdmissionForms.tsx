import { useCallback, useEffect, useMemo, useState } from "react";
import { Check, Copy, Eye, Link2, X } from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import {
  DceBadge,
  DceButton,
  DceField,
  DceInput,
  DceLinkButton,
  DcePanel,
  DceSelect,
  DceTable,
  shortDate,
  type DceColumn,
} from "@/components/dce/Dce";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase/client";
import { getBranches } from "@/lib/supabase/data";
import { createInvoiceRow, updateStudentRow, type InvoiceRow } from "@/lib/supabase/studentFee";
import { paymentFor } from "@/lib/onlineAdmissions";
import { studentFiles } from "@/lib/studentDocuments";

// Rows as PostgREST returns them, embeds included; the columns vary by deployment.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Raw = Record<string, any>;

const REQUESTED = ["SUBMITTED", "PENDING_PAYMENT"];

/** The public apply page (pages/public/OnlineAdmission.tsx) preselects the centre from `?centre=`. */
function admissionFormLink(branchId: string) {
  const base = import.meta.env.BASE_URL.replace(/\/$/, "");
  return `${window.location.origin}${base}/apply?centre=${encodeURIComponent(branchId)}`;
}

const nameOf = (s: Raw) => [s.firstName, s.middleName, s.lastName].filter(Boolean).join(" ") || "Unnamed";

export default function CentreAdmissionForms() {
  const { branchId, organizationId } = useAuth();
  const { toast } = useToast();
  const isAdmin = !branchId;

  const [branches, setBranches] = useState<Array<{ id: string; name: string }>>([]);
  const [linkBranch, setLinkBranch] = useState("");
  const [showLink, setShowLink] = useState(false);
  const [copied, setCopied] = useState(false);
  const [rows, setRows] = useState<Raw[]>([]);
  const [invoices, setInvoices] = useState<Map<string, InvoiceRow[]>>(new Map());
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<string | null>(null);
  const [viewing, setViewing] = useState<Raw | null>(null);

  const branchName = useMemo(() => new Map(branches.map((b) => [b.id, b.name])), [branches]);
  const linkFor = branchId || linkBranch;
  const link = linkFor ? admissionFormLink(linkFor) : "";

  useEffect(() => {
    getBranches(organizationId)
      .then((r) => setBranches((r.data || []).map((b: Raw) => ({ id: String(b.id), name: String(b.name || "") }))))
      .catch(() => setBranches([]));
  }, [organizationId]);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const run = (select: string) => {
        let query = supabase
          .from("students")
          .select(select)
          .in("admissionStatus", REQUESTED)
          .is("deletedAt", null)
          .order("createdAt", { ascending: false })
          .limit(500);
        if (branchId) query = query.eq("branchId", branchId);
        return query;
      };
      let res = await run("*, course:courses(id,name,code,baseFee)");
      if (res.error) res = await run("*");
      if (res.error) throw new Error(res.error.message);
      const students = (res.data || []) as Raw[];
      setRows(students);

      // Approving is held back while fees are outstanding, as on the Online
      // Admission List, so the invoices are needed to know which those are.
      const ids = students.map((s) => String(s.id));
      const byStudent = new Map<string, InvoiceRow[]>();
      if (ids.length) {
        const { data } = await supabase
          .from("fee_invoices")
          .select("*, payments:fee_payments(id,amount,reversedAt)")
          .in("studentId", ids)
          .neq("status", "VOID");
        for (const inv of (data || []) as InvoiceRow[]) {
          const id = String(inv.studentId);
          byStudent.set(id, [...(byStudent.get(id) || []), inv]);
        }
      }
      setInvoices(byStudent);
    } catch (e) {
      setRows([]);
      toast({ title: "Could not load applications", description: e instanceof Error ? e.message : "Please try again", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }, [branchId, toast]);

  useEffect(() => {
    void load();
  }, [load]);

  const copy = async () => {
    if (!link) return;
    try {
      await navigator.clipboard.writeText(link);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast({ title: "Link copied", description: link });
    } catch {
      toast({ title: "Copy this link", description: link });
    }
  };

  const whatsapp = link
    ? `https://wa.me/?text=${encodeURIComponent(`Apply for admission at ${branchName.get(linkFor) || "our centre"} online: ${link}`)}`
    : "";

  const approve = async (s: Raw) => {
    if (paymentFor(invoices.get(String(s.id)) || []) === "pending") {
      toast({
        title: "Payment not settled",
        description: `${s.applicationNo || nameOf(s)} has fees outstanding. Collect them first.`,
        variant: "destructive",
      });
      return;
    }
    setBusy(String(s.id));
    try {
      // The same write the Online Admission List makes: approving also clears
      // any documents that had been asked for, and charges the centre's wallet.
      await updateStudentRow(String(s.id), { status: "approved", decisionNote: "", requestedDocuments: [] });
      // An admitted student owes the course fee. Bill it now, so the student's
      // Payments page, the roster and the portal all have an invoice to show
      // rather than a balance with nothing behind it.
      const fee = Number((s.course as { baseFee?: unknown } | undefined)?.baseFee) || 0;
      if (fee > 0 && !(invoices.get(String(s.id)) || []).length) {
        await createInvoiceRow(String(s.branchId || "") || null, {
          studentId: String(s.id),
          totalAmount: fee,
          description: `${s.course?.name || "Course"} fee`,
        });
      }
      toast({ title: "Application approved", description: `${nameOf(s)} · ${s.course?.name || ""}` });
      setRows((prev) => prev.filter((r) => r.id !== s.id));
      setViewing(null);
    } catch (e) {
      const message = e instanceof Error ? e.message : "Please try again";
      const low = /INSUFFICIENT_BALANCE:\s*(.*)/.exec(message);
      toast({
        title: low ? "Centre wallet balance is too low" : "Could not approve",
        description: low ? `${low[1]} Recharge the wallet, then approve again.` : message,
        variant: "destructive",
      });
    } finally {
      setBusy(null);
    }
  };

  const columns: DceColumn<Raw>[] = [
    { key: "n", label: "#", render: (_r, i) => i + 1, className: "w-10" },
    { key: "submitted", label: "Submitted", render: (r) => <span className="whitespace-nowrap">{shortDate(r.createdAt || r.admissionDate)}</span> },
    {
      key: "name",
      label: "Name",
      render: (r) => (
        <div>
          <div className="font-bold text-slate-800">{nameOf(r)}</div>
          {r.applicationNo && <div className="text-[12px] text-slate-500">{r.applicationNo}</div>}
        </div>
      ),
    },
    { key: "phone", label: "Mobile", render: (r) => r.phone || "—" },
    { key: "email", label: "Email", render: (r) => <span className="break-all">{r.email || "—"}</span> },
    { key: "course", label: "Course", render: (r) => r.course?.name || "—" },
    ...(isAdmin ? [{ key: "branch", label: "Branch", render: (r: Raw) => branchName.get(String(r.branchId)) || "—" }] : []),
    {
      key: "action",
      label: "Action",
      render: (r) => (
        <div className="flex gap-1.5">
          <DceButton tone="green" size="sm" disabled={busy === String(r.id)} onClick={() => approve(r)} aria-label={`Approve ${nameOf(r)}`}>
            <Check className="h-3.5 w-3.5" /> {busy === String(r.id) ? "Approving…" : "Approve"}
          </DceButton>
          <DceButton tone="blue" size="sm" onClick={() => setViewing(r)} aria-label={`View ${nameOf(r)}`}>
            <Eye className="h-3.5 w-3.5" /> View
          </DceButton>
        </div>
      ),
    },
  ];

  return (
    <AppLayout>
      <div className="space-y-5">
        <DcePanel
          title="Online Admission Forms"
          actions={
            <DceButton tone="red" size="sm" onClick={() => setShowLink(true)}>
              <Link2 className="h-3.5 w-3.5" /> Generate Student Form Link
            </DceButton>
          }
        >
          {showLink && (
            <div className="mb-5 rounded border border-[#38c3be]/40 bg-[#38c3be]/5 p-4">
              <div className="mb-3 flex items-center justify-between">
                <h3 className="text-[13.5px] font-bold text-slate-700">Student Admission Form Link</h3>
                <button type="button" aria-label="Close link" onClick={() => setShowLink(false)} className="rounded p-1 text-slate-500 hover:bg-slate-100">
                  <X className="h-4 w-4" />
                </button>
              </div>
              {isAdmin && (
                <div className="mb-3 max-w-xs">
                  <DceField label="Branch" required>
                    <DceSelect aria-label="Branch for link" value={linkBranch} onChange={(e) => setLinkBranch(e.target.value)}>
                      <option value="">Select branch</option>
                      {branches.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
                    </DceSelect>
                  </DceField>
                </div>
              )}
              {link ? (
                <>
                  <p className="mb-2 text-[12.5px] text-slate-600">Share this link with students. Their applications appear in the list below for you to approve.</p>
                  <div className="flex flex-wrap gap-2">
                    <DceInput aria-label="Admission form link" readOnly value={link} onFocus={(e) => e.target.select()} className="min-w-[260px] flex-1" />
                    <DceButton tone="slate" size="sm" onClick={copy}>
                      <Copy className="h-3.5 w-3.5" /> {copied ? "Copied" : "Copy link"}
                    </DceButton>
                    <DceLinkButton tone="green" size="sm" to={whatsapp}>Share on WhatsApp</DceLinkButton>
                  </div>
                </>
              ) : (
                <p className="text-[12.5px] text-slate-500">Choose the branch the link is for.</p>
              )}
            </div>
          )}

          <DceTable columns={columns} rows={rows} rowKey={(r) => String(r.id)} loading={loading} empty="No online applications waiting." />
        </DcePanel>
      </div>

      {viewing && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/40" role="dialog" aria-modal="true" aria-label={`Application of ${nameOf(viewing)}`} onClick={() => setViewing(null)}>
          <aside className="h-full w-full max-w-md overflow-y-auto bg-white shadow-xl" onClick={(e) => e.stopPropagation()}>
            <header className="flex items-center justify-between bg-[#3d4451] px-5 py-3.5 text-white">
              <h2 className="text-[14.5px] font-bold">Application</h2>
              <button type="button" aria-label="Close" onClick={() => setViewing(null)} className="rounded p-1 hover:bg-white/10"><X className="h-4 w-4" /></button>
            </header>
            <div className="p-5 text-[13px]">
              <div className="mb-3 flex items-center gap-2">
                <span className="text-[16px] font-bold text-slate-800">{nameOf(viewing)}</span>
                <DceBadge status="SUBMITTED" label={String(viewing.admissionStatus || "Submitted")} />
              </div>
              <dl className="divide-y divide-slate-100">
                {([
                  ["Application No", viewing.applicationNo],
                  ["Submitted", shortDate(viewing.createdAt)],
                  ["Father Name", viewing.fatherName],
                  ["Mother Name", viewing.motherName],
                  ["Date of Birth", viewing.dateOfBirth ? shortDate(viewing.dateOfBirth) : ""],
                  ["Gender", viewing.gender],
                  ["Mobile", viewing.phone],
                  ["Email", viewing.email],
                  ["Course", viewing.course?.name],
                  ["Address", [viewing.streetAddress, viewing.city, viewing.district, viewing.state, viewing.pincode].filter(Boolean).join(", ")],
                ] as Array<[string, unknown]>).map(([k, v]) => (
                  <div key={k} className="grid grid-cols-[120px_1fr] gap-2 py-2">
                    <dt className="font-semibold text-slate-600">{k}</dt>
                    <dd className="break-words">{v ? String(v) : "—"}</dd>
                  </div>
                ))}
              </dl>
              {studentFiles(viewing).length > 0 && (
                <div className="mt-4">
                  <h3 className="mb-2 font-bold text-slate-700">Documents</h3>
                  <ul className="space-y-1">
                    {studentFiles(viewing).map((f) => (
                      <li key={f.key}>
                        <a href={f.url} target="_blank" rel="noreferrer" download={f.name || f.label} className="text-[#2d8fd5] underline">{f.label}</a>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              <div className="mt-5">
                <DceButton tone="green" disabled={busy === String(viewing.id)} onClick={() => approve(viewing)}>
                  <Check className="h-4 w-4" /> Approve
                </DceButton>
              </div>
            </div>
          </aside>
        </div>
      )}
    </AppLayout>
  );
}
