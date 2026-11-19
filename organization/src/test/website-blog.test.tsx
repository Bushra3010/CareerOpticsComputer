import fs from "node:fs";
import path from "node:path";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";

/**
 * The blog the head office writes in the ERP: the body's few marks, the
 * website's own copy of that parser, and the admin page saving a post.
 */

const m = vi.hoisted(() => ({ toast: vi.fn(), rows: [] as Array<Record<string, unknown>>, sent: [] as Array<{ op: string; row?: unknown; id?: unknown }> }));

vi.mock("@/hooks/use-toast", () => ({ useToast: () => ({ toast: m.toast }) }));
vi.mock("@/components/layout/AppLayout", () => ({ AppLayout: ({ children }: { children: React.ReactNode }) => <div>{children}</div> }));
vi.mock("@/contexts/AuthContext", () => ({ useAuth: () => ({ user: { id: "u1", organizationId: "org1", role: "ORGANIZATION_ADMIN" } }) }));
vi.mock("@/lib/supabase/gallery", () => ({ uploadWebsiteImage: vi.fn() }));
vi.mock("@/lib/supabase/client", () => {
  const from = () => {
    const b: Record<string, unknown> = {};
    const chain = () => b;
    Object.assign(b, {
      select: chain, order: chain, eq: (_c: string, v: unknown) => { m.sent.push({ op: "eq", id: v }); return b; },
      insert: (row: unknown) => { m.sent.push({ op: "insert", row }); return Promise.resolve({ error: null }); },
      update: (row: unknown) => { m.sent.push({ op: "update", row }); return { eq: () => Promise.resolve({ error: null }) }; },
      delete: () => ({ eq: (_c: string, id: unknown) => { m.sent.push({ op: "delete", id }); return Promise.resolve({ error: null }); } }),
      then: (resolve: (v: unknown) => unknown) => resolve({ data: m.rows, error: null }),
    });
    return b;
  };
  return { supabase: { from } };
});

const { parseBlogBody, blogSlug } = await import("@/lib/supabase/blog");
const { default: WebsiteBlog } = await import("@/pages/website/WebsiteBlog");

const BODY = "Intro line one\nline two\n\n## Why it matters\n- first\n- second\n\n1. step one\n2. step two\n\nThe end.";

beforeEach(() => {
  m.toast.mockReset();
  m.rows = [];
  m.sent = [];
});

describe("The blog body", () => {
  it("reads paragraphs, headings, bullets and numbered steps", () => {
    expect(parseBlogBody(BODY)).toEqual([
      { type: "p", text: "Intro line one line two" },
      { type: "h2", text: "Why it matters" },
      { type: "ul", items: ["first", "second"] },
      { type: "ol", items: ["step one", "step two"] },
      { type: "p", text: "The end." },
    ]);
  });

  it("is read the same way by the website's own script", () => {
    const source = fs.readFileSync(path.join(process.cwd(), "website/behaviour/blog.js"), "utf8");
    new Function(source)();
    const site = (window as unknown as { __blog: { parseBody: (b: string) => unknown } }).__blog;
    expect(site.parseBody(BODY)).toEqual(parseBlogBody(BODY));
  });

  it("makes a clean link from a title", () => {
    expect(blogSlug("DCA vs ADCA: Which one? (2026)")).toBe("dca-vs-adca-which-one-2026");
  });
});

describe("Website -> Blog", () => {
  it("publishes a new post with a link made from its title", async () => {
    render(<WebsiteBlog />);
    fireEvent.click(await screen.findByRole("button", { name: /New Post/i }));
    fireEvent.change(screen.getByPlaceholderText(/government job/i), { target: { value: "Typing Tips for Exams" } });
    fireEvent.change(screen.getByPlaceholderText(/Write the post here/i), { target: { value: BODY } });
    fireEvent.click(screen.getByRole("button", { name: /Save post/i }));
    await waitFor(() => expect(m.sent.some((s) => s.op === "insert")).toBe(true));
    const row = m.sent.find((s) => s.op === "insert")!.row as Record<string, unknown>;
    expect(row).toMatchObject({ slug: "typing-tips-for-exams", title: "Typing Tips for Exams", organizationId: "org1", isPublished: true });
  });

  it("refuses to save a post with no text", async () => {
    render(<WebsiteBlog />);
    fireEvent.click(await screen.findByRole("button", { name: /New Post/i }));
    fireEvent.change(screen.getByPlaceholderText(/government job/i), { target: { value: "Empty" } });
    fireEvent.click(screen.getByRole("button", { name: /Save post/i }));
    await waitFor(() => expect(m.toast).toHaveBeenCalledWith(expect.objectContaining({ description: "Write the post before saving.", variant: "destructive" })));
    expect(m.sent.some((s) => s.op === "insert")).toBe(false);
  });

  it("deletes a post after asking", async () => {
    m.rows = [{ id: "p1", slug: "old", title: "Old Post", body: "x", publishedOn: "2026-11-01", isPublished: true }];
    const confirm = vi.spyOn(window, "confirm").mockReturnValue(true);
    render(<WebsiteBlog />);
    fireEvent.click(await screen.findByRole("button", { name: "Delete post Old Post" }));
    await waitFor(() => expect(m.sent).toContainEqual({ op: "delete", id: "p1" }));
    confirm.mockRestore();
  });
});
