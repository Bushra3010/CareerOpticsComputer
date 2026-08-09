"use client";

import { useActionState, useRef } from "react";

import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";

import {
  assignTicket,
  closeTicket,
  reopenTicket,
  resolveTicket,
  type TicketActionState,
} from "../actions";

const initial: TicketActionState = { status: "idle" };

export function AssignTicketForm({ ticketId }: { ticketId: string }) {
  const formRef = useRef<HTMLFormElement>(null);
  const bound = assignTicket.bind(null, ticketId);
  const [state, action, pending] = useActionState(bound, initial);

  return (
    <form
      ref={formRef}
      action={async (formData) => {
        await action(formData);
        formRef.current?.reset();
      }}
      className="flex flex-wrap items-end gap-3"
    >
      <Field
        id="assigneeId"
        label="Assign to (user id)"
        error={state.fieldErrors?.assigneeId}
      >
        <Input name="assigneeId" required maxLength={36} className="w-64" />
      </Field>
      <Button
        type="submit"
        variant="secondary"
        size="sm"
        loading={pending}
        loadingLabel="Assigning"
      >
        Assign
      </Button>
      {state.status === "error" && state.message ? (
        <p role="alert" className="text-meta text-danger w-full">
          {state.message}
        </p>
      ) : null}
    </form>
  );
}

export function ResolveTicketButton({ ticketId }: { ticketId: string }) {
  const bound = resolveTicket.bind(null, ticketId);
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
        Mark resolved
      </Button>
    </form>
  );
}

export function CloseTicketButton({ ticketId }: { ticketId: string }) {
  const bound = closeTicket.bind(null, ticketId);
  const [, action, pending] = useActionState(bound, initial);
  return (
    <form action={action}>
      <Button
        type="submit"
        variant="tertiary"
        size="sm"
        loading={pending}
        loadingLabel="Saving"
      >
        Close
      </Button>
    </form>
  );
}

export function ReopenTicketButton({ ticketId }: { ticketId: string }) {
  const bound = reopenTicket.bind(null, ticketId);
  const [, action, pending] = useActionState(bound, initial);
  return (
    <form action={action}>
      <Button
        type="submit"
        variant="destructive-outline"
        size="sm"
        loading={pending}
        loadingLabel="Saving"
      >
        Reopen
      </Button>
    </form>
  );
}
