import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

import { getPublishedNoticeBySlug } from "@/features/notices/queries";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const notice = await getPublishedNoticeBySlug(slug);
  if (!notice) return { title: "Notice not found" };
  return {
    title: notice.title,
    description: notice.body.slice(0, 150),
  };
}

export default async function NoticePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const notice = await getPublishedNoticeBySlug(slug);
  if (!notice) notFound();

  return (
    <div className="container-public py-12">
      <Link
        href="/notices"
        className="text-body text-text-secondary hover:underline"
      >
        &larr; All notices
      </Link>
      <h1 className="text-page-title text-navy-900 mt-4">{notice.title}</h1>
      <p className="text-meta text-text-secondary mt-1">
        {new Date(notice.publishedOn).toLocaleDateString("en-IN", {
          dateStyle: "long",
        })}
      </p>
      <div className="text-body text-text mt-8 max-w-prose whitespace-pre-wrap">
        {notice.body}
      </div>
    </div>
  );
}
