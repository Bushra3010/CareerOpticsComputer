/**
 * PRD §20.4 mandatory proof tests — the gate before any feature UI is built
 * (build plan §5.3, P1–P6). Runs against the real hosted Supabase project
 * (no local Docker/pgTAP available), using the service-role key to set up
 * fixtures and per-user signed-in clients to prove RLS.
 *
 * P6 as specified needs `wallet_entries` (migration 0009, not yet built).
 * Idempotency is proven here instead against `idempotency_keys`, the table
 * that exists today; re-point at wallet_entries once 0009 lands.
 */
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

// Untyped on purpose: postgrest-js's insert/rpc generics need a fully
// code-generated Database type (see lib/db/rpc.ts) that our hand-maintained
// one doesn't reproduce. This file talks to tables directly for fixture
// setup, so it isn't worth threading the same escape hatch through every
// call — regenerate types (`npm run db:types`) and re-type this file then.
// eslint-disable-next-line @typescript-eslint/no-explicit-any -- see comment above
type AnyClient = SupabaseClient<any, any, any>;

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const hasCredentials = Boolean(url && anonKey && serviceKey);

describe.skipIf(!hasCredentials)("RLS proof tests (P1-P6)", () => {
  const admin: AnyClient = createClient(url!, serviceKey!, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const suffix = crypto.randomUUID().slice(0, 8);
  const password = `Pw-${crypto.randomUUID()}`;

  let orgA: string;
  let orgB: string;
  let centreA: string;
  let centreB: string;
  let studentRoleId: string;
  let centreOwnerRoleId: string;

  const userIds: string[] = [];

  async function createTestUser(email: string) {
    const { data, error } = await admin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    });
    if (error || !data.user)
      throw new Error(`createUser failed: ${error?.message}`);
    userIds.push(data.user.id);
    await admin.from("profiles").insert({ id: data.user.id, full_name: email });
    return data.user.id;
  }

  async function signedInClient(email: string): Promise<AnyClient> {
    const client: AnyClient = createClient(url!, anonKey!);
    const { error } = await client.auth.signInWithPassword({ email, password });
    if (error) throw new Error(`sign-in failed: ${error.message}`);
    return client;
  }

  let ownerAEmail: string;
  let studentAEmail: string;
  let studentBEmail: string;
  let ownerAId: string;

  beforeAll(async () => {
    const { data: orgAData, error: orgAErr } = await admin
      .from("organizations")
      .insert({ name: `Org A ${suffix}`, slug: `org-a-${suffix}` })
      .select("id")
      .single();
    if (orgAErr || !orgAData) throw new Error(orgAErr?.message);
    orgA = orgAData.id;

    const { data: orgBData, error: orgBErr } = await admin
      .from("organizations")
      .insert({ name: `Org B ${suffix}`, slug: `org-b-${suffix}` })
      .select("id")
      .single();
    if (orgBErr || !orgBData) throw new Error(orgBErr?.message);
    orgB = orgBData.id;

    const { data: centreAData, error: centreAErr } = await admin
      .from("centres")
      .insert({ organization_id: orgA, code: `A-${suffix}`, name: "Centre A" })
      .select("id")
      .single();
    if (centreAErr || !centreAData) throw new Error(centreAErr?.message);
    centreA = centreAData.id;

    const { data: centreBData, error: centreBErr } = await admin
      .from("centres")
      .insert({ organization_id: orgA, code: `B-${suffix}`, name: "Centre B" })
      .select("id")
      .single();
    if (centreBErr || !centreBData) throw new Error(centreBErr?.message);
    centreB = centreBData.id;

    await admin.from("permissions").upsert(
      [
        { code: "student.create", description: "Create students" },
        { code: "student.read", description: "Read students" },
        { code: "role.update", description: "Update role assignments" },
      ],
      { onConflict: "code" },
    );

    const { data: studentRole, error: studentRoleErr } = await admin
      .from("roles")
      .insert({
        organization_id: orgA,
        code: `student-${suffix}`,
        name: "Student",
      })
      .select("id")
      .single();
    if (studentRoleErr || !studentRole)
      throw new Error(studentRoleErr?.message);
    studentRoleId = studentRole.id;

    const { data: ownerRole, error: ownerRoleErr } = await admin
      .from("roles")
      .insert({
        organization_id: orgA,
        code: `centre-owner-${suffix}`,
        name: "Centre Owner",
      })
      .select("id")
      .single();
    if (ownerRoleErr || !ownerRole) throw new Error(ownerRoleErr?.message);
    centreOwnerRoleId = ownerRole.id;

    await admin.from("role_permissions").insert([
      { role_id: centreOwnerRoleId, permission_code: "student.create" },
      { role_id: centreOwnerRoleId, permission_code: "student.read" },
    ]);

    ownerAEmail = `owner-a-${suffix}@example.test`;
    studentAEmail = `student-a-${suffix}@example.test`;
    studentBEmail = `student-b-${suffix}@example.test`;

    ownerAId = await createTestUser(ownerAEmail);
    const studentAId = await createTestUser(studentAEmail);
    const studentBId = await createTestUser(studentBEmail);

    await admin.from("memberships").insert([
      {
        user_id: ownerAId,
        organization_id: orgA,
        centre_id: centreA,
        role_id: centreOwnerRoleId,
        status: "active",
      },
      {
        user_id: studentAId,
        organization_id: orgA,
        centre_id: centreA,
        role_id: studentRoleId,
        status: "active",
      },
      {
        user_id: studentBId,
        organization_id: orgA,
        centre_id: centreB,
        role_id: studentRoleId,
        status: "active",
      },
    ]);
  }, 30000);

  afterAll(async () => {
    // Deletion order matters: FKs are RESTRICT by default, so children go
    // first. document_sequences (P5) and role_permissions/roles both
    // reference these orgs and will block org deletion if left behind.
    for (const id of userIds) {
      await admin.auth.admin.deleteUser(id).catch(() => undefined);
    }
    await admin
      .from("document_sequences")
      .delete()
      .in("organization_id", [orgA, orgB]);
    await admin
      .from("role_permissions")
      .delete()
      .in("role_id", [studentRoleId, centreOwnerRoleId]);
    await admin
      .from("roles")
      .delete()
      .in("id", [studentRoleId, centreOwnerRoleId]);
    await admin.from("centres").delete().in("id", [centreA, centreB]);
    await admin.from("organizations").delete().in("id", [orgA, orgB]);
  }, 30000);

  it("P1 — Centre A owner cannot see Centre B via has_permission scoped to Centre B", async () => {
    const client = await signedInClient(ownerAEmail);
    const { data } = await client.rpc("has_permission", {
      perm: "student.read",
      org: orgA,
      centre: centreB,
    });
    expect(data).toBe(false);
  });

  it("P1b — Centre A owner sees Centre A via has_permission", async () => {
    const client = await signedInClient(ownerAEmail);
    const { data } = await client.rpc("has_permission", {
      perm: "student.read",
      org: orgA,
      centre: centreA,
    });
    expect(data).toBe(true);
  });

  it("P2 — anon cannot read organizations or memberships", async () => {
    const anon: AnyClient = createClient(url!, anonKey!);
    const [orgs, memberships] = await Promise.all([
      anon.from("organizations").select("id"),
      anon.from("memberships").select("id"),
    ]);
    expect(orgs.data ?? []).toHaveLength(0);
    expect(memberships.data ?? []).toHaveLength(0);
  });

  it("P2b — anon can read an active centre but not a suspended one (migration 0007's intentional public read)", async () => {
    const anon: AnyClient = createClient(url!, anonKey!);
    await admin
      .from("centres")
      .update({ status: "suspended" })
      .eq("id", centreB);

    const [visibleA, hiddenB] = await Promise.all([
      anon.from("centres").select("id").eq("id", centreA),
      anon.from("centres").select("id").eq("id", centreB),
    ]);

    expect(visibleA.data ?? []).toHaveLength(1);
    expect(hiddenB.data ?? []).toHaveLength(0);

    await admin.from("centres").update({ status: "active" }).eq("id", centreB);
  });

  it("P3 — Centre staff cannot change their own role via direct update", async () => {
    const client = await signedInClient(ownerAEmail);
    const { data: membership } = await admin
      .from("memberships")
      .select("id")
      .eq("user_id", ownerAId)
      .single();

    const { data, error } = await client
      .from("memberships")
      .update({ role_id: studentRoleId })
      .eq("id", membership!.id)
      .select();

    // RLS blocks it: either an error, or an update that touches zero rows.
    expect(error !== null || (data ?? []).length === 0).toBe(true);

    const { data: unchanged } = await admin
      .from("memberships")
      .select("role_id")
      .eq("id", membership!.id)
      .single();
    expect(unchanged?.role_id).toBe(centreOwnerRoleId);
  });

  it("P4 — suspended membership cannot exercise has_permission", async () => {
    const { data: membership } = await admin
      .from("memberships")
      .select("id")
      .eq("user_id", ownerAId)
      .single();

    await admin
      .from("memberships")
      .update({ status: "suspended" })
      .eq("id", membership!.id);

    const client = await signedInClient(ownerAEmail);
    const { data } = await client.rpc("has_permission", {
      perm: "student.create",
      org: orgA,
      centre: centreA,
    });
    expect(data).toBe(false);

    await admin
      .from("memberships")
      .update({ status: "active" })
      .eq("id", membership!.id);
  });

  it("P5 — concurrent document number issuance is unique with zero gaps", async () => {
    const period = `TEST-${suffix}`;
    const results = await Promise.all(
      Array.from({ length: 20 }, () =>
        admin.rpc("next_document_number", {
          p_organization_id: orgA,
          p_centre_id: centreA,
          p_doc_type: "test_sequence",
          p_period: period,
        }),
      ),
    );

    const values = results.map((r) => r.data as number).sort((a, b) => a - b);
    expect(new Set(values).size).toBe(20);
    expect(values[0]).toBe(1);
    expect(values[19]).toBe(20);
  });

  it("P6 (interim, idempotency_keys) — duplicate key cannot be inserted twice", async () => {
    const key = `idem-${suffix}`;
    const first = await admin
      .from("idempotency_keys")
      .insert({ key, request_hash: "hash-1", status_code: 200 });
    expect(first.error).toBeNull();

    const second = await admin
      .from("idempotency_keys")
      .insert({ key, request_hash: "hash-1", status_code: 200 });
    expect(second.error).not.toBeNull();

    await admin.from("idempotency_keys").delete().eq("key", key);
  });
});
