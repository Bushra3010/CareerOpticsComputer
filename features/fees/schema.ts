import { z } from "zod";

/**
 * Rupee strings from the form are parsed to paise by lib/money's `fromRupees`
 * in the action — these schemas validate shape only, never do the conversion,
 * so there's exactly one place rupees become paise.
 */
const rupeeAmount = z
  .string()
  .trim()
  .regex(/^\d+(\.\d{1,2})?$/, "Enter an amount like 4500 or 4500.50");

export const createFeePlanSchema = z.object({
  totalRupees: rupeeAmount,
  instalmentCount: z.coerce
    .number()
    .int()
    .min(1, "At least one instalment")
    .max(36),
  firstDueDate: z.iso.date("Select a due date"),
});

export const postPaymentSchema = z.object({
  amountRupees: rupeeAmount,
  method: z.enum(["cash", "upi", "bank_transfer", "cheque", "card"]),
  reference: z.string().trim().max(100).optional(),
});
