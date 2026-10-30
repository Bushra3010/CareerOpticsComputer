import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Save, Search, Wallet, X } from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { PageHeader } from "@/components/ui/PageHeader";
import { DataTable, type Column } from "@/components/ui/DataTable";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { canonicalState } from "@/data/indianStates";
import { matchesSearch } from "@/lib/search";
import {
  CHARGE_ITEMS,
  CHARGE_LABELS,
  effectiveRate,
  getBranchDirectory,
  getCentreCharges,
  getCentreRates,
  getWalletsByOrg,
  saveCentreRates,
  type CentreChargeRow,
  type CentreRates,
  type ChargeItem,
} from "@/lib/supabase/data";

const inr = (n: number) => `₹${n.toLocaleString("en-IN")}`;
type Draft = Record<string, Partial<Record<ChargeItem, string>>>;
type Centre = { id: string; name: string; code: string; state: string; district: string; block: string };

/** Radix Select needs a non-empty value for "no filter". */
const ALL = "all";
const distinct = (values: string[]) => [...new Set(values.map((v) => v.trim()).filter(Boolean))].sort((a, b) => a.localeCompare(b));
const same = (a: string, b: string) => a.trim().toLowerCase() === b.trim().toLowerCase();

/**
 * What each centre pays from its wallet, decided by the head office in one
 * place: a rate for every centre, a centre's own rate where it differs, and
 * the record of what has been taken. A centre sees its own rates and charges.
 */
