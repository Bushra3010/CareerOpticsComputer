import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AlertTriangle, ArrowUpRight, BookOpen, ClipboardCheck, IndianRupee, MoreHorizontal, Plus, Receipt, UserPlus, Users, Wallet } from "lucide-react";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { getDashboardStats, getWallet } from "@/lib/supabase/data";
import { getDashboardRows, type DashboardRows } from "@/lib/supabase/dashboardCharts";
import { admissionFunnel, belowAttendance, monthlyFees, todaysBatches } from "@/lib/dashboardCharts";
import { downloadCsv } from "@/lib/export";
import { useAuth } from "@/contexts/AuthContext";
import { canAccessWithRole } from "@/lib/navigation";
import { useToast } from "@/hooks/use-toast";
import { AppGreeting, HeroCard, ServicesGrid } from "@/components/home/AppHome";

/** Below this a branch cannot issue certificates or ID cards. */
const WALLET_FLOOR = 25_000;

const quickActions = [
  { label: "New admission", hint: "Enrol a student", to: "/student/admission-form", icon: UserPlus },
  { label: "Collect fee", hint: "Record a payment", to: "/fee/collection", icon: IndianRupee },
  { label: "Mark attendance", hint: "Today's batches", to: "/attendance/mark", icon: ClipboardCheck },
  { label: "Recharge wallet", hint: "Top up the branch", to: "/branch/wallet", icon: Wallet },
];

type DashboardData = { students: number; courses: number; feesCollected: number; outstanding: number; attendancePercentage: number; enquiriesToday: number };

