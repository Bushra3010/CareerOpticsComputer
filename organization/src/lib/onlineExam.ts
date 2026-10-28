/**
 * The online exam's rules, kept apart from the screens so the head office's
 * exam editor, the centre's results table and the student's exam room all
 * read a paper the same way. The database marks the paper (online-exams.sql);
 * `scoreAttempt` here is the same arithmetic, for what the screens show
 * before and after.
 *
 *   exam → questions (MCQ: text, options, the right option's index, marks)
 *   assignment → a centre's students, a course's students, or one student
 *   attempt → the questions given, the answers, and the marks worked out
 */

export interface ExamQuestion {
  id: string;
  text: string;
  options: string[];
  /** 0-based index into `options`. */
  answer: number;
  /** Marks for this question; the exam's marks per question when empty. */
  marks?: number | null;
}

export type ExamStatus = "DRAFT" | "PUBLISHED" | "CLOSED";

export interface OnlineExam {
  id: string;
  title: string;
  description: string;
  courseId: string;
  term: number;
  /** How many of the questions a student gets; 0 means all of them. */
  totalQuestions: number;
  marksPerQuestion: number;
  negativeMarks: number;
  passPercentage: number;
  durationMinutes: number;
  startAt: string;
  endAt: string;
  shuffleQuestions: boolean;
  showResult: boolean;
  status: ExamStatus;
  questions: ExamQuestion[];
  createdAt: string;
  updatedAt: string;
}

export type ExamSettings = Pick<OnlineExam, "marksPerQuestion" | "negativeMarks" | "passPercentage">;

/** A student's answers: question id → the option index they chose. */
export type Answers = Record<string, number | string | null | undefined>;

export interface AttemptSummary {
  totalQuestions: number;
  attempted: number;
  correct: number;
  wrong: number;
  score: number;
  maxScore: number;
  percentage: number;
  result: "PASS" | "FAIL";
}

export const OPTION_LETTERS = ["A", "B", "C", "D", "E", "F"];

