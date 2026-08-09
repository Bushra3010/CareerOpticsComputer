"use server";

import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/db/action";
import { getHeadOfficeContext } from "@/features/exams/access";
import { getCurrentCentreContext } from "@/features/centres/current-membership";

import { createAnnouncementSchema } from "./schema";

export interface AnnouncementActionState {
  status: "idle" | "error" | "success";
  message?: string;
  fieldErrors?: Record<string, string>;
}

function fieldErrorsFrom(issues: { path: PropertyKey[]; message: string }[]) {
  const fieldErrors: Record<string, string> = {};
  for (const issue of issues) {
    const field = issue.path[0];
    if (typeof field === "string" && !fieldErrors[field]) {
      fieldErrors[field] = issue.message;
    }
  }
  return fieldErrors;
}

/**
 * One action for both head office (organisation-wide, or any centre — its
 * `announcement.manage` grant is org-wide and the RLS policy does not
 * narrow it by scope) and a centre owner (their own centre only, per the
 * matrix's "all (own centre)"). Which one applies is decided by RLS, not by
 * this action — it only resolves an `organization_id` to write and turns a
 * denial into a readable sentence.
 */
export async function createAnnouncement(
  _prev: AnnouncementActionState,
  formData: FormData,
): Promise<AnnouncementActionState> {
  const supabase = await createClient();

  const parsed = createAnnouncementSchema.safeParse({
    scopeType: formData.get("scopeType")?.toString() ?? "organization",
    scopeCentreId: formData.get("scopeCentreId")?.toString() ?? "",
    title: formData.get("title")?.toString() ?? "",
    body: formData.get("body")?.toString() ?? "",
    publishNow: formData.get("publishNow") === "on",
    expiresAt: formData.get("expiresAt")?.toString() ?? "",
  });
  if (!parsed.success) {
    return {
      status: "error",
      fieldErrors: fieldErrorsFrom(parsed.error.issues),
    };
  }
  if (parsed.data.scopeType === "centre" && !parsed.data.scopeCentreId) {
    return {
      status: "error",
      fieldErrors: { scopeCentreId: "Choose a centre." },
    };
  }

  const hoContext = await getHeadOfficeContext(supabase);
  let organizationId = hoContext?.organizationId;

  if (!organizationId) {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    const centreContext = user
      ? await getCurrentCentreContext(supabase, user.id)
      : null;
    organizationId = centreContext?.organizationId;
  }
  if (!organizationId) {
    return {
      status: "error",
      message: "No organisation context found for this account.",
    };
  }

  const { error } = await supabase.from("announcements").insert({
    organization_id: organizationId,
    scope_type: parsed.data.scopeType,
    scope_centre_id:
      parsed.data.scopeType === "centre" ? parsed.data.scopeCentreId : null,
    title: parsed.data.title,
    body: parsed.data.body,
    status: parsed.data.publishNow ? "active" : "draft",
    publish_at: parsed.data.publishNow ? new Date().toISOString() : null,
    expires_at: parsed.data.expiresAt || null,
  });

  if (error) {
    return {
      status: "error",
      message:
        error.code === "42501"
          ? "You do not have permission to post this announcement."
          : "Could not create the announcement.",
    };
  }

  revalidatePath("/admin/announcements");
  revalidatePath("/centre/announcements");
  revalidatePath("/student/announcements");
  return {
    status: "success",
    message: parsed.data.publishNow
      ? "Announcement published."
      : "Saved as a draft.",
  };
}

async function setStatus(
  announcementId: string,
  status: "active" | "retired",
): Promise<AnnouncementActionState> {
  const supabase = await createClient();
  const { error } = await supabase
    .from("announcements")
    .update(
      status === "active"
        ? { status: "active", publish_at: new Date().toISOString() }
        : { status: "retired" },
    )
    .eq("id", announcementId);

  if (error) {
    return {
      status: "error",
      message:
        error.code === "42501"
          ? "You do not have permission to change this announcement."
          : "Could not update the announcement.",
    };
  }

  revalidatePath("/admin/announcements");
  revalidatePath("/centre/announcements");
  revalidatePath("/student/announcements");
  return {
    status: "success",
    message: status === "active" ? "Published." : "Archived.",
  };
}

export async function publishAnnouncement(
  announcementId: string,
  _prev: AnnouncementActionState,
  _formData: FormData,
): Promise<AnnouncementActionState> {
  return setStatus(announcementId, "active");
}

export async function archiveAnnouncement(
  announcementId: string,
  _prev: AnnouncementActionState,
  _formData: FormData,
): Promise<AnnouncementActionState> {
  return setStatus(announcementId, "retired");
}
