"use client";

import { useActionState } from "react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";

import { signIn, type AuthFormState } from "../actions";
import type { Portal } from "../redirect";

const initialState: AuthFormState = { status: "idle" };

export function SignInForm({
  portal,
  next,
  title,
}: {
  portal: Portal;
  next?: string;
  title: string;
}) {
  const boundSignIn = signIn.bind(null, portal, next);
  const [state, formAction, pending] = useActionState(
    boundSignIn,
    initialState,
  );

  return (
    <div className="bg-surface border-border rounded-[var(--radius-card)] border p-6">
      <h1 className="text-page-title text-navy-900">{title}</h1>

      <form action={formAction} className="mt-6 space-y-4">
        <Field id="email" label="Email">
          <Input name="email" type="email" autoComplete="email" required />
        </Field>

        <Field id="password" label="Password">
          <Input
            name="password"
            type="password"
            autoComplete="current-password"
            required
          />
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
          loadingLabel="Signing in"
        >
          Sign in
        </Button>
      </form>

      <div className="mt-4 flex items-center justify-between">
        <Link
          href="/forgot-password"
          className="text-meta font-semibold text-blue-700"
        >
          Forgot password?
        </Link>
        {portal === "centre" ? (
          <Link
            href="/sign-in/student"
            className="text-meta font-semibold text-blue-700"
          >
            Student login
          </Link>
        ) : portal === "student" ? (
          <Link
            href="/sign-in/centre"
            className="text-meta font-semibold text-blue-700"
          >
            Centre login
          </Link>
        ) : null}
      </div>
    </div>
  );
}
