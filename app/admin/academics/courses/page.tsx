import type { Metadata } from "next";

import { StatusBadge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState, PermissionDeniedState } from "@/components/states";
import {
  MobileList,
  MobileListItem,
  ResponsiveCollection,
} from "@/components/tables/mobile-list";
import { createClient } from "@/lib/db/server";
import { getHeadOfficeContext } from "@/features/exams/access";
import {
  listAllCoursesForAdmin,
  listCourseCategories,
} from "@/features/academics/queries";
import { CategoryForm } from "@/features/academics/components/category-form";
import { CourseForm } from "@/features/academics/components/course-form";
import { CourseStatusButton } from "@/features/academics/components/course-status-button";

export const metadata: Metadata = {
  title: "Courses",
  robots: { index: false },
};

export default async function AdminCoursesPage() {
  const supabase = await createClient();
  const context = await getHeadOfficeContext(supabase);

  if (!context) {
    return (
      <div>
        <h1 className="text-page-title text-navy-900">Courses</h1>
        <PermissionDeniedState className="mt-8" />
      </div>
    );
  }

  const [courses, categories] = await Promise.all([
    listAllCoursesForAdmin(),
    listCourseCategories(),
  ]);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-page-title text-navy-900">Courses</h1>
        <p className="text-body text-text-secondary mt-1">
          A course is created as a draft and is invisible on the public
          catalogue until published.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Categories</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <CategoryForm />
          {categories.length > 0 ? (
            <p className="text-meta text-text-secondary">
              {categories.map((c) => c.name).join(" · ")}
            </p>
          ) : null}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>New course</CardTitle>
        </CardHeader>
        <CardContent>
          <CourseForm categories={categories} />
        </CardContent>
      </Card>

      {courses.length === 0 ? (
        <EmptyState
          title="No courses yet"
          description="Create one above. It stays a draft until you publish it."
        />
      ) : (
        <ResponsiveCollection
          list={
            <MobileList label="Courses">
              {courses.map((c) => (
                <MobileListItem
                  key={c.id}
                  title={c.name}
                  subtitle={`${c.categoryName} · ${c.durationLabel}`}
                  status={<StatusBadge status={c.status} />}
                  fields={[{ label: "Fee", value: c.feeLabel }]}
                  action={
                    <CourseStatusButton
                      courseId={c.id}
                      currentStatus={c.status}
                    />
                  }
                />
              ))}
            </MobileList>
          }
          table={
            <div className="border-border rounded-[var(--radius-card)] border">
              <table className="w-full text-left">
                <thead className="bg-surface-subtle">
                  <tr>
                    <th scope="col" className="text-label px-4 py-3">
                      Course
                    </th>
                    <th scope="col" className="text-label px-4 py-3">
                      Category
                    </th>
                    <th scope="col" className="text-label px-4 py-3 text-right">
                      Fee
                    </th>
                    <th scope="col" className="text-label px-4 py-3">
                      Status
                    </th>
                    <th scope="col" className="text-label px-4 py-3"></th>
                  </tr>
                </thead>
                <tbody>
                  {courses.map((c) => (
                    <tr key={c.id} className="border-border border-t">
                      <td className="px-4 py-3">
                        <p className="text-body text-text font-semibold">
                          {c.name}
                        </p>
                        <p className="text-meta text-text-secondary">
                          {c.durationLabel}
                        </p>
                      </td>
                      <td className="text-body text-text-secondary px-4 py-3">
                        {c.categoryName}
                      </td>
                      <td className="text-body px-4 py-3 text-right tabular-nums">
                        {c.feeLabel}
                      </td>
                      <td className="px-4 py-3">
                        <StatusBadge status={c.status} />
                      </td>
                      <td className="px-4 py-3 text-right">
                        <CourseStatusButton
                          courseId={c.id}
                          currentStatus={c.status}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          }
        />
      )}
    </div>
  );
}
