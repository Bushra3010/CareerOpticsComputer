/**
 * Reads and writes for online exams (online-exams.sql): the papers the head
 * office sets, who they are assigned to, and the students' sittings. A
 * student's own path -- their list, their paper, their answers -- goes through
 * the database functions, which never hand the answers over.
 */
import { supabase } from "./client";
import type { AttemptSummary, ExamQuestion, ExamStatus, OnlineExam } from "../onlineExam";
import { examProblem } from "../onlineExam";

const SETUP_HINT = "Online exams are not set up yet. Run supabase/schema/online-exams.sql in Supabase.";

const missingRelation = (error: { code?: string; message?: string } | null) =>
  error?.code === "42P01" || error?.code === "PGRST205" || error?.code === "PGRST202" || error?.code === "42703" ||
  /does not exist|schema cache/i.test(error?.message || "");

/** The database's own words for a refused sitting, without the code in front. */
const plain = (message: string) => message.replace(/^[A-Z_]+:\s*/, "");

function fail(error: { code?: string; message?: string }): never {
  if (missingRelation(error)) throw new Error(SETUP_HINT);
  throw new Error(plain(error.message || "Request failed"));
}

const num = (v: unknown) => Number(v) || 0;
const text = (v: unknown) => (v == null ? "" : String(v));
const now = () => new Date().toISOString();

/* -------------------------------------------------------------------- exams */

const mapQuestion = (row: Record<string, unknown>): ExamQuestion => ({
  id: text(row.id),
  text: text(row.text),
  options: Array.isArray(row.options) ? (row.options as unknown[]).map(text) : [],
  answer: Number.isInteger(Number(row.answer)) ? Number(row.answer) : -1,
  marks: row.marks == null || row.marks === "" ? null : Number(row.marks),
});

const mapExam = (row: Record<string, unknown>): OnlineExam => ({
  id: text(row.id),
  title: text(row.title),
  description: text(row.description),
  courseId: text(row.courseId),
  term: Math.max(1, num(row.term)),
  totalQuestions: num(row.totalQuestions),
  marksPerQuestion: num(row.marksPerQuestion) || 1,
  negativeMarks: num(row.negativeMarks),
  passPercentage: num(row.passPercentage),
  durationMinutes: num(row.durationMinutes) || 60,
  startAt: text(row.startAt),
  endAt: text(row.endAt),
  shuffleQuestions: row.shuffleQuestions !== false,
  showResult: row.showResult !== false,
  status: (["DRAFT", "PUBLISHED", "CLOSED"].includes(text(row.status)) ? row.status : "PUBLISHED") as ExamStatus,
  questions: Array.isArray(row.questions) ? (row.questions as Record<string, unknown>[]).map(mapQuestion) : [],
  createdAt: text(row.createdAt),
  updatedAt: text(row.updatedAt),
});

/** Every exam the login may see: all of them for the head office, the centre's own for a centre. */
export async function getOnlineExams(): Promise<OnlineExam[]> {
  const { data, error } = await supabase.from("online_exams").select("*").is("deletedAt", null).order("createdAt", { ascending: false });
  if (error) {
    if (missingRelation(error)) return [];
    fail(error);
  }
  return (data || []).map(mapExam);
}

export type OnlineExamInput = Omit<OnlineExam, "id" | "createdAt" | "updatedAt"> & { id?: string };

