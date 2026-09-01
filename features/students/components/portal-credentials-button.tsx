"use client";

import * as React from "react";
import { Check, Copy, KeyRound } from "lucide-react";

import { Button } from "@/components/ui/button";

import {
  setStudentPortalLogin,
  type StudentLoginState,
} from "../portal-login-actions";

const initial: StudentLoginState = { status: "idle" };

/**
 * Creates a student's portal login — or issues a new password for one that
 * already exists — and shows the credentials in place.
 *
 * This replaces the emailed invitation on the centre's own screens. A centre
 * hands these over the counter, so the credentials have to be on screen at the
 * moment of clicking: an invitation depends on a mail provider being
 * configured and on the student reaching their inbox, and neither is true of
 * someone standing at the desk.
 *
 * The password is shown exactly once. Supabase stores only a bcrypt hash, so
 * navigating away genuinely loses it and the only way back is issuing another
 * — which is why the copy control is here rather than left to selection.
 */
export function PortalCredentialsButton({
  studentId,
  hasLogin = false,
}: {
  studentId: string;
  /** Drives the reissue path, which needs confirming; creating does not. */
  hasLogin?: boolean;
}) {
  const bound = setStudentPortalLogin.bind(null, studentId);
  const [state, action, pending] = React.useActionState(bound, initial);

  // Reissuing invalidates a password the student may be relying on right now,
  // and this button sits in a dense table where the row above is a different
  // student. One stray click should not silently lock someone out, so the
  // destructive path is armed first. Creating a login destroys nothing and
  // stays a single click.
  const [confirming, setConfirming] = React.useState(false);

  if (state.credentials) {
    return (
      <CredentialsPanel
        email={state.credentials.email}
        password={state.credentials.password}
        reissued={hasLogin}
      />
    );
  }

  if (hasLogin && !confirming) {
    return (
      <div>
        <p className="text-meta text-text-secondary">Has login</p>
        <Button
          type="button"
          variant="tertiary"
          size="sm"
          className="mt-1"
          onClick={() => setConfirming(true)}
        >
          <KeyRound />
          New password
        </Button>
      </div>
    );
  }

  return (
    <form action={action}>
      <div className="flex flex-wrap items-center gap-2">
        <Button
          type="submit"
          variant={hasLogin ? "destructive-outline" : "tertiary"}
          size="sm"
          loading={pending}
          loadingLabel={hasLogin ? "Issuing password" : "Creating login"}
        >
          <KeyRound />
          {hasLogin ? "Confirm new password" : "Create portal login"}
        </Button>

        {hasLogin ? (
          <Button
            type="button"
            variant="tertiary"
            size="sm"
            onClick={() => setConfirming(false)}
          >
            Cancel
          </Button>
        ) : null}
      </div>

      {hasLogin ? (
        <p className="text-meta text-text-secondary mt-1 max-w-64">
          The student&rsquo;s current password stops working immediately.
        </p>
      ) : null}

      {state.status === "error" && state.message ? (
        <p role="alert" className="text-meta text-danger mt-1 max-w-64">
          {state.message}
        </p>
      ) : null}
    </form>
  );
}

/**
 * Warning gold rather than success green on purpose: this is not "done", it is
 * "act now" — the one moment these details are readable. Green would invite
 * the reader to move on.
 */
function CredentialsPanel({
  email,
  password,
  reissued,
}: {
  email: string;
  password: string;
  reissued: boolean;
}) {
  const [copied, setCopied] = React.useState(false);

  React.useEffect(() => {
    if (!copied) return;
    const timer = setTimeout(() => setCopied(false), 2000);
    return () => clearTimeout(timer);
  }, [copied]);

  async function copy() {
    try {
      await navigator.clipboard.writeText(
        `Login ID: ${email}\nPassword: ${password}`,
      );
      setCopied(true);
    } catch {
      // Needs a secure context and a permission the browser can refuse. Both
      // values stay on screen and selectable, so a failed copy costs nothing
      // and an error message here would be noise.
    }
  }

  return (
    <div
      role="status"
      className="border-warning-border bg-warning-bg max-w-72 rounded-[var(--radius-card)] border p-3"
    >
      <p className="text-meta text-text font-semibold">
        Sign-in details — shown once
      </p>

      <dl className="mt-2 space-y-1">
        <div className="flex flex-wrap items-baseline gap-x-2">
          <dt className="text-meta text-text-secondary">Login ID</dt>
          <dd className="text-meta text-text font-semibold break-all">
            {email}
          </dd>
        </div>
        <div className="flex flex-wrap items-baseline gap-x-2">
          <dt className="text-meta text-text-secondary">Password</dt>
          <dd className="text-meta tabular text-text font-semibold">
            {password}
          </dd>
        </div>
      </dl>

      <Button
        type="button"
        variant="secondary"
        size="sm"
        className="mt-3"
        onClick={copy}
      >
        {copied ? <Check /> : <Copy />}
        {copied ? "Copied" : "Copy both"}
      </Button>

      <p className="text-meta text-text-secondary mt-2">
        {reissued
          ? "The previous password no longer works. Give these to the student before leaving this page."
          : "Not stored anywhere. Give them to the student before leaving this page."}
      </p>
    </div>
  );
}
