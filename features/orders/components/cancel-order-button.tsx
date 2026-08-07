"use client";

import { useState, useTransition } from "react";

import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/dialog";

import { cancelOrder, type OrderActionState } from "../actions";

/**
 * Behind a confirmation with a mandatory reason. Cancelling a paid order
 * reverses the wallet debit and restocks the reserved items (migration
 * 0031's `cancel_order`) — hard to reverse in spirit even though it is
 * mechanically undoable, so it gets the same step-up shape as certificate
 * revocation.
 */
export function CancelOrderButton({
  orderId,
  orderNumber,
}: {
  orderId: string;
  orderNumber: string;
}) {
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const [result, setResult] = useState<OrderActionState | null>(null);

  if (result?.status === "success") {
    return <span className="text-meta text-text-secondary">Cancelled</span>;
  }

  const confirm = (reason?: string) => {
    const formData = new FormData();
    formData.set("reason", reason ?? "");
    startTransition(async () => {
      const next = await cancelOrder(orderId, { status: "idle" }, formData);
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
        Cancel order
      </Button>
      <ConfirmDialog
        open={open}
        onOpenChange={setOpen}
        title={`Cancel ${orderNumber}?`}
        target={orderNumber}
        consequence="If this order was already paid, the wallet debit is reversed and the reserved stock is put back. This cannot be undone from here."
        confirmLabel="Cancel order"
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
