/**
 * A centre's own question bank (centre-panel.sql) and the exams a centre
 * draws from it (centre-exams.sql).
 *
 * A bank question keeps its right answer as the option's words, the way the
 * centre typed it or uploaded it in a sheet. An online exam keeps the index
 * of the right option instead (see `ExamQuestion`), so the conversion happens
 * once, here, when questions are drawn into an exam.
 */
import { supabase } from "./client";
import { newQuestionId, type ExamQuestion } from "../onlineExam";

const BANK_SETUP_HINT = "The question bank is not set up yet. Run supabase/schema/centre-panel.sql in Supabase.";
const EXAM_SETUP_HINT = "Centre exams are not set up yet. Run supabase/schema/centre-exams.sql in Supabase.";

const missingRelation = (error: { code?: string; message?: string } | null) =>
  error?.code === "42P01" || error?.code === "PGRST205" || error?.code === "PGRST204" || error?.code === "42703" ||
  /does not exist|schema cache/i.test(error?.message || "");

function fail(error: { code?: string; message?: string }, hint = BANK_SETUP_HINT): never {
  throw new Error(missingRelation(error) ? hint : error.message || "Request failed");
}

const text = (v: unknown) => (v == null ? "" : String(v));
const num = (v: unknown) => Number(v) || 0;

/* --------------------------------------------------------------- questions */

export type QuestionStatus = "ACTIVE" | "INACTIVE";

export interface BankQuestion {
  id: string;
  branchId: string;
  courseId: string;
  /** Empty for "No Subject". */
  subject: string;
  question: string;
  options: string[];
  /** The right option's words. */
  answer: string;
  status: QuestionStatus;
  createdAt: string;
}

export type BankQuestionInput = Pick<BankQuestion, "courseId" | "subject" | "question" | "options" | "answer"> & {
  status?: QuestionStatus;
};

const mapQuestion = (row: Record<string, unknown>): BankQuestion => ({
  id: text(row.id),
  branchId: text(row.branchId),
  courseId: text(row.courseId),
  subject: text(row.subject),
  question: text(row.question),
  options: Array.isArray(row.options) ? (row.options as unknown[]).map(text) : [],
  answer: text(row.answer),
  status: row.status === "INACTIVE" ? "INACTIVE" : "ACTIVE",
  createdAt: text(row.createdAt),
});

/** What is wrong with a question, or null when it can be saved. */
export function bankQuestionProblem(q: BankQuestionInput, where = "The question"): string | null {
  if (!q.question.trim()) return `${where} has no wording.`;
  const options = q.options.map((o) => o.trim());
  if (options.length < 2 || options.some((o) => !o)) return `${where} needs all its options filled in.`;
  if (new Set(options.map((o) => o.toLowerCase())).size !== options.length) return `${where} repeats an option.`;
  if (!options.some((o) => o.toLowerCase() === q.answer.trim().toLowerCase())) return `${where}: the answer must be one of the options.`;
  return null;
}

const toRow = (branchId: string, q: BankQuestionInput) => {
  const options = q.options.map((o) => o.trim());
  // Stored as the option exactly as written, so the exam's index lookup matches.
  const answer = options.find((o) => o.toLowerCase() === q.answer.trim().toLowerCase()) ?? q.answer.trim();
  return {
    branchId,
    courseId: q.courseId || null,
    subject: q.subject.trim() || null,
    question: q.question.trim(),
    options,
    answer,
    status: q.status ?? "ACTIVE",
  };
};

/** A centre's questions (every centre of the organisation for an admin, as RLS allows). */
export async function listBankQuestions(filter: { branchId?: string | null; courseId?: string | null } = {}): Promise<BankQuestion[]> {
  let query = supabase.from("question_bank").select("*").order("createdAt", { ascending: false });
  if (filter.branchId) query = query.eq("branchId", filter.branchId);
  if (filter.courseId) query = query.eq("courseId", filter.courseId);
  const { data, error } = await query;
  if (error) fail(error);
  return (data || []).map((r) => mapQuestion(r as Record<string, unknown>));
}

export async function createBankQuestions(branchId: string | null, questions: BankQuestionInput[]): Promise<number> {
  if (!branchId) throw new Error("Choose the centre these questions belong to.");
  if (!questions.length) return 0;
  for (const [i, q] of questions.entries()) {
    const problem = bankQuestionProblem(q, `Question ${i + 1}`);
    if (problem) throw new Error(problem);
  }
  const { error } = await supabase.from("question_bank").insert(questions.map((q) => toRow(branchId, q)));
  if (error) fail(error);
  return questions.length;
}

export async function updateBankQuestion(id: string, q: BankQuestionInput) {
  const problem = bankQuestionProblem(q);
  if (problem) throw new Error(problem);
  // The centre a question belongs to never changes on an edit.
  const row: Record<string, unknown> = toRow("", q);
  delete row.branchId;
  const { data, error } = await supabase.from("question_bank").update(row).eq("id", id).select("id");
  if (error) fail(error);
  if (!data?.length) throw new Error("That question was not saved — it no longer exists, or this login may not change it.");
}

