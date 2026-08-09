"use client";

import { useActionState } from "react";

import { assignLeadToCentre, type LeadActionState } from "../actions";

const initial: LeadActionState = { status: "idle" };

export function AssignCentreSelect({
  leadId,
  currentCentreId,
  centres,
}: {
  leadId: string;
  currentCentreId: string | null;
  centres: { id: string; name: string }[];
}) {
  const bound = assignLeadToCentre.bind(null, leadId);
  const [state, action] = useActionState(bound, initial);

  return (
    <form action={action} className="inline-flex items-center gap-2">
      <select
        name="centreId"
        defaultValue={currentCentreId ?? "pool"}
        onChange={(e) => e.currentTarget.form?.requestSubmit()}
        aria-label="Assigned centre"
        className="border-border text-body bg-surface h-9 max-w-48 rounded-[var(--radius-control)] border px-2"
      >
        <option value="pool">Unassigned</option>
        {centres.map((c) => (
          <option key={c.id} value={c.id}>
            {c.name}
          </option>
        ))}
      </select>
      {state.status === "error" ? (
        <span className="text-meta text-danger">{state.message}</span>
      ) : null}
    </form>
  );
}
