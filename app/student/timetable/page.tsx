import type { Metadata } from "next";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/states";
import { getStudentTimetable } from "@/features/batches/queries";
import { WEEKDAYS } from "@/features/batches/schema";

export const metadata: Metadata = {
  title: "Class schedule",
  robots: { index: false },
};

export default async function StudentTimetablePage() {
  const entries = await getStudentTimetable();

  // Grouped by day rather than listed flat: a weekly timetable is read by
  // day, and an empty day is information too.
  const byDay = WEEKDAYS.map((label, weekday) => ({
    label,
    weekday,
    slots: entries.filter((e) => e.weekday === weekday),
  })).filter((d) => d.slots.length > 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-page-title text-navy-900">Class schedule</h1>
        <p className="text-body text-text-secondary mt-1">
          Your weekly timetable, from the batch your centre has placed you in.
        </p>
      </div>

      {byDay.length === 0 ? (
        <EmptyState
          title="No classes scheduled"
          description="Your timetable appears here once your centre places you in a batch and sets its weekly slots."
        />
      ) : (
        <div className="space-y-3">
          {byDay.map((day) => (
            <Card key={day.weekday}>
              <CardHeader>
                <CardTitle>{day.label}</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="divide-border divide-y">
                  {day.slots.map((s) => (
                    <li key={s.id} className="py-3">
                      <p className="text-body text-text font-semibold">
                        {s.startTime}–{s.endTime} ·{" "}
                        {s.courseName ?? s.batchName}
                      </p>
                      <p className="text-meta text-text-secondary mt-0.5">
                        {s.batchName}
                        {s.facultyName ? ` · ${s.facultyName}` : ""}
                        {s.room ? ` · ${s.room}` : ""}
                      </p>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
