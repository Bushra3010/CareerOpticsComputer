import QRCode from "qrcode";

import {
  SAMPLE_DATA,
  canvasSize,
  designHtml,
  marksTableRowHeight,
  type DocumentDesign,
  type DocumentKind,
  type TokenData,
} from "@/lib/documentDesigner";
import { marksheetSummary, type StudentDocument } from "@/lib/documents";
import { printCardSheets, printHtml } from "@/lib/export";
import {
  designFor,
  getTemplateAssignments,
  getTemplates,
  loadDesignFor,
  type DocumentTemplate,
} from "@/lib/supabase/documentTemplates";

/**
 * Printing a student's document from the template their branch was given.
 *
 * The designer drew templates and the print buttons ignored them: certificates
 * and ID cards came out of layouts written into `documents.ts`, the same for
 * every institute using this app. This is the join. Where a branch has a
 * template -- its own, or the organisation's default -- the document is drawn
 * from it; where the library is empty, the caller falls back to the built-in
 * layout, so nobody loses the ability to print.
 */

/** The tokens a template can fill from one student's record. */
export function tokensFor(student: StudentDocument, extra: TokenData = {}): TokenData {
  const name = [student.firstName, student.lastName].filter(Boolean).join(" ");
  const summary = marksheetSummary(student.examResults);
  const percentage = summary.max ? Math.round(summary.total / summary.max * 10000) / 100 : 0;
  const issued = new Date(student.issueDate || Date.now()).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
  const filled: TokenData = {
    student_name: name,
    total_marks: String(summary.total),
    maximum_marks: String(summary.max),
    percentage: summary.max ? `${percentage}%` : "",
    result: summary.result,
    grade: summary.result === "Pass" ? (percentage >= 85 ? "A+" : percentage >= 75 ? "A" : percentage >= 60 ? "B" : percentage >= 45 ? "C" : "D") : summary.result === "Fail" ? "F" : "",
    marks_rows: JSON.stringify(student.examResults.map((r) => [r.exam.subject, r.exam.maxMarks, r.exam.passMarks, r.marks, r.marks >= r.exam.passMarks ? "Pass" : "Fail"])),
    exam_date: student.examinationDate || "",
    academic_year: student.session || "",
    course_duration: student.course?.duration || "",

    father_name: student.fatherName || "",
    course_name: student.course?.name || "",
    batch_name: student.batch?.name || "",
    branch_name: student.branch?.name || "",
    enrollment_no: student.enrollmentNo || "",
    application_no: student.applicationNo || "",
    roll_no: student.rollNo || "",
    certificate_id: student.enrollmentNo || student.applicationNo || "",
    issue_date: issued,
    dob: student.dateOfBirth || "",
    address: student.branch?.address || "",
    phone: student.branch?.phone || "",
    institute: student.branch?.organization?.name || "",
    // The face the admission collected. An empty string on purpose where there
    // is none: the photo box then prints its own placeholder rather than the
    // sample.
    photo: student.photo || "",
  };

  // Samples belong only in the designer, never in a student's issued document.
  const data: TokenData = Object.fromEntries(Object.keys(SAMPLE_DATA).map((key) => [key, ""]));
  Object.assign(data, filled, extra);
  return data;
}

/** QR elements carry a verification string, as they do in the designer. */
export async function qrImages(
  design: { elements: Array<{ id: string; type: string; width: number }> },
  data: TokenData,
) {
  const payload = data.certificate_id || data.enrollment_no || data.student_name;
  const pairs = await Promise.all(
    design.elements
      .filter((element) => element.type === "qr")
      .map(async (element) => {
        const src = await QRCode.toDataURL(`verify:${payload}`, {
          width: Math.max(64, Math.round(element.width)),
          margin: 1,
        }).catch(() => "");
        return [element.id, src] as const;
      }),
  );
  return Object.fromEntries(pairs);
}

/**
 * Prints one student's document from their branch's template.
 *
 * Returns false when the institute has no template for this kind at all, which
 * is the caller's signal to fall back to the built-in layout.
 */
