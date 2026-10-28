#!/usr/bin/env node
/**
 * One-time migration: the website's HTML pages → React (TSX) components.
 *
 * Each page is read the way a browser reads it (jsdom), so what is written is
 * the document visitors actually got -- including the places where the old
 * PHP includes produced a second <html> or put a <style> after </head>. The
 * output keeps every element and every attribute, in the same order: the
 * Website Content editor keys its saved edits by element position, and those
 * keys must still find the same elements.
 *
 *   website/pages/<name>.tsx        one component per page
 *   website/components/<Name>.tsx   blocks repeated across pages (header,
 *                                   footer, WhatsApp widget …), written once
 *   website/behaviour/*.js          the pages' inline scripts, unchanged
 *   website/styles/*.css            the pages' inline <style> blocks
 *
 * Inline handlers (onclick="…") cannot be React props on a static page, so
 * they are written as data-inline-onclick and turned back into onclick when
 * the page is rendered (website/render.tsx).
 *
 * Run from organization/:  node scripts/html-to-react.mjs <html dir> <out dir>
 */
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const { JSDOM } = require("jsdom");

const [srcDir, outDir] = process.argv.slice(2).map((p) => path.resolve(p));
if (!srcDir || !outDir) throw new Error("usage: html-to-react.mjs <html dir> <out dir>");

const SVG_NS = "http://www.w3.org/2000/svg";
const VOID = new Set(["area", "base", "br", "col", "embed", "hr", "img", "input", "link", "meta", "source", "track", "wbr"]);
const BOOLEAN = new Set([
  "allowfullscreen", "async", "autofocus", "autoplay", "checked", "controls", "default", "defer", "disabled",
  "formnovalidate", "hidden", "loop", "multiple", "muted", "novalidate", "open", "playsinline", "readonly",
  "required", "reversed", "selected",
]);
const RENAME = {
  class: "className", for: "htmlFor", tabindex: "tabIndex", readonly: "readOnly", maxlength: "maxLength",
  minlength: "minLength", colspan: "colSpan", rowspan: "rowSpan", autocomplete: "autoComplete",
  autofocus: "autoFocus", autoplay: "autoPlay", crossorigin: "crossOrigin", frameborder: "frameBorder",
  allowfullscreen: "allowFullScreen", enctype: "encType", novalidate: "noValidate", charset: "charSet",
  "http-equiv": "httpEquiv", srcset: "srcSet", spellcheck: "spellCheck", "accept-charset": "acceptCharset",
  datetime: "dateTime", referrerpolicy: "referrerPolicy", playsinline: "playsInline", formnovalidate: "formNoValidate",
  inputmode: "inputMode", contenteditable: "contentEditable", usemap: "useMap", cellpadding: "cellPadding",
  cellspacing: "cellSpacing", accesskey: "accessKey", "xlink:href": "xlinkHref", "xmlns:xlink": "xmlnsXlink",
  "xml:space": "xmlSpace", allowtransparency: "allowTransparency", marginwidth: "marginWidth",
  marginheight: "marginHeight", fetchpriority: "fetchPriority", autocorrect: "autoCorrect",
  autocapitalize: "autoCapitalize",
};
// Whitespace between these is never drawn, so it is not carried into JSX.
const BLOCK = new Set([
  "html", "head", "body", "div", "section", "header", "footer", "nav", "main", "article", "aside", "ul", "ol",
  "li", "form", "table", "thead", "tbody", "tfoot", "tr", "td", "th", "p", "h1", "h2", "h3", "h4", "h5", "h6",
  "select", "fieldset", "figure", "figcaption", "dl", "dt", "dd", "blockquote", "svg", "g", "defs",
  "linearGradient", "radialGradient",
]);

const camel = (s) => s.replace(/-([a-z])/g, (_, c) => c.toUpperCase());
const pascal = (s) => {
  const p = s.replace(/(^|[-_\s.]+)([a-zA-Z0-9])/g, (_, __, c) => c.toUpperCase()).replace(/[^a-zA-Z0-9]/g, "");
  return /^[0-9]/.test(p) ? `Page${p}` : p;
};
const hash = (s) => crypto.createHash("sha1").update(s).digest("hex").slice(0, 8);

