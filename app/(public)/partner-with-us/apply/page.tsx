import type { Metadata } from "next";

import { CentreApplicationForm } from "@/features/centre-applications/components/application-form";

export const metadata: Metadata = {
  title: "Centre application",
  description: "Apply to open a Career Optics centre.",
};

export default function CentreApplicationPage() {
  return (
    <div className="container-public max-w-2xl py-12">
      <h1 className="text-page-title text-navy-900">Centre application</h1>
      <p className="text-body text-text-secondary mt-2 max-w-prose">
        Tell us about yourself and where you&rsquo;d like to open a centre.
      </p>

      <div className="mt-8">
        <CentreApplicationForm />
      </div>
    </div>
  );
}
