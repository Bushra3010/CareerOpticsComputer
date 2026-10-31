import { AppLayout } from "@/components/layout/AppLayout";
import { PageHeader } from "@/components/ui/PageHeader";
import { DataTable, Column } from "@/components/ui/DataTable";
import { StatsCard } from "@/components/ui/StatsCard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowUpRight, ArrowDownLeft, IndianRupee, TrendingUp, TrendingDown, Download } from "lucide-react";
import { useMemo, useState, useEffect } from "react";
import { downloadCsv, downloadHtml, printHtml } from "@/lib/export";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { getTransactionsByOrg, getTransactions } from "@/lib/supabase/data";

interface Transaction {
  id: string;
  date: string;
  branch: string;
  type: "credit" | "debit";
  category: string;
  description: string;
  amount: number;
  balance: number;
  reference: string;
}

const columns: Column<Transaction>[] = [
  {
    key: "date",
    header: "Date",
    sortable: true,
  },
  {
    key: "branch",
    header: "Branch",
    sortable: true,
  },
  {
    key: "type",
    header: "Type",
    cell: (txn) => (
      <div className="flex items-center gap-2">
        {txn.type === "credit" ? (
          <ArrowDownLeft className="h-4 w-4 text-success" />
        ) : (
          <ArrowUpRight className="h-4 w-4 text-destructive" />
        )}
        <Badge variant={txn.type === "credit" ? "default" : "secondary"}>
          {txn.type === "credit" ? "Credit" : "Debit"}
        </Badge>
      </div>
    ),
  },
  {
    key: "category",
    header: "Category",
    cell: (txn) => <Badge variant="outline">{txn.category}</Badge>,
  },
  {
    key: "description",
    header: "Description",
    cell: (txn) => (
      <div>
        <p className="text-sm">{txn.description}</p>
        <p className="text-xs text-muted-foreground">{txn.reference}</p>
      </div>
    ),
  },
  {
    key: "amount",
    header: "Amount",
    sortable: true,
    cell: (txn) => (
      <span className={`font-medium ${txn.type === "credit" ? "text-success" : "text-destructive"}`}>
        {(txn.type === "credit" ? "+" : "-")}₹{(txn.amount ?? 0).toLocaleString()}
      </span>
    ),
  },
  {
    key: "balance",
    header: "Balance",
    cell: (txn) => <span className="font-medium">₹{(txn.balance ?? 0).toLocaleString()}</span>,
  },
];

const receiptHtml = (txn: Transaction) => `
  <div style="font-family:system-ui,sans-serif;max-width:520px;margin:0 auto">
    <h1 style="margin:0;font-size:20px">Career Optics Computer Academy</h1>
    <p style="margin:4px 0 20px;color:#6b7280;font-size:13px">Transaction receipt · ${txn.reference}</p>
    <table style="width:100%;border-collapse:collapse;font-size:13px">
      ${[
        ["Date", txn.date],
        ["Branch", txn.branch],
        ["Category", txn.category],
        ["Description", txn.description],
        ["Type", txn.type === "credit" ? "Credit" : "Debit"],
        ["Amount", `${txn.type === "credit" ? "+" : "−"}₹${(txn.amount ?? 0).toLocaleString()}`],
        ["Balance after", `₹${(txn.balance ?? 0).toLocaleString()}`],
      ]
        .map(
          ([label, value]) =>
            `<tr><td style="padding:6px 0;color:#6b7280">${label}</td><td style="padding:6px 0;text-align:right;font-weight:600">${value}</td></tr>`,
        )
        .join("")}
    </table>
    <p style="margin-top:28px;font-size:11px;color:#6b7280">Generated ${new Date().toLocaleString()} · system generated, no signature required.</p>
  </div>`;