function jsxString(value) {
  return /["\\\n&{}]/.test(value) ? `{${JSON.stringify(value)}}` : `"${value}"`;
}

function attrs(el) {
  const out = [];
  const isSvg = el.namespaceURI === SVG_NS;
  for (const { name, value } of el.attributes) {
    // Broken markup (`<iframe … <="" iframe="">`) leaves attributes that no
    // browser uses and JSX cannot name; they are dropped.
    if (!/^[a-zA-Z_][-a-zA-Z0-9_:.]*$/.test(name) || name === el.localName) continue;
    if (/^on[a-z]+$/.test(name)) {
      out.push(`data-inline-${name}=${jsxString(value)}`);
      continue;
    }
    if (name === "style") {
      out.push(`data-inline-style=${jsxString(value)}`); // none today; kept verbatim if one appears
      continue;
    }
    let prop = RENAME[name] ?? name;
    if (prop === name && isSvg && name.includes("-") && !/^(data|aria)-/.test(name)) prop = camel(name);
    if (el.localName === "input" && name === "value") prop = "defaultValue";
    if (BOOLEAN.has(name)) {
      out.push(prop);
      continue;
    }
    if (NUMERIC.has(prop) && /^-?\d+$/.test(value.trim())) {
      out.push(`${prop}={${Number(value)}}`);
      continue;
    }
    out.push(`${prop}=${jsxString(COLLAPSIBLE.has(name) ? value.replace(/\s+/g, " ").trim() : value)}`);
  }
  return out.length ? ` ${out.join(" ")}` : "";
}

function hasFlowLayout(el) {
  // Whitespace inside a flex or grid container never renders.
  const cls = el.getAttribute?.("class") ?? "";
  return /(^|\s)(inline-)?(flex|grid)(\s|$)/.test(cls);
}

// Elements that never sit in a line of text: whitespace beside them is not
// drawn. Anything Tailwind makes inline (`inline-block` …) does not count.
const NOT_INLINE = new Set([...BLOCK, "script", "style", "link", "meta", "title", "noscript", "iframe", "hr", "br", "option"]);
function sitsOnItsOwn(node) {
  if (!node || node.nodeType !== 1) return !node; // no neighbour counts as an edge
  const cls = node.getAttribute("class") ?? "";
  if (/(^|\s)([a-z0-9]+:)?inline(-block|-flex|-grid|-table)?(\s|$)/.test(cls)) return false;
  return NOT_INLINE.has(node.localName);
}
const neighbour = (node, dir) => {
  let n = dir < 0 ? node.previousSibling : node.nextSibling;
  while (n && (n.nodeType === 8 || (n.nodeType === 3 && !n.nodeValue.trim() && n !== node))) n = dir < 0 ? n.previousSibling : n.nextSibling;
  return n;
};

// React types these as numbers: maxLength={12}, not maxLength="12".
const NUMERIC = new Set(["maxLength", "minLength", "rows", "cols", "tabIndex", "colSpan", "rowSpan", "size", "span", "start"]);

// Attribute values whose line breaks and runs of spaces mean nothing.
const COLLAPSIBLE = new Set(["class", "d", "points", "viewBox", "viewbox", "transform", "srcset", "sizes"]);

/** Plain JSX text where it reads as plain text; a string where it must. */
function textJsx(text) {
  const lead = text.startsWith(" ") ? '{" "}' : "";
  const trail = text.endsWith(" ") && text.length > 1 ? '{" "}' : "";
  const core = text.trim();
  if (!core) return '{" "}';
  if (/[{}<>]|&[a-zA-Z#0-9]+;/.test(core)) return `{${JSON.stringify(text)}}`;
  return `${lead}${core}${trail}`;
}

class Converter {
  constructor() {
    this.behaviour = new Map(); // content hash → { file, uses, content }
    this.styles = new Map();
    this.components = new Map(); // outerHTML hash → { name, el, uses }
  }

  asset(kind, content, owner) {
    const store = kind === "js" ? this.behaviour : this.styles;
    const key = hash(content);
    if (!store.has(key)) store.set(key, { key, owner, content, uses: new Set() });
    store.get(key).uses.add(owner);
    return store.get(key);
  }

  emitChildren(el, depth, ctx) {
    // What sits inside <iframe> in the source is never shown -- here it is
    // only markup a missing </iframe> swallowed.
    if (el.localName === "iframe") return "";
    const kids = [...el.childNodes];
    const parts = [];
    kids.forEach((node, i) => {
      if (node.nodeType === 8) return; // comment
      if (node.nodeType === 3) {
        if (["pre", "textarea"].includes(el.localName)) {
          parts.push(`${"  ".repeat(depth)}{${JSON.stringify(node.nodeValue)}}`);
          return;
        }
        let text = node.nodeValue.replace(/\s+/g, " ");
        if (text === "" || el.localName === "head" || el.localName === "html") return;
        // A space is drawn only between two things in the same line of text.
        // At the edge of a block, or beside something that sits on its own
        // line, it is not -- so it is not written.
        const flow = hasFlowLayout(el);
        const prev = neighbour(node, -1);
        const next = neighbour(node, 1);
        const blockParent = BLOCK.has(el.localName) || flow;
        if (text.startsWith(" ") && (flow || (blockParent && !prev) || (prev && sitsOnItsOwn(prev)))) text = text.slice(1);
        if (text.endsWith(" ") && (flow || (blockParent && !next) || (next && sitsOnItsOwn(next)))) text = text.slice(0, -1);
        if (text === "") return;
        parts.push(`${"  ".repeat(depth)}${textJsx(text)}`);
        return;
      }
      if (node.nodeType === 1) parts.push(this.emit(node, depth, ctx));
    });
    return parts.join("\n");
  }

  emit(el, depth, ctx) {
    const pad = "  ".repeat(depth);
    const tag = el.localName;

    if (ctx.shared && depth === ctx.sharedDepth && ctx.shared.has(el)) {
      const c = ctx.shared.get(el);
      ctx.imports.add(`import ${c.name} from "../components/${c.name}";`);
      return `${pad}<${c.name} />`;
    }
    if (tag === "script" && !el.hasAttribute("src") && el.textContent.trim()) {
      const a = this.asset("js", el.textContent, ctx.page);
      const id = `js_${a.key}`;
      ctx.raw.set(id, `../behaviour/${a.key}.js?raw`);
      const rest = attrs(el);
      return `${pad}<script${rest} dangerouslySetInnerHTML={{ __html: ${id} }} />`;
    }
    if (tag === "style" && el.textContent.trim()) {
      const a = this.asset("css", el.textContent, ctx.page);
      const id = `css_${a.key}`;
      ctx.raw.set(id, `../styles/${a.key}.css?raw`);
      return `${pad}<style${attrs(el)} dangerouslySetInnerHTML={{ __html: ${id} }} />`;
    }
    if (tag === "textarea") {
      const value = el.textContent;
      return `${pad}<textarea${attrs(el)}${value ? ` defaultValue={${JSON.stringify(value)}}` : ""} />`;
    }
    const open = `${pad}<${tag}${attrs(el)}`;
    if (VOID.has(tag)) return `${open} />`;
    const inner = this.emitChildren(el, depth + 1, ctx);
    return inner ? `${open}>\n${inner}\n${pad}</${tag}>` : `${open}></${tag}>`;
  }
}

function sharedName(el, taken) {
  const id = el.getAttribute("id");
  const scope = el.getAttribute("data-cms-scope");
  let base = scope === "header" ? "SiteHeader" : scope === "footer" ? "SiteFooter" : id ? pascal(id) : pascal(`${el.localName}-block`);
  let name = base;
  for (let n = 2; taken.has(name); n++) name = `${base}${n}`;
  taken.add(name);
  return name;
}

const files = fs.readdirSync(srcDir).filter((f) => f.endsWith(".html")).sort();
const docs = files.map((file) => ({ file, name: file.slice(0, -5), dom: new JSDOM(fs.readFileSync(path.join(srcDir, file), "utf8")) }));

// Blocks repeated on five or more pages become components.
const counts = new Map();
for (const { dom } of docs) {
  for (const el of dom.window.document.body.children) {
    if (el.localName === "script" || el.outerHTML.length < 300) continue;
    const key = hash(el.outerHTML);
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }
}
const converter = new Converter();
const taken = new Set();
const components = new Map(); // hash → { name, source }

for (const dir of ["pages", "components", "behaviour", "styles"]) {
  fs.rmSync(path.join(outDir, dir), { recursive: true, force: true });
  fs.mkdirSync(path.join(outDir, dir), { recursive: true });
}

function header(imports, raw) {
  const lines = [...imports].sort();
  for (const [id, spec] of [...raw.entries()].sort()) lines.push(`import ${id} from "${spec}";`);
  return lines.join("\n");
}

const index = [];
for (const { name, dom } of docs) {
  const doc = dom.window.document;
  const shared = new Map();
  for (const el of doc.body.children) {
    const key = hash(el.outerHTML);
    if (el.localName === "script" || el.outerHTML.length < 300 || (counts.get(key) ?? 0) < 5) continue;
    if (!components.has(key)) {
      const cname = sharedName(el, taken);
      const cctx = { page: `component:${cname}`, imports: new Set(), raw: new Map() };
      const body = converter.emit(el, 2, cctx);
      const src = `${header(cctx.imports, cctx.raw)}\n\n/** Shared by every page that carries it; written once here. */\nexport default function ${cname}() {\n  return (\n${body}\n  );\n}\n`;
      components.set(key, { name: cname, source: src.replace(/^\n+/, "") });
    }
    shared.set(el, components.get(key));
  }

  const ctx = { page: name, imports: new Set(), raw: new Map(), shared, sharedDepth: 4 };
  const html = doc.documentElement;
  const head = converter.emit(doc.head, 3, { ...ctx, shared: null });
  const body = converter.emit(doc.body, 3, ctx);
  const comp = pascal(name);
  const src = [
    header(ctx.imports, ctx.raw),
    "",
    `/** ${name}.html */`,
    `export default function ${comp}() {`,
    "  return (",
    `    <html${attrs(html)}>`,
    head,
    body,
    "    </html>",
    "  );",
    "}",
    "",
  ].join("\n");
  fs.writeFileSync(path.join(outDir, "pages", `${name}.tsx`), src.replace(/^\n+/, ""));
  index.push(name);
}

for (const { name, source } of components.values()) fs.writeFileSync(path.join(outDir, "components", `${name}.tsx`), source);
for (const a of converter.behaviour.values()) fs.writeFileSync(path.join(outDir, "behaviour", `${a.key}.js`), a.content);
for (const a of converter.styles.values()) fs.writeFileSync(path.join(outDir, "styles", `${a.key}.css`), a.content);

console.log(
  `${index.length} pages, ${components.size} shared components, ${converter.behaviour.size} scripts, ${converter.styles.size} styles`,
);
