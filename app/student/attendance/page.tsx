import type { Metadata } from "next";

import { StatusBadge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/states";
import { getStudentOverview } from "@/features/student-portal/queries";

export const metadata: Metadata = {
  title: "Attendance",
  robots: { index: false },
};

export default async function StudentAttendancePage() {
  const overview = await getStudentOverview();

  if (!overview) {
    return (
      <div>
        <h1 className="text-page-title text-navy-900">Attendance</h1>
        <EmptyState
          className="mt-8"
          title="No student record"
          description="This login is not linked to a student record. Ask your centre."
        />
      </div>
    );
  }

  const summary = overview.attendance;
  const percent =
    summary && summary.total > 0
      ? Math.round((summary.present / summary.total) * 100)
      : null;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-page-title text-navy-900">Attendance</h1>
        <p className="text-body text-text-secondary mt-1">
          {percent === null
            ? "No session has been recorded yet."
            : `Present ${summary!.present} of ${summary!.total} sessions — ${percent}%.`}
        </p>
      </div>

      {overview.attendanceHistory.length === 0 ? (
        <EmptyState
          title="Nothing recorded yet"
          description="Your attendance appears here after your first class."
        />
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Session history</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="divide-border divide-y">
              {overview.attendanceHistory.map((row) => (
                <li
                  key={row.sessionDate}
                  className="flex items-center justify-between py-3"
                >
                  <span className="text-body text-text">
                    {new Date(row.sessionDate).toLocaleDateString("en-IN", {
                      dateStyle: "full",
                    })}
                  </span>
                  <StatusBadge status={row.status} />
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
