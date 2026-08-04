import { createClient } from "@/lib/db/server";
import type { Paise } from "@/lib/money";

export interface PublicCourse {
  id: string;
  categoryId: string | null;
  categoryName: string | null;
  name: string;
  slug: string;
  shortDescription: string;
  description: string | null;
  durationLabel: string;
  feePaise: Paise;
}

interface CourseRow {
  id: string;
  category_id: string | null;
  name: string;
  slug: string;
  short_description: string;
  description: string | null;
  duration_label: string;
  fee_paise: number;
  course_categories: { name: string } | { name: string }[] | null;
}

function categoryName(row: CourseRow): string | null {
  const rel = row.course_categories;
  if (!rel) return null;
  return Array.isArray(rel) ? (rel[0]?.name ?? null) : rel.name;
}

function toPublicCourse(row: CourseRow): PublicCourse {
  return {
    id: row.id,
    categoryId: row.category_id,
    categoryName: categoryName(row),
    name: row.name,
    slug: row.slug,
    shortDescription: row.short_description,
    description: row.description,
    durationLabel: row.duration_label,
    feePaise: row.fee_paise as Paise,
  };
}

/** Published courses only — this is the one intentional public read (R22). */
export async function listPublishedCourses(): Promise<PublicCourse[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("courses")
    .select(
      "id, category_id, name, slug, short_description, description, duration_label, fee_paise, course_categories(name)",
    )
    .eq("status", "published")
    .order("display_order", { ascending: true });

  if (error) {
    throw new Error(`Failed to load courses: ${error.message}`);
  }

  return (data ?? []).map((row) => toPublicCourse(row as unknown as CourseRow));
}

export async function getPublishedCourseBySlug(
  slug: string,
): Promise<PublicCourse | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("courses")
    .select(
      "id, category_id, name, slug, short_description, description, duration_label, fee_paise, course_categories(name)",
    )
    .eq("status", "published")
    .eq("slug", slug)
    .maybeSingle();

  if (error) {
    throw new Error(`Failed to load course: ${error.message}`);
  }

  return data ? toPublicCourse(data as unknown as CourseRow) : null;
}
