"use client";

import { useActionState } from "react";

import { Button } from "@/components/ui/button";

import { payOrder, type OrderActionState } from "../actions";

const initial: OrderActionState = { status: "idle" };

/** Retry path for an order stuck in `pending_payment` — most often because
 *  the wallet was short and has since been recharged. */
export function PayNowButton({ orderId }: { orderId: string }) {
  const bound = payOrder.bind(null, orderId);
  const [state, action, pending] = useActionState(bound, initial);

  return (
    <form action={action}>
      <Button type="submit" loading={pending} loadingLabel="Paying">
        Pay from wallet
      </Button>
      {state.status === "error" && state.message ? (
        <p role="alert" className="text-meta text-danger mt-1">
          {state.message}
        </p>
      ) : null}
    </form>
  );
}
