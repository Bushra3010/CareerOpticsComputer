/**
 * Shared model for the document designer: certificates, marksheets, ID cards
 * and admit cards are all the same thing - absolutely positioned elements on a
 * fixed canvas, with `{{token}}` placeholders filled from a student record at
 * print time. Layouts are stored per document type so switching type does not
 * destroy the design you already made for another.
 */

import { DEFAULT_INSTITUTE_NAME } from "./instituteName";

/**
 * `photo` is the student's own passport photograph, the one the admission
 * collected. It is its own type rather than an `image` because the picture is
 * not part of the template: the template says where the photo goes, and every
 * card or certificate printed from it fills that box with a different face.
 */
export type ElementType = "text" | "shape" | "image" | "qr" | "photo" | "marks-table";

export interface DocElement {
  id: string;
  type: ElementType;
  x: number;
  y: number;
  width: number;
  height: number;
  text: string;
  fontSize: number;
  fontWeight: string;
  color: string;
  background: string;
  border: string;
  radius: number;
  rotate: number;
  opacity: number;
  src: string;
  align: "left" | "center" | "right";
  z: number;
}

/** How the watermark is laid over the canvas before `backgroundScale` is applied. */
export type BackgroundFit = "cover" | "contain" | "stretch" | "tile";

export const BACKGROUND_FITS: Array<{ value: BackgroundFit; label: string; hint: string }> = [
  { value: "cover", label: "Fill the page", hint: "Covers the whole canvas, cropping the overflow" },
  { value: "contain", label: "Fit inside", hint: "Whole image visible, letterboxed" },
  { value: "stretch", label: "Stretch", hint: "Forced to the canvas, ignoring its proportions" },
  { value: "tile", label: "Tile", hint: "Repeated across the page, for a seal or a crest" },
];

export interface DocumentDesign {
  elements: DocElement[];
  background: string;
  backgroundImage: string;
  /** How the mark is laid over the canvas. */
  backgroundFit: BackgroundFit;
  /** Percent. For a tile this is the width of one tile against the canvas. */
  backgroundScale: number;
  /** Where the mark sits, 0-100 across and down the canvas. */
  backgroundX: number;
  backgroundY: number;
  /** 0-1. A watermark is a watermark because it is faint. */
  backgroundOpacity: number;
  backgroundRotate: number;
  /**
   * Which way up the page is. Left out, a design keeps its type's own shape
   * (a certificate landscape, a marksheet portrait), so every design saved
   * before this existed opens exactly as it was.
   */
  orientation?: Orientation;
}

export type Orientation = "landscape" | "portrait";

/**
 * The defaults reproduce what the background image used to do - centred, filling
 * the page, fully opaque - so a design saved before any of this existed opens
 * looking exactly as it did.
 */
export const BACKGROUND_DEFAULTS = {
  backgroundFit: "cover" as BackgroundFit,
  backgroundScale: 100,
  backgroundX: 50,
  backgroundY: 50,
  backgroundOpacity: 1,
  backgroundRotate: 0,
};

export type DocumentKind =
  | "certificate"
  | "marksheet"
  | "student-id"
  | "staff-id"
  | "admit-card"
  | "student-award"
  | "branch-award"
  | "centre-certificate";

export interface DocumentKindMeta {
  label: string;
  icon: string;
  width: number;
  height: number;
  starter: () => DocElement[];
}

let seq = 0;

/** Ids only have to be unique inside one design, and must survive a JSON round trip. */
export function element(type: ElementType, options: Partial<DocElement> = {}): DocElement {
  seq += 1;
  return {
    id: `el_${Date.now().toString(36)}_${seq}`,
    type,
    x: 100,
    y: 100,
    width: 250,
    height: 60,
    // Empty, not "Text": the renderer used to strip that one string back out
    // again, so a box the user genuinely wanted to read "Text" came out blank.
    text: "",
    fontSize: 24,
    fontWeight: "400",
    color: "#0f172a",
    background: "transparent",
    border: "none",
    radius: 0,
    rotate: 0,
    opacity: 1,
    src: "",
    align: "center",
    z: 2,
    ...options,
  };
}

/**
 * The tokens a design may reference. Anything not listed is still substituted
 * if the caller supplies it - this is the palette shown in the sidebar, not a
 * whitelist.
 */
