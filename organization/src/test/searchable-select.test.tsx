import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

/**
 * Every centre picker carries a search box; any list of ten or more gets one
 * by itself. Typing narrows the options, and the chosen one still names the
 * trigger.
 */
const centres = ["Coder Infotech Academy", "Digiskills computer academy", "PNS Coaching Classes", "PNS COMPUTER ACADEMY"];

function Picker({ searchable, options = centres, onChange = () => {} }: { searchable?: boolean; options?: string[]; onChange?: (v: string) => void }) {
  return (
    <Select onValueChange={onChange}>
      <SelectTrigger aria-label="Centre"><SelectValue placeholder="Select centre" /></SelectTrigger>
      <SelectContent searchable={searchable} searchPlaceholder="Search centre…">
        {options.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
      </SelectContent>
    </Select>
  );
}

const open = () => fireEvent.keyDown(screen.getByLabelText("Centre"), { key: "Enter" });

describe("searchable select", () => {
  it("narrows a centre list as one types, and picks from what is left", async () => {
    const onChange = vi.fn();
    render(<Picker searchable onChange={onChange} />);
    open();
    const box = await screen.findByLabelText("Search centre…");
    fireEvent.change(box, { target: { value: "pns" } });
    expect(screen.getAllByRole("option").map((o) => o.textContent)).toEqual(["PNS Coaching Classes", "PNS COMPUTER ACADEMY"]);
    fireEvent.change(box, { target: { value: "zzz" } });
    expect(screen.queryAllByRole("option")).toHaveLength(0);
    expect(screen.getByText("No match for “zzz”")).toBeInTheDocument();
    fireEvent.change(box, { target: { value: "coder" } });
    fireEvent.click(screen.getByRole("option", { name: "Coder Infotech Academy" }));
    expect(onChange).toHaveBeenCalledWith("Coder Infotech Academy");
  });

  it("finds a student by full name despite double spaces, in any word order, or with the number", async () => {
    render(<Picker searchable options={["Abhishek  Gupta · APP-2026-0012", "Rohit  Kumar  Sharma  · APP-2026-0010", "Sonali kumari · APP-2026-0011"]} />);
    open();
    const box = await screen.findByLabelText("Search centre…");
    const shown = () => screen.queryAllByRole("option").map((o) => o.textContent);
    for (const q of ["abhishek gupta", "  Abhishek   Gupta ", "gupta abhishek", "abhishek 0012"]) {
      fireEvent.change(box, { target: { value: q } });
      expect(shown()).toEqual(["Abhishek  Gupta · APP-2026-0012"]);
    }
    fireEvent.change(box, { target: { value: "rohit kumar sharma" } });
    expect(shown()).toEqual(["Rohit  Kumar  Sharma  · APP-2026-0010"]);
    fireEvent.change(box, { target: { value: "abhishek sonali" } });
    expect(shown()).toEqual([]);
  });

  it("keeps a short list plain, and gives a long one a search box by itself", async () => {
    const { unmount } = render(<Picker />);
    open();
    await screen.findByRole("option", { name: "PNS COMPUTER ACADEMY" });
    expect(screen.queryByLabelText("Search centre…")).toBeNull();
    unmount();

    render(<Picker options={Array.from({ length: 12 }, (_, i) => `Centre ${i + 1}`)} />);
    open();
    expect(await screen.findByLabelText("Search centre…")).toBeInTheDocument();
  });

  it("lets typing in the box stay in the box", async () => {
    render(<Picker searchable />);
    open();
    const box = await screen.findByLabelText("Search centre…");
    box.focus();
    fireEvent.keyDown(box, { key: "c" });
    expect(document.activeElement).toBe(box);
  });
});
