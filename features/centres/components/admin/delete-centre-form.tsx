"use client";

import { useActionState } from "react";
import { Trash2 } from "lucide-react";

import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";

import { deleteCentre, type CentreActionState } from "../../actions";

const initial: CentreActionState = { status: "idle" };

/**
 * Deleting a centre is only for one created by mistake. A centre that has
 * traded cannot be deleted at all — the restricting foreign keys refuse it, and
 * the action turns that refusal into an explanation rather than a raw error.
 */
export function DeleteCentreForm({
  centreId,
  centreCode,
  centreName,
}: {
  centreId: string;
  centreCode: string;
  centreName: string;
}) {
  const bound = deleteCentre.bind(null, centreId);
  const [state, action, pending] = useActionState(bound, initial);

  return (
    <form action={action} className="space-y-4">
      <Alert
        tone="warning"
        title="Deleting is permanent and is not the same as closing"
        recovery="A centre that has stopped trading should be set to Closed, which keeps it and its history. Delete only removes a centre created by mistake, and only while nothing is attached to it."
      />

      {state.status === "error" && state.message ? (
        <Alert
          tone="danger"
          title="The centre was not deleted"
          recovery={state.message}
        />
      ) : null}

      <Field
        id="confirmCode"
        label={`Type ${centreCode} to confirm`}
        required
        error={state.fieldErrors?.confirmCode}
        help={`This permanently deletes ${centreName}.`}
      >
        <Input
          name="confirmCode"
          required
          autoComplete="off"
          placeholder={centreCode}
          className="uppercase"
        />
      </Field>

      <Button
        type="submit"
        variant="destructive"
        loading={pending}
        loadingLabel="Deleting centre"
      >
        <Trash2 /> Delete this centre
      </Button>
    </form>
  );
}
