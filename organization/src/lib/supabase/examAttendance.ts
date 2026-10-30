/**
 * Exam / attendance data access that talks to the LIVE database schema.
 *
 * `src/lib/supabase/data.ts` is owned by another part of the codebase and a few
 * of its exam helpers write column names that do not exist in the live
 * database (most importantly `exam_results.marksObtained` — the real column is
 * `marks`). Rather than edit that file, the exam / attendance / live-class /
 * portal screens use the helpers below, which were written against columns
 * verified to exist via the PostgREST schema probe.
 *
 * Verified live columns (probed, not taken from prisma/schema.prisma):
 *   exams              id, name, subject, examDate, branchId, batchId, courseId,
 *                      status, maxMarks, passMarks, createdAt, updatedAt
 *   exam_results       id, examId, studentId, marks, remarks, gradedAt, updatedAt
 *   attendance_records id, studentId, date, status, remarks, branchId, batchId,
 *                      createdAt, updatedAt
 *   students           id, firstName, lastName, enrollmentNo, email, phone,
 *                      branchId, courseId, batchId, isActive, deletedAt, userId
 *   batches            id, name, code, courseId, branchId, startDate, endDate
 *   courses            id, name, code, organizationId
 *   batch_timings      id, batchId, day, startTime, endTime, subject, instructor, roomNo
 *
 * Every function here returns the *unwrapped* value (an array or a row), not
 * the `{ success, data }` envelope used by data.ts.
 */
import { supabase } from "./client";
import { newId } from "../id";

export interface ExamRow {
  id: string;
  name: string | null;
  subject: string | null;
  examDate: string | null;
  branchId: string | null;
  batchId: string | null;
  courseId: string | null;
  status: string | null;
  maxMarks: number | null;
  passMarks: number | null;
}

export interface ExamResultRow {
  id: string;
  examId: string;
  studentId: string;
  marks: number | null;
  remarks: string | null;
  gradedAt: string | null;
}

export interface StudentRow {
  id: string;
  firstName: string | null;
  lastName: string | null;
  enrollmentNo: string | null;
  email: string | null;
  phone: string | null;
  branchId: string | null;
  courseId: string | null;
  batchId: string | null;
}

export interface LookupRow {
  id: string;
  name: string;
  code?: string | null;
}

export interface AttendanceRow {
  id: string;
  studentId: string;
  date: string;
  status: string;
  remarks: string | null;
  branchId: string | null;
  batchId: string | null;
}

export interface BatchTimingRow {
  id: string;
  batchId: string | null;
  day: string | null;
  startTime: string | null;
  endTime: string | null;
  subject: string | null;
  instructor: string | null;
  roomNo: string | null;
}

const fail = (message: string): never => {
  throw new Error(message);
};

/* ------------------------------------------------------------------ lookups */

/** Courses for an organisation. Returns `[]` when no organisation is known. */
export async function listCourses(organizationId?: string | null): Promise<LookupRow[]> {
  let query = supabase.from("courses").select("id,name,code").order("name");
  if (organizationId) query = query.eq("organizationId", organizationId);
  const { data, error } = await query;
  if (error) fail(error.message);
  return (data || []) as LookupRow[];
}

/** Batches for a branch (all branches when `branchId` is not supplied). */
export async function listBatches(branchId?: string | null): Promise<LookupRow[]> {
  let query = supabase.from("batches").select("id,name,code,courseId,branchId").order("name");
  if (branchId) query = query.eq("branchId", branchId);
  const { data, error } = await query;
  if (error) fail(error.message);
  return (data || []) as LookupRow[];
}

/** Active students for a branch, optionally narrowed to one batch. */
export async function listStudents(branchId?: string | null, batchId?: string | null): Promise<StudentRow[]> {
  let query = supabase
    .from("students")
    .select("id,firstName,lastName,enrollmentNo,email,phone,branchId,courseId,batchId")
    .is("deletedAt", null)
    .order("firstName");
  if (branchId) query = query.eq("branchId", branchId);
  if (batchId) query = query.eq("batchId", batchId);
  const { data, error } = await query;
  if (error) fail(error.message);
  return (data || []) as StudentRow[];
}

export const studentName = (student: Pick<StudentRow, "firstName" | "lastName">) =>
  [student.firstName, student.lastName].filter(Boolean).join(" ").trim() || "Unnamed student";

/* -------------------------------------------------------------------- exams */

