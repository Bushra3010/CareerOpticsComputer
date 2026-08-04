import type { Metadata } from "next";

import { EnquiryForm } from "@/features/admissions/components/enquiry-form";
import { listPublishedCourses } from "@/features/academics/queries";

export const metadata: Metadata = {
  title: "Admission enquiry",
  description:
    "Tell us what you want to learn and a centre near you will get in touch.",
};

export default async function AdmissionEnquiryPage() {
  const courses = await listPublishedCourses();

  return (
    <div className="container-public max-w-2xl py-12">
      <h1 className="text-page-title text-navy-900">Admission enquiry</h1>
      <p className="text-body text-text-secondary mt-2 max-w-prose">
        Share a few details and a counsellor from your nearest Career Optics
        centre will reach out.
      </p>

      <div className="mt-8">
        <EnquiryForm courses={courses} />
      </div>
    </div>
  );
}
