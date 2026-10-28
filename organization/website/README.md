# Website

The public website (served at `/`), written in React + TypeScript like the ERP
(served at `/computercentre/`). Both are built by the same `npm run build` and
deployed together.

| Folder | What is in it |
|---|---|
| `pages/` | One component per page. `about.tsx` is `/about.html`, `index.tsx` is `/`. |
| `components/` | Pieces shared by many pages: `SiteHeader`, `SiteFooter`, `WhatsappWidget` … Change one here and every page changes. |
| `behaviour/` | The pages' browser scripts (menus, sliders, forms), imported by the pages as text and run in the browser. |
| `styles/` | The pages' own CSS blocks, imported the same way. |
| `public/` | Files served as they are: images (`image/`), `logo.*`, `style.css`, `cms.js`. |
| `render.tsx` | Turns a page into HTML. |

Pages are rendered to static HTML: on every request in `npm run dev`, once at
build time for the deploy. Visitors download no React; search engines read the
full page. The build then compiles each page's Tailwind classes, draws its
icons as SVG and points images at their WebP copies
(`scripts/optimize-website.mjs`).

## Adding or changing a page

- **New page:** add `pages/<name>.tsx` exporting a component that returns the
  whole document (`<html>…</html>`); it is served at `/<name>.html`. Reuse
  `SiteHeader` / `SiteFooter`.
- **Inline handlers** (`onclick="…"`): write them as
  `data-inline-onclick="…"` — React does not render string event handlers;
  `render.tsx` turns them back into `onclick`.
- **Images:** put them in `public/image/`, and a `.webp` copy beside each
  (`cwebp -q 78 -resize_mode down_only -resize 900 0 in.png -o in.webp`).

## Editing content without code

Text, images, links and contact details are changed from the ERP:
**Main Website → Website Content**. Those edits are saved in Supabase and laid
over the pages by `public/cms.js`, keyed by each element's position. Moving or
removing elements of a page in code can make earlier edits on that page miss —
check the page in the editor after a structural change.
