import { createClient as createSupabaseClient } from "@supabase/supabase-js";

export async function generateStaticParams() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) {
    return [{ id: "placeholder" }];
  }
  const supabase = createSupabaseClient(url, key);
  const { data } = await supabase.from("students").select("id");
  const ids = (data || []).map((s: any) => ({ id: s.id }));
  if (ids.length === 0) {
    return [{ id: "placeholder" }];
  }
  return ids;
}

import StudentDetailClient from "./StudentDetailClient";

export default function Page({ params }: { params: { id: string } }) {
  return <StudentDetailClient id={params.id} />;
}
