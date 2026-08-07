"use client";

import { useActionState, useRef } from "react";

import { Button } from "@/components/ui/button";
import { Field, RequiredLegend } from "@/components/ui/field";
import { Input, Select, Textarea } from "@/components/ui/input";

import { createCourse, type AcademicsActionState } from "../actions";

const initial: AcademicsActionState = { status: "idle" };

export function CourseForm({
  categories,
}: {
  categories: { id: string; name: string }[];
}) {
  const formRef = useRef<HTMLFormElement>(null);
  const [state, action, pending] = useActionState(createCourse, initial);

  if (categories.length === 0) {
    return (
      <p className="text-body text-text-secondary">
        Create a category first — a course belongs to one.
      </p>
    );
  }

  return (
    <form
      ref={formRef}
      action={async (formData) => {
        await action(formData);
        formRef.current?.reset();
      }}
      className="space-y-4"
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <Field
          id="name"
          label="Course name"
          required
          error={state.fieldErrors?.name}
        >
          <Input name="name" required maxLength={160} />
        </Field>
        <Field
          id="slug"
          label="Slug"
          required
          help="Used in the public URL — lowercase, hyphens."
          error={state.fieldErrors?.slug}
        >
          <Input
            name="slug"
            required
            maxLength={160}
            placeholder="tally-with-gst"
          />
        </Field>
      </div>

      <Field id="categoryId" label="Category" required>
        <Select name="categoryId" required defaultValue={categories[0].id}>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </Select>
      </Field>

      <Field
        id="shortDescription"
        label="Short description"
        required
        help="Shown on the catalogue card."
        error={state.fieldErrors?.shortDescription}
      >
        <Input name="shortDescription" required maxLength={200} />
      </Field>

      <Field id="description" label="Full description">
        <Textarea name="description" rows={3} maxLength={4000} />
      </Field>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field
          id="durationLabel"
          label="Duration"
          required
          help='e.g. "3 months"'
          error={state.fieldErrors?.durationLabel}
        >
          <Input name="durationLabel" required maxLength={60} />
        </Field>
        <Field
          id="feeRupees"
          label="Fee (₹)"
          required
          error={state.fieldErrors?.feeRupees}
        >
          <Input name="feeRupees" type="number" min="0" step="0.01" required />
        </Field>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field id="passPercent" label="Pass mark (%)">
          <Input
            name="passPercent"
            type="number"
            min={0}
            max={100}
            defaultValue={40}
          />
        </Field>
        <Field
          id="distinctionPercent"
          label="Distinction mark (%)"
          error={state.fieldErrors?.distinctionPercent}
        >
          <Input
            name="distinctionPercent"
            type="number"
            min={0}
            max={100}
            defaultValue={75}
          />
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
        Create course
      </Button>
    </form>
  );
}
