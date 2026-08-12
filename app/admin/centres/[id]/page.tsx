import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

import { StatusBadge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PermissionDeniedState } from "@/components/states";
import { createClient } from "@/lib/db/server";
import { getHeadOfficeContext } from "@/features/exams/access";
import { getCentreForAdmin } from "@/features/centres/queries";
import { CentreStatusForm } from "@/features/centres/components/admin/status-form";
import { CentreProfileForm } from "@/features/centres/components/admin/profile-form";
import { DeleteCentreForm } from "@/features/centres/components/admin/delete-centre-form";
import { CentreOwnerForm } from "@/features/centres/components/admin/owner-form";
import { createServiceRoleClient } from "@/lib/db/service-role";

export const metadata: Metadata = { title: "Centre", robots: { index: false } };

export default async function AdminCentreDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const context = await getHeadOfficeContext(supabase);

  if (!context) {
    return (
      <div>
        <h1 className="text-page-title text-navy-900">Centre</h1>
        <PermissionDeniedState className="mt-8" />
      </div>
    );
  }

  const centre = await getCentreForAdmin(id);
  if (!centre) notFound();

  /* The owner's email lives in auth.users, outside the public schema, so an
     RLS-scoped client cannot read it — this lookup needs the service role. */
  const admin = createServiceRoleClient();
  const { data: ownerMembership } = await admin
    .from("memberships")
    .select("user_id, roles!inner(code), profiles!inner(full_name)")
    .eq("centre_id", centre.id)
    .eq("status", "active")
    .eq("roles.code", "centre_owner")
    .maybeSingle();

  let owner: { fullName: string | null; email: string | null } | null = null;
  if (ownerMembership?.user_id) {
    const { data: authUser } = await admin.auth.admin.getUserById(
      ownerMembership.user_id as string,
    );
    owner = {
      fullName:
        (ownerMembership as { profiles?: { full_name?: string } }).profiles
          ?.full_name ?? null,
      email: authUser?.user?.email ?? null,
    };
  }

  return (
    <div className="space-y-8">
      <div>
        <Link
          href="/admin/centres"
          className="text-meta text-text-secondary hover:text-text"
        >
          &larr; All centres
        </Link>
        <div className="mt-2 flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="text-page-title text-navy-900">{centre.name}</h1>
            <p className="text-meta text-text-secondary mt-1">
              {centre.code} &middot; {centre.studentCount} students &middot;{" "}
              {centre.staffCount} active staff &middot; since {centre.createdOn}
            </p>
          </div>
          <StatusBadge status={centre.status} />
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Profile</CardTitle>
          </CardHeader>
          <CardContent>
            <CentreProfileForm centreId={centre.id} centre={centre} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Status</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-meta text-text-secondary max-w-prose">
              Suspending blocks new admissions, attendance, financial posting
              and exams at this centre. Head office can still review its
              historical records.
            </p>
            <CentreStatusForm
              centreId={centre.id}
              currentStatus={centre.status}
            />
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Centre sign-in</CardTitle>
        </CardHeader>
        <CardContent>
          <CentreOwnerForm centreId={centre.id} owner={owner} />
        </CardContent>
      </Card>

      {/* Kept apart from the everyday forms above, and last on the page, so it
          is never the thing under the cursor when someone means to edit. */}
      <Card className="border-danger-border">
        <CardHeader>
          <CardTitle>Delete centre</CardTitle>
        </CardHeader>
        <CardContent>
          <DeleteCentreForm
            centreId={centre.id}
            centreCode={centre.code}
            centreName={centre.name}
          />
        </CardContent>
      </Card>
    </div>
  );
}