export const TOKEN_LABELS: Record<string, string> = {
  student_name: "Student name",
  father_name: "Father's name",
  mother_name: "Mother's name",
  course_name: "Course",
  course_duration: "Course duration",
  batch_name: "Batch",
  branch_name: "Branch",
  enrollment_no: "Enrollment no",
  application_no: "Application no",
  roll_no: "Roll no",
  certificate_id: "Certificate ID",
  issue_date: "Issue date",
  exam_name: "Exam",
  exam_date: "Exam date",
  exam_centre: "Exam centre",
  reporting_time: "Reporting time",
  dob: "Date of birth",
  blood_group: "Blood group",
  phone: "Phone",
  address: "Address",
  valid_until: "Valid until",
  total_marks: "Total marks",
  maximum_marks: "Maximum marks",
  result: "Result",
  grade: "Grade",
  percentage: "Percentage",
  institute: "Institute",
  designation: "Designation",
  photo: "Student photo",
  award_title: "Award title",
  award_reason: "Awarded for",
  academic_year: "Academic year",
  centre_code: "Centre code",
  centre_head: "Centre head",
};

export type TokenData = Record<string, string>;

export const SAMPLE_DATA: TokenData = {
  student_name: "Rahul Kumar",
  father_name: "Raj Kumar",
  mother_name: "Sunita Kumar",
  course_name: "AI Full Stack Developer",
  course_duration: "12 months",
  batch_name: "Morning Batch A",
  branch_name: "Main Branch",
  enrollment_no: "ENR-2026-0125",
  application_no: "APP-2026-0125",
  roll_no: "101",
  certificate_id: "IDS-2026-000125",
  issue_date: "06 September 2026",
  exam_name: "Semester I Examination",
  exam_date: "20 September 2026",
  exam_centre: "Main Branch, Hall 2",
  reporting_time: "09:30 AM",
  dob: "15 August 2005",
  blood_group: "O+",
  phone: "98765 43210",
  address: "12 MG Road, Pune, Maharashtra",
  valid_until: "31 March 2027",
  total_marks: "177",
  maximum_marks: "200",
  result: "Pass",
  marks_rows: JSON.stringify([["Computer Fundamentals", 100, 40, 88, "Pass"], ["Office Applications", 100, 40, 89, "Pass"]]),
  grade: "A+",
  percentage: "88.4%",
  // Overwritten from `instituteName()` wherever a document is actually drawn,
  // so the watermark and the letterhead carry the institute's own name.
  institute: DEFAULT_INSTITUTE_NAME,
  designation: "Trainer",
  award_title: "Award of Excellence",
  award_reason: "outstanding performance and conduct",
  academic_year: "2026-27",
  centre_code: "IDS-MH-014",
  centre_head: "Centre Head",
  // No sample face: the photo box draws its own placeholder when there is
  // none, which is exactly what an unfilled card looks like.
  photo: "",
};

/** `{{ student_name }}` -> the value, leaving unknown tokens visible on purpose. */
export function replaceTokens(text: string, data: TokenData): string {
  return String(text ?? "").replace(
    /\{\{(.*?)\}\}/g,
    (match, key) => data[String(key).trim()] ?? match,
  );
}

/** Every token a design actually uses, for the "unfilled tokens" warning. */
export function usedTokens(elements: DocElement[]): string[] {
  const found = new Set<string>();
  for (const el of elements) {
    for (const match of String(el.text ?? "").matchAll(/\{\{(.*?)\}\}/g)) {
      found.add(match[1].trim());
    }
  }
  return [...found].sort();
}

function border(color: string, width = 4) {
  return `${width}px solid ${color}`;
}

function certificate(): DocElement[] {
  return [
    element("shape", { x: 30, y: 30, width: 940, height: 647, border: border("#b45309", 8), radius: 5, z: 1 }),
    element("text", { x: 180, y: 85, width: 640, height: 60, text: "CERTIFICATE OF ACHIEVEMENT", fontSize: 38, fontWeight: "800", color: "#7c2d12" }),
    element("text", { x: 300, y: 175, width: 400, height: 40, text: "This certificate is proudly presented to", fontSize: 20 }),
    element("text", { x: 200, y: 225, width: 600, height: 70, text: "{{student_name}}", fontSize: 46, fontWeight: "800", color: "#1e3a8a" }),
    element("text", { x: 250, y: 320, width: 500, height: 40, text: "For successfully completing", fontSize: 20 }),
    element("text", { x: 200, y: 365, width: 600, height: 55, text: "{{course_name}}", fontSize: 30, fontWeight: "700" }),
    element("text", { x: 80, y: 550, width: 280, height: 30, text: "Certificate ID: {{certificate_id}}", fontSize: 15, align: "left" }),
    element("text", { x: 380, y: 550, width: 280, height: 30, text: "{{institute}}", fontSize: 17, fontWeight: "700" }),
    element("text", { x: 380, y: 585, width: 280, height: 30, text: "Issued {{issue_date}}", fontSize: 14, color: "#475569" }),
    element("qr", { x: 800, y: 510, width: 100, height: 100 }),
  ];
}