export async function setBankQuestionStatus(id: string, status: QuestionStatus) {
  const { error } = await supabase.from("question_bank").update({ status }).eq("id", id);
  if (error) fail(error);
}

export async function deleteBankQuestion(id: string) {
  const { data, error } = await supabase.from("question_bank").delete().eq("id", id).select("id");
  if (error) fail(error);
  if (!data?.length) throw new Error("That question was not removed — it no longer exists, or this login may not remove it.");
}

/* --------------------------------------------------------------------- CSV */

export const QUESTION_CSV_HEADERS = ["question", "option1", "option2", "option3", "option4", "answer"] as const;

export const SAMPLE_QUESTION_CSV = [
  QUESTION_CSV_HEADERS.join(","),
  "What does CPU stand for?,Central Processing Unit,Computer Personal Unit,Central Print Unit,Control Processing Unit,Central Processing Unit",
  "Which key combination copies selected text?,Ctrl + V,Ctrl + C,Ctrl + X,Ctrl + Z,2",
  '"Which of these is an input device?",Monitor,Printer,Keyboard,Speaker,3',
  '"In MS Excel, which function adds a range, e.g. A1:A5?",COUNT,"SUM",AVERAGE,MAX,SUM',
].join("\n");

/** Splits CSV text into rows of fields; quoted fields may hold commas, doubled quotes and line breaks. */
export function splitCsv(input: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let quoted = false;
  const src = input.replace(/^\uFEFF/, "");
  for (let i = 0; i < src.length; i++) {
    const ch = src[i];
    if (quoted) {
      if (ch === '"') {
        if (src[i + 1] === '"') {
          field += '"';
          i++;
        } else quoted = false;
      } else field += ch;
    } else if (ch === '"') quoted = true;
    else if (ch === ",") {
      row.push(field);
      field = "";
    } else if (ch === "\n" || ch === "\r") {
      if (ch === "\r" && src[i + 1] === "\n") i++;
      row.push(field);
      rows.push(row);
      row = [];
      field = "";
    } else field += ch;
  }
  if (field !== "" || row.length) {
    row.push(field);
    rows.push(row);
  }
  // A spreadsheet's trailing blank lines come through as rows of empty fields.
  return rows.filter((r) => r.some((f) => f.trim() !== ""));
}

export interface ParsedQuestion {
  question: string;
  options: string[];
  answer: string;
}

export interface CsvParseResult {
  questions: ParsedQuestion[];
  /** One line per row that was skipped, naming the sheet's row number. */
  errors: string[];
}

/**
 * Reads question,option1..option4,answer. The answer may be the right
 * option's words or its number (1-4); a header row is recognised by its
 * first cell and skipped.
 */
export function parseQuestionCsv(csv: string): CsvParseResult {
  const rows = splitCsv(csv);
  const questions: ParsedQuestion[] = [];
  const errors: string[] = [];
  rows.forEach((cells, index) => {
    const line = index + 1;
    if (index === 0 && cells[0]?.trim().toLowerCase() === "question") return;
    const [question = "", o1 = "", o2 = "", o3 = "", o4 = "", rawAnswer = ""] = cells.map((c) => c.trim());
    const options = [o1, o2, o3, o4];
    if (!question) return void errors.push(`Row ${line}: the question is empty.`);
    if (options.some((o) => !o)) return void errors.push(`Row ${line}: all four options are needed.`);
    let answer = "";
    if (/^[1-4]$/.test(rawAnswer)) answer = options[Number(rawAnswer) - 1];
    else answer = options.find((o) => o.toLowerCase() === rawAnswer.toLowerCase()) ?? "";
    if (!answer) return void errors.push(`Row ${line}: the answer "${rawAnswer}" is not one of the options or 1-4.`);
    questions.push({ question, options, answer });
  });
  return { questions, errors };
}

/* ------------------------------------------------------------------- exams */

export type CentreExamType = "ONLINE" | "PRACTICE";

export interface CentreExam {
  id: string;
  title: string;
  description: string;
  courseId: string;
  branchId: string;
  examType: string;
  questionCount: number;
  durationMinutes: number;
  status: string;
  createdAt: string;
}

const mapExam = (row: Record<string, unknown>): CentreExam => ({
  id: text(row.id),
  title: text(row.title),
  description: text(row.description),
  courseId: text(row.courseId),
  branchId: text(row.branchId),
  examType: text(row.examType) || "ONLINE",
  questionCount: Array.isArray(row.questions) ? row.questions.length : 0,
  durationMinutes: num(row.durationMinutes),
  status: text(row.status) || "PUBLISHED",
  createdAt: text(row.createdAt),
});

/**
 * The exams a login can see: RLS gives a centre its own and the ones assigned
 * to it, and the admin the organisation's. Read with `*` so a database that
 * has not run centre-exams.sql still lists the head office's exams.
 */
