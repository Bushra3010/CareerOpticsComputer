import {
  DOCUMENT_KINDS,
  canvasSize,
  SAMPLE_DATA,
  designHtml,
  type DocumentDesign,
  type DocumentKind,
  type TokenData,
} from "@/lib/documentDesigner";
import { printDesignPages, printHtml } from "@/lib/export";
import { qrImages } from "@/lib/studentTemplateDocument";
import {
  getTemplateAssignments,
  getTemplates,
  type DocumentTemplate,
} from "@/lib/supabase/documentTemplates";

/**
 * Printing a document about a branch -- its centre certificate, its awards --
 * from the template the organisation gave it.
 *
 * These kinds were designable and assignable in the Document Designer, and then
 * nothing printed them: the branch panel had no screen for them at all, and the
 * "Center Certificate" on View Branch drew a layout of its own that ignored the
 * library. This is the join, the branch-side twin of studentTemplateDocument.
 */

/** The documents a branch holds about itself rather than about a student. */
export const BRANCH_DOCUMENT_KINDS = ["centre-certificate", "branch-award"] as const;
export type BranchDocumentKind = (typeof BRANCH_DOCUMENT_KINDS)[number];

/** A branch as `getBranchDetails` returns it: the row with its address, director and licence. */
export type BranchDetails = Record<string, unknown> & {
  name?: string;
  code?: string;
  phone?: string;
  email?: string;
  academicYear?: string;
  address?: Record<string, unknown> | null;
  director?: Record<string, unknown> | null;
  license?: Record<string, unknown> | null;
};

const longDate = (value: unknown) => {
  if (!value) return "";
  const date = new Date(String(value));
  return Number.isNaN(date.getTime())
    ? ""
    : date.toLocaleDateString("en-IN", { day: "2-digit", month: "long", year: "numeric" });
};

/** The tokens a branch document can fill from the branch's own record. */
export function branchTokens(branch: BranchDetails, institute: string, extra: TokenData = {}): TokenData {
  const address = branch.address ?? {};
  const filled: TokenData = {
    branch_name: String(branch.name ?? ""),
    centre_code: String(branch.code ?? ""),
    // The centre code is what identifies the certificate; there is no
    // separate certificate number for a branch.
    certificate_id: String(branch.code ?? ""),
    address: [address.streetAddress, address.city, address.district, address.state, address.pincode]
      .filter(Boolean)
      .join(", "),
    phone: String(branch.phone ?? ""),
    academic_year: String(branch.academicYear ?? ""),
    valid_until: longDate(branch.license?.expiryDate ?? branch.license?.validDate),
    centre_head: String(branch.director?.name ?? ""),
    issue_date: longDate(new Date()),
    institute,
  };

  // The sample values stand in only for what the record cannot answer, so a
  // half-filled template still reads as a document rather than as `{{tokens}}`.
  const data: TokenData = { ...SAMPLE_DATA };
  for (const [key, value] of Object.entries({ ...filled, ...extra })) {
    if (value) data[key] = value;
  }
  // A branch document has no student on it.
  data.photo = "";
  return data;
}

/**
 * The template a branch prints for one of its own documents, or null when it
 * has none.
 *
 * Stricter than the student documents on purpose: a branch prints only what it
 * was assigned. A centre certificate says the organisation authorised this
 * centre, so falling back to the organisation's default -- or to the only one
 * there is -- would hand every branch an authorisation nobody gave it.
 */
export function assignedBranchDesign(
  kind: BranchDocumentKind,
  templates: DocumentTemplate[],
  assignments: Record<string, Record<string, string>>,
  branchId: string,
): { template: DocumentTemplate; design: DocumentDesign } | null {
  const assignedId = assignments[branchId]?.[kind];
  const template = templates.find((item) => item.kind === kind && item.id === assignedId);
  return template ? { template, design: template.design } : null;
}

/** Every branch document assigned to this branch, fetched. */
export async function loadAssignedBranchDocuments(organizationId: string | null, branchId: string) {
  const [templates, assignments] = await Promise.all([
    getTemplates(organizationId),
    getTemplateAssignments(organizationId),
  ]);
  return BRANCH_DOCUMENT_KINDS.flatMap((kind) => {
    const found = assignedBranchDesign(kind, templates.data, assignments.data, branchId);
    return found ? [{ kind, ...found }] : [];
  });
}

/** The printable HTML of one branch document, QR codes included. */
export async function branchDocumentHtml(kind: DocumentKind, design: DocumentDesign, data: TokenData) {
  const qr = await qrImages(design, data);
  return designHtml(kind, design, data, qr);
}

