import { createClient } from "@supabase/supabase-js";

const url = import.meta.env.VITE_SUPABASE_URL || "";

/** Exposed so callers can reach endpoints the client itself does not wrap. */
export const supabaseUrl = url;
const anon = import.meta.env.VITE_SUPABASE_ANON_KEY || "";

export const supabase = createClient(url, anon, {
  auth: { persistSession: true, autoRefreshToken: true },
  db: { schema: "public" },
  global: { headers: { "x-application-name": "career-optics-erp" } },
});
