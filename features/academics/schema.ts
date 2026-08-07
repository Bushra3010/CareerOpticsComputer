import { z } from "zod";

export const courseSchema = z
  .object({
    categoryId: z.string().uuid("Choose a category."),
    name: z.string().trim().min(2, "Give the course a name.").max(160),
    slug: z
      .string()
      .trim()
      .toLowerCase()
      .regex(
        /^[a-z0-9]+(-[a-z0-9]+)*$/,
        "Use lowercase letters, numbers and hyphens only.",
      ),
    shortDescription: z.string().trim().min(10).max(200),
    description: z.string().trim().max(4000).optional().or(z.literal("")),
    durationLabel: z.string().trim().min(2, 'e.g. "3 months".').max(60),
    // The one other rupee-typed field in the app. Same fromRupees exactness as
    // the wallet recharge form — see features/wallet/actions.ts.
    feeRupees: z
      .string()
      .trim()
      .regex(/^\d+(\.\d{1,2})?$/, "Enter an amount like 15000 or 15000.50."),
    passPercent: z.coerce.number().int().min(0).max(100),
    distinctionPercent: z.coerce.number().int().min(0).max(100),
  })
  .refine((c) => c.distinctionPercent >= c.passPercent, {
    message: "The distinction mark cannot be below the pass mark.",
    path: ["distinctionPercent"],
  });

export type CourseInput = z.infer<typeof courseSchema>;

export const categorySchema = z.object({
  name: z.string().trim().min(2).max(100),
  slug: z
    .string()
    .trim()
    .toLowerCase()
    .regex(
      /^[a-z0-9]+(-[a-z0-9]+)*$/,
      "Use lowercase letters, numbers and hyphens only.",
    ),
});
