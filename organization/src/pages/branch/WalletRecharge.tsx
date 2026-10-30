import { useState, useEffect, useMemo, useCallback } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { PageHeader } from "@/components/ui/PageHeader";
import { StatsCard } from "@/components/ui/StatsCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import {
  Wallet,
  CreditCard,
  Building2,
  Clock,
  Plus,
  Search,
  RefreshCw,
  Download,
  FilterX,
  CheckCircle2,
  XCircle,
  Eye,
  History,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Copy,
  Check,
  AlertCircle,
  FileText,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  ShieldAlert,
  QrCode,
} from "lucide-react";
import { downloadCsv } from "@/lib/export";
import {
  getBranches,
  getWalletsByOrg,
  getWalletTransactions,
  approveRechargeTransaction,
  rejectRechargeTransaction,
  bulkApproveRecharges,
  bulkRejectRecharges,
  type WalletTransactionItem,
} from "@/lib/supabase/data";
import { RechargeDrawer } from "@/components/branch/RechargeDrawer";
import { RechargeUpiDialog } from "@/components/branch/RechargeUpiDialog";
import { PaymentProofModal } from "@/components/branch/PaymentProofModal";
import { RejectReasonDialog } from "@/components/branch/RejectReasonDialog";
import { TransactionAuditDrawer } from "@/components/branch/TransactionAuditDrawer";

interface Institute {
  id: string;
  name: string;
  directorName: string;
  balance: number;
}

type TabStatus = "ALL" | "PENDING" | "COMPLETED" | "FAILED";
type DateFilter = "all" | "today" | "week" | "month";

const inr = (value: number) => `₹${value.toLocaleString("en-IN")}`;

