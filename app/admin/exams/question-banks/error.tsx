"use client";

import { ErrorState } from "@/components/states";

/**
 * `kind="server"` rather than a guess: by the time this boundary catches, the
 * request already reached the server and a query threw. Offline and timeout
 * fail earlier and differently.
 */
export default function QuestionBanksError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return <ErrorState kind="server" onRetry={reset} requestId={error.digest} />;
}
