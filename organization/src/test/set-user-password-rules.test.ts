import { describe, it, expect } from "vitest";

// Loaded straight from the edge function: it is the decision the server makes.
import { mayResetPasswords, resetRefusal } from "../../supabase/functions/set-user-password/rules";

const org = (over: Record<string, unknown> = {}) => ({ organizationId: "org1", ...over });
const acct = (id: string, role: string | undefined, over: Record<string, unknown> = {}) => ({
  id,
  role,
  ...org(over),
});

describe("who may set passwords at all", () => {
  it("is the three admin roles and nobody else", () => {
    for (const role of ["SUPER_ADMIN", "ORGANIZATION_ADMIN", "BRANCH_ADMIN", "branch_admin"]) {
      expect(mayResetPasswords(role), role).toBe(true);
    }
    for (const role of ["TEACHER", "STAFF", "STUDENT", "", undefined]) {
      expect(mayResetPasswords(role), String(role)).toBe(false);
    }
  });
});

describe("resetRefusal", () => {
  it("lets an organisation admin reset their staff and students", () => {
    const admin = acct("a", "ORGANIZATION_ADMIN");
    expect(resetRefusal(admin, acct("t", "TEACHER"))).toBeNull();
    expect(resetRefusal(admin, acct("s", "STUDENT"))).toBeNull();
    expect(resetRefusal(admin, acct("b", "BRANCH_ADMIN"))).toBeNull();
  });

  // A branch admin who could reset an org admin could sign in as them.
  it("never lets anyone reach above their own rank", () => {
    const branchAdmin = acct("a", "BRANCH_ADMIN", { branchId: "b1" });
    expect(resetRefusal(branchAdmin, acct("o", "ORGANIZATION_ADMIN", { branchId: "b1" }))).toMatch(/cannot set/);
    expect(resetRefusal(branchAdmin, acct("x", "BRANCH_ADMIN", { branchId: "b1" }))).toMatch(/cannot set/);
    expect(resetRefusal(acct("o", "ORGANIZATION_ADMIN"), acct("s", "SUPER_ADMIN"))).toMatch(/cannot set/);
  });

  it("keeps an admin inside their own organisation", () => {
    expect(resetRefusal(acct("a", "ORGANIZATION_ADMIN"), acct("t", "TEACHER", { organizationId: "org2" }))).toMatch(
      /another organisation/,
    );
  });

  it("keeps a branch admin inside their own branch", () => {
    const branchAdmin = acct("a", "BRANCH_ADMIN", { branchId: "b1" });
    expect(resetRefusal(branchAdmin, acct("t", "TEACHER", { branchId: "b1" }))).toBeNull();
    expect(resetRefusal(branchAdmin, acct("t", "TEACHER", { branchId: "b2" }))).toMatch(/another branch/);
  });

  // The hole this closes: two accounts that both lack the claim would match
  // on `undefined === undefined`.
  it("does not treat two missing organisations as the same one", () => {
    const noOrg = { id: "a", role: "ORGANIZATION_ADMIN" };
    expect(resetRefusal(noOrg, { id: "t", role: "TEACHER" })).toMatch(/not attached to an organisation/);
  });

  it("does not treat two missing branches as the same one", () => {
    const noBranch = acct("a", "BRANCH_ADMIN");
    expect(resetRefusal(noBranch, acct("t", "TEACHER"))).toMatch(/not attached to a branch/);
  });

  // An account made in the Supabase dashboard carries no role. It is not
  // assumed to be the lowest rank.
  it("does not assume an account with no role is a junior one", () => {
    expect(resetRefusal(acct("a", "ORGANIZATION_ADMIN"), acct("t", undefined))).toMatch(/only a super admin/);
    expect(resetRefusal(acct("s", "SUPER_ADMIN"), acct("t", undefined))).toBeNull();
  });

  it("lets a super admin reset anyone, anywhere", () => {
    const superAdmin = { id: "s", role: "SUPER_ADMIN" };
    expect(resetRefusal(superAdmin, acct("o", "ORGANIZATION_ADMIN", { organizationId: "org9" }))).toBeNull();
  });

  it("lets anyone change their own password", () => {
    expect(resetRefusal(acct("a", "BRANCH_ADMIN", { branchId: "b1" }), acct("a", "BRANCH_ADMIN"))).toBeNull();
  });

  it("refuses a caller who is not an admin", () => {
    expect(resetRefusal(acct("t", "TEACHER"), acct("s", "STUDENT"))).toMatch(/only an admin/i);
  });
});
