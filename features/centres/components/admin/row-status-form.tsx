"use client";

import { useActionState } from "react";

import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/input";
import { Input } from "@/components/ui/input";

import { changeCentreStatus, type CentreActionState } from "../../actions";

const initial: CentreActionState = { status: "idle" };

/**
 * Change a centre's status without leaving the list.
 *
 * `changeCentreStatus` requires a reason — PRD §4.1 makes suspension a
 * privileged action and the RPC enforces it regardless of which screen calls —
 * so the reason field appears as soon as a different status is picked rather
 * than being hidden behind a second page.
 *
 * Three states, not an active/inactive toggle: suspended blocks new admissions,
 * attendance and financial posting while the centre still exists and head
 * office can read its history; closed retires it for good. Collapsing those
 * into one switch would lose the distinction the whole lifecycle rests on.
 */
export function CentreRowStatusForm({
  centreId,
  centreName,
  currentStatus,
}: {
  centreId: string;
  centreName: string;
  currentStatus: string;
}) {
  const bound = changeCentreStatus.bind(null, centreId);
  const [state, action, pending] = useActionState(bound, initial);

  return (
    <form action={action} className="flex flex-wrap items-start gap-2">
      <div className="min-w-0">
        <label htmlFor={`status-${centreId}`} className="sr-only">
          Status for {centreName}
        </label>
        <Select
          id={`status-${centreId}`}
          name="status"
          defaultValue={currentStatus}
          className="text-meta h-9 w-auto"
        >
          <option value="active">Active</option>
          <option value="suspended">Suspended</option>
          <option value="closed">Closed</option>
        </Select>
      </div>

      <div className="min-w-0 flex-1">
        <label htmlFor={`reason-${centreId}`} className="sr-only">
          Reason for changing {centreName}
        </label>
        <Input
          id={`reason-${centreId}`}
          name="reason"
          placeholder="Reason (required)"
          minLength={5}
          maxLength={300}
          className="text-meta h-9"
        />
      </div>

      <Button type="submit" size="sm" variant="secondary" loading={pending}>
        Save
      </Button>

      {state.status === "error" ? (
        <p role="alert" className="text-meta text-danger basis-full">
          {state.message ??
            state.fieldErrors?.reason ??
            "Could not change the status."}
        </p>
      ) : null}
    </form>
  );
}
