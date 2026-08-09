"use client";

import { useActionState, useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import { Field, RequiredLegend } from "@/components/ui/field";
import { Input, Select } from "@/components/ui/input";

import { createCommissionRule, type ReferralActionState } from "../actions";

const initial: ReferralActionState = { status: "idle" };

export function CommissionRuleForm() {
  const formRef = useRef<HTMLFormElement>(null);
  const [state, action, pending] = useActionState(
    createCommissionRule,
    initial,
  );
  const [amountType, setAmountType] = useState<"flat" | "percentage">("flat");

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
        <Field id="event" label="Triggering event" required>
          <Select name="event" required defaultValue="centre_approval">
            <option value="centre_approval">Centre approval</option>
            <option value="student_admission">Student admission</option>
            <option value="fee_payment">Fee payment</option>
          </Select>
        </Field>
        <Field id="amountType" label="Amount type" required>
          <Select
            name="amountType"
            required
            value={amountType}
            onChange={(e) =>
              setAmountType(e.target.value as "flat" | "percentage")
            }
          >
            <option value="flat">Flat amount</option>
            <option value="percentage">Percentage</option>
          </Select>
        </Field>
      </div>

      {amountType === "flat" ? (
        <Field
          id="flatAmountRupees"
          label="Amount (₹)"
          required
          error={state.fieldErrors?.flatAmountRupees}
        >
          <Input name="flatAmountRupees" type="number" min="0" step="0.01" />
        </Field>
      ) : (
        <Field
          id="percentage"
          label="Percentage (%)"
          required
          error={state.fieldErrors?.percentage}
        >
          <Input
            name="percentage"
            type="number"
            min="0"
            max="100"
            step="0.01"
          />
        </Field>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <Field
          id="effectiveFrom"
          label="Effective from"
          required
          error={state.fieldErrors?.effectiveFrom}
        >
          <Input
            name="effectiveFrom"
            type="date"
            required
            defaultValue={new Date().toISOString().slice(0, 10)}
          />
        </Field>
        <Field
          id="effectiveTo"
          label="Effective to"
          help="Leave blank for no end date."
        >
          <Input name="effectiveTo" type="date" />
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

      <Button type="submit" loading={pending} loadingLabel="Creating">
        Create rule
      </Button>
    </form>
  );
}