export async function saveOnlineExam(input: OnlineExamInput, by?: { name?: string | null; organizationId?: string | null }): Promise<string> {
  const problem = examProblem(input);
  if (problem) throw new Error(problem);
  const payload = {
    title: input.title.trim(),
    description: input.description.trim() || null,
    courseId: input.courseId || null,
    term: Math.max(1, Math.floor(input.term) || 1),
    totalQuestions: Math.max(0, Math.floor(input.totalQuestions) || 0),
    marksPerQuestion: input.marksPerQuestion,
    negativeMarks: input.negativeMarks,
    passPercentage: input.passPercentage,
    durationMinutes: Math.floor(input.durationMinutes),
    startAt: input.startAt ? new Date(input.startAt).toISOString() : null,
    endAt: input.endAt ? new Date(input.endAt).toISOString() : null,
    shuffleQuestions: input.shuffleQuestions,
    showResult: input.showResult,
    status: input.status,
    questions: input.questions.map((q) => ({
      id: q.id,
      text: q.text.trim(),
      options: q.options.map((o) => o.trim()),
      answer: q.answer,
      marks: q.marks != null && Number(q.marks) > 0 ? Number(q.marks) : null,
    })),
    updatedAt: now(),
  };
  if (input.id) {
    const { error } = await supabase.from("online_exams").update(payload).eq("id", input.id);
    if (error) fail(error);
    return input.id;
  }
  const { data, error } = await supabase
    .from("online_exams")
    .insert({ ...payload, organizationId: by?.organizationId || null, createdBy: by?.name || null })
    .select("id")
    .single();
  if (error) fail(error);
  return text((data as { id?: string } | null)?.id);
}

export async function setOnlineExamStatus(id: string, status: ExamStatus) {
  const { error } = await supabase.from("online_exams").update({ status, updatedAt: now() }).eq("id", id);
  if (error) fail(error);
}

export async function deleteOnlineExam(id: string) {
  const { error } = await supabase.from("online_exams").update({ deletedAt: now() }).eq("id", id);
  if (error) fail(error);
}

/* -------------------------------------------------------------- assignments */

export interface ExamAssignment {
  id: string;
  examId: string;
  branchId: string;
  /** Empty for every student of the centre. */
  studentId: string;
  /** With no student: narrows "every student" to one course. Empty for all. */
  courseId: string;
  assignedBy: string;
  assignedAt: string;
}

const mapAssignment = (row: Record<string, unknown>): ExamAssignment => ({
  id: text(row.id),
  examId: text(row.examId),
  branchId: text(row.branchId),
  studentId: text(row.studentId),
  courseId: text(row.courseId),
  assignedBy: text(row.assignedBy),
  assignedAt: text(row.assignedAt),
});

export async function getExamAssignments(branchId: string | null): Promise<ExamAssignment[]> {
  let query = supabase.from("online_exam_assignments").select("*").order("assignedAt", { ascending: false });
  if (branchId) query = query.eq("branchId", branchId);
  const { data, error } = await query;
  if (error) {
    if (missingRelation(error)) return [];
    fail(error);
  }
  return (data || []).map(mapAssignment);
}

export interface AssignInput {
  examId: string;
  branchId: string;
  /** The students to put on the exam; null for every student of the centre. */
  studentIds: string[] | null;
  /** With every student: only those of this course, when set. */
  courseId?: string | null;
}

/** Puts the centre, a course's students or the named students on the exam; what is already there is left alone. Returns how many were added. */
export async function assignExam(input: AssignInput, by?: string | null): Promise<number> {
  if (!input.examId) throw new Error("Choose the exam.");
  if (!input.branchId) throw new Error("Choose the centre.");
  if (input.studentIds && !input.studentIds.length) throw new Error("Tick at least one student.");
  const { data: existing, error: readError } = await supabase
    .from("online_exam_assignments")
    .select("studentId, courseId")
    .eq("examId", input.examId)
    .eq("branchId", input.branchId);
  if (readError) fail(readError);
  const have = new Set(((existing || []) as Array<{ studentId: string | null; courseId: string | null }>).map((r) => `${r.studentId || ""}|${r.courseId || ""}`));
  const rows = (input.studentIds
    ? input.studentIds.map((studentId) => ({ studentId, courseId: null as string | null }))
    : [{ studentId: null as string | null, courseId: input.courseId || null }]
  )
    .filter((r) => !have.has(`${r.studentId || ""}|${r.courseId || ""}`))
    .map((r) => ({ ...r, examId: input.examId, branchId: input.branchId, assignedBy: by || null }));
  if (!rows.length) return 0;
  const { error } = await supabase.from("online_exam_assignments").insert(rows);
  if (error) fail(error);
  return rows.length;
}

