import { redirect } from "next/navigation";

import { StatusBadge } from "@/components/ui/badge";
import { createClient } from "@/lib/db/server";
import { getCurrentCentreContext } from "@/features/centres/current-membership";
import { SignOutButton } from "@/features/auth/components/sign-out-button";

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
  // Guarded before the membership lookup rather than folded into it, so `user`
  // narrows to non-null for the account section below. Same destination either
  // way — the layout has already bounced a signed-out visitor to sign-in.
  if (!user) redirect("/centre");

  const context = await getCurrentCentreContext(supabase, user.id);
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

      {/* Sign out lives here because the shell only offers it on mobile: the
          layout passes SignOutButton as `headerAction`, and that lands in
          AppHeader, which is hidden at `lg`. The desktop TopBar carries only
          notifications, help and a link to this page (§8.2), so without this
          section a centre user on a desktop has no way to end their session.
          The account is named because a shared centre machine gets shared
          logins, and "sign out" should say whose. */}
      <section className="border-border mt-10 max-w-2xl border-t pt-6">
        <h2 className="text-section text-navy-900">Your account</h2>
        {user.email ? (
          <p className="text-body text-text-secondary mt-2">
            Signed in as {user.email}.
          </p>
        ) : null}
        <div className="mt-4">
          <SignOutButton />
        </div>
      </section>
    </div>
  );
}
