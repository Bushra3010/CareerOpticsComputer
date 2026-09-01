import Link from "next/link";
import type { Metadata } from "next";
import { ArrowRight, Building2 } from "lucide-react";

import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/states";
import { listActiveCentres } from "@/features/centres/queries";

export const metadata: Metadata = {
  title: "Find a centre",
  description: "Career Optics centres across India.",
};

export default async function CentresPage() {
  const centres = await listActiveCentres();

  return (
    <div className="container-public py-12">
      <h1 className="text-page-title text-navy-900">Find a centre</h1>
      <p className="text-body text-text-secondary mt-2 max-w-prose">
        Career Optics centres are independently run and follow the same
        curriculum and examination standards nationwide.
      </p>

      {centres.length === 0 ? (
        <Card className="mt-8">
          <EmptyState
            icon={<Building2 />}
            title="No centres listed yet"
            description="Centres will appear here as they are onboarded and approved."
            action={
              <Button asChild variant="secondary">
                <Link href="/partner-with-us">Open a centre</Link>
              </Button>
            }
          />
        </Card>
      ) : (
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {centres.map((centre) => (
            <Card key={centre.id} className="p-6">
              <CardContent className="space-y-1 p-0">
                <p className="text-meta font-semibold text-blue-700 uppercase">
                  {centre.code}
                </p>
                <CardTitle>{centre.name}</CardTitle>
                <p className="text-body text-text-secondary">
                  {[centre.city, centre.state, centre.pincode]
                    .filter(Boolean)
                    .join(", ") || "Address to be confirmed"}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* The route to applying was previously reachable only from the empty
          state above — so the moment the network had a single active centre,
          this page offered a visitor no way to open one. Shown only when the
          grid rendered, because the empty state carries its own action and two
          CTAs for the same thing reads as a mistake.

          Mirrors the home page's closing CTA rather than inventing a second
          treatment for the same job (§17). */}
      {centres.length > 0 ? (
        <section className="mt-12">
          <div
            data-surface="navy"
            className="bg-navy-900 flex flex-wrap items-center justify-between gap-5 rounded-[var(--radius-card)] p-6 lg:p-8"
          >
            <div className="min-w-0">
              <h2 className="text-section text-white">
                No centre near you yet?
              </h2>
              <p className="text-body mt-1 max-w-prose text-white/75">
                Apply to open a Career Optics centre in your area. Head office
                reviews every application before a centre is issued its code.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Button asChild>
                <Link href="/partner-with-us/apply">
                  Apply to open a centre <ArrowRight />
                </Link>
              </Button>
              <Button asChild variant="secondary">
                <Link href="/partner-with-us">How it works</Link>
              </Button>
            </div>
          </div>
        </section>
      ) : null}
    </div>
  );
}
