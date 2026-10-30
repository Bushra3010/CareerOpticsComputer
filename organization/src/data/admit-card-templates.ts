/**
 * Admit card templates, shared by the designer (/cards/admit-template) and the
 * bulk generator (/cards/generate-admit) so a template saved in one is
 * printable from the other.
 */

export interface AdmitCardTemplate {
  id: string;
  name: string;
  /** `value` of an entry in `EXAMS`. */
  exam: string;
  liveExam?: Exam;
  institute?: { name: string; address: string };
  status: "active" | "draft";
  size: "a4" | "a5" | "letter";
  showQr: boolean;
  showPhoto: boolean;
  showSchedule: boolean;
  /** Labels from `ADMIT_CARD_ELEMENTS` that are placed on the card. */
  elements: string[];
}

export interface AdmitCardStudent {
  id: string;
  name: string;
  class: string;
  section: string;
  rollNo: string;
  feeStatus: "paid" | "pending" | "overdue";
  photo?: string;
  qr?: string;
}

export interface ExamSlot {
  subject: string;
  when: string;
}

export interface Exam {
  value: string;
  label: string;
  /** Human-readable exam window, printed as "Exam Date". */
  window: string;
  schedule: ExamSlot[];
}

export const ADMIT_CARD_TEMPLATES_KEY = "erp-admit-card-templates";

export const INSTITUTE = {
  name: "Career Optics Computer Centre",
  address: "12 MG Road, Pune - 411001",
};

/** A readable date `offset` days from today — fixtures must stay near "now". */
const readable = (offset: number) =>
  new Date(Date.now() + offset * 86_400_000).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

const window_ = (from: number, to: number) => `${readable(from)} - ${readable(to)}`;

export const EXAMS: Exam[] = [
  {
    value: "midterm",
    label: "Mid-Term Examination",
    window: window_(10, 20),
    schedule: [
      { subject: "Mathematics", when: `${readable(10)}, 9:00 AM` },
      { subject: "Science", when: `${readable(12)}, 9:00 AM` },
      { subject: "English", when: `${readable(14)}, 9:00 AM` },
      { subject: "Social Studies", when: `${readable(17)}, 9:00 AM` },
      { subject: "Hindi", when: `${readable(20)}, 9:00 AM` },
    ],
  },
  {
    value: "final",
    label: "Final Examination",
    window: window_(70, 85),
    schedule: [
      { subject: "Mathematics", when: `${readable(70)}, 10:00 AM` },
      { subject: "Science", when: `${readable(74)}, 10:00 AM` },
      { subject: "English", when: `${readable(78)}, 10:00 AM` },
      { subject: "Social Studies", when: `${readable(81)}, 10:00 AM` },
      { subject: "Hindi", when: `${readable(85)}, 10:00 AM` },
    ],
  },
  {
    value: "unit",
    label: "Unit Test 3",
    window: readable(4),
    schedule: [
      { subject: "Mathematics", when: `${readable(4)}, 11:00 AM` },
      { subject: "Science", when: `${readable(4)}, 1:00 PM` },
    ],
  },
];

export const findExam = (value: string) => EXAMS.find((exam) => exam.value === value);

/** Labels the designer can place; the ones `fieldValue` resolves are text fields. */
export const ADMIT_CARD_ELEMENTS = [
  { label: "Student Name", type: "text" },
  { label: "Student ID", type: "text" },
  { label: "Roll Number", type: "text" },
  { label: "Class & Section", type: "text" },
  { label: "Exam Name", type: "text" },
  { label: "Exam Date", type: "text" },
  { label: "Student Photo", type: "image" },
  { label: "School Logo", type: "image" },
  { label: "QR Code", type: "qr" },
  { label: "Exam Schedule", type: "table" },
  { label: "Instructions", type: "textarea" },
] as const;

export const DEFAULT_ELEMENTS = [
  "Student Name",
  "Student ID",
  "Roll Number",
  "Class & Section",
  "Exam Name",
  "Exam Date",
  "School Logo",
];

export const PAGE_SIZES = [
  { value: "a4", label: "A4 Size" },
  { value: "a5", label: "A5 Size" },
  { value: "letter", label: "Letter" },
] as const;

export const ADMIT_CARD_TEMPLATE_SEED: AdmitCardTemplate[] = [
  { id: "1", name: "Mid-Term Exam Template", exam: "midterm", status: "active", size: "a4", showQr: true, showPhoto: true, showSchedule: true, elements: DEFAULT_ELEMENTS },
  { id: "2", name: "Final Exam Template", exam: "final", status: "draft", size: "a4", showQr: false, showPhoto: true, showSchedule: true, elements: DEFAULT_ELEMENTS },
  { id: "3", name: "Unit Test Template", exam: "unit", status: "active", size: "a5", showQr: true, showPhoto: false, showSchedule: false, elements: ["Student Name", "Roll Number", "Exam Name", "Exam Date"] },
];

export const ADMIT_CARD_STUDENTS: AdmitCardStudent[] = [
  { id: "STU001", name: "Rahul Sharma", class: "10th", section: "A", rollNo: "101", feeStatus: "paid" },
  { id: "STU002", name: "Priya Patel", class: "10th", section: "A", rollNo: "102", feeStatus: "paid" },
  { id: "STU003", name: "Amit Kumar", class: "10th", section: "B", rollNo: "103", feeStatus: "pending" },
  { id: "STU004", name: "Sneha Gupta", class: "9th", section: "A", rollNo: "201", feeStatus: "paid" },
  { id: "STU005", name: "Vikram Singh", class: "9th", section: "B", rollNo: "202", feeStatus: "overdue" },
  { id: "STU006", name: "Anita Desai", class: "8th", section: "A", rollNo: "301", feeStatus: "paid" },
];

