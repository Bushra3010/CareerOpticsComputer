import { fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";

/**
 * Every document type had one fixed shape -- a certificate landscape, a
 * marksheet portrait -- with no way to turn the page. A design now carries
 * its own orientation, and the layout is carried across when it turns.
 */
vi.mock("@/components/layout/AppLayout", () => ({
  AppLayout: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));
vi.mock("@/contexts/AuthContext", () => ({
  useAuth: () => ({ user: { branchId: "b1", organizationId: "o1" }, view: "admin" }),
}));
vi.mock("@/lib/supabase/data", () => ({
  getStudents: () => Promise.resolve({ success: true, data: [] }),
  getCourses: () => Promise.resolve({ success: true, data: [] }),
}));
vi.mock("@/hooks/use-toast", () => ({ useToast: () => ({ toast: () => {} }) }));
vi.mock("qrcode", () => ({ default: { toDataURL: () => Promise.resolve("") } }));

const { canvasSize, designHtml, reorient, starterDesign, SAMPLE_DATA } = await import("@/lib/documentDesigner");
const { default: DocumentDesigner } = await import("@/pages/documents/DocumentDesigner");

describe("document orientation", () => {
  beforeEach(() => localStorage.clear());

  it("keeps each type's own shape when a design says nothing", () => {
    expect(canvasSize("certificate", starterDesign("certificate"))).toEqual({ width: 1000, height: 707 });
    expect(canvasSize("marksheet", starterDesign("marksheet"))).toEqual({ width: 800, height: 1100 });
  });

  it("turns the canvas and keeps every box inside it", () => {
    const turned = reorient("certificate", starterDesign("certificate"), "portrait");
    const size = canvasSize("certificate", turned);
    expect(size).toEqual({ width: 707, height: 1000 });
    for (const el of turned.elements) {
      expect(el.x + el.width).toBeLessThanOrEqual(size.width + 1);
      expect(el.y + el.height).toBeLessThanOrEqual(size.height + 1);
    }
    expect(designHtml("certificate", turned, SAMPLE_DATA)).toContain("width:707px;height:1000px");
  });

  it("comes back to the same layout when turned back", () => {
    const start = starterDesign("certificate");
    const back = reorient("certificate", reorient("certificate", start, "portrait"), "landscape");
    back.elements.forEach((el, i) => {
      expect(Math.abs(el.x - start.elements[i].x)).toBeLessThanOrEqual(2);
      expect(Math.abs(el.y - start.elements[i].y)).toBeLessThanOrEqual(2);
    });
  });

  it("offers Landscape and Portrait in the designer", () => {
    render(
      <MemoryRouter initialEntries={["/certificate/template"]}>
        <Routes>
          <Route path="/certificate/template" element={<DocumentDesigner />} />
        </Routes>
      </MemoryRouter>,
    );
    expect(screen.getByRole("radio", { name: "Landscape" })).toHaveAttribute("aria-checked", "true");
    expect(screen.getByText("Canvas 1000 × 707 px")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("radio", { name: "Portrait" }));
    expect(screen.getByRole("radio", { name: "Portrait" })).toHaveAttribute("aria-checked", "true");
    expect(screen.getByText("Canvas 707 × 1000 px")).toBeInTheDocument();
  });
});
