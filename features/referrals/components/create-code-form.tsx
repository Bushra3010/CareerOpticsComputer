"use client";

import { useActionState, useRef } from "react";

import { Button } from "@/components/ui/button";
import { Field, RequiredLegend } from "@/components/ui/field";
import { Input, Select } from "@/components/ui/input";

import { createReferralCode, type ReferralActionState } from "../actions";

const initial: ReferralActionState = { status: "idle" };

export function CreateCodeForm({
  centres,
}: {
  centres: { id: string; name: string; code: string }[];
}) {
  const formRef = useRef<HTMLFormElement>(null);
  const [state, action, pending] = useActionState(createReferralCode, initial);

  if (centres.length === 0) {
    return (
      <p className="text-body text-text-secondary">
        No active centres to issue a code for.
      </p>
    );
  }

  return (
    <form
      ref={formRef}
      action={async (formData) => {
        await action(formData);
        formRef.current?.reset();
      }}
      className="flex flex-wrap items-end gap-3"
    >
      <Field id="ownerCentreId" label="Issue to centre" required>
        <Select name="ownerCentreId" required defaultValue={centres[0].id}>
          {centres.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name} ({c.code})
            </option>
          ))}
        </Select>
      </Field>
      <Field
        id="validUntil"
        label="Valid until"
        help="Leave blank for no expiry."
      >
        <Input name="validUntil" type="date" />
      </Field>
      <Button type="submit" loading={pending} loadingLabel="Issuing">
        Issue code
      </Button>
      {state.status === "success" && state.code ? (
        <p
          role="status"
          className="text-body w-full font-semibold text-green-700"
        >
          Issued: {state.code}
        </p>
      ) : null}
      {state.status === "error" && state.message ? (
        <p role="alert" className="text-meta text-danger w-full">
          {state.message}
        </p>
      ) : null}
      <RequiredLegend />
    </form>
  );
}
