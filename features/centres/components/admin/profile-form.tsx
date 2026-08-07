"use client";

import { useActionState } from "react";

import { Button } from "@/components/ui/button";
import { Field, RequiredLegend } from "@/components/ui/field";
import { Input } from "@/components/ui/input";

import { updateCentreProfile, type CentreActionState } from "../../actions";

const initial: CentreActionState = { status: "idle" };

export function CentreProfileForm({
  centreId,
  centre,
}: {
  centreId: string;
  centre: {
    name: string;
    address: string | null;
    city: string | null;
    state: string | null;
    pincode: string | null;
  };
}) {
  const bound = updateCentreProfile.bind(null, centreId);
  const [state, action, pending] = useActionState(bound, initial);

  return (
    <form action={action} className="space-y-4">
      <Field
        id="name"
        label="Centre name"
        required
        error={state.fieldErrors?.name}
      >
        <Input
          name="name"
          defaultValue={centre.name}
          required
          maxLength={160}
        />
      </Field>
      <Field
        id="address"
        label="Address"
        required
        error={state.fieldErrors?.address}
      >
        <Input
          name="address"
          defaultValue={centre.address ?? ""}
          required
          maxLength={300}
        />
      </Field>
      <div className="grid gap-4 sm:grid-cols-3">
        <Field id="city" label="City" required error={state.fieldErrors?.city}>
          <Input
            name="city"
            defaultValue={centre.city ?? ""}
            required
            maxLength={100}
          />
        </Field>
        <Field
          id="state"
          label="State"
          required
          error={state.fieldErrors?.state}
        >
          <Input
            name="state"
            defaultValue={centre.state ?? ""}
            required
            maxLength={100}
          />
        </Field>
        <Field
          id="pincode"
          label="PIN code"
          required
          error={state.fieldErrors?.pincode}
        >
          <Input
            name="pincode"
            defaultValue={centre.pincode ?? ""}
            required
            inputMode="numeric"
            maxLength={6}
          />
        </Field>
      </div>

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
        variant="secondary"
        loading={pending}
        loadingLabel="Saving"
      >
        Save profile
      </Button>
    </form>
  );
}
