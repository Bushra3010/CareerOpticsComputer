import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { AppLayout } from "@/components/layout/AppLayout";
import {
  DCE,
  DceBadge,
  DceButton,
  DceInput,
  DcePanel,
  DceSelect,
  DceTable,
  inr,
  shortDate,
  type DceColumn,
} from "@/components/dce/Dce";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { useBranchOptions } from "@/lib/supabase/centrePanel";
import {
  WALLET_CHANGED,
  getWallet,
  getWalletTransactions,
  type WalletTransactionItem,
} from "@/lib/supabase/data";

const STATUS_LABEL: Record<WalletTransactionItem["status"], string> = { COMPLETED: "PAID", PENDING: "PENDING", FAILED: "REJECTED" };

/**
 * Categories are written by several SQL migrations as SCREAMING_CASE. A
 * CERTIFICATE_ORDER credit is the refund of a rejected order's charge
 * (certificate-order-wallet.sql), which "Certificate order" alone would hide.
 */
function categoryLabel(r: Pick<WalletTransactionItem, "category" | "type">): string {
  if (r.category === "CERTIFICATE_ORDER") return r.type === "credit" ? "Certificate order refund" : "Certificate order";
  const words = r.category.replaceAll("_", " ").toLowerCase();
  return words.charAt(0).toUpperCase() + words.slice(1);
}

/**
 * "Manage Wallet": the balance, the history of every credit and debit, and a
 * way to top up. Payment itself stays on the existing recharge page
 * (/branch/wallet), which handles the UPI request and proof upload.
 */
export default function CentreWallet() {
  const { branchId, organizationId } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const isAdmin = !branchId;
  const branches = useBranchOptions(organizationId, isAdmin);
  const [picked, setPicked] = useState("");
  const target = branchId || picked || null;

  const [balance, setBalance] = useState<number | null>(null);
  const [rows, setRows] = useState<WalletTransactionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [amount, setAmount] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [wallet, history] = await Promise.all([
        target ? getWallet(target) : Promise.resolve({ data: null }),
        getWalletTransactions({ branchId: target, organizationId: target ? null : organizationId, pageSize: 1000 }),
      ]);
      setBalance(target ? Number((wallet.data as { balance?: number } | null)?.balance) || 0 : null);
      setRows(history.data || []);
    } catch (error) {
      toast({ title: "Could not load the wallet", description: (error as Error).message, variant: "destructive" });
      setRows([]);
    } finally {
      setLoading(false);
    }
  }, [target, organizationId, toast]);

  useEffect(() => {
    void load();
  }, [load]);

  // Anything else that moves the wallet (a certificate fee, an approved recharge) re-reads it.
  useEffect(() => {
    const reload = () => void load();
    window.addEventListener(WALLET_CHANGED, reload);
    return () => window.removeEventListener(WALLET_CHANGED, reload);
  }, [load]);

  const payNow = () => {
    const value = Number(amount);
    if (amount && !(value > 0)) return toast({ title: "Enter an amount above zero", variant: "destructive" });
    navigate(value > 0 ? `/branch/wallet?amount=${encodeURIComponent(String(value))}` : "/branch/wallet");
  };

  const columns: DceColumn<WalletTransactionItem>[] = [
    { key: "n", label: "#", render: (_r, i) => i + 1 },
    ...(isAdmin && !target ? [{ key: "branch", label: "Branch", render: (r: WalletTransactionItem) => r.branch }] : []),
    {
      key: "type",
      label: "Type",
      render: (r) => (
        <div>
          <span className={r.type === "credit" ? "font-semibold text-[#2fb878]" : "font-semibold text-[#e45454]"}>{r.type === "credit" ? "Credit" : "Debit"}</span>
          <p className="text-[11.5px] text-slate-500">{categoryLabel(r)}</p>
        </div>
      ),
    },
    {
      key: "amount",
      label: "Amount",
      render: (r) => (
        <span className={r.type === "credit" ? "font-semibold text-[#2fb878]" : "font-semibold text-[#e45454]"}>
          {r.type === "debit" ? "−" : "+"}
          {inr(r.amount)}
        </span>
      ),
    },
    { key: "paid", label: "Paid / Discount", render: (r) => <DceBadge status={r.status === "COMPLETED" ? "PAID" : r.status === "FAILED" ? "REJECTED" : "PENDING"} label={STATUS_LABEL[r.status]} /> },
    { key: "reference", label: "Reference", render: (r) => <span className="break-all font-mono text-[12px]">{r.reference}</span> },
    {
      key: "incident",
      label: "Incident",
      render: (r) => (
        <div>
          <p className="text-slate-700">{r.description}</p>
          <p className="text-[11.5px] text-slate-500">{r.formattedDateTime !== "—" ? r.formattedDateTime : shortDate(r.createdAt)}</p>
        </div>
      ),
    },
  ];

  return (
    <AppLayout>
      <div className="space-y-5">
        {isAdmin && (
          <div className="max-w-xs">
            <DceSelect value={picked} onChange={(e) => setPicked(e.target.value)} aria-label="Branch">
              <option value="">All branches</option>
              {branches.map((b) => (
                <option key={b.id} value={b.id}>{b.name}</option>
              ))}
            </DceSelect>
          </div>
        )}

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-sm p-5 text-white shadow-sm" style={{ background: DCE.teal }}>
            <p className="text-[13px] font-semibold uppercase opacity-90">Current Balance</p>
            <p className="mt-1 text-3xl font-bold" aria-label="Wallet balance">
              {balance === null ? "—" : inr(balance)}
            </p>
            {balance === null && <p className="mt-1 text-[12px] opacity-90">Choose a branch to see its balance.</p>}
          </div>
          <div className="rounded-sm bg-white p-5 shadow-sm">
            <p className="mb-2 text-[13px] font-semibold text-slate-700">Recharge Wallet</p>
            <div className="flex gap-2">
              <DceInput type="number" min="1" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="Amount" aria-label="Recharge amount" />
              <DceButton tone="green" onClick={payNow}>Pay Now</DceButton>
            </div>
            <p className="mt-2 text-[11.5px] text-slate-500">Opens the recharge page to pay by UPI and upload the payment proof.</p>
          </div>
        </div>

        <DcePanel title="Manage Wallet">
          <DceTable columns={columns} rows={rows} rowKey={(r) => r.id} loading={loading} empty="No wallet transactions yet." />
        </DcePanel>
      </div>
    </AppLayout>
  );
}
