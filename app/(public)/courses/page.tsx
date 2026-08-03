import Link from "next/link";
import type { Metadata } from "next";

import {
  Card,
  CardContent,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { listPublishedCourses } from "@/features/academics/queries";
import { formatPaise, paise } from "@/lib/money";

export const metadata: Metadata = {
  title: "Courses",
  description:
    "Computer education courses offered across Career Optics centres.",
};

export default async function CoursesPage() {
  const courses = await listPublishedCourses();

  return (
    <div className="container-public py-12">
      <h1 className="text-page-title text-navy-900">Courses</h1>
      <p className="text-body text-text-secondary mt-2 max-w-prose">
        Diplomas, certificate programs and skill courses delivered at Career
        Optics centres nationwide.
      </p>

      {courses.length === 0 ? (
        <p className="text-body text-text-secondary mt-8">
          No courses are published yet.
        </p>
      ) : (
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {courses.map((course) => (
            <Card key={course.id} className="p-6">
              <CardContent className="space-y-2 p-0">
                {course.categoryName ? (
                  <p className="text-meta font-semibold text-blue-700 uppercase">
                    {course.categoryName}
                  </p>
                ) : null}
                <CardTitle>{course.name}</CardTitle>
                <CardDescription>{course.shortDescription}</CardDescription>
                <div className="text-body text-text-secondary flex items-center justify-between pt-2">
                  <span>{course.durationLabel}</span>
                  <span className="text-navy-900 font-semibold tabular-nums">
                    {formatPaise(paise(course.feePaise))}
                  </span>
                </div>
                <Link
                  href={`/courses/${course.slug}`}
                  className="text-body inline-block pt-2 font-semibold text-blue-700"
                >
                  View details
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
