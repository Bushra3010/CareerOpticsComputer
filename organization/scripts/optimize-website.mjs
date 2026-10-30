/**
 * Makes the built website fast, without touching its source in website/.
 *
 * The pages were written for the browser to finish building them: every
 * visit downloaded Tailwind's in-browser compiler (~400 KB of JS that then
 * compiles the page's CSS on the visitor's CPU before anything shows) and
 * Lucide's full icon set (~450 KB, unversioned) to swap <i data-lucide> for
 * icons, and course images were 1–2.5 MB each. All of that is done once here,
 * at build time, on the copy in dist/:
 *
 *  - Tailwind: each page's CSS is compiled with that page's own
 *    `tailwind.config` (pages set their own shadows, colours and fonts) into
 *    a small, content-hashed file in /css/.
 *  - Icons: <i data-lucide="…"> becomes the inline SVG Lucide would have made.
 *    Lucide itself loads only if a page still has an icon to draw.
 *  - Images: references move to the WebP copies in image/ (made by
 *    `cwebp`, ~20× smaller); the 1254 px logo to a 256 px one; the logo
 *    fetched from another site to our own copy. Below-the-fold images load
 *    lazily.
 *
 * Elements are replaced in place, never removed from <body>: the Website
 * Content editor keys its edits by element position, so the structure the
 * editor saw must be the structure visitors get.
 */
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);

const TAILWIND_CDN = /<script\s+src="https:\/\/cdn\.tailwindcss\.com[^"]*"\s*>\s*<\/script>/g;
const TAILWIND_CONFIG = /<script>\s*(tailwind\.config\s*=\s*(\{[\s\S]*?\}))\s*;?\s*<\/script>/g;
const LUCIDE_CDN = /<script\s+src="https:\/\/unpkg\.com\/lucide@latest"\s*>\s*<\/script>/g;
const LUCIDE_VERSION = "0.462.0";

// Lucide on demand: pages call lucide.createIcons() from their own scripts.
// The icons are already drawn, so the library is fetched only if one is left
// (a name Lucide no longer ships, or an icon a script adds later).
const LUCIDE_STUB = `<script>window.lucide={createIcons:function(){if(!document.querySelector("i[data-lucide]")||window.__lucideLoading)return;window.__lucideLoading=1;var s=document.createElement("script");s.src="https://unpkg.com/lucide@${LUCIDE_VERSION}/dist/umd/lucide.min.js";s.onload=function(){window.lucide.createIcons()};document.head.appendChild(s)}};</script>`;

const pascal = (name) => name.replace(/(^|-)([a-z0-9])/g, (_, __, c) => c.toUpperCase());

function iconRenderer() {
  const React = require("react");
  const { renderToStaticMarkup } = require("react-dom/server");
  // The module's own exports carry Lucide's old names too (code-2, home,
  // check-circle-2 …), which its `icons` map, current names only, does not.
  const lucide = require("lucide-react");
  const cache = new Map();
  return (name, className) => {
    const Icon = lucide.icons[pascal(name)] ?? lucide[pascal(name)];
    if (!Icon) return null;
    const key = `${name}|${className}`;
    if (!cache.has(key)) cache.set(key, renderToStaticMarkup(React.createElement(Icon, { className: className || undefined })));
    return cache.get(key);
  };
}

/** <i data-lucide="x" class="…" …></i> → the SVG, keeping the <i>'s other attributes. */
function inlineIcons(html, render) {
  let drawn = 0;
  const out = html.replace(/<i\b([^>]*\bdata-lucide="([^"]+)"[^>]*)>\s*<\/i>/g, (whole, attrs, name) => {
    const cls = /\bclass="([^"]*)"/.exec(attrs)?.[1] ?? "";
    const svg = render(name, cls);
    if (!svg) return whole;
    drawn++;
    const rest = attrs.replace(/\s*\bclass="[^"]*"/, "").trim();
    return rest ? svg.replace("<svg", `<svg ${rest}`) : svg;
  });
  return { html: out, drawn };
}

async function compileTailwind(config, htmlFiles) {
  const postcss = require("postcss");
  const tailwindcss = require("tailwindcss");
  const result = await postcss([
    tailwindcss({ ...config, content: htmlFiles.map((raw) => ({ raw, extension: "html" })) }),
  ]).process("@tailwind base;@tailwind components;@tailwind utilities;", { from: undefined });
  try {
    const { transform } = await import("esbuild");
    return (await transform(result.css, { loader: "css", minify: true })).code;
  } catch {
    return result.css; // unminified still beats compiling in the browser
  }
}

