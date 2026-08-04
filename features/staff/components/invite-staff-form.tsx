"use client";

import { useActionState } from "react";

import { Button } from "@/components/ui/button";
import { Field, RequiredLegend } from "@/components/ui/field";
import { Input, Select } from "@/components/ui/input";

import { inviteStaff, type StaffActionState } from "../actions";
import { INVITABLE_ROLES } from "../roles";

const initial: StaffActionState = { status: "idle" };

export function InviteStaffForm() {
  const [state, action, pending] = useActionState(inviteStaff, initial);

  return (
    <form action={action} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-3">
        <Field id="fullName" label="Full name" required>
          <Input name="fullName" autoComplete="name" required />
        </Field>
        <Field
          id="email"
          label="Email"
          required
          help="They receive a sign-in invitation."
        >
          <Input name="email" type="email" autoComplete="email" required />
        </Field>
        <Field id="roleCode" label="Role" required>
          <Select name="roleCode" defaultValue="counsellor" required>
            {INVITABLE_ROLES.map((r) => (
              <option key={r.code} value={r.code}>
                {r.name}
              </option>
            ))}
          </Select>
        </Field>
      </div>

      <ul className="text-meta text-text-secondary space-y-1">
        {INVITABLE_ROLES.map((r) => (
          <li key={r.code}>
            <span className="text-text font-semibold">{r.name}</span> — {r.note}
          </li>
        ))}
      </ul>

      <RequiredLegend />
      {state.status === "error" && state.message ? (
        <p role="alert" className="text-body text-danger">
          {state.message}
        </p>
      ) : null}
      {state.status === "success" && state.message ? (
        <p role="status" className="text-body text-green-700">
          {state.message}
        </p>
      ) : null}
      <Button type="submit" loading={pending} loadingLabel="Inviting">
        Invite
      </Button>
    </form>
  );
}
