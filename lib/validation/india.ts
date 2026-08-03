import { z } from "zod";

// +91 followed by a 10-digit number starting 6-9, or a bare 10-digit number.
export const indianPhone = z
  .string()
  .trim()
  .regex(/^(?:\+91)?[6-9]\d{9}$/, "Enter a valid Indian mobile number");

export const indianPincode = z
  .string()
  .trim()
  .regex(/^[1-9]\d{5}$/, "Enter a valid 6-digit PIN code");

export const panNumber = z
  .string()
  .trim()
  .toUpperCase()
  .regex(/^[A-Z]{5}\d{4}[A-Z]$/, "Enter a valid PAN");
