import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";

import { supabaseAnonKey, supabaseUrl } from "./env";
import type { Database } from "@/types/database.generated";

/**
 * For use in Server Components. Cookie writes are swallowed — Server Components
 * cannot set cookies, so session refresh only takes effect via middleware.
 */
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient<Database>(supabaseUrl(), supabaseAnonKey(), {
    cookies: {
      getAll: () => cookieStore.getAll(),
      setAll: (cookiesToSet) => {
        try {
          for (const { name, value, options } of cookiesToSet) {
            cookieStore.set(name, value, options);
          }
        } catch {
          // Called from a Server Component; middleware refreshes the session instead.
        }
      },
    },
  });
}
