import type { Metadata } from "next";

import { EmptyState } from "@/components/states";
import { listPublishedAnnouncements } from "@/features/announcements/queries";

export const metadata: Metadata = {
  title: "Announcements",
  robots: { index: false },
};

export default async function StudentAnnouncementsPage() {
  const announcements = await listPublishedAnnouncements();

  return (
    <div className="space-y-6">
      <h1 className="text-page-title text-navy-900">Announcements</h1>

      {announcements.length === 0 ? (
        <EmptyState
          title="Nothing here yet"
          description="Announcements from your centre and head office appear here."
        />
      ) : (
        <ul className="space-y-3">
          {announcements.map((a) => (
            <li
              key={a.id}
              className="border-border bg-surface rounded-[var(--radius-card)] border p-4"
            >
              <p className="text-body text-text font-semibold">{a.title}</p>
              <p className="text-meta text-text-secondary">
                {a.scopeType === "organization" ? "Everyone" : "Your centre"}
                {a.publishOn ? ` · ${a.publishOn}` : ""}
              </p>
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