export const newQuestionId = () => `q-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;

export const blankQuestion = (): ExamQuestion => ({ id: newQuestionId(), text: "", options: ["", "", "", ""], answer: 0, marks: null });

/** What is wrong with a question, or null when it can be asked. */
export function questionProblem(q: ExamQuestion, index?: number): string | null {
  const where = index === undefined ? "The question" : `Question ${index + 1}`;
  if (!q.text.trim()) return `${where} has no wording.`;
  const options = q.options.map((o) => o.trim());
  if (options.length < 2) return `${where} needs at least two options.`;
  if (options.some((o) => !o)) return `${where} has an empty option.`;
  if (new Set(options.map((o) => o.toLowerCase())).size !== options.length) return `${where} repeats an option.`;
  if (!Number.isInteger(q.answer) || q.answer < 0 || q.answer >= options.length) return `${where} has no right answer ticked.`;
  if (q.marks != null && !(Number(q.marks) > 0)) return `${where}: marks must be more than 0.`;
  return null;
}

/** What is wrong with the exam as a whole, or null when it can be saved. */
export function examProblem(exam: Partial<OnlineExam> & { questions: ExamQuestion[] }): string | null {
  if (!exam.title?.trim()) return "Give the exam a title.";
  if (!(Number(exam.durationMinutes) > 0)) return "Set how many minutes the exam lasts.";
  if (!(Number(exam.marksPerQuestion) > 0)) return "Marks per question must be more than 0.";
  if (Number(exam.negativeMarks) < 0) return "Negative marks cannot be below 0.";
  const pass = Number(exam.passPercentage);
  if (!(pass >= 0 && pass <= 100)) return "Pass percentage must be between 0 and 100.";
  if (Number(exam.totalQuestions) < 0) return "Questions per student cannot be below 0.";
  if (exam.startAt && exam.endAt && new Date(exam.endAt) <= new Date(exam.startAt)) return "The exam must close after it opens.";
  if (exam.status !== "DRAFT" && !exam.questions.length) return "Add at least one question, or save the exam as a draft.";
  for (const [i, q] of exam.questions.entries()) {
    const p = questionProblem(q, i);
    if (p) return p;
  }
  return null;
}

/** How many questions a student is given. */
export const questionCount = (exam: Pick<OnlineExam, "totalQuestions" | "questions">) =>
  exam.totalQuestions > 0 ? Math.min(exam.totalQuestions, exam.questions.length) : exam.questions.length;

/** The most a student can score: every question's marks when all are given, else the count times the exam's marks. */
export function maxScore(exam: Pick<OnlineExam, "totalQuestions" | "questions" | "marksPerQuestion">): number {
  const count = questionCount(exam);
  if (count === exam.questions.length) return round2(exam.questions.reduce((sum, q) => sum + (q.marks != null && Number(q.marks) > 0 ? Number(q.marks) : exam.marksPerQuestion), 0));
  return round2(count * exam.marksPerQuestion);
}

export type ExamPhase = "DRAFT" | "UPCOMING" | "LIVE" | "ENDED" | "CLOSED";

/** Where the exam is in its life right now. */
export function examPhase(exam: Pick<OnlineExam, "status" | "startAt" | "endAt">, now: Date = new Date()): ExamPhase {
  if (exam.status === "DRAFT") return "DRAFT";
  if (exam.status === "CLOSED") return "CLOSED";
  if (exam.startAt && now < new Date(exam.startAt)) return "UPCOMING";
  if (exam.endAt && now > new Date(exam.endAt)) return "ENDED";
  return "LIVE";
}

export const PHASE_LABELS: Record<ExamPhase, string> = {
  DRAFT: "Draft",
  UPCOMING: "Upcoming",
  LIVE: "Live",
  ENDED: "Ended",
  CLOSED: "Closed",
};

const round2 = (n: number) => Math.round(n * 100) / 100;

/**
 * Marks for a set of answers: the question's marks (else the exam's) for a
 * right answer, minus the negative marks for a wrong one, nothing for one
 * left blank. The total never drops below zero.
 */
export function scoreAttempt(questions: ExamQuestion[], answers: Answers, settings: ExamSettings): AttemptSummary {
  let score = 0;
  let max = 0;
  let attempted = 0;
  let correct = 0;
  let wrong = 0;
  for (const q of questions) {
    const marks = q.marks != null && Number(q.marks) > 0 ? Number(q.marks) : settings.marksPerQuestion;
    max += marks;
    const given = answers[q.id];
    if (given === null || given === undefined || String(given).trim() === "") continue;
    attempted += 1;
    if (Number(given) === q.answer) {
      correct += 1;
      score += marks;
    } else {
      wrong += 1;
      score -= settings.negativeMarks;
    }
  }
  score = Math.max(0, round2(score));
  const percentage = max > 0 ? round2((score / max) * 100) : 0;
  return {
    totalQuestions: questions.length,
    attempted,
    correct,
    wrong,
    score,
    maxScore: round2(max),
    percentage,
    result: percentage >= settings.passPercentage ? "PASS" : "FAIL",
  };
}

/** Whole seconds left on the clock; never below zero. */
export const secondsLeft = (expiresAt: string, now: number = Date.now()) =>
  Math.max(0, Math.floor((new Date(expiresAt).getTime() - now) / 1000));

/** "h:mm:ss" past an hour, "mm:ss" under it. */
export function formatClock(totalSeconds: number): string {
  const s = Math.max(0, Math.floor(totalSeconds));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  const two = (n: number) => String(n).padStart(2, "0");
  return h > 0 ? `${h}:${two(m)}:${two(sec)}` : `${two(m)}:${two(sec)}`;
}

/** "21 Oct 2026, 10:00 am", or an em dash for nothing. */
export const whenShown = (iso: string | null | undefined) =>
  iso
    ? new Date(iso).toLocaleString("en-IN", { day: "2-digit", month: "short", year: "numeric", hour: "numeric", minute: "2-digit", hour12: true })
    : "—";

/** "A", "B", … for an option index, falling back to its number. */
export const optionLetter = (i: number) => OPTION_LETTERS[i] ?? String(i + 1);

/** The right option as typed in a sheet: a letter (A–F), a number (1–6), or the option's own words. */
export function parseAnswer(raw: string, options: string[]): number {
  const v = raw.trim();
  if (!v) return -1;
  const letter = OPTION_LETTERS.indexOf(v.toUpperCase());
  if (letter >= 0 && letter < options.length) return letter;
  const n = Number(v);
  if (Number.isInteger(n) && n >= 1 && n <= options.length) return n - 1;
  const byText = options.findIndex((o) => o.trim().toLowerCase() === v.toLowerCase());
  return byText;
}

/**
 * Questions from a sheet with columns question, option1…option4 (or a, b, c,
 * d), answer and marks -- the header names are matched loosely. Rows that
 * cannot be read are returned as problems, by row number.
 */
export function questionsFromRows(rows: Array<Record<string, string>>): { questions: ExamQuestion[]; problems: string[] } {
  const questions: ExamQuestion[] = [];
  const problems: string[] = [];
  const key = (row: Record<string, string>, ...names: string[]) => {
    const keys = Object.keys(row);
    for (const name of names) {
      const hit = keys.find((k) => k.trim().toLowerCase().replace(/[\s_-]+/g, "") === name);
      if (hit !== undefined) return row[hit] ?? "";
    }
    return "";
  };
  rows.forEach((row, i) => {
    const text = key(row, "question", "text", "questiontext");
    const options = ["option1", "option2", "option3", "option4", "option5", "option6"]
      .map((name, n) => key(row, name, `option${OPTION_LETTERS[n].toLowerCase()}`, OPTION_LETTERS[n].toLowerCase(), `opt${n + 1}`).trim())
      .filter((o, n, all) => o || n < 2 || all.slice(n).some(Boolean));
    while (options.length < 2) options.push("");
    const answer = parseAnswer(key(row, "answer", "correct", "correctanswer", "correctoption"), options);
    const marksRaw = key(row, "marks", "mark");
    const marks = marksRaw.trim() ? Number(marksRaw) : null;
    const q: ExamQuestion = { id: newQuestionId(), text: text.trim(), options, answer, marks: marks != null && Number.isFinite(marks) ? marks : null };
    const problem = questionProblem(q);
    if (problem) problems.push(`Row ${i + 2}: ${problem.replace(/^The question/, "the question")}`);
    else questions.push(q);
  });
  return { questions, problems };
}
