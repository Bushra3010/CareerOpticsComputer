"use client";

import { useActionState, useRef } from "react";

import { Button } from "@/components/ui/button";
import { Field, RequiredLegend } from "@/components/ui/field";
import { Input, Select } from "@/components/ui/input";

import { uploadStudentDocument, type UploadState } from "../document-actions";

const initial: UploadState = { status: "idle" };

export function DocumentUpload({ studentId }: { studentId: string }) {
  const formRef = useRef<HTMLFormElement>(null);
  const bound = uploadStudentDocument.bind(null, studentId);
  const [state, action, pending] = useActionState(bound, initial);

  return (
    <form
      ref={formRef}
      action={async (formData) => {
        await action(formData);
        formRef.current?.reset();
      }}
      className="space-y-4"
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <Field id="kind" label="Document type" required>
          <Select name="kind" defaultValue="photo" required>
            <option value="photo">Photograph</option>
            <option value="id_proof">Identity proof</option>
            <option value="other">Other</option>
          </Select>
        </Field>
        <Field
          id="file"
          label="File"
          required
          help="JPEG, PNG, WebP or PDF, up to 5 MB."
        >
          <Input
            name="file"
            type="file"
            accept="image/jpeg,image/png,image/webp,application/pdf"
            required
            className="file:bg-surface-subtle file:text-meta py-2.5 file:mr-3 file:rounded-[var(--radius-control)] file:border-0 file:px-3 file:py-1.5 file:font-semibold"
          />
        </Field>
      </div>

      <p className="text-meta text-text-secondary">
        Uploading a new photograph replaces the existing one. Documents are
        stored privately and are never listed publicly.
      </p>

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

      <Button type="submit" loading={pending} loadingLabel="Uploading">
        Upload
      </Button>
    </form>
  );
}
