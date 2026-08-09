import { z } from "zod";

export const createAnnouncementSchema = z.object({
  scopeType: z.enum(["organization", "centre"]),
  scopeCentreId: z.string().uuid().optional().or(z.literal("")),
  title: z.string().trim().min(2, "Give it a title.").max(200),
  body: z.string().trim().min(2, "Write the announcement.").max(4000),
  publishNow: z.coerce.boolean().optional().default(false),
  expiresAt: z.string().trim().optional().or(z.literal("")),
});
