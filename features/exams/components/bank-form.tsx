"use client";

import { useActionState, useRef } from "react";

import { Button } from "@/components/ui/button";
import { Field, RequiredLegend } from "@/components/ui/field";
import { Input, Textarea } from "@/components/ui/input";

import { createQuestionBank, type ExamActionState } from "../actions";

const initial: ExamActionState = { status: "idle" };

export function BankForm() {
  const formRef = useRef<HTMLFormElement>(null);
  const [state, action, pending] = useActionState(createQuestionBank, initial);

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
        <Field
          id="name"
          label="Bank name"
          required
          error={state.fieldErrors?.name}
        >
          <Input name="name" required maxLength={120} />
        </Field>
        <Field id="description" label="Description">
          <Textarea name="description" rows={2} maxLength={500} />
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
        Create bank
      </Button>
    </form>
  );
}
