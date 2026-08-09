"use client";

import { useActionState, useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/input";

import { addTicketMessage, type TicketActionState } from "../actions";
import type { TicketMessageRow } from "../queries";

const initial: TicketActionState = { status: "idle" };

export function MessageThread({
  ticketId,
  messages,
  canAddInternalNote,
}: {
  ticketId: string;
  messages: TicketMessageRow[];
  canAddInternalNote: boolean;
}) {
  return (
    <div className="space-y-4">
      <ol className="space-y-3">
        {messages.map((m) => (
          <li
            key={m.id}
            className={
              m.isInternal
                ? "border-warning-border bg-warning-bg rounded-[var(--radius-card)] border px-4 py-3"
                : "border-border bg-surface rounded-[var(--radius-card)] border px-4 py-3"
            }
          >
            <p className="text-meta text-text-secondary">
              {m.senderType === "student" ? "Student" : "Staff"}
              {m.isInternal ? " · Internal note" : ""} &middot;{" "}
              {new Date(m.createdAt).toLocaleString("en-IN")}
            </p>
            <p className="text-body text-text mt-1 whitespace-pre-wrap">
              {m.body}
            </p>
          </li>
        ))}
      </ol>

      <ReplyForm ticketId={ticketId} isInternal={false} label="Reply" />
      {canAddInternalNote ? (
        <ReplyForm
          ticketId={ticketId}
          isInternal
          label="Internal note (staff only)"
        />
      ) : null}
    </div>
  );
}

function ReplyForm({
  ticketId,
  isInternal,
  label,
}: {
  ticketId: string;
  isInternal: boolean;
  label: string;
}) {
  const formRef = useRef<HTMLFormElement>(null);
  const [open, setOpen] = useState(!isInternal);
  const bound = addTicketMessage.bind(null, ticketId, isInternal);
  const [state, action, pending] = useActionState(bound, initial);

  if (!open) {
    return (
      <Button variant="tertiary" size="sm" onClick={() => setOpen(true)}>
        {label}
      </Button>
    );
  }

  return (
    <form
      ref={formRef}
      action={async (formData) => {
        await action(formData);
        formRef.current?.reset();
      }}
      className={
        isInternal
          ? "border-warning-border bg-warning-bg space-y-2 rounded-[var(--radius-card)] border p-4"
          : "space-y-2"
      }
    >
      <p className="text-label text-text font-semibold">{label}</p>
      <Textarea name="body" rows={3} required maxLength={4000} />
      {state.status === "error" && state.message ? (
        <p role="alert" className="text-meta text-danger">
          {state.message}
        </p>
      ) : null}
      <Button
        type="submit"
        size="sm"
        variant={isInternal ? "destructive-outline" : "primary"}
        loading={pending}
        loadingLabel="Sending"
      >
        Send
      </Button>
    </form>
  );
}
