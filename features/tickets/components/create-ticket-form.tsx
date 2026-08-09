"use client";

import { useActionState } from "react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

import { Button } from "@/components/ui/button";
import { Field, RequiredLegend } from "@/components/ui/field";
import { Input, Select, Textarea } from "@/components/ui/input";

import { createTicket, type TicketActionState } from "../actions";

const initial: TicketActionState = { status: "idle" };

export function CreateTicketForm({
  centreId,
  redirectBase,
}: {
  centreId: string;
  redirectBase: string;
}) {
  const router = useRouter();
  const [state, action, pending] = useActionState(createTicket, initial);

  useEffect(() => {
    if (state.status === "success" && state.ticketId) {
      router.push(`${redirectBase}/${state.ticketId}`);
    }
  }, [state, router, redirectBase]);

  return (
    <form action={action} className="space-y-4">
      <input type="hidden" name="centreId" value={centreId} />

      <div className="grid gap-4 sm:grid-cols-2">
        <Field
          id="category"
          label="Category"
          required
          error={state.fieldErrors?.category}
        >
          <Select name="category" required defaultValue="general">
            <option value="general">General</option>
            <option value="billing">Billing</option>
            <option value="technical">Technical</option>
            <option value="academic">Academic</option>
          </Select>
        </Field>
        <Field id="priority" label="Priority" required>
          <Select name="priority" required defaultValue="medium">
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
            <option value="urgent">Urgent</option>
          </Select>
        </Field>
      </div>

      <Field
        id="subject"
        label="Subject"
        required
        error={state.fieldErrors?.subject}
      >
        <Input name="subject" required maxLength={200} />
      </Field>

      <Field
        id="body"
        label="Describe the issue"
        required
        error={state.fieldErrors?.body}
      >
        <Textarea name="body" rows={5} required maxLength={4000} />
      </Field>
      <p className="text-meta text-text-secondary">
        Screenshots or documents can be attached from the reply box once the
        ticket is raised.
      </p>

      <RequiredLegend />
      {state.status === "error" && state.message ? (
        <p role="alert" className="text-body text-danger">
          {state.message}
        </p>
      ) : null}

      <Button type="submit" loading={pending} loadingLabel="Raising">
        Raise ticket
      </Button>
    </form>
  );
}
