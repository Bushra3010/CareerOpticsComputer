import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { MemoryRouter } from "react-router-dom";

/**
 * Every dashboard opens like the DriveWay app's home: a greeting, a blue hero
 * card with the figures that matter, and the modules as app tiles.
 */
vi.mock("@/contexts/AuthContext", () => ({
  useAuth: () => ({ user: { id: "u1", name: "Alok Kumar", role: "ORGANIZATION_ADMIN" }, view: "admin", allowedPaths: [] }),
}));

const { AppGreeting, HeroCard, ServicesGrid } = await import("@/components/home/AppHome");

describe("app home", () => {
  it("greets by first name", () => {
    render(<AppGreeting name="Alok" title="What needs you today?" />);
    expect(screen.getByText(/, Alok 👋/)).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "What needs you today?" })).toBeInTheDocument();
  });

  it("puts the figures and actions on the hero card", () => {
    render(
      <MemoryRouter>
        <HeroCard
          badge="This month"
          headline="₹2.4L collected"
          accent="₹40K still due"
          figures={[{ value: 120, label: "Students", to: "/student/view" }]}
          primary={{ label: "Collect fee", to: "/fee/collection" }}
        />
      </MemoryRouter>,
    );
    expect(screen.getByText("₹40K still due")).toBeInTheDocument();
    expect(screen.getByText("Students").closest("a")).toHaveAttribute("href", "/student/view");
    expect(screen.getByRole("link", { name: /Collect fee/ })).toHaveAttribute("href", "/fee/collection");
  });

  it("offers every module this login can open as a tile", () => {
    render(<MemoryRouter><ServicesGrid /></MemoryRouter>);
    expect(screen.getByText("Our Services")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Reception" })).toHaveAttribute("href", "/reception/enquiry");
    expect(screen.getByRole("link", { name: "Certificates" })).toBeInTheDocument();
  });
});