export async function removeExamAssignment(id: string) {
  const { error } = await supabase.from("online_exam_assignments").delete().eq("id", id);
  if (error) fail(error);
}

/* ----------------------------------------------------------------- attempts */

export interface ExamAttempt extends AttemptSummary {
  id: string;
  examId: string;
  studentId: string;
  branchId: string;
  startedAt: string;
  expiresAt: string;
  submittedAt: string;
  /** PASS / FAIL once submitted; empty while the student is still sitting. */
  result: "PASS" | "FAIL";
}

const mapAttempt = (row: Record<string, unknown>): ExamAttempt => ({
  id: text(row.id),
  examId: text(row.examId),
  studentId: text(row.studentId),
  branchId: text(row.branchId),
  startedAt: text(row.startedAt),
  expiresAt: text(row.expiresAt),
  submittedAt: text(row.submittedAt),
  totalQuestions: num(row.totalQuestions),
  attempted: num(row.attempted),
  correct: num(row.correct),
  wrong: num(row.wrong),
  score: num(row.score),
  maxScore: num(row.maxScore),
  percentage: num(row.percentage),
  result: (row.result === "FAIL" ? "FAIL" : row.result === "PASS" ? "PASS" : "") as "PASS" | "FAIL",
});

export async function getExamAttempts(filter: { branchId?: string | null; examId?: string | null } = {}): Promise<ExamAttempt[]> {
  let query = supabase.from("online_exam_attempts").select("*").order("startedAt", { ascending: false });
  if (filter.branchId) query = query.eq("branchId", filter.branchId);
  if (filter.examId) query = query.eq("examId", filter.examId);
  const { data, error } = await query;
  if (error) {
    if (missingRelation(error)) return [];
    fail(error);
  }
  return (data || []).map(mapAttempt);
}

/** Lets the student sit the exam again. */
export async function deleteExamAttempt(id: string) {
  const { error } = await supabase.from("online_exam_attempts").delete().eq("id", id);
  if (error) fail(error);
}

/* ------------------------------------------------------ the student's path */

export interface MyExam {
  id: string;
  title: string;
  description: string;
  courseId: string;
  course: string;
  term: number;
  questionCount: number;
  marksPerQuestion: number;
  negativeMarks: number;
  passPercentage: number;
  durationMinutes: number;
  startAt: string;
  endAt: string;
  showResult: boolean;
  status: ExamStatus;
  attempt: (Omit<AttemptSummary, "result"> & { id: string; startedAt: string; expiresAt: string; submittedAt: string; result: "PASS" | "FAIL" | "" }) | null;
}

const mapMyExam = (row: Record<string, unknown>): MyExam => {
  const a = (row.attempt || null) as Record<string, unknown> | null;
  return {
    id: text(row.id),
    title: text(row.title),
    description: text(row.description),
    courseId: text(row.courseId),
    course: text(row.course),
    term: Math.max(1, num(row.term)),
    questionCount: num(row.questionCount),
    marksPerQuestion: num(row.marksPerQuestion) || 1,
    negativeMarks: num(row.negativeMarks),
    passPercentage: num(row.passPercentage),
    durationMinutes: num(row.durationMinutes) || 60,
    startAt: text(row.startAt),
    endAt: text(row.endAt),
    showResult: row.showResult !== false,
    status: (["DRAFT", "PUBLISHED", "CLOSED"].includes(text(row.status)) ? row.status : "PUBLISHED") as ExamStatus,
    attempt: a
      ? {
          id: text(a.id),
          startedAt: text(a.startedAt),
          expiresAt: text(a.expiresAt),
          submittedAt: text(a.submittedAt),
          totalQuestions: num(a.totalQuestions),
          attempted: num(a.attempted),
          correct: num(a.correct),
          wrong: num(a.wrong),
          score: num(a.score),
          maxScore: num(a.maxScore),
          percentage: num(a.percentage),
          result: a.result === "PASS" ? "PASS" : a.result === "FAIL" ? "FAIL" : "",
        }
      : null,
  };
};