export async function printFromTemplate(
  kind: DocumentKind,
  student: StudentDocument,
  organizationId: string | null,
  branchId: string | null,
  extra: TokenData = {},
): Promise<boolean> {
  const { template, design } = await loadDesignFor(kind, organizationId, branchId);
  if (!template) return false;

  const data = tokensFor(student, extra);
  if (kind === "marksheet") {
    const pages = await marksheetPages(design, student, extra);
    // Older designs have only an empty rectangle: use the full PDF instead.
    if (!pages) return false;
    printHtml(`${template.name} — ${student.firstName}`, pages.join(""));
    return true;
  }
  const qr = await qrImages(design, data);
  const name = [student.firstName, student.lastName].filter(Boolean).join(" ") || "Student";
  printHtml(`${template.name} — ${name}`, designHtml(kind, design, data, qr));
  return true;
}

/**
 * One student's marksheet drawn in a design, as many pages as its marks table
 * needs. Null when the design has no marks table to fill.
 */
async function marksheetPages(design: DocumentDesign, student: StudentDocument, extra: TokenData): Promise<string[] | null> {
  const data = tokensFor(student, extra);
  const tables = design.elements.filter((el) => el.type === "marks-table");
  if (!tables.length) return null;
  const capacity = Math.min(...tables.map((el) => Math.floor((el.height - 40) / marksTableRowHeight(data, el.width, el.fontSize))));
  if (capacity < 1) throw new Error("Increase the marks table height in the template.");
  const pages: string[] = [];
  for (let offset = 0; offset < Math.max(1, student.examResults.length); offset += capacity) {
    const pageData = tokensFor({ ...student, examResults: student.examResults.slice(offset, offset + capacity) }, extra);
    pageData.percentage = data.percentage;
    pageData.grade = data.grade;
    pageData.result = data.result;
    pageData.total_marks = data.total_marks;
    pageData.maximum_marks = data.maximum_marks;
    pages.push(`<div style="page-break-after:always">${designHtml("marksheet", design, pageData, await qrImages(design, pageData))}</div>`);
  }
  return pages;
}

/**
 * Many students' marksheets in one print run, each in its own branch's
 * marksheet design. False when any of them has no usable design, the cue to
 * print the built-in sheets instead.
 */
export async function printMarksheetsFromTemplate(
  items: Array<{ student: StudentDocument; extra: TokenData; branchId: string | null }>,
  organizationId: string | null,
): Promise<boolean> {
  if (!items.length) return false;
  const [templates, assignments] = await Promise.all([
    getTemplates(organizationId).catch(() => ({ data: [] as DocumentTemplate[] })),
    getTemplateAssignments(organizationId).catch(() => ({ data: {} })),
  ]);
  const found = items.map((item) => designFor("marksheet", templates.data, assignments.data, item.branchId));
  if (found.some((f) => !f.template)) return false;
  const pages: string[] = [];
  for (const [i, item] of items.entries()) {
    const own = await marksheetPages(found[i].design, item.student, item.extra);
    if (!own) return false;
    pages.push(...own);
  }
  printHtml(`Marksheets — ${items.length} student(s)`, pages.join(""));
  return true;
}

/** The same, for a sheet of many: one template, one page per student. */
export async function printManyFromTemplate(
  kind: DocumentKind,
  students: StudentDocument[],
  organizationId: string | null,
  branchId: string | null,
  /** Per-student tokens, by position: each certificate's own number. */
  extras: TokenData[] = [],
): Promise<boolean> {
  const { template, design } = await loadDesignFor(kind, organizationId, branchId);
  if (!template || students.length === 0) return false;

  const pages = await Promise.all(
    students.map(async (student, i) => {
      const data = tokensFor(student, extras[i]);
      const qr = await qrImages(design, data);
      // Each card on its own sheet, as a printer expects them.
      return `<div style="page-break-after:always">${designHtml(kind, design, data, qr)}</div>`;
    }),
  );
  printHtml(`${template.name} — ${students.length} student(s)`, pages.join(""));
  return true;
}

/**
 * Students of several branches in one print run, each drawn in the design
 * their own branch was given (or the organisation's default). False when the
 * organisation has no design of this kind, the caller's cue to fall back.
 */
