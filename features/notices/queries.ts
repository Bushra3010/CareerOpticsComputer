import { createClient } from "@/lib/db/server";

export interface PublicNotice {
  id: string;
  title: string;
  slug: string;
  body: string;
  publishedOn: string;
}

/**
 * RLS (`notices_public_read`) is what limits this to published, in-window
 * rows — the `.eq` here is belt to that brace, so the admin preview path
 * below stays a separate, explicit query rather than this one growing
 * flags.
 */
export async function listPublishedNotices(): Promise<PublicNotice[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("notices")
    .select("id, title, slug, body, published_at, created_at")
    .eq("status", "active")
    .order("published_at", { ascending: false, nullsFirst: false });

  return (data ?? []).map((n) => ({
    id: n.id,
    title: n.title,
    slug: n.slug,
    body: n.body,
    publishedOn: (n.published_at ?? n.created_at).slice(0, 10),
  }));
}

export async function getPublishedNoticeBySlug(
  slug: string,
): Promise<PublicNotice | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("notices")
    .select("id, title, slug, body, published_at, created_at")
    .eq("slug", slug)
    .eq("status", "active")
    .maybeSingle();

  if (!data) return null;
  return {
    id: data.id,
    title: data.title,
    slug: data.slug,
    body: data.body,
    publishedOn: (data.published_at ?? data.created_at).slice(0, 10),
  };
}

export interface AdminNoticeRow {
  id: string;
  title: string;
  slug: string;
  status: "draft" | "active" | "retired";
  publishedOn: string | null;
  createdOn: string;
}

export async function listAllNoticesForAdmin(): Promise<AdminNoticeRow[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("notices")
    .select("id, title, slug, status, published_at, created_at")
    .order("created_at", { ascending: false });

  return (data ?? []).map((n) => ({
    id: n.id,
    title: n.title,
    slug: n.slug,
    status: n.status,
    publishedOn: n.published_at?.slice(0, 10) ?? null,
    createdOn: n.created_at.slice(0, 10),
  }));
}
