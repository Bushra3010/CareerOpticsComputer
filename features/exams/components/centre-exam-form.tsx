"use client";

import * as React from "react";
import { Plus } from "lucide-react";

import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Field } from "@/components/ui/field";
import { Input, Select, Textarea } from "@/components/ui/input";

import { createCentreExam, createCentreQuestionBank } from "../centre-actions";
import type { ExamActionState } from "../actions";

const initial: ExamActionState = { status: "idle" };

/**
 * Creating an exam at a centre.
 *
 * Collapsed behind a button because this page is read first and written
 * rarely: a centre looks at it to see what its students are sitting, and
 * writes a paper occasionally.
 *
 * A bank comes first, and not as a matter of taste — migration 0056 refuses an
 * exam whose question bank belongs to a different centre, so a centre with no
 * bank of its own has nothing a new exam could legally draw from. Rather than
 * let someone fill in seven fields and be told that at the end, the form asks
 * for a bank up front when there is none.
 */
export function CentreExamForm({
  banks,
}: {
  banks: { id: string; name: string }[];
}) {
  const [open, setOpen] = React.useState(false);

  if (!open) {
    return (
      <Button onClick={() => setOpen(true)}>
        <Plus />
        New exam
      </Button>
    );
  }

  return (
    <Card className="mt-6 w-full">
      <CardHeader>
        <CardTitle>New exam</CardTitle>
        <Button variant="tertiary" size="sm" onClick={() => setOpen(false)}>
          Cancel
        </Button>
      </CardHeader>
      <CardContent>
        {banks.length === 0 ? <FirstBankForm /> : <ExamFields banks={banks} />}
      </CardContent>
    </Card>
  );
}

function FirstBankForm() {
  const [state, action, pending] = React.useActionState(
    createCentreQuestionBank,
    initial,
  );

  return (
    <form action={action} className="space-y-4">
      <Alert
        tone="info"
        title="Your centre needs a question bank first"
        recovery="An exam draws its questions from a bank belonging to your own centre. Create one here, then the exam form appears."
      />

      <Field
        id="name"
        label="Bank name"
        required
        error={state.fieldErrors?.name}
      >
        <Input
          name="name"
          required
          maxLength={120}
          placeholder="Tally basics"
        />
      </Field>

      <Field
        id="description"
        label="Description"
        error={state.fieldErrors?.description}
      >
        <Textarea name="description" rows={2} maxLength={500} />
      </Field>

      {state.status === "error" && state.message ? (
        <Alert
          tone="danger"
          title="That did not work"
          recovery={state.message}
        />
      ) : null}

      <Button type="submit" loading={pending} loadingLabel="Creating">
        Create question bank
      </Button>
    </form>
  );
}

function ExamFields({ banks }: { banks: { id: string; name: string }[] }) {
  const [state, action, pending] = React.useActionState(
    createCentreExam,
    initial,
  );

  return (
    <form action={action} className="space-y-4">
      {state.status === "success" && state.message ? (
        <Alert tone="success" title={state.message} />
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2">
        <Field
          id="title"
          label="Title"
          required
          error={state.fieldErrors?.title}
        >
          <Input
            name="title"
            required
            maxLength={160}
            placeholder="Unit test 1"
          />
        </Field>

        <Field
          id="bankId"
          label="Question bank"
          required
          error={state.fieldErrors?.bankId}
        >
          <Select name="bankId" required defaultValue="">
            <option value="" disabled>
              Choose a bank
            </option>
            {banks.map((b) => (
              <option key={b.id} value={b.id}>
                {b.name}
              </option>
            ))}
          </Select>
        </Field>

        <Field
          id="opensAt"
          label="Opens (IST)"
          required
          error={state.fieldErrors?.opensAt}
        >
          <Input name="opensAt" type="datetime-local" required />
        </Field>

        <Field
          id="closesAt"
          label="Closes (IST)"
          required
          error={state.fieldErrors?.closesAt}
        >
          <Input name="closesAt" type="datetime-local" required />
        </Field>

        <Field
          id="durationMinutes"
          label="Duration (minutes)"
          required
          error={state.fieldErrors?.durationMinutes}
        >
          <Input
            name="durationMinutes"
            inputMode="numeric"
            defaultValue="30"
            required
          />
        </Field>

        <Field
          id="passPercent"
          label="Pass mark (%)"
          required
          error={state.fieldErrors?.passPercent}
        >
          <Input
            name="passPercent"
            inputMode="numeric"
            defaultValue="40"
            required
          />
        </Field>

        <Field
          id="maxAttempts"
          label="Attempts allowed"
          required
          error={state.fieldErrors?.maxAttempts}
        >
          <Input
            name="maxAttempts"
            inputMode="numeric"
            defaultValue="1"
            required
          />
        </Field>
      </div>

      <Field
        id="instructions"
        label="Instructions"
        error={state.fieldErrors?.instructions}
      >
        <Textarea name="instructions" rows={3} maxLength={2000} />
      </Field>

      {state.status === "error" && state.message ? (
        <Alert
          tone="danger"
          title="That did not work"
          recovery={state.message}
        />
      ) : null}

      <div>
        <Button type="submit" loading={pending} loadingLabel="Creating">
          Create exam
        </Button>
        <p className="text-meta text-text-secondary mt-2">
          Created as a draft. Add questions and publish it before it can be sat
          — a draft is not visible to students.
        </p>
      </div>
    </form>
  );
}
