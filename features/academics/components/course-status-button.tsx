"use client";

import { useActionState } from "react";

import { Button } from "@/components/ui/button";

import { setCourseStatus, type AcademicsActionState } from "../actions";

const initial: AcademicsActionState = { status: "idle" };

export function CourseStatusButton({
  courseId,
  currentStatus,
}: {
  courseId: string;
  currentStatus: "draft" | "published" | "archived";
}) {
  const next = currentStatus === "published" ? "archived" : "published";
  const bound = setCourseStatus.bind(null, courseId, next);
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
        {next === "published" ? "Publish" : "Archive"}
      </Button>
    </form>
  );
}
