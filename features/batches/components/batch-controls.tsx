"use client";

import { useActionState, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input, Select } from "@/components/ui/input";

import {
  addScheduleSlot,
  removeScheduleSlot,
  setBatchStatus,
  type BatchActionState,
} from "../actions";
import { WEEKDAYS } from "../schema";

const initial: BatchActionState = { status: "idle" };

export function BatchStatusButton({
  batchId,
  currentStatus,
}: {
  batchId: string;
  currentStatus: "draft" | "active" | "retired";
}) {
  const next = currentStatus === "active" ? "retired" : "active";
  const bound = setBatchStatus.bind(null, batchId, next);
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
        {next === "active" ? "Activate" : "Retire"}
      </Button>
    </form>
  );
}

export function AddSlotForm({ batchId }: { batchId: string }) {
  const [open, setOpen] = useState(false);
  const bound = addScheduleSlot.bind(null, batchId);
  const [state, action, pending] = useActionState(bound, initial);

  if (!open) {
    return (
      <Button variant="tertiary" size="sm" onClick={() => setOpen(true)}>
        Add a slot
      </Button>
    );
  }

  return (
    <form action={action} className="flex flex-wrap items-end gap-2">
      <Select name="weekday" defaultValue="1" aria-label="Day" className="w-36">
        {WEEKDAYS.map((d, i) => (
          <option key={d} value={i}>
            {d}
          </option>
        ))}
      </Select>
      <Input
        name="startTime"
        type="time"
        required
        aria-label="Start time"
        className="w-32"
      />
      <Input
        name="endTime"
        type="time"
        required
        aria-label="End time"
        className="w-32"
      />
      <Input
        name="room"
        placeholder="Room"
        maxLength={40}
        aria-label="Room"
        className="w-28"
      />
      <Button type="submit" size="sm" loading={pending} loadingLabel="Adding">
        Add
      </Button>
      {state.status === "error" ? (
        <span className="text-meta text-danger w-full">
          {state.fieldErrors?.endTime ??
            state.fieldErrors?.startTime ??
            state.message}
        </span>
      ) : null}
    </form>
  );
}

export function RemoveSlotButton({ slotId }: { slotId: string }) {
  const bound = removeScheduleSlot.bind(null, slotId);
  const [, action, pending] = useActionState(bound, initial);

  return (
    <form action={action}>
      <Button
        type="submit"
        variant="tertiary"
        size="sm"
        loading={pending}
        loadingLabel="Removing"
      >
        Remove
      </Button>
    </form>
  );
}
