/**
 * Reads and writes for the exam workflow (exam-workflow.sql): course subjects,
 * exam centres, exam schedules, admit cards, marksheets, and the certificates
 * issued from them.
 */
import { supabase } from "./client";
import {
  summarise,
  type CourseSubject,
  type MarkLine,
  type SubjectType,
} from "../examWorkflow";

const SETUP_HINT = "The exam module is not set up yet. Run supabase/schema/exam-workflow.sql in Supabase.";

const missingRelation = (error: { code?: string; message?: string } | null) =>
  error?.code === "42P01" || error?.code === "PGRST205" || error?.code === "PGRST202" || error?.code === "42703" ||
  /does not exist|schema cache/i.test(error?.message || "");

function fail(error: { code?: string; message?: string }): never {
  const low = /INSUFFICIENT_BALANCE:\s*(.*)/.exec(error.message || "");
  if (low) throw new Error(`Centre wallet balance is too low: ${low[1]} Recharge the wallet, then try again.`);
  throw new Error(missingRelation(error) ? SETUP_HINT : error.message || "Request failed");
}

const num = (v: unknown) => Number(v) || 0;
/** The header re-reads the centre's wallet after anything that may have charged it. */
const walletMayHaveMoved = () => {
  if (typeof window !== "undefined") window.dispatchEvent(new Event("wallet:changed"));
};
const text = (v: unknown) => (v == null ? "" : String(v));
const now = () => new Date().toISOString();

/* ---------------------------------------------------------------- subjects */

const mapSubject = (row: Record<string, unknown>): CourseSubject => ({
  id: text(row.id),
  courseId: text(row.courseId),
  term: Math.max(1, num(row.term)),
  code: text(row.code),
  name: text(row.name),
  subjectType: (["THEORY", "PRACTICAL", "BOTH"].includes(text(row.subjectType)) ? row.subjectType : "THEORY") as SubjectType,
  theoryMax: num(row.theoryMax),
  theoryMin: num(row.theoryMin),
  practicalMax: num(row.practicalMax),
  practicalMin: num(row.practicalMin),
  sortOrder: num(row.sortOrder),
});

/** A course's subjects (every course when none is named), in paper order. */
export async function getCourseSubjects(courseId?: string | null): Promise<CourseSubject[]> {
  let query = supabase
    .from("course_subjects")
    .select("*")
    .is("deletedAt", null)
    .order("term")
    .order("sortOrder")
    .order("createdAt");
  if (courseId) query = query.eq("courseId", courseId);
  const { data, error } = await query;
  if (error) {
    if (missingRelation(error)) return [];
    fail(error);
  }
  return (data || []).map(mapSubject);
}

export type SubjectInput = Omit<CourseSubject, "id" | "sortOrder"> & { id?: string; sortOrder?: number };

export function subjectProblem(input: SubjectInput): string | null {
  if (!input.courseId) return "Choose the course.";
  if (!input.name.trim()) return "Give the subject a name.";
  const parts: Array<[boolean, number, number, string]> = [
    [input.subjectType !== "PRACTICAL", input.theoryMax, input.theoryMin, "Theory"],
    [input.subjectType !== "THEORY", input.practicalMax, input.practicalMin, "Practical"],
  ];
  for (const [on, max, min, label] of parts) {
    if (!on) continue;
    if (!(max > 0)) return `${label} maximum marks must be more than 0.`;
    if (min < 0 || min > max) return `${label} minimum marks must be between 0 and ${max}.`;
  }
  return null;
}

export async function saveCourseSubject(input: SubjectInput) {
  const problem = subjectProblem(input);
  if (problem) throw new Error(problem);
  const theory = input.subjectType !== "PRACTICAL";
  const practical = input.subjectType !== "THEORY";
  const payload: Record<string, unknown> = {
    courseId: input.courseId,
    term: Math.max(1, Math.floor(input.term) || 1),
    code: input.code.trim() || null,
    name: input.name.trim(),
    subjectType: input.subjectType,
    theoryMax: theory ? input.theoryMax : 0,
    theoryMin: theory ? input.theoryMin : 0,
    practicalMax: practical ? input.practicalMax : 0,
    practicalMin: practical ? input.practicalMin : 0,
    updatedAt: now(),
  };
  if (input.sortOrder !== undefined) payload.sortOrder = input.sortOrder;
  const { error } = input.id
    ? await supabase.from("course_subjects").update(payload).eq("id", input.id)
    : await supabase.from("course_subjects").insert(payload);
  if (error) fail(error);
}

