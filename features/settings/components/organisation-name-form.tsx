"use client";

import { useActionState } from "react";

import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";

import { updateOrganisationName, type SettingsActionState } from "../actions";

const initial: SettingsActionState = { status: "idle" };

export function OrganisationNameForm({ currentName }: { currentName: string }) {
  const [state, action, pending] = useActionState(
    updateOrganisationName,
    initial,
  );

  return (
    <form action={action} className="max-w-md space-y-4">
      <Field
        id="name"
        label="Organisation name"
        required
        help="Shown across all three portals and on printed documents."
        error={state.fieldErrors?.name}
      >
        <Input
          name="name"
          defaultValue={currentName}
          required
          maxLength={120}
        />
      </Field>

      {state.status === "error" && state.message ? (
        <Alert tone="danger" title="Could not save">
          {state.message}
        </Alert>
      ) : null}
      {state.status === "success" ? (
        <Alert tone="success" title="Saved">
          The name is updated everywhere it appears.
        </Alert>
      ) : null}

      <Button type="submit" loading={pending} loadingLabel="Saving">
        Save changes
      </Button>
    </form>
  );
}
