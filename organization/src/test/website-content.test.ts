import { readFileSync } from "node:fs";
import path from "node:path";
import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/supabase/client", () => ({ supabase: {} }));

const { mergeEdits, isLayoutKey } = await import("@/lib/supabase/websiteContent");

const CMS = readFileSync(path.resolve(__dirname, "../../website/public/cms.js"), "utf8");

type Cms = {
  keyOf: (el: Element) => string | null;
  find: (key: string) => Element | null;
  clean: (html: string) => string;
  applyAll: (content: unknown) => void;
  outline: () => { key: string; name: string; shared: boolean; fields: { key: string; label: string; text: string; rich: boolean; kind: string; href: string | null }[] }[];
};

/** Loads website/public/cms.js into the current document, as a page would. */
function loadCms(): Cms {
  new Function(CMS)();
  return (window as unknown as { __cms: Cms }).__cms;
}

describe("mergeEdits", () => {
  const saved = {
    page: { edits: { "body:1.0": { tag: "h1", html: "Old" } } },
    layout: { edits: { "footer:0.2": { tag: "p", html: "Footer" } } },
  };

  it("sends header and footer edits to the shared layout", () => {
    const merged = mergeEdits(saved, { "header:0.1": { tag: "a", html: "Home" }, "body:2": { tag: "p", html: "Hi" } });
    expect(Object.keys(merged.layout.edits)).toEqual(["footer:0.2", "header:0.1"]);
    expect(Object.keys(merged.page.edits)).toEqual(["body:1.0", "body:2"]);
  });

  it("layers a new change over the saved one for the same element", () => {
    const merged = mergeEdits(saved, { "body:1.0": { hidden: true } });
    expect(merged.page.edits["body:1.0"]).toEqual({ tag: "h1", html: "Old", hidden: true });
  });

  it("drops an edit set to null, putting the element back to the file's", () => {
    const merged = mergeEdits(saved, { "body:1.0": null, "footer:0.2": null });
    expect(merged.page.edits).toEqual({});
    expect(merged.layout.edits).toEqual({});
  });

  it("leaves what was saved untouched", () => {
    mergeEdits(saved, { "body:1.0": null });
    expect(saved.page.edits["body:1.0"]).toBeDefined();
  });

  it("knows a layout key", () => {
    expect(isLayoutKey("header:1")).toBe(true);
    expect(isLayoutKey("body:1")).toBe(false);
  });
});

