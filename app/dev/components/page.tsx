"use client";

import * as React from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { toast } from "sonner";
import {
  BadgeIndianRupee,
  CalendarCheck,
  Download,
  GraduationCap,
  Plus,
  SlidersHorizontal,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Select, Textarea } from "@/components/ui/input";
import { Field, RequiredLegend } from "@/components/ui/field";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
  KpiCard,
} from "@/components/ui/card";
import { Badge, StatusBadge } from "@/components/ui/badge";
import {
  ConfirmDialog,
  Dialog,
  DialogBody,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  BottomSheet,
  BottomSheetBody,
  BottomSheetContent,
  BottomSheetFooter,
  BottomSheetHeader,
  BottomSheetTitle,
  BottomSheetTrigger,
} from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, ErrorSummary } from "@/components/ui/alert";
import {
  EmptyState,
  ErrorState,
  PermissionDeniedState,
  TableSkeleton,
} from "@/components/states";
import { DataTable, type SortState } from "@/components/tables/data-table";
import {
  MobileList,
  MobileListItem,
  ResponsiveCollection,
} from "@/components/tables/mobile-list";

/* ---------------------------------------------------------------------------
   Synthetic demo data. Style guide §1.1: "Use realistic synthetic data during
   development; never use meaningless lorem ipsum in final screens."
   -------------------------------------------------------------------------*/

interface DemoStudent {
  id: string;
  name: string;
  registrationNumber: string;
  course: string;
  batch: string;
  attendance: number;
  duePaise: number;
  status: string;
}

const DEMO_STUDENTS: DemoStudent[] = [
  {
    id: "1",
    name: "Ananya Deshmukh",
    registrationNumber: "CO-DL01-26-DCA-00042",
    course: "Diploma in Computer Applications",
    batch: "DCA-M-07",
    attendance: 92,
    duePaise: 0,
    status: "active",
  },
  {
    id: "2",
    name: "Rohit Kumar Yadav",
    registrationNumber: "CO-DL01-26-ADCA-00118",
    course: "Advanced Diploma in Computer Applications",
    batch: "ADCA-E-03",
    attendance: 68,
    duePaise: 450000,
    status: "active",
  },
  {
    id: "3",
    name: "Fatima Sheikh",
    registrationNumber: "CO-DL01-26-TALLY-00207",
    course: "Tally with GST",
    batch: "TLY-M-02",
    attendance: 81,
    duePaise: 120000,
    status: "on_hold",
  },
  {
    id: "4",
    name: "Vikram Nair",
    registrationNumber: "CO-DL01-25-DTP-00891",
    course: "Desktop Publishing",
    batch: "DTP-A-11",
    attendance: 97,
    duePaise: 0,
    status: "completed",
  },
];

