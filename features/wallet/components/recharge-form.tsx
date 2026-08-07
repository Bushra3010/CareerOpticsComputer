"use client";

import { useActionState, useRef } from "react";

import { Button } from "@/components/ui/button";
import { Field, RequiredLegend } from "@/components/ui/field";
import { Input, Select } from "@/components/ui/input";

import { rechargeWallet, type WalletActionState } from "../actions";

const initial: WalletActionState = { status: "idle" };

export function RechargeForm({
  centres,
}: {
  centres: { centreId: string; centreName: string; centreCode: string }[];
}) {
  const formRef = useRef<HTMLFormElement>(null);
  const [state, action, pending] = useActionState(rechargeWallet, initial);

  if (centres.length === 0) {
    return (
      <p className="text-body text-text-secondary">
        No active centres to recharge.
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
      className="space-y-4"
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <Field id="centreId" label="Centre" required>
          <Select name="centreId" required defaultValue={centres[0].centreId}>
            {centres.map((c) => (
              <option key={c.centreId} value={c.centreId}>
                {c.centreName} ({c.centreCode})
              </option>
            ))}
          </Select>
        </Field>
        <Field
          id="amountRupees"
          label="Amount (₹)"
          required
          error={state.fieldErrors?.amountRupees}
        >
          <Input
            name="amountRupees"
            type="number"
            min="0.01"
            step="0.01"
            required
          />
        </Field>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field
          id="reason"
          label="Reason"
          required
          help="e.g. UPI transfer received 7 Aug"
          error={state.fieldErrors?.reason}
        >
          <Input name="reason" required maxLength={200} />
        </Field>
        <Field id="reference" label="Reference" help="Transaction ID, if any.">
          <Input name="reference" maxLength={100} />
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

      <Button type="submit" loading={pending} loadingLabel="Recharging">
        Recharge wallet
      </Button>
    </form>
  );
}
