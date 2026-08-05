"use client";

import * as React from "react";
import Link from "next/link";
import {
  Bell,
  BookOpen,
  CalendarCheck,
  CalendarClock,
  Download,
  FileText,
  Headphones,
  IndianRupee,
  Trophy,
  Video,
} from "lucide-react";
import { PortalShell } from "@/components/layout/portal-shell";
import { TopBarSearch } from "@/components/layout/top-bar";
import { Button } from "@/components/ui/button";
import { Card, KpiCard } from "@/components/ui/card";
import { Badge, StatusBadge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { CategoryBars } from "@/components/charts/category-bars";
import { PanelTable } from "@/components/tables/panel-table";
import {
  ActivityStrip,
  InitialsAvatar,
  SectionCard,
} from "@/components/dashboard";
import { STUDENT_BOTTOM_NAV, STUDENT_NAV } from "@/lib/navigation/student-nav";
import {
  FEE_SUMMARY,
  NOTICES,
  RECENT_RESULTS,
  STUDENT,
  STUDY_MATERIALS,
  SUBJECT_PROGRESS,
  TODAYS_CLASSES,
  UPCOMING_EXAMS,
  WEEK_ATTENDANCE,
} from "./demo-data";

/**
 * Student portal dashboard — shell preview.
 *
 * Follows the owner's mockup for layout and information architecture, and the
 * style guide for colour and iconography. Deviations are logged as C4 in
 * docs/02-open-conflicts.md and are shared across all three dashboards.
 *
 * Synthetic content only. This route 404s in production; it becomes
 * app/student/page.tsx on real queries in Phase 1 (PRD §20.1).
 */
export default function StudentDashboardPreview() {
  const rupees = (n: number) => `₹${n.toLocaleString("en-IN")}`;
  const paidPercent = Math.round(
    (FEE_SUMMARY.paidRupees / FEE_SUMMARY.totalRupees) * 100,
  );

  return (
    <PortalShell
      navGroups={STUDENT_NAV}
      bottomNavItems={STUDENT_BOTTOM_NAV}
      homeHref="/dev/shell/student"
      profileHref="/dev/shell/student"
      portalName="Student portal"
      title="Dashboard"
      breadcrumbs={[
        { label: STUDENT.course, href: "#" },
        { label: "Dashboard" },
      ]}
      notificationCount={3}
      searchSlot={
        <TopBarSearch placeholder="Search courses, materials, exams" />
      }
      searchWidth="wide"
      headerAction={
        <Link
          href="#notifications"
          aria-label="Notifications, 3 unread"
          className="text-text-secondary relative grid size-11 place-items-center"
        >
          <Bell className="size-5" aria-hidden="true" />
          <span className="absolute top-1.5 right-1.5 min-w-4 rounded-[var(--radius-pill)] bg-orange-500 px-1 text-center text-[11px] leading-4 font-semibold text-white">
            3
          </span>
        </Link>
      }
    >
      <div className="mb-5">
        <h1 className="text-page-title text-navy-900">
          Welcome back, {STUDENT.firstName}
        </h1>
        <p className="text-body text-text-secondary mt-1">
          {STUDENT.course} · Batch {STUDENT.batch}
        </p>
      </div>

      {/* --- KPIs and identity ------------------------------------------- */}
      <div className="wide:grid-cols-[minmax(0,3fr)_minmax(0,1fr)] grid gap-4">
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-4">
          <KpiCard
            label="Course progress"
            value="68%"
            context="In progress"
            icon={<BookOpen />}
            accent="blue"
            progress={68}
            href="#course"
          />
          <KpiCard
            label="Attendance"
            value="92%"
            context="Present"
            icon={<CalendarCheck />}
            accent="green"
            progress={92}
            progressTone="green"
            href="#attendance"
          />
          <KpiCard
            label="Fee balance"
            value={rupees(FEE_SUMMARY.balanceRupees)}
            context={`${paidPercent}% paid`}
            icon={<IndianRupee />}
            accent="orange"
            progress={paidPercent}
            progressTone="orange"
            href="#fees"
          />
          {/* The mockup gives this a red disc. §3.3 reserves red for errors and
              destructive actions; an upcoming exam is information, not a
              failure — see conflict C4(g). */}
          <KpiCard
            label="Next exam"
            value="12 Jun"
            context="MS Office · Theory"
            icon={<CalendarClock />}
            accent="navy"
            href="#exams"
          />
        </div>

        {/* Identity card. Initials rather than a photograph: student photos are
            personal data behind short-lived signed URLs (PRD §10.7). */}
        <Card className="p-4 lg:p-5">
          <div className="flex items-center gap-3">
            <InitialsAvatar name={STUDENT.name} className="text-body size-12" />
            <div className="min-w-0">
              <p className="text-card-title text-navy-900 truncate">
                {STUDENT.name}
              </p>
              <Badge tone="info" icon={null} className="mt-1">
                {STUDENT.course} student
              </Badge>
            </div>
          </div>
          <dl className="border-border mt-4 space-y-2 border-t pt-3">
            {[
              ["Registration", STUDENT.registrationNumber],
              ["Batch", STUDENT.batch],
              ["Centre", STUDENT.centre],
            ].map(([label, value]) => (
              <div
                key={label}
                className="flex items-baseline justify-between gap-3"
              >
                <dt className="text-meta text-text-secondary shrink-0">
                  {label}
                </dt>
                <dd className="text-meta tabular text-navy-900 min-w-0 truncate text-right font-medium">
                  {value}
                </dd>
              </div>
            ))}
          </dl>
        </Card>
      </div>

      {/* --- Progress, attendance, classes, actions ----------------------- */}
      <div className="wide:grid-cols-4 mt-4 grid gap-4 lg:mt-6 lg:grid-cols-2">
        <SectionCard title="My course progress" href="#course">
          <ul className="space-y-3.5">
            {SUBJECT_PROGRESS.map((s) => (
              <li key={s.subject}>
                <div className="flex items-baseline justify-between gap-3">
                  <p className="text-body text-text min-w-0 truncate font-medium">
                    {s.subject}
                  </p>
                  <span className="text-meta tabular text-navy-900 shrink-0 font-semibold">
                    {s.percent}%
                  </span>
                </div>
                <Progress
                  value={s.percent}
                  tone={s.percent === 100 ? "green" : "blue"}
                  label={`${s.subject} progress`}
                  className="mt-1.5"
                />
                <p className="text-meta text-text-secondary mt-1">{s.status}</p>
              </li>
            ))}
          </ul>
        </SectionCard>

        <SectionCard title="Attendance this week" href="#attendance">
          <CategoryBars
            bars={WEEK_ATTENDANCE}
            caption="Attendance for the week of 26 May 2026"
          />
        </SectionCard>

        <SectionCard title="Today's classes" href="#schedule">
          <ol className="space-y-2.5">
            {TODAYS_CLASSES.map((c) => (
              <li
                key={c.subject}
                className="flex items-start gap-3 border-l-2 border-l-blue-700 py-1 pl-3"
              >
                <div className="min-w-0 flex-1">
                  <p className="text-body text-text truncate font-medium">
                    {c.subject}
                  </p>
                  <p className="text-meta text-text-secondary tabular">
                    {c.startTime} – {c.endTime}
                  </p>
                </div>
                <span className="text-meta text-text-secondary shrink-0">
                  {c.room}
                </span>
              </li>
            ))}
          </ol>
        </SectionCard>

        {/* Quick actions. The mockup colours all four; §10.1 allows one most
            important action per region — see C4(b). */}
        <Card className="p-4 lg:p-5">
          <h2 className="text-card-title text-navy-900 mb-3">Quick actions</h2>
          <div className="grid gap-2">
            <Button className="justify-start">
              <Video /> Join class
            </Button>
            <Button variant="secondary" className="justify-start">
              <Download /> Download receipt
            </Button>
            <Button variant="secondary" className="justify-start">
              <Trophy /> View result
            </Button>
            <Button variant="secondary" className="justify-start">
              <Headphones /> Get support
            </Button>
          </div>
        </Card>
      </div>

      {/* --- Exams, results, materials, fees ------------------------------ */}
      <div className="wide:grid-cols-4 mt-4 grid gap-4 lg:mt-6 lg:grid-cols-2">
        <SectionCard title="Upcoming exams" href="#exams">
          <ul className="space-y-2.5">
            {UPCOMING_EXAMS.map((e) => (
              <li key={e.subject} className="flex items-center gap-3">
                <span
                  className="grid size-11 shrink-0 place-items-center rounded-[var(--radius-chip)] bg-blue-100 leading-none"
                  aria-hidden="true"
                >
                  <span className="text-body tabular text-navy-900 font-bold">
                    {e.day}
                  </span>
                  <span className="text-[10px] font-semibold text-blue-700 uppercase">
                    {e.month}
                  </span>
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-body text-text truncate font-medium">
                    {e.subject}
                  </p>
                  <p className="text-meta text-text-secondary tabular">
                    <span className="sr-only">
                      {e.day} {e.month},{" "}
                    </span>
                    {e.time} · {e.kind}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </SectionCard>

        <SectionCard title="Recent results" href="#results">
          <PanelTable
            primaryHeader="Subject"
            trailingHeader="Status"
            rows={RECENT_RESULTS.map((r) => ({
              id: r.subject,
              primary: r.subject,
              // Marks and grade read as one fact about the result, and a
              // quarter-width panel cannot hold them as separate columns
              // alongside a status badge without clipping all three.
              secondary: `${r.marks}/100 · Grade ${r.grade}`,
              cells: [],
              trailing: (
                <StatusBadge
                  status={r.passed ? "passed" : "failed"}
                  label={r.passed ? "Pass" : "Fail"}
                />
              ),
            }))}
          />
        </SectionCard>

        <SectionCard title="Latest study materials" href="#materials">
          <ul className="divide-border divide-y">
            {STUDY_MATERIALS.map((m) => (
              <li key={m.title}>
                <a
                  href="#download"
                  className="hover:bg-surface-subtle -mx-2 flex min-h-11 items-center gap-3 rounded-[var(--radius-chip)] px-2 py-2"
                >
                  <FileText
                    className="text-danger size-5 shrink-0"
                    aria-hidden="true"
                  />
                  <span className="min-w-0 flex-1">
                    <span className="text-body text-text block truncate">
                      {m.title}
                    </span>
                    <span className="text-meta text-text-secondary block">
                      PDF · {m.size}
                    </span>
                  </span>
                  <Download
                    className="text-text-muted size-4 shrink-0"
                    aria-hidden="true"
                  />
                  <span className="sr-only">Download</span>
                </a>
              </li>
            ))}
          </ul>
        </SectionCard>

        <SectionCard title="Fee summary" href="#fees">
          <dl className="space-y-2.5">
            <div className="flex items-baseline justify-between gap-3">
              <dt className="text-body text-text-secondary">Total fees</dt>
              <dd className="text-body tabular text-navy-900 font-medium">
                {rupees(FEE_SUMMARY.totalRupees)}
              </dd>
            </div>
            <div className="flex items-baseline justify-between gap-3">
              <dt className="text-body text-text-secondary">Paid</dt>
              <dd className="text-body tabular text-success font-medium">
                {rupees(FEE_SUMMARY.paidRupees)}
              </dd>
            </div>
            <div className="border-border flex items-baseline justify-between gap-3 border-t pt-2.5">
              <dt className="text-body text-text font-semibold">Balance due</dt>
              <dd className="text-card-title tabular text-danger font-bold">
                {rupees(FEE_SUMMARY.balanceRupees)}
              </dd>
            </div>
          </dl>
          <Progress
            value={paidPercent}
            tone="green"
            label="Fees paid"
            className="mt-3"
          />
          <Button className="mt-4 w-full">Pay now</Button>
        </SectionCard>
      </div>

      {/* --- Notices ------------------------------------------------------ */}
      <SectionCard title="Notices" href="#notices" className="mt-4 lg:mt-6">
        <ActivityStrip items={NOTICES} />
      </SectionCard>
    </PortalShell>
  );
}