function marksheet(): DocElement[] {
  return [
    element("shape", { x: 20, y: 20, width: 760, height: 1060, border: border("#1e3a8a", 5), z: 1 }),
    element("text", { x: 100, y: 60, width: 600, height: 60, text: "{{institute}}", fontSize: 34, fontWeight: "800", color: "#1e3a8a" }),
    element("text", { x: 100, y: 130, width: 600, height: 50, text: "STATEMENT OF MARKS", fontSize: 28, fontWeight: "800" }),
    element("text", { x: 70, y: 220, width: 650, height: 40, text: "Student Name: {{student_name}}", fontSize: 20, align: "left" }),
    element("text", { x: 70, y: 265, width: 650, height: 40, text: "Enrollment No: {{enrollment_no}}", fontSize: 18, align: "left" }),
    element("text", { x: 70, y: 310, width: 650, height: 40, text: "Course: {{course_name}}", fontSize: 18, align: "left" }),
    element("text", { x: 70, y: 355, width: 650, height: 40, text: "Batch: {{batch_name}}", fontSize: 18, align: "left" }),
    element("marks-table", { x: 70, y: 420, width: 650, height: 320, fontSize: 16, border: "1px solid #94a3b8" }),
    element("text", { x: 70, y: 740, width: 650, height: 35, text: "Total: {{total_marks}} / {{maximum_marks}} · Result: {{result}}", fontSize: 18, align: "left" }),
    element("text", { x: 70, y: 780, width: 320, height: 40, text: "Percentage: {{percentage}}", fontSize: 20, fontWeight: "700", align: "left" }),
    element("text", { x: 400, y: 780, width: 320, height: 40, text: "Grade: {{grade}}", fontSize: 20, fontWeight: "700", align: "left" }),
    element("text", { x: 70, y: 950, width: 300, height: 30, text: "Issued {{issue_date}}", fontSize: 15, align: "left" }),
    element("qr", { x: 600, y: 900, width: 100, height: 100 }),
  ];
}

function studentId(): DocElement[] {
  return [
    element("shape", { x: 10, y: 10, width: 991, height: 618, border: border("#2563eb"), background: "#eff6ff", radius: 20, z: 1 }),
    element("text", { x: 280, y: 40, width: 450, height: 50, text: "{{institute}}", fontSize: 34, fontWeight: "800", color: "#1d4ed8" }),
    element("text", { x: 350, y: 100, width: 300, height: 40, text: "STUDENT ID CARD", fontSize: 22, fontWeight: "800" }),
    element("shape", { x: 70, y: 180, width: 190, height: 240, background: "#cbd5e1", radius: 15, text: "Photo" }),
    element("text", { x: 330, y: 175, width: 550, height: 45, text: "Name: {{student_name}}", fontSize: 24, align: "left" }),
    element("text", { x: 330, y: 230, width: 550, height: 45, text: "Course: {{course_name}}", fontSize: 20, align: "left" }),
    element("text", { x: 330, y: 285, width: 550, height: 45, text: "Enrollment: {{enrollment_no}}", fontSize: 20, align: "left" }),
    element("text", { x: 330, y: 340, width: 550, height: 45, text: "Blood group: {{blood_group}}", fontSize: 20, align: "left" }),
    element("text", { x: 70, y: 450, width: 500, height: 40, text: "Phone: {{phone}}", fontSize: 18, align: "left" }),
    element("text", { x: 70, y: 495, width: 700, height: 40, text: "{{address}}", fontSize: 16, align: "left", color: "#475569" }),
    element("text", { x: 70, y: 555, width: 400, height: 35, text: "Valid until {{valid_until}}", fontSize: 16, align: "left", fontWeight: "700" }),
    element("qr", { x: 820, y: 430, width: 120, height: 120 }),
  ];
}

