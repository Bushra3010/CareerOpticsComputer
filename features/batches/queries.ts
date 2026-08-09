import { createClient } from "@/lib/db/server";

import { WEEKDAYS } from "./schema";

export interface ScheduleSlot {
  id: string;
  weekday: number;
  weekdayLabel: string;
  startTime: string;
  endTime: string;
  room: string | null;
}

export interface BatchRow {
  id: string;
  code: string;
  name: string;
  courseName: string | null;
  facultyName: string | null;
  capacity: number | null;
  enrolledCount: number;
  room: string | null;
  startDate: string;
  endDate: string | null;
  status: "draft" | "active" | "retired";
  schedule: ScheduleSlot[];
}

/** `HH:MM:SS` from Postgres, shown as `HH:MM`. */
function hhmm(time: string): string {
  return time.slice(0, 5);
}

function toSlot(row: {
  id: string;
  weekday: number;
  start_time: string;
  end_time: string;
  room: string | null;
}): ScheduleSlot {
  return {
    id: row.id,
    weekday: row.weekday,
    weekdayLabel: WEEKDAYS[row.weekday] ?? "—",
    startTime: hhmm(row.start_time),
    endTime: hhmm(row.end_time),
    room: row.room,
  };
}

/**
 * The batches this caller may see at a centre. RLS decides the rows —
 * management roles see all of the centre's, a faculty member sees only the
 * batches assigned to them — so the page needs no branch of its own.
 */
export async function listBatchesForCentre(
  centreId: string,
): Promise<BatchRow[]> {
  const supabase = await createClient();

  const { data } = await supabase
    .from("batches")
    .select(
      "id, code, name, faculty_id, capacity, room, start_date, end_date, status, courses(name)",
    )
    .eq("centre_id", centreId)
    .order("start_date", { ascending: false });

  const rows = (data ?? []) as unknown as {
    id: string;
    code: string;
    name: string;
    faculty_id: string | null;
    capacity: number | null;
    room: string | null;
    start_date: string;
    end_date: string | null;
    status: BatchRow["status"];
    courses: { name: string } | { name: string }[] | null;
  }[];
  if (rows.length === 0) return [];

  const ids = rows.map((b) => b.id);
  const facultyIds = [
    ...new Set(rows.map((b) => b.faculty_id).filter((f): f is string => !!f)),
  ];

  const [{ data: slots }, { data: placements }, { data: profiles }] =
    await Promise.all([
      supabase
        .from("batch_schedules")
        .select("id, batch_id, weekday, start_time, end_time, room")
        .in("batch_id", ids)
        .order("weekday")
        .order("start_time"),
      supabase
        .from("enrolments")
        .select("batch_id")
        .in("batch_id", ids)
        .eq("status", "active"),
      facultyIds.length
        ? supabase.from("profiles").select("id, full_name").in("id", facultyIds)
        : Promise.resolve({ data: [] }),
    ]);

  const slotsByBatch = new Map<string, ScheduleSlot[]>();
  for (const s of (slots ?? []) as {
    batch_id: string;
    id: string;
    weekday: number;
    start_time: string;
    end_time: string;
    room: string | null;
  }[]) {
    const list = slotsByBatch.get(s.batch_id) ?? [];
    list.push(toSlot(s));
    slotsByBatch.set(s.batch_id, list);
  }

  const counts = new Map<string, number>();
  for (const p of (placements ?? []) as { batch_id: string }[]) {
    counts.set(p.batch_id, (counts.get(p.batch_id) ?? 0) + 1);
  }

  const names = new Map(
    ((profiles ?? []) as { id: string; full_name: string }[]).map((p) => [
      p.id,
      p.full_name,
    ]),
  );

  return rows.map((b) => {
    const course = Array.isArray(b.courses) ? b.courses[0] : b.courses;
    return {
      id: b.id,
      code: b.code,
      name: b.name,
      courseName: course?.name ?? null,
      facultyName: b.faculty_id ? (names.get(b.faculty_id) ?? null) : null,
      capacity: b.capacity,
      enrolledCount: counts.get(b.id) ?? 0,
      room: b.room,
      startDate: b.start_date,
      endDate: b.end_date,
      status: b.status,
      schedule: slotsByBatch.get(b.id) ?? [],
    };
  });
}

