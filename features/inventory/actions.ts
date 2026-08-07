"use server";

import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/db/action";
import { callRpc } from "@/lib/db/rpc";
import { getHeadOfficeContext } from "@/features/exams/access";
import { fromRupees, MoneyError } from "@/lib/money";

import {
  adjustStockSchema,
  locationSchema,
  productCategorySchema,
  productSchema,
  receiveStockSchema,
} from "./schema";

export interface InventoryActionState {
  status: "idle" | "error" | "success";
  message?: string;
  fieldErrors?: Record<string, string>;
}

function fieldErrorsFrom(issues: { path: PropertyKey[]; message: string }[]) {
  const fieldErrors: Record<string, string> = {};
  for (const issue of issues) {
    const field = issue.path[0];
    if (typeof field === "string" && !fieldErrors[field]) {
      fieldErrors[field] = issue.message;
    }
  }
  return fieldErrors;
}

/**
 * `product.manage` is organisation-wide (PRD §4: Inventory Manager's scope is
 * "Entire organisation") and, per migration 0031's header, only a platform
 * admin currently holds it — the same gap `createCourse` already lives with
 * for the academics catalogue. This checks head-office standing for the
 * readable error; the RLS policy is what actually decides it.
 */
export async function createProductCategory(
  _prev: InventoryActionState,
  formData: FormData,
): Promise<InventoryActionState> {
  const supabase = await createClient();
  const context = await getHeadOfficeContext(supabase);
  if (!context) {
    return { status: "error", message: "You do not have head-office access." };
  }

  const parsed = productCategorySchema.safeParse({
    name: formData.get("name")?.toString() ?? "",
    code: formData.get("code")?.toString() ?? "",
  });
  if (!parsed.success) {
    return {
      status: "error",
      fieldErrors: fieldErrorsFrom(parsed.error.issues),
    };
  }

  const { error } = await supabase.from("product_categories").insert({
    organization_id: context.organizationId,
    name: parsed.data.name,
    code: parsed.data.code,
    created_by: context.userId,
    updated_by: context.userId,
  });

  if (error) {
    return {
      status: "error",
      message:
        error.code === "23505"
          ? "A category with that code already exists."
          : error.code === "42501"
            ? "You do not have permission to manage the catalogue."
            : "Could not create the category.",
    };
  }

  revalidatePath("/admin/products");
  revalidatePath("/admin/products/categories");
  return { status: "success", message: "Category created." };
}

export async function createProduct(
  _prev: InventoryActionState,
  formData: FormData,
): Promise<InventoryActionState> {
  const supabase = await createClient();
  const context = await getHeadOfficeContext(supabase);
  if (!context) {
    return { status: "error", message: "You do not have head-office access." };
  }

  const parsed = productSchema.safeParse({
    categoryId: formData.get("categoryId")?.toString() ?? "",
    sku: formData.get("sku")?.toString() ?? "",
    name: formData.get("name")?.toString() ?? "",
    description: formData.get("description")?.toString() ?? "",
    priceRupees: formData.get("priceRupees")?.toString() ?? "",
    taxPercent: formData.get("taxPercent")?.toString() ?? "0",
    lowStockThreshold: formData.get("lowStockThreshold")?.toString() ?? "0",
    isAllCentres: formData.get("isAllCentres") === "on",
  });
  if (!parsed.success) {
    return {
      status: "error",
      fieldErrors: fieldErrorsFrom(parsed.error.issues),
    };
  }

  let pricePaise: number;
  try {
    pricePaise = fromRupees(parsed.data.priceRupees);
  } catch (err) {
    const message = err instanceof MoneyError ? err.message : "Invalid price.";
    return { status: "error", fieldErrors: { priceRupees: message } };
  }
  if (pricePaise <= 0) {
    return {
      status: "error",
      fieldErrors: { priceRupees: "Enter an amount greater than zero." },
    };
  }

  const { error } = await supabase.from("products").insert({
    organization_id: context.organizationId,
    category_id: parsed.data.categoryId || null,
    sku: parsed.data.sku,
    name: parsed.data.name,
    description: parsed.data.description || null,
    price_paise: pricePaise,
    tax_percent: parsed.data.taxPercent,
    low_stock_threshold: parsed.data.lowStockThreshold,
    is_all_centres: parsed.data.isAllCentres,
    status: "draft",
    created_by: context.userId,
    updated_by: context.userId,
  });

  if (error) {
    return {
      status: "error",
      message:
        error.code === "23505"
          ? "A product with that SKU already exists."
          : error.code === "42501"
            ? "You do not have permission to manage the catalogue."
            : "Could not create the product.",
    };
  }

  revalidatePath("/admin/products");
  return { status: "success", message: "Product created as a draft." };
}

