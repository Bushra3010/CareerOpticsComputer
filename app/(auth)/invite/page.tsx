import { Suspense } from "react";
import type { Metadata } from "next";

import { AcceptInvitationForm } from "@/features/auth/components/accept-invitation-form";

export const metadata: Metadata = {
  title: "Accept your invitation",
  robots: { index: false },
};

export default function InvitePage() {
  return (
    // useSearchParams needs a Suspense boundary, or the whole route opts out
    // of static rendering and the build warns.
    <Suspense
      fallback={
        <div className="bg-surface border-border rounded-[var(--radius-card)] border p-6">
          <p className="text-body text-text-secondary">
            Checking your invitation…
          </p>
        </div>
      }
    >
      <AcceptInvitationForm />
    </Suspense>
  );
}
