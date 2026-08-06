import { createClient } from "@/lib/db/server";
import { callRpc } from "@/lib/db/rpc";

export interface PaperQuestion {
  questionId: string;
  displayOrder: number;
  type: "single_choice" | "multiple_choice" | "true_false" | string;
  body: string;
  marks: number;
  negativeMarks: number;
  options: { id: string; body: string }[];
}

export interface RunnerData {
  attemptId: string;
  examTitle: string;
  deadlineAt: string;
  /** The server's clock at render, so the client can compute its offset. */
  serverNow: string;
  /** deadline − serverNow in seconds, computed here so the client never has to
   *  call Date.now() during render. */
  initialRemainingSeconds: number;
  paper: PaperQuestion[];
  /** question_id -> saved answer, for resume. */
  saved: Record<string, { answer: Record<string, unknown>; clientSeq: number }>;
}

/**
 * Everything the runner needs, in one server render.
 *
 * Returns null for "not yours / not running", which the page turns into a
 * not-found — the distinction between "no such attempt" and "somebody else's
 * attempt" is deliberately not surfaced.
 */
export async function getRunnerData(
  attemptId: string,
): Promise<RunnerData | null> {
  const supabase = await createClient();

  const { data: attempt } = await supabase
    .from("exam_attempts")
    .select("id, status, deadline_at, exam_id")
    .eq("id", attemptId)
    .maybeSingle();
  if (!attempt || attempt.status !== "in_progress") return null;

  const [{ data: exam }, paperResult, answersResult] = await Promise.all([
    supabase
      .from("exams")
      .select("title")
      .eq("id", attempt.exam_id)
      .maybeSingle(),
    callRpc(supabase, "get_attempt_paper", { p_attempt_id: attemptId }),
    supabase
      .from("exam_answers")
      .select("question_id, answer, client_seq")
      .eq("attempt_id", attemptId),
  ]);

  if (paperResult.error || !paperResult.data) return null;

  const saved: RunnerData["saved"] = {};
  for (const row of answersResult.data ?? []) {
    saved[row.question_id] = {
      answer: row.answer as Record<string, unknown>,
      clientSeq: row.client_seq,
    };
  }

  const paper = (
    paperResult.data as {
      question_id: string;
      display_order: number;
      type: string;
      body: string;
      marks: number;
      negative_marks: number;
      options: { id: string; body: string }[];
    }[]
  ).map((q) => ({
    questionId: q.question_id,
    displayOrder: q.display_order,
    type: q.type,
    body: q.body,
    marks: q.marks,
    negativeMarks: q.negative_marks,
    options: q.options,
  }));

  const serverNow = Date.now();
  return {
    attemptId,
    examTitle: exam?.title ?? "Exam",
    deadlineAt: attempt.deadline_at,
    serverNow: new Date(serverNow).toISOString(),
    initialRemainingSeconds: Math.max(
      0,
      Math.floor((Date.parse(attempt.deadline_at) - serverNow) / 1000),
    ),
    paper,
    saved,
  };
}

export interface SubmittedAttempt {
  examTitle: string;
  scoreMarks: number | null;
  maxMarks: number | null;
  passPercent: number;
  status: string;
  submittedAt: string | null;
}

export async function getSubmittedAttempt(
  attemptId: string,
): Promise<SubmittedAttempt | null> {
  const supabase = await createClient();

  const { data } = await supabase
    .from("exam_attempts")
    .select(
      "status, score_marks, max_marks, submitted_at, exams(title, pass_percent)",
    )
    .eq("id", attemptId)
    .maybeSingle();
  if (!data || data.status === "in_progress") return null;

  const exam = (Array.isArray(data.exams) ? data.exams[0] : data.exams) as {
    title: string;
    pass_percent: number;
  } | null;

  return {
    examTitle: exam?.title ?? "Exam",
    scoreMarks: data.score_marks,
    maxMarks: data.max_marks,
    passPercent: exam?.pass_percent ?? 40,
    status: data.status,
    submittedAt: data.submitted_at,
  };
}

export interface StudentExam {
  id: string;
  title: string;
  instructions: string | null;
  durationMinutes: number;
  opensAt: string;
  closesAt: string;
  maxAttempts: number;
  isOpen: boolean;
  notYetOpen: boolean;
  /** The student's own attempts at it. */
  attempts: {
    id: string;
    status: string;
    scoreMarks: number | null;
    maxMarks: number | null;
  }[];
  /** An in-progress attempt to resume, if any. */
  resumeAttemptId: string | null;
}

export async function listStudentExams(): Promise<StudentExam[]> {
  const supabase = await createClient();

  // Both scoped by RLS from the session: exams through the assigned-to-my-
  // centre branch (0026), attempts through student_id = current_student_id().
  const [{ data: exams }, { data: attempts }] = await Promise.all([
    supabase
      .from("exams")
      .select(
        "id, title, instructions, duration_minutes, opens_at, closes_at, max_attempts",
      )
      .order("opens_at", { ascending: false }),
    supabase
      .from("exam_attempts")
      .select("id, exam_id, status, score_marks, max_marks")
      .order("attempt_number"),
  ]);

  const byExam = new Map<string, StudentExam["attempts"]>();
  const resume = new Map<string, string>();
  for (const a of attempts ?? []) {
    if (!byExam.has(a.exam_id)) byExam.set(a.exam_id, []);
    byExam.get(a.exam_id)!.push({
      id: a.id,
      status: a.status,
      scoreMarks: a.score_marks,
      maxMarks: a.max_marks,
    });
    if (a.status === "in_progress") resume.set(a.exam_id, a.id);
  }

  const now = Date.now();
  return (exams ?? []).map((e) => ({
    id: e.id,
    title: e.title,
    instructions: e.instructions,
    durationMinutes: e.duration_minutes,
    opensAt: e.opens_at,
    closesAt: e.closes_at,
    maxAttempts: e.max_attempts,
    isOpen: now >= Date.parse(e.opens_at) && now < Date.parse(e.closes_at),
    notYetOpen: now < Date.parse(e.opens_at),
    attempts: byExam.get(e.id) ?? [],
    resumeAttemptId: resume.get(e.id) ?? null,
  }));
}
