import { createClient } from "@supabase/supabase-js";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

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
 * Migration 0048: study materials. The whole design is scope — centre,
 * course and batch narrowings that a student must match on every axis that
 * is set — so that is what this proves, from both directions.
 */
describe.skipIf(!hasCredentials)("study materials", () => {
  let fx: Fixture;
  let studentCli: AnyClient;
  let batchId: string;
  let otherBatchId: string;
  const ids: Record<string, string> = {};

  beforeAll(async () => {
    fx = await setupFixture();

    // Two batches at the main centre; the student is placed in the first.
    const mkBatch = async (code: string) => {
      const { data } = await fx.admin
        .from("batches")
        .insert({
          organization_id: fx.orgId,
          centre_id: fx.centreId,
          course_id: fx.courseId,
          code: `${code}-${fx.suffix.slice(0, 4)}`,
          name: `Batch ${code}`,
          start_date: "2026-08-01",
          status: "active",
        })
        .select("id")
        .single();
      return data!.id as string;
    };
    batchId = await mkBatch("A");
    otherBatchId = await mkBatch("B");

    await fx.admin
      .from("enrolments")
      .update({ batch_id: batchId })
      .eq("id", fx.students[0].enrolmentId);

    const email = `fx-mat-stu-${fx.suffix}@example.test`;
    const { data: created } = await fx.admin.auth.admin.createUser({
      email,
      password: PASSWORD,
      email_confirm: true,
    });
    fx.userIds.push(created!.user!.id);
    await fx.admin
      .from("profiles")
      .insert({ id: created!.user!.id, full_name: "Materials student" });
    await fx.admin
      .from("students")
      .update({ user_id: created!.user!.id })
      .eq("id", fx.students[0].studentId);
    studentCli = createClient(url!, anonKey!);
    await signIn(studentCli, email, "sign-in");

    const mk = async (
      key: string,
      patch: Record<string, unknown>,
    ): Promise<void> => {
      const { data, error } = await fx.admin
        .from("study_materials")
        .insert({
          organization_id: fx.orgId,
          title: `Material ${key}`,
          kind: "link",
          url: "https://example.test/notes",
          ...patch,
        })
        .select("id")
        .single();
      if (error) throw new Error(`${key}: ${error.message}`);
      ids[key] = data!.id;
    };

    await mk("orgWide", {});
    await mk("centreWide", { centre_id: fx.centreId });
    await mk("thisCourse", { centre_id: fx.centreId, course_id: fx.courseId });
    await mk("otherCourse", {
      centre_id: fx.centreId,
      course_id: fx.otherCourseId,
    });
    await mk("thisBatch", { centre_id: fx.centreId, batch_id: batchId });
    await mk("otherBatch", { centre_id: fx.centreId, batch_id: otherBatchId });
    await mk("otherCentre", { centre_id: fx.otherCentreId });
    await mk("retired", { centre_id: fx.centreId, status: "retired" });
  }, 120_000);

  afterAll(async () => {
    if (!fx) return;
    await fx.admin
      .from("study_materials")
      .delete()
      .eq("organization_id", fx.orgId);
    await fx.admin
      .from("enrolments")
      .update({ batch_id: null })
      .in("centre_id", [fx.centreId, fx.otherCentreId]);
    await fx.admin
      .from("batches")
      .delete()
      .in("centre_id", [fx.centreId, fx.otherCentreId]);
    await teardownFixture(fx);
  }, 120_000);

  it("a student sees exactly the materials whose every set narrowing matches", async () => {
    const { data } = await studentCli.from("study_materials").select("id");
    const seen = new Set((data ?? []).map((m: { id: string }) => m.id));

    expect(seen.has(ids.orgWide)).toBe(true);
    expect(seen.has(ids.centreWide)).toBe(true);
    expect(seen.has(ids.thisCourse)).toBe(true);
    expect(seen.has(ids.thisBatch)).toBe(true);

    // Narrowed past this student on one axis each.
    expect(seen.has(ids.otherCourse)).toBe(false);
    expect(seen.has(ids.otherBatch)).toBe(false);
    expect(seen.has(ids.otherCentre)).toBe(false);
    // Withdrawn is invisible to students but not to staff.
    expect(seen.has(ids.retired)).toBe(false);
  });

  it("a withdrawn material stays visible to the centre that owns it", async () => {
    const { data } = await fx.owner.cli
      .from("study_materials")
      .select("id")
      .eq("id", ids.retired);
    expect(data).toHaveLength(1);
  });

  it("a centre cannot publish to the whole organisation or to another centre", async () => {
    const { error: orgWide } = await fx.owner.cli
      .from("study_materials")
      .insert({
        organization_id: fx.orgId,
        title: "Sneaky org-wide",
        kind: "link",
        url: "https://example.test/x",
      });
    expect(orgWide?.code).toBe("42501");

    const { error: crossCentre } = await fx.owner.cli
      .from("study_materials")
      .insert({
        organization_id: fx.orgId,
        centre_id: fx.otherCentreId,
        title: "Sneaky cross-centre",
        kind: "link",
        url: "https://example.test/x",
      });
    expect(crossCentre?.code).toBe("42501");
  });

  it("faculty may publish for their centre; a student may not publish at all", async () => {
    const { data: byFaculty, error: facultyError } = await fx.faculty.cli
      .from("study_materials")
      .insert({
        organization_id: fx.orgId,
        centre_id: fx.centreId,
        title: "Faculty notes",
        kind: "link",
        url: "https://example.test/faculty",
      })
      .select("id")
      .single();
    expect(facultyError).toBeNull();
    expect(byFaculty?.id).toBeTruthy();

    const { error: byStudent } = await studentCli
      .from("study_materials")
      .insert({
        organization_id: fx.orgId,
        centre_id: fx.centreId,
        title: "Student upload",
        kind: "link",
        url: "https://example.test/nope",
      });
    expect(byStudent?.code).toBe("42501");
  });

  it("a file material's bytes follow the same scope as its row", async () => {
    const { data: row } = await fx.admin
      .from("study_materials")
      .insert({
        organization_id: fx.orgId,
        centre_id: fx.centreId,
        batch_id: otherBatchId,
        title: "Other batch handout",
        kind: "file",
        storage_path: "pending",
        status: "active",
      })
      .select("id")
      .single();
    ids.otherBatchFile = row!.id;

    const path = `${row!.id}/handout.txt`;
    const blob = new Blob(["lecture notes"], { type: "text/plain" });

    // The centre's own staff may write it…
    const { error: upload } = await fx.owner.cli.storage
      .from("materials-private")
      .upload(path, blob);
    expect(upload).toBeNull();
    await fx.admin
      .from("study_materials")
      .update({ storage_path: path })
      .eq("id", row!.id);

    // …and read it back.
    const { data: staffSigned } = await fx.owner.cli.storage
      .from("materials-private")
      .createSignedUrl(path, 60);
    expect(staffSigned?.signedUrl).toBeTruthy();

    // The student is in the OTHER batch, so the bytes are refused even
    // though they know the path.
    const { data: studentSigned } = await studentCli.storage
      .from("materials-private")
      .createSignedUrl(path, 60);
    expect(studentSigned?.signedUrl).toBeFalsy();

    await fx.owner.cli.storage.from("materials-private").remove([path]);
  });
});
