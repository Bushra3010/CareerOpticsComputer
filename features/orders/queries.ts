import { createClient } from "@/lib/db/server";
import { formatPaise, type Paise } from "@/lib/money";

/**
 * The order and inventory functions (migration 0031) take an explicit
 * `p_location_id` rather than assuming one, so the schema can grow into
 * multiple warehouses later. Today's academy has exactly one, so the app
 * layer resolves it automatically instead of making every centre pick a
 * warehouse it has never heard of.
 *
 * Picking the location with the most stock on hand, not simply the oldest
 * one, matters the moment a second location exists with nothing received
 * into it yet: "oldest" would send every `pay_order` call to reserve stock
 * at an empty warehouse and fail with "insufficient stock" no matter how
 * much the real one holds. Found live, browser-testing the checkout flow
 * against a database that had accumulated more than one location from
 * earlier test runs — exactly the scenario a second real warehouse would
 * reproduce.
 */
export async function getDefaultLocationId(): Promise<string | null> {
  const supabase = await createClient();
  const { data: locations } = await supabase
    .from("inventory_locations")
    .select("id, created_at")
    .order("created_at", { ascending: true });
  if (!locations || locations.length === 0) return null;
  if (locations.length === 1) return locations[0].id;

  const { data: entries } = await supabase
    .from("inventory_entries")
    .select("location_id, quantity_delta")
    .in(
      "location_id",
      locations.map((l) => l.id),
    );

  const balances = new Map<string, number>();
  for (const e of entries ?? []) {
    balances.set(
      e.location_id,
      (balances.get(e.location_id) ?? 0) + e.quantity_delta,
    );
  }

  let best = locations[0];
  let bestBalance = balances.get(best.id) ?? 0;
  for (const l of locations.slice(1)) {
    const balance = balances.get(l.id) ?? 0;
    if (balance > bestBalance) {
      best = l;
      bestBalance = balance;
    }
  }
  return best.id;
}

export interface OrderListRow {
  id: string;
  orderNumber: string;
  centreName?: string;
  status: string;
  totalLabel: string;
  itemCount: number;
  placedOn: string;
}

export async function listOrdersForCentre(
  centreId: string,
): Promise<OrderListRow[]> {
  const supabase = await createClient();
  const { data: orders } = await supabase
    .from("orders")
    .select("id, order_number, status, total_paise, placed_at")
    .eq("centre_id", centreId)
    .order("placed_at", { ascending: false });

  return countItemsAndFormat(orders ?? []);
}

export async function listOrdersForAdmin(): Promise<OrderListRow[]> {
  const supabase = await createClient();
  const { data: orders } = await supabase
    .from("orders")
    .select("id, order_number, status, total_paise, placed_at, centres(name)")
    .order("placed_at", { ascending: false })
    .limit(200);

  return countItemsAndFormat(
    (orders ?? []) as unknown as {
      id: string;
      order_number: string;
      status: string;
      total_paise: number;
      placed_at: string;
      centres: { name: string } | { name: string }[] | null;
    }[],
  );
}

async function countItemsAndFormat(
  orders: {
    id: string;
    order_number: string;
    status: string;
    total_paise: number;
    placed_at: string;
    centres?: { name: string } | { name: string }[] | null;
  }[],
): Promise<OrderListRow[]> {
  const supabase = await createClient();
  if (orders.length === 0) return [];

  const { data: items } = await supabase
    .from("order_items")
    .select("order_id")
    .in(
      "order_id",
      orders.map((o) => o.id),
    );

  const counts = new Map<string, number>();
  for (const item of items ?? []) {
    counts.set(item.order_id, (counts.get(item.order_id) ?? 0) + 1);
  }

  return orders.map((o) => {
    const centreRel = o.centres;
    const centreName = Array.isArray(centreRel)
      ? centreRel[0]?.name
      : centreRel?.name;
    return {
      id: o.id,
      orderNumber: o.order_number,
      centreName,
      status: o.status,
      totalLabel: formatPaise(o.total_paise as Paise),
      itemCount: counts.get(o.id) ?? 0,
      placedOn: o.placed_at.slice(0, 10),
    };
  });
}

export interface OrderDetail {
  id: string;
  orderNumber: string;
  status: string;
  centreId: string;
  centreName: string;
  subtotalLabel: string;
  taxLabel: string;
  totalLabel: string;
  placedOn: string;
  confirmedOn: string | null;
  dispatchedOn: string | null;
  deliveredOn: string | null;
  cancelledOn: string | null;
  cancelledReason: string | null;
  items: {
    id: string;
    productName: string;
    sku: string;
    quantity: number;
    unitPriceLabel: string;
    lineTotalLabel: string;
  }[];
  shipment: { courier: string; trackingNumber: string | null } | null;
}

export async function getOrderDetail(
  orderId: string,
): Promise<OrderDetail | null> {
  const supabase = await createClient();

  const { data: order } = await supabase
    .from("orders")
    .select(
      "id, order_number, status, centre_id, subtotal_paise, tax_paise, total_paise, placed_at, confirmed_at, dispatched_at, delivered_at, cancelled_at, cancelled_reason, centres(name)",
    )
    .eq("id", orderId)
    .maybeSingle();
  if (!order) return null;

  const [{ data: items }, { data: shipment }] = await Promise.all([
    supabase
      .from("order_items")
      .select(
        "id, product_name_snapshot, sku_snapshot, quantity, unit_price_paise, line_total_paise",
      )
      .eq("order_id", orderId),
    supabase
      .from("shipments")
      .select("courier, tracking_number")
      .eq("order_id", orderId)
      .maybeSingle(),
  ]);

  const centreRel = order.centres as unknown as
    { name: string } | { name: string }[] | null;
  const centreName = Array.isArray(centreRel)
    ? (centreRel[0]?.name ?? "")
    : (centreRel?.name ?? "");

  return {
    id: order.id,
    orderNumber: order.order_number,
    status: order.status,
    centreId: order.centre_id,
    centreName,
    subtotalLabel: formatPaise(order.subtotal_paise as Paise),
    taxLabel: formatPaise(order.tax_paise as Paise),
    totalLabel: formatPaise(order.total_paise as Paise),
    placedOn: order.placed_at.slice(0, 10),
    confirmedOn: order.confirmed_at?.slice(0, 10) ?? null,
    dispatchedOn: order.dispatched_at?.slice(0, 10) ?? null,
    deliveredOn: order.delivered_at?.slice(0, 10) ?? null,
    cancelledOn: order.cancelled_at?.slice(0, 10) ?? null,
    cancelledReason: order.cancelled_reason,
    items: (items ?? []).map((i) => ({
      id: i.id,
      productName: i.product_name_snapshot,
      sku: i.sku_snapshot,
      quantity: i.quantity,
      unitPriceLabel: formatPaise(i.unit_price_paise as Paise),
      lineTotalLabel: formatPaise(i.line_total_paise as Paise),
    })),
    shipment: shipment
      ? { courier: shipment.courier, trackingNumber: shipment.tracking_number }
      : null,
  };
}
