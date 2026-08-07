"use client";

import { useActionState, useRef } from "react";

import { Button } from "@/components/ui/button";
import { Field, RequiredLegend } from "@/components/ui/field";
import { Input, Select } from "@/components/ui/input";

import { receiveStock, type InventoryActionState } from "../actions";
import type { LocationOption, ProductOption } from "../queries";

const initial: InventoryActionState = { status: "idle" };

export function ReceiveStockForm({
  locations,
  products,
}: {
  locations: LocationOption[];
  products: ProductOption[];
}) {
  const formRef = useRef<HTMLFormElement>(null);
  const [state, action, pending] = useActionState(receiveStock, initial);

  if (locations.length === 0 || products.length === 0) {
    return (
      <p className="text-body text-text-secondary">
        {locations.length === 0
          ? "Create a location first."
          : "Create an active product first."}
      </p>
    );
  }

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
        <Field id="locationId" label="Location" required>
          <Select name="locationId" required defaultValue={locations[0].id}>
            {locations.map((l) => (
              <option key={l.id} value={l.id}>
                {l.name}
              </option>
            ))}
          </Select>
        </Field>
        <Field id="productId" label="Product" required>
          <Select name="productId" required defaultValue={products[0].id}>
            {products.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name} ({p.sku})
              </option>
            ))}
          </Select>
        </Field>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field
          id="quantity"
          label="Quantity"
          required
          error={state.fieldErrors?.quantity}
        >
          <Input name="quantity" type="number" min={1} required />
        </Field>
        <Field id="reference" label="Reference">
          <Input
            name="reference"
            maxLength={200}
            placeholder="Invoice / PO number"
          />
        </Field>
      </div>

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

      <Button type="submit" loading={pending} loadingLabel="Receiving">
        Receive stock
      </Button>
    </form>
  );
}