/**
 * Two named transitions rather than one `setStatus(status)` — the same shape
 * `activateQuestionBank` / `retireQuestionBank` already use for an identical
 * draft/active/retired lifecycle, so a button's destination is fixed by which
 * action it binds rather than a value read back out of form data.
 */
async function changeProductStatus(
  productId: string,
  status: "active" | "retired",
): Promise<InventoryActionState> {
  const supabase = await createClient();
  const { error } = await supabase
    .from("products")
    .update({ status })
    .eq("id", productId);

  if (error) {
    return {
      status: "error",
      message:
        error.code === "42501"
          ? "You do not have permission to change this product."
          : "Could not update the product.",
    };
  }

  revalidatePath("/admin/products");
  return {
    status: "success",
    message:
      status === "active"
        ? "Product is now orderable."
        : "Product retired — existing orders are unaffected.",
  };
}

export async function activateProduct(
  productId: string,
  _prev: InventoryActionState,
  _formData: FormData,
): Promise<InventoryActionState> {
  return changeProductStatus(productId, "active");
}

export async function retireProduct(
  productId: string,
  _prev: InventoryActionState,
  _formData: FormData,
): Promise<InventoryActionState> {
  return changeProductStatus(productId, "retired");
}

export async function createInventoryLocation(
  _prev: InventoryActionState,
  formData: FormData,
): Promise<InventoryActionState> {
  const supabase = await createClient();
  const context = await getHeadOfficeContext(supabase);
  if (!context) {
    return { status: "error", message: "You do not have head-office access." };
  }

  const parsed = locationSchema.safeParse({
    name: formData.get("name")?.toString() ?? "",
    type: formData.get("type")?.toString() ?? "warehouse",
  });
  if (!parsed.success) {
    return {
      status: "error",
      fieldErrors: fieldErrorsFrom(parsed.error.issues),
    };
  }

  const { error } = await supabase.from("inventory_locations").insert({
    organization_id: context.organizationId,
    name: parsed.data.name,
    type: parsed.data.type,
    created_by: context.userId,
  });

  if (error) {
    return {
      status: "error",
      message:
        error.code === "23505"
          ? "A location with that name already exists."
          : error.code === "42501"
            ? "You do not have permission to manage inventory."
            : "Could not create the location.",
    };
  }

  revalidatePath("/admin/inventory/locations");
  return { status: "success", message: "Location created." };
}

export async function receiveStock(
  _prev: InventoryActionState,
  formData: FormData,
): Promise<InventoryActionState> {
  const supabase = await createClient();

  const parsed = receiveStockSchema.safeParse({
    locationId: formData.get("locationId")?.toString() ?? "",
    productId: formData.get("productId")?.toString() ?? "",
    quantity: formData.get("quantity")?.toString() ?? "",
    reference: formData.get("reference")?.toString() ?? "",
  });
  if (!parsed.success) {
    return {
      status: "error",
      fieldErrors: fieldErrorsFrom(parsed.error.issues),
    };
  }

  const { error } = await callRpc(supabase, "receive_stock", {
    p_location_id: parsed.data.locationId,
    p_product_id: parsed.data.productId,
    p_quantity: parsed.data.quantity,
    p_reference: parsed.data.reference || null,
  });

  if (error) {
    return {
      status: "error",
      message:
        error.message.replace(/^.*?:\s*/, "") || "Could not receive stock.",
    };
  }

  revalidatePath("/admin/inventory");
  revalidatePath("/admin/inventory/ledger");
  return { status: "success", message: "Stock received." };
}

export async function adjustStock(
  _prev: InventoryActionState,
  formData: FormData,
): Promise<InventoryActionState> {
  const supabase = await createClient();

  const parsed = adjustStockSchema.safeParse({
    locationId: formData.get("locationId")?.toString() ?? "",
    productId: formData.get("productId")?.toString() ?? "",
    quantityDelta: formData.get("quantityDelta")?.toString() ?? "",
    notes: formData.get("notes")?.toString() ?? "",
  });
  if (!parsed.success) {
    return {
      status: "error",
      fieldErrors: fieldErrorsFrom(parsed.error.issues),
    };
  }

  const { error } = await callRpc(supabase, "adjust_stock", {
    p_location_id: parsed.data.locationId,
    p_product_id: parsed.data.productId,
    p_quantity_delta: parsed.data.quantityDelta,
    p_notes: parsed.data.notes,
  });

  if (error) {
    return {
      status: "error",
      message:
        error.message.replace(/^.*?:\s*/, "") || "Could not adjust stock.",
    };
  }

  revalidatePath("/admin/inventory");
  revalidatePath("/admin/inventory/ledger");
  return { status: "success", message: "Adjustment recorded." };
}
