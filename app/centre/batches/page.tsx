import type { Metadata } from "next";

import { StatusBadge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState, PermissionDeniedState } from "@/components/states";
import { createClient } from "@/lib/db/server";
import { businessDate } from "@/lib/dates";
import { getCurrentCentreContext } from "@/features/centres/current-membership";
import { listPublishedCourses } from "@/features/academics/queries";
import {
  AddSlotForm,
  BatchStatusButton,
  RemoveSlotButton,
} from "@/features/batches/components/batch-controls";
import { CreateBatchForm } from "@/features/batches/components/create-batch-form";
import {
  listBatchesForCentre,
  listFacultyOptions,
} from "@/features/batches/queries";

export const metadata: Metadata = {
  title: "Batches",
  robots: { index: false },
};

export default async function CentreBatchesPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const context = user
    ? await getCurrentCentreContext(supabase, user.id)
    : null;

  if (!context) {
    return (
      <div>
        <h1 className="text-page-title text-navy-900">Batches</h1>
        <PermissionDeniedState className="mt-8" />
      </div>
    );
  }

  const [batches, courses, faculty] = await Promise.all([
    listBatchesForCentre(context.centreId),
    listPublishedCourses(),
    listFacultyOptions(context.centreId),
  ]);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-page-title text-navy-900">Batches</h1>
        <p className="text-body text-text-secondary mt-1">
          A batch groups students taking one course together on a weekly
          timetable. Students are placed into a batch from their enrolment; a
          batch with a capacity refuses the place that would exceed it.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>New batch</CardTitle>
        </CardHeader>
        <CardContent>
          <CreateBatchForm
            courses={courses.map((c) => ({ id: c.id, name: c.name }))}
            faculty={faculty}
            today={businessDate()}
          />
        </CardContent>
      </Card>

      {batches.length === 0 ? (
        <EmptyState
          title="No batches yet"
          description="Create one above, then give it a weekly timetable."
        />
      ) : (
        <div className="space-y-3">
          {batches.map((b) => (
            <Card key={b.id}>
              <CardHeader className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <CardTitle>
                    {b.code} — {b.name}
                  </CardTitle>
                  <p className="text-meta text-text-secondary mt-1">
                    {b.courseName ?? "Course"}
                    {b.facultyName
                      ? ` · ${b.facultyName}`
                      : " · no faculty yet"}
                    {b.room ? ` · ${b.room}` : ""}
                    {` · from ${b.startDate}`}
                    {b.endDate ? ` to ${b.endDate}` : ""}
                  </p>
                  <p className="text-meta text-text-secondary">
                    {b.capacity === null
                      ? `${b.enrolledCount} enrolled · no capacity limit`
                      : `${b.enrolledCount} of ${b.capacity} places taken`}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <StatusBadge status={b.status} />
                  <BatchStatusButton batchId={b.id} currentStatus={b.status} />
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {b.schedule.length === 0 ? (
                  <p className="text-meta text-text-secondary">
                    No timetable yet.
                  </p>
                ) : (
                  <ul className="divide-border divide-y">
                    {b.schedule.map((s) => (
                      <li
                        key={s.id}
                        className="flex items-center justify-between py-2"
                      >
                        <span className="text-body text-text">
                          {s.weekdayLabel} · {s.startTime}–{s.endTime}
                          {s.room ? ` · ${s.room}` : ""}
                        </span>
                        <RemoveSlotButton slotId={s.id} />
                      </li>
                    ))}
                  </ul>
                )}
                <AddSlotForm batchId={b.id} />
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
