"use client";

import { useActionState } from "react";

import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { StatusBadge } from "@/components/ui/badge";

import {
  verifyCertificate,
  verifyRegistration,
  type VerifyState,
} from "../actions";
import { VerificationResult } from "./verification-result";

const initial: VerifyState = { status: "idle" };

export function VerifyForm({ kind }: { kind: "certificate" | "registration" }) {
  const [state, action, pending] = useActionState(
    kind === "certificate" ? verifyCertificate : verifyRegistration,
    initial,
  );

  const label =
    kind === "certificate" ? "Certificate number" : "Registration number";
  const example =
    kind === "certificate" ? "CO-CERT-26-000123" : "CO-DL01-26-00042";

  return (
    <div>
      <form action={action} className="flex flex-wrap items-end gap-3">
        <Field
          id="number"
          label={label}
          required
          help={`For example ${example}.`}
          className="grow"
        >
          <Input name="number" required autoComplete="off" />
        </Field>
        <Button type="submit" loading={pending} loadingLabel="Checking">
          Verify
        </Button>
      </form>

      {/* aria-live so the outcome is announced, not just painted. */}
      <div aria-live="polite" className="mt-6">
        {state.status === "error" && state.message ? (
          <p role="alert" className="text-body text-danger">
            {state.message}
          </p>
        ) : null}

        {state.status === "not-found" ? (
          <div className="border-border bg-surface-subtle rounded-[var(--radius-card)] border p-6">
            <div className="flex items-center gap-2">
              <StatusBadge status="rejected" label="No match" />
            </div>
            <p className="text-body text-text-secondary mt-2">
              No record matches that number. Check the number and try again, or
              contact the centre that issued the document.
            </p>
          </div>
        ) : null}

        {state.status === "found" ? (
          <VerificationResult
            certificate={state.certificate}
            registration={state.registration}
          />
        ) : null}
      </div>
    </div>
  );
}
