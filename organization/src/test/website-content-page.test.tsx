import { render, screen, fireEvent, waitFor, act } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { MemoryRouter } from "react-router-dom";

const toast = vi.fn();
vi.mock("@/hooks/use-toast", () => ({ useToast: () => ({ toast }) }));
vi.mock("@/components/layout/AppLayout", () => ({
  AppLayout: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));
vi.mock("@/contexts/AuthContext", () => ({
  useAuth: () => ({ user: { id: "u1", role: "ORGANIZATION_ADMIN" }, view: "admin" }),
}));

const savePageContent = vi.fn();
const saveWebsiteSettings = vi.fn();
vi.mock("@/lib/supabase/websiteContent", async (original) => ({
  ...(await original<typeof import("@/lib/supabase/websiteContent")>()),
  getWebsitePages: () => Promise.resolve([{ name: "index", heading: "" }, { name: "about", heading: "About us" }]),
  getPageContent: () => Promise.resolve({ page: { edits: {} }, layout: { edits: { "footer:0": { tag: "p", html: "Saved" } } } }),
  getWebsiteSettings: () => Promise.resolve({ phone: "8084510393", whatsapp: "", email: "", announcement: { enabled: false, text: "", link: "" } }),
  savePageContent: (...args: unknown[]) => { savePageContent(...args); return Promise.resolve({ page: { edits: {} }, layout: { edits: {} } }); },
  saveWebsiteSettings: (...args: unknown[]) => { saveWebsiteSettings(...args); return Promise.resolve(); },
  uploadWebsiteImage: () => Promise.resolve("https://cdn.example/new.png"),
}));

const WebsiteContent = (await import("@/pages/website/WebsiteContent")).default;

const renderPage = () => render(<MemoryRouter><WebsiteContent /></MemoryRouter>);

/** A message as website/public/cms.js sends it from the frame. */
function fromFrame(data: Record<string, unknown>) {
  const frame = document.querySelector("iframe")!;
  act(() => {
    window.dispatchEvent(new MessageEvent("message", {
      data: { source: "cms-page", page: "index", ...data },
      origin: window.location.origin,
      source: frame.contentWindow,
    }));
  });
}

beforeEach(() => {
  toast.mockReset();
  savePageContent.mockReset();
  saveWebsiteSettings.mockReset();
});

const OUTLINE = [
  { key: "header:", tag: "header", name: "Header & menu", shared: true, hidden: false, fields: [
    { key: "header:0.1", tag: "a", kind: "text", label: "Link / button", text: "Home", rich: false, src: null, href: "index.html", hidden: false },
  ] },
  { key: "body:1", tag: "section", name: "We Develop Your Skills", shared: false, hidden: false, fields: [
    { key: "body:1.0", tag: "h1", kind: "text", label: "Main heading", text: "Welcome", rich: false, src: null, href: null, hidden: false },
    { key: "body:1.1", tag: "img", kind: "image", label: "Image", text: "", rich: false, src: "a.png", href: null, hidden: false },
    { key: "body:1.2", tag: "p", kind: "text", label: "Paragraph", text: "Learn with us", rich: true, src: null, href: null, hidden: false },
  ] },
];

const ready = () => fromFrame({ type: "ready", outline: OUTLINE });

describe("Website Content", () => {
  it("opens the home page in edit mode and lists its sections", async () => {
    renderPage();
    expect(document.querySelector("iframe")!.getAttribute("src")).toBe("/index.html?cms-edit=1");
    expect(screen.getByText(/Reading the page/)).toBeInTheDocument();
    ready();
    expect(screen.getByText("Header & menu")).toBeInTheDocument();
    expect(screen.getByText("We Develop Your Skills")).toBeInTheDocument();
    expect(screen.getByText("All pages")).toBeInTheDocument();
  });

  it("opens a section to show its fields, and saves what is typed there", async () => {
    renderPage();
    ready();
    fireEvent.click(screen.getByText("We Develop Your Skills"));
    const heading = screen.getByLabelText("Main heading");
    expect(heading).toHaveValue("Welcome");

    fireEvent.change(heading, { target: { value: "Admissions open" } });
    // The frame swaps the words and answers with the element's HTML.
    fromFrame({ type: "change", key: "body:1.0", tag: "h1", patch: { html: "Admissions open" }, text: "Admissions open" });

    fireEvent.click(screen.getByRole("button", { name: "Save (1)" }));
    await waitFor(() => expect(savePageContent).toHaveBeenCalled());
    const [page, , pending] = savePageContent.mock.calls[0];
    expect(page).toBe("index");
    expect(pending).toEqual({ "body:1.0": { tag: "h1", html: "Admissions open" } });
  });

  it("opens the right section when something is clicked on the page", () => {
    renderPage();
    ready();
    fromFrame({ type: "select", key: "header:0.1", tag: "a", kind: "text", text: "Home", src: null, href: "index.html", hidden: false });
    expect(screen.getByLabelText("Link goes to")).toHaveValue("index.html");
  });

  it("sends rich text to the page to be edited there", () => {
    renderPage();
    ready();
    fireEvent.click(screen.getByText("We Develop Your Skills"));
    expect(screen.getByText("Learn with us")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Edit on page/ })).toBeInTheDocument();
  });

  it("hides a whole section", () => {
    renderPage();
    ready();
    fireEvent.click(screen.getByText("We Develop Your Skills"));
    fireEvent.click(screen.getByRole("switch", { name: "Show We Develop Your Skills" }));
    expect(screen.getByText("Hidden")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Save (1)" })).toBeEnabled();
  });

  it("ignores messages that do not come from its own frame", () => {
    renderPage();
    act(() => {
      window.dispatchEvent(new MessageEvent("message", {
        data: { source: "cms-page", type: "change", key: "body:0", tag: "p", patch: { html: "x" } },
        origin: "https://evil.example",
      }));
    });
    expect(screen.getByRole("button", { name: "Save" })).toBeDisabled();
  });
});
