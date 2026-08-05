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
