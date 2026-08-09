import Link from "next/link";
import type { Metadata } from "next";

import {
  Card,
  CardContent,
  CardDescription,
  CardTitle,
} from "@/components/ui/card";
import { listPublishedNotices } from "@/features/notices/queries";

export const metadata: Metadata = {
  title: "Notices",
  description:
    "News, admission dates and announcements from Career Optics Computer Academy.",
};

export default async function NoticesPage() {
  const notices = await listPublishedNotices();

  return (
    <div className="container-public py-12">
      <h1 className="text-page-title text-navy-900">Notices</h1>
      <p className="text-body text-text-secondary mt-2 max-w-prose">
        News, admission dates and announcements from the academy.
      </p>

      {notices.length === 0 ? (
        <p className="text-body text-text-secondary mt-8">
          Nothing has been published yet — check back soon.
        </p>
      ) : (
        <div className="mt-8 space-y-4">
          {notices.map((notice) => (
            <Card key={notice.id} className="p-6">
              <CardContent className="space-y-2 p-0">
                <p className="text-meta text-text-secondary">
                  {new Date(notice.publishedOn).toLocaleDateString("en-IN", {
                    dateStyle: "long",
                  })}
                </p>
                <CardTitle>
                  <Link
                    href={`/notices/${notice.slug}`}
                    className="hover:underline"
                  >
                    {notice.title}
                  </Link>
                </CardTitle>
                <CardDescription className="line-clamp-2">
                  {notice.body}
                </CardDescription>
                <Link
                  href={`/notices/${notice.slug}`}
                  className="text-body inline-block font-semibold text-blue-700 hover:underline"
                >
                  Read the notice
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
