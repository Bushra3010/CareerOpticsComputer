"use client";

import { useActionState, useRef } from "react";

import { Button } from "@/components/ui/button";
import { Field, RequiredLegend } from "@/components/ui/field";
import { Input, Select } from "@/components/ui/input";

import { createInventoryLocation, type InventoryActionState } from "../actions";

const initial: InventoryActionState = { status: "idle" };

export function LocationForm() {
  const formRef = useRef<HTMLFormElement>(null);
  const [state, action, pending] = useActionState(
    createInventoryLocation,
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
        label="Location name"
        required
        error={state.fieldErrors?.name}
      >
        <Input
          name="name"
          required
          maxLength={160}
          placeholder="Head office warehouse"
        />
      </Field>
      <Field id="type" label="Type">
        <Select name="type" defaultValue="warehouse">
          <option value="warehouse">Warehouse</option>
          <option value="head_office">Head office</option>
          <option value="centre">Centre</option>
        </Select>
      </Field>
      <Button
        type="submit"
        variant="secondary"
        loading={pending}
        loadingLabel="Adding"
      >
        Add location
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
