"use client";

import { useActionState, useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import { Field, RequiredLegend } from "@/components/ui/field";
import { Input, Select, Textarea } from "@/components/ui/input";

import { createAnnouncement, type AnnouncementActionState } from "../actions";

const initial: AnnouncementActionState = { status: "idle" };

/**
 * Two shapes in one component: head office picks organisation-wide or a
 * specific centre; a centre owner has no picker at all — `fixedCentreId`
 * fixes the scope to their own centre, matching the matrix's "all (own
 * centre)" rather than letting them address the whole organisation.
 */
export function CreateAnnouncementForm({
  centres,
  fixedCentreId,
}: {
  centres?: { id: string; name: string; code: string }[];
  fixedCentreId?: string;
}) {
  const formRef = useRef<HTMLFormElement>(null);
  const [state, action, pending] = useActionState(createAnnouncement, initial);
  const [scopeType, setScopeType] = useState<"organization" | "centre">(
    fixedCentreId ? "centre" : "organization",
  );

  return (
    <form
      ref={formRef}
      action={async (formData) => {
        await action(formData);
        formRef.current?.reset();
      }}
      className="space-y-4"
    >
      {fixedCentreId ? (
        <input type="hidden" name="scopeType" value="centre" />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          <Field id="scopeType" label="Audience" required>
            <Select
              name="scopeType"
              required
              value={scopeType}
              onChange={(e) =>
                setScopeType(e.target.value as "organization" | "centre")
              }
            >
              <option value="organization">Everyone (organisation-wide)</option>
              <option value="centre">One centre</option>
            </Select>
          </Field>
          {scopeType === "centre" ? (
            <Field
              id="scopeCentreId"
              label="Centre"
              required
              error={state.fieldErrors?.scopeCentreId}
            >
              <Select
                name="scopeCentreId"
                required
                defaultValue={centres?.[0]?.id ?? ""}
              >
                {(centres ?? []).map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.code})
                  </option>
                ))}
              </Select>
            </Field>
          ) : null}
        </div>
      )}
      {fixedCentreId ? (
        <input type="hidden" name="scopeCentreId" value={fixedCentreId} />
      ) : null}

      <Field id="title" label="Title" required error={state.fieldErrors?.title}>
        <Input name="title" required maxLength={200} />
      </Field>

      <Field id="body" label="Message" required error={state.fieldErrors?.body}>
        <Textarea name="body" rows={4} required maxLength={4000} />
      </Field>

      <Field id="expiresAt" label="Expires" help="Leave blank for no expiry.">
        <Input name="expiresAt" type="date" />
      </Field>

      <label className="text-body text-text flex items-center gap-2">
        <input
          type="checkbox"
          name="publishNow"
          defaultChecked
          className="size-4"
        />
        Publish now (uncheck to save as a draft)
      </label>

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

      <Button type="submit" loading={pending} loadingLabel="Saving">
        Save announcement
      </Button>
    </form>
  );
}
