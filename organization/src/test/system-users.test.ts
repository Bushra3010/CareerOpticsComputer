import { describe, it, expect, vi, beforeEach } from "vitest";

/**
 * The All Users page listed four invented people and saved nothing.
 *
 * The real difficulty is that `users` grew two ways of saying where a login
 * belongs. The older one points the other way — from `organizations.userId`
 * and `branches.userId` at the login — and can only name an account that
 * *owns* something. The newer `users.organizationId`, added by
 * user-management.sql, is the only one that can place a receptionist. These
 * pin down that both are read and merged, that a database without the
 * migration still works, and that a write which touched no row is reported as
 * a failure rather than as success.
 */
type Row = Record<string, unknown>;

/** Keyed by table, except `users_scoped`, which is the second `users` read. */
const rows: Record<string, Row[]> = {};
const errors: Record<string, { code?: string; message?: string } | null> = {};
const calls: Array<{
  table: string;
  filters: Record<string, unknown>;
  excluded?: Record<string, unknown>;
  ids?: unknown[];
  updated?: unknown;
  selected?: string;
}> = [];

/** The two `users` reads differ by the scope column, which only the second has. */
const keyFor = (table: string, call: (typeof calls)[number]) =>
  table === "users" && ("organizationId" in call.filters || "branchId" in call.filters)
    ? "users_scoped"
    : table;

function builder(table: string) {
  const call: (typeof calls)[number] = { table, filters: {} };
  calls.push(call);

  const chain: Record<string, unknown> = {
    select: (columns?: string) => {
      call.selected = columns;
      return chain;
    },
    update: (values: unknown) => {
      call.updated = values;
      return chain;
    },
    eq: (column: string, value: unknown) => {
      call.filters[column] = value;
      return chain;
    },
    neq: (column: string, value: unknown) => {
      call.excluded = { ...call.excluded, [column]: value };
      return chain;
    },
    is: (column: string, value: unknown) => {
      call.filters[column] = value;
      return chain;
    },
    in: (_column: string, values: unknown[]) => {
      call.ids = values;
      return chain;
    },
    order: () => chain,
    maybeSingle: () => Promise.resolve({ data: (rows[table] ?? [])[0] ?? null, error: null }),
    then: (resolve: (value: unknown) => unknown) => {
      const key = keyFor(table, call);
      return Promise.resolve({ data: rows[key] ?? [], error: errors[key] ?? null }).then(resolve);
    },
  };
  return chain;
}

vi.mock("@/lib/supabase/client", () => ({
  supabase: { from: (table: string) => builder(table) },
  supabaseUrl: "https://project.supabase.co",
}));

const { getUsers, updateUser, deleteUser, SYSTEM_ROLES, grantableRoles, canManageUsers } =
  await import("@/lib/supabase/data");

const called = (table: string) => calls.find((call) => call.table === table);
/** The scoped read is the `users` call that carries a scope column. */
const scopedCall = () => calls.find((call) => keyFor(call.table, call) === "users_scoped");

beforeEach(() => {
  calls.length = 0;
  for (const key of Object.keys(rows)) delete rows[key];
  for (const key of Object.keys(errors)) delete errors[key];
});

