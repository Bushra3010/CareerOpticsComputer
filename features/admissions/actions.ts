"use server";

import { headers } from "next/headers";

import { createClient } from "@/lib/db/action";
import { callRpc } from "@/lib/db/rpc";
import { checkRateLimit } from "@/lib/rate-limit";

import { enquirySchema } from "./schema";

const CAREER_OPTICS_SLUG = "career-optics";

export interface EnquiryFormState {
  status: "idle" | "success" | "error";
  message?: string;
  fieldErrors?: Record<string, string>;
}

export async function submitEnquiry(
  _prevState: EnquiryFormState,
  formData: FormData,
): Promise<EnquiryFormState> {
  const raw = {
    fullName: formData.get("fullName")?.toString() ?? "",
    phone: formData.get("phone")?.toString() ?? "",
    email: formData.get("email")?.toString() ?? "",
    city: formData.get("city")?.toString() ?? "",
    courseInterestId: formData.get("courseInterestId")?.toString() ?? "",
    message: formData.get("message")?.toString() ?? "",
    website: formData.get("website")?.toString() ?? "",
  };

  const parsed = enquirySchema.safeParse(raw);
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const field = issue.path[0];
      if (typeof field === "string" && !fieldErrors[field]) {
        fieldErrors[field] = issue.message;
      }
    }
    return {
      status: "error",
      message: "Please fix the errors below.",
      fieldErrors,
    };
  }

  // Honeypot: real users never see or fill `website`. Report generic success
  // so a bot can't tell it was silently dropped (no enumeration).
  if (parsed.data.website) {
    return { status: "success" };
  }

  const headerList = await headers();
  const ip =
    headerList.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  const { allowed } = checkRateLimit(`enquiry:${ip}`, 5, 10 * 60 * 1000);
  if (!allowed) {
    return {
      status: "error",
      message: "Too many enquiries submitted recently. Please try again later.",
    };
  }

  const supabase = await createClient();
  const { error } = await callRpc(supabase, "submit_public_enquiry", {
    p_organization_slug: CAREER_OPTICS_SLUG,
    p_full_name: parsed.data.fullName,
    p_phone: parsed.data.phone,
    p_email: parsed.data.email || null,
    p_city: parsed.data.city || null,
    p_course_interest_id: parsed.data.courseInterestId || null,
    p_message: parsed.data.message || null,
  });

  if (error) {
    return {
      status: "error",
      message: "Something went wrong. Please try again.",
    };
  }

  return { status: "success" };
}
