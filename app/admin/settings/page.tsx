import type { Metadata } from "next";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PermissionDeniedState } from "@/components/states";
import { createClient } from "@/lib/db/server";
import { getHeadOfficeContext } from "@/features/exams/access";
import { OrganisationNameForm } from "@/features/settings/components/organisation-name-form";

export const metadata: Metadata = {
  title: "Settings",
  robots: { index: false },
};

export default async function AdminSettingsPage() {
  const supabase = await createClient();
  const context = await getHeadOfficeContext(supabase);

  if (!context) {
    return (
      <div>
        <h1 className="text-page-title text-navy-900">Settings</h1>
        <PermissionDeniedState className="mt-8" />
      </div>
    );
  }

  const { data: org } = await supabase
    .from("organizations")
    .select("name, slug, currency_code, timezone, created_at")
    .eq("id", context.organizationId)
    .maybeSingle();

  if (!org) {
    return (
      <div>
        <h1 className="text-page-title text-navy-900">Settings</h1>
        <PermissionDeniedState className="mt-8" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-page-title text-navy-900">Settings</h1>
        <p className="text-body text-text-secondary mt-1">
          The organisation every centre, student and document belongs to.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Organisation</CardTitle>
        </CardHeader>
        <CardContent>
          <OrganisationNameForm currentName={org.name} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Fixed by the system</CardTitle>
        </CardHeader>
        <CardContent>
          <dl className="grid gap-4 sm:grid-cols-2">
            <div>
              <dt className="text-meta text-text-secondary">Public slug</dt>
              <dd className="text-body text-text mt-0.5">{org.slug}</dd>
            </div>
            <div>
              <dt className="text-meta text-text-secondary">Currency</dt>
              <dd className="text-body text-text mt-0.5">
                {org.currency_code} — stored as integer paise, never floats
              </dd>
            </div>
            <div>
              <dt className="text-meta text-text-secondary">Timezone</dt>
              <dd className="text-body text-text mt-0.5">{org.timezone}</dd>
            </div>
            <div>
              <dt className="text-meta text-text-secondary">Created</dt>
              <dd className="text-body text-text mt-0.5">
                {org.created_at.slice(0, 10)}
              </dd>
            </div>
          </dl>
          <p className="text-meta text-text-secondary mt-4">
            Changing any of these is a data migration, not a setting — the slug
            anchors public URLs, and money already posted is denominated in the
            currency above.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
