import { createClient } from "@supabase/supabase-js";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

import {
  PASSWORD,
  hasCredentials,
  signIn,
  setupFixture,
  teardownFixture,
  url,
  anonKey,
  type AnyClient,
  type Fixture,
} from "./fixtures";

/**
 * Migration 0029 — a real privilege-escalation bug, reproduced live before it
 * was fixed: `centres_update` let anyone holding `centre.update` at a centre
 * write ANY column, status included, so a suspended centre's own owner could
 * clear the suspension themselves. The first test here is that exact exploit,
 * kept as a permanent regression guard rather than trusted to stay fixed.
 */
describe.skipIf(!hasCredentials)("centre lifecycle", () => {
  let fx: Fixture;
  let hoCli: AnyClient;
  let roleId: string;

  beforeAll(async () => {
    fx = await setupFixture();

    const { data: role } = await fx.admin
      .from("roles")
      .insert({
        organization_id: fx.orgId,
        code: `centre_mgr_ho_${fx.suffix}`,
        name: "Centre lifecycle (test)",
        is_system_role: false,
      })
      .select("id")
      .single();
    roleId = role!.id;
    await fx.admin
      .from("role_permissions")
      .insert({ role_id: roleId, permission_code: "centre.manage" });

    const email = `fx-clm-${fx.suffix}@example.test`;
    const { data: created } = await fx.admin.auth.admin.createUser({
      email,
      password: PASSWORD,
      email_confirm: true,
    });
    fx.userIds.push(created!.user!.id);
    await fx.admin
      .from("profiles")
      .insert({ id: created!.user!.id, full_name: "Centre Lifecycle" });
    await fx.admin.from("memberships").insert({
      user_id: created!.user!.id,
      organization_id: fx.orgId,
      centre_id: null,
      role_id: roleId,
      status: "active",
    });

    hoCli = createClient(url!, anonKey!);
    await signIn(hoCli, email, "sign-in");
  }, 120_000);

  afterAll(async () => {
    if (!fx) return;
    await fx.admin
      .from("centres")
      .update({ status: "active" })
      .eq("id", fx.centreId);
    await fx.admin.from("role_permissions").delete().eq("role_id", roleId);
    await fx.admin.from("memberships").delete().eq("role_id", roleId);
    await fx.admin.from("roles").delete().eq("id", roleId);
    await teardownFixture(fx);
  }, 120_000);

  it("a suspended centre's own owner cannot reactivate it — the exploit this migration closed", async () => {
    await fx.admin
      .from("centres")
      .update({ status: "suspended" })
      .eq("id", fx.centreId);

    const { data, error } = await fx.owner.cli
      .from("centres")
      .update({ status: "active" })
      .eq("id", fx.centreId)
      .select("status");

    // 42501 (privilege denied) if RLS still evaluated it; otherwise PostgREST
    // returns zero rows changed because the column is not in the grant at
    // all. Either shape is a pass; what fails this test is the status having
    // actually moved.
    expect(error?.code === "42501" || (data ?? []).length === 0).toBe(true);

    const { data: after } = await fx.admin
      .from("centres")
      .select("status")
      .eq("id", fx.centreId)
      .single();
    expect(after!.status).toBe("suspended");
  });

  it("a centre owner can still edit their own centre's profile", async () => {
    const { error } = await fx.owner.cli
      .from("centres")
      .update({ address: "42 Regression Test Lane" })
      .eq("id", fx.centreId);
    expect(error).toBeNull();

    const { data } = await fx.admin
      .from("centres")
      .select("address")
      .eq("id", fx.centreId)
      .single();
    expect(data!.address).toBe("42 Regression Test Lane");
  });

  it("only head office can call set_centre_status, and only with a reason", async () => {
    const { error: notHo } = await fx.owner.cli.rpc("set_centre_status", {
      p_centre_id: fx.centreId,
      p_status: "active",
      p_reason: "self-service",
    });
    expect(notHo?.message).toMatch(/not authorised/i);

    const { error: noReason } = await hoCli.rpc("set_centre_status", {
      p_centre_id: fx.centreId,
      p_status: "active",
      p_reason: "",
    });
    expect(noReason?.message).toMatch(/reason is required/i);

    const { error: legit } = await hoCli.rpc("set_centre_status", {
      p_centre_id: fx.centreId,
      p_status: "active",
      p_reason: "Dues cleared",
    });
    expect(legit).toBeNull();

    const { data: after } = await fx.admin
      .from("centres")
      .select("status")
      .eq("id", fx.centreId)
      .single();
    expect(after!.status).toBe("active");
  });

  it("setting the same status again is refused rather than a silent no-op", async () => {
    const { error } = await hoCli.rpc("set_centre_status", {
      p_centre_id: fx.centreId,
      p_status: "active",
      p_reason: "redundant",
    });
    expect(error?.message).toMatch(/already active/i);
  });
});
