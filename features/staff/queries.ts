import { createClient } from "@/lib/db/server";

export interface StaffMember {
  membershipId: string;
  userId: string;
  fullName: string;
  roleCode: string;
  roleName: string;
  status: "active" | "suspended" | "revoked";
  isSelf: boolean;
}

function one<T>(rel: unknown): T | null {
  return Array.isArray(rel) ? ((rel[0] as T) ?? null) : ((rel as T) ?? null);
}

export async function listCentreStaff(
  centreId: string,
  currentUserId: string,
): Promise<StaffMember[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("memberships")
    .select("id, user_id, status, roles(code, name), profiles(full_name)")
    .eq("centre_id", centreId)
    .order("created_at");

  if (error) {
    throw new Error(`Failed to load staff: ${error.message}`);
  }

  return (data ?? []).map((m) => {
    const role = one<{ code: string; name: string }>(m.roles);
    const profile = one<{ full_name: string }>(m.profiles);
    return {
      membershipId: m.id,
      userId: m.user_id,
      fullName: profile?.full_name ?? "Unknown",
      roleCode: role?.code ?? "",
      roleName: role?.name ?? "Unknown role",
      status: m.status,
      isSelf: m.user_id === currentUserId,
    };
  });
}

/** Roles a centre owner may invite into — never centre_owner itself. */
export const INVITABLE_ROLES = [
  {
    code: "centre_manager",
    name: "Centre Manager",
    note: "Everything except staff changes",
  },
  {
    code: "counsellor",
    name: "Counsellor",
    note: "Admissions; cannot take payments",
  },
  {
    code: "faculty",
    name: "Faculty",
    note: "Attendance and results; no fee access",
  },
  { code: "accountant", name: "Accountant", note: "Fees and payments only" },
] as const;
