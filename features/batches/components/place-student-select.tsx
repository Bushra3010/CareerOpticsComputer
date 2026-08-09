"use client";

import { useActionState } from "react";

import { placeStudentInBatch, type BatchActionState } from "../actions";
import type { BatchOption } from "../queries";

const initial: BatchActionState = { status: "idle" };

export function PlaceStudentSelect({
  enrolmentId,
  currentBatchId,
  batches,
}: {
  enrolmentId: string;
  currentBatchId: string | null;
  batches: BatchOption[];
}) {
  const [state, action] = useActionState(placeStudentInBatch, initial);

  return (
    <form action={action} className="inline-flex flex-wrap items-center gap-2">
      <input type="hidden" name="enrolmentId" value={enrolmentId} />
      <select
        name="batchId"
        defaultValue={currentBatchId ?? ""}
        onChange={(e) => e.currentTarget.form?.requestSubmit()}
        aria-label="Batch"
        className="border-border text-body bg-surface h-9 max-w-56 rounded-[var(--radius-control)] border px-2"
      >
        <option value="">Not in a batch</option>
        {batches.map((b) => (
          <option key={b.id} value={b.id}>
            {b.label}
          </option>
        ))}
      </select>
      {state.status === "error" ? (
        <span className="text-meta text-danger">{state.message}</span>
      ) : null}
    </form>
  );
}
