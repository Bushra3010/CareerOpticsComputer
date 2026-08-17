"use client";

import * as React from "react";

import { useActionState } from "react";

import { Button } from "@/components/ui/button";
import { Field, RequiredLegend } from "@/components/ui/field";
import { Input, Select } from "@/components/ui/input";

import { postPayment, type FeeActionState } from "../actions";

const initialState: FeeActionState = { status: "idle" };

const METHODS = [
  { value: "cash", label: "Cash" },
  { value: "upi", label: "UPI" },
  { value: "bank_transfer", label: "Bank transfer" },
  { value: "cheque", label: "Cheque" },
  { value: "card", label: "Card" },
] as const;

export function CollectPaymentForm({
  feePlanId,
  studentId,
}: {
  feePlanId: string;
  studentId: string;
}) {
  const boundAction = postPayment.bind(null, feePlanId, studentId);
  const [state, formAction, pending] = useActionState(
    boundAction,
    initialState,
  );

  /* Minted once per mounted form, not per submit: that is precisely what
     makes a double click idempotent — both submissions carry the same key,
     so the second returns the first one's receipt rather than posting
     again (migration 0046). A fresh key only appears when the clerk opens
     the form for a genuinely new payment. */
  const idempotencyKey = React.useMemo(() => crypto.randomUUID(), []);

  if (state.status === "success") {
    return (
      <div className="rounded-[var(--radius-card)] border border-green-600 bg-green-50 p-4">
        <p className="text-card-title text-green-700">Payment posted</p>
        <p className="text-body text-text-secondary mt-1">
          Receipt number:{" "}
          <span className="text-text font-semibold">{state.receiptNumber}</span>
        </p>
      </div>
    );
  }

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="idempotencyKey" value={idempotencyKey} />
      <div className="grid gap-4 sm:grid-cols-3">
        <Field
          id="amountRupees"
          label="Amount (₹)"
          required
          error={state.fieldErrors?.amountRupees}
        >
          <Input name="amountRupees" inputMode="decimal" required />
        </Field>

        <Field
          id="method"
          label="Method"
          required
          error={state.fieldErrors?.method}
        >
          <Select name="method" defaultValue="cash" required>
            {METHODS.map((m) => (
              <option key={m.value} value={m.value}>
                {m.label}
              </option>
            ))}
          </Select>
        </Field>

        <Field
          id="reference"
          label="Reference"
          error={state.fieldErrors?.reference}
          help="UPI ref, cheque no., etc."
        >
          <Input name="reference" />
        </Field>
      </div>

      <RequiredLegend />

      {state.status === "error" && state.message ? (
        <p role="alert" className="text-body text-danger">
          {state.message}
        </p>
      ) : null}

      <Button type="submit" loading={pending} loadingLabel="Posting">
        Post payment
      </Button>
    </form>
  );
}