export async function deleteCourseSubject(id: string) {
  const { error } = await supabase.from("course_subjects").update({ deletedAt: now() }).eq("id", id);
  if (error) fail(error);
}

/** Writes the given order (ids first to last) as each subject's sortOrder. */
export async function reorderCourseSubjects(ids: string[]) {
  for (const [index, id] of ids.entries()) {
    const { error } = await supabase.from("course_subjects").update({ sortOrder: index + 1, updatedAt: now() }).eq("id", id);
    if (error) fail(error);
  }
}

/** How the course divides into terms; null type means "from the duration". */
export async function setCourseTerms(courseId: string, termType: string | null, termCount: number | null) {
  const { error } = await supabase
    .from("courses")
    .update({ termType, termCount, updatedAt: now() })
    .eq("id", courseId);
  if (error) fail(error);
}

/* ------------------------------------------------------------ exam centres */

export interface ExamCentre {
  id: string;
  name: string;
  code: string;
  address: string;
}

const mapCentre = (row: Record<string, unknown>): ExamCentre => ({
  id: text(row.id),
  name: text(row.name),
  code: text(row.code),
  address: text(row.address),
});

export async function getExamCentres(): Promise<ExamCentre[]> {
  const { data, error } = await supabase.from("exam_centres").select("*").is("deletedAt", null).order("name");
  if (error) {
    if (missingRelation(error)) return [];
    fail(error);
  }
  return (data || []).map(mapCentre);
}

export async function saveExamCentre(input: Omit<ExamCentre, "id"> & { id?: string }, organizationId?: string | null) {
  if (!input.name.trim()) throw new Error("Give the exam centre a name.");
  const payload = {
    name: input.name.trim(),
    code: input.code.trim() || null,
    address: input.address.trim() || null,
    updatedAt: now(),
  };
  const { error } = input.id
    ? await supabase.from("exam_centres").update(payload).eq("id", input.id)
    : await supabase.from("exam_centres").insert({ ...payload, organizationId: organizationId || null });
  if (error) fail(error);
}

export async function deleteExamCentre(id: string) {
  const { error } = await supabase.from("exam_centres").update({ deletedAt: now() }).eq("id", id);
  if (error) fail(error);
}

/* ---------------------------------------------------------- exam schedules */

export interface ScheduleItem {
  subjectId: string;
  date: string;
  time: string;
}

export interface ExamSchedule {
  id: string;
  branchId: string;
  courseId: string;
  term: number;
  session: string;
  examCentreId: string;
  items: ScheduleItem[];
  updatedAt: string;
}

const mapSchedule = (row: Record<string, unknown>): ExamSchedule => ({
  id: text(row.id),
  branchId: text(row.branchId),
  courseId: text(row.courseId),
  term: Math.max(1, num(row.term)),
  session: text(row.session),
  examCentreId: text(row.examCentreId),
  items: Array.isArray(row.items)
    ? (row.items as Record<string, unknown>[]).map((i) => ({ subjectId: text(i.subjectId), date: text(i.date), time: text(i.time) }))
    : [],
  updatedAt: text(row.updatedAt),
});

export async function getExamSchedules(branchId: string | null): Promise<ExamSchedule[]> {
  let query = supabase.from("exam_schedules").select("*").order("updatedAt", { ascending: false });
  if (branchId) query = query.eq("branchId", branchId);
  const { data, error } = await query;
  if (error) {
    if (missingRelation(error)) return [];
    fail(error);
  }
  return (data || []).map(mapSchedule);
}

export async function saveExamSchedule(input: Omit<ExamSchedule, "id" | "updatedAt">, createdBy?: string | null) {
  if (!input.branchId) throw new Error("Choose the centre.");
  if (!input.courseId) throw new Error("Choose the course.");
  if (!input.session.trim()) throw new Error("Choose the session.");
  if (!input.examCentreId) throw new Error("Choose the exam centre.");
  const items = input.items.filter((i) => i.subjectId);
  const missing = items.find((i) => !i.date || !i.time);
  if (!items.length) throw new Error("This term has no subjects to schedule. Add them under Course Subjects first.");
  if (missing) throw new Error("Give every subject a date and a time.");
  const { error } = await supabase.from("exam_schedules").upsert(
    {
      branchId: input.branchId,
      courseId: input.courseId,
      term: input.term,
      session: input.session.trim(),
      examCentreId: input.examCentreId,
      items,
      createdBy: createdBy || null,
      updatedAt: now(),
    },
    { onConflict: "branchId,courseId,term,session" },
  );
  if (error) fail(error);
}

