import { createClient } from "@/lib/db/server";

export interface PublicCentre {
  id: string;
  code: string;
  name: string;
  city: string | null;
  state: string | null;
  pincode: string | null;
  address: string | null;
}

/** Active centres only — the second intentional public read (migration 0007). */
export async function listActiveCentres(): Promise<PublicCentre[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("centres")
    .select("id, code, name, city, state, pincode, address")
    .eq("status", "active")
    .order("name", { ascending: true });

  if (error) {
    throw new Error(`Failed to load centres: ${error.message}`);
  }

  return data ?? [];
}
