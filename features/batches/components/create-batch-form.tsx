"use client";

import { useActionState, useRef } from "react";

import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { Input, Select } from "@/components/ui/input";

import { createBatch, type BatchActionState } from "../actions";

const initial: BatchActionState = { status: "idle" };

export function CreateBatchForm({
  courses,
  faculty,
  today,
}: {
  courses: { id: string; name: string }[];
  faculty: { id: string; name: string }[];
  today: string;
}) {
  const formRef = useRef<HTMLFormElement>(null);
  const [state, action, pending] = useActionState(createBatch, initial);

  return (
    <form
      ref={formRef}
      action={async (formData) => {
        await action(formData);
        formRef.current?.reset();
      }}
      className="space-y-4"
    >
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Field
          id="courseId"
          label="Course"
          required
          error={state.fieldErrors?.courseId}
        >
          <Select name="courseId" required defaultValue="">
            <option value="" disabled>
              Choose a course
            </option>
            {courses.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </Select>
        </Field>
        <Field id="code" label="Code" required error={state.fieldErrors?.code}>
          <Input name="code" required maxLength={20} placeholder="MOR-A" />
        </Field>
        <Field id="name" label="Name" required error={state.fieldErrors?.name}>
          <Input
            name="name"
            required
            maxLength={80}
            placeholder="Morning batch A"
          />
        </Field>
        <Field id="facultyId" label="Faculty">
          <Select name="facultyId" defaultValue="">
            <option value="">Not assigned yet</option>
            {faculty.map((f) => (
              <option key={f.id} value={f.id}>
                {f.name}
              </option>
            ))}
          </Select>
        </Field>
        <Field
          id="capacity"
          label="Capacity"
          help="Leave empty for no limit."
          error={state.fieldErrors?.capacity}
        >
          <Input name="capacity" inputMode="numeric" maxLength={4} />
        </Field>
        <Field id="room" label="Room">
          <Input name="room" maxLength={40} />
        </Field>
        <Field
          id="startDate"
          label="Starts"
          required
          error={state.fieldErrors?.startDate}
        >
          <Input name="startDate" type="date" defaultValue={today} required />
        </Field>
        <Field id="endDate" label="Ends" error={state.fieldErrors?.endDate}>
          <Input name="endDate" type="date" />
        </Field>
      </div>

      {state.status === "error" && state.message ? (
        <Alert tone="danger" title="Could not create the batch">
          {state.message}
        </Alert>
      ) : null}

      <Button type="submit" loading={pending} loadingLabel="Saving">
        Create batch
      </Button>
    </form>
  );
}
