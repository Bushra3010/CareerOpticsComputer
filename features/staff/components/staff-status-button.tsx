"use client";

import { useActionState } from "react";

import { Button } from "@/components/ui/button";

import { setStaffStatus, type StaffActionState } from "../actions";

const initial: StaffActionState = { status: "idle" };

export function StaffStatusButton({
  membershipId,
  suspended,
}: {
  membershipId: string;
  suspended: boolean;
}) {
  const next = suspended ? "active" : "suspended";
  const [state, action, pending] = useActionState(
    setStaffStatus.bind(null, membershipId, next),
    initial,
  );

  return (
    <form action={action}>
      <Button
        type="submit"
        variant={suspended ? "tertiary" : "destructive-outline"}
        size="sm"
        loading={pending}
        loadingLabel={suspended ? "Restoring" : "Suspending"}
      >
        {suspended ? "Restore access" : "Suspend"}
      </Button>
      {state.status === "error" && state.message ? (
        <p role="alert" className="text-meta text-danger mt-1 max-w-48">
          {state.message}
        </p>
      ) : null}
    </form>
  );
}
