import { useCallback, useEffect, useMemo, useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { DatePicker } from "@/components/ui/date-picker";
import { EmptyState } from "@/components/ui/EmptyState";
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
import { Receipt } from "lucide-react";
import {
  createPartnerTransaction,
  formatRupees,
  listPartnerTransactions,
  listPartners,
  partnerBalances,
  signedAmount,
  summarise,
  validateTransaction,
  type Partner,
  type PartnerTransaction,
  type TransactionErrors,
  type TransactionFormValues,
  type TransactionType,
} from "@/lib/supabase/partners";

const TYPE_LABELS: Record<TransactionType, string> = {
  COMMISSION: "Commission",
  PAYOUT: "Payout",
  ADJUSTMENT: "Adjustment",
};

/** Today as `yyyy-mm-dd` in local time; toISOString would give yesterday's
 *  date for the first five and a half hours of an Indian morning. */
const today = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};

const blankForm = (partnerId = ""): TransactionFormValues => ({
  partnerId,
  type: "COMMISSION",
  direction: "CREDIT",
  amount: "",
  date: today(),
  reference: "",
  note: "",
});

const ALL = "all";

const PartnerTransactions = () => {
  const { toast } = useToast();
  const { organizationId } = useAuth();
  const [partners, setPartners] = useState<Partner[]>([]);
  const [transactions, setTransactions] = useState<PartnerTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [form, setForm] = useState<TransactionFormValues>(blankForm());
  const [errors, setErrors] = useState<TransactionErrors>({});
  const [saving, setSaving] = useState(false);
  const [filterPartner, setFilterPartner] = useState(ALL);

  const load = useCallback(async () => {
    if (!organizationId) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const [rows, txs] = await Promise.all([listPartners(organizationId), listPartnerTransactions(organizationId)]);
      setPartners(rows);
      setTransactions(txs);
      setLoadError(null);
    } catch (err) {
      setLoadError(err instanceof Error ? err.message : "Could not load transactions.");
    } finally {
      setLoading(false);
    }
  }, [organizationId]);

  useEffect(() => {
    void load();
  }, [load]);

  const partnerName = useMemo(() => new Map(partners.map((p) => [p.id, p.name])), [partners]);
  const balances = useMemo(() => partnerBalances(transactions), [transactions]);
  const shown = useMemo(
    () => (filterPartner === ALL ? transactions : transactions.filter((t) => t.partnerId === filterPartner)),
    [transactions, filterPartner],
  );
  const summary = useMemo(() => summarise(shown), [shown]);

  const set = <K extends keyof TransactionFormValues>(key: K, value: TransactionFormValues[K]) => {
    setForm((f) => ({ ...f, [key]: value }));
    if (errors[key]) setErrors((e) => ({ ...e, [key]: undefined }));
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!organizationId) return;
    const { errors: found, value } = validateTransaction(form);
    setErrors(found);
    if (!value) return;
    setSaving(true);
    try {
      const created = await createPartnerTransaction(organizationId, value);
      setTransactions((rows) => [created, ...rows].sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0)));
      // Keep the partner chosen: entries for one partner usually come in a run.
      setForm(blankForm(value.partnerId));
      toast({
        title: "Transaction recorded",
        description: `${TYPE_LABELS[value.type]} of ${formatRupees(value.amount)} for ${partnerName.get(value.partnerId) ?? "partner"}.`,
      });
    } catch (err) {
      toast({
        title: "Transaction not saved",
        description: err instanceof Error ? err.message : "Something went wrong.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const error = (key: keyof TransactionFormValues) =>
    errors[key] ? (
      <p id={`tx-${key}-error`} className="text-sm text-destructive">
        {errors[key]}
      </p>
    ) : null;

  const activePartners = partners.filter((p) => p.status === "ACTIVE");

  return (
    <AppLayout>
      <PageHeader
        title="Partner Transactions"
        description="Commission earned, payouts made and the balance owed to each partner"
        breadcrumbs={[
          { label: "Partners", href: "/partners/all" },
          { label: "Transactions" },
        ]}
      />

      {!organizationId ? (
        <p className="text-sm text-muted-foreground">This account is not linked to an organisation.</p>
      ) : loadError ? (
        <p className="py-8 text-center text-sm text-destructive">{loadError}</p>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {[
              { label: "Commission", value: summary.commission },
              { label: "Payouts", value: summary.payouts },
              { label: "Adjustments", value: summary.adjustments },
              { label: "Balance Owed", value: summary.balance },
            ].map((s) => (
              <Card key={s.label}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">{s.label}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold" data-testid={`summary-${s.label}`}>
                    {formatRupees(s.value)}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="mt-6 grid gap-6 lg:grid-cols-3">
            <Card className="lg:col-span-1">
              <CardHeader>
                <CardTitle>Record Transaction</CardTitle>
              </CardHeader>
              <CardContent>
                {!loading && activePartners.length === 0 ? (
                  <p className="text-sm text-muted-foreground">Add an active partner first to record transactions.</p>
                ) : (
                  <form onSubmit={submit} noValidate className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="tx-partnerId">Partner *</Label>
                      <Select value={form.partnerId} onValueChange={(v) => set("partnerId", v)}>
                        <SelectTrigger id="tx-partnerId" aria-invalid={!!errors.partnerId}>
                          <SelectValue placeholder="Choose a partner" />
                        </SelectTrigger>
                        <SelectContent>
                          {activePartners.map((p) => (
                            <SelectItem key={p.id} value={p.id}>
                              {p.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {error("partnerId")}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="tx-type">Type</Label>
                      <Select value={form.type} onValueChange={(v) => set("type", v as TransactionType)}>
                        <SelectTrigger id="tx-type">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {(Object.keys(TYPE_LABELS) as TransactionType[]).map((t) => (
                            <SelectItem key={t} value={t}>
                              {TYPE_LABELS[t]}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    {form.type === "ADJUSTMENT" && (
                      <div className="space-y-2">
                        <Label htmlFor="tx-direction">Adjustment</Label>
                        <Select value={form.direction} onValueChange={(v) => set("direction", v as TransactionFormValues["direction"])}>
                          <SelectTrigger id="tx-direction">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="CREDIT">Add to balance owed</SelectItem>
                            <SelectItem value="DEBIT">Deduct from balance owed</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    )}
                    <div className="space-y-2">
                      <Label htmlFor="tx-amount">Amount (₹) *</Label>
                      <Input
                        id="tx-amount"
                        inputMode="decimal"
                        value={form.amount}
                        onChange={(e) => set("amount", e.target.value)}
                        aria-invalid={!!errors.amount}
                        aria-describedby={errors.amount ? "tx-amount-error" : undefined}
                      />
                      {error("amount")}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="tx-date">Date *</Label>
                      <DatePicker id="tx-date" value={form.date} onChange={(v) => set("date", v)} />
                      {error("date")}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="tx-reference">Reference</Label>
                      <Input
                        id="tx-reference"
                        placeholder="UTR, cheque no., admission no."
                        value={form.reference}
                        onChange={(e) => set("reference", e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="tx-note">Note</Label>
                      <Input id="tx-note" value={form.note} onChange={(e) => set("note", e.target.value)} />
                    </div>
                    <Button type="submit" className="w-full" disabled={saving || loading}>
                      {saving ? "Saving..." : "Record Transaction"}
                    </Button>
                  </form>
                )}
              </CardContent>
            </Card>

            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Balance by Partner</CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <p className="py-6 text-center text-sm text-muted-foreground">Loading...</p>
                ) : partners.length === 0 ? (
                  <p className="py-6 text-center text-sm text-muted-foreground">No partners yet.</p>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Partner</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Balance Owed</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {partners.map((p) => (
                        <TableRow key={p.id}>
                          <TableCell className="font-medium">{p.name}</TableCell>
                          <TableCell>
                            <Badge variant={p.status === "ACTIVE" ? "default" : "secondary"}>
                              {p.status === "ACTIVE" ? "Active" : "Inactive"}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right" data-testid={`balance-${p.id}`}>
                            {formatRupees(balances.get(p.id) ?? 0)}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </div>

          <Card className="mt-6">
            <CardHeader className="flex flex-row items-center justify-between gap-4 space-y-0">
              <CardTitle>Transactions</CardTitle>
              <Select value={filterPartner} onValueChange={setFilterPartner}>
                <SelectTrigger className="w-56" aria-label="Filter by partner">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={ALL}>All partners</SelectItem>
                  {partners.map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </CardHeader>
            <CardContent>
              {loading ? (
                <p className="py-8 text-center text-sm text-muted-foreground">Loading transactions...</p>
              ) : shown.length === 0 ? (
                <EmptyState
                  icon={Receipt}
                  title="No transactions yet"
                  description="Commission, payouts and adjustments you record will appear here."
                />
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Partner</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Reference</TableHead>
                      <TableHead>Note</TableHead>
                      <TableHead className="text-right">Amount</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {shown.map((t) => (
                      <TableRow key={t.id}>
                        <TableCell className="whitespace-nowrap">{t.date}</TableCell>
                        <TableCell>{partnerName.get(t.partnerId) ?? "Deleted partner"}</TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            {TYPE_LABELS[t.type]}
                            {t.type === "ADJUSTMENT" && (t.direction === "DEBIT" ? " (−)" : " (+)")}
                          </Badge>
                        </TableCell>
                        <TableCell>{t.reference || "-"}</TableCell>
                        <TableCell>{t.note || "-"}</TableCell>
                        <TableCell className="text-right font-medium">{formatRupees(signedAmount(t))}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </AppLayout>
  );
};

export default PartnerTransactions;
