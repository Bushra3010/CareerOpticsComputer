"use server";

import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/db/action";
import { authorize } from "@/lib/permissions";
import { getCurrentCentreContext } from "@/features/centres/current-membership";

export interface TakeAttendanceState {
  status: "idle" | "error" | "success";
  message?: string;
}

const VALID_STATUSES = new Set(["present", "absent", "late", "excused"]);

export async function takeAttendance(
  courseId: string,
  sessionDate: string,
  _prevState: TakeAttendanceState,
  formData: FormData,
): Promise<TakeAttendanceState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { status: "error", message: "You must be signed in." };
  }

  const context = await getCurrentCentreContext(supabase, user.id);
  if (!context) {
    return {
      status: "error",
      message: "No active centre membership found for this account.",
    };
  }

  try {
    await authorize(
      supabase,
      "attendance.create",
      context.organizationId,
      context.centreId,
    );
  } catch {
    return {
      status: "error",
      message: "You do not have permission to mark attendance.",
    };
  }

  const { data: session, error: sessionError } = await supabase
    .from("attendance_sessions")
    .upsert(
      {
        organization_id: context.organizationId,
        centre_id: context.centreId,
        course_id: courseId,
        session_date: sessionDate,
        created_by: user.id,
      },
      {
        onConflict: "centre_id,course_id,session_date",
        ignoreDuplicates: false,
      },
    )
    .select("id")
    .single();

  if (sessionError || !session) {
    return {
      status: "error",
      message: "Could not create the attendance session.",
    };
  }

  const records = Array.from(formData.entries())
    .filter(([key]) => key.startsWith("status_"))
    .map(([key, value]) => ({
      session_id: session.id,
      enrolment_id: key.replace("status_", ""),
      status: value.toString(),
      marked_by: user.id,
    }))
    .filter((r) => VALID_STATUSES.has(r.status)) as {
    session_id: string;
    enrolment_id: string;
    status: "present" | "absent" | "late" | "excused";
    marked_by: string;
  }[];

  if (records.length === 0) {
    return {
      status: "error",
      message: "Mark at least one student before saving.",
    };
  }

  const { error: recordsError } = await supabase
    .from("attendance_records")
    .upsert(records, { onConflict: "session_id,enrolment_id" });

  if (recordsError) {
    return {
      status: "error",
      message: "Could not save attendance. Please try again.",
    };
  }

  revalidatePath("/centre/attendance");

  return {
    status: "success",
    message: `Attendance saved for ${records.length} students.`,
  };
}
