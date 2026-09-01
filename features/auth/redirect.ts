import type { SupabaseClient } from "@supabase/supabase-js";

import type { Database } from "@/types/database.generated";

export type Portal = "admin" | "centre" | "student";

/**
 * Where a signed-in user lands.
 *
 * Platform admins still go to /admin regardless of the sign-in page used —
 * that precedence is deliberate and unchanged.
 *
 * Below that, the door someone came through wins whenever they are entitled to
 * walk through it. One account can genuinely be both: a member of centre staff
 * enrolled on a course, or — the case that surfaced this — an email address
 * that already had a login when a centre issued the student their portal
 * credentials, since `setStudentPortalLogin` links the existing account rather
 * than failing. Such a user used to be sent to /centre even after deliberately
 * choosing student sign-in, which is simply the wrong room.
 *
 * A user with more than one membership goes to /select-context (not built yet
 * in this slice; falls back to the first membership found).
 */
export async function resolvePostLoginPath(
  supabase: SupabaseClient<Database>,
  userId: string,
  fallbackPortal: Portal,
): Promise<string> {
  const [{ data: profile }, { data: memberships }, { data: studentRecord }] =
    await Promise.all([
      supabase
        .from("profiles")
        .select("is_platform_super_admin")
        .eq("id", userId)
        .maybeSingle(),
      supabase
        .from("memberships")
        .select("centre_id")
        .eq("user_id", userId)
        .eq("status", "active"),
      // Readable by the student themselves under `students_select_self`
      // (user_id = auth.uid()), so this needs no elevated access.
      supabase
        .from("students")
        .select("id")
        .eq("user_id", userId)
        .limit(1)
        .maybeSingle(),
    ]);

  if (profile?.is_platform_super_admin) {
    return "/admin";
  }

  const hasCentreMembership = (memberships ?? []).some(
    (m) => m.centre_id !== null,
  );
  const hasStudentRecord = Boolean(studentRecord);

  if (fallbackPortal === "student" && hasStudentRecord) return "/student";
  if (fallbackPortal === "centre" && hasCentreMembership) return "/centre";

  // Otherwise fall back to what the account actually is.
  if (memberships && memberships.length > 0) {
    return hasCentreMembership ? "/centre" : "/student";
  }

  if (hasStudentRecord) return "/student";

  return `/${fallbackPortal}`;
}