export async function deleteExamSchedule(id: string) {
  const { error } = await supabase.from("exam_schedules").delete().eq("id", id);
  if (error) fail(error);
}

/* ------------------------------------------------------------- admit cards */

export interface AdmitCardRecord {
  id: string;
  studentId: string;
  branchId: string;
  courseId: string;
  term: number;
  session: string;
  rollNo: string;
  examCentreId: string;
  scheduleId: string;
  isFinal: boolean;
  issuedAt: string;
}

const mapAdmit = (row: Record<string, unknown>): AdmitCardRecord => ({
  id: text(row.id),
  studentId: text(row.studentId),
  branchId: text(row.branchId),
  courseId: text(row.courseId),
  term: Math.max(1, num(row.term)),
  session: text(row.session),
  rollNo: text(row.rollNo),
  examCentreId: text(row.examCentreId),
  scheduleId: text(row.scheduleId),
  isFinal: Boolean(row.isFinal),
  issuedAt: text(row.issuedAt),
});

export async function getAdmitCards(filter: { branchId?: string | null; studentId?: string | null } = {}) {
  let query = supabase.from("admit_cards").select("*").order("issuedAt", { ascending: false });
  if (filter.branchId) query = query.eq("branchId", filter.branchId);
  if (filter.studentId) query = query.eq("studentId", filter.studentId);
  const { data, error } = await query;
  if (error) {
    if (missingRelation(error)) return [] as AdmitCardRecord[];
    fail(error);
  }
  return (data || []).map(mapAdmit);
}

export async function saveAdmitCard(input: Omit<AdmitCardRecord, "id" | "issuedAt">, issuedBy?: string | null) {
  if (!input.studentId) throw new Error("Choose the student.");
  if (!input.rollNo.trim()) throw new Error("Enter the roll number.");
  if (!input.scheduleId) throw new Error("There is no exam schedule for this course, term and session yet. Create it under Exam Schedule first.");
  const { error } = await supabase.from("admit_cards").upsert(
    {
      studentId: input.studentId,
      branchId: input.branchId,
      courseId: input.courseId || null,
      term: input.term,
      session: input.session || null,
      rollNo: input.rollNo.trim(),
      examCentreId: input.examCentreId || null,
      scheduleId: input.scheduleId,
      isFinal: input.isFinal,
      issuedBy: issuedBy || null,
      updatedAt: now(),
    },
    { onConflict: "studentId,term" },
  );
  if (error) fail(error);
  walletMayHaveMoved();
}

export async function deleteAdmitCard(id: string) {
  const { error } = await supabase.from("admit_cards").delete().eq("id", id);
  if (error) fail(error);
}

/* -------------------------------------------------------------- marksheets */

export interface MarksheetRecord {
  id: string;
  studentId: string;
  branchId: string;
  courseId: string;
  term: number;
  session: string;
  issueDate: string;
  marks: MarkLine[];
  totalObtained: number;
  totalMax: number;
  percentage: number;
  grade: string;
  result: "PASS" | "FAIL";
  isFinal: boolean;
  marksheetNo: string;
  updatedAt: string;
}

const mapLine = (row: Record<string, unknown>): MarkLine => ({
  subjectId: text(row.subjectId),
  code: text(row.code),
  name: text(row.name),
  subjectType: (["THEORY", "PRACTICAL", "BOTH"].includes(text(row.subjectType)) ? row.subjectType : "THEORY") as SubjectType,
  theoryMax: num(row.theoryMax),
  theoryMin: num(row.theoryMin),
  theory: row.theory == null || row.theory === "" ? null : Number(row.theory),
  practicalMax: num(row.practicalMax),
  practicalMin: num(row.practicalMin),
  practical: row.practical == null || row.practical === "" ? null : Number(row.practical),
});

