import { createClient } from "@/lib/db/server";

export interface QuestionBankRow {
  id: string;
  name: string;
  description: string | null;
  status: "draft" | "active" | "retired";
  questionCount: number;
  createdOn: string;
}

export interface QuestionRow {
  id: string;
  type: string;
  typeLabel: string;
  body: string;
  marks: number;
  negativeMarks: number;
  difficulty: "easy" | "medium" | "hard";
  status: "draft" | "active" | "retired";
  options: { id: string; body: string; isCorrect: boolean }[];
}

const TYPE_LABELS: Record<string, string> = {
  single_choice: "Single choice",
  multiple_choice: "Multiple choice",
  true_false: "True or false",
  fill_in: "Fill in",
  short_answer: "Short answer",
  long_answer: "Long answer",
  file_upload: "File upload",
};

export async function listQuestionBanks(): Promise<QuestionBankRow[]> {
  const supabase = await createClient();

  // Scoped by RLS, not by an argument. question_banks_read resolves the
  // organisation from the session, so there is no id here to point elsewhere.
  const { data } = await supabase
    .from("question_banks")
    .select("id, name, description, status, created_at, questions(count)")
    .order("created_at", { ascending: false });

  return (data ?? []).map((b) => {
    const counts = b.questions as unknown as { count: number }[] | null;
    return {
      id: b.id,
      name: b.name,
      description: b.description,
      status: b.status,
      questionCount: counts?.[0]?.count ?? 0,
      createdOn: b.created_at.slice(0, 10),
    };
  });
}

export interface QuestionBankDetail {
  id: string;
  name: string;
  description: string | null;
  status: "draft" | "active" | "retired";
  questions: QuestionRow[];
}

/**
 * A bank and every question in it, with the answer key filled in.
 *
 * The key needs one `question_answer_key` call per question, because that
 * function is the only way past the privilege revoke on `is_correct` and it
 * takes a single id. They are issued together rather than in sequence — a bank
 * of sixty questions would otherwise be sixty round trips one after another.
 * If a bank ever grows past a few hundred questions this wants a set-returning
 * variant; it is not worth one now.
 */
export async function getQuestionBank(
  bankId: string,
): Promise<QuestionBankDetail | null> {
  const supabase = await createClient();

  const { data: bank } = await supabase
    .from("question_banks")
    .select("id, name, description, status")
    .eq("id", bankId)
    .maybeSingle();
  if (!bank) return null;

  const { data: questions } = await supabase
    .from("questions")
    .select("id, type, body, marks, negative_marks, difficulty, status")
    .eq("bank_id", bankId)
    .order("created_at");

  const rows = questions ?? [];

  const [optionsResult, ...keys] = await Promise.all([
    supabase
      .from("question_options")
      .select("id, question_id, body, display_order")
      .in(
        "question_id",
        rows.map((q) => q.id),
      )
      .order("display_order"),
    ...rows.map((q) =>
      supabase.rpc("question_answer_key", { p_question_id: q.id }),
    ),
  ]);

  const correct = new Set<string>();
  keys.forEach((k) => {
    const data = k.data as { option_id: string }[] | null;
    for (const row of data ?? []) correct.add(row.option_id);
  });

  const byQuestion = new Map<string, QuestionRow["options"]>();
  for (const o of optionsResult.data ?? []) {
    if (!byQuestion.has(o.question_id)) byQuestion.set(o.question_id, []);
    byQuestion.get(o.question_id)!.push({
      id: o.id,
      body: o.body,
      isCorrect: correct.has(o.id),
    });
  }

  return {
    id: bank.id,
    name: bank.name,
    description: bank.description,
    status: bank.status,
    questions: rows.map((q) => ({
      id: q.id,
      type: q.type,
      typeLabel: TYPE_LABELS[q.type] ?? q.type,
      body: q.body,
      marks: q.marks,
      negativeMarks: q.negative_marks,
      difficulty: q.difficulty,
      status: q.status,
      options: byQuestion.get(q.id) ?? [],
    })),
  };
}

export interface ExamRow {
  id: string;
  title: string;
  status: "draft" | "published" | "cancelled";
  bankName: string;
  durationMinutes: number;
  opensAt: string;
  closesAt: string;
  questionCount: number;
  centreCount: number;
  /** Published and inside its window, computed rather than stored. */
  isOpen: boolean;
}

function one<T>(rel: unknown): T | null {
  return Array.isArray(rel) ? ((rel[0] as T) ?? null) : ((rel as T) ?? null);
}

/** IST, because a window is read by people who work in one timezone. */
export function formatIst(iso: string): string {
  return new Date(iso).toLocaleString("en-IN", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Asia/Kolkata",
  });
}

