import { redirect } from "next/navigation";

import { Field } from "@/components/ui/field";
import { Select, Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/db/server";
import { getCurrentCentreContext } from "@/features/centres/current-membership";
import { listPublishedCourses } from "@/features/academics/queries";
import { getAttendanceRoster } from "@/features/attendance/queries";
import { AttendanceForm } from "@/features/attendance/components/attendance-form";

interface PageProps {
  searchParams: Promise<{ courseId?: string; date?: string }>;
}

export default async function TakeAttendancePage({ searchParams }: PageProps) {
  const { courseId, date } = await searchParams;
  const sessionDate = date || new Date().toISOString().slice(0, 10);

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const context = user
    ? await getCurrentCentreContext(supabase, user.id)
    : null;
  if (!context) {
    redirect("/centre");
  }

  const courses = await listPublishedCourses();
  const roster = courseId
    ? await getAttendanceRoster(context.centreId, courseId, sessionDate)
    : [];

  return (
    <div>
      <h1 className="text-page-title text-navy-900">Take attendance</h1>

      <form method="get" className="mt-6 flex flex-wrap items-end gap-4">
        <Field id="courseId" label="Course" className="w-64">
          <Select name="courseId" defaultValue={courseId ?? ""}>
            <option value="" disabled>
              Select a course
            </option>
            {courses.map((course) => (
              <option key={course.id} value={course.id}>
                {course.name}
              </option>
            ))}
          </Select>
        </Field>

        <Field id="date" label="Date" className="w-48">
          <Input name="date" type="date" defaultValue={sessionDate} />
        </Field>

        <Button type="submit" variant="secondary">
          Load roster
        </Button>
      </form>

      {courseId ? (
        <div className="mt-8">
          <AttendanceForm
            courseId={courseId}
            sessionDate={sessionDate}
            roster={roster}
          />
        </div>
      ) : null}
    </div>
  );
}