const mapMarksheet = (row: Record<string, unknown>): MarksheetRecord => ({
  id: text(row.id),
  studentId: text(row.studentId),
  branchId: text(row.branchId),
  courseId: text(row.courseId),
  term: Math.max(1, num(row.term)),
  session: text(row.session),
  issueDate: text(row.issueDate),
  marks: Array.isArray(row.marks) ? (row.marks as Record<string, unknown>[]).map(mapLine) : [],
  totalObtained: num(row.totalObtained),
  totalMax: num(row.totalMax),
  percentage: num(row.percentage),
  grade: text(row.grade),
  result: row.result === "FAIL" ? "FAIL" : "PASS",
  isFinal: Boolean(row.isFinal),
  marksheetNo: text(row.marksheetNo),
  updatedAt: text(row.updatedAt),
});

export async function getMarksheets(filter: { branchId?: string | null; studentId?: string | null } = {}) {
  let query = supabase.from("marksheets").select("*").order("updatedAt", { ascending: false });
  if (filter.branchId) query = query.eq("branchId", filter.branchId);
  if (filter.studentId) query = query.eq("studentId", filter.studentId);
  const { data, error } = await query;
  if (error) {
    if (missingRelation(error)) return [] as MarksheetRecord[];
    fail(error);
  }
  return (data || []).map(mapMarksheet);
}

export interface MarksheetInput {
  studentId: string;
  branchId: string;
  courseId: string;
  term: number;
  session: string;
  issueDate: string;
  marks: MarkLine[];
  isFinal: boolean;
  enrollmentNo?: string;
}

/** Saves (or replaces) the student's marksheet for the term, totals worked out here. */
export async function saveMarksheet(input: MarksheetInput, createdBy?: string | null) {
  if (!input.studentId) throw new Error("Choose the student.");
  if (!input.marks.length) throw new Error("This term has no subjects. Add them under Course Subjects first.");
  if (!input.issueDate) throw new Error("Choose the issue date.");
  const summary = summarise(input.marks);
  const base = (input.enrollmentNo || input.studentId.slice(0, 8)).trim();
  const { error } = await supabase.from("marksheets").upsert(
    {
      studentId: input.studentId,
      branchId: input.branchId,
      courseId: input.courseId || null,
      term: input.term,
      session: input.session || null,
      issueDate: input.issueDate,
      marks: input.marks,
      totalObtained: summary.totalObtained,
      totalMax: summary.totalMax,
      percentage: summary.percentage,
      grade: summary.grade,
      result: summary.result,
      isFinal: input.isFinal,
      marksheetNo: `MS-${base}-${input.term}`,
      createdBy: createdBy || null,
      updatedAt: now(),
    },
    { onConflict: "studentId,term" },
  );
  if (error) fail(error);
  walletMayHaveMoved();
  return summary;
}

export async function deleteMarksheet(id: string) {
  const { error } = await supabase.from("marksheets").delete().eq("id", id);
  if (error) fail(error);
}

/* ------------------------------------------------------------ certificates */

export interface IssuedCertificate {
  id: string;
  studentId: string;
  branchId: string;
  amount: number;
  certificateNo: string;
  issueDate: string;
  examConductedDate: string;
  issuedAt: string;
  issuedBy: string;
}

export async function getIssuedCertificates(branchId: string | null): Promise<IssuedCertificate[]> {
  let query = supabase.from("certificate_issues").select("*").order("issuedAt", { ascending: false });
  if (branchId) query = query.eq("branchId", branchId);
  const { data, error } = await query;
  if (error) {
    if (missingRelation(error)) return [];
    fail(error);
  }
  return (data || []).map((row: Record<string, unknown>) => ({
    id: text(row.id),
    studentId: text(row.studentId),
    branchId: text(row.branchId),
    amount: num(row.amount),
    certificateNo: text(row.certificateNo),
    issueDate: text(row.issueDate) || text(row.issuedAt).slice(0, 10),
    examConductedDate: text(row.examConductedDate),
    issuedAt: text(row.issuedAt),
    issuedBy: text(row.issuedBy),
  }));
}

/* ------------------------------------------------------- public lookups */

export interface PublicAdmitCard {
  found: boolean;
  issued?: boolean;
  student?: { name: string; fatherName?: string; enrollmentNo?: string; course?: string; centre?: string };
  rollNo?: string;
  term?: number;
  session?: string;
  isFinal?: boolean;
  courseTerms?: { termType?: string | null; termCount?: number | null; durationValue?: number | null; durationUnit?: string | null } | null;
  examCentre?: { name: string; code?: string; address?: string } | null;
  schedule?: Array<{ subject: string; code?: string; date: string; time: string }>;
}

