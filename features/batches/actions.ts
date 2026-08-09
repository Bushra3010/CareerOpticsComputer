"use server";

import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/db/action";
import { getCurrentCentreContext } from "@/features/centres/current-membership";

import { batchSchema, placeStudentSchema, scheduleSlotSchema } from "./schema";

export interface BatchActionState {
  status: "idle" | "error" | "success";
  message?: string;
  fieldErrors?: Record<string, string>;
}

function fieldErrorsFrom(issues: { path: PropertyKey[]; message: string }[]) {
  const fieldErrors: Record<string, string> = {};
  for (const issue of issues) {
    const field = issue.path[0];
    if (typeof field === "string" && !fieldErrors[field]) {
      fieldErrors[field] = issue.message;
    }
  }
  return fieldErrors;
}

async function centreContext() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const context = user
    ? await getCurrentCentreContext(supabase, user.id)
    : null;
  return { supabase, context, userId: user?.id ?? null };
}

export async function createBatch(
  _prev: BatchActionState,
  formData: FormData,
): Promise<BatchActionState> {
  const { supabase, context, userId } = await centreContext();
  if (!context) {
    return { status: "error", message: "You do not have centre access." };
  }

  const parsed = batchSchema.safeParse({
    courseId: formData.get("courseId")?.toString() ?? "",
    code: formData.get("code")?.toString() ?? "",
    name: formData.get("name")?.toString() ?? "",
    facultyId: formData.get("facultyId")?.toString() ?? "",
    capacity: formData.get("capacity")?.toString() ?? "",
    room: formData.get("room")?.toString() ?? "",
    startDate: formData.get("startDate")?.toString() ?? "",
    endDate: formData.get("endDate")?.toString() ?? "",
  });
  if (!parsed.success) {
    return {
      status: "error",
      fieldErrors: fieldErrorsFrom(parsed.error.issues),
    };
  }

  const { error } = await supabase.from("batches").insert({
    organization_id: context.organizationId,
    centre_id: context.centreId,
    course_id: parsed.data.courseId,
    code: parsed.data.code,
    name: parsed.data.name,
    faculty_id: parsed.data.facultyId || null,
    capacity: parsed.data.capacity ? Number(parsed.data.capacity) : null,
    room: parsed.data.room || null,
    start_date: parsed.data.startDate,
    end_date: parsed.data.endDate || null,
    created_by: userId,
  });

  if (error) {
    if (error.code === "23505") {
      return {
        status: "error",
        fieldErrors: { code: "A batch with this code already exists here." },
      };
    }
    return {
      status: "error",
      message:
        error.code === "42501"
          ? "You do not have permission to manage batches."
          : "Could not create the batch.",
    };
  }

  revalidatePath("/centre/batches");
  return { status: "success", message: "Batch created as a draft." };
}

export async function setBatchStatus(
  batchId: string,
  nextStatus: "draft" | "active" | "retired",
  _prev: BatchActionState,
  _formData: FormData,
): Promise<BatchActionState> {
  const { supabase } = await centreContext();
  const { data, error } = await supabase
    .from("batches")
    .update({ status: nextStatus })
    .eq("id", batchId)
    .select("id");

  if (error || !data?.length) {
    return {
      status: "error",
      message: "You do not have permission to change this batch.",
    };
  }

  revalidatePath("/centre/batches");
  return { status: "success", message: "Batch updated." };
}

export async function addScheduleSlot(
  batchId: string,
  _prev: BatchActionState,
  formData: FormData,
): Promise<BatchActionState> {
  const { supabase } = await centreContext();

  const parsed = scheduleSlotSchema.safeParse({
    batchId,
    weekday: formData.get("weekday")?.toString() ?? "",
    startTime: formData.get("startTime")?.toString() ?? "",
    endTime: formData.get("endTime")?.toString() ?? "",
    room: formData.get("room")?.toString() ?? "",
  });
  if (!parsed.success) {
    return {
      status: "error",
      fieldErrors: fieldErrorsFrom(parsed.error.issues),
    };
  }
  if (parsed.data.endTime <= parsed.data.startTime) {
    return {
      status: "error",
      fieldErrors: { endTime: "The end time must be after the start time." },
    };
  }

  const { error } = await supabase.from("batch_schedules").insert({
    batch_id: parsed.data.batchId,
    weekday: parsed.data.weekday,
    start_time: parsed.data.startTime,
    end_time: parsed.data.endTime,
    room: parsed.data.room || null,
  });

  if (error) {
    return {
      status: "error",
      message:
        error.code === "23505"
          ? "This batch already has a slot starting then."
          : error.code === "42501"
            ? "You do not have permission to change this timetable."
            : "Could not add the slot.",
    };
  }

  revalidatePath("/centre/batches");
  revalidatePath("/student/timetable");
  return { status: "success", message: "Slot added." };
}

export async function removeScheduleSlot(
  slotId: string,
  _prev: BatchActionState,
  _formData: FormData,
): Promise<BatchActionState> {
  const { supabase } = await centreContext();
  const { data, error } = await supabase
    .from("batch_schedules")
    .delete()
    .eq("id", slotId)
    .select("id");

  if (error || !data?.length) {
    return {
      status: "error",
      message: "You do not have permission to change this timetable.",
    };
  }

  revalidatePath("/centre/batches");
  revalidatePath("/student/timetable");
  return { status: "success", message: "Slot removed." };
}

/**
 * Places a student's enrolment in a batch, or clears it. Capacity is
 * enforced by the 0046 trigger rather than a count here — two counsellors
 * placing the last student at the same moment is exactly the race a
 * check-then-insert in application code would lose.
 */
export async function placeStudentInBatch(
  _prev: BatchActionState,
  formData: FormData,
): Promise<BatchActionState> {
  const { supabase, context } = await centreContext();
  if (!context) {
    return { status: "error", message: "You do not have centre access." };
  }

  const parsed = placeStudentSchema.safeParse({
    enrolmentId: formData.get("enrolmentId")?.toString() ?? "",
    batchId: formData.get("batchId")?.toString() ?? "",
  });
  if (!parsed.success) {
    return {
      status: "error",
      fieldErrors: fieldErrorsFrom(parsed.error.issues),
    };
  }

  const { data, error } = await supabase
    .from("enrolments")
    .update({ batch_id: parsed.data.batchId || null })
    .eq("id", parsed.data.enrolmentId)
    .select("id");

  if (error) {
    return {
      status: "error",
      message: error.message.includes("batch is full")
        ? "That batch is full."
        : error.message.includes("another centre")
          ? "That batch belongs to another centre."
          : "Could not place the student.",
    };
  }
  if (!data?.length) {
    return {
      status: "error",
      message: "You do not have permission to place this student.",
    };
  }

  revalidatePath("/centre/batches");
  revalidatePath("/centre/students");
  return { status: "success", message: "Student placed." };
}
