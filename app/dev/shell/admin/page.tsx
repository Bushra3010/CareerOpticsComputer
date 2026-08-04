"use client";

import * as React from "react";
import Link from "next/link";
import {
  Bell,
  Building2,
  CheckCircle2,
  ClipboardCheck,
  IndianRupee,
  Megaphone,
  Plus,
  Users,
  Wallet,
} from "lucide-react";
import { PortalShell } from "@/components/layout/portal-shell";
import { TopBarSearch } from "@/components/layout/top-bar";
import { Button } from "@/components/ui/button";
import { Card, KpiCard } from "@/components/ui/card";
import { Badge, StatusBadge } from "@/components/ui/badge";
import { TrendChart } from "@/components/charts/trend-chart";
import { PanelTable } from "@/components/tables/panel-table";
import { ActivityStrip, ChartCard, SectionCard } from "@/components/dashboard";
import { ADMIN_BOTTOM_NAV, ADMIN_NAV } from "@/lib/navigation/admin-nav";
import {
  ACTIVITY,
  APPLICATIONS,
  APPROVALS,
  CENTRE_GROWTH,
  DEMO_DATE,
  PLATFORM_SUMMARY,
  REVENUE,
  TOP_CENTRES,
  TRANSACTIONS,
  lakh,
} from "./demo-data";

/**
 * Super Admin dashboard — shell preview.
 *
 * Follows the owner's mockup for layout and information architecture, and the
 * style guide for colour and iconography. The four deviations are listed in
 * docs/02-open-conflicts.md as C4; each is a small change if the owner prefers
 * the mockup's treatment.
 *
 * Synthetic content only. This route 404s in production, and it moves to
 * app/admin/page.tsx backed by real queries in Phase 1 — PRD §20.1 forbids
 * scaffolding screens with fake data on a production path.
 */
