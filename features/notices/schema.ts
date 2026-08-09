import { z } from "zod";

export const noticeSchema = z.object({
  title: z.string().trim().min(4, "Give the notice a title.").max(160),
  slug: z
    .string()
    .trim()
    .toLowerCase()
    .regex(
      /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
      "Lowercase letters, numbers and hyphens only.",
    )
    .max(80),
  body: z.string().trim().min(10, "Write the notice body.").max(20_000),
  /** Empty means "publish immediately when activated". */
  publishedAt: z.string().trim().optional().or(z.literal("")),
});
