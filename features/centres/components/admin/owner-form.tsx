"use client";

import { useActionState } from "react";
import { KeyRound } from "lucide-react";

import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";

import { setCentreOwner, type CentreActionState } from "../../actions";

const initial: CentreActionState = { status: "idle" };

/**
 * Centre sign-in details.
 *
 * The email is shown because it is stored and readable. The password is not,
 * and cannot be: Supabase keeps a bcrypt hash, so the original is gone the
 * moment it is set. The only way to produce a usable credential for an
 * existing owner is to issue a new one, which is what this form does.
 */
export function CentreOwnerForm({
  centreId,
  owner,
}: {
  centreId: string;
  owner: { fullName: string | null; email: string | null } | null;
}) {
  const bound = setCentreOwner.bind(null, centreId);
  const [state, action, pending] = useActionState(bound, initial);

  return (
    <div className="space-y-4">
      {owner ? (
        <dl className="space-y-2">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <dt className="text-meta text-text-secondary">Sign-in email</dt>
            <dd className="text-body text-navy-900 font-semibold">
              {owner.email ?? "—"}
            </dd>
          </div>
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <dt className="text-meta text-text-secondary">Owner</dt>
            <dd className="text-body text-text">{owner.fullName ?? "—"}</dd>
          </div>
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <dt className="text-meta text-text-secondary">Password</dt>
            <dd className="text-meta text-text-muted">
              Stored as a hash — cannot be displayed
            </dd>
          </div>
        </dl>
      ) : (
        <Alert
          tone="warning"
          title="This centre has no owner"
          recovery="Nobody can sign in to it until one is set. Add an email below."
        />
      )}

      {state.status === "error" && state.message ? (
        <Alert
          tone="danger"
          title="That did not work"
          recovery={state.message}
        />
      ) : null}

      {state.ownerCredentials ? (
        <Alert
          tone="success"
          title="Copy these now — the password is not shown again"
        >
          <dl className="mt-2 space-y-1">
            <div className="flex gap-2">
              <dt className="text-text-secondary shrink-0">Email</dt>
              <dd className="text-text font-semibold">
                {state.ownerCredentials.email}
              </dd>
            </div>
            <div className="flex gap-2">
              <dt className="text-text-secondary shrink-0">Password</dt>
              <dd className="text-text tabular font-semibold">
                {state.ownerCredentials.password}
              </dd>
            </div>
          </dl>
        </Alert>
      ) : null}

      <form action={action} className="space-y-3">
        <div className="tablet:grid-cols-2 grid gap-3">
          <Field id="ownerName" label="Owner name">
            <Input
              name="ownerName"
              defaultValue={owner?.fullName ?? ""}
              maxLength={160}
              autoComplete="off"
            />
          </Field>
          <Field
            id="ownerEmail"
            label="Sign-in email"
            required
            error={state.fieldErrors?.ownerEmail}
          >
            <Input
              name="ownerEmail"
              type="email"
              defaultValue={owner?.email ?? ""}
              required
              autoComplete="off"
            />
          </Field>
        </div>

        <Button type="submit" variant="secondary" loading={pending}>
          <KeyRound />
          {owner ? "Issue a new password" : "Create owner and password"}
        </Button>
        <p className="text-meta text-text-secondary">
          {owner
            ? "Issuing a new password replaces the old one immediately. The owner will have to use the new one."
            : "Creates the sign-in account and shows the password once."}
        </p>
      </form>
    </div>
  );
}
