import { createClient } from "@/lib/db/server";

export interface PublicationSummary {
  id: string;
  courseId: string;
  courseName: string | null;
  termLabel: string;
  version: number;
  publishedAt: string | null;
  resultCount: number;
}

/** Unwraps a PostgREST embed (object or one-element array). */
function one<T>(rel: unknown): T | null {
  return Array.isArray(rel) ? ((rel[0] as T) ?? null) : ((rel as T) ?? null);
}

export async function listPublications(
  centreId: string,
): Promise<PublicationSummary[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("result_publications")
    .select("id, course_id, term_label, version, published_at, courses(name)")
    .eq("centre_id", centreId)
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(`Failed to load result publications: ${error.message}`);
  }

  const rows = data ?? [];
  const counts = new Map<string, number>();

  if (rows.length) {
    const { data: results } = await supabase
      .from("student_results")
      .select("publication_id")
      .in(
        "publication_id",
        rows.map((r) => r.id),
      );
    for (const r of results ?? []) {
      counts.set(r.publication_id, (counts.get(r.publication_id) ?? 0) + 1);
    }
  }

  return rows.map((r) => ({
    id: r.id,
    courseId: r.course_id,
    courseName: one<{ name: string }>(r.courses)?.name ?? null,
    termLabel: r.term_label,
    version: r.version,
    publishedAt: r.published_at,
    resultCount: counts.get(r.id) ?? 0,
  }));
}

export interface MarkSheetRow {
  enrolmentId: string;
  studentName: string;
  registrationNumber: string;
  maxMarks: number | null;
  obtainedMarks: number | null;
  outcome: "fail" | "pass" | "distinction" | null;
}

export interface PublicationDetail {
  id: string;
  courseName: string | null;
  termLabel: string;
  version: number;
  publishedAt: string | null;
  rows: MarkSheetRow[];
}

/** The publication plus every active enrolment in its course, marked or not. */
export async function getPublicationDetail(
  centreId: string,
  publicationId: string,
): Promise<PublicationDetail | null> {
  const supabase = await createClient();

  const { data: pub } = await supabase
    .from("result_publications")
    .select("id, course_id, term_label, version, published_at, courses(name)")
    .eq("id", publicationId)
    .eq("centre_id", centreId)
    .maybeSingle();

  if (!pub) return null;

  const { data: enrolments } = await supabase
    .from("enrolments")
    .select("id, students(full_name, registration_number)")
    .eq("centre_id", centreId)
    .eq("course_id", pub.course_id)
    .eq("status", "active");

  const { data: results } = await supabase
    .from("student_results")
    .select("enrolment_id, max_marks, obtained_marks, outcome")
    .eq("publication_id", publicationId);

  const byEnrolment = new Map(
    (results ?? []).map((r) => [
      r.enrolment_id,
      { max: r.max_marks, obtained: r.obtained_marks, outcome: r.outcome },
    ]),
  );

  const rows: MarkSheetRow[] = (enrolments ?? [])
    .map((e) => {
      const student = one<{ full_name: string; registration_number: string }>(
        e.students,
      );
      const mark = byEnrolment.get(e.id);
      return {
        enrolmentId: e.id,
        studentName: student?.full_name ?? "Unknown",
        registrationNumber: student?.registration_number ?? "",
        maxMarks: mark?.max ?? null,
        obtainedMarks: mark?.obtained ?? null,
        outcome: mark?.outcome ?? null,
      };
    })
    .sort((a, b) => a.registrationNumber.localeCompare(b.registrationNumber));

  return {
    id: pub.id,
    courseName: one<{ name: string }>(pub.courses)?.name ?? null,
    termLabel: pub.term_label,
    version: pub.version,
    publishedAt: pub.published_at,
    rows,
  };
}

export interface StudentResultView {
  courseName: string | null;
  termLabel: string;
  maxMarks: number;
  obtainedMarks: number;
  percentage: number;
  outcome: "fail" | "pass" | "distinction";
  publishedAt: string;
}

/**
 * Published results for the signed-in student. RLS already hides unpublished
 * publications; the `published_at` filter here makes that intent visible at
 * the call site rather than relying on the policy alone.
 */
export async function getStudentResults(): Promise<StudentResultView[]> {
  const supabase = await createClient();

  const { data } = await supabase
    .from("student_results")
    .select(
      "max_marks, obtained_marks, outcome, result_publications!inner(term_label, published_at, courses(name))",
    )
    .not("result_publications.published_at", "is", null);

  return (data ?? []).map((r) => {
    const pub = one<{
      term_label: string;
      published_at: string;
      courses: unknown;
    }>(r.result_publications)!;

    return {
      courseName: one<{ name: string }>(pub.courses)?.name ?? null,
      termLabel: pub.term_label,
      maxMarks: r.max_marks,
      obtainedMarks: r.obtained_marks,
      // Integer marks in, one rounding at the display edge — the pass/fail
      // decision was already made in SQL and never depends on this number.
      percentage: Math.round((r.obtained_marks / r.max_marks) * 100),
      outcome: r.outcome,
      publishedAt: pub.published_at,
    };
  });
}
