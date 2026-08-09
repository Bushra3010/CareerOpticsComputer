import { afterAll, beforeAll, describe, expect, it } from "vitest";

import {
  hasCredentials,
  setupFixture,
  teardownFixture,
  type Fixture,
} from "./fixtures";

/**
 * Migration 0045: the cash-box ledger — who writes, that nothing updates,
 * and that corrections must mirror their original exactly.
 */
describe.skipIf(!hasCredentials)("income and expenses", () => {
  let fx: Fixture;
  let entryId: string;

  beforeAll(async () => {
    fx = await setupFixture();
  }, 120_000);

  afterAll(async () => {
    if (!fx) return;
    await fx.admin
      .from("expense_entries")
      .delete()
      .in("centre_id", [fx.centreId, fx.otherCentreId]);
    await teardownFixture(fx);
  }, 120_000);

  it("the accountant records entries; faculty cannot", async () => {
    const { data, error } = await fx.accountant.cli
      .from("expense_entries")
      .insert({
        organization_id: fx.orgId,
        centre_id: fx.centreId,
        entry_type: "expense",
        category: "Rent",
        amount_paise: 1_500_000,
        note: "August rent",
      })
      .select("id")
      .single();
    expect(error).toBeNull();
    entryId = data!.id;

    const { error: facultyDenied } = await fx.faculty.cli
      .from("expense_entries")
      .insert({
        organization_id: fx.orgId,
        centre_id: fx.centreId,
        entry_type: "income",
        category: "Printing income",
        amount_paise: 5_000,
      });
    expect(facultyDenied?.code).toBe("42501");
  });

  it("the ledger cannot be edited or deleted, only reversed", async () => {
    const { error: upd } = await fx.accountant.cli
      .from("expense_entries")
      .update({ amount_paise: 1 })
      .eq("id", entryId);
    expect(upd?.code).toBe("42501");

    const { error: del } = await fx.accountant.cli
      .from("expense_entries")
      .delete()
      .eq("id", entryId);
    expect(del?.code).toBe("42501");
  });

  it("a reversal must mirror the original; a correct one lands once", async () => {
    // Wrong amount → the trigger refuses.
    const { error: wrongAmount } = await fx.accountant.cli
      .from("expense_entries")
      .insert({
        organization_id: fx.orgId,
        centre_id: fx.centreId,
        entry_type: "income",
        category: "Rent",
        amount_paise: 1,
        note: "Trying a partial reversal",
        reverses_entry_id: entryId,
      });
    expect(wrongAmount?.message).toMatch(/mirror the original/i);

    // Same type → refused.
    const { error: sameType } = await fx.accountant.cli
      .from("expense_entries")
      .insert({
        organization_id: fx.orgId,
        centre_id: fx.centreId,
        entry_type: "expense",
        category: "Rent",
        amount_paise: 1_500_000,
        note: "Same-type reversal",
        reverses_entry_id: entryId,
      });
    expect(sameType?.message).toMatch(/mirror the original/i);

    // The mirror lands.
    const { data: reversal, error } = await fx.accountant.cli
      .from("expense_entries")
      .insert({
        organization_id: fx.orgId,
        centre_id: fx.centreId,
        entry_type: "income",
        category: "Rent",
        amount_paise: 1_500_000,
        note: "Recorded against the wrong month",
        reverses_entry_id: entryId,
      })
      .select("id")
      .single();
    expect(error).toBeNull();

    // Double reversal → unique index refuses.
    const { error: double } = await fx.accountant.cli
      .from("expense_entries")
      .insert({
        organization_id: fx.orgId,
        centre_id: fx.centreId,
        entry_type: "income",
        category: "Rent",
        amount_paise: 1_500_000,
        note: "Reversing again",
        reverses_entry_id: entryId,
      });
    expect(double?.code).toBe("23505");

    // Reversing the reversal → trigger refuses.
    const { error: rereverse } = await fx.accountant.cli
      .from("expense_entries")
      .insert({
        organization_id: fx.orgId,
        centre_id: fx.centreId,
        entry_type: "expense",
        category: "Rent",
        amount_paise: 1_500_000,
        note: "Reversal of a reversal",
        reverses_entry_id: reversal!.id,
      });
    expect(rereverse?.message).toMatch(/cannot itself be reversed/i);
  });

  it("another centre's ledger is invisible and unwritable", async () => {
    const { data: crossRead } = await fx.accountant.cli
      .from("expense_entries")
      .select("id")
      .eq("centre_id", fx.otherCentreId);
    expect(crossRead ?? []).toHaveLength(0);

    const { error: crossWrite } = await fx.accountant.cli
      .from("expense_entries")
      .insert({
        organization_id: fx.orgId,
        centre_id: fx.otherCentreId,
        entry_type: "expense",
        category: "Sneaky",
        amount_paise: 100,
      });
    expect(crossWrite?.code).toBe("42501");
  });
});
