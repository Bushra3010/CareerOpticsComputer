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
 * Notifications (migration 0037): the trigger wiring, the RLS "own rows
 * only" boundary for both recipient kinds, and the read-marking functions.
 */
describe.skipIf(!hasCredentials)("notifications", () => {
  let fx: Fixture;
  let hoCli: AnyClient;
  let hoUserId: string;
  let roleId: string;
  let studentCli: AnyClient;
  let ticketId: string;

  beforeAll(async () => {
    fx = await setupFixture();

    const { data: role } = await fx.admin
      .from("roles")
      .insert({
        organization_id: fx.orgId,
        code: `notif_ho_${fx.suffix}`,
        name: "HO ops (test)",
        is_system_role: false,
      })
      .select("id")
      .single();
    roleId = role!.id;
    await fx.admin
      .from("role_permissions")
      .insert([{ role_id: roleId, permission_code: "ticket.manage" }]);

    const email = `fx-notif-ho-${fx.suffix}@example.test`;
    const { data: created } = await fx.admin.auth.admin.createUser({
      email,
      password: PASSWORD,
      email_confirm: true,
    });
    hoUserId = created!.user!.id;
    fx.userIds.push(hoUserId);
    await fx.admin
      .from("profiles")
      .insert({ id: hoUserId, full_name: "HO notif" });
    await fx.admin.from("memberships").insert({
      user_id: hoUserId,
      organization_id: fx.orgId,
      centre_id: null,
      role_id: roleId,
      status: "active",
    });
    hoCli = createClient(url!, anonKey!);
    await hoCli.auth.signInWithPassword({ email, password: PASSWORD });

    // A student login at the main centre, for the student-recipient half.
    const studentEmail = `fx-notif-stu-${fx.suffix}@example.test`;
    const { data: stuUser } = await fx.admin.auth.admin.createUser({
      email: studentEmail,
      password: PASSWORD,
      email_confirm: true,
    });
    fx.userIds.push(stuUser!.user!.id);
    await fx.admin
      .from("profiles")
      .insert({ id: stuUser!.user!.id, full_name: "Student notif" });
    await fx.admin
      .from("students")
      .update({ user_id: stuUser!.user!.id })
      .eq("id", fx.students[0].studentId);
    studentCli = createClient(url!, anonKey!);
    await studentCli.auth.signInWithPassword({
      email: studentEmail,
      password: PASSWORD,
    });
  }, 120_000);

  afterAll(async () => {
    if (!fx) return;
    const centres = [fx.centreId, fx.otherCentreId];
    await fx.admin
      .from("notifications")
      .delete()
      .eq("organization_id", fx.orgId);
    await fx.admin.from("tickets").delete().in("centre_id", centres);
    await fx.admin.from("role_permissions").delete().eq("role_id", roleId);
    await fx.admin.from("memberships").delete().eq("role_id", roleId);
    await fx.admin.from("roles").delete().eq("id", roleId);
    await teardownFixture(fx);
  }, 120_000);

  it("a support reply notifies the student requester; the requester's own reply notifies the assignee", async () => {
    const { data, error } = await studentCli.rpc("create_ticket", {
      p_centre_id: fx.centreId,
      p_category: "technical",
      p_priority: "medium",
      p_subject: "Screen goes blank",
      p_body: "Happens on every exam page.",
    });
    expect(error).toBeNull();
    ticketId = data as string;

    // Creation inserts the opening message — from the requester, with no
    // assignee yet, so nobody is notified. That silence is deliberate.
    //
    // Scoped to THIS ticket's own href rather than the whole organisation:
    // `fx.orgId` is the one real seeded org every integration test file
    // shares, and `npm run test:integration` runs files concurrently, so an
    // org-wide count is affected by whatever other suite happens to be
    // moving an order or replying on a ticket at the same moment. Found by
    // a real, reproducible failure under the full combined run despite this
    // file passing in isolation — a href-scoped filter cannot see another
    // ticket's notifications no matter what else is running.
    const { data: none } = await fx.admin
      .from("notifications")
      .select("id")
      .eq("organization_id", fx.orgId)
      .or(
        `href.eq./admin/tickets/${ticketId},href.eq./student/support/${ticketId},href.eq./centre/support/${ticketId}`,
      );
    expect(none ?? []).toHaveLength(0);

    // Support replies → the student hears.
    await hoCli.rpc("add_ticket_message", {
      p_ticket_id: ticketId,
      p_body: "Which browser are you using?",
    });

    const { data: studentSees } = await studentCli
      .from("notifications")
      .select("type, title, href, read_at");
    expect(studentSees).toHaveLength(1);
    expect(studentSees![0].type).toBe("ticket_reply");
    expect(studentSees![0].href).toBe(`/student/support/${ticketId}`);
    expect(studentSees![0].read_at).toBeNull();

    // Assign to the HO user, which itself notifies the assignee…
    await hoCli.rpc("assign_ticket", {
      p_ticket_id: ticketId,
      p_assignee_id: hoUserId,
    });
    // …then the student replies → the assignee hears about the reply too.
    await studentCli.rpc("add_ticket_message", {
      p_ticket_id: ticketId,
      p_body: "Chrome, latest.",
    });

    const { data: hoSees } = await hoCli
      .from("notifications")
      .select("type")
      .order("created_at");
    const types = (hoSees ?? []).map((n: { type: string }) => n.type);
    expect(types).toContain("ticket_assigned");
    expect(types).toContain("ticket_reply");
  });

  it("an internal note notifies nobody", async () => {
    const before = await fx.admin
      .from("notifications")
      .select("id", { count: "exact", head: true })
      .eq("organization_id", fx.orgId);

    await hoCli.rpc("add_ticket_message", {
      p_ticket_id: ticketId,
      p_body: "Internal: known Chrome bug, fix shipping.",
      p_is_internal: true,
    });

    const after = await fx.admin
      .from("notifications")
      .select("id", { count: "exact", head: true })
      .eq("organization_id", fx.orgId);
    // The internal note itself adds nothing; the count moved only by the
    // status-flip side effects of earlier public replies (which is zero here).
    expect(after.count).toBe(before.count);
  });

  it("notifications are private to their recipient", async () => {
    // The centre owner is neither the requester nor the assignee: zero rows,
    // not an error — even though they can read the ticket itself.
    const { data: ownerSees } = await fx.owner.cli
      .from("notifications")
      .select("id");
    expect(ownerSees ?? []).toHaveLength(0);
  });

  it("marking read is self-scoped; someone else's id is a silent no-op", async () => {
    const { data: mine } = await studentCli
      .from("notifications")
      .select("id")
      .is("read_at", null);
    expect(mine!.length).toBeGreaterThan(0);
    const target = mine![0].id;

    // The owner tries to mark the student's notification read — no error,
    // and nothing changes.
    await fx.owner.cli.rpc("mark_notification_read", {
      p_notification_id: target,
    });
    const { data: still } = await fx.admin
      .from("notifications")
      .select("read_at")
      .eq("id", target)
      .single();
    expect(still!.read_at).toBeNull();

    await studentCli.rpc("mark_notification_read", {
      p_notification_id: target,
    });
    const { data: now } = await fx.admin
      .from("notifications")
      .select("read_at")
      .eq("id", target)
      .single();
    expect(now!.read_at).not.toBeNull();

    await studentCli.rpc("mark_all_notifications_read", {});
    const { data: unread } = await studentCli
      .from("notifications")
      .select("id")
      .is("read_at", null);
    expect(unread ?? []).toHaveLength(0);
  });

  it("direct writes are revoked at the privilege level", async () => {
    const { error: ins } = await hoCli.from("notifications").insert({
      organization_id: fx.orgId,
      recipient_user_id: hoUserId,
      type: "forged",
      title: "Forged",
    });
    expect(ins?.code).toBe("42501");

    const { data: any } = await hoCli
      .from("notifications")
      .select("id")
      .limit(1);
    if ((any ?? []).length) {
      const { error: upd } = await hoCli
        .from("notifications")
        .update({ title: "Edited" })
        .eq("id", any![0].id);
      expect(upd?.code).toBe("42501");
    }
  });
});
