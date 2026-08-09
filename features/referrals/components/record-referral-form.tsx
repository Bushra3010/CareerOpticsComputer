"use client";

import { useActionState, useRef } from "react";

import { Button } from "@/components/ui/button";
import { Field, RequiredLegend } from "@/components/ui/field";
import { Input, Select } from "@/components/ui/input";

import { recordReferral, type ReferralActionState } from "../actions";

const initial: ReferralActionState = { status: "idle" };

export function RecordReferralForm() {
  const formRef = useRef<HTMLFormElement>(null);
  const [state, action, pending] = useActionState(recordReferral, initial);

  return (
    <form
      ref={formRef}
      action={async (formData) => {
        await action(formData);
        formRef.current?.reset();
      }}
      className="space-y-4"
    >
      <div className="grid gap-4 sm:grid-cols-3">
        <Field
          id="code"
          label="Referral code"
          required
          error={state.fieldErrors?.code}
        >
          <Input name="code" required maxLength={20} placeholder="D23C5F83" />
        </Field>
        <Field id="referredEntityType" label="Referred" required>
          <Select name="referredEntityType" required defaultValue="centre">
            <option value="centre">A centre</option>
            <option value="lead">A lead</option>
            <option value="student">A student</option>
          </Select>
        </Field>
        <Field
          id="referredEntityId"
          label="Referred id"
          required
          help="The centre, lead or student's id."
          error={state.fieldErrors?.referredEntityId}
        >
          <Input name="referredEntityId" required maxLength={36} />
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

      <Button type="submit" loading={pending} loadingLabel="Recording">
        Record referral
      </Button>
    </form>
  );
}
