import { z } from "zod";

export const createReferralCodeSchema = z.object({
  ownerCentreId: z.string().uuid("Choose a centre."),
  validUntil: z.string().trim().max(10).optional().or(z.literal("")),
});

export const recordReferralSchema = z.object({
  code: z.string().trim().min(4).max(20),
  referredEntityType: z.enum(["lead", "student", "centre"]),
  referredEntityId: z.string().uuid("Enter a valid id."),
});

export const commissionRuleSchema = z
  .object({
    event: z.enum(["centre_approval", "student_admission", "fee_payment"]),
    amountType: z.enum(["flat", "percentage"]),
    flatAmountRupees: z
      .string()
      .trim()
      .regex(/^\d*(\.\d{1,2})?$/, "Enter an amount like 500 or 500.50.")
      .optional()
      .or(z.literal("")),
    percentage: z.coerce.number().min(0).max(100).optional(),
    effectiveFrom: z.string().trim().min(1, "Choose a start date."),
    effectiveTo: z.string().trim().optional().or(z.literal("")),
  })
  .refine(
    (v) =>
      v.amountType === "flat"
        ? !!v.flatAmountRupees
        : v.percentage !== undefined,
    {
      message: "Enter the amount for the chosen type.",
      path: ["flatAmountRupees"],
    },
  );

export const qualifyReferralSchema = z.object({
  referralId: z.string().uuid(),
  event: z.enum(["centre_approval", "student_admission", "fee_payment"]),
  baseAmountRupees: z
    .string()
    .trim()
    .regex(/^\d*(\.\d{1,2})?$/, "Enter an amount like 15000 or 15000.50.")
    .optional()
    .or(z.literal("")),
});

export const reverseCommissionSchema = z.object({
  reason: z
    .string()
    .trim()
    .min(10, "Give a specific reason (10+ characters).")
    .max(300),
});

export const payCommissionSchema = z.object({
  payoutReference: z.string().trim().max(100).optional().or(z.literal("")),
});
