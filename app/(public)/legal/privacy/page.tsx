import type { Metadata } from "next";

import { BRAND } from "@/lib/brand";

export const metadata: Metadata = {
  title: "Privacy policy",
};

export default function PrivacyPolicyPage() {
  return (
    <div className="container-public max-w-3xl py-12">
      <h1 className="text-page-title text-navy-900">Privacy policy</h1>
      <p className="text-meta text-text-secondary mt-2">
        Draft — pending legal review.
      </p>

      <div className="text-body text-text mt-8 space-y-6">
        <section>
          <h2 className="text-section text-navy-900">Information we collect</h2>
          <p className="mt-2">
            When you enquire, apply for admission, or apply to open a centre, we
            collect the details you provide — name, contact information, course
            interest, and, for admissions, identity and academic documents
            required for enrolment and certification.
          </p>
        </section>
        <section>
          <h2 className="text-section text-navy-900">How we use it</h2>
          <p className="mt-2">
            We use your information to respond to enquiries, process admissions,
            issue certificates, and communicate about your course or centre.
            Government ID numbers are never stored in full — only the last four
            digits, alongside a one-way cryptographic hash used solely to detect
            duplicate registrations.
          </p>
        </section>
        <section>
          <h2 className="text-section text-navy-900">
            Who can see your information
          </h2>
          <p className="mt-2">
            Access is limited to {BRAND.shortName} staff and your centre&rsquo;s
            staff on a need-to-know basis, enforced at the database level, not
            only in the application.
          </p>
        </section>
        <section>
          <h2 className="text-section text-navy-900">Your rights</h2>
          <p className="mt-2">
            You may request a copy of the information we hold about you, or
            request its correction or erasure where we are not required to
            retain it, by contacting your centre or head office.
          </p>
        </section>
      </div>
    </div>
  );
}
