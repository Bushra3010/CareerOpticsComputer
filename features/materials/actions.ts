"use server";

import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/db/action";
import { getCurrentCentreContext } from "@/features/centres/current-membership";

import { materialSchema } from "./schema";

export interface MaterialActionState {
  status: "idle" | "error" | "success";
  message?: string;
  fieldErrors?: Record<string, string>;
}

const MAX_BYTES = 50 * 1024 * 1024;

/**
 * A file material is two writes that must agree: the row carries the path
 * the storage policies key on, so the row is inserted first (as a draft
 * with a path that does not exist yet), the file is uploaded to that exact
 * path, and only a successful upload publishes it. A failed upload deletes
 * the row rather than leaving a material pointing at nothing.
 */
export async function createMaterial(
  _prev: MaterialActionState,
  formData: FormData,
): Promise<MaterialActionState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const context = user
    ? await getCurrentCentreContext(supabase, user.id)
    : null;
  if (!context) {
    return { status: "error", message: "You do not have centre access." };
  }

  const parsed = materialSchema.safeParse({
    title: formData.get("title")?.toString() ?? "",
    description: formData.get("description")?.toString() ?? "",
    kind: formData.get("kind")?.toString() ?? "",
    url: formData.get("url")?.toString() ?? "",
    courseId: formData.get("courseId")?.toString() ?? "",
    batchId: formData.get("batchId")?.toString() ?? "",
  });
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const field = String(issue.path[0]);
      if (!fieldErrors[field]) fieldErrors[field] = issue.message;
    }
    return { status: "error", fieldErrors };
  }

  const file = formData.get("file");
  const upload = file instanceof File && file.size > 0 ? file : null;

  if (parsed.data.kind === "file") {
    if (!upload) {
      return { status: "error", fieldErrors: { file: "Choose a file." } };
    }
    if (upload.size > MAX_BYTES) {
      return {
        status: "error",
        fieldErrors: { file: "That file is over 50 MB." },
      };
    }
  }

  const base = {
    organization_id: context.organizationId,
    centre_id: context.centreId,
    course_id: parsed.data.courseId || null,
    batch_id: parsed.data.batchId || null,
    title: parsed.data.title,
    description: parsed.data.description || null,
    created_by: user!.id,
  };

  if (parsed.data.kind === "link") {
    const { error } = await supabase.from("study_materials").insert({
      ...base,
      kind: "link",
      url: parsed.data.url,
    });
    if (error) {
      return {
        status: "error",
        message:
          error.code === "42501"
            ? "You do not have permission to publish materials."
            : "Could not publish the material.",
      };
    }
    revalidatePath("/centre/materials");
    revalidatePath("/student/materials");
    return { status: "success", message: "Material published." };
  }

  const safeName = upload!.name.replace(/[^a-zA-Z0-9._-]/g, "_").slice(-90);

  const { data: row, error: insertError } = await supabase
    .from("study_materials")
    .insert({ ...base, kind: "file", storage_path: "pending", status: "draft" })
    .select("id")
    .single();
  if (insertError || !row) {
    return {
      status: "error",
      message:
        insertError?.code === "42501"
          ? "You do not have permission to publish materials."
          : "Could not publish the material.",
    };
  }

  const path = `${row.id}/${safeName}`;
  const { error: uploadError } = await supabase.storage
    .from("materials-private")
    .upload(path, upload!);
  if (uploadError) {
    await supabase.from("study_materials").delete().eq("id", row.id);
    return {
      status: "error",
      fieldErrors: { file: "Could not upload the file." },
    };
  }

  const { error: publishError } = await supabase
    .from("study_materials")
    .update({ storage_path: path, status: "active" })
    .eq("id", row.id);
  if (publishError) {
    await supabase.storage.from("materials-private").remove([path]);
    await supabase.from("study_materials").delete().eq("id", row.id);
    return { status: "error", message: "Could not publish the material." };
  }

  revalidatePath("/centre/materials");
  revalidatePath("/student/materials");
  return { status: "success", message: "Material published." };
}

export async function setMaterialStatus(
  materialId: string,
  nextStatus: "active" | "retired",
  _prev: MaterialActionState,
  _formData: FormData,
): Promise<MaterialActionState> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("study_materials")
    .update({ status: nextStatus })
    .eq("id", materialId)
    .select("id");

  if (error || !data?.length) {
    return {
      status: "error",
      message: "You do not have permission to change this material.",
    };
  }

  revalidatePath("/centre/materials");
  revalidatePath("/student/materials");
  return { status: "success", message: "Material updated." };
}