/** Placeholder formatter. Replaced by lib/money in the fees slice (Phase 3). */
function formatPaise(paise: number) {
  return `₹${(paise / 100).toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

const columns: ColumnDef<DemoStudent, unknown>[] = [
  {
    id: "name",
    header: "Student",
    meta: { sortable: true },
    cell: ({ row }) => (
      <div className="min-w-0">
        <p className="text-text truncate font-medium">{row.original.name}</p>
        <p className="text-meta text-text-secondary tabular truncate">
          {row.original.registrationNumber}
        </p>
      </div>
    ),
  },
  {
    id: "course",
    header: "Course",
    cell: ({ row }) => (
      <span className="line-clamp-1">{row.original.course}</span>
    ),
  },
  { id: "batch", header: "Batch", cell: ({ row }) => row.original.batch },
  {
    id: "attendance",
    header: "Attendance",
    meta: { align: "right", sortable: true },
    cell: ({ row }) => `${row.original.attendance}%`,
  },
  {
    id: "due",
    header: "Balance due",
    meta: { align: "right", sortable: true },
    cell: ({ row }) => formatPaise(row.original.duePaise),
  },
  {
    id: "status",
    header: "Status",
    meta: { align: "center" },
    cell: ({ row }) => <StatusBadge status={row.original.status} />,
  },
];

/* -------------------------------------------------------------------------*/

export default function ComponentShowcase() {
  const [sort, setSort] = React.useState<SortState>({
    columnId: "name",
    direction: "asc",
  });
  const [confirmOpen, setConfirmOpen] = React.useState(false);
  const [confirming, setConfirming] = React.useState(false);

  return (
    <div className="bg-canvas min-h-dvh">
      <header className="border-border bg-surface border-b">
        <div className="container-portal py-6">
          <p className="text-meta font-semibold tracking-wide text-orange-500 uppercase">
            Phase 0 · Internal
          </p>
          <h1 className="text-page-title text-navy-900 mt-1">Design system</h1>
          <p className="text-body text-text-secondary mt-1 max-w-2xl">
            Every foundational component required by style guide §17 before
            feature pages begin. Resize to 360px, 390px, 768px, 1024px and
            1440px to review the responsive behaviour.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <Button asChild variant="secondary" size="sm">
              <a href="/dev/shell/admin">Super Admin dashboard</a>
            </Button>
            <Button asChild variant="secondary" size="sm">
              <a href="/dev/shell/centre">Centre Admin dashboard</a>
            </Button>
            <Button asChild variant="secondary" size="sm">
              <a href="/dev/shell/student">Student portal</a>
            </Button>
            <Button asChild variant="secondary" size="sm">
              <a href="/dev/shell/public">Public site shell</a>
            </Button>
          </div>
        </div>
      </header>

      <div className="container-portal space-y-10 py-8">
        {/* ---------------------------------------------------------------- */}
        <Section id="colour" title="Colour" spec="§3">
          <div className="tablet:grid-cols-3 grid grid-cols-2 gap-3 lg:grid-cols-5">
            <Swatch
              name="navy-900"
              hex="#061867"
              className="bg-navy-900"
              dark
            />
            <Swatch
              name="blue-700"
              hex="#052D97"
              className="bg-blue-700"
              dark
            />
            <Swatch
              name="orange-500"
              hex="#EF6605"
              className="bg-orange-500"
              dark
            />
            <Swatch
              name="orange-600"
              hex="#D95600"
              className="bg-orange-600"
              dark
            />
            <Swatch
              name="green-600"
              hex="#4EA117"
              className="bg-green-600"
              dark
            />
            <Swatch name="blue-100" hex="#EAF0FF" className="bg-blue-100" />
            <Swatch name="canvas" hex="#F7F9FC" className="bg-canvas" />
            <Swatch
              name="surface-subtle"
              hex="#F1F4F8"
              className="bg-surface-subtle"
            />
            <Swatch name="border" hex="#DDE3EC" className="bg-border" />
            <Swatch
              name="border-strong"
              hex="#B8C2D1"
              className="bg-border-strong"
            />
          </div>

          <Alert
            tone="warning"
            title="Contrast exception logged"
            className="mt-4"
            recovery="See docs/02-open-conflicts.md (C1) for the options and the decision requested."
          >
            White text on brand-orange-500 measures 3.19:1. §10.1 specifies that
            combination for the primary button; §14 requires 4.5:1 for
            normal-size text. Implemented as specified, pending a brand
            decision.
          </Alert>
        </Section>

        {/* ---------------------------------------------------------------- */}
        <Section id="typography" title="Typography" spec="§4">
          <Card className="p-4 lg:p-6">
            <p className="text-display text-navy-900">Display / hero</p>
            <p className="text-page-title text-navy-900 mt-3">Page title</p>
            <p className="text-section text-text mt-3">Section title</p>
            <p className="text-card-title text-text mt-3">Card title</p>
            <p className="text-body text-text mt-3">
              Body copy. Fee collection for August 2026 closed at ₹4,82,150
              across 3 centres.
            </p>
            <p className="text-meta text-text-secondary mt-3">
              Small / metadata — last updated 4 August 2026, 09:12 IST
            </p>
            <p className="text-kpi text-navy-900 tabular mt-3">₹4,82,150.00</p>
            <p className="text-meta text-text-secondary mt-1">
              KPI numerals use tabular figures so columns stay aligned.
            </p>
          </Card>
        </Section>

        {/* ---------------------------------------------------------------- */}
        <Section id="buttons" title="Buttons" spec="§10.1">
          <div className="space-y-4">
            <Row label="Variants">
              <Button>Save student</Button>
              <Button variant="secondary">Cancel</Button>
              <Button variant="tertiary">View history</Button>
              <Button variant="navy">Approve centre</Button>
              <Button variant="destructive">Revoke certificate</Button>
              <Button variant="destructive-outline">Reject application</Button>
            </Row>
            <Row label="States">
              <Button loading loadingLabel="Saving student">
                Save student
              </Button>
              <Button disabled>Disabled</Button>
              <Button variant="secondary" disabled>
                Disabled secondary
              </Button>
              <Button size="sm">Small</Button>
              <Button size="icon" aria-label="Add student">
                <Plus />
              </Button>
            </Row>
            <p className="text-meta text-text-secondary">
              Loading preserves the button width — the label stays mounted and
              invisible rather than being swapped out (§10.1).
            </p>
          </div>
        </Section>

        {/* ---------------------------------------------------------------- */}
        <Section id="forms" title="Inputs and forms" spec="§10.2">
          <Card className="p-4 lg:p-6">
            <div className="grid gap-4 lg:grid-cols-2">
              <Field
                id="demo-name"
                label="Student full name"
                required
                help="As printed on the government ID."
              >
                <Input placeholder="Ananya Deshmukh" autoComplete="name" />
              </Field>

              <Field
                id="demo-phone"
                label="Mobile number"
                required
                error="Enter a 10-digit Indian mobile number starting 6, 7, 8 or 9."
              >
                <Input
                  type="tel"
                  inputMode="numeric"
                  autoComplete="tel"
                  defaultValue="98765"
                />
              </Field>

              <Field id="demo-course" label="Course" required>
                <Select defaultValue="">
                  <option value="" disabled>
                    Select a course
                  </option>
                  <option>Diploma in Computer Applications</option>
                  <option>Advanced Diploma in Computer Applications</option>
                  <option>Tally with GST</option>
                </Select>
              </Field>

              <Field
                id="demo-disabled"
                label="Registration number"
                help="Generated on approval and cannot be changed."
              >
                <Input disabled defaultValue="Assigned automatically" />
              </Field>

              <Field
                id="demo-notes"
                label="Counsellor notes"
                className="lg:col-span-2"
                help="Visible to centre staff only."
              >
                <Textarea placeholder="Interested in evening batch from September." />
              </Field>
            </div>
            <RequiredLegend className="mt-4" />
          </Card>

          <ErrorSummary
            className="mt-4"
            errors={[
              {
                field: "demo-phone",
                label: "Mobile number",
                message: "Enter a 10-digit number",
              },
              {
                field: "demo-course",
                label: "Course",
                message: "Select a course",
              },
            ]}
          />
        </Section>

        {/* ---------------------------------------------------------------- */}
        <Section id="cards" title="Cards and KPIs" spec="§10.3">
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-4">
            <KpiCard
              label="Active students"
              value="1,284"
              context="+38 this month"
              icon={<Users />}
            />
            <KpiCard
              label="Collected in August"
              value="₹4,82,150"
              context="₹1,12,400 still due"
              icon={<BadgeIndianRupee />}
            />
            <KpiCard
              label="Attendance today"
              value="86%"
              context="17 students below 75%"
              icon={<CalendarCheck />}
            />
            <KpiCard
              label="Certificates issued"
              value="94"
              context="6 awaiting approval"
              icon={<GraduationCap />}
            />
          </div>

          <Card className="mt-4">
            <CardHeader>
              <div>
                <CardTitle>Wallet balance</CardTitle>
                <CardDescription>
                  Delhi Central · CO-DL01 · updated 09:12 IST
                </CardDescription>
              </div>
              <StatusBadge status="active" />
            </CardHeader>
            <CardContent>
              <p className="text-kpi text-navy-900 tabular">₹18,450.00</p>
              <p className="text-meta text-text-secondary mt-1">
                Balance is computed from the ledger, never stored as a mutable
                field.
              </p>
            </CardContent>
            <CardFooter>
              <Button size="sm">Recharge wallet</Button>
              <Button size="sm" variant="tertiary">
                View statement
              </Button>
            </CardFooter>
          </Card>
        </Section>

        {/* ---------------------------------------------------------------- */}
        <Section id="badges" title="Status badges" spec="§10.5">
          <div className="flex flex-wrap gap-2">
            {[
              "draft",
              "submitted",
              "under_review",
              "changes_requested",
              "approved",
              "active",
              "on_hold",
              "rejected",
              "suspended",
              "completed",
              "present",
              "absent",
              "late",
              "paid",
              "overdue",
              "passed",
              "failed",
              "issued",
              "revoked",
              "dispatched",
              "delivered",
            ].map((s) => (
              <StatusBadge key={s} status={s} />
            ))}
          </div>
          <p className="text-meta text-text-secondary mt-3">
            Every badge carries an icon and text. Pending states use warning
            gold, never orange, so they can never be mistaken for the primary
            action (§10.5).
          </p>
        </Section>

        {/* ---------------------------------------------------------------- */}
        <Section
          id="tables"
          title="Table and its mobile equivalent"
          spec="§10.4"
        >
          <ResponsiveCollection
            table={
              <DataTable
                caption="Students at Delhi Central"
                data={DEMO_STUDENTS}
                columns={columns}
                getRowId={(r) => r.id}
                sort={sort}
                onSortChange={setSort}
                density="comfortable"
                selection={{
                  value: {},
                  onChange: () => undefined,
                  actions: (
                    <Button size="sm" variant="secondary">
                      <Download /> Export selected
                    </Button>
                  ),
                }}
                empty={
                  <EmptyState
                    title="No students match these filters"
                    description="Try widening the date range or clearing the batch filter."
                  />
                }
              />
            }
            list={
              <MobileList label="Students at Delhi Central">
                {DEMO_STUDENTS.map((s) => (
                  <MobileListItem
                    key={s.id}
                    title={s.name}
                    subtitle={s.registrationNumber}
                    status={<StatusBadge status={s.status} />}
                    href={`/dev/components#${s.id}`}
                    fields={[
                      { label: "Batch", value: s.batch },
                      {
                        label: "Attendance",
                        value: `${s.attendance}%`,
                        numeric: true,
                      },
                      {
                        label: "Balance due",
                        value: formatPaise(s.duePaise),
                        numeric: true,
                      },
                    ]}
                  />
                ))}
              </MobileList>
            }
          />
          <p className="text-meta text-text-secondary mt-3">
            Below 1024px the table is replaced by cards, not scrolled sideways
            (§10.4). Both compositions render server-side and are swapped with
            CSS, so there is no hydration flash.
          </p>
        </Section>

        {/* ---------------------------------------------------------------- */}
        <Section
          id="overlays"
          title="Dialogs, sheets and tabs"
          spec="§10.6, §10.7"
        >
          <Row label="Overlays">
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="secondary">Open dialog</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Record a fee payment</DialogTitle>
                  <DialogDescription>
                    Ananya Deshmukh · CO-DL01-26-DCA-00042
                  </DialogDescription>
                </DialogHeader>
                <DialogBody>
                  <Field id="demo-amount" label="Amount" required>
                    <Input inputMode="decimal" defaultValue="4500.00" />
                  </Field>
                </DialogBody>
                <DialogFooter>
                  <Button variant="secondary">Cancel</Button>
                  <Button>Post payment</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            <Button
              variant="destructive-outline"
              onClick={() => setConfirmOpen(true)}
            >
              Destructive confirm
            </Button>

            <BottomSheet>
              <BottomSheetTrigger asChild>
                <Button variant="secondary">
                  <SlidersHorizontal /> Filters (mobile sheet)
                </Button>
              </BottomSheetTrigger>
              <BottomSheetContent>
                <BottomSheetHeader>
                  <BottomSheetTitle>Filter students</BottomSheetTitle>
                </BottomSheetHeader>
                <BottomSheetBody>
                  <div className="space-y-4">
                    <Field id="sheet-batch" label="Batch">
                      <Select>
                        <option>All batches</option>
                        <option>DCA-M-07</option>
                      </Select>
                    </Field>
                    <Field id="sheet-status" label="Status">
                      <Select>
                        <option>All statuses</option>
                        <option>Active</option>
                      </Select>
                    </Field>
                  </div>
                </BottomSheetBody>
                <BottomSheetFooter>
                  <Button variant="secondary">Reset</Button>
                  <Button>Apply</Button>
                </BottomSheetFooter>
              </BottomSheetContent>
            </BottomSheet>

            <Button
              variant="tertiary"
              onClick={() =>
                toast.success("Attendance submitted", {
                  description: "28 present · 3 absent · 1 late",
                })
              }
            >
              Show toast
            </Button>
          </Row>

          <Card className="mt-4 p-4 lg:p-6">
            <Tabs defaultValue="overview">
              <TabsList>
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="attendance">Attendance</TabsTrigger>
                <TabsTrigger value="fees">Fees</TabsTrigger>
                <TabsTrigger value="exams">Exams</TabsTrigger>
                <TabsTrigger value="documents">Documents</TabsTrigger>
              </TabsList>
              <TabsContent value="overview">
                <p className="text-body text-text-secondary">
                  Tabs are for closely related views of one object — a student
                  record here — never as a substitute for app navigation
                  (§10.7).
                </p>
              </TabsContent>
              <TabsContent value="attendance">
                <p className="text-body text-text-secondary">
                  Attendance register for the selected enrolment.
                </p>
              </TabsContent>
              <TabsContent value="fees">
                <p className="text-body text-text-secondary">
                  Instalments, receipts and balance.
                </p>
              </TabsContent>
              <TabsContent value="exams">
                <p className="text-body text-text-secondary">
                  Eligibility, attempts and results.
                </p>
              </TabsContent>
              <TabsContent value="documents">
                <p className="text-body text-text-secondary">
                  Uploaded identity and education documents.
                </p>
              </TabsContent>
            </Tabs>
          </Card>
        </Section>

        {/* ---------------------------------------------------------------- */}
        <Section id="feedback" title="Alerts and banners" spec="§10.8">
          <div className="space-y-3">
            <Alert tone="info" title="Head office approval is enabled">
              Admissions created at this centre will wait for head-office review
              before a registration number is issued.
            </Alert>
            <Alert tone="success" title="Wallet recharge credited">
              ₹25,000.00 credited on 4 August 2026. Closing balance ₹43,450.00.
            </Alert>
            <Alert
              tone="warning"
              title="17 students are below the 75% attendance minimum"
              recovery="Open the defaulter list to contact them before the exam eligibility cut-off on 20 August."
            />
            <Alert
              tone="danger"
              title="Payment could not be posted"
              recovery="The receipt number was already used. Reload the page and try again — no money was recorded."
            />
          </div>
        </Section>

        {/* ---------------------------------------------------------------- */}
        <Section
          id="states"
          title="Empty, loading, error and permission states"
          spec="§10.9"
        >
          <div className="grid gap-4 lg:grid-cols-2">
            <Card>
              <EmptyState
                title="No students yet"
                description="Register your first student to start taking attendance and collecting fees."
                action={
                  <Button>
                    <Plus /> New student
                  </Button>
                }
              />
            </Card>
            <Card>
              <TableSkeleton rows={4} />
            </Card>
            <Card>
              <ErrorState
                kind="server"
                requestId="req_01J9F2K7QY"
                onRetry={() => toast.info("Retrying…")}
              />
            </Card>
            <Card>
              <PermissionDeniedState requiredFor="fee collection" />
            </Card>
            <Card>
              <ErrorState kind="offline" />
            </Card>
            <Card>
              <ErrorState kind="timeout" onRetry={() => undefined} />
            </Card>
          </div>
        </Section>
      </div>

      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title="Revoke this certificate?"
        target="Certificate CO-CERT-26-001204 · Vikram Nair"
        consequence="Public verification will immediately show this certificate as invalid. The certificate cannot be un-revoked; a corrected one must be reissued."
        confirmLabel="Revoke certificate"
        requireReason
        loading={confirming}
        onConfirm={() => {
          setConfirming(true);
          window.setTimeout(() => {
            setConfirming(false);
            setConfirmOpen(false);
            toast.success("Certificate revoked", {
              description: "Recorded in the audit log against your account.",
            });
          }, 900);
        }}
      />
    </div>
  );
}

