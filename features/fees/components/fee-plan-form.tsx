"use client";

import { useActionState } from "react";

import { Button } from "@/components/ui/button";
import { Field, RequiredLegend } from "@/components/ui/field";
import { Input } from "@/components/ui/input";

import { createFeePlan, type FeeActionState } from "../actions";

const initialState: FeeActionState = { status: "idle" };

export function FeePlanForm({
  enrolmentId,
  studentId,
}: {
  enrolmentId: string;
  studentId: string;
}) {
  const boundAction = createFeePlan.bind(null, enrolmentId, studentId);
  const [state, formAction, pending] = useActionState(
    boundAction,
    initialState,
  );

  return (
    <form action={formAction} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-3">
        <Field
          id="totalRupees"
          label="Total fee (₹)"
          required
          error={state.fieldErrors?.totalRupees}
        >
          <Input name="totalRupees" inputMode="decimal" required />
        </Field>

        <Field
          id="instalmentCount"
          label="Instalments"
          required
          error={state.fieldErrors?.instalmentCount}
          help="Split monthly from the first due date."
        >
          <Input
            name="instalmentCount"
            type="number"
            min={1}
            max={36}
            defaultValue={1}
            required
          />
        </Field>

        <Field
          id="firstDueDate"
          label="First due date"
          required
          error={state.fieldErrors?.firstDueDate}
        >
          <Input name="firstDueDate" type="date" required />
        </Field>
      </div>

      <RequiredLegend />

      {state.status === "error" && state.message ? (
        <p role="alert" className="text-body text-danger">
          {state.message}
        </p>
      ) : null}

      <Button type="submit" loading={pending} loadingLabel="Creating">
        Create fee plan
      </Button>
    </form>
  );
}
