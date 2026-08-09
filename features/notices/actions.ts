"use server";

import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/db/action";
import { getHeadOfficeContext } from "@/features/exams/access";

import { noticeSchema } from "./schema";

export interface NoticeActionState {
  status: "idle" | "error" | "success";
  message?: string;
  fieldErrors?: Record<string, string>;
}

export async function createNotice(
  _prev: NoticeActionState,
  formData: FormData,
): Promise<NoticeActionState> {
  const supabase = await createClient();
  const context = await getHeadOfficeContext(supabase);
  if (!context) {
    return { status: "error", message: "You do not have head-office access." };
  }

  const parsed = noticeSchema.safeParse({
    title: formData.get("title")?.toString() ?? "",
    slug: formData.get("slug")?.toString() ?? "",
    body: formData.get("body")?.toString() ?? "",
    publishedAt: formData.get("publishedAt")?.toString() ?? "",
  });
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const field = String(issue.path[0]);
      if (!fieldErrors[field]) fieldErrors[field] = issue.message;
    }
    return { status: "error", fieldErrors };
  }

  const { error } = await supabase.from("notices").insert({
    organization_id: context.organizationId,
    title: parsed.data.title,
    slug: parsed.data.slug,
    body: parsed.data.body,
    published_at: parsed.data.publishedAt || null,
    created_by: context.userId,
  });

  if (error) {
    if (error.code === "23505") {
      return {
        status: "error",
        fieldErrors: { slug: "A notice with this slug already exists." },
      };
    }
    return {
      status: "error",
      message:
        error.code === "42501"
          ? "You do not have permission to manage notices."
          : "Could not create the notice.",
    };
  }

  revalidatePath("/admin/notices");
  revalidatePath("/notices");
  return { status: "success", message: "Notice created as a draft." };
}

export async function setNoticeStatus(
  noticeId: string,
  nextStatus: "draft" | "active" | "retired",
  _prev: NoticeActionState,
  _formData: FormData,
): Promise<NoticeActionState> {
  const supabase = await createClient();

  // Activating a notice that has no publish time stamps one, so the public
  // list can always order by it and "active but undated" never happens.
  const patch: {
    status: "draft" | "active" | "retired";
    published_at?: string;
  } = { status: nextStatus };
  if (nextStatus === "active") {
    const { data: existing } = await supabase
      .from("notices")
      .select("published_at")
      .eq("id", noticeId)
      .maybeSingle();
    if (existing && existing.published_at === null) {
      patch.published_at = new Date().toISOString();
    }
  }

  const { error } = await supabase
    .from("notices")
    .update(patch)
    .eq("id", noticeId);

  if (error) {
    return {
      status: "error",
      message:
        error.code === "42501"
          ? "You do not have permission to change this notice."
          : "Could not update the notice.",
    };
  }

  revalidatePath("/admin/notices");
  revalidatePath("/notices");
  return { status: "success", message: "Notice updated." };
}
