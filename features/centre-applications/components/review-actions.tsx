"use client";

import { useActionState } from "react";

import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { Textarea } from "@/components/ui/input";

import {
  approveCentreApplication,
  rejectCentreApplication,
  type ReviewActionState,
} from "../actions";

const initialState: ReviewActionState = { status: "idle" };

export function ReviewActions({ applicationId }: { applicationId: string }) {
  const boundApprove = approveCentreApplication.bind(null, applicationId);
  const boundReject = rejectCentreApplication.bind(null, applicationId);

  const [approveState, approveAction, approving] = useActionState(
    boundApprove,
    initialState,
  );
  const [rejectState, rejectAction, rejecting] = useActionState(
    boundReject,
    initialState,
  );

  if (approveState.status === "success") {
    return (
      <div className="rounded-[var(--radius-card)] border border-green-600 bg-green-50 p-4">
        <p className="text-body text-green-700">{approveState.message}</p>
      </div>
    );
  }

  if (rejectState.status === "success") {
    return (
      <div className="bg-surface-subtle border-border rounded-[var(--radius-card)] border p-4">
        <p className="text-body text-text">{rejectState.message}</p>
      </div>
    );
  }

  return (
    <div className="grid gap-6 sm:grid-cols-2">
      <form action={approveAction} className="space-y-3">
        <Field id="approve-comments" label="Approval notes (optional)">
          <Textarea name="comments" />
        </Field>
        {approveState.status === "error" && approveState.message ? (
          <p role="alert" className="text-body text-danger">
            {approveState.message}
          </p>
        ) : null}
        <Button type="submit" loading={approving} loadingLabel="Approving">
          Approve &amp; create centre
        </Button>
      </form>

      <form action={rejectAction} className="space-y-3">
        <Field id="reject-comments" label="Reason for rejection" required>
          <Textarea name="comments" required />
        </Field>
        {rejectState.status === "error" && rejectState.message ? (
          <p role="alert" className="text-body text-danger">
            {rejectState.message}
          </p>
        ) : null}
        <Button
          type="submit"
          variant="destructive"
          loading={rejecting}
          loadingLabel="Rejecting"
        >
          Reject application
        </Button>
      </form>
    </div>
  );
}
