import { useCallback, useEffect, useMemo, useState } from "react";
import { Gift } from "lucide-react";

import { AppLayout } from "@/components/layout/AppLayout";
import { PageHeader } from "@/components/ui/PageHeader";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DatePicker } from "@/components/ui/date-picker";
import { EmptyState } from "@/components/ui/EmptyState";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { formatRupees } from "@/lib/supabase/partners";
import {
  REFERRAL_STATUSES,
  STATUS_LABELS,
  STATUS_STYLE,
  createReferral,
  listReferralCodes,
  listReferrals,
  listTeachers,
  normaliseCode,
  rewardFor,
  setReferralStatus,
  summariseReferrals,
  validateReferral,
  type ReferralCode,
  type ReferralErrors,
  type ReferralFormValues,
  type ReferralStatus,
  type TeacherLogin,
  type TeacherReferral,
} from "@/lib/supabase/teacherReferrals";

const today = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};

const blank = (): ReferralFormValues => ({
  code: "",
  referredName: "",
  referredPhone: "",
  referredEmail: "",
  joinedOn: today(),
  baseAmount: "",
  note: "",
});

const ALL = "all";

/**
 * Referrals and payouts: record a teacher who joined on someone's code, then
 * approve the reward and mark it paid.
 */
export default function Referrals() {
  const { toast } = useToast();
  const { organizationId } = useAuth();
  const [teachers, setTeachers] = useState<TeacherLogin[]>([]);
  const [codes, setCodes] = useState<ReferralCode[]>([]);
  const [rows, setRows] = useState<TeacherReferral[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [form, setForm] = useState<ReferralFormValues>(blank());
  const [errors, setErrors] = useState<ReferralErrors>({});
  const [saving, setSaving] = useState(false);
  const [filter, setFilter] = useState<string>(ALL);

  const [paying, setPaying] = useState<TeacherReferral | null>(null);
  const [payment, setPayment] = useState({ paidOn: today(), reference: "" });

  const load = useCallback(async () => {
    if (!organizationId) return setLoading(false);
    setLoading(true);
    try {
      const [t, c, r] = await Promise.all([
        listTeachers(organizationId),
        listReferralCodes(organizationId),
        listReferrals(organizationId),
      ]);
      setTeachers(t);
      setCodes(c);
      setRows(r);
      setLoadError(null);
    } catch (err) {
      setLoadError(err instanceof Error ? err.message : "Could not load the referrals.");
    } finally {
      setLoading(false);
    }
  }, [organizationId]);

  useEffect(() => {
    void load();
  }, [load]);

  const teacherName = useMemo(() => new Map(teachers.map((t) => [t.id, t.name])), [teachers]);
  const shown = useMemo(() => (filter === ALL ? rows : rows.filter((r) => r.status === filter)), [rows, filter]);
  const summary = useMemo(() => summariseReferrals(rows), [rows]);

  const owner = codes.find((c) => c.code === normaliseCode(form.code));
  const preview =
    owner && /^\d+(\.\d{1,2})?$/.test(form.baseAmount.trim())
      ? rewardFor(Number(form.baseAmount), owner.commissionPercent)
      : null;

  const set = <K extends keyof ReferralFormValues>(key: K, value: ReferralFormValues[K]) => {
    setForm((f) => ({ ...f, [key]: value }));
    if (errors[key]) setErrors((e) => ({ ...e, [key]: undefined }));
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!organizationId) return;
    const { errors: found, value } = validateReferral(form, codes);
    setErrors(found);
    if (!value) return;
    setSaving(true);
    try {
      const created = await createReferral(organizationId, value);
      setRows((list) => [created, ...list]);
      setForm(blank());
      toast({
        title: "Referral recorded",
        description: `${teacherName.get(created.referrerUserId) ?? "Teacher"} earns ${formatRupees(created.rewardAmount)} once approved.`,
      });
    } catch (err) {
      toast({
        title: "Referral not saved",
        description: err instanceof Error ? err.message : undefined,
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const move = async (row: TeacherReferral, status: ReferralStatus, pay?: { paidOn: string; paymentReference: string | null }) => {
    try {
      const updated = await setReferralStatus(row.id, status, pay);
      setRows((list) => list.map((r) => (r.id === updated.id ? updated : r)));
      toast({ title: `Marked ${STATUS_LABELS[status].toLowerCase()}`, description: row.referredName });
    } catch (err) {
      toast({
        title: "Could not update the referral",
        description: err instanceof Error ? err.message : undefined,
        variant: "destructive",
      });
    }
  };

  const err = (key: keyof ReferralFormValues) =>
    errors[key] ? <p className="text-sm text-destructive">{errors[key]}</p> : null;

  return (
    <AppLayout>
      <PageHeader
        title="Teacher Referrals"
        description="Teachers who joined on a referral code, the reward each one earns, and its payout."
        breadcrumbs={[{ label: "Teacher Referral", href: "/teacher-referral/codes" }, { label: "Referrals" }]}
      />

      {loadError ? (
        <p className="py-8 text-center text-sm text-destructive">{loadError}</p>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {[
              { label: "Referrals", value: String(summary.count) },
              { label: "Pending approval", value: formatRupees(summary.pending) },
              { label: "Approved, to pay", value: formatRupees(summary.owed) },
              { label: "Paid", value: formatRupees(summary.paid) },
            ].map((s) => (
              <Card key={s.label}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">{s.label}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{s.value}</div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="mt-6 grid gap-6 lg:grid-cols-3">
            <Card className="lg:col-span-1">
              <CardHeader>
                <CardTitle>Record a referral</CardTitle>
              </CardHeader>
              <CardContent>
                {!loading && codes.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    No teacher has a referral code yet. Give one under Teacher Referral → Referral Codes.
                  </p>
                ) : (
                  <form onSubmit={submit} noValidate className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="r-code">Referral code *</Label>
                      <Input
                        id="r-code"
                        className="font-mono uppercase"
                        placeholder="PRIYA-4821"
                        value={form.code}
                        onChange={(e) => set("code", e.target.value)}
                      />
                      {owner && (
                        <p className="text-xs text-muted-foreground">
                          {teacherName.get(owner.userId) ?? "Teacher"} · {owner.commissionPercent}%
                        </p>
                      )}
                      {err("code")}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="r-name">New teacher's name *</Label>
                      <Input id="r-name" value={form.referredName} onChange={(e) => set("referredName", e.target.value)} />
                      {err("referredName")}
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-2">
                        <Label htmlFor="r-phone">Phone</Label>
                        <Input id="r-phone" inputMode="tel" value={form.referredPhone} onChange={(e) => set("referredPhone", e.target.value)} />
                        {err("referredPhone")}
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="r-email">Email</Label>
                        <Input id="r-email" type="email" value={form.referredEmail} onChange={(e) => set("referredEmail", e.target.value)} />
                        {err("referredEmail")}
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="r-joined">Joined on *</Label>
                      <DatePicker id="r-joined" value={form.joinedOn} onChange={(v) => set("joinedOn", v)} invalid={!!errors.joinedOn} />
                      {err("joinedOn")}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="r-amount">Base amount (₹) *</Label>
                      <Input
                        id="r-amount"
                        inputMode="decimal"
                        placeholder="Joining fee or first month's pay"
                        value={form.baseAmount}
                        onChange={(e) => set("baseAmount", e.target.value)}
                      />
                      {preview !== null && (
                        <p className="text-xs text-muted-foreground">Reward: {formatRupees(preview)}</p>
                      )}
                      {err("baseAmount")}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="r-note">Note</Label>
                      <Textarea id="r-note" rows={2} value={form.note} onChange={(e) => set("note", e.target.value)} />
                    </div>
                    <Button type="submit" className="w-full" disabled={saving}>
                      {saving ? "Saving…" : "Record referral"}
                    </Button>
                  </form>
                )}
              </CardContent>
            </Card>

            <Card className="lg:col-span-2">
              <CardHeader className="flex flex-row items-center justify-between gap-3 space-y-0">
                <CardTitle>Referrals</CardTitle>
                <Select value={filter} onValueChange={setFilter}>
                  <SelectTrigger className="w-40" aria-label="Filter by status">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={ALL}>All statuses</SelectItem>
                    {REFERRAL_STATUSES.map((s) => (
                      <SelectItem key={s} value={s}>
                        {STATUS_LABELS[s]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </CardHeader>
              <CardContent className="overflow-x-auto p-0">
                {!loading && shown.length === 0 ? (
                  <div className="p-6">
                    <EmptyState icon={Gift} title="No referrals" description="Referrals you record will appear here." />
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Joined</TableHead>
                        <TableHead>New teacher</TableHead>
                        <TableHead>Referred by</TableHead>
                        <TableHead className="text-right">Reward</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Action</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {shown.map((r) => (
                        <TableRow key={r.id}>
                          <TableCell className="whitespace-nowrap">{r.joinedOn}</TableCell>
                          <TableCell>
                            <p className="font-medium">{r.referredName}</p>
                            <p className="text-xs text-muted-foreground">{r.referredPhone || r.referredEmail || ""}</p>
                          </TableCell>
                          <TableCell>
                            <p>{teacherName.get(r.referrerUserId) ?? "—"}</p>
                            <p className="font-mono text-xs text-muted-foreground">{r.codeUsed}</p>
                          </TableCell>
                          <TableCell className="text-right">
                            <p className="font-medium">{formatRupees(r.rewardAmount)}</p>
                            <p className="text-xs text-muted-foreground">
                              {r.commissionPercent}% of {formatRupees(r.baseAmount)}
                            </p>
                          </TableCell>
                          <TableCell>
                            <Badge variant="secondary" className={STATUS_STYLE[r.status]}>
                              {STATUS_LABELS[r.status]}
                            </Badge>
                            {r.status === "PAID" && r.paidOn && (
                              <p className="mt-1 text-xs text-muted-foreground">
                                {r.paidOn}
                                {r.paymentReference ? ` · ${r.paymentReference}` : ""}
                              </p>
                            )}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-1.5">
                              {r.status === "PENDING" && (
                                <>
                                  <Button size="sm" onClick={() => move(r, "APPROVED")}>Approve</Button>
                                  <Button size="sm" variant="ghost" onClick={() => move(r, "REJECTED")}>Reject</Button>
                                </>
                              )}
                              {r.status === "APPROVED" && (
                                <Button
                                  size="sm"
                                  onClick={() => {
                                    setPayment({ paidOn: today(), reference: "" });
                                    setPaying(r);
                                  }}
                                >
                                  Mark paid
                                </Button>
                              )}
                              {r.status === "REJECTED" && (
                                <Button size="sm" variant="outline" onClick={() => move(r, "PENDING")}>Reopen</Button>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </div>
        </>
      )}

      <Dialog open={paying !== null} onOpenChange={(open) => !open && setPaying(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Mark reward paid</DialogTitle>
            <DialogDescription>
              {paying &&
                `${formatRupees(paying.rewardAmount)} to ${teacherName.get(paying.referrerUserId) ?? "the teacher"} for referring ${paying.referredName}.`}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="p-date">Paid on</Label>
              <DatePicker id="p-date" value={payment.paidOn} onChange={(v) => setPayment((p) => ({ ...p, paidOn: v }))} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="p-ref">Reference (UPI / cheque / cash)</Label>
              <Input id="p-ref" value={payment.reference} onChange={(e) => setPayment((p) => ({ ...p, reference: e.target.value }))} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPaying(null)}>Cancel</Button>
            <Button
              onClick={async () => {
                if (!paying) return;
                await move(paying, "PAID", { paidOn: payment.paidOn, paymentReference: payment.reference.trim() || null });
                setPaying(null);
              }}
            >
              Mark paid
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}
