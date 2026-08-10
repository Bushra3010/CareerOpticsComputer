"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { createClient } from "@/lib/db/browser";

import { resetPasswordSchema } from "../schema";

type Stage = "checking" | "ready" | "invalid";

/**
 * Invitation acceptance. `inviteUserByEmail` (features/staff/actions.ts)
 * creates the account and sends a link; until this page existed the link
 * had nowhere to land, so an invited staff member could never set a
 * password and the whole invite flow stopped at the email.
 *
 * Three link shapes have to work, because which one arrives depends on the
 * project's auth settings rather than on anything this code controls:
 *   - a fragment carrying the tokens, which the browser client consumes by
 *     itself (`detectSessionInUrl`);
 *   - `?code=` for the PKCE flow, exchanged here;
 *   - `?token_hash=&type=invite`, verified here.
 * All three end in the same place: a session, then a password.
 */
export function AcceptInvitationForm() {
  const router = useRouter();
  const params = useSearchParams();
  const [stage, setStage] = React.useState<Stage>("checking");
  const [password, setPassword] = React.useState("");
  const [confirmPassword, setConfirmPassword] = React.useState("");
  const [error, setError] = React.useState<string>();
  const [submitting, setSubmitting] = React.useState(false);

  React.useEffect(() => {
    const supabase = createClient();
    let cancelled = false;

    const settle = (ok: boolean) => {
      if (!cancelled) setStage(ok ? "ready" : "invalid");
    };

    // A fragment link signs the user in as the client boots, which fires
    // this before any of the checks below finish.
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) settle(true);
    });

    (async () => {
      const { data: existing } = await supabase.auth.getSession();
      if (existing.session) return settle(true);

      // The implicit fragment (#access_token=…) a /auth/v1/verify redirect
      // carries. The comment above used to say the browser client consumes
      // this itself — it does not: createBrowserClient defaults to PKCE,
      // which ignores implicit fragments entirely, so every invite email
      // using the default {{ .ConfirmationURL }} template dead-ended at
      // "Invitation not valid". Found by the onboarding journey E2E, which
      // follows the same verify redirect a real email does.
      const hash = window.location.hash.slice(1);
      if (hash.includes("access_token=")) {
        const fragment = new URLSearchParams(hash);
        const accessToken = fragment.get("access_token");
        const refreshToken = fragment.get("refresh_token");
        if (accessToken && refreshToken) {
          const { error: setError } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          });
          if (!setError) {
            // The tokens do not belong in the address bar, the history, or
            // anything that copies the URL.
            window.history.replaceState(
              null,
              "",
              window.location.pathname + window.location.search,
            );
            return settle(true);
          }
        }
      }

      const code = params.get("code");
      if (code) {
        const { error: exchangeError } =
          await supabase.auth.exchangeCodeForSession(code);
        return settle(!exchangeError);
      }

      const tokenHash = params.get("token_hash");
      if (tokenHash) {
        // `invite` and `signup` both arrive here; recovery has its own page.
        const type = params.get("type") === "signup" ? "signup" : "invite";
        const { error: verifyError } = await supabase.auth.verifyOtp({
          type,
          token_hash: tokenHash,
        });
        return settle(!verifyError);
      }

      settle(false);
    })();

    return () => {
      cancelled = true;
      subscription.unsubscribe();
    };
  }, [params]);

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

    if (updateError) {
      setSubmitting(false);
      setError(
        "Could not set your password. Ask for a fresh invitation and try again.",
      );
      return;
    }

    // Where they belong is a question about memberships, and the server
    // already answers it for sign-in — so hand off rather than guess here.
    router.push("/after-sign-in");
    router.refresh();
  }

  if (stage === "checking") {
    return (
      <div className="bg-surface border-border rounded-[var(--radius-card)] border p-6">
        <p className="text-body text-text-secondary">
          Checking your invitation…
        </p>
      </div>
    );
  }

  if (stage === "invalid") {
    return (
      <div className="bg-surface border-border rounded-[var(--radius-card)] border p-6">
        <h1 className="text-page-title text-navy-900">Invitation not valid</h1>
        <p className="text-body text-text-secondary mt-2">
          This invitation link has expired or has already been used. Ask your
          centre owner or head office to send a new one.
        </p>
        <p className="text-body text-text-secondary mt-4">
          Already set a password?{" "}
          <a href="/sign-in/centre" className="font-semibold text-blue-700">
            Sign in
          </a>
        </p>
      </div>
    );
  }

  return (
    <div className="bg-surface border-border rounded-[var(--radius-card)] border p-6">
      <h1 className="text-page-title text-navy-900">Choose a password</h1>
      <p className="text-body text-text-secondary mt-2">
        Your account has been created. Set a password to finish joining.
      </p>

      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <Field id="password" label="Password" required>
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
          loadingLabel="Saving"
        >
          Set password and continue
        </Button>
      </form>
    </div>
  );
}
