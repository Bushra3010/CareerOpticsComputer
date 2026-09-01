"use client";

import * as React from "react";
import { Building2 } from "lucide-react";

import { Button } from "@/components/ui/button";

import { selectCentre, type SelectCentreState } from "../select-centre-actions";
import type { CentreMembershipOption } from "../current-membership";

const initial: SelectCentreState = { status: "idle" };

/**
 * Switches the portal between the centres one login belongs to.
 *
 * Rendered only when there is more than one, because a picker offering a
 * single choice is furniture. Before this existed, a user with two centres
 * reached whichever the database happened to return first and had no way to
 * reach the other — their students simply appeared to be missing.
 */
export function CentreSwitcher({
  centres,
  activeCentreId,
}: {
  centres: CentreMembershipOption[];
  activeCentreId: string;
}) {
  const [state, action, pending] = React.useActionState(selectCentre, initial);

  if (centres.length < 2) return null;

  return (
    <form action={action} className="space-y-3">
      <div>
        <label
          htmlFor="centreId"
          className="text-meta text-text-secondary block"
        >
          Showing centre
        </label>
        <div className="mt-1 flex flex-wrap items-center gap-2">
          <span
            className="text-navy-900 grid size-10 shrink-0 place-items-center rounded-[var(--radius-chip)] bg-blue-100"
            aria-hidden="true"
          >
            <Building2 className="size-5" />
          </span>
          <select
            id="centreId"
            name="centreId"
            defaultValue={activeCentreId}
            className="border-border bg-canvas text-body h-[46px] min-w-56 rounded-[var(--radius-control)] border px-3 lg:h-[42px]"
          >
            {centres.map((c) => (
              <option key={c.centreId} value={c.centreId}>
                {c.name}
                {c.code ? ` (${c.code})` : ""}
              </option>
            ))}
          </select>
          <Button type="submit" variant="secondary" loading={pending}>
            Switch
          </Button>
        </div>
      </div>

      {state.status === "error" && state.message ? (
        <p role="alert" className="text-meta text-danger">
          {state.message}
        </p>
      ) : null}
      {state.status === "success" && state.message ? (
        <p role="status" className="text-meta text-success">
          {state.message}
        </p>
      ) : null}

      <p className="text-meta text-text-secondary">
        This login belongs to {centres.length} centres. Everything in the portal
        — students, fees, attendance — shows the centre selected here.
      </p>
    </form>
  );
}
