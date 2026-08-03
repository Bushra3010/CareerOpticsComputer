import type { Metadata } from "next";

import { BRAND } from "@/lib/brand";

export const metadata: Metadata = {
  title: "About us",
  description: `About ${BRAND.name} — computer education across a franchise network of centres.`,
};

export default function AboutPage() {
  return (
    <div className="container-public max-w-3xl py-12">
      <h1 className="text-page-title text-navy-900">About {BRAND.shortName}</h1>
      <p className="text-body text-text-secondary mt-2">
        {BRAND.supportingPhrase}
      </p>

      <div className="text-body text-text mt-8 space-y-5">
        <p>
          {BRAND.name} trains students in computer applications, office
          productivity tools and accounting software through a network of
          franchise centres. Our programs range from short foundation courses to
          comprehensive diplomas, designed for learners starting their first job
          as well as small-business owners upgrading their skills.
        </p>
        <p>
          Every centre in our network follows the same curriculum, examination
          and certification standards, so a certificate earned at any Career
          Optics centre carries the same value. Centres are independently owned
          and operated under a franchise agreement with head office oversight of
          academics, examinations and quality.
        </p>
        <p>
          We publish a public verification tool so employers and institutions
          can confirm a student&rsquo;s registration or certificate directly —
          see{" "}
          <a
            href="/verify"
            className="font-semibold text-blue-700 underline underline-offset-4"
          >
            Verify a registration or certificate
          </a>
          .
        </p>
      </div>
    </div>
  );
}
