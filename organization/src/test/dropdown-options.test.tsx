/**
 * The editable dropdowns and the multi-course picker.
 *
 * Both were added because the app had no way to record anything its hard-coded
 * arrays had not anticipated, and no way to enrol a student on more than one
 * course. These cover the parts that are easy to get subtly wrong: the fallback
 * to defaults, renaming a value out from under a selection, and "select all"
 * applying to a filtered list rather than the whole one.
 */
import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen, fireEvent, waitFor, act } from "@testing-library/react";
import { useState } from "react";
import { MultiSelect } from "@/components/ui/MultiSelect";
import { EditableSelect } from "@/components/ui/EditableSelect";
import {
  DROPDOWN_DEFAULTS,
  optionLabel,
  resetDropdownOptions,
} from "@/lib/dropdownOptions";

const saved: Array<{ key: string; values: string[] }> = [];

vi.mock("@/lib/supabase/data", () => ({
  getDropdownOptions: vi.fn(async () => ({ success: true, data: {}, stored: true })),
  saveDropdownOptions: vi.fn(async (_org: string, key: string, values: string[]) => {
    saved.push({ key, values });
    return { success: true, stored: true };
  }),
}));

vi.mock("@/contexts/AuthContext", () => ({
  useAuth: () => ({ user: { id: "u1", organizationId: "org1" } }),
}));

const toasts: Array<{ title?: string }> = [];
vi.mock("@/hooks/use-toast", () => ({
  useToast: () => ({ toast: (t: { title?: string }) => toasts.push(t) }),
}));

beforeEach(() => {
  localStorage.clear();
  saved.length = 0;
  toasts.length = 0;
  act(() => resetDropdownOptions());
});

describe("optionLabel", () => {
  it("humanises screaming-snake enums and leaves everything else alone", () => {
    expect(optionLabel("COMPUTER")).toBe("Computer");
    expect(optionLabel("SKILL_DEVELOPMENT")).toBe("Skill development");
    // Blood groups are short and already correctly cased.
    expect(optionLabel("A+")).toBe("A+");
    expect(optionLabel("State Board")).toBe("State Board");
    expect(optionLabel("")).toBe("");
  });
});

describe("EditableSelect", () => {
  it("falls back to the built-in list when nothing has been saved", async () => {
    render(<EditableSelect optionKey="bloodGroup" value="" onChange={() => {}} />);
    fireEvent.click(screen.getByRole("combobox"));
    for (const group of DROPDOWN_DEFAULTS.bloodGroup) {
      expect(await screen.findByRole("option", { name: group })).toBeTruthy();
    }
  });

  it("offers a value already on the record even if it is not on the list", async () => {
    render(<EditableSelect optionKey="stream" value="Agriculture" onChange={() => {}} />);
    fireEvent.click(screen.getByRole("combobox"));
    expect(await screen.findByRole("option", { name: "Agriculture" })).toBeTruthy();
  });

  it("adds an option and saves the whole list", async () => {
    render(<EditableSelect optionKey="stream" value="" onChange={() => {}} />);
    fireEvent.click(screen.getByRole("button", { name: /manage stream options/i }));

    fireEvent.change(await screen.findByLabelText("Add an option"), {
      target: { value: "Agriculture" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Add" }));
    fireEvent.click(screen.getByRole("button", { name: "Save options" }));

    await waitFor(() => expect(saved).toHaveLength(1));
    expect(saved[0].key).toBe("stream");
    expect(saved[0].values).toEqual([...DROPDOWN_DEFAULTS.stream, "Agriculture"]);
  });

  it("clears a selection that was renamed away, so the trigger never shows a dead value", async () => {
    const onChange = vi.fn();
    render(<EditableSelect optionKey="stream" value="Science" onChange={onChange} />);
    fireEvent.click(screen.getByRole("button", { name: /manage stream options/i }));

    // "Science" is the first entry in the defaults.
    fireEvent.change(await screen.findByLabelText("Option 1"), {
      target: { value: "Pure science" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Save options" }));

    await waitFor(() => expect(onChange).toHaveBeenCalledWith(""));
    expect(saved[0].values[0]).toBe("Pure science");
  });

  it("refuses to save an empty list", async () => {
    render(<EditableSelect optionKey="stream" value="" onChange={() => {}} />);
    fireEvent.click(screen.getByRole("button", { name: /manage stream options/i }));

    for (const value of DROPDOWN_DEFAULTS.stream) {
      fireEvent.click(await screen.findByRole("button", { name: `Remove ${value}` }));
    }
    fireEvent.click(screen.getByRole("button", { name: "Save options" }));

    await waitFor(() =>
      expect(toasts.some((t) => t.title === "Keep at least one option")).toBe(true),
    );
    expect(saved).toHaveLength(0);
  });
});

function Harness({ initial = [] as string[] }) {
  const [value, setValue] = useState<string[]>(initial);
  return (
    <MultiSelect
      options={[
        { value: "c1", label: "Tally" },
        { value: "c2", label: "Advanced Excel" },
        { value: "c3", label: "Spoken English" },
      ]}
      value={value}
      onChange={setValue}
      placeholder="Choose courses"
    />
  );
}

describe("MultiSelect", () => {
  it("summarises the selection on the trigger", async () => {
    render(<Harness />);
    const trigger = screen.getByRole("combobox");
    expect(trigger.textContent).toContain("Choose courses");

    fireEvent.click(trigger);
    fireEvent.click(await screen.findByText("Tally"));
    expect(trigger.textContent).toContain("Tally");

    fireEvent.click(screen.getByText("Advanced Excel"));
    expect(trigger.textContent).toContain("2 selected");
  });

  it("selects every option at once", async () => {
    render(<Harness />);
    fireEvent.click(screen.getByRole("combobox"));
    fireEvent.click(await screen.findByRole("button", { name: /select all/i }));
    expect(screen.getByRole("combobox").textContent).toContain("3 selected");

    fireEvent.click(screen.getByRole("button", { name: /unselect all/i }));
    expect(screen.getByRole("combobox").textContent).toContain("Choose courses");
  });

  it("limits select all to what the search box is showing", async () => {
    render(<Harness />);
    fireEvent.click(screen.getByRole("combobox"));
    fireEvent.change(await screen.findByLabelText("Search options"), {
      target: { value: "e" },
    });
    // "Advanced Excel" and "Spoken English" match; "Tally" does not.
    fireEvent.click(screen.getByRole("button", { name: /select all/i }));
    expect(screen.getByRole("combobox").textContent).toContain("2 selected");
  });

  it("removes a course from its badge", async () => {
    render(<Harness initial={["c1", "c2"]} />);
    fireEvent.click(screen.getByRole("button", { name: "Remove Tally" }));
    expect(screen.getByRole("combobox").textContent).toContain("Advanced Excel");
  });
});