export async function listExams(): Promise<ExamRow[]> {
  const supabase = await createClient();

  const { data } = await supabase
    .from("exams")
    .select(
      `id, title, status, duration_minutes, opens_at, closes_at,
       question_banks(name), exam_questions(count), exam_assignments(count)`,
    )
    .order("opens_at", { ascending: false });

  const now = Date.now();
  return (data ?? []).map((e) => {
    const questions = e.exam_questions as unknown as { count: number }[] | null;
    const centres = e.exam_assignments as unknown as { count: number }[] | null;
    return {
      id: e.id,
      title: e.title,
      status: e.status,
      bankName: one<{ name: string }>(e.question_banks)?.name ?? "—",
      durationMinutes: e.duration_minutes,
      opensAt: e.opens_at,
      closesAt: e.closes_at,
      questionCount: questions?.[0]?.count ?? 0,
      centreCount: centres?.[0]?.count ?? 0,
      isOpen:
        e.status === "published" &&
        now >= Date.parse(e.opens_at) &&
        now < Date.parse(e.closes_at),
    };
  });
}

export interface ExamDetail extends ExamRow {
  instructions: string | null;
  passPercent: number;
  maxAttempts: number;
  bankId: string;
  paper: { id: string; body: string; typeLabel: string; marks: number }[];
  centres: { id: string; centreId: string; name: string; code: string }[];
}

export async function getExam(examId: string): Promise<ExamDetail | null> {
  const supabase = await createClient();

  const { data } = await supabase
    .from("exams")
    .select(
      `id, title, status, instructions, duration_minutes, opens_at, closes_at,
       pass_percent, max_attempts, bank_id, question_banks(name)`,
    )
    .eq("id", examId)
    .maybeSingle();
  if (!data) return null;

  const [paperResult, centreResult] = await Promise.all([
    supabase
      .from("exam_questions")
      .select("id, display_order, marks_override, questions(body, type, marks)")
      .eq("exam_id", examId)
      .order("display_order"),
    supabase
      .from("exam_assignments")
      .select("id, centre_id, centres(name, code)")
      .eq("exam_id", examId),
  ]);

  const now = Date.now();
  const paper = (paperResult.data ?? []).map((row) => {
    const q = one<{ body: string; type: string; marks: number }>(row.questions);
    return {
      id: row.id,
      body: q?.body ?? "",
      typeLabel: TYPE_LABELS[q?.type ?? ""] ?? q?.type ?? "",
      marks: row.marks_override ?? q?.marks ?? 0,
    };
  });

  return {
    id: data.id,
    title: data.title,
    status: data.status,
    instructions: data.instructions,
    bankId: data.bank_id,
    bankName: one<{ name: string }>(data.question_banks)?.name ?? "—",
    durationMinutes: data.duration_minutes,
    opensAt: data.opens_at,
    closesAt: data.closes_at,
    passPercent: data.pass_percent,
    maxAttempts: data.max_attempts,
    questionCount: paper.length,
    centreCount: centreResult.data?.length ?? 0,
    isOpen:
      data.status === "published" &&
      now >= Date.parse(data.opens_at) &&
      now < Date.parse(data.closes_at),
    paper,
    centres: (centreResult.data ?? []).map((a) => {
      const c = one<{ name: string; code: string }>(a.centres);
      return {
        id: a.id,
        centreId: a.centre_id,
        name: c?.name ?? "Centre",
        code: c?.code ?? "",
      };
    }),
  };
}

/** Questions in the exam's bank that are not yet on the paper. */
export async function listAvailableQuestions(
  bankId: string,
  examId: string,
): Promise<{ id: string; body: string; typeLabel: string; marks: number }[]> {
  const supabase = await createClient();

  const { data: onPaper } = await supabase
    .from("exam_questions")
    .select("question_id")
    .eq("exam_id", examId);
  const taken = new Set((onPaper ?? []).map((r) => r.question_id));

  const { data } = await supabase
    .from("questions")
    .select("id, body, type, marks")
    .eq("bank_id", bankId)
    .eq("status", "active")
    .order("created_at");

  return (data ?? [])
    .filter((q) => !taken.has(q.id))
    .map((q) => ({
      id: q.id,
      body: q.body,
      typeLabel: TYPE_LABELS[q.type] ?? q.type,
      marks: q.marks,
    }));
}

export async function listBankOptions(): Promise<
  { id: string; name: string }[]
> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("question_banks")
    .select("id, name")
    .order("name");
  return data ?? [];
}

export async function listCentreOptions(): Promise<
  { id: string; name: string; code: string }[]
> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("centres")
    .select("id, name, code")
    .eq("status", "active")
    .order("name");
  return data ?? [];
}
