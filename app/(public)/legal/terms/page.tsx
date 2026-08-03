import type { Metadata } from "next";

import { BRAND } from "@/lib/brand";

export const metadata: Metadata = {
  title: "Terms of use",
};

export default function TermsOfUsePage() {
  return (
    <div className="container-public max-w-3xl py-12">
      <h1 className="text-page-title text-navy-900">Terms of use</h1>
      <p className="text-meta text-text-secondary mt-2">
        Draft — pending legal review.
      </p>

      <div className="text-body text-text mt-8 space-y-6">
        <section>
          <h2 className="text-section text-navy-900">Enrolment</h2>
          <p className="mt-2">
            Enrolment in a course is confirmed only once the applicable fee
            instalment and required documents are received and verified by the
            centre. Course fees, once paid, follow the refund policy below.
          </p>
        </section>
        <section>
          <h2 className="text-section text-navy-900">
            Attendance and eligibility
          </h2>
          <p className="mt-2">
            Each course specifies a minimum attendance percentage for
            examination and certificate eligibility. Attendance requirements are
            shown on your course and enrolment pages once you are registered.
          </p>
        </section>
        <section>
          <h2 className="text-section text-navy-900">
            Examinations and certification
          </h2>
          <p className="mt-2">
            Results are published only after moderation and are not final until
            published. Certificates are issued against a published result and
            can be verified publicly using the registration number or
            certificate number.
          </p>
        </section>
        <section>
          <h2 className="text-section text-navy-900">Franchise centres</h2>
          <p className="mt-2">
            {BRAND.name} centres are independently owned and operated under a
            franchise agreement. Head office sets and audits academic,
            examination and service standards across all centres.
          </p>
        </section>
      </div>
    </div>
  );
}
