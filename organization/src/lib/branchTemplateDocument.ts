import { printDesignPages } from "@/lib/export";

/**
 * The centre certificate: what the office prints to say a branch is an
 * authorised study centre. The designer's franchise certificate replaces
 * this layout once its blank artwork arrives; until then the standard sheet
 * below is printed for every branch.
 */

type TokenData = Record<string, string>;

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

  const data: TokenData = {};
  for (const [key, value] of Object.entries({ ...filled, ...extra })) {
    if (value) data[key] = value;
  }
  return data;
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
