import { createClient } from "@/lib/db/server";
import type { Database } from "@/types/database.generated";

type CentreApplicationRow =
  Database["public"]["Tables"]["centre_applications"]["Row"];

export async function listCentreApplications(): Promise<
  CentreApplicationRow[]
> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("centre_applications")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(`Failed to load centre applications: ${error.message}`);
  }

  return data ?? [];
}

export async function getCentreApplication(
  id: string,
): Promise<CentreApplicationRow | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("centre_applications")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) {
    throw new Error(`Failed to load centre application: ${error.message}`);
  }

  return data;
}
