import { render, screen, fireEvent, within } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";

import { countBlanks, QUESTION_BANK_KEY, type Question } from "@/pages/online-exam/AddQuestions";

/**
 * A fill-in-the-blanks question, alongside the four types the page already had.
 * What makes it its own type is that the gaps live inside the question text, so
 * the form has to read them out of the wording rather than be told how many
 * there are.
 */
describe("countBlanks", () => {
  it("counts each run of three or more underscores", () => {
    expect(countBlanks("The capital of France is ___.")).toBe(1);
    expect(countBlanks("___ revolves around the ___ in ___ days.")).toBe(3);
    expect(countBlanks("________")).toBe(1);
  });

  it("leaves an underscore inside a term alone", () => {
    // Otherwise `snake_case` and `MAX_MARKS` become gaps to fill in.
    expect(countBlanks("In Python, name variables in snake_case style.")).toBe(0);
    expect(countBlanks("Set MAX_MARKS before the exam.")).toBe(0);
  });

  it("is zero for a sentence with no gap at all", () => {
    expect(countBlanks("")).toBe(0);
    expect(countBlanks("Nothing to fill in here.")).toBe(0);
  });
});

/* ---------- the page ---------- */

const toast = vi.fn();
vi.mock("@/hooks/use-toast", () => ({ useToast: () => ({ toast }) }));
// The chrome is not what this file is about; the form inside it is.
vi.mock("@/components/layout/AppLayout", () => ({
  AppLayout: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));
vi.mock("@/components/ui/PageHeader", () => ({
  PageHeader: ({ actions }: { actions?: React.ReactNode }) => <div>{actions}</div>,
}));

const AddQuestions = (await import("@/pages/online-exam/AddQuestions")).default;

const saved = (): Question[] => JSON.parse(localStorage.getItem(QUESTION_BANK_KEY) || "[]");

beforeEach(() => {
  toast.mockClear();
  localStorage.clear();
});

const openBlanksTab = () => {
  render(<AddQuestions />);
  const tab = screen.getByRole("tab", { name: /fill in the blanks/i });
  // Radix selects a tab on mousedown, not on click.
  fireEvent.mouseDown(tab);
  fireEvent.click(tab);
  // Only the selected panel is rendered.
  return screen.getByRole("tabpanel");
};

/** The question is written in the rich text editor, which is a contentEditable
 *  box rather than a textarea -- so a test writes HTML into it and fires the
 *  `input` the browser would fire. */
const questionBox = (panel: HTMLElement) =>
  within(panel).getByRole("textbox", { name: /question text/i });

const write = (panel: HTMLElement, html: string) => {
  const box = questionBox(panel);
  box.innerHTML = html;
  fireEvent.input(box);
};

describe("Fill in the Blanks", () => {
  it("takes its place among the other question types", () => {
    render(<AddQuestions />);
    for (const name of [/^MCQ$/, /true\/false/i, /fill in the blanks/i, /short answer/i, /long answer/i]) {
      expect(screen.getByRole("tab", { name })).toBeInTheDocument();
    }
  });

  it("grows an answer box for each gap as the question is written", () => {
    const panel = openBlanksTab();
    expect(within(panel).getByText(/no blanks yet/i)).toBeInTheDocument();

    write(panel, "The capital of France is ___.");
    expect(within(panel).getByText(/1 blank in this question/i)).toBeInTheDocument();

    write(panel, "The capital of France is ___, on the river ___.");
    expect(within(panel).getByText(/2 blanks in this question/i)).toBeInTheDocument();
  });

  it("keeps what was typed for a blank when the wording around it changes", () => {
    const panel = openBlanksTab();
    write(panel, "Capital of France is ___ on the ___.");

    fireEvent.change(within(panel).getByLabelText("Answer for blank 1"), {
      target: { value: "Paris" },
    });

    write(panel, "The capital city of France is ___, which stands on the ___.");
    expect(within(panel).getByLabelText("Answer for blank 1")).toHaveValue("Paris");
  });

  it("saves the answers in the order the gaps are written", () => {
    const panel = openBlanksTab();
    write(panel, "___ orbits the ___.");

    fireEvent.change(within(panel).getByLabelText("Answer for blank 1"), { target: { value: "The Earth" } });
    fireEvent.change(within(panel).getByLabelText("Answer for blank 2"), { target: { value: "Sun, sol" } });
    fireEvent.click(within(panel).getByRole("button", { name: /save question/i }));

    const [question] = saved();
    expect(question.type).toBe("blanks");
    expect(question.text).toBe("___ orbits the ___.");
    expect(question.blanks).toEqual(["The Earth", "Sun, sol"]);
    // A mark per gap: the marks field lives on the MCQ tab, so a blanks
    // question could never be given one and every question scored the same 1.
    expect(question.marks).toBe("2");
  });

  it("refuses a sentence with nothing to fill in, and says how to mark one", () => {
    const panel = openBlanksTab();
    write(panel, "The capital of France is Paris.");
    fireEvent.click(within(panel).getByRole("button", { name: /save question/i }));

    expect(saved()).toHaveLength(0);
    expect(toast).toHaveBeenCalledWith(expect.objectContaining({ title: "No blank in the sentence" }));
  });

  it("names the blank that has no answer, rather than saving one that cannot be marked", () => {
    const panel = openBlanksTab();
    write(panel, "___ orbits the ___.");

    fireEvent.change(within(panel).getByLabelText("Answer for blank 1"), { target: { value: "The Earth" } });
    fireEvent.click(within(panel).getByRole("button", { name: /save question/i }));

    expect(saved()).toHaveLength(0);
    expect(toast).toHaveBeenCalledWith(
      expect.objectContaining({ description: expect.stringMatching(/blank 2/i) }),
    );
  });

  it("clears the form after a save, ready for the next question", () => {
    const panel = openBlanksTab();
    write(panel, "Water is ___.");
    fireEvent.change(within(panel).getByLabelText("Answer for blank 1"), { target: { value: "H2O" } });
    fireEvent.click(within(panel).getByRole("button", { name: /save question/i }));

    expect(questionBox(panel).innerHTML).toBe("");
    expect(within(panel).getByText(/no blanks yet/i)).toBeInTheDocument();
  });
});
