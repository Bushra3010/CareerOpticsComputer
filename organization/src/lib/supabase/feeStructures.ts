import { supabase } from "./client";
import { nowIso } from "../id";
import {
  FEE_GROUPS_KEY,
  FEE_TYPES_KEY,
  type FeeGroup as LegacyFeeGroup,
  type FeeType,
} from "@/data/fee-catalog";

/**
 * Fee types and fee groups (supabase/schema/fee-structures.sql).
 *
 * These used to live in each browser's localStorage, so every computer had its
 * own catalogue. `loadFeeCatalog` moves a browser's lists into the database the
 * first time an organisation admin opens a fee page on it, keeping their ids:
 * `fee_invoices."feeGroupId"` already holds them.
 *
 * Row-level security lets every account in the organisation read and only an
 * organisation admin write; the `organizationId` filters only keep a super
 * admin's view to the organisation it is signed in to.
 */

export type { FeeType };
export type FeeStatus = FeeType["status"];

export interface FeeGroupItem {
  /** Null for an imported item whose fee type no longer existed in that browser. */
  feeTypeId: string | null;
  name: string;
  amount: number;
}

export interface FeeGroup {
  id: string;
  name: string;
  description: string;
  courses: string[];
  /** What allocation bills: the items' sum when the group was last saved. */
  totalAmount: number;
  status: FeeStatus;
  items: FeeGroupItem[];
}

export type FeeTypeInput = Omit<FeeType, "id">;
export type FeeGroupInput = Omit<FeeGroup, "id">;

const SETUP_HINT = "The fee tables are not set up yet. Run supabase/schema/fee-structures.sql in Supabase.";

type PgError = { code?: string; message?: string };

const missingTable = (error: PgError) =>
  error.code === "42P01" ||
  error.code === "PGRST205" ||
  error.code === "PGRST202" ||
  /does not exist|schema cache/i.test(error.message || "");

function fail(error: PgError): never {
  if (missingTable(error)) throw new Error(SETUP_HINT);
  // The unique indexes are the real guard against two admins saving the same
  // name at once; the page's own check only sees the list it loaded.
  if (error.code === "23505") {
    const message = error.message || "";
    if (/fee_types_org_code_key/.test(message)) throw new Error("That fee code is already in use.");
    if (/fee_types_org_name_key/.test(message)) throw new Error("A fee type with that name already exists.");
    if (/fee_groups_org_name_key/.test(message)) throw new Error("A fee group with that name already exists.");
  }
  throw new Error(error.message || "Request failed");
}

/** Mirrors `public.is_org_admin()`: the only roles the write policies admit. */
export const canManageFeeStructures = (role?: string | null): boolean =>
  ["SUPER_ADMIN", "ORGANIZATION_ADMIN"].includes((role ?? "").toUpperCase());

/* ---------------------------------------------------------------- validation */

/**
 * A money amount as typed: more than zero, at most two decimals. Returns null
 * when it is not one. Numbers are checked through their string form so 0.1 + 0.2
 * style floats are judged as a person would read them.
 */
export function parseAmount(raw: string | number): number | null {
  const text = String(raw ?? "").trim();
  if (!/^\d+(\.\d{1,2})?$/.test(text)) return null;
  const value = Number(text);
  return Number.isFinite(value) && value > 0 ? value : null;
}

const sameName = (a: string, b: string) => a.trim().toLowerCase() === b.trim().toLowerCase();

/** The reason a fee type cannot be saved, or null. `existing` is the loaded list. */
export function feeTypeProblem(
  input: { name: string; code: string; defaultAmount: string | number },
  existing: FeeType[],
  editingId: string | null,
): string | null {
  const name = input.name.trim();
  if (!name) return "Fee name is required";
  if (parseAmount(input.defaultAmount) === null) return "Enter a default amount above zero, with at most 2 decimals";
  const others = existing.filter((f) => f.id !== editingId);
  if (others.some((f) => sameName(f.name, name))) return "A fee type with that name already exists";
  const code = input.code.trim().toUpperCase();
  if (code && others.some((f) => f.code.trim().toUpperCase() === code)) return "That fee code is already in use";
  return null;
}

export function feeGroupProblem(
  input: { name: string; items: FeeGroupItem[] },
  existing: Array<Pick<FeeGroup, "id" | "name">>,
  editingId: string | null,
): string | null {
  const name = input.name.trim();
  if (!name) return "Group name is required";
  if (!input.items.length) return "Pick at least one fee type";
  if (existing.some((g) => g.id !== editingId && sameName(g.name, name))) {
    return "A fee group with that name already exists";
  }
  return null;
}

