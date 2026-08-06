"use client";

import { useActionState } from "react";

import { Button } from "@/components/ui/button";

import { startExam, type StartExamState } from "../attempt-actions";

const initial: StartExamState = { status: "idle" };

export function StartExamButton({
  examId,
  resume,
}: {
  examId: string;
  resume: boolean;
}) {
  const bound = startExam.bind(null, examId);
  const [state, action, pending] = useActionState(bound, initial);

  return (
    <form action={action}>
      <Button type="submit" loading={pending} loadingLabel="Opening">
        {resume ? "Resume exam" : "Start exam"}
      </Button>
      {state.status === "error" && state.message ? (
        <p role="alert" className="text-meta text-danger mt-2 max-w-64">
          {state.message}
        </p>
      ) : null}
    </form>
  );
}
