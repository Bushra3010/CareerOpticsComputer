"use client";

import { useState, useTransition } from "react";
import { useActionState } from "react";

import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/dialog";

import {
  approveCommission,
  markCommissionPayable,
  payCommission,
  reverseCommission,
  type ReferralActionState,
} from "../actions";

const initial: ReferralActionState = { status: "idle" };

export function ApproveCommissionButton({
  commissionEntryId,
}: {
  commissionEntryId: string;
}) {
  const bound = approveCommission.bind(null, commissionEntryId);
  const [, action, pending] = useActionState(bound, initial);
  return (
    <form action={action}>
      <Button
        type="submit"
        variant="secondary"
        size="sm"
        loading={pending}
        loadingLabel="Approving"
      >
        Approve
      </Button>
    </form>
  );
}

export function MarkCommissionPayableButton({
  commissionEntryId,
}: {
  commissionEntryId: string;
}) {
  const bound = markCommissionPayable.bind(null, commissionEntryId);
  const [, action, pending] = useActionState(bound, initial);
  return (
    <form action={action}>
      <Button
        type="submit"
        variant="secondary"
        size="sm"
        loading={pending}
        loadingLabel="Saving"
      >
        Mark payable
      </Button>
    </form>
  );
}

export function PayCommissionButton({
  commissionEntryId,
}: {
  commissionEntryId: string;
}) {
  const bound = payCommission.bind(null, commissionEntryId);
  const [state, action, pending] = useActionState(bound, initial);
  return (
    <form action={action}>
      <Button type="submit" size="sm" loading={pending} loadingLabel="Paying">
        Pay
      </Button>
      {state.status === "error" && state.message ? (
        <p role="alert" className="text-meta text-danger mt-1">
          {state.message}
        </p>
      ) : null}
    </form>
  );
}

/** Behind a confirmation with a mandatory reason — a clawback can take a
 *  centre's wallet negative if it has since spent the money (migration
 *  0032's own header), so this should never be a single accidental click. */
export function ReverseCommissionButton({
  commissionEntryId,
}: {
  commissionEntryId: string;
}) {
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const [result, setResult] = useState<ReferralActionState | null>(null);

  if (result?.status === "success") {
    return <span className="text-meta text-text-secondary">Reversed</span>;
  }

  const confirm = (reason?: string) => {
    const formData = new FormData();
    formData.set("reason", reason ?? "");
    startTransition(async () => {
      const next = await reverseCommission(
        commissionEntryId,
        { status: "idle" },
        formData,
      );
      setResult(next);
      if (next.status === "success") setOpen(false);
    });
  };

  return (
    <>
      <Button
        variant="destructive-outline"
        size="sm"
        onClick={() => setOpen(true)}
      >
        Reverse
      </Button>
      <ConfirmDialog
        open={open}
        onOpenChange={setOpen}
        title="Reverse this commission?"
        target="this commission entry"
        consequence="If it was already paid, the wallet credit is clawed back — which can take the centre's balance negative if it has since been spent."
        confirmLabel="Reverse commission"
        requireReason
        loading={pending}
        onConfirm={confirm}
      />
      {result?.status === "error" && result.message ? (
        <p role="alert" className="text-meta text-danger mt-1">
          {result.message}
        </p>
      ) : null}
    </>
  );
}
