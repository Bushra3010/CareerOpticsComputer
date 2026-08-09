import { createClient } from "@/lib/db/server";

export interface MaterialRow {
  id: string;
  title: string;
  description: string | null;
  kind: "file" | "link";
  /** A signed URL for a file, or the link itself. Null when a file cannot
   *  be signed for this reader — which is the storage policy refusing. */
  href: string | null;
  fileName: string | null;
  scopeLabel: string;
  status: "draft" | "active" | "retired";
  addedOn: string;
}

interface MaterialSelect {
  id: string;
  centre_id: string | null;
  course_id: string | null;
  batch_id: string | null;
  title: string;
  description: string | null;
  kind: "file" | "link";
  storage_path: string | null;
  url: string | null;
  status: MaterialRow["status"];
  created_at: string;
  courses: { name: string } | { name: string }[] | null;
  batches:
    { code: string; name: string } | { code: string; name: string }[] | null;
}

const SELECT =
  "id, centre_id, course_id, batch_id, title, description, kind, storage_path, url, status, created_at, courses(name), batches(code, name)";

function one<T>(rel: unknown): T | null {
  return Array.isArray(rel) ? ((rel[0] as T) ?? null) : ((rel as T) ?? null);
}

async function toRows(
  supabase: Awaited<ReturnType<typeof createClient>>,
  rows: MaterialSelect[],
): Promise<MaterialRow[]> {
  return Promise.all(
    rows.map(async (m) => {
      const course = one<{ name: string }>(m.courses);
      const batch = one<{ code: string; name: string }>(m.batches);

      let href = m.url;
      let fileName: string | null = null;
      if (m.kind === "file" && m.storage_path) {
        fileName = m.storage_path.split("/").pop() ?? null;
        // Signed with the reader's own session, so the storage policy is
        // what decides whether a URL exists at all.
        const { data } = await supabase.storage
          .from("materials-private")
          .createSignedUrl(m.storage_path, 60 * 60);
        href = data?.signedUrl ?? null;
      }

      const scopeLabel = batch
        ? `${batch.code} — ${batch.name}`
        : course
          ? course.name
          : m.centre_id
            ? "Everyone at this centre"
            : "Everyone";

      return {
        id: m.id,
        title: m.title,
        description: m.description,
        kind: m.kind,
        href,
        fileName,
        scopeLabel,
        status: m.status,
        addedOn: m.created_at.slice(0, 10),
      };
    }),
  );
}

/** Everything a centre's staff may see — RLS decides the reach. */
export async function listMaterialsForCentre(): Promise<MaterialRow[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("study_materials")
    .select(SELECT)
    .order("created_at", { ascending: false })
    .limit(200);
  return toRows(supabase, (data ?? []) as unknown as MaterialSelect[]);
}

/**
 * The signed-in student's materials. RLS resolves "mine" through the
 * enrolment-scope function, so there is no filter here to keep in step
 * with it — an unscoped select returns exactly what the student may read.
 */
export async function listMaterialsForStudent(): Promise<MaterialRow[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("study_materials")
    .select(SELECT)
    .eq("status", "active")
    .order("created_at", { ascending: false })
    .limit(200);
  return toRows(supabase, (data ?? []) as unknown as MaterialSelect[]);
}
