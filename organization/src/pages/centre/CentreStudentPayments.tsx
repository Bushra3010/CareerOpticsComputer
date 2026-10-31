import { useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Printer } from "lucide-react";
import { feeStanding } from "@/lib/fees";
import { AppLayout } from "@/components/layout/AppLayout";
import {
  DceBadge,
  DceButton,
  DceField,
  DceGrid,
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
import { addPayment, getStudentInvoices, type StudentInvoice } from "@/lib/supabase/data";
import { createInvoiceRow } from "@/lib/supabase/studentFee";

// Rows as PostgREST returns them, embeds included; the columns vary by deployment.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Raw = Record<string, any>;

/**
 * The modes a centre names, against the `PaymentMethod` enum the column takes.
 * PhonePe and GPay are UPI apps; the app's name is kept on the reference so
 * the receipt still says how the money came in.
 */
const PAYMENT_MODES: Array<{ label: string; method: string; app?: string }> = [
  { label: "Cash", method: "CASH" },
  { label: "UPI", method: "UPI" },
  { label: "PhonePe", method: "UPI", app: "PhonePe" },
  { label: "GPay", method: "UPI", app: "GPay" },
  { label: "Bank Transfer", method: "BANK_TRANSFER" },
];

const METHOD_LABEL: Record<string, string> = { CASH: "Cash", UPI: "UPI", BANK_TRANSFER: "Bank Transfer", CARD: "Card", CHEQUE: "Cheque" };

const todayInput = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};

const esc = (value: unknown) =>
  String(value ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c] as string);

interface PaymentLine {
  id: string;
  receiptNo: string;
  amount: number;
  method: string;
  referenceNo: string;
  paidAt: string;
  invoiceNo: string;
  description: string;
  reversed: boolean;
}

function printReceipt(student: Raw, line: PaymentLine, summary: { total: number; paid: number; dues: number }) {
  const win = window.open("", "_blank", "width=720,height=820");
  if (!win) return false;
  const name = [student.firstName, student.middleName, student.lastName].filter(Boolean).join(" ");
  const rows: Array<[string, unknown]> = [
    ["Receipt No", line.receiptNo],
    ["Date", shortDate(line.paidAt)],
    ["Student", name],
    ["Code", student.enrollmentNo || student.applicationNo],
    ["Father Name", student.fatherName],
    ["Course", student.course?.name],
    ["Mobile", student.phone],
    ["For", `${line.description} (${line.invoiceNo})`],
    ["Mode", METHOD_LABEL[line.method] || line.method],
    ["Reference", line.referenceNo || "—"],
    ["Amount Received", inr(line.amount)],
    ["Total Fees", inr(summary.total)],
    ["Total Paid", inr(summary.paid)],
    ["Balance Due", inr(summary.dues)],
  ];
  win.document.write(`<!doctype html><html><head><title>Receipt ${esc(line.receiptNo)}</title><style>
    body{font-family:Arial,Helvetica,sans-serif;margin:28px;color:#222}
    .slip{max-width:620px;margin:0 auto;border:1px solid #999;padding:22px}
    h1{font-size:20px;margin:0;text-align:center}
    h2{font-size:13px;margin:4px 0 16px;text-align:center;font-weight:normal;color:#555}
    table{width:100%;border-collapse:collapse}
    td{border:1px solid #ccc;padding:7px 10px;font-size:13px}
    td:first-child{width:38%;font-weight:bold;background:#f5f5f5}
    .sign{margin-top:46px;display:flex;justify-content:space-between;font-size:12px}
    @media print{button{display:none}}
  </style></head><body><div class="slip">
    <h1>${esc(student.branch?.name || "Fee Receipt")}</h1>
    <h2>FEE RECEIPT</h2>
    <table>${rows.map(([k, v]) => `<tr><td>${esc(k)}</td><td>${esc(v ?? "—")}</td></tr>`).join("")}</table>
    <div class="sign"><span>Student Signature</span><span>Authorised Signatory</span></div>
  </div><p style="text-align:center"><button onclick="window.print()">Print</button></p>
  <script>window.onload=function(){window.print()}</script></body></html>`);
  win.document.close();
  return true;
}