describe("website/public/cms.js", () => {
  let cms: Cms;

  beforeEach(() => {
    localStorage.clear();
    document.body.innerHTML = `
      <header id="siteHeader" data-cms-scope="header"><nav><a href="/">Home</a><a href="tel:+919876543210">Call 98765 43210</a></nav></header>
      <section><h1>Welcome</h1><img src="a.png"><p>Intro</p></section>
      <footer data-cms-scope="footer"><p>© PNS</p><a href="mailto:info@pnsacademy.in">info@pnsacademy.in</a><a href="https://wa.me/919999999999?text=Hi">WA</a></footer>`;
    cms = loadCms();
  });

  it("keys an element by its place under the nearest scope", () => {
    expect(cms.keyOf(document.querySelector("h1")!)).toBe("body:1.0");
    expect(cms.keyOf(document.querySelector("nav a")!)).toBe("header:0.0");
    expect(cms.keyOf(document.querySelector("footer p")!)).toBe("footer:0");
  });

  it("finds the element a key names", () => {
    expect(cms.find("body:1.1")?.tagName).toBe("IMG");
    expect(cms.find("footer:1")?.tagName).toBe("A");
  });

  it("does not count its own elements, so an announcement shifts no key", () => {
    cms.applyAll({ settings: { announcement: { enabled: true, text: "Admissions open" } } });
    expect(document.getElementById("cms-announcement")?.textContent).toBe("Admissions open");
    expect(cms.keyOf(document.querySelector("h1")!)).toBe("body:1.0");
  });

  it("applies text, image, link and hidden edits", () => {
    cms.applyAll({
      page: { title: "New title", edits: {
        "body:1.0": { tag: "h1", html: "Hello <b>there</b>" },
        "body:1.1": { tag: "img", src: "https://cdn.example/b.png" },
        "body:1.2": { tag: "p", hidden: true },
      } },
      layout: { edits: { "header:0.0": { tag: "a", href: "/about.html" } } },
    });
    expect(document.querySelector("h1")!.innerHTML).toBe("Hello <b>there</b>");
    expect(document.querySelector("img")!.getAttribute("src")).toBe("https://cdn.example/b.png");
    expect((document.querySelector("section p") as HTMLElement).style.display).toBe("none");
    expect(document.querySelector("nav a")!.getAttribute("href")).toBe("/about.html");
    expect(document.title).toBe("New title");
  });

  it("skips an edit whose element is no longer the same kind", () => {
    cms.applyAll({ page: { edits: { "body:1.0": { tag: "p", html: "Wrong place" } } } });
    expect(document.querySelector("h1")!.textContent).toBe("Welcome");
  });

  it("strips scripts, handlers and javascript: links from saved HTML", () => {
    const out = cms.clean('<b onclick="x()">Hi</b><script>alert(1)</script><a href="javascript:alert(1)">x</a>');
    expect(out).toBe("<b>Hi</b><a>x</a>");
  });

  it("swaps the phone, WhatsApp and email on every link", () => {
    cms.applyAll({ settings: { phone: "8084510393", whatsapp: "7519884465", email: "hello@careeroptics.in" } });
    const tel = document.querySelector('a[href^="tel:"]')!;
    expect(tel.getAttribute("href")).toBe("tel:+918084510393");
    expect(tel.textContent).toBe("Call 8084510393");
    expect(document.querySelector('a[href*="wa.me"]')!.getAttribute("href")).toBe("https://wa.me/917519884465?text=Hi");
    const mail = document.querySelector('a[href^="mailto:"]')!;
    expect(mail.getAttribute("href")).toBe("mailto:hello@careeroptics.in");
    expect(mail.textContent).toBe("hello@careeroptics.in");
  });

  // Enquiry forms build their WhatsApp link in the page's own script, after
  // the settings have loaded; they ask cms.js for the number.
  it("hands the WhatsApp number to the pages' own enquiry scripts", () => {
    const opened: string[] = [];
    const form = readFileSync(path.resolve(__dirname, "../../website/behaviour/97748b36.js"), "utf8");
    expect(form).toContain("window.siteWhatsapp()");
    cms.applyAll({ settings: { whatsapp: "7519884465" } });
    expect((window as unknown as { siteWhatsapp: () => string }).siteWhatsapp()).toBe("917519884465");
    // The same expression the scripts use, with the saved number and without.
    const pick = () => (window as unknown as { siteWhatsapp?: () => string }).siteWhatsapp?.() || "919999999999";
    opened.push(`https://wa.me/${pick()}?text=Hi`);
    expect(opened[0]).toBe("https://wa.me/917519884465?text=Hi");
  });

  it("outlines the page as header, sections and footer with their fields", () => {
    document.querySelector("section")!.insertAdjacentHTML("beforeend", '<a href="/join"><svg><path/></svg> Join now</a><p>Line one<br>line two</p>');
    const outline = cms.outline();
    expect(outline.map((s) => s.name)).toEqual(["Header & menu", "Welcome", "Footer"]);
    expect(outline[0].shared).toBe(true);
    const fields = outline[1].fields;
    expect(fields.map((f) => [f.label, f.kind])).toEqual([
      ["Main heading", "text"], ["Image", "image"], ["Paragraph", "text"], ["Link / button", "text"], ["Paragraph", "text"],
    ]);
    // An icon beside the words still leaves them editable as plain text.
    expect(fields[3]).toMatchObject({ text: "Join now", rich: false, href: "/join" });
    expect(fields[4]).toMatchObject({ rich: true });
  });
});
