/**
 * The exam workflow's rules, kept apart from the screens so every page --
 * schedule, admit card, marksheet, certificate, the student portal and the
 * public verification pages -- works a course's terms and a marksheet's
 * result out the same way.
 *
 *   course → terms (1st Year, 2nd Semester …) → subjects per term
 *   subject → theory and/or practical paper, each with a minimum and maximum
 *   marksheet → per-subject marks → total, percentage, grade, PASS / FAIL
 */

export type TermType = "SINGLE" | "YEAR" | "SEMESTER";
export type SubjectType = "THEORY" | "PRACTICAL" | "BOTH";

export interface CourseTermSource {
  durationValue?: number | null;
  durationUnit?: string | null;
  durationMonths?: number | null;
  termType?: string | null;
  termCount?: number | null;
}

export interface TermPlan {
  type: TermType;
  count: number;
}

const ORDINALS = ["th", "st", "nd", "rd"];
export const ordinal = (n: number) => {
  const v = n % 100;
  return `${n}${ORDINALS[(v - 20) % 10] || ORDINALS[v] || ORDINALS[0]}`;
};

/**
 * How a course divides into terms. A course that says so is taken at its
 * word; otherwise one longer than a year runs in years and anything shorter
 * is a single term.
 */
export function termPlan(course: CourseTermSource | null | undefined): TermPlan {
  const type = String(course?.termType || "").toUpperCase();
  const count = Math.max(1, Math.floor(Number(course?.termCount) || 0));
  if (type === "SINGLE") return { type: "SINGLE", count: 1 };
  if (type === "YEAR" || type === "SEMESTER") return { type, count: Number(course?.termCount) ? count : 1 };

  const months =
    Number(course?.durationMonths) ||
    (String(course?.durationUnit || "").toUpperCase() === "YEARS"
      ? (Number(course?.durationValue) || 0) * 12
      : Number(course?.durationValue) || 0);
  if (months > 12) return { type: "YEAR", count: Math.ceil(months / 12) };
  return { type: "SINGLE", count: 1 };
}

export function termLabel(type: TermType, term: number): string {
  if (type === "SINGLE") return "Full Course";
  return `${ordinal(term)} ${type === "YEAR" ? "Year" : "Semester"}`;
}

/** Every term of a course, in order, as `{ term, label }`. */
export function termsOf(course: CourseTermSource | null | undefined) {
  const plan = termPlan(course);
  return Array.from({ length: plan.count }, (_, i) => ({ term: i + 1, label: termLabel(plan.type, i + 1) }));
}

export const isFinalTerm = (course: CourseTermSource | null | undefined, term: number) =>
  term >= termPlan(course).count;

export interface CourseSubject {
  id: string;
  courseId: string;
  term: number;
  code: string;
  name: string;
  subjectType: SubjectType;
  theoryMax: number;
  theoryMin: number;
  practicalMax: number;
  practicalMin: number;
  sortOrder: number;
}

export const hasTheory = (s: Pick<CourseSubject, "subjectType">) => s.subjectType !== "PRACTICAL";
export const hasPractical = (s: Pick<CourseSubject, "subjectType">) => s.subjectType !== "THEORY";

/** One subject's line on a marksheet, frozen as it was when marks were given. */
export interface MarkLine {
  subjectId: string;
  code: string;
  name: string;
  subjectType: SubjectType;
  theoryMax: number;
  theoryMin: number;
  theory: number | null;
  practicalMax: number;
  practicalMin: number;
  practical: number | null;
}

export interface MarksheetSummary {
  totalObtained: number;
  totalMax: number;
  percentage: number;
  grade: string;
  result: "PASS" | "FAIL";
  /** Subjects below a minimum, by name, for the form to point at. */
  failedSubjects: string[];
}

export const gradeFor = (percentage: number, passed = true) =>
  !passed
    ? "F"
    : percentage >= 85
      ? "A+"
      : percentage >= 75
        ? "A"
        : percentage >= 60
          ? "B"
          : percentage >= 45
            ? "C"
            : "D";

const round2 = (n: number) => Math.round(n * 100) / 100;

/** A subject's blank line, carrying the subject's limits as they are now. */
export function lineFor(subject: CourseSubject, existing?: Partial<MarkLine>): MarkLine {
  return {
    subjectId: subject.id,
    code: subject.code,
    name: subject.name,
    subjectType: subject.subjectType,
    theoryMax: hasTheory(subject) ? subject.theoryMax : 0,
    theoryMin: hasTheory(subject) ? subject.theoryMin : 0,
    theory: hasTheory(subject) ? (existing?.theory ?? null) : null,
    practicalMax: hasPractical(subject) ? subject.practicalMax : 0,
    practicalMin: hasPractical(subject) ? subject.practicalMin : 0,
    practical: hasPractical(subject) ? (existing?.practical ?? null) : null,
  };
}

/** A mark out of range, or missing where the paper exists. Null when fine. */
export function lineProblem(line: MarkLine): string | null {
  const check = (value: number | null, max: number, part: string) => {
    if (value === null || Number.isNaN(value)) return `Enter ${part} marks for ${line.name}.`;
    if (value < 0 || value > max) return `${line.name}: ${part} marks must be between 0 and ${max}.`;
    return null;
  };
  if (hasTheory(line)) {
    const p = check(line.theory, line.theoryMax, "theory");
    if (p) return p;
  }
  if (hasPractical(line)) {
    const p = check(line.practical, line.practicalMax, "practical");
    if (p) return p;
  }
  return null;
}

