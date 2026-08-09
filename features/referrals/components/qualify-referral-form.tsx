"use client";

import { useActionState, useRef } from "react";

import { Button } from "@/components/ui/button";
import { Field, RequiredLegend } from "@/components/ui/field";
import { Input, Select } from "@/components/ui/input";

import { qualifyReferral, type ReferralActionState } from "../actions";
import type { PendingReferralOption } from "../queries";

const initial: ReferralActionState = { status: "idle" };

export function QualifyReferralForm({
  referrals,
}: {
  referrals: PendingReferralOption[];
}) {
  if (referrals.length === 0) {
    return (
      <p className="text-body text-text-secondary">
        No pending referrals to qualify.
      </p>
    );
  }

  return (
    <div className="space-y-4">
      {referrals.map((r) => (
        <QualifyRow key={r.id} referral={r} />
      ))}
    </div>
  );
}

function QualifyRow({ referral }: { referral: PendingReferralOption }) {
  const formRef = useRef<HTMLFormElement>(null);
  const bound = qualifyReferral.bind(null, referral.id);
  const [state, action, pending] = useActionState(bound, initial);

  return (
    <form
      ref={formRef}
      action={async (formData) => {
        await action(formData);
        formRef.current?.reset();
      }}
      className="border-border bg-surface flex flex-wrap items-end gap-3 rounded-[var(--radius-card)] border p-4"
    >
      <div className="min-w-0">
        <p className="text-body text-text font-semibold">{referral.code}</p>
        <p className="text-meta text-text-secondary">
          {referral.referredLabel}
        </p>
      </div>
      <Field id={`event-${referral.id}`} label="Qualifying event" required>
        <Select name="event" required defaultValue="centre_approval">
          <option value="centre_approval">Centre approval</option>
          <option value="student_admission">Student admission</option>
          <option value="fee_payment">Fee payment</option>
        </Select>
      </Field>
      <Field
        id={`baseAmountRupees-${referral.id}`}
        label="Base amount (₹)"
        help="Only needed for a percentage rule."
        error={state.fieldErrors?.baseAmountRupees}
      >
        <Input
          name="baseAmountRupees"
          type="number"
          min="0"
          step="0.01"
          className="w-32"
        />
      </Field>
      <Button
        type="submit"
        variant="secondary"
        loading={pending}
        loadingLabel="Qualifying"
      >
        Qualify
      </Button>
      {state.status === "error" && state.message ? (
        <p role="alert" className="text-meta text-danger w-full">
          {state.message}
        </p>
      ) : null}
      <RequiredLegend />
    </form>
  );
}
