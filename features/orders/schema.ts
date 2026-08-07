import { z } from "zod";

export const cartItemSchema = z.object({
  product_id: z.string().uuid(),
  quantity: z.number().int().positive(),
});

export const cartSchema = z
  .array(cartItemSchema)
  .min(1, "Add at least one item to the cart.");

export const dispatchSchema = z.object({
  courier: z.string().trim().min(2, "Name the courier.").max(100),
  trackingNumber: z.string().trim().max(100).optional().or(z.literal("")),
});

export const cancelOrderSchema = z.object({
  reason: z
    .string()
    .trim()
    .min(10, "Give a specific reason (10+ characters).")
    .max(300),
});
