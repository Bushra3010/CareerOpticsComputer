import { StatusBadge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/states";

import {
  AddSlotForm,
  BatchStatusButton,
  DeleteBatchButton,
  EditBatchForm,
  SlotRow,
} from "./batch-controls";
import { CreateBatchForm } from "./create-batch-form";
import type { BatchRow } from "../queries";

/**
 * Batch and timetable management, whole.
 *
 * Extracted so the Batches page and the Students page render the same thing
 * rather than two copies drifting apart — the controls are identical in both
 * places, and a fix to one is a fix to both. A Server Component, so the client
 * bundles stay limited to the individual controls that need interactivity.
 */
export function BatchManager({
  batches,
  courses,
  faculty,
  today,
}: {
  batches: BatchRow[];
  courses: { id: string; name: string }[];
  faculty: { id: string; name: string }[];
  today: string;
}) {
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>New batch</CardTitle>
        </CardHeader>
        <CardContent>
          <CreateBatchForm courses={courses} faculty={faculty} today={today} />
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
                <div className="min-w-0">
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
                <div className="flex flex-wrap items-center gap-2">
                  <StatusBadge status={b.status} />
                  <BatchStatusButton batchId={b.id} currentStatus={b.status} />
                  <DeleteBatchButton
                    batchId={b.id}
                    enrolledCount={b.enrolledCount}
                  />
                </div>
              </CardHeader>
              {/* The edit form lives in the body, not the header row: opened,
                  it is a full-width row of inputs, and the header's controls
                  sit in a shrink-to-fit flex box that would squeeze it. */}
              <CardContent className="space-y-3">
                <EditBatchForm
                  batch={{
                    id: b.id,
                    code: b.code,
                    name: b.name,
                    facultyId: b.facultyId,
                    capacity: b.capacity,
                    room: b.room,
                    startDate: b.startDate,
                    endDate: b.endDate,
                  }}
                  faculty={faculty}
                />
                {b.schedule.length === 0 ? (
                  <p className="text-meta text-text-secondary">
                    No timetable yet.
                  </p>
                ) : (
                  <ul className="divide-border divide-y">
                    {b.schedule.map((s) => (
                      <SlotRow
                        key={s.id}
                        batchId={b.id}
                        slot={{
                          id: s.id,
                          weekday: s.weekday,
                          startTime: s.startTime,
                          endTime: s.endTime,
                          room: s.room,
                        }}
                      />
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