/** "Lab Fee (Copy)", then "Lab Fee (Copy 2)": the unique indexes refuse a repeat. */
export function copyName(name: string, taken: string[]): string {
  let candidate = `${name} (Copy)`;
  for (let n = 2; taken.some((t) => sameName(t, candidate)); n += 1) candidate = `${name} (Copy ${n})`;
  return candidate;
}

/* ----------------------------------------------------------------- mapping */

const toStatus = (value: unknown): FeeStatus => (String(value ?? "").toUpperCase() === "INACTIVE" ? "inactive" : "active");
const fromStatus = (status: FeeStatus) => (status === "inactive" ? "INACTIVE" : "ACTIVE");
const toList = (value: unknown, fallback: string[]) =>
  Array.isArray(value) && value.length ? value.map(String) : fallback;
// numeric columns come back from PostgREST as strings.
const toAmount = (value: unknown) => {
  const n = Number(value ?? 0);
  return Number.isFinite(n) ? n : 0;
};

function toFeeType(row: Record<string, unknown>): FeeType {
  return {
    id: String(row.id),
    name: String(row.name ?? ""),
    code: String(row.code ?? ""),
    category: String(row.category ?? ""),
    defaultAmount: toAmount(row.defaultAmount),
    frequency: String(row.frequency ?? ""),
    applicableTo: toList(row.applicableTo, ["All Courses"]),
    description: String(row.description ?? ""),
    status: toStatus(row.status),
  };
}

function toFeeGroup(row: Record<string, unknown>): FeeGroup {
  const items = (Array.isArray(row.fee_group_items) ? row.fee_group_items : []) as Record<string, unknown>[];
  return {
    id: String(row.id),
    name: String(row.name ?? ""),
    description: String(row.description ?? ""),
    courses: toList(row.courses, ["All Courses"]),
    totalAmount: toAmount(row.totalAmount),
    status: toStatus(row.status),
    items: [...items]
      .sort((a, b) => Number(a.sortOrder ?? 0) - Number(b.sortOrder ?? 0))
      .map((item) => ({
        feeTypeId: item.feeTypeId ? String(item.feeTypeId) : null,
        name: String(item.name ?? ""),
        amount: toAmount(item.amount),
      })),
  };
}

const feeTypeRow = (input: Partial<FeeTypeInput>) => {
  const row: Record<string, unknown> = {};
  if (input.name !== undefined) row.name = input.name.trim();
  if (input.code !== undefined) row.code = input.code.trim().toUpperCase();
  if (input.category !== undefined) row.category = input.category;
  if (input.defaultAmount !== undefined) row.defaultAmount = input.defaultAmount;
  if (input.frequency !== undefined) row.frequency = input.frequency;
  if (input.applicableTo !== undefined) row.applicableTo = input.applicableTo;
  if (input.description !== undefined) row.description = input.description.trim();
  if (input.status !== undefined) row.status = fromStatus(input.status);
  return row;
};

const feeGroupRow = (input: Partial<FeeGroupInput>) => {
  const row: Record<string, unknown> = {};
  if (input.name !== undefined) row.name = input.name.trim();
  if (input.description !== undefined) row.description = input.description.trim();
  if (input.courses !== undefined) row.courses = input.courses.length ? input.courses : ["All Courses"];
  if (input.totalAmount !== undefined) row.totalAmount = input.totalAmount;
  if (input.status !== undefined) row.status = fromStatus(input.status);
  return row;
};

const itemRows = (groupId: string, items: FeeGroupItem[]) =>
  items.map((item, index) => ({
    feeGroupId: groupId,
    feeTypeId: item.feeTypeId,
    name: item.name,
    amount: item.amount,
    sortOrder: index,
  }));

/* -------------------------------------------------------------- fee types */

export async function listFeeTypes(organizationId: string | null): Promise<FeeType[]> {
  let query = supabase.from("fee_types").select("*").is("deletedAt", null).order("name");
  if (organizationId) query = query.eq("organizationId", organizationId);
  const { data, error } = await query;
  if (error) fail(error);
  return (data ?? []).map((row) => toFeeType(row as Record<string, unknown>));
}

export async function createFeeType(organizationId: string | null, input: FeeTypeInput): Promise<FeeType> {
  if (!organizationId) throw new Error("This login is not attached to an organisation.");
  const { data, error } = await supabase
    .from("fee_types")
    .insert({ ...feeTypeRow(input), organizationId })
    .select("*")
    .single();
  if (error) fail(error);
  return toFeeType(data as Record<string, unknown>);
}

export async function updateFeeType(id: string, patch: Partial<FeeTypeInput>): Promise<void> {
  const { data, error } = await supabase
    .from("fee_types")
    .update({ ...feeTypeRow(patch), updatedAt: nowIso() })
    .eq("id", id)
    .select("id");
  if (error) fail(error);
  if (!data?.length) throw new Error("Fee type not found, or you do not have permission to change it.");
}

