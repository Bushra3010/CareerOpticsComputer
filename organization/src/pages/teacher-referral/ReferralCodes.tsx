import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Gift, Pencil } from "lucide-react";

import { AppLayout } from "@/components/layout/AppLayout";
import { PageHeader } from "@/components/ui/PageHeader";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/EmptyState";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { formatRupees } from "@/lib/supabase/partners";
import {
  CODE_RE,
  listReferralCodes,
  listReferrals,
  listTeachers,
  normaliseCode,
  saveReferralCode,
  suggestCode,
  summariseReferrals,
  validatePercent,
  type ReferralCode,
  type TeacherLogin,
  type TeacherReferral,
} from "@/lib/supabase/teacherReferrals";

/**
 * Teacher referral codes: every teacher login, the code they share and the
 * percentage they earn when someone joins as a teacher on it.
 */
export default function ReferralCodes() {
  const { toast } = useToast();
  const { organizationId } = useAuth();
  const [teachers, setTeachers] = useState<TeacherLogin[]>([]);
  const [codes, setCodes] = useState<ReferralCode[]>([]);
  const [referrals, setReferrals] = useState<TeacherReferral[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [editing, setEditing] = useState<TeacherLogin | null>(null);
  const [draft, setDraft] = useState({ code: "", percent: "10", active: true });
  const [draftError, setDraftError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

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
      setReferrals(r);
      setLoadError(null);
    } catch (err) {
      setLoadError(err instanceof Error ? err.message : "Could not load the referral codes.");
    } finally {
      setLoading(false);
    }
  }, [organizationId]);

  useEffect(() => {
    void load();
  }, [load]);

  const codeOf = useMemo(() => new Map(codes.map((c) => [c.userId, c])), [codes]);
  const statsOf = useMemo(() => {
    const by = new Map<string, TeacherReferral[]>();
    referrals.forEach((r) => by.set(r.referrerUserId, [...(by.get(r.referrerUserId) ?? []), r]));
    return new Map([...by].map(([id, rows]) => [id, summariseReferrals(rows)]));
  }, [referrals]);

  const openEdit = (teacher: TeacherLogin) => {
    const current = codeOf.get(teacher.id);
    setDraft({
      code: current?.code ?? suggestCode(teacher.name),
      percent: String(current?.commissionPercent ?? 10),
      active: current?.isActive ?? true,
    });
    setDraftError(null);
    setEditing(teacher);
  };

  const save = async () => {
    if (!editing || !organizationId) return;
    const code = normaliseCode(draft.code);
    if (!CODE_RE.test(code)) return setDraftError("A code is 4–20 letters, digits or dashes.");
    const percentError = validatePercent(draft.percent);
    if (percentError) return setDraftError(percentError);
    setSaving(true);
    try {
      const saved = await saveReferralCode(organizationId, {
        userId: editing.id,
        code,
        commissionPercent: Number(draft.percent),
        isActive: draft.active,
      });
      setCodes((list) => [...list.filter((c) => c.userId !== saved.userId), saved]);
      toast({ title: "Referral code saved", description: `${editing.name}: ${saved.code} at ${saved.commissionPercent}%.` });
      setEditing(null);
    } catch (err) {
      setDraftError(err instanceof Error ? err.message : "Could not save the code.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <AppLayout>
      <PageHeader
        title="Teacher Referral Codes"
        description="Give each teacher a referral code and the percentage they earn when someone joins as a teacher on it."
        breadcrumbs={[{ label: "Teacher Referral" }, { label: "Referral Codes" }]}
        actions={
          <Button asChild variant="outline">
            <Link to="/teacher-referral/referrals">Referrals &amp; payouts</Link>
          </Button>
        }
      />

      {loadError ? (
        <p className="py-8 text-center text-sm text-destructive">{loadError}</p>
      ) : !loading && teachers.length === 0 ? (
        <EmptyState
          icon={Gift}
          title="No teachers yet"
          description="Create a login at the Teacher level under User Management → All Users, then give them a referral code here."
        />
      ) : (
        <Card>
          <CardContent className="overflow-x-auto p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Teacher</TableHead>
                  <TableHead>Referral code</TableHead>
                  <TableHead className="text-right">Commission</TableHead>
                  <TableHead className="text-right">Referrals</TableHead>
                  <TableHead className="text-right">Owed</TableHead>
                  <TableHead className="text-right">Paid</TableHead>
                  <TableHead />
                </TableRow>
              </TableHeader>
              <TableBody>
                {teachers.map((t) => {
                  const c = codeOf.get(t.id);
                  const s = statsOf.get(t.id);
                  return (
                    <TableRow key={t.id}>
                      <TableCell>
                        <p className="font-medium">{t.name}</p>
                        <p className="text-xs text-muted-foreground">{t.phone || t.email}</p>
                      </TableCell>
                      <TableCell>
                        {c ? (
                          <span className="flex items-center gap-2">
                            <code className="rounded bg-muted px-2 py-0.5 font-mono text-sm">{c.code}</code>
                            {!c.isActive && <Badge variant="outline">Off</Badge>}
                          </span>
                        ) : (
                          <span className="text-sm text-muted-foreground">No code yet</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">{c ? `${c.commissionPercent}%` : "—"}</TableCell>
                      <TableCell className="text-right">{s?.count ?? 0}</TableCell>
                      <TableCell className="text-right">{formatRupees(s?.owed ?? 0)}</TableCell>
                      <TableCell className="text-right">{formatRupees(s?.paid ?? 0)}</TableCell>
                      <TableCell className="text-right">
                        <Button size="sm" variant="outline" className="gap-1.5" onClick={() => openEdit(t)}>
                          <Pencil className="h-3.5 w-3.5" />
                          {c ? "Edit" : "Give code"}
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      <Dialog open={editing !== null} onOpenChange={(open) => !open && setEditing(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Referral code for {editing?.name}</DialogTitle>
            <DialogDescription>
              The teacher shares this code. A new rate applies to referrals recorded from now on; past
              rewards keep the rate they were recorded at.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="ref-code">Referral code *</Label>
              <Input
                id="ref-code"
                className="font-mono uppercase"
                value={draft.code}
                onChange={(e) => setDraft((d) => ({ ...d, code: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="ref-percent">Commission (%) *</Label>
              <Input
                id="ref-percent"
                inputMode="decimal"
                value={draft.percent}
                onChange={(e) => setDraft((d) => ({ ...d, percent: e.target.value }))}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="ref-active">Code is active</Label>
              <Switch
                id="ref-active"
                checked={draft.active}
                onCheckedChange={(v) => setDraft((d) => ({ ...d, active: v }))}
              />
            </div>
            {draftError && <p className="text-sm text-destructive">{draftError}</p>}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditing(null)}>
              Cancel
            </Button>
            <Button onClick={save} disabled={saving}>
              {saving ? "Saving…" : "Save code"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}