/**
 * Prints one or more branches' documents, for the office.
 *
 * Each branch gets the template it was assigned -- the same rule the branch
 * itself sees -- and a branch with none gets `fallback`, the layout the caller
 * printed before templates existed, so printing never stops working.
 */
export async function printBranchDocuments<B extends BranchDetails>(
  kind: BranchDocumentKind,
  branches: B[],
  organizationId: string | null,
  institute: string,
  fallback: (branch: B) => string,
) {
  const [templates, assignments] = await Promise.all([
    getTemplates(organizationId).catch(() => ({ data: [] as DocumentTemplate[] })),
    getTemplateAssignments(organizationId).catch(() => ({ data: {} })),
  ]);
  const designed = await Promise.all(
    branches.map(async (branch) => {
      const found = assignedBranchDesign(kind, templates.data, assignments.data, String(branch.id ?? ""));
      return found ? branchDocumentHtml(kind, found.design, branchTokens(branch, institute)) : null;
    }),
  );
  const title =
    branches.length === 1 ? `Centre Certificate — ${branches[0].name ?? ""}` : `Centre Certificates — ${branches.length} branches`;

  // Nobody has a template: the built-in layout, printed the way it always was.
  if (designed.every((html) => html === null)) {
    printHtml(title, branches.map(fallback).join(""));
    return;
  }
  // One sheet size for the run: the first designed page's, which is the
  // organisation's template for this kind and so the same for every branch.
  const first = branches.map((b) => assignedBranchDesign(kind, templates.data, assignments.data, String(b.id ?? ""))).find(Boolean);
  const { width, height } = canvasSize(kind, first?.design);
  printDesignPages(
    title,
    designed.map((html, i) => html ?? fallback(branches[i])),
    width,
    height,
  );
}

const escapeHtml = (value: unknown) =>
  String(value ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);

/**
 * The standard centre certificate, for a branch the designer assigned none:
 * the office can still print one the moment it picks the branch.
 */
export function standardCentreCertificateHtml(branch: BranchDetails, institute: string) {
  const data = branchTokens(branch, institute);
  const own = (key: string, value: unknown) => (value ? data[key] : "");
  const address = branch.address ?? {};
  const rows: Array<[string, string]> = [
    ["Centre code", own("centre_code", branch.code)],
    ["Address", own("address", [address.streetAddress, address.city, address.district, address.state, address.pincode].some(Boolean))],
    ["Centre head", own("centre_head", branch.director?.name)],
    ["Valid until", own("valid_until", branch.license?.expiryDate ?? branch.license?.validDate)],
  ].filter(([, value]) => value) as Array<[string, string]>;
  return `
    <div style="box-sizing:border-box;min-height:100%;border:6px double #173653;padding:96px 56px 64px;text-align:center;font-family:Georgia,serif;color:#1f2937;background:#fff">
      <p style="letter-spacing:.3em;font-size:13px;text-transform:uppercase;color:#a77a32;margin:0">${escapeHtml(institute)}</p>
      <h1 style="margin:18px 0 4px;font-size:34px;color:#173653">Centre Certificate</h1>
      <p style="color:#6b7280;font-size:14px;margin:0">This is to certify that the centre named below is an authorised study centre of ${escapeHtml(institute)}</p>
      <h2 style="margin:36px 0 8px;font-size:28px">${escapeHtml(branch.name)}</h2>
      <table style="margin:24px auto 0;font-size:14px;border-collapse:collapse;width:auto">
        ${rows.map(([label, value]) => `<tr><td style="border:0;padding:5px 16px;text-align:right;color:#6b7280">${label}</td><td style="border:0;padding:5px 16px;text-align:left"><strong>${escapeHtml(value)}</strong></td></tr>`).join("")}
      </table>
      <div style="display:flex;justify-content:space-between;align-items:flex-end;margin-top:72px;font-size:13px">
        <span>Issued on ${escapeHtml(data.issue_date)}</span>
        <span style="border-top:1px solid #173653;padding-top:6px;min-width:180px">Authorised Signatory</span>
      </div>
    </div>
  `;
}

/** The standard centre certificate on an A4 sheet of its own, with no report heading over it. */
export function printStandardCentreCertificate(branch: BranchDetails, institute: string) {
  printDesignPages(`Centre Certificate — ${branch.name ?? ""}`, [standardCentreCertificateHtml(branch, institute)], 794, 1123);
}

/** Prints one already-drawn branch document, a sheet to itself. */
export function printBranchDocument(kind: BranchDocumentKind, title: string, html: string, design?: DocumentDesign) {
  const { width, height } = canvasSize(kind, design);
  printDesignPages(title, [html], width, height);
}
