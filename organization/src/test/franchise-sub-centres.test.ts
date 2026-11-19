import fs from "node:fs";
import path from "node:path";
import { describe, it, expect } from "vitest";
import { codePrefix, loginIdFromCode, nextBranchCode, stateCode } from "@/lib/branchCode";
import { canAccess } from "@/lib/navigation";

/** A new centre's code is made for it, and a centre may add a centre. */
describe("Centre codes", () => {
  it("follow the academy's pattern and number after every code given", () => {
    expect(nextBranchCode("Bihar", "Ara", ["COCA/BR/AR/001"])).toBe("COCA/BR/AR/002");
    expect(nextBranchCode("Uttar Pradesh", "Varanasi", ["COCA/BR/AR/001", "COCA/BR/PA/007"])).toBe("COCA/UP/VA/008");
    expect(nextBranchCode("Bihar", "Patna", [])).toBe("COCA/BR/PA/001");
  });

  it("know the states' two-letter codes", () => {
    expect(stateCode("bihar")).toBe("BR");
    expect(stateCode("West Bengal")).toBe("WB");
    expect(stateCode("Jammu & Kashmir")).toBe("JK");
  });

  it("give the database the start of the code to number", () => {
    expect(codePrefix("Bihar", "Ara")).toBe("COCA/BR/AR/");
    expect(codePrefix("Bihar", "Ara")).toMatch(/^COCA\/[A-Z]{2}\/[A-Z]{2}\/$/);
  });

  it("make the login ID from the code", () => {
    expect(loginIdFromCode("COCA/BR/AR/002")).toBe("coca-br-ar-002");
  });
});

describe("A centre adding a centre", () => {
  it("can open Add Franchise", () => {
    expect(canAccess("franchise", "/branch/create")).toBe(true);
  });

  it("goes through create_sub_centre, which sets the code, organisation and creator itself", () => {
    const sql = fs.readFileSync(path.join(process.cwd(), "supabase/schema/franchise-sub-centres.sql"), "utf8");
    expect(sql).toMatch(/p_branch - 'id' - 'organizationId' - 'code' - 'createdByBranchId'/);
    expect(sql).toMatch(/jwt_role\(\) not in \('BRANCH_ADMIN'\)/);
    expect(sql).toMatch(/revoke all on function public\.insert_json_row/);
  });

  it("may make only the first login of a centre it added", () => {
    const fn = fs.readFileSync(path.join(process.cwd(), "supabase/functions/create-branch-user/index.ts"), "utf8");
    expect(fn).toMatch(/branch\.createdByBranchId !== callerApp\.branchId/);
    expect(fn).toMatch(/if \(!isAdmin\) return json\(\{ error: "This centre already has a login/);
  });
});
