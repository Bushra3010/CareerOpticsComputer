import type { SupabaseClient } from "@supabase/supabase-js";

import type { Database } from "@/types/database.generated";

/**
 * Thin escape hatch around `supabase.rpc(...)`. postgrest-js's RPC generics
 * resolve against a fully code-generated `Database` type (SetofOptions,
 * __InternalSupabase, etc.) that our hand-maintained `database.generated.ts`
 * doesn't reproduce yet. Once `npm run db:types` runs against a reachable
 * Postgres connection, delete this and call `supabase.rpc` directly.
 */
export async function callRpc<Fn extends keyof Database["public"]["Functions"]>(
  supabase: SupabaseClient<Database>,
  fn: Fn,
  args: Database["public"]["Functions"][Fn]["Args"],
): Promise<{
  data: Database["public"]["Functions"][Fn]["Returns"] | null;
  error: { message: string } | null;
}> {
  const client = supabase as unknown as {
    rpc: (
      name: string,
      args: unknown,
    ) => Promise<{
      data: Database["public"]["Functions"][Fn]["Returns"] | null;
      error: { message: string } | null;
    }>;
  };
  return client.rpc(fn, args);
}