describe("getUsers", () => {
  it("names the organisation's own admin", async () => {
    rows.organizations = [{ id: "o1", name: "Career Optics Computer Centre", userId: "u1" }];
    rows.branches = [];
    rows.users = [{ id: "u1", name: "Amar", email: "amar@x.com", role: "ORGANIZATION_ADMIN", userType: "ORGANIZATION" }];

    const { data } = await getUsers("o1", null);
    expect(data).toHaveLength(1);
    expect(data[0].organization).toBe("Career Optics Computer Centre");
    expect(data[0].branch).toBe("");
  });

  it("labels a branch login with the branch it runs", async () => {
    rows.organizations = [{ id: "o1", name: "Career Optics Computer Centre", userId: "u1" }];
    rows.branches = [{ id: "b1", name: "Patna Centre", userId: "u2" }];
    rows.users = [
      { id: "u2", name: "Sarah", email: "sarah@x.com", role: "BRANCH_ADMIN", userType: "BRANCH" },
    ];

    const { data } = await getUsers("o1", null);
    expect(data[0].branch).toBe("Patna Centre");
    expect(data[0].branchId).toBe("b1");
  });

  it("reads the users back by id, since there is no branch column to filter on", async () => {
    rows.organizations = [{ id: "o1", name: "Org", userId: "u1" }];
    rows.branches = [{ id: "b1", name: "Patna", userId: "u2" }];
    rows.users = [];

    await getUsers("o1", null);
    expect(called("users")?.ids).toEqual(["u1", "u2"]);
  });

  it("leaves out logins that have been removed", async () => {
    rows.organizations = [{ id: "o1", name: "Org", userId: "u1" }];
    rows.branches = [];
    rows.users = [];

    await getUsers("o1", null);
    expect(called("users")?.filters).toHaveProperty("deletedAt", null);
    expect(called("branches")?.filters).toHaveProperty("deletedAt", null);
  });

  it("scopes a branch admin to their own branch", async () => {
    rows.branches = [{ id: "b1", name: "Patna", userId: "u2" }];
    rows.users = [{ id: "u2", name: "Sarah", email: "s@x.com" }];

    await getUsers(null, "b1");
    expect(called("branches")?.filters).toMatchObject({ id: "b1" });
    // With no organisation in hand there is nothing to look an owner up by.
    expect(called("organizations")).toBeUndefined();
  });

  it("asks for nothing when no branch or organisation names a login", async () => {
    rows.branches = [];
    const { data } = await getUsers(null, null);
    expect(data).toEqual([]);
    expect(called("users")).toBeUndefined();
  });

  it("treats a login as active unless it was switched off", async () => {
    rows.organizations = [{ id: "o1", name: "Org", userId: "u1" }];
    rows.branches = [{ id: "b1", name: "Patna", userId: "u2" }];
    rows.users = [
      { id: "u1", name: "Amar", isActive: true },
      { id: "u2", name: "Sarah", isActive: false },
    ];

    const { data } = await getUsers("o1", null);
    expect(data.map((row) => row.isActive)).toEqual([true, false]);
  });

  it("lists a staff login that owns neither a branch nor an organisation", async () => {
    // The whole point of users.organizationId: a receptionist is named by no
    // link, so before the column existed this row could not be listed at all.
    rows.organizations = [{ id: "o1", name: "Org", userId: "u1" }];
    rows.branches = [{ id: "b1", name: "Patna", userId: "u2" }];
    rows.users = [];
    rows.users_scoped = [
      { id: "u9", name: "Priya", role: "RECEPTIONIST", userType: "BRANCH", organizationId: "o1", branchId: "b1" },
    ];

    const { data } = await getUsers("o1", null);
    expect(data).toHaveLength(1);
    expect(data[0].name).toBe("Priya");
    // Named from the branch list, since no branches.userId points back at her.
    expect(data[0].branch).toBe("Patna");
  });

  it("does not list the same person twice when both scopes find them", async () => {
    rows.organizations = [{ id: "o1", name: "Org", userId: "u1" }];
    rows.branches = [];
    rows.users = [{ id: "u1", name: "Amar", role: "ORGANIZATION_ADMIN" }];
    rows.users_scoped = [{ id: "u1", name: "Amar", role: "ORGANIZATION_ADMIN", organizationId: "o1" }];

    const { data } = await getUsers("o1", null);
    expect(data).toHaveLength(1);
    // The owner link still wins, so the organisation name survives the merge.
    expect(data[0].organization).toBe("Org");
  });

  it("leaves students out of the scoped read", async () => {
    rows.organizations = [];
    rows.branches = [];
    await getUsers("o1", null);
    expect(scopedCall()?.excluded).toMatchObject({ userType: "STUDENT" });
  });

  it("still lists the owners when the scope column has not been added yet", async () => {
    // A database without user-management.sql answers 42703. That is a missing
    // migration, not a failure -- the page must still show what it can.
    rows.organizations = [{ id: "o1", name: "Org", userId: "u1" }];
    rows.branches = [];
    rows.users = [{ id: "u1", name: "Amar" }];
    errors.users_scoped = { code: "42703", message: "column users.organizationId does not exist" };

    const { data } = await getUsers("o1", null);
    expect(data).toHaveLength(1);
    expect(data[0].name).toBe("Amar");
  });

  it("does not swallow a real failure on the scoped read", async () => {
    rows.organizations = [];
    rows.branches = [];
    errors.users_scoped = { code: "42501", message: "permission denied for table users" };

    await expect(getUsers("o1", null)).rejects.toThrow(/permission denied/);
  });
});

