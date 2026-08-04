import { createClient } from "@/lib/db/server";
import type { Database } from "@/types/database.generated";

export interface RosterEntry {
  enrolmentId: string;
  studentId: string;
  studentName: string;
  registrationNumber: string;
  status:
    Database["public"]["Tables"]["attendance_records"]["Row"]["status"] | null;
}

/** Active enrolments in a course at a centre, with today's marked status if any. */
export async function getAttendanceRoster(
  centreId: string,
  courseId: string,
  sessionDate: string,
): Promise<RosterEntry[]> {
  const supabase = await createClient();

  const { data: enrolments, error: enrolError } = await supabase
    .from("enrolments")
    .select("id, student_id, students(full_name, registration_number)")
    .eq("centre_id", centreId)
    .eq("course_id", courseId)
    .eq("status", "active");

  if (enrolError) {
    throw new Error(`Failed to load enrolments: ${enrolError.message}`);
  }

  const { data: session } = await supabase
    .from("attendance_sessions")
    .select("id")
    .eq("centre_id", centreId)
    .eq("course_id", courseId)
    .eq("session_date", sessionDate)
    .maybeSingle();

  const recordsByEnrolment = new Map<string, RosterEntry["status"]>();
  if (session) {
    const { data: records } = await supabase
      .from("attendance_records")
      .select("enrolment_id, status")
      .eq("session_id", session.id);

    for (const record of records ?? []) {
      recordsByEnrolment.set(record.enrolment_id, record.status);
    }
  }

  return (enrolments ?? []).map((row) => {
    const studentRel = row.students as unknown as
      | { full_name: string; registration_number: string }
      | { full_name: string; registration_number: string }[]
      | null;
    const student = Array.isArray(studentRel) ? studentRel[0] : studentRel;

    return {
      enrolmentId: row.id,
      studentId: row.student_id,
      studentName: student?.full_name ?? "Unknown",
      registrationNumber: student?.registration_number ?? "",
      status: recordsByEnrolment.get(row.id) ?? null,
    };
  });
}

export interface AttendanceSessionSummary {
  id: string;
  courseId: string;
  sessionDate: string;
  presentCount: number;
  totalCount: number;
}

export async function listAttendanceSessions(
  centreId: string,
): Promise<AttendanceSessionSummary[]> {
  const supabase = await createClient();

  const { data: sessions, error } = await supabase
    .from("attendance_sessions")
    .select("id, course_id, session_date")
    .eq("centre_id", centreId)
    .order("session_date", { ascending: false })
    .limit(20);

  if (error) {
    throw new Error(`Failed to load attendance sessions: ${error.message}`);
  }

  const summaries: AttendanceSessionSummary[] = [];
  for (const session of sessions ?? []) {
    const { data: records } = await supabase
      .from("attendance_records")
      .select("status")
      .eq("session_id", session.id);

    summaries.push({
      id: session.id,
      courseId: session.course_id,
      sessionDate: session.session_date,
      presentCount: (records ?? []).filter((r) => r.status === "present")
        .length,
      totalCount: (records ?? []).length,
    });
  }

  return summaries;
}
