"use client";

import { useActionState, useRef } from "react";

import { Button } from "@/components/ui/button";
import { Field, RequiredLegend } from "@/components/ui/field";
import { Input } from "@/components/ui/input";

import { createProductCategory, type InventoryActionState } from "../actions";

const initial: InventoryActionState = { status: "idle" };

export function CategoryForm() {
  const formRef = useRef<HTMLFormElement>(null);
  const [state, action, pending] = useActionState(
    createProductCategory,
    initial,
  );

  return (
    <form
      ref={formRef}
      action={async (formData) => {
        await action(formData);
        formRef.current?.reset();
      }}
      className="flex flex-wrap items-end gap-3"
    >
      <Field
        id="name"
        label="Category name"
        required
        error={state.fieldErrors?.name}
      >
        <Input name="name" required maxLength={100} />
      </Field>
      <Field id="code" label="Code" required error={state.fieldErrors?.code}>
        <Input name="code" required maxLength={100} placeholder="stationery" />
      </Field>
      <Button
        type="submit"
        variant="secondary"
        loading={pending}
        loadingLabel="Adding"
      >
        Add category
      </Button>
      {state.status === "error" && state.message ? (
        <p role="alert" className="text-meta text-danger w-full">
          {state.message}
        </p>
      ) : null}
      <RequiredLegend />
    </form>
  );
}
