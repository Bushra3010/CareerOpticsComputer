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
  createdOn: string;
}

/** Every lead, via `leads_platform_read` (app.is_platform_admin() only). */
export async function listLeadsForAdmin(): Promise<LeadRow[]> {
  const supabase = await createClient();

  const { data } = await supabase
    .from("leads")
    .select(
      "id, full_name, phone, email, city, message, status, source, created_at, courses(name)",
    )
    .order("created_at", { ascending: false })
    .limit(200);

  return (data ?? []).map((l) => {
    const course = l.courses as unknown as
      { name: string } | { name: string }[] | null;
    const courseName = Array.isArray(course)
      ? (course[0]?.name ?? null)
      : (course?.name ?? null);
    return {
      id: l.id,
      fullName: l.full_name,
      phone: l.phone,
      email: l.email,
      city: l.city,
      courseInterest: courseName,
      message: l.message,
      status: l.status,
      source: l.source,
      createdOn: l.created_at.slice(0, 10),
    };
  });
}
