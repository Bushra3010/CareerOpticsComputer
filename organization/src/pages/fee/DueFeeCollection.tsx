import { AppLayout } from "@/components/layout/AppLayout";
import { PageHeader } from "@/components/ui/PageHeader";
import { DataTable, Column } from "@/components/ui/DataTable";
import { StatsCard } from "@/components/ui/StatsCard";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertTriangle, IndianRupee, Users, Clock, Download, Bell } from "lucide-react";
import { useState, useEffect, useMemo } from "react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import {
  listInvoices,
  recordPayment,
  updateInvoiceRow,
  paidFromPayments,
  studentName,
  toNumber,
  formatDate,
  studentCode,
  type InvoiceRow,
} from "@/lib/supabase/studentFee";
import { getBranches } from "@/lib/supabase/data";
import { downloadCsv } from "@/lib/export";

interface Receipt {
  date: string;
  amount: number;
  method: string;
  reference: string;
  note?: string;
}

interface DueFee {
  id: string;
  studentId: string;
  /** Admission or enrolment number, for people; studentId is the database key. */
  studentCode: string;
  branchId: string;
  branch: string;
  name: string;
  course: string;
  batch: string;
  phone: string;
  totalDue: number;
  dueDate: string;
  daysOverdue: number;
  lastReminder: string;
  status: "overdue" | "due_today" | "due_soon" | "cleared";
  history: Receipt[];
  invoice: InvoiceRow;
}

const today = () => new Date().toISOString().slice(0, 10);

/** Reminders have no table in the live database, so they are remembered here. */
const REMINDER_KEY = "erp-fee-reminders";

const readReminders = (): Record<string, string> => {
  try {
    const raw = localStorage.getItem(REMINDER_KEY);
    const parsed = raw ? JSON.parse(raw) : null;
    return parsed && typeof parsed === "object" ? (parsed as Record<string, string>) : {};
  } catch {
    return {};
  }
};

const writeReminders = (next: Record<string, string>) => {
  try {
    localStorage.setItem(REMINDER_KEY, JSON.stringify(next));
  } catch {
    /* storage unavailable — reminders simply will not survive a reload */
  }
};

/** Whole days a due date is past. Returns null when the date is unusable, so
 *  the UI never renders "NaN days". */
const daysBetween = (dueDate: string): number | null => {
  if (!dueDate || dueDate === "—") return null;
  const due = Date.parse(dueDate);
  if (Number.isNaN(due)) return null;
  return Math.round((Date.parse(today()) - due) / 86_400_000);
};

const derive = (fee: DueFee): DueFee => {
  if (fee.totalDue <= 0) return { ...fee, daysOverdue: 0, status: "cleared" };
  const daysOverdue = daysBetween(fee.dueDate);
  if (daysOverdue === null) return { ...fee, daysOverdue: 0, status: "due_soon" };
  return {
    ...fee,
    daysOverdue,
    status: daysOverdue > 0 ? "overdue" : daysOverdue === 0 ? "due_today" : "due_soon",
  };
};

const STATUS_LABEL: Record<DueFee["status"], string> = {
  overdue: "Overdue",
  due_today: "Due Today",
  due_soon: "Due Soon",
  cleared: "Cleared",
};

const columns: Column<DueFee>[] = [
  {
    key: "studentId",
    header: "Student",
    cell: (fee) => (
      <div>
        <p className="font-medium">{fee.name}</p>
        <p className="text-xs text-muted-foreground">
          {fee.studentCode}
          {fee.phone ? ` • ${fee.phone}` : ""}
        </p>
      </div>
    ),
  },
  {
    key: "course",
    header: "Invoice",
    cell: (fee) => (
      <div>
        <Badge variant="outline">{fee.course || "Fee invoice"}</Badge>
        {fee.batch ? <p className="text-xs text-muted-foreground mt-1">{fee.batch}</p> : null}
      </div>
    ),
  },
  {
    key: "totalDue",
    header: "Amount Due",
    sortable: true,
    cell: (fee) => (
      <span className={fee.totalDue > 0 ? "font-medium text-destructive" : "font-medium text-success"}>
        ₹{toNumber(fee.totalDue).toLocaleString("en-IN")}
      </span>
    ),
  },
  {
    key: "dueDate",
    header: "Due Date",
    sortable: true,
    cell: (fee) => <span className="text-sm">{formatDate(fee.dueDate)}</span>,
  },
  {
    key: "daysOverdue",
    header: "Overdue",
    sortable: true,
    cell: (fee) =>
      fee.status === "cleared" ? (
        <Badge variant="secondary">Settled</Badge>
      ) : fee.daysOverdue > 0 ? (
        <Badge variant="destructive">{fee.daysOverdue} days</Badge>
      ) : fee.daysOverdue === 0 ? (
        <Badge variant="default">Today</Badge>
      ) : (
        <Badge variant="secondary">In {Math.abs(fee.daysOverdue)} days</Badge>
      ),
  },
  {
    key: "lastReminder",
    header: "Last Reminder",
    cell: (fee) =>
      fee.lastReminder && fee.lastReminder !== "-" ? (
        <span className="text-sm">{fee.lastReminder}</span>
      ) : (
        <span className="text-muted-foreground text-sm">Not sent</span>
      ),
  },
  {
    key: "status",
    header: "Status",
    cell: (fee) => (
      <Badge variant={fee.status === "overdue" ? "destructive" : fee.status === "due_today" ? "default" : "secondary"}>
        {STATUS_LABEL[fee.status]}
      </Badge>
    ),
  },
];

