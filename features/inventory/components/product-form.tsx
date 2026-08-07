"use client";

import { useActionState, useRef } from "react";

import { Button } from "@/components/ui/button";
import { Field, RequiredLegend } from "@/components/ui/field";
import { Input, Select, Textarea } from "@/components/ui/input";

import { createProduct, type InventoryActionState } from "../actions";
import type { CategoryOption } from "../queries";

const initial: InventoryActionState = { status: "idle" };

export function ProductForm({ categories }: { categories: CategoryOption[] }) {
  const formRef = useRef<HTMLFormElement>(null);
  const [state, action, pending] = useActionState(createProduct, initial);

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
        <Field
          id="name"
          label="Product name"
          required
          error={state.fieldErrors?.name}
        >
          <Input name="name" required maxLength={160} />
        </Field>
        <Field id="sku" label="SKU" required error={state.fieldErrors?.sku}>
          <Input name="sku" required maxLength={40} placeholder="BOOK-101" />
        </Field>
      </div>

      <Field id="categoryId" label="Category">
        <Select name="categoryId" defaultValue="">
          <option value="">Uncategorised</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </Select>
      </Field>

      <Field id="description" label="Description">
        <Textarea name="description" rows={3} maxLength={2000} />
      </Field>

      <div className="grid gap-4 sm:grid-cols-3">
        <Field
          id="priceRupees"
          label="Price (₹)"
          required
          error={state.fieldErrors?.priceRupees}
        >
          <Input
            name="priceRupees"
            type="number"
            min="0"
            step="0.01"
            required
          />
        </Field>
        <Field id="taxPercent" label="Tax (%)">
          <Input
            name="taxPercent"
            type="number"
            min={0}
            max={100}
            step="0.01"
            defaultValue={0}
          />
        </Field>
        <Field id="lowStockThreshold" label="Low-stock threshold">
          <Input
            name="lowStockThreshold"
            type="number"
            min={0}
            defaultValue={0}
          />
        </Field>
      </div>

      <label className="text-body text-text flex items-center gap-2">
        <input
          type="checkbox"
          name="isAllCentres"
          defaultChecked
          className="size-4"
        />
        Available to every centre
      </label>
      <p className="text-meta text-text-secondary">
        Uncheck to restrict this product to specific centres after creating it.
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

      <Button type="submit" loading={pending} loadingLabel="Creating">
        Create product
      </Button>
    </form>
  );
}
