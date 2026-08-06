"use client";

import { useActionState, useRef } from "react";

import { Button } from "@/components/ui/button";
import { Field, RequiredLegend } from "@/components/ui/field";
import { Input, Select, Textarea } from "@/components/ui/input";

import { createExam, type ExamActionState } from "../actions";

const initial: ExamActionState = { status: "idle" };

export function ExamForm({ banks }: { banks: { id: string; name: string }[] }) {
  const formRef = useRef<HTMLFormElement>(null);
  const [state, action, pending] = useActionState(createExam, initial);

  if (banks.length === 0) {
    return (
      <p className="text-body text-text-secondary">
        Create a question bank first — an exam draws its paper from one.
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
        <Field
          id="title"
          label="Title"
          required
          error={state.fieldErrors?.title}
        >
          <Input name="title" required maxLength={160} />
        </Field>
        <Field id="bankId" label="Question bank" required>
          <Select name="bankId" required defaultValue={banks[0].id}>
            {banks.map((b) => (
              <option key={b.id} value={b.id}>
                {b.name}
              </option>
            ))}
          </Select>
        </Field>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field
          id="opensAt"
          label="Opens"
          required
          help="Indian Standard Time."
          error={state.fieldErrors?.opensAt}
        >
          <Input name="opensAt" type="datetime-local" required />
        </Field>
        <Field
          id="closesAt"
          label="Closes"
          required
          error={state.fieldErrors?.closesAt}
        >
          <Input name="closesAt" type="datetime-local" required />
        </Field>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Field
          id="durationMinutes"
          label="Duration (minutes)"
          required
          error={state.fieldErrors?.durationMinutes}
        >
          <Input
            name="durationMinutes"
            type="number"
            min={1}
            max={600}
            defaultValue={30}
            required
          />
        </Field>
        <Field id="passPercent" label="Pass mark (%)">
          <Input
            name="passPercent"
            type="number"
            min={0}
            max={100}
            defaultValue={40}
          />
        </Field>
        <Field id="maxAttempts" label="Attempts allowed">
          <Input
            name="maxAttempts"
            type="number"
            min={1}
            max={10}
            defaultValue={1}
          />
        </Field>
      </div>

      <Field
        id="instructions"
        label="Instructions"
        help="Shown before the exam starts."
      >
        <Textarea name="instructions" rows={2} maxLength={2000} />
      </Field>

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
        Create exam
      </Button>
    </form>
  );
}
