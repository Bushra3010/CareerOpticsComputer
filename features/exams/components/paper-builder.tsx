"use client";

import { useActionState } from "react";

import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { Select } from "@/components/ui/input";

import {
  addQuestionToExam,
  assignExamToCentre,
  publishExam,
  type ExamActionState,
} from "../actions";

const initial: ExamActionState = { status: "idle" };

function Message({ state }: { state: ExamActionState }) {
  if (state.status === "error" && state.message) {
    return (
      <p role="alert" className="text-meta text-danger">
        {state.message}
      </p>
    );
  }
  if (state.status === "success" && state.message) {
    return (
      <p role="status" className="text-meta text-green-700">
        {state.message}
      </p>
    );
  }
  return null;
}

export function AddQuestion({
  examId,
  questions,
}: {
  examId: string;
  questions: { id: string; body: string; typeLabel: string; marks: number }[];
}) {
  const [state, action, pending] = useActionState(
    addQuestionToExam.bind(null, examId),
    initial,
  );

  if (questions.length === 0) {
    return (
      <p className="text-body text-text-secondary">
        Every active question in this bank is already on the paper.
      </p>
    );
  }

  return (
    <form action={action} className="space-y-3">
      <Field id="questionId" label="Question from the bank">
        <Select name="questionId" defaultValue={questions[0].id}>
          {questions.map((q) => (
            <option key={q.id} value={q.id}>
              {q.body.length > 80 ? `${q.body.slice(0, 80)}…` : q.body} (
              {q.typeLabel}, {q.marks})
            </option>
          ))}
        </Select>
      </Field>
      <Message state={state} />
      <Button
        type="submit"
        variant="secondary"
        loading={pending}
        loadingLabel="Adding"
      >
        Add to paper
      </Button>
    </form>
  );
}

export function AssignCentre({
  examId,
  centres,
}: {
  examId: string;
  centres: { id: string; name: string; code: string }[];
}) {
  const [state, action, pending] = useActionState(
    assignExamToCentre.bind(null, examId),
    initial,
  );

  if (centres.length === 0) {
    return (
      <p className="text-body text-text-secondary">
        Every active centre is already assigned.
      </p>
    );
  }

  return (
    <form action={action} className="space-y-3">
      <Field id="centreId" label="Centre">
        <Select name="centreId" defaultValue={centres[0].id}>
          {centres.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name} ({c.code})
            </option>
          ))}
        </Select>
      </Field>
      <Message state={state} />
      <Button
        type="submit"
        variant="secondary"
        loading={pending}
        loadingLabel="Assigning"
      >
        Assign centre
      </Button>
    </form>
  );
}

export function PublishButton({ examId }: { examId: string }) {
  const [state, action, pending] = useActionState(
    publishExam.bind(null, examId),
    initial,
  );

  return (
    <form action={action} className="space-y-2">
      <Button type="submit" loading={pending} loadingLabel="Publishing">
        Publish exam
      </Button>
      <p className="text-meta text-text-secondary max-w-prose">
        Publishing releases the exam to its assigned centres. The paper itself
        stays unreadable until the window opens.
      </p>
      <Message state={state} />
    </form>
  );
}
