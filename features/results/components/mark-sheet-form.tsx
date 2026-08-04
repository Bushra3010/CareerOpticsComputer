"use client";

import { useActionState } from "react";

import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { StatusBadge } from "@/components/ui/badge";

import {
  saveMarks,
  publishPublication,
  type ResultActionState,
} from "../actions";
import type { MarkSheetRow } from "../queries";

const initial: ResultActionState = { status: "idle" };

export function MarkSheetForm({
  publicationId,
  rows,
  defaultMax,
}: {
  publicationId: string;
  rows: MarkSheetRow[];
  defaultMax: number;
}) {
  const [state, action, pending] = useActionState(
    saveMarks.bind(null, publicationId),
    initial,
  );

  if (rows.length === 0) {
    return (
      <p className="text-body text-text-secondary">
        No active students are enrolled in this course at your centre.
      </p>
    );
  }

  return (
    <form action={action} className="space-y-4">
      <Field
        id="maxMarks"
        label="Maximum marks"
        required
        help="Applies to every student in this result set."
      >
        <Input
          name="maxMarks"
          type="number"
          min={1}
          defaultValue={defaultMax}
          required
          className="max-w-40"
        />
      </Field>

      <div className="border-border overflow-x-auto rounded-[var(--radius-card)] border">
        <table className="w-full text-left">
          <thead className="bg-surface-subtle">
            <tr>
              <th scope="col" className="text-label px-4 py-3">
                Registration no.
              </th>
              <th scope="col" className="text-label px-4 py-3">
                Name
              </th>
              <th scope="col" className="text-label px-4 py-3">
                Marks obtained
              </th>
              <th scope="col" className="text-label px-4 py-3">
                Outcome
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.enrolmentId} className="border-border border-t">
                <td className="text-body px-4 py-3">{r.registrationNumber}</td>
                <td className="text-body px-4 py-3">{r.studentName}</td>
                <td className="px-4 py-3">
                  <Input
                    name={`mark_${r.enrolmentId}`}
                    type="number"
                    min={0}
                    inputMode="numeric"
                    defaultValue={r.obtainedMarks ?? ""}
                    aria-label={`Marks for ${r.studentName}`}
                    className="max-w-28"
                  />
                </td>
                <td className="px-4 py-3">
                  {r.outcome ? (
                    <StatusBadge
                      status={
                        r.outcome === "distinction"
                          ? "passed"
                          : r.outcome === "pass"
                            ? "passed"
                            : "failed"
                      }
                      label={
                        r.outcome === "distinction"
                          ? "Distinction"
                          : r.outcome === "pass"
                            ? "Pass"
                            : "Fail"
                      }
                    />
                  ) : (
                    <span className="text-meta text-text-secondary">
                      Not marked
                    </span>
                  )}
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
        <p role="status" className="text-body text-green-700">
          {state.message}
        </p>
      ) : null}

      <Button type="submit" loading={pending} loadingLabel="Saving">
        Save marks
      </Button>
    </form>
  );
}

export function PublishButton({ publicationId }: { publicationId: string }) {
  const [state, action, pending] = useActionState(
    publishPublication.bind(null, publicationId),
    initial,
  );

  return (
    <form action={action} className="mt-4">
      <Button type="submit" loading={pending} loadingLabel="Publishing">
        Publish results
      </Button>
      <p className="text-meta text-text-secondary mt-2 max-w-prose">
        Publishing is final. To correct a published result, create a new version
        — a result a student has already seen is never edited in place.
      </p>
      {state.status === "error" && state.message ? (
        <p role="alert" className="text-body text-danger mt-2">
          {state.message}
        </p>
      ) : null}
    </form>
  );
}