export async function listCentreExams(): Promise<CentreExam[]> {
  const { data, error } = await supabase.from("online_exams").select("*").is("deletedAt", null).order("createdAt", { ascending: false });
  if (error) {
    if (missingRelation(error)) return [];
    fail(error, EXAM_SETUP_HINT);
  }
  return (data || []).map((r) => mapExam(r as Record<string, unknown>));
}

/** Fisher-Yates over a copy; `random` is injectable so a test can pin the draw. */
export function drawRandom<T>(items: T[], count: number, random: () => number = Math.random): T[] {
  const pool = [...items];
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }
  return pool.slice(0, Math.max(0, count));
}

/** A bank question in the shape an online exam marks: the answer as its option's index. */
export function toExamQuestion(q: Pick<BankQuestion, "question" | "options" | "answer">): ExamQuestion {
  const answer = q.options.findIndex((o) => o.trim().toLowerCase() === q.answer.trim().toLowerCase());
  return { id: newQuestionId(), text: q.question, options: q.options, answer, marks: null };
}

export interface CentreExamInput {
  title: string;
  examType: CentreExamType;
  branchId: string;
  organizationId: string | null;
  courseId: string;
  /** Empty: draw from every subject of the course. "__none__": only questions with no subject. */
  subject: string;
  /** Empty: every student of the course at the centre. */
  batchId: string;
  durationMinutes: number;
  questionCount: number;
  description: string;
  createdBy?: string | null;
}

export const NO_SUBJECT = "__none__";

/**
 * Draws the paper from the centre's ACTIVE bank questions, saves the exam
 * with the centre as its owner, and puts the batch's students (or the whole
 * course at the centre) on it. Returns the exam id and how many questions
 * and students it got.
 */
export async function createCentreExam(input: CentreExamInput): Promise<{ id: string; questions: number; assigned: number }> {
  if (!input.title.trim()) throw new Error("Give the exam a name.");
  if (!input.branchId) throw new Error("Choose the centre.");
  if (!input.courseId) throw new Error("Choose the course.");
  if (!(input.durationMinutes > 0)) throw new Error("Set how many minutes the exam lasts.");
  if (!(input.questionCount > 0)) throw new Error("Set how many questions the exam has.");

  let query = supabase
    .from("question_bank")
    .select("*")
    .eq("branchId", input.branchId)
    .eq("courseId", input.courseId)
    .eq("status", "ACTIVE");
  if (input.subject === NO_SUBJECT) query = query.is("subject", null);
  else if (input.subject) query = query.eq("subject", input.subject);
  const { data: bank, error: bankError } = await query;
  if (bankError) fail(bankError);
  const usable = (bank || []).map((r) => mapQuestion(r as Record<string, unknown>)).filter((q) => toExamQuestion(q).answer >= 0);
  if (usable.length < input.questionCount) {
    throw new Error(
      `Only ${usable.length} active question${usable.length === 1 ? "" : "s"} in the bank for this course${input.subject ? " and subject" : ""}; add more or ask for fewer.`,
    );
  }
  const questions = drawRandom(usable, input.questionCount).map(toExamQuestion);

  // Students are put on individually for a batch, since an assignment has no
  // batch of its own; the whole course is one row.
  let studentIds: string[] | null = null;
  if (input.batchId) {
    const { data: students, error } = await supabase
      .from("students")
      .select("id")
      .eq("branchId", input.branchId)
      .eq("batchId", input.batchId)
      .is("deletedAt", null);
    if (error) fail(error);
    studentIds = (students || []).map((s) => text((s as { id?: string }).id));
    if (!studentIds.length) throw new Error("This batch has no students to give the exam to.");
  }

  const now = new Date().toISOString();
  const { data: created, error: insertError } = await supabase
    .from("online_exams")
    .insert({
      organizationId: input.organizationId || null,
      branchId: input.branchId,
      examType: input.examType,
      title: input.title.trim(),
      description: input.description.trim() || null,
      courseId: input.courseId,
      term: 1,
      totalQuestions: questions.length,
      marksPerQuestion: 1,
      negativeMarks: 0,
      passPercentage: 40,
      durationMinutes: Math.floor(input.durationMinutes),
      // The draw above fixed which questions; shuffling varies their order per student.
      shuffleQuestions: true,
      showResult: true,
      status: "PUBLISHED",
      questions,
      createdBy: input.createdBy || null,
      updatedAt: now,
    })
    .select("id")
    .single();
  if (insertError) fail(insertError, EXAM_SETUP_HINT);
  const id = text((created as { id?: string } | null)?.id);

  const rows = (studentIds ?? [null]).map((studentId) => ({
    examId: id,
    branchId: input.branchId,
    studentId,
    courseId: studentId ? null : input.courseId,
    assignedBy: input.createdBy || null,
  }));
  const { error: assignError } = await supabase.from("online_exam_assignments").insert(rows);
  if (assignError) {
    // The exam without its students is invisible to them; say so rather than report success.
    throw new Error(`The exam was saved but could not be given to the students: ${assignError.message}. Assign it from Online Exam → Assign.`);
  }
  return { id, questions: questions.length, assigned: studentIds ? studentIds.length : 0 };
}
