/**
 * Rich text as this app stores it: a small, fixed subset of HTML.
 *
 * Anything written in the editor -- or pasted into it from a website, which is
 * where the dangerous markup comes from -- passes through `sanitizeRichText`
 * before it is stored, and again before it is rendered. Both ends, because the
 * bank already holds questions written before this existed, and the only way
 * formatted text can be shown at all is `dangerouslySetInnerHTML`.
 */

/** Tag -> the attributes it may keep. A tag absent from here is unwrapped: its
 *  wording survives, its markup does not. */
const ATTRS_BY_TAG: Record<string, readonly string[]> = {
  p: ["style"],
  div: ["style"],
  br: [],
  span: ["style"],
  strong: [],
  b: [],
  em: [],
  i: [],
  u: [],
  s: [],
  strike: [],
  mark: ["style"],
  sub: [],
  sup: [],
  h1: ["style"],
  h2: ["style"],
  h3: ["style"],
  h4: ["style"],
  ul: ["style"],
  ol: ["style"],
  li: ["style"],
  blockquote: ["style"],
  pre: ["style"],
  code: [],
  hr: [],
  a: ["href", "title", "target", "rel"],
  img: ["src", "alt", "title", "width", "height", "style"],
  table: ["style"],
  thead: [],
  tbody: [],
  tr: ["style"],
  th: ["colspan", "rowspan", "style"],
  td: ["colspan", "rowspan", "style"],
  // `execCommand("foreColor")` still emits <font color> on some browsers.
  font: ["color"],
};

/** Dropped with everything inside them, rather than unwrapped. */
const DROP_WHOLE = new Set([
  "script", "style", "iframe", "object", "embed", "link", "meta", "form", "input",
  "button", "select", "textarea", "option", "svg", "math", "noscript", "template",
  "base", "title", "head", "audio", "video", "source", "track", "applet", "frame",
  "frameset", "portal", "dialog",
]);

/** CSS properties a pasted or authored style may keep. Everything else goes,
 *  so nothing can position an element over the page chrome. */
const STYLE_PROPS = new Set([
  "text-align", "color", "background-color", "font-weight", "font-style",
  "text-decoration", "text-decoration-line", "font-size", "width", "height",
  "max-width", "border", "border-collapse", "padding", "vertical-align",
  "list-style-type", "margin-left",
]);

const BLOCK_TAGS = "p,div,li,tr,h1,h2,h3,h4,blockquote,pre,td,th";

/** Anything with a scheme we do not know is refused; `#anchor`, `/page` and
 *  bare `example.com` have no scheme at all and are left alone. */
const hasUnknownScheme = (value: string) =>
  /^[a-z][a-z0-9+.-]*:/i.test(value) && !/^(https?|mailto|tel):/i.test(value);

/** Only real raster data, so `data:text/html` and `data:image/svg+xml` -- both
 *  of which can carry script -- never reach an `img`. */
const DATA_IMAGE = /^data:image\/(png|jpe?g|gif|webp|avif|bmp);base64,[a-z0-9+/=\s]+$/i;

const isSafeImageSrc = (value: string) =>
  DATA_IMAGE.test(value) || /^https?:\/\//i.test(value) || !/^[a-z][a-z0-9+.-]*:/i.test(value);

const cleanStyle = (value: string) =>
  value
    .split(";")
    .map((part) => part.trim())
    .filter(Boolean)
    .filter((part) => {
      const [prop, ...rest] = part.split(":");
      const body = rest.join(":");
      if (!body.trim()) return false;
      // `url(...)` loads something; `expression(...)` runs something.
      if (/url\s*\(|expression\s*\(|javascript:/i.test(body)) return false;
      return STYLE_PROPS.has(prop.trim().toLowerCase());
    })
    .join("; ");

const unwrap = (el: Element) => {
  const parent = el.parentNode;
  if (!parent) return;
  while (el.firstChild) parent.insertBefore(el.firstChild, el);
  parent.removeChild(el);
};

const clean = (parent: Node) => {
  for (const node of Array.from(parent.childNodes)) {
    if (node.nodeType === 8) {
      parent.removeChild(node);
      continue;
    }
    if (node.nodeType !== 1) continue;
    const el = node as Element;
    const tag = el.tagName.toLowerCase();
    if (DROP_WHOLE.has(tag)) {
      parent.removeChild(el);
      continue;
    }
    clean(el);
    const allowed = ATTRS_BY_TAG[tag];
    if (!allowed) {
      unwrap(el);
      continue;
    }
    for (const attr of Array.from(el.attributes)) {
      const name = attr.name.toLowerCase();
      // `on*` handlers are never in an allow-list, but say so plainly.
      if (name.startsWith("on") || !allowed.includes(name)) {
        el.removeAttribute(attr.name);
        continue;
      }
      if (name === "style") {
        const style = cleanStyle(attr.value);
        if (style) el.setAttribute("style", style);
        else el.removeAttribute("style");
        continue;
      }
      if (name === "href" && hasUnknownScheme(attr.value.trim())) {
        el.removeAttribute(attr.name);
        continue;
      }
      if (name === "src" && !isSafeImageSrc(attr.value.trim())) {
        el.removeAttribute(attr.name);
      }
    }
    // A link with nowhere to go is left as the words it was written on.
    if (tag === "a") {
      if (!el.getAttribute("href")) unwrap(el);
      else {
        el.setAttribute("target", "_blank");
        el.setAttribute("rel", "noopener noreferrer");
      }
    }
    // An image with no source is an empty box; drop it rather than show one.
    if (tag === "img" && !el.getAttribute("src")) parent.removeChild(el);
  }
};

const parse = (html: string) =>
  new DOMParser().parseFromString(`<!doctype html><body>${html}</body>`, "text/html");

/** The only form of this text that may be handed to `dangerouslySetInnerHTML`. */
export function sanitizeRichText(html: string): string {
  if (!html) return "";
  const doc = parse(html);
  clean(doc.body);
  return doc.body.innerHTML;
}

/**
 * The wording alone, for everywhere HTML has no meaning -- a CSV column, a
 * validation check, counting the gaps in a fill-in-the-blanks sentence.
 */
export function richTextToPlain(html: string): string {
  if (!html) return "";
  const doc = parse(sanitizeRichText(html));
  // Without this, `<p>one</p><p>two</p>` reads as "onetwo".
  doc.body.querySelectorAll("br").forEach((br) => br.replaceWith(" "));
  doc.body.querySelectorAll(BLOCK_TAGS).forEach((el) => el.append(" "));
  return (doc.body.textContent ?? "").replace(/\s+/g, " ").trim();
}

/** Empty means nothing to read -- but a question that is only a diagram or a
 *  table has been written, so those count as content. */
export function isRichTextEmpty(html: string): boolean {
  if (richTextToPlain(html)) return false;
  return !/<(img|hr|table)\b/i.test(sanitizeRichText(html));
}

/** Plain text on its way in -- a CSV import, a paste with no markup -- so that
 *  `2 < 3` reads as written rather than being taken for an unclosed tag. */
export function plainToRichText(text: string): string {
  if (!text) return "";
  const escaped = text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
  return escaped.replace(/\r?\n/g, "<br>");
}
