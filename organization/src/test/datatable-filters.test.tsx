import { render, screen, fireEvent, within } from "@testing-library/react";
import { describe, it, expect } from "vitest";

import { DataTable, type Column, type TableFilter } from "@/components/ui/DataTable";

/**
 * The table has always had a filter, but only one, and it picked the column
 * itself — "status" if there was one, else the first sortable column. A
 * register narrowed by state *and* district *and* status could not say so.
 */
interface Row {
  id: string;
  name: string;
  state: string;
  district: string;
  status: string;
}

const ROWS: Row[] = [
  { id: "1", name: "Patna Branch", state: "Bihar", district: "Patna", status: "active" },
  { id: "2", name: "Gaya Branch", state: "Bihar", district: "Gaya", status: "inactive" },
  { id: "3", name: "Pune Branch", state: "Maharashtra", district: "Pune", status: "active" },
];

const columns: Column<Row>[] = [
  { key: "name", header: "Branch" },
  { key: "state", header: "State" },
  { key: "status", header: "Status" },
];

const filters: TableFilter<Row>[] = [
  { label: "State", key: "state" },
  { label: "District", key: "district" },
  { label: "Status", key: "status", options: ["active", "inactive"] },
];

const table = () => screen.getByRole("table");
const names = () =>
  within(table())
    .getAllByRole("row")
    .slice(1)
    .map((r) => r.textContent?.match(/\w+ Branch/)?.[0]);

const openFilters = () => fireEvent.click(screen.getByRole("button", { name: /filters/i }));
/** Each filter is a searchable dropdown named after its label. */
const openIn = (label: string) => fireEvent.click(screen.getByRole("combobox", { name: label }));
const chooseIn = (label: string, choice: string) => {
  openIn(label);
  fireEvent.click(within(screen.getByRole("listbox", { name: label })).getByRole("option", { name: choice }));
};

describe("DataTable named filters", () => {
  it("offers one group per filter, labelled", () => {
    render(<DataTable data={ROWS} columns={columns} filters={filters} />);
    openFilters();

    for (const label of ["State", "District", "Status"]) {
      expect(screen.getByText(label, { selector: "p" })).toBeInTheDocument();
    }
  });

  it("reads the choices off the rows, and takes fixed ones when given", () => {
    render(<DataTable data={ROWS} columns={columns} filters={filters} />);
    openFilters();

    openIn("State");
    const list = screen.getByRole("listbox", { name: "State" });
    expect(within(list).getByRole("option", { name: "Bihar" })).toBeInTheDocument();
    expect(within(list).getByRole("option", { name: "Maharashtra" })).toBeInTheDocument();
  });

  it("finds a choice by typing into the dropdown's search", () => {
    render(<DataTable data={ROWS} columns={columns} filters={filters} />);
    openFilters();
    openIn("District");
    fireEvent.change(screen.getByRole("textbox", { name: "Search District" }), { target: { value: "pu" } });

    const list = screen.getByRole("listbox", { name: "District" });
    expect(within(list).getByRole("option", { name: "Pune" })).toBeInTheDocument();
    expect(within(list).queryByRole("option", { name: "Patna" })).toBeNull();
  });

  it("offers only the chosen state's districts", () => {
    render(<DataTable data={ROWS} columns={columns} filters={filters} />);
    openFilters();
    chooseIn("State", "Maharashtra");
    openIn("District");

    const list = screen.getByRole("listbox", { name: "District" });
    expect(within(list).getByRole("option", { name: "Pune" })).toBeInTheDocument();
    expect(within(list).queryByRole("option", { name: "Patna" })).toBeNull();
  });

  it("drops a district that no longer fits when the state changes", () => {
    render(<DataTable data={ROWS} columns={columns} filters={filters} />);
    openFilters();
    chooseIn("State", "Bihar");
    chooseIn("District", "Patna");
    chooseIn("State", "Maharashtra");

    expect(names()).toEqual(["Pune Branch"]);
  });

  it("narrows the rows to the chosen value", () => {
    render(<DataTable data={ROWS} columns={columns} filters={filters} />);
    openFilters();
    chooseIn("State", "Bihar");

    expect(names()).toEqual(["Patna Branch", "Gaya Branch"]);
  });

  // The point of the change: one filter at a time was the old behaviour.
  it("applies every chosen filter together, not just the last one", () => {
    render(<DataTable data={ROWS} columns={columns} filters={filters} />);
    openFilters();
    chooseIn("State", "Bihar");
    chooseIn("Status", "active");

    expect(names()).toEqual(["Patna Branch"]);
  });

  it("counts the active filters on the button", () => {
    render(<DataTable data={ROWS} columns={columns} filters={filters} />);
    openFilters();
    chooseIn("State", "Bihar");
    chooseIn("Status", "active");

    expect(screen.getByRole("button", { name: /filters · 2/i })).toBeInTheDocument();
  });

  it("clears a filter when its chosen value is pressed again", () => {
    render(<DataTable data={ROWS} columns={columns} filters={filters} />);
    openFilters();
    chooseIn("State", "Bihar");
    expect(names()).toHaveLength(2);

    chooseIn("State", "Bihar");
    expect(names()).toHaveLength(3);
  });

  it("clears every filter at once", () => {
    render(<DataTable data={ROWS} columns={columns} filters={filters} />);
    openFilters();
    chooseIn("State", "Bihar");
    chooseIn("Status", "active");

    fireEvent.click(screen.getByRole("button", { name: /clear/i }));
    expect(names()).toHaveLength(3);
  });

  // Every table that was not given `filters` has to behave exactly as before.
  it("leaves a table without named filters on its old single filter", () => {
    render(<DataTable data={ROWS} columns={columns} />);
    openFilters();

    expect(screen.queryByText("District", { selector: "p" })).toBeNull();
    // The old filter picks the status column by name and lists its values.
    expect(screen.getByText("Status", { selector: "span" })).toBeInTheDocument();
  });
});
