import { useState, useEffect } from "react";
import { Download, FileText, IndianRupee, Receipt } from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { PageHeader } from "@/components/ui/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { getStudentProfile, getStudentPortalInvoices, addPayment, submitPortalRequest } from "@/lib/supabase/data";
import { feeStanding } from "@/lib/fees";
import { useToast } from "@/hooks/use-toast";
import { downloadCsv } from "@/lib/export";
import { feeInvoicePdf, feeReceiptPdf, feeStatementPdf } from "@/lib/documents";
import { useAuth } from "@/contexts/AuthContext";
import type { StudentProfile } from "@/data/student-portal";


interface PortalInvoice {
  id: string;
  invoiceNo?: string;
  description?: string;
  /** `fee_invoices.totalAmount`, resolved by `getStudentInvoices`. */
  amount: number;
  /** Receipts booked against it, reversals excluded. */
  paid: number;
  balance: number;
  status?: string;
  dueDate?: string;
  createdAt?: string;
  payments?: { id?: string; amount: number; reversedAt?: string; method?: string; receiptNo?: string; referenceNo?: string; paidAt?: string }[];
  student?: { firstName?: string; lastName?: string; enrollmentNo?: string };
}

const TONE: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  PAID: "secondary", PARTIAL: "outline", DUE: "default", OVERDUE: "destructive",
};
const METHODS = ["CASH", "UPI", "CARD", "BANK_TRANSFER", "CHEQUE"];

const money = (value: number) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 2 }).format(value);

