import { redirect } from "next/navigation";

import { StatusBadge } from "@/components/ui/badge";
import { createClient } from "@/lib/db/server";
import { getCurrentCentreContext } from "@/features/centres/current-membership";

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-meta text-text-secondary uppercase">{label}</dt>
      <dd className="text-body text-text mt-1">{value}</dd>
    </div>
  );
}

export default async function CentreProfilePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const context = user
    ? await getCurrentCentreContext(supabase, user.id)
    : null;
  if (!context) redirect("/centre");

  const { data: centre } = await supabase
    .from("centres")
    .select("code, name, status, address, city, state, pincode, created_at")
    .eq("id", context.centreId)
    .maybeSingle();

  if (!centre) redirect("/centre");

  return (
    <div>
      <div className="flex flex-wrap items-center gap-3">
        <h1 className="text-page-title text-navy-900">{centre.name}</h1>
        <StatusBadge status={centre.status} />
      </div>
      <p className="text-body text-text-secondary mt-1">{centre.code}</p>

      <dl className="mt-8 grid max-w-2xl gap-6 sm:grid-cols-2">
        <Row label="Centre code" value={centre.code} />
        <Row label="Status" value={centre.status} />
        <Row label="City" value={centre.city ?? "—"} />
        <Row label="State" value={centre.state ?? "—"} />
        <Row label="PIN code" value={centre.pincode ?? "—"} />
        <Row label="Onboarded" value={centre.created_at.slice(0, 10)} />
      </dl>

      <h2 className="text-section text-navy-900 mt-10">Address</h2>
      <p className="text-body text-text mt-2 max-w-prose">
        {centre.address ?? "No address on record."}
      </p>

      {/* Editing a centre's own details, and uploading its documents, is
          route-mapped but not built. Saying so beats a disabled Edit button
          that looks broken. */}
      <p className="text-meta text-text-secondary mt-8 max-w-prose">
        To change these details, contact head office. Self-service editing and
        document uploads are planned.
      </p>
    </div>
  );
}
