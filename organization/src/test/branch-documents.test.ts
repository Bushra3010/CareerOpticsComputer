import { describe, it, expect, vi } from "vitest";
import { starterDesign } from "@/lib/documentDesigner";
import type { DocumentTemplate } from "@/lib/supabase/documentTemplates";

vi.mock("@/lib/supabase/client", () => ({ supabase: {}, supabaseUrl: "https://project.supabase.co" }));

const { assignedBranchDesign, branchTokens, standardCentreCertificateHtml } = await import("@/lib/branchTemplateDocument");

const template = (id: string, kind: DocumentTemplate["kind"], isDefault = false): DocumentTemplate => ({
  id,
  organizationId: "org1",
  kind,
  name: `Template ${id}`,
  design: starterDesign(kind),
  isDefault,
});

const TEMPLATES = [
  template("t1", "centre-certificate", true),
  template("t2", "branch-award"),
  template("t3", "certificate"),
];

describe("assignedBranchDesign", () => {
  it("gives a branch the centre certificate it was assigned", () => {
    const found = assignedBranchDesign("centre-certificate", TEMPLATES, { b1: { "centre-certificate": "t1" } }, "b1");
    expect(found?.template.id).toBe("t1");
  });

  // An authorisation nobody gave must not be printable just because the
  // organisation has a default for the kind.
  it("gives a branch with no assignment nothing, default or not", () => {
    expect(assignedBranchDesign("centre-certificate", TEMPLATES, {}, "b2")).toBeNull();
    expect(
      assignedBranchDesign("centre-certificate", TEMPLATES, { b1: { "centre-certificate": "t1" } }, "b2"),
    ).toBeNull();
  });

  it("ignores an assignment that points at a template of another kind or one since deleted", () => {
    expect(assignedBranchDesign("centre-certificate", TEMPLATES, { b1: { "centre-certificate": "t3" } }, "b1")).toBeNull();
    expect(assignedBranchDesign("centre-certificate", TEMPLATES, { b1: { "centre-certificate": "gone" } }, "b1")).toBeNull();
  });
});

describe("branchTokens", () => {
  it("fills the certificate from the branch's own record", () => {
    const data = branchTokens(
      {
        name: "Digiskills Infotech",
        code: "DSI-01",
        academicYear: "2026-27",
        address: { streetAddress: "Main Road", city: "Patna", state: "Bihar", pincode: "800001" },
        director: { name: "R. Singh" },
        license: { expiryDate: "2027-03-31T00:00:00.000Z" },
      },
      "Career Optics Computer Centre",
    );
    expect(data).toMatchObject({
      branch_name: "Digiskills Infotech",
      centre_code: "DSI-01",
      certificate_id: "DSI-01",
      academic_year: "2026-27",
      address: "Main Road, Patna, Bihar, 800001",
      centre_head: "R. Singh",
      institute: "Career Optics Computer Centre",
      photo: "",
    });
    expect(data.valid_until).toMatch(/2027/);
  });

  it("keeps the sample value for what the record cannot answer", () => {
    const data = branchTokens({ name: "Digiskills Infotech" }, "Career Optics Computer Centre");
    expect(data.branch_name).toBe("Digiskills Infotech");
    expect(data.centre_code).toBeTruthy();
  });
});

describe("standardCentreCertificateHtml", () => {
  it("prints the branch's own record, leaving out what it does not have", () => {
    const html = standardCentreCertificateHtml(
      { name: "PNS <Computer> Academy", code: "PNS01", address: { city: "Patepur", state: "Bihar" }, director: null, license: null },
      "Pushpak",
    );
    expect(html).toContain("PNS &lt;Computer&gt; Academy");
    expect(html).toContain("PNS01");
    expect(html).toContain("Patepur, Bihar");
    expect(html).toContain("authorised study centre of Pushpak");
    // No sample stands in for a missing centre head or licence.
    expect(html).not.toContain("Centre head");
    expect(html).not.toContain("Valid until");
  });
});