export async function listExams(branchId?: string | null): Promise<ExamRow[]> {
  let query = supabase
    .from("exams")
    .select("id,name,subject,examDate,branchId,batchId,courseId,status,maxMarks,passMarks")
    .order("examDate", { ascending: false });
  if (branchId) query = query.eq("branchId", branchId);
  const { data, error } = await query;
  if (error) fail(error.message);
  return (data || []) as ExamRow[];
}

export interface ExamInput {
  name: string;
  subject?: string | null;
  examDate?: string | null;
  courseId?: string | null;
  batchId?: string | null;
  maxMarks?: number | null;
  passMarks?: number | null;
  status?: string | null;
}

/** Insert one exam. Only columns that exist in the live `exams` table are sent. */
export async function createExamRow(branchId: string | null | undefined, input: ExamInput): Promise<ExamRow> {
  if (!branchId) fail("A branch is required before an exam can be created.");
  const payload: Record<string, unknown> = {
    branchId,
    name: input.name,
    subject: input.subject || null,
    examDate: input.examDate || null,
    courseId: input.courseId || null,
    batchId: input.batchId || null,
    maxMarks: input.maxMarks ?? null,
    passMarks: input.passMarks ?? null,
    status: input.status || "scheduled",
  };
  const { data, error } = await supabase.from("exams").insert(payload).select("*").single();
  if (error) fail(error.message);
  return data as ExamRow;
}

export async function updateExamRow(id: string, input: Partial<ExamInput>): Promise<ExamRow> {
  const payload: Record<string, unknown> = {};
  for (const key of ["name", "subject", "examDate", "courseId", "batchId", "maxMarks", "passMarks", "status"] as const) {
    if (input[key] !== undefined) payload[key] = input[key];
  }
  const { data, error } = await supabase.from("exams").update(payload).eq("id", id).select("*").single();
  if (error) fail(error.message);
  return data as ExamRow;
}

export async function deleteExamRow(id: string): Promise<void> {
  const { error } = await supabase.from("exams").delete().eq("id", id);
  if (error) fail(error.message);
}

/* ------------------------------------------------------------- exam results */

export async function listExamResults(examId: string): Promise<ExamResultRow[]> {
  const { data, error } = await supabase
    .from("exam_results")
    .select("id,examId,studentId,marks,remarks,gradedAt")
    .eq("examId", examId);
  if (error) fail(error.message);
  return (data || []) as ExamResultRow[];
}

/** All results for a branch's exams, joined to the exam row. */
export async function listExamResultsForExams(examIds: string[]): Promise<ExamResultRow[]> {
  if (!examIds.length) return [];
  const { data, error } = await supabase
    .from("exam_results")
    .select("id,examId,studentId,marks,remarks,gradedAt")
    .in("examId", examIds);
  if (error) fail(error.message);
  return (data || []) as ExamResultRow[];
}

/**
 * Write marks for one exam.
 *
 * `exam_results` has no verifiable unique constraint on (examId, studentId) in
 * the live database, so this reads what is already stored and issues an update
 * per existing row plus one insert for the rest, rather than relying on an
 * upsert conflict target that may not exist.
 */
export async function saveExamMarks(
  examId: string,
  entries: Array<{ studentId: string; marks: number; remarks?: string | null }>,
): Promise<{ inserted: number; updated: number }> {
  if (!examId) fail("An exam must be selected before marks can be saved.");
  if (!entries.length) return { inserted: 0, updated: 0 };

  const existing = await listExamResults(examId);
  const byStudent = new Map(existing.map((row) => [row.studentId, row]));
  const gradedAt = new Date().toISOString();

  const toInsert: Record<string, unknown>[] = [];
  let updated = 0;

  for (const entry of entries) {
    const current = byStudent.get(entry.studentId);
    if (current) {
      const { error } = await supabase
        .from("exam_results")
        .update({ marks: entry.marks, remarks: entry.remarks ?? null, gradedAt })
        .eq("id", current.id);
      if (error) fail(error.message);
      updated += 1;
    } else {
      toInsert.push({
        examId,
        studentId: entry.studentId,
        marks: entry.marks,
        remarks: entry.remarks ?? null,
        gradedAt,
      });
    }
  }

  if (toInsert.length) {
    const { error } = await supabase.from("exam_results").insert(toInsert);
    if (error) fail(error.message);
  }

  return { inserted: toInsert.length, updated };
}

/* --------------------------------------------------------------- attendance */