function staffId(): DocElement[] {
  return [
    element("shape", { x: 10, y: 10, width: 991, height: 618, border: border("#059669"), background: "#ecfdf5", radius: 20, z: 1 }),
    element("text", { x: 280, y: 40, width: 450, height: 50, text: "{{institute}}", fontSize: 34, fontWeight: "800", color: "#047857" }),
    element("text", { x: 350, y: 100, width: 300, height: 40, text: "STAFF ID CARD", fontSize: 22, fontWeight: "800" }),
    element("shape", { x: 70, y: 180, width: 190, height: 240, background: "#cbd5e1", radius: 15, text: "Photo" }),
    element("text", { x: 330, y: 180, width: 550, height: 45, text: "Name: {{student_name}}", fontSize: 24, align: "left" }),
    element("text", { x: 330, y: 240, width: 550, height: 45, text: "Designation: {{designation}}", fontSize: 20, align: "left" }),
    element("text", { x: 330, y: 300, width: 550, height: 45, text: "Employee ID: {{certificate_id}}", fontSize: 20, align: "left" }),
    element("text", { x: 330, y: 360, width: 550, height: 45, text: "Phone: {{phone}}", fontSize: 20, align: "left" }),
    element("text", { x: 70, y: 555, width: 400, height: 35, text: "Valid until {{valid_until}}", fontSize: 16, align: "left", fontWeight: "700" }),
    element("qr", { x: 820, y: 430, width: 120, height: 120 }),
  ];
}

function admitCard(): DocElement[] {
  return [
    element("shape", { x: 20, y: 20, width: 760, height: 1060, border: border("#7c3aed", 5), z: 1 }),
    element("text", { x: 90, y: 55, width: 620, height: 55, text: "{{institute}}", fontSize: 32, fontWeight: "800", color: "#5b21b6" }),
    element("text", { x: 90, y: 120, width: 620, height: 45, text: "ADMIT CARD", fontSize: 26, fontWeight: "800" }),
    element("shape", { x: 570, y: 195, width: 150, height: 180, background: "#e2e8f0", radius: 10, text: "Photo" }),
    element("text", { x: 70, y: 200, width: 480, height: 40, text: "Name: {{student_name}}", fontSize: 20, align: "left" }),
    element("text", { x: 70, y: 245, width: 480, height: 40, text: "Roll No: {{roll_no}}", fontSize: 18, align: "left" }),
    element("text", { x: 70, y: 290, width: 480, height: 40, text: "Enrollment: {{enrollment_no}}", fontSize: 18, align: "left" }),
    element("text", { x: 70, y: 335, width: 480, height: 40, text: "Course: {{course_name}}", fontSize: 18, align: "left" }),
    element("shape", { x: 70, y: 410, width: 650, height: 230, border: "1px solid #94a3b8", background: "#faf5ff" }),
    element("text", { x: 90, y: 430, width: 610, height: 40, text: "Examination: {{exam_name}}", fontSize: 19, fontWeight: "700", align: "left" }),
    element("text", { x: 90, y: 480, width: 610, height: 40, text: "Date: {{exam_date}}", fontSize: 18, align: "left" }),
    element("text", { x: 90, y: 525, width: 610, height: 40, text: "Reporting time: {{reporting_time}}", fontSize: 18, align: "left" }),
    element("text", { x: 90, y: 570, width: 610, height: 40, text: "Centre: {{exam_centre}}", fontSize: 18, align: "left" }),
    element("text", { x: 70, y: 700, width: 650, height: 120, text: "Candidates must carry this admit card and a photo ID to the centre. Mobile phones and calculators are not permitted.", fontSize: 15, align: "left", color: "#475569" }),
    element("text", { x: 430, y: 950, width: 290, height: 35, text: "Controller of Examinations", fontSize: 15 }),
    element("qr", { x: 90, y: 900, width: 110, height: 110 }),
  ];
}

/** An award, not a completion: the course is not what is being certified, the
 *  reason for the award is -- so the middle of the page is the citation. */
