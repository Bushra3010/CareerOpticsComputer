"use client";

import * as React from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { createClient } from "@/lib/db/browser";

import { resetPasswordSchema } from "../schema";

/**
 * Token-consuming: Supabase's password-recovery link redirects here with the
 * session established client-side from the URL fragment. There is no
 * server-side hook for that, so this has to be a Client Component that talks
 * to auth directly rather than a server action.
 */
export function ResetPasswordForm() {
  const router = useRouter();
  const [ready, setReady] = React.useState(false);
  const [password, setPassword] = React.useState("");
  const [confirmPassword, setConfirmPassword] = React.useState("");
  const [error, setError] = React.useState<string>();
  const [submitting, setSubmitting] = React.useState(false);

  React.useEffect(() => {
    const supabase = createClient();
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") {
        setReady(true);
      }
    });
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) setReady(true);
    });
    return () => subscription.unsubscribe();
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const parsed = resetPasswordSchema.safeParse({ password, confirmPassword });
    if (!parsed.success) {
      setError(
        parsed.error.issues[0]?.message ?? "Check the form and try again.",
      );
      return;
    }

    setSubmitting(true);
    setError(undefined);
    const supabase = createClient();
    const { error: updateError } = await supabase.auth.updateUser({ password });
    setSubmitting(false);

    if (updateError) {
      setError(
        "Could not update your password. Request a new reset link and try again.",
      );
      return;
    }

    router.push("/sign-in/centre");
  }

  if (!ready) {
    return (
      <div className="bg-surface border-border rounded-[var(--radius-card)] border p-6">
        <p className="text-body text-text-secondary">
          This link is invalid or has expired. Request a new one from the{" "}
          <a href="/forgot-password" className="font-semibold text-blue-700">
            forgot password
          </a>{" "}
          page.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-surface border-border rounded-[var(--radius-card)] border p-6">
      <h1 className="text-page-title text-navy-900">Set a new password</h1>

      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <Field id="password" label="New password" required>
          <Input
            type="password"
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </Field>

        <Field id="confirmPassword" label="Confirm password" required>
          <Input
            type="password"
            autoComplete="new-password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />
        </Field>

        {error ? (
          <p role="alert" className="text-body text-danger">
            {error}
          </p>
        ) : null}

        <Button
          type="submit"
          className="w-full"
          loading={submitting}
          loadingLabel="Updating"
        >
          Update password
        </Button>
      </form>
    </div>
  );
}
