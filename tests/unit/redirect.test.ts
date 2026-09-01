// @vitest-environment node

import { describe, expect, it } from "vitest";

import { resolvePostLoginPath, type Portal } from "@/features/auth/redirect";

/**
 * `resolvePostLoginPath` only ever reads three tables, and reads each exactly
 * once, so a stub keyed on table name is enough to drive every branch. It is
 * deliberately not a mock of the Supabase client: the point is to pin the
 * routing decision, not the query builder's shape.
 */
function client({
  superAdmin = false,
  memberships = [] as { centre_id: string | null }[],
  student = false,
}) {
  const result = (table: string) => {
    if (table === "profiles") {
      return { data: { is_platform_super_admin: superAdmin } };
    }
    if (table === "memberships") return { data: memberships };
    return { data: student ? { id: "student-1" } : null };
  };

  return {
    from(table: string) {
      const chain = {
        select: () => chain,
        eq: () => chain,
        limit: () => chain,
        maybeSingle: () => Promise.resolve(result(table)),
        then: (resolve: (v: unknown) => unknown) =>
          Promise.resolve(result(table)).then(resolve),
      };
      return chain;
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any -- a stub standing in for the client's read surface only
  } as any;
}

const resolve = (c: unknown, portal: Portal) =>
  resolvePostLoginPath(c as never, "user-1", portal);

describe("resolvePostLoginPath", () => {
  it("sends a platform admin to /admin whichever door they use", async () => {
    const c = client({ superAdmin: true, memberships: [{ centre_id: "c1" }] });
    await expect(resolve(c, "student")).resolves.toBe("/admin");
    await expect(resolve(c, "centre")).resolves.toBe("/admin");
  });

  it("sends a plain student to /student", async () => {
    const c = client({ student: true });
    await expect(resolve(c, "student")).resolves.toBe("/student");
  });

  it("sends plain centre staff to /centre", async () => {
    const c = client({ memberships: [{ centre_id: "c1" }] });
    await expect(resolve(c, "centre")).resolves.toBe("/centre");
  });

  // The regression this file exists for. An account can hold a centre
  // membership *and* a student record — an address that already had a login
  // when the centre issued portal credentials, since setStudentPortalLogin
  // links the existing account rather than failing. It used to land on
  // /centre even after choosing student sign-in.
  it("honours the door a dual-role user came through", async () => {
    const c = client({ memberships: [{ centre_id: "c1" }], student: true });
    await expect(resolve(c, "student")).resolves.toBe("/student");
    await expect(resolve(c, "centre")).resolves.toBe("/centre");
  });

  it("routes an org membership with no centre to /student", async () => {
    const c = client({ memberships: [{ centre_id: null }] });
    await expect(resolve(c, "centre")).resolves.toBe("/student");
  });

  it("falls back to the sign-in portal when the account has nothing", async () => {
    const c = client({});
    await expect(resolve(c, "student")).resolves.toBe("/student");
    await expect(resolve(c, "centre")).resolves.toBe("/centre");
  });
});
