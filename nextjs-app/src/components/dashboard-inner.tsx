"use client";

import { useEffect, useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  ArrowUpRight,
  BookOpen,
  CalendarDays,
  Clock3,
  GraduationCap,
  IndianRupee,
  MoreHorizontal,
  Plus,
  Receipt,
  UserPlus,
  Users,
} from "lucide-react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

type DashboardData = {
  students: number;
  courses: number;
  feesCollected: number;
  outstanding: number;
  attendancePercentage: number;
  enquiriesToday: number;
};

function money(value: number) {
  if (!value && value !== 0) return "₹0";
  return value >= 100000
    ? `₹${(value / 100000).toFixed(1)}L`
    : `₹${Math.round(value / 1000)}K`;
}

export function DashboardInner() {
  const [metrics, setMetrics] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const supabase = createClient();
        const [{ count: studentCount }, { count: courseCount }] = await Promise.all([
          supabase.from("profiles").select("*", { count: "exact", head: true }).eq("role", "STUDENT"),
          supabase.from("courses").select("*", { count: "exact", head: true }),
        ]);
        setMetrics({
          students: studentCount || 0,
          courses: courseCount || 0,
          feesCollected: 0,
          outstanding: 0,
          attendancePercentage: 0,
          enquiriesToday: 0,
        });
      } catch {
        // dashboard unavailable
      } finally {
        setLoading(false);
      }
    };
    void load();
  }, []);

  if (loading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center py-20">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-brand border-t-transparent" />
        </div>
      </AppLayout>
    );
  }

  const now = new Date();
  const greeting =
    now.getHours() < 12
      ? "Good morning"
      : now.getHours() < 17
        ? "Good afternoon"
        : "Good evening";

  const stats = [
    {
      label: "Active students",
      value: metrics?.students ?? "—",
      delta: `${metrics?.courses ?? 0} courses`,
      tone: "delta-flat",
      note: "currently running",
      icon: GraduationCap,
    },
    {
      label: "Attendance today",
      value: metrics ? `${metrics.attendancePercentage}%` : "—",
      delta: `${metrics?.enquiriesToday ?? 0} enquiries`,
      tone: "delta-flat",
      note: "logged today",
      icon: Users,
    },
    {
      label: "Fees collected",
      value: metrics ? money(metrics.feesCollected) : "—",
      delta: "Live",
      tone: "delta-up",
      note: "this month",
      icon: Receipt,
    },
    {
      label: "Outstanding",
      value: metrics ? money(metrics.outstanding) : "—",
      delta: "Due",
      tone: "delta-down",
      note: "across invoices",
      icon: Clock3,
    },
  ];

  const weekly = [
    { day: "Mon", attendance: 91, fees: 42 },
    { day: "Tue", attendance: 94, fees: 56 },
    { day: "Wed", attendance: 89, fees: 49 },
    { day: "Thu", attendance: 96, fees: 71 },
    { day: "Fri", attendance: 93, fees: 64 },
    { day: "Sat", attendance: 86, fees: 38 },
  ];
  const feesData = [
    { m: "Apr", paid: 68, due: 22 },
    { m: "May", paid: 78, due: 18 },
    { m: "Jun", paid: 74, due: 26 },
    { m: "Jul", paid: 89, due: 14 },
    { m: "Aug", paid: 83, due: 17 },
  ];

  return (
    <AppLayout>
      <section className="mb-5 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="eyebrow-muted mb-2.5">
            {now.toLocaleDateString(undefined, {
              weekday: "long",
              day: "numeric",
              month: "long",
            })}
          </p>
          <h1 className="text-3xl font-semibold tracking-[-.045em] sm:text-4xl">
            {greeting}, Admin.
          </h1>
          <p className="mt-1.5 text-sm text-muted-foreground">
            Here{"'"}s what needs your attention across the institution.
          </p>
        </div>
        <Button asChild className="w-fit">
          <Link href="/student/admission-form">
            <Plus />
            New admission
          </Link>
        </Button>
      </section>

      <section className="mb-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => (
          <Card
            key={stat.label}
            className="group relative overflow-hidden transition-colors hover:border-brand/40"
          >
            <CardContent className="p-4">
              <div className="flex items-start justify-between gap-3">
                <p className="eyebrow pt-1">{stat.label}</p>
                <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-muted text-muted-foreground transition-colors group-hover:bg-brand/12 group-hover:text-brand-ink">
                  <stat.icon className="h-4 w-4" />
                </span>
              </div>
              <p className="metric mt-4">{stat.value}</p>
              <div className="mt-3 flex items-center gap-2">
                <span className={`delta ${stat.tone}`}>{stat.delta}</span>
                <span className="text-xs text-muted-foreground">{stat.note}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </section>

      <section className="mb-5 grid gap-5 xl:grid-cols-[1.55fr_.9fr]">
        <Card className="overflow-hidden">
          <CardHeader className="flex-row items-center justify-between space-y-0">
            <div>
              <CardTitle>Institution pulse</CardTitle>
              <p className="mt-1 text-xs text-muted-foreground">
                Attendance performance · this week
              </p>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <MoreHorizontal />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem asChild>
                  <Link href="/attendance/report">Open attendance report</Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </CardHeader>
          <CardContent>
            <div className="mb-3 flex items-end gap-2.5">
              <span className="metric">93.4%</span>
              <span className="delta delta-up mb-1.5">+2.1%</span>
            </div>
            <ResponsiveContainer width="100%" height={230}>
              <AreaChart
                data={weekly}
                margin={{ top: 4, right: 4, left: -18, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="attendance" x1="0" y1="0" x2="0" y2="1">
                    <stop
                      offset="0%"
                      stopColor="hsl(var(--chart-2))"
                      stopOpacity={0.32}
                    />
                    <stop
                      offset="100%"
                      stopColor="hsl(var(--chart-2))"
                      stopOpacity={0}
                    />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  vertical={false}
                  stroke="hsl(var(--border))"
                  strokeDasharray="2 4"
                />
                <XAxis
                  dataKey="day"
                  axisLine={false}
                  tickLine={false}
                  fontSize={11}
                  stroke="hsl(var(--muted-foreground))"
                />
                <YAxis
                  domain={[70, 100]}
                  axisLine={false}
                  tickLine={false}
                  fontSize={11}
                  stroke="hsl(var(--muted-foreground))"
                />
                <Tooltip
                  cursor={{ stroke: "hsl(var(--border))" }}
                  contentStyle={{
                    borderRadius: 12,
                    border: "1px solid hsl(var(--border))",
                    background: "hsl(var(--popover))",
                    color: "hsl(var(--popover-foreground))",
                    fontSize: 12,
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="attendance"
                  stroke="hsl(var(--chart-2))"
                  strokeWidth={2.5}
                  fill="url(#attendance)"
                  dot={false}
                  activeDot={{
                    r: 5,
                    fill: "hsl(var(--chart-2))",
                    stroke: "hsl(var(--card))",
                    strokeWidth: 2,
                  }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick actions</CardTitle>
            <p className="text-xs text-muted-foreground">
              Your most-used workflows
            </p>
          </CardHeader>
          <CardContent className="grid gap-2 sm:grid-cols-2 xl:grid-cols-1">
            {[
              {
                label: "New admission",
                hint: "Add a student",
                to: "/student/admission-form",
                icon: UserPlus,
              },
              {
                label: "Collect fee",
                hint: "Record a payment",
                to: "/fee/collection",
                icon: IndianRupee,
              },
              {
                label: "Mark attendance",
                hint: "Today's classes",
                to: "/attendance/mark",
                icon: Users,
              },
              {
                label: "Create batch",
                hint: "Plan a cohort",
                to: "/course/batch/create",
                icon: BookOpen,
              },
            ].map((action) => (
              <Link
                key={action.label}
                href={action.to}
                className="group flex items-center gap-3 rounded-2xl border border-border/70 p-3 transition hover:border-foreground/20 hover:bg-muted/60"
              >
                <span className="grid h-10 w-10 place-items-center rounded-lg bg-muted transition-colors group-hover:bg-brand group-hover:text-brand-foreground">
                  <action.icon className="h-4 w-4" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-semibold">
                    {action.label}
                  </span>
                  <span className="block text-xs text-muted-foreground">
                    {action.hint}
                  </span>
                </span>
                <ArrowUpRight className="h-4 w-4 text-muted-foreground transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </Link>
            ))}
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-5 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader className="flex-row items-center justify-between space-y-0">
            <div>
              <CardTitle>Fee collection</CardTitle>
              <div className="mt-1.5 flex items-center gap-3 text-xs text-muted-foreground">
                <span className="flex items-center gap-1.5">
                  <i className="h-2 w-2 rounded-[2px] bg-chart-1" />Paid
                </span>
                <span className="flex items-center gap-1.5">
                  <i className="h-2 w-2 rounded-[2px] bg-chart-4" />Outstanding
                </span>
                <span>· last five months</span>
              </div>
            </div>
            <Button variant="outline" size="sm" asChild>
              <Link href="/fee/collection">View fees</Link>
            </Button>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={230}>
              <BarChart
                data={feesData}
                margin={{ top: 4, right: 4, left: -18, bottom: 0 }}
              >
                <CartesianGrid
                  vertical={false}
                  stroke="hsl(var(--border))"
                  strokeDasharray="2 4"
                />
                <XAxis
                  dataKey="m"
                  axisLine={false}
                  tickLine={false}
                  fontSize={11}
                  stroke="hsl(var(--muted-foreground))"
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  fontSize={11}
                  stroke="hsl(var(--muted-foreground))"
                />
                <Tooltip
                  cursor={{ fill: "hsl(var(--muted) / .5)" }}
                  contentStyle={{
                    borderRadius: 12,
                    border: "1px solid hsl(var(--border))",
                    background: "hsl(var(--popover))",
                    color: "hsl(var(--popover-foreground))",
                    fontSize: 12,
                  }}
                />
                <Bar
                  name="Paid"
                  dataKey="paid"
                  fill="hsl(var(--chart-1))"
                  radius={[5, 5, 2, 2]}
                  maxBarSize={22}
                />
                <Bar
                  name="Outstanding"
                  dataKey="due"
                  fill="hsl(var(--chart-4))"
                  radius={[5, 5, 2, 2]}
                  maxBarSize={22}
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex-row items-center justify-between space-y-0">
            <CardTitle>Coming up</CardTitle>
            <Button
              variant="ghost"
              size="icon"
              title="Open exam schedule"
              asChild
            >
              <Link href="/exam/schedule">
                <CalendarDays />
              </Link>
            </Button>
          </CardHeader>
          <CardContent className="space-y-1">
            {[
              {
                day: "18",
                mon: "AUG",
                title: "Mid-term examinations",
                time: "09:00 · All branches",
              },
              {
                day: "21",
                mon: "AUG",
                title: "Parent–teacher meeting",
                time: "11:30 · Main campus",
              },
              {
                day: "28",
                mon: "AUG",
                title: "Fee payment deadline",
                time: "End of day",
              },
            ].map((event, i) => (
              <div
                key={event.title}
                className="flex items-center gap-3 border-b py-3 last:border-0"
              >
                <div
                  className={
                    i === 0
                      ? "grid h-12 w-12 shrink-0 place-items-center rounded-lg border border-brand/35 bg-brand/12 text-brand-ink"
                      : "grid h-12 w-12 shrink-0 place-items-center rounded-lg bg-muted text-muted-foreground"
                  }
                >
                  <span className="tabular text-center text-base font-bold leading-3">
                    {event.day}
                    <small className="mt-1 block text-[8px] font-semibold tracking-wider">
                      {event.mon}
                    </small>
                  </span>
                </div>
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold">{event.title}</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {event.time}
                  </p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </section>
    </AppLayout>
  );
}
