"use client";

import { useActionState, useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import { Field, RequiredLegend } from "@/components/ui/field";
import { Input } from "@/components/ui/input";

import { dispatchOrder, type OrderActionState } from "../actions";

const initial: OrderActionState = { status: "idle" };

export function DispatchForm({ orderId }: { orderId: string }) {
  const [open, setOpen] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);
  const bound = dispatchOrder.bind(null, orderId);
  const [state, action, pending] = useActionState(bound, initial);

  if (!open) {
    return (
      <Button onClick={() => setOpen(true)} loading={pending}>
        Dispatch order
      </Button>
    );
  }

  return (
    <form ref={formRef} action={action} className="space-y-4">
      <Field
        id="courier"
        label="Courier"
        required
        error={state.fieldErrors?.courier}
      >
        <Input
          name="courier"
          required
          maxLength={100}
          placeholder="e.g. Delhivery, Blue Dart"
        />
      </Field>
      <Field id="trackingNumber" label="Tracking number">
        <Input name="trackingNumber" maxLength={100} />
      </Field>
      <RequiredLegend />
      {state.status === "error" && state.message ? (
        <p role="alert" className="text-body text-danger">
          {state.message}
        </p>
      ) : null}
      <div className="flex gap-3">
        <Button type="submit" loading={pending} loadingLabel="Dispatching">
          Confirm dispatch
        </Button>
        <Button type="button" variant="tertiary" onClick={() => setOpen(false)}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
