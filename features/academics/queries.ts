import { createClient } from "@/lib/db/server";
import { formatPaise, type Paise } from "@/lib/money";

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

export interface AdminCourseRow {
  id: string;
  name: string;
  slug: string;
  categoryName: string;
  durationLabel: string;
  feeLabel: string;
  status: "draft" | "published" | "archived";
}

/** Every course regardless of status, via `courses_platform_read_all`
 *  (app.is_platform_admin() only). */
export async function listAllCoursesForAdmin(): Promise<AdminCourseRow[]> {
  const supabase = await createClient();

  const { data } = await supabase
    .from("courses")
    .select(
      "id, name, slug, duration_label, fee_paise, status, course_categories(name)",
    )
    .order("display_order");

  return ((data ?? []) as unknown as CourseRow[]).map((row) => ({
    id: row.id,
    name: row.name,
    slug: row.slug,
    categoryName: categoryName(row) ?? "Uncategorised",
    durationLabel: row.duration_label,
    feeLabel: formatPaise(row.fee_paise as Paise),
    status: (row as unknown as { status: "draft" | "published" | "archived" })
      .status,
  }));
}

export interface CourseCategoryOption {
  id: string;
  name: string;
}

export async function listCourseCategories(): Promise<CourseCategoryOption[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("course_categories")
    .select("id, name")
    .order("display_order");
  return data ?? [];
}
