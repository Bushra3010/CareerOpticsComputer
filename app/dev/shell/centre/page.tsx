"use client";

import {
  CalendarCheck,
  Receipt,
  Search,
  ShoppingBag,
  UserPlus,
  Wallet,
} from "lucide-react";
import {
  FilterBar,
  PageHeader,
  PortalShell,
} from "@/components/layout/portal-shell";
import { TopBarSearch } from "@/components/layout/top-bar";
import { Button } from "@/components/ui/button";
import { Card, KpiCard } from "@/components/ui/card";
import { Alert } from "@/components/ui/alert";
import { StatusBadge } from "@/components/ui/badge";
import { Select } from "@/components/ui/input";
import { MobileList, MobileListItem } from "@/components/tables/mobile-list";
import { CENTRE_BOTTOM_NAV, CENTRE_NAV } from "@/lib/navigation/centre-nav";

/**
 * Shell preview — demonstrates the desktop shell (§8) and the mobile app shell
 * (§9) with the Centre portal navigation. Synthetic content only.
 *
 * Review at 360, 390, 768, 1024 and 1440px.
 */
export default function CentreShellPreview() {
  return (
    <PortalShell
      navGroups={CENTRE_NAV}
      bottomNavItems={CENTRE_BOTTOM_NAV}
      homeHref="/dev/shell/centre"
      profileHref="/dev/shell/centre"
      title="Dashboard"
      breadcrumbs={[
        { label: "Delhi Central", href: "#" },
        { label: "Dashboard" },
      ]}
      notificationCount={3}
      searchSlot={<TopBarSearch placeholder="Search students, receipts" />}
      walletSlot={
        <a
          href="#wallet"
          className="border-border bg-canvas flex h-10 items-center gap-2 rounded-[var(--radius-control)] border px-3"
        >
          <Wallet className="text-text-secondary size-4" aria-hidden="true" />
          <span className="text-meta text-text-secondary">Wallet</span>
          <span className="text-label text-navy-900 tabular font-semibold">
            ₹18,450
          </span>
        </a>
      }
      // The app header carries a *secondary* contextual action. The primary
      // action lives in PageHeader so it is not duplicated (§9.1).
      headerAction={
        <Button size="icon" variant="tertiary" aria-label="Search">
          <Search />
        </Button>
      }
    >
      <PageHeader
        title="Dashboard"
        description="Delhi Central · CO-DL01 · 4 August 2026"
        primaryAction={
          <Button>
            <UserPlus /> New student
          </Button>
        }
        secondaryActions={
          <Button variant="secondary" className="max-lg:hidden">
            <CalendarCheck /> Take attendance
          </Button>
        }
      />

      {/* §11.1: critical alerts and required actions come before metrics. */}
      <Alert
        tone="warning"
        title="4 admissions are waiting for document review"
        recovery="Open the applications list to review identity proofs before Friday."
        className="mb-4"
      />

      {/* Mobile quick actions — §11.1 mobile order puts these above the KPIs. */}
      <div className="mb-4 grid grid-cols-2 gap-3 lg:hidden">
        <QuickAction icon={<UserPlus />} label="New student" />
        <QuickAction icon={<CalendarCheck />} label="Take attendance" />
        <QuickAction icon={<Receipt />} label="Record payment" />
        <QuickAction icon={<ShoppingBag />} label="Place order" />
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-4">
        <KpiCard
          label="Active students"
          value="1,284"
          context="+38 this month"
        />
        <KpiCard
          label="Collected in August"
          value="₹4,82,150"
          context="₹1,12,400 still due"
        />
        <KpiCard
          label="Attendance today"
          value="86%"
          context="17 below the 75% minimum"
        />
        <KpiCard
          label="Open tickets"
          value="2"
          context="1 breaching SLA today"
        />
      </div>

      <FilterBar
        className="mt-6"
        mobileTrigger={
          <Button variant="secondary" className="w-full">
            Filter recent activity
          </Button>
        }
      >
        <Select className="w-44" aria-label="Batch">
          <option>All batches</option>
          <option>DCA-M-07</option>
        </Select>
        <Select className="w-44" aria-label="Status">
          <option>All statuses</option>
          <option>Active</option>
        </Select>
      </FilterBar>

      <h2 className="text-section text-navy-900 mb-3">Recent admissions</h2>
      <MobileList label="Recent admissions">
        <MobileListItem
          title="Ananya Deshmukh"
          subtitle="CO-DL01-26-DCA-00042"
          status={<StatusBadge status="active" />}
          href="#"
          fields={[
            { label: "Course", value: "DCA" },
            { label: "Admitted", value: "2 Aug 2026" },
          ]}
        />
        <MobileListItem
          title="Rohit Kumar Yadav"
          subtitle="CO-DL01-26-ADCA-00118"
          status={<StatusBadge status="pending_approval" />}
          href="#"
          fields={[
            { label: "Course", value: "ADCA" },
            { label: "Applied", value: "3 Aug 2026" },
          ]}
        />
      </MobileList>

      <Card className="mt-6 p-4 lg:p-6">
        <p className="text-meta text-text-secondary">
          Below 1024px this page is the mobile app shell — 56px header, 64px
          bottom navigation, no sidebar and no breadcrumb. At 1024px and above
          it becomes the desktop shell with the 256px navy sidebar. Collapse the
          sidebar with the control at its foot to check the 72px state.
        </p>
      </Card>
    </PortalShell>
  );
}

function QuickAction({
  icon,
  label,
}: {
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <button
      type="button"
      className="border-border bg-surface active:bg-surface-subtle flex min-h-[76px] flex-col items-start justify-between rounded-[var(--radius-card)] border p-3 text-left"
    >
      <span className="text-orange-500 [&_svg]:size-5" aria-hidden="true">
        {icon}
      </span>
      <span className="text-label text-text font-semibold">{label}</span>
    </button>
  );
}
