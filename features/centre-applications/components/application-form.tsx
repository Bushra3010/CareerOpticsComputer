"use client";

import { useActionState } from "react";

import { Button } from "@/components/ui/button";
import { Field, RequiredLegend } from "@/components/ui/field";
import { Input, Textarea } from "@/components/ui/input";

import {
  submitCentreApplication,
  type CentreApplicationFormState,
} from "../actions";

const initialState: CentreApplicationFormState = { status: "idle" };

export function CentreApplicationForm() {
  const [state, formAction, pending] = useActionState(
    submitCentreApplication,
    initialState,
  );

  if (state.status === "success") {
    return (
      <div className="rounded-[var(--radius-card)] border border-green-600 bg-green-50 p-6">
        <p className="text-card-title text-green-700">Application submitted</p>
        <p className="text-body text-text-secondary mt-1">
          Your application number is{" "}
          <span className="text-text font-semibold">
            {state.applicationNumber}
          </span>
          . Head office will review it and get in touch.
        </p>
      </div>
    );
  }

  return (
    <form action={formAction} className="space-y-4">
      <div aria-hidden="true" className="hidden">
        <label htmlFor="website">Website</label>
        <input
          id="website"
          name="website"
          type="text"
          tabIndex={-1}
          autoComplete="off"
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field
          id="applicantName"
          label="Your name"
          required
          error={state.fieldErrors?.applicantName}
        >
          <Input name="applicantName" autoComplete="name" required />
        </Field>

        <Field
          id="applicantPhone"
          label="Mobile number"
          required
          error={state.fieldErrors?.applicantPhone}
        >
          <Input
            name="applicantPhone"
            type="tel"
            inputMode="numeric"
            required
          />
        </Field>

        <Field
          id="applicantEmail"
          label="Email"
          required
          className="sm:col-span-2"
          error={state.fieldErrors?.applicantEmail}
        >
          <Input
            name="applicantEmail"
            type="email"
            autoComplete="email"
            required
          />
        </Field>

        <Field
          id="proposedCentreName"
          label="Proposed centre name"
          required
          className="sm:col-span-2"
          error={state.fieldErrors?.proposedCentreName}
        >
          <Input name="proposedCentreName" required />
        </Field>

        <Field id="city" label="City" required error={state.fieldErrors?.city}>
          <Input name="city" required />
        </Field>

        <Field
          id="state"
          label="State"
          required
          error={state.fieldErrors?.state}
        >
          <Input name="state" required />
        </Field>

        <Field
          id="pincode"
          label="PIN code"
          required
          error={state.fieldErrors?.pincode}
        >
          <Input name="pincode" inputMode="numeric" required />
        </Field>

        <Field
          id="address"
          label="Proposed centre address"
          required
          className="sm:col-span-2"
          error={state.fieldErrors?.address}
        >
          <Textarea name="address" required />
        </Field>

        <Field
          id="message"
          label="Anything else we should know?"
          className="sm:col-span-2"
          error={state.fieldErrors?.message}
        >
          <Textarea name="message" />
        </Field>
      </div>

      <RequiredLegend />

      {state.status === "error" && state.message ? (
        <p role="alert" className="text-body text-danger">
          {state.message}
        </p>
      ) : null}

      <Button type="submit" loading={pending} loadingLabel="Submitting">
        Submit application
      </Button>
    </form>
  );
}
