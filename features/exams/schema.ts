import { z } from "zod";

export const QUESTION_TYPES = [
  { value: "single_choice", label: "Single choice", grading: "auto" },
  { value: "multiple_choice", label: "Multiple choice", grading: "auto" },
  { value: "true_false", label: "True or false", grading: "auto" },
] as const;

/** The three the first slice offers. The enum in the database carries all seven
 *  PRD §6.7.2 lists; the other four need the evaluation queue, which is not
 *  built, and a question that cannot be marked is not a question yet. */
export const CHOICE_TYPES = QUESTION_TYPES.map((t) => t.value);

export const bankSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Give the bank a name of at least two characters.")
    .max(120, "Keep the name under 120 characters."),
  description: z.string().trim().max(500).optional().or(z.literal("")),
});

const optionSchema = z.object({
  body: z.string().trim().min(1, "An option cannot be blank.").max(300),
  is_correct: z.boolean(),
});

export const questionSchema = z
  .object({
    type: z.enum(["single_choice", "multiple_choice", "true_false"]),
    body: z
      .string()
      .trim()
      .min(5, "Write the question — at least five characters.")
      .max(2000),
    marks: z.coerce.number().int().min(1, "Marks must be at least 1.").max(100),
    negativeMarks: z.coerce
      .number()
      .int()
      .min(0, "Negative marks cannot be below zero.")
      .max(100),
    difficulty: z.enum(["easy", "medium", "hard"]),
    explanation: z.string().trim().max(1000).optional().or(z.literal("")),
    options: z
      .array(optionSchema)
      .min(2, "A choice question needs at least two options."),
  })
  // Mirrors the same rules save_question_options enforces in Postgres. Both
  // exist on purpose: this one produces the message next to the field, that one
  // is what a crafted request cannot get past.
  .refine((q) => q.options.some((o) => o.is_correct), {
    message: "Mark at least one option as correct.",
    path: ["options"],
  })
  .refine(
    (q) =>
      q.type === "multiple_choice" ||
      q.options.filter((o) => o.is_correct).length <= 1,
    {
      message: "This question type allows only one correct option.",
      path: ["options"],
    },
  );

export type BankInput = z.infer<typeof bankSchema>;
export type QuestionInput = z.infer<typeof questionSchema>;

export const examSchema = z
  .object({
    bankId: z.string().uuid("Choose a question bank."),
    title: z
      .string()
      .trim()
      .min(3, "Give the exam a title of at least three characters.")
      .max(160),
    instructions: z.string().trim().max(2000).optional().or(z.literal("")),
    durationMinutes: z.coerce
      .number()
      .int()
      .min(1, "An exam needs at least a minute.")
      .max(600, "Ten hours is the ceiling."),
    passPercent: z.coerce.number().int().min(0).max(100),
    maxAttempts: z.coerce.number().int().min(1).max(10),
    opensAt: z.string().min(1, "Choose when the exam opens."),
    closesAt: z.string().min(1, "Choose when the exam closes."),
  })
  .refine((e) => new Date(e.closesAt) > new Date(e.opensAt), {
    message: "The exam must close after it opens.",
    path: ["closesAt"],
  });

export type ExamInput = z.infer<typeof examSchema>;
