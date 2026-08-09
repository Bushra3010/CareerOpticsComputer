import type { Metadata } from "next";

import { StatusBadge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState, PermissionDeniedState } from "@/components/states";
import { createClient } from "@/lib/db/server";
import { getHeadOfficeContext } from "@/features/exams/access";
import { listCentreOptions } from "@/features/exams/queries";
import { AnnouncementStatusButton } from "@/features/announcements/components/announcement-status-button";
import { CreateAnnouncementForm } from "@/features/announcements/components/create-announcement-form";
import { listAnnouncementsForManager } from "@/features/announcements/queries";

export const metadata: Metadata = {
  title: "Announcements",
  robots: { index: false },
};

export default async function AdminAnnouncementsPage() {
  const supabase = await createClient();
  const context = await getHeadOfficeContext(supabase);

  if (!context) {
    return (
      <div>
        <h1 className="text-page-title text-navy-900">Announcements</h1>
        <PermissionDeniedState className="mt-8" />
      </div>
    );
  }

  const [announcements, centres] = await Promise.all([
    listAnnouncementsForManager(),
    listCentreOptions(),
  ]);

  return (
    <div className="space-y-8">
      <h1 className="text-page-title text-navy-900">Announcements</h1>

      <Card>
        <CardHeader>
          <CardTitle>New announcement</CardTitle>
        </CardHeader>
        <CardContent>
          <CreateAnnouncementForm centres={centres} />
        </CardContent>
      </Card>

      {announcements.length === 0 ? (
        <EmptyState
          title="No announcements yet"
          description="Post one above."
        />
      ) : (
        <ul className="space-y-3">
          {announcements.map((a) => (
            <li
              key={a.id}
              className="border-border bg-surface rounded-[var(--radius-card)] border p-4"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-body text-text font-semibold">{a.title}</p>
                  <p className="text-meta text-text-secondary">
                    {a.scopeType === "organization"
                      ? "Everyone"
                      : a.scopeCentreName}
                    {a.publishOn
                      ? ` · published ${a.publishOn}`
                      : " · not yet published"}
                    {a.expiresOn ? ` · expires ${a.expiresOn}` : ""}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <StatusBadge status={a.status} />
                  <AnnouncementStatusButton
                    announcementId={a.id}
                    currentStatus={a.status}
                  />
                </div>
              </div>
              <p className="text-body text-text mt-2 whitespace-pre-wrap">
                {a.body}
              </p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
