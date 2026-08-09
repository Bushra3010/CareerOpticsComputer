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
 * Migrations 0039–0040: the seeded head-office roles do the jobs the matrix
 * gives them, using the REAL seeded roles rather than test-built ones — the
 * earlier suites deliberately assembled their own roles, which proves the
 * permission codes but not the seeds.
 */
describe.skipIf(!hasCredentials)("seeded head-office roles", () => {
  let fx: Fixture;
  let supportCli: AnyClient;
  let supportUserId: string;
  let financeCli: AnyClient;
  let operatorCli: AnyClient;
  const memberIds: string[] = [];

  const mkHoActor = async (
    roleCode: string,
  ): Promise<{ cli: AnyClient; userId: string }> => {
    const { data: role } = await fx.admin
      .from("roles")
      .select("id")
      .eq("organization_id", fx.orgId)
      .eq("code", roleCode)
      .single();
    const email = `fx-${roleCode}-${fx.suffix}@example.test`;
    const { data: created } = await fx.admin.auth.admin.createUser({
      email,
      password: PASSWORD,
      email_confirm: true,
    });
    const userId = created!.user!.id as string;
    fx.userIds.push(userId);
    await fx.admin
      .from("profiles")
      .insert({ id: userId, full_name: `Seeded ${roleCode}` });
    const { data: membership } = await fx.admin
      .from("memberships")
      .insert({
        user_id: userId,
        organization_id: fx.orgId,
        centre_id: null,
        role_id: role!.id,
        status: "active",
      })
      .select("id")
      .single();
    memberIds.push(membership!.id);
    const cli: AnyClient = createClient(url!, anonKey!);
    await cli.auth.signInWithPassword({ email, password: PASSWORD });
    return { cli, userId };
  };

  beforeAll(async () => {
    fx = await setupFixture();
    const support = await mkHoActor("support_agent");
    supportCli = support.cli;
    supportUserId = support.userId;
    financeCli = (await mkHoActor("finance_admin")).cli;
    operatorCli = (await mkHoActor("ho_operator")).cli;
  }, 120_000);

  afterAll(async () => {
    if (!fx) return;
    await fx.admin.from("tickets").delete().in("centre_id", [fx.centreId]);
    if (memberIds.length) {
      await fx.admin.from("memberships").delete().in("id", memberIds);
    }
    await teardownFixture(fx);
  }, 120_000);

  it("a support agent runs the ticket lifecycle and reads the whole thread", async () => {
    const { data: ticketId } = await fx.owner.cli.rpc("create_ticket", {
      p_centre_id: fx.centreId,
      p_category: "general",
      p_priority: "low",
      p_subject: "Seeded-role check",
      p_body: "Does the seeded support agent see this?",
    });

    const { error: assign } = await supportCli.rpc("assign_ticket", {
      p_ticket_id: ticketId,
      p_assignee_id: supportUserId,
    });
    expect(assign).toBeNull();

    const { error: note } = await supportCli.rpc("add_ticket_message", {
      p_ticket_id: ticketId,
      p_body: "Internal: seeded role writing a note.",
      p_is_internal: true,
    });
    expect(note).toBeNull();

    // 0036's fix, now exercised by a REAL support agent: public messages
    // and internal notes both visible.
    const { data: thread } = await supportCli
      .from("ticket_messages")
      .select("is_internal")
      .eq("ticket_id", ticketId);
    expect(thread).toHaveLength(2);

    const { error: resolve } = await supportCli.rpc("resolve_ticket", {
      p_ticket_id: ticketId,
    });
    expect(resolve).toBeNull();
  });

  it("a finance admin pays a commission without wallet.manage being a surprise", async () => {
    // The 0033 regression, re-proven with the seeded role: finance_admin
    // holds commission.manage AND wallet.manage per the matrix, but the
    // payout path must work through app.credit_wallet_for_commission
    // regardless.
    const { data: code } = await financeCli.rpc("create_referral_code", {
      p_organization_id: fx.orgId,
      p_owner_type: "centre",
      p_owner_id: fx.centreId,
    });
    expect(code).toBeTruthy();

    await financeCli.from("commission_rules").insert({
      organization_id: fx.orgId,
      event: "centre_approval",
      amount_type: "flat",
      flat_amount_paise: 100_000,
    });

    const { data: referralId } = await financeCli.rpc("record_referral", {
      p_code: code,
      p_referred_entity_type: "centre",
      p_referred_entity_id: fx.otherCentreId,
    });
    const { data: entryId, error: qualifyError } = await financeCli.rpc(
      "qualify_referral",
      {
        p_referral_id: referralId,
        p_event: "centre_approval",
      },
    );
    expect(qualifyError).toBeNull();

    await financeCli.rpc("approve_commission", {
      p_commission_entry_id: entryId,
    });
    await financeCli.rpc("mark_commission_payable", {
      p_commission_entry_id: entryId,
    });
    const { error: pay } = await financeCli.rpc("pay_commission", {
      p_commission_entry_id: entryId,
    });
    expect(pay).toBeNull();

    // Clean up the money so teardown's wallet sweep has a closed loop.
    await financeCli.rpc("reverse_commission", {
      p_commission_entry_id: entryId,
      p_reason: "Test loop closed — seeded-role payout proven",
    });
  });

  it("an HO operator lists the head-office roster (0040) but cannot manage tickets", async () => {
    const { data: members } = await operatorCli
      .from("memberships")
      .select("user_id")
      .is("centre_id", null)
      .eq("status", "active");
    expect((members ?? []).length).toBeGreaterThanOrEqual(3);

    const ids = (members ?? []).map((m: { user_id: string }) => m.user_id);
    const { data: profiles } = await operatorCli
      .from("profiles")
      .select("id, full_name")
      .in("id", ids);
    // user.read now opens exactly the org's own people's names.
    expect((profiles ?? []).length).toBeGreaterThanOrEqual(3);

    const { data: ticket } = await fx.owner.cli.rpc("create_ticket", {
      p_centre_id: fx.centreId,
      p_category: "general",
      p_priority: "low",
      p_subject: "Operator boundary check",
      p_body: "Operators read, they do not manage.",
    });
    const { error: denied } = await operatorCli.rpc("resolve_ticket", {
      p_ticket_id: ticket,
    });
    expect(denied?.message).toMatch(/not authorised/i);
  });

  it("a support agent still cannot read student PII lists", async () => {
    // Matrix says "read (masked)" and masking does not exist, so the seed
    // deliberately grants nothing — zero rows, not an error.
    const { data } = await supportCli.from("students").select("id");
    expect(data ?? []).toHaveLength(0);
  });

  afterAll(async () => {
    if (!fx) return;
    // Referral chain cleanup mirrors referrals-tickets.test.ts.
    const centres = [fx.centreId, fx.otherCentreId];
    await fx.admin
      .from("commission_entries")
      .delete()
      .in("beneficiary_id", centres);
    const { data: codes } = await fx.admin
      .from("referral_codes")
      .select("id")
      .in("owner_id", centres);
    const codeIds = (codes ?? []).map((c: { id: string }) => c.id);
    if (codeIds.length) {
      await fx.admin.from("referrals").delete().in("referral_code_id", codeIds);
      await fx.admin.from("referral_codes").delete().in("id", codeIds);
    }
    await fx.admin
      .from("commission_rules")
      .delete()
      .eq("organization_id", fx.orgId)
      .eq("event", "centre_approval")
      .eq("flat_amount_paise", 100_000);
    const { data: accounts } = await fx.admin
      .from("wallet_accounts")
      .select("id")
      .in("centre_id", centres);
    const accountIds = (accounts ?? []).map((a: { id: string }) => a.id);
    if (accountIds.length) {
      await fx.admin
        .from("wallet_entries")
        .delete()
        .in("account_id", accountIds);
      await fx.admin.from("wallet_accounts").delete().in("id", accountIds);
    }
  }, 120_000);
});
