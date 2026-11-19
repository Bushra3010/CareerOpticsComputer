import { supabase } from "./client";

/**
 * The website's blog (blog-posts.sql), written under Website -> Blog. The
 * website reads the published posts itself (website/behaviour/blog.js), so a
 * saved post is live at once.
 *
 * The body is plain text -- see parseBlogBody for the few marks it knows.
 * website/behaviour/blog.js carries a copy of that parser; change both.
 */

export interface BlogPost {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  coverUrl: string;
  body: string;
  publishedOn: string; // yyyy-mm-dd
  isPublished: boolean;
}

export type BlogDraft = Omit<BlogPost, "id"> & { id?: string };

export const BLOG_CATEGORIES = ["Courses", "Career", "Exams", "Franchise", "News", "Tips"];

export type BlogBlock =
  | { type: "p"; text: string }
  | { type: "h2"; text: string }
  | { type: "ul"; items: string[] }
  | { type: "ol"; items: string[] };

/** "## Heading", "- point", "1. point", and paragraphs split by a blank line. */
export function parseBlogBody(body: string): BlogBlock[] {
  const blocks: BlogBlock[] = [];
  let para: string[] = [];
  const flush = () => {
    if (para.length) blocks.push({ type: "p", text: para.join(" ") });
    para = [];
  };
  for (const raw of body.replace(/\r\n?/g, "\n").split("\n")) {
    const line = raw.trim();
    const last = blocks[blocks.length - 1];
    if (!line) {
      flush();
    } else if (/^#{2,3}\s+/.test(line)) {
      flush();
      blocks.push({ type: "h2", text: line.replace(/^#{2,3}\s+/, "") });
    } else if (/^[-*•]\s+/.test(line)) {
      flush();
      const item = line.replace(/^[-*•]\s+/, "");
      if (last?.type === "ul" && !para.length) last.items.push(item);
      else blocks.push({ type: "ul", items: [item] });
    } else if (/^\d+[.)]\s+/.test(line)) {
      flush();
      const item = line.replace(/^\d+[.)]\s+/, "");
      if (last?.type === "ol" && !para.length) last.items.push(item);
      else blocks.push({ type: "ol", items: [item] });
    } else {
      para.push(line);
    }
  }
  flush();
  return blocks;
}

/** A title as a link: "DCA vs ADCA!" → "dca-vs-adca". */
export const blogSlug = (text: string) =>
  text
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80)
    .replace(/-+$/, "");

/** Minutes to read, at about 200 words a minute. */
export const readMinutes = (body: string) => Math.max(1, Math.round(body.split(/\s+/).filter(Boolean).length / 200));

const toPost = (r: Record<string, unknown>): BlogPost => ({
  id: String(r.id),
  slug: String(r.slug ?? ""),
  title: String(r.title ?? ""),
  excerpt: String(r.excerpt ?? ""),
  category: String(r.category ?? ""),
  coverUrl: String(r.coverUrl ?? ""),
  body: String(r.body ?? ""),
  publishedOn: String(r.publishedOn ?? "").slice(0, 10),
  isPublished: r.isPublished !== false,
});

const describe = (error: { code?: string; message: string }) => {
  if (error.code === "42P01" || /blog_posts/.test(error.message) && /exist|schema cache/i.test(error.message)) {
    return "The blog is not set up in the database yet. Run supabase/schema/blog-posts.sql in Supabase.";
  }
  if (error.code === "23505") return "Another post already uses this link. Change the link (slug).";
  return error.message;
};

/** Every post of the organisation, newest first, hidden ones included. */
export async function listBlogPosts(organizationId: string | null): Promise<BlogPost[]> {
  let query = supabase.from("blog_posts").select("*").order("publishedOn", { ascending: false }).order("createdAt", { ascending: false });
  if (organizationId) query = query.eq("organizationId", organizationId);
  const { data, error } = await query;
  if (error) throw new Error(describe(error));
  return (data || []).map((r) => toPost(r as Record<string, unknown>));
}

export async function saveBlogPost(organizationId: string, post: BlogDraft): Promise<void> {
  const row = {
    slug: blogSlug(post.slug || post.title),
    title: post.title.trim(),
    excerpt: post.excerpt.trim() || null,
    category: post.category.trim() || null,
    coverUrl: post.coverUrl.trim() || null,
    body: post.body.trim(),
    publishedOn: post.publishedOn || new Date().toISOString().slice(0, 10),
    isPublished: post.isPublished,
    updatedAt: new Date().toISOString(),
  };
  if (!row.title) throw new Error("Give the post a title.");
  if (!row.slug) throw new Error("The title needs some English letters or numbers for the link.");
  if (!row.body) throw new Error("Write the post before saving.");
  const { error } = post.id
    ? await supabase.from("blog_posts").update(row).eq("id", post.id)
    : await supabase.from("blog_posts").insert({ ...row, organizationId });
  if (error) throw new Error(describe(error));
}

export async function deleteBlogPost(id: string): Promise<void> {
  const { error } = await supabase.from("blog_posts").delete().eq("id", id);
  if (error) throw new Error(describe(error));
}
