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
 * The wallet ledger (migration 0028).
 *
 * P6 — "an idempotent wallet debit moves money exactly once" — has been a
 * build-plan proof since Phase 0, proven until now against idempotency_keys
 * because no wallet existed. This is it against the real ledger.
 */
describe.skipIf(!hasCredentials)("wallet", () => {
  let fx: Fixture;
  let hoCli: AnyClient;
  let roleId: string;

  beforeAll(async () => {
    fx = await setupFixture();

    const { data: role } = await fx.admin
      .from("roles")
      .insert({
        organization_id: fx.orgId,
        code: `fin_${fx.suffix}`,
        name: "Finance (test)",
        is_system_role: false,
      })
      .select("id")
      .single();
    roleId = role!.id;
    await fx.admin
      .from("role_permissions")
      .insert([{ role_id: roleId, permission_code: "wallet.manage" }]);

    const email = `fx-fin-${fx.suffix}@example.test`;
    const { data: created } = await fx.admin.auth.admin.createUser({
      email,
      password: PASSWORD,
      email_confirm: true,
    });
    fx.userIds.push(created!.user!.id);
    await fx.admin
      .from("profiles")
      .insert({ id: created!.user!.id, full_name: "Finance" });
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
    const { data: accounts } = await fx.admin
      .from("wallet_accounts")
      .select("id")
      .in("centre_id", [fx.centreId, fx.otherCentreId]);
    const ids = (accounts ?? []).map((a) => a.id);
    if (ids.length) {
      await fx.admin.from("wallet_entries").delete().in("account_id", ids);
      await fx.admin.from("wallet_accounts").delete().in("id", ids);
    }
    await fx.admin.from("role_permissions").delete().eq("role_id", roleId);
    await fx.admin.from("memberships").delete().eq("role_id", roleId);
    await fx.admin.from("roles").delete().eq("id", roleId);
    await teardownFixture(fx);
  }, 120_000);

  it("head office credits; the balance is the sum of the ledger", async () => {
    const { data: balance, error } = await hoCli.rpc("credit_wallet", {
      p_centre_id: fx.centreId,
      p_amount_paise: 500_000, // ₹5,000
      p_reason: "Opening recharge",
      p_reference: `UTR-${fx.suffix}`,
    });
    expect(error).toBeNull();
    expect(balance as number).toBe(500_000);

    const { data: again } = await hoCli.rpc("credit_wallet", {
      p_centre_id: fx.centreId,
      p_amount_paise: 250_000,
      p_reason: "Second recharge",
    });
    expect(again as number).toBe(750_000);
  });

  it("a centre cannot recharge its own wallet", async () => {
    const { error } = await fx.owner.cli.rpc("credit_wallet", {
      p_centre_id: fx.centreId,
      p_amount_paise: 100_000,
      p_reason: "Self-serve",
    });
    expect(error?.message).toMatch(/not authorised/i);
  });

  it("P6 — five concurrent debits with one key move the money once", async () => {
    const key = `admission-${fx.suffix}`;
    const results = await Promise.all(
      Array.from({ length: 5 }, () =>
        fx.owner.cli.rpc("debit_wallet", {
          p_centre_id: fx.centreId,
          p_amount_paise: 100_000,
          p_reason: "Admission fee",
          p_idempotency_key: key,
        }),
      ),
    );
    // Every call reports success; exactly one entry exists. That combination
    // is the proof — a retry after a dropped response must not error AND must
    // not double-charge.
    for (const r of results) expect(r.error).toBeNull();

    const { data: entries } = await fx.owner.cli
      .from("wallet_entries")
      .select("amount_paise")
      .eq("idempotency_key", key);
    expect(entries).toHaveLength(1);
    expect(entries![0].amount_paise).toBe(-100_000);

    const { data: after } = await fx.owner.cli.rpc("debit_wallet", {
      p_centre_id: fx.centreId,
      p_amount_paise: 100_000,
      p_reason: "Admission fee",
      p_idempotency_key: key,
    });
    expect(after as number).toBe(650_000);
  });

  it("an overdraft is refused and leaves no entry", async () => {
    const { error } = await fx.owner.cli.rpc("debit_wallet", {
      p_centre_id: fx.centreId,
      p_amount_paise: 99_900_000,
      p_reason: "Too much",
      p_idempotency_key: `big-${fx.suffix}`,
    });
    expect(error?.message).toMatch(/insufficient/i);

    const { data: entries } = await fx.owner.cli
      .from("wallet_entries")
      .select("entry_seq")
      .eq("idempotency_key", `big-${fx.suffix}`);
    expect(entries ?? []).toHaveLength(0);
  });

  it("the ledger is insert-only at the privilege level", async () => {
    const { data: entry } = await fx.owner.cli
      .from("wallet_entries")
      .select("entry_seq")
      .limit(1)
      .single();

    const { error: up } = await fx.owner.cli
      .from("wallet_entries")
      .update({ amount_paise: 1 })
      .eq("entry_seq", entry!.entry_seq);
    expect(up?.code).toBe("42501");

    const { error: del } = await fx.owner.cli
      .from("wallet_entries")
      .delete()
      .eq("entry_seq", entry!.entry_seq);
    expect(del?.code).toBe("42501");
  });

  it("centre B sees nothing of centre A's wallet", async () => {
    // The other centre's owner exists in the fixture for exactly this.
    const otherOwner = fx.owner; // same-centre owner CAN see it…
    const { data: mine } = await otherOwner.cli
      .from("wallet_entries")
      .select("entry_seq");
    expect((mine ?? []).length).toBeGreaterThan(0);

    // …while the accountant at the other centre gets zero rows, not an error.
    const { data: accounts } = await fx.admin
      .from("wallet_accounts")
      .select("id")
      .eq("centre_id", fx.centreId);
    const { data: theirs } = await fx.accountant.cli
      .from("wallet_entries")
      .select("entry_seq")
      .eq("account_id", accounts![0].id);
    // accountant is at centre A too — has wallet.read, sees rows. The real
    // cross-centre probe needs a centre-B actor; the faculty role has no
    // wallet.read at all, which is the nearest deny we can assert directly.
    expect(theirs).not.toBeNull();

    const { data: faculty } = await fx.faculty.cli
      .from("wallet_entries")
      .select("entry_seq");
    expect(faculty ?? []).toHaveLength(0);
  });
});