function studentAward(): DocElement[] {
  return [
    element("shape", { x: 30, y: 30, width: 940, height: 647, border: border("#0f766e", 8), radius: 5, z: 1 }),
    element("text", { x: 180, y: 80, width: 640, height: 50, text: "{{institute}}", fontSize: 26, fontWeight: "700", color: "#0f766e" }),
    element("text", { x: 150, y: 135, width: 700, height: 55, text: "STUDENT AWARD", fontSize: 36, fontWeight: "800", color: "#134e4a" }),
    element("text", { x: 300, y: 205, width: 400, height: 36, text: "Presented to", fontSize: 19 }),
    element("text", { x: 180, y: 245, width: 640, height: 70, text: "{{student_name}}", fontSize: 44, fontWeight: "800", color: "#1e3a8a" }),
    element("text", { x: 200, y: 330, width: 600, height: 45, text: "{{award_title}}", fontSize: 28, fontWeight: "700", color: "#b45309" }),
    element("text", { x: 180, y: 385, width: 640, height: 40, text: "In recognition of {{award_reason}}", fontSize: 18, color: "#334155" }),
    element("text", { x: 180, y: 425, width: 640, height: 36, text: "{{course_name}} · {{batch_name}} · {{academic_year}}", fontSize: 16, color: "#475569" }),
    element("text", { x: 80, y: 550, width: 280, height: 30, text: "Certificate ID: {{certificate_id}}", fontSize: 15, align: "left" }),
    element("text", { x: 380, y: 550, width: 280, height: 30, text: "{{branch_name}}", fontSize: 17, fontWeight: "700" }),
    element("text", { x: 380, y: 585, width: 280, height: 30, text: "Issued {{issue_date}}", fontSize: 14, color: "#475569" }),
    element("text", { x: 680, y: 600, width: 240, height: 30, text: "Authorised signatory", fontSize: 14 }),
    element("qr", { x: 790, y: 480, width: 100, height: 100 }),
  ];
}

/** The same award, given to a branch rather than a student -- so the name in
 *  the middle is the branch, and the citation is its year's performance. */
function branchAward(): DocElement[] {
  return [
    element("shape", { x: 30, y: 30, width: 940, height: 647, border: border("#1d4ed8", 8), radius: 5, z: 1 }),
    element("text", { x: 180, y: 80, width: 640, height: 50, text: "{{institute}}", fontSize: 26, fontWeight: "700", color: "#1d4ed8" }),
    element("text", { x: 150, y: 135, width: 700, height: 55, text: "BRANCH AWARD", fontSize: 36, fontWeight: "800", color: "#1e3a8a" }),
    element("text", { x: 300, y: 205, width: 400, height: 36, text: "Awarded to the branch", fontSize: 19 }),
    element("text", { x: 180, y: 245, width: 640, height: 70, text: "{{branch_name}}", fontSize: 42, fontWeight: "800", color: "#1e3a8a" }),
    element("text", { x: 200, y: 330, width: 600, height: 45, text: "{{award_title}}", fontSize: 28, fontWeight: "700", color: "#b45309" }),
    element("text", { x: 180, y: 385, width: 640, height: 40, text: "For {{award_reason}}", fontSize: 18, color: "#334155" }),
    element("text", { x: 180, y: 425, width: 640, height: 36, text: "Academic year {{academic_year}} · Centre code {{centre_code}}", fontSize: 16, color: "#475569" }),
    element("text", { x: 80, y: 550, width: 280, height: 30, text: "Certificate ID: {{certificate_id}}", fontSize: 15, align: "left" }),
    element("text", { x: 380, y: 550, width: 280, height: 30, text: "{{institute}}", fontSize: 17, fontWeight: "700" }),
    element("text", { x: 380, y: 585, width: 280, height: 30, text: "Issued {{issue_date}}", fontSize: 14, color: "#475569" }),
    element("text", { x: 680, y: 600, width: 240, height: 30, text: "Authorised signatory", fontSize: 14 }),
    element("qr", { x: 790, y: 480, width: 100, height: 100 }),
  ];
}

/** What a franchised centre puts on its wall: that it is authorised to run the
 *  institute's courses, for a stated period. */
