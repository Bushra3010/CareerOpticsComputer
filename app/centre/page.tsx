import { createClient } from "@/lib/db/server";

export default async function CentreDashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: memberships } = await supabase
    .from("memberships")
    .select("centre_id, status")
    .eq("user_id", user!.id)
    .eq("status", "active");

  return (
    <div>
      <h1 className="text-page-title text-navy-900">Centre dashboard</h1>
      <p className="text-body text-text-secondary mt-2">
        Signed in as {user?.email}.
      </p>

      {!memberships || memberships.length === 0 ? (
        <p className="text-body text-text-secondary mt-4">
          No active centre membership found for this account.
        </p>
      ) : (
        <ul className="text-body text-text mt-4 space-y-1">
          {memberships.map((m, i) => (
            <li key={i}>Active membership at centre {m.centre_id}</li>
          ))}
        </ul>
      )}
    </div>
  );
}
