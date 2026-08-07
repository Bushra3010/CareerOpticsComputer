"use server";

import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/db/action";
import { getHeadOfficeContext } from "@/features/exams/access";
import { fromRupees, MoneyError } from "@/lib/money";

import { categorySchema, courseSchema } from "./schema";

export interface AcademicsActionState {
  status: "idle" | "error" | "success";
  message?: string;
  fieldErrors?: Record<string, string>;
}

/**
 * Every write here checks `getHeadOfficeContext` for the readable error, but
 * the actual gate is `courses_platform_write` / `course_categories_platform_write`
 * — both `app.is_platform_admin()` only, with no permission code, so a
 * head-office role short of full platform admin cannot manage the catalogue
 * yet. That matches the RLS as it stands rather than inventing a code nobody
 * can hold.
 */
export async function createCourse(
  _prev: AcademicsActionState,
  formData: FormData,
): Promise<AcademicsActionState> {
  const supabase = await createClient();
  const context = await getHeadOfficeContext(supabase);
  if (!context) {
    return { status: "error", message: "You do not have head-office access." };
  }

  const parsed = courseSchema.safeParse({
    categoryId: formData.get("categoryId")?.toString() ?? "",
    name: formData.get("name")?.toString() ?? "",
    slug: formData.get("slug")?.toString() ?? "",
    shortDescription: formData.get("shortDescription")?.toString() ?? "",
    description: formData.get("description")?.toString() ?? "",
    durationLabel: formData.get("durationLabel")?.toString() ?? "",
    feeRupees: formData.get("feeRupees")?.toString() ?? "",
    passPercent: formData.get("passPercent")?.toString() ?? "40",
    distinctionPercent: formData.get("distinctionPercent")?.toString() ?? "75",
  });
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      fieldErrors[String(issue.path[0])] = issue.message;
    }
    return { status: "error", fieldErrors };
  }

  let feePaise: number;
  try {
    feePaise = fromRupees(parsed.data.feeRupees);
  } catch (err) {
    const message = err instanceof MoneyError ? err.message : "Invalid fee.";
    return { status: "error", fieldErrors: { feeRupees: message } };
  }

  const { error } = await supabase.from("courses").insert({
    category_id: parsed.data.categoryId,
    name: parsed.data.name,
    slug: parsed.data.slug,
    short_description: parsed.data.shortDescription,
    description: parsed.data.description || null,
    duration_label: parsed.data.durationLabel,
    fee_paise: feePaise,
    pass_percent: parsed.data.passPercent,
    distinction_percent: parsed.data.distinctionPercent,
    status: "draft",
    created_by: context.userId,
    updated_by: context.userId,
  });

  if (error) {
    return {
      status: "error",
      message:
        error.code === "23505"
          ? "A course with that slug already exists."
          : "Could not create the course.",
    };
  }

  revalidatePath("/admin/academics/courses");
  revalidatePath("/courses");
  return { status: "success", message: "Course created as a draft." };
}

export async function setCourseStatus(
  courseId: string,
  nextStatus: "draft" | "published" | "archived",
  _prev: AcademicsActionState,
  _formData: FormData,
): Promise<AcademicsActionState> {
  const supabase = await createClient();

  const { error } = await supabase
    .from("courses")
    .update({ status: nextStatus })
    .eq("id", courseId);

  if (error) {
    return {
      status: "error",
      message:
        error.code === "42501"
          ? "You do not have permission to change this course."
          : "Could not update the course.",
    };
  }

  revalidatePath("/admin/academics/courses");
  revalidatePath("/courses");
  return {
    status: "success",
    message:
      nextStatus === "published"
        ? "Published — now visible on the public catalogue."
        : nextStatus === "archived"
          ? "Archived — hidden from the public catalogue."
          : "Reverted to draft.",
  };
}

export async function createCourseCategory(
  _prev: AcademicsActionState,
  formData: FormData,
): Promise<AcademicsActionState> {
  const supabase = await createClient();
  const context = await getHeadOfficeContext(supabase);
  if (!context) {
    return { status: "error", message: "You do not have head-office access." };
  }

  const parsed = categorySchema.safeParse({
    name: formData.get("name")?.toString() ?? "",
    slug: formData.get("slug")?.toString() ?? "",
  });
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      fieldErrors[String(issue.path[0])] = issue.message;
    }
    return { status: "error", fieldErrors };
  }

  const { error } = await supabase
    .from("course_categories")
    .insert(parsed.data);

  if (error) {
    return {
      status: "error",
      message:
        error.code === "23505"
          ? "A category with that slug already exists."
          : "Could not create the category.",
    };
  }

  revalidatePath("/admin/academics/courses");
  return { status: "success", message: "Category created." };
}