/**
 * Soft delete. Groups built from the type keep their item, with its name and
 * amount, so a package that was billed still says what it was made of.
 */
export async function deleteFeeType(id: string): Promise<void> {
  const { data, error } = await supabase
    .from("fee_types")
    .update({ deletedAt: nowIso(), updatedAt: nowIso() })
    .eq("id", id)
    .select("id");
  if (error) fail(error);
  if (!data?.length) throw new Error("Fee type not found, or you do not have permission to delete it.");
}

/* ------------------------------------------------------------- fee groups */

export async function listFeeGroups(organizationId: string | null): Promise<FeeGroup[]> {
  let query = supabase.from("fee_groups").select("*, fee_group_items(*)").is("deletedAt", null).order("name");
  if (organizationId) query = query.eq("organizationId", organizationId);
  const { data, error } = await query;
  if (error) fail(error);
  return (data ?? []).map((row) => toFeeGroup(row as Record<string, unknown>));
}

export async function createFeeGroup(organizationId: string | null, input: FeeGroupInput): Promise<FeeGroup> {
  if (!organizationId) throw new Error("This login is not attached to an organisation.");
  const { data, error } = await supabase
    .from("fee_groups")
    .insert({ ...feeGroupRow(input), organizationId })
    .select("*")
    .single();
  if (error) fail(error);
  const group = toFeeGroup(data as Record<string, unknown>);

  const { error: itemsError } = await supabase.from("fee_group_items").insert(itemRows(group.id, input.items));
  if (itemsError) {
    // A group with no fee types would still be offered on allocation; take it
    // back out rather than leave it half-made.
    await supabase.from("fee_groups").delete().eq("id", group.id);
    fail(itemsError);
  }
  return { ...group, items: input.items };
}

/**
 * Saves the group and replaces its items. The new items go in before the old
 * ones are removed, so a refused insert leaves the group as it was rather than
 * empty.
 */
export async function updateFeeGroup(id: string, input: Partial<FeeGroupInput>): Promise<void> {
  const { data, error } = await supabase
    .from("fee_groups")
    .update({ ...feeGroupRow(input), updatedAt: nowIso() })
    .eq("id", id)
    .select("id");
  if (error) fail(error);
  if (!data?.length) throw new Error("Fee group not found, or you do not have permission to change it.");
  if (!input.items) return;

  const { data: old, error: oldError } = await supabase.from("fee_group_items").select("id").eq("feeGroupId", id);
  if (oldError) fail(oldError);
  const { error: insertError } = await supabase.from("fee_group_items").insert(itemRows(id, input.items));
  if (insertError) fail(insertError);
  const oldIds = (old ?? []).map((row) => String((row as { id: unknown }).id));
  if (oldIds.length) {
    const { error: deleteError } = await supabase.from("fee_group_items").delete().in("id", oldIds);
    if (deleteError) fail(deleteError);
  }
}

/** Soft delete: invoices billed from the group still resolve its row. */
export async function deleteFeeGroup(id: string): Promise<void> {
  const { data, error } = await supabase
    .from("fee_groups")
    .update({ deletedAt: nowIso(), updatedAt: nowIso() })
    .eq("id", id)
    .select("id");
  if (error) fail(error);
  if (!data?.length) throw new Error("Fee group not found, or you do not have permission to delete it.");
}

/* ------------------------------------------------- localStorage import */

function readLocal<T>(key: string): T[] {
  try {
    const parsed = JSON.parse(localStorage.getItem(key) || "[]");
    return Array.isArray(parsed) ? (parsed as T[]) : [];
  } catch {
    return [];
  }
}

/** Legacy amounts were typed freely; the columns are numeric(12,2) >= 0. */
const cleanAmount = (value: unknown) => {
  const n = Number(value);
  return Number.isFinite(n) && n > 0 ? Math.round(n * 100) / 100 : 0;
};

/**
 * The browser's own copies could repeat a name ("Duplicate" made "X (Copy)"
 * every time) or a code, which the unique indexes refuse. A repeat is renamed
 * rather than dropped, so nothing in the browser goes missing.
 */
function uniqueText(value: string, taken: Set<string>, normalise: (s: string) => string) {
  let candidate = value;
  for (let n = 2; candidate && taken.has(normalise(candidate)); n += 1) candidate = `${value} (${n})`;
  if (candidate) taken.add(normalise(candidate));
  return candidate;
}

