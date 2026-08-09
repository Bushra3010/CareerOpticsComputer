import { z } from "zod";

export const createTicketSchema = z.object({
  centreId: z.string().uuid("Choose a centre."),
  category: z.string().trim().min(2, "Choose a category.").max(60),
  priority: z.enum(["low", "medium", "high", "urgent"]),
  subject: z.string().trim().min(4, "Give the ticket a subject.").max(200),
  body: z.string().trim().min(4, "Describe the issue.").max(4000),
});

export const addMessageSchema = z.object({
  body: z.string().trim().min(1, "Write a message.").max(4000),
  isInternal: z.coerce.boolean().optional().default(false),
});

export const assignTicketSchema = z.object({
  assigneeId: z.string().uuid("Choose an assignee."),
});
