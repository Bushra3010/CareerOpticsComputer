import Link from "next/link";
import {
  Award,
  Bell,
  BookOpen,
  Building2,
  CheckCircle2,
  ClipboardCheck,
  FileText,
  GraduationCap,
  IndianRupee,
  Megaphone,
  Plus,
  Users,
  Wallet,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, KpiCard } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/badge";
import { EmptyState, PermissionDeniedState } from "@/components/states";
import { TrendChart } from "@/components/charts/trend-chart";
import { PanelTable } from "@/components/tables/panel-table";
import { ChartCard, SectionCard } from "@/components/dashboard";
import { createClient } from "@/lib/db/server";
import { formatPaise } from "@/lib/money";
import { getAdminOverview } from "@/features/dashboard/admin-queries";

/** Compact Indian notation for headline figures: 1860000 paise → ₹18.6K. */
function compactRupees(paiseValue: number): string {
  const rupees = paiseValue / 100;
  if (rupees >= 10000000) return `₹${(rupees / 10000000).toFixed(2)}Cr`;
  if (rupees >= 100000) return `₹${(rupees / 100000).toFixed(2)}L`;
  if (rupees >= 1000) return `₹${Math.round(rupees / 1000)}K`;
  return `₹${rupees.toLocaleString("en-IN")}`;
}

const IST = "Asia/Kolkata";

function shortDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    timeZone: IST,
  });
}

function shortDateTime(iso: string): string {
  return new Date(iso).toLocaleString("en-IN", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: IST,
  });
}

function greeting(): string {
  const istHour = Number(
    new Date().toLocaleString("en-IN", {
      hour: "numeric",
      hour12: false,
      timeZone: IST,
    }),
  );
  if (istHour < 12) return "Good morning";
  if (istHour < 17) return "Good afternoon";
  return "Good evening";
}

