/**
 * Creates or resets the login for a branch.
 *
 * The browser only holds the anon key, and signing a new user up from there
 * would replace the admin's own session. So the account is created here with
 * the service-role key, which never leaves the server.
 *
 * The same call covers both cases. If the branch already has a login the
 * username and password are updated in place; if it has none one is minted.
 * That matters because a branch created while this function was undeployed has
 * no login at all, and "reset" has to be able to give it one.
 *
 * Called from the Create Branch form and from the Login section of the Edit
 * Branch dialog, via supabase.functions.invoke().
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

const ADMIN_ROLES = ["SUPER_ADMIN", "ORGANIZATION_ADMIN"];

/**
 * The admin API cannot filter on user_metadata, so the branch's account is
 * found by walking the list. Capped so a bad page count cannot spin forever.
 */
async function findBranchUser(admin: ReturnType<typeof createClient>, branchId: string) {
  const perPage = 1000;
  for (let page = 1; page <= 20; page++) {
    const { data, error } = await admin.auth.admin.listUsers({ page, perPage });
    if (error) throw new Error(error.message);
    const users = data?.users ?? [];
    const match = users.find((u) => {
      const meta = u.user_metadata ?? {};
      return meta.branchId === branchId && String(meta.userType ?? "").toUpperCase() === "BRANCH";
    });
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

  // 1. Who is asking? Only an org-level admin may mint or reset branch logins.
  const jwt = req.headers.get("Authorization")?.replace("Bearer ", "");
  if (!jwt) return json({ error: "Not signed in" }, 401);

  const { data: caller, error: callerError } = await admin.auth.getUser(jwt);
  if (callerError || !caller.user) return json({ error: "Not signed in" }, 401);

  // The role is read from app_metadata, never user_metadata: a user can rewrite
  // their own user_metadata with supabase.auth.updateUser(), so trusting it here
  // would let a branch account promote itself and mint logins.
  const callerApp = caller.user.app_metadata ?? {};
  if (!ADMIN_ROLES.includes(String(callerApp.role ?? "").toUpperCase())) {
    return json(
      {
        error:
          "Only an organisation admin can create branch logins. If you are an admin, " +
          "run supabase/schema/branch-scoped-wallet-rls.sql, then sign out and back in " +
          "so your token carries the role.",
      },
      403,
    );
  }

  // 2. Validate the request. `username` may be left out when the branch already
  //    has a login and only the password is being reset -- an admin resetting a
  //    password should not have to remember the login ID to keep it unchanged.
  const { branchId, username, password, name, email, phone } = await req.json().catch(() => ({}));
  if (!branchId || !password) {
    return json({ error: "branchId and password are required" }, 400);
  }
  if (String(password).length < 6) {
    return json({ error: "Password must be at least 6 characters" }, 400);
  }

  // 3. The branch must exist inside the caller's own organisation.
  const { data: branch, error: branchError } = await admin
    .from("branches")
    .select("id, name, organizationId")
    .eq("id", branchId)
    .single();
  if (branchError || !branch) return json({ error: "Branch not found" }, 404);

  if (callerApp.organizationId && branch.organizationId !== callerApp.organizationId) {
    return json({ error: "That branch belongs to another organisation" }, 403);
  }

  // 4. The login page turns a bare username into <username>@careeroptics.local, so
  //    the account has to live under exactly that address.
  const asked = String(username ?? "").trim();
  const emailFor = (value: string) =>
    value.includes("@") ? value : `${value.toLowerCase()}@careeroptics.local`;

  const metadata = {
    name: name || branch.name,
    role: "BRANCH_ADMIN",
    userType: "BRANCH",
    branchId: branch.id,
    organizationId: branch.organizationId,
    contactEmail: email || null,
    phone: phone || null,
  };

  // The same three claims go into app_metadata, which only the service role can
  // write. RLS reads them from there; user_metadata is for the UI only, because
  // a user can rewrite their own with supabase.auth.updateUser().
  const appMetadata = {
    role: "BRANCH_ADMIN",
    branchId: branch.id,
    organizationId: branch.organizationId,
  };

  let existing;
  try {
    existing = await findBranchUser(admin, branch.id);
  } catch (err) {
    return json({ error: err instanceof Error ? err.message : "Could not look up the branch login" }, 500);
  }

  if (existing) {
    // No username sent means "keep the current login ID, change only the password".
    const loginEmail = asked ? emailFor(asked) : String(existing.email ?? "");
    const { data: updated, error: updateError } = await admin.auth.admin.updateUserById(existing.id, {
      email: loginEmail,
      password: String(password),
      email_confirm: true,
      user_metadata: { ...(existing.user_metadata ?? {}), ...metadata },
      app_metadata: { ...(existing.app_metadata ?? {}), ...appMetadata },
    });
    if (updateError) return json({ error: updateError.message }, 400);
    return json({
      userId: updated.user?.id,
      loginEmail,
      username: loginEmail.replace(/@careeroptics\.local$/, ""),
      created: false,
    });
  }

  if (!asked) {
    return json({ error: "This branch has no login yet, so a login ID is required" }, 400);
  }

  const loginEmail = emailFor(asked);
  const { data: created, error: createError } = await admin.auth.admin.createUser({
    email: loginEmail,
    password: String(password),
    email_confirm: true,
    user_metadata: metadata,
    app_metadata: appMetadata,
  });

  if (createError) return json({ error: createError.message }, 400);

  return json({
    userId: created.user?.id,
    loginEmail,
    username: asked,
    created: true,
  });
});