/**
 * Totals and the result. A student passes only by clearing the minimum of
 * every paper they sat -- a strong theory mark does not carry a failed
 * practical.
 */
export function summarise(lines: MarkLine[]): MarksheetSummary {
  let totalObtained = 0;
  let totalMax = 0;
  const failedSubjects: string[] = [];
  for (const line of lines) {
    let failed = false;
    if (hasTheory(line)) {
      totalObtained += Number(line.theory) || 0;
      totalMax += line.theoryMax;
      if ((Number(line.theory) || 0) < line.theoryMin) failed = true;
    }
    if (hasPractical(line)) {
      totalObtained += Number(line.practical) || 0;
      totalMax += line.practicalMax;
      if ((Number(line.practical) || 0) < line.practicalMin) failed = true;
    }
    if (failed) failedSubjects.push(line.name);
  }
  const percentage = totalMax ? round2((totalObtained / totalMax) * 100) : 0;
  const passed = lines.length > 0 && failedSubjects.length === 0;
  return {
    totalObtained: round2(totalObtained),
    totalMax: round2(totalMax),
    percentage,
    grade: gradeFor(percentage, passed),
    result: passed ? "PASS" : "FAIL",
    failedSubjects,
  };
}

/**
 * A marksheet's lines as the document templates read results: one row per
 * paper, so a subject with theory and practical shows -- and passes or
 * fails -- each part on its own. The certificate and marksheet layouts are
 * the institute's own; this only feeds them.
 */
export function asExamResults(
  sheets: Array<{ term: number; issueDate?: string | null; marks: MarkLine[] }>,
  termType: TermType,
) {
  return sheets
    .slice()
    .sort((a, b) => a.term - b.term)
    .flatMap((sheet) =>
      sheet.marks.flatMap((line) => {
        const exam = (part: "Theory" | "Practical", max: number, min: number) => ({
          name: termLabel(termType, sheet.term),
          subject: line.subjectType === "BOTH" ? `${line.name} (${part})` : line.name,
          maxMarks: max,
          passMarks: min,
          examDate: sheet.issueDate || "",
          paper: part,
          base: line.name,
        });
        const rows: Array<{ marks: number; exam: ReturnType<typeof exam> }> = [];
        if (hasTheory(line)) rows.push({ marks: Number(line.theory) || 0, exam: exam("Theory", line.theoryMax, line.theoryMin) });
        if (hasPractical(line)) rows.push({ marks: Number(line.practical) || 0, exam: exam("Practical", line.practicalMax, line.practicalMin) });
        return rows;
      }),
    );
}

/** The marks every subject made from the syllabus starts with; edited one by one afterwards. */
export interface SubjectDefaults {
  subjectType: SubjectType;
  theoryMax: number;
  theoryMin: number;
  practicalMax: number;
  practicalMin: number;
}

const sameName = (a: string, b: string) => a.trim().toLowerCase() === b.trim().toLowerCase();

/** Whether a syllabus module already has its subject in this term. */
export const moduleOnMarksheet = (moduleName: string, termSubjects: Array<Pick<CourseSubject, "name">>) =>
  termSubjects.some((s) => sameName(s.name, moduleName));

/**
 * A course's syllabus modules as the subjects its marksheet prints, for one
 * term: one subject per active module not already there (matched by name), in
 * the syllabus's order after the subjects the term has, coded `<course>-01`….
 */
export function subjectsFromModules(
  modules: Array<{ name: string; sortOrder: number; status?: string }>,
  termSubjects: Array<Pick<CourseSubject, "name" | "code">>,
  options: { courseId: string; courseCode?: string; term: number; defaults: SubjectDefaults },
): Array<Omit<CourseSubject, "id">> {
  const prefix = (options.courseCode || "M").trim().toUpperCase().replace(/\s+/g, "");
  const usedCodes = new Set(termSubjects.map((s) => s.code.trim().toUpperCase()).filter(Boolean));
  const { defaults } = options;
  const theory = defaults.subjectType !== "PRACTICAL";
  const practical = defaults.subjectType !== "THEORY";
  const fresh = modules
    .filter((m) => m.status !== "Inactive" && m.name.trim())
    .slice()
    .sort((a, b) => a.sortOrder - b.sortOrder || a.name.localeCompare(b.name))
    .filter((m, i, list) => !moduleOnMarksheet(m.name, termSubjects) && list.findIndex((x) => sameName(x.name, m.name)) === i);
  let n = 0;
  const nextCode = () => {
    let code = "";
    do {
      n += 1;
      code = `${prefix}-${String(n).padStart(2, "0")}`;
    } while (usedCodes.has(code));
    usedCodes.add(code);
    return code;
  };
  return fresh.map((m, i) => ({
    courseId: options.courseId,
    term: options.term,
    code: nextCode(),
    name: m.name.trim(),
    subjectType: defaults.subjectType,
    theoryMax: theory ? defaults.theoryMax : 0,
    theoryMin: theory ? defaults.theoryMin : 0,
    practicalMax: practical ? defaults.practicalMax : 0,
    practicalMin: practical ? defaults.practicalMin : 0,
    sortOrder: termSubjects.length + i + 1,
  }));
}
