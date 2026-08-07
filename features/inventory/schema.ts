import { z } from "zod";

const slugLikeCode = z
  .string()
  .trim()
  .toLowerCase()
  .regex(
    /^[a-z0-9]+(-[a-z0-9]+)*$/,
    "Use lowercase letters, numbers and hyphens only.",
  );

export const productCategorySchema = z.object({
  name: z.string().trim().min(2).max(100),
  code: slugLikeCode,
});

export const productSchema = z.object({
  categoryId: z
    .string()
    .uuid("Choose a category.")
    .optional()
    .or(z.literal("")),
  sku: z
    .string()
    .trim()
    .toUpperCase()
    .regex(
      /^[A-Z0-9-]{2,40}$/,
      "Use letters, numbers and hyphens, e.g. BOOK-101.",
    ),
  name: z.string().trim().min(2, "Give the product a name.").max(160),
  description: z.string().trim().max(2000).optional().or(z.literal("")),
  // Same exactness as the wallet recharge and course fee fields — see
  // lib/money's fromRupees, which rejects a third decimal rather than
  // silently rounding it.
  priceRupees: z
    .string()
    .trim()
    .regex(/^\d+(\.\d{1,2})?$/, "Enter an amount like 250 or 250.50."),
  taxPercent: z.coerce.number().min(0).max(100),
  lowStockThreshold: z.coerce.number().int().min(0),
  isAllCentres: z.coerce.boolean(),
});

export const locationSchema = z.object({
  name: z.string().trim().min(2).max(160),
  type: z.enum(["warehouse", "head_office", "centre"]),
});

export const receiveStockSchema = z.object({
  locationId: z.string().uuid("Choose a location."),
  productId: z.string().uuid("Choose a product."),
  quantity: z.coerce
    .number()
    .int()
    .positive("Enter a quantity greater than zero."),
  reference: z.string().trim().max(200).optional().or(z.literal("")),
});

export const adjustStockSchema = z.object({
  locationId: z.string().uuid("Choose a location."),
  productId: z.string().uuid("Choose a product."),
  quantityDelta: z.coerce
    .number()
    .int()
    .refine((n) => n !== 0, "An adjustment must change the quantity."),
  notes: z.string().trim().min(5, "Explain the adjustment.").max(300),
});
