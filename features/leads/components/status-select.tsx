"use client";

import { useActionState } from "react";

import { setLeadStatus, type LeadActionState } from "../actions";

const initial: LeadActionState = { status: "idle" };
const OPTIONS = ["new", "contacted", "converted", "closed"] as const;

export function LeadStatusSelect({
  leadId,
  currentStatus,
}: {
  leadId: string;
  currentStatus: (typeof OPTIONS)[number];
}) {
  const bound = setLeadStatus.bind(null, leadId);
  const [state, action] = useActionState(bound, initial);

  return (
    <form action={action} className="inline-flex items-center gap-2">
      <select
        name="status"
        defaultValue={currentStatus}
        onChange={(e) => e.currentTarget.form?.requestSubmit()}
        aria-label="Lead status"
        className="border-border text-body bg-surface h-9 rounded-[var(--radius-control)] border px-2"
      >
        {OPTIONS.map((o) => (
          <option key={o} value={o}>
            {o.charAt(0).toUpperCase() + o.slice(1)}
          </option>
        ))}
      </select>
      {state.status === "error" ? (
        <span className="text-meta text-danger">{state.message}</span>
      ) : null}
    </form>
  );
}
