import { createClient } from "@/lib/db/server";

export interface PublicCentre {
  id: string;
  code: string;
  name: string;
  city: string | null;
  state: string | null;
  pincode: string | null;
  address: string | null;
}

/** Active centres only — the second intentional public read (migration 0007). */
export async function listActiveCentres(): Promise<PublicCentre[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("centres")
    .select("id, code, name, city, state, pincode, address")
    .eq("status", "active")
    .order("name", { ascending: true });

  if (error) {
    throw new Error(`Failed to load centres: ${error.message}`);
  }

  return data ?? [];
}

export interface AdminCentreRow {
  id: string;
  code: string;
  name: string;
  city: string | null;
  state: string | null;
  status: "active" | "suspended" | "closed";
  studentCount: number;
  createdOn: string;
}

/** Every centre, for head office. Scoped by `centres_select`'s
 *  is_platform_admin() branch — not filtered here, so the count matches what
 *  the caller is actually entitled to see. */
export async function listAllCentresForAdmin(): Promise<AdminCentreRow[]> {
  const supabase = await createClient();

  const { data } = await supabase
    .from("centres")
    .select("id, code, name, city, state, status, created_at, students(count)")
    .order("name");

  return (data ?? []).map((c) => {
    const counts = c.students as unknown as { count: number }[] | null;
    return {
      id: c.id,
      code: c.code,
      name: c.name,
      city: c.city,
      state: c.state,
      status: c.status,
      studentCount: counts?.[0]?.count ?? 0,
      createdOn: c.created_at.slice(0, 10),
    };
  });
}

export interface AdminCentreDetail {
  id: string;
  code: string;
  name: string;
  status: "active" | "suspended" | "closed";
  address: string | null;
  city: string | null;
  state: string | null;
  pincode: string | null;
  createdOn: string;
  studentCount: number;
  staffCount: number;
}

export async function getCentreForAdmin(
  centreId: string,
): Promise<AdminCentreDetail | null> {
  const supabase = await createClient();

  const { data: centre } = await supabase
    .from("centres")
    .select("id, code, name, status, address, city, state, pincode, created_at")
    .eq("id", centreId)
    .maybeSingle();
  if (!centre) return null;

  const [{ count: studentCount }, { count: staffCount }] = await Promise.all([
    supabase
      .from("students")
      .select("id", { count: "exact", head: true })
      .eq("centre_id", centreId),
    supabase
      .from("memberships")
      .select("id", { count: "exact", head: true })
      .eq("centre_id", centreId)
      .eq("status", "active"),
  ]);

  return {
    id: centre.id,
    code: centre.code,
    name: centre.name,
    status: centre.status,
    address: centre.address,
    city: centre.city,
    state: centre.state,
    pincode: centre.pincode,
    createdOn: centre.created_at.slice(0, 10),
    studentCount: studentCount ?? 0,
    staffCount: staffCount ?? 0,
  };
}
