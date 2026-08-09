import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { createClient } from "@supabase/supabase-js";

import {
  anonKey,
  hasCredentials,
  PASSWORD,
  signIn,
  setupFixture,
  teardownFixture,
  url,
  type AnyClient,
  type Fixture,
} from "./fixtures";

/**
 * Private student files (migration 0019).
 *
 * The interesting surface here is not the table — it is `storage.objects`,
 * where the only thing RLS has to work with is the object path. These tests
 * exist because that is easy to get subtly wrong: a path is a string the
 * client chooses, so "centre A cannot read centre B" has to hold even when
 * centre A asks for centre B's exact path.
 */
const BUCKET = "student-private";

// Smallest valid PNG: a 1x1 transparent pixel. Real bytes, so the bucket's
// MIME and size limits are exercised rather than bypassed by an empty blob.
const PNG_BASE64 =
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==";

function pngFile(name = "photo.png"): File {
  const bytes = Uint8Array.from(atob(PNG_BASE64), (c) => c.charCodeAt(0));
  return new File([bytes], name, { type: "image/png" });
}

function objectPath(centreId: string, studentId: string): string {
  return `${centreId}/${studentId}/${crypto.randomUUID()}.png`;
}

describe.skipIf(!hasCredentials)("private student files", () => {
  let fx: Fixture;
  let studentCli: AnyClient;
  let studentUserId: string;

  beforeAll(async () => {
    fx = await setupFixture();

    // The fixture has no student login — `app.current_student_id()` resolves
    // through students.user_id, so a student actor has to be linked by hand.
    const email = `fx-portal-${fx.suffix}@example.test`;
    const { data: created, error } = await fx.admin.auth.admin.createUser({
      email,
      password: PASSWORD,
      email_confirm: true,
    });
    if (error || !created.user)
      throw new Error(`student user: ${error?.message}`);
    studentUserId = created.user.id;
    fx.userIds.push(studentUserId);

    await fx.admin
      .from("students")
      .update({ user_id: studentUserId })
      .eq("id", fx.students[0].studentId);

    studentCli = createClient(url!, anonKey!);
    await signIn(studentCli, email, "student sign-in");
  }, 90_000);

  afterAll(async () => {
    if (fx) await teardownFixture(fx);
  }, 90_000);

  it("a counsellor uploads a photograph and it is readable back", async () => {
    const { studentId } = fx.students[0];
    const path = objectPath(fx.centreId, studentId);

    const { error: uploadError } = await fx.counsellor.cli.storage
      .from(BUCKET)
      .upload(path, pngFile(), { contentType: "image/png" });
    expect(uploadError).toBeNull();

    const { error: rowError } = await fx.counsellor.cli
      .from("student_documents")
      .insert({
        organization_id: fx.orgId,
        centre_id: fx.centreId,
        student_id: studentId,
        kind: "photo",
        storage_path: path,
        original_name: "photo.png",
        mime_type: "image/png",
        size_bytes: 68,
        uploaded_by: fx.counsellor.userId,
      });
    expect(rowError).toBeNull();

    const { data: signed } = await fx.counsellor.cli.storage
      .from(BUCKET)
      .createSignedUrl(path, 60);
    expect(signed?.signedUrl).toBeTruthy();
  });

  it("a second photograph for the same student is refused", async () => {
    const { studentId } = fx.students[0];
    const { error } = await fx.counsellor.cli.from("student_documents").insert({
      organization_id: fx.orgId,
      centre_id: fx.centreId,
      student_id: studentId,
      kind: "photo",
      storage_path: objectPath(fx.centreId, studentId),
      original_name: "second.png",
      mime_type: "image/png",
      size_bytes: 68,
    });

    // 23505: the partial unique index. Two photographs would make "which face
    // goes on the certificate?" ambiguous, so replacing is the only route.
    expect(error?.code).toBe("23505");
  });

  it("faculty may read a document but may not add one", async () => {
    const { studentId } = fx.students[0];

    const { data: visible } = await fx.faculty.cli
      .from("student_documents")
      .select("id")
      .eq("student_id", studentId);
    expect(visible?.length).toBe(1);

    const { error } = await fx.faculty.cli.from("student_documents").insert({
      organization_id: fx.orgId,
      centre_id: fx.centreId,
      student_id: studentId,
      kind: "id_proof",
      storage_path: objectPath(fx.centreId, studentId),
      original_name: "aadhaar.pdf",
      mime_type: "application/pdf",
      size_bytes: 1024,
    });
    expect(error?.code).toBe("42501");
  });

  it("a centre cannot write into another centre's folder", async () => {
    const path = objectPath(fx.otherCentreId, fx.otherStudent.studentId);

    const { error } = await fx.owner.cli.storage
      .from(BUCKET)
      .upload(path, pngFile(), { contentType: "image/png" });

    expect(error).not.toBeNull();
  });

  it("a centre cannot read another centre's file even knowing the exact path", async () => {
    const path = objectPath(fx.otherCentreId, fx.otherStudent.studentId);

    // Planted by the service role, so the object certainly exists — the only
    // thing standing between centre A and it is the storage policy.
    const { error: plantError } = await fx.admin.storage
      .from(BUCKET)
      .upload(path, pngFile(), { contentType: "image/png" });
    expect(plantError).toBeNull();

    const { data: signed, error } = await fx.owner.cli.storage
      .from(BUCKET)
      .createSignedUrl(path, 60);

    expect(signed?.signedUrl).toBeFalsy();
    expect(error).not.toBeNull();

    const { data: download } = await fx.owner.cli.storage
      .from(BUCKET)
      .download(path);
    expect(download).toBeNull();
  });

  it("a student reads their own documents and no one else's", async () => {
    const { data: own } = await studentCli
      .from("student_documents")
      .select("id, student_id");

    expect(own?.length).toBe(1);
    expect(own?.[0].student_id).toBe(fx.students[0].studentId);
  });

  it("a student cannot upload their own photograph", async () => {
    const { studentId } = fx.students[0];

    // The path is the student's own folder — the point is that self-service
    // upload is refused regardless, because a certificate photograph has to
    // come from the centre that verified the identity.
    const { error: fileError } = await studentCli.storage
      .from(BUCKET)
      .upload(objectPath(fx.centreId, studentId), pngFile(), {
        contentType: "image/png",
      });
    expect(fileError).not.toBeNull();

    const { error: rowError } = await studentCli
      .from("student_documents")
      .insert({
        organization_id: fx.orgId,
        centre_id: fx.centreId,
        student_id: studentId,
        kind: "photo",
        storage_path: objectPath(fx.centreId, studentId),
        original_name: "selfie.png",
        mime_type: "image/png",
        size_bytes: 68,
      });
    expect(rowError?.code).toBe("42501");
  });

  it("the bucket is private, so a bare object URL returns nothing", async () => {
    const { studentId } = fx.students[0];
    const { data } = await fx.counsellor.cli
      .from("student_documents")
      .select("storage_path")
      .eq("student_id", studentId)
      .single();

    const response = await fetch(
      `${url}/storage/v1/object/public/${BUCKET}/${data!.storage_path}`,
    );
    expect(response.ok).toBe(false);
  });
});
