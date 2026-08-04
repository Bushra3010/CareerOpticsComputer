"use client";

import { useActionState } from "react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";

import { requestPasswordReset, type AuthFormState } from "../actions";

const initialState: AuthFormState = { status: "idle" };

export function ForgotPasswordForm() {
  const [state, formAction, pending] = useActionState(
    requestPasswordReset,
    initialState,
  );

  if (state.status === "success") {
    return (
      <div className="bg-surface border-border rounded-[var(--radius-card)] border p-6">
        <p className="text-body text-text">{state.message}</p>
        <Link
          href="/sign-in/centre"
          className="text-body mt-4 inline-block font-semibold text-blue-700"
        >
          Back to sign in
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-surface border-border rounded-[var(--radius-card)] border p-6">
      <h1 className="text-page-title text-navy-900">Reset your password</h1>
      <p className="text-body text-text-secondary mt-2">
        Enter your email and we&rsquo;ll send a link to reset your password.
      </p>

      <form action={formAction} className="mt-6 space-y-4">
        <Field id="email" label="Email">
          <Input name="email" type="email" autoComplete="email" required />
        </Field>

        {state.status === "error" && state.message ? (
          <p role="alert" className="text-body text-danger">
            {state.message}
          </p>
        ) : null}

        <Button
          type="submit"
          className="w-full"
          loading={pending}
          loadingLabel="Sending"
        >
          Send reset link
        </Button>
      </form>
    </div>
  );
}
