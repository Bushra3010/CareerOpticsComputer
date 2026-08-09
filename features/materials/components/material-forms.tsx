"use client";

import { useActionState, useRef, useState } from "react";

import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { Input, Select, Textarea } from "@/components/ui/input";

import {
  createMaterial,
  setMaterialStatus,
  type MaterialActionState,
} from "../actions";

const initial: MaterialActionState = { status: "idle" };

export function CreateMaterialForm({
  courses,
  batches,
}: {
  courses: { id: string; name: string }[];
  batches: { id: string; label: string }[];
}) {
  const formRef = useRef<HTMLFormElement>(null);
  const [kind, setKind] = useState<"file" | "link">("file");
  const [state, action, pending] = useActionState(createMaterial, initial);

  return (
    <form
      ref={formRef}
      action={async (formData) => {
        await action(formData);
        formRef.current?.reset();
        setKind("file");
      }}
      className="space-y-4"
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <Field
          id="title"
          label="Title"
          required
          error={state.fieldErrors?.title}
        >
          <Input name="title" required maxLength={160} />
        </Field>
        <Field id="kind" label="Type" required>
          <Select
            name="kind"
            value={kind}
            onChange={(e) => setKind(e.currentTarget.value as "file" | "link")}
          >
            <option value="file">Uploaded file</option>
            <option value="link">Link</option>
          </Select>
        </Field>
      </div>

      {kind === "file" ? (
        <Field
          id="file"
          label="File"
          required
          help="Up to 50 MB — PDF, images, documents, slides, spreadsheets, zip or MP4."
          error={state.fieldErrors?.file}
        >
          <Input type="file" name="file" required />
        </Field>
      ) : (
        <Field id="url" label="Link" required error={state.fieldErrors?.url}>
          <Input name="url" type="url" placeholder="https://" required />
        </Field>
      )}

      <Field id="description" label="Description">
        <Textarea name="description" rows={2} maxLength={500} />
      </Field>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field
          id="courseId"
          label="Course"
          help="Leave empty to share with every course at your centre."
        >
          <Select name="courseId" defaultValue="">
            <option value="">Every course</option>
            {courses.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </Select>
        </Field>
        <Field
          id="batchId"
          label="Batch"
          help="Leave empty to share with every batch on that course."
        >
          <Select name="batchId" defaultValue="">
            <option value="">Every batch</option>
            {batches.map((b) => (
              <option key={b.id} value={b.id}>
                {b.label}
              </option>
            ))}
          </Select>
        </Field>
      </div>

      {state.status === "error" && state.message ? (
        <Alert tone="danger" title="Could not publish">
          {state.message}
        </Alert>
      ) : null}
      {state.status === "success" ? (
        <Alert tone="success" title="Published">
          Students in scope can see it now.
        </Alert>
      ) : null}

      <Button type="submit" loading={pending} loadingLabel="Publishing">
        Publish material
      </Button>
    </form>
  );
}

export function MaterialStatusButton({
  materialId,
  currentStatus,
}: {
  materialId: string;
  currentStatus: "draft" | "active" | "retired";
}) {
  const next = currentStatus === "active" ? "retired" : "active";
  const bound = setMaterialStatus.bind(null, materialId, next);
  const [, action, pending] = useActionState(bound, initial);

  return (
    <form action={action}>
      <Button
        type="submit"
        variant="tertiary"
        size="sm"
        loading={pending}
        loadingLabel="Saving"
      >
        {next === "active" ? "Publish" : "Withdraw"}
      </Button>
    </form>
  );
}