export async function printRecordsByBranch(
  kind: DocumentKind,
  students: StudentRecord[],
  organizationId: string | null,
): Promise<boolean> {
  if (students.length === 0) return false;
  const [templates, assignments] = await Promise.all([
    getTemplates(organizationId).catch(() => ({ data: [] as DocumentTemplate[] })),
    getTemplateAssignments(organizationId).catch(() => ({ data: {} })),
  ]);
  const found = students.map((student) => designFor(kind, templates.data, assignments.data, String(student.branchId ?? "") || null));
  if (found.some((f) => !f.template)) return false;

  const cards = await Promise.all(
    students.map(async (student, i) => {
      const { design } = found[i];
      const data = tokensForRecord(student);
      const qr = await qrImages(design, data);
      return { html: designHtml(kind, design, data, qr), ...canvasSize(kind, design) };
    }),
  );
  const names = [...new Set(found.map((f) => f.template!.name))].join(", ");
  // Cards go many to an A4 sheet at their real size; other kinds a page each.
  if (kind === "student-id") printCardSheets(`${names} — ${students.length} card(s)`, cards);
  else printHtml(`${names} — ${students.length} student(s)`, cards.map((c) => `<div style="page-break-after:always">${c.html}</div>`).join(""));
  return true;
}

/** One student row as `getStudents` returns it, for the bulk card printer. */
export type StudentRecord = Record<string, unknown> & {
  id?: string;
  firstName?: string;
  middleName?: string;
  lastName?: string;
  enrollmentNo?: string;
  applicationNo?: string;
  rollNo?: string;
  fatherName?: string;
  dateOfBirth?: string;
  bloodGroup?: string;
  phone?: string;
  documents?: Record<string, { dataUrl?: string }> | null;
  photo?: unknown;
};

/** The face the admission collected, or the one an older record kept. */
export function photoOf(student: StudentRecord): string {
  const fromDocuments = student.documents?.passportPhoto?.dataUrl;
  if (fromDocuments) return fromDocuments;
  const own = student.photo;
  if (typeof own === "string") return own;
  if (own && typeof own === "object") {
    const found = (own as Record<string, unknown>).dataUrl;
    if (typeof found === "string") return found;
  }
  return "";
}

/** Tokens from a raw student row -- what the roster and the card pages hold. */
export function tokensForRecord(student: StudentRecord, extra: TokenData = {}): TokenData {
  const name = [student.firstName, student.middleName, student.lastName]
    .filter(Boolean)
    .join(" ");
  const filled: TokenData = {
    student_name: name,
    father_name: student.fatherName || "",
    enrollment_no: student.enrollmentNo || "",
    application_no: student.applicationNo || "",
    roll_no: student.rollNo || "",
    certificate_id: student.enrollmentNo || student.applicationNo || "",
    // Names the page looked up: a raw row carries only the ids.
    course_name: String(student.courseName ?? ""),
    batch_name: String(student.batchName ?? ""),
    blood_group: student.bloodGroup || "",
    phone: student.phone || "",
    dob: student.dateOfBirth
      ? new Date(student.dateOfBirth).toLocaleDateString("en-IN", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        })
      : "",
    issue_date: new Date().toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    }),
  };
  const data: TokenData = Object.fromEntries(Object.keys(SAMPLE_DATA).map((key) => [key, ""]));
  Object.assign(data, filled, extra);
  data.photo = extra.photo ?? photoOf(student);
  return data;
}

/**
 * A sheet of cards from the branch's template -- one page each, each carrying
 * that student's own photograph.
 *
 * Returns false when the institute has no template of this kind, which is the
 * caller's signal to print the way it always did.
 */
export async function printRecordsFromTemplate(
  kind: DocumentKind,
  students: StudentRecord[],
  organizationId: string | null,
  branchId: string | null,
  extra: TokenData = {},
): Promise<boolean> {
  const { template, design } = await loadDesignFor(kind, organizationId, branchId);
  if (!template || students.length === 0) return false;

  const pages = await Promise.all(
    students.map(async (student) => {
      const data = tokensForRecord(student, extra);
      const qr = await qrImages(design, data);
      return `<div style="page-break-after:always">${designHtml(kind, design, data, qr)}</div>`;
    }),
  );
  printHtml(`${template.name} — ${students.length} student(s)`, pages.join(""));
  return true;
}
