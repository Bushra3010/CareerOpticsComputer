"use client";

import { useActionState } from "react";
import { X } from "lucide-react";

import { Button } from "@/components/ui/button";

import {
  activateQuestionBank,
  cancelExam,
  deleteExam,
  removeQuestionFromExam,
  retireQuestion,
  retireQuestionBank,
  unassignCentreFromExam,
  type ExamActionState,
} from "../actions";

const initial: ExamActionState = { status: "idle" };

export function CancelExamButton({ examId }: { examId: string }) {
  const bound = cancelExam.bind(null, examId);
  const [state, action, pending] = useActionState(bound, initial);

  return (
    <form action={action}>
      <Button
        variant="destructive-outline"
        size="sm"
        loading={pending}
        loadingLabel="Cancelling"
      >
        Cancel exam
      </Button>
      {state.status === "error" && state.message ? (
        <p role="alert" className="text-meta text-danger mt-1">
          {state.message}
        </p>
      ) : null}
    </form>
  );
}

export function RemoveQuestionButton({
  examId,
  examQuestionId,
}: {
  examId: string;
  examQuestionId: string;
}) {
  const bound = removeQuestionFromExam.bind(null, examId, examQuestionId);
  const [, action, pending] = useActionState(bound, initial);

  return (
    <form action={action}>
      <Button
        type="submit"
        variant="tertiary"
        size="sm"
        loading={pending}
        aria-label="Remove from paper"
      >
        <X aria-hidden="true" className="size-4" />
      </Button>
    </form>
  );
}

export function UnassignCentreButton({
  examId,
  assignmentId,
}: {
  examId: string;
  assignmentId: string;
}) {
  const bound = unassignCentreFromExam.bind(null, examId, assignmentId);
  const [, action, pending] = useActionState(bound, initial);

  return (
    <form action={action}>
      <Button
        type="submit"
        variant="tertiary"
        size="sm"
        loading={pending}
        aria-label="Unassign centre"
      >
        <X aria-hidden="true" className="size-4" />
      </Button>
    </form>
  );
}

export function QuestionBankStatusButton({
  bankId,
  currentStatus,
}: {
  bankId: string;
  currentStatus: "draft" | "active" | "retired";
}) {
  const action =
    currentStatus === "retired" ? activateQuestionBank : retireQuestionBank;
  const bound = action.bind(null, bankId);
  const [, formAction, pending] = useActionState(bound, initial);

  return (
    <form action={formAction}>
      <Button
        type="submit"
        variant="tertiary"
        size="sm"
        loading={pending}
        loadingLabel="Saving"
      >
        {currentStatus === "retired" ? "Reactivate" : "Retire"}
      </Button>
    </form>
  );
}

export function RetireQuestionButton({
  bankId,
  questionId,
}: {
  bankId: string;
  questionId: string;
}) {
  const bound = retireQuestion.bind(null, bankId, questionId);
  const [, action, pending] = useActionState(bound, initial);

  return (
    <form action={action}>
      <Button
        type="submit"
        variant="tertiary"
        size="sm"
        loading={pending}
        loadingLabel="Saving"
      >
        Retire
      </Button>
    </form>
  );
}

export function DeleteExamButton({ examId }: { examId: string }) {
  const bound = deleteExam.bind(null, examId);
  const [state, action, pending] = useActionState(bound, initial);

  return (
    <form action={action}>
      <Button
        variant="destructive"
        size="sm"
        loading={pending}
        loadingLabel="Deleting"
      >
        Delete draft
      </Button>
      {state.status === "error" && state.message ? (
        <p role="alert" className="text-meta text-danger mt-1">
          {state.message}
        </p>
      ) : null}
    </form>
  );
}