describe("grantableRoles", () => {
  it("lets an organisation admin staff the institute", () => {
    expect(grantableRoles("ORGANIZATION_ADMIN")).toContain("RECEPTIONIST");
    expect(grantableRoles("ORGANIZATION_ADMIN")).toContain("BRANCH_ADMIN");
  });

  it("stops a branch admin minting anyone who could leave the branch", () => {
    const allowed = grantableRoles("BRANCH_ADMIN");
    expect(allowed).toContain("TEACHER");
    // Either would escape the branch this admin is confined to.
    expect(allowed).not.toContain("BRANCH_ADMIN");
    expect(allowed).not.toContain("ORGANIZATION_ADMIN");
  });

  it("never offers a student login, which needs its own student record", () => {
    for (const role of ["SUPER_ADMIN", "ORGANIZATION_ADMIN", "BRANCH_ADMIN"]) {
      expect(grantableRoles(role)).not.toContain("STUDENT");
    }
  });

  it("offers nothing to someone who may not create logins", () => {
    expect(grantableRoles("TEACHER")).toEqual([]);
    expect(grantableRoles(null)).toEqual([]);
    expect(canManageUsers("RECEPTIONIST")).toBe(false);
    expect(canManageUsers("ORGANIZATION_ADMIN")).toBe(true);
  });

  it("offers only roles the database will accept", () => {
    for (const role of grantableRoles("SUPER_ADMIN")) {
      expect(SYSTEM_ROLES).toContain(role);
    }
  });
});

describe("updateUser", () => {
  it("saves the fields the form actually offers", async () => {
    rows.users = [{ id: "u1" }];
    await updateUser("u1", { name: " Sarah Smith ", phone: "9876543210", role: "ACCOUNTANT", isActive: false });

    expect(called("users")?.updated).toEqual({
      name: "Sarah Smith",
      phone: "9876543210",
      role: "ACCOUNTANT",
      isActive: false,
    });
    expect(called("users")?.filters).toEqual({ id: "u1" });
  });

  it("clears an emptied phone rather than storing a blank", async () => {
    rows.users = [{ id: "u1" }];
    // `users.phone` is unique, so two blanks would collide where two nulls do not.
    await updateUser("u1", { phone: "   " });
    expect(called("users")?.updated).toEqual({ phone: null });
  });

  it("reports failure when the write matched no row", async () => {
    rows.users = [];
    await expect(updateUser("u1", { name: "Sarah" })).rejects.toThrow(/not saved/i);
  });

  it("does not write at all when nothing was changed", async () => {
    await expect(updateUser("u1", {})).resolves.toEqual({ success: true });
    expect(calls).toHaveLength(0);
  });

  it("offers only roles the database will accept", () => {
    // The old form offered Admin, Manager and Employee; the enum has none of them.
    expect(SYSTEM_ROLES).toContain("BRANCH_ADMIN");
    expect(SYSTEM_ROLES).not.toContain("Manager");
  });
});

describe("deleteUser", () => {
  it("soft-deletes and switches the login off", async () => {
    rows.users = [{ id: "u1" }];
    await deleteUser("u1");
    expect(called("users")?.updated).toHaveProperty("deletedAt");
    expect(called("users")?.updated).toHaveProperty("isActive", false);
  });

  it("reports failure when the row was not removed", async () => {
    rows.users = [];
    await expect(deleteUser("u1")).rejects.toThrow(/not removed/i);
  });
});
