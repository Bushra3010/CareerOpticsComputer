"use client";

import { useActionState } from "react";

import { Button } from "@/components/ui/button";

import { issueCertificate, type IssueState } from "../actions";

const initial: IssueState = { status: "idle" };

export function IssueCertificateButton({
  studentResultId,
  publicationId,
}: {
  studentResultId: string;
  publicationId: string;
}) {
  const [state, action, pending] = useActionState(
    issueCertificate.bind(null, studentResultId, publicationId),
    initial,
  );

  if (state.status === "success") {
    return (
      <span className="text-meta text-green-700" role="status">
        {state.number}
      </span>
    );
  }

  return (
    <form action={action}>
      <Button
        type="submit"
        variant="tertiary"
        size="sm"
        loading={pending}
        loadingLabel="Issuing"
      >
        Issue certificate
      </Button>
      {state.status === "error" && state.message ? (
        <p role="alert" className="text-meta text-danger mt-1 max-w-56">
          {state.message}
        </p>
      ) : null}
    </form>
  );
}
