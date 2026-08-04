import { createClient } from "@/lib/db/server";
import type { Database } from "@/types/database.generated";

type StudentRow = Database["public"]["Tables"]["students"]["Row"];

export async function listStudentsForCentre(
  centreId: string,
): Promise<StudentRow[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("students")
    .select("*")
    .eq("centre_id", centreId)
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(`Failed to load students: ${error.message}`);
  }

  return data ?? [];
}
