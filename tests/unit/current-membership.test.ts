// @vitest-environment node

import { beforeEach, describe, expect, it, vi } from "vitest";

const cookieStore = new Map<string, string>();

vi.mock("next/headers", () => ({
  cookies: async () => ({
    get: (name: string) => {
      const value = cookieStore.get(name);
      return value === undefined ? undefined : { name, value };
    },
  }),
}));

import {
  ACTIVE_CENTRE_COOKIE,
  getCurrentCentreContext,
  listCentreMemberships,
} from "@/features/centres/current-membership";

interface Row {
  organization_id: string;
  centre_id: string | null;
  created_at: string;
}

/**
 * Stub keyed on table name. `memberships` is awaited after `.order()` and
 * `centres` after `.in()`, so every method returns the same thenable chain.
 *
 * It deliberately applies `.order()` itself, and returns rows untouched when
 * `.order()` is never called — mirroring Postgres, which is free to return any
 * order without an `order by`. That is what makes the determinism test below
 * real: drop the `.order()` from the query and it fails.
 */
function client(memberships: Row[], centres = CENTRES) {
  return {
    from(table: string) {
      let rows: unknown[] = table === "memberships" ? memberships : centres;
      const chain: Record<string, unknown> = {
        then: (resolve: (v: unknown) => unknown) =>
          Promise.resolve({ data: rows, error: null }).then(resolve),
      };
      for (const m of ["select", "eq", "not", "in"]) {
        chain[m] = () => chain;
      }
      chain.order = (column: string, opts?: { ascending?: boolean }) => {
        const dir = opts?.ascending === false ? -1 : 1;
        rows = [...rows].sort((a, b) => {
          const av = String((a as Record<string, unknown>)[column] ?? "");
          const bv = String((b as Record<string, unknown>)[column] ?? "");
          return av < bv ? -dir : av > bv ? dir : 0;
        });
        return chain;
      };
      return chain;
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any -- stub covering the read surface only
  } as any;
}

const CENTRES = [
  { id: "c-bhopal", name: "bhopal", code: "BHOPAL" },
  { id: "c-xyz", name: "xyz", code: "XYZ" },
];

// Returned deliberately out of creation order, the way Postgres is free to
// without an `order by`.
const TWO: Row[] = [
  { organization_id: "org-1", centre_id: "c-xyz", created_at: "2026-09-01" },
  { organization_id: "org-1", centre_id: "c-bhopal", created_at: "2026-08-01" },
];

const ctx = (c: unknown) => getCurrentCentreContext(c as never, "user-1");

beforeEach(() => cookieStore.clear());

describe("listCentreMemberships", () => {
  it("collapses two roles at one centre into one entry", async () => {
    const rows: Row[] = [
      {
        organization_id: "org-1",
        centre_id: "c-bhopal",
        created_at: "2026-08-01",
      },
      {
        organization_id: "org-1",
        centre_id: "c-bhopal",
        created_at: "2026-08-02",
      },
    ];
    const result = await listCentreMemberships(client(rows) as never, "user-1");
    expect(result).toHaveLength(1);
    expect(result[0]).toMatchObject({ centreId: "c-bhopal", name: "bhopal" });
  });

  it("skips rows with no centre", async () => {
    const rows: Row[] = [
      { organization_id: "org-1", centre_id: null, created_at: "2026-08-01" },
    ];
    await expect(
      listCentreMemberships(client(rows) as never, "user-1"),
    ).resolves.toEqual([]);
  });
});

describe("getCurrentCentreContext", () => {
  it("returns null when the user belongs to no centre", async () => {
    await expect(ctx(client([]))).resolves.toBeNull();
  });

  // The regression. Without a selection the pick must be stable, not whatever
  // the database happened to return — a portal that changes centre between
  // requests is how a centre's students appeared to vanish.
  it("picks the same centre every time with no cookie set", async () => {
    const first = await ctx(client(TWO));
    const second = await ctx(client([...TWO].reverse()));
    expect(first?.centreId).toBe(second?.centreId);
  });

  it("honours an explicit choice", async () => {
    cookieStore.set(ACTIVE_CENTRE_COOKIE, "c-xyz");
    await expect(ctx(client(TWO))).resolves.toMatchObject({
      centreId: "c-xyz",
    });
  });

  // The security property: the cookie is a preference, never a grant.
  it("ignores a centre the user does not belong to", async () => {
    cookieStore.set(ACTIVE_CENTRE_COOKIE, "c-someone-elses");
    const result = await ctx(client(TWO));
    expect(result?.centreId).not.toBe("c-someone-elses");
    expect(["c-bhopal", "c-xyz"]).toContain(result?.centreId);
  });
});