export default function FranchiseDashboard() {
  const { toast } = useToast();
  const { user, view, allowedPaths } = useAuth();
  // Only what this role may open: the admission shortcuts and quick actions.
  const canAdmit = canAccessWithRole(view, "/student/admission-form", allowedPaths);
  const actions = quickActions.filter((action) => canAccessWithRole(view, action.to, allowedPaths));
  const branchId = user?.branchId;
  const navigate = useNavigate();
  const [metrics, setMetrics] = useState<DashboardData | null>(null);
  // null until the wallet has been read, so the card and the floor warning can
  // hold rather than claim a balance the branch does not have.
  const [wallet, setWallet] = useState<number | null>(null);
  const load = useCallback(
    () =>
      getDashboardStats(branchId)
        // `getDashboardStats` throws on failure and carries no `message` field,
        // so the rejection branch could never produce a useful reason.
        .then((r) => setMetrics(r.data as DashboardData))
        .catch((error) =>
          toast({
            title: "Live metrics unavailable",
            description: error instanceof Error ? error.message : undefined,
            variant: "destructive",
          }),
        ),
    [toast, branchId],
  );
  useEffect(() => { load(); }, [load]);

  // A branch with no wallet row yet has a balance of zero, not an error.
  useEffect(() => {
    let cancelled = false;
    if (!branchId) return;
    getWallet(branchId)
      .then((r) => { if (!cancelled) setWallet(Number((r.data as { balance?: number } | null)?.balance ?? 0)); })
      .catch(() => { if (!cancelled) setWallet(null); });
    return () => { cancelled = true; };
  }, [branchId]);

  // The branch's own records behind the chart, the pipeline and today's batches.
  const [rows, setRows] = useState<DashboardRows | null>(null);
  useEffect(() => {
    let cancelled = false;
    getDashboardRows(branchId ?? null, user?.organizationId ?? null).then((r) => {
      if (!cancelled) setRows(r);
    });
    return () => { cancelled = true; };
  }, [branchId, user?.organizationId]);

  const money = (value: number) => (value >= 100000 ? `₹${(value / 100000).toFixed(1)}L` : value >= 1000 ? `₹${Math.round(value / 1000)}K` : `₹${Math.round(value)}`);
  const now = new Date();
  const collections = useMemo(() => (rows ? monthlyFees(rows.payments, rows.invoices, new Date()) : []), [rows]);
  const batchesToday = useMemo(
    () => (rows ? todaysBatches(rows.timings, rows.batches, rows.students, new Date()) : []),
    [rows],
  );
  const stages = rows ? admissionFunnel(rows.enquiries, rows.students, new Date()) : null;
  const funnel = [
    { stage: "New enquiries", count: stages?.newEnquiries, to: "/enquiry/branch" },
    { stage: "Follow-up due", count: stages?.followUpDue, to: "/reception/enquiry" },
    { stage: "Online applications", count: stages?.onlineApplications, to: "/student/online-admissions" },
    { stage: "Admitted this month", count: stages?.admittedThisMonth, to: "/student/view" },
  ];
  const lowAttendance = rows ? belowAttendance(rows.attendance) : 0;
  const greeting = now.getHours() < 12 ? "Good morning" : now.getHours() < 17 ? "Good afternoon" : "Good evening";
  const branch = user?.name ?? "Your branch";

  const stats = [
    { label: "Students on roll", value: metrics?.students ?? "—", note: `${metrics?.courses ?? 0} courses running`, icon: Users, to: "/student/view" },
    { label: "Attendance today", value: metrics ? `${metrics.attendancePercentage}%` : "—", note: `${batchesToday.length} batches scheduled`, icon: ClipboardCheck, to: "/attendance/report" },
    { label: "Fees collected", value: metrics ? money(metrics.feesCollected) : "—", note: "this month", icon: Receipt, to: "/fee/collection" },
    { label: "Outstanding", value: metrics ? money(metrics.outstanding) : "—", note: "across invoices", icon: IndianRupee, to: "/fee/due-collection" },
  ];

  const alerts = [
    ...(wallet !== null && wallet < WALLET_FLOOR ? [{ text: `Wallet balance is ₹${wallet.toLocaleString("en-IN")} — below the ₹${WALLET_FLOOR.toLocaleString("en-IN")} floor for issuing certificates.`, to: "/branch/wallet", action: "Recharge" }] : []),
    ...(stages?.followUpDue ? [{ text: `${stages.followUpDue} ${stages.followUpDue === 1 ? "enquiry is" : "enquiries are"} waiting on a follow-up call.`, to: "/reception/enquiry", action: "Open reception" }] : []),
    ...(lowAttendance ? [{ text: `${lowAttendance} ${lowAttendance === 1 ? "student is" : "students are"} below the 75% attendance requirement (last 30 days).`, to: "/attendance/report", action: "See report" }] : []),
  ];

  return (
    <AppLayout>
      <AppGreeting name={user?.name?.split(" ")[0] || "there"} title={branch || "Your branch today"} right={canAdmit ? <Button asChild><Link to="/student/admission-form"><Plus />New admission</Link></Button> : null} />
      <HeroCard
        badge="This month"
        headline={metrics ? `${money(metrics.feesCollected)} collected` : "Fees collected"}
        accent={metrics ? `${money(metrics.outstanding)} still due` : undefined}
        note={`${branch} · this branch only`}
        figures={[
          { value: metrics?.students ?? "—", label: "Students", to: "/student/view" },
          { value: metrics ? `${metrics.attendancePercentage}%` : "—", label: "Attendance", to: "/attendance/report" },
          { value: wallet === null ? "—" : money(wallet), label: "Wallet", to: "/branch/wallet" },
        ]}
        primary={{ label: "Collect fee", to: "/fee/collection" }}
        secondary={canAdmit ? { label: "New admission", to: "/student/admission-form" } : undefined}
      />
      <ServicesGrid />

      <section className="mb-5 grid grid-cols-2 gap-3 xl:grid-cols-4">
        {stats.map((stat) => (
          <Link key={stat.label} to={stat.to} className="group">
            <Card className="h-full transition-colors hover:border-brand/40">
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <p className="eyebrow pt-1">{stat.label}</p>
                  <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-muted text-muted-foreground transition-colors group-hover:bg-brand/12 group-hover:text-brand-ink"><stat.icon className="h-4 w-4" /></span>
                </div>
                <p className="metric mt-4">{stat.value}</p>
                <p className="mt-3 text-xs text-muted-foreground">{stat.note}</p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </section>

      <section className="mb-5 grid gap-5 xl:grid-cols-[1.5fr_1fr]">
        <Card>
          <CardHeader className="flex-row items-center justify-between space-y-0">
            <div><CardTitle>Collections</CardTitle><div className="mt-1.5 flex items-center gap-3 text-xs text-muted-foreground"><span className="flex items-center gap-1.5"><i className="h-2 w-2 rounded-[2px] bg-chart-1" />Collected</span><span className="flex items-center gap-1.5"><i className="h-2 w-2 rounded-[2px] bg-chart-4" />Still due</span><span>· ₹ thousand, last five months</span></div></div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild><Button variant="ghost" size="icon"><MoreHorizontal /></Button></DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onSelect={() => { load(); toast({ title: "Metrics refreshed" }); }}>Refresh metrics</DropdownMenuItem>
                <DropdownMenuItem onSelect={() => downloadCsv("branch-collections.csv", collections)}>Export collections (CSV)</DropdownMenuItem>
                <DropdownMenuItem onSelect={() => navigate("/fee/due-collection")}>Open due collection</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={collections} barGap={5} margin={{ top: 4, right: 4, left: -18, bottom: 0 }}>
                <CartesianGrid vertical={false} stroke="hsl(var(--border))" strokeDasharray="2 4" />
                <XAxis dataKey="m" axisLine={false} tickLine={false} fontSize={11} stroke="hsl(var(--muted-foreground))" />
                <YAxis axisLine={false} tickLine={false} fontSize={11} stroke="hsl(var(--muted-foreground))" />
                <Tooltip cursor={{ fill: "hsl(var(--muted) / .5)" }} contentStyle={{ borderRadius: 12, border: "1px solid hsl(var(--border))", background: "hsl(var(--popover))", color: "hsl(var(--popover-foreground))", fontSize: 12 }} />
                <Bar name="Collected" dataKey="collected" fill="hsl(var(--chart-1))" radius={[5, 5, 2, 2]} maxBarSize={22} />
                <Bar name="Still due" dataKey="due" fill="hsl(var(--chart-4))" radius={[5, 5, 2, 2]} maxBarSize={22} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <div className="space-y-5">
          <Card>
            <CardHeader className="flex-row items-center justify-between space-y-0"><CardTitle className="flex items-center gap-2"><Wallet className="h-4 w-4" />Branch wallet</CardTitle><Button size="sm" asChild><Link to="/branch/wallet">Recharge</Link></Button></CardHeader>
            <CardContent>
              <p className="metric">{wallet === null ? "—" : `₹${wallet.toLocaleString("en-IN")}`}</p>
              <p className="mt-1 text-xs text-muted-foreground">Certificates and ID cards are issued against this balance.</p>
              {wallet !== null && wallet < WALLET_FLOOR && <p className="mt-3 flex gap-2 rounded-xl border border-warning/30 bg-warning/10 p-2.5 text-xs text-warning"><AlertTriangle className="h-3.5 w-3.5 shrink-0" />Below the ₹{WALLET_FLOOR.toLocaleString("en-IN")} working floor.</p>}
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>Quick actions</CardTitle></CardHeader>
            <CardContent className="grid gap-2 sm:grid-cols-2 xl:grid-cols-1">
              {actions.map((action) => (
                <Link key={action.label} to={action.to} className="group flex items-center gap-3 rounded-2xl border border-border/70 p-3 transition hover:border-foreground/20 hover:bg-muted/60">
                  <span className="grid h-10 w-10 place-items-center rounded-lg bg-muted transition-colors group-hover:bg-brand group-hover:text-brand-foreground"><action.icon className="h-4 w-4" /></span>
                  <span className="min-w-0 flex-1"><span className="block text-sm font-semibold">{action.label}</span><span className="block text-xs text-muted-foreground">{action.hint}</span></span>
                  <ArrowUpRight className="h-4 w-4 text-muted-foreground transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </Link>
              ))}
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="grid gap-5 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex-row items-center justify-between space-y-0"><CardTitle>Admissions pipeline</CardTitle><Button variant="ghost" size="icon" title="Open enquiries" onClick={() => navigate("/enquiry/branch")}><BookOpen /></Button></CardHeader>
          <CardContent className="space-y-1">
            {funnel.map((stage) => (
              <Link key={stage.stage} to={stage.to} className="flex items-center justify-between gap-3 border-b py-3 last:border-0 hover:text-brand-ink">
                <span className="text-sm">{stage.stage}</span>
                <span className="tabular text-sm font-semibold">{stage.count ?? "—"}</span>
              </Link>
            ))}
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader className="flex-row items-center justify-between space-y-0"><CardTitle>Today's batches</CardTitle><Button variant="outline" size="sm" asChild><Link to="/attendance/mark">Mark attendance</Link></Button></CardHeader>
          <CardContent className="space-y-1">
            {rows && !batchesToday.length && (
              <p className="py-3 text-sm text-muted-foreground">No batch has a class today. Class days and times are set in Batch Timing.</p>
            )}
            {batchesToday.map((batch) => (
              <div key={batch.key} className="flex flex-wrap items-center gap-3 border-b py-3 last:border-0">
                <div className="min-w-0 flex-1"><p className="truncate text-sm font-semibold">{batch.name}</p><p className="text-xs text-muted-foreground">{batch.time} · {batch.faculty}</p></div>
                <Badge variant="outline">{batch.strength} students</Badge>
              </div>
            ))}
            <div className="space-y-2 pt-3">
              {alerts.map((alert) => (
                <div key={alert.text} className="flex flex-wrap items-center gap-3 rounded-2xl border border-border/70 p-3">
                  <p className="min-w-0 flex-1 text-xs text-muted-foreground">{alert.text}</p>
                  <Button size="sm" variant="ghost" asChild><Link to={alert.to}>{alert.action}</Link></Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </section>
    </AppLayout>
  );
}
