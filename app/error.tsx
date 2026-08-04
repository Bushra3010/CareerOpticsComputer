"use client";

import { useEffect } from "react";

import { ErrorState } from "@/components/states";

/**
 * Root error boundary.
 *
 * Before this existed, any query that threw — and several throw `new
 * Error(...)` carrying the raw Postgres message — rendered Next's default
 * error screen with that text in it. A database error message is not
 * something to show a student or a franchise owner: it names tables and
 * columns, and it is frightening rather than useful.
 *
 * `error.digest` is the correlation id Next generates for a server-side error;
 * ErrorState already takes a `requestId` for exactly this purpose (PRD §12),
 * so the user can quote something specific to support without seeing anything
 * about the database.
 */
export default function RootError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Server-side errors are already logged by Next; this catches the
    // client-side ones so they are not silently swallowed.
    console.error(error);
  }, [error]);

  return (
    <div className="container-public py-16">
      <ErrorState kind="server" requestId={error.digest} onRetry={reset} />
    </div>
  );
}
