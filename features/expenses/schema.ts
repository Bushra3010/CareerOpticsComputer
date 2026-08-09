import { z } from "zod";

/** Suggestions only — the column is free text (C14), these seed the datalist. */
export const SUGGESTED_CATEGORIES = [
  "Rent",
  "Salaries",
  "Electricity",
  "Internet",
  "Stationery",
  "Marketing",
  "Maintenance",
  "Printing income",
  "Other services",
] as const;

export const expenseEntrySchema = z.object({
  entryType: z.enum(["income", "expense"]),
  category: z.string().trim().min(2, "Name a category.").max(60),
  amountRupees: z
    .string()
    .trim()
    .regex(/^\d+(\.\d{1,2})?$/, "Enter an amount like 1200 or 1200.50."),
  entryDate: z.string().trim().min(1, "Choose a date."),
  note: z.string().trim().max(300).optional().or(z.literal("")),
});

export const reverseEntrySchema = z.object({
  note: z
    .string()
    .trim()
    .min(10, "Give a specific reason (10+ characters).")
    .max(300),
});
