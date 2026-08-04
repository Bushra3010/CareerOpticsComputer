import { AdmitStudentForm } from "@/features/students/components/admit-student-form";
import { listPublishedCourses } from "@/features/academics/queries";

export default async function NewStudentPage() {
  const courses = await listPublishedCourses();

  return (
    <div>
      <h1 className="text-page-title text-navy-900">Admit a student</h1>
      <div className="mt-6 max-w-2xl">
        <AdmitStudentForm courses={courses} />
      </div>
    </div>
  );
}
