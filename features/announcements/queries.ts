import { createClient } from "@/lib/db/server";

export interface AnnouncementRow {
  id: string;
  title: string;
  body: string;
  scopeType: "organization" | "centre";
  scopeCentreName: string | null;
  status: "draft" | "active" | "retired";
  publishOn: string | null;
  expiresOn: string | null;
  createdOn: string;
}

async function toRows(
  supabase: Awaited<ReturnType<typeof createClient>>,
  data:
    | {
        id: string;
        title: string;
        body: string;
        scope_type: "organization" | "centre";
        scope_centre_id: string | null;
        status: "draft" | "active" | "retired";
        publish_at: string | null;
        expires_at: string | null;
        created_at: string;
      }[]
    | null,
): Promise<AnnouncementRow[]> {
  const rows = data ?? [];
  const centreIds = rows
    .filter((r) => r.scope_centre_id)
    .map((r) => r.scope_centre_id as string);
  const names = new Map<string, string>();
  if (centreIds.length) {
    const { data: centres } = await supabase
      .from("centres")
      .select("id, name")
      .in("id", centreIds);
    for (const c of centres ?? []) names.set(c.id, c.name);
  }

  return rows.map((r) => ({
    id: r.id,
    title: r.title,
    body: r.body,
    scopeType: r.scope_type,
    scopeCentreName: r.scope_centre_id
      ? (names.get(r.scope_centre_id) ?? "Unknown centre")
      : null,
    status: r.status,
    publishOn: r.publish_at ? r.publish_at.slice(0, 10) : null,
    expiresOn: r.expires_at ? r.expires_at.slice(0, 10) : null,
    createdOn: r.created_at.slice(0, 10),
  }));
}

/** Everything the caller's `announcement.manage` reaches — every
 *  organisation-wide announcement for an HO Operator/platform admin, or
 *  just their own centre's for a centre owner. RLS decides which. */
export async function listAnnouncementsForManager(): Promise<
  AnnouncementRow[]
> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("announcements")
    .select(
      "id, title, body, scope_type, scope_centre_id, status, publish_at, expires_at, created_at",
    )
    .order("created_at", { ascending: false });
  return toRows(supabase, data);
}

/** The published feed a reader (centre staff without manage, or a student)
 *  actually sees — RLS already filters to published, in-window, in-scope
 *  rows, so this is a plain unfiltered select. */
export async function listPublishedAnnouncements(): Promise<AnnouncementRow[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("announcements")
    .select(
      "id, title, body, scope_type, scope_centre_id, status, publish_at, expires_at, created_at",
    )
    .order("publish_at", { ascending: false });
  return toRows(supabase, data);
}