export async function listAttendance(branchId?: string | null, date?: string): Promise<AttendanceRow[]> {
  let query = supabase
    .from("attendance_records")
    .select("id,studentId,date,status,remarks,branchId,batchId")
    .order("date", { ascending: false });
  if (branchId) query = query.eq("branchId", branchId);
  if (date) query = query.eq("date", date);
  const { data, error } = await query;
  if (error) fail(error.message);
  return (data || []) as AttendanceRow[];
}

/** Attendance for one student, newest first. */
export async function listStudentAttendance(studentId: string): Promise<AttendanceRow[]> {
  const { data, error } = await supabase
    .from("attendance_records")
    .select("id,studentId,date,status,remarks,branchId,batchId")
    .eq("studentId", studentId)
    .order("date", { ascending: false });
  if (error) fail(error.message);
  return (data || []) as AttendanceRow[];
}

/**
 * Mark attendance for a set of students on one date. Writes `branchId` (which
 * `data.ts::markAttendance` omits) and, like `saveExamMarks`, updates rows that
 * already exist instead of relying on an upsert conflict target.
 */
export async function saveAttendance(
  branchId: string | null | undefined,
  date: string,
  records: Array<{ studentId: string; status: string; remarks?: string | null; batchId?: string | null }>,
  /** Who took the register. `attendance_records.markedById` is NOT NULL. */
  markedById?: string | null,
): Promise<{ inserted: number; updated: number }> {
  if (!date) fail("A date is required to save attendance.");
  if (!markedById) fail("Sign in again before saving attendance: the register needs to record who took it.");
  const now = new Date().toISOString();
  if (!records.length) return { inserted: 0, updated: 0 };

  const studentIds = records.map((record) => record.studentId);
  const { data: existingRows, error: readError } = await supabase
    .from("attendance_records")
    .select("id,studentId")
    .eq("date", date)
    .in("studentId", studentIds);
  if (readError) fail(readError.message);

  const byStudent = new Map((existingRows || []).map((row) => [row.studentId as string, row.id as string]));
  const toInsert: Record<string, unknown>[] = [];
  let updated = 0;

  for (const record of records) {
    const id = byStudent.get(record.studentId);
    if (id) {
      const { error } = await supabase
        .from("attendance_records")
        .update({ status: record.status, remarks: record.remarks ?? null, markedById, updatedAt: now })
        .eq("id", id);
      if (error) fail(error.message);
      updated += 1;
    } else {
      // The table came from Prisma, which filled id and updatedAt itself;
      // PostgREST does not, so they are supplied here with markedById.
      toInsert.push({
        id: newId("att"),
        studentId: record.studentId,
        date,
        status: record.status,
        remarks: record.remarks ?? null,
        branchId: branchId || null,
        batchId: record.batchId || null,
        markedById,
        updatedAt: now,
      });
    }
  }

  if (toInsert.length) {
    const { error } = await supabase.from("attendance_records").insert(toInsert);
    if (error) fail(error.message);
  }

  return { inserted: toInsert.length, updated };
}

/* ------------------------------------------------------------ batch timings */

/**
 * Timetable rows for a branch. `batch_timings` has no `branchId` column, so the
 * branch's batches are resolved first and the timings fetched by `batchId`.
 */
export async function listBatchTimingsForBranch(branchId?: string | null): Promise<BatchTimingRow[]> {
  let batchIds: string[] | null = null;
  if (branchId) {
    const batches = await listBatches(branchId);
    batchIds = batches.map((batch) => batch.id);
    if (!batchIds.length) return [];
  }
  let query = supabase
    .from("batch_timings")
    .select("id,batchId,day,startTime,endTime,subject,instructor,roomNo");
  if (batchIds) query = query.in("batchId", batchIds);
  const { data, error } = await query;
  if (error) fail(error.message);
  return (data || []) as BatchTimingRow[];
}

/* ------------------------------------------------------------------- shared */

/** `a / b` as a whole-number percentage, 0 when `b` is 0 or not a number. */
export const safePercent = (numerator: number, denominator: number) =>
  Number.isFinite(numerator) && Number.isFinite(denominator) && denominator > 0
    ? Math.round((numerator / denominator) * 100)
    : 0;

/** `new Date(value)` guarded — returns null for empty / unparseable input. */
export const safeDate = (value: unknown): Date | null => {
  if (value === null || value === undefined || value === "") return null;
  const date = new Date(value as string);
  return Number.isNaN(date.getTime()) ? null : date;
};

/** Locale date string, or a dash when the input is not a usable date. */
export const safeDateLabel = (value: unknown, locale = "en-IN", options?: Intl.DateTimeFormatOptions) => {
  const date = safeDate(value);
  return date ? date.toLocaleDateString(locale, options) : "—";
};
