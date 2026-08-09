import { createClient } from "@supabase/supabase-js";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

import {
  PASSWORD,
  anonKey,
  hasCredentials,
  setupFixture,
  teardownFixture,
  url,
  type AnyClient,
  type Fixture,
} from "./fixtures";

/**
 * Announcements (migration 0042) — the last unbuilt bullet in Phase 5.
 * Uses the real seeded `ho_operator` role (migration 0039) and the
 * fixture's real `centre_owner`, rather than a purpose-built test role, the
 * same reasoning `ho-roles.test.ts` gives for testing the actual seeds.
 */
describe.skipIf(!hasCredentials)("announcements", () => {
  let fx: Fixture;
  let hoCli: AnyClient;
  let hoUserId: string;
  let studentCli: AnyClient;
  let otherOwnerCli: AnyClient;
  const announcementIds: string[] = [];

  beforeAll(async () => {
    fx = await setupFixture();

    const { data: hoRole } = await fx.admin
      .from("roles")
      .select("id")
      .eq("organization_id", fx.orgId)
      .eq("code", "ho_operator")
      .single();
    const hoEmail = `fx-annho-${fx.suffix}@example.test`;
    const { data: hoUser } = await fx.admin.auth.admin.createUser({
      email: hoEmail,
      password: PASSWORD,
      email_confirm: true,
    });
    hoUserId = hoUser!.user!.id;
    fx.userIds.push(hoUserId);
    await fx.admin
      .from("profiles")
      .insert({ id: hoUserId, full_name: "HO Announce" });
    await fx.admin.from("memberships").insert({
      user_id: hoUserId,
      organization_id: fx.orgId,
      centre_id: null,
      role_id: hoRole!.id,
      status: "active",
    });
    hoCli = createClient(url!, anonKey!);
    await hoCli.auth.signInWithPassword({ email: hoEmail, password: PASSWORD });

    const studentEmail = `fx-annstu-${fx.suffix}@example.test`;
    const { data: stuUser } = await fx.admin.auth.admin.createUser({
      email: studentEmail,
      password: PASSWORD,
      email_confirm: true,
    });
    fx.userIds.push(stuUser!.user!.id);
    await fx.admin
      .from("profiles")
      .insert({ id: stuUser!.user!.id, full_name: "Announce Student" });
    await fx.admin
      .from("students")
      .update({ user_id: stuUser!.user!.id })
      .eq("id", fx.students[0].studentId);
    studentCli = createClient(url!, anonKey!);
    await studentCli.auth.signInWithPassword({
      email: studentEmail,
      password: PASSWORD,
    });

    // A second centre's owner, reusing the real `centre_owner` role (one row
    // per org; the membership carries the centre) — the same pattern
    // inventory-orders.test.ts uses for its cross-centre RLS proof.
    const { data: ownerRole } = await fx.admin
      .from("roles")
      .select("id")
      .eq("organization_id", fx.orgId)
      .eq("code", "centre_owner")
      .single();
    const otherEmail = `fx-annother-${fx.suffix}@example.test`;
    const { data: otherUser } = await fx.admin.auth.admin.createUser({
      email: otherEmail,
      password: PASSWORD,
      email_confirm: true,
    });
    fx.userIds.push(otherUser!.user!.id);
    await fx.admin
      .from("profiles")
      .insert({ id: otherUser!.user!.id, full_name: "Other Owner" });
    await fx.admin.from("memberships").insert({
      user_id: otherUser!.user!.id,
      organization_id: fx.orgId,
      centre_id: fx.otherCentreId,
      role_id: ownerRole!.id,
      status: "active",
    });
    otherOwnerCli = createClient(url!, anonKey!);
    await otherOwnerCli.auth.signInWithPassword({
      email: otherEmail,
      password: PASSWORD,
    });
  }, 120_000);

  afterAll(async () => {
    if (!fx) return;
    if (announcementIds.length) {
      await fx.admin.from("announcements").delete().in("id", announcementIds);
    }
    await teardownFixture(fx);
  }, 120_000);

  it("head office posts an organisation-wide announcement everyone reads", async () => {
    const { data: created, error } = await hoCli
      .from("announcements")
      .insert({
        organization_id: fx.orgId,
        scope_type: "organization",
        title: "Org-wide notice",
        body: "Everyone reads this.",
        status: "active",
      })
      .select("id")
      .single();
    expect(error).toBeNull();
    announcementIds.push(created!.id);

    const { data: ownerSees } = await fx.owner.cli
      .from("announcements")
      .select("id")
      .eq("id", created!.id);
    expect(ownerSees).toHaveLength(1);
    const { data: studentSees } = await studentCli
      .from("announcements")
      .select("id")
      .eq("id", created!.id);
    expect(studentSees).toHaveLength(1);
  });

  it("a centre owner cannot post an organisation-wide announcement", async () => {
    const { error } = await fx.owner.cli.from("announcements").insert({
      organization_id: fx.orgId,
      scope_type: "organization",
      title: "Sneaky org notice",
      body: "x",
      status: "active",
    });
    expect(error?.code).toBe("42501");
  });

  it("a centre owner posts a centre-scoped announcement visible only to their own centre", async () => {
    const { data: created, error } = await fx.owner.cli
      .from("announcements")
      .insert({
        organization_id: fx.orgId,
        scope_type: "centre",
        scope_centre_id: fx.centreId,
        title: "Centre-only notice",
        body: "Just for us.",
        status: "active",
      })
      .select("id")
      .single();
    expect(error).toBeNull();
    announcementIds.push(created!.id);

    const { data: studentSees } = await studentCli
      .from("announcements")
      .select("id")
      .eq("id", created!.id);
    expect(studentSees).toHaveLength(1);

    const { error: crossCentreErr } = await fx.owner.cli
      .from("announcements")
      .insert({
        organization_id: fx.orgId,
        scope_type: "centre",
        scope_centre_id: fx.otherCentreId,
        title: "Cross-centre attempt",
        body: "x",
        status: "active",
      });
    expect(crossCentreErr?.code).toBe("42501");
  });

  it("a draft is invisible to a student but visible to its own manager", async () => {
    const { data: draft } = await hoCli
      .from("announcements")
      .insert({
        organization_id: fx.orgId,
        scope_type: "organization",
        title: "Draft notice",
        body: "not yet",
        status: "draft",
      })
      .select("id")
      .single();
    announcementIds.push(draft!.id);

    const { data: studentSees } = await studentCli
      .from("announcements")
      .select("id")
      .eq("id", draft!.id);
    expect(studentSees ?? []).toHaveLength(0);
    const { data: hoSees } = await hoCli
      .from("announcements")
      .select("id")
      .eq("id", draft!.id);
    expect(hoSees).toHaveLength(1);
  });

  it("an expired or not-yet-published announcement is invisible to a reader", async () => {
    const { data: expired } = await hoCli
      .from("announcements")
      .insert({
        organization_id: fx.orgId,
        scope_type: "organization",
        title: "Expired notice",
        body: "old",
        status: "active",
        publish_at: new Date(Date.now() - 100_000).toISOString(),
        expires_at: new Date(Date.now() - 50_000).toISOString(),
      })
      .select("id")
      .single();
    announcementIds.push(expired!.id);

    const { data: future } = await hoCli
      .from("announcements")
      .insert({
        organization_id: fx.orgId,
        scope_type: "organization",
        title: "Future notice",
        body: "not yet",
        status: "active",
        publish_at: new Date(Date.now() + 100_000).toISOString(),
      })
      .select("id")
      .single();
    announcementIds.push(future!.id);

    const { data: studentSeesExpired } = await studentCli
      .from("announcements")
      .select("id")
      .eq("id", expired!.id);
    expect(studentSeesExpired ?? []).toHaveLength(0);
    const { data: studentSeesFuture } = await studentCli
      .from("announcements")
      .select("id")
      .eq("id", future!.id);
    expect(studentSeesFuture ?? []).toHaveLength(0);
  });

  it("centre B's owner never sees centre A's scoped announcement, nor can they create one for centre A", async () => {
    const { data: created } = await fx.owner.cli
      .from("announcements")
      .insert({
        organization_id: fx.orgId,
        scope_type: "centre",
        scope_centre_id: fx.centreId,
        title: "Centre A private notice",
        body: "x",
        status: "active",
      })
      .select("id")
      .single();
    announcementIds.push(created!.id);

    const { data: otherOwnerReads } = await otherOwnerCli
      .from("announcements")
      .select("id")
      .eq("id", created!.id);
    expect(otherOwnerReads ?? []).toHaveLength(0);

    const { error: forgeErr } = await otherOwnerCli
      .from("announcements")
      .insert({
        organization_id: fx.orgId,
        scope_type: "centre",
        scope_centre_id: fx.centreId,
        title: "Forged on behalf of centre A",
        body: "x",
        status: "active",
      });
    expect(forgeErr?.code).toBe("42501");
  });
});
