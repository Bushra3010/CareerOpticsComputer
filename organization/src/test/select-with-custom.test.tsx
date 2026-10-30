import { fireEvent, render, screen } from "@testing-library/react";
import { useState } from "react";
import { describe, expect, it } from "vitest";

import { SelectWithCustom } from "@/components/ui/select-with-custom";
import { choiceLabel, storedChoice } from "@/lib/choices";

/**
 * Every choice list in the app used to end in a bare "Other", which records
 * that something was none of the above without recording what it was. This
 * covers the control that replaced it: the last entry opens a box, and what is
 * typed in the box is the value.
 */
const Harness = ({ initial = "" }: { initial?: string }) => {
  const [value, setValue] = useState(initial);
  return (
    <>
      <SelectWithCustom
        value={value}
        onValueChange={setValue}
        options={[
          { value: "computer", label: "Computer Institute" },
          { value: "typing", label: "Typing Institute" },
        ]}
        placeholder="Select institute type"
        customPlaceholder="Type the institute type"
      />
      <output>{value}</output>
    </>
  );
};

/** Radix opens on pointer events, and its items are only in the DOM once open. */
const openList = () => {
  const trigger = screen.getByRole("combobox");
  fireEvent.keyDown(trigger, { key: "Enter" });
};

const box = () => screen.queryByLabelText(/type the institute type/i);

describe("SelectWithCustom", () => {
  it("offers the known choices and one way to name another", () => {
    render(<Harness />);
    openList();
    expect(screen.getByText("Computer Institute")).toBeInTheDocument();
    expect(screen.getByText("Typing Institute")).toBeInTheDocument();
    expect(screen.getByText(/other \(type your own\)/i)).toBeInTheDocument();
    // The bin this replaced.
    expect(screen.queryByText(/^Other$/)).not.toBeInTheDocument();
  });

  it("keeps the stored value of a picked choice", () => {
    render(<Harness />);
    openList();
    fireEvent.click(screen.getByText("Typing Institute"));
    expect(screen.getByRole("status")).toHaveTextContent("typing");
    expect(box()).not.toBeInTheDocument();
  });

  it("stores what is typed, not the sentinel behind the box", () => {
    render(<Harness />);
    openList();
    fireEvent.click(screen.getByText(/other \(type your own\)/i));
    // Nothing is stored until it is written: the sentinel is never the value.
    expect(screen.getByRole("status")).toHaveTextContent("");

    fireEvent.change(box()!, { target: { value: "Coaching Centre" } });
    expect(screen.getByRole("status")).toHaveTextContent("Coaching Centre");
  });

  it("opens on the box when the value it is given is not one of the choices", () => {
    render(<Harness initial="Coaching Centre" />);
    expect(box()).toHaveValue("Coaching Centre");
  });

  it("submits the typed value under its form key", () => {
    render(
      <form data-testid="form">
        <SelectWithCustom
          name="instituteType"
          options={["computer"]}
          defaultValue="Coaching Centre"
          customPlaceholder="Type the institute type"
        />
      </form>,
    );
    const data = new FormData(screen.getByTestId("form") as HTMLFormElement);
    // One key, not two: Radix's own hidden field is deliberately not used.
    expect(data.getAll("instituteType")).toEqual(["Coaching Centre"]);
  });
});

describe("choices", () => {
  it("reads an enum member as a label", () => {
    expect(choiceLabel("MALE")).toBe("Male");
    expect(choiceLabel("SKILL_DEVELOPMENT")).toBe("Skill development");
    // Already a label; shouting it would be wrong.
    expect(choiceLabel("Coaching Centre")).toBe("Coaching Centre");
  });

  it("stores a known choice as the enum expects and a typed one as written", () => {
    expect(storedChoice("computer", ["computer", "typing"])).toBe("COMPUTER");
    expect(storedChoice("Coaching Centre", ["computer", "typing"])).toBe("Coaching Centre");
    expect(storedChoice("  ", ["computer"])).toBe("");
  });
});
