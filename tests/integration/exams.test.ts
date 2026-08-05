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
 * Question banks (migration 0021) — the first Phase 4 slice.
 *
 * The subject of most of this file is one line of SQL:
 *
 *   revoke all on public.question_options from authenticated;
 *   grant select (id, question_id, organization_id, body, display_order) ...
 *
 * Build plan §5.2's proof **R19** is the only column-level requirement in the
 * entire permission matrix, and a row policy cannot express it. These tests
 * exist because a privilege grant is invisible in a schema diff and fails
 * *open* if the column list is ever widened by accident — nothing else in the
 * codebase would notice.
 */
describe.skipIf(!hasCredentials)("question banks", () => {
  let fx: Fixture;
  /** Head-office user: an organisation-level membership, no centre. */
  let hoCli: AnyClient;
  let hoUserId: string;
  let roleId: string;
  let bankId: string;
  let questionId: string;

  beforeAll(async () => {
    fx = await setupFixture();

    const { data: role, error: roleError } = await fx.admin
      .from("roles")
      .insert({
        organization_id: fx.orgId,
        code: `exam_ctrl_${fx.suffix}`,
        name: "Exam Controller (test)",
        is_system_role: false,
      })
      .select("id")
      .single();
    if (roleError || !role) throw new Error(`role: ${roleError?.message}`);
    roleId = role.id;

    await fx.admin.from("role_permissions").insert([
      { role_id: roleId, permission_code: "question.read" },
      { role_id: roleId, permission_code: "question.manage" },
    ]);

    const email = `fx-ho-${fx.suffix}@example.test`;
    const { data: created, error } = await fx.admin.auth.admin.createUser({
      email,
      password: PASSWORD,
      email_confirm: true,
    });
    if (error || !created.user) throw new Error(`ho user: ${error?.message}`);
    hoUserId = created.user.id;
    fx.userIds.push(hoUserId);

    await fx.admin
      .from("profiles")
      .insert({ id: hoUserId, full_name: "Exam Controller" });

    // centre_id null — this is what makes it an organisation-level membership,
    // and after migration 0020 it is the only kind that satisfies an
    // organisation-level permission check.
    await fx.admin.from("memberships").insert({
      user_id: hoUserId,
      organization_id: fx.orgId,
      centre_id: null,
      role_id: roleId,
      status: "active",
    });

    hoCli = createClient(url!, anonKey!);
    const { error: signInError } = await hoCli.auth.signInWithPassword({
      email,
      password: PASSWORD,
    });
    if (signInError) throw new Error(`ho sign-in: ${signInError.message}`);

    const { data: bank, error: bankError } = await fx.admin
      .from("question_banks")
      .insert({
        organization_id: fx.orgId,
        name: `Tally bank ${fx.suffix}`,
        status: "active",
      })
      .select("id")
      .single();
    if (bankError || !bank) throw new Error(`bank: ${bankError?.message}`);
    bankId = bank.id;

    const { data: q, error: qError } = await fx.admin
      .from("questions")
      .insert({
        bank_id: bankId,
        organization_id: fx.orgId,
        type: "single_choice",
        body: "Which key opens the Gateway of Tally?",
        marks: 2,
        negative_marks: 1,
        status: "active",
      })
      .select("id")
      .single();
    if (qError || !q) throw new Error(`question: ${qError?.message}`);
    questionId = q.id;

    await fx.admin.from("question_options").insert([
      {
        question_id: questionId,
        organization_id: fx.orgId,
        body: "Alt+F1",
        is_correct: false,
        display_order: 1,
      },
      {
        question_id: questionId,
        organization_id: fx.orgId,
        body: "F11",
        is_correct: true,
        display_order: 2,
      },
      {
        question_id: questionId,
        organization_id: fx.orgId,
        body: "Ctrl+Q",
        is_correct: false,
        display_order: 3,
      },
    ]);
  }, 120_000);

  afterAll(async () => {
    if (!fx) return;
    await fx.admin.from("question_banks").delete().eq("id", bankId);
    await fx.admin.from("role_permissions").delete().eq("role_id", roleId);
    await fx.admin.from("memberships").delete().eq("role_id", roleId);
    await fx.admin.from("roles").delete().eq("id", roleId);
    await teardownFixture(fx);
  }, 120_000);

  it("R19 — is_correct cannot be selected, by anyone, ever", async () => {
    // Not "returns null" and not "returns false" — the request itself is
    // refused, because the column is not in the grant. 42501 is the privilege
    // error; PostgREST surfaces it rather than quietly dropping the column.
    const { data, error } = await hoCli
      .from("question_options")
      .select("id, body, is_correct")
      .eq("question_id", questionId);

    expect(data).toBeNull();
    expect(error).not.toBeNull();
    expect(error?.code).toBe("42501");
  });

  it("the paper is still readable without the key", async () => {
    const { data, error } = await hoCli
      .from("question_options")
      .select("id, body, display_order")
      .eq("question_id", questionId)
      .order("display_order");

    expect(error).toBeNull();
    expect(data?.map((o) => o.body)).toEqual(["Alt+F1", "F11", "Ctrl+Q"]);
  });

  it("`select *` fails rather than leaking — name your columns", async () => {
    const { error } = await hoCli
      .from("question_options")
      .select("*")
      .eq("question_id", questionId);

    expect(error?.code).toBe("42501");
  });

  it("the answer key is reachable, but only through the function", async () => {
    const { data, error } = await hoCli.rpc("question_answer_key", {
      p_question_id: questionId,
    });

    expect(error).toBeNull();
    expect(data).toHaveLength(1);

    const { data: options } = await hoCli
      .from("question_options")
      .select("id, body")
      .eq("question_id", questionId);
    const correct = options?.find(
      (o) => o.id === (data as { option_id: string }[])[0].option_id,
    );
    expect(correct?.body).toBe("F11");
  });

  it("a centre-scoped user cannot read the bank at all", async () => {
    // The bank is organisation-scoped, so its policy asks the
    // organisation-level question. Before migration 0020 the centre owner
    // would have passed it — `centre is null` short-circuited the predicate.
    const { data: banks } = await fx.owner.cli
      .from("question_banks")
      .select("id");
    expect(banks ?? []).toHaveLength(0);

    const { data: questions } = await fx.owner.cli
      .from("questions")
      .select("id");
    expect(questions ?? []).toHaveLength(0);
  });

  it("a centre-scoped user cannot read the answer key either", async () => {
    const { error } = await fx.owner.cli.rpc("question_answer_key", {
      p_question_id: questionId,
    });
    expect(error).not.toBeNull();
  });

  it("options cannot be written directly, only through the function", async () => {
    const { error } = await hoCli.from("question_options").insert({
      question_id: questionId,
      organization_id: fx.orgId,
      body: "Injected",
      display_order: 9,
    });
    expect(error?.code).toBe("42501");
  });

  it("a single-choice question refuses two correct answers", async () => {
    const { error } = await hoCli.rpc("save_question_options", {
      p_question_id: questionId,
      p_options: [
        { body: "One", is_correct: true },
        { body: "Two", is_correct: true },
      ],
    });
    expect(error?.message).toMatch(/only one correct option/i);
  });

  it("a choice question refuses having no correct answer", async () => {
    const { error } = await hoCli.rpc("save_question_options", {
      p_question_id: questionId,
      p_options: [
        { body: "One", is_correct: false },
        { body: "Two", is_correct: false },
      ],
    });
    expect(error?.message).toMatch(/at least one option must be correct/i);
  });

  it("a valid set replaces the previous one atomically", async () => {
    const { data, error } = await hoCli.rpc("save_question_options", {
      p_question_id: questionId,
      p_options: [
        { body: "Gateway", is_correct: true },
        { body: "Ledger", is_correct: false },
      ],
    });
    expect(error).toBeNull();
    expect(data).toBe(2);

    const { data: options } = await hoCli
      .from("question_options")
      .select("body, display_order")
      .eq("question_id", questionId)
      .order("display_order");
    expect(options?.map((o) => o.body)).toEqual(["Gateway", "Ledger"]);
  });

  it("a question cannot be moved into another organisation's bank", async () => {
    // The composite foreign key (bank_id, organization_id) is what makes the
    // denormalised organization_id trustworthy. Without it the column would be
    // a copy the application had to remember to keep true.
    const { error } = await fx.admin.from("questions").insert({
      bank_id: bankId,
      organization_id: crypto.randomUUID(),
      type: "true_false",
      body: "Smuggled",
    });
    expect(error?.code).toBe("23503");
  });
});
