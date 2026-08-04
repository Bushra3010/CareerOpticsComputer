"use server";

import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/db/action";
import { authorize } from "@/lib/permissions";
import {
  ALLOWED_MIME,
  MAX_BYTES,
  STUDENT_BUCKET,
  studentObjectPath,
} from "@/lib/storage";
import { getCurrentCentreContext } from "@/features/centres/current-membership";

export interface UploadState {
  status: "idle" | "error" | "success";
  message?: string;
}

/**
 * Uploads a student photograph or identity document.
 *
 * The upload runs as the signed-in user, not the service role, so the storage
 * policies in 0019 apply — a centre cannot write into another centre's folder
 * even though it controls the path string. The metadata row is written after
 * the object lands, and the object is removed again if that insert fails, so
 * the bucket does not accumulate files nothing points at.
 */
export async function uploadStudentDocument(
  studentId: string,
  _prev: UploadState,
  formData: FormData,
): Promise<UploadState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { status: "error", message: "You must be signed in." };

  const context = await getCurrentCentreContext(supabase, user.id);
  if (!context)
    return { status: "error", message: "No active centre membership found." };

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
      message: "You do not have permission to upload documents.",
    };
  }

  const kindRaw = formData.get("kind")?.toString() ?? "";
  if (!["photo", "id_proof", "other"].includes(kindRaw)) {
    return { status: "error", message: "Choose what this document is." };
  }
  const kind = kindRaw as "photo" | "id_proof" | "other";

  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) {
    return { status: "error", message: "Choose a file to upload." };
  }
  if (file.size > MAX_BYTES) {
    return { status: "error", message: "That file is larger than 5 MB." };
  }
  if (!(ALLOWED_MIME as readonly string[]).includes(file.type)) {
    return { status: "error", message: "Upload a JPEG, PNG, WebP or PDF." };
  }

  // The bound studentId is client-controllable, so re-read it scoped to the
  // caller's own centre before building a path out of it.
  const { data: student } = await supabase
    .from("students")
    .select("id")
    .eq("id", studentId)
    .eq("centre_id", context.centreId)
    .maybeSingle();
  if (!student) {
    return { status: "error", message: "Student not found at your centre." };
  }

  // A photograph replaces rather than accumulates — the unique index enforces
  // that, and the old object has to go with it or it is orphaned in the bucket.
  let previousPath: string | null = null;
  if (kind === "photo") {
    const { data: existing } = await supabase
      .from("student_documents")
      .select("id, storage_path")
      .eq("student_id", studentId)
      .eq("kind", "photo")
      .maybeSingle();
    previousPath = existing?.storage_path ?? null;
  }

  const path = studentObjectPath(context.centreId, studentId, file.type);

  const { error: uploadError } = await supabase.storage
    .from(STUDENT_BUCKET)
    .upload(path, file, { contentType: file.type, upsert: false });

  if (uploadError) {
    return {
      status: "error",
      message: "Could not upload the file. Please try again.",
    };
  }

  if (previousPath) {
    await supabase
      .from("student_documents")
      .delete()
      .eq("storage_path", previousPath);
    await supabase.storage.from(STUDENT_BUCKET).remove([previousPath]);
  }

  const { error: rowError } = await supabase.from("student_documents").insert({
    organization_id: context.organizationId,
    centre_id: context.centreId,
    student_id: studentId,
    kind,
    storage_path: path,
    original_name: file.name.slice(0, 200),
    mime_type: file.type,
    size_bytes: file.size,
    uploaded_by: user.id,
  });

  if (rowError) {
    // Leaving the object behind would mean a file nobody can find or delete.
    await supabase.storage.from(STUDENT_BUCKET).remove([path]);
    return {
      status: "error",
      message: "Could not record the document. Please try again.",
    };
  }

  revalidatePath(`/centre/students/${studentId}`);
  return { status: "success", message: "Uploaded." };
}