/** What `import_fee_structures` is sent, built from this browser's lists. Exported for tests. */
export function buildImportPayload(localTypes: FeeType[], localGroups: LegacyFeeGroup[]) {
  const seenTypeIds = new Set<string>();
  const names = new Set<string>();
  const codes = new Set<string>();
  const lower = (s: string) => s.trim().toLowerCase();
  const upper = (s: string) => s.trim().toUpperCase();

  const types = localTypes
    .filter((t) => t && t.id && String(t.name ?? "").trim() && !seenTypeIds.has(String(t.id)) && seenTypeIds.add(String(t.id)))
    .map((t) => ({
      id: String(t.id),
      name: uniqueText(String(t.name).trim(), names, lower),
      code: uniqueText(upper(String(t.code ?? "")), codes, upper),
      category: String(t.category ?? "Academic"),
      defaultAmount: cleanAmount(t.defaultAmount),
      frequency: String(t.frequency ?? "Yearly"),
      applicableTo: toList(t.applicableTo, ["All Courses"]),
      description: String(t.description ?? ""),
      status: fromStatus(toStatus(t.status)),
    }));

  // Groups named their fee types, not their ids; resolve against the browser's
  // original names, before any rename above.
  const byName = new Map<string, FeeType>();
  for (const t of localTypes) {
    if (t?.name && seenTypeIds.has(String(t.id)) && !byName.has(lower(t.name))) byName.set(lower(t.name), t);
  }

  const seenGroupIds = new Set<string>();
  const groupNames = new Set<string>();
  const groups = localGroups
    .filter((g) => g && g.id && String(g.name ?? "").trim() && !seenGroupIds.has(String(g.id)) && seenGroupIds.add(String(g.id)))
    .map((g) => ({
      id: String(g.id),
      name: uniqueText(String(g.name).trim(), groupNames, lower),
      description: String(g.description ?? ""),
      courses: toList(g.courses, ["All Courses"]),
      // The stored total, not a fresh sum: it is what students were billed.
      totalAmount: cleanAmount(g.totalAmount),
      status: fromStatus(toStatus(g.status)),
      items: (Array.isArray(g.feeTypes) ? g.feeTypes : []).map((name) => {
        const type = byName.get(lower(String(name)));
        return {
          feeTypeId: type ? String(type.id) : null,
          name: String(name),
          amount: type ? cleanAmount(type.defaultAmount) : 0,
        };
      }),
    }));

  return { types, groups };
}

export type ImportResult = { imported: boolean; types: number; groups: number };

/**
 * Copies this browser's fee types and groups into the organisation, keeping
 * their ids, and clears the browser's copies only once the database has them.
 * The function itself refuses to run over an organisation that already has a
 * catalogue, so a second stale browser cannot add its lists on top.
 */
export async function importLocalFeeStructures(): Promise<ImportResult> {
  const localTypes = readLocal<FeeType>(FEE_TYPES_KEY);
  const localGroups = readLocal<LegacyFeeGroup>(FEE_GROUPS_KEY);
  if (!localTypes.length && !localGroups.length) return { imported: false, types: 0, groups: 0 };

  const { types, groups } = buildImportPayload(localTypes, localGroups);
  const { data, error } = await supabase.rpc("import_fee_structures", { p_types: types, p_groups: groups });
  if (error) fail(error);

  const result = (data ?? {}) as Partial<ImportResult>;
  if (result.imported) {
    try {
      localStorage.removeItem(FEE_TYPES_KEY);
      localStorage.removeItem(FEE_GROUPS_KEY);
    } catch { /* storage blocked: the import is done either way */ }
  }
  return { imported: !!result.imported, types: Number(result.types ?? 0), groups: Number(result.groups ?? 0) };
}

/**
 * Both lists, importing this browser's old ones first when the organisation
 * has none. Only an admin can import; anyone else just sees the database.
 *
 * A failed import is reported, not thrown: the browser keeps its copy and the
 * next visit retries, but the page must still open on what the database has.
 */
export async function loadFeeCatalog(
  organizationId: string | null,
  options: { canImport: boolean },
): Promise<{ types: FeeType[]; groups: FeeGroup[]; imported: ImportResult | null; importError: string | null }> {
  let [types, groups] = await Promise.all([listFeeTypes(organizationId), listFeeGroups(organizationId)]);
  let imported: ImportResult | null = null;
  let importError: string | null = null;
  if (options.canImport && !types.length && !groups.length) {
    try {
      const result = await importLocalFeeStructures();
      if (result.imported) {
        imported = result;
        [types, groups] = await Promise.all([listFeeTypes(organizationId), listFeeGroups(organizationId)]);
      }
    } catch (error) {
      importError = (error as Error)?.message || "Import failed";
    }
  }
  return { types, groups, imported, importError };
}
