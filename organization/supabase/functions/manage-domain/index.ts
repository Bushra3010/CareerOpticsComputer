/**
 * Connects a franchise centre's own domain to the website project on Vercel.
 *
 * The domain is the one saved on the centre's branch_settings row (a centre
 * asks for it from My Website; the head office can also set it). This
 * function never takes a domain from the browser, so only a domain the
 * database already accepted can reach the Vercel project.
 *
 *   add     adds <domain> and www.<domain> (redirecting to <domain>) to the
 *           project, then checks it
 *   check   asks Vercel whether the domain is verified and its DNS points
 *           here; LIVE when both, PENDING (with what is missing) otherwise
 *   remove  takes both names off the project and clears the centre's domain
 *
 * The answer is written to branch_settings.domainStatus / domainMessage, so
 * the head office's list shows it without asking Vercel again.
 *
 * Needs, as Edge Function secrets: VERCEL_TOKEN (a Vercel access token with
 * access to the project), VERCEL_PROJECT_ID, and VERCEL_TEAM_ID when the
 * project belongs to a team. The token is only ever sent to api.vercel.com.
 *
 * Called from Franchise Websites (src/pages/branch/WebsiteView.tsx) via
 * supabase.functions.invoke("manage-domain", { body: { action, branchId } }).
 */
import { createClient } from "jsr:@supabase/supabase-js@2";

/** Allow back exactly the headers the browser asked for (see create-branch-user). */
const corsFor = (req: Request) => ({
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    req.headers.get("Access-Control-Request-Headers") ??
    "authorization, x-client-info, apikey, content-type, x-application-name",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
});

const ADMIN_ROLES = ["SUPER_ADMIN", "ORGANIZATION_ADMIN"];
const ACTIONS = ["add", "check", "remove"] as const;

/** What Vercel asks a domain to point at, as the centre's screen shows it. */
const DEFAULT_RECORDS = [
  { type: "A", name: "@", value: "76.76.21.21" },
  { type: "CNAME", name: "www", value: "cname.vercel-dns.com" },
];

type VercelReply = { ok: boolean; status: number; body: Record<string, unknown> };

function vercel(token: string, projectId: string, teamId: string | undefined) {
  const call = async (method: string, path: string, body?: unknown): Promise<VercelReply> => {
    const url = new URL(`https://api.vercel.com${path}`);
    if (teamId) url.searchParams.set("teamId", teamId);
    const res = await fetch(url, {
      method,
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: body === undefined ? undefined : JSON.stringify(body),
    });
    const json = await res.json().catch(() => ({}));
    return { ok: res.ok, status: res.status, body: (json ?? {}) as Record<string, unknown> };
  };
  const project = `/projects/${encodeURIComponent(projectId)}`;
  return {
    add: (name: string, redirect?: string) =>
      call("POST", `/v10${project}/domains`, redirect ? { name, redirect, redirectStatusCode: 308 } : { name }),
    get: (name: string) => call("GET", `/v9${project}/domains/${encodeURIComponent(name)}`),
    config: (name: string) => call("GET", `/v6/domains/${encodeURIComponent(name)}/config`),
    remove: (name: string) => call("DELETE", `/v9${project}/domains/${encodeURIComponent(name)}`),
  };
}

/** Vercel's error, in its own words but without anything that is not the message. */
const vercelError = (reply: VercelReply) => {
  const error = reply.body.error as { code?: string; message?: string } | undefined;
  return { code: String(error?.code ?? ""), message: String(error?.message ?? `Vercel answered ${reply.status}`) };
};

