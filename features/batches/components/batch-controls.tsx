"use client";

import { useActionState, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input, Select } from "@/components/ui/input";

import {
  addScheduleSlot,
  deleteBatch,
  removeScheduleSlot,
  setBatchStatus,
  updateBatch,
  updateScheduleSlot,
  type BatchActionState,
} from "../actions";
import { WEEKDAYS } from "../schema";

const initial: BatchActionState = { status: "idle" };

export interface EditableSlot {
  id: string;
  weekday: number;
  startTime: string;
  endTime: string;
  room: string | null;
}

export interface EditableBatch {
  id: string;
  code: string;
  name: string;
  facultyId: string | null;
  capacity: number | null;
  room: string | null;
  startDate: string;
  endDate: string | null;
}

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

/**
 * One timetable slot: reads as text until asked to edit, because a card
 * showing four inputs per slot is unreadable at a glance and the common case
 * is reading the timetable, not changing it.
 */
export function SlotRow({
  slot,
  batchId,
}: {
  slot: EditableSlot;
  batchId: string;
}) {
  const [editing, setEditing] = useState(false);
  const bound = updateScheduleSlot.bind(null, slot.id, batchId);
  const [state, action, pending] = useActionState(bound, initial);

  if (!editing) {
    return (
      <li className="flex flex-wrap items-center justify-between gap-2 py-2">
        <span className="text-body text-text">
          {WEEKDAYS[slot.weekday]} · {slot.startTime}–{slot.endTime}
          {slot.room ? ` · ${slot.room}` : ""}
        </span>
        <span className="flex items-center gap-1">
          <Button
            variant="tertiary"
            size="sm"
            onClick={() => setEditing(true)}
            aria-label={`Edit ${WEEKDAYS[slot.weekday]} slot`}
          >
            Edit
          </Button>
          <RemoveSlotButton slotId={slot.id} />
        </span>
      </li>
    );
  }

  return (
    <li className="py-2">
      <form action={action} className="flex flex-wrap items-end gap-2">
        <Select
          name="weekday"
          defaultValue={String(slot.weekday)}
          aria-label="Day"
          className="w-36"
        >
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
          defaultValue={slot.startTime}
          aria-label="Start time"
          className="w-32"
        />
        <Input
          name="endTime"
          type="time"
          required
          defaultValue={slot.endTime}
          aria-label="End time"
          className="w-32"
        />
        <Input
          name="room"
          placeholder="Room"
          maxLength={40}
          defaultValue={slot.room ?? ""}
          aria-label="Room"
          className="w-28"
        />
        <Button type="submit" size="sm" loading={pending} loadingLabel="Saving">
          Save
        </Button>
        <Button
          type="button"
          variant="tertiary"
          size="sm"
          onClick={() => setEditing(false)}
        >
          Cancel
        </Button>
        {state.status === "error" ? (
          <span role="alert" className="text-meta text-danger w-full">
            {state.fieldErrors?.endTime ??
              state.fieldErrors?.startTime ??
              state.message}
          </span>
        ) : null}
      </form>
    </li>
  );
}

/** Edits everything about a batch except its course — see `batchEditSchema`. */
export function EditBatchForm({
  batch,
  faculty,
}: {
  batch: EditableBatch;
  faculty: { id: string; name: string }[];
}) {
  const [open, setOpen] = useState(false);
  const bound = updateBatch.bind(null, batch.id);
  const [state, action, pending] = useActionState(bound, initial);

  if (!open) {
    return (
      <Button variant="tertiary" size="sm" onClick={() => setOpen(true)}>
        Edit
      </Button>
    );
  }

  return (
    <form action={action} className="w-full space-y-2">
      <div className="flex flex-wrap items-end gap-2">
        <Input
          name="code"
          defaultValue={batch.code}
          required
          maxLength={20}
          aria-label="Code"
          className="w-28"
        />
        <Input
          name="name"
          defaultValue={batch.name}
          required
          maxLength={80}
          aria-label="Name"
          className="w-48"
        />
        <Select
          name="facultyId"
          defaultValue={batch.facultyId ?? ""}
          aria-label="Faculty"
          className="w-44"
        >
          <option value="">Not assigned yet</option>
          {faculty.map((f) => (
            <option key={f.id} value={f.id}>
              {f.name}
            </option>
          ))}
        </Select>
        <Input
          name="capacity"
          inputMode="numeric"
          maxLength={4}
          defaultValue={batch.capacity ?? ""}
          placeholder="Capacity"
          aria-label="Capacity"
          className="w-28"
        />
        <Input
          name="room"
          maxLength={40}
          defaultValue={batch.room ?? ""}
          placeholder="Room"
          aria-label="Room"
          className="w-28"
        />
        <Input
          name="startDate"
          type="date"
          required
          defaultValue={batch.startDate}
          aria-label="Starts"
          className="w-40"
        />
        <Input
          name="endDate"
          type="date"
          defaultValue={batch.endDate ?? ""}
          aria-label="Ends"
          className="w-40"
        />
        <Button type="submit" size="sm" loading={pending} loadingLabel="Saving">
          Save
        </Button>
        <Button
          type="button"
          variant="tertiary"
          size="sm"
          onClick={() => setOpen(false)}
        >
          Cancel
        </Button>
      </div>

      {state.status === "error" ? (
        <p role="alert" className="text-meta text-danger">
          {state.fieldErrors?.code ??
            state.fieldErrors?.name ??
            state.fieldErrors?.capacity ??
            state.fieldErrors?.startDate ??
            state.message}
        </p>
      ) : null}
      <p className="text-meta text-text-secondary">
        The course cannot be changed — students are already placed against it.
      </p>
    </form>
  );
}

/**
 * Deleting releases every student in the batch, and the batch is gone with no
 * record of what its timetable was. That is worth a second click, and worth
 * saying how many people it affects before it happens rather than after.
 */
export function DeleteBatchButton({
  batchId,
  enrolledCount,
}: {
  batchId: string;
  enrolledCount: number;
}) {
  const [confirming, setConfirming] = useState(false);
  const bound = deleteBatch.bind(null, batchId);
  const [state, action, pending] = useActionState(bound, initial);

  if (!confirming) {
    return (
      <Button
        variant="tertiary"
        size="sm"
        onClick={() => setConfirming(true)}
        className="text-danger"
      >
        Delete
      </Button>
    );
  }

  return (
    <form action={action} className="flex flex-wrap items-center gap-2">
      <Button
        type="submit"
        variant="destructive-outline"
        size="sm"
        loading={pending}
        loadingLabel="Deleting"
      >
        {enrolledCount === 0
          ? "Confirm delete"
          : `Delete and release ${enrolledCount} ${
              enrolledCount === 1 ? "student" : "students"
            }`}
      </Button>
      <Button
        type="button"
        variant="tertiary"
        size="sm"
        onClick={() => setConfirming(false)}
      >
        Cancel
      </Button>
      {state.status === "error" && state.message ? (
        <span role="alert" className="text-meta text-danger w-full">
          {state.message}
        </span>
      ) : null}
    </form>
  );
}
