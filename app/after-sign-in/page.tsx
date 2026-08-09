import { redirect } from "next/navigation";

import { resolvePostLoginPath } from "@/features/auth/redirect";
import { createClient } from "@/lib/db/server";

/**
 * A landing spot for flows that establish a session in the browser and then
 * need the server to say where that person belongs — invitation acceptance
 * today. The rule lives in `resolvePostLoginPath` alongside sign-in, so the
 * two can never disagree about where a membership leads.
 */
export default async function AfterSignInPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/sign-in/centre");

  redirect(await resolvePostLoginPath(supabase, user.id, "centre"));
}
