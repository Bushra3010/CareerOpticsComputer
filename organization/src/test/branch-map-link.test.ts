import { describe, it, expect, vi, beforeEach } from "vitest";

/**
 * A branch's address, as a link. The written address and the pin on a map are
 * not the same thing -- a lane with no name is found by the shared Google Maps
 * link and by nothing else -- so Create Branch takes one.
 *
 * `branch_addresses.mapLink` arrives with add-branch-map-link.sql, and the form
 * shipped before anyone had to run it. What this file pins down is that a
 * database without the column still gets its branch: the address write goes
 * again without the field rather than failing the whole creation.
 */
const inserts: Record<string, Record<string, unknown>[]> = {};
const updates: Record<string, Record<string, unknown>[]> = {};
/** Tables where the first write is rejected for not knowing `mapLink`. */
let missingMapLink = false;

const missingColumn = {
  code: "PGRST204",
  message: "Could not find the 'mapLink' column of 'branch_addresses' in the schema cache",
};

function builder(table: string) {
  let body: Record<string, unknown> = {};
  let writing: "insert" | "update" | null = null;
  const settle = () => {
    const rejected =
      missingMapLink && table === "branch_addresses" && "mapLink" in body;
    if (writing === "insert") (inserts[table] ||= []).push(body);
    if (writing === "update") (updates[table] ||= []).push(body);
    return Promise.resolve(
      rejected ? { data: null, error: missingColumn } : { data: { id: "br-1", ...body }, error: null },
    );
  };
  const chain: Record<string, unknown> = {
    insert: (payload: Record<string, unknown>) => {
      body = payload;
      writing = "insert";
      return chain;
    },
    update: (payload: Record<string, unknown>) => {
      body = payload;
      writing = "update";
      return chain;
    },
    select: () => chain,
    in: () => chain,
    eq: () => chain,
    is: () => chain,
    single: settle,
    maybeSingle: settle,
    // An insert with no `.select()` is awaited directly.
    then: (resolve: (value: unknown) => unknown) => settle().then(resolve),
  };
  return chain;
}

vi.mock("@/lib/supabase/client", () => ({
  supabase: {
    from: (table: string) => builder(table),
    auth: { getSession: () => Promise.resolve({ data: { session: null } }) },
  },
  supabaseUrl: "https://project.supabase.co",
}));

const { createBranchWithDetails, updateBranchWithDetails } = await import("@/lib/supabase/data");

const ADDRESS = {
  streetAddress: "24 Shivaji Nagar",
  state: "Bihar",
  district: "Patna",
  city: "Patna",
  pincode: "800001",
  mapLink: "https://maps.app.goo.gl/abc123",
};

const written = (table: string) => (inserts[table] || []).at(-1) ?? {};

beforeEach(() => {
  for (const key of Object.keys(inserts)) delete inserts[key];
  for (const key of Object.keys(updates)) delete updates[key];
  missingMapLink = false;
});

describe("a branch's map link", () => {
  it("is saved with the rest of the address", async () => {
    await createBranchWithDetails("org1", {
      branch: { name: "Career Optics Computer Centre", code: "BRCH09" },
      address: ADDRESS,
      director: { name: "A Director" },
    });

    expect(written("branch_addresses").mapLink).toBe("https://maps.app.goo.gl/abc123");
  });

  it("still creates the branch on a database that has no such column yet", async () => {
    missingMapLink = true;

    await expect(
      createBranchWithDetails("org1", {
        branch: { name: "Career Optics Computer Centre", code: "BRCH09" },
        address: ADDRESS,
        director: { name: "A Director" },
      }),
    ).resolves.toMatchObject({ success: true });

    // The retry drops the field alone; the address itself is still written.
    const second = written("branch_addresses");
    expect(second).not.toHaveProperty("mapLink");
    expect(second.city).toBe("Patna");
  });

  it("survives the same column on an edit, rather than losing the whole address", async () => {
    missingMapLink = true;

    await updateBranchWithDetails("br-1", "org1", { branch: {}, address: ADDRESS });

    const second = (updates.branch_addresses || []).at(-1)!;
    expect(second).not.toHaveProperty("mapLink");
    expect(second.streetAddress).toBe("24 Shivaji Nagar");
  });
});
