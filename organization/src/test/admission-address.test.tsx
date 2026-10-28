import { render, screen, fireEvent, within } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { MemoryRouter } from "react-router-dom";

/**
 * The admission form asked for City, then District, then State, and all three
 * as free text -- so an address was written inside out and every branch spelt
 * its own district differently. It reads State, then District, then City now,
 * and each list narrows the next.
 */
const toast = vi.fn();
vi.mock("@/hooks/use-toast", () => ({ useToast: () => ({ toast }) }));
vi.mock("@/components/layout/AppLayout", () => ({
  AppLayout: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));
vi.mock("@/contexts/AuthContext", () => ({
  useAuth: () => ({ user: { id: "u1", role: "FRANCHISE", organizationId: "org1", branchId: "b1" } }),
}));
vi.mock("@/lib/supabase/data", () => ({
  getCourses: () => Promise.resolve({ success: true, data: [] }),
  getBranchCourseIds: () => Promise.resolve(new Set<string>()),
  getBatches: () => Promise.resolve({ success: true, data: [] }),
  getBranches: () => Promise.resolve({ success: true, data: [] }),
  createStudent: () => Promise.resolve({ success: true, data: {} }),
  getStudent: () => Promise.resolve({ success: true, data: {} }),
  updateStudent: () => Promise.resolve({ success: true, data: {} }),
  getDropdownOptions: () => Promise.resolve({ success: true, data: {}, stored: true }),
  saveDropdownOptions: () => Promise.resolve({ success: true, stored: true }),
  // No sessions on file, which is what these fixtures describe. The two helpers
  // return exactly this for an empty session list, so the stubs do not claim
  // behaviour the real ones would not have.
  getSessionYears: () => Promise.resolve({ success: true, data: [], stored: false }),
  sessionYearsForDate: () => [],
  admissionDateProblem: () => null,
}));

const AdmissionsWorkspace = (await import("@/pages/student/AdmissionsWorkspace")).default;

/** The control under a given field label. The labels carry no `htmlFor`, and
 *  the step has six dropdowns, so position alone would be guesswork. */
const control = (label: string) => {
  const labelEl = Array.from(document.querySelectorAll("label")).find(
    (el) => el.textContent?.replace("*", "").trim() === label,
  )!;
  return within(labelEl.parentElement!).getByRole("combobox");
};

const openList = (trigger: HTMLElement) => fireEvent.keyDown(trigger, { key: "Enter" });

beforeEach(() => {
  toast.mockClear();
  localStorage.clear();
});

describe("Admission address", () => {
  it("asks for the state, then the district, then the block and the city", () => {
    render(
    <MemoryRouter>
      <AdmissionsWorkspace />
    </MemoryRouter>,
  );
    // The required marker is a "*" inside the label, so read the name alone.
    const labels = Array.from(document.querySelectorAll("label"))
      .map((el) => el.textContent?.replace("*", "").trim())
      .filter((text) => ["State", "District", "Block", "City", "Street address"].includes(text || ""));
    expect(labels).toEqual(["Street address", "State", "District", "Block", "City"]);
  });

  it("will not take a district until a state is chosen, nor a block or city until a district is", () => {
    render(
    <MemoryRouter>
      <AdmissionsWorkspace />
    </MemoryRouter>,
  );
    expect(screen.getByText("Select a state first")).toBeInTheDocument();
    // Block and City both wait on the district.
    expect(screen.getAllByText("Select a district first")).toHaveLength(2);
  });

  it("narrows the district list to the state, and the city list to the district", () => {
    // A draft already on Bihar / Patna: the two lists below it are that
    // state's districts and that district's towns, not every name in India.
    localStorage.setItem(
      "admission-draft",
      JSON.stringify({ state: "Bihar", district: "Patna" }),
    );
    render(
    <MemoryRouter>
      <AdmissionsWorkspace />
    </MemoryRouter>,
  );

    // Both triggers are taken before either list opens: Radix hides the rest
    // of the page from the accessibility tree while one is open.
    const districts = control("District");
    const cities = control("City");

    openList(districts);
    expect(screen.getByText("Nalanda")).toBeInTheDocument();
    expect(screen.queryByText("Lucknow")).toBeNull();
    fireEvent.keyDown(districts, { key: "Escape" });

    openList(cities);
    expect(screen.getByText("Danapur")).toBeInTheDocument();
  });

  it("clears the district and city when the state changes under them", () => {
    localStorage.setItem(
      "admission-draft",
      JSON.stringify({ state: "Bihar", district: "Patna", city: "Danapur" }),
    );
    render(
    <MemoryRouter>
      <AdmissionsWorkspace />
    </MemoryRouter>,
  );
    expect(screen.getByText("Danapur")).toBeInTheDocument();

    openList(control("State"));
    fireEvent.click(screen.getByText("Kerala"));

    // Patna is not in Kerala, and Danapur is not in Patna any more.
    expect(screen.queryByText("Patna")).toBeNull();
    expect(screen.queryByText("Danapur")).toBeNull();
    expect(screen.getAllByText("Select a district first")).toHaveLength(2);
  });
});
