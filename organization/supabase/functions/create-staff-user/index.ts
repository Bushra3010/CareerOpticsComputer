/**
 * Creates or updates a staff login — an accountant, receptionist, teacher,
 * general staff member, or another administrator.
 *
 * The two functions beside this one can each mint exactly one role, because
 * each is tied to a thing that owns the login: create-branch-user gives a
 * branch its BRANCH_ADMIN, create-student-user gives a student their portal
 * account. Nobody could create the people who work *at* the institute without
 * being one of those two things, so this function exists for the rest.
 *
 * As with the others, the account is minted here with the service-role key
 * rather than in the browser: signing a new user up client-side would replace
 * the admin's own session, and the browser only holds the anon key.
 *
 * Unlike the others it also writes the `users` row. Nothing else in the app
 * ever inserted into that table, which is why the All Users page had nothing
 * to list — Supabase Auth held the account and `public.users` never heard
 * about it. Both are written here so the two cannot drift apart.
 *
 * Called from the Add User dialog on the All Users page, via
 * supabase.functions.invoke().
 */
import { createClient } from "jsr:@supabase/supabase-js@2";

/**
 * Allow back exactly the headers the browser asked for.
 *
 * A fixed list is a trap: the app's Supabase client attaches its own
 * `x-application-name` to every request, and any header missing from this reply
 * makes the browser drop the POST after a *successful* preflight. The failure
 * then looks like the function is unreachable rather than like a CORS problem.
 */
const corsFor = (req: Request) => ({
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    req.headers.get("Access-Control-Request-Headers") ??
    "authorization, x-client-info, apikey, content-type, x-application-name",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
});

/** Who may create staff. A branch admin may staff their own branch. */
const ADMIN_ROLES = ["SUPER_ADMIN", "ORGANIZATION_ADMIN", "BRANCH_ADMIN"];

/**
 * What each caller may hand out.
 *
 * Nobody can mint a role above their own — that is the whole point of the
 * split. A branch admin staffing their branch cannot create another branch
 * admin, let alone an organisation admin, because either would let them
 * escape the branch they are scoped to.
 *
 * STUDENT is on no list: student logins carry a `students.userId` link that
 * only create-student-user knows how to make, and one minted here would be a
 * portal account attached to no student record.
 */
const GRANTABLE: Record<string, string[]> = {
  SUPER_ADMIN: ["SUPER_ADMIN", "ORGANIZATION_ADMIN", "BRANCH_ADMIN", "ACCOUNTANT", "RECEPTIONIST", "TEACHER", "STAFF"],
  ORGANIZATION_ADMIN: ["ORGANIZATION_ADMIN", "BRANCH_ADMIN", "ACCOUNTANT", "RECEPTIONIST", "TEACHER", "STAFF"],
  BRANCH_ADMIN: ["ACCOUNTANT", "RECEPTIONIST", "TEACHER", "STAFF"],
};

/** A staff role sits at the branch; the two admin roles sit above it. */
const userTypeFor = (role: string) =>
  role === "SUPER_ADMIN" || role === "ORGANIZATION_ADMIN" ? "ORGANIZATION" : "BRANCH";

/**
 * The admin API cannot filter on user_metadata, so an existing account is
 * found by walking the list. Capped so a bad page count cannot spin forever.
 */
async function findByEmail(admin: ReturnType<typeof createClient>, email: string) {
  const wanted = email.toLowerCase();
  const perPage = 1000;
  for (let page = 1; page <= 20; page++) {
    const { data, error } = await admin.auth.admin.listUsers({ page, perPage });
    if (error) throw new Error(error.message);
    const users = data?.users ?? [];
    const match = users.find((u) => String(u.email ?? "").toLowerCase() === wanted);
    if (match) return match;
    if (users.length < perPage) return null;
  }
  return null;
}