export default function MyFees() {
  const { toast } = useToast();
  const { user } = useAuth();
  const userId = user?.id;
  const branchId = user?.branchId;
  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const [invoices, setInvoices] = useState<PortalInvoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState<PortalInvoice | null>(null);
  const [amount, setAmount] = useState("");
  const [method, setMethod] = useState(METHODS[0]);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const [profileResult, invoicesResult] = await Promise.all([
          getStudentProfile(userId, branchId),
          getStudentPortalInvoices(userId, branchId),
        ]);
        if (!cancelled) {
          if (profileResult.success) setProfile(profileResult.data);
          if (invoicesResult.success) setInvoices(invoicesResult.data);
        }
      } catch (err) {
        if (!cancelled) {
          toast({ title: "Failed to load fees", description: err instanceof Error ? err.message : "Unknown error", variant: "destructive" });
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => { cancelled = true; };
  }, [toast, userId, branchId]);

  // `getStudentInvoices` has already netted the receipts off each invoice; this
  // page used to do it again from an `amount` field the table does not have,
  // which is why every figure on the student's own fee page read zero.
  const balance = (invoice: PortalInvoice) => Number(invoice.balance || 0);

  const invoiceStatus = (invoice: PortalInvoice): string => {
    const bal = balance(invoice);
    if (bal <= 0) return "PAID";
    const today = new Date().toISOString().slice(0, 10);
    if (invoice.dueDate && invoice.dueDate < today) return "OVERDUE";
    return "PARTIAL";
  };

  /**
   * The three documents a student asks for on their own fees page. All three
   * used to be buttons that toasted "coming soon"; the generators they need
   * already existed and were only ever wired up on the branch-side fee pages.
   */
  const billTo = (invoice: PortalInvoice) => ({
    name: profile?.name || [invoice.student?.firstName, invoice.student?.lastName].filter(Boolean).join(" "),
    rollNo: profile?.rollNo || invoice.student?.enrollmentNo || "",
    course: profile?.course || "",
    phone: profile?.phone,
    email: profile?.email,
  });

  const downloadInvoice = (invoice: PortalInvoice) => {
    feeInvoicePdf({
      invoiceNo: invoice.invoiceNo || invoice.id,
      issuedOn: invoice.createdAt,
      dueDate: invoice.dueDate,
      billTo: billTo(invoice),
      items: [{ description: invoice.description || "Fee", amount: Number(invoice.amount || 0) }],
      paidAmount: Number(invoice.paid || 0),
      payments: (invoice.payments || [])
        .filter((payment) => !payment.reversedAt)
        .map((payment) => ({
          receiptNo: payment.receiptNo || payment.referenceNo,
          paidAt: payment.paidAt,
          method: payment.method,
          amount: Number(payment.amount || 0),
        })),
    });
    toast({ title: "Invoice downloaded", description: `Invoice ${invoice.invoiceNo || invoice.id} is in Downloads.` });
  };

  const downloadReceipt = (invoice: PortalInvoice) => {
    // The latest receipt on the invoice — that is the one a student has just
    // paid and come back for.
    const payments = (invoice.payments || []).filter((payment) => !payment.reversedAt);
    const latest = payments[payments.length - 1];
    if (!latest) return toast({ title: "No payment yet", description: "There is nothing receipted against this invoice.", variant: "destructive" });
    const bill = billTo(invoice);
    feeReceiptPdf({
      studentName: bill.name,
      rollNo: bill.rollNo,
      feeType: invoice.description || "Fee",
      amount: Number(latest.amount || 0),
      method: latest.method || "CASH",
      receiptNo: latest.receiptNo || latest.referenceNo || undefined,
      balanceAfter: balance(invoice),
    });
    toast({ title: "Receipt downloaded", description: "The receipt is in Downloads." });
  };

  const downloadStatement = (invoice: PortalInvoice) => {
    const bill = billTo(invoice);
    feeStatementPdf({
      studentName: bill.name,
      rollNo: bill.rollNo,
      feeType: invoice.description || "Fee",
      totalAmount: Number(invoice.amount || 0),
      paidAmount: Number(invoice.paid || 0),
      dueAmount: balance(invoice),
      dueDate: invoice.dueDate || new Date().toISOString(),
    });
    toast({ title: "Statement downloaded", description: "The statement is in Downloads." });
  };

  const openPayment = (invoice: PortalInvoice) => {
    setPaying(invoice);
    setAmount(String(balance(invoice)));
    setMethod(METHODS[0]);
  };

  const pay = async () => {
    if (!paying) return;
    const value = Number(amount);
    if (!Number.isFinite(value) || value <= 0) return toast({ title: "Enter a valid amount", variant: "destructive" });
    const bal = balance(paying);
    if (value > bal) return toast({ title: "Amount exceeds balance", description: `The balance on ${paying.invoiceNo} is ${money(bal)}.`, variant: "destructive" });
    setProcessing(true);
    try {
      await addPayment(paying.id, { amount: value, method });
      toast({ title: "Payment recorded", description: `${money(value)} paid against ${paying.invoiceNo}.` });
      setPaying(null);
      // Refresh invoices
      const invoicesResult = await getStudentPortalInvoices(userId, branchId);
      if (invoicesResult.success) setInvoices(invoicesResult.data);
    } catch (err) {
      toast({ title: "Payment failed", description: err instanceof Error ? err.message : "Unknown error", variant: "destructive" });
    } finally {
      setProcessing(false);
    }
  };

  const billed = invoices.reduce((sum, inv) => sum + Number(inv.amount || 0), 0);
  const overdue = invoices
    .filter((inv) => invoiceStatus(inv) === "OVERDUE")
    .reduce((sum, inv) => sum + balance(inv), 0);

  /* The same rule the branch roster uses, so the student and the office never
     read different numbers off the same record: the total is what the course
     costs, which is what admission quoted, and part-billing it does not make
     the course cheaper. */
  const standing = feeStanding({
    courseFee: profile?.courseFee,
    invoiced: billed,
    paid: invoices.reduce((sum, inv) => sum + Number(inv.paid || 0), 0),
  });
  const summary = { billed, paid: standing.paid, due: standing.balance, overdue };

  const exportCsv = () => {
    const rows = invoices.map((invoice) => ({
      invoiceNo: invoice.invoiceNo || invoice.id,
      description: invoice.description || "",
      dueDate: invoice.dueDate || "",
      amount: Number(invoice.amount || 0),
      balance: balance(invoice),
      status: invoiceStatus(invoice),
    }));
    downloadCsv("my-fees.csv", rows, ["invoiceNo", "description", "dueDate", "amount", "balance", "status"]);
    toast({ title: "Exported", description: `${rows.length} invoice(s) downloaded.` });
  };

  if (loading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center py-20">
          <p className="text-sm text-muted-foreground">Loading fees...</p>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <PageHeader
        title="Fees & receipts"
        description="What you have been billed, what is still open, and every receipt you can download."
        breadcrumbs={[{ label: "Fees & receipts" }]}
        actions={<Button variant="outline" onClick={exportCsv}><Download />Export CSV</Button>}
      />

      <div className="mb-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {[
          {
            label: "Course fee",
            value: money(standing.total),
            // The tile is the course price, so the note says how much of it
            // has actually been billed rather than implying they are the same.
            note: invoices.length
              ? `${money(billed)} billed across ${invoices.length} invoice${invoices.length === 1 ? "" : "s"}`
              : `${profile?.course || "Your course"} — nothing invoiced yet`,
          },
          { label: "Paid", value: money(summary.paid), note: "receipts available below" },
          { label: "Balance", value: money(summary.due), note: summary.due ? "payable online" : "all clear" },
          { label: "Overdue", value: money(summary.overdue), note: summary.overdue ? "past due date" : "nothing overdue" },
        ].map((stat) => (
          <Card key={stat.label}><CardContent className="p-4"><p className="eyebrow">{stat.label}</p><p className="metric mt-3">{stat.value}</p><p className="mt-2 text-xs text-muted-foreground">{stat.note}</p></CardContent></Card>
        ))}
      </div>

      <Card>
        <CardContent className="overflow-x-auto p-4">
          <Table>
            <TableHeader><TableRow><TableHead>Invoice</TableHead><TableHead>Description</TableHead><TableHead>Due</TableHead><TableHead className="text-right">Amount</TableHead><TableHead className="text-right">Paid</TableHead><TableHead className="text-right">Balance</TableHead><TableHead>Status</TableHead><TableHead className="text-right">Actions</TableHead></TableRow></TableHeader>
            <TableBody>
              {invoices.map((invoice) => {
                const bal = balance(invoice);
                const status = invoiceStatus(invoice);
                return (
                  <TableRow key={invoice.id}>
                    <TableCell className="whitespace-nowrap font-medium">{invoice.invoiceNo || invoice.id}</TableCell>
                    <TableCell>{invoice.description}</TableCell>
                    <TableCell className="whitespace-nowrap">{invoice.dueDate ? new Date(invoice.dueDate).toLocaleDateString("en-IN") : "—"}</TableCell>
                    <TableCell className="tabular text-right">{money(Number(invoice.amount || 0))}</TableCell>
                    <TableCell className="tabular text-right">{money(Number(invoice.paid || 0))}</TableCell>
                    <TableCell className="tabular text-right font-medium">{money(bal)}</TableCell>
                    <TableCell><Badge variant={TONE[status]} className="capitalize">{status.toLowerCase()}</Badge></TableCell>
                    <TableCell>
                      <div className="flex justify-end gap-1.5">
                        {bal > 0 && <Button size="sm" onClick={() => openPayment(invoice)}><IndianRupee className="mr-1 h-3.5 w-3.5" />Pay</Button>}
                        <Button size="sm" variant="outline" onClick={() => downloadInvoice(invoice)}><FileText className="mr-1 h-3.5 w-3.5" />Invoice</Button>
                        {invoice.payments?.length ? <Button size="sm" variant="outline" onClick={() => downloadReceipt(invoice)}><Receipt className="mr-1 h-3.5 w-3.5" />Receipt</Button> : null}
                        <Button size="sm" variant="ghost" onClick={() => downloadStatement(invoice)}>Statement</Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
              {!invoices.length && (
                <TableRow><TableCell colSpan={8} className="py-8 text-center text-sm text-muted-foreground">No invoices yet.</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={!!paying} onOpenChange={(open) => !open && setPaying(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Pay {paying?.invoiceNo}</DialogTitle></DialogHeader>
          {paying && (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">{paying.description} · balance {money(balance(paying))} · due {paying.dueDate ? new Date(paying.dueDate).toLocaleDateString("en-IN") : "—"}</p>
              <div className="space-y-2"><Label htmlFor="amount">Amount (₹)</Label><Input id="amount" type="number" min={1} max={balance(paying)} value={amount} onChange={(event) => setAmount(event.target.value)} /></div>
              <div className="space-y-2">
                <Label>Method</Label>
                <Select value={method} onValueChange={setMethod}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{METHODS.map((option) => <SelectItem key={option} value={option}>{option}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <p className="text-xs text-muted-foreground">A receipt number is issued as soon as the payment is booked; you can download the receipt from the table.</p>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setPaying(null)} disabled={processing}>Cancel</Button>
            <Button onClick={pay} disabled={processing}>{processing ? "Processing..." : `Pay ${amount ? money(Number(amount) || 0) : ""}`}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}
