"use client";

import { createBrowserClient } from "@supabase/ssr";
import type { Database } from "@/types/database.generated";

/**
 * Browser Supabase client. Anon key only — RLS is the boundary.
 *
 * Use this for auth calls (sign-in, password reset, sign-out) and for the
 * handful of realtime subscriptions the build plan justifies. Data fetching
 * belongs in Server Components and server actions, where authorisation is
 * checked twice (PRD §9.3: "Do not place business-critical authorisation only
 * in UI code").
 */
export function createBrowserSupabase() {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
}
