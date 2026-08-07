"use client";

import { useActionState } from "react";

import { Button } from "@/components/ui/button";

import { markOrderDelivered, type OrderActionState } from "../actions";

const initial: OrderActionState = { status: "idle" };

export function MarkDeliveredButton({ orderId }: { orderId: string }) {
  const bound = markOrderDelivered.bind(null, orderId);
  const [state, action, pending] = useActionState(bound, initial);

  return (
    <form action={action}>
      <Button
        type="submit"
        variant="secondary"
        loading={pending}
        loadingLabel="Saving"
      >
        Acknowledge delivery
      </Button>
      {state.status === "error" && state.message ? (
        <p role="alert" className="text-meta text-danger mt-1">
          {state.message}
        </p>
      ) : null}
    </form>
  );
}
