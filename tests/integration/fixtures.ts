import { createClient, type SupabaseClient } from "@supabase/supabase-js";

// Untyped on purpose, same reason as rls-proof.test.ts: postgrest-js's generics
// need a fully code-generated Database type that types/database.generated.ts
// (hand-written) does not reproduce.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type AnyClient = SupabaseClient<any, any, any>;

export const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
export const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
export const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
export const hasCredentials = Boolean(url && anonKey && serviceKey);

export const PASSWORD = "TestPass123!";

export function adminClient(): AnyClient {
  return createClient(url!, serviceKey!, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

export interface Actor {
  userId: string;
  email: string;
  cli: AnyClient;
}

export interface Fixture {
  admin: AnyClient;
  suffix: string;
  orgId: string;
  centreId: string;
  otherCentreId: string;
  courseId: string;
  otherCourseId: string;
  owner: Actor;
  counsellor: Actor;
  faculty: Actor;
  accountant: Actor;
  /** Students at the main centre, with their active enrolment. */
  students: { studentId: string; enrolmentId: string }[];
  /** A student at the OTHER centre, for cross-tenant checks. */
  otherStudent: { studentId: string; enrolmentId: string };
  userIds: string[];
}

/**
 * Builds one complete tenant: a centre with all four staff roles signed in, a
 * second centre to test isolation against, and three students enrolled.
 *
 * Everything is suffixed so parallel or repeated runs never collide, and
 * `teardown` deletes in foreign-key order — the order matters and getting it
 * wrong silently leaves orphans that break the next run.
 */
export async function setupFixture(): Promise<Fixture> {
  const admin = adminClient();
  const suffix = crypto.randomUUID().slice(0, 6);

  // These come from seed.sql. If any is missing the seed has not been applied,
  // and failing here with that message beats a dozen confusing null errors.
  const required = async (table: string, slug: string): Promise<string> => {
    const { data } = await admin
      .from(table)
      .select("id")
      .eq("slug", slug)
      .maybeSingle();
    if (!data) {
      throw new Error(
        `Fixture setup: ${table}.slug='${slug}' not found — run supabase/seed.sql`,
      );
    }
    return data.id as string;
  };

  const orgId = await required("organizations", "career-optics");
  const courseId = await required("courses", "tally-with-gst");
  const otherCourseId = await required(
    "courses",
    "diploma-in-computer-applications",
  );

  const mkCentre = async (tag: string) => {
    const { data, error } = await admin
      .from("centres")
      .insert({
        organization_id: orgId,
        code: `CO-${tag}${suffix}`.slice(0, 12),
        name: `Centre ${tag} ${suffix}`,
        city: "Testville",
        state: "Testland",
        pincode: "110001",
        address: "1 Test Road",
        status: "active",
      })
      .select("id")
      .single();
    if (error) throw new Error(`centre ${tag}: ${error.message}`);
    return data.id as string;
  };

  const centreId = await mkCentre("A");
  const otherCentreId = await mkCentre("B");

  const userIds: string[] = [];

  const mkActor = async (roleCode: string, centre: string): Promise<Actor> => {
    const email = `fx-${roleCode}-${suffix}@example.test`;
    const { data: created, error } = await admin.auth.admin.createUser({
      email,
      password: PASSWORD,
      email_confirm: true,
    });
    if (error || !created.user)
      throw new Error(`user ${roleCode}: ${error?.message}`);
    userIds.push(created.user.id);

    await admin
      .from("profiles")
      .insert({ id: created.user.id, full_name: roleCode });

    const { data: role } = await admin
      .from("roles")
      .select("id")
      .eq("organization_id", orgId)
      .eq("code", roleCode)
      .maybeSingle();
    if (!role) throw new Error(`Fixture setup: role '${roleCode}' not seeded`);

    await admin.from("memberships").insert({
      user_id: created.user.id,
      organization_id: orgId,
      centre_id: centre,
      role_id: role.id,
      status: "active",
    });

    const cli: AnyClient = createClient(url!, anonKey!);
    const { error: signInError } = await cli.auth.signInWithPassword({
      email,
      password: PASSWORD,
    });
    if (signInError)
      throw new Error(`sign-in ${roleCode}: ${signInError.message}`);

    return { userId: created.user.id, email, cli };
  };

  const owner = await mkActor("centre_owner", centreId);
  const counsellor = await mkActor("counsellor", centreId);
  const faculty = await mkActor("faculty", centreId);
  const accountant = await mkActor("accountant", centreId);

  const mkStudent = async (n: number, centre: string, courseFor: string) => {
    const { data: s, error } = await admin
      .from("students")
      .insert({
        organization_id: orgId,
        centre_id: centre,
        registration_number: `RG-${suffix}-${n}`,
        full_name: `Student ${n} ${suffix}`,
        phone: `90000000${String(n).padStart(2, "0")}`,
        email: `fx-student${n}-${suffix}@example.test`,
      })
      .select("id")
      .single();
    if (error) throw new Error(`student ${n}: ${error.message}`);

    const { data: e, error: enrolError } = await admin
      .from("enrolments")
      .insert({
        organization_id: orgId,
        centre_id: centre,
        student_id: s.id,
        course_id: courseFor,
      })
      .select("id")
      .single();
    if (enrolError || !e)
      throw new Error(`enrolment ${n}: ${enrolError?.message}`);

    return { studentId: s.id as string, enrolmentId: e.id as string };
  };

  const students = [
    await mkStudent(1, centreId, courseId),
    await mkStudent(2, centreId, courseId),
    await mkStudent(3, centreId, courseId),
  ];
  const otherStudent = await mkStudent(9, otherCentreId, courseId);

  return {
    admin,
    suffix,
    orgId,
    centreId,
    otherCentreId,
    courseId,
    otherCourseId,
    owner,
    counsellor,
    faculty,
    accountant,
    students,
    otherStudent,
    userIds,
  };
}

/**
 * Removes every object under a centre's prefix in the private student bucket.
 *
 * Storage is not covered by the table cascades — deleting a student drops the
 * `student_documents` row but leaves the file, which would accumulate on every
 * test run and eventually be indistinguishable from real data.
 */
async function purgeCentreFiles(
  admin: AnyClient,
  centreId: string,
): Promise<void> {
  const bucket = admin.storage.from("student-private");
  const { data: folders } = await bucket.list(centreId);
  const paths: string[] = [];

  for (const folder of folders ?? []) {
    const { data: files } = await bucket.list(`${centreId}/${folder.name}`);
    for (const file of files ?? []) {
      paths.push(`${centreId}/${folder.name}/${file.name}`);
    }
  }

  if (paths.length) await bucket.remove(paths);
}

export async function teardownFixture(fx: Fixture): Promise<void> {
  const { admin } = fx;
  const centres = [fx.centreId, fx.otherCentreId];

  for (const centre of centres) {
    await purgeCentreFiles(admin, centre).catch(() => undefined);
  }

  // Ticket replies and assignments raise notifications (migration 0037).
  // Student-recipient rows cascade with the student; user-recipient rows
  // have no FK into auth.users, so they must be swept explicitly or every
  // ticket-touching suite leaks a few rows per run.
  await admin
    .from("notifications")
    .delete()
    .in("recipient_user_id", fx.userIds);

  for (const id of fx.userIds) {
    await admin.auth.admin.deleteUser(id).catch(() => undefined);
  }

  // Foreign keys are RESTRICT, so children first. issued_documents references
  // both student_results and students, so it has to go before either.
  const { data: pubs } = await admin
    .from("result_publications")
    .select("id")
    .in("centre_id", centres);
  const pubIds = (pubs ?? []).map((p: { id: string }) => p.id);

  const { data: plans } = await admin
    .from("fee_plans")
    .select("id")
    .in("centre_id", centres);
  const planIds = (plans ?? []).map((p: { id: string }) => p.id);

  const { data: insts } = planIds.length
    ? await admin
        .from("fee_instalments")
        .select("id")
        .in("fee_plan_id", planIds)
    : { data: [] };
  const instIds = (insts ?? []).map((i: { id: string }) => i.id);

  const { data: sessions } = await admin
    .from("attendance_sessions")
    .select("id")
    .in("centre_id", centres);
  const sessionIds = (sessions ?? []).map((s: { id: string }) => s.id);

  await admin.from("issued_documents").delete().in("centre_id", centres);
  if (instIds.length) {
    await admin
      .from("payment_allocations")
      .delete()
      .in("fee_instalment_id", instIds);
  }
  await admin.from("payments").delete().in("centre_id", centres);
  if (pubIds.length)
    await admin.from("student_results").delete().in("publication_id", pubIds);
  await admin.from("result_publications").delete().in("centre_id", centres);
  if (planIds.length)
    await admin.from("fee_instalments").delete().in("fee_plan_id", planIds);
  await admin.from("fee_plans").delete().in("centre_id", centres);
  if (sessionIds.length) {
    await admin
      .from("attendance_records")
      .delete()
      .in("session_id", sessionIds);
  }
  await admin.from("attendance_sessions").delete().in("centre_id", centres);
  await admin.from("student_documents").delete().in("centre_id", centres);
  await admin.from("enrolments").delete().in("centre_id", centres);
  await admin.from("students").delete().in("centre_id", centres);
  await admin.from("memberships").delete().in("centre_id", centres);
  await admin.from("document_sequences").delete().in("centre_id", centres);
  await admin.from("centres").delete().in("id", centres);
}