export default function CentreCharges() {
  const { user, view, branchId } = useAuth();
  const { toast } = useToast();
  const isAdmin = view === "admin";
  const [branches, setBranches] = useState<Centre[]>([]);
  // Narrowing the centre-wise table only hides rows: every centre's typed
  // rate is still saved.
  const [query, setQuery] = useState("");
  const [stateFilter, setStateFilter] = useState(ALL);
  const [districtFilter, setDistrictFilter] = useState(ALL);
  const [blockFilter, setBlockFilter] = useState(ALL);
  const [balances, setBalances] = useState<Map<string, number>>(new Map());
  const [rates, setRates] = useState<CentreRates>(new Map());
  const [draft, setDraft] = useState<Draft>({});
  const [charges, setCharges] = useState<CentreChargeRow[]>([]);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [b, w, r, c] = await Promise.all([
        getBranchDirectory(user?.organizationId ?? null),
        getWalletsByOrg(user?.organizationId ?? null).catch(() => ({ data: [] as unknown[] })),
        getCentreRates(),
        getCentreCharges(isAdmin ? null : branchId),
      ]);
      const list = (b.data as Centre[]).filter((x) => isAdmin || x.id === branchId);
      setBranches(list);
      setBalances(new Map((w.data as Array<{ branchId: string; balance: number }>).map((x) => [String(x.branchId), Number(x.balance) || 0])));
      setRates(r);
      setCharges(c);
      const d: Draft = {};
      for (const [scope, items] of r) {
        d[scope] = Object.fromEntries(Object.entries(items).map(([k, v]) => [k, String(v)]));
      }
      setDraft(d);
    } catch (e) {
      toast({ title: "Could not load centre charges", description: e instanceof Error ? e.message : "", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }, [user?.organizationId, isAdmin, branchId, toast]);
  useEffect(() => {
    void load();
  }, [load]);

  const value = (scope: string, item: ChargeItem) => draft[scope]?.[item] ?? "";
  const setValue = (scope: string, item: ChargeItem, v: string) =>
    setDraft((d) => ({ ...d, [scope]: { ...(d[scope] || {}), [item]: v.replace(/[^\d.]/g, "") } }));
  const defaultOf = (item: ChargeItem) => Number(value("*", item)) || 0;

  const save = async () => {
    const changes: Array<{ scope: string; item: ChargeItem; amount: number | null }> = [];
    const scopes = ["*", ...branches.map((b) => b.id)];
    for (const scope of scopes) {
      for (const item of CHARGE_ITEMS) {
        const typed = value(scope, item).trim();
        const saved = rates.get(scope)?.[item];
        // A blank all-centres box that was never set stays unset (0 anyway).
        if (typed === "" && scope === "*" && saved === undefined) continue;
        const next = typed === "" ? (scope === "*" ? 0 : null) : Number(typed);
        if (next !== null && !Number.isFinite(next)) continue;
        if ((saved ?? null) === next) continue;
        changes.push({ scope, item, amount: next });
      }
    }
    if (!changes.length) return toast({ title: "Nothing changed" });
    setSaving(true);
    try {
      await saveCentreRates(changes, user?.name);
      toast({ title: "Centre charges saved", description: `${changes.length} rate(s) updated. They apply from the next admission, admit card, marksheet or certificate.` });
      await load();
    } catch (e) {
      toast({ title: "Could not save", description: e instanceof Error ? e.message : "", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const branchName = useMemo(() => new Map(branches.map((b) => [b.id, b.name])), [branches]);

  // State, then district, then block: each list offers only the places some
  // centre is recorded under, narrowed by the one above it.
  const states = useMemo(() => distinct(branches.map((b) => canonicalState(b.state))), [branches]);
  const inState = branches.filter((b) => stateFilter === ALL || canonicalState(b.state) === stateFilter);
  const districts = distinct(inState.map((b) => b.district));
  const inDistrict = inState.filter((b) => districtFilter === ALL || same(b.district, districtFilter));
  const blocks = distinct(inDistrict.map((b) => b.block));
  const inBlock = inDistrict.filter((b) => blockFilter === ALL || same(b.block, blockFilter));
  const needle = query.trim().toLowerCase();
  const shownCentres = inBlock.filter(
    (b) => matchesSearch([b.name, b.code, b.state, b.district, b.block].join(" "), needle),
  );
  const filtering = Boolean(needle) || stateFilter !== ALL || districtFilter !== ALL || blockFilter !== ALL;
  const clearFilters = () => {
    setQuery("");
    setStateFilter(ALL);
    setDistrictFilter(ALL);
    setBlockFilter(ALL);
  };
  const place = (b: Centre) => [b.block, b.district, canonicalState(b.state)].filter(Boolean).join(", ");
  const placeSelect = (label: string, value: string, options: string[], onChange: (v: string) => void, all: string) => (
    <Select value={value} onValueChange={onChange} disabled={!options.length}>
      <SelectTrigger aria-label={label} className="h-9 min-w-0 text-xs sm:text-sm">
        <SelectValue placeholder={all} />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value={ALL}>{all}</SelectItem>
        {options.map((o) => <SelectItem key={o} value={o}>{o}</SelectItem>)}
      </SelectContent>
    </Select>
  );
  type Row = CentreChargeRow & { centre: string; what: string };
  const rows: Row[] = charges.map((c) => ({ ...c, centre: branchName.get(c.branchId) || "—", what: CHARGE_LABELS[c.item] || c.item }));
  const columns: Column<Row>[] = [
    { key: "chargedAt", header: "When", sortable: true, cell: (r) => (r.chargedAt ? new Date(r.chargedAt).toLocaleString("en-IN") : "—") },
    ...(isAdmin ? [{ key: "centre", header: "Centre", sortable: true } as Column<Row>] : []),
    { key: "what", header: "For", cell: (r) => <Badge variant="outline">{r.what}</Badge> },
    { key: "amount", header: "Amount", sortable: true, cell: (r) => <span className="font-semibold text-rose-600">−{inr(r.amount)}</span> },
    { key: "chargedBy", header: "By", cell: (r) => r.chargedBy || "—" },
  ];

  const rateInput = (scope: string, item: ChargeItem, placeholder: string) => (
    <Input
      inputMode="decimal"
      className="h-9 w-24 text-right"
      aria-label={`${CHARGE_LABELS[item]} rate for ${scope === "*" ? "all centres" : branchName.get(scope)}`}
      placeholder={placeholder}
      value={value(scope, item)}
      disabled={!isAdmin}
      onChange={(e) => setValue(scope, item, e.target.value)}
    />
  );

  return (
    <AppLayout>
      <PageHeader
        title="Centre Charges"
        description={isAdmin ? "What each centre pays from its wallet for admissions, admit cards, marksheets and certificates" : "What your centre pays from its wallet, and what has been charged"}
        breadcrumbs={[{ label: "Branch Management" }, { label: "Centre Charges" }]}
        actions={isAdmin && <Button onClick={save} disabled={saving || loading}><Save className="mr-1.5 h-4 w-4" />{saving ? "Saving…" : "Save charges"}</Button>}
      />

      <Card className="mb-4">
        <CardHeader>
          <CardTitle>{isAdmin ? "Rate for every centre" : "Your rates"}</CardTitle>
          <p className="text-xs text-muted-foreground">
            Each is taken from the centre's wallet once — re-saving a marksheet or reprinting a certificate is free. A wallet
            that cannot cover the charge stops the action until it is <Link to="/branch/wallet" className="underline">recharged</Link>.
            0 means free.
          </p>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {CHARGE_ITEMS.map((item) => (
            <div key={item} className="rounded-xl border p-3">
              <p className="text-sm font-semibold">{CHARGE_LABELS[item]}</p>
              <p className="mb-2 text-xs text-muted-foreground">per student{item === "ADMIT_CARD" || item === "MARKSHEET" ? ", per year/semester" : ""}</p>
              {isAdmin ? (
                <div className="flex items-center gap-2">₹ {rateInput("*", item, "0")}</div>
              ) : (
                <p className="text-xl font-bold">{inr(effectiveRate(rates, branchId, item))}</p>
              )}
            </div>
          ))}
        </CardContent>
      </Card>

      {isAdmin && (
        <Card className="mb-4">
          <CardHeader>
            <CardTitle>Centre-wise rates</CardTitle>
            <p className="text-xs text-muted-foreground">Leave a box empty to use the rate for every centre (shown in grey).</p>
            <div className="grid gap-2 pt-2 sm:grid-cols-4">
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search centre, code, place…"
                  aria-label="Search centres"
                  className="h-9 pl-9"
                />
              </div>
              <div className="grid min-w-0 grid-cols-3 gap-2 sm:col-span-3">
                {placeSelect("Filter by state", stateFilter, states, (v) => { setStateFilter(v); setDistrictFilter(ALL); setBlockFilter(ALL); }, "All states")}
                {placeSelect("Filter by district", districtFilter, districts, (v) => { setDistrictFilter(v); setBlockFilter(ALL); }, "All districts")}
                {placeSelect("Filter by block", blockFilter, blocks, setBlockFilter, "All blocks")}
              </div>
            </div>
            <div className="flex items-center justify-between gap-2 pt-1 text-xs text-muted-foreground">
              <span>Showing {shownCentres.length} of {branches.length} centre{branches.length === 1 ? "" : "s"}</span>
              {filtering && (
                <Button variant="ghost" size="sm" className="h-7 gap-1 px-2 text-xs" onClick={clearFilters}>
                  <X className="h-3.5 w-3.5" /> Clear filters
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent className="overflow-x-auto p-0">
            <table className="w-full min-w-[760px] text-sm">
              <thead>
                <tr className="border-b bg-muted/40 text-left text-xs text-muted-foreground">
                  <th className="p-3">Centre</th>
                  <th className="p-3 text-right">Wallet</th>
                  {CHARGE_ITEMS.map((item) => <th key={item} className="p-3 text-right">{CHARGE_LABELS[item]}</th>)}
                </tr>
              </thead>
              <tbody>
                {shownCentres.map((b) => (
                  <tr key={b.id} className="border-b last:border-0">
                    <td className="p-3">
                      <p className="font-medium">{b.name}</p>
                      <p className="text-xs text-muted-foreground">{[b.code, place(b)].filter(Boolean).join(" · ") || "—"}</p>
                    </td>
                    <td className="p-3 text-right">
                      <span className="inline-flex items-center gap-1 font-semibold tabular-nums"><Wallet className="h-3.5 w-3.5 text-primary" />{inr(balances.get(b.id) ?? 0)}</span>
                    </td>
                    {CHARGE_ITEMS.map((item) => (
                      <td key={item} className="p-2"><div className="flex justify-end">{rateInput(b.id, item, String(defaultOf(item)))}</div></td>
                    ))}
                  </tr>
                ))}
                {!shownCentres.length && (
                  <tr>
                    <td colSpan={6} className="p-6 text-center text-muted-foreground">
                      {loading ? "Loading…" : branches.length ? "No centre matches these filters." : "No centres yet."}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader><CardTitle>Charged from wallet</CardTitle></CardHeader>
        <CardContent>
          <DataTable
            data={rows}
            columns={columns}
            searchPlaceholder="Search centre, item…"
            filters={[...(isAdmin ? [{ label: "Centre", key: "centre" }] : []), { label: "For", key: "what" }]}
            emptyMessage={loading ? "Loading…" : "Nothing charged yet."}
          />
        </CardContent>
      </Card>
    </AppLayout>
  );
}