export default function WalletRecharge() {
  const { toast } = useToast();
  const { user, view, branchId } = useAuth();

  // Approval is an administrator's. A branch reaches this same route from its
  // own sidebar, where the queue is its own request history and its balance --
  // showing it Approve and Reject only offers buttons the database refuses.
  const canApprove = view === "admin";

  // Primary Data State
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [institutes, setInstitutes] = useState<Institute[]>([]);
  const [transactions, setTransactions] = useState<WalletTransactionItem[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [statusCounts, setStatusCounts] = useState({
    all: 0,
    pending: 0,
    approved: 0,
    rejected: 0,
  });
  const [totals, setTotals] = useState({
    totalBalance: 0,
    pendingAmount: 0,
    approvedAmount: 0,
  });

  // High-Volume Filter & Search States
  const [statusTab, setStatusTab] = useState<TabStatus>("PENDING");
  const [searchInput, setSearchInput] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [selectedBranch, setSelectedBranch] = useState<string>("all");
  const [selectedMethod, setSelectedMethod] = useState<string>("all");
  const [dateFilter, setDateFilter] = useState<DateFilter>("all");
  const [pageSize, setPageSize] = useState<number>(25);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [sortBy, setSortBy] = useState<"createdAt" | "amount" | "branch" | "status">("createdAt");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc"); // Default pending oldest-first

  // Selection & Bulk Action States
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isBulkProcessing, setIsBulkProcessing] = useState(false);
  // A single approve/reject also has to disable its buttons; without this the
  // proof viewer stayed live during the round trip and could be clicked twice.
  const [processingId, setProcessingId] = useState<string | null>(null);

  // Modals & Drawers States
  const [rechargeDrawerOpen, setRechargeDrawerOpen] = useState(false);
  const [upiDialogOpen, setUpiDialogOpen] = useState(false);
  const [proofModalOpen, setProofModalOpen] = useState(false);
  const [selectedProofTx, setSelectedProofTx] = useState<WalletTransactionItem | null>(null);
  const [auditDrawerOpen, setAuditDrawerOpen] = useState(false);
  const [selectedAuditTx, setSelectedAuditTx] = useState<WalletTransactionItem | null>(null);
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [rejectingTx, setRejectingTx] = useState<WalletTransactionItem | null>(null);
  const [isBulkReject, setIsBulkReject] = useState(false);

  // Copy feedback state
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // 300ms search debounce
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchInput);
      setCurrentPage(1);
    }, 300);
    return () => clearTimeout(handler);
  }, [searchInput]);

  // Adjust default sort order when switching tabs:
  // Pending -> oldest first (asc) for FIFO processing. All/Approved/Rejected -> newest first (desc).
  const handleTabChange = (newTab: TabStatus) => {
    setStatusTab(newTab);
    setCurrentPage(1);
    setSelectedIds([]);
    if (newTab === "PENDING") {
      setSortBy("createdAt");
      setSortOrder("asc");
    } else {
      setSortBy("createdAt");
      setSortOrder("desc");
    }
  };

  // Date filter boundaries
  const dateRange = useMemo(() => {
    if (dateFilter === "all") return { startDate: null, endDate: null };
    const now = new Date();
    if (dateFilter === "today") {
      const start = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
      return { startDate: start, endDate: null };
    }
    if (dateFilter === "week") {
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();
      return { startDate: weekAgo, endDate: null };
    }
    if (dateFilter === "month") {
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
      return { startDate: monthStart, endDate: null };
    }
    return { startDate: null, endDate: null };
  }, [dateFilter]);

  // Primary data fetcher
  const loadData = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);

    try {
      const orgId = user?.organizationId || null;

      // Parallel fetch: branches + wallets + filtered transactions
      const [branchesRes, walletsRes, txResult] = await Promise.all([
        getBranches(orgId),
        getWalletsByOrg(orgId),
        getWalletTransactions({
          organizationId: orgId,
          // A centre sees its own ledger only, whatever the database lets it read.
          branchId: canApprove ? (selectedBranch === "all" ? null : selectedBranch) : branchId || null,
          status: statusTab,
          paymentMethod: selectedMethod === "all" ? null : selectedMethod,
          search: debouncedSearch,
          startDate: dateRange.startDate,
          endDate: dateRange.endDate,
          page: currentPage,
          pageSize,
          sortBy,
          sortOrder,
        }),
      ]);

      const branches = (branchesRes.data || []).filter((b: any) => b.isActive !== false);
      const walletMap = new Map((walletsRes.data || []).map((w: any) => [w.branchId, Number(w.balance || 0)]));

      const instituteList = branches.map((b: any) => ({
        id: b.id,
        name: b.name,
        directorName: b.code,
        balance: Number(walletMap.get(b.id) ?? 0),
      }));

      setInstitutes(instituteList);
      setTransactions(txResult.data);
      setTotalCount(txResult.totalCount);
      setTotalPages(txResult.totalPages);
      setStatusCounts(txResult.counts);
      setTotals({
        // The office sees every centre's wallets added up; a centre sees its own
        // wallet -- the figure the header shows -- never the others' summed in.
        totalBalance: canApprove
          ? instituteList.reduce((sum, i) => sum + i.balance, 0)
          : Number(walletMap.get(branchId || "") ?? 0),
        pendingAmount: txResult.totals.pendingAmount,
        approvedAmount: txResult.totals.approvedAmount,
      });
    } catch (error) {
      toast({
        title: "Failed to load wallet transactions",
        description: error instanceof Error ? error.message : "Database connection error.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [
    user?.organizationId,
    canApprove,
    branchId,
    selectedBranch,
    statusTab,
    selectedMethod,
    debouncedSearch,
    dateRange.startDate,
    dateRange.endDate,
    currentPage,
    pageSize,
    sortBy,
    sortOrder,
    toast,
  ]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Single Approve Action
  const handleApprove = async (tx: WalletTransactionItem) => {
    setProcessingId(tx.id);
    try {
      const res = await approveRechargeTransaction(tx.id, {
        id: user?.id,
        name: user?.name,
        email: user?.email,
      });

      if (res.success && res.data) {
        toast({
          title: "Recharge Approved",
          description: `₹${tx.amount.toLocaleString("en-IN")} credited to ${tx.branch}. Reference: ${tx.reference}`,
        });

        // Close proof modal if approving from inside proof viewer
        if (proofModalOpen && selectedProofTx?.id === tx.id) {
          setProofModalOpen(false);
        }

        // Clean from selection
        setSelectedIds((prev) => prev.filter((id) => id !== tx.id));
        loadData(true);
      } else {
        toast({
          title: "Approval Failed",
          description: res.error || "Transaction could not be approved.",
          variant: "destructive",
        });
      }
    } catch (err) {
      toast({
        title: "Approval Failed",
        description: err instanceof Error ? err.message : "Error processing approval.",
        variant: "destructive",
      });
    } finally {
      setProcessingId(null);
    }
  };

  // Open single reject dialog. The proof viewer closes first: two stacked
  // dialogs fight over the focus trap, and the reason box is what matters now.
  const handleOpenReject = (tx: WalletTransactionItem) => {
    setProofModalOpen(false);
    setRejectingTx(tx);
    setIsBulkReject(false);
    setRejectDialogOpen(true);
  };

  // Open bulk reject dialog
  const handleOpenBulkReject = () => {
    if (selectedIds.length === 0) return;
    setIsBulkReject(true);
    setRejectingTx(null);
    setRejectDialogOpen(true);
  };

  // Rejection Execution (Single or Bulk)
  const handleConfirmReject = async (reason: string) => {
    if (isBulkReject) {
      setIsBulkProcessing(true);
      try {
        const res = await bulkRejectRecharges(selectedIds, {
          id: user?.id,
          name: user?.name,
          email: user?.email,
        }, reason);

        if (res.succeeded.length > 0) {
          toast({
            title: `Rejected ${res.succeeded.length} Transactions`,
            description: `Rejection recorded with reason: "${reason}".`,
          });
        }
        if (res.failed.length > 0) {
          toast({
            title: `${res.failed.length} Rejections Failed`,
            description: res.failed.map((f) => f.error).join(", "),
            variant: "destructive",
          });
        }

        setSelectedIds([]);
        loadData(true);
      } finally {
        setIsBulkProcessing(false);
      }
    } else if (rejectingTx) {
      setProcessingId(rejectingTx.id);
      try {
        const res = await rejectRechargeTransaction(rejectingTx.id, {
          id: user?.id,
          name: user?.name,
          email: user?.email,
        }, reason);

        if (res.success) {
          toast({
            title: "Transaction Rejected",
            description: `Recharge for ${rejectingTx.branch} marked as rejected. Reason: "${reason}".`,
          });

          if (proofModalOpen && selectedProofTx?.id === rejectingTx.id) {
            setProofModalOpen(false);
          }

          setSelectedIds((prev) => prev.filter((id) => id !== rejectingTx.id));
          loadData(true);
        } else {
          // Thrown, not just toasted, so the reason box stays open with what was
          // typed still in it instead of closing and losing the text.
          throw new Error(res.error || "Could not reject transaction.");
        }
      } catch (err) {
        toast({
          title: "Rejection Failed",
          description: err instanceof Error ? err.message : "Error rejecting transaction.",
          variant: "destructive",
        });
        throw err;
      } finally {
        setProcessingId(null);
      }
    }
  };

  // Bulk Approve Action
  const handleBulkApprove = async () => {
    if (selectedIds.length === 0) return;
    setIsBulkProcessing(true);

    try {
      const res = await bulkApproveRecharges(selectedIds, {
        id: user?.id,
        name: user?.name,
        email: user?.email,
      });

      if (res.succeeded.length > 0) {
        const totalCredited = res.succeeded.reduce((sum, item) => sum + item.amount, 0);
        toast({
          title: `Bulk Approval Successful`,
          description: `Approved ${res.succeeded.length} transactions totaling ₹${totalCredited.toLocaleString("en-IN")}.`,
        });
      }

      if (res.failed.length > 0) {
        toast({
          title: `${res.failed.length} Transactions Failed`,
          description: res.failed.map((f) => f.error).slice(0, 3).join(", "),
          variant: "destructive",
        });
      }

      setSelectedIds([]);
      loadData(true);
    } catch (err) {
      toast({
        title: "Bulk Approval Error",
        description: err instanceof Error ? err.message : "Could not complete bulk approval.",
        variant: "destructive",
      });
    } finally {
      setIsBulkProcessing(false);
    }
  };

  // Checkbox selection helpers
  const pendingTransactionsOnPage = transactions.filter((t) => t.status === "PENDING");
  const allPagePendingSelected =
    pendingTransactionsOnPage.length > 0 &&
    pendingTransactionsOnPage.every((t) => selectedIds.includes(t.id));

  const toggleSelectAllPagePending = () => {
    if (allPagePendingSelected) {
      const pageIds = new Set(pendingTransactionsOnPage.map((t) => t.id));
      setSelectedIds((prev) => prev.filter((id) => !pageIds.has(id)));
    } else {
      const newIds = new Set([...selectedIds, ...pendingTransactionsOnPage.map((t) => t.id)]);
      setSelectedIds(Array.from(newIds));
    }
  };

  const toggleSelectRow = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  // Clear all filters
  const clearAllFilters = () => {
    setSearchInput("");
    setDebouncedSearch("");
    setSelectedBranch("all");
    setSelectedMethod("all");
    setDateFilter("all");
    setCurrentPage(1);
    setSelectedIds([]);
  };

  const hasActiveFilters =
    debouncedSearch !== "" ||
    selectedBranch !== "all" ||
    selectedMethod !== "all" ||
    dateFilter !== "all";

  // Sorting helper
  const handleSort = (column: "createdAt" | "amount" | "branch" | "status") => {
    if (sortBy === column) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(column);
      setSortOrder("asc");
    }
  };

  // CSV Export
  const handleExport = () => {
    downloadCsv(
      `wallet-ledger-${statusTab.toLowerCase()}-${new Date().toISOString().slice(0, 10)}.csv`,
      transactions.map((tx) => ({
        "Transaction ID": tx.id,
        Date: tx.formattedDateTime,
        Branch: tx.branch,
        "Branch Code": tx.branchCode,
        Amount: tx.amount,
        "Payment Method": tx.paymentMethod,
        "UTR / Reference": tx.reference,
        "Submitted By": tx.submittedBy,
        Status: tx.status,
        "Reviewed By": tx.reviewedBy || "—",
        "Reviewed At": tx.reviewedAt || "—",
        "Balance After": tx.balanceAfter,
        Remarks: tx.remarks || "",
        "Rejection Reason": tx.rejectionReason || "",
      }))
    );
    toast({
      title: "Ledger Exported",
      description: `Downloaded ${transactions.length} rows to CSV.`,
    });
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Selected totals for bulk toolbar
  const selectedTotalAmount = useMemo(() => {
    return transactions
      .filter((t) => selectedIds.includes(t.id))
      .reduce((sum, t) => sum + t.amount, 0);
  }, [transactions, selectedIds]);

  return (
    <AppLayout>
      <PageHeader
        title="Wallet Recharge & Transaction Ledger"
        description="High-volume institutional wallet ledger, top-up requests, and audit approvals"
        breadcrumbs={[
          { label: "Branch Management", href: "/branch/view" },
          { label: "Wallet Recharge & Ledger" },
        ]}
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="gap-1.5 h-8 text-xs"
              onClick={() => loadData(true)}
              disabled={loading || refreshing}
            >
              <RefreshCw
                className={`h-3.5 w-3.5 ${refreshing ? "animate-spin" : ""}`}
              />
              <span>Refresh</span>
            </Button>

            <Button
              variant="outline"
              size="sm"
              className="gap-1.5 h-8 text-xs"
              onClick={handleExport}
              disabled={transactions.length === 0}
            >
              <Download className="h-3.5 w-3.5" />
              <span>Export CSV</span>
            </Button>

            {/* Whose UPI every branch is told to pay into. An administrator's
                setting, so it is not offered to the branches paying it. */}
            {canApprove && (
              <Button
                variant="outline"
                size="sm"
                className="gap-1.5 h-8 text-xs"
                onClick={() => setUpiDialogOpen(true)}
              >
                <QrCode className="h-3.5 w-3.5" />
                <span>Payment account</span>
              </Button>
            )}

            <Button
              size="sm"
              className="gap-1.5 h-8 text-xs bg-primary text-primary-foreground shadow-sm"
              onClick={() => setRechargeDrawerOpen(true)}
            >
              <Plus className="h-3.5 w-3.5" />
              <span>+ New Recharge</span>
            </Button>
          </div>
        }
      />

      {/* Executive Compact KPI Summary */}
      <div className="grid gap-3 grid-cols-2 lg:grid-cols-4 mb-4">
        <StatsCard
          title={canApprove ? "Total Wallet Balance" : "My Wallet Balance"}
          value={inr(totals.totalBalance)}
          subtitle={
            canApprove
              ? `${institutes.length} active branches`
              : institutes.find((i) => i.id === branchId)?.name || "This branch"
          }
          icon={Wallet}
        />
        <StatsCard
          title="Approved This Month"
          value={inr(totals.approvedAmount)}
          subtitle={`${statusCounts.approved} recharges credited`}
          icon={CreditCard}
        />
        <StatsCard
          title="Pending Approval"
          value={String(statusCounts.pending)}
          subtitle={`${inr(totals.pendingAmount)} awaiting review`}
          icon={Clock}
          className={
            statusCounts.pending > 0
              ? "border-amber-300 bg-amber-50/30 dark:bg-amber-950/10"
              : ""
          }
        />
        <StatsCard
          title="Total Transactions"
          value={String(statusCounts.all)}
          subtitle={`${statusCounts.rejected} rejected requests`}
          icon={History}
        />
      </div>

      {/* Full Width Ledger Console Container */}
      <div className="space-y-3">
        {/* Status Tabs Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b pb-2">
          <div className="flex items-center gap-1.5 bg-muted/60 p-1 rounded-lg border text-xs">
            <button
              type="button"
              onClick={() => handleTabChange("PENDING")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-medium transition-all ${
                statusTab === "PENDING"
                  ? "bg-background text-foreground shadow-sm font-semibold"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <span>Pending Approval</span>
              {statusCounts.pending > 0 && (
                <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-amber-500 text-white">
                  {statusCounts.pending}
                </span>
              )}
            </button>

            <button
              type="button"
              onClick={() => handleTabChange("ALL")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-medium transition-all ${
                statusTab === "ALL"
                  ? "bg-background text-foreground shadow-sm font-semibold"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <span>All Transactions</span>
              <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-muted font-semibold text-muted-foreground">
                {statusCounts.all}
              </span>
            </button>

            <button
              type="button"
              onClick={() => handleTabChange("COMPLETED")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-medium transition-all ${
                statusTab === "COMPLETED"
                  ? "bg-background text-foreground shadow-sm font-semibold"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <span>Approved</span>
              <span className="px-1.5 py-0.2 rounded-full text-[10px] font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300">
                {statusCounts.approved}
              </span>
            </button>

            <button
              type="button"
              onClick={() => handleTabChange("FAILED")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-medium transition-all ${
                statusTab === "FAILED"
                  ? "bg-background text-foreground shadow-sm font-semibold"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <span>Rejected</span>
              <span className="px-1.5 py-0.2 rounded-full text-[10px] font-semibold bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300">
                {statusCounts.rejected}
              </span>
            </button>
          </div>

          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            {statusTab === "PENDING" && (
              <span className="flex items-center gap-1 text-amber-600 dark:text-amber-400 font-medium">
                <Clock className="h-3.5 w-3.5" /> Showing oldest pending first
              </span>
            )}
            <span className="hidden sm:inline">
              Showing {transactions.length} of {totalCount} records
            </span>
          </div>
        </div>

        {/* High-Volume Filter Toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-2.5 p-2.5 rounded-lg border bg-card/60">
          <div className="flex flex-wrap items-center gap-2 flex-1 min-w-[280px]">
            {/* Search */}
            <div className="relative flex-1 min-w-[200px] max-w-sm">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              <Input
                placeholder="Search TXN ID, branch, UTR, submitter..."
                className="pl-8 h-8 text-xs"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
              />
            </div>

            {/* Branch Filter. A branch only ever sees its own rows -- the
                policy on branch_transactions decides that, not this control --
                so offering it every branch in the organisation only invites
                picking one that returns an empty table. */}
            {canApprove && (
              <Select value={selectedBranch} onValueChange={(v) => { setSelectedBranch(v); setCurrentPage(1); }}>
                <SelectTrigger className="h-8 w-[160px] text-xs">
                  <SelectValue placeholder="All Branches" />
                </SelectTrigger>
                <SelectContent searchable searchPlaceholder="Search centre…">
                  <SelectItem value="all">All Branches</SelectItem>
                  {institutes.map((inst) => (
                    <SelectItem key={inst.id} value={inst.id}>
                      {inst.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}

            {/* Payment Method Filter */}
            <Select value={selectedMethod} onValueChange={(v) => { setSelectedMethod(v); setCurrentPage(1); }}>
              <SelectTrigger className="h-8 w-[130px] text-xs">
                <SelectValue placeholder="All Methods" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Methods</SelectItem>
                <SelectItem value="UPI">UPI</SelectItem>
                <SelectItem value="CARD">Credit/Debit Card</SelectItem>
                <SelectItem value="NET_BANKING">Net Banking</SelectItem>
              </SelectContent>
            </Select>

            {/* Date Range Filter */}
            <Select value={dateFilter} onValueChange={(v) => { setDateFilter(v as DateFilter); setCurrentPage(1); }}>
              <SelectTrigger className="h-8 w-[120px] text-xs">
                <SelectValue placeholder="All Time" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Time</SelectItem>
                <SelectItem value="today">Today</SelectItem>
                <SelectItem value="week">Last 7 Days</SelectItem>
                <SelectItem value="month">This Month</SelectItem>
              </SelectContent>
            </Select>

            {hasActiveFilters && (
              <Button
                variant="ghost"
                size="sm"
                className="h-8 px-2 text-xs text-muted-foreground hover:text-foreground gap-1"
                onClick={clearAllFilters}
              >
                <FilterX className="h-3.5 w-3.5" />
                <span>Clear</span>
              </Button>
            )}
          </div>

          {/* Rows Per Page */}
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <span>Rows:</span>
            <Select
              value={String(pageSize)}
              onValueChange={(v) => {
                setPageSize(Number(v));
                setCurrentPage(1);
              }}
            >
              <SelectTrigger className="h-8 w-[70px] text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="25">25</SelectItem>
                <SelectItem value="50">50</SelectItem>
                <SelectItem value="100">100</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Sticky Bulk Actions Toolbar (Active when >=1 row selected) */}
        {selectedIds.length > 0 && canApprove && (
          <div className="sticky top-2 z-20 flex flex-wrap items-center justify-between gap-3 p-3 rounded-lg border bg-primary/10 border-primary/30 shadow-md backdrop-blur">
            <div className="flex items-center gap-2 text-xs font-semibold text-foreground">
              <span className="px-2 py-0.5 rounded bg-primary text-primary-foreground font-mono">
                {selectedIds.length}
              </span>
              <span>Recharge requests selected</span>
              <span className="text-muted-foreground font-normal">
                (Total: <strong className="text-foreground font-mono">₹{selectedTotalAmount.toLocaleString("en-IN")}</strong>)
              </span>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                className="h-7 text-xs"
                onClick={() => setSelectedIds([])}
                disabled={isBulkProcessing}
              >
                Deselect All
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="h-7 text-xs border-destructive/40 text-destructive hover:bg-destructive hover:text-white"
                onClick={handleOpenBulkReject}
                disabled={isBulkProcessing}
              >
                <XCircle className="h-3.5 w-3.5 mr-1" />
                Reject Selected
              </Button>
              <Button
                size="sm"
                className="h-7 text-xs bg-emerald-600 hover:bg-emerald-700 text-white"
                onClick={handleBulkApprove}
                disabled={isBulkProcessing}
              >
                <CheckCircle2 className="h-3.5 w-3.5 mr-1" />
                Approve Selected ({selectedIds.length})
              </Button>
            </div>
          </div>
        )}

        {/* Dense Ledger Data Grid (1 Row Per Transaction) */}
        <div className="rounded-lg border bg-card overflow-hidden shadow-sm">
          <div className="relative overflow-x-auto max-h-[640px]">
            <Table className="w-full text-xs">
              <TableHeader className="sticky top-0 bg-muted/80 backdrop-blur z-10 border-b">
                <TableRow className="hover:bg-transparent">
                  {/* Bulk Select Checkbox Header */}
                  <TableHead className="w-10 text-center px-3">
                    <Checkbox
                      checked={allPagePendingSelected}
                      onCheckedChange={toggleSelectAllPagePending}
                      aria-label="Select all pending transactions on this page"
                      disabled={pendingTransactionsOnPage.length === 0}
                    />
                  </TableHead>

                  {/* Date & Time */}
                  <TableHead
                    className="cursor-pointer hover:text-foreground whitespace-nowrap min-w-[130px]"
                    onClick={() => handleSort("createdAt")}
                  >
                    <div className="flex items-center gap-1">
                      <span>Date & Time</span>
                      {sortBy === "createdAt" ? (
                        sortOrder === "asc" ? (
                          <ArrowUp className="h-3 w-3" />
                        ) : (
                          <ArrowDown className="h-3 w-3" />
                        )
                      ) : (
                        <ArrowUpDown className="h-3 w-3 opacity-40" />
                      )}
                    </div>
                  </TableHead>

                  {/* Institute / Branch */}
                  <TableHead
                    className="cursor-pointer hover:text-foreground whitespace-nowrap min-w-[160px]"
                    onClick={() => handleSort("branch")}
                  >
                    <div className="flex items-center gap-1">
                      <span>Institute / Branch</span>
                      {sortBy === "branch" && (
                        sortOrder === "asc" ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />
                      )}
                    </div>
                  </TableHead>

                  {/* Transaction ID */}
                  <TableHead className="whitespace-nowrap min-w-[100px]">
                    Transaction ID
                  </TableHead>

                  {/* Amount */}
                  <TableHead
                    className="cursor-pointer hover:text-foreground text-right whitespace-nowrap min-w-[90px]"
                    onClick={() => handleSort("amount")}
                  >
                    <div className="flex items-center justify-end gap-1">
                      <span>Amount</span>
                      {sortBy === "amount" && (
                        sortOrder === "asc" ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />
                      )}
                    </div>
                  </TableHead>

                  {/* Payment Method */}
                  <TableHead className="whitespace-nowrap min-w-[90px]">
                    Method
                  </TableHead>

                  {/* UTR / Reference */}
                  <TableHead className="whitespace-nowrap min-w-[130px]">
                    UTR / Reference No.
                  </TableHead>

                  {/* Payment Proof */}
                  <TableHead className="text-center whitespace-nowrap min-w-[80px]">
                    Proof
                  </TableHead>

                  {/* Submitted By */}
                  <TableHead className="whitespace-nowrap min-w-[110px]">
                    Submitted By
                  </TableHead>

                  {/* Status */}
                  <TableHead
                    className="cursor-pointer hover:text-foreground whitespace-nowrap min-w-[90px]"
                    onClick={() => handleSort("status")}
                  >
                    <div className="flex items-center gap-1">
                      <span>Status</span>
                      {sortBy === "status" && (
                        sortOrder === "asc" ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />
                      )}
                    </div>
                  </TableHead>

                  {/* Approved / Rejected By */}
                  <TableHead className="whitespace-nowrap min-w-[130px]">
                    Reviewed By
                  </TableHead>

                  {/* Action */}
                  <TableHead className="text-right whitespace-nowrap min-w-[150px] pr-4">
                    Action
                  </TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={12} className="h-36 text-center text-muted-foreground">
                      <div className="flex flex-col items-center justify-center gap-2">
                        <RefreshCw className="h-5 w-5 animate-spin text-primary" />
                        <span>Loading transactions from ledger...</span>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : transactions.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={12} className="h-36 text-center text-muted-foreground">
                      <div className="flex flex-col items-center justify-center gap-1.5 py-4">
                        <AlertCircle className="h-7 w-7 text-muted-foreground/50" />
                        <span className="font-semibold text-sm text-foreground">
                          No transactions found
                        </span>
                        <span className="text-xs max-w-sm">
                          {hasActiveFilters
                            ? "No recharge records matched the current filters. Try resetting the filters."
                            : statusTab === "PENDING"
                            ? "There are currently no pending recharge requests awaiting approval."
                            : "No transaction records exist for this view."}
                        </span>
                        {hasActiveFilters && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="mt-2 text-xs h-7"
                            onClick={clearAllFilters}
                          >
                            Clear Filters
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  transactions.map((tx) => {
                    const isPending = tx.status === "PENDING";
                    const isApproved = tx.status === "COMPLETED";
                    const isRejected = tx.status === "FAILED";
                    const isSelected = selectedIds.includes(tx.id);

                    return (
                      <TableRow
                        key={tx.id}
                        className={`transition-colors h-11 ${
                          isSelected
                            ? "bg-primary/5 hover:bg-primary/10"
                            : isPending
                            ? "hover:bg-amber-50/40 dark:hover:bg-amber-950/20"
                            : "hover:bg-muted/40"
                        }`}
                      >
                        {/* Checkbox */}
                        <TableCell className="text-center px-3 py-1.5">
                          {isPending ? (
                            <Checkbox
                              checked={isSelected}
                              onCheckedChange={() => toggleSelectRow(tx.id)}
                              aria-label={`Select transaction ${tx.id}`}
                            />
                          ) : (
                            <span className="inline-block w-4 h-4 text-muted-foreground/30 font-mono text-[10px]">
                              —
                            </span>
                          )}
                        </TableCell>

                        {/* Date & Time */}
                        <TableCell className="whitespace-nowrap py-1.5 font-medium">
                          {tx.formattedDateTime}
                        </TableCell>

                        {/* Institute / Branch */}
                        <TableCell className="py-1.5 whitespace-nowrap">
                          <div className="font-semibold text-foreground truncate max-w-[180px]">
                            {tx.branch}
                          </div>
                          {tx.branchCode && (
                            <span className="text-[10px] text-muted-foreground font-mono">
                              {tx.branchCode}
                            </span>
                          )}
                        </TableCell>

                        {/* Transaction ID */}
                        <TableCell className="py-1.5 whitespace-nowrap">
                          <button
                            type="button"
                            onClick={() => copyToClipboard(tx.id, tx.id)}
                            className="font-mono text-[11px] text-muted-foreground hover:text-foreground flex items-center gap-1 group"
                            title="Click to copy ID"
                          >
                            <span>{tx.id.length > 12 ? `${tx.id.slice(0, 10)}...` : tx.id}</span>
                            {copiedId === tx.id ? (
                              <Check className="h-3 w-3 text-emerald-600" />
                            ) : (
                              <Copy className="h-2.5 w-2.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                            )}
                          </button>
                        </TableCell>

                        {/* Amount */}
                        <TableCell className="text-right py-1.5 whitespace-nowrap">
                          {/* A debit (a certificate fee) left the wallet. */}
                          <span className={`font-mono font-bold text-xs ${tx.type === "debit" ? "text-rose-600" : "text-foreground"}`}>
                            {tx.type === "debit" ? "−" : ""}₹{tx.amount.toLocaleString("en-IN")}
                          </span>
                        </TableCell>

                        {/* Payment Method */}
                        <TableCell className="py-1.5 whitespace-nowrap">
                          <Badge variant="outline" className="text-[10px] uppercase font-medium px-1.5 py-0">
                            {tx.paymentMethod}
                          </Badge>
                        </TableCell>

                        {/* UTR / Reference */}
                        <TableCell className="py-1.5 whitespace-nowrap">
                          <div className="flex items-center gap-1">
                            <span className="font-mono text-[11px] font-medium text-foreground">
                              {tx.reference}
                            </span>
                            <button
                              type="button"
                              onClick={() => copyToClipboard(tx.reference, `utr-${tx.id}`)}
                              className="text-muted-foreground hover:text-foreground"
                              title="Copy UTR"
                            >
                              {copiedId === `utr-${tx.id}` ? (
                                <Check className="h-3 w-3 text-emerald-600" />
                              ) : (
                                <Copy className="h-2.5 w-2.5 opacity-60 hover:opacity-100" />
                              )}
                            </button>
                          </div>
                        </TableCell>

                        {/* Payment Proof */}
                        <TableCell className="text-center py-1.5 whitespace-nowrap">
                          {tx.proofUrl ? (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-6 px-1.5 text-[11px] text-primary hover:text-primary gap-1"
                              onClick={() => {
                                setSelectedProofTx(tx);
                                setProofModalOpen(true);
                              }}
                            >
                              <Eye className="h-3 w-3" />
                              <span>View</span>
                            </Button>
                          ) : (
                            <span className="text-muted-foreground text-[10px] italic">
                              None
                            </span>
                          )}
                        </TableCell>

                        {/* Submitted By */}
                        <TableCell className="py-1.5 whitespace-nowrap">
                          <span className="text-foreground">{tx.submittedBy}</span>
                        </TableCell>

                        {/* Status */}
                        <TableCell className="py-1.5 whitespace-nowrap">
                          <Badge
                            variant={
                              isApproved
                                ? "default"
                                : isPending
                                ? "secondary"
                                : "destructive"
                            }
                            className={`text-[10px] font-semibold px-2 py-0 ${
                              isApproved
                                ? "bg-emerald-600 hover:bg-emerald-600 text-white"
                                : isPending
                                ? "bg-amber-100 text-amber-900 border-amber-300 dark:bg-amber-950/60 dark:text-amber-300"
                                : "bg-rose-600 hover:bg-rose-600 text-white"
                            }`}
                          >
                            {tx.type === "debit" ? "Deducted" : isApproved ? "Approved" : isPending ? "Pending" : "Rejected"}
                          </Badge>
                        </TableCell>

                        {/* Approved / Rejected By */}
                        <TableCell className="py-1.5 whitespace-nowrap text-muted-foreground text-[11px]">
                          {tx.reviewedBy ? (
                            <div>
                              <span className="font-medium text-foreground block">
                                {tx.reviewedBy}
                              </span>
                              {tx.reviewedAt && (
                                <span className="text-[10px] font-mono">
                                  {new Date(tx.reviewedAt).toLocaleDateString("en-IN")}
                                </span>
                              )}
                            </div>
                          ) : (
                            <span className="text-muted-foreground/60">—</span>
                          )}
                        </TableCell>

                        {/* Actions Column */}
                        <TableCell className="text-right py-1.5 whitespace-nowrap pr-4">
                          {isPending && canApprove ? (
                            <div className="flex items-center justify-end gap-1.5">
                              <Button
                                size="sm"
                                variant="outline"
                                className="h-7 px-2 text-xs border-destructive/40 text-destructive hover:bg-destructive hover:text-white"
                                disabled={processingId === tx.id}
                                onClick={() => handleOpenReject(tx)}
                              >
                                <XCircle className="h-3.5 w-3.5 mr-1" />
                                Reject
                              </Button>

                              <Button
                                size="sm"
                                className="h-7 px-2 text-xs bg-emerald-600 hover:bg-emerald-700 text-white"
                                disabled={processingId === tx.id}
                                onClick={() => handleApprove(tx)}
                              >
                                <CheckCircle2 className="h-3.5 w-3.5 mr-1" />
                                Approve
                              </Button>
                            </div>
                          ) : isPending ? (
                            <span className="text-xs text-muted-foreground">Awaiting approval</span>
                          ) : (
                            <div className="flex items-center justify-end gap-1.5">
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-7 px-2 text-xs text-muted-foreground hover:text-foreground gap-1"
                                onClick={() => {
                                  setSelectedAuditTx(tx);
                                  setAuditDrawerOpen(true);
                                }}
                              >
                                <History className="h-3 w-3" />
                                <span>Audit</span>
                              </Button>
                              {tx.proofUrl && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="h-7 px-2 text-xs"
                                  onClick={() => {
                                    setSelectedProofTx(tx);
                                    setProofModalOpen(true);
                                  }}
                                >
                                  Proof
                                </Button>
                              )}
                            </div>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination Controls */}
          <div className="flex flex-wrap items-center justify-between gap-3 p-3 border-t bg-muted/20 text-xs">
            <div className="text-muted-foreground">
              Page <span className="font-semibold text-foreground">{currentPage}</span> of{" "}
              <span className="font-semibold text-foreground">{totalPages}</span> (
              {totalCount} total transactions)
            </div>

            <div className="flex items-center gap-1">
              <Button
                variant="outline"
                size="sm"
                className="h-7 w-7 p-0"
                onClick={() => setCurrentPage(1)}
                disabled={currentPage <= 1 || loading}
                title="First Page"
              >
                <ChevronsLeft className="h-3.5 w-3.5" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="h-7 w-7 p-0"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage <= 1 || loading}
                title="Previous Page"
              >
                <ChevronLeft className="h-3.5 w-3.5" />
              </Button>

              <span className="px-2 text-xs font-medium font-mono">
                {currentPage} / {totalPages}
              </span>

              <Button
                variant="outline"
                size="sm"
                className="h-7 w-7 p-0"
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage >= totalPages || loading}
                title="Next Page"
              >
                <ChevronRight className="h-3.5 w-3.5" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="h-7 w-7 p-0"
                onClick={() => setCurrentPage(totalPages)}
                disabled={currentPage >= totalPages || loading}
                title="Last Page"
              >
                <ChevronsRight className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Modal / Drawer Integrations */}
      <RechargeUpiDialog
        open={upiDialogOpen}
        onOpenChange={setUpiDialogOpen}
        organizationId={user?.organizationId ?? null}
      />

      <RechargeDrawer
        open={rechargeDrawerOpen}
        onOpenChange={setRechargeDrawerOpen}
        institutes={institutes}
        user={user}
        // An administrator tops up whichever branch it likes; a branch may only
        // file against its own, so it is handed that one rather than a picker.
        fixedInstituteId={canApprove ? null : branchId}
        onSuccess={() => {
          setStatusTab("PENDING");
          setSortBy("createdAt");
          setSortOrder("asc");
          setCurrentPage(1);
          loadData(true);
        }}
      />

      <PaymentProofModal
        open={proofModalOpen}
        onOpenChange={setProofModalOpen}
        transaction={selectedProofTx}
        onApprove={canApprove ? handleApprove : undefined}
        onReject={canApprove ? handleOpenReject : undefined}
        isProcessing={processingId === selectedProofTx?.id}
      />

      <RejectReasonDialog
        open={rejectDialogOpen}
        onOpenChange={setRejectDialogOpen}
        onConfirm={handleConfirmReject}
        count={isBulkReject ? selectedIds.length : 1}
        transactionReference={rejectingTx?.reference}
        isProcessing={isBulkProcessing || processingId !== null}
      />

      <TransactionAuditDrawer
        open={auditDrawerOpen}
        onOpenChange={setAuditDrawerOpen}
        transaction={selectedAuditTx}
      />
    </AppLayout>
  );
}
