"use client";

import * as React from "react";
import Link from "next/link";
import {
  AlertTriangle,
  Bell,
  CalendarCheck,
  ClipboardCheck,
  GraduationCap,
  IndianRupee,
  Receipt,
  UserPlus,
  Users,
  Wallet,
} from "lucide-react";
import { PortalShell } from "@/components/layout/portal-shell";
import { TopBarSearch } from "@/components/layout/top-bar";
import { Button } from "@/components/ui/button";
import { Card, KpiCard } from "@/components/ui/card";
import { TrendChart } from "@/components/charts/trend-chart";
import { DonutChart } from "@/components/charts/donut-chart";
import { PanelTable } from "@/components/tables/panel-table";
import {
  ActivityStrip,
  ChartCard,
  InitialsAvatar,
  SectionCard,
} from "@/components/dashboard";
import { CENTRE_BOTTOM_NAV, CENTRE_NAV } from "@/lib/navigation/centre-nav";
import { cn } from "@/lib/utils";
import {
  ACTIVITY,
  ATTENDANCE,
  CENTRE_SUBTITLE,
  COLLECTION,
  DEMO_DATE,
  PENDING_FEES,
  RECENT_ADMISSIONS,
  TODAYS_CLASSES,
} from "./demo-data";

/**
 * Centre Admin dashboard — shell preview.
 *
 * Follows the owner's mockup for layout and information architecture, and the
 * style guide for colour and iconography. The deviations are the same four
 * logged as C4 in docs/02-open-conflicts.md, which now apply to both dashboards.
 *
 * Synthetic content only. This route 404s in production; it becomes
 * app/centre/page.tsx on real queries in Phase 1 (PRD §20.1).
 */