Deno.serve(async (req) => {
  const cors = corsFor(req);
  const json = (body: unknown, status = 200) =>
    new Response(JSON.stringify(body), { status, headers: { ...cors, "Content-Type": "application/json" } });

  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  if (req.method !== "POST") return json({ error: "Use POST" }, 405);

  const admin = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);

  // 1. Who is asking? Only the head office connects domains. The role is read
  //    from app_metadata, which a user cannot rewrite for themselves.
  const jwt = req.headers.get("Authorization")?.replace("Bearer ", "");
  if (!jwt) return json({ error: "Not signed in" }, 401);
  const { data: caller, error: callerError } = await admin.auth.getUser(jwt);
  if (callerError || !caller.user) return json({ error: "Not signed in" }, 401);
  const callerApp = caller.user.app_metadata ?? {};
  if (!ADMIN_ROLES.includes(String(callerApp.role ?? "").toUpperCase())) {
    return json({ error: "Only the head office can connect a centre's domain." }, 403);
  }

  // 2. What, and for which centre.
  const { action, branchId } = await req.json().catch(() => ({}));
  if (!ACTIONS.includes(action)) return json({ error: "action must be add, check or remove" }, 400);
  if (!branchId) return json({ error: "branchId is required" }, 400);

  const { data: branch } = await admin.from("branches").select("id, organizationId").eq("id", branchId).maybeSingle();
  if (!branch) return json({ error: "Centre not found" }, 404);
  if (callerApp.organizationId && branch.organizationId !== callerApp.organizationId) {
    return json({ error: "That centre belongs to another organisation" }, 403);
  }

  const { data: settings } = await admin
    .from("branch_settings")
    .select("customDomain")
    .eq("branchId", branchId)
    .maybeSingle();
  const domain = String(settings?.customDomain ?? "").trim().toLowerCase();
  if (!domain) return json({ error: "This centre has no domain saved. Set the domain first." }, 400);

  // 3. Vercel. Checked after the caller so a stranger learns nothing about the setup.
  const token = Deno.env.get("VERCEL_TOKEN");
  const projectId = Deno.env.get("VERCEL_PROJECT_ID");
  const teamId = Deno.env.get("VERCEL_TEAM_ID") || undefined;
  if (!token || !projectId) {
    return json(
      {
        error:
          "Domain connection is not configured. Set the VERCEL_TOKEN and VERCEL_PROJECT_ID " +
          "(and VERCEL_TEAM_ID for a team project) secrets on the manage-domain Edge Function.",
      },
      503,
    );
  }
  const api = vercel(token, projectId, teamId);
  const www = `www.${domain}`;

  const save = async (domainStatus: string, message: string, clear = false) => {
    await admin
      .from("branch_settings")
      .update({
        domainStatus,
        domainMessage: message || null,
        domainCheckedAt: new Date().toISOString(),
        ...(clear ? { customDomain: null } : {}),
      })
      .eq("branchId", branchId);
  };

  const check = async () => {
    const [apex, config] = await Promise.all([api.get(domain), api.config(domain)]);
    if (apex.status === 404) {
      const message = "Not on this Vercel project. Press Connect domain; if that fails, the domain is in use on another Vercel project and must be removed there first.";
      await save("PENDING", message);
      return { domain, domainStatus: "PENDING", message, records: DEFAULT_RECORDS };
    }
    if (!apex.ok) {
      const { message } = vercelError(apex);
      await save("ERROR", message);
      return { domain, domainStatus: "ERROR", message, records: DEFAULT_RECORDS };
    }
    // A domain once used by another Vercel account must first prove it is
    // ours with a TXT record; Vercel lists it under `verification`.
    const verification = (apex.body.verification as Array<{ type: string; domain: string; value: string }> | undefined) ?? [];
    const verified = apex.body.verified === true;
    const misconfigured = !config.ok || config.body.misconfigured !== false;
    if (verified && !misconfigured) {
      const message = "Connected. The site is live on this domain.";
      await save("LIVE", message);
      return { domain, domainStatus: "LIVE", message, records: [] };
    }
    const records = [
      ...verification.map((v) => ({ type: v.type, name: v.domain, value: v.value })),
      ...(misconfigured ? DEFAULT_RECORDS : []),
    ];
    const message = !verified
      ? "Waiting for the domain to be verified. Add the TXT record shown, then check again."
      : "Waiting for DNS. Point the domain at Vercel as shown; changes can take up to 24 hours.";
    await save("PENDING", message);
    return { domain, domainStatus: "PENDING", message, records };
  };

  try {
    if (action === "add") {
      for (const [name, redirect] of [[domain, undefined], [www, domain]] as const) {
        const reply = await api.add(name, redirect);
        if (reply.ok) continue;
        // A conflict is either "already on this project" (fine) or "on another
        // project" (not fine); the check below tells the two apart, because
        // the project lookup only finds the domain in the first case.
        if (reply.status === 409) continue;
        const { message } = vercelError(reply);
        await save("ERROR", message);
        return json({ domain, domainStatus: "ERROR", message, records: DEFAULT_RECORDS });
      }
      return json(await check());
    }

    if (action === "check") return json(await check());

    // remove: a name Vercel does not have is already removed.
    for (const name of [www, domain]) {
      const reply = await api.remove(name);
      if (!reply.ok && reply.status !== 404) {
        const { message } = vercelError(reply);
        return json({ error: `Vercel could not remove ${name}: ${message}` }, 502);
      }
    }
    await save("NONE", "", true);
    return json({ domain, domainStatus: "NONE", message: "Removed from Vercel.", records: [] });
  } catch (err) {
    return json({ error: err instanceof Error ? err.message : "Vercel could not be reached" }, 502);
  }
});
