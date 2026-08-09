"use client";

import { useActionState } from "react";

import { Button } from "@/components/ui/button";

import { setNoticeStatus, type NoticeActionState } from "../actions";

const initial: NoticeActionState = { status: "idle" };

export function NoticeStatusButton({
  noticeId,
  currentStatus,
}: {
  noticeId: string;
  currentStatus: "draft" | "active" | "retired";
}) {
  const next = currentStatus === "active" ? "retired" : "active";
  const bound = setNoticeStatus.bind(null, noticeId, next);
  const [, action, pending] = useActionState(bound, initial);

  return (
    <form action={action}>
      <Button
        type="submit"
        variant="tertiary"
        size="sm"
        loading={pending}
        loadingLabel="Saving"
      >
        {next === "active" ? "Publish" : "Retire"}
      </Button>
    </form>
  );
}