/* ---------------------------------------------------------------------------
   Showcase chrome
   -------------------------------------------------------------------------*/

function Section({
  id,
  title,
  spec,
  children,
}: {
  id: string;
  title: string;
  spec: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} aria-labelledby={`${id}-heading`}>
      <div className="mb-3 flex items-baseline gap-2">
        <h2 id={`${id}-heading`} className="text-section text-navy-900">
          {title}
        </h2>
        <Badge tone="neutral" icon={null}>
          Style guide {spec}
        </Badge>
      </div>
      {children}
    </section>
  );
}

function Row({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <p className="text-meta text-text-secondary mb-2 font-semibold">
        {label}
      </p>
      <div className="flex flex-wrap items-center gap-3">{children}</div>
    </div>
  );
}

function Swatch({
  name,
  hex,
  className,
  dark,
}: {
  name: string;
  hex: string;
  className: string;
  dark?: boolean;
}) {
  return (
    <div className="border-border overflow-hidden rounded-[var(--radius-card)] border">
      <div
        className={`flex h-16 items-end p-2 ${className} ${dark ? "text-white" : "text-text"}`}
      >
        <span className="tabular text-[11px] font-semibold">{hex}</span>
      </div>
      <p className="bg-surface text-meta text-text-secondary px-2 py-1.5">
        {name}
      </p>
    </div>
  );
}
