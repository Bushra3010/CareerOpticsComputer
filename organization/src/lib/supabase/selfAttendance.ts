import { supabase } from "./client";

/**
 * Students marking their own attendance (supabase/schema/self-attendance.sql):
 * the centre shows a QR that changes every minute, or the student takes a
 * selfie in the portal. Both go through student_check_in, which gives today's
 * PRESENT unless the centre has already marked the day.
 */

const SETUP_HINT = "Self attendance is not set up yet. Run supabase/schema/self-attendance.sql in Supabase.";
const missing = (error: { code?: string; message?: string } | null) =>
  error?.code === "PGRST202" || error?.code === "42P01" || error?.code === "PGRST205" || /does not exist|schema cache/i.test(error?.message || "");
const readable = (error: { code?: string; message?: string }) =>
  missing(error) ? SETUP_HINT : (error.message || "Request failed").replace(/^.*INVALID:\s*/, "");

/** What a QR carries: a prefix so a scan of some other code is recognised as not ours. */
export const QR_PREFIX = "CAREEROPTICS-ATTENDANCE:";
export const qrPayload = (code: string) => `${QR_PREFIX}${code}`;
/** The code inside a scanned QR, or null when it is not an attendance QR. */
export const codeFromQr = (text: string) => (text.startsWith(QR_PREFIX) ? text.slice(QR_PREFIX.length).trim() : null);

export async function newAttendanceQr(branchId: string, by?: string | null) {
  const { data, error } = await supabase.rpc("new_attendance_qr", { p_branch_id: branchId, p_by: by || null });
  if (error) throw new Error(readable(error));
  const row = data as { code: string; validUntil: string };
  return { code: row.code, validUntil: row.validUntil };
}

export interface CheckInResult {
  date: string;
  status: string;
  alreadyMarked: boolean;
}

export async function studentCheckIn(
  method: "QR" | "SELFIE",
  input: { code?: string; photo?: string; latitude?: number | null; longitude?: number | null } = {},
): Promise<CheckInResult> {
  const { data, error } = await supabase.rpc("student_check_in", {
    p_method: method,
    p_code: input.code || null,
    p_photo: input.photo ? { dataUrl: input.photo } : null,
    p_latitude: input.latitude ?? null,
    p_longitude: input.longitude ?? null,
  });
  if (error) throw new Error(readable(error));
  return data as CheckInResult;
}

export interface CheckIn {
  id: string;
  studentId: string;
  date: string;
  method: "QR" | "SELFIE";
  photo: string;
  latitude: number | null;
  longitude: number | null;
  createdAt: string;
}

/** A centre's check-ins for a day, newest first; empty before the SQL is run. */
export async function getCheckIns(branchId: string | null, date: string): Promise<CheckIn[]> {
  let query = supabase.from("attendance_checkins").select("*").eq("date", date).order("createdAt", { ascending: false });
  if (branchId) query = query.eq("branchId", branchId);
  const { data, error } = await query;
  if (error) {
    if (missing(error)) return [];
    throw new Error(readable(error));
  }
  return (data || []).map((row: Record<string, unknown>) => ({
    id: String(row.id),
    studentId: String(row.studentId),
    date: String(row.date),
    method: row.method === "SELFIE" ? "SELFIE" : "QR",
    photo: String((row.photo as { dataUrl?: string } | null)?.dataUrl || ""),
    latitude: row.latitude == null ? null : Number(row.latitude),
    longitude: row.longitude == null ? null : Number(row.longitude),
    createdAt: String(row.createdAt),
  }));
}
