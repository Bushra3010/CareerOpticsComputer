"use client";

import { useActionState } from "react";

import { Button } from "@/components/ui/button";

import { importAttemptResults, type ResultActionState } from "../actions";

const initial: ResultActionState = { status: "idle" };

/**
 * Pulls graded exam attempts into this draft publication.
 *
 * Sits beside the manual marks form rather than replacing it: the bridge
 * covers students who sat an online exam, and the form remains for practicals
 * and anything marked on paper. Both write through the same upsert, so using
 * one after the other corrects rather than duplicates.
 */
export function ImportAttemptsButton({
  publicationId,
}: {
  publicationId: string;
}) {
  const bound = importAttemptResults.bind(null, publicationId);
  const [state, action, pending] = useActionState(bound, initial);

  return (
    <form action={action} className="space-y-2">
      <Button
        type="submit"
        variant="secondary"
        loading={pending}
        loadingLabel="Importing"
      >
        Import exam results
      </Button>
      <p className="text-meta text-text-secondary max-w-prose">
        Brings in each student&rsquo;s latest graded online attempt for this
        course. Running it again refreshes the marks.
      </p>
      {state.status === "error" && state.message ? (
        <p role="alert" className="text-meta text-danger">
          {state.message}
        </p>
      ) : null}
      {state.status === "success" && state.message ? (
        <p role="status" className="text-meta text-green-700">
          {state.message}
        </p>
      ) : null}
    </form>
  );
}