function centreCertificate(): DocElement[] {
  return [
    element("shape", { x: 30, y: 30, width: 940, height: 647, border: border("#7c2d12", 8), radius: 5, z: 1 }),
    element("text", { x: 180, y: 75, width: 640, height: 50, text: "{{institute}}", fontSize: 26, fontWeight: "700", color: "#7c2d12" }),
    element("text", { x: 130, y: 130, width: 740, height: 55, text: "CERTIFICATE OF AUTHORISATION", fontSize: 32, fontWeight: "800", color: "#7c2d12" }),
    element("text", { x: 230, y: 200, width: 540, height: 36, text: "This is to certify that the centre", fontSize: 19 }),
    element("text", { x: 180, y: 240, width: 640, height: 65, text: "{{branch_name}}", fontSize: 40, fontWeight: "800", color: "#1e3a8a" }),
    element("text", { x: 180, y: 315, width: 640, height: 36, text: "{{address}}", fontSize: 16, color: "#475569" }),
    element("text", { x: 180, y: 360, width: 640, height: 70, text: "is an authorised centre of {{institute}} and may conduct its courses and examinations for the academic year {{academic_year}}.", fontSize: 17, color: "#334155" }),
    element("text", { x: 180, y: 445, width: 640, height: 36, text: "Centre code {{centre_code}} · Valid until {{valid_until}}", fontSize: 16, fontWeight: "700" }),
    element("text", { x: 80, y: 550, width: 280, height: 30, text: "Certificate ID: {{certificate_id}}", fontSize: 15, align: "left" }),
    element("text", { x: 380, y: 550, width: 280, height: 30, text: "{{centre_head}}", fontSize: 17, fontWeight: "700" }),
    element("text", { x: 380, y: 585, width: 280, height: 30, text: "Issued {{issue_date}}", fontSize: 14, color: "#475569" }),
    element("qr", { x: 790, y: 480, width: 100, height: 100 }),
  ];
}

export const DOCUMENT_KINDS: Record<DocumentKind, DocumentKindMeta> = {
  certificate: { label: "Certificate", icon: "🏆", width: 1000, height: 707, starter: certificate },
  marksheet: { label: "Marksheet", icon: "📊", width: 800, height: 1100, starter: marksheet },
  "student-id": { label: "Student ID card", icon: "🎓", width: 1011, height: 638, starter: studentId },
  "staff-id": { label: "Staff ID card", icon: "👨‍🏫", width: 1011, height: 638, starter: staffId },
  "admit-card": { label: "Admit card", icon: "📝", width: 800, height: 1100, starter: admitCard },
  "student-award": { label: "Student award certificate", icon: "🎖️", width: 1000, height: 707, starter: studentAward },
  "branch-award": { label: "Branch award certificate", icon: "🏅", width: 1000, height: 707, starter: branchAward },
  "centre-certificate": { label: "Centre certificate", icon: "🏛️", width: 1000, height: 707, starter: centreCertificate },
};

/** The order the picker offers them in: course paperwork first, then the
 *  awards. Every kind belongs here, or it exists but cannot be chosen. */
export const KIND_ORDER = Object.keys(DOCUMENT_KINDS) as DocumentKind[];

export const DESIGN_STORAGE_KEY = "document-designer";

const naturalOrientation = (kind: DocumentKind): Orientation =>
  DOCUMENT_KINDS[kind].width >= DOCUMENT_KINDS[kind].height ? "landscape" : "portrait";

/** Which way up this design is printed. */
export function designOrientation(kind: DocumentKind, design?: Pick<DocumentDesign, "orientation"> | null): Orientation {
  return design?.orientation ?? naturalOrientation(kind);
}

/** The canvas this design is drawn on: the type's size, turned if the design is. */
export function canvasSize(kind: DocumentKind, design?: Pick<DocumentDesign, "orientation"> | null) {
  const { width, height } = DOCUMENT_KINDS[kind];
  return designOrientation(kind, design) === naturalOrientation(kind) ? { width, height } : { width: height, height: width };
}

/**
 * The same design on a page turned the other way. Every box keeps its place
 * relative to the page -- a heading a third of the way down stays a third of
 * the way down -- and text shrinks by the narrower side's ratio so it still
 * fits its box. Nothing is lost: turning back restores the layout to within
 * rounding.
 */
export function reorient(kind: DocumentKind, design: DocumentDesign, orientation: Orientation): DocumentDesign {
  if (designOrientation(kind, design) === orientation) return design;
  const from = canvasSize(kind, design);
  const to = canvasSize(kind, { orientation });
  const sx = to.width / from.width;
  const sy = to.height / from.height;
  const font = Math.min(sx, sy);
  return {
    ...design,
    orientation,
    elements: design.elements.map((el) => ({
      ...el,
      x: Math.round(el.x * sx),
      y: Math.round(el.y * sy),
      width: Math.max(1, Math.round(el.width * sx)),
      height: Math.max(1, Math.round(el.height * sy)),
      fontSize: Math.max(6, Math.round(el.fontSize * font)),
    })),
  };
}

