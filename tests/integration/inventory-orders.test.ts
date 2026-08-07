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
 * Inventory, shop and orders (migration 0031) — Phase 5.
 *
 * `product.manage` / `inventory.manage` / `order.dispatch` are organisation-
 * wide by design (PRD §4: Inventory Manager's scope is the whole
 * organisation), which today only a platform admin or an org-wide membership
 * can hold — no such staff role is seeded yet. Rather than flip
 * `is_platform_super_admin` on a throwaway user, this grants a throwaway
 * org-wide role exactly those permissions, the same shape `wallet.test.ts`
 * already uses for `wallet.manage`. `centre_owner` already holds
 * `product.read` / `inventory.read` / `order.create` / `order.read` from the
 * migration's own seeding, so the fixture's `fx.owner` needs nothing extra.
 */
describe.skipIf(!hasCredentials)("inventory, shop and orders", () => {
  let fx: Fixture;
  let hoCli: AnyClient;
  let hoRoleId: string;
  let otherOwnerCli: AnyClient;
  let otherOwnerUserId: string;
  let locationId: string;
  let categoryId: string;
  let productId: string;
  let restrictedProductId: string;

  beforeAll(async () => {
    fx = await setupFixture();

    const { data: role } = await fx.admin
      .from("roles")
      .insert({
        organization_id: fx.orgId,
        code: `ho_inv_${fx.suffix}`,
        name: "Inventory HO (test)",
        is_system_role: false,
      })
      .select("id")
      .single();
    hoRoleId = role!.id;
    await fx.admin
      .from("role_permissions")
      .insert(
        [
          "product.manage",
          "inventory.manage",
          "order.dispatch",
          "wallet.manage",
        ].map((permission_code) => ({ role_id: hoRoleId, permission_code })),
      );

    const hoEmail = `fx-hoinv-${fx.suffix}@example.test`;
    const { data: hoUser } = await fx.admin.auth.admin.createUser({
      email: hoEmail,
      password: PASSWORD,
      email_confirm: true,
    });
    fx.userIds.push(hoUser!.user!.id);
    await fx.admin
      .from("profiles")
      .insert({ id: hoUser!.user!.id, full_name: "HO Inventory" });
    await fx.admin.from("memberships").insert({
      user_id: hoUser!.user!.id,
      organization_id: fx.orgId,
      centre_id: null,
      role_id: hoRoleId,
      status: "active",
    });
    hoCli = createClient(url!, anonKey!);
    await hoCli.auth.signInWithPassword({ email: hoEmail, password: PASSWORD });

    // A second centre's owner, for the RLS cross-centre checks — reusing the
    // real `centre_owner` role (one row per org; membership carries the centre).
    const { data: ownerRole } = await fx.admin
      .from("roles")
      .select("id")
      .eq("organization_id", fx.orgId)
      .eq("code", "centre_owner")
      .single();
    const otherEmail = `fx-otherowner-${fx.suffix}@example.test`;
    const { data: otherUser } = await fx.admin.auth.admin.createUser({
      email: otherEmail,
      password: PASSWORD,
      email_confirm: true,
    });
    otherOwnerUserId = otherUser!.user!.id;
    fx.userIds.push(otherOwnerUserId);
    await fx.admin
      .from("profiles")
      .insert({ id: otherOwnerUserId, full_name: "Other Owner" });
    await fx.admin.from("memberships").insert({
      user_id: otherOwnerUserId,
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

    const { data: loc } = await hoCli
      .from("inventory_locations")
      .insert({
        organization_id: fx.orgId,
        name: `Test Warehouse ${fx.suffix}`,
        type: "warehouse",
      })
      .select("id")
      .single();
    locationId = loc!.id;

    const { data: cat } = await hoCli
      .from("product_categories")
      .insert({
        organization_id: fx.orgId,
        name: `Test Cat ${fx.suffix}`,
        code: `tc-${fx.suffix}`,
      })
      .select("id")
      .single();
    categoryId = cat!.id;

    const { data: prod } = await hoCli
      .from("products")
      .insert({
        organization_id: fx.orgId,
        category_id: categoryId,
        sku: `SKU-${fx.suffix}`,
        name: "Test Notebook",
        price_paise: 5000,
        tax_percent: 5,
        low_stock_threshold: 2,
        status: "active",
      })
      .select("id")
      .single();
    productId = prod!.id;

    const { data: restricted } = await hoCli
      .from("products")
      .insert({
        organization_id: fx.orgId,
        category_id: categoryId,
        sku: `SKU-R-${fx.suffix}`,
        name: "Restricted Item",
        price_paise: 1000,
        is_all_centres: false,
        status: "active",
      })
      .select("id")
      .single();
    restrictedProductId = restricted!.id;

    await hoCli.rpc("receive_stock", {
      p_location_id: locationId,
      p_product_id: productId,
      p_quantity: 10,
      p_reason: "opening_stock",
    });

    await hoCli.rpc("credit_wallet", {
      p_centre_id: fx.centreId,
      p_amount_paise: 1_000_000,
      p_reason: "Test recharge",
    });
  }, 120_000);

  afterAll(async () => {
    if (!fx) return;
    const { data: orders } = await fx.admin
      .from("orders")
      .select("id")
      .in("centre_id", [fx.centreId, fx.otherCentreId]);
    for (const o of orders ?? []) {
      const { data: items } = await fx.admin
        .from("order_items")
        .select("id")
        .eq("order_id", o.id);
      const itemIds = (items ?? []).map((i) => i.id);
      if (itemIds.length) {
        await fx.admin
          .from("shipment_items")
          .delete()
          .in("order_item_id", itemIds);
      }
      await fx.admin.from("shipments").delete().eq("order_id", o.id);
      await fx.admin.from("order_items").delete().eq("order_id", o.id);
    }
    if (orders?.length) {
      await fx.admin
        .from("orders")
        .delete()
        .in(
          "id",
          orders.map((o) => o.id),
        );
    }

    await fx.admin
      .from("inventory_entries")
      .delete()
      .in("product_id", [productId, restrictedProductId]);
    await fx.admin
      .from("product_centre_eligibility")
      .delete()
      .in("product_id", [productId, restrictedProductId]);
    await fx.admin
      .from("products")
      .delete()
      .in("id", [productId, restrictedProductId]);
    await fx.admin.from("product_categories").delete().eq("id", categoryId);
    await fx.admin.from("inventory_locations").delete().eq("id", locationId);

    const { data: accounts } = await fx.admin
      .from("wallet_accounts")
      .select("id")
      .in("centre_id", [fx.centreId, fx.otherCentreId]);
    const acctIds = (accounts ?? []).map((a) => a.id);
    if (acctIds.length) {
      await fx.admin.from("wallet_entries").delete().in("account_id", acctIds);
      await fx.admin.from("wallet_accounts").delete().in("id", acctIds);
    }

    await fx.admin.from("memberships").delete().eq("user_id", otherOwnerUserId);
    await fx.admin.from("role_permissions").delete().eq("role_id", hoRoleId);
    await fx.admin.from("memberships").delete().eq("role_id", hoRoleId);
    await fx.admin.from("roles").delete().eq("id", hoRoleId);
    await teardownFixture(fx);
  }, 120_000);

  it("a centre cannot order a product restricted to other centres", async () => {
    const { error } = await fx.owner.cli.rpc("create_order", {
      p_centre_id: fx.centreId,
      p_items: [{ product_id: restrictedProductId, quantity: 1 }],
    });
    expect(error?.message).toMatch(/not available to your centre/i);
  });

  it("create_order snapshots price and tax; pay_order reserves stock and debits the wallet atomically", async () => {
    const { data: orderId, error: createErr } = await fx.owner.cli.rpc(
      "create_order",
      {
        p_centre_id: fx.centreId,
        p_items: [{ product_id: productId, quantity: 2 }],
      },
    );
    expect(createErr).toBeNull();

    const { data: order } = await fx.admin
      .from("orders")
      .select("subtotal_paise, tax_paise, total_paise, order_number, status")
      .eq("id", orderId as string)
      .single();
    expect(order!.subtotal_paise).toBe(10_000);
    expect(order!.tax_paise).toBe(500);
    expect(order!.total_paise).toBe(10_500);
    expect(order!.status).toBe("pending_payment");
    expect(order!.order_number).toMatch(/^ORD-\d{4}-\d{6}$/);

    const key = `test-pay-${fx.suffix}`;
    const { data: status, error: payErr } = await fx.owner.cli.rpc(
      "pay_order",
      {
        p_order_id: orderId as string,
        p_location_id: locationId,
        p_idempotency_key: key,
      },
    );
    expect(payErr).toBeNull();
    expect(status).toBe("confirmed");

    const { data: stock } = await fx.admin
      .from("inventory_entries")
      .select("balance_after")
      .eq("product_id", productId)
      .order("entry_seq", { ascending: false })
      .limit(1)
      .single();
    expect(stock!.balance_after).toBe(8);

    const { data: account } = await fx.admin
      .from("wallet_accounts")
      .select("id")
      .eq("centre_id", fx.centreId)
      .single();
    const { data: entries } = await fx.admin
      .from("wallet_entries")
      .select("amount_paise")
      .eq("account_id", account!.id);
    const balance = entries!.reduce((n, e) => n + e.amount_paise, 0);
    expect(balance).toBe(1_000_000 - 10_500);

    // Replaying the same idempotency key must not double-charge or
    // double-reserve — the order is already confirmed, so it is a no-op.
    const { data: replay, error: replayErr } = await fx.owner.cli.rpc(
      "pay_order",
      {
        p_order_id: orderId as string,
        p_location_id: locationId,
        p_idempotency_key: key,
      },
    );
    expect(replayErr).toBeNull();
    expect(replay).toBe("confirmed");
    const { data: stockAfterReplay } = await fx.admin
      .from("inventory_entries")
      .select("balance_after")
      .eq("product_id", productId)
      .order("entry_seq", { ascending: false })
      .limit(1)
      .single();
    expect(stockAfterReplay!.balance_after).toBe(8);
  });

  it("pay_order rejects insufficient stock and leaves no partial reservation", async () => {
    const { data: orderId } = await fx.owner.cli.rpc("create_order", {
      p_centre_id: fx.centreId,
      p_items: [{ product_id: productId, quantity: 999 }],
    });

    const { error } = await fx.owner.cli.rpc("pay_order", {
      p_order_id: orderId as string,
      p_location_id: locationId,
      p_idempotency_key: `test-oversell-${fx.suffix}`,
    });
    expect(error?.message).toMatch(/below zero/i);

    const { data: stock } = await fx.admin
      .from("inventory_entries")
      .select("balance_after")
      .eq("product_id", productId)
      .order("entry_seq", { ascending: false })
      .limit(1)
      .single();
    expect(stock!.balance_after).toBe(8);

    const { data: order } = await fx.admin
      .from("orders")
      .select("status")
      .eq("id", orderId as string)
      .single();
    expect(order!.status).toBe("pending_payment");
  });

  it("cancelling a confirmed order reverses the wallet debit and restocks the items", async () => {
    const { data: orderId } = await fx.owner.cli.rpc("create_order", {
      p_centre_id: fx.centreId,
      p_items: [{ product_id: productId, quantity: 1 }],
    });
    await fx.owner.cli.rpc("pay_order", {
      p_order_id: orderId as string,
      p_location_id: locationId,
      p_idempotency_key: `test-cancel-${fx.suffix}`,
    });

    const { data: stockAfterPay } = await fx.admin
      .from("inventory_entries")
      .select("balance_after")
      .eq("product_id", productId)
      .order("entry_seq", { ascending: false })
      .limit(1)
      .single();
    expect(stockAfterPay!.balance_after).toBe(7);

    const { error: cancelErr } = await fx.owner.cli.rpc("cancel_order", {
      p_order_id: orderId as string,
      p_reason: "Integration test: exercising the reversal path",
    });
    expect(cancelErr).toBeNull();

    const { data: stockAfterCancel } = await fx.admin
      .from("inventory_entries")
      .select("balance_after")
      .eq("product_id", productId)
      .order("entry_seq", { ascending: false })
      .limit(1)
      .single();
    expect(stockAfterCancel!.balance_after).toBe(8);

    const { data: account } = await fx.admin
      .from("wallet_accounts")
      .select("id")
      .eq("centre_id", fx.centreId)
      .single();
    const { data: entries } = await fx.admin
      .from("wallet_entries")
      .select("amount_paise, entry_type")
      .eq("account_id", account!.id);
    expect(entries!.some((e) => e.entry_type === "reversal")).toBe(true);
    const balance = entries!.reduce((n, e) => n + e.amount_paise, 0);
    expect(balance).toBe(1_000_000 - 10_500); // back to the balance after the first test's purchase

    const { data: order } = await fx.admin
      .from("orders")
      .select("status")
      .eq("id", orderId as string)
      .single();
    expect(order!.status).toBe("cancelled");
  });

  it("cancelling an unpaid order touches neither stock nor the wallet", async () => {
    const { data: orderId } = await fx.owner.cli.rpc("create_order", {
      p_centre_id: fx.centreId,
      p_items: [{ product_id: productId, quantity: 1 }],
    });
    const { data: stockBefore } = await fx.admin
      .from("inventory_entries")
      .select("balance_after")
      .eq("product_id", productId)
      .order("entry_seq", { ascending: false })
      .limit(1)
      .single();

    const { error } = await fx.owner.cli.rpc("cancel_order", {
      p_order_id: orderId as string,
      p_reason: "Integration test: never paid",
    });
    expect(error).toBeNull();

    const { data: stockAfter } = await fx.admin
      .from("inventory_entries")
      .select("balance_after")
      .eq("product_id", productId)
      .order("entry_seq", { ascending: false })
      .limit(1)
      .single();
    expect(stockAfter!.balance_after).toBe(stockBefore!.balance_after);
  });

  it("dispatch_order requires order.dispatch, which a centre owner does not hold", async () => {
    const { data: orderId } = await fx.owner.cli.rpc("create_order", {
      p_centre_id: fx.centreId,
      p_items: [{ product_id: productId, quantity: 1 }],
    });
    await fx.owner.cli.rpc("pay_order", {
      p_order_id: orderId as string,
      p_location_id: locationId,
      p_idempotency_key: `test-dispatch-${fx.suffix}`,
    });

    const { error: centreDispatchErr } = await fx.owner.cli.rpc(
      "dispatch_order",
      {
        p_order_id: orderId as string,
        p_courier: "Sneaky Courier",
      },
    );
    expect(centreDispatchErr?.message).toMatch(/not authorised/i);

    const { data: shipmentId, error: hoDispatchErr } = await hoCli.rpc(
      "dispatch_order",
      {
        p_order_id: orderId as string,
        p_courier: "Test Courier",
        p_tracking_number: "TRACK-1",
      },
    );
    expect(hoDispatchErr).toBeNull();
    expect(shipmentId).toBeTruthy();

    const { error: deliverErr } = await fx.owner.cli.rpc(
      "mark_order_delivered",
      { p_order_id: orderId as string },
    );
    expect(deliverErr).toBeNull();

    const { data: order } = await fx.admin
      .from("orders")
      .select("status")
      .eq("id", orderId as string)
      .single();
    expect(order!.status).toBe("delivered");
  });

  it("a dispatched order can no longer be cancelled", async () => {
    const { data: orderId } = await fx.owner.cli.rpc("create_order", {
      p_centre_id: fx.centreId,
      p_items: [{ product_id: productId, quantity: 1 }],
    });
    await fx.owner.cli.rpc("pay_order", {
      p_order_id: orderId as string,
      p_location_id: locationId,
      p_idempotency_key: `test-nolatecancel-${fx.suffix}`,
    });
    await hoCli.rpc("dispatch_order", {
      p_order_id: orderId as string,
      p_courier: "Test Courier",
    });

    const { error } = await fx.owner.cli.rpc("cancel_order", {
      p_order_id: orderId as string,
      p_reason: "Integration test: too late to cancel",
    });
    expect(error?.message).toMatch(/already dispatched/i);

    await fx.admin
      .from("shipment_items")
      .delete()
      .in(
        "order_item_id",
        (
          await fx.admin
            .from("order_items")
            .select("id")
            .eq("order_id", orderId as string)
        ).data?.map((r) => r.id) ?? [],
      );
    await fx.admin
      .from("shipments")
      .delete()
      .eq("order_id", orderId as string);
  });

  it("RLS: another centre cannot read, pay, dispatch or cancel this centre's order", async () => {
    const { data: orderId } = await fx.owner.cli.rpc("create_order", {
      p_centre_id: fx.centreId,
      p_items: [{ product_id: productId, quantity: 1 }],
    });

    const { data: read } = await otherOwnerCli
      .from("orders")
      .select("id")
      .eq("id", orderId as string);
    expect(read ?? []).toHaveLength(0);

    const { error: payErr } = await otherOwnerCli.rpc("pay_order", {
      p_order_id: orderId as string,
      p_location_id: locationId,
      p_idempotency_key: `test-hijack-${fx.suffix}`,
    });
    expect(payErr).not.toBeNull();

    const { error: cancelErr } = await otherOwnerCli.rpc("cancel_order", {
      p_order_id: orderId as string,
      p_reason: "Integration test: hijack attempt",
    });
    expect(cancelErr).not.toBeNull();

    await fx.admin
      .from("order_items")
      .delete()
      .eq("order_id", orderId as string);
    await fx.admin
      .from("orders")
      .delete()
      .eq("id", orderId as string);
  });

  it("adjust_stock rejects an overdraw and requires a reason", async () => {
    const { error: noReasonErr } = await hoCli.rpc("adjust_stock", {
      p_location_id: locationId,
      p_product_id: productId,
      p_quantity_delta: -1,
      p_notes: "",
    });
    expect(noReasonErr?.message).toMatch(/reason/i);

    const { error: overdrawErr } = await hoCli.rpc("adjust_stock", {
      p_location_id: locationId,
      p_product_id: productId,
      p_quantity_delta: -999,
      p_notes: "Integration test: overdraw attempt",
    });
    expect(overdrawErr?.message).toMatch(/below zero/i);
  });

  it("the ledgers are insert-only at the privilege level", async () => {
    const { data: entry } = await fx.admin
      .from("inventory_entries")
      .select("entry_seq")
      .eq("product_id", productId)
      .limit(1)
      .single();

    const { error: upErr } = await hoCli
      .from("inventory_entries")
      .update({ notes: "tampered" })
      .eq("entry_seq", entry!.entry_seq);
    expect(upErr?.code).toBe("42501");

    const { error: delErr } = await hoCli
      .from("inventory_entries")
      .delete()
      .eq("entry_seq", entry!.entry_seq);
    expect(delErr?.code).toBe("42501");

    const { data: order } = await fx.admin
      .from("orders")
      .select("id")
      .limit(1)
      .single();
    const { error: orderUpErr } = await fx.owner.cli
      .from("orders")
      .update({ status: "delivered" })
      .eq("id", order!.id);
    expect(orderUpErr?.code).toBe("42501");
  });
});
