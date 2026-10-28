/**
 * Content of the public website, kept in `website_content` and laid over the
 * static pages by website/public/cms.js. See supabase/schema/website-content.sql.
 *
 * Three kinds of row:
 *   "settings"     site-wide details (contact, announcement bar)
 *   "layout"       edits inside the header and footer every page shares
 *   "page:<name>"  edits to one page
 */
import { supabase } from "@/lib/supabase/client";

/** One element's change. `tag` guards against applying it to a page whose
 *  structure has since moved on. */
export type WebsiteEdit = {
  tag?: string;
  html?: string;
  src?: string;
  href?: string;
  hidden?: boolean;
};

export type PageContent = { title?: string; edits: Record<string, WebsiteEdit> };

export type WebsiteSettings = {
  phone: string;
  whatsapp: string;
  email: string;
  announcement: { enabled: boolean; text: string; link: string };
};

export const EMPTY_SETTINGS: WebsiteSettings = {
  phone: "",
  whatsapp: "",
  email: "",
  announcement: { enabled: false, text: "", link: "" },
};

export type WebsitePage = { name: string; heading: string };

/** Edits in the shared header and footer belong to every page at once. */
export const isLayoutKey = (key: string) => key.startsWith("header:") || key.startsWith("footer:");

export const pageRowId = (page: string) => `page:${page}`;

/** A missing table is the one failure worth explaining: the SQL has not been run. */
function describe(error: { code?: string; message: string }) {
  if (error.code === "42P01" || error.code === "PGRST205" || /website_content/.test(error.message) && /exist|schema cache/.test(error.message)) {
    return "The website_content table is missing. Run supabase/schema/website-content.sql in the Supabase SQL editor.";
  }
  return error.message;
}

async function getRow<T>(id: string): Promise<T | null> {
  const { data, error } = await supabase.from("website_content").select("data").eq("id", id).maybeSingle();
  if (error) throw new Error(describe(error));
  return (data?.data as T) ?? null;
}

async function putRow(id: string, data: unknown, userId?: string | null) {
  const { error } = await supabase
    .from("website_content")
    .upsert({ id, data, updatedAt: new Date().toISOString(), updatedBy: userId ?? null });
  if (error) throw new Error(describe(error));
}

export async function getWebsiteSettings(): Promise<WebsiteSettings> {
  const saved = await getRow<Partial<WebsiteSettings>>("settings");
  return {
    ...EMPTY_SETTINGS,
    ...saved,
    announcement: { ...EMPTY_SETTINGS.announcement, ...saved?.announcement },
  };
}

export const saveWebsiteSettings = (settings: WebsiteSettings, userId?: string | null) =>
  putRow("settings", settings, userId);

export async function getPageContent(page: string): Promise<{ page: PageContent; layout: PageContent }> {
  const [own, layout] = await Promise.all([getRow<PageContent>(pageRowId(page)), getRow<PageContent>("layout")]);
  return { page: { edits: {}, ...own }, layout: { edits: {}, ...layout } };
}

/**
 * Folds the editor's pending edits into what is saved, sending header and
 * footer edits to the shared layout row. An edit set to `null` is a revert:
 * the element goes back to what the HTML file says.
 */
export function mergeEdits(
  saved: { page: PageContent; layout: PageContent },
  pending: Record<string, WebsiteEdit | null>,
) {
  const page: PageContent = { ...saved.page, edits: { ...saved.page.edits } };
  const layout: PageContent = { ...saved.layout, edits: { ...saved.layout.edits } };
  for (const [key, edit] of Object.entries(pending)) {
    const target = isLayoutKey(key) ? layout : page;
    if (edit === null) delete target.edits[key];
    else target.edits[key] = { ...target.edits[key], ...edit };
  }
  return { page, layout };
}

export async function savePageContent(
  pageName: string,
  saved: { page: PageContent; layout: PageContent },
  pending: Record<string, WebsiteEdit | null>,
  userId?: string | null,
) {
  const merged = mergeEdits(saved, pending);
  const touchesLayout = Object.keys(pending).some(isLayoutKey);
  await putRow(pageRowId(pageName), merged.page, userId);
  if (touchesLayout) await putRow("layout", merged.layout, userId);
  return merged;
}

/** Uploads an image to the public `website` bucket and returns its URL. */
export async function uploadWebsiteImage(file: File) {
  const ext = (file.name.split(".").pop() || "png").toLowerCase().replace(/[^a-z0-9]/g, "");
  const path = `images/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
  const { error } = await supabase.storage.from("website").upload(path, file, { contentType: file.type, upsert: false });
  if (error) {
    throw new Error(/bucket/i.test(error.message)
      ? "The website image bucket is missing. Run supabase/schema/website-content.sql in the Supabase SQL editor."
      : error.message);
  }
  return supabase.storage.from("website").getPublicUrl(path).data.publicUrl;
}

/** The website's pages, as the build lists them in /cms-pages.json. */
export async function getWebsitePages(): Promise<WebsitePage[]> {
  const response = await fetch("/cms-pages.json", { cache: "no-store" });
  if (!response.ok) return [{ name: "index", heading: "" }];
  return response.json();
}