export interface BatchOption {
  id: string;
  label: string;
}

export async function listBatchOptions(
  centreId: string,
): Promise<BatchOption[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("batches")
    .select("id, code, name")
    .eq("centre_id", centreId)
    .eq("status", "active")
    .order("name");
  return (data ?? []).map((b) => ({
    id: b.id,
    label: `${b.code} — ${b.name}`,
  }));
}

/** Centre staff who can be assigned to teach. */
export async function listFacultyOptions(
  centreId: string,
): Promise<{ id: string; name: string }[]> {
  const supabase = await createClient();
  const { data: memberships } = await supabase
    .from("memberships")
    .select("user_id")
    .eq("centre_id", centreId)
    .eq("status", "active");

  const ids = [
    ...new Set(
      ((memberships ?? []) as { user_id: string }[]).map((m) => m.user_id),
    ),
  ];
  if (ids.length === 0) return [];

  const { data: profiles } = await supabase
    .from("profiles")
    .select("id, full_name")
    .in("id", ids);

  return ((profiles ?? []) as { id: string; full_name: string }[])
    .map((p) => ({ id: p.id, name: p.full_name }))
    .sort((a, b) => a.name.localeCompare(b.name));
}

export interface StudentTimetableEntry extends ScheduleSlot {
  batchName: string;
  courseName: string | null;
  facultyName: string | null;
}

/**
 * The signed-in student's weekly timetable: the schedule of the batches
 * their active enrolments are placed in. No id parameter — the student
 * comes from the session, and `batches_select`'s enrolment arm is what
 * makes the rows visible at all.
 */
export async function getStudentTimetable(): Promise<StudentTimetableEntry[]> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];

  const { data: student } = await supabase
    .from("students")
    .select("id")
    .eq("user_id", user.id)
    .maybeSingle();
  if (!student) return [];

  const { data: enrolments } = await supabase
    .from("enrolments")
    .select("batch_id")
    .eq("student_id", student.id)
    .eq("status", "active")
    .not("batch_id", "is", null);

  const batchIds = [
    ...new Set(
      ((enrolments ?? []) as { batch_id: string | null }[])
        .map((e) => e.batch_id)
        .filter((b): b is string => !!b),
    ),
  ];
  if (batchIds.length === 0) return [];

  const [{ data: batches }, { data: slots }] = await Promise.all([
    supabase
      .from("batches")
      .select("id, name, faculty_id, courses(name)")
      .in("id", batchIds),
    supabase
      .from("batch_schedules")
      .select("id, batch_id, weekday, start_time, end_time, room")
      .in("batch_id", batchIds)
      .order("weekday")
      .order("start_time"),
  ]);

  const batchRows = (batches ?? []) as unknown as {
    id: string;
    name: string;
    faculty_id: string | null;
    courses: { name: string } | { name: string }[] | null;
  }[];

  const facultyIds = [
    ...new Set(
      batchRows.map((b) => b.faculty_id).filter((f): f is string => !!f),
    ),
  ];
  const { data: profiles } = facultyIds.length
    ? await supabase
        .from("profiles")
        .select("id, full_name")
        .in("id", facultyIds)
    : { data: [] };
  const names = new Map(
    ((profiles ?? []) as { id: string; full_name: string }[]).map((p) => [
      p.id,
      p.full_name,
    ]),
  );

  const byId = new Map(batchRows.map((b) => [b.id, b]));

  return (
    (slots ?? []) as {
      id: string;
      batch_id: string;
      weekday: number;
      start_time: string;
      end_time: string;
      room: string | null;
    }[]
  ).map((s) => {
    const batch = byId.get(s.batch_id);
    const course = batch
      ? Array.isArray(batch.courses)
        ? batch.courses[0]
        : batch.courses
      : null;
    return {
      ...toSlot(s),
      batchName: batch?.name ?? "Batch",
      courseName: course?.name ?? null,
      facultyName: batch?.faculty_id
        ? (names.get(batch.faculty_id) ?? null)
        : null,
    };
  });
}
