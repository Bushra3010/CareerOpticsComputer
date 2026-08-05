"use client";

import { Plus, Trash2 } from "lucide-react";
import { useActionState, useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import { Field, RequiredLegend } from "@/components/ui/field";
import { Input, Select, Textarea } from "@/components/ui/input";

import { createQuestion, type ExamActionState } from "../actions";
import { QUESTION_TYPES } from "../schema";

const initial: ExamActionState = { status: "idle" };

export function QuestionForm({ bankId }: { bankId: string }) {
  const formRef = useRef<HTMLFormElement>(null);
  const bound = createQuestion.bind(null, bankId);
  const [state, action, pending] = useActionState(bound, initial);

  const [type, setType] = useState<string>("single_choice");
  const [rows, setRows] = useState<number[]>([0, 1]);

  // True/false is a fixed pair, so the option editor steps aside rather than
  // asking someone to type "True" and "False" every time.
  const fixed = type === "true_false";
  const multiple = type === "multiple_choice";

  return (
    <form
      ref={formRef}
      action={async (formData) => {
        if (fixed) {
          formData.delete("option");
          formData.append("option", "True");
          formData.append("option", "False");
        }
        await action(formData);
        if (formRef.current) {
          formRef.current.reset();
          setRows([0, 1]);
        }
      }}
      className="space-y-4"
    >
      <Field
        id="body"
        label="Question"
        required
        error={state.fieldErrors?.body}
      >
        <Textarea name="body" rows={3} required maxLength={2000} />
      </Field>

      {/* Two up before lg, not four. At 651px four columns truncated the type
          select to "Single choic" — the label is the control's only affordance,
          so a clipped one is a broken control. */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Field id="type" label="Type" required>
          <Select
            name="type"
            value={type}
            onChange={(e) => setType(e.target.value)}
          >
            {QUESTION_TYPES.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </Select>
        </Field>
        <Field
          id="marks"
          label="Marks"
          required
          error={state.fieldErrors?.marks}
        >
          <Input
            name="marks"
            type="number"
            min={1}
            max={100}
            defaultValue={1}
            required
          />
        </Field>
        <Field
          id="negativeMarks"
          label="Negative marks"
          help="Subtracted for a wrong answer."
        >
          <Input
            name="negativeMarks"
            type="number"
            min={0}
            max={100}
            defaultValue={0}
          />
        </Field>
        <Field id="difficulty" label="Difficulty">
          <Select name="difficulty" defaultValue="medium">
            <option value="easy">Easy</option>
            <option value="medium">Medium</option>
            <option value="hard">Hard</option>
          </Select>
        </Field>
      </div>

      <fieldset className="space-y-2">
        <legend className="text-label text-text">
          Options{" "}
          <span className="text-meta text-text-secondary">
            {multiple
              ? "— tick every correct answer"
              : "— tick the correct answer"}
          </span>
        </legend>

        {fixed ? (
          <div className="space-y-2">
            {["True", "False"].map((label, index) => (
              <label key={label} className="flex items-center gap-3">
                <input
                  type="radio"
                  name="correct"
                  value={String(index)}
                  defaultChecked={index === 0}
                  className="size-5 accent-[var(--color-navy-900)]"
                />
                <span className="text-body text-text">{label}</span>
              </label>
            ))}
          </div>
        ) : (
          <div className="space-y-2">
            {rows.map((row, index) => (
              <div key={row} className="flex items-center gap-3">
                <input
                  type={multiple ? "checkbox" : "radio"}
                  name="correct"
                  value={String(index)}
                  aria-label={`Option ${index + 1} is correct`}
                  className="size-5 shrink-0 accent-[var(--color-navy-900)]"
                />
                <Input
                  name="option"
                  aria-label={`Option ${index + 1}`}
                  placeholder={`Option ${index + 1}`}
                  maxLength={300}
                />
                <Button
                  type="button"
                  variant="tertiary"
                  size="sm"
                  disabled={rows.length <= 2}
                  onClick={() => setRows(rows.filter((r) => r !== row))}
                >
                  <Trash2 aria-hidden="true" />
                  <span className="sr-only">Remove option {index + 1}</span>
                </Button>
              </div>
            ))}
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => setRows([...rows, Math.max(...rows) + 1])}
            >
              <Plus aria-hidden="true" /> Add option
            </Button>
          </div>
        )}

        {state.fieldErrors?.options ? (
          <p role="alert" className="text-meta text-danger">
            {state.fieldErrors.options}
          </p>
        ) : null}
      </fieldset>

      <Field
        id="explanation"
        label="Explanation"
        help="Shown after results are published."
      >
        <Textarea name="explanation" rows={2} maxLength={1000} />
      </Field>

      <RequiredLegend />
      {state.status === "error" && state.message ? (
        <p role="alert" className="text-body text-danger">
          {state.message}
        </p>
      ) : null}
      {state.status === "success" && state.message ? (
        <p role="status" className="text-body text-green-700">
          {state.message}
        </p>
      ) : null}

      <Button type="submit" loading={pending} loadingLabel="Saving">
        Add question
      </Button>
    </form>
  );
}
