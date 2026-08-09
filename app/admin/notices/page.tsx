import Link from "next/link";
import type { Metadata } from "next";

import { StatusBadge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState, PermissionDeniedState } from "@/components/states";
import { createClient } from "@/lib/db/server";
import { getHeadOfficeContext } from "@/features/exams/access";
import { CreateNoticeForm } from "@/features/notices/components/create-notice-form";
import { NoticeStatusButton } from "@/features/notices/components/notice-status-button";
import { listAllNoticesForAdmin } from "@/features/notices/queries";

export const metadata: Metadata = {
  title: "Notices",
  robots: { index: false },
};

export default async function AdminNoticesPage() {
  const supabase = await createClient();
  const context = await getHeadOfficeContext(supabase);

  if (!context) {
    return (
      <div>
        <h1 className="text-page-title text-navy-900">Notices</h1>
        <PermissionDeniedState className="mt-8" />
      </div>
    );
  }

  const notices = await listAllNoticesForAdmin();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-page-title text-navy-900">Notices</h1>
        <p className="text-body text-text-secondary mt-1">
          Public news and announcements shown at{" "}
          <Link href="/notices" className="text-blue-700 hover:underline">
            /notices
          </Link>
          . A notice is created as a draft and is invisible until published.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>New notice</CardTitle>
        </CardHeader>
        <CardContent>
          <CreateNoticeForm />
        </CardContent>
      </Card>

      {notices.length === 0 ? (
        <EmptyState
          title="No notices yet"
          description="The first notice you create appears here."
        />
      ) : (
        <ul className="space-y-3">
          {notices.map((n) => (
            <li
              key={n.id}
              className="border-border bg-surface rounded-[var(--radius-card)] border p-4"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-body text-text font-semibold">{n.title}</p>
                  <p className="text-meta text-text-secondary">
                    /notices/{n.slug}
                    {n.publishedOn
                      ? ` · published ${n.publishedOn}`
                      : " · not yet published"}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <StatusBadge status={n.status} />
                  <NoticeStatusButton
                    noticeId={n.id}
                    currentStatus={n.status}
                  />
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