export default async function AdminDashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, is_platform_super_admin")
    .eq("id", user!.id)
    .maybeSingle();

  /* Every figure below is a cross-tenant aggregate, so gate the whole page on
     the platform-admin flag rather than rendering zeros to a signed-in centre
     user — zeros produced by RLS look like real data. */
  if (!profile?.is_platform_super_admin) {
    return (
      <div>
        <h1 className="text-page-title text-navy-900">Platform dashboard</h1>
        <PermissionDeniedState className="mt-8" />
      </div>
    );
  }

  const d = await getAdminOverview();

  const activePercent =
    d.totalCentres > 0
      ? Math.round((d.activeCentres / d.totalCentres) * 1000) / 10
      : 0;

  const todayIst = new Date().toLocaleDateString("en-IN", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: IST,
  });

  return (
    <div>
      <div className="mb-5">
        <h1 className="text-page-title text-navy-900">
          {greeting()}, {profile.full_name ?? "Super Admin"}
        </h1>
        <p className="text-body text-text-secondary mt-1">{todayIst}</p>
      </div>

      {/* --- KPIs (§11.1: four to six) ------------------------------------ */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-4">
        <KpiCard
          label="Total centres"
          value={d.totalCentres.toLocaleString("en-IN")}
          context="All time"
          icon={<Building2 />}
          accent="navy"
          href="/admin/centres"
        />
        <KpiCard
          label="Active centres"
          value={d.activeCentres.toLocaleString("en-IN")}
          context={
            d.totalCentres > 0 ? `${activePercent}% of total` : "None yet"
          }
          icon={<CheckCircle2 />}
          accent="green"
          href="/admin/centre-applications"
        />
        <KpiCard
          label="Total students"
          value={d.totalStudents.toLocaleString("en-IN")}
          context="Across all centres"
          icon={<Users />}
          accent="blue"
        />
        <KpiCard
          label="Platform revenue"
          value={compactRupees(Number(d.revenueThisMonth))}
          context="This month"
          icon={<IndianRupee />}
          accent="orange"
        />
      </div>

      {/* --- Trends ------------------------------------------------------- */}
      <div className="mt-4 grid gap-4 lg:mt-6 lg:grid-cols-2">
        <ChartCard
          title="Centre growth"
          legend={[
            { label: "Total centres", kind: "line" },
            { label: "New centres", kind: "bar" },
          ]}
        >
          <TrendChart
            points={d.centreGrowth}
            caption="Centres over the last 30 days: running total, and new centres per day"
            lineLabel="Total centres"
            barLabel="New centres"
          />
        </ChartCard>

        <ChartCard
          title="Revenue overview"
          legend={[{ label: "Revenue (₹)", kind: "line" }]}
        >
          <TrendChart
            points={d.revenueTrend}
            caption="Cumulative fee revenue over the last 30 days, in rupees"
            lineLabel="Revenue"
            formatValue={(v) =>
              v >= 100000
                ? `₹${(v / 100000).toFixed(1)}L`
                : v >= 1000
                  ? `₹${Math.round(v / 1000)}K`
                  : `₹${Math.round(v)}`
            }
          />
        </ChartCard>
      </div>

      {/* --- Operational panels ------------------------------------------- */}
      <div className="wide:grid-cols-4 mt-4 grid gap-4 lg:mt-6 lg:grid-cols-2">
        <SectionCard
          title="Recent centre applications"
          href="/admin/centre-applications"
        >
          {d.recentApplications.length === 0 ? (
            <EmptyState
              title="No applications yet"
              description="Applications submitted from the public site appear here."
            />
          ) : (
            <PanelTable
              primaryHeader="Centre"
              trailingHeader="Status"
              rows={d.recentApplications.map((a) => ({
                id: a.id,
                primary: a.centreName,
                secondary: a.applicantName,
                cells: [{ label: "District", value: a.district }],
                trailing: <StatusBadge status={a.status} />,
              }))}
            />
          )}
        </SectionCard>

        <SectionCard title="Top performing centres" href="/admin">
          {d.topCentres.length === 0 ? (
            <EmptyState
              title="No centres yet"
              description="Approve a centre application to see performance here."
            />
          ) : (
            <PanelTable
              primaryHeader="Centre"
              rows={d.topCentres.map((c) => ({
                id: c.id,
                primary: c.name,
                cells: [
                  {
                    label: "Students",
                    value: c.students.toLocaleString("en-IN"),
                    align: "right" as const,
                  },
                  {
                    label: "Revenue",
                    value: compactRupees(Number(c.revenue)),
                    align: "right" as const,
                  },
                ],
              }))}
            />
          )}
        </SectionCard>

        <SectionCard
          title="Pending approvals"
          href="/admin/centre-applications"
        >
          {d.pendingApprovals.length === 0 ? (
            <EmptyState
              title="Nothing awaiting review"
              description="New applications queue here for head-office review."
            />
          ) : (
            <PanelTable
              primaryHeader="Application"
              rows={d.pendingApprovals.map((a) => ({
                id: a.id,
                primary: a.centreName,
                secondary: a.applicantName,
                cells: [
                  {
                    label: "Applied",
                    value: shortDate(a.appliedOn),
                    align: "right" as const,
                  },
                ],
              }))}
            />
          )}
        </SectionCard>

        {/* Quick actions. §10.1 allows one most important action per region,
            and §3.4 caps orange — see C4(b) in docs/02-open-conflicts.md. */}
        <Card className="p-4 lg:p-5">
          <h2 className="text-card-title text-navy-900 mb-3">Quick actions</h2>
          <div className="grid gap-2">
            <Button asChild className="justify-start">
              <Link href="/admin/centre-applications">
                <ClipboardCheck /> Review applications
              </Link>
            </Button>
            <Button asChild variant="secondary" className="justify-start">
              <Link href="/partner-with-us/apply">
                <Plus /> New centre application
              </Link>
            </Button>
            <Button asChild variant="secondary" className="justify-start">
              <Link href="/admin/centres">
                <Building2 /> Manage centres
              </Link>
            </Button>
            <Button asChild variant="secondary" className="justify-start">
              <Link href="/admin/academics/courses">
                <BookOpen /> Manage courses
              </Link>
            </Button>
            <Button asChild variant="secondary" className="justify-start">
              <Link href="/admin/wallets">
                <Wallet /> Recharge wallet
              </Link>
            </Button>
            <Button asChild variant="secondary" className="justify-start">
              <Link href="/courses">
                <BookOpen /> Course catalogue
              </Link>
            </Button>
            <Button asChild variant="secondary" className="justify-start">
              <Link href="/verify">
                <Award /> Public verification
              </Link>
            </Button>
          </div>
        </Card>
      </div>

      {/* --- Transactions and summary ------------------------------------- */}
      <div className="mt-4 grid gap-4 lg:mt-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
        <SectionCard title="Recent transactions" href="/admin">
          {d.recentTransactions.length === 0 ? (
            <EmptyState
              title="No payments posted yet"
              description="Fee payments recorded by any centre appear here as they are posted."
            />
          ) : (
            <PanelTable
              primaryHeader="Receipt"
              rows={d.recentTransactions.map((t) => ({
                id: t.id,
                primary: <span className="tabular">{t.receiptNumber}</span>,
                secondary: t.centreName,
                cells: [
                  {
                    label: "Amount",
                    value: formatPaise(t.amount, { showDecimals: false }),
                    align: "right" as const,
                  },
                  {
                    label: "Posted",
                    value: shortDateTime(t.postedAt),
                    align: "right" as const,
                  },
                ],
              }))}
            />
          )}
        </SectionCard>

        <Card className="p-4 lg:p-5">
          <h2 className="text-card-title text-navy-900 mb-3">
            Platform summary
          </h2>
          <ul className="divide-border divide-y">
            {[
              {
                label: "Published courses",
                value: d.summary.courses,
                icon: GraduationCap,
                href: "/courses",
              },
              {
                label: "Result publications",
                value: d.summary.resultPublications,
                icon: Award,
                href: "/admin",
              },
              {
                label: "Certificates issued",
                value: d.summary.certificatesIssued,
                icon: FileText,
                href: "/admin",
              },
              {
                label: "New enquiries",
                value: d.summary.openLeads,
                icon: Megaphone,
                href: "/admin",
              },
            ].map((row) => {
              const Icon = row.icon;
              return (
                <li key={row.label}>
                  <Link
                    href={row.href}
                    className="hover:bg-surface-subtle -mx-2 flex min-h-11 items-center gap-3 rounded-[var(--radius-chip)] px-2"
                  >
                    <Icon
                      className="text-text-muted size-[18px] shrink-0"
                      aria-hidden="true"
                    />
                    <span className="text-body text-text min-w-0 flex-1 truncate">
                      {row.label}
                    </span>
                    <span className="text-body tabular text-navy-900 font-semibold">
                      {row.value.toLocaleString("en-IN")}
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </Card>
      </div>

      {/* --- Recent activity, straight off the audit log ------------------- */}
      <SectionCard
        title="Recent activity"
        href="/admin"
        className="mt-4 lg:mt-6"
      >
        {d.recentActivity.length === 0 ? (
          <EmptyState
            title="No recorded activity yet"
            description="Every privileged action is written to the audit log and surfaces here."
          />
        ) : (
          <ul className="tablet:grid-cols-2 wide:grid-cols-5 grid gap-3 lg:grid-cols-3">
            {d.recentActivity.map((a) => (
              <li key={a.id} className="flex gap-3">
                <span
                  className="grid size-9 shrink-0 place-items-center rounded-[var(--radius-chip)] bg-blue-100 text-blue-700"
                  aria-hidden="true"
                >
                  <Bell className="size-[18px]" />
                </span>
                <div className="min-w-0">
                  <p className="text-label text-text font-semibold">
                    {a.action}
                  </p>
                  <p className="text-meta text-text-secondary truncate">
                    {a.reason ?? a.tableName}
                  </p>
                  <p className="text-meta text-text-secondary mt-0.5">
                    {shortDateTime(a.occurredAt)}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </SectionCard>
    </div>
  );
}
