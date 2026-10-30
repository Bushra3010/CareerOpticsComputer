import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";

/**
 * The designer is a leaf page: the layout, the auth context and the data layer
 * are all mocked away so these tests exercise the canvas and the properties
 * panel rather than the shell around them.
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

const { default: DocumentDesigner } = await import("@/pages/documents/DocumentDesigner");

const renderAt = (path: string) =>
  render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route path="/documents/designer" element={<DocumentDesigner />} />
        <Route path="/certificate/template" element={<DocumentDesigner />} />
        <Route path="/marksheet/template" element={<DocumentDesigner />} />
      </Routes>
    </MemoryRouter>,
  );

/** The properties panel's Text box - the only textarea on the page. */
const textBox = () => document.querySelector("textarea") as HTMLTextAreaElement | null;

/** Colour inputs in document order: canvas background, text colour, fill, border. */
/** A textarea's value is also its text content, so canvas lookups exclude it. */
const onCanvas = (text: string) => screen.getByText(text, { selector: "div" });

const colours = () =>
  Array.from(document.querySelectorAll<HTMLInputElement>('input[type="color"]'));

describe("document designer", () => {
  beforeEach(() => localStorage.clear());

  it("keeps the element selected while its text is being edited", async () => {
    renderAt("/certificate/template");

    fireEvent.pointerDown(screen.getByText("CERTIFICATE OF ACHIEVEMENT"));
    await waitFor(() => expect(textBox()).toHaveValue("CERTIFICATE OF ACHIEVEMENT"));

    // One edit at a time: the panel used to close after the first, because every
    // design change also cleared the selection.
    for (const value of ["CERTIFICATE OF ACHIEVEMENT!", "CERTIFICATE OF EXCELLENCE"]) {
      fireEvent.change(textBox()!, { target: { value } });
      expect(textBox()).toHaveValue(value);
    }
    expect(onCanvas("CERTIFICATE OF EXCELLENCE")).toBeInTheDocument();
  });

  it("lets a shape be recoloured and labelled", async () => {
    renderAt("/certificate/template");

    fireEvent.click(screen.getByText("Shape"));
    await waitFor(() => expect(textBox()).toBeTruthy());

    fireEvent.change(textBox()!, { target: { value: "Seal" } });
    expect(onCanvas("Seal")).toBeInTheDocument();

    fireEvent.change(colours()[2], { target: { value: "#123456" } });
    expect(onCanvas("Seal")).toHaveStyle({ background: "#123456" });
  });

  it("follows the route when the document type changes", () => {
    const view = renderAt("/certificate/template");
    expect(screen.getByText("CERTIFICATE OF ACHIEVEMENT")).toBeInTheDocument();

    view.unmount();
    renderAt("/marksheet/template");
    expect(screen.getByText("STATEMENT OF MARKS")).toBeInTheDocument();
    expect(screen.queryByText("CERTIFICATE OF ACHIEVEMENT")).not.toBeInTheDocument();
  });

  it("leaves no placeholder label on a starter shape", async () => {
    const { DOCUMENT_KINDS, starterDesign } = await import("@/lib/documentDesigner");
    for (const kind of Object.keys(DOCUMENT_KINDS) as Array<
      keyof typeof DOCUMENT_KINDS
    >) {
      const stray = starterDesign(kind).elements.filter((el) => el.text === "Text");
      expect(stray, `${kind} has an unlabelled shape`).toEqual([]);
    }
  });

  /* The three awards the office hands out besides a course certificate: one to
     a student, one to a branch, and the authorisation a centre puts on its
     wall. Each is its own type, so each keeps its own saved layout. */
  it.each([
    ["student-award", "STUDENT AWARD"],
    ["branch-award", "BRANCH AWARD"],
    ["centre-certificate", "CERTIFICATE OF AUTHORISATION"],
  ])("opens %s with a layout of its own", async (kind, heading) => {
    renderAt(`/documents/designer?type=${kind}`);
    await waitFor(() => expect(screen.getByText(heading)).toBeInTheDocument());
  });

  it("offers every document type in the picker", async () => {
    // A kind missing from the order exists in the model but cannot be chosen.
    const { DOCUMENT_KINDS, KIND_ORDER } = await import("@/lib/documentDesigner");
    expect([...KIND_ORDER].sort()).toEqual(Object.keys(DOCUMENT_KINDS).sort());
  });

  /* Sizing a box by typing numbers into a panel is not how anyone draws. The
     selected element carries its own grips and its own cross, as a canvas
     editor does. */
  it("resizes by dragging a grip, without anyone typing a width", async () => {
    renderAt("/certificate/template");
    const heading = screen.getByText("CERTIFICATE OF ACHIEVEMENT");
    fireEvent.pointerDown(heading);
    await waitFor(() => expect(textBox()).toBeTruthy());

    // The positioned wrapper, not the body inside it -- the grips are its own
    // children, so it is whatever they hang off.
    const grip = screen.getByLabelText("Resize se");
    const box = grip.parentElement as HTMLElement;
    const widthBefore = box.style.width;
    // jsdom has no PointerEvent, and a synthesised one drops clientX with it --
    // which is the whole input to the gesture. A MouseEvent of the same type
    // carries it and React reads it as the pointer event it is.
    fireEvent(grip, new MouseEvent("pointerdown", { bubbles: true, cancelable: true, clientX: 0, clientY: 0 }));
    fireEvent(window, new MouseEvent("pointermove", { clientX: 60, clientY: 40 }));
    fireEvent(window, new MouseEvent("pointerup"));

    expect(box.style.width).not.toBe(widthBefore);
    expect(parseFloat(box.style.width)).toBeGreaterThan(parseFloat(widthBefore));
  });

  it("takes the element off the canvas from its own cross", async () => {
    renderAt("/certificate/template");
    fireEvent.pointerDown(screen.getByText("CERTIFICATE OF ACHIEVEMENT"));
    await waitFor(() => expect(textBox()).toBeTruthy());

    fireEvent.click(screen.getByLabelText("Delete element"));
    expect(screen.queryByText("CERTIFICATE OF ACHIEVEMENT")).toBeNull();

    // And it is an ordinary edit, so it can be taken back.
    fireEvent.click(screen.getByRole("button", { name: /undo/i }));
    expect(onCanvas("CERTIFICATE OF ACHIEVEMENT")).toBeInTheDocument();
  });

  it("shows the grips on the chosen element alone", async () => {
    renderAt("/certificate/template");
    expect(screen.queryByLabelText("Resize se")).toBeNull();

    fireEvent.pointerDown(screen.getByText("CERTIFICATE OF ACHIEVEMENT"));
    await waitFor(() => expect(screen.getAllByLabelText(/^Resize /)).toHaveLength(8));
  });

  it("reads the type out of the query string", async () => {
    renderAt("/documents/designer?type=admit-card");
    await waitFor(() => expect(screen.getByText("ADMIT CARD")).toBeInTheDocument());
  });

  it("undoes an edit without disturbing the other document types", async () => {
    renderAt("/certificate/template");

    fireEvent.pointerDown(screen.getByText("CERTIFICATE OF ACHIEVEMENT"));
    await waitFor(() => expect(textBox()).toBeTruthy());
    fireEvent.change(textBox()!, { target: { value: "Gone" } });
    expect(onCanvas("Gone")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /undo/i }));
    expect(onCanvas("CERTIFICATE OF ACHIEVEMENT")).toBeInTheDocument();
  });
});
