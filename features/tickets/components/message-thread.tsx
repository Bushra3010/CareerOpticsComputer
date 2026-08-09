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
            {m.attachments.length > 0 ? (
              <ul className="mt-2 flex flex-wrap gap-2">
                {m.attachments.map((a) => (
                  <li key={a.url}>
                    <a
                      href={a.url}
                      target="_blank"
                      rel="noreferrer"
                      className="border-border bg-surface-subtle text-meta text-brand-600 inline-flex min-h-[32px] items-center rounded-full border px-3 font-semibold hover:underline"
                    >
                      {a.name}
                    </a>
                  </li>
                ))}
              </ul>
            ) : null}
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
      <div>
        <label
          htmlFor={`files-${ticketId}-${isInternal ? "internal" : "public"}`}
          className="text-meta text-text-secondary block"
        >
          Attach files (up to 5 · images, PDF or text · 10 MB each)
        </label>
        <input
          id={`files-${ticketId}-${isInternal ? "internal" : "public"}`}
          type="file"
          name="files"
          multiple
          accept="image/jpeg,image/png,image/webp,application/pdf,text/plain"
          className="text-body text-text file:border-border file:bg-surface-subtle file:text-text mt-1 block file:mr-3 file:cursor-pointer file:rounded-[var(--radius-control)] file:border file:px-3 file:py-1.5"
        />
      </div>
      {state.status === "error" &&
      (state.message || state.fieldErrors?.files) ? (
        <p role="alert" className="text-meta text-danger">
          {state.fieldErrors?.files ?? state.message}
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
