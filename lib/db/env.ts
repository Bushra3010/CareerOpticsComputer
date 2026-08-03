import "server-only";

/**
 * Server-side environment access.
 *
 * `server-only` makes importing this file from a Client Component a build
 * error, which is the mechanical guarantee behind PRD §20.1: "Do not expose the
 * Supabase service-role key to client code." A code review can be forgotten; a
 * failed build cannot.
 */

function required(name: string): string {
  const value = process.env[name];
  if (!value) {
    // Fail at first use rather than sending an unauthenticated request that
    // returns a confusing 401 much later.
    throw new Error(
      `Missing required environment variable ${name}. Copy .env.example to .env.local and fill it in.`,
    );
  }
  return value;
}

export const serverEnv = {
  get supabaseUrl() {
    return required("NEXT_PUBLIC_SUPABASE_URL");
  },
  get supabaseAnonKey() {
    return required("NEXT_PUBLIC_SUPABASE_ANON_KEY");
  },
  get supabaseServiceRoleKey() {
    return required("SUPABASE_SERVICE_ROLE_KEY");
  },
  get appUrl() {
    return required("NEXT_PUBLIC_APP_URL");
  },
  get appEnv() {
    return (process.env.NEXT_PUBLIC_APP_ENV ?? "local") as
      "local" | "preview" | "staging" | "production";
  },
} as const;
