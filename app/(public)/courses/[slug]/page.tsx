import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

import { Button } from "@/components/ui/button";
import { getPublishedCourseBySlug } from "@/features/academics/queries";
import { formatPaise, paise } from "@/lib/money";

interface CoursePageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({
  params,
}: CoursePageProps): Promise<Metadata> {
  const { slug } = await params;
  const course = await getPublishedCourseBySlug(slug);
  if (!course) return {};
  return { title: course.name, description: course.shortDescription };
}

export default async function CourseDetailPage({ params }: CoursePageProps) {
  const { slug } = await params;
  const course = await getPublishedCourseBySlug(slug);

  if (!course) {
    notFound();
  }

  return (
    <div className="container-public py-12">
      <Link href="/courses" className="text-body font-semibold text-blue-700">
        ← All courses
      </Link>

      {course.categoryName ? (
        <p className="text-meta mt-6 font-semibold text-blue-700 uppercase">
          {course.categoryName}
        </p>
      ) : null}
      <h1 className="text-page-title text-navy-900 mt-2">{course.name}</h1>
      <p className="text-body text-text-secondary mt-3 max-w-prose">
        {course.shortDescription}
      </p>

      <div className="mt-6 flex flex-wrap gap-8">
        <div>
          <p className="text-meta text-text-secondary uppercase">Duration</p>
          <p className="text-card-title text-navy-900 mt-1">
            {course.durationLabel}
          </p>
        </div>
        <div>
          <p className="text-meta text-text-secondary uppercase">Fee</p>
          <p className="text-card-title text-navy-900 mt-1 tabular-nums">
            {formatPaise(paise(course.feePaise))}
          </p>
        </div>
      </div>

      {course.description ? (
        <p className="text-body text-text mt-8 max-w-prose whitespace-pre-line">
          {course.description}
        </p>
      ) : null}

      <div className="mt-8">
        <Button asChild>
          <Link href="/admissions/enquiry">Enquire about this course</Link>
        </Button>
      </div>
    </div>
  );
}