const BLANK_PAYMENT = { amount: "", method: "", lateFee: "", reference: "" };

export default function DueFeeCollection() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [fees, setFees] = useState<DueFee[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [collecting, setCollecting] = useState<DueFee | null>(null);
  const [payment, setPayment] = useState(BLANK_PAYMENT);
  const [history, setHistory] = useState<DueFee | null>(null);
  const [penalty, setPenalty] = useState<DueFee | null>(null);
  const [penaltyAmount, setPenaltyAmount] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const branchId = user?.branchId || null;
  // An organisation account reads every branch's dues; it can narrow them to one.
  const showBranch = !branchId;
  const [branches, setBranches] = useState<Array<{ id: string; name: string }>>([]);
  const [branchFilter, setBranchFilter] = useState("all");
  useEffect(() => {
    if (!showBranch) return;
    let cancelled = false;
    getBranches(user?.organizationId ?? null)
      .then((result) => {
        if (!cancelled) {
          setBranches((result.data as Array<Record<string, unknown>>).map((b) => ({ id: String(b.id), name: String(b.name ?? "") })));
        }
      })
      .catch(() => { if (!cancelled) setBranches([]); });
    return () => { cancelled = true; };
  }, [showBranch, user?.organizationId]);

  const fetchFees = () => {
    setLoading(true);
    setError(null);
    listInvoices(branchId, { statuses: ["DUE", "PARTIAL"] })
      .then((res) => {
        const reminders = readReminders();
        const mapped: DueFee[] = (res.data || []).map((invoice) => {
          const paid = paidFromPayments(invoice);
          const totalDue = Math.max(0, toNumber(invoice.totalAmount) - paid);
          const payments = Array.isArray(invoice.payments) ? invoice.payments : [];
          const studentId = invoice.studentId || "";
          return {
            id: invoice.id,
            studentId,
            studentCode: studentCode(invoice.student as Partial<Record<string, unknown>> | null),
            branchId: String(invoice.branchId ?? ""),
            branch: "",
            name:
              studentName(invoice.student, "") ||
              (studentId ? `Student #${studentId.slice(-6)}` : "Unlinked invoice"),
            course: invoice.description || "Fee invoice",
            batch: invoice.invoiceNo || "",
            phone: invoice.student?.phone || "",
            totalDue,
            dueDate: invoice.dueDate || "",
            daysOverdue: 0,
            lastReminder: reminders[invoice.id] || "-",
            status: "cleared" as const,
            history: payments
              .slice()
              .sort((a, b) => new Date(b.paidAt || 0).getTime() - new Date(a.paidAt || 0).getTime())
              .map((p) => ({
                date: formatDate(p.paidAt),
                amount: toNumber(p.amount),
                method: p.method || "—",
                reference: p.referenceNo || p.receiptNo || "—",
                note: p.reversedAt ? "Reversed" : undefined,
              })),
            invoice,
          };
        });
        setFees(mapped.map(derive));
      })
      .catch((err) => {
        const message = err?.message || "Failed to load fee data";
        setError(message);
        toast({ title: "Could not load fees", description: message, variant: "destructive" });
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchFees();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [branchId]);

  const openCollect = (fee: DueFee) => {
    setCollecting(fee);
    setPayment({ ...BLANK_PAYMENT, amount: String(fee.totalDue) });
  };

  const stampReminder = (ids: string[]) => {
    const stamped = today();
    const next = { ...readReminders() };
    ids.forEach((id) => {
      next[id] = stamped;
    });
    writeReminders(next);
    setFees((prev) => prev.map((fee) => (ids.includes(fee.id) ? { ...fee, lastReminder: stamped } : fee)));
    return stamped;
  };

  const remind = (fee: DueFee) => {
    stampReminder([fee.id]);
    toast({
      title: "Reminder logged",
      description: `₹${fee.totalDue.toLocaleString("en-IN")} flagged for ${fee.name}. No SMS/email gateway is connected, so nothing was sent out.`,
    });
  };

  const bulkRemind = () => {
    // Only the branch on screen: picking one branch and chasing every branch would surprise.
    const pending = derivedFees.filter((fee) => fee.status === "overdue" || fee.status === "due_today");
    if (!pending.length) {
      toast({ title: "Nothing to chase", description: "No overdue or due-today balances right now." });
      return;
    }
    stampReminder(pending.map((fee) => fee.id));
    toast({
      title: `${pending.length} students flagged for follow-up`,
      description: `₹${pending.reduce((sum, fee) => sum + fee.totalDue, 0).toLocaleString("en-IN")} outstanding. No messaging gateway is connected, so this is a local record only.`,
    });
  };

  const exportReport = () => {
    if (!derivedFees.length) {
      toast({ title: "Nothing to export", description: "There are no outstanding invoices." });
      return;
    }
    downloadCsv(
      `due-fees-${today()}.csv`,
      derivedFees.map((fee) => ({
        "Invoice No": fee.invoice.invoiceNo || "",
        "Student ID": fee.studentCode,
        ...(showBranch ? { Branch: fee.branch } : {}),
        Name: fee.name,
        Description: fee.course,
        Phone: fee.phone,
        "Amount Due": fee.totalDue,
        "Due Date": formatDate(fee.dueDate),
        "Days Overdue": fee.daysOverdue,
        "Last Reminder": fee.lastReminder,
        Status: STATUS_LABEL[fee.status],
      })),
    );
    toast({ title: "Report exported", description: `${derivedFees.length} rows written to CSV.` });
  };

  const collect = async () => {
    if (!collecting) return;
    const amount = Number(payment.amount);
    if (!Number.isFinite(amount) || amount <= 0) {
      toast({ title: "Enter an amount to collect", variant: "destructive" });
      return;
    }
    const lateFee = Number(payment.lateFee) || 0;
    if (lateFee < 0) {
      toast({ title: "Late fee cannot be negative", variant: "destructive" });
      return;
    }
    if (amount > collecting.totalDue + lateFee) {
      toast({
        title: "Amount exceeds the balance",
        description: `₹${(collecting.totalDue + lateFee).toLocaleString("en-IN")} is outstanding.`,
        variant: "destructive",
      });
      return;
    }
    if (!payment.method) {
      toast({ title: "Pick a payment method", variant: "destructive" });
      return;
    }
    setSubmitting(true);
    try {
      let invoice = collecting.invoice;
      // A late fee increases what is owed, so it is added to the invoice before
      // the payment is recorded. Previously this field was collected and then
      // silently thrown away.
      if (lateFee > 0) {
        const bumped = await updateInvoiceRow(invoice.id, {
          totalAmount: toNumber(invoice.totalAmount) + lateFee,
          lateFee: toNumber(invoice.lateFee) + lateFee,
        });
        invoice = { ...invoice, ...bumped.data, payments: invoice.payments };
      }
      await recordPayment(invoice, {
        amount,
        method: payment.method,
        referenceNo: payment.reference.trim() || undefined,
        note: lateFee > 0 ? `Includes late fee of ₹${lateFee}` : undefined,
      });
      toast({
        title: "Payment collected",
        description: `₹${amount.toLocaleString("en-IN")} received successfully.`,
      });
      setCollecting(null);
      setPayment(BLANK_PAYMENT);
      fetchFees();
    } catch (err) {
      toast({
        title: "Payment failed",
        description: (err as Error)?.message || "Please try again.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const applyPenalty = async () => {
    if (!penalty) return;
    const amount = Number(penaltyAmount);
    if (!Number.isFinite(amount) || amount <= 0) {
      toast({ title: "Enter a penalty amount", variant: "destructive" });
      return;
    }
    setSubmitting(true);
    try {
      await updateInvoiceRow(penalty.id, {
        totalAmount: toNumber(penalty.invoice.totalAmount) + amount,
        lateFee: toNumber(penalty.invoice.lateFee) + amount,
      });
      toast({ title: "Penalty added", description: `₹${amount.toLocaleString("en-IN")} charged to ${penalty.name}.` });
      setPenalty(null);
      setPenaltyAmount("");
      fetchFees();
    } catch (err) {
      toast({
        title: "Could not add the penalty",
        description: (err as Error)?.message || "Please try again.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const waive = async (fee: DueFee) => {
    const charged = toNumber(fee.invoice.lateFee);
    if (charged <= 0) {
      toast({ title: "No late fee to waive", description: `${fee.name} has no penalty on record.` });
      return;
    }
    try {
      await updateInvoiceRow(fee.id, {
        totalAmount: Math.max(0, toNumber(fee.invoice.totalAmount) - charged),
        lateFee: 0,
      });
      toast({
        title: "Late fee waived",
        description: `₹${charged.toLocaleString("en-IN")} removed from ${fee.name}'s balance.`,
      });
      fetchFees();
    } catch (err) {
      toast({
        title: "Could not waive the late fee",
        description: (err as Error)?.message || "Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleActions = (fee: DueFee) => [
    { label: "Collect Payment", onClick: () => openCollect(fee) },
    { label: "Send Reminder", onClick: () => remind(fee) },
    { label: "View History", onClick: () => setHistory(fee) },
    { label: "Add Penalty", onClick: () => { setPenalty(fee); setPenaltyAmount("500"); } },
    { label: "Waive Late Fee", onClick: () => { void waive(fee); } },
  ];

  const branchName = useMemo(() => new Map(branches.map((b) => [b.id, b.name])), [branches]);
  // The branch picked narrows the cards as well as the list, so the totals
  // always describe the rows on screen.
  const derivedFees = fees
    .map(derive)
    .filter((f) => branchFilter === "all" || f.branchId === branchFilter)
    .map((f) => ({ ...f, branch: branchName.get(f.branchId) ?? "" }));
  const totalDue = derivedFees.reduce((sum, f) => sum + f.totalDue, 0);
  const overdueCount = derivedFees.filter((f) => f.status === "overdue").length;
  const dueTodayCount = derivedFees.filter((f) => f.status === "due_today").length;
  // Students, not invoices: one student with three open invoices is one.
  const pendingCount = new Set(derivedFees.filter((f) => f.totalDue > 0).map((f) => f.studentId || f.id)).size;
  const tableColumns: Column<DueFee>[] = showBranch
    ? [
        columns[0],
        { key: "branch", header: "Branch", cell: (fee) => <span className="text-sm">{fee.branch || "—"}</span> },
        ...columns.slice(1),
      ]
    : columns;

  return (
    <AppLayout>
      <PageHeader
        title="Due Fee Collection"
        description="Track and collect overdue fees from students"
        breadcrumbs={[
          { label: "Fee Management", href: "/fee/collection" },
          { label: "Due Fee Collection" },
        ]}
        actions={
          <div className="flex flex-wrap gap-2">
            {showBranch && (
              <Select value={branchFilter} onValueChange={setBranchFilter}>
                <SelectTrigger className="w-full sm:w-56" aria-label="Branch"><SelectValue /></SelectTrigger>
                <SelectContent searchable searchPlaceholder="Search centre…">
                  <SelectItem value="all">All branches</SelectItem>
                  {branches.map((b) => <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>)}
                </SelectContent>
              </Select>
            )}
            <Button variant="outline" className="gap-2" onClick={bulkRemind}>
              <Bell className="h-4 w-4" />
              Send Bulk Reminder
            </Button>
            <Button variant="outline" className="gap-2" onClick={exportReport}>
              <Download className="h-4 w-4" />
              Export Report
            </Button>
          </div>
        }
      />

      {error ? (
        <Card>
          <CardContent className="py-12 text-center space-y-3">
            <p className="text-sm text-destructive">{error}</p>
            <Button variant="outline" onClick={fetchFees}>Retry</Button>
          </CardContent>
        </Card>
      ) : loading ? (
        <Card><CardContent className="py-12 text-center text-sm text-muted-foreground">Loading fee data…</CardContent></Card>
      ) : (
        <>
          <div className="grid gap-4 md:grid-cols-4 mb-6">
            <StatsCard
              title="Total Due Amount"
              value={`₹${totalDue.toLocaleString("en-IN")}`}
              subtitle={branchFilter === "all" ? "From all students" : `${branchName.get(branchFilter) ?? "This branch"} only`}
              icon={IndianRupee}
            />
            <StatsCard
              title="Students with Dues"
              value={pendingCount}
              subtitle="Need follow-up"
              icon={Users}
            />
            <StatsCard
              title="Overdue"
              value={overdueCount}
              subtitle="Past due date"
              icon={AlertTriangle}
            />
            <StatsCard
              title="Due Today"
              value={dueTodayCount}
              subtitle="Payment expected"
              icon={Clock}
            />
          </div>

          <DataTable
            data={derivedFees}
            columns={tableColumns}
            searchPlaceholder="Search students with dues..."
            actions={handleActions}
            emptyMessage={branchFilter === "all" ? "No outstanding invoices." : "No outstanding invoices for this branch."}
            selectable
          />
        </>
      )}

      <Dialog open={!!collecting} onOpenChange={(open) => !open && setCollecting(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Collect Due Payment</DialogTitle>
          </DialogHeader>
          {collecting && (
            <div className="space-y-4 mt-4">
              <div className="p-4 bg-muted rounded-lg">
                <div className="flex justify-between mb-2">
                  <span className="text-muted-foreground">Student:</span>
                  <span className="font-medium">{collecting.name}</span>
                </div>
                <div className="flex justify-between mb-2">
                  <span className="text-muted-foreground">Total Due:</span>
                  <span className="font-medium text-destructive">₹{collecting.totalDue.toLocaleString("en-IN")}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Days Overdue:</span>
                  <span className="font-medium">{collecting.daysOverdue > 0 ? `${collecting.daysOverdue} days` : "Not overdue"}</span>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="collect-amount">Amount to Collect *</Label>
                <Input
                  id="collect-amount"
                  type="number"
                  placeholder="Enter amount"
                  value={payment.amount}
                  onChange={(e) => setPayment({ ...payment, amount: e.target.value })}
                />
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="collect-method">Payment Method *</Label>
                  <Select value={payment.method} onValueChange={(method) => setPayment({ ...payment, method })}>
                    <SelectTrigger id="collect-method">
                      <SelectValue placeholder="Select method" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="CASH">Cash</SelectItem>
                      <SelectItem value="CARD">Card</SelectItem>
                      <SelectItem value="UPI">UPI</SelectItem>
                      <SelectItem value="BANK_TRANSFER">Bank Transfer</SelectItem>
                      <SelectItem value="CHEQUE">Cheque</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="collect-late">Late Fee</Label>
                  <Input
                    id="collect-late"
                    type="number"
                    placeholder="e.g., 500"
                    value={payment.lateFee}
                    onChange={(e) => setPayment({ ...payment, lateFee: e.target.value })}
                  />
                  <p className="text-xs text-muted-foreground">Added to the invoice before the payment is recorded.</p>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="collect-ref">Reference Number</Label>
                <Input
                  id="collect-ref"
                  placeholder="Transaction reference"
                  value={payment.reference}
                  onChange={(e) => setPayment({ ...payment, reference: e.target.value })}
                />
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <Button variant="outline" onClick={() => setCollecting(null)}>Cancel</Button>
                <Button onClick={collect} disabled={submitting}>
                  <IndianRupee className="h-4 w-4 mr-2" />
                  {submitting ? "Processing…" : "Collect Payment"}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={!!history} onOpenChange={(open) => !open && setHistory(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Payment history</DialogTitle>
            <DialogDescription>{history?.name} · {history?.studentId || "—"}</DialogDescription>
          </DialogHeader>
          {history?.history?.length ? (
            <div className="divide-y">
              {history.history.map((entry, index) => (
                <div key={`${entry.date}-${index}`} className="flex items-start justify-between py-3 text-sm">
                  <div>
                    <p className="font-medium">{entry.method}</p>
                    <p className="text-xs text-muted-foreground">{entry.date} · Ref {entry.reference}</p>
                    {entry.note && <p className="text-xs text-muted-foreground">{entry.note}</p>}
                  </div>
                  <span className="font-medium text-success">
                    ₹{Math.abs(entry.amount).toLocaleString("en-IN")}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="py-6 text-center text-sm text-muted-foreground">No payments recorded yet.</p>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={!!penalty} onOpenChange={(open) => !open && setPenalty(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Add penalty</DialogTitle>
            <DialogDescription>
              Charged on top of {penalty?.name}'s ₹{toNumber(penalty?.totalDue).toLocaleString("en-IN")} balance.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <Label htmlFor="penalty-amount">Penalty amount</Label>
            <Input
              id="penalty-amount"
              type="number"
              value={penaltyAmount}
              onChange={(e) => setPenaltyAmount(e.target.value)}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPenalty(null)}>Cancel</Button>
            <Button onClick={applyPenalty} disabled={submitting}>Add penalty</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}