/** The latest admit card issued to an enrolment number, as the website shows it. */
export async function getPublicAdmitCard(enrollmentNo: string): Promise<PublicAdmitCard | null> {
  if (!enrollmentNo.trim()) return null;
  const { data, error } = await supabase.rpc("public_admit_card", { p_enrollment: enrollmentNo.trim() });
  if (error) {
    if (missingRelation(error)) return null;
    fail(error);
  }
  return (data || null) as PublicAdmitCard | null;
}

/* ------------------------------------------------------ print approvals */

export type ApprovalStatus = "PENDING" | "APPROVED" | "REJECTED";

/** A centre's certificate or marksheet waiting on the head office (print-approvals.sql). */
export interface PrintApproval {
  id: string;
  kind: "CERTIFICATE" | "MARKSHEET";
  studentId: string;
  branchId: string;
  marksheetId: string;
  issueDate: string;
  examConductedDate: string;
  status: ApprovalStatus;
  note: string;
  requestedBy: string;
  requestedAt: string;
  reviewedBy: string;
  reviewedAt: string;
}

/**
 * Every approval the signed-in user may see. Null when print-approvals.sql
 * has not been run: the pages then print as they did before approvals.
 */
export async function getPrintApprovals(branchId: string | null): Promise<PrintApproval[] | null> {
  let query = supabase.from("print_approvals").select("*").order("requestedAt", { ascending: false });
  if (branchId) query = query.eq("branchId", branchId);
  const { data, error } = await query;
  if (error) {
    if (missingRelation(error)) return null;
    fail(error);
  }
  return (data || []).map((row: Record<string, unknown>) => ({
    id: text(row.id),
    kind: text(row.kind) === "MARKSHEET" ? "MARKSHEET" : "CERTIFICATE",
    studentId: text(row.studentId),
    branchId: text(row.branchId),
    marksheetId: text(row.marksheetId),
    issueDate: text(row.issueDate),
    examConductedDate: text(row.examConductedDate),
    status: (["PENDING", "APPROVED", "REJECTED"].includes(text(row.status)) ? text(row.status) : "PENDING") as ApprovalStatus,
    note: text(row.note),
    requestedBy: text(row.requestedBy),
    requestedAt: text(row.requestedAt),
    reviewedBy: text(row.reviewedBy),
    reviewedAt: text(row.reviewedAt),
  }));
}

/**
 * A centre asks the head office for a student's certificate. APPROVED means
 * go ahead and issue (the head office itself, or approved already); PENDING
 * means it waits. Before print-approvals.sql is run, everyone may issue.
 */
export async function requestCertificateApproval(
  studentId: string,
  by?: string | null,
  dates: { issueDate?: string | null; examConductedDate?: string | null } = {},
): Promise<ApprovalStatus> {
  const { data, error } = await supabase.rpc("request_certificate_approval", {
    p_student_id: studentId,
    p_requested_by: by || null,
    p_issue_date: dates.issueDate || null,
    p_exam_date: dates.examConductedDate || null,
  });
  if (error) {
    if (missingRelation(error)) return "APPROVED";
    if (/NOT_ELIGIBLE/.test(error.message)) throw new Error("The student has no passed final-term marksheet yet. Create and pass the final result first.");
    fail(error);
  }
  return ((data as { status?: string } | null)?.status as ApprovalStatus) || "PENDING";
}

/** The head office approves or rejects. Approving a certificate issues it and charges the centre. */
export async function reviewPrintApproval(id: string, approve: boolean, note?: string | null, by?: string | null) {
  const { data, error } = await supabase.rpc("review_print_approval", {
    p_id: id,
    p_approve: approve,
    p_note: note || null,
    p_reviewed_by: by || null,
  });
  if (error) {
    if (/NOT_ELIGIBLE/.test(error.message)) throw new Error("The student has no passed final-term marksheet yet.");
    fail(error);
  }
  return data as { status: ApprovalStatus; issue?: { charged?: boolean; amount?: number; certificateNo?: string } | null };
}

/** The decision on one certificate or marksheet; with approvals not set up, everything is approved. */
export function approvalFor(
  approvals: PrintApproval[] | null,
  kind: PrintApproval["kind"],
  key: string,
): ApprovalStatus | null {
  if (approvals === null) return "APPROVED";
  const found = approvals.find((a) => a.kind === kind && (kind === "MARKSHEET" ? a.marksheetId === key : a.studentId === key));
  return found ? found.status : null;
}
