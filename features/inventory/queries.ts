import { createClient } from "@/lib/db/server";
import { formatPaise, type Paise } from "@/lib/money";

export interface CategoryOption {
  id: string;
  name: string;
  code: string;
  status: "draft" | "active" | "retired";
}

export async function listProductCategories(): Promise<CategoryOption[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("product_categories")
    .select("id, name, code, status")
    .order("name");
  return data ?? [];
}

interface StockByProduct {
  balances: Map<string, number>;
}

async function loadStockBalances(
  supabase: Awaited<ReturnType<typeof createClient>>,
  productIds: string[],
): Promise<StockByProduct> {
  const balances = new Map<string, number>();
  if (productIds.length === 0) return { balances };

  const { data } = await supabase
    .from("inventory_entries")
    .select("product_id, quantity_delta")
    .in("product_id", productIds);

  for (const row of data ?? []) {
    balances.set(
      row.product_id,
      (balances.get(row.product_id) ?? 0) + row.quantity_delta,
    );
  }
  return { balances };
}

export interface AdminProductRow {
  id: string;
  sku: string;
  name: string;
  categoryName: string;
  priceLabel: string;
  taxPercent: number;
  lowStockThreshold: number;
  stockOnHand: number;
  isLowStock: boolean;
  isAllCentres: boolean;
  status: "draft" | "active" | "retired";
}

interface ProductRow {
  id: string;
  sku: string;
  name: string;
  price_paise: number;
  tax_percent: number;
  low_stock_threshold: number;
  is_all_centres: boolean;
  status: "draft" | "active" | "retired";
  product_categories: { name: string } | { name: string }[] | null;
}

function categoryName(row: ProductRow): string {
  const rel = row.product_categories;
  if (!rel) return "Uncategorised";
  return Array.isArray(rel) ? (rel[0]?.name ?? "Uncategorised") : rel.name;
}

/** Every product regardless of status, with stock summed across every
 *  location — this pass has no per-location stock display. */
export async function listProductsForAdmin(): Promise<AdminProductRow[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("products")
    .select(
      "id, sku, name, price_paise, tax_percent, low_stock_threshold, is_all_centres, status, product_categories(name)",
    )
    .order("name");

  const rows = (data ?? []) as unknown as ProductRow[];
  const { balances } = await loadStockBalances(
    supabase,
    rows.map((r) => r.id),
  );

  return rows.map((row) => {
    const stockOnHand = balances.get(row.id) ?? 0;
    return {
      id: row.id,
      sku: row.sku,
      name: row.name,
      categoryName: categoryName(row),
      priceLabel: formatPaise(row.price_paise as Paise),
      taxPercent: row.tax_percent,
      lowStockThreshold: row.low_stock_threshold,
      stockOnHand,
      isLowStock: stockOnHand <= row.low_stock_threshold,
      isAllCentres: row.is_all_centres,
      status: row.status,
    };
  });
}

export interface ProductOption {
  id: string;
  sku: string;
  name: string;
  priceLabel: string;
  pricePaise: number;
  taxPercent: number;
  stockOnHand: number;
}

/** Active products only, for the receive/adjust-stock pickers and the shop. */
export async function listActiveProductOptions(): Promise<ProductOption[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("products")
    .select("id, sku, name, price_paise, tax_percent")
    .eq("status", "active")
    .order("name");

  const rows = data ?? [];
  const { balances } = await loadStockBalances(
    supabase,
    rows.map((r) => r.id),
  );

  return rows.map((row) => ({
    id: row.id,
    sku: row.sku,
    name: row.name,
    priceLabel: formatPaise(row.price_paise as Paise),
    pricePaise: row.price_paise,
    taxPercent: row.tax_percent,
    stockOnHand: balances.get(row.id) ?? 0,
  }));
}

/**
 * What a specific centre may order: active products that are either
 * available everywhere or explicitly made eligible for this centre — the
 * same "eligible until restricted" rule `create_order` enforces server-side
 * (migration 0031). This is a read-time mirror of that rule, not a
 * substitute for it: `create_order` re-checks eligibility itself.
 */
export async function listOrderableProducts(
  centreId: string,
): Promise<ProductOption[]> {
  const supabase = await createClient();
  const { data: eligibleIds } = await supabase
    .from("product_centre_eligibility")
    .select("product_id")
    .eq("centre_id", centreId);
  const eligibleSet = new Set((eligibleIds ?? []).map((r) => r.product_id));

  const { data } = await supabase
    .from("products")
    .select("id, sku, name, price_paise, tax_percent, is_all_centres")
    .eq("status", "active")
    .order("name");

  const rows = (data ?? []).filter(
    (p) => p.is_all_centres || eligibleSet.has(p.id),
  );
  const { balances } = await loadStockBalances(
    supabase,
    rows.map((r) => r.id),
  );

  return rows.map((row) => ({
    id: row.id,
    sku: row.sku,
    name: row.name,
    priceLabel: formatPaise(row.price_paise as Paise),
    pricePaise: row.price_paise,
    taxPercent: row.tax_percent,
    stockOnHand: balances.get(row.id) ?? 0,
  }));
}

export interface LocationOption {
  id: string;
  name: string;
  type: string;
}

export async function listInventoryLocations(): Promise<LocationOption[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("inventory_locations")
    .select("id, name, type")
    .order("name");
  return data ?? [];
}

export interface LedgerEntryRow {
  entrySeq: number;
  productName: string;
  locationName: string;
  quantityDelta: number;
  balanceAfter: number;
  reason: string;
  reference: string | null;
  notes: string | null;
  on: string;
}

/** Most recent 200 stock movements, newest first — the "inventory movement"
 *  report PRD §7.13 names, in its simplest useful form. */
export async function listStockLedger(): Promise<LedgerEntryRow[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("inventory_entries")
    .select(
      "entry_seq, quantity_delta, balance_after, reason, reference, notes, created_at, products(name), inventory_locations(name)",
    )
    .order("entry_seq", { ascending: false })
    .limit(200);

  return (
    (data ?? []) as unknown as {
      entry_seq: number;
      quantity_delta: number;
      balance_after: number;
      reason: string;
      reference: string | null;
      notes: string | null;
      created_at: string;
      products: { name: string } | { name: string }[] | null;
      inventory_locations: { name: string } | { name: string }[] | null;
    }[]
  ).map((row) => {
    const product = Array.isArray(row.products)
      ? row.products[0]
      : row.products;
    const location = Array.isArray(row.inventory_locations)
      ? row.inventory_locations[0]
      : row.inventory_locations;
    return {
      entrySeq: row.entry_seq,
      productName: product?.name ?? "Unknown product",
      locationName: location?.name ?? "Unknown location",
      quantityDelta: row.quantity_delta,
      balanceAfter: row.balance_after,
      reason: row.reason,
      reference: row.reference,
      notes: row.notes,
      on: row.created_at.slice(0, 10),
    };
  });
}

export async function getProductForAdmin(
  id: string,
): Promise<AdminProductRow | null> {
  const rows = await listProductsForAdmin();
  return rows.find((r) => r.id === id) ?? null;
}
