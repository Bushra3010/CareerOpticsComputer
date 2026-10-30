/**
 * Creates or resets the login a student signs in to the portal with.
 *
 * Modelled on create-branch-user, with one deliberate difference: a branch
 * admin may call this, not only an organisation admin. Admissions happen at the
 * branch, so the person who enrolled the student is the one who should be able
 * to hand them their login -- but only for students of their own branch, which
 * is enforced below against the caller's app_metadata rather than anything the
 * browser sent.
 *
 * The account is minted here because the browser only holds the anon key, and
 * signing a new user up from there would replace the caller's own session.
 *
 * The link the portal reads is `students.userId`: every portal query resolves
 * the signed-in auth user to a student row through it, so it is written here in
 * the same call that mints the account.
 */
import { createClient } from "jsr:@supabase/supabase-js@2";

/**
 * Allow back exactly the headers the browser asked for. A fixed list is a trap:
 * the app's Supabase client attaches `x-application-name` to every request, and
 * any header missing from this reply makes the browser drop the POST after a
 * *successful* preflight.
 */
const corsFor = (req: Request) => ({
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    req.headers.get("Access-Control-Request-Headers") ??
    "authorization, x-client-info, apikey, content-type, x-application-name",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
});

const ORG_ROLES = ["SUPER_ADMIN", "ORGANIZATION_ADMIN"];
const BRANCH_ROLES = ["BRANCH_ADMIN", "FRANCHISE"];

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

  // Read from app_metadata, never user_metadata: a user can rewrite their own
  // user_metadata with supabase.auth.updateUser(), so trusting it here would let
  // any account promote itself and mint logins.
  const callerApp = caller.user.app_metadata ?? {};
  const callerRole = String(callerApp.role ?? "").toUpperCase();
  const isOrgAdmin = ORG_ROLES.includes(callerRole);
  const isBranchAdmin = BRANCH_ROLES.includes(callerRole);

  if (!isOrgAdmin && !isBranchAdmin) {
    return json(
      {
        error:
          "Only an organisation admin or a branch admin can issue student logins. If you are one, " +
          "run supabase/schema/branch-scoped-wallet-rls.sql, then sign out and back in so your " +
          "token carries the role.",
      },
      403,
    );
  }

  // 2. Validate. `username` may be omitted when the student already has a login
  //    and only the password is being reset.
  const { studentId, username, password } = await req.json().catch(() => ({}));
  if (!studentId || !password) {
    return json({ error: "studentId and password are required" }, 400);
  }
  if (String(password).length < 6) {
    return json({ error: "Password must be at least 6 characters" }, 400);
  }

  // 3. The student must exist, and must be one the caller is allowed to touch.
  const { data: student, error: studentError } = await admin
    .from("students")
    .select("id, firstName, lastName, branchId, userId, enrollmentNo, applicationNo, email, phone")
    .eq("id", studentId)
    .is("deletedAt", null)
    .single();
  if (studentError || !student) return json({ error: "Student not found" }, 404);

  const { data: branch, error: branchError } = await admin
    .from("branches")
    .select("id, name, organizationId")
    .eq("id", student.branchId)
    .single();
  if (branchError || !branch) return json({ error: "The student's branch no longer exists" }, 404);

  // A branch admin is confined to its own branch; an org admin to its own org.
  if (isBranchAdmin) {
    // An account whose token carries no branch claim yet fails the comparison
    // below and would be told the student is someone else's, which sends the
    // reader looking in the wrong place. Name the real cause instead.
    if (!callerApp.branchId) {
      return json(
        {
          error:
            "Your account has no branch on its token yet. Run " +
            "supabase/schema/branch-scoped-wallet-rls.sql, then sign out and back in.",
        },
        403,
      );
    }
    if (callerApp.branchId !== student.branchId) {
      return json({ error: "That student belongs to another branch" }, 403);
    }
  }
  if (isOrgAdmin && callerApp.organizationId && branch.organizationId !== callerApp.organizationId) {
    return json({ error: "That student belongs to another organisation" }, 403);
  }

  // 4. The login page turns a bare username into <username>@careeroptics.local, so
  //    the account has to live under exactly that address.
  const fullName = [student.firstName, student.lastName].filter(Boolean).join(" ") || "Student";
  const asked = String(username ?? "").trim();
  const emailFor = (value: string) =>
    value.includes("@") ? value.toLowerCase() : `${value.toLowerCase()}@careeroptics.local`;

  const metadata = {
    name: fullName,
    role: "STUDENT",
    userType: "STUDENT",
    branchId: student.branchId,
    organizationId: branch.organizationId,
    studentId: student.id,
    contactEmail: student.email ?? null,
    phone: student.phone ?? null,
  };

  // Only the service role can write app_metadata, which is why RLS reads the
  // claims from there.
  const appMetadata = {
    role: "STUDENT",
    branchId: student.branchId,
    organizationId: branch.organizationId,
    studentId: student.id,
  };

  // `students.userId` is the link, so an existing login is found through it
  // rather than by walking every auth user.
  let existing = null;
  if (student.userId) {
    const { data: found } = await admin.auth.admin.getUserById(String(student.userId));
    existing = found?.user ?? null;
  }

  if (existing) {
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

  // No account yet. Default the username to the enrolment number, which is what
  // the student already has printed on their ID card.
  const fallback = String(student.enrollmentNo || student.applicationNo || "").trim();
  const loginId = asked || fallback;
  if (!loginId) {
    return json(
      { error: "This student has no enrolment number yet, so a login ID is required" },
      400,
    );
  }

  const loginEmail = emailFor(loginId);
  const { data: created, error: createError } = await admin.auth.admin.createUser({
    email: loginEmail,
    password: String(password),
    email_confirm: true,
    user_metadata: metadata,
    app_metadata: appMetadata,
  });
  if (createError) return json({ error: createError.message }, 400);

  // 5. Link the account to the student row. Without this every portal query
  //    resolves to nothing and the student signs in to an empty workspace, so a
  //    failure here has to undo the account rather than leave it orphaned.
  const { error: linkError } = await admin
    .from("students")
    .update({ userId: created.user?.id, updatedAt: new Date().toISOString() })
    .eq("id", student.id);

  if (linkError) {
    if (created.user?.id) await admin.auth.admin.deleteUser(created.user.id);
    return json({ error: `Could not link the login to the student: ${linkError.message}` }, 500);
  }

  return json({
    userId: created.user?.id,
    loginEmail,
    username: loginId.replace(/@careeroptics\.local$/, ""),
    created: true,
  });
});
