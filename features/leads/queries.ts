import { createClient } from "@/lib/db/server";

export interface LeadRow {
  id: string;
  fullName: string;
  phone: string;
  email: string | null;
  city: string | null;
  courseInterest: string | null;
  message: string | null;
  status: "new" | "contacted" | "converted" | "closed";
  source: string;
  centreId: string | null;
  centreName: string | null;
  createdOn: string;
}

function mapLead(
  l: Record<string, unknown>,
  centreNames: Map<string, string>,
): LeadRow {
  const course = l.courses as { name: string } | { name: string }[] | null;
  const courseName = Array.isArray(course)
    ? (course[0]?.name ?? null)
    : (course?.name ?? null);
  const centreId = (l.centre_id as string | null) ?? null;
  return {
    id: l.id as string,
    fullName: l.full_name as string,
    phone: l.phone as string,
    email: l.email as string | null,
    city: l.city as string | null,
    courseInterest: courseName,
    message: l.message as string | null,
    status: l.status as LeadRow["status"],
    source: l.source as string,
    centreId,
    centreName: centreId ? (centreNames.get(centreId) ?? null) : null,
    createdOn: (l.created_at as string).slice(0, 10),
  };
}

const LEAD_SELECT =
  "id, full_name, phone, email, city, message, status, source, centre_id, created_at, courses(name)";

async function centreNames(
  supabase: Awaited<ReturnType<typeof createClient>>,
  rows: { centre_id: string | null }[],
): Promise<Map<string, string>> {
  const ids = [...new Set(rows.map((r) => r.centre_id).filter(Boolean))];
  if (ids.length === 0) return new Map();
  const { data } = await supabase
    .from("centres")
    .select("id, name")
    .in("id", ids as string[]);
  return new Map((data ?? []).map((c) => [c.id, c.name]));
}

/** Every lead — platform admins and `lead.read` HO staff (migration 0044). */
export async function listLeadsForAdmin(): Promise<LeadRow[]> {
  const supabase = await createClient();

  const { data } = await supabase
    .from("leads")
    .select(LEAD_SELECT)
    .order("created_at", { ascending: false })
    .limit(200);

  const rows = data ?? [];
  const names = await centreNames(supabase, rows);
  return rows.map((l) => mapLead(l as Record<string, unknown>, names));
}

/** The leads assigned to one centre — RLS scopes further to the caller. */
export async function listLeadsForCentre(centreId: string): Promise<LeadRow[]> {
  const supabase = await createClient();

  const { data } = await supabase
    .from("leads")
    .select(LEAD_SELECT)
    .eq("centre_id", centreId)
    .order("created_at", { ascending: false })
    .limit(200);

  return (data ?? []).map((l) =>
    mapLead(l as Record<string, unknown>, new Map()),
  );
}
