"use client";

import { useActionState } from "react";

import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { Input, Textarea } from "@/components/ui/input";

import { createNotice, type NoticeActionState } from "../actions";

const initial: NoticeActionState = { status: "idle" };

export function CreateNoticeForm() {
  const [state, action, pending] = useActionState(createNotice, initial);

  return (
    <form action={action} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <Field
          id="title"
          label="Title"
          required
          error={state.fieldErrors?.title}
        >
          <Input name="title" required maxLength={160} />
        </Field>
        <Field
          id="slug"
          label="Slug"
          required
          help="Lowercase, hyphenated — becomes /notices/your-slug"
          error={state.fieldErrors?.slug}
        >
          <Input
            name="slug"
            required
            maxLength={80}
            placeholder="admissions-open-2026"
          />
        </Field>
      </div>
      <Field id="body" label="Body" required error={state.fieldErrors?.body}>
        <Textarea name="body" rows={6} required maxLength={20000} />
      </Field>
      <Field
        id="publishedAt"
        label="Publish from"
        help="Optional — leave empty to publish the moment it is activated"
        error={state.fieldErrors?.publishedAt}
      >
        <Input name="publishedAt" type="datetime-local" className="w-64" />
      </Field>

      {state.status === "error" && state.message ? (
        <Alert tone="danger" title="Could not create the notice">
          {state.message}
        </Alert>
      ) : null}
      {state.status === "success" ? (
        <Alert tone="success" title="Notice created">
          It stays invisible on the public site until you activate it.
        </Alert>
      ) : null}

      <Button type="submit" loading={pending} loadingLabel="Saving">
        Create notice
      </Button>
    </form>
  );
}
