import { z } from "zod";

import { indianPhone } from "@/lib/validation";

export const admitStudentSchema = z.object({
  fullName: z.string().trim().min(2, "Enter the student name").max(200),
  phone: indianPhone,
  email: z
    .union([z.literal(""), z.string().trim().email("Enter a valid email")])
    .optional(),
  dateOfBirth: z.union([z.literal(""), z.iso.date()]).optional(),
  gender: z.string().trim().max(50).optional(),
  guardianName: z.string().trim().max(200).optional(),
  address: z.string().trim().max(500).optional(),
  courseId: z.uuid("Select a course"),
});

export type AdmitStudentInput = z.infer<typeof admitStudentSchema>;
