import { z } from "zod";

export const materialSchema = z
  .object({
    title: z.string().trim().min(2, "Give the material a title.").max(160),
    description: z.string().trim().max(500).optional().or(z.literal("")),
    kind: z.enum(["file", "link"]),
    url: z.string().trim().max(500).optional().or(z.literal("")),
    /** Empty means "every course at this centre". */
    courseId: z.string().uuid().optional().or(z.literal("")),
    /** Empty means "every batch on that course". */
    batchId: z.string().uuid().optional().or(z.literal("")),
  })
  .refine(
    (v) => v.kind !== "link" || (!!v.url && /^https?:\/\/\S+$/i.test(v.url)),
    {
      message: "Enter a link starting with http:// or https://",
      path: ["url"],
    },
  );
