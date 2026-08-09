"use client";

import { useActionState } from "react";

import { Button } from "@/components/ui/button";

import {
  archiveAnnouncement,
  publishAnnouncement,
  type AnnouncementActionState,
} from "../actions";

const initial: AnnouncementActionState = { status: "idle" };

export function AnnouncementStatusButton({
  announcementId,
  currentStatus,
}: {
  announcementId: string;
  currentStatus: "draft" | "active" | "retired";
}) {
  const action =
    currentStatus === "active" ? archiveAnnouncement : publishAnnouncement;
  const bound = action.bind(null, announcementId);
  const [, formAction, pending] = useActionState(bound, initial);

  if (currentStatus === "retired") return null;

  return (
    <form action={formAction}>
      <Button
        type="submit"
        variant="tertiary"
        size="sm"
        loading={pending}
        loadingLabel="Saving"
      >
        {currentStatus === "active" ? "Archive" : "Publish"}
      </Button>
    </form>
  );
}