function useWebp(html, dir) {
  // Course images: the WebP copy beside each one, when there is one.
  html = html.replace(/(["'(])((?:\/)?image\/[^"')]+?)\.(png|jpe?g)(?=["')])/gi, (whole, q, base, ext) =>
    fs.existsSync(path.join(dir, `${base.replace(/^\//, "")}.webp`)) ? `${q}${base}.webp` : whole,
  );
  // The header logo tried a missing assets/logo.png before falling back.
  html = html.replace(/src="assets\/logo\.png"\s+onerror="this\.src='logo\.png'"/g, 'src="/logo.webp"');
  html = html.replace(/src="\/?logo\.png"/g, 'src="/logo.webp"');
  // The same logo, fetched from another site on every page view.
  html = html.replace(/https:\/\/www\.idealdigiskills\.com\/img\/logo\.png/g, "/logo.webp");
  // The home page's hero picture, likewise; a copy is kept in image/.
  html = html.replace(/https:\/\/www\.idealdigiskills\.com\/img\/coders\.png/g, "/image/coders.webp");
  return html;
}

/** Lazy-load every image after the first two (the logo and the hero). */
function lazyImages(html) {
  let seen = 0;
  return html.replace(/<img\b(?![^>]*\bloading=)/g, (tag) => (++seen <= 2 ? tag : `${tag} loading="lazy" decoding="async"`));
}

export async function optimizeWebsite(dir, { supabaseUrl } = {}) {
  const pages = fs.readdirSync(dir).filter((f) => f.endsWith(".html") && f !== "404.html");
  const render = iconRenderer();
  const groups = new Map(); // config JSON → { config, files: [{ file, html }] }
  let icons = 0;
  let kept = 0;

  for (const file of pages) {
    let html = fs.readFileSync(path.join(dir, file), "utf8");

    // The page's Tailwind config: the last one set wins, as it did in the browser.
    let config = {};
    for (const m of html.matchAll(TAILWIND_CONFIG)) {
      try {
        config = new Function(`return (${m[2]})`)();
      } catch {
        config = null;
        break;
      }
    }
    const usesTailwind = TAILWIND_CDN.test(html);
    TAILWIND_CDN.lastIndex = 0;
    if (usesTailwind && config) {
      // Empty <script></script> rather than nothing: see the note on positions above.
      html = html.replace(TAILWIND_CDN, "<script></script>").replace(TAILWIND_CONFIG, "<script></script>");
      if (/tailwind\.config/.test(html)) {
        kept++; // a config written some other way: leave this page as it was
        html = fs.readFileSync(path.join(dir, file), "utf8");
      } else {
        const key = JSON.stringify(config);
        if (!groups.has(key)) groups.set(key, { config, files: [] });
        groups.get(key).files.push({ file, html: null });
      }
    }

    html = html.replace(LUCIDE_CDN, LUCIDE_STUB);
    const inlined = inlineIcons(html, render);
    html = inlined.html;
    icons += inlined.drawn;
    html = useWebp(html, dir);
    html = lazyImages(html);
    html = html.replace(/<script\s+src="js\/script\.js"\s*>\s*<\/script>/g, "<script></script>"); // 404s
    if (supabaseUrl) {
      // `<head` alone would also match `<header`.
      html = html.replace(/<head(\s[^>]*)?>/i, (tag) => `${tag}\n<link rel="preconnect" href="${supabaseUrl}" crossorigin>`);
    }

    const entry = [...groups.values()].flatMap((g) => g.files).find((f) => f.file === file);
    if (entry) entry.html = html;
    else fs.writeFileSync(path.join(dir, file), html);
  }

  fs.mkdirSync(path.join(dir, "css"), { recursive: true });
  for (const { config, files } of groups.values()) {
    const css = await compileTailwind(config, files.map((f) => f.html));
    const name = `tw-${crypto.createHash("sha256").update(css).digest("hex").slice(0, 10)}.css`;
    fs.writeFileSync(path.join(dir, "css", name), css);
    for (const f of files) {
      // Where the in-browser compiler put its <style>: the end of <head>.
      const html = f.html.replace(/<\/head>/i, `<link rel="stylesheet" href="/css/${name}">\n</head>`);
      fs.writeFileSync(path.join(dir, f.file), html);
    }
  }

  return { pages: pages.length, stylesheets: groups.size, icons, keptTailwindCdn: kept };
}
