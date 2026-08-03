import Link from "next/link";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { listPublishedCourses } from "@/features/academics/queries";
import { BRAND } from "@/lib/brand";
import { formatPaise, paise } from "@/lib/money";

export default async function HomePage() {
  const courses = await listPublishedCourses();
  const featured = courses.slice(0, 3);

  return (
    <>
      <section className="container-public py-16">
        <p className="text-meta font-semibold tracking-wide text-orange-500 uppercase">
          {BRAND.supportingPhrase}
        </p>
        <h1 className="text-display text-navy-900 mt-2 max-w-2xl">
          {BRAND.tagline}
        </h1>
        <p className="text-body text-text-secondary mt-4 max-w-prose">
          {BRAND.name} trains students across India in computer applications,
          office tools and accounting — delivered through a network of franchise
          centres.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Button asChild>
            <Link href="/courses">Explore courses</Link>
          </Button>
          <Button asChild variant="secondary">
            <Link href="/partner-with-us">Partner with us</Link>
          </Button>
        </div>
      </section>

      <section className="container-public py-10">
        <div className="flex items-baseline justify-between gap-4">
          <h2 className="text-section text-navy-900">Popular courses</h2>
          <Link
            href="/courses"
            className="text-body font-semibold text-blue-700"
          >
            View all courses
          </Link>
        </div>

        {featured.length === 0 ? (
          <p className="text-body text-text-secondary mt-6">
            Courses will appear here once the catalogue is published.
          </p>
        ) : (
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {featured.map((course) => (
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
      </section>
    </>
  );
}
