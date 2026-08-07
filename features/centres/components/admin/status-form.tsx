"use client";

import { useActionState, useState } from "react";

import { Button } from "@/components/ui/button";
import { Field, RequiredLegend } from "@/components/ui/field";
import { Select, Textarea } from "@/components/ui/input";

import { changeCentreStatus, type CentreActionState } from "../../actions";

const initial: CentreActionState = { status: "idle" };

/**
 * The only UI for a lifecycle change. No default-selected destructive option:
 * `currentStatus` is excluded from the list, so submitting a bare, unread form
 * cannot pick "closed" by accident — there is nothing to submit without first
 * choosing a different status than the one already showing.
 */
export function CentreStatusForm({
  centreId,
  currentStatus,
}: {
  centreId: string;
  currentStatus: "active" | "suspended" | "closed";
}) {
  const bound = changeCentreStatus.bind(null, centreId);
  const [state, action, pending] = useActionState(bound, initial);
  const options = (["active", "suspended", "closed"] as const).filter(
    (s) => s !== currentStatus,
  );
  const [target, setTarget] = useState(options[0]);

  return (
    <form action={action} className="space-y-4">
      <Field id="status" label="Change to">
        <Select
          name="status"
          value={target}
          onChange={(e) => setTarget(e.target.value as typeof target)}
        >
          {options.map((s) => (
            <option key={s} value={s}>
              {s.charAt(0).toUpperCase() + s.slice(1)}
            </option>
          ))}
        </Select>
      </Field>

      <Field
        id="reason"
        label="Reason"
        required
        help="Recorded against this centre's audit trail."
        error={state.fieldErrors?.reason}
      >
        <Textarea name="reason" rows={2} maxLength={300} required />
      </Field>

      <RequiredLegend />
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

      <Button
        type="submit"
        variant={target === "closed" ? "destructive" : "secondary"}
        loading={pending}
        loadingLabel="Saving"
      >
        {target === "active" ? "Reactivate centre" : `Mark ${target}`}
      </Button>
    </form>
  );
}
