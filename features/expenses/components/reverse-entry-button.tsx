"use client";

import { useActionState, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import { reverseExpenseEntry, type ExpenseActionState } from "../actions";

const initial: ExpenseActionState = { status: "idle" };

export function ReverseEntryButton({ entryId }: { entryId: string }) {
  const [open, setOpen] = useState(false);
  const bound = reverseExpenseEntry.bind(null, entryId);
  const [state, action, pending] = useActionState(bound, initial);

  if (!open) {
    return (
      <Button variant="tertiary" size="sm" onClick={() => setOpen(true)}>
        Reverse
      </Button>
    );
  }

  return (
    <form action={action} className="flex flex-wrap items-center gap-2">
      <Input
        name="note"
        placeholder="Reason for the reversal"
        required
        minLength={10}
        maxLength={300}
        className="w-56"
        aria-label="Reason for the reversal"
      />
      <Button
        type="submit"
        variant="destructive-outline"
        size="sm"
        loading={pending}
        loadingLabel="Reversing"
      >
        Confirm
      </Button>
      {state.status === "error" ? (
        <span className="text-meta text-danger w-full">
          {state.fieldErrors?.note ?? state.message}
        </span>
      ) : null}
    </form>
  );
}
