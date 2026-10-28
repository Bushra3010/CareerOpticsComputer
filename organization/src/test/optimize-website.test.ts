import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { describe, it, expect, beforeAll } from "vitest";

const { optimizeWebsite } = await import("../../scripts/optimize-website.mjs");

const PAGE = `<!DOCTYPE html><html><head>
<script src="https://cdn.tailwindcss.com"></script>
<script src="https://unpkg.com/lucide@latest"></script>
<script>tailwind.config = { theme: { extend: { boxShadow: { soft: "0 1px 2px red" } } } }</script>
</head>
<body>
<header id="siteHeader" data-cms-scope="header"><img src="assets/logo.png" onerror="this.src='logo.png'" class="w-[80px]"></header>
<section><h1 class="text-3xl shadow-soft">Hi</h1><i data-lucide="home" class="w-4 h-4"></i><img src="image/a.png"><img src="https://www.idealdigiskills.com/img/logo.png"></section>
<script src="https://cdn.tailwindcss.com"></script>
<script src="js/script.js"></script>
<script>lucide.createIcons();</script>
</body></html>`;

let dir: string;
let html: string;
let report: { pages: number; stylesheets: number };

beforeAll(async () => {
  dir = fs.mkdtempSync(path.join(os.tmpdir(), "site-"));
  fs.mkdirSync(path.join(dir, "image"));
  fs.writeFileSync(path.join(dir, "image", "a.png"), "");
  fs.writeFileSync(path.join(dir, "image", "a.webp"), "");
  fs.writeFileSync(path.join(dir, "index.html"), PAGE);
  report = await optimizeWebsite(dir, { supabaseUrl: "https://db.example" });
  html = fs.readFileSync(path.join(dir, "index.html"), "utf8");
}, 30_000);

const bodyChildren = (page: string) =>
  (/<body>([\s\S]*)<\/body>/.exec(page)?.[1].match(/<(header|section|script)\b/g) ?? []).length;

describe("optimizeWebsite", () => {
  it("compiles the page's Tailwind, with its own config, instead of loading the compiler", () => {
    expect(html).not.toContain("cdn.tailwindcss.com");
    expect(html).not.toContain("tailwind.config");
    const href = /href="(\/css\/tw-[a-f0-9]+\.css)"/.exec(html)?.[1];
    expect(href).toBeDefined();
    const css = fs.readFileSync(path.join(dir, href!), "utf8");
    expect(css).toContain(".text-3xl");
    expect(css).toContain("0 1px 2px red"); // the page's own shadow-soft
    expect(css).toContain(".w-\\[80px\\]");
    expect(report.stylesheets).toBe(1);
  });

  it("draws icons at build time and loads Lucide only on demand", () => {
    expect(html).not.toContain("unpkg.com/lucide@latest");
    expect(html).not.toMatch(/<i [^>]*data-lucide/);
    expect(html).toMatch(/<svg[^>]*data-lucide="home"[^>]*class="lucide lucide-house w-4 h-4"/);
    expect(html).toContain("window.lucide={createIcons");
  });

  it("serves the small images: WebP copies and the local logo", () => {
    expect(html).toContain('src="image/a.webp"');
    expect(html).not.toContain("idealdigiskills.com/img/logo.png");
    expect(html).not.toContain("assets/logo.png");
    expect(html.match(/src="\/logo\.webp"/g)).toHaveLength(2);
  });

  it("lazy-loads images after the first two", () => {
    expect(html.match(/loading="lazy"/g)).toHaveLength(1);
  });

  it("keeps every element of <body> in place, as the content editor's keys need", () => {
    expect(bodyChildren(html)).toBe(bodyChildren(PAGE));
    expect(html).not.toContain("js/script.js");
  });

  it("does not mistake <header> for <head>", () => {
    expect(html).toMatch(/<head>\n<link rel="preconnect" href="https:\/\/db\.example" crossorigin>/);
    expect(html).toContain('<header id="siteHeader"');
  });
});
