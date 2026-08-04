import { z } from "zod";

import { indianPhone } from "@/lib/validation";

// Honeypot: a field real users never see or fill. Any value in it means a bot.
export const enquirySchema = z.object({
  fullName: z.string().trim().min(2, "Enter the full name").max(200),
  phone: indianPhone,
  email: z
    .union([z.literal(""), z.string().trim().email("Enter a valid email")])
    .optional(),
  city: z.string().trim().max(100).optional(),
  courseInterestId: z.union([z.literal(""), z.uuid()]).optional(),
  message: z.string().trim().max(2000).optional(),
  website: z.string().max(0, "Enquiry could not be submitted").optional(),
});

export type EnquiryInput = z.infer<typeof enquirySchema>;