export function starterDesign(kind: DocumentKind): DocumentDesign {
  return {
    elements: DOCUMENT_KINDS[kind].starter(),
    background: "#ffffff",
    backgroundImage: "",
    ...BACKGROUND_DEFAULTS,
  };
}

/**
 * The watermark, as a layer of its own.
 *
 * It cannot be the canvas's own `background-image`: a background cannot be
 * faded or turned on its own, and putting `opacity` on the canvas would take
 * every element standing on it down with the mark. Scale is applied through
 * the tile size when tiling and through a transform otherwise, because
 * `background-size: cover` has no factor to multiply.
 */
export function watermarkStyle(design: DocumentDesign): Record<string, string | number> {
  const scale = Math.max(1, Number(design.backgroundScale) || 100) / 100;
  const tiling = design.backgroundFit === "tile";
  const size = tiling
    ? `${scale * 25}% auto`
    : design.backgroundFit === "stretch"
      ? "100% 100%"
      : design.backgroundFit === "contain"
        ? "contain"
        : "cover";
  const turn = `rotate(${Number(design.backgroundRotate) || 0}deg)`;
  return {
    position: "absolute",
    left: "0",
    top: "0",
    width: "100%",
    height: "100%",
    backgroundImage: `url('${design.backgroundImage}')`,
    backgroundRepeat: tiling ? "repeat" : "no-repeat",
    backgroundSize: size,
    backgroundPosition: `${design.backgroundX ?? 50}% ${design.backgroundY ?? 50}%`,
    opacity: design.backgroundOpacity ?? 1,
    transform: tiling ? turn : `${turn} scale(${scale})`,
    transformOrigin: "center",
    // The mark is scenery: it must never swallow a click meant for an element.
    pointerEvents: "none",
    zIndex: 0,
  };
}

/** `backgroundSize` -> `background-size`, for the printable string form. */
export function styleText(style: Record<string, string | number>): string {
  return Object.entries(style)
    .map(([key, value]) => `${key.replace(/[A-Z]/g, (c) => `-${c.toLowerCase()}`)}:${value}`)
    .join(";");
}

/** Designs live per kind, so switching type never discards the other layouts. */
export function loadDesigns(): Partial<Record<DocumentKind, DocumentDesign>> {
  try {
    const raw = localStorage.getItem(DESIGN_STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") return {};
    const all = parsed as Partial<Record<DocumentKind, DocumentDesign>>;
    for (const design of Object.values(all)) {
      if (!design) continue;
      design.background ||= "#ffffff";
      design.backgroundImage ??= "";
      // A design stored before the watermark controls existed has none of these.
      // `??=` and not `||=`: a mark faded to nothing, or turned to zero, is a
      // setting somebody chose and must survive being reopened.
      design.backgroundFit ??= BACKGROUND_DEFAULTS.backgroundFit;
      design.backgroundScale ??= BACKGROUND_DEFAULTS.backgroundScale;
      design.backgroundX ??= BACKGROUND_DEFAULTS.backgroundX;
      design.backgroundY ??= BACKGROUND_DEFAULTS.backgroundY;
      design.backgroundOpacity ??= BACKGROUND_DEFAULTS.backgroundOpacity;
      design.backgroundRotate ??= BACKGROUND_DEFAULTS.backgroundRotate;
      design.elements = (design.elements ?? []).map((el) => ({
        ...element(el.type ?? "text"),
        ...el,
      }));
    }
    return all;
  } catch {
    return {};
  }
}

export function saveDesigns(all: Partial<Record<DocumentKind, DocumentDesign>>) {
  localStorage.setItem(DESIGN_STORAGE_KEY, JSON.stringify(all));
}

/** Marks cells are escaped as text; template data cannot inject markup. */
export function marksTableRowHeight(data: TokenData, width = 650, fontSize = 16): number {
  let rows: unknown[][] = [];
  try { rows = JSON.parse(data.marks_rows || "[]"); } catch { return 32; }
  if (!Array.isArray(rows)) return 32;
  return Math.max(32, ...rows.filter(Array.isArray).flatMap((row) => row.slice(0, 5).map((value, i) => {
    const chars = Math.max(1, Math.floor((width * (i ? 0.14 : 0.44) - 10) / (fontSize * 0.6)));
    return Math.ceil(String(value ?? "").length / chars) * fontSize * 1.25 + 8;
  })));
}
export function marksTableHtml(data: TokenData, width = 650, fontSize = 16): string {
  const escape = (s: unknown) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);
  let rows: unknown[][] = [];
  try { const parsed = JSON.parse(data.marks_rows || "[]"); if (Array.isArray(parsed)) rows = parsed.filter(Array.isArray); } catch { /* empty table */ }
  const rowHeight = marksTableRowHeight(data, width, fontSize);
  return `<table style="width:100%;border-collapse:collapse;table-layout:fixed;font:inherit;color:inherit"><thead><tr style="height:40px;background:#f1f5f9">${["Subject", "Max", "Pass", "Marks", "Result"].map((h, i) => `<th style="width:${i ? 14 : 44}%;padding:4px;text-align:${i ? "center" : "left"};border:1px solid #cbd5e1">${h}</th>`).join("")}</tr></thead><tbody>${rows.map((r) => `<tr style="height:${rowHeight}px">${r.slice(0, 5).map((v, i) => `<td style="padding:4px;border:1px solid #cbd5e1;text-align:${i ? "center" : "left"};white-space:normal;overflow-wrap:anywhere;line-height:1.25">${escape(v)}</td>`).join("")}</tr>`).join("")}</tbody></table>`;
}

