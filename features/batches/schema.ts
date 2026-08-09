import { z } from "zod";

/** Sunday-first, matching the `weekday` column's 0–6 (Postgres `dow`). */
export const WEEKDAYS = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
] as const;

export const batchSchema = z.object({
  courseId: z.string().uuid("Choose a course."),
  code: z
    .string()
    .trim()
    .toUpperCase()
    .regex(
      /^[A-Z0-9-]{2,20}$/,
      "Letters, numbers and hyphens, 2–20 characters.",
    ),
  name: z.string().trim().min(3, "Give the batch a name.").max(80),
  facultyId: z.string().uuid().optional().or(z.literal("")),
  capacity: z
    .string()
    .trim()
    .regex(/^\d{0,4}$/, "A whole number of places.")
    .optional()
    .or(z.literal("")),
  room: z.string().trim().max(40).optional().or(z.literal("")),
  startDate: z.string().trim().min(1, "Choose a start date."),
  endDate: z.string().trim().optional().or(z.literal("")),
});

export const scheduleSlotSchema = z.object({
  batchId: z.string().uuid(),
  weekday: z.coerce.number().int().min(0).max(6),
  startTime: z
    .string()
    .trim()
    .regex(/^\d{2}:\d{2}$/, "Use a time like 09:30."),
  endTime: z
    .string()
    .trim()
    .regex(/^\d{2}:\d{2}$/, "Use a time like 11:00."),
  room: z.string().trim().max(40).optional().or(z.literal("")),
});

export const placeStudentSchema = z.object({
  enrolmentId: z.string().uuid(),
  batchId: z.string().uuid().optional().or(z.literal("")),
});
