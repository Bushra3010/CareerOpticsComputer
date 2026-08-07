"use client";

import { useActionState, useRef } from "react";

import { Button } from "@/components/ui/button";
import { Field, RequiredLegend } from "@/components/ui/field";
import { Input, Select, Textarea } from "@/components/ui/input";

import { adjustStock, type InventoryActionState } from "../actions";
import type { LocationOption, ProductOption } from "../queries";

const initial: InventoryActionState = { status: "idle" };

export function AdjustStockForm({
  locations,
  products,
}: {
  locations: LocationOption[];
  products: ProductOption[];
}) {
  const formRef = useRef<HTMLFormElement>(null);
  const [state, action, pending] = useActionState(adjustStock, initial);

  if (locations.length === 0 || products.length === 0) {
    return null;
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
                {p.name} ({p.sku}) — {p.stockOnHand} on hand
              </option>
            ))}
          </Select>
        </Field>
      </div>

      <Field
        id="quantityDelta"
        label="Adjustment"
        required
        help="A positive number adds stock, a negative number removes it — e.g. -3 for damaged units."
        error={state.fieldErrors?.quantityDelta}
      >
        <Input name="quantityDelta" type="number" required />
      </Field>

      <Field
        id="notes"
        label="Reason"
        required
        help="Every adjustment needs a human explanation — it becomes part of the ledger."
        error={state.fieldErrors?.notes}
      >
        <Textarea name="notes" rows={2} maxLength={300} required />
      </Field>

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

      <Button
        type="submit"
        variant="destructive-outline"
        loading={pending}
        loadingLabel="Saving"
      >
        Record adjustment
      </Button>
    </form>
  );
}
