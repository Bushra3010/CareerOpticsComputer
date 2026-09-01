import Link from "next/link";

import { PlaceStudentSelect } from "./place-student-select";
import type { BatchOption, BatchRow } from "../queries";
import type { CentreEnrolmentRow } from "@/features/students/queries";

/**
 * A student's batch and its timetable, in one table cell.
 *
 * The timetable is shown but not editable here, and that is deliberate rather
 * than unfinished: a timetable belongs to the batch, so editing it from one
 * student's row would silently change the schedule for everyone else in that
 * batch. The link goes to where that change is made in full view of the other
 * students it affects.
 */
export function StudentBatchCell({
  enrolments,
  batchesById,
  options,
  canManage,
  anyBatchesExist,
}: {
  enrolments: CentreEnrolmentRow[];
  batchesById: Map<string, BatchRow>;
  options: BatchOption[];
  canManage: boolean;
  anyBatchesExist: boolean;
}) {
  if (enrolments.length === 0) {
    return (
      <p className="text-meta text-text-secondary">Not enrolled on a course.</p>
    );
  }

  return (
    <div className="space-y-3">
      {enrolments.map((e) => {
        const batch = e.batchId ? batchesById.get(e.batchId) : undefined;

        return (
          <div key={e.id} className="min-w-0">
            {enrolments.length > 1 ? (
              <p className="text-meta text-text-secondary">
                {e.courseName ?? "Course"}
              </p>
            ) : null}

            {canManage && anyBatchesExist ? (
              <PlaceStudentSelect
                enrolmentId={e.id}
                currentBatchId={e.batchId}
                batches={options}
              />
            ) : (
              <p className="text-body text-text">
                {batch ? `${batch.code} — ${batch.name}` : "Not in a batch"}
              </p>
            )}

            {batch && batch.schedule.length > 0 ? (
              <ul className="text-meta text-text-secondary mt-1 space-y-0.5">
                {batch.schedule.map((s) => (
                  <li key={s.id}>
                    {s.weekdayLabel} · {s.startTime}–{s.endTime}
                    {s.room ? ` · ${s.room}` : ""}
                  </li>
                ))}
              </ul>
            ) : batch ? (
              <p className="text-meta text-text-secondary mt-1">
                No timetable yet.{" "}
                {canManage ? (
                  <Link
                    href="/centre/batches"
                    className="font-semibold text-blue-700 underline-offset-4 hover:underline"
                  >
                    Add slots
                  </Link>
                ) : null}
              </p>
            ) : null}
          </div>
        );
      })}

      {canManage && !anyBatchesExist ? (
        <p className="text-meta text-text-secondary">
          No batches yet.{" "}
          <Link
            href="/centre/batches"
            className="font-semibold text-blue-700 underline-offset-4 hover:underline"
          >
            Create one under Batches and timetable
          </Link>
          .
        </p>
      ) : null}

      {canManage && anyBatchesExist ? (
        <Link
          href="/centre/batches"
          className="text-meta font-semibold text-blue-700 underline-offset-4 hover:underline"
        >
          Edit batches and timetable
        </Link>
      ) : null}
    </div>
  );
}
