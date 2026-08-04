"use client";

import { useActionState } from "react";

import { Button } from "@/components/ui/button";

import { inviteStudentToPortal, type InviteState } from "../invite-actions";

const initialState: InviteState = { status: "idle" };

export function InviteButton({ studentId }: { studentId: string }) {
  const bound = inviteStudentToPortal.bind(null, studentId);
  const [state, formAction, pending] = useActionState(bound, initialState);

  if (state.status === "success") {
    return (
      <span className="text-meta text-green-700" role="status">
        Invited
      </span>
    );
  }

  return (
    <form action={formAction}>
      <Button
        type="submit"
        variant="tertiary"
        size="sm"
        loading={pending}
        loadingLabel="Inviting"
      >
        Invite to portal
      </Button>
      {state.status === "error" && state.message ? (
        <p role="alert" className="text-meta text-danger mt-1 max-w-56">
          {state.message}
        </p>
      ) : null}
    </form>
  );
}
