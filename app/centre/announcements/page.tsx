import type { Metadata } from "next";

import { StatusBadge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState, PermissionDeniedState } from "@/components/states";
import { createClient } from "@/lib/db/server";
import { can } from "@/lib/permissions";
import { getCurrentCentreContext } from "@/features/centres/current-membership";
import { CreateAnnouncementForm } from "@/features/announcements/components/create-announcement-form";
import { AnnouncementStatusButton } from "@/features/announcements/components/announcement-status-button";
import {
  listAnnouncementsForManager,
  listPublishedAnnouncements,
} from "@/features/announcements/queries";

export const metadata: Metadata = {
  title: "Announcements",
  robots: { index: false },
};

export default async function CentreAnnouncementsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const context = user
    ? await getCurrentCentreContext(supabase, user.id)
    : null;

  if (!context) {
    return (
      <div>
        <h1 className="text-page-title text-navy-900">Announcements</h1>
        <PermissionDeniedState className="mt-8" />
      </div>
    );
  }

  const canManage = await can(
    supabase,
    "announcement.manage",
    context.organizationId,
    context.centreId,
  );

  // A manager sees everything RLS's manage arm reaches (their own centre's
  // full history, drafts included); everyone else sees the published feed.
  const announcements = canManage
    ? await listAnnouncementsForManager()
    : await listPublishedAnnouncements();

  return (
    <div className="space-y-8">
      <h1 className="text-page-title text-navy-900">Announcements</h1>

      {canManage ? (
        <Card>
          <CardHeader>
            <CardTitle>New announcement</CardTitle>
          </CardHeader>
          <CardContent>
            <CreateAnnouncementForm fixedCentreId={context.centreId} />
          </CardContent>
        </Card>
      ) : null}

      {announcements.length === 0 ? (
        <EmptyState
          title="No announcements yet"
          description="Nothing has been posted to your centre yet."
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
                      : "Your centre"}
                    {a.publishOn
                      ? ` · published ${a.publishOn}`
                      : " · not yet published"}
                  </p>
                </div>
                {canManage ? (
                  <div className="flex items-center gap-2">
                    <StatusBadge status={a.status} />
                    <AnnouncementStatusButton
                      announcementId={a.id}
                      currentStatus={a.status}
                    />
                  </div>
                ) : null}
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
