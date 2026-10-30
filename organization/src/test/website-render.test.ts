import { describe, it, expect } from "vitest";

const { pageNames, renderPage } = await import("../../website/render");

/**
 * The website is React now, rendered to static HTML. These pin down what the
 * old hand-written pages promised and the editor relies on.
 */
describe("website renderer", () => {
  it("has every page, the home page among them", () => {
    expect(pageNames.length).toBeGreaterThanOrEqual(120);
    expect(pageNames).toContain("index");
    expect(pageNames).toContain("franchise");
  });

  it("renders a whole document", () => {
    const html = renderPage("index")!;
    expect(html.startsWith("<!DOCTYPE html><html")).toBe(true);
    expect(html).toContain('<script src="/cms.js" defer=""></script>');
  });

  it("keeps the shared header and footer the content editor edits", () => {
    const html = renderPage("about")!;
    expect(html).toContain('data-cms-scope="header"');
    expect(html).toContain('data-cms-scope="footer"');
  });

  it("puts inline handlers back as the browser expects them", () => {
    const html = renderPage("python")!;
    expect(html).toMatch(/ onclick="/);
    expect(html).not.toContain("data-inline-on");
  });

  it("runs the pages' own scripts unchanged", () => {
    expect(renderPage("index")).toContain("lucide.createIcons()");
  });

  it("has no page for an unknown address", () => {
    expect(renderPage("no-such-page")).toBeNull();
  });
});
