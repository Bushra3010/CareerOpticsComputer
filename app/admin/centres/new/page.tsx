import Link from "next/link";

import { PermissionDeniedState } from "@/components/states";
import { Card } from "@/components/ui/card";
import { createClient } from "@/lib/db/server";
import { getHeadOfficeContext } from "@/features/exams/access";
import { CreateCentreForm } from "@/features/centres/components/admin/create-centre-form";

export const metadata = { title: "New centre" };

/**
 * Create a centre without a public application.
 *
 * PRD §6.1's application → review → approval flow stays the route for an
 * external franchisee. This page is for a centre the organisation opens itself,
 * where there is no applicant and nothing to review — a gap that left head
 * office with no way at all to add a centre.
 */
export default async function NewCentrePage() {
  const supabase = await createClient();
  const context = await getHeadOfficeContext(supabase);

  if (!context) {
    return (
      <div>
        <h1 className="text-page-title text-navy-900">New centre</h1>
        <PermissionDeniedState
          className="mt-8"
          requiredFor="creating centres"
        />
      </div>
    );
  }

  return (
    <div>
      <nav aria-label="Breadcrumb" className="text-meta mb-2">
        <Link href="/admin/centres" className="text-blue-700 hover:underline">
          Centres
        </Link>
        <span className="text-text-muted"> / New centre</span>
      </nav>

      <h1 className="text-page-title text-navy-900">New centre</h1>
      <p className="text-body text-text-secondary mt-1 max-w-2xl">
        For a centre head office opens itself. A franchisee applying from the
        website comes through{" "}
        <Link
          href="/admin/centre-applications"
          className="font-semibold text-blue-700 hover:underline"
        >
          centre approvals
        </Link>{" "}
        instead, so their documents get reviewed.
      </p>

      <Card className="mt-6 max-w-3xl p-4 lg:p-6">
        <CreateCentreForm />
      </Card>
    </div>
  );
}
