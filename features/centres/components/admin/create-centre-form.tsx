"use client";

import { useActionState } from "react";

import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Field, RequiredLegend } from "@/components/ui/field";
import { Input } from "@/components/ui/input";

import { createCentre, type CentreActionState } from "../../actions";

const initial: CentreActionState = { status: "idle" };

export function CreateCentreForm() {
  const [state, action, pending] = useActionState(createCentre, initial);

  return (
    <form action={action} className="space-y-4">
      {state.status === "error" && state.message ? (
        <Alert
          tone="danger"
          title="The centre was not created"
          recovery={state.message}
        />
      ) : null}
      {state.status === "success" && state.message ? (
        <Alert tone="success" title={state.message}>
          It is active and will appear in the centres list.
        </Alert>
      ) : null}

      {/* Shown once. Nothing stores this, so it cannot be looked up again. */}
      {state.ownerCredentials ? (
        <Alert
          tone="warning"
          title="Copy these sign-in details now"
          recovery="They are shown only once and are not stored anywhere. Send them to the centre owner and ask them to change the password after signing in."
        >
          <dl className="mt-2 space-y-1">
            <div className="flex gap-2">
              <dt className="text-text-secondary shrink-0">Email</dt>
              <dd className="text-text font-semibold">
                {state.ownerCredentials.email}
              </dd>
            </div>
            <div className="flex gap-2">
              <dt className="text-text-secondary shrink-0">Password</dt>
              <dd className="text-text tabular font-semibold">
                {state.ownerCredentials.password}
              </dd>
            </div>
          </dl>
        </Alert>
      ) : null}

      <Field
        id="code"
        label="Centre code"
        required
        error={state.fieldErrors?.code}
        help="Short and permanent — it appears in every registration and receipt number this centre issues, so it cannot be changed later."
      >
        <Input
          name="code"
          required
          maxLength={16}
          placeholder="CO-LKO03"
          autoComplete="off"
          className="uppercase"
        />
      </Field>

      <Field
        id="name"
        label="Centre name"
        required
        error={state.fieldErrors?.name}
      >
        <Input
          name="name"
          required
          maxLength={160}
          placeholder="Career Optics Aliganj"
        />
      </Field>

      <div className="border-border tablet:grid-cols-2 grid gap-4 rounded-[var(--radius-card)] border p-4">
        <p className="text-meta text-text-secondary tablet:col-span-2">
          Centre owner — optional, but a centre with no owner has nobody who can
          sign in to it.
        </p>
        <Field id="ownerName" label="Owner name">
          <Input name="ownerName" maxLength={160} autoComplete="off" />
        </Field>
        <Field
          id="ownerEmail"
          label="Owner email"
          error={state.fieldErrors?.ownerEmail}
          help="Becomes their sign-in address."
        >
          <Input name="ownerEmail" type="email" autoComplete="off" />
        </Field>
      </div>

      <Field
        id="address"
        label="Address"
        required
        error={state.fieldErrors?.address}
      >
        <Input name="address" required maxLength={300} />
      </Field>

      <div className="tablet:grid-cols-3 grid gap-4">
        <Field id="city" label="City" required error={state.fieldErrors?.city}>
          <Input name="city" required maxLength={100} />
        </Field>
        <Field
          id="state"
          label="State"
          required
          error={state.fieldErrors?.state}
        >
          <Input name="state" required maxLength={100} />
        </Field>
        <Field
          id="pincode"
          label="PIN code"
          required
          error={state.fieldErrors?.pincode}
        >
          <Input
            name="pincode"
            required
            inputMode="numeric"
            maxLength={6}
            placeholder="226024"
          />
        </Field>
      </div>

      <RequiredLegend />

      <div className="flex flex-wrap gap-3">
        <Button type="submit" loading={pending} loadingLabel="Creating centre">
          Create centre
        </Button>
      </div>
    </form>
  );
}
