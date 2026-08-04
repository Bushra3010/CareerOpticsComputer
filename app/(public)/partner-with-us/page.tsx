import Link from "next/link";
import type { Metadata } from "next";

import { Button } from "@/components/ui/button";
import { BRAND } from "@/lib/brand";

export const metadata: Metadata = {
  title: "Open a centre",
  description: `Become a ${BRAND.shortName} franchise partner.`,
};

export default function PartnerWithUsPage() {
  return (
    <div className="container-public max-w-2xl py-12">
      <h1 className="text-page-title text-navy-900">
        Open a {BRAND.shortName} centre
      </h1>
      <p className="text-body text-text-secondary mt-2 max-w-prose">
        Run a computer education centre backed by a proven curriculum,
        examination system and certification — while owning and operating your
        own business.
      </p>

      <div className="text-body text-text mt-8 space-y-4">
        <p>
          Head office reviews every application for location, facilities and
          applicant background before approval. Once approved, your centre is
          issued a code, your account is created, and you can start onboarding
          students.
        </p>
      </div>

      <div className="mt-8">
        <Button asChild>
          <Link href="/partner-with-us/apply">Apply now</Link>
        </Button>
      </div>
    </div>
  );
}