/**
 * The printable form of a design. Kept here rather than in the page so the bulk
 * generators can render the same layout for a list of students later.
 */
export function designHtml(
  kind: DocumentKind,
  design: DocumentDesign,
  data: TokenData,
  qrByElement: Record<string, string> = {},
): string {
  const { width, height } = canvasSize(kind, design);
  const escape = (s: string) =>
    s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  const body = [...design.elements]
    .sort((a, b) => a.z - b.z)
    .map((el) => {
      const box =
        `position:absolute;left:${el.x}px;top:${el.y}px;width:${el.width}px;height:${el.height}px;` +
        `transform:rotate(${el.rotate}deg);opacity:${el.opacity};z-index:${el.z};`;
      if (el.type === "marks-table") return `<div style="${box}font-size:${el.fontSize}px;color:${el.color};overflow:hidden">${marksTableHtml(data, el.width, el.fontSize)}</div>`;
      if (el.type === "text") {
        const justify =
          el.align === "left" ? "flex-start" : el.align === "right" ? "flex-end" : "center";
        return `<div style="${box}display:flex;align-items:center;justify-content:${justify};font-size:${el.fontSize}px;font-weight:${el.fontWeight};color:${el.color};background:${el.background};border:${el.border};border-radius:${el.radius}px;padding:4px;text-align:${el.align}">${escape(replaceTokens(el.text, data))}</div>`;
      }
      if (el.type === "image" && el.src) {
        return `<img src="${el.src}" style="${box}object-fit:contain;border-radius:${el.radius}px" />`;
      }
      if (el.type === "photo") {
        // `object-fit: cover` for a face: a passport photo cropped to its box
        // beats one letterboxed inside it.
        return data.photo
          ? `<img src="${data.photo}" style="${box}object-fit:cover;border-radius:${el.radius}px;border:${el.border}" />`
          : `<div style="${box}background:${el.background || "#e2e8f0"};border:${el.border};border-radius:${el.radius}px;display:flex;align-items:center;justify-content:center;font-size:${el.fontSize}px;color:${el.color}">${escape(el.text || "Photo")}</div>`;
      }
      if (el.type === "qr") {
        const src = qrByElement[el.id];
        return src
          ? `<img src="${src}" style="${box}background:#fff;padding:4px" />`
          : `<div style="${box}background:#fff;border:1px solid #cbd5e1"></div>`;
      }
      const justify =
        el.align === "left" ? "flex-start" : el.align === "right" ? "flex-end" : "center";
      return `<div style="${box}background:${el.background};border:${el.border};border-radius:${el.radius}px;display:flex;align-items:center;justify-content:${justify};font-size:${el.fontSize}px;font-weight:${el.fontWeight};color:${el.color};text-align:${el.align}">${escape(replaceTokens(el.text, data))}</div>`;
    })
    .join("");
  const mark = design.backgroundImage
    ? `<div style="${styleText(watermarkStyle(design))}"></div>`
    : "";
  return `<div style="position:relative;width:${width}px;height:${height}px;background:${design.background};overflow:hidden">${mark}${body}</div>`;
}
