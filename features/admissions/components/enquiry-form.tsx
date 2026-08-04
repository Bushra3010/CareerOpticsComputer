"use client";

import { useActionState } from "react";

import { Button } from "@/components/ui/button";
import { Field, RequiredLegend } from "@/components/ui/field";
import { Input, Select, Textarea } from "@/components/ui/input";
import type { PublicCourse } from "@/features/academics/queries";

import { submitEnquiry, type EnquiryFormState } from "../actions";

const initialState: EnquiryFormState = { status: "idle" };

export function EnquiryForm({ courses }: { courses: PublicCourse[] }) {
  const [state, formAction, pending] = useActionState(
    submitEnquiry,
    initialState,
  );

  if (state.status === "success") {
    return (
      <div className="rounded-[var(--radius-card)] border border-green-600 bg-green-50 p-6">
        <p className="text-card-title text-green-700">
          Thank you for your enquiry
        </p>
        <p className="text-body text-text-secondary mt-1">
          A counsellor from your nearest centre will get in touch shortly.
        </p>
      </div>
    );
  }

  return (
    <form action={formAction} className="space-y-4">
      {/* Honeypot — hidden from sighted and screen-reader users, real users never fill it. */}
      <div aria-hidden="true" className="hidden">
        <label htmlFor="website">Website</label>
        <input
          id="website"
          name="website"
          type="text"
          tabIndex={-1}
          autoComplete="off"
        />
      </div>

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
          help="We'll call or WhatsApp you on this number."
        >
          <Input
            name="phone"
            type="tel"
            inputMode="numeric"
            autoComplete="tel"
            required
          />
        </Field>

        <Field id="email" label="Email" error={state.fieldErrors?.email}>
          <Input name="email" type="email" autoComplete="email" />
        </Field>

        <Field id="city" label="City" error={state.fieldErrors?.city}>
          <Input name="city" autoComplete="address-level2" />
        </Field>

        <Field
          id="courseInterestId"
          label="Course of interest"
          className="sm:col-span-2"
          error={state.fieldErrors?.courseInterestId}
        >
          <Select name="courseInterestId" defaultValue="">
            <option value="">Not sure yet</option>
            {courses.map((course) => (
              <option key={course.id} value={course.id}>
                {course.name}
              </option>
            ))}
          </Select>
        </Field>

        <Field
          id="message"
          label="Message"
          className="sm:col-span-2"
          error={state.fieldErrors?.message}
          help="Anything else we should know — preferred batch timing, for example."
        >
          <Textarea name="message" />
        </Field>
      </div>

      <RequiredLegend />

      {state.status === "error" && state.message ? (
        <p role="alert" className="text-body text-danger">
          {state.message}
        </p>
      ) : null}

      <Button type="submit" loading={pending} loadingLabel="Submitting">
        Submit enquiry
      </Button>
    </form>
  );
}
