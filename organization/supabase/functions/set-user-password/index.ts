/**
 * Sets a new password, a new sign-in email, or both, on someone else's login.
 *
 * Kept apart from create-staff-user on purpose. That function creates or
 * replaces a whole account — role, branch, organisation — and calling it just
 * to change a password would re-write all of those from whatever the edit
 * dialog happened to send. This one changes the password and the sign-in
 * email, and nothing else.
 *
 * The old password is never read or returned. Supabase Auth keeps only a hash,
 * so there is nothing to show: "editing" a password means setting a new one.
 *
 * Called from the Edit User dialog on the All Users page, via
 * supabase.functions.invoke().
 */
import { createClient } from "jsr:@supabase/supabase-js@2";
import { MIN_PASSWORD_LENGTH, mayResetPasswords, resetRefusal } from "./rules.ts";

/** Allow back exactly the headers the browser asked for; see create-staff-user. */
const corsFor = (req: Request) => ({
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    req.headers.get("Access-Control-Request-Headers") ??
    "authorization, x-client-info, apikey, content-type, x-application-name",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
});


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

  // 1. Who is asking? Read from app_metadata, never user_metadata, which a
  //    user can rewrite for themselves.
  const jwt = req.headers.get("Authorization")?.replace("Bearer ", "");
  if (!jwt) return json({ error: "Not signed in" }, 401);
  const { data: caller, error: callerError } = await admin.auth.getUser(jwt);
  if (callerError || !caller.user) return json({ error: "Not signed in" }, 401);

  const callerApp = caller.user.app_metadata ?? {};
  // Refused before any account is looked up, so a non-admin cannot tell a
  // login that exists (403) from one that does not (404) by asking.
  if (!mayResetPasswords(callerApp.role)) {
    return json({ error: "Only an admin can set another user's password." }, 403);
  }

  // 2. The request.
  const body = await req.json().catch(() => ({}));
  const userId = String(body.userId ?? "").trim();
  const password = body.password === undefined ? undefined : String(body.password);
  const email = body.email === undefined ? undefined : String(body.email).trim().toLowerCase();
  if (!userId) return json({ error: "userId is required" }, 400);
  if (password === undefined && email === undefined) {
    return json({ error: "Send a new password or a new email." }, 400);
  }
  if (password !== undefined && password.length < MIN_PASSWORD_LENGTH) {
    return json({ error: `The password must be at least ${MIN_PASSWORD_LENGTH} characters.` }, 400);
  }
  if (email !== undefined && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return json({ error: "That is not a valid email address." }, 400);
  }

  // 3. Whose login is it? The target's standing comes from their own
  //    app_metadata — the claims RLS enforces — not from the request, and not
  //    from `public.users`, which can drift from the account behind it.
  const { data: target, error: targetError } = await admin.auth.admin.getUserById(userId);
  if (targetError || !target.user) return json({ error: "That login no longer exists." }, 404);

  const targetApp = target.user.app_metadata ?? {};
  const refusal = resetRefusal(
    { ...callerApp, id: caller.user.id },
    { ...targetApp, id: target.user.id },
  );
  if (refusal) return json({ error: refusal }, 403);

  // 4. The password and/or the sign-in email, and nothing else. An email set
  //    by an admin is confirmed at once: the person signs in with it next.
  const { error: updateError } = await admin.auth.admin.updateUserById(userId, {
    ...(password !== undefined ? { password } : {}),
    ...(email !== undefined ? { email, email_confirm: true } : {}),
  });
  if (updateError) return json({ error: updateError.message }, 400);

  // The app's own copy of the address, which the user lists read.
  if (email !== undefined) {
    const { error: rowError } = await admin.from("users").update({ email }).eq("id", userId);
    if (rowError) return json({ error: `Sign-in email changed, but the user record was not: ${rowError.message}` }, 500);
  }

  return json({ userId, updated: true });
});
