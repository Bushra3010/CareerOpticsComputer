/**
 * ID card templates, shared by the designer (/cards/id-template) and the bulk
 * generator (/cards/generate-id) so a template saved in one is printable from
 * the other.
 */

export interface IdCardTemplate {
  id: string;
  name: string;
  orientation: "portrait" | "landscape";
  accent: string;
  instituteName: string;
  instituteAddress: string;
  /** Labels from `ID_CARD_FIELDS` printed on the card. */
  fields: string[];
  showPhoto: boolean;
  showQr: boolean;
  showSignature: boolean;
  validUntil: string;
  status: "active" | "draft";
}

export interface IdCardStudent {
  id: string;
  name: string;
  class: string;
  section: string;
  rollNo: string;
  photo: boolean;
  dob: string;
  bloodGroup: string;
  parentContact: string;
  address: string;
}

export const ID_CARD_TEMPLATES_KEY = "erp-id-card-templates";

export const ID_CARD_FIELDS = [
  "Student Name",
  "Student ID",
  "Class & Section",
  "Roll Number",
  "Date of Birth",
  "Blood Group",
  "Parent Contact",
  "Address",
  "Valid Until",
];

export const DEFAULT_ID_FIELDS = [
  "Student Name",
  "Student ID",
  "Class & Section",
  "Roll Number",
  "Blood Group",
  "Valid Until",
];

export const ACCENT_OPTIONS = [
  { label: "Blue", value: "#1d4ed8" },
  { label: "Green", value: "#15803d" },
  { label: "Red", value: "#b91c1c" },
  { label: "Purple", value: "#6d28d9" },
  { label: "Slate", value: "#334155" },
];


export const blankIdCardTemplate = (): Omit<IdCardTemplate, "id"> => ({
  name: "",
  orientation: "portrait",
  accent: ACCENT_OPTIONS[0].value,
  instituteName: "",
  instituteAddress: "",
  fields: [...DEFAULT_ID_FIELDS],
  showPhoto: true,
  showQr: true,
  showSignature: true,
  validUntil: "",
  status: "draft",
});

/** Resolve a field label against a student record — the single source of truth
 *  for what each label prints, used by the canvas, the print sheet and the PDF. */
export function fieldValue(
  label: string,
  student: IdCardStudent,
  template: Pick<IdCardTemplate, "validUntil">,
): string {
  switch (label) {
    case "Student Name": return student.name;
    case "Student ID": return student.id;
    case "Class & Section": return `${student.class} - ${student.section}`;
    case "Roll Number": return student.rollNo;
    case "Date of Birth": return student.dob;
    case "Blood Group": return student.bloodGroup;
    case "Parent Contact": return student.parentContact;
    case "Address": return student.address;
    case "Valid Until": return template.validUntil;
    default: return "—";
  }
}

const escapeHtml = (value: string) =>
  value.replace(/[&<>"]/g, (char) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[char] ?? char,
  );

/** One card as standalone HTML, for the print sheet. */
export function idCardHtml(template: IdCardTemplate, student: IdCardStudent) {
  const rows = template.fields
    .filter((label) => label !== "Student Name")
    .map(
      (label) =>
        `<tr><td style="color:#6b7280;padding:1px 6px 1px 0;font-size:9px">${escapeHtml(label)}</td>` +
        `<td style="font-weight:600;font-size:9px">${escapeHtml(fieldValue(label, student, template))}</td></tr>`,
    )
    .join("");

  const width = template.orientation === "portrait" ? 204 : 324;
  const height = template.orientation === "portrait" ? 324 : 204;

  return `
    <div style="width:${width}px;height:${height}px;border:1px solid #d4d4d8;border-radius:8px;overflow:hidden;font-family:system-ui,sans-serif;display:inline-block;vertical-align:top;margin:0 8px 8px 0">
      <div style="background:${template.accent};color:#fff;padding:8px 10px">
        <p style="margin:0;font-size:12px;font-weight:700">${escapeHtml(template.instituteName)}</p>
        <p style="margin:0;font-size:8px;opacity:.85">${escapeHtml(template.instituteAddress)}</p>
      </div>
      <div style="padding:8px 10px;display:flex;gap:8px">
        ${template.showPhoto ? `<div style="width:52px;height:62px;border:1px solid #d4d4d8;border-radius:4px;display:flex;align-items:center;justify-content:center;font-size:8px;color:#9ca3af;flex:none">${student.photo ? "PHOTO" : "NO PHOTO"}</div>` : ""}
        <div style="flex:1;min-width:0">
          ${template.fields.includes("Student Name") ? `<p style="margin:0 0 4px;font-size:12px;font-weight:700">${escapeHtml(student.name)}</p>` : ""}
          <table style="border-collapse:collapse;width:100%">${rows}</table>
        </div>
      </div>
      <div style="padding:0 10px;display:flex;align-items:flex-end;justify-content:space-between">
        ${template.showQr ? `<div style="width:40px;height:40px;border:1px solid #d4d4d8;border-radius:4px;display:flex;align-items:center;justify-content:center;font-size:7px;color:#9ca3af">QR</div>` : "<span></span>"}
        ${template.showSignature ? `<div style="text-align:center"><div style="width:70px;border-top:1px solid #111"></div><span style="font-size:7px;color:#6b7280">Principal</span></div>` : ""}
      </div>
    </div>`;
}

/** The full print sheet for a batch of students. */
export const idCardSheetHtml = (template: IdCardTemplate, students: IdCardStudent[]) =>
  `<div style="display:flex;flex-wrap:wrap">${students
    .map((student) => idCardHtml(template, student))
    .join("")}</div>`;