export default function BranchTransactions() {
  const { toast } = useToast();
  const { user, branchId } = useAuth();
  const [details, setDetails] = useState<Transaction | null>(null);
  const [rawRows, setRawRows] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedYear, setSelectedYear] = useState<string>("all");
  const [selectedMonth, setSelectedMonth] = useState<string>("all");

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    (async () => {
      try {
        const orgId = (user as any)?.organizationId || (user as any)?.orgId || null;
        // The branch has to be tested first. A branch login carries an
        // organizationId as well, so checking the org first handed a franchise
        // account every branch's transactions.
        const res = branchId
          ? await getTransactions(branchId)
          : orgId
            ? await getTransactionsByOrg(orgId)
            : { success: true, data: [] };
        if (!cancelled) setRawRows((res.data || []) as Transaction[]);
      } catch (e: any) {
        if (!cancelled) toast({ title: "Failed to load transactions", description: e?.message || "Unknown error", variant: "destructive" });
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [branchId, (user as any)?.organizationId, (user as any)?.orgId]);

  const filtered = useMemo(() => {
    if (selectedYear === "all" && selectedMonth === "all") return rawRows;
    return rawRows.filter((txn) => {
      const raw = (txn as any).date || (txn as any).createdAt || "";
      const d = new Date(raw);
      const yearMatch = selectedYear === "all" || d.getFullYear() === Number(selectedYear);
      const monthMatch = selectedMonth === "all" || d.getMonth() + 1 === Number(selectedMonth);
      return yearMatch && monthMatch;
    });
  }, [rawRows, selectedYear, selectedMonth]);

  const totalCredits = filtered.filter((t) => t.type === "credit").reduce((sum, t) => sum + t.amount, 0);
  const totalDebits = filtered.filter((t) => t.type === "debit").reduce((sum, t) => sum + t.amount, 0);
  // Both filters default to "all", which `new Date()` turns into Invalid Date.
  const monthLabel = useMemo(() => {
    if (selectedYear === "all" && selectedMonth === "all") return "All time";
    if (selectedMonth === "all") return selectedYear;
    const month = new Date(2000, Number(selectedMonth) - 1).toLocaleString("en-IN", { month: "long" });
    return selectedYear === "all" ? month : `${month} ${selectedYear}`;
  }, [selectedYear, selectedMonth]);

  const clearFilter = () => {
    setSelectedYear("all");
    setSelectedMonth("all");
  };

  const downloadReceipt = (txn: Transaction) => {
    downloadHtml(`receipt-${txn.reference}.html`, `Receipt ${txn.reference}`, receiptHtml(txn));
    toast({ title: "Receipt downloaded", description: `receipt-${txn.reference}.html` });
  };

  const exportAll = () => {
    const source = filtered.length ? filtered : rawRows;
    downloadCsv(
      "branch-transactions.csv",
      source.map((txn) => ({
        Date: txn.date,
        Branch: txn.branch,
        Type: txn.type,
        Category: txn.category,
        Description: txn.description,
        Amount: txn.amount,
        Balance: txn.balance,
        Reference: txn.reference,
      })),
    );
    toast({ title: "Transactions exported", description: `${source.length} rows written to CSV.` });
  };

  const handleActions = (txn: Transaction) => [
    { label: "View Details", onClick: () => setDetails(txn) },
    { label: "Download Receipt", onClick: () => downloadReceipt(txn) },
    { label: "Print", onClick: () => printHtml(`Receipt ${txn.reference}`, receiptHtml(txn)) },
  ];

  return (
    <AppLayout>
      <PageHeader
        title="Branch Transactions"
        description="View all financial transactions across branches"
        breadcrumbs={[
          { label: "Branch Management", href: "/branch/view" },
          { label: "Transactions" },
        ]}
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-2">
              <Select
                value={String(selectedMonth)}
                onValueChange={(v) => setSelectedMonth(v)}
              >
                <SelectTrigger className="h-9 w-[140px]">
                  <SelectValue placeholder="Month" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Months</SelectItem>
                  {[
                    { v: "1", label: "January" },
                    { v: "2", label: "February" },
                    { v: "3", label: "March" },
                    { v: "4", label: "April" },
                    { v: "5", label: "May" },
                    { v: "6", label: "June" },
                    { v: "7", label: "July" },
                    { v: "8", label: "August" },
                    { v: "9", label: "September" },
                    { v: "10", label: "October" },
                    { v: "11", label: "November" },
                    { v: "12", label: "December" },
                  ].map((m) => (
                    <SelectItem key={m.v} value={m.v}>{m.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select
                value={String(selectedYear)}
                onValueChange={(v) => setSelectedYear(v)}
              >
                <SelectTrigger className="h-9 w-[110px]">
                  <SelectValue placeholder="Year" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Years</SelectItem>
                  {[2024, 2025, 2026].map((y) => (
                    <SelectItem key={y} value={String(y)}>{y}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button variant="outline" size="sm" onClick={clearFilter}>
              Reset
            </Button>
            <Button variant="outline" className="gap-2" onClick={exportAll}>
              <Download className="h-4 w-4" />
              Export
            </Button>
          </div>
        }
      />

      {loading ? (
        <div className="py-10 text-center text-muted-foreground">Loading transactions...</div>
      ) : (
        <>
          <div className="grid gap-4 md:grid-cols-4 mb-6">
            <StatsCard
              title="Total Transactions"
              value={filtered.length}
              subtitle={monthLabel}
              icon={IndianRupee}
            />
            <StatsCard
              title="Total Credits"
              value={`₹${Math.round(totalCredits).toLocaleString("en-IN")}`}
              subtitle="Incoming funds"
              icon={TrendingUp}
              trend={{ value: 12, isPositive: true }}
            />
            <StatsCard
              title="Total Debits"
              value={`₹${Math.round(totalDebits).toLocaleString("en-IN")}`}
              subtitle="Outgoing funds"
              icon={TrendingDown}
              trend={{ value: 5, isPositive: false }}
            />
            <StatsCard
              title="Net Balance"
              value={`₹${Math.round(totalCredits - totalDebits).toLocaleString("en-IN")}`}
              subtitle="Credits - Debits"
              icon={IndianRupee}
              trend={{ value: 8, isPositive: true }}
            />
          </div>

          <DataTable
            data={filtered}
            columns={columns}
            searchPlaceholder="Search transactions..."
            actions={handleActions}
          />
        </>
      )}

      <Dialog open={!!details} onOpenChange={(open) => !open && setDetails(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{details?.description}</DialogTitle>
            <DialogDescription>{details?.reference} · {details?.branch}</DialogDescription>
          </DialogHeader>
          {details && (
            <dl className="grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
              {[
                ["Date", details.date],
                ["Category", details.category],
                ["Type", details.type === "credit" ? "Credit" : "Debit"],
                ["Amount", `${details.type === "credit" ? "+" : "−"}₹${details.amount.toLocaleString()}`],
                ["Balance after", `₹${details.balance.toLocaleString()}`],
              ].map(([label, value]) => (
                <div key={label}>
                  <dt className="text-xs text-muted-foreground">{label}</dt>
                  <dd className="font-medium">{value}</dd>
                </div>
              ))}
            </dl>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => details && downloadReceipt(details)}>Download receipt</Button>
            <Button onClick={() => details && printHtml(`Receipt ${details.reference}`, receiptHtml(details))}>Print</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}
