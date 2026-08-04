"use server";

import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/db/action";
import { callRpc } from "@/lib/db/rpc";
import { authorize } from "@/lib/permissions";
import { getCurrentCentreContext } from "@/features/centres/current-membership";

import { admitStudentSchema } from "./schema";

export interface AdmitStudentFormState {
  status: "idle" | "error" | "success";
  message?: string;
  registrationNumber?: string;
  fieldErrors?: Record<string, string>;
}

export async function admitStudent(
  _prevState: AdmitStudentFormState,
  formData: FormData,
): Promise<AdmitStudentFormState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { status: "error", message: "You must be signed in." };
  }

  const context = await getCurrentCentreContext(supabase, user.id);
  if (!context) {
    return {
      status: "error",
      message: "No active centre membership found for this account.",
    };
  }

  try {
    await authorize(
      supabase,
      "student.create",
      context.organizationId,
      context.centreId,
    );
  } catch {
    return {
      status: "error",
      message: "You do not have permission to admit students.",
    };
  }

  const parsed = admitStudentSchema.safeParse({
    fullName: formData.get("fullName")?.toString() ?? "",
    phone: formData.get("phone")?.toString() ?? "",
    email: formData.get("email")?.toString() ?? "",
    dateOfBirth: formData.get("dateOfBirth")?.toString() ?? "",
    gender: formData.get("gender")?.toString() ?? "",
    guardianName: formData.get("guardianName")?.toString() ?? "",
    address: formData.get("address")?.toString() ?? "",
    courseId: formData.get("courseId")?.toString() ?? "",
  });

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

  const { data, error } = await callRpc(supabase, "admit_student", {
    p_organization_id: context.organizationId,
    p_centre_id: context.centreId,
    p_course_id: parsed.data.courseId,
    p_full_name: parsed.data.fullName,
    p_phone: parsed.data.phone,
    p_email: parsed.data.email || null,
    p_date_of_birth: parsed.data.dateOfBirth || null,
    p_gender: parsed.data.gender || null,
    p_guardian_name: parsed.data.guardianName || null,
    p_address: parsed.data.address || null,
  });

  if (error || !data || data.length === 0) {
    return {
      status: "error",
      message: "Could not admit the student. Please try again.",
    };
  }

  revalidatePath("/centre/students");

  return { status: "success", registrationNumber: data[0].registration_number };
}