export default function CentreStudentPayments() {
  const [params] = useSearchParams();
  const id = params.get("id") || "";
  const { branchId } = useAuth();
  const { toast } = useToast();

  const [student, setStudent] = useState<Raw | null>(null);
  const [invoices, setInvoices] = useState<StudentInvoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [saving, setSaving] = useState(false);
  const [pay, setPay] = useState({ invoiceId: "", amount: "", mode: "Cash", reference: "", date: todayInput(), note: "" });
  const [raise, setRaise] = useState({ amount: "", description: "" });

  const load = useCallback(async () => {
    if (!id) {
      setLoading(false);
      setLoadError("No student was chosen. Open Payments from the student list.");
      return;
    }
    setLoading(true);
    try {
      const run = (select: string) => {
        let query = supabase.from("students").select(select).eq("id", id);
        if (branchId) query = query.eq("branchId", branchId);
        return query.maybeSingle();
      };
      let res = await run("*, course:courses(name,code,baseFee), branch:branches(name)");
      if (res.error) res = await run("*");
      if (res.error) throw new Error(res.error.message);
      if (!res.data) throw new Error("That student could not be found in this centre.");
      const { data: inv } = await getStudentInvoices(id, branchId);
      setStudent(res.data as Raw);
      setInvoices(inv);
      setLoadError("");
    } catch (e) {
      setLoadError(e instanceof Error ? e.message : "Could not load the student.");
    } finally {
      setLoading(false);
    }
  }, [id, branchId]);

  useEffect(() => {
    void load();
  }, [load]);

  const live = useMemo(() => invoices.filter((i) => i.status.toUpperCase() !== "VOID"), [invoices]);
  const summary = useMemo(() => {
    // Same rule as the roster and the portal: the course fee, unless more was invoiced.
    const standing = feeStanding({
      courseFee: student?.course?.baseFee,
      invoiced: live.reduce((s, i) => s + i.amount, 0),
      paid: live.reduce((s, i) => s + i.paid, 0),
    });
    return { total: standing.total, paid: standing.paid, dues: standing.balance };
  }, [live, student]);
  // Oldest first, so a payment settles the earliest charge before a later one.
  const open = useMemo(
    () => live.filter((i) => i.balance > 0).sort((a, b) => a.createdAt.localeCompare(b.createdAt)),
    [live],
  );
  const target = open.find((i) => i.id === pay.invoiceId) || open[0];

  const payments: PaymentLine[] = useMemo(
    () =>
      invoices
        .flatMap((inv) =>
          inv.payments.map((p) => ({
            id: p.id,
            receiptNo: p.receiptNo || p.id,
            amount: p.amount,
            method: p.method,
            referenceNo: p.referenceNo,
            paidAt: p.paidAt,
            invoiceNo: inv.invoiceNo,
            description: inv.description,
            reversed: Boolean(p.reversedAt),
          })),
        )
        .sort((a, b) => b.paidAt.localeCompare(a.paidAt)),
    [invoices],
  );

  const submitPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!target) return;
    const amount = Number(pay.amount);
    if (!Number.isFinite(amount) || amount <= 0) {
      toast({ title: "Enter the amount received", variant: "destructive" });
      return;
    }
    // Money has paise, not fractions of them: 100.555 was stored as entered and
    // then read as ₹101 here and ₹100.56 elsewhere.
    if (Math.round(amount * 100) !== amount * 100) {
      toast({ title: "Use at most 2 decimal places", description: "For example 100 or 100.50.", variant: "destructive" });
      return;
    }
    if (amount > target.balance + 0.001) {
      toast({
        title: "More than is owed",
        description: `${target.invoiceNo} has ${inr(target.balance)} left to pay.`,
        variant: "destructive",
      });
      return;
    }
    const mode = PAYMENT_MODES.find((m) => m.label === pay.mode) || PAYMENT_MODES[0];
    const reference = [mode.app, pay.reference.trim()].filter(Boolean).join(": ");
    // A back-dated receipt keeps the day it was taken; today's keeps the time too.
    const paidAt = pay.date === todayInput() ? new Date().toISOString() : new Date(`${pay.date}T12:00:00`).toISOString();
    setSaving(true);
    try {
      await addPayment(target.id, {
        amount,
        method: mode.method,
        referenceNo: reference || undefined,
        paidAt,
        note: pay.note.trim() || undefined,
      });
      toast({ title: "Payment recorded", description: `${inr(amount)} against ${target.invoiceNo}` });
      setPay({ invoiceId: "", amount: "", mode: pay.mode, reference: "", date: todayInput(), note: "" });
      await load();
    } catch (err) {
      toast({ title: "Could not record the payment", description: err instanceof Error ? err.message : "Please try again", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const submitInvoice = async (e: React.FormEvent) => {
    e.preventDefault();
    const amount = Number(raise.amount);
    if (!student || !Number.isFinite(amount) || amount <= 0 || Math.round(amount * 100) !== amount * 100) {
      toast({ title: "Enter the fee amount", description: "In rupees, with at most 2 decimal places.", variant: "destructive" });
      return;
    }
    setSaving(true);
    try {
      await createInvoiceRow(String(student.branchId || branchId || ""), {
        studentId: id,
        description: raise.description.trim() || `${student.course?.name || "Course"} fee`,
        totalAmount: amount,
      });
      toast({ title: "Fee added", description: inr(amount) });
      setRaise({ amount: "", description: "" });
      await load();
    } catch (err) {
      toast({ title: "Could not add the fee", description: err instanceof Error ? err.message : "Please try again", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const invoiceColumns: DceColumn<StudentInvoice>[] = [
    { key: "n", label: "#", render: (_r, i) => i + 1 },
    { key: "no", label: "Invoice No", render: (r) => r.invoiceNo },
    { key: "desc", label: "Description", render: (r) => r.description },
    { key: "total", label: "Amount", render: (r) => inr(r.amount) },
    { key: "paid", label: "Paid", render: (r) => <span className="text-[#2fb878]">{inr(r.paid)}</span> },
    { key: "bal", label: "Balance", render: (r) => <span className="text-[#f26b6b]">{inr(r.balance)}</span> },
    { key: "date", label: "Date", render: (r) => shortDate(r.createdAt || null) },
    { key: "status", label: "Status", render: (r) => <DceBadge status={r.status} /> },
  ];

  const paymentColumns: DceColumn<PaymentLine>[] = [
    { key: "n", label: "#", render: (_r, i) => i + 1 },
    { key: "receipt", label: "Receipt No", render: (r) => <span className="font-medium">{r.receiptNo}</span> },
    { key: "amount", label: "Amount", render: (r) => <span className={r.reversed ? "text-slate-400 line-through" : "font-bold text-[#2fb878]"}>{inr(r.amount)}</span> },
    { key: "mode", label: "Mode", render: (r) => METHOD_LABEL[r.method] || r.method || "—" },
    { key: "date", label: "Date", render: (r) => shortDate(r.paidAt || null) },
    {
      key: "note",
      label: "Note",
      render: (r) => (
        <div className="text-[12.5px]">
          <div>{r.description} <span className="text-slate-400">({r.invoiceNo})</span></div>
          {r.referenceNo && <div className="text-slate-500">Ref: {r.referenceNo}</div>}
          {r.reversed && <div className="text-[#f26b6b]">Reversed</div>}
        </div>
      ),
    },
    {
      key: "print",
      label: "Print",
      render: (r) => (
        <DceButton
          tone="slate"
          size="sm"
          aria-label={`Print receipt ${r.receiptNo}`}
          onClick={() => {
            if (student && !printReceipt(student, r, summary)) {
              toast({ title: "Pop-up blocked", description: "Allow pop-ups for this site to print the receipt.", variant: "destructive" });
            }
          }}
        >
          <Printer className="h-3.5 w-3.5" /> Receipt
        </DceButton>
      ),
    },
  ];

  const back = <DceLinkButton tone="red" size="sm" to="/centre/students?type=all">All Students</DceLinkButton>;

  if (loading || loadError || !student) {
    return (
      <AppLayout>
        <DcePanel title="Student Payments" actions={back}>
          <p className="py-8 text-center text-[13px] text-slate-500">{loading ? "Loading…" : loadError}</p>
        </DcePanel>
      </AppLayout>
    );
  }

  const name = [student.firstName, student.middleName, student.lastName].filter(Boolean).join(" ");

  return (
    <AppLayout>
      <div className="space-y-5">
        <DcePanel title="Student Payments" actions={back}>
          <div className="grid gap-4 md:grid-cols-2">
            <dl className="grid grid-cols-[110px_1fr] gap-x-3 gap-y-1.5 text-[13px]">
              <dt className="font-semibold text-slate-600">Name</dt><dd className="font-bold text-slate-800">{name}</dd>
              <dt className="font-semibold text-slate-600">Code</dt><dd>{student.enrollmentNo || student.applicationNo || "—"}</dd>
              <dt className="font-semibold text-slate-600">Father Name</dt><dd className="text-[#f5a623]">{student.fatherName || "—"}</dd>
              <dt className="font-semibold text-slate-600">Course</dt><dd>{student.course?.name || "—"}</dd>
              <dt className="font-semibold text-slate-600">Mobile</dt><dd>{student.phone || "—"}</dd>
            </dl>
            <div className="grid grid-cols-3 gap-2 self-start text-center">
              <div className="rounded border p-3"><div className="text-[12px] text-slate-500">Total Fees</div><div className="text-[17px] font-bold">{inr(summary.total)}</div></div>
              <div className="rounded border p-3"><div className="text-[12px] text-slate-500">Total Paid</div><div className="text-[17px] font-bold text-[#2fb878]">{inr(summary.paid)}</div></div>
              <div className="rounded border p-3"><div className="text-[12px] text-slate-500">Dues</div><div className="text-[17px] font-bold text-[#f26b6b]">{inr(summary.dues)}</div></div>
            </div>
          </div>
        </DcePanel>

        <DcePanel title="Add Payment">
          {target ? (
            <form onSubmit={submitPayment} noValidate>
              <DceGrid>
                {open.length > 1 && (
                  <DceField label="Against Invoice" span={4}>
                    <DceSelect aria-label="Against Invoice" value={target.id} onChange={(e) => setPay((p) => ({ ...p, invoiceId: e.target.value }))}>
                      {open.map((i) => (
                        <option key={i.id} value={i.id}>{i.invoiceNo} · {i.description} · {inr(i.balance)} due</option>
                      ))}
                    </DceSelect>
                  </DceField>
                )}
                <DceField label="Amount" required hint={`${inr(target.balance)} due on ${target.invoiceNo}`}>
                  <DceInput aria-label="Amount" type="number" min={1} value={pay.amount} onChange={(e) => setPay((p) => ({ ...p, amount: e.target.value }))} />
                </DceField>
                <DceField label="Mode">
                  <DceSelect aria-label="Mode" value={pay.mode} onChange={(e) => setPay((p) => ({ ...p, mode: e.target.value }))}>
                    {PAYMENT_MODES.map((m) => <option key={m.label} value={m.label}>{m.label}</option>)}
                  </DceSelect>
                </DceField>
                <DceField label="Reference">
                  <DceInput aria-label="Reference" placeholder="UTR / transaction id" value={pay.reference} onChange={(e) => setPay((p) => ({ ...p, reference: e.target.value }))} />
                </DceField>
                <DceField label="Date">
                  <DceInput aria-label="Date" type="date" max={todayInput()} value={pay.date} onChange={(e) => setPay((p) => ({ ...p, date: e.target.value || todayInput() }))} />
                </DceField>
                <DceField label="Note" span={4}>
                  <DceInput aria-label="Note" value={pay.note} onChange={(e) => setPay((p) => ({ ...p, note: e.target.value }))} />
                </DceField>
              </DceGrid>
              <div className="mt-4">
                <DceButton type="submit" tone="green" disabled={saving}>{saving ? "Saving…" : "Add Payment"}</DceButton>
              </div>
            </form>
          ) : (
            <form onSubmit={submitInvoice} noValidate>
              <p className="mb-4 text-[13px] text-slate-600">
                {live.length ? "All fees are paid." : "No fee has been charged to this student yet."} Add a fee to collect a payment against it.
              </p>
              <DceGrid>
                <DceField label="Fee Amount" required>
                  <DceInput aria-label="Fee Amount" type="number" min={1} value={raise.amount} onChange={(e) => setRaise((r) => ({ ...r, amount: e.target.value }))} />
                </DceField>
                <DceField label="Description" span={2}>
                  <DceInput aria-label="Description" placeholder={`${student.course?.name || "Course"} fee`} value={raise.description} onChange={(e) => setRaise((r) => ({ ...r, description: e.target.value }))} />
                </DceField>
              </DceGrid>
              <div className="mt-4">
                <DceButton type="submit" tone="blue" disabled={saving}>{saving ? "Saving…" : "Add Fee"}</DceButton>
              </div>
            </form>
          )}
        </DcePanel>

        <DcePanel title="Fee Invoices">
          <DceTable columns={invoiceColumns} rows={invoices} rowKey={(r) => r.id} empty="No fees charged yet." />
        </DcePanel>

        <DcePanel title="Payments">
          <DceTable columns={paymentColumns} rows={payments} rowKey={(r) => r.id} empty="No payments recorded yet." />
        </DcePanel>
      </div>
    </AppLayout>
  );
}
