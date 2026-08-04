"use client";

import { useActionState } from "react";

import { Button } from "@/components/ui/button";
import { Field, RequiredLegend } from "@/components/ui/field";
import { Input, Select, Textarea } from "@/components/ui/input";
import type { PublicCourse } from "@/features/academics/queries";

import { admitStudent, type AdmitStudentFormState } from "../actions";

const initialState: AdmitStudentFormState = { status: "idle" };

export function AdmitStudentForm({ courses }: { courses: PublicCourse[] }) {
  const [state, formAction, pending] = useActionState(
    admitStudent,
    initialState,
  );

  if (state.status === "success") {
    return (
      <div className="rounded-[var(--radius-card)] border border-green-600 bg-green-50 p-6">
        <p className="text-card-title text-green-700">Student admitted</p>
        <p className="text-body text-text-secondary mt-1">
          Registration number:{" "}
          <span className="text-text font-semibold">
            {state.registrationNumber}
          </span>
        </p>
      </div>
    );
  }

  return (
    <form action={formAction} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <Field
          id="fullName"
          label="Full name"
          required
          error={state.fieldErrors?.fullName}
        >
          <Input name="fullName" autoComplete="name" required />
        </Field>

        <Field
          id="phone"
          label="Mobile number"
          required
          error={state.fieldErrors?.phone}
        >
          <Input name="phone" type="tel" inputMode="numeric" required />
        </Field>

        <Field id="email" label="Email" error={state.fieldErrors?.email}>
          <Input name="email" type="email" autoComplete="email" />
        </Field>

        <Field
          id="dateOfBirth"
          label="Date of birth"
          error={state.fieldErrors?.dateOfBirth}
        >
          <Input name="dateOfBirth" type="date" />
        </Field>

        <Field id="gender" label="Gender" error={state.fieldErrors?.gender}>
          <Select name="gender" defaultValue="">
            <option value="">Prefer not to say</option>
            <option value="female">Female</option>
            <option value="male">Male</option>
            <option value="other">Other</option>
          </Select>
        </Field>

        <Field
          id="guardianName"
          label="Guardian name"
          error={state.fieldErrors?.guardianName}
          help="Required for minors."
        >
          <Input name="guardianName" />
        </Field>

        <Field
          id="courseId"
          label="Course"
          required
          className="sm:col-span-2"
          error={state.fieldErrors?.courseId}
        >
          <Select name="courseId" defaultValue="" required>
            <option value="" disabled>
              Select a course
            </option>
            {courses.map((course) => (
              <option key={course.id} value={course.id}>
                {course.name}
              </option>
            ))}
          </Select>
        </Field>

        <Field
          id="address"
          label="Address"
          className="sm:col-span-2"
          error={state.fieldErrors?.address}
        >
          <Textarea name="address" />
        </Field>
      </div>

      <RequiredLegend />

      {state.status === "error" && state.message ? (
        <p role="alert" className="text-body text-danger">
          {state.message}
        </p>
      ) : null}

      <Button type="submit" loading={pending} loadingLabel="Admitting">
        Admit student
      </Button>
    </form>
  );
}