/**
 * The exams assigned to a student, with their sitting. A student's own login
 * needs no id; the office opening a student's portal passes the student's.
 */
export async function getMyOnlineExams(studentId?: string | null): Promise<MyExam[]> {
  const { data, error } = await supabase.rpc("my_online_exams", { p_student_id: studentId || null });
  if (error) {
    if (missingRelation(error)) return [];
    fail(error);
  }
  return (Array.isArray(data) ? (data as Record<string, unknown>[]) : []).map(mapMyExam);
}

export interface ExamPaper {
  attemptId: string;
  examId: string;
  title: string;
  durationMinutes: number;
  marksPerQuestion: number;
  negativeMarks: number;
  passPercentage: number;
  showResult: boolean;
  startedAt: string;
  expiresAt: string;
  answers: Record<string, number>;
  /** The questions given, without their answers. */
  questions: Array<{ id: string; text: string; options: string[]; marks: number | null }>;
}

/** Begins (or resumes) the student's sitting and hands over their paper. */
export async function startOnlineExam(examId: string): Promise<ExamPaper> {
  const { data, error } = await supabase.rpc("start_online_exam", { p_exam_id: examId });
  if (error) fail(error);
  const row = (data || {}) as Record<string, unknown>;
  const answers: Record<string, number> = {};
  Object.entries((row.answers as Record<string, unknown>) || {}).forEach(([k, v]) => {
    if (v !== null && v !== undefined && String(v) !== "") answers[k] = Number(v);
  });
  return {
    attemptId: text(row.attemptId),
    examId: text(row.examId),
    title: text(row.title),
    durationMinutes: num(row.durationMinutes),
    marksPerQuestion: num(row.marksPerQuestion) || 1,
    negativeMarks: num(row.negativeMarks),
    passPercentage: num(row.passPercentage),
    showResult: row.showResult !== false,
    startedAt: text(row.startedAt),
    expiresAt: text(row.expiresAt),
    answers,
    questions: (Array.isArray(row.questions) ? (row.questions as Record<string, unknown>[]) : []).map((q) => ({
      id: text(q.id),
      text: text(q.text),
      options: Array.isArray(q.options) ? (q.options as unknown[]).map(text) : [],
      marks: q.marks == null || q.marks === "" ? null : Number(q.marks),
    })),
  };
}

export async function saveOnlineAnswers(attemptId: string, answers: Record<string, number>) {
  const { error } = await supabase.rpc("save_online_answers", { p_attempt_id: attemptId, p_answers: answers });
  if (error) fail(error);
}

export type SubmitResult = AttemptSummary & { attemptId: string; submitted: boolean; showResult: boolean; alreadySubmitted?: boolean };

const mapSubmit = (row: Record<string, unknown>): SubmitResult => ({
  attemptId: text(row.attemptId),
  submitted: row.submitted !== false,
  alreadySubmitted: row.alreadySubmitted === true,
  showResult: row.showResult !== false,
  totalQuestions: num(row.totalQuestions),
  attempted: num(row.attempted),
  correct: num(row.correct),
  wrong: num(row.wrong),
  score: num(row.score),
  maxScore: num(row.maxScore),
  percentage: num(row.percentage),
  result: row.result === "FAIL" ? "FAIL" : "PASS",
});

/** Hands the paper in; the database marks it. Staff may close a sitting whose time is over. */
export async function submitOnlineExam(attemptId: string, answers?: Record<string, number> | null): Promise<SubmitResult> {
  const { data, error } = await supabase.rpc("submit_online_exam", { p_attempt_id: attemptId, p_answers: answers ?? null });
  if (error) fail(error);
  return mapSubmit((data || {}) as Record<string, unknown>);
}
