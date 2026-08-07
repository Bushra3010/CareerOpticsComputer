"use client";

import { useActionState } from "react";

import { Button } from "@/components/ui/button";

import {
  activateProduct,
  retireProduct,
  type InventoryActionState,
} from "../actions";

const initial: InventoryActionState = { status: "idle" };

export function ProductStatusButton({
  productId,
  currentStatus,
}: {
  productId: string;
  currentStatus: "draft" | "active" | "retired";
}) {
  const action =
    currentStatus === "retired"
      ? activateProduct
      : currentStatus === "draft"
        ? activateProduct
        : retireProduct;
  const bound = action.bind(null, productId);
  const [, formAction, pending] = useActionState(bound, initial);

  return (
    <form action={formAction}>
      <Button
        type="submit"
        variant="tertiary"
        size="sm"
        loading={pending}
        loadingLabel="Saving"
      >
        {currentStatus === "active" ? "Retire" : "Activate"}
      </Button>
    </form>
  );
}
