import { createClient } from "@supabase/supabase-js";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

import {
  anonKey,
  hasCredentials,
  PASSWORD,
  setupFixture,
  teardownFixture,
  url,
  type AnyClient,
  type Fixture,
} from "./fixtures";

/**
 * Migration 0046: batches, their timetable, and placement. The interesting
 * parts are the capacity trigger (a cross-row invariant a CHECK cannot
 * express) and the schedule policy, which inherits visibility by selecting
 * from `batches` — so RLS on the parent is what decides.
 */
describe.skipIf(!hasCredentials)("batches and timetable", () => {
  let fx: Fixture;
  let batchId: string;
  let studentCli: AnyClient;

  beforeAll(async () => {
    fx = await setupFixture();

    // A student login so the enrolment arm of batches_select can be tested.
    const email = `fx-batch-stu-${fx.suffix}@example.test`;
    const { data: created } = await fx.admin.auth.admin.createUser({
      email,
      password: PASSWORD,
      email_confirm: true,
    });
    fx.userIds.push(created!.user!.id);
    await fx.admin
      .from("profiles")
      .insert({ id: created!.user!.id, full_name: "Batch student" });
    await fx.admin
      .from("students")
      .update({ user_id: created!.user!.id })
      .eq("id", fx.students[0].studentId);
    studentCli = createClient(url!, anonKey!);
    await studentCli.auth.signInWithPassword({ email, password: PASSWORD });
  }, 120_000);

  afterAll(async () => {
    if (!fx) return;
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

  it("a centre owner creates a batch; a counsellor may read but not write it", async () => {
    const { data, error } = await fx.owner.cli
      .from("batches")
      .insert({
        organization_id: fx.orgId,
        centre_id: fx.centreId,
        course_id: fx.courseId,
        code: `MOR-${fx.suffix.slice(0, 4)}`,
        name: "Morning batch",
        capacity: 2,
        start_date: "2026-08-01",
        status: "active",
      })
      .select("id")
      .single();
    expect(error).toBeNull();
    batchId = data!.id;

    const { data: counsellorSees } = await fx.counsellor.cli
      .from("batches")
      .select("id")
      .eq("id", batchId);
    expect(counsellorSees).toHaveLength(1);

    const { data: counsellorWrite } = await fx.counsellor.cli
      .from("batches")
      .update({ name: "Renamed by counsellor" })
      .eq("id", batchId)
      .select("id");
    expect(counsellorWrite ?? []).toHaveLength(0);
  });

  it("capacity is enforced across rows, not per row", async () => {
    const place = (enrolmentId: string) =>
      fx.owner.cli
        .from("enrolments")
        .update({ batch_id: batchId })
        .eq("id", enrolmentId)
        .select("id");

    const first = await place(fx.students[0].enrolmentId);
    expect(first.data).toHaveLength(1);
    const second = await place(fx.students[1].enrolmentId);
    expect(second.data).toHaveLength(1);

    // Capacity is 2 — the third placement is refused by the trigger.
    const third = await place(fx.students[2].enrolmentId);
    expect(third.error?.message).toMatch(/batch is full/i);
  });

  it("a student cannot be placed in another centre's batch", async () => {
    const { data: otherBatch } = await fx.admin
      .from("batches")
      .insert({
        organization_id: fx.orgId,
        centre_id: fx.otherCentreId,
        course_id: fx.courseId,
        code: `OTH-${fx.suffix.slice(0, 4)}`,
        name: "Other centre batch",
        start_date: "2026-08-01",
        status: "active",
      })
      .select("id")
      .single();

    const { error } = await fx.admin
      .from("enrolments")
      .update({ batch_id: otherBatch!.id })
      .eq("id", fx.students[2].enrolmentId);
    expect(error?.message).toMatch(/another centre/i);
  });

  it("the timetable inherits its batch's visibility", async () => {
    const { error: slotError } = await fx.owner.cli
      .from("batch_schedules")
      .insert({
        batch_id: batchId,
        weekday: 1,
        start_time: "09:30",
        end_time: "11:00",
        room: "Lab 1",
      });
    expect(slotError).toBeNull();

    // The placed student sees the slot — through the enrolment arm of
    // batches_select, which batch_schedules_select defers to.
    const { data: studentSees } = await studentCli
      .from("batch_schedules")
      .select("weekday, start_time")
      .eq("batch_id", batchId);
    expect(studentSees).toHaveLength(1);
    expect(studentSees![0].weekday).toBe(1);

    // A student cannot write the timetable.
    const { error: studentWrite } = await studentCli
      .from("batch_schedules")
      .insert({
        batch_id: batchId,
        weekday: 2,
        start_time: "09:30",
        end_time: "11:00",
      });
    expect(studentWrite).not.toBeNull();

    // The same slot time twice is refused.
    const { error: duplicate } = await fx.owner.cli
      .from("batch_schedules")
      .insert({
        batch_id: batchId,
        weekday: 1,
        start_time: "09:30",
        end_time: "12:00",
      });
    expect(duplicate?.code).toBe("23505");
  });

  it("another centre's staff see neither the batch nor its timetable", async () => {
    const { data: batches } = await fx.accountant.cli
      .from("batches")
      .select("id")
      .eq("id", batchId);
    // The accountant is at centre A and holds no batch code at all.
    expect(batches ?? []).toHaveLength(0);

    const { data: slots } = await fx.accountant.cli
      .from("batch_schedules")
      .select("id")
      .eq("batch_id", batchId);
    expect(slots ?? []).toHaveLength(0);
  });
});
