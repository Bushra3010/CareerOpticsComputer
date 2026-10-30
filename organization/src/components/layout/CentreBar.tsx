import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Wallet } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { WALLET_CHANGED, getCentreSummary, type CentreSummary } from "@/lib/supabase/data";

const inr = (n: number) => `₹${n.toLocaleString("en-IN")}`;

/**
 * A centre's own panel -- and the head office working as one through "Login
 * as center" -- carries the centre's name, ID, licence validity and wallet
 * balance in the header. The balance opens the wallet, and re-reads whenever
 * something (a certificate) has just been paid from it.
 */
export function CentreBar() {
  const { view, branchId } = useAuth();
  const [centre, setCentre] = useState<CentreSummary | null>(null);

  useEffect(() => {
    if (view !== "franchise" || !branchId) return setCentre(null);
    let cancelled = false;
    const load = () =>
      getCentreSummary(branchId)
        .then((c) => { if (!cancelled) setCentre(c); })
        .catch(() => { if (!cancelled) setCentre(null); });
    void load();
    window.addEventListener(WALLET_CHANGED, load);
    return () => {
      cancelled = true;
      window.removeEventListener(WALLET_CHANGED, load);
    };
  }, [view, branchId]);

  if (!centre) return null;
  const expired = centre.validUpto ? new Date(centre.validUpto) < new Date() : false;
  const valid = centre.validUpto
    ? new Date(centre.validUpto).toLocaleDateString("en-IN", { day: "2-digit", month: "2-digit", year: "numeric" })
    : null;

  return (
    <div className="flex min-w-0 items-center gap-2">
      <div className="hidden min-w-0 xl:block">
        <p className="truncate text-sm font-semibold leading-tight">{centre.name}</p>
        <p className="flex flex-wrap items-center gap-1.5 text-[11px] text-muted-foreground">
          {centre.code && <span className="rounded-md bg-primary/10 px-1.5 py-px font-semibold text-primary">ID {centre.code}</span>}
          {valid && <span className={`rounded-md px-1.5 py-px font-semibold ${expired ? "bg-destructive/10 text-destructive" : "bg-sky-500/10 text-sky-700 dark:text-sky-300"}`}>Valid upto {valid}</span>}
          <span className={`rounded-md px-1.5 py-px font-semibold ${centre.isActive ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300" : "bg-destructive/10 text-destructive"}`}>{centre.isActive ? "Active" : "Inactive"}</span>
        </p>
      </div>
      <Link
        to="/branch/wallet"
        className="press flex h-10 shrink-0 items-center gap-2 rounded-xl bg-card px-3 text-sm shadow-card transition hover:shadow-md"
        aria-label={`My wallet, balance ${inr(centre.balance)}`}
      >
        <Wallet className="h-4 w-4 text-primary" />
        <span className="font-bold tabular-nums">{inr(centre.balance)}</span>
        <span className="hidden text-xs text-muted-foreground sm:inline">My Wallet</span>
      </Link>
    </div>
  );
}
