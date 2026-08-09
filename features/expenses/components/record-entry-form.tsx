"use client";

import { useActionState, useRef } from "react";

import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { Input, Select, Textarea } from "@/components/ui/input";

import { recordExpenseEntry, type ExpenseActionState } from "../actions";
import { SUGGESTED_CATEGORIES } from "../schema";

const initial: ExpenseActionState = { status: "idle" };

export function RecordEntryForm({ today }: { today: string }) {
  const formRef = useRef<HTMLFormElement>(null);
  const [state, action, pending] = useActionState(recordExpenseEntry, initial);

  return (
    <form
      ref={formRef}
      action={async (formData) => {
        await action(formData);
        formRef.current?.reset();
      }}
      className="space-y-4"
    >
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Field id="entryType" label="Type" required>
          <Select name="entryType" defaultValue="expense" required>
            <option value="expense">Expense</option>
            <option value="income">Income</option>
          </Select>
        </Field>
        <Field
          id="category"
          label="Category"
          required
          error={state.fieldErrors?.category}
        >
          <>
            <Input
              name="category"
              list="expense-categories"
              required
              maxLength={60}
            />
            <datalist id="expense-categories">
              {SUGGESTED_CATEGORIES.map((c) => (
                <option key={c} value={c} />
              ))}
            </datalist>
          </>
        </Field>
        <Field
          id="amountRupees"
          label="Amount (₹)"
          required
          error={state.fieldErrors?.amountRupees}
        >
          <Input name="amountRupees" inputMode="decimal" required />
        </Field>
        <Field
          id="entryDate"
          label="Date"
          required
          error={state.fieldErrors?.entryDate}
        >
          <Input name="entryDate" type="date" defaultValue={today} required />
        </Field>
      </div>
      <Field id="note" label="Note" error={state.fieldErrors?.note}>
        <Textarea name="note" rows={2} maxLength={300} />
      </Field>

      {state.status === "error" && state.message ? (
        <Alert tone="danger" title="Could not record the entry">
          {state.message}
        </Alert>
      ) : null}

      <Button type="submit" loading={pending} loadingLabel="Saving">
        Record entry
      </Button>
    </form>
  );
}
