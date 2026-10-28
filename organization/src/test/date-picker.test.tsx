import { fireEvent, render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";

import { DatePicker } from "@/components/ui/date-picker";

/**
 * The date fields were native `<input type="date">` boxes: a different control
 * on every browser, and on the ones the office uses, three spinners with no way
 * to jump a month or a year -- picking a date of birth meant stepping back
 * through four hundred months.
 */
const openCalendar = (name = /pick/i) => fireEvent.click(screen.getByRole("button", { name }));

const dropdowns = () => Array.from(document.querySelectorAll("select"));

const clickDay = (day: string) =>
  fireEvent.click(
    Array.from(document.querySelectorAll('button[name="day"]')).find(
      (button) => button.textContent === day,
    )!,
  );

describe("DatePicker", () => {
  it("shows the day the way a person writes one, and keeps the value a form stores", () => {
    render(<DatePicker value="2004-06-01" onChange={() => {}} aria-label="Pick" />);
    // `2004-06-01` is what goes to the database; "01 Jun 2004" is what is read.
    expect(screen.getByRole("button", { name: "Pick" })).toHaveTextContent("01 Jun 2004");
  });

  it("jumps a year without stepping through the months in between", () => {
    const onChange = vi.fn();
    render(<DatePicker value="2004-06-01" onChange={onChange} aria-label="Pick" />);
    openCalendar();

    const [month, year] = dropdowns();
    fireEvent.change(year, { target: { value: "1998" } });
    fireEvent.change(month, { target: { value: "0" } });
    clickDay("15");

    expect(onChange).toHaveBeenCalledWith("1998-01-15");
  });

  it("reads and writes the day it was given, not the day before it", () => {
    // Parsing `2026-09-25` as an instant makes it the 24th anywhere west of
    // Greenwich; the picker keeps to local days at both ends.
    const onChange = vi.fn();
    render(<DatePicker value="2026-09-25" onChange={onChange} aria-label="Pick" />);
    expect(screen.getByRole("button", { name: "Pick" })).toHaveTextContent("25 Sep 2026");

    openCalendar();
    clickDay("26");
    expect(onChange).toHaveBeenCalledWith("2026-09-26");
  });

  it("draws the month and year as dropdowns, and nothing else in the caption", () => {
    render(<DatePicker value="2004-06-01" onChange={() => {}} aria-label="Pick" />);
    openCalendar();

    expect(dropdowns()).toHaveLength(2);
    // react-day-picker's own stylesheet is never loaded in this project, so the
    // caption it expects that sheet to hide has to be hidden here instead -- it
    // was being drawn as loose text on top of the dropdowns.
    expect(screen.getByText("June 2004").className).toContain("sr-only");
  });

  it("refuses the days outside the range it was given", () => {
    render(
      <DatePicker value="2026-07-15" onChange={() => {}} min="2026-04-01" max="2027-03-31" aria-label="Pick" />,
    );
    openCalendar();
    const [, year] = dropdowns();
    // A bounded field offers only the years its range covers.
    const years = Array.from((year as HTMLSelectElement).options).map((o) => o.value);
    expect(years).toEqual(["2026", "2027"]);
  });

  it("can be cleared, for a date that should not have been set", () => {
    const onChange = vi.fn();
    render(<DatePicker value="2026-07-15" onChange={onChange} aria-label="Pick" />);
    openCalendar();
    fireEvent.click(screen.getByRole("button", { name: /^clear$/i }));
    expect(onChange).toHaveBeenCalledWith("");
  });

  it("submits under its own name, for the forms that read themselves with FormData", () => {
    render(
      <form data-testid="form">
        <DatePicker name="directorDOB" defaultValue="1980-03-09" aria-label="Pick" />
      </form>,
    );
    const data = new FormData(screen.getByTestId("form") as HTMLFormElement);
    expect(data.get("directorDOB")).toBe("1980-03-09");
  });
});
