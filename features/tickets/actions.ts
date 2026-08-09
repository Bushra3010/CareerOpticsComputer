"use server";

import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/db/action";
import { callRpc } from "@/lib/db/rpc";

import {
  addMessageSchema,
  assignTicketSchema,
  createTicketSchema,
} from "./schema";

export interface TicketActionState {
  status: "idle" | "error" | "success";
  message?: string;
  ticketId?: string;
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

function friendlyMessage(message: string, fallback: string): string {
  return message.replace(/^.*?:\s*/, "") || fallback;
}

/**
 * Works for both a centre staff member and a student — `create_ticket`
 * (migration 0032) resolves which one the caller is via
 * `app.current_student_id()` internally, so this action does not need to
 * know or ask.
 */
export async function createTicket(
  _prev: TicketActionState,
  formData: FormData,
): Promise<TicketActionState> {
  const supabase = await createClient();

  const parsed = createTicketSchema.safeParse({
    centreId: formData.get("centreId")?.toString() ?? "",
    category: formData.get("category")?.toString() ?? "",
    priority: formData.get("priority")?.toString() ?? "medium",
    subject: formData.get("subject")?.toString() ?? "",
    body: formData.get("body")?.toString() ?? "",
  });
  if (!parsed.success) {
    return {
      status: "error",
      fieldErrors: fieldErrorsFrom(parsed.error.issues),
    };
  }

  const { data: ticketId, error } = await callRpc(supabase, "create_ticket", {
    p_centre_id: parsed.data.centreId,
    p_category: parsed.data.category,
    p_priority: parsed.data.priority,
    p_subject: parsed.data.subject,
    p_body: parsed.data.body,
  });

  if (error || !ticketId) {
    return {
      status: "error",
      message: friendlyMessage(
        error?.message ?? "",
        "Could not raise the ticket.",
      ),
    };
  }

  revalidatePath("/centre/support");
  revalidatePath("/student/support");
  revalidatePath("/admin/tickets");
  return {
    status: "success",
    message: "Ticket raised.",
    ticketId: ticketId as string,
  };
}

/** Mirrors the `support-private` bucket's own limits (migration 0032), so
 *  an oversize or off-list file gets a field error rather than a storage
 *  refusal after the upload has already been attempted. */
const MAX_ATTACHMENTS = 5;
const MAX_ATTACHMENT_BYTES = 10 * 1024 * 1024;
const ATTACHMENT_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "application/pdf",
  "text/plain",
]);

export async function addTicketMessage(
  ticketId: string,
  isInternal: boolean,
  _prev: TicketActionState,
  formData: FormData,
): Promise<TicketActionState> {
  const supabase = await createClient();

  const parsed = addMessageSchema.safeParse({
    body: formData.get("body")?.toString() ?? "",
    isInternal,
  });
  if (!parsed.success) {
    return {
      status: "error",
      fieldErrors: fieldErrorsFrom(parsed.error.issues),
    };
  }

  const files = formData
    .getAll("files")
    .filter((f): f is File => f instanceof File && f.size > 0);
  if (files.length > MAX_ATTACHMENTS) {
    return {
      status: "error",
      fieldErrors: { files: `Attach at most ${MAX_ATTACHMENTS} files.` },
    };
  }
  for (const file of files) {
    if (file.size > MAX_ATTACHMENT_BYTES) {
      return {
        status: "error",
        fieldErrors: { files: `${file.name} is over 10 MB.` },
      };
    }
    if (!ATTACHMENT_TYPES.has(file.type)) {
      return {
        status: "error",
        fieldErrors: {
          files: `${file.name}: only images, PDFs and plain text are accepted.`,
        },
      };
    }
  }

  // Uploaded with the caller's own session, so the bucket's RLS (only
  // someone who can read this ticket may write under its prefix) is the
  // real gate — this action adds no service-role shortcut.
  const paths: string[] = [];
  for (const file of files) {
    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_").slice(-80);
    const path = `${ticketId}/${crypto.randomUUID()}-${safeName}`;
    const { error: uploadError } = await supabase.storage
      .from("support-private")
      .upload(path, file);
    if (uploadError) {
      // Best effort: do not leave earlier files orphaned on a later failure.
      if (paths.length) {
        await supabase.storage.from("support-private").remove(paths);
      }
      return {
        status: "error",
        fieldErrors: { files: `Could not upload ${file.name}.` },
      };
    }
    paths.push(path);
  }

  const { error } = await callRpc(supabase, "add_ticket_message", {
    p_ticket_id: ticketId,
    p_body: parsed.data.body,
    p_is_internal: parsed.data.isInternal,
    p_attachments: paths,
  });

  if (error) {
    if (paths.length) {
      await supabase.storage.from("support-private").remove(paths);
    }
    return {
      status: "error",
      message: friendlyMessage(error.message, "Could not send the message."),
    };
  }

  revalidatePath(`/admin/tickets/${ticketId}`);
  revalidatePath(`/centre/support/${ticketId}`);
  revalidatePath(`/student/support/${ticketId}`);
  return {
    status: "success",
    message: isInternal ? "Internal note added." : "Message sent.",
  };
}

export async function assignTicket(
  ticketId: string,
  _prev: TicketActionState,
  formData: FormData,
): Promise<TicketActionState> {
  const supabase = await createClient();
  const parsed = assignTicketSchema.safeParse({
    assigneeId: formData.get("assigneeId")?.toString() ?? "",
  });
  if (!parsed.success) {
    return {
      status: "error",
      fieldErrors: fieldErrorsFrom(parsed.error.issues),
    };
  }

  const { error } = await callRpc(supabase, "assign_ticket", {
    p_ticket_id: ticketId,
    p_assignee_id: parsed.data.assigneeId,
  });

  if (error) {
    return {
      status: "error",
      message: friendlyMessage(error.message, "Could not assign the ticket."),
    };
  }

  revalidatePath(`/admin/tickets/${ticketId}`);
  revalidatePath("/admin/tickets");
  return { status: "success", message: "Ticket assigned." };
}

async function transition(
  ticketId: string,
  fn: "resolve_ticket" | "close_ticket" | "reopen_ticket",
  successMessage: string,
  errorFallback: string,
): Promise<TicketActionState> {
  const supabase = await createClient();
  const { error } = await callRpc(supabase, fn, { p_ticket_id: ticketId });
  if (error) {
    return {
      status: "error",
      message: friendlyMessage(error.message, errorFallback),
    };
  }
  revalidatePath(`/admin/tickets/${ticketId}`);
  revalidatePath(`/centre/support/${ticketId}`);
  revalidatePath(`/student/support/${ticketId}`);
  revalidatePath("/admin/tickets");
  return { status: "success", message: successMessage };
}

export async function resolveTicket(
  ticketId: string,
  _prev: TicketActionState,
  _formData: FormData,
): Promise<TicketActionState> {
  return transition(
    ticketId,
    "resolve_ticket",
    "Ticket resolved.",
    "Could not resolve the ticket.",
  );
}

export async function closeTicket(
  ticketId: string,
  _prev: TicketActionState,
  _formData: FormData,
): Promise<TicketActionState> {
  return transition(
    ticketId,
    "close_ticket",
    "Ticket closed.",
    "Could not close the ticket.",
  );
}

export async function reopenTicket(
  ticketId: string,
  _prev: TicketActionState,
  _formData: FormData,
): Promise<TicketActionState> {
  return transition(
    ticketId,
    "reopen_ticket",
    "Ticket reopened.",
    "Could not reopen the ticket.",
  );
}
