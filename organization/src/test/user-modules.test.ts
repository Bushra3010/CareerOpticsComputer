import { describe, it, expect, vi, beforeEach } from "vitest";

/**
 * Which pages a signed-in person's role grants them.
 *
 * The bug this covers: an administrator narrowed "Accountant" to two pages and
 * every accountant still saw the whole menu. Permissions live on the role row,
 * but a login only carries a role if it was created after roles existed --
 * everybody hired before that had none, and "no role" was read as "no limit".
 */
let userRow: Record<string, unknown> | null = null;
let roleRows: Record<string, unknown>[] = [];

const builder = (table: string) => {
  const chain: Record<string, unknown> = {
    select: () => chain,
    eq: () => chain,
    order: () => chain,
    maybeSingle: () =>
      Promise.resolve(
        table === "users"
          ? { data: userRow, error: null }
          : { data: roleRows[0] ?? null, error: null },
      ),
    then: (resolve: (value: unknown) => unknown) =>
      Promise.resolve({ data: roleRows, error: null }).then(resolve),
  };
  return chain;
};

vi.mock("@/lib/supabase/client", () => ({
  supabase: { from: (table: string) => builder(table) },
  supabaseUrl: "https://project.supabase.co",
}));

const { getUserModules } = await import("@/lib/supabase/data");

const ACCOUNTANT_ROLE = {
  id: "org1:ACCOUNTANT",
  organizationId: "org1",
  name: "Accountant",
  baseRole: "ACCOUNTANT",
  modules: ["/fee/collection", "/fee/due-collection"],
  isSystem: true,
};

const CUSTOM_ROLE = {
  id: "role-counsellor",
  organizationId: "org1",
  name: "Counsellor",
  baseRole: "STAFF",
  modules: ["/student/view"],
  isSystem: false,
};

beforeEach(() => {
  userRow = null;
  roleRows = [];
});

describe("the pages a login is granted", () => {
  it("uses the role it was given", async () => {
    userRow = { roleId: "role-counsellor", role: "STAFF", organizationId: "org1" };
    roleRows = [CUSTOM_ROLE];
    const { data } = await getUserModules("u1");
    expect(data).toEqual(["/student/view"]);
  });

  it("falls back to the built-in role for what it was minted as", async () => {
    // Narrowing "Accountant" has to mean every accountant, not only the ones
    // hired since roles were added.
    userRow = { roleId: null, role: "ACCOUNTANT", organizationId: "org1" };
    roleRows = [ACCOUNTANT_ROLE, CUSTOM_ROLE];
    const { data } = await getUserModules("u1");
    expect(data).toEqual(["/fee/collection", "/fee/due-collection"]);
  });

  it("grants everything while no role has been narrowed at all", async () => {
    userRow = { roleId: null, role: "ACCOUNTANT", organizationId: "org1" };
    roleRows = [{ ...ACCOUNTANT_ROLE, modules: [] }];
    const { data } = await getUserModules("u1");
    // An empty list reads as "the whole menu for this view", as before roles.
    expect(data).toEqual([]);
  });

  it("grants everything on a database where roles.sql has not been run", async () => {
    userRow = { roleId: null, role: "ACCOUNTANT", organizationId: "org1" };
    roleRows = [];
    const { data } = await getUserModules("u1");
    expect(data).toEqual([]);
  });

  it("is empty for nobody signed in", async () => {
    const { data } = await getUserModules(null);
    expect(data).toEqual([]);
  });
});

describe("Super Admin", () => {
  it("keeps every page and action even when its role lists only some", async () => {
    userRow = { roleId: "role-super", role: "ORGANIZATION_ADMIN", organizationId: "org1" };
    roleRows = [{ id: "role-super", organizationId: "org1", name: "Super Admin", baseRole: "ORGANIZATION_ADMIN", modules: ["/course/view"], permissions: { "/course/view": [] }, isSystem: false }];
    const result = await getUserModules("u-super");
    expect(result.data).toEqual([]);
    expect(result.permissions).toEqual({});
  });

  it("never narrows the SUPER_ADMIN account itself", async () => {
    userRow = { roleId: null, role: "SUPER_ADMIN", organizationId: "org1" };
    roleRows = [{ ...ACCOUNTANT_ROLE, baseRole: "SUPER_ADMIN", modules: ["/fee/collection"] }];
    expect((await getUserModules("u-root")).data).toEqual([]);
  });

  it("still narrows other admin roles", async () => {
    userRow = { roleId: "role-ops", role: "ORGANIZATION_ADMIN", organizationId: "org1" };
    roleRows = [{ id: "role-ops", organizationId: "org1", name: "Operations Admin", baseRole: "ORGANIZATION_ADMIN", modules: ["/course/view"], isSystem: false }];
    expect((await getUserModules("u-ops")).data).toEqual(["/course/view"]);
  });
});