export default function CentreDashboardPreview() {
  return (
    <PortalShell
      navGroups={CENTRE_NAV}
      bottomNavItems={CENTRE_BOTTOM_NAV}
      homeHref="/dev/shell/centre"
      profileHref="/dev/shell/centre"
      portalName="Centre Admin"
      title="Dashboard"
      breadcrumbs={[{ label: "Ara Centre", href: "#" }, { label: "Dashboard" }]}
      notificationCount={5}
      searchSlot={<TopBarSearch placeholder="Search students, fees, courses" />}
      searchWidth="wide"
      walletSlot={
        <Link
          href="#wallet"
          className="border-border bg-canvas flex h-10 items-center gap-2 rounded-[var(--radius-control)] border px-3"
        >
          <Wallet className="text-text-secondary size-4" aria-hidden="true" />
          <span className="text-meta text-text-secondary">Wallet</span>
          <span className="text-label tabular text-navy-900 font-semibold">
            ₹24,500
          </span>
        </Link>
      }
      headerAction={
        <Link
          href="#notifications"
          aria-label="Notifications, 5 unread"
          className="text-text-secondary relative grid size-11 place-items-center"
        >
          <Bell className="size-5" aria-hidden="true" />
          <span className="absolute top-1.5 right-1.5 min-w-4 rounded-[var(--radius-pill)] bg-orange-500 px-1 text-center text-[11px] leading-4 font-semibold text-white">
            5
          </span>
        </Link>
      }
    >
      <div className="mb-5">
        <h1 className="text-page-title text-navy-900">
          Good morning, Centre Admin
        </h1>
        <p className="text-body text-text-secondary mt-1">{CENTRE_SUBTITLE}</p>
        <p className="text-meta text-text-secondary mt-0.5">{DEMO_DATE}</p>
      </div>

      {/* --- KPIs (§11.1: four to six) ------------------------------------ */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-5 lg:gap-4">
        <KpiCard
          label="Total students"
          value="486"
          context="All time"
          icon={<Users />}
          accent="navy"
          href="#students"
        />
        <KpiCard
          label="Present today"
          value="412"
          context="84.8% of total"
          icon={<ClipboardCheck />}
          accent="green"
          href="#attendance"
        />
        <KpiCard
          label="Fees collected"
          value="₹2.84L"
          context="This month"
          icon={<IndianRupee />}
          accent="blue"
          href="#collected"
        />
        <KpiCard
          label="Pending fees"
          value="₹68,500"
          context="From 86 students"
          icon={<AlertTriangle />}
          accent="orange"
          href="#pending"
        />
        {/* The one highlighted tile. §3.4 caps saturated colour, so exactly one
            card per dashboard may carry a tint — the wallet, because a centre
            cannot place orders or issue certificates once it runs dry. */}
        <KpiCard
          className="col-span-2 lg:col-span-1"
          label="Wallet balance"
          value="₹24,500"
          icon={<Wallet />}
          accent="navy"
          highlight
          action={<Button className="w-full">Recharge</Button>}
        />
      </div>

      {/* --- Trends -------------------------------------------------------- */}
      <div className="mt-4 grid gap-4 lg:mt-6 lg:grid-cols-2">
        <ChartCard
          title="Student attendance"
          legend={[
            { label: "Present", kind: "bar" },
            { label: "Absent", kind: "line" },
          ]}
        >
          <TrendChart
            points={ATTENDANCE}
            caption="Daily student attendance through May 2026: students present and absent"
            lineLabel="Absent"
            barLabel="Present"
            emphasis="bar"
          />
        </ChartCard>

        <ChartCard title="Fee collection">
          <div className="tablet:grid-cols-2 grid gap-5 [&>*]:min-w-0">
            <DonutChart
              caption="Fee collection for May 2026: collected against pending"
              centreValue="₹2.84L"
              centreLabel="Total"
              segments={[
                {
                  label: "Collected",
                  value: 284000,
                  tone: "blue",
                  detail: "₹2,84,000 (80.6%)",
                },
                {
                  label: "Pending",
                  value: 68500,
                  tone: "orange",
                  detail: "₹68,500 (19.4%)",
                },
              ]}
            />
            <TrendChart
              points={COLLECTION}
              caption="Cumulative fee collection through May 2026, in rupees"
              lineLabel="Collected"
              labelEvery={3}
              formatValue={(v) => `₹${Math.round(v / 1000)}K`}
            />
          </div>
        </ChartCard>
      </div>

      {/* --- Operational panels -------------------------------------------- */}
      <div className="wide:grid-cols-[minmax(0,0.85fr)_minmax(0,1.2fr)_minmax(0,1.1fr)_minmax(0,0.85fr)] mt-4 grid gap-4 lg:mt-6 lg:grid-cols-2">
        <SectionCard title="Today's classes" href="#timetable">
          <ol className="space-y-2.5">
            {TODAYS_CLASSES.map((c) => (
              <li
                key={c.batch}
                className="border-border flex items-start gap-3 border-l-2 border-l-blue-700 py-1 pl-3"
              >
                <div className="min-w-0 flex-1">
                  <p className="text-body text-text font-medium">{c.course}</p>
                  <p className="text-meta text-text-secondary">
                    Batch {c.batch}
                  </p>
                </div>
                <div className="shrink-0 text-right">
                  <p className="text-meta tabular text-navy-900 font-semibold">
                    {c.startTime}
                  </p>
                  <p className="text-meta text-text-secondary">{c.room}</p>
                </div>
              </li>
            ))}
          </ol>
        </SectionCard>

        <SectionCard title="Recent admissions" href="#admissions">
          <PanelTable
            primaryHeader="Student"
            rows={RECENT_ADMISSIONS.map((s) => ({
              id: s.name,
              primary: (
                <span className="flex min-w-0 items-center gap-2">
                  <InitialsAvatar name={s.name} />
                  <span className="truncate">{s.name}</span>
                </span>
              ),
              secondary: s.course,
              cells: [
                { label: "Admitted", value: s.date, align: "right" as const },
              ],
            }))}
          />
        </SectionCard>

        <SectionCard title="Pending fees" href="#pending-fees">
          <PanelTable
            primaryHeader="Student"
            rows={PENDING_FEES.map((f) => ({
              id: f.name,
              primary: f.name,
              secondary: f.course,
              cells: [
                {
                  label: "Amount",
                  value: `₹${f.amount.toLocaleString("en-IN")}`,
                  align: "right" as const,
                },
                {
                  label: "Due",
                  align: "right" as const,
                  // §14: never colour alone. Overdue carries an icon and an
                  // accessible label as well as the red.
                  value: (
                    <span
                      className={cn(
                        "inline-flex items-center gap-1 whitespace-nowrap",
                        f.overdue && "text-danger font-medium",
                      )}
                    >
                      {f.overdue ? (
                        <>
                          <AlertTriangle
                            className="size-3.5 shrink-0"
                            aria-hidden="true"
                          />
                          <span className="sr-only">Overdue: </span>
                        </>
                      ) : null}
                      {f.dueDate}
                    </span>
                  ),
                },
              ],
            }))}
          />
        </SectionCard>

        <div className="grid gap-4">
          <SectionCard title="Staff attendance" href="#staff">
            <DonutChart
              size="sm"
              caption="Staff attendance today: 22 present, 2 absent of 24"
              centreValue="92%"
              centreLabel="Present"
              segments={[
                {
                  label: "Present",
                  value: 22,
                  tone: "green",
                  detail: "22 staff",
                },
                { label: "Absent", value: 2, tone: "muted", detail: "2 staff" },
              ]}
            />
            <p className="text-meta text-text-secondary mt-3">
              Total staff: 24
            </p>
          </SectionCard>

          {/* Quick actions. The mockup colours all four; §10.1 allows one most
              important action per region and §3.4 caps orange. See C4. */}
          <Card className="p-4 lg:p-5">
            <h2 className="text-card-title text-navy-900 mb-3">
              Quick actions
            </h2>
            <div className="grid gap-2">
              <Button className="justify-start">
                <UserPlus /> Add student
              </Button>
              <Button variant="secondary" className="justify-start">
                <CalendarCheck /> Mark attendance
              </Button>
              <Button variant="secondary" className="justify-start">
                <Receipt /> Collect fee
              </Button>
              <Button variant="secondary" className="justify-start">
                <GraduationCap /> Create exam
              </Button>
            </div>
          </Card>
        </div>
      </div>

      {/* --- Recent activity ----------------------------------------------- */}
      <SectionCard
        title="Recent activity"
        href="#activity"
        className="mt-4 lg:mt-6"
      >
        <ActivityStrip items={ACTIVITY} />
      </SectionCard>
    </PortalShell>
  );
}