/** The record the designer canvas renders, so the layout is never empty. */
export const SAMPLE_STUDENT: AdmitCardStudent = ADMIT_CARD_STUDENTS[0];

export const INSTRUCTIONS =
  "Carry this admit card and a valid photo ID to every session. Reach the centre 30 minutes before the reporting time.";

export const blankAdmitCardTemplate = (): Omit<AdmitCardTemplate, "id"> => ({
  name: "",
  exam: "",
  status: "draft",
  size: "a4",
  showQr: true,
  showPhoto: true,
  showSchedule: true,
  elements: [...DEFAULT_ELEMENTS],
});

/** Resolve a field label against a student — the single source of truth for what
 *  each label prints, used by the canvas, the print sheet and the PDF. */
export function fieldValue(
  label: string,
  student: AdmitCardStudent,
  exam: Exam | undefined,
): string | null {
  switch (label) {
    case "Student Name": return student.name;
    case "Student ID": return student.id;
    case "Roll Number": return student.rollNo;
    case "Class & Section": return `${student.class} - ${student.section}`;
    case "Exam Name": return exam?.label ?? "Examination";
    case "Exam Date": return exam?.window ?? "To be announced";
    default: return null;
  }
}

const escapeHtml = (value: string) =>
  value.replace(/[&<>"]/g, (char) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[char] ?? char,
  );

/** One admit card as standalone HTML, for the preview dialog and the print sheet. */
export function admitCardHtml(
  template: AdmitCardTemplate,
  student: AdmitCardStudent,
  options: { pageBreak?: boolean } = {},
) {
  const exam = template.liveExam || findExam(template.exam);
  const institute = template.institute || INSTITUTE;
  const rows = template.elements
    .map((label) => [label, fieldValue(label, student, exam)] as const)
    .filter(([, value]) => value !== null)
    .map(
      ([label, value]) =>
        `<tr><td style="border:0;padding:2px 8px 2px 0;color:#6b7280;font-size:11px">${escapeHtml(label)}</td>` +
        `<td style="border:0;padding:2px 0;font-weight:600;font-size:11px">${escapeHtml(value as string)}</td></tr>`,
    )
    .join("");

  const schedule =
    template.showSchedule && exam
      ? `<div style="border:1px solid #d4d4d8;border-radius:6px;padding:8px;margin-bottom:12px">
           <p style="margin:0 0 6px;font-size:10px;font-weight:700;letter-spacing:.04em">EXAM SCHEDULE</p>
           <table style="border-collapse:collapse;width:100%">${exam.schedule
             .map(
               (slot) =>
                 `<tr><td style="border:0;padding:1px 0;font-size:10px">${escapeHtml(slot.subject)}</td>` +
                 `<td style="border:0;padding:1px 0;font-size:10px;text-align:right">${escapeHtml(slot.when)}</td></tr>`,
             )
             .join("")}</table>
         </div>`
      : "";

  return `
    <div style="width:420px;border:1px solid #d4d4d8;border-radius:10px;padding:16px;font-family:system-ui,sans-serif;color:#111;display:inline-block;vertical-align:top;margin:0 12px 12px 0${
      options.pageBreak ? ";page-break-after:always" : ""
    }">
      <div style="text-align:center;border-bottom:1px solid #e4e4e7;padding-bottom:10px;margin-bottom:10px">
        ${template.elements.includes("School Logo") ? `<div style="width:44px;height:44px;border-radius:50%;background:#f4f4f5;margin:0 auto 6px"></div>` : ""}
        <p style="margin:0;font-size:15px;font-weight:700">${escapeHtml(institute.name)}</p>
        <p style="margin:0;font-size:10px;color:#6b7280">${escapeHtml(institute.address)}</p>
      </div>
      <p style="margin:0 0 10px;text-align:center;font-size:11px;font-weight:700;letter-spacing:.08em">ADMIT CARD</p>
      <div style="display:flex;gap:12px;margin-bottom:12px">
        ${template.showPhoto && student.photo ? `<img src="${escapeHtml(student.photo)}" style="width:70px;height:84px;object-fit:cover;flex:none" />` : template.showPhoto ? `<div style="width:70px;height:84px;border:1px solid #d4d4d8;border-radius:4px;display:flex;align-items:center;justify-content:center;font-size:9px;color:#9ca3af;flex:none">PHOTO</div>` : ""}
        <table style="border-collapse:collapse;flex:1">${rows}</table>
      </div>
      ${schedule}
      ${template.elements.includes("Instructions") ? `<p style="margin:0 0 12px;font-size:10px;color:#6b7280">${escapeHtml(INSTRUCTIONS)}</p>` : ""}
      <div style="display:flex;align-items:flex-end;justify-content:space-between;border-top:1px solid #e4e4e7;padding-top:10px">
        ${template.showQr && student.qr ? `<img src="${escapeHtml(student.qr)}" style="width:46px;height:46px" />` : template.showQr ? `<div style="width:46px;height:46px;border:1px solid #d4d4d8;border-radius:4px;display:flex;align-items:center;justify-content:center;font-size:8px;color:#9ca3af">QR</div>` : "<span></span>"}
        <div style="text-align:center"><div style="width:96px;border-top:1px solid #111"></div><span style="font-size:9px;color:#6b7280">Principal's Signature</span></div>
      </div>
    </div>`;
}

/** The full print sheet for a batch of students, one card per page. */
export const admitCardSheetHtml = (
  template: AdmitCardTemplate,
  students: AdmitCardStudent[],
) =>
  students
    .map((student, index) =>
      admitCardHtml(template, student, { pageBreak: index < students.length - 1 }),
    )
    .join("");
