"use client";

import { useActionState } from "react";

import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/input";
import type { RosterEntry } from "../queries";
import { takeAttendance, type TakeAttendanceState } from "../actions";

const initialState: TakeAttendanceState = { status: "idle" };

const STATUS_OPTIONS = [
  { value: "present", label: "Present" },
  { value: "absent", label: "Absent" },
  { value: "late", label: "Late" },
  { value: "excused", label: "Excused" },
] as const;

export function AttendanceForm({
  courseId,
  sessionDate,
  roster,
}: {
  courseId: string;
  sessionDate: string;
  roster: RosterEntry[];
}) {
  const boundAction = takeAttendance.bind(null, courseId, sessionDate);
  const [state, formAction, pending] = useActionState(
    boundAction,
    initialState,
  );

  if (roster.length === 0) {
    return (
      <p className="text-body text-text-secondary">
        No active students enrolled in this course at your centre.
      </p>
    );
  }

  return (
    <form action={formAction} className="space-y-4">
      <div className="border-border overflow-x-auto rounded-[var(--radius-card)] border">
        <table className="w-full text-left">
          <thead className="bg-surface-subtle">
            <tr>
              <th className="text-label px-4 py-3">Registration no.</th>
              <th className="text-label px-4 py-3">Name</th>
              <th className="text-label px-4 py-3">Status</th>
            </tr>
          </thead>
          <tbody>
            {roster.map((entry) => (
              <tr key={entry.enrolmentId} className="border-border border-t">
                <td className="text-body px-4 py-3">
                  {entry.registrationNumber}
                </td>
                <td className="text-body px-4 py-3">{entry.studentName}</td>
                <td className="px-4 py-3">
                  <Select
                    name={`status_${entry.enrolmentId}`}
                    defaultValue={entry.status ?? "present"}
                    className="w-40"
                  >
                    {STATUS_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </Select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {state.status === "error" && state.message ? (
        <p role="alert" className="text-body text-danger">
          {state.message}
        </p>
      ) : null}
      {state.status === "success" && state.message ? (
        <p className="text-body text-green-700">{state.message}</p>
      ) : null}

      <Button type="submit" loading={pending} loadingLabel="Saving">
        Save attendance
      </Button>
    </form>
  );
}
