import { z } from "zod";

import { indianPhone, indianPincode } from "@/lib/validation";

export const centreApplicationSchema = z.object({
  applicantName: z.string().trim().min(2, "Enter the applicant name").max(200),
  applicantEmail: z.string().trim().toLowerCase().email("Enter a valid email"),
  applicantPhone: indianPhone,
  proposedCentreName: z
    .string()
    .trim()
    .min(2, "Enter the proposed centre name")
    .max(200),
  city: z.string().trim().min(2, "Enter a city").max(100),
  state: z.string().trim().min(2, "Enter a state").max(100),
  pincode: indianPincode,
  address: z.string().trim().min(10, "Enter the full address").max(500),
  message: z.string().trim().max(2000).optional(),
  website: z.string().max(0, "Application could not be submitted").optional(),
});

export type CentreApplicationInput = z.infer<typeof centreApplicationSchema>;