Deno.serve(async (req) => {
  const cors = corsFor(req);
  const json = (body: unknown, status = 200) =>
    new Response(JSON.stringify(body), {
      status,
      headers: { ...cors, "Content-Type": "application/json" },
    });

  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });

  const admin = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );

  // 1. Who is asking?
  const jwt = req.headers.get("Authorization")?.replace("Bearer ", "");
  if (!jwt) return json({ error: "Not signed in" }, 401);

  const { data: caller, error: callerError } = await admin.auth.getUser(jwt);
  if (callerError || !caller.user) return json({ error: "Not signed in" }, 401);

  // The role is read from app_metadata, never user_metadata: a user can rewrite
  // their own user_metadata with supabase.auth.updateUser(), so trusting it here
  // would let any account promote itself and mint logins.
  const callerApp = caller.user.app_metadata ?? {};
  const callerRole = String(callerApp.role ?? "").toUpperCase();
  if (!ADMIN_ROLES.includes(callerRole)) {
    return json(
      {
        error:
          "Only an admin can create staff logins. If you are an admin, run " +
          "supabase/schema/branch-scoped-wallet-rls.sql, then sign out and back " +
          "in so your token carries the role.",
      },
      403,
    );
  }

  // 2. Validate. Unlike the branch and student functions, `username` is always
  //    required: those two reset a login they can find from the thing that owns
  //    it, whereas here the login ID is the only thing identifying the account.
  const body = await req.json().catch(() => ({}));
  const { username, password, name, role, email, phone, branchId } = body;

  if (!username || !password || !name || !role) {
    return json({ error: "name, username, password and role are required" }, 400);
  }
  if (String(password).length < 6) {
    return json({ error: "Password must be at least 6 characters" }, 400);
  }

  const wantedRole = String(role).toUpperCase();
  if (!(GRANTABLE[callerRole] ?? []).includes(wantedRole)) {
    return json(
      { error: `A ${callerRole.replace(/_/g, " ").toLowerCase()} cannot create a ${wantedRole.replace(/_/g, " ").toLowerCase()} login` },
      403,
    );
  }

  // 3. Where does this person work?
  //
  //    A branch admin may only staff their own branch, whatever the request
  //    asked for — the branch is taken from their token, not from the body.
  //    An org admin may post someone to any branch of their organisation, or
  //    to none at all, which means head office.
  let organizationId = callerApp.organizationId ?? null;
  let postedBranchId = callerRole === "BRANCH_ADMIN" ? (callerApp.branchId ?? null) : (branchId || null);

  if (postedBranchId) {
    const { data: branch, error: branchError } = await admin
      .from("branches")
      .select("id, organizationId")
      .eq("id", postedBranchId)
      .single();
    if (branchError || !branch) return json({ error: "Branch not found" }, 404);
    if (organizationId && branch.organizationId !== organizationId) {
      return json({ error: "That branch belongs to another organisation" }, 403);
    }
    organizationId = organizationId ?? branch.organizationId;
    postedBranchId = branch.id;
  }

  // A login with no organisation is scoped to nothing, and the All Users page
  // — which reads users by organizationId — would never show it. Refuse rather
  // than mint an account that works but cannot be found or managed. Only a
  // SUPER_ADMIN, who is deliberately above any one organisation, is exempt.
  if (!organizationId && callerRole !== "SUPER_ADMIN") {
    return json(
      {
        error:
          "Your account is not attached to an organisation, so there is nothing to create this user inside. " +
          "Run supabase/schema/branch-scoped-wallet-rls.sql, then sign out and back in so your token carries it.",
      },
      400,
    );
  }

  // 4. The login page turns a bare username into <username>@careeroptics.local, so
  //    the account has to live under exactly that address.
  const asked = String(username).trim();
  const loginEmail = asked.includes("@") ? asked : `${asked.toLowerCase()}@careeroptics.local`;

  const metadata = {
    name: String(name).trim(),
    role: wantedRole,
    userType: userTypeFor(wantedRole),
    branchId: postedBranchId,
    organizationId,
    contactEmail: email || null,
    phone: phone || null,
  };

  // The same three claims go into app_metadata, which only the service role can
  // write. RLS reads them from there; user_metadata is for the UI only, because
  // a user can rewrite their own with supabase.auth.updateUser().
  const appMetadata = { role: wantedRole, branchId: postedBranchId, organizationId };

  let existing;
  try {
    existing = await findByEmail(admin, loginEmail);
  } catch (err) {
    return json({ error: err instanceof Error ? err.message : "Could not look up the login" }, 500);
  }

  let userId: string;
  let created: boolean;

  if (existing) {
    const { data: updated, error: updateError } = await admin.auth.admin.updateUserById(existing.id, {
      password: String(password),
      email_confirm: true,
      user_metadata: { ...(existing.user_metadata ?? {}), ...metadata },
      app_metadata: { ...(existing.app_metadata ?? {}), ...appMetadata },
    });
    if (updateError) return json({ error: updateError.message }, 400);
    userId = updated.user!.id;
    created = false;
  } else {
    const { data: fresh, error: createError } = await admin.auth.admin.createUser({
      email: loginEmail,
      password: String(password),
      email_confirm: true,
      user_metadata: metadata,
      app_metadata: appMetadata,
    });
    if (createError) return json({ error: createError.message }, 400);
    userId = fresh.user!.id;
    created = true;
  }

  // 5. Mirror it into `public.users`, which is what the app actually lists.
  //
  //    `password` is NOT NULL on that table and is a leftover from the Prisma
  //    backend: the app signs in through Supabase Auth, which holds the real
  //    credential. Writing the password here in any form — even hashed — would
  //    be a second copy of a secret nobody reads, so the column gets a marker
  //    that is not a hash of anything and cannot be mistaken for one.
  const { error: rowError } = await admin
    .from("users")
    .upsert(
      {
        id: userId,
        name: String(name).trim(),
        email: loginEmail,
        username: loginEmail.replace(/@careeroptics\.local$/, ""),
        password: "managed-by-supabase-auth",
        phone: phone || null,
        role: wantedRole,
        userType: userTypeFor(wantedRole),
        isActive: true,
        organizationId,
        branchId: postedBranchId,
        // Re-adding someone who was removed should bring them back, not fail
        // on the unique login ID with a row nobody can see.
        deletedAt: null,
        // Prisma sets `@updatedAt` from application code, so the column is NOT
        // NULL with no database default and an insert that omits it fails.
        updatedAt: new Date().toISOString(),
      },
      { onConflict: "id" },
    );

  if (rowError) {
    // The account exists at this point but is not listed. Say so plainly
    // rather than reporting a success the All Users page will contradict.
    return json(
      {
        error:
          `The sign-in account was created, but listing it failed: ${rowError.message}. ` +
          `Run supabase/schema/user-management.sql, then save this user again.`,
      },
      500,
    );
  }

  return json({
    userId,
    loginEmail,
    username: loginEmail.replace(/@careeroptics\.local$/, ""),
    role: wantedRole,
    branchId: postedBranchId,
    created,
  });
});
