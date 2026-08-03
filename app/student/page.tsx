import { createClient } from "@/lib/db/server";

export default async function StudentDashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <div>
      <h1 className="text-page-title text-navy-900">Student dashboard</h1>
      <p className="text-body text-text-secondary mt-2">
        Signed in as {user?.email}.
      </p>
      <p className="text-body text-text-secondary mt-1">
        Course, timetable and fee details land with the admissions feature.
      </p>
    </div>
  );
}