export default function AdminDashboardPreview() {
  return (
    <PortalShell
      navGroups={ADMIN_NAV}
      bottomNavItems={ADMIN_BOTTOM_NAV}
      homeHref="/dev/shell/admin"
      profileHref="/dev/shell/admin"
      portalName="Super Admin"
      title="Dashboard"
      breadcrumbs={[{ label: "Platform", href: "#" }, { label: "Dashboard" }]}
      notificationCount={5}
      searchSlot={
        <TopBarSearch placeholder="Search centres, owners, students, courses" />
      }
      searchWidth="wide"
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
      {/* Greeting. §11.1 desktop order: page title and date/context first. */}
      <div className="mb-5">
        <h1 className="text-page-title text-navy-900">
          Good morning, Super Admin
        </h1>
        <p className="text-body text-text-secondary mt-1">{DEMO_DATE}</p>
      </div>

      {/* --- KPIs (§11.1: four to six) ---------------------------------- */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-4">
        <KpiCard
          label="Total centres"
          value="128"
          context="All time"
          icon={<Building2 />}
          accent="navy"
          href="#centres"
        />
        <KpiCard
          label="Active centres"
          value="116"
          context="90.6% of total"
          icon={<CheckCircle2 />}
          accent="green"
          href="#centres-active"
        />
        <KpiCard
          label="Total students"
          value="12,840"
          context="Across all centres"
          icon={<Users />}
          accent="blue"
          href="#students"
        />
        <KpiCard
          label="Platform revenue"
          value="₹18.6L"
          context="This month"
          icon={<IndianRupee />}
          accent="orange"
          href="#revenue"
        />
      </div>

      {/* --- Trends ------------------------------------------------------ */}
      <div className="mt-4 grid gap-4 lg:mt-6 lg:grid-cols-2">
        <ChartCard
          title="Centre growth"
          legend={[
            { label: "Total centres", kind: "line" as const },
            { label: "New centres", kind: "bar" as const },
          ]}
        >
          <TrendChart
            points={CENTRE_GROWTH}
            caption="Centre growth through May 2026: total centres and new centres per day"
            lineLabel="Total centres"
            barLabel="New centres"
          />
        </ChartCard>

        <ChartCard
          title="Revenue overview"
          legend={[{ label: "Revenue (₹)", kind: "line" as const }]}
        >
          <TrendChart
            points={REVENUE}
            caption="Cumulative platform revenue through May 2026, in rupees"
            lineLabel="Revenue"
            formatValue={lakh}
          />
        </ChartCard>
      </div>

      {/* --- Operational panels ------------------------------------------ */}
      <div className="wide:grid-cols-4 mt-4 grid gap-4 lg:mt-6 lg:grid-cols-2">
        <SectionCard title="Recent centre applications" href="#applications">
          <PanelTable
            primaryHeader="Centre"
            trailingHeader="Status"
            rows={APPLICATIONS.map((a) => ({
              id: a.centre,
              primary: a.centre,
              secondary: a.owner,
              cells: [{ label: "District", value: a.district }],
              trailing: <StatusBadge status="pending" />,
            }))}
          />
        </SectionCard>

        <SectionCard title="Top performing centres" href="#top-centres">
          <PanelTable
            primaryHeader="Centre"
            rows={TOP_CENTRES.map((c) => ({
              id: c.name,
              primary: c.name,
              cells: [
                {
                  label: "Students",
                  value: c.students.toLocaleString("en-IN"),
                  align: "right" as const,
                },
                {
                  label: "Revenue",
                  value: lakh(c.revenue),
                  align: "right" as const,
                },
              ],
            }))}
          />
        </SectionCard>

        <SectionCard title="Pending approvals" href="#approvals">
          <PanelTable
            primaryHeader="Item"
            rows={APPROVALS.map((a) => ({
              id: `${a.name}-${a.type}`,
              primary: a.name,
              cells: [
                { label: "Type", value: a.type },
                { label: "Applied", value: a.appliedOn },
              ],
            }))}
          />
        </SectionCard>

        {/* Quick actions. The mockup gives each button its own colour; §10.1
            allows "one most important action per region" and §3.4 caps orange
            at roughly a tenth of the visual area. One orange primary, the rest
            secondary — see conflict C4. */}
        <Card className="p-4 lg:p-5">
          <h2 className="text-card-title text-navy-900 mb-3">Quick actions</h2>
          <div className="grid gap-2">
            <Button className="justify-start">
              <Plus /> Add centre
            </Button>
            <Button variant="secondary" className="justify-start">
              <ClipboardCheck /> Approve centre
            </Button>
            <Button variant="secondary" className="justify-start">
              <Wallet /> Recharge wallet
            </Button>
            <Button variant="secondary" className="justify-start">
              <Megaphone /> Create notice
            </Button>
          </div>
        </Card>
      </div>

      {/* --- Transactions and summary ------------------------------------ */}
      <div className="mt-4 grid gap-4 lg:mt-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
        <SectionCard title="Recent transactions" href="#transactions">
          <PanelTable
            primaryHeader="Transaction"
            trailingHeader="Status"
            rows={TRANSACTIONS.map((t) => ({
              id: t.id,
              primary: <span className="tabular">{t.id}</span>,
              secondary: t.type,
              cells: [
                { label: "Centre", value: t.centre, desktopOnly: true },
                {
                  label: "Amount",
                  value: `₹${t.amount.toLocaleString("en-IN")}`,
                  align: "right" as const,
                },
                { label: "When", value: t.when },
              ],
              trailing: <Badge tone="success">Success</Badge>,
            }))}
          />
        </SectionCard>

        <Card className="p-4 lg:p-5">
          <h2 className="text-card-title text-navy-900 mb-3">
            Platform summary
          </h2>
          <ul className="divide-border divide-y">
            {PLATFORM_SUMMARY.map((row) => {
              const Icon = row.icon;
              return (
                <li key={row.label}>
                  <Link
                    href="#summary"
                    className="hover:bg-surface-subtle -mx-2 flex min-h-11 items-center gap-3 rounded-[var(--radius-chip)] px-2"
                  >
                    <Icon
                      className="text-text-muted size-[18px] shrink-0"
                      aria-hidden="true"
                    />
                    <span className="text-body text-text min-w-0 flex-1 truncate">
                      {row.label}
                    </span>
                    <span className="text-body text-navy-900 tabular font-semibold">
                      {row.value}
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </Card>
      </div>

      {/* --- Recent activity --------------------------------------------- */}
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
