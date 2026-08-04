import { CalendarCheck, GraduationCap, IndianRupee } from "lucide-react";

import { KpiCard } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/badge";
import { EmptyState } from "@/components/states";
import { formatPaise } from "@/lib/money";
import { getStudentOverview } from "@/features/student-portal/queries";
import { getStudentResults } from "@/features/results/queries";

export default async function StudentDashboardPage() {
  const [overview, results] = await Promise.all([
    getStudentOverview(),
    getStudentResults(),
  ]);

  if (!overview) {
    return (
      <div>
        <h1 className="text-page-title text-navy-900">Your course</h1>
        <EmptyState
          className="mt-8"
          title="No student record linked to this account"
          description="Ask your centre to send you a portal invitation from your student record."
        />
      </div>
    );
  }

  // Guard the divide: a student with no fee plan yet has a zero total.
  const paidPercent =
    overview.totalPaise > 0
      ? Math.round(
          (Number(overview.paidPaise) / Number(overview.totalPaise)) * 100,
        )
      : 0;

  const attendancePct = overview.attendance
    ? Math.round(
        (overview.attendance.present / overview.attendance.total) * 100,
      )
    : null;

  return (
    <div>
      <h1 className="text-page-title text-navy-900">
        Welcome back, {overview.studentName.split(" ")[0]}
      </h1>
      <p className="text-body text-text-secondary mt-1">
        {overview.registrationNumber}
        {overview.centreName ? ` · ${overview.centreName}` : ""}
      </p>

      <div className="mt-5 grid grid-cols-2 gap-3 lg:grid-cols-3 lg:gap-4">
        <KpiCard
          label="Course"
          value={
            <span className="text-card-title">
              {overview.courseName ?? "Not enrolled"}
            </span>
          }
          context={
            overview.courseName ? "Currently enrolled" : "No active enrolment"
          }
          icon={<GraduationCap />}
          accent="navy"
        />
        <KpiCard
          label="Attendance"
          value={attendancePct === null ? "No sessions" : `${attendancePct}%`}
          context={
            overview.attendance
              ? `${overview.attendance.present} of ${overview.attendance.total} sessions`
              : "Nothing recorded yet"
          }
          icon={<CalendarCheck />}
          accent="green"
          progress={attendancePct ?? undefined}
          progressTone="green"
        />
        <KpiCard
          label="Fees due"
          value={formatPaise(overview.duePaise, { showDecimals: false })}
          context={`${formatPaise(overview.paidPaise, { showDecimals: false })} paid of ${formatPaise(overview.totalPaise, { showDecimals: false })}`}
          icon={<IndianRupee />}
          accent="orange"
          progress={paidPercent}
          progressTone="orange"
        />
      </div>

      <h2 className="text-section text-navy-900 mt-10">Results</h2>
      {results.length === 0 ? (
        <p className="text-body text-text-secondary mt-2">
          No results have been published for you yet.
        </p>
      ) : (
        <ul className="mt-3 space-y-3">
          {results.map((r) => (
            <li
              key={`${r.courseName}-${r.termLabel}`}
              className="border-border rounded-[var(--radius-card)] border p-4"
            >
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-card-title text-navy-900">
                    {r.courseName ?? "Course"}
                  </p>
                  <p className="text-meta text-text-secondary">{r.termLabel}</p>
                </div>
                <StatusBadge
                  status={r.outcome === "fail" ? "failed" : "passed"}
                  label={
                    r.outcome === "distinction"
                      ? "Distinction"
                      : r.outcome === "pass"
                        ? "Pass"
                        : "Fail"
                  }
                />
              </div>
              <p className="text-body text-text mt-2 tabular-nums">
                {r.obtainedMarks}/{r.maxMarks} · {r.percentage}%
              </p>
            </li>
          ))}
        </ul>
      )}

      <h2 className="text-section text-navy-900 mt-10">Fee schedule</h2>
      {overview.instalments.length === 0 ? (
        <p className="text-body text-text-secondary mt-2">
          Your centre has not set up a fee plan yet.
        </p>
      ) : (
        <div className="border-border mt-3 overflow-x-auto rounded-[var(--radius-card)] border">
          <table className="w-full text-left">
            <thead className="bg-surface-subtle">
              <tr>
                <th scope="col" className="text-label px-4 py-3">
                  #
                </th>
                <th scope="col" className="text-label px-4 py-3">
                  Due date
                </th>
                <th scope="col" className="text-label px-4 py-3 text-right">
                  Amount
                </th>
                <th scope="col" className="text-label px-4 py-3 text-right">
                  Paid
                </th>
                <th scope="col" className="text-label px-4 py-3">
                  Status
                </th>
              </tr>
            </thead>
            <tbody>
              {overview.instalments.map((i) => (
                <tr key={i.id} className="border-border border-t">
                  <td className="text-body px-4 py-3">{i.sequence}</td>
                  <td className="text-body px-4 py-3">{i.dueDate}</td>
                  <td className="text-body px-4 py-3 text-right tabular-nums">
                    {formatPaise(i.amountPaise)}
                  </td>
                  <td className="text-body px-4 py-3 text-right tabular-nums">
                    {formatPaise(i.allocatedPaise)}
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge status={i.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <h2 className="text-section text-navy-900 mt-10">Receipts</h2>
      {overview.receipts.length === 0 ? (
        <p className="text-body text-text-secondary mt-2">
          No payments recorded yet.
        </p>
      ) : (
        <div className="border-border mt-3 overflow-x-auto rounded-[var(--radius-card)] border">
          <table className="w-full text-left">
            <thead className="bg-surface-subtle">
              <tr>
                <th scope="col" className="text-label px-4 py-3">
                  Receipt no.
                </th>
                <th scope="col" className="text-label px-4 py-3 text-right">
                  Amount
                </th>
              </tr>
            </thead>
            <tbody>
              {overview.receipts.map((r) => (
                <tr key={r.id} className="border-border border-t">
                  <td className="text-body px-4 py-3 font-semibold">
                    {r.receiptNumber}
                  </td>
                  <td className="text-body px-4 py-3 text-right tabular-nums">
                    {formatPaise(r.amountPaise)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <h2 className="text-section text-navy-900 mt-10">Attendance history</h2>
      {overview.attendanceHistory.length === 0 ? (
        <p className="text-body text-text-secondary mt-2">
          No attendance has been recorded for you yet.
        </p>
      ) : (
        <ul className="mt-3 space-y-2">
          {overview.attendanceHistory.map((r) => (
            <li
              key={r.sessionDate}
              className="border-border flex items-center justify-between rounded-[var(--radius-card)] border px-4 py-3"
            >
              <span className="text-body text-text">{r.sessionDate}</span>
              <StatusBadge status={r.status} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
