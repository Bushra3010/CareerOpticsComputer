"use client";

import { useActionState } from "react";

import { Button } from "@/components/ui/button";
import { Field, RequiredLegend } from "@/components/ui/field";
import { Input, Select } from "@/components/ui/input";
import type { PublicCourse } from "@/features/academics/queries";

import { createPublication, type ResultActionState } from "../actions";

const initial: ResultActionState = { status: "idle" };

export function CreatePublicationForm({
  courses,
}: {
  courses: PublicCourse[];
}) {
  const [state, action, pending] = useActionState(createPublication, initial);

  return (
    <form action={action} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <Field id="courseId" label="Course" required>
          <Select name="courseId" defaultValue="" required>
            <option value="" disabled>
              Select a course
            </option>
            {courses.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </Select>
        </Field>
        <Field
          id="termLabel"
          label="Term"
          required
          help="For example: Aug 2026 final."
        >
          <Input name="termLabel" required />
        </Field>
      </div>
      <RequiredLegend />
      {state.status === "error" && state.message ? (
        <p role="alert" className="text-body text-danger">
          {state.message}
        </p>
      ) : null}
      {state.status === "success" && state.message ? (
        <p role="status" className="text-body text-green-700">
          {state.message}
        </p>
      ) : null}
      <Button type="submit" loading={pending} loadingLabel="Creating">
        Create result set
      </Button>
    </form>
  );
}
