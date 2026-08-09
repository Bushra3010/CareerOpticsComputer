import type { Metadata } from "next";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/states";
import { getStudentSelfProfile } from "@/features/student-portal/queries";

export const metadata: Metadata = {
  title: "My profile",
  robots: { index: false },
};

export default async function StudentProfilePage() {
  const profile = await getStudentSelfProfile();

  if (!profile) {
    return (
      <div>
        <h1 className="text-page-title text-navy-900">My profile</h1>
        <EmptyState
          className="mt-8"
          title="No student record"
          description="This login is not linked to a student record. Ask your centre."
        />
      </div>
    );
  }

  const rows: { label: string; value: string }[] = [
    { label: "Registration number", value: profile.registrationNumber },
    { label: "Centre", value: profile.centreName ?? "—" },
    { label: "Phone", value: profile.phone ?? "—" },
    { label: "Email", value: profile.email ?? "—" },
    { label: "Guardian", value: profile.guardianName ?? "—" },
    { label: "Date of birth", value: profile.dateOfBirth ?? "—" },
    { label: "Gender", value: profile.gender ?? "—" },
    { label: "Address", value: profile.address ?? "—" },
    { label: "Admitted on", value: profile.admittedOn },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-page-title text-navy-900">My profile</h1>
        <p className="text-body text-text-secondary mt-1">{profile.fullName}</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Details on record</CardTitle>
        </CardHeader>
        <CardContent>
          <dl className="grid gap-4 sm:grid-cols-2">
            {rows.map((r) => (
              <div key={r.label}>
                <dt className="text-meta text-text-secondary">{r.label}</dt>
                <dd className="text-body text-text mt-0.5">{r.value}</dd>
              </div>
            ))}
          </dl>
          <p className="text-meta text-text-secondary mt-4">
            Something wrong here? Tell your centre — corrections are made at the
            centre desk so the change is recorded properly.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
