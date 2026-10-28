/**
 * The public website, in React -- the same language as the ERP.
 *
 * Every page is a component in ./pages, built from shared pieces in
 * ./components (header, footer, WhatsApp widget …). Pages are rendered to
 * static HTML ahead of time: at build for the deploy, on each request in dev.
 * Visitors get plain, fast HTML with no React to download, and search
 * engines read the full page.
 *
 * The pages' own browser scripts (menus, sliders, forms) live in
 * ./behaviour and run as they always did. Inline handlers such as onclick
 * are written data-inline-onclick in the components, because React does not
 * render string event handlers, and restored here.
 */
import { renderToStaticMarkup } from "react-dom/server";
import type { ComponentType } from "react";

const modules = import.meta.glob<{ default: ComponentType }>("./pages/*.tsx", { eager: true });

const pages = new Map(
  Object.entries(modules).map(([file, mod]) => [file.slice("./pages/".length, -".tsx".length), mod.default]),
);

/** Every page, by its address without .html ("index", "about" …). */
export const pageNames = [...pages.keys()].sort();

/** The page's HTML, or null when there is no such page. */
export function renderPage(name: string): string | null {
  const Page = pages.get(name);
  if (!Page) return null;
  const html = renderToStaticMarkup(<Page />);
  return `<!DOCTYPE html>${html.replace(/ data-inline-(on[a-z]+|style)=/g, " $1=")}`;
}
