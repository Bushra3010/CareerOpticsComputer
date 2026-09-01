"use server";

import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/db/action";
import { recordAudit } from "@/lib/audit";
import { getCurrentCentreContext } from "@/features/centres/current-membership";

import {
  batchEditSchema,
  batchSchema,
  placeStudentSchema,
  scheduleSlotSchema,
} from "./schema";

/**
 * Batch management is reachable from two screens now, so a write from either
 * has to refresh both. Missing one leaves the other showing a batch that no
 * longer exists, or a stale timetable.
 */
function revalidateBatchScreens() {
  revalidatePath("/centre/batches");
  revalidatePath("/centre/students");
  revalidatePath("/student/timetable");
}

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

  revalidateBatchScreens();
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

  revalidateBatchScreens();
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

  revalidateBatchScreens();
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

  revalidateBatchScreens();
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

  revalidateBatchScreens();
  return { status: "success", message: "Student placed." };
}

/**
 * Edits a batch in place. Course is deliberately not editable: students are
 * already placed against it, and silently moving a batch to another course
 * would change what those students are recorded as studying.
 */
export async function updateBatch(
  batchId: string,
  _prev: BatchActionState,
  formData: FormData,
): Promise<BatchActionState> {
  const { supabase, context } = await centreContext();
  if (!context) {
    return { status: "error", message: "You do not have centre access." };
  }

  const parsed = batchEditSchema.safeParse({
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

  const { data, error } = await supabase
    .from("batches")
    .update({
      code: parsed.data.code,
      name: parsed.data.name,
      faculty_id: parsed.data.facultyId || null,
      capacity: parsed.data.capacity ? Number(parsed.data.capacity) : null,
      room: parsed.data.room || null,
      start_date: parsed.data.startDate,
      end_date: parsed.data.endDate || null,
    })
    .eq("id", batchId)
    .select("id");

  if (error) {
    if (error.code === "23505") {
      return {
        status: "error",
        fieldErrors: { code: "A batch with this code already exists here." },
      };
    }
    return { status: "error", message: "Could not save the batch." };
  }
  if (!data?.length) {
    return {
      status: "error",
      message: "You do not have permission to change this batch.",
    };
  }

  revalidateBatchScreens();
  return { status: "success", message: "Batch saved." };
}

/**
 * Deletes a batch, releasing any students placed in it.
 *
 * The unassignment is not a convenience — `enrolments.batch_id` carries no
 * `on delete` rule, so Postgres refuses to drop a batch anything still points
 * at. Timetable slots need no such handling: `batch_schedules` cascades.
 *
 * Students lose their timetable when this runs, and nothing about the batch
 * survives to explain why, so it writes an audit row naming how many were
 * released. Retiring a batch is the non-destructive alternative and stays
 * available on the same card.
 */
export async function deleteBatch(
  batchId: string,
  _prev: BatchActionState,
  _formData: FormData,
): Promise<BatchActionState> {
  const { supabase, context, userId } = await centreContext();
  if (!context || !userId) {
    return { status: "error", message: "You do not have centre access." };
  }

  const { data: batch } = await supabase
    .from("batches")
    .select("id, code, name")
    .eq("id", batchId)
    .eq("centre_id", context.centreId)
    .maybeSingle();

  if (!batch) {
    return { status: "error", message: "Batch not found at your centre." };
  }

  // Released first, and the count kept, so the audit row can say what the
  // deletion cost even though the batch is gone by the time it is written.
  const { data: released, error: releaseError } = await supabase
    .from("enrolments")
    .update({ batch_id: null })
    .eq("batch_id", batchId)
    .select("id");

  if (releaseError) {
    return {
      status: "error",
      message: "Could not release the students in this batch.",
    };
  }

  const { data: deleted, error } = await supabase
    .from("batches")
    .delete()
    .eq("id", batchId)
    .select("id");

  if (error || !deleted?.length) {
    return {
      status: "error",
      message: "You do not have permission to delete this batch.",
    };
  }

  const count = released?.length ?? 0;
  await recordAudit(supabase, {
    organizationId: context.organizationId,
    actorId: userId,
    action: "delete_batch",
    tableName: "batches",
    rowId: batchId,
    reason: `Deleted batch ${batch.code} — ${batch.name}; ${count} ${
      count === 1 ? "student" : "students"
    } released from it`,
  });

  revalidateBatchScreens();
  return {
    status: "success",
    message:
      count === 0
        ? "Batch deleted."
        : `Batch deleted. ${count} ${count === 1 ? "student is" : "students are"} no longer in a batch.`,
  };
}

/** Edits a timetable slot. Same rules as adding one. */
export async function updateScheduleSlot(
  slotId: string,
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

  const { data, error } = await supabase
    .from("batch_schedules")
    .update({
      weekday: parsed.data.weekday,
      start_time: parsed.data.startTime,
      end_time: parsed.data.endTime,
      room: parsed.data.room || null,
    })
    .eq("id", slotId)
    .select("id");

  if (error) {
    return {
      status: "error",
      message:
        error.code === "23505"
          ? "This batch already has a slot starting then."
          : "Could not save the slot.",
    };
  }
  if (!data?.length) {
    return {
      status: "error",
      message: "You do not have permission to change this timetable.",
    };
  }

  revalidateBatchScreens();
  return { status: "success", message: "Slot saved." };
}
