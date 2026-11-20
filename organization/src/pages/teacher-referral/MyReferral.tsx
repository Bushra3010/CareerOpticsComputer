import { useEffect, useMemo, useState } from "react";
import { Copy, Gift } from "lucide-react";

import { AppLayout } from "@/components/layout/AppLayout";
import { PageHeader } from "@/components/ui/PageHeader";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/EmptyState";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { formatRupees } from "@/lib/supabase/partners";
import {
  STATUS_LABELS,
  STATUS_STYLE,
  getMyReferralCode,
  listMyReferrals,
  summariseReferrals,
  type ReferralCode,
  type TeacherReferral,
} from "@/lib/supabase/teacherReferrals";

/**
 * A teacher's own referral page: the code to share, the percentage it earns,
 * and every referral with its reward and payout.
 */
export default function MyReferral() {
  const { toast } = useToast();
  const { user } = useAuth();
  const [code, setCode] = useState<ReferralCode | null>(null);
  const [rows, setRows] = useState<TeacherReferral[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    if (!user?.id) return;
    let live = true;
    Promise.all([getMyReferralCode(user.id), listMyReferrals(user.id)])
      .then(([c, r]) => {
        if (!live) return;
        setCode(c);
        setRows(r);
      })
      .catch((err: unknown) => live && setLoadError(err instanceof Error ? err.message : "Could not load your referrals."))
      .finally(() => live && setLoading(false));
    return () => {
      live = false;
    };
  }, [user?.id]);

  const summary = useMemo(() => summariseReferrals(rows), [rows]);

  const copy = async () => {
    if (!code) return;
    try {
      await navigator.clipboard.writeText(code.code);
      toast({ title: "Code copied", description: code.code });
    } catch {
      toast({ title: "Copy this code", description: code.code });
    }
  };

  return (
    <AppLayout>
      <PageHeader
        title="My Referral"
        description="Share your code. When someone joins as a teacher on it, you earn a share."
        breadcrumbs={[{ label: "My Referral" }]}
      />

      {loadError ? (
        <p className="py-8 text-center text-sm text-destructive">{loadError}</p>
      ) : !loading && !code ? (
        <EmptyState
          icon={Gift}
          title="No referral code yet"
          description="The head office has not given you a referral code. Ask them to set one up for you."
        />
      ) : code ? (
        <>
          <Card className="border-primary/30 bg-primary/5">
            <CardContent className="flex flex-wrap items-center justify-between gap-4 p-5">
              <div>
                <p className="text-sm text-muted-foreground">Your referral code</p>
                <p className="mt-1 font-mono text-3xl font-bold tracking-wider">{code.code}</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  You earn <b>{code.commissionPercent}%</b> for every teacher who joins on this code.
                  {!code.isActive && " This code is switched off right now."}
                </p>
              </div>
              <Button variant="outline" className="gap-2" onClick={copy}>
                <Copy className="h-4 w-4" />
                Copy code
              </Button>
            </CardContent>
          </Card>

          <div className="mt-4 grid grid-cols-2 gap-4 md:grid-cols-4">
            {[
              { label: "Referrals", value: String(summary.count) },
              { label: "Awaiting approval", value: formatRupees(summary.pending) },
              { label: "To be paid", value: formatRupees(summary.owed) },
              { label: "Paid to you", value: formatRupees(summary.paid) },
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

          <Card className="mt-4">
            <CardContent className="overflow-x-auto p-0">
              {rows.length === 0 ? (
                <p className="p-6 text-sm text-muted-foreground">No one has joined on your code yet.</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Joined</TableHead>
                      <TableHead>Teacher</TableHead>
                      <TableHead className="text-right">Reward</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {rows.map((r) => (
                      <TableRow key={r.id}>
                        <TableCell className="whitespace-nowrap">{r.joinedOn}</TableCell>
                        <TableCell>{r.referredName}</TableCell>
                        <TableCell className="text-right">{r.status === "REJECTED" ? "—" : formatRupees(r.rewardAmount)}</TableCell>
                        <TableCell>
                          <Badge variant="secondary" className={STATUS_STYLE[r.status]}>
                            {STATUS_LABELS[r.status]}
                          </Badge>
                          {r.status === "PAID" && r.paidOn && (
                            <span className="ml-2 text-xs text-muted-foreground">{r.paidOn}</span>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </>
      ) : null}
    </AppLayout>
  );
}
