import { createClient } from "@/lib/db/server";
import type { Database } from "@/types/database.generated";

type StudentRow = Database["public"]["Tables"]["students"]["Row"];

export async function listStudentsForCentre(
  centreId: string,
): Promise<StudentRow[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("students")
    .select("*")
    .eq("centre_id", centreId)
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(`Failed to load students: ${error.message}`);
  }

  return data ?? [];
}

export interface AdminStudentRow {
  id: string;
  registrationNumber: string;
  fullName: string;
  centreName: string;
  status: string;
  admittedOn: string;
}

/**
 * Platform-wide list for /admin/students. RLS decides the actual reach:
 * a platform admin sees every centre, an HO role sees what org-level
 * `student.read` grants, and anyone else gets zero rows and the page's
 * permission-denied state. The optional search matches name or
 * registration number, server-side.
 */
export async function listStudentsForAdmin(
  search?: string,
): Promise<AdminStudentRow[]> {
  const supabase = await createClient();
  let query = supabase
    .from("students")
    .select("id, registration_number, full_name, centre_id, status, created_at")
    .order("created_at", { ascending: false })
    .limit(100);
  if (search && search.trim()) {
    const term = search.trim().replace(/[%_]/g, "");
    query = query.or(
      `full_name.ilike.%${term}%,registration_number.ilike.%${term}%`,
    );
  }
  const { data } = await query;
  const rows = data ?? [];

  const centreIds = [...new Set(rows.map((s) => s.centre_id))];
  const names = new Map<string, string>();
  if (centreIds.length) {
    const { data: centres } = await supabase
      .from("centres")
      .select("id, name")
      .in("id", centreIds);
    for (const c of centres ?? []) names.set(c.id, c.name);
  }

  return rows.map((s) => ({
    id: s.id,
    registrationNumber: s.registration_number,
    fullName: s.full_name,
    centreName: names.get(s.centre_id) ?? "Unknown centre",
    status: s.status,
    admittedOn: s.created_at.slice(0, 10),
  }));
}

export interface StudentProfile {
  id: string;
  registrationNumber: string;
  fullName: string;
  phone: string;
  email: string | null;
  guardianName: string | null;
  dateOfBirth: string | null;
  address: string | null;
  govIdLast4: string | null;
  status: StudentRow["status"];
  hasLogin: boolean;
  admittedOn: string;
  enrolments: {
    id: string;
    courseName: string;
    status: string;
    enrolledOn: string;
  }[];
}

function one<T>(rel: unknown): T | null {
  return Array.isArray(rel) ? ((rel[0] as T) ?? null) : ((rel as T) ?? null);
}

/**
 * One student and their enrolments.
 *
 * Not scoped by centre in the query — RLS does that, and adding an `eq` here
 * would only duplicate it. Returns null when the row is invisible, which the
 * page turns into a not-found rather than a permission error: a centre should
 * not learn that a registration number exists elsewhere.
 */
export async function getStudentProfile(
  studentId: string,
): Promise<StudentProfile | null> {
  const supabase = await createClient();

  const { data } = await supabase
    .from("students")
    .select(
      `id, registration_number, full_name, phone, email, guardian_name,
       date_of_birth, address, gov_id_last4, status, user_id, created_at,
       enrolments(id, status, enrolled_at, courses(name))`,
    )
    .eq("id", studentId)
    .maybeSingle();

  if (!data) return null;

  const enrolments = (data.enrolments ?? []) as unknown as {
    id: string;
    status: string;
    enrolled_at: string;
    courses: unknown;
  }[];

  return {
    id: data.id,
    registrationNumber: data.registration_number,
    fullName: data.full_name,
    phone: data.phone,
    email: data.email,
    guardianName: data.guardian_name,
    dateOfBirth: data.date_of_birth,
    address: data.address,
    govIdLast4: data.gov_id_last4,
    status: data.status,
    hasLogin: data.user_id !== null,
    admittedOn: data.created_at.slice(0, 10),
    enrolments: enrolments.map((e) => ({
      id: e.id,
      courseName: one<{ name: string }>(e.courses)?.name ?? "Course",
      status: e.status,
      enrolledOn: e.enrolled_at.slice(0, 10),
    })),
  };
}
