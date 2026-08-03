import Link from "next/link";
import { BRAND } from "@/lib/brand";

/**
 * Phase 0 placeholder. Replaced by the public home page in Phase 1
 * (see docs/00-build-plan.md §6, step 1.2).
 */
export default function Home() {
  return (
    <main className="container-public flex flex-1 flex-col justify-center py-12">
      <p className="text-meta font-semibold tracking-wide text-orange-500 uppercase">
        Phase 0 · Foundation
      </p>
      <h1 className="text-display text-navy-900 mt-2">{BRAND.name}</h1>
      <p className="text-body text-text-secondary mt-3 max-w-prose">
        {BRAND.tagline}. The public website is built in Phase 1. The design
        system is available for review now.
      </p>
      <Link
        href="/dev/components"
        className="text-body mt-6 font-semibold text-blue-700 underline underline-offset-4"
      >
        Open the component showcase
      </Link>
    </main>
  );
}
