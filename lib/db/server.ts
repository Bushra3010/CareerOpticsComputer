import "server-only";

import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import type { Database } from "@/types/database.generated";
import { serverEnv } from "./env";

/**
 * Supabase client for Server Components, server actions and route handlers.
 *
 * Uses the **anon key**, so every query it makes is subject to RLS with the
 * signed-in user's identity. This is the client almost all application code
 * should reach for. Reaching for the service-role client instead is the single
 * easiest way to create a cross-tenant data leak.
 */
export async function createServerSupabase() {
  const cookieStore = await cookies();

  return createServerClient<Database>(
    serverEnv.supabaseUrl,
    serverEnv.supabaseAnonKey,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            for (const { name, value, options } of cookiesToSet) {
              cookieStore.set(name, value, options);
            }
          } catch {
            // Server Components cannot set cookies. Session refresh happens in
            // middleware instead, so swallowing this is correct rather than
            // merely convenient.
          }
        },
      },
    },
  );
}

/**
 * The current auth user, or null.
 *
 * Always `getUser()`, never `getSession()`: getSession reads the cookie without
 * verifying it against the auth server, so a forged cookie would satisfy it.
 * Authorisation decisions must never be built on an unverified token.
 */
export async function getCurrentUser() {
  const supabase = await createServerSupabase();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) return null;
  return user;
}
