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
 * Referrals/commission and support tickets (migrations 0032–0035).
 *
 * The commission half proves the money path end to end: a percentage rule,
 * a qualified referral, the four-step lifecycle, the payout landing in the
 * centre's wallet as a `commission_payout` ledger row, and the clawback
 * reversing it. The ticket half carries proof R17 (internal notes are
 * invisible to the requester at the RLS level, not the UI level) and the
 * 0034 regression: a requester's own reply must never count as the first
 * support response.
 */
describe.skipIf(!hasCredentials)("referrals and tickets", () => {
  let fx: Fixture;
  let hoCli: AnyClient;
  let hoUserId: string;
  let roleId: string;
  let otherStudentCli: AnyClient;
  let codeA: string;
  let codeAId: string;

  beforeAll(async () => {
    fx = await setupFixture();

    // Head-office actor: the Finance Admin / Support Agent the PRD names but
    // the seed never creates (migration 0032's own gap note), assembled here
    // the same way wallet.test.ts builds its finance role.
    const { data: role } = await fx.admin
      .from("roles")
      .insert({
        organization_id: fx.orgId,
        code: `ho_${fx.suffix}`,
        name: "HO ops (test)",
        is_system_role: false,
      })
      .select("id")
      .single();
    roleId = role!.id;
    await fx.admin
      .from("role_permissions")
      .insert(
        [
          "referral.manage",
          "commission.manage",
          "ticket.manage",
          "ticket.internal_note",
        ].map((permission_code) => ({ role_id: roleId, permission_code })),
      );

    const email = `fx-ho-${fx.suffix}@example.test`;
    const { data: created } = await fx.admin.auth.admin.createUser({
      email,
      password: PASSWORD,
      email_confirm: true,
    });
    hoUserId = created!.user!.id;
    fx.userIds.push(hoUserId);
    await fx.admin
      .from("profiles")
      .insert({ id: hoUserId, full_name: "HO ops" });
    await fx.admin.from("memberships").insert({
      user_id: hoUserId,
      organization_id: fx.orgId,
      centre_id: null,
      role_id: roleId,
      status: "active",
    });
    hoCli = createClient(url!, anonKey!);
    await hoCli.auth.signInWithPassword({ email, password: PASSWORD });

    // Portal logins for a student at each centre — create_ticket resolves a
    // student caller through students.user_id, so the link is the identity.
    const mkStudentLogin = async (
      studentId: string,
      tag: string,
    ): Promise<AnyClient> => {
      const studentEmail = `fx-stu-${tag}-${fx.suffix}@example.test`;
      const { data: u } = await fx.admin.auth.admin.createUser({
        email: studentEmail,
        password: PASSWORD,
        email_confirm: true,
      });
      fx.userIds.push(u!.user!.id);
      await fx.admin
        .from("profiles")
        .insert({ id: u!.user!.id, full_name: `Student ${tag}` });
      await fx.admin
        .from("students")
        .update({ user_id: u!.user!.id })
        .eq("id", studentId);
      const cli: AnyClient = createClient(url!, anonKey!);
      await cli.auth.signInWithPassword({
        email: studentEmail,
        password: PASSWORD,
      });
      return cli;
    };

    otherStudentCli = await mkStudentLogin(fx.otherStudent.studentId, "b");
  }, 120_000);

  afterAll(async () => {
    if (!fx) return;
    const centres = [fx.centreId, fx.otherCentreId];

    // Children before parents: entries reference rules AND referrals;
    // referrals reference codes. Ticket messages cascade from tickets.
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
    await fx.admin.from("commission_rules").delete().eq("created_by", hoUserId);
    await fx.admin.from("tickets").delete().in("centre_id", centres);

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

    await fx.admin.from("role_permissions").delete().eq("role_id", roleId);
    await fx.admin.from("memberships").delete().eq("role_id", roleId);
    await fx.admin.from("roles").delete().eq("id", roleId);
    await teardownFixture(fx);
  }, 120_000);

  // Referral codes -----------------------------------------------------------

  it("head office issues a code; the owning centre reads it, others read nothing", async () => {
    const { data, error } = await hoCli.rpc("create_referral_code", {
      p_organization_id: fx.orgId,
      p_owner_type: "centre",
      p_owner_id: fx.centreId,
    });
    expect(error).toBeNull();
    codeA = data as string;
    expect(codeA).toMatch(/^[0-9A-F]{8}$/);

    const { data: row } = await fx.admin
      .from("referral_codes")
      .select("id")
      .eq("code", codeA)
      .single();
    codeAId = row!.id;

    // Matrix: referral.read is Centre Owner only.
    const { data: mine } = await fx.owner.cli
      .from("referral_codes")
      .select("code");
    expect((mine ?? []).map((r: { code: string }) => r.code)).toContain(codeA);

    const { data: theirs } = await fx.counsellor.cli
      .from("referral_codes")
      .select("code");
    expect(theirs ?? []).toHaveLength(0);
  });

  it("a centre cannot issue codes for itself", async () => {
    const { error } = await fx.owner.cli.rpc("create_referral_code", {
      p_organization_id: fx.orgId,
      p_owner_type: "centre",
      p_owner_id: fx.centreId,
    });
    expect(error?.message).toMatch(/not authorised/i);
  });

  // Recording ----------------------------------------------------------------

  it("records a referral once; the same code and entity a second time is refused", async () => {
    const { data: referralId, error } = await hoCli.rpc("record_referral", {
      p_code: codeA,
      p_referred_entity_type: "student",
      p_referred_entity_id: fx.otherStudent.studentId,
    });
    expect(error).toBeNull();
    expect(referralId).toBeTruthy();

    const { error: dup } = await hoCli.rpc("record_referral", {
      p_code: codeA,
      p_referred_entity_type: "student",
      p_referred_entity_id: fx.otherStudent.studentId,
    });
    expect(dup?.message).toMatch(/already been recorded/i);
  });

  it("a centre cannot refer itself", async () => {
    const { error } = await hoCli.rpc("record_referral", {
      p_code: codeA,
      p_referred_entity_type: "centre",
      p_referred_entity_id: fx.centreId,
    });
    expect(error?.message).toMatch(/cannot refer itself/i);
  });

  // Rules and the 0035 grant fix ---------------------------------------------

  it("qualifying without an active rule is refused", async () => {
    const { data: referral } = await fx.admin
      .from("referrals")
      .select("id")
      .eq("referral_code_id", codeAId)
      .single();
    const { error } = await hoCli.rpc("qualify_referral", {
      p_referral_id: referral!.id,
      p_event: "student_admission",
      p_base_amount_paise: 2_000_000,
    });
    expect(error?.message).toMatch(/no active commission rule/i);
  });

  it("0035 — a commission.manage holder inserts a rule directly; a centre cannot", async () => {
    // This exact insert is what the admin "New rule" form does. Before 0035
    // the table privilege was revoked and it failed 42501 for everyone.
    const { error } = await hoCli.from("commission_rules").insert({
      organization_id: fx.orgId,
      event: "student_admission",
      amount_type: "percentage",
      percentage: 10,
      created_by: hoUserId,
    });
    expect(error).toBeNull();

    const { error: denied } = await fx.owner.cli
      .from("commission_rules")
      .insert({
        organization_id: fx.orgId,
        event: "fee_payment",
        amount_type: "flat",
        flat_amount_paise: 50_000,
        created_by: fx.owner.userId,
      });
    expect(denied?.code).toBe("42501");
  });

  // Qualification and the commission lifecycle -------------------------------

  let entryId: string;

  it("qualifies the referral and computes a percentage commission", async () => {
    const { data: referral } = await fx.admin
      .from("referrals")
      .select("id")
      .eq("referral_code_id", codeAId)
      .single();

    const { data, error } = await hoCli.rpc("qualify_referral", {
      p_referral_id: referral!.id,
      p_event: "student_admission",
      p_base_amount_paise: 2_000_000, // ₹20,000 admission
    });
    expect(error).toBeNull();
    entryId = data as string;

    const { data: entry } = await fx.admin
      .from("commission_entries")
      .select("amount_paise, status, beneficiary_type, beneficiary_id")
      .eq("id", entryId)
      .single();
    expect(entry!.amount_paise).toBe(200_000); // 10% of ₹20,000
    expect(entry!.status).toBe("pending");
    expect(entry!.beneficiary_id).toBe(fx.centreId);

    const { data: after } = await fx.admin
      .from("referrals")
      .select("status, qualifying_event")
      .eq("id", referral!.id)
      .single();
    expect(after!.status).toBe("attributed");
    expect(after!.qualifying_event).toBe("student_admission");

    const { error: again } = await hoCli.rpc("qualify_referral", {
      p_referral_id: referral!.id,
      p_event: "student_admission",
      p_base_amount_paise: 2_000_000,
    });
    expect(again?.message).toMatch(/not pending/i);
  });

  it("the lifecycle cannot skip a step", async () => {
    const { error } = await hoCli.rpc("pay_commission", {
      p_commission_entry_id: entryId,
    });
    expect(error?.message).toMatch(/not payable/i);
  });

  it("approve → payable → paid lands in the centre's wallet as commission_payout", async () => {
    const { error: approve } = await hoCli.rpc("approve_commission", {
      p_commission_entry_id: entryId,
    });
    expect(approve).toBeNull();

    const { error: payable } = await hoCli.rpc("mark_commission_payable", {
      p_commission_entry_id: entryId,
    });
    expect(payable).toBeNull();

    const { error: paid } = await hoCli.rpc("pay_commission", {
      p_commission_entry_id: entryId,
    });
    expect(paid).toBeNull();

    const { data: entry } = await fx.admin
      .from("commission_entries")
      .select("status, wallet_entry_seq")
      .eq("id", entryId)
      .single();
    expect(entry!.status).toBe("paid");
    expect(entry!.wallet_entry_seq).not.toBeNull();

    // 0033: the ledger row is a `commission_payout`, not a fake "recharge".
    const { data: ledger } = await fx.admin
      .from("wallet_entries")
      .select("amount_paise, entry_type")
      .eq("entry_seq", entry!.wallet_entry_seq)
      .single();
    expect(ledger!.amount_paise).toBe(200_000);
    expect(ledger!.entry_type).toBe("commission_payout");

    // The beneficiary centre's owner can see their own commission.
    const { data: mine } = await fx.owner.cli
      .from("commission_entries")
      .select("id, status")
      .eq("id", entryId);
    expect(mine).toHaveLength(1);
    expect(mine![0].status).toBe("paid");
  });

  it("reversing a paid commission claws the wallet credit back", async () => {
    const { error: noReason } = await hoCli.rpc("reverse_commission", {
      p_commission_entry_id: entryId,
      p_reason: "  ",
    });
    expect(noReason?.message).toMatch(/reason is required/i);

    const { error } = await hoCli.rpc("reverse_commission", {
      p_commission_entry_id: entryId,
      p_reason: "Admission cancelled inside the refund window",
    });
    expect(error).toBeNull();

    const { data: entry } = await fx.admin
      .from("commission_entries")
      .select("status, reversed_reason")
      .eq("id", entryId)
      .single();
    expect(entry!.status).toBe("reversed");

    // Credit and clawback cancel out: the wallet is back to zero.
    const { data: account } = await fx.admin
      .from("wallet_accounts")
      .select("id")
      .eq("centre_id", fx.centreId)
      .single();
    const { data: entries } = await fx.admin
      .from("wallet_entries")
      .select("amount_paise")
      .eq("account_id", account!.id);
    const balance = (entries ?? []).reduce(
      (sum: number, e: { amount_paise: number }) => sum + e.amount_paise,
      0,
    );
    expect(balance).toBe(0);

    const { error: again } = await hoCli.rpc("reverse_commission", {
      p_commission_entry_id: entryId,
      p_reason: "Twice for good measure",
    });
    expect(again?.message).toMatch(/already reversed/i);
  });

  it("referrals and commission entries only move through their functions", async () => {
    const { error: insertReferral } = await fx.owner.cli
      .from("referrals")
      .insert({
        organization_id: fx.orgId,
        referral_code_id: codeAId,
        referred_entity_type: "lead",
        referred_entity_id: crypto.randomUUID(),
      });
    expect(insertReferral?.code).toBe("42501");

    const { error: editEntry } = await hoCli
      .from("commission_entries")
      .update({ status: "paid" })
      .eq("id", entryId);
    expect(editEntry?.code).toBe("42501");
  });

  // Tickets ------------------------------------------------------------------

  let studentTicketId: string;
  let staffTicketId: string;

  it("a student raises a ticket for their own centre only", async () => {
    const { data, error } = await otherStudentCli.rpc("create_ticket", {
      p_centre_id: fx.otherCentreId,
      p_category: "technical",
      p_priority: "high",
      p_subject: "Cannot open my exam",
      p_body: "The start button does nothing on my laptop.",
    });
    expect(error).toBeNull();
    studentTicketId = data as string;

    const { data: ticket } = await fx.admin
      .from("tickets")
      .select("number, status, requester_type, requester_id")
      .eq("id", studentTicketId)
      .single();
    expect(ticket!.number).toMatch(/^TKT-\d{7}$/);
    expect(ticket!.status).toBe("open");
    expect(ticket!.requester_type).toBe("student");
    expect(ticket!.requester_id).toBe(fx.otherStudent.studentId);

    // The opening message is the first row of the thread.
    const { data: messages } = await otherStudentCli
      .from("ticket_messages")
      .select("body")
      .eq("ticket_id", studentTicketId);
    expect(messages).toHaveLength(1);

    // The same student cannot raise one for a centre that is not theirs.
    const { error: cross } = await otherStudentCli.rpc("create_ticket", {
      p_centre_id: fx.centreId,
      p_category: "general",
      p_priority: "low",
      p_subject: "Wrong centre",
      p_body: "This should be refused.",
    });
    expect(cross?.message).toMatch(/not authorised/i);
  });

  it("0034 — a staff requester's own reply is not a support response", async () => {
    const { data, error } = await fx.owner.cli.rpc("create_ticket", {
      p_centre_id: fx.centreId,
      p_category: "billing",
      p_priority: "medium",
      p_subject: "Wallet statement query",
      p_body: "Which recharge does entry 42 belong to?",
    });
    expect(error).toBeNull();
    staffTicketId = data as string;

    // The owner holds ticket.read at their own centre, which is exactly what
    // used to misclassify this reply as support responding.
    const { error: replyError } = await fx.owner.cli.rpc("add_ticket_message", {
      p_ticket_id: staffTicketId,
      p_body: "Adding context: it was the March payment.",
    });
    expect(replyError).toBeNull();

    const { data: after } = await fx.admin
      .from("tickets")
      .select("status, first_response_at")
      .eq("id", staffTicketId)
      .single();
    expect(after!.status).toBe("open");
    expect(after!.first_response_at).toBeNull();

    // A real support reply flips it and stamps the first response.
    const { error: hoReply } = await hoCli.rpc("add_ticket_message", {
      p_ticket_id: staffTicketId,
      p_body: "It is the recharge dated 3 March.",
    });
    expect(hoReply).toBeNull();

    const { data: responded } = await fx.admin
      .from("tickets")
      .select("status, first_response_at")
      .eq("id", staffTicketId)
      .single();
    expect(responded!.status).toBe("waiting_on_requester");
    expect(responded!.first_response_at).not.toBeNull();

    // And the requester answering support moves it back to the support side.
    const { error: back } = await fx.owner.cli.rpc("add_ticket_message", {
      p_ticket_id: staffTicketId,
      p_body: "That is the one, thanks.",
    });
    expect(back).toBeNull();
    const { data: waiting } = await fx.admin
      .from("tickets")
      .select("status")
      .eq("id", staffTicketId)
      .single();
    expect(waiting!.status).toBe("waiting_on_support");
  });

  it("R17 — internal notes exist for support and nobody else", async () => {
    const { error } = await hoCli.rpc("add_ticket_message", {
      p_ticket_id: studentTicketId,
      p_body:
        "Requester's centre owes two invoices — check before promising credits.",
      p_is_internal: true,
    });
    expect(error).toBeNull();

    // The requester's thread has no trace of it — RLS, not UI filtering.
    const { data: studentView } = await otherStudentCli
      .from("ticket_messages")
      .select("body, is_internal")
      .eq("ticket_id", studentTicketId);
    expect(
      studentView!.every((m: { is_internal: boolean }) => !m.is_internal),
    ).toBe(true);
    expect(studentView).toHaveLength(1);

    // Support sees both halves of the thread.
    const { data: hoView } = await hoCli
      .from("ticket_messages")
      .select("is_internal")
      .eq("ticket_id", studentTicketId);
    expect(hoView).toHaveLength(2);

    // A student cannot write an internal note at all.
    const { error: denied } = await otherStudentCli.rpc("add_ticket_message", {
      p_ticket_id: studentTicketId,
      p_body: "Sneaky internal note",
      p_is_internal: true,
    });
    expect(denied?.message).toMatch(/not authorised/i);
  });

  it("assignment and resolution are head-office acts; reopening belongs to the requester too", async () => {
    const { error: ownerAssign } = await fx.owner.cli.rpc("assign_ticket", {
      p_ticket_id: staffTicketId,
      p_assignee_id: hoUserId,
    });
    expect(ownerAssign?.message).toMatch(/not authorised/i);

    const { error: assign } = await hoCli.rpc("assign_ticket", {
      p_ticket_id: studentTicketId,
      p_assignee_id: hoUserId,
    });
    expect(assign).toBeNull();

    const { error: resolve } = await hoCli.rpc("resolve_ticket", {
      p_ticket_id: studentTicketId,
    });
    expect(resolve).toBeNull();

    // The student disagrees with the resolution — the seventh state.
    const { error: reopen } = await otherStudentCli.rpc("reopen_ticket", {
      p_ticket_id: studentTicketId,
    });
    expect(reopen).toBeNull();
    const { data: reopened } = await fx.admin
      .from("tickets")
      .select("status")
      .eq("id", studentTicketId)
      .single();
    expect(reopened!.status).toBe("reopened");

    const { error: close } = await hoCli.rpc("close_ticket", {
      p_ticket_id: studentTicketId,
    });
    expect(close).toBeNull();
  });

  it("tickets and messages only move through their functions", async () => {
    const { error: insert } = await fx.owner.cli.from("tickets").insert({
      organization_id: fx.orgId,
      centre_id: fx.centreId,
      number: `TKT-FAKE-${fx.suffix}`,
      requester_type: "staff",
      requester_id: fx.owner.userId,
      category: "general",
      subject: "Forged ticket",
    });
    expect(insert?.code).toBe("42501");

    const { error: edit } = await fx.owner.cli
      .from("tickets")
      .update({ status: "resolved" })
      .eq("id", staffTicketId);
    expect(edit?.code).toBe("42501");
  });

  it("centre A's staff see nothing of centre B's tickets", async () => {
    // The student ticket lives at centre B; the accountant works at centre A.
    const { data } = await fx.accountant.cli
      .from("tickets")
      .select("id")
      .eq("id", studentTicketId);
    expect(data ?? []).toHaveLength(0);
  });
});
