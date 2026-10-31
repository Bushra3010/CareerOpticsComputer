import { isExamCandidate, validExamMarks, validScore } from "@/lib/assessments";
import { supabase, supabaseUrl } from "./client";
import { KNOWN_COURSE_CATEGORIES } from "../courseCategories";
import { describeEnumRejection } from "../choices";
import { newId, nowIso } from "../id";
import { storedTime } from "../storedTime";
import { listNames, renameInList, splitNames } from "../instructors";
import { toStudentProfile, type StudentRow } from "../student-profile";
import {
  createInvoiceRow,
  listInvoices,
  paidFromPayments,
  recordPayment,
  updateInvoiceRow,
  type CreateInvoiceInput,
  type InvoiceRow,
  type RecordPaymentInput,
} from "./studentFee";
import { feeStanding } from "../fees";
import { asExamResults, termPlan, type MarkLine } from "../examWorkflow";
import type { Permissions } from "../permissions";

/**
 * Asserts that a delete actually removed something.
 *
 * PostgREST answers a write that matched no row with `200 OK` and an empty
 * body — not an error — so every delete below reported success whether or not
 * anything was deleted. The row then vanished from the list the user was
 * looking at and came back on the next refresh, which is indistinguishable
 * from the delete having been ignored.
 *
 * Two things silently match nothing: a branch filter built from an
 * organisation admin's `undefined` branchId, and a row RLS will not let this
 * login write. Neither can be told apart from here, so the message names both.
 */
function assertRemoved(rows: unknown[] | null, what: string) {
  if (rows && rows.length > 0) return;
  throw new Error(
    `${what} was not removed — it no longer exists, or this login is not allowed to remove it.`,
  );
}

/** The write-side twin of `assertRemoved`, for the same reason. */
function assertWritten(rows: unknown[] | null, what: string) {
  if (rows && rows.length > 0) return;
  throw new Error(
    `${what} was not saved — it no longer exists, or this login is not allowed to change it.`,
  );
}

/* ============================
   AUTH
   ============================ */

export async function loginWithPassword(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  if (error) throw new Error(error.message);
  return data;
}

export async function refreshSession() {
  const { data, error } = await supabase.auth.refreshSession();
  if (error) throw new Error(error.message);
  return data;
}

export async function logout() {
  const { error } = await supabase.auth.signOut();
  if (error) throw new Error(error.message);
}

export async function getCurrentUser() {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  return {
    id: user.id,
    email: user.email,
    name: user.user_metadata?.name || user.email,
    role: user.user_metadata?.role || "STAFF",
    userType: user.user_metadata?.userType || "BRANCH",
    organizationId: user.user_metadata?.organizationId || null,
    branchId: user.user_metadata?.branchId || null,
  };
}

export async function signUp(email: string, password: string, metadata: Record<string, unknown>) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: metadata },
  });
  if (error) throw new Error(error.message);
  return data;
}

/* ============================
   DASHBOARD
   ============================ */

export async function getDashboardStats(branchId: string | null) {
  const today = new Date().toISOString().slice(0, 10);
  const monthStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString();

  const orgId = branchId ? await getOrgIdForBranch(branchId) : null;

  const studentsQuery = supabase.from("students").select("*", { count: "exact", head: true }).eq("isActive", true).is("deletedAt", null);
  if (branchId) studentsQuery.eq("branchId", branchId);

  const enquiriesQuery = supabase.from("visit_enquiries").select("*", { count: "exact", head: true }).gte("createdAt", today);
  if (branchId) enquiriesQuery.eq("branchId", branchId);

  // The live `FeeStatus` enum is DUE | PARTIAL | PAID | VOID. Filtering on
  // "PENDING"/"OVERDUE" made Postgres reject this query with 22P02, so
  // `dueRes.data` came back null and outstanding fees always read zero.
  const dueQuery = supabase.from("fee_invoices").select("totalAmount,paidAmount").in("status", ["DUE", "PARTIAL"]);
  if (branchId) dueQuery.eq("branchId", branchId);

  // Every other query here is branch-scoped; this one was not, so a branch's
  // "attendance today" was really the whole organisation's.
  const attendanceQuery = supabase.from("attendance_records").select("status").eq("date", today);
  if (branchId) attendanceQuery.eq("branchId", branchId);

  // fee_payments has no branchId of its own - it reaches a branch through its
  // invoice. Filtering the column directly returned 400 for every branch login,
  // which took the whole query down and left "Fees collected" reading zero.
  const paymentsQuery = branchId
    ? supabase
        .from("fee_payments")
        .select("amount, fee_invoices!inner(branchId)")
        .gte("paidAt", monthStart)
        .eq("fee_invoices.branchId", branchId)
    : supabase.from("fee_payments").select("amount").gte("paidAt", monthStart);

  // A branch runs the active courses it has been assigned, not the whole
  // catalogue -- a new branch with none assigned showed "9 courses running".
  const coursesQuery = supabase.from("courses").select("id", { count: "exact" }).eq("isActive", true).is("deletedAt", null);
  if (orgId) coursesQuery.eq("organizationId", orgId);
  const offeredQuery = branchId ? getBranchCourseIds(branchId).catch(() => null) : Promise.resolve(null);

  const [
    studentsRes,
    enquiriesRes,
    dueRes,
    attendanceRes,
    paymentsRes,
    coursesRes,
    offered,
  ] = await Promise.all([
    studentsQuery,
    enquiriesQuery,
    dueQuery,
    attendanceQuery,
    paymentsQuery,
    coursesQuery,
    offeredQuery,
  ]);
  const courses = offered
    ? (coursesRes.data || []).filter((c: { id: unknown }) => offered.has(String(c.id))).length
    : coursesRes.count || 0;

  // Outstanding is what is still owed, not what was billed: a PARTIAL invoice
  // counts only its unpaid remainder.
  const outstanding = (dueRes.data || []).reduce(
    (sum, inv: any) => sum + Math.max(0, Number(inv.totalAmount || 0) - Number(inv.paidAmount || 0)),
    0,
  );

  const attendanceTotal = (attendanceRes.data || []).length;
  const present = (attendanceRes.data || []).filter((r: any) => r.status === "PRESENT" || r.status === "LATE").length;
  const feesCollected = (paymentsRes.data || []).reduce((s, p) => s + Number(p.amount), 0);

  return {
    success: true,
    data: {
      students: studentsRes.count || 0,
      enquiriesToday: enquiriesRes.count || 0,
      outstanding,
      feesCollected,
      courses,
      attendancePercentage: attendanceTotal ? Math.round((present / attendanceTotal) * 1000) / 10 : 0,
      attendance: (attendanceRes.data || []).reduce((acc: any, r: any) => {
        acc[r.status] = (acc[r.status] || 0) + 1;
        return acc;
      }, {}),
    },
  };
}

async function getOrgIdForBranch(branchId: string | null): Promise<string | null> {
  if (!branchId) return null;
  const { data } = await supabase.from("branches").select("organizationId").eq("id", branchId).single();
  return data?.organizationId || null;
}

/* ============================
   STUDENTS
   ============================ */

export async function getStudents(branchId: string | null, page = 1, limit = 20, search?: string) {
  let query = supabase
    .from("students")
    .select("*", { count: "exact" })
    .is("deletedAt", null)
    .order("createdAt", { ascending: false })
    .range((page - 1) * limit, page * limit - 1);
  if (branchId) query = query.eq("branchId", branchId);

  if (search) {
    query = query.or(`firstName.ilike.%${search}%,lastName.ilike.%${search}%,phone.ilike.%${search}%,enrollmentNo.ilike.%${search}%`);
  }

  const { data, error, count } = await query;
  if (error) throw new Error(error.message);
  return { success: true, data: data || [], meta: { page, limit, total: count || 0 } };
}

export interface StudentRosterRow {
  id: string;
  name: string;
  initials: string;
  address: string;
  mapQuery: string;
  admissionNo: string;
  admissionDate: string;
  course: string;
  /** `courses.code`, printed under the name so a short name is not mistaken
   *  for one. Blank when the course carries no code. */
  courseCode: string;
  /** The course's own price — `courses.baseFee`. */
  courseFee: number;
  fatherName: string;
  fatherPhone: string;
  phone: string;
  whatsapp: string;
  email: string;
  /** What the student is being charged: the course price, or the invoices
   *  where they come to more than it. */
  fee: number;
  /** The face value of every invoice raised so far, voided ones excluded.
   *  Zero when none has been. Shown apart from `fee`, because part-billing a
   *  course does not reduce what the course costs. */
  invoiced: number;
  /** Receipts booked against those invoices, reversals excluded. */
  paid: number;
  /** `fee - paid`, floored at zero. */
  balance: number;
  status: "Active" | "Pending" | "Completed" | "Inactive";
  batch: string;
  /** The branch the admission was filed against. An organisation admin sees
   *  every branch's students in one list, where the row alone did not say
   *  which branch a student belonged to. */
  branch: string;
  /** True once `students.userId` points at an auth account -- the link every
   *  portal query resolves the signed-in student through. */
  hasLogin: boolean;
}

/**
 * The roster the View Students table renders: one row per student with the
 * course name and the student's fee standing already resolved, so the table
 * does not have to fetch per row.
 *
 * Three money figures, not one: what the student is being charged, what they
 * have paid, and what is left. The table used to show only the first, so a fee
 * collected against a student was invisible on the page the branch actually
 * works from — the only way to see it was to open the student and read the
 * invoices one by one.
 */
export async function getStudentRoster(branchId: string | null, limit = 500) {
  let query = supabase
    .from("students")
    .select("*, course:courses(id, name, code, baseFee), branch:branches(name)")
    .is("deletedAt", null)
    .order("createdAt", { ascending: false })
    .limit(limit);
  if (branchId) query = query.eq("branchId", branchId);

  const { data, error } = await query;
  if (error) throw new Error(error.message);

  const rows = data || [];
  const ids = rows.map((r: Record<string, unknown>) => String(r.id));

  // One invoice query for the whole page rather than one per student.
  //
  // The payments are embedded rather than trusting `fee_invoices.paidAmount`:
  // that column is only maintained by the fee pages, so a receipt booked
  // straight into `fee_payments` leaves it stale and the roster would under-
  // report what the student has paid. A reversed payment is not money in.
  const invoiceTotals = new Map<string, number>();
  const paidTotals = new Map<string, number>();
  if (ids.length > 0) {
    const invoiceQuery = (select: string) =>
      supabase
        .from("fee_invoices")
        .select(select)
        .in("studentId", ids)
        // A voided invoice is a withdrawn charge, not an unpaid one.
        .neq("status", "VOID");

    let { data: invoices, error: invoiceError } = await invoiceQuery(
      "studentId, totalAmount, paidAmount, payments:fee_payments(amount, reversedAt)",
    );
    if (invoiceError) {
      // The embed is unavailable where the relationship is not exposed;
      // `paidAmount` is then the only figure there is, and `paidFromPayments`
      // falls back to it on its own.
      ({ data: invoices } = await invoiceQuery("studentId, totalAmount, paidAmount"));
    }

    for (const inv of invoices || []) {
      const row = inv as unknown as Record<string, unknown>;
      const sid = String(row.studentId);
      const billed = Number(row.totalAmount) || 0;
      invoiceTotals.set(sid, (invoiceTotals.get(sid) || 0) + billed);
      paidTotals.set(sid, (paidTotals.get(sid) || 0) + paidFromPayments(row as unknown as InvoiceRow));
    }
  }

  const mapped: StudentRosterRow[] = rows.map((row: Record<string, unknown>) => {
    const first = String(row.firstName || "");
    const last = String(row.lastName || "");
    const name = [first, row.middleName, last].filter(Boolean).join(" ").trim() || "Unnamed";
    const course = row.course as { name?: string; code?: string; baseFee?: number } | null;
    const branch = row.branch as { name?: string } | null;

    const invoiced = invoiceTotals.get(String(row.id)) || 0;
    const standing = feeStanding({
      courseFee: course?.baseFee,
      invoiced,
      paid: paidTotals.get(String(row.id)),
    });

    // Street is deliberately left out: the column shows where the student is
    // from, and a full street line wraps the row onto three lines.
    const address =
      [row.city, row.district, row.state].filter(Boolean).join(", ") || "Address not recorded";

    const admissionStatus = String(row.admissionStatus || "").toUpperCase();
    const status: StudentRosterRow["status"] =
      row.isActive === false
        ? "Inactive"
        : admissionStatus === "COMPLETED"
        ? "Completed"
        : admissionStatus === "APPROVED"
        ? "Active"
        : "Pending";

    const phone = String(row.phone || "");

    return {
      id: String(row.id || ""),
      name,
      initials: `${first[0] || ""}${last[0] || ""}`.toUpperCase() || "ST",
      address,
      mapQuery: [row.streetAddress, row.city, row.district, row.state, row.pincode]
        .filter(Boolean)
        .join(", "),
      admissionNo: String(row.enrollmentNo || row.applicationNo || "Pending"),
      admissionDate: String(row.admissionDate || ""),
      course: course?.name || "Not assigned",
      courseCode: String(course?.code || ""),
      courseFee: Number(course?.baseFee) || 0,
      fatherName: String(row.fatherName || "—"),
      fatherPhone: String(row.fatherPhone || phone),
      phone,
      whatsapp: String(row.whatsappNumber || phone),
      email: String(row.email || "—"),
      fee: standing.total,
      invoiced,
      paid: standing.paid,
      balance: standing.balance,
      status,
      batch: "Not assigned",
      branch: branch?.name || "",
      hasLogin: Boolean(row.userId),
    };
  });

  return { success: true as const, data: mapped };
}

export async function getStudent(id: string, branchId: string | null) {
  // `.single()` returns a builder with no `.eq`, so every branch-scoped filter
  // has to be applied before it or the call throws "query.eq is not a function".
  let query = supabase
    .from("students")
    .select("*")
    .eq("id", id)
    .is("deletedAt", null);
  if (branchId) query = query.eq("branchId", branchId);
  const { data, error } = await query.single();
  if (error) throw new Error(error.message);
  return { success: true, data };
}

/**
 * Application numbers read `APP-<year>-<0001>`. `students.applicationNo` carries
 * a global unique index, so the counter is global rather than per branch - but a
 * branch account reads only its own students, so counting here would miss every
 * number another branch has issued. `next_application_no()`
 * (next-application-no.sql) counts across every branch; until that is run, we
 * fall back to what this account can see and `createStudent` steps past any
 * number that turns out to be taken.
 */
export async function nextApplicationNo(after?: string) {
  const prefix = `APP-${new Date().getFullYear()}-`;
  const counterOf = (value?: string | null) =>
    value?.startsWith(prefix) ? Number(value.slice(prefix.length)) || 0 : 0;
  const issue = (counter: number) => `${prefix}${String(counter + 1).padStart(4, "0")}`;

  const { data: fromDb, error: rpcError } = await supabase.rpc("next_application_no");
  if (!rpcError && typeof fromDb === "string") {
    return counterOf(fromDb) > counterOf(after) ? fromDb : issue(counterOf(after));
  }

  const { data, error } = await supabase
    .from("students")
    .select("applicationNo")
    .like("applicationNo", `${prefix}%`)
    .order("applicationNo", { ascending: false })
    .limit(1);
  if (error) throw new Error(error.message);
  const last = (data?.[0]?.applicationNo as string | undefined) ?? "";
  return issue(Math.max(counterOf(last), counterOf(after)));
}

/**
 * Columns added after the table went live, which a database that has not run
 * `add-student-section-roll.sql` / `add-multi-course-and-dropdowns.sql` yet
 * will not have. Losing the section, roll number or the extra courses is a far
 * better outcome than losing the admission.
 */
const STUDENT_OPTIONAL_COLUMNS = [
  "section",
  "rollNo",
  "courseIds",
  // Who brought the admission in. They arrive with add-student-referral.sql.
  "referralName",
  "referralCode",
  "referralPosition",
  // How the student is named on their paperwork, and whether they are married.
  // They arrive with add-student-parentage.sql.
  "parentage",
  "maritalStatus",
  // The block within the district. It arrives with add-student-block.sql.
  "block",
];

const isMissingStudentColumn = (error: { code?: string; message?: string } | null) =>
  error?.code === "PGRST204" ||
  error?.code === "42703" ||
  STUDENT_OPTIONAL_COLUMNS.some((c) => error?.message?.includes(c));

/**
 * Drop the one column the error names, so a database missing only `courseIds`
 * still saves the section and roll number. The error naming none of them - a
 * bare PGRST204 - is what the whole-set fallback is for.
 */
const withoutOptionalStudentColumns = (
  input: Record<string, unknown>,
  error: { message?: string } | null,
) => {
  const named = STUDENT_OPTIONAL_COLUMNS.filter(
    (c) => c in input && error?.message?.includes(c),
  );
  const drop = named.length ? named : STUDENT_OPTIONAL_COLUMNS;
  const out = { ...input };
  for (const c of drop) delete out[c];
  return out;
};

export async function createStudent(branchId: string, input: Record<string, unknown>) {
  // A caller that already carries its own number keeps it; everyone else gets
  // one issued here, so no admission route can save a student without one.
  let body = { ...input };
  // The last number that came back taken, so the next try goes past it rather
  // than recounting to the same one.
  let taken: string | undefined;
  const ATTEMPTS = 25;
  for (let attempt = 0; attempt < ATTEMPTS; attempt++) {
    const applicationNo = (body.applicationNo as string) || (await nextApplicationNo(taken));
    const { data, error } = await supabase
      .from("students")
      .insert({ ...body, applicationNo, branchId })
      .select("*")
      .single();
    if (!error) {
      // An admission may have been charged to the centre's wallet.
      announceWalletChange();
      return { success: true, data };
    }
    // 23505 is a unique violation - the number is already issued, by another
    // admission saved in the same instant or by a branch this account cannot see.
    const raced = error.code === "23505" && !body.applicationNo;
    if (raced && attempt < ATTEMPTS - 1) {
      taken = applicationNo;
      continue;
    }
    // Retry once without the columns the database may not have yet. Guarded on
    // something actually having been dropped, so this cannot loop.
    const trimmed = withoutOptionalStudentColumns(body, error);
    if (isMissingStudentColumn(error) && Object.keys(trimmed).length < Object.keys(body).length) {
      body = trimmed;
      continue;
    }
    // A typed gender reaches the Gender enum until free-text-choices.sql is run.
    if (/INSUFFICIENT_BALANCE/.test(error.message || "")) throw new Error(friendlyChargeError(error.message));
    throw new Error(describeEnumRejection(error, "Could not save the student"));
  }
  throw new Error("Could not allocate an application number");
}

export async function updateStudent(
  id: string,
  branchId: string | null | undefined,
  input: Record<string, unknown>,
) {
  // Narrowed to one branch's own students only when the caller has a branch --
  // the same rule `deleteStudent` and `getStudent` follow. An organisation
  // admin has none, and filtering on `branchId = ""` matched no row at all: the
  // save came back as PostgREST's "Cannot coerce the result to a single JSON
  // object", which reads like a parsing fault rather than a filter that cannot
  // match. RLS is what keeps a branch to its own students.
  const attempt = (body: Record<string, unknown>) => {
    let query = supabase.from("students").update(body).eq("id", id);
    if (branchId) query = query.eq("branchId", branchId);
    return query.select("*").single();
  };

  // Same bargain as `createStudent`: an edit that touches a column this database
  // has not gained yet still saves everything else rather than failing whole.
  let body = { ...input };
  for (let i = 0; i <= STUDENT_OPTIONAL_COLUMNS.length; i++) {
    const { data, error } = await attempt(body);
    if (!error) return { success: true, data };
    const trimmed = withoutOptionalStudentColumns(body, error);
    if (!isMissingStudentColumn(error) || Object.keys(trimmed).length === Object.keys(body).length) {
      throw new Error(error.message);
    }
    body = trimmed;
  }
  throw new Error("Could not save the student");
}

export async function deleteStudent(id: string, branchId: string | null) {
  let query = supabase
    .from("students")
    .update({ deletedAt: new Date().toISOString() })
    .eq("id", id);
  // Applied only when there is one, exactly as `getStudent` and
  // `getStudentRoster` do: an organisation admin has no branch of their own,
  // sees every branch's students, and was filtering on `undefined` — which
  // matches no row, so their deletes never removed anything.
  if (branchId) query = query.eq("branchId", branchId);
  const { data, error } = await query.select("id");
  if (error) throw new Error(error.message);
  assertRemoved(data, "That student");
  return { success: true };
}

export async function getStudentPortal(id: string, branchId: string) {
  // `.single()` returns a builder with no `.eq`, so every branch-scoped filter
  // has to be applied before it or the call throws "query.eq is not a function".
  let query = supabase
    .from("students")
    .select("*")
    .eq("id", id)
    .is("deletedAt", null);
  if (branchId) query = query.eq("branchId", branchId);
  const { data, error } = await query.single();
  if (error) throw new Error(error.message);
  return { success: true, data };
}

/* ============================
   COURSES & BATCHES
   ============================ */

/**
 * The `courses` table stores a duration as value + unit, but the screens work
 * in whole months. Expose both so neither side has to know about the other.
 */
const MONTHS_PER_UNIT: Record<string, number> = { DAYS: 1 / 30, WEEKS: 0.25, MONTHS: 1, YEARS: 12 };

function mapCourse(row: Record<string, unknown>): Record<string, any> {
  const value = Number(row.durationValue) || 0;
  const unit = String(row.durationUnit || "MONTHS").toUpperCase();
  return {
    ...row,
    durationMonths: Math.max(1, Math.round(value * (MONTHS_PER_UNIT[unit] ?? 1))),
  };
}

/**
 * The course ids a branch has been given, out of `branch_courses`.
 *
 * `courses` belong to the organisation; which of them a branch may actually
 * run is this join, and it is what "Assign Course to Batch" writes.
 */
export async function getBranchCourseIds(branchId: string | null) {
  if (!branchId) return new Set<string>();
  const { data, error } = await supabase
    .from("branch_courses")
    .select("courseId")
    .eq("branchId", branchId)
    .eq("isOffered", true);
  if (error) throw new Error(error.message);
  return new Set((data || []).map((row: Record<string, unknown>) => String(row.courseId)));
}

/**
 * Gives a branch a course to run, or takes it back.
 *
 * Deliberately not an upsert: `branch_courses` is unique on (branchId,
 * courseId), and PostgREST's upsert would write the freshly generated `id` over
 * the existing row's primary key on conflict.
 *
 * A course the organisation has switched off cannot be given out. "Inactive"
 * was a label and nothing else -- it appeared on the catalogue row and stopped
 * nothing -- so a retired course could still be handed to a branch, which would
 * then admit students into it.
 */
export async function setBranchCourseOffered(
  branchId: string,
  courseId: string,
  isOffered = true,
) {
  if (!branchId || !courseId) return { success: false as const, error: "Missing branch or course" };

  // Only on the way in: taking a course back off a branch must keep working
  // however the course itself stands.
  if (isOffered) {
    const { data: course } = await supabase
      .from("courses")
      .select("name, isActive")
      .eq("id", courseId)
      .maybeSingle();
    if (course && course.isActive === false) {
      return {
        success: false as const,
        error: `"${course.name}" is inactive. Make it active in the course catalogue before giving it to a branch.`,
      };
    }
  }

  const { data: existing, error: findError } = await supabase
    .from("branch_courses")
    .select("id")
    .eq("branchId", branchId)
    .eq("courseId", courseId)
    .maybeSingle();
  if (findError) throw new Error(findError.message);

  if (existing?.id) {
    const { error } = await supabase
      .from("branch_courses")
      .update({ isOffered, updatedAt: nowIso() })
      .eq("id", existing.id);
    if (error) throw new Error(error.message);
    return { success: true as const, created: false };
  }

  const { error } = await supabase.from("branch_courses").insert({
    id: newId("bc"),
    branchId,
    courseId,
    isOffered,
    updatedAt: nowIso(),
  });
  if (error) throw new Error(error.message);
  return { success: true as const, created: true };
}

/**
 * The organisation's courses, narrowed to the ones a branch runs when a branch
 * is given.
 *
 * A branch sees exactly what it has been assigned in `branch_courses`, and of
 * that only what is still active: a course the organisation has switched off
 * takes no new work, so it has no place on a branch's lists. A branch with
 * nothing assigned sees nothing -- the organisation hands courses out from
 * "Assign Course to Batch".
 *
 * Without a branch (an administrator) the whole catalogue comes back, inactive
 * courses included, since that is where they are managed.
 */
export async function getCourses(organizationId: string | null, branchId: string | null = null) {
  let query = supabase
    .from("courses")
    .select("*")
    .is("deletedAt", null)
    .order("name");
  if (organizationId) query = query.eq("organizationId", organizationId);
  const { data, error } = await query;
  if (error) throw new Error(error.message);
  const all = (data || []).map(mapCourse);

  if (!branchId) return { success: true, data: all };

  const offered = await getBranchCourseIds(branchId);
  return {
    success: true,
    data: all.filter((course) => offered.has(String(course.id)) && course.isActive !== false),
  };
}

/**
 * `courses.category` is still the `CourseCategory` enum on databases where
 * `course-category-free-text.sql` has not been run, and Postgres rejects
 * anything outside its seven members with 22P02. The raw message names the
 * type, not the field, so translate it.
 */
function describeCategoryRejection(error: { code?: string; message?: string }): string {
  if (error.code !== "22P02" || !/CourseCategory/.test(error.message || "")) {
    return error.message || "Could not save the course";
  }
  const typed = error.message?.match(/: "([^"]*)"/)?.[1] ?? "";
  return `"${typed}" is not one of the categories this database accepts yet. Run supabase/schema/course-category-free-text.sql to allow typed categories, or pick one of: ${KNOWN_COURSE_CATEGORIES.join(", ")}.`;
}

export async function createCourse(organizationId: string | null, input: Record<string, unknown>) {
  const { durationMonths, ...rest } = input;
  const payload: Record<string, unknown> = { ...rest, organizationId };
  // Callers speak months; the column pair is what actually exists.
  if (payload.durationValue === undefined) {
    payload.durationValue = Number(durationMonths) || 1;
    payload.durationUnit = "MONTHS";
  }
  const { data, error } = await supabase.from("courses").insert(payload).select("*").single();
  if (error) throw new Error(describeCategoryRejection(error));
  return { success: true, data: mapCourse(data as Record<string, unknown>) };
}

export async function updateCourse(id: string, input: Record<string, unknown>) {
  const { durationMonths, ...rest } = input;
  const payload: Record<string, unknown> = { ...rest };
  if (durationMonths !== undefined && payload.durationValue === undefined) {
    payload.durationValue = Number(durationMonths) || 1;
    payload.durationUnit = "MONTHS";
  }
  const { data, error } = await supabase.from("courses").update(payload).eq("id", id).select("*").single();
  if (error) throw new Error(describeCategoryRejection(error));
  // Switching a course off takes it back from every branch that had it, so
  // making it active again does not quietly hand it back out.
  if (payload.isActive === false) {
    const { error: takeBackError } = await supabase
      .from("branch_courses")
      .update({ isOffered: false, updatedAt: nowIso() })
      .eq("courseId", id)
      .eq("isOffered", true);
    if (takeBackError) throw new Error(takeBackError.message);
  }
  return { success: true, data: mapCourse(data as Record<string, unknown>) };
}

/** Soft delete, matching the `deletedAt is null` filter used when reading. */
export async function deleteCourse(id: string) {
  const { data, error } = await supabase
    .from("courses")
    .update({ deletedAt: new Date().toISOString() })
    .eq("id", id)
    .select("id");
  if (error) throw new Error(error.message);
  assertRemoved(data, "That course");
  return { success: true };
}

/** Added by `supabase/schema/add-batch-fee-fields.sql`; may not be deployed. */
const BATCH_OPTIONAL_COLUMNS = ["feeDiscount", "remark", "instructor", "subjects"];

/** The column is `maxSeats`; the screens say `maxStudents`. Expose both. */
function mapBatch(row: Record<string, unknown>): Record<string, any> {
  return {
    ...row,
    maxStudents: row.maxSeats === null || row.maxSeats === undefined ? undefined : Number(row.maxSeats),
    feeDiscount: row.feeDiscount === undefined ? 0 : Number(row.feeDiscount) || 0,
    remark: (row.remark as string) ?? "",
    instructor: (row.instructor as string) ?? "",
    // Absent until add-batch-subjects.sql has run; an empty list until then.
    subjects: Array.isArray(row.subjects) ? (row.subjects as unknown[]).map(String).filter(Boolean) : [],
  };
}

export async function getBatches(branchId: string | null) {
  let query = supabase
    .from("batches")
    .select("*")
    .order("startDate", { ascending: false });
  if (branchId) query = query.eq("branchId", branchId);
  const { data, error } = await query;
  if (error) throw new Error(error.message);
  const rows = (data || []).map(mapBatch);
  return { success: true, data: await withEnrolmentCounts(rows) };
}

/** Batches for every branch in an organisation. */
export async function getBatchesByOrg(organizationId: string | null) {
  if (!organizationId) return { success: true, data: [] };
  const branchIds = await getBranchIdsByOrg(organizationId);
  if (branchIds.length === 0) return { success: true, data: [] };
  const { data, error } = await supabase
    .from("batches")
    .select("*")
    .in("branchId", branchIds)
    .order("startDate", { ascending: false });
  if (error) throw new Error(error.message);
  const rows = (data || []).map(mapBatch);
  return { success: true, data: await withEnrolmentCounts(rows) };
}

/** `batches` has no seat counter, so derive it from the students table. */
async function withEnrolmentCounts(rows: Record<string, unknown>[]): Promise<Record<string, any>[]> {
  const ids = rows.map((r) => r.id as string).filter(Boolean);
  if (ids.length === 0) return rows.map((r) => ({ ...r, currentStudents: 0 }));
  // Soft-deleted students were counted too, so a batch could read as full on
  // seats held by students who are no longer on the roll.
  const { data, error } = await supabase
    .from("students")
    .select("batchId")
    .in("batchId", ids)
    .is("deletedAt", null);
  if (error) return rows.map((r) => ({ ...r, currentStudents: 0 }));
  const counts = new Map<string, number>();
  for (const row of data || []) {
    const key = (row as { batchId?: string }).batchId;
    if (key) counts.set(key, (counts.get(key) || 0) + 1);
  }
  return rows.map((r) => ({ ...r, currentStudents: counts.get(r.id as string) || 0 }));
}

export async function createBatch(branchId: string | null, input: Record<string, unknown>) {
  if (!branchId) throw new Error("Select a branch for this batch");
  const { maxStudents, ...rest } = input;
  const payload: Record<string, unknown> = { ...rest, branchId };
  if (payload.maxSeats === undefined && maxStudents !== undefined) {
    payload.maxSeats = maxStudents === null || maxStudents === "" ? null : Number(maxStudents);
  }
  let { data, error } = await supabase.from("batches").insert(payload).select("*").single();
  if (error && (error.code === "PGRST204" || BATCH_OPTIONAL_COLUMNS.some((c) => error?.message?.includes(c)))) {
    const trimmed = { ...payload };
    for (const c of BATCH_OPTIONAL_COLUMNS) delete trimmed[c];
    ({ data, error } = await supabase.from("batches").insert(trimmed).select("*").single());
  }
  if (error) throw new Error(error.message);
  return { success: true, data: mapBatch(data as Record<string, unknown>) };
}

export async function updateBatch(id: string, input: Record<string, unknown>) {
  const { maxStudents, ...rest } = input;
  const payload: Record<string, unknown> = { ...rest };
  if (payload.maxSeats === undefined && maxStudents !== undefined) {
    payload.maxSeats = maxStudents === null || maxStudents === "" ? null : Number(maxStudents);
  }
  const attempt = (body: Record<string, unknown>) =>
    supabase.from("batches").update(body).eq("id", id).select("*").single();

  let { data, error } = await attempt(payload);
  if (error && (error.code === "PGRST204" || BATCH_OPTIONAL_COLUMNS.some((c) => error?.message?.includes(c)))) {
    const trimmed = { ...payload };
    for (const c of BATCH_OPTIONAL_COLUMNS) delete trimmed[c];
    ({ data, error } = await attempt(trimmed));
  }
  if (error) throw new Error(error.message);
  return { success: true, data: mapBatch(data as Record<string, unknown>) };
}

/**
 * Hard delete, matching how the batch lists read: `batches` has no `deletedAt`
 * column, so there is nothing to soft-delete against. Students keep pointing at
 * the row through `batchId`, so a batch with enrolments is refused up front
 * rather than left to surface as a foreign-key error.
 */
export async function deleteBatch(id: string) {
  const { count } = await supabase
    .from("students")
    .select("id", { count: "exact", head: true })
    .eq("batchId", id)
    .is("deletedAt", null);
  if (count) throw new Error(`${count} student${count > 1 ? "s are" : " is"} still enrolled in this batch`);
  const { data, error } = await supabase.from("batches").delete().eq("id", id).select("id");
  if (error) throw new Error(error.message);
  assertRemoved(data, "That batch");
  return { success: true };
}

/**
 * Teacher names already in use, for the picker on the assign form.
 *
 * There is no staff table - `profiles` holds logins, not teaching staff - so
 * the list is whatever has been recorded before: the teacher on a batch, plus
 * the instructor on any older timing slot from when that was set per slot.
 * Typing a new name is what adds to it.
 */
/**
 * Which batches each teacher is on.
 *
 * `batch_timings` carries no branch of its own, and was read unscoped here --
 * so a branch's picker listed teachers typed into every other branch's
 * timetable, and could not have deleted them, since they came back from a
 * batch it cannot see. Slots are scoped through the branch's batches now.
 */
export async function getInstructorUsage(branchId: string | null) {
  const batchQuery = supabase.from("batches").select("id, name, instructor");
  const { data: batchRows, error: batchError } = branchId
    ? await batchQuery.eq("branchId", branchId)
    : await batchQuery;
  if (batchError) throw new Error(batchError.message);

  const batches = (batchRows || []) as Array<{ id: string; name: string; instructor: string | null }>;
  const nameOf = new Map(batches.map((b) => [String(b.id), String(b.name || "a batch")]));

  const ids = batches.map((b) => String(b.id));
  const { data: timingRows } = ids.length
    ? await supabase.from("batch_timings").select("batchId, instructor").in("batchId", ids)
    : { data: [] as Array<{ batchId: string; instructor: string | null }> };

  // name (lower-cased) -> the spelling first met, and the batches it is on
  const usage = new Map<string, { name: string; batches: Set<string> }>();
  const note = (raw: unknown, batchId: string) => {
    for (const name of splitNames(raw)) {
      const key = name.toLowerCase();
      const entry = usage.get(key) ?? { name, batches: new Set<string>() };
      entry.batches.add(nameOf.get(batchId) ?? "a batch");
      usage.set(key, entry);
    }
  };
  for (const batch of batches) note(batch.instructor, String(batch.id));
  for (const slot of (timingRows || []) as Array<{ batchId: string; instructor: string | null }>) {
    note(slot.instructor, String(slot.batchId));
  }

  return {
    success: true as const,
    data: [...usage.values()]
      .map((entry) => ({ name: entry.name, batches: [...entry.batches].sort() }))
      .sort((a, b) => a.name.localeCompare(b.name)),
  };
}

export async function getInstructorNames(branchId: string | null) {
  const { data } = await getInstructorUsage(branchId);
  return { success: true, data: data.map((entry) => entry.name) };
}

/**
 * Rename a teacher everywhere a batch has them typed.
 *
 * Renaming only the picker would leave the old spelling on the batches it was
 * already written to, where the picker reads it back from -- and the teacher
 * would show twice, once under each name. Scoped to what this account's
 * branch owns; RLS draws the same line.
 */
export async function renameInstructor(branchId: string | null, from: string, to: string) {
  const { data: usage } = await getInstructorUsage(branchId);
  if (!usage.some((entry) => entry.name.toLowerCase() === from.trim().toLowerCase())) {
    return { success: true as const, data: { batches: 0, slots: 0 } };
  }

  const batchQuery = supabase.from("batches").select("id, instructor");
  const { data: batchRows, error } = branchId
    ? await batchQuery.eq("branchId", branchId)
    : await batchQuery;
  if (error) throw new Error(error.message);

  let batchesChanged = 0;
  for (const row of (batchRows || []) as Array<{ id: string; instructor: string | null }>) {
    if (!listNames(row.instructor, from)) continue;
    const { error: updateError } = await supabase
      .from("batches")
      .update({ instructor: renameInList(row.instructor, from, to) })
      .eq("id", row.id);
    if (updateError) throw new Error(updateError.message);
    batchesChanged += 1;
  }

  const ids = ((batchRows || []) as Array<{ id: string }>).map((b) => String(b.id));
  const { data: slotRows } = ids.length
    ? await supabase.from("batch_timings").select("id, instructor").in("batchId", ids)
    : { data: [] as Array<{ id: string; instructor: string | null }> };

  let slotsChanged = 0;
  for (const row of (slotRows || []) as Array<{ id: string; instructor: string | null }>) {
    if (!listNames(row.instructor, from)) continue;
    const { error: updateError } = await supabase
      .from("batch_timings")
      .update({ instructor: renameInList(row.instructor, from, to) })
      .eq("id", row.id);
    if (updateError) throw new Error(updateError.message);
    slotsChanged += 1;
  }

  return { success: true as const, data: { batches: batchesChanged, slots: slotsChanged } };
}

/**
 * Every weekly slot for a branch's batches.
 *
 * `branchId` was taken and then never used, so this read every slot in the
 * database and handed one branch another branch's timetable. Slots carry no
 * branch of their own -- they hang off a batch -- so the scoping is a lookup
 * of the branch's batches first.
 */
export async function getBatchTimings(
  branchId: string,
  filters?: { batchId?: string; courseId?: string; batchIds?: string[] },
) {
  // An organisation account has no branch of its own; it passes the batches it
  // has already resolved, so the slots stay scoped to its own organisation
  // rather than to every row in the table.
  if (!branchId && filters?.batchIds) {
    if (!filters.batchIds.length) return { success: true, data: [] as Record<string, unknown>[] };
    let scoped = supabase
      .from("batch_timings")
      .select("*")
      .in("batchId", filters.batchIds)
      .order("batchId")
      .order("day")
      .order("startTime");
    if (filters.batchId) scoped = scoped.eq("batchId", filters.batchId);
    const { data, error } = await scoped;
    if (error) throw new Error(error.message);
    return { success: true, data: data || [] };
  }

  let batchIds: string[] | null = null;
  if (branchId) {
    let batchQuery = supabase.from("batches").select("id").eq("branchId", branchId);
    if (filters?.courseId) batchQuery = batchQuery.eq("courseId", filters.courseId);
    const { data: batches, error: batchError } = await batchQuery;
    if (batchError) throw new Error(batchError.message);
    batchIds = (batches ?? []).map((b: Record<string, unknown>) => String(b.id));
    // No batches means no slots; asking for `in.()` would be a syntax error.
    if (!batchIds.length) return { success: true, data: [] as Record<string, unknown>[] };
  }

  let query = supabase.from("batch_timings").select("*").order("batchId").order("day").order("startTime");
  if (batchIds) query = query.in("batchId", batchIds);
  if (filters?.batchId) query = query.eq("batchId", filters.batchId);
  const { data, error } = await query;
  if (error) throw new Error(error.message);
  return { success: true, data: data || [] };
}

/**
 * There is no `live_classes` table - a "live class" is one weekly `batch_timings`
 * slot, resolved against its batch and course and projected onto the next
 * calendar date that day falls on. `status` is therefore derived from the clock,
 * not stored: nothing in the schema can mark a single occurrence cancelled.
 */
const TIMING_DAY_INDEX: Record<string, number> = {
  SUNDAY: 0, MONDAY: 1, TUESDAY: 2, WEDNESDAY: 3, THURSDAY: 4, FRIDAY: 5, SATURDAY: 6,
};

function nextDateForDay(day: string, now: Date) {
  const target = TIMING_DAY_INDEX[String(day).toUpperCase()];
  const date = new Date(now);
  if (target !== undefined) {
    date.setDate(date.getDate() + ((target - date.getDay() + 7) % 7));
  }
  return date;
}

const minutesOfDay = (time: string) => {
  const [h, m] = String(time || "0:0").split(":");
  return Number(h) * 60 + Number(m || 0);
};

export async function getLiveClasses(branchId: string | null) {
  const timings = (await getBatchTimings(branchId as string)).data as Record<string, any>[];
  const batchIds = [...new Set(timings.map((t) => t.batchId).filter(Boolean))];
  const batchById = new Map<string, Record<string, any>>();
  const courseById = new Map<string, Record<string, any>>();

  const branchById = new Map<string, string>();
  const enrolledIn = new Map<string, number>();

  if (batchIds.length) {
    const { data: batchRows, error: batchError } = await supabase
      .from("batches")
      .select("*")
      .in("id", batchIds);
    if (batchError) throw new Error(batchError.message);
    (batchRows || []).forEach((b: Record<string, any>) => batchById.set(b.id, b));

    const courseIds = [...new Set((batchRows || []).map((b: Record<string, any>) => b.courseId).filter(Boolean))];
    if (courseIds.length) {
      const { data: courseRows, error: courseError } = await supabase
        .from("courses")
        .select("id, name")
        .in("id", courseIds);
      if (courseError) throw new Error(courseError.message);
      (courseRows || []).forEach((c: Record<string, any>) => courseById.set(c.id, c));
    }

    // The branch a class belongs to. Head office reads every branch's classes
    // out of one list, and without this they are classes from nowhere.
    const branchIds = [...new Set((batchRows || []).map((b: Record<string, any>) => b.branchId).filter(Boolean))];
    if (branchIds.length) {
      const { data: branchRows } = await supabase.from("branches").select("id, name").in("id", branchIds);
      (branchRows || []).forEach((b: Record<string, any>) => branchById.set(b.id, b.name));
    }

    // Who is actually on the batch. `totalStudents` read `batch.capacity`,
    // which is not a column on `batches` -- the seat limit is `maxSeats` --
    // so every class reported nought students.
    const { data: studentRows } = await supabase
      .from("students")
      .select("batchId")
      .in("batchId", batchIds)
      .is("deletedAt", null);
    for (const row of studentRows || []) {
      const key = String((row as Record<string, unknown>).batchId ?? "");
      if (key) enrolledIn.set(key, (enrolledIn.get(key) || 0) + 1);
    }
  }

  const now = new Date();
  const todayIndex = now.getDay();
  const nowMinutes = now.getHours() * 60 + now.getMinutes();

  const data = timings.map((slot) => {
    const batch = batchById.get(slot.batchId) || {};
    const course = courseById.get(batch.courseId) || {};
    const date = nextDateForDay(slot.day, now);
    const start = minutesOfDay(slot.startTime);
    const end = minutesOfDay(slot.endTime);
    const isToday = TIMING_DAY_INDEX[String(slot.day).toUpperCase()] === todayIndex;
    const derived: "scheduled" | "active" | "completed" =
      isToday && nowMinutes >= start && nowMinutes < end
        ? "active"
        : isToday && nowMinutes >= end
          ? "completed"
          : "scheduled";
    return {
      id: slot.id,
      title: slot.title || slot.subject || batch.name || "Class",
      subject: slot.subject || "",
      instructor: slot.instructor || "Unassigned",
      course: course.name || "",
      batch: batch.name || "",
      date: date.toISOString().slice(0, 10),
      time: slot.startTime || "",
      duration: end > start ? `${end - start} min` : "",
      platform: slot.platform || (slot.roomNo ? "In person" : "Online"),
      meetingLink: slot.meetingLink || undefined,
      meetingId: slot.meetingId || undefined,
      description: slot.description || undefined,
      recorded: Boolean(slot.recorded),
      branch: branchById.get(batch.branchId) || "",
      attendees: 0,
      totalStudents: enrolledIn.get(slot.batchId) || 0,
      capacity: Number(batch.maxSeats || 0),
      // `status` only exists once add-batch-timing-class-fields.sql has been run;
      // until then a slot's state is whatever the clock says it is.
      status: (slot.status as "scheduled" | "active" | "completed" | "cancelled") || derived,
    };
  });

  return { success: true, data };
}

export async function createBatchTiming(input: Record<string, unknown>) {
  const attempt = (body: Record<string, unknown>) =>
    supabase.from("batch_timings").insert(body).select("*").single();

  let { data, error } = await attempt(input);
  // Same degradation as the update path: a column the migrations have not
  // added yet costs that column, not the slot.
  if (
    error?.code === "PGRST204" &&
    BATCH_TIMING_OPTIONAL_COLUMNS.some((column) => error?.message?.includes(column))
  ) {
    const trimmed = Object.fromEntries(
      Object.entries(input).filter(([key]) => BATCH_TIMING_COLUMNS.includes(key)),
    );
    ({ data, error } = await attempt(trimmed));
  }
  if (error) throw new Error(error.message);
  return { success: true, data };
}

/**
 * The live-class UI edits fields (`title`, `platform`, `meetingLink`, `status`, ...)
 * that only exist after add-batch-timing-class-fields.sql has been run, so a
 * PGRST204 for one of them retries with just the always-present columns rather
 * than failing the whole save.
 */
const BATCH_TIMING_COLUMNS = ["batchId", "day", "startTime", "endTime", "subject", "instructor", "roomNo"];
const BATCH_TIMING_OPTIONAL_COLUMNS = [
  "title", "platform", "meetingLink", "meetingId", "description", "status", "recorded",
  // add-batch-timing-schedule.sql
  "classMode", "breakStart", "breakEnd", "colour",
];

export async function updateBatchTiming(id: string, input: Record<string, unknown>) {
  const known = [...BATCH_TIMING_COLUMNS, ...BATCH_TIMING_OPTIONAL_COLUMNS];
  const payload = Object.fromEntries(Object.entries(input).filter(([key]) => known.includes(key)));
  const attempt = (body: Record<string, unknown>) =>
    supabase.from("batch_timings").update(body).eq("id", id).select("*").single();

  let { data, error } = await attempt(payload);
  if (
    error?.code === "PGRST204" &&
    BATCH_TIMING_OPTIONAL_COLUMNS.some((column) => error?.message?.includes(column))
  ) {
    const trimmed = Object.fromEntries(
      Object.entries(payload).filter(([key]) => BATCH_TIMING_COLUMNS.includes(key)),
    );
    if (!Object.keys(trimmed).length) {
      throw new Error(
        "This change needs the batch_timings live-class columns. Run supabase/schema/add-batch-timing-class-fields.sql.",
      );
    }
    ({ data, error } = await attempt(trimmed));
  }
  if (error) throw new Error(error.message);
  return { success: true, data };
}

export async function deleteBatchTiming(id: string) {
  const { error } = await supabase.from("batch_timings").delete().eq("id", id);
  if (error) throw new Error(error.message);
  return { success: true };
}

/* ============================
   ATTENDANCE
   ============================ */

export async function getAttendance(branchId: string | null, date?: string) {
  const targetDate = date || new Date().toISOString().slice(0, 10);
  let query = supabase
    .from("students")
    .select("*")
    .eq("isActive", true)
    .is("deletedAt", null)
    .order("firstName");
  if (branchId) query = query.eq("branchId", branchId);
  const { data, error } = await query;
  if (error) throw new Error(error.message);
  const withAttendance = (data || []).map((s: any) => ({
    ...s,
    attendance: [],
  }));
  return { success: true, data: withAttendance };
}

export async function markAttendance(
  branchId: string,
  date: string,
  records: Array<{ studentId: string; status: string; remarks?: string }>,
  markedById?: string | null,
) {
  if (!records.length) return { success: true, data: [] };

  let markerId = markedById;
  if (!markerId) {
    try {
      const { data: authData } = await supabase.auth.getUser();
      markerId = authData?.user?.id || "system";
    } catch {
      markerId = "system";
    }
  }

  const studentIds = records.map((r) => r.studentId);
  const { data: existingRows, error: readError } = await supabase
    .from("attendance_records")
    .select("id,studentId")
    .eq("date", date)
    .in("studentId", studentIds);

  if (readError) throw new Error(readError.message);

  const byStudent = new Map((existingRows || []).map((row: any) => [row.studentId as string, row.id as string]));
  const results = [];
  const now = new Date().toISOString();

  for (const record of records) {
    const existingId = byStudent.get(record.studentId);
    if (existingId) {
      const { data, error } = await supabase
        .from("attendance_records")
        .update({
          status: record.status,
          remarks: record.remarks || null,
          markedById: markerId,
          updatedAt: now,
        })
        .eq("id", existingId)
        .select("*")
        .single();
      if (error) throw new Error(error.message);
      results.push(data);
    } else {
      const { data, error } = await supabase
        .from("attendance_records")
        .insert({
          id: newId("att"),
          studentId: record.studentId,
          date,
          status: record.status,
          remarks: record.remarks || null,
          branchId: branchId || null,
          markedById: markerId,
          updatedAt: now,
        })
        .select("*")
        .single();
      if (error) throw new Error(error.message);
      results.push(data);
    }
  }
  return { success: true, data: results };
}

export async function getStudentAttendance(studentId: string, _branchId: string, month?: Date) {
  let query = supabase
    .from("attendance_records")
    .select("*")
    .eq("studentId", studentId)
    .order("date", { ascending: false });

  if (month) {
    const start = new Date(month.getFullYear(), month.getMonth(), 1).toISOString();
    const end = new Date(month.getFullYear(), month.getMonth() + 1, 1).toISOString();
    query = query.gte("date", start).lt("date", end);
  }

  const { data, error } = await query;
  if (error) throw new Error(error.message);
  return { success: true, data: data || [] };
}

export async function getAttendanceWithStudents(branchId: string | null, date: string) {
  const targetDate = date || new Date().toISOString().slice(0, 10);
  let studentsQuery = supabase
    .from("students")
    .select("*")
    .eq("isActive", true)
    .is("deletedAt", null)
    .order("firstName");
  if (branchId) studentsQuery = studentsQuery.eq("branchId", branchId);
  const { data: students, error: sErr } = await studentsQuery;
  if (sErr) throw new Error(sErr.message);

  const attendanceQuery = supabase
    .from("attendance_records")
    .select("*")
    .eq("date", targetDate);
  if (branchId) {
    const branchStudents = (students || []).map((s: any) => s.id);
    if (branchStudents.length) attendanceQuery.in("studentId", branchStudents);
  }
  const { data: records, error: aErr } = await attendanceQuery;
  if (aErr) throw new Error(aErr.message);

  const byStudent = new Map((records || []).map((r: any) => [r.studentId, r]));
  const merged = (students || []).map((s: any) => ({
    ...s,
    attendance: byStudent.has(s.id) ? [byStudent.get(s.id)] : [],
  }));
  return { success: true, data: merged };
}


export async function getAllAttendanceRecords(branchId?: string) {
  const branch = branchId || "";
  let studentsQuery = supabase
    .from("students")
    .select("id")
    .eq("isActive", true)
    .is("deletedAt", null);
  if (branch) studentsQuery = studentsQuery.eq("branchId", branch);
  const { data: students, error: sErr } = await studentsQuery;
  if (sErr) throw new Error(sErr.message);
  const ids = (students || []).map((s: any) => s.id);
  if (!ids.length) return { success: true, data: [] };
  const { data, error } = await supabase
    .from("attendance_records")
    .select("*")
    .in("studentId", ids)
    .order("date", { ascending: false });
  if (error) throw new Error(error.message);
  return { success: true, data: data || [] };
}


/* ============================
   FEES
   ============================ */

/*
 * These three delegate to ./studentFee, which was written against the probed
 * live schema. The versions that used to live here could never succeed:
 * `getInvoices` filtered on FeeStatus values the enum does not contain (22P02
 * on every call), and `createInvoice` wrote an `invoiceNumber` column that does
 * not exist (the column is `invoiceNo`) while silently dropping the `branchId`
 * it was handed. They are kept as named exports so existing callers - notably
 * GenerateAdmitCards - keep working.
 */

/** Every live invoice (DUE, PARTIAL and PAID) with payments and student embedded. */
export async function getInvoices(branchId: string | null) {
  return listInvoices(branchId);
}

export async function createInvoice(branchId: string, input: Record<string, unknown>) {
  return createInvoiceRow(branchId || null, input as unknown as CreateInvoiceInput);
}

export async function updateInvoice(id: string, _branchId: string, input: Record<string, unknown>) {
  return updateInvoiceRow(id, input);
}

export async function deleteInvoice(id: string, _branchId: string) {
  const { data, error } = await supabase.from("fee_invoices").delete().eq("id", id).select("id");
  if (error) throw new Error(error.message);
  assertRemoved(data, "That invoice");
  return { success: true };
}

/** One receipt, with every field resolved — no nulls for a page to trip on. */
export interface StudentReceipt {
  id: string;
  amount: number;
  method: string;
  receiptNo: string;
  referenceNo: string;
  paidAt: string;
  /** Left undefined rather than null so `!receipt.reversedAt` reads true. */
  reversedAt?: string;
}

/**
 * One invoice as every page that shows a student their fees reads it: the
 * amounts already resolved, and no nullable column left to render.
 */
export interface StudentInvoice {
  id: string;
  invoiceNo: string;
  description: string;
  dueDate: string;
  status: string;
  createdAt: string;
  /** `fee_invoices.totalAmount` — what the invoice charges. */
  amount: number;
  /** Receipts booked against it, reversals excluded. */
  paid: number;
  balance: number;
  payments: StudentReceipt[];
  /** The latest receipt's details, which the PDF helpers print per invoice. */
  method?: string;
  paidAt?: string;
  receiptNo?: string;
}

/**
 * One student's invoices, in the shape the pages that read them expect.
 *
 * Every caller — the portal's fee, results and documents screens, and the fee
 * tab on View Students — reads `amount` and `paid`. The table has neither: the
 * columns are `totalAmount` and `paidAmount`, and the receipts live in a
 * separate `fee_payments` table. Handing the raw row back meant
 * `Number(undefined || 0)`, so a student who had paid in full still saw ₹0
 * billed, ₹0 paid and an empty balance on their own login. The mapping belongs
 * here, once, rather than in each page that forgot it.
 */
export async function getStudentInvoices(
  studentId: string,
  _branchId: string | null,
): Promise<{ success: true; data: StudentInvoice[] }> {
  const run = (select: string) =>
    supabase
      .from("fee_invoices")
      .select(select)
      .eq("studentId", studentId)
      .order("createdAt", { ascending: false });

  const embedded = await run(
    "*, payments:fee_payments(id, amount, method, receiptNo, referenceNo, paidAt, reversedAt)",
  );
  let data = embedded.data;
  if (embedded.error) {
    // Same degradation as `listInvoices`: without the embed `paidAmount` is the
    // only record of what came in, and the page still renders.
    const flat = await run("*");
    if (flat.error) throw new Error(flat.error.message);
    data = flat.data;
  }

  const invoices = ((data || []) as unknown as InvoiceRow[]).map((invoice): StudentInvoice => {
    const payments: StudentReceipt[] = (
      Array.isArray(invoice.payments) ? invoice.payments : []
    ).map((payment) => ({
      id: String(payment.id || ""),
      amount: Number(payment.amount) || 0,
      method: String(payment.method || ""),
      receiptNo: String(payment.receiptNo || ""),
      referenceNo: String(payment.referenceNo || ""),
      paidAt: String(payment.paidAt || ""),
      // undefined, not null: the pages test this with `!payment.reversedAt`.
      reversedAt: payment.reversedAt ? String(payment.reversedAt) : undefined,
    }));

    const amount = Number(invoice.totalAmount) || 0;
    const paid = paidFromPayments(invoice);
    const latest = payments.filter((payment) => !payment.reversedAt).at(-1);

    return {
      id: String(invoice.id || ""),
      invoiceNo: String(invoice.invoiceNo || invoice.id || ""),
      description: String(invoice.description || "Fee invoice"),
      dueDate: String(invoice.dueDate || ""),
      status: String(invoice.status || "DUE"),
      createdAt: String(invoice.createdAt || ""),
      amount,
      paid,
      balance: Math.max(0, amount - paid),
      payments,
      method: latest?.method,
      paidAt: latest?.paidAt,
      receiptNo: latest?.receiptNo,
    };
  });

  return { success: true as const, data: invoices };
}

/**
 * A payment booked from the student's own portal, by invoice id.
 *
 * It used to insert whatever the caller handed it, straight into
 * `fee_payments`. The portal hands it an amount and a method, and the table
 * also requires `receiptNo` and `receivedById` — both NOT NULL, neither with a
 * default — so a student paying their own fee got a not-null constraint error
 * and no receipt. Worse, even a successful insert left `fee_invoices.paidAmount`
 * and `status` untouched, so the invoice stayed DUE for its full value with the
 * money already taken.
 *
 * So it goes through `recordPayment` now, which fills the row and rolls the
 * invoice forward. The invoice is read first because that roll-up needs to know
 * what was already paid.
 */
export async function addPayment(invoiceId: string, input: Record<string, unknown>) {
  const { data: invoice, error } = await supabase
    .from("fee_invoices")
    .select("*, payments:fee_payments(id, amount, reversedAt)")
    .eq("id", invoiceId)
    .maybeSingle();
  if (error) throw new Error(error.message);
  if (!invoice) throw new Error("That invoice no longer exists. Reload the page and try again.");

  const result = await recordPayment(
    invoice as unknown as InvoiceRow,
    input as unknown as RecordPaymentInput,
  );
  return { success: true as const, data: result.data.payment };
}

/* ============================
   EXAMS
   ============================ */

export type AcademicExam = {
  id: string; name: string; subject: string; branchId: string; courseId: string; batchId?: string;
  examDate: string; maxMarks: number; passMarks: number; status: string;
};

export async function getExams(branchId: string | null) {
  let query = supabase
    .from("exams")
    .select("*")
    .order("examDate", { ascending: false });
  if (branchId) query = query.eq("branchId", branchId);
  const { data, error } = await query;
  if (error) throw new Error(error.message);
  const rows = (data || []) as AcademicExam[];

  // The exam pickers label each exam with its course, and `exams` only carries
  // `courseId`. Resolve the names in one extra request rather than per row.
  const courseIds = [...new Set(rows.map((r) => r.courseId).filter(Boolean))];
  const { data: courseRows } = courseIds.length
    ? await supabase.from("courses").select("id,name").in("id", courseIds)
    : { data: [] };
  const names = new Map((courseRows || []).map((c: any) => [c.id, c.name as string]));

  // Results live in their own table; the screens read `exam.results`.
  const { data: resultRows } = rows.length
    ? await supabase.from("exam_results").select("*").in("examId", rows.map((r) => r.id))
    : { data: [] };
  const results = (resultRows || []) as Record<string, any>[];

  return {
    success: true,
    data: rows.map((row) => ({
      ...row,
      course: { name: names.get(row.courseId) || "Unassigned course" },
      results: results
        .filter((r) => r.examId === row.id)
        .map((r) => ({ studentId: r.studentId as string, marks: Number(r.marks) || 0 })),
    })),
  };
}

/**
 * The online-exam form collects a duration, a window, a question count and the
 * proctoring toggles, but `exams` has none of those columns - the values were
 * being dropped on save. add-online-exam-fields.sql adds them; until it is run,
 * a PGRST204 for one of them retries with only the base columns so creating an
 * exam still works.
 */
const EXAM_OPTIONAL_COLUMNS = [
  "examType", "totalMarks", "passingMarks", "startDate",
  "description", "endDate", "duration", "totalQuestions", "negativeMarking",
  "shuffleQuestions", "shuffleOptions", "preventTabSwitch", "fullScreen",
  "webcam", "showResult", "showAnswers", "allowReview", "autoSubmit",
];

function extractMissingExamColumn(error: { code?: string; message?: string } | null): string | null {
  if (!error?.message) return null;
  const match =
    error.message.match(/Could not find the '([^']+)' column/i) ||
    error.message.match(/column "([^"]+)" of relation "exams" does not exist/i) ||
    error.message.match(/column "([^"]+)" does not exist/i);
  return match ? match[1] : null;
}

export async function createExam(branchId: string | null, input: Record<string, unknown>) {
  if (!branchId) throw new Error("Branch ID required to create exam");

  if (!validExamMarks(Number(input.maxMarks), Number(input.passMarks))) throw new Error("Pass marks must be between zero and the maximum marks.");

  let currentPayload: Record<string, unknown> = { ...input, branchId };

  for (let i = 0; i < 6; i++) {
    const { data, error } = await supabase.from("exams").insert(currentPayload).select("*").single();
    if (!error) return { success: true, data };

    const missingCol = extractMissingExamColumn(error);
    if (missingCol && missingCol in currentPayload) {
      const next = { ...currentPayload };
      delete next[missingCol];
      currentPayload = next;
      continue;
    }

    if (error.code === "PGRST204" || EXAM_OPTIONAL_COLUMNS.some((c) => error.message?.includes(c))) {
      const stripped = Object.fromEntries(
        Object.entries(currentPayload).filter(([key]) => !EXAM_OPTIONAL_COLUMNS.includes(key))
      );
      if (Object.keys(stripped).length !== Object.keys(currentPayload).length) {
        currentPayload = stripped;
        continue;
      }
    }

    throw new Error(error.message);
  }

  throw new Error("Failed to create exam: unexpected database schema error");
}

export async function updateExam(id: string, branchId: string, input: Record<string, unknown>) {
  let currentPayload: Record<string, unknown> = { ...input };

  for (let i = 0; i < 6; i++) {
    const { data, error } = await supabase.from("exams").update(currentPayload).eq("id", id).eq("branchId", branchId).select("*").single();
    if (!error) return { success: true, data };

    const missingCol = extractMissingExamColumn(error);
    if (missingCol && missingCol in currentPayload) {
      const next = { ...currentPayload };
      delete next[missingCol];
      currentPayload = next;
      continue;
    }

    if (error.code === "PGRST204" || EXAM_OPTIONAL_COLUMNS.some((c) => error.message?.includes(c))) {
      const stripped = Object.fromEntries(
        Object.entries(currentPayload).filter(([key]) => !EXAM_OPTIONAL_COLUMNS.includes(key))
      );
      if (Object.keys(stripped).length !== Object.keys(currentPayload).length) {
        currentPayload = stripped;
        continue;
      }
    }

    throw new Error(error.message);
  }

  throw new Error("Failed to update exam: unexpected database schema error");
}

/**
 * The live column is `marks`. This wrote `marksObtained`, which does not exist,
 * so every attempt to save exam marks failed with 42703 - the feature has never
 * worked. `onConflict` also has to name the columns, not the constraint.
 */
export async function submitExamResults(examId: string, branchId: string | null, results: Array<{ studentId: string; marks: number; remarks?: string }>, publish = false) {
  const exam = await getExamById(examId, branchId);
  if (!exam) throw new Error("Exam not found");

  if (!results.length) throw new Error("Enter at least one result.");
  if (new Set(results.map((r) => r.studentId)).size !== results.length) throw new Error("Duplicate student results.");
  if (results.some((r) => !validScore(r.marks, Number(exam.maxMarks)))) {
    throw new Error(`Marks must be between 0 and ${exam.maxMarks}.`);
  }
  const { data: candidates, error: candidateError } = await supabase.from("students")
    .select("*").in("id", results.map((r) => r.studentId)).is("deletedAt", null);
  if (candidateError) throw new Error(candidateError.message);
  if (candidates?.length !== results.length || candidates.some((s) => !isExamCandidate(s, exam))) {
    throw new Error("Every student must belong to the exam's branch, course and batch.");
  }

  // exam_results came from Prisma: id and updatedAt are NOT NULL with no
  // database default, and there is no unique (examId, studentId) to upsert
  // on. A student already marked is updated; a new one is inserted whole.
  const now = new Date().toISOString();
  const { data: existing, error: readError } = await supabase
    .from("exam_results")
    .select("id,studentId")
    .eq("examId", examId)
    .in("studentId", results.map((r) => r.studentId));
  if (readError) throw new Error(readError.message);
  const idFor = new Map((existing || []).map((row) => [String(row.studentId), String(row.id)]));

  const saved: Record<string, unknown>[] = [];
  const fresh: Record<string, unknown>[] = [];
  for (const r of results) {
    const row = { examId, studentId: r.studentId, marks: r.marks, remarks: r.remarks || null, updatedAt: now };
    const id = idFor.get(r.studentId);
    if (id) {
      const { data: updated, error } = await supabase.from("exam_results").update(row).eq("id", id).select("*").single();
      if (error) throw new Error(error.message);
      saved.push(updated as Record<string, unknown>);
    } else {
      fresh.push({ id: newId("res"), ...row });
    }
  }
  let data: Record<string, unknown>[] = saved;
  if (fresh.length) {
    const { data: inserted, error } = await supabase.from("exam_results").insert(fresh).select("*");
    if (error) throw new Error(error.message);
    data = [...saved, ...((inserted || []) as Record<string, unknown>[])];
  }

  if (publish) {
    const { error } = await supabase.from("exams").update({ status: "PUBLISHED" }).eq("id", examId);
    if (error) throw new Error(`Marks saved, but publishing failed: ${error.message}`);
  }

  return { success: true, data: data || [] };
}

/** A branch account only reaches its own exams; an organisation account (no branch) reaches any. */
async function getExamById(id: string, branchId: string | null) {
  let query = supabase.from("exams").select("*").eq("id", id);
  if (branchId) query = query.eq("branchId", branchId);
  const { data } = await query.maybeSingle();
  return data;
}

export async function getStudentResults(studentId: string, branchId: string, examId?: string) {
  let query = supabase
    .from("exam_results")
    .select("*")
    .eq("studentId", studentId);
  if (examId) query = query.eq("examId", examId);
  const { data, error } = await query.order("examId", { ascending: false });
  if (error) throw new Error(error.message);
  const examIds = [...new Set((data || []).map((r) => r.examId).filter(Boolean))];
  let examsQuery = supabase.from("exams").select("*").in("id", examIds).eq("status", "PUBLISHED");
  if (branchId) examsQuery = examsQuery.eq("branchId", branchId);
  const { data: examRows, error: examError } = examIds.length ? await examsQuery : { data: [], error: null };
  if (examError) throw new Error(examError.message);
  const exams = new Map((examRows || []).map((e) => [e.id, e]));
  const fromExams = (data || []).filter((r) => exams.has(r.examId)).map((r) => {
    const exam = exams.get(r.examId)!;
    return { id: r.id, exam: exam.name, subject: exam.subject, maxMarks: Number(exam.maxMarks), passMarks: Number(exam.passMarks), marks: Number(r.marks), examDate: exam.examDate };
  });

  // Term marksheets (exam-workflow.sql), one row per paper, the term naming
  // the "exam" the portal groups by. Absent tables simply add nothing.
  const fromSheets: typeof fromExams = [];
  if (!examId) {
    const { data: sheetRows } = await supabase.from("marksheets").select("id, term, issueDate, marks").eq("studentId", studentId);
    if (sheetRows?.length) {
      const { data: studentRow } = await supabase.from("students").select("courseId").eq("id", studentId).maybeSingle();
      const { data: courseRow } = studentRow?.courseId
        ? await supabase.from("courses").select("*").eq("id", studentRow.courseId).maybeSingle()
        : { data: null };
      const type = termPlan(courseRow ? mapCourse(courseRow) : null).type;
      for (const sheet of sheetRows) {
        asExamResults([{ term: Number(sheet.term) || 1, issueDate: sheet.issueDate, marks: (sheet.marks || []) as MarkLine[] }], type)
          .forEach((row, i) => fromSheets.push({
            id: `${sheet.id}:${i}`,
            exam: row.exam.name,
            subject: row.exam.subject,
            maxMarks: row.exam.maxMarks,
            passMarks: row.exam.passMarks,
            marks: row.marks,
            examDate: row.exam.examDate,
          }));
      }
    }
  }

  return { success: true, data: [...fromSheets, ...fromExams].sort((a, b) => String(b.examDate).localeCompare(String(a.examDate))) };

}

/**
 * `photo`, `logo` and friends are JSONB, so a value written by an older upload
 * is a bare data URL and a newer one is an object. The PDF helpers need a
 * string or nothing — handing them an object draws nothing and logs no reason.
 */
function jsonbImage(value: unknown): string | null {
  if (typeof value === "string") return value || null;
  if (value && typeof value === "object") {
    for (const key of ["url", "dataUrl", "src", "path"]) {
      const found = (value as Record<string, unknown>)[key];
      if (typeof found === "string" && found) return found;
    }
  }
  return null;
}

/**
 * Everything the admission / marksheet / certificate PDFs need, in one call.
 *
 * The screens used to fetch this from `/core/documents/students/:id` on the
 * REST backend, which is not deployed - the call threw a ReferenceError before
 * it even got that far, blanking the page. PostgREST cannot join across four
 * tables in one request here, so this fans out and assembles the shape the PDF
 * helpers expect. Missing relations degrade to undefined rather than throwing:
 * a student with no batch should still get an admission letter.
 */
export async function getStudentDocument(studentId: string, branchId: string | null) {
  const student = (await getStudent(studentId, branchId)).data as Record<string, any>;

  const lookup = async (table: string, id: unknown) => {
    if (!id) return null;
    const { data } = await supabase.from(table).select("*").eq("id", id as string).maybeSingle();
    return data as Record<string, any> | null;
  };

  const [course, batch, branch] = await Promise.all([
    lookup("courses", student.courseId),
    lookup("batches", student.batchId),
    lookup("branches", student.branchId),
  ]);

  const organization = branch ? await lookup("organizations", branch.organizationId) : null;

  // The address a branch edits lives here rather than on `branches`, which has
  // no address columns at all.
  const { data: settings } = branch
    ? await supabase.from("branch_settings").select("address").eq("branchId", branch.id).maybeSingle()
    : { data: null };
  // The address the centre was registered with, for a centre that has set none
  // on its settings page: better on an admit card than the organisation's.
  const { data: registered } = branch
    ? await supabase
        .from("branch_addresses")
        .select("streetAddress, city, district, state, pincode")
        .eq("branchId", branch.id)
        .maybeSingle()
    : { data: null };

  const { data: invoiceRows } = await supabase
    .from("fee_invoices")
    .select("*")
    .eq("studentId", studentId);
  const invoices = (invoiceRows || []) as Record<string, any>[];

  const { data: paymentRows } = invoices.length
    ? await supabase
        .from("fee_payments")
        .select("*")
        .in("invoiceId", invoices.map((i) => i.id))
        .is("reversedAt", null)
    : { data: [] };
  const payments = (paymentRows || []) as Record<string, any>[];

  const { data: resultRows, error: resultError } = await supabase
    .from("exam_results")
    .select("*")
    .eq("studentId", studentId);
  if (resultError) throw new Error(resultError.message);
  const results = (resultRows || []) as Record<string, any>[];

  const examIds = [...new Set(results.map((r) => r.examId).filter(Boolean))];
  const { data: examRows, error: examError } = examIds.length
    ? await supabase.from("exams").select("*").in("id", examIds)
    : { data: [], error: null };
  if (examError) throw new Error(examError.message);
  const exams = new Map((examRows || []).map((e: any) => [e.id, e]));

  // A student on the marksheet workflow (exam-workflow.sql) is read from their
  // marksheets, one row per paper, so the institute's own marksheet and
  // certificate layouts print the theory and practical marks. Older records
  // keep coming from the per-paper exams below.
  const { data: sheetRows } = await supabase
    .from("marksheets")
    .select("term, issueDate, marks")
    .eq("studentId", studentId);
  const sheets = ((sheetRows || []) as Array<Record<string, any>>).map((row) => ({
    term: Number(row.term) || 1,
    issueDate: row.issueDate as string | null,
    marks: (Array.isArray(row.marks) ? row.marks : []) as MarkLine[],
  }));

  return {
    success: true,
    data: {
      firstName: [student.firstName, student.middleName].filter(Boolean).join(" "),
      lastName: student.lastName || "",
      branchId: student.branchId,
      enrollmentNo: student.enrollmentNo || undefined,
      applicationNo: student.applicationNo || undefined,
      admissionDate: student.admissionDate || student.createdAt || "",
      // The marksheet's particulars block: the candidate as their paperwork
      // names them, not just as the roster lists them.
      rollNo: student.rollNo || undefined,
      fatherName: student.fatherName || undefined,
      parentage: student.parentage || undefined,
      dateOfBirth: student.dateOfBirth
        ? new Date(student.dateOfBirth).toLocaleDateString("en-GB", {
            day: "2-digit",
            month: "short",
            year: "numeric",
          })
        : undefined,
      // The admission collects a passport photograph among its documents, and
      // that is the current one; `students.photo` is where a record filed
      // before that kept its picture.
      photo:
        jsonbImage((student.documents as Record<string, unknown> | null)?.passportPhoto) ||
        jsonbImage(student.photo),
      course: course ? { name: course.name, code: course.code || undefined, duration: course.durationMonths ? `${course.durationMonths} months` : undefined } : undefined,
      session: student.academicYear || undefined,
      batch: batch ? { name: batch.name } : undefined,
      branch: {
        name: branch?.name || "",
        phone: branch?.phone || "",
        email: branch?.email || "",
        // `branches` carries no address of its own; the one a branch edits
        // lives on `branch_settings`, and the organisation's registered address
        // stands in for a branch that has not set one.
        address:
          settings?.address ||
          [...new Set([registered?.streetAddress, registered?.city, registered?.district, registered?.state, registered?.pincode].filter(Boolean))].join(", ") ||
          [organization?.streetAddress, organization?.city, organization?.state, organization?.pincode]
            .filter(Boolean)
            .join(", "),
        logo: jsonbImage(branch?.branchLogo) || jsonbImage(organization?.logo),
        organization: { name: organization?.name || "" },
      },
      feeInvoices: invoices.map((invoice) => ({
        invoiceNo: invoice.invoiceNo || "",
        description: invoice.description || "",
        amount: Number(invoice.totalAmount) || 0,
        payments: payments
          .filter((payment) => payment.invoiceId === invoice.id)
          .map((payment) => ({
            receiptNo: payment.receiptNo || "",
            amount: Number(payment.amount) || 0,
            method: payment.method || "",
            paidAt: payment.paidAt || payment.createdAt || "",
          })),
      })),
      examResults: sheets.length
        ? asExamResults(sheets, termPlan(course).type)
        : results
        .filter((result) => {
          const exam = exams.get(result.examId);
          return exam?.status === "PUBLISHED" && exam.courseId === student.courseId && exam.branchId === student.branchId;
        })
        .map((result) => {
          const exam = exams.get(result.examId) as Record<string, any>;
          return {
            marks: Number(result.marks) || 0,
            exam: {
              name: exam.name || "",
              subject: exam.subject || "",
              maxMarks: Number(exam.maxMarks) || 0,
              passMarks: Number(exam.passMarks) || 0,
              examDate: exam.examDate || "",
            },
          };
        }),
    },
  };
}

/* ============================
   ENQUIRIES
   ============================ */

export async function getEnquiries(branchId: string | null, page = 1, limit = 20, search?: string) {
  let query = supabase
    .from("visit_enquiries")
    .select("*", { count: "exact" })
    .order("createdAt", { ascending: false })
    .range((page - 1) * limit, page * limit - 1);
  if (branchId) query = query.eq("branchId", branchId);

  if (search) {
    query = query.or(`visitorName.ilike.%${search}%,phone.ilike.%${search}%,personToMeet.ilike.%${search}%`);
  }

  const { data, error, count } = await query;
  if (error) throw new Error(error.message);
  return { success: true, data: data || [], meta: { page, limit, total: count || 0 } };
}

export async function createEnquiry(branchId: string, input: Record<string, unknown>) {
  if (!branchId) throw new Error("Select a branch for this visit before registering the visitor.");
  const payload = {
    ...input,
    branchId,
    visitDate: input.visitDate || new Date().toISOString(),
    visitTime: input.visitTime || new Date().toTimeString().slice(0, 5),
  };
  const { data, error } = await supabase.from("visit_enquiries").insert(payload).select("*").single();
  if (error) throw new Error(describeEnumRejection(error, "Could not register the visit"));
  return { success: true, data };
}

/**
 * `branchId` narrows the write to one branch's own rows, and is optional
 * because head office has no branch of its own.
 *
 * It used to be applied unconditionally, so every write an administrator made
 * -- a follow-up, a conversion, closing an enquiry -- filtered on `branchId =
 * ""`, matched no row, and came back as PostgREST's "Cannot coerce the result
 * to a single JSON object". The row was never the problem; the filter was.
 * RLS is what actually keeps a branch to its own enquiries.
 */
export async function updateEnquiry(
  id: string,
  branchId: string | null | undefined,
  input: Record<string, unknown>,
) {
  let query = supabase.from("visit_enquiries").update(input).eq("id", id);
  if (branchId) query = query.eq("branchId", branchId);
  const { data, error } = await query.select("*");
  if (error) throw new Error(describeEnumRejection(error, "Could not update the visit"));
  // No row matched: the enquiry is another branch's, or somebody removed it
  // while this screen was open. Either way it is not a JSON coercion problem.
  if (!data || data.length === 0) {
    throw new Error("That enquiry could not be found — it may belong to another branch.");
  }
  return { success: true, data: data[0] };
}

export async function getPendingEnquiries(branchId: string | null) {
  let query = supabase
    .from("visit_enquiries")
    .select("*")
    .in("status", ["NEW", "CONTACTED"])
    .order("createdAt", { ascending: false })
    .limit(10);
  if (branchId) query = query.eq("branchId", branchId);
  const { data, error } = await query;
  if (error) throw new Error(error.message);
  return { success: true, data: data || [] };
}

export async function deleteEnquiry(id: string, branchId: string | null) {
  let query = supabase.from("visit_enquiries").delete().eq("id", id);
  if (branchId) query = query.eq("branchId", branchId);
  const { data, error } = await query.select("id");
  if (error) throw new Error(error.message);
  assertRemoved(data, "That enquiry");
  return { success: true };
}

/* ============================
   NOTICES
   ============================ */

export async function getNotices(branchId: string | null) {
  let query = supabase
    .from("branch_notices")
    .select("*")
    .order("createdAt", { ascending: false })
    .limit(20);
  if (branchId) {
    query = query.or(`branchId.eq.${branchId},branchId.is.null`);
  } else {
    query = query.is("branchId", null);
  }
  const { data, error } = await query;
  if (error) throw new Error(error.message);
  return { success: true, data: data || [] };
}

/**
 * Columns added by a later migration. If the deployment hasn't run
 * `supabase/schema/add-notice-meeting-fields.sql` yet, PostgREST rejects the
 * whole write with PGRST204; drop them and save the rest rather than losing
 * the notice.
 */
const NOTICE_OPTIONAL_COLUMNS = ["meetingTime", "meetingLink"];

const isUnknownColumn = (error: { code?: string; message?: string } | null) =>
  error?.code === "PGRST204" ||
  NOTICE_OPTIONAL_COLUMNS.some((c) => error?.message?.includes(c));

/** Blank strings break date/uuid columns, and an empty id defeats the default. */
function cleanNoticePayload(input: Record<string, unknown>) {
  const out: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(input)) {
    if (key === "id" && !value) continue;
    if (key === "createdAt" || key === "updatedAt") continue;
    out[key] = value === "" ? null : value;
  }
  return out;
}

const withoutOptionalNoticeColumns = (input: Record<string, unknown>) => {
  const out = { ...input };
  for (const c of NOTICE_OPTIONAL_COLUMNS) delete out[c];
  return out;
};

export async function createNotice(input: Record<string, unknown>) {
  const payload = cleanNoticePayload(input);
  let { data, error } = await supabase.from("branch_notices").insert(payload).select("*").single();
  if (error && isUnknownColumn(error)) {
    ({ data, error } = await supabase
      .from("branch_notices")
      .insert(withoutOptionalNoticeColumns(payload))
      .select("*")
      .single());
  }
  if (error) throw new Error(error.message);
  return { success: true, data };
}

export async function updateNotice(id: string, input: Record<string, unknown>) {
  const payload = cleanNoticePayload(input);
  delete payload.id;
  let { data, error } = await supabase.from("branch_notices").update(payload).eq("id", id).select("*").single();
  if (error && isUnknownColumn(error)) {
    ({ data, error } = await supabase
      .from("branch_notices")
      .update(withoutOptionalNoticeColumns(payload))
      .eq("id", id)
      .select("*")
      .single());
  }
  if (error) throw new Error(error.message);
  return { success: true, data };
}

export async function deleteNotice(id: string) {
  const { data, error } = await supabase.from("branch_notices").delete().eq("id", id).select("id");
  if (error) throw new Error(error.message);
  assertRemoved(data, "That notice");
  return { success: true };
}

/* ============================
   BRANCHES
   ============================ */

/**
 * Every column of a branch but its registration documents. Those are images
 * kept on the row itself (branchMohar, branchPhoto, labPhoto, statusDocument,
 * branchLogo); every centre picker loads this list, and would otherwise pull
 * each centre's photos with it. getBranchDetails still reads the whole row.
 */
const BRANCH_LIST_COLUMNS = [
  "id", "organizationId", "userId", "name", "code", "branchType", "instituteType", "academicYear",
  "establishedYear", "website", "description", "phone", "altPhone", "whatsappNumber", "email",
  "numComputers", "numFaculty", "numRooms", "isActive", "onlineEnrollment", "smsNotifications",
  "emailNotifications", "onlineFeePayment", "studentPortal", "parentPortal", "deletedAt", "createdAt", "updatedAt",
].join(",");

export async function getBranches(organizationId: string | null) {
  const run = (columns: string) => {
    let query = supabase
      .from("branches")
      .select(columns)
      .is("deletedAt", null)
      .order("name");
    if (organizationId) query = query.eq("organizationId", organizationId);
    return query;
  };

  let { data, error } = await run(BRANCH_LIST_COLUMNS);
  // A database without one of the later columns: the whole row, as before.
  if (error && isMissingBranchColumn(error)) ({ data, error } = await run("*"));
  if (error) throw new Error(error.message);
  // The rows as select("*") typed them before, which every caller casts from.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return { success: true, data: (data || []) as any[] };
}

/**
 * Branch settings toggles added by `supabase/schema/add-portal-settings.sql`.
 * They shipped in the UI before the migration was run, so every insert failed
 * with PGRST204 and the organisation ended up with no branches at all.
 */
const BRANCH_OPTIONAL_COLUMNS = ["onlineFeePayment", "studentPortal", "parentPortal"];

/** `branch_addresses.mapLink` arrives with add-branch-map-link.sql. Until that
 *  is run the address write must still go through without it, or creating a
 *  branch fails outright over a field that is optional on the form. */
const ADDRESS_OPTIONAL_COLUMNS = ["mapLink"];

const withoutOptionalAddressColumns = (input: Record<string, unknown>) => {
  const out = { ...input };
  for (const column of ADDRESS_OPTIONAL_COLUMNS) delete out[column];
  return out;
};

const isMissingAddressColumn = (error: { code?: string; message?: string } | null) =>
  error?.code === "PGRST204" &&
  ADDRESS_OPTIONAL_COLUMNS.some((column) => error?.message?.includes(column));

const withoutOptionalBranchColumns = (input: Record<string, unknown>) => {
  const out = { ...input };
  for (const column of BRANCH_OPTIONAL_COLUMNS) delete out[column];
  return out;
};

/** True when PostgREST rejected the write because a column isn't deployed yet. */
const isMissingBranchColumn = (error: { code?: string; message?: string } | null) =>
  error?.code === "PGRST204" &&
  BRANCH_OPTIONAL_COLUMNS.some((c) => error?.message?.includes(c));

/**
 * Unique constraints on `branches`, mapped to the field a person filled in and
 * the payload key that carries it.
 */
const BRANCH_UNIQUE_CONSTRAINTS: Record<string, { label: string; column: string }> = {
  branches_email_key: { label: "email address", column: "email" },
  branches_code_key: { label: "branch code", column: "code" },
  branches_phone_key: { label: "phone number", column: "phone" },
};

/**
 * Explain a unique violation instead of forwarding Postgres's own wording.
 *
 * This matters more here than it looks. `deleteBranch` is a *soft* delete - it
 * stamps `deletedAt` and leaves the row in place - and `getBranches` hides
 * those rows. The unique index does not: it still covers them. So deleting a
 * branch and creating it again with the same email fails against a row that is
 * nowhere on screen, and the raw error ("duplicate key value violates unique
 * constraint branches_email_key") gives no hint that this is what happened.
 *
 * So say who holds the value, and whether they are deleted.
 */
async function describeBranchConflict(
  error: { code?: string; message?: string },
  payload: Record<string, unknown>,
): Promise<string | null> {
  if (error.code !== "23505") return null;
  const name = error.message?.match(/unique constraint "([^"]+)"/)?.[1] ?? "";
  const conflict = BRANCH_UNIQUE_CONSTRAINTS[name];
  if (!conflict) return null;

  const value = payload[conflict.column];
  const base = `A branch is already registered with this ${conflict.label}`;
  if (typeof value !== "string" || !value) return `${base}.`;

  // Deliberately no `deletedAt` filter - the row that blocks the insert is
  // usually one that has been deleted and is therefore invisible everywhere else.
  const { data } = await supabase
    .from("branches")
    .select("name, code, deletedAt")
    .eq(conflict.column, value)
    .limit(1);
  const holder = data?.[0];
  if (!holder) {
    return `${base} (${value}). It belongs to a branch outside this workspace, so use a different ${conflict.label}.`;
  }
  const who = `${holder.name}${holder.code ? ` (${holder.code})` : ""}`;
  return holder.deletedAt
    ? `${base} (${value}): "${who}", which was deleted on ${String(holder.deletedAt).slice(0, 10)}. Deleted branches keep their ${conflict.label}, so either restore that branch or use a different one here.`
    : `${base} (${value}): "${who}". Use a different ${conflict.label}.`;
}

async function insertBranchRow(payload: Record<string, unknown>) {
  const attempt = (body: Record<string, unknown>) =>
    supabase.from("branches").insert(body).select("*").single();

  let { data, error } = await attempt(payload);
  if (error && isMissingBranchColumn(error)) {
    ({ data, error } = await attempt(withoutOptionalBranchColumns(payload)));
  }
  if (error) {
    throw new Error(
      (await describeBranchConflict(error, payload)) ||
        describeEnumRejection(error, "Could not create the branch"),
    );
  }
  return data;
}

export async function createBranch(organizationId: string, input: Record<string, unknown>) {
  const data = await insertBranchRow({ ...input, organizationId });
  return { success: true, data };
}

/**
 * The branch list is assembled from four tables: the branch row itself, its
 * address, its licence expiry and the counts the register shows per branch.
 */
/**
 * Every branch with the state, district and block it stands in, for the
 * pickers that narrow a list place by place down to a centre. Lighter than
 * getBranchesWithStats: no students, fees or wallets.
 */
export async function getBranchDirectory(organizationId: string | null) {
  const { data: branches } = await getBranches(organizationId);
  const rows = branches as Record<string, unknown>[];
  const ids = rows.map((b) => b.id as string);
  const placeFor = new Map<string, { state: string; district: string; block: string }>();
  if (ids.length) {
    const { data } = await supabase.from("branch_addresses").select("branchId, state, district, block").in("branchId", ids);
    const clean = (v: unknown) => String(v ?? "").trim();
    for (const row of data || []) {
      placeFor.set(row.branchId as string, { state: clean(row.state), district: clean(row.district), block: clean(row.block) });
    }
  }
  return {
    success: true as const,
    data: rows.map((b) => ({
      id: String(b.id),
      name: String(b.name ?? ""),
      code: String(b.code ?? ""),
      state: placeFor.get(String(b.id))?.state || "",
      district: placeFor.get(String(b.id))?.district || "",
      block: placeFor.get(String(b.id))?.block || "",
    })),
  };
}

export async function getBranchesWithStats(organizationId: string | null) {
  const { data: branches } = await getBranches(organizationId);
  const ids = (branches as Record<string, unknown>[]).map((b) => b.id as string);
  if (!ids.length) return { success: true, data: [] as Record<string, unknown>[] };

  // `mapLink` only exists once add-branch-map-link.sql has run. Asking for a
  // column that is not there fails the whole select, which would blank the
  // location of every branch -- so it is asked for, then asked for without.
  const addressSelect = async () => {
    const wanted = await supabase
      .from("branch_addresses")
      .select("branchId, city, state, district, block, mapLink")
      .in("branchId", ids);
    if (!wanted.error) return wanted;
    return supabase.from("branch_addresses").select("branchId, city, state").in("branchId", ids);
  };

  const [addresses, licenses, students, invoices, wallets] = await Promise.all([
    addressSelect(),
    supabase.from("branch_licenses").select("branchId, expiryDate").in("branchId", ids),
    supabase.from("students").select("id, branchId").in("branchId", ids).is("deletedAt", null),
    supabase.from("fee_invoices").select("branchId, totalAmount, paidAmount").in("branchId", ids),
    supabase.from("branch_wallets").select("branchId, balance").in("branchId", ids),
  ]);

  const addressFor = new Map<
    string,
    { city?: string; state?: string; district?: string; block?: string; mapLink?: string }
  >();
  for (const row of addresses.data || []) addressFor.set(row.branchId as string, row);
  const expiryFor = new Map<string, string>();
  for (const row of licenses.data || []) expiryFor.set(row.branchId as string, row.expiryDate as string);
  const studentsFor = new Map<string, number>();
  for (const row of students.data || []) {
    const key = row.branchId as string;
    studentsFor.set(key, (studentsFor.get(key) || 0) + 1);
  }
  // Revenue is what has actually been received; pending is the unpaid balance
  // still outstanding on those invoices. A credit balance is clamped to zero so
  // one over-paid invoice cannot mask real dues elsewhere in the branch.
  const revenueFor = new Map<string, number>();
  const pendingFor = new Map<string, number>();
  for (const row of invoices.data || []) {
    const key = row.branchId as string;
    const paid = Number(row.paidAmount) || 0;
    const total = Number(row.totalAmount) || 0;
    revenueFor.set(key, (revenueFor.get(key) || 0) + paid);
    pendingFor.set(key, (pendingFor.get(key) || 0) + Math.max(total - paid, 0));
  }
  // Prepaid wallet money, topped up on the Wallet Recharge screen. It is not
  // revenue and is deliberately kept out of the two totals above -- a branch
  // that has collected no fees still has whatever it has recharged.
  const walletFor = new Map<string, number>();
  for (const row of wallets.data || []) {
    walletFor.set(row.branchId as string, Number(row.balance) || 0);
  }

  return {
    success: true,
    data: (branches as Record<string, unknown>[]).map((b) => {
      const id = b.id as string;
      return {
        ...b,
        city: addressFor.get(id)?.city || "",
        state: addressFor.get(id)?.state || "",
        // The register is read district- and block-wise as well as by state.
        district: addressFor.get(id)?.district || "",
        block: addressFor.get(id)?.block || "",
        mapLink: addressFor.get(id)?.mapLink || "",
        expiryDate: expiryFor.get(id) || "",
        students: studentsFor.get(id) || 0,
        staff: Number(b.numFaculty) || 0,
        revenue: revenueFor.get(id) || 0,
        pendingRevenue: pendingFor.get(id) || 0,
        walletBalance: walletFor.get(id) || 0,
        status: b.isActive ? "active" : "inactive",
      };
    }),
  };
}

/**
 * A branch is spread over several tables. PostgREST has no transaction across
 * requests, so if a follow-up insert fails the branch row is removed again -
 * otherwise its unique code would block the next attempt.
 */
export async function createBranchWithDetails(
  organizationId: string,
  input: {
    branch: Record<string, unknown>;
    address: Record<string, unknown>;
    director: Record<string, unknown>;
    license?: Record<string, unknown>;
  },
) {
  const branch = await insertBranchRow({ ...input.branch, organizationId });

  const branchId = branch.id as string;
  try {
    const address = { ...input.address, branchId };
    let { error: addressError } = await supabase.from("branch_addresses").insert(address);
    if (addressError && isMissingAddressColumn(addressError)) {
      ({ error: addressError } = await supabase
        .from("branch_addresses")
        .insert(withoutOptionalAddressColumns(address)));
    }
    if (addressError) throw new Error(addressError.message);

    const { error: directorError } = await supabase
      .from("branch_directors")
      .insert({ ...input.director, branchId });
    // The director's gender is an enum until free-text-choices.sql is run.
    if (directorError) throw new Error(describeEnumRejection(directorError, "Could not save the director"));

    if (input.license) {
      const { error: licenseError } = await supabase
        .from("branch_licenses")
        .insert({ ...input.license, branchId });
      if (licenseError) throw new Error(licenseError.message);
    }
  } catch (err) {
    // Undo the branch row, otherwise its unique code and email block the next
    // attempt against a row the register does not show. If the cleanup itself
    // fails, say so - silently swallowing it is what leaves the orphan behind
    // that then reports a baffling duplicate-key error on the retry.
    const { error: cleanupError } = await supabase.from("branches").delete().eq("id", branchId);
    const reason = err instanceof Error ? err.message : "Could not save the branch details";
    if (cleanupError) {
      throw new Error(
        `${reason}. The partly-created branch could not be removed either (${cleanupError.message}), so its code and email are still taken - delete branch ${branchId} in Supabase before retrying.`,
      );
    }
    throw err;
  }

  return { success: true, data: branch };
}

export async function updateBranch(id: string, organizationId: string, input: Record<string, unknown>) {
  const attempt = (body: Record<string, unknown>) =>
    supabase.from("branches").update(body).eq("id", id).eq("organizationId", organizationId).select("*").single();

  let { data, error } = await attempt(input);
  if (error && isMissingBranchColumn(error)) {
    ({ data, error } = await attempt(withoutOptionalBranchColumns(input)));
  }
  // A typed institute type reaches an enum column on a database where
  // free-text-choices.sql has not been run; say so rather than passing on
  // Postgres naming a type nobody asked about.
  if (error) throw new Error(describeEnumRejection(error, "Could not save the branch"));
  return { success: true, data };
}

const functionNotDeployed = (name: string) =>
  `The "${name}" function has not been deployed to this Supabase project, so there was nothing to mint the login. ` +
  `Run \`supabase functions deploy ${name}\`, or paste supabase/functions/${name}/index.ts into Edge Functions ` +
  `in the Supabase dashboard and deploy it there.`;

/**
 * Separates "never deployed" from "deployed but unreachable".
 *
 * Sent with no headers and no body on purpose: that makes it a simple request,
 * so the browser skips the preflight that hides the real status, and the
 * gateway's `Access-Control-Allow-Origin: *` lets us read what came back.
 */
async function describeUnreachableFunction(name: string): Promise<string> {
  try {
    const res = await fetch(`${supabaseUrl}/functions/v1/${name}`, { method: "POST" });
    if (res.status === 404) return functionNotDeployed(name);
  } catch {
    // no network at all, or the project is unreachable - say so below
  }
  return `Could not reach the ${name} function. Check the connection and that the Supabase project is running, then add the login again.`;
}

/**
 * Turns whatever supabase-js reports about an edge-function call into a
 * sentence that names the actual cause. Shared by the branch and student login
 * calls, which fail in exactly the same handful of ways.
 */
async function throwFunctionError(name: string, error: { name?: string; message: string }): Promise<never> {
  const response = (error as { context?: Response }).context;
  // the function replies with { error } on 4xx, which is more useful than "non-2xx"
  const detail = await response?.json?.().catch(() => null);
  if (detail?.error) throw new Error(detail.error);
  if (response?.status === 404) throw new Error(functionNotDeployed(name));
  // The gateway rejects before the function ever runs - an expired session, a
  // malformed token - and answers { code, message } rather than { error }.
  if (detail?.message) {
    throw new Error(
      detail.code === "UNAUTHORIZED_INVALID_JWT_FORMAT" || response?.status === 401
        ? `${detail.message}. Sign out and sign back in, then set the login again.`
        : String(detail.message),
    );
  }
  // A function that was never deployed is invisible from the browser: its
  // preflight 404 allows only `authorization, x-client-info, apikey`, so the
  // POST is blocked before it is sent and supabase-js can say nothing more
  // useful than "Failed to send a request to the Edge Function".
  if (error.name === "FunctionsFetchError") throw new Error(await describeUnreachableFunction(name));
  throw new Error(error.message);
}

/** Every edge-function login call needs a live session, not a restored one. */
async function requireLiveSession() {
  // The app restores the last account from localStorage so a reload paints
  // immediately, which means the UI can show you signed in after the Supabase
  // session behind it has gone. Without this check the function answers the
  // anon key with its own "Not signed in", which reads like a bug in the
  // function rather than an expired session.
  const { data: session } = await supabase.auth.getSession();
  if (!session.session?.access_token) {
    throw new Error("Your session has expired. Sign out and sign back in, then set the login again.");
  }
}

/**
 * Sets the branch's login. The account itself is minted by the
 * create-branch-user edge function, which holds the service-role key -
 * signing up from the browser would swap out the admin's own session.
 *
 * The function upserts: a branch that already has a login gets its username and
 * password replaced, one that has none gets an account. `created` in the reply
 * says which happened, so the caller can word the confirmation correctly.
 */
export async function setBranchLogin(input: {
  branchId: string;
  username: string;
  password: string;
  name?: string;
  email?: string;
  phone?: string;
}) {
  await requireLiveSession();

  const { data, error } = await supabase.functions.invoke("create-branch-user", { body: input });
  if (error) await throwFunctionError("create-branch-user", error);
  if (data?.error) throw new Error(data.error);
  return { success: true, data } as {
    success: true;
    data: { loginEmail: string; username: string; created: boolean };
  };
}

/**
 * Sets the login a student signs in to the portal with.
 *
 * Deliberately callable by a branch as well as an organisation admin -- the
 * branch enrolled the student, so it is the branch that hands them their
 * login. Which students a caller may touch is decided inside the
 * create-student-user function from the caller's own token, not from anything
 * sent here.
 *
 * Leaving `username` out keeps the current login ID and changes only the
 * password, so a reset does not require remembering the ID.
 */
export async function setStudentLogin(input: {
  studentId: string;
  username?: string;
  password: string;
}) {
  await requireLiveSession();

  const { data, error } = await supabase.functions.invoke("create-student-user", { body: input });
  if (error) await throwFunctionError("create-student-user", error);
  if (data?.error) throw new Error(data.error);
  return { success: true, data } as {
    success: true;
    data: { userId: string; loginEmail: string; username: string; created: boolean };
  };
}

/** Kept so existing callers read naturally at the create-branch call site. */
export const createBranchLogin = setBranchLogin;

/** City and state live on branch_addresses, the rest on the branch row itself. */
export async function updateBranchWithDetails(
  id: string,
  organizationId: string,
  input: {
    branch: Record<string, unknown>;
    address?: Record<string, unknown>;
    director?: Record<string, unknown>;
    license?: Record<string, unknown>;
  },
) {
  const result = await updateBranch(id, organizationId, input.branch);
  if (input.address) {
    const update = (body: Record<string, unknown>) =>
      supabase.from("branch_addresses").update(body).eq("branchId", id);
    let { error } = await update(input.address);
    if (error && isMissingAddressColumn(error)) {
      ({ error } = await update(withoutOptionalAddressColumns(input.address)));
    }
    if (error) throw new Error(error.message);
  }
  if (input.director) {
    const { error } = await supabase
      .from("branch_directors")
      .update(input.director)
      .eq("branchId", id);
    if (error) throw new Error(describeEnumRejection(error, "Could not save the director"));
  }
  if (input.license) {
    const { error } = await supabase
      .from("branch_licenses")
      .update(input.license)
      .eq("branchId", id);
    if (error) throw new Error(error.message);
  }
  return result;
}

export async function getBranchDetails(organizationId: string, branchId: string) {
  const { data: branch, error: branchError } = await supabase
    .from("branches")
    .select("*")
    .eq("id", branchId)
    .eq("organizationId", organizationId)
    .is("deletedAt", null)
    .single();
  if (branchError) throw new Error(branchError.message);

  const { data: address } = await supabase.from("branch_addresses").select("*").eq("branchId", branchId).maybeSingle();
  const { data: director } = await supabase.from("branch_directors").select("*").eq("branchId", branchId).maybeSingle();
  const { data: license } = await supabase.from("branch_licenses").select("*").eq("branchId", branchId).maybeSingle();

  return { success: true, data: { ...branch, address, director, license } };
}

export async function deleteBranch(id: string) {
  const { data, error } = await supabase
    .from("branches")
    .update({ deletedAt: new Date().toISOString() })
    .eq("id", id)
    .select("id");
  if (error) throw new Error(error.message);
  assertRemoved(data, "That branch");
  return { success: true };
}

/* ============================
   PORTAL (Student Self-Service)
   ============================ */

/**
 * The signed-in student's own record, as the six portal screens want to render
 * it rather than as the table stores it.
 *
 * The row only carries `courseId`, `batchId` and `branchId`, so the names are
 * embedded; and the mapping is applied here rather than in the pages, because
 * every page that skipped it printed blanks -- and, once the embeds arrived,
 * crashed the dashboard trying to render `{ name }` as a React child.
 *
 * `.maybeSingle()` rather than `.single()`: a student whose row was deleted, or
 * whose token carries a different branch, is a case worth naming. `.single()`
 * reports it as "Cannot coerce the result to a single JSON object", which sends
 * the reader looking for a query bug instead of a missing link.
 *
 * `courses` carries the whole enrolment where `course` carries only the primary
 * one, so a student on three courses no longer sees one of them.
 */
/**
 * Which students row a portal page is for. A student's own login matches on
 * `userId`; an office account viewing a student's portal ("View as student")
 * passes the record's own id instead, which also covers a student who has no
 * login yet. Ids are uuids or cuid-style strings, safe inside the filter.
 */
const portalStudentMatch = (key: string) => `userId.eq.${key},id.eq.${key}`;

export async function getStudentProfile(userId: string, branchId: string) {
  const { data, error } = await supabase
    .from("students")
    // `baseFee` rides along because the portal shows the student what their
    // course costs, which is the only figure they have before an invoice is
    // raised against them.
    .select("*, course:courses(name, code, baseFee), batch:batches(name), branch:branches(name)")
    .or(portalStudentMatch(userId))
    .eq("branchId", branchId)
    .is("deletedAt", null)
    .maybeSingle();
  if (error) throw new Error(error.message);
  if (!data) {
    throw new Error(
      "No student record is linked to this login. Ask the branch office to issue it again.",
    );
  }

  const row = data as unknown as StudentRow & { courseId?: string | null; courseIds?: unknown };
  const profile = toStudentProfile(row);

  // A student can be enrolled on more than one course, and the embed above only
  // resolves the primary one. `courseIds` does not exist until
  // add-multi-course-and-dropdowns.sql has run; until then the primary course
  // is the whole enrolment, which is what this collapses to.
  const extraIds = (Array.isArray(row.courseIds) ? row.courseIds : [])
    .map(String)
    .filter((id) => id && id !== row.courseId);
  const courses = profile.course ? [profile.course] : [];
  if (extraIds.length) {
    const { data: extra } = await supabase.from("courses").select("id,name").in("id", extraIds);
    // `.in()` returns rows in the table's order, not the order asked for, so the
    // enrolment order stored on the row is what is preserved here.
    const nameById = new Map(
      ((extra || []) as Array<{ id: string; name: string }>).map((c) => [c.id, c.name]),
    );
    courses.push(...(extraIds.map((id) => nameById.get(id)).filter(Boolean) as string[]));
  }

  return { success: true as const, data: { ...profile, courses } };
}

export async function getStudentPortalClasses(userId: string, branchId: string) {
  const { data: student } = await supabase.from("students").select("batchId").or(portalStudentMatch(userId)).eq("branchId", branchId).single();
  if (!student?.batchId) return { success: true, data: [] };

  const { data, error } = await supabase
    .from("batch_timings")
    .select("*")
    .eq("batchId", student.batchId)
    .order("day")
    .order("startTime");
  if (error) throw new Error(error.message);
  return { success: true, data: (data || []).map((t: any) => ({ ...t, course: t.subject || t.teacherName || "—" })) };
}

/**
 * The signed-in student's attendance. Registers are keyed by the student
 * record's id, not the login's: the portal passed the login's id straight to
 * getStudentAttendance, matched nothing, and showed every student 0 of 0
 * sessions however many registers had been taken.
 */
export async function getStudentPortalAttendance(userId: string, branchId: string, month?: Date) {
  const { data: student } = await supabase
    .from("students")
    .select("id")
    .or(portalStudentMatch(userId))
    .eq("branchId", branchId)
    .is("deletedAt", null)
    .maybeSingle();
  if (!student) return { success: true, data: [] as Record<string, unknown>[] };
  return getStudentAttendance(String(student.id), branchId, month);
}

/** One subject the student is taught, with who teaches it and when. */
export interface PortalSubject {
  name: string;
  teachers: string[];
  slots: Array<{ day: string; startTime: string; endTime: string; room: string }>;
}

/** One course the student is enrolled on, as their portal shows it. */
export interface PortalCourse {
  id: string;
  name: string;
  code: string;
  category: string;
  description: string;
  duration: string;
  fee: number;
  eligibility: string;
  certification: string;
  /** The student's own batch, when it teaches this course. */
  batch: { name: string; startDate: string; endDate: string; teachers: string[] } | null;
  subjects: PortalSubject[];
  syllabus: { modules: SyllabusModule[]; chapters: SyllabusChapter[]; ready: boolean };
}

const DAY_ORDER = ["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY", "SUNDAY"];

/**
 * Every course the signed-in student is enrolled on, with what goes with it:
 * the course itself, their batch and its teachers, the subjects they are
 * taught -- those set in Assign Course to Batch and those on the timetable --
 * when each is taught, and the course's syllabus.
 */
export async function getStudentPortalCourses(userId: string, branchId: string) {
  const { data: student, error } = await supabase
    .from("students")
    .select("id, courseId, courseIds, batchId")
    .or(portalStudentMatch(userId))
    .eq("branchId", branchId)
    .is("deletedAt", null)
    .maybeSingle();
  if (error) throw new Error(error.message);
  if (!student) return { success: true as const, data: [] as PortalCourse[] };

  const row = student as { courseId?: string | null; courseIds?: unknown; batchId?: string | null };
  const courseIds = [...new Set([row.courseId, ...(Array.isArray(row.courseIds) ? row.courseIds : [])].map((id) => String(id ?? "")).filter(Boolean))];
  if (!courseIds.length) return { success: true as const, data: [] as PortalCourse[] };

  const [courseResult, batchResult, timingResult] = await Promise.all([
    supabase.from("courses").select("*").in("id", courseIds),
    row.batchId ? supabase.from("batches").select("*").eq("id", row.batchId).maybeSingle() : Promise.resolve({ data: null, error: null }),
    row.batchId
      ? supabase.from("batch_timings").select("*").eq("batchId", row.batchId)
      : Promise.resolve({ data: [], error: null }),
  ]);
  if (courseResult.error) throw new Error(courseResult.error.message);

  const batch = batchResult.data ? mapBatch(batchResult.data as Record<string, unknown>) : null;
  const timings = (timingResult.data ?? []) as Array<Record<string, unknown>>;
  const batchTeachers = String(batch?.instructor ?? "").split(",").map((t) => t.trim()).filter(Boolean);

  const syllabi = await Promise.all(
    courseIds.map((id) => getCourseSyllabus(id).then((r) => r.data).catch(() => ({ modules: [], chapters: [], ready: true }))),
  );

  const courses = (courseResult.data ?? []) as Array<Record<string, unknown>>;
  const data: PortalCourse[] = courseIds
    .map((id, index) => {
      const course = courses.find((c) => String(c.id) === id);
      if (!course) return null;
      const ownBatch = batch && String(batch.courseId ?? "") === id ? batch : batch && !batch.courseId && index === 0 ? batch : null;

      // Subjects: those assigned to the batch, then any the timetable adds.
      const subjects = new Map<string, PortalSubject>();
      const subject = (name: string) => {
        const key = name.trim();
        if (!subjects.has(key)) subjects.set(key, { name: key, teachers: [], slots: [] });
        return subjects.get(key)!;
      };
      if (ownBatch) {
        for (const name of (ownBatch.subjects as string[]) ?? []) subject(name);
        for (const t of timings) {
          const name = String(t.subject ?? t.title ?? "").trim();
          if (!name) continue;
          const entry = subject(name);
          const teacher = String(t.instructor ?? "").trim();
          if (teacher && !entry.teachers.includes(teacher)) entry.teachers.push(teacher);
          entry.slots.push({
            day: String(t.day ?? ""),
            startTime: String(t.startTime ?? "").slice(0, 5),
            endTime: String(t.endTime ?? "").slice(0, 5),
            room: String(t.roomNo ?? ""),
          });
        }
        for (const entry of subjects.values()) {
          if (!entry.teachers.length) entry.teachers = [...batchTeachers];
          entry.slots.sort((a, b) => DAY_ORDER.indexOf(a.day.toUpperCase()) - DAY_ORDER.indexOf(b.day.toUpperCase()) || a.startTime.localeCompare(b.startTime));
        }
      }

      const durationValue = Number(course.durationValue) || 0;
      const unit = String(course.durationUnit ?? "").toLowerCase();
      return {
        id,
        name: String(course.name ?? ""),
        code: String(course.code ?? ""),
        category: String(course.category ?? ""),
        description: String(course.description ?? ""),
        duration: durationValue ? `${durationValue} ${unit || "months"}` : "",
        fee: Number(course.baseFee) || 0,
        eligibility: String(course.eligibility ?? ""),
        certification: String(course.certification ?? ""),
        batch: ownBatch
          ? {
              name: String(ownBatch.name ?? ""),
              startDate: String(ownBatch.startDate ?? ""),
              endDate: String(ownBatch.endDate ?? ""),
              teachers: batchTeachers,
            }
          : null,
        subjects: [...subjects.values()],
        syllabus: syllabi[index],
      };
    })
    .filter((c): c is PortalCourse => c !== null);

  return { success: true as const, data };
}

export async function getStudentPortalInvoices(userId: string, branchId: string) {
  const { data: student } = await supabase.from("students").select("id").or(portalStudentMatch(userId)).eq("branchId", branchId).single();
  if (!student) return { success: true, data: [] };
  return getStudentInvoices(student.id, branchId);
}

export async function getStudentPortalResults(userId: string, branchId: string, examId?: string) {
  const { data: student } = await supabase.from("students").select("id").or(portalStudentMatch(userId)).eq("branchId", branchId).single();
  if (!student) return { success: true, data: [] };
  return getStudentResults(student.id, branchId, examId);
}

export async function submitPortalRequest(userId: string, branchId: string, organizationId: string, kind: string, detail: string, studentId?: string) {
  const { data, error } = await supabase.from("audit_events").insert({
    actorId: userId,
    organizationId,
    branchId,
    action: kind,
    entityType: "PortalRequest",
    entityId: crypto.randomUUID(),
    after: { detail, studentId },
  }).select("*").single();
  if (error) throw new Error(error.message);
  return { success: true, data };
}

/**
 * The read side of `submitPortalRequest`. Portal requests are not a table of
 * their own - they are `audit_events` rows tagged `entityType = "PortalRequest"`,
 * so this filters on that rather than on a dedicated endpoint.
 */
export async function getPortalRequests(userId: string | null, branchId: string | null) {
  if (!userId) return { success: true, data: [] as Record<string, unknown>[] };
  let query = supabase
    .from("audit_events")
    .select("*")
    .eq("entityType", "PortalRequest")
    .eq("actorId", userId)
    .order("createdAt", { ascending: false });
  if (branchId) query = query.eq("branchId", branchId);
  const { data, error } = await query;
  if (error) throw new Error(error.message);
  return { success: true, data: data || [] };
}

/* ============================
   MISC / SETTINGS
   ============================ */

/** One row of the website register: the branch, and the site it runs. */
export interface BranchWebsiteRow {
  id: string;
  name: string;
  code: string;
  branchType: string;
  /** What the site is called, when the branch has named it. */
  siteName: string;
  /** Bare host, no scheme — the register prints it and links to it. */
  domain: string;
  registrationDate: string;
  expiryDate: string;
  renewalDate: string;
  phone: string;
  whatsapp: string;
}

/** `https://` and any trailing slash stripped, so the column reads as a host. */
const bareHost = (value: unknown) =>
  String(value ?? "")
    .trim()
    .replace(/^https?:\/\//i, "")
    .replace(/\/+$/, "");

/**
 * Every branch beside its website and the dates that site runs on.
 *
 * Two tables: the branch's own row carries the numbers to reach it by, and
 * `branch_settings` carries the domain and the registration / expiry / renewal
 * dates. A branch with no settings row yet is still listed — it has a website
 * to set up, which is exactly what this register is for noticing.
 */
export async function getBranchWebsites(organizationId: string | null) {
  const { data: branches } = await getBranches(organizationId);
  const rows = (branches ?? []) as Record<string, unknown>[];
  if (!rows.length) return { success: true as const, data: [] as BranchWebsiteRow[] };

  const ids = rows.map((b) => String(b.id));
  // The date and domain columns arrive with add-website-settings-fields.sql;
  // without them the register still lists every branch and its numbers.
  const settingsSelect = async () => {
    const wanted = await supabase
      .from("branch_settings")
      .select("branchId, siteName, primaryDomain, subdomain, registrationDate, expiryDate, renewalDate")
      .in("branchId", ids);
    if (!wanted.error) return wanted;
    return supabase.from("branch_settings").select("branchId").in("branchId", ids);
  };
  const { data: settings } = await settingsSelect();

  const settingFor = new Map<string, Record<string, unknown>>();
  for (const row of settings ?? []) settingFor.set(String(row.branchId), row as Record<string, unknown>);

  return {
    success: true as const,
    data: rows.map((b): BranchWebsiteRow => {
      const id = String(b.id);
      const setting = settingFor.get(id) ?? {};
      return {
        id,
        name: String(b.name ?? "Unnamed branch"),
        code: String(b.code ?? ""),
        branchType: String(b.branchType ?? ""),
        siteName: String(setting.siteName ?? ""),
        // The branch's own `website` stands in where no domain was configured,
        // since that is where the address was recorded before this screen.
        domain: bareHost(setting.primaryDomain) || bareHost(setting.subdomain) || bareHost(b.website),
        registrationDate: String(setting.registrationDate ?? ""),
        expiryDate: String(setting.expiryDate ?? ""),
        renewalDate: String(setting.renewalDate ?? ""),
        phone: String(b.phone ?? ""),
        whatsapp: String(b.whatsappNumber ?? b.phone ?? ""),
      };
    }),
  };
}

export async function getBranchSettings(branchId: string | null) {
  if (!branchId) return { success: true, data: null };
  // `maybeSingle`: a branch that has never saved its website settings has no
  // row, and `single` answers that with a 406 the browser logs on every page.
  const { data, error } = await supabase.from("branch_settings").select("*").eq("branchId", branchId).maybeSingle();
  if (error && error.code !== "PGRST116") throw new Error(error.message);
  return { success: true, data: data || null };
}

/**
 * The website-settings form edits far more fields than `branch_settings` has
 * columns for. Rather than reject the whole save, this drops each unknown column
 * PostgREST complains about and retries, reporting what it had to leave out so
 * the caller can tell the user which migration is missing.
 */
export async function updateBranchSettings(branchId: string | null, input: Record<string, unknown>) {
  if (!branchId) return { success: true, data: null, droppedColumns: [] as string[] };

  const payload = { ...input, branchId };
  const dropped: string[] = [];

  for (let attempt = 0; attempt < Object.keys(input).length + 1; attempt++) {
    const { data, error } = await supabase.from("branch_settings").upsert(payload).select("*").single();
    if (!error) return { success: true, data, droppedColumns: dropped };

    const missing =
      error.code === "PGRST204" || error.code === "42703"
        ? Object.keys(payload).find((key) => key !== "branchId" && error.message?.includes(`'${key}'`))
        : undefined;
    if (!missing) throw new Error(error.message);
    delete payload[missing];
    dropped.push(missing);
  }
  throw new Error("Could not save branch settings.");
}

export async function getWallet(branchId: string | null) {
  if (!branchId) return { success: true, data: null };
  // `maybeSingle`, not `single`: a branch that has never been recharged has no
  // wallet row, and `single` answers that with a 406 that the browser logs as a
  // failed request even though the caller treats it as a zero balance.
  const { data, error } = await supabase.from("branch_wallets").select("*").eq("branchId", branchId).maybeSingle();
  if (error && error.code !== "PGRST116") throw new Error(error.message);
  return { success: true, data: data || null };
}

/**
 * `branch_transactions` stores `createdAt`, `balanceAfter` and an uppercase
 * enum type, while the transactions table renders `date`, `branch`, `balance`
 * and a lowercase type. Without this mapping those columns render empty.
 */
const TRANSACTION_SELECT = "*, branch:branches(id, name, code)";

export interface WalletTransactionItem {
  id: string;
  branchId: string;
  branch: string;
  branchCode: string;
  amount: number;
  type: "credit" | "debit";
  category: string;
  description: string;
  reference: string;
  status: "PENDING" | "COMPLETED" | "FAILED";
  uiStatus: "pending" | "approved" | "rejected";
  paymentMethod: string;
  balanceAfter: number;
  balance: number;
  date: string;
  formattedDateTime: string;
  createdAt: string;
  proofUrl: string | null;
  reviewedBy: string | null;
  reviewedAt: string | null;
  submittedBy: string;
  rejectionReason: string | null;
  remarks: string;
}

function extractSubmittedBy(desc: string | null | undefined): string {
  if (!desc) return "Staff";
  const match = desc.match(/Submitted by:\s*([^•\n]+)/i);
  if (match && match[1]) return match[1].trim();
  return "Staff";
}

function extractRejectionReason(desc: string | null | undefined): string | null {
  if (!desc) return null;
  const match = desc.match(/\[Rejected:\s*([^\]]+)\]/i);
  if (match && match[1]) return match[1].trim();
  return null;
}

function extractRemarks(desc: string | null | undefined): string {
  if (!desc) return "";
  let clean = desc.replace(/Submitted by:[^•\n]+/gi, "").replace(/\[Rejected:[^\]]+\]/gi, "");
  clean = clean.replace(/•\s*$/, "").replace(/^\s*•/, "").trim();
  return clean === "Wallet recharge" || clean === "Wallet recharge request" ? "" : clean;
}

function mapTransaction(row: Record<string, unknown>): WalletTransactionItem {
  const branch = row.branch as { name?: string; code?: string } | null;
  const created = (row.createdAt as string) || "";
  const at = storedTime(created);
  const rawStatus = String(row.status || "COMPLETED").toUpperCase() as "PENDING" | "COMPLETED" | "FAILED";
  const uiStatus: "pending" | "approved" | "rejected" =
    rawStatus === "PENDING" ? "pending" : rawStatus === "COMPLETED" ? "approved" : "rejected";

  const formattedDateTime = at && !Number.isNaN(at.getTime())
    ? at.toLocaleString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      })
    : "—";

  const rawDesc = (row.description as string) || (row.category as string) || "";
  const desc = rawDesc || "—";
  const submittedBy = (row.submittedBy as string) || extractSubmittedBy(rawDesc);
  const rejectionReason = (row.rejectionReason as string) || extractRejectionReason(rawDesc);
  const remarks = extractRemarks(rawDesc);

  return {
    id: String(row.id || ""),
    branchId: String(row.branchId || ""),
    branch: branch?.name || "—",
    branchCode: branch?.code || "",
    amount: Number(row.amount) || 0,
    type: String(row.type || "").toUpperCase() === "DEBIT" ? "debit" : "credit",
    category: String(row.category || "RECHARGE"),
    description: desc,
    reference: (row.reference as string) || (row.id as string) || "—",
    status: rawStatus,
    uiStatus,
    paymentMethod: String(row.paymentMethod || "UPI"),
    balanceAfter: Number(row.balanceAfter) || 0,
    balance: Number(row.balanceAfter) || 0,
    date: at && !Number.isNaN(at.getTime()) ? at.toISOString().slice(0, 10) : "—",
    formattedDateTime,
    createdAt: created,
    proofUrl: (row.proofUrl as string) || null,
    reviewedBy: (row.reviewedBy as string) || null,
    reviewedAt: (row.reviewedAt as string) || null,
    submittedBy,
    rejectionReason,
    remarks,
  };
}

export async function getTransactions(branchId: string | null) {
  if (!branchId) return { success: true, data: [] };
  const { data, error } = await supabase
    .from("branch_transactions")
    .select(TRANSACTION_SELECT)
    .eq("branchId", branchId)
    .order("createdAt", { ascending: false });
  if (error) throw new Error(error.message);
  return { success: true, data: (data || []).map(mapTransaction) };
}

export async function getWalletsByOrg(organizationId: string | null) {
  if (!organizationId) return { success: true, data: [] };
  const { data, error } = await supabase
    .from("branch_wallets")
    .select("*")
    .in("branchId", (await getBranchIdsByOrg(organizationId)) || []);
  if (error) throw new Error(error.message);
  return { success: true, data: data || [] };
}

export async function getTransactionsByOrg(organizationId: string | null) {
  if (!organizationId) return { success: true, data: [] };
  const { data, error } = await supabase
    .from("branch_transactions")
    .select(TRANSACTION_SELECT)
    .in("branchId", (await getBranchIdsByOrg(organizationId)) || [])
    .order("createdAt", { ascending: false });
  if (error) throw new Error(error.message);
  return { success: true, data: (data || []).map(mapTransaction) };
}

export interface WalletTransactionFilters {
  organizationId?: string | null;
  branchId?: string | null;
  status?: "ALL" | "PENDING" | "COMPLETED" | "FAILED";
  paymentMethod?: string | null;
  search?: string;
  startDate?: string | null;
  endDate?: string | null;
  page?: number;
  pageSize?: number;
  sortBy?: "createdAt" | "amount" | "branch" | "status";
  sortOrder?: "asc" | "desc";
}

export interface WalletTransactionsResult {
  success: boolean;
  data: WalletTransactionItem[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
  counts: {
    all: number;
    pending: number;
    approved: number;
    rejected: number;
  };
  totals: {
    totalBalance: number;
    pendingAmount: number;
    approvedAmount: number;
  };
}

export async function getWalletTransactions(
  filters: WalletTransactionFilters = {}
): Promise<WalletTransactionsResult> {
  const {
    organizationId,
    branchId,
    status = "ALL",
    paymentMethod,
    search,
    startDate,
    endDate,
    page = 1,
    pageSize = 25,
    sortBy = "createdAt",
    sortOrder = "desc",
  } = filters;

  let branchIds: string[] = [];
  if (branchId) {
    branchIds = [branchId];
  } else if (organizationId) {
    branchIds = await getBranchIdsByOrg(organizationId);
  }

  // Fetch all transactions in scope to compute exact summary counts and filtered pagination
  let query = supabase
    .from("branch_transactions")
    .select(TRANSACTION_SELECT)
    .order("createdAt", { ascending: false });

  if (branchIds.length > 0) {
    query = query.in("branchId", branchIds);
  }

  const { data: rawRows, error } = await query;
  if (error) throw new Error(error.message);

  const mapped = (rawRows || []).map(mapTransaction);

  // Compute breakdown counts across the entire scoped dataset
  const counts = {
    all: mapped.length,
    pending: mapped.filter((t) => t.status === "PENDING").length,
    approved: mapped.filter((t) => t.status === "COMPLETED").length,
    rejected: mapped.filter((t) => t.status === "FAILED").length,
  };

  const totals = {
    totalBalance: 0,
    pendingAmount: mapped
      .filter((t) => t.status === "PENDING")
      .reduce((sum, t) => sum + t.amount, 0),
    // Recharges only: a certificate fee is a COMPLETED debit, not money in.
    approvedAmount: mapped
      .filter((t) => t.status === "COMPLETED" && t.type !== "debit")
      .reduce((sum, t) => sum + t.amount, 0),
  };

  // Filter in memory for maximum responsiveness & search flexibility
  let filtered = mapped;

  if (status && status !== "ALL") {
    filtered = filtered.filter((t) => t.status === status);
  }

  if (branchId) {
    filtered = filtered.filter((t) => t.branchId === branchId);
  }

  if (paymentMethod && paymentMethod !== "ALL") {
    const pmNormalized = paymentMethod.toUpperCase();
    filtered = filtered.filter(
      (t) => t.paymentMethod.toUpperCase() === pmNormalized
    );
  }

  if (startDate) {
    filtered = filtered.filter((t) => t.createdAt >= startDate);
  }

  if (endDate) {
    filtered = filtered.filter((t) => t.createdAt <= endDate);
  }

  if (search && search.trim()) {
    const q = search.trim().toLowerCase();
    filtered = filtered.filter(
      (t) =>
        t.id.toLowerCase().includes(q) ||
        t.reference.toLowerCase().includes(q) ||
        t.branch.toLowerCase().includes(q) ||
        t.branchCode.toLowerCase().includes(q) ||
        t.submittedBy.toLowerCase().includes(q) ||
        t.description.toLowerCase().includes(q) ||
        String(t.amount).includes(q)
    );
  }

  // Sort
  filtered.sort((a, b) => {
    let comparison = 0;
    if (sortBy === "createdAt") {
      comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    } else if (sortBy === "amount") {
      comparison = a.amount - b.amount;
    } else if (sortBy === "branch") {
      comparison = a.branch.localeCompare(b.branch);
    } else if (sortBy === "status") {
      comparison = a.status.localeCompare(b.status);
    }
    return sortOrder === "asc" ? comparison : -comparison;
  });

  const totalCount = filtered.length;
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
  const safePage = Math.min(Math.max(1, page), totalPages);
  const fromIndex = (safePage - 1) * pageSize;
  const pagedData = filtered.slice(fromIndex, fromIndex + pageSize);

  return {
    success: true,
    data: pagedData,
    totalCount,
    page: safePage,
    pageSize,
    totalPages,
    counts,
    totals,
  };
}

async function getBranchIdsByOrg(organizationId: string | null): Promise<string[]> {
  if (!organizationId) return [];
  const { data, error } = await supabase.from("branches").select("id").eq("organizationId", organizationId);
  if (error) throw new Error(error.message);
  return ((data || []) as any[]).map((b) => b.id);
}

/**
 * Submits a new wallet recharge request in PENDING state.
 * Validates branch, amount, payment method, duplicate UTR, and logs immutable audit event.
 */
export async function submitRechargeRequest(input: {
  branchId: string;
  amount: number;
  paymentMethod: string;
  reference: string;
  proofUrl?: string | null;
  remarks?: string;
  submittedBy?: { id?: string; name?: string; email?: string };
  organizationId?: string | null;
}) {
  if (!input.branchId) {
    return { success: false, error: "Please select a branch / institute." };
  }

  const amount = Number(input.amount);
  if (!Number.isFinite(amount) || amount <= 0) {
    return { success: false, error: "Enter a valid recharge amount greater than zero." };
  }

  const reference = (input.reference || "").trim();
  if (!reference) {
    return { success: false, error: "Transaction Reference / UTR number is required." };
  }

  // Duplicate UTR / reference check across active transactions
  const { data: existingTx, error: checkErr } = await supabase
    .from("branch_transactions")
    .select("id, reference, status, createdAt")
    .eq("reference", reference)
    .neq("status", "FAILED")
    .limit(1);

  if (checkErr) throw new Error(checkErr.message);
  if (existingTx && existingTx.length > 0) {
    const existing = existingTx[0];
    return {
      success: false,
      error: `Duplicate UTR / Reference: A transaction with reference "${reference}" already exists (${existing.status} on ${existing.createdAt?.slice(0, 10)}).`,
    };
  }

  // Fetch current branch wallet balance so pending transaction preserves the snapshot
  const { data: wallet } = await supabase
    .from("branch_wallets")
    .select("balance")
    .eq("branchId", input.branchId)
    .maybeSingle();

  const currentBalance = Number(wallet?.balance || 0);
  const pm = (input.paymentMethod || "UPI").toUpperCase();

  const submitterName = input.submittedBy?.name || input.submittedBy?.email || "Staff";
  const descParts: string[] = [];
  if (input.remarks && input.remarks.trim()) {
    descParts.push(input.remarks.trim());
  }
  descParts.push(`Submitted by: ${submitterName}`);
  const description = descParts.join(" • ");

  const { data: tx, error: tErr } = await supabase
    .from("branch_transactions")
    .insert({
      branchId: input.branchId,
      amount,
      type: "CREDIT",
      category: "RECHARGE",
      description,
      reference,
      status: "PENDING",
      paymentMethod: pm as any,
      balanceAfter: currentBalance,
      proofUrl: input.proofUrl || null,
    })
    .select(TRANSACTION_SELECT)
    .single();

  if (tErr) throw new Error(tErr.message);

  // Write immutable audit log
  try {
    await supabase.from("audit_events").insert({
      id: newId("aud"),
      actorId: input.submittedBy?.id || null,
      organizationId: input.organizationId || null,
      branchId: input.branchId,
      action: "RECHARGE_SUBMITTED",
      entityType: "BranchTransaction",
      entityId: tx.id,
      after: {
        amount,
        paymentMethod: pm,
        reference,
        submittedBy: submitterName,
        proofUrl: input.proofUrl || null,
        remarks: input.remarks || null,
      },
    });
  } catch (auditError) {
    console.warn("Audit log creation warning:", auditError);
  }

  return { success: true, data: mapTransaction(tx) };
}

/** Postgres 22P02 raised because a name was written to a uuid column. */
function isUuidCastError(error: { code?: string; message?: string } | null): boolean {
  if (!error) return false;
  return error.code === "22P02" || /invalid input syntax for type uuid/i.test(error.message || "");
}

/**
 * Atomically approves a pending recharge request.
 * - Idempotency & race-condition check (aborts if not PENDING).
 * - Credits wallet balance exactly once.
 * - Transitions status to COMPLETED.
 * - Records reviewer name and timestamp.
 * - Writes immutable audit event.
 */
export async function approveRechargeTransaction(
  transactionId: string,
  reviewer: { id?: string; name?: string; role?: string; email?: string }
) {
  if (!transactionId) {
    return { success: false, error: "Transaction ID is required." };
  }

  // 1. Fetch current transaction record and verify status is PENDING
  const { data: tx, error: txErr } = await supabase
    .from("branch_transactions")
    .select("*, branch:branches(id, name, code)")
    .eq("id", transactionId)
    .single();

  if (txErr || !tx) {
    return { success: false, error: "Transaction not found." };
  }

  if (tx.status === "COMPLETED") {
    return {
      success: false,
      error: `Transaction ${transactionId} has already been approved and credited.`,
    };
  }

  if (tx.status === "FAILED") {
    return {
      success: false,
      error: `Transaction ${transactionId} has already been rejected.`,
    };
  }

  if (tx.status !== "PENDING") {
    return {
      success: false,
      error: `Transaction status is "${tx.status}"; only PENDING transactions can be approved.`,
    };
  }

  const amount = Number(tx.amount);
  if (!Number.isFinite(amount) || amount <= 0) {
    return { success: false, error: "Invalid transaction amount." };
  }

  const branchId = tx.branchId;
  const reviewerName = reviewer.name || reviewer.email || reviewer.id || "Administrator";
  const now = new Date().toISOString();

  // 2. Claim the request before touching the wallet.
  //
  // Crediting first and flipping the status afterwards leaves money credited
  // against a row still marked PENDING whenever the second write fails, and the
  // next click on Approve credits it again. Taking the row first, guarded on it
  // still being PENDING, means a second approval finds nothing to claim. If the
  // wallet write then fails the claim is handed back below.
  const claimRow = (reviewedBy: string | null) =>
    supabase
      .from("branch_transactions")
      .update({ status: "COMPLETED", reviewedBy, reviewedAt: now, updatedAt: now })
      .eq("id", transactionId)
      .eq("status", "PENDING")
      .select("id");

  let { data: claimed, error: claimErr } = await claimRow(reviewerName);

  // add-recharge-approval.sql declared `reviewedBy` uuid while the approval code
  // and supabase-wallet-recharge-functions.sql both treat it as the reviewer's
  // name. On a database where the uuid form is still live, writing the name is
  // rejected outright and no recharge can ever be approved -- so fall back to
  // the reviewer's id, which either column accepts.
  if (claimErr && isUuidCastError(claimErr)) {
    ({ data: claimed, error: claimErr } = await claimRow(reviewer.id || null));
  }

  if (claimErr) throw new Error(`Failed to update transaction status: ${claimErr.message}`);
  if (!claimed || claimed.length === 0) {
    return {
      success: false,
      error: `Transaction ${transactionId} was already processed by another reviewer.`,
    };
  }

  const releaseClaim = async () => {
    await supabase
      .from("branch_transactions")
      .update({ status: "PENDING", reviewedBy: null, reviewedAt: null, updatedAt: new Date().toISOString() })
      .eq("id", transactionId);
  };

  // 3. Fetch current wallet balance
  const { data: wallet, error: wErr } = await supabase
    .from("branch_wallets")
    .select("*")
    .eq("branchId", branchId)
    .maybeSingle();

  if (wErr) {
    await releaseClaim();
    throw new Error(wErr.message);
  }

  const currentBalance = Number(wallet?.balance || 0);
  const newBalance = currentBalance + amount;

  // 4. Credit the wallet the branch's own portal reads
  if (wallet?.id) {
    const { error: uErr } = await supabase
      .from("branch_wallets")
      .update({
        balance: newBalance,
        lastRechargeAmount: amount,
        lastRechargeDate: now,
        updatedAt: now,
      })
      .eq("id", wallet.id);

    if (uErr) {
      await releaseClaim();
      throw new Error(`Failed to update branch wallet: ${uErr.message}`);
    }
  } else {
    // `id` is TEXT NOT NULL -- see lib/id.ts. A branch being recharged for the
    // first time has no wallet row, and an insert without an id is rejected.
    const { error: iErr } = await supabase.from("branch_wallets").insert({
      id: newId("wal"),
      branchId,
      balance: newBalance,
      lastRechargeAmount: amount,
      lastRechargeDate: now,
      updatedAt: now,
    });

    if (iErr) {
      await releaseClaim();
      throw new Error(`Failed to initialize branch wallet: ${iErr.message}`);
    }
  }

  // 5. Stamp the balance the credit landed on
  const { data: updatedTx, error: upErr } = await supabase
    .from("branch_transactions")
    .update({ balanceAfter: newBalance, updatedAt: now })
    .eq("id", transactionId)
    .select(TRANSACTION_SELECT)
    .single();

  if (upErr) throw new Error(`Failed to update transaction status: ${upErr.message}`);

  // 6. Write immutable audit log
  try {
    await supabase.from("audit_events").insert({
      id: newId("aud"),
      actorId: reviewer.id || null,
      branchId,
      action: "RECHARGE_APPROVED",
      entityType: "BranchTransaction",
      entityId: transactionId,
      before: {
        status: "PENDING",
        balance: currentBalance,
      },
      after: {
        status: "COMPLETED",
        balanceBefore: currentBalance,
        balanceAfter: newBalance,
        amount,
        reference: tx.reference,
        paymentMethod: tx.paymentMethod,
        reviewedBy: reviewerName,
        reviewedAt: now,
      },
    });
  } catch (auditErr) {
    console.warn("Audit logging warning:", auditErr);
  }

  return {
    success: true,
    data: mapTransaction(updatedTx),
    newBalance,
  };
}

/**
 * Rejects a pending recharge request.
 * - Idempotency & race-condition check.
 * - Requires mandatory rejection reason.
 * - Transitions status to FAILED.
 * - Wallet balance is untouched.
 * - Writes immutable audit event.
 */
export async function rejectRechargeTransaction(
  transactionId: string,
  reviewer: { id?: string; name?: string; role?: string; email?: string },
  reason: string
) {
  if (!transactionId) {
    return { success: false, error: "Transaction ID is required." };
  }

  const cleanReason = (reason || "").trim();
  if (!cleanReason) {
    return { success: false, error: "Please provide a reason for rejecting this recharge request." };
  }

  // 1. Fetch current transaction and verify PENDING status
  const { data: tx, error: txErr } = await supabase
    .from("branch_transactions")
    .select("*, branch:branches(id, name, code)")
    .eq("id", transactionId)
    .single();

  if (txErr || !tx) {
    return { success: false, error: "Transaction not found." };
  }

  if (tx.status !== "PENDING") {
    return {
      success: false,
      error: `Transaction status is "${tx.status}"; only PENDING transactions can be rejected.`,
    };
  }

  const reviewerName = reviewer.name || reviewer.email || reviewer.id || "Administrator";
  const now = new Date().toISOString();

  const existingDesc = tx.description || "";
  const updatedDesc = existingDesc
    ? `${existingDesc} • [Rejected: ${cleanReason}]`
    : `[Rejected: ${cleanReason}]`;

  // 2. Update transaction status to FAILED, guarded on it still being PENDING
  //    so two reviewers cannot both record a rejection reason on one request.
  const rejectRow = (reviewedBy: string | null) =>
    supabase
      .from("branch_transactions")
      .update({
        status: "FAILED",
        description: updatedDesc,
        reviewedBy,
        reviewedAt: now,
        updatedAt: now,
      })
      .eq("id", transactionId)
      .eq("status", "PENDING")
      .select(TRANSACTION_SELECT);

  let { data: rejected, error: upErr } = await rejectRow(reviewerName);
  if (upErr && isUuidCastError(upErr)) {
    ({ data: rejected, error: upErr } = await rejectRow(reviewer.id || null));
  }

  if (upErr) throw new Error(`Failed to reject transaction: ${upErr.message}`);
  if (!rejected || rejected.length === 0) {
    return {
      success: false,
      error: `Transaction ${transactionId} was already processed by another reviewer.`,
    };
  }
  const updatedTx = rejected[0];

  // 3. Write immutable audit log
  try {
    await supabase.from("audit_events").insert({
      id: newId("aud"),
      actorId: reviewer.id || null,
      branchId: tx.branchId,
      action: "RECHARGE_REJECTED",
      entityType: "BranchTransaction",
      entityId: transactionId,
      before: {
        status: "PENDING",
      },
      after: {
        status: "FAILED",
        rejectionReason: cleanReason,
        reviewedBy: reviewerName,
        reviewedAt: now,
        amount: tx.amount,
        reference: tx.reference,
      },
    });
  } catch (auditErr) {
    console.warn("Audit logging warning:", auditErr);
  }

  return { success: true, data: mapTransaction(updatedTx) };
}

/**
 * Bulk approves multiple pending transactions safely with error isolation.
 */
export async function bulkApproveRecharges(
  transactionIds: string[],
  reviewer: { id?: string; name?: string; role?: string; email?: string }
) {
  const succeeded: WalletTransactionItem[] = [];
  const failed: { id: string; error: string }[] = [];

  for (const id of transactionIds) {
    try {
      const res = await approveRechargeTransaction(id, reviewer);
      if (res.success && res.data) {
        succeeded.push(res.data);
      } else {
        failed.push({ id, error: res.error || "Approval failed" });
      }
    } catch (err) {
      failed.push({
        id,
        error: err instanceof Error ? err.message : "Unknown error",
      });
    }
  }

  return {
    success: failed.length === 0,
    succeeded,
    failed,
    totalProcessed: transactionIds.length,
  };
}

/**
 * Bulk rejects multiple pending transactions safely with error isolation.
 */
export async function bulkRejectRecharges(
  transactionIds: string[],
  reviewer: { id?: string; name?: string; role?: string; email?: string },
  reason: string
) {
  const succeeded: WalletTransactionItem[] = [];
  const failed: { id: string; error: string }[] = [];

  for (const id of transactionIds) {
    try {
      const res = await rejectRechargeTransaction(id, reviewer, reason);
      if (res.success && res.data) {
        succeeded.push(res.data);
      } else {
        failed.push({ id, error: res.error || "Rejection failed" });
      }
    } catch (err) {
      failed.push({
        id,
        error: err instanceof Error ? err.message : "Unknown error",
      });
    }
  }

  return {
    success: failed.length === 0,
    succeeded,
    failed,
    totalProcessed: transactionIds.length,
  };
}

/**
 * Fetches the immutable audit trail for a transaction from audit_events.
 */
export async function getTransactionAuditTrail(transactionId: string) {
  if (!transactionId) return { success: true, data: [] };
  const { data, error } = await supabase
    .from("audit_events")
    .select("*")
    .eq("entityType", "BranchTransaction")
    .eq("entityId", transactionId)
    .order("createdAt", { ascending: true });

  if (error) throw new Error(error.message);
  return { success: true, data: data || [] };
}

/**
 * Backward-compatible wrapper for legacy direct recharge calls.
 */
export async function rechargeWallet(
  branchId: string | null,
  input: { amount: number; paymentMethod: string; description?: string; reference?: string }
) {
  if (!branchId) return { success: false, error: "Missing branch" };
  const amount = Number(input.amount);
  if (!Number.isFinite(amount) || amount <= 0) return { success: false, error: "Invalid amount" };
  const pm = (input.paymentMethod || "UPI").toUpperCase();
  const { data: wallet, error: wErr } = await supabase.from("branch_wallets").select("*").eq("branchId", branchId).single();
  if (wErr && wErr.code !== "PGRST116") throw new Error(wErr.message);
  const currentBalance = Number(wallet?.balance || 0);
  const newBalance = currentBalance + amount;
  // `id` and `updatedAt` are NOT NULL with no database default -- see lib/id.ts.
  if (wallet?.id) {
    const { error: uErr } = await supabase.from("branch_wallets").update({
      balance: newBalance,
      lastRechargeAmount: amount,
      lastRechargeDate: nowIso(),
      updatedAt: nowIso(),
    }).eq("id", wallet.id);
    if (uErr) throw new Error(uErr.message);
  } else {
    const { error: iErr } = await supabase.from("branch_wallets").insert({
      id: newId("wal"),
      branchId,
      balance: newBalance,
      lastRechargeAmount: amount,
      lastRechargeDate: nowIso(),
      updatedAt: nowIso(),
    });
    if (iErr) throw new Error(iErr.message);
  }
  const { data: tx, error: tErr } = await supabase.from("branch_transactions").insert({
    id: newId("txn"),
    branchId,
    amount,
    type: "CREDIT",
    category: "RECHARGE",
    description: input.description || "Wallet recharge",
    reference: input.reference || null,
    status: "COMPLETED",
    paymentMethod: pm as any,
    balanceAfter: newBalance,
    updatedAt: nowIso(),
  }).select(TRANSACTION_SELECT).single();
  if (tErr) throw new Error(tErr.message);
  return { success: true, data: mapTransaction(tx) };
}

/* ============================
   WALLET RECHARGE APPROVAL

   A branch no longer credits itself. It pays the organisation's UPI account,
   files the UTR and a screenshot, and the balance moves only when an admin
   approves. `rechargeWallet` above is the admin's direct top-up.
   ============================ */

/** The UPI account a branch is told to pay. One per organisation. */
export async function getRechargeUpi(organizationId: string | null) {
  if (!organizationId) return { success: true, data: null };
  const { data, error } = await supabase
    .from("organizations")
    .select('name, "rechargeUpiId", "rechargeUpiName"')
    .eq("id", organizationId)
    .maybeSingle();
  if (error) throw new Error(error.message);
  if (!data) return { success: true, data: null };
  const row = data as { name?: string; rechargeUpiId?: string; rechargeUpiName?: string };
  return {
    success: true,
    data: row.rechargeUpiId
      ? { upiId: row.rechargeUpiId, merchantName: row.rechargeUpiName || row.name || "Recharge" }
      : null,
  };
}

export async function setRechargeUpi(organizationId: string, upiId: string, merchantName: string) {
  const { error } = await supabase
    .from("organizations")
    .update({ rechargeUpiId: upiId || null, rechargeUpiName: merchantName || null })
    .eq("id", organizationId);
  if (error) throw new Error(error.message);
  return { success: true };
}

/**
 * The screenshot goes to a private bucket under the branch's own folder, which
 * is what the storage policy keys on. A signed URL is what anyone reads it by.
 */
export async function uploadRechargeProof(branchId: string, file: File) {
  const ext = (file.name.split(".").pop() || "jpg").toLowerCase().replace(/[^a-z0-9]/g, "");
  const path = `${branchId}/${newId("proof")}.${ext}`;
  const { error } = await supabase.storage
    .from("recharge-proofs")
    .upload(path, file, { contentType: file.type || "image/jpeg", upsert: false });
  if (error) throw new Error(error.message);
  return { success: true, data: path };
}

export async function getRechargeProofUrl(path: string) {
  const { data, error } = await supabase.storage.from("recharge-proofs").createSignedUrl(path, 600);
  if (error) throw new Error(error.message);
  return { success: true, data: data.signedUrl };
}

/**
 * `proofUrl` holds one of two things depending on which screen filed the
 * request: an object path inside the private `recharge-proofs` bucket, or --
 * for rows written before the drawer uploaded anything -- an inline data URL.
 * A path is not something an <img> can load, which is why the proof rendered
 * broken. Anything already loadable is returned untouched; a path is signed.
 */
export async function resolveRechargeProofUrl(value: string | null | undefined) {
  const raw = (value || "").trim();
  if (!raw) return { success: true as const, data: null };
  if (/^(https?:|data:|blob:)/i.test(raw)) return { success: true as const, data: raw };
  return getRechargeProofUrl(raw) as Promise<{ success: true; data: string }>;
}

/**
 * Files a recharge for approval. `balanceAfter` is 0 because nothing has moved
 * yet -- the RLS policy insists on it, so a branch cannot file a row that looks
 * like a settled one.
 */
export async function requestWalletRecharge(
  branchId: string | null,
  input: { amount: number; paymentMethod: string; utr: string; proofPath?: string; description?: string },
) {
  if (!branchId) return { success: false as const, error: "Missing branch" };
  const amount = Number(input.amount);
  if (!Number.isFinite(amount) || amount <= 0) return { success: false as const, error: "Invalid amount" };
  if (!input.utr.trim()) return { success: false as const, error: "Enter the UTR / reference number" };

  const { data, error } = await supabase
    .from("branch_transactions")
    .insert({
      id: newId("txn"),
      branchId,
      amount,
      type: "CREDIT",
      category: "RECHARGE",
      description: input.description || "Wallet recharge",
      reference: input.utr.trim(),
      status: "PENDING",
      paymentMethod: (input.paymentMethod || "UPI").toUpperCase() as any,
      balanceAfter: 0,
      proofUrl: input.proofPath || null,
      updatedAt: nowIso(),
    })
    .select("*")
    .single();
  if (error) throw new Error(error.message);
  return { success: true as const, data };
}

export async function getPendingRecharges(organizationId: string | null) {
  if (!organizationId) return { success: true, data: [] };
  const { data, error } = await supabase
    .from("branch_transactions")
    .select(TRANSACTION_SELECT)
    .in("branchId", (await getBranchIdsByOrg(organizationId)) || [])
    .eq("status", "PENDING")
    .order("createdAt", { ascending: false });
  if (error) throw new Error(error.message);
  return { success: true, data: (data || []).map(mapTransaction) };
}

/**
 * Approving is the moment the money is real: the wallet is credited and the
 * request is stamped with the balance it produced. Re-checking the status here
 * keeps a double click from crediting twice.
 */
export async function approveRecharge(transactionId: string, reviewerId?: string) {
  const { data: tx, error: tErr } = await supabase
    .from("branch_transactions")
    .select("*")
    .eq("id", transactionId)
    .single();
  if (tErr) throw new Error(tErr.message);
  if (tx.status !== "PENDING") return { success: false as const, error: "That request was already reviewed." };

  const branchId = tx.branchId as string;
  const amount = Number(tx.amount) || 0;

  const { data: wallet, error: wErr } = await supabase
    .from("branch_wallets")
    .select("*")
    .eq("branchId", branchId)
    .maybeSingle();
  if (wErr) throw new Error(wErr.message);

  const newBalance = Number(wallet?.balance || 0) + amount;
  if (wallet?.id) {
    const { error } = await supabase
      .from("branch_wallets")
      .update({ balance: newBalance, lastRechargeAmount: amount, lastRechargeDate: nowIso(), updatedAt: nowIso() })
      .eq("id", wallet.id);
    if (error) throw new Error(error.message);
  } else {
    const { error } = await supabase.from("branch_wallets").insert({
      id: newId("wal"),
      branchId,
      balance: newBalance,
      lastRechargeAmount: amount,
      lastRechargeDate: nowIso(),
      updatedAt: nowIso(),
    });
    if (error) throw new Error(error.message);
  }

  const { error } = await supabase
    .from("branch_transactions")
    .update({
      status: "COMPLETED",
      balanceAfter: newBalance,
      reviewedAt: nowIso(),
      reviewedBy: reviewerId || null,
      updatedAt: nowIso(),
    })
    .eq("id", transactionId);
  if (error) throw new Error(error.message);
  return { success: true as const, data: { balance: newBalance } };
}

export async function rejectRecharge(transactionId: string, note: string, reviewerId?: string) {
  const { error } = await supabase
    .from("branch_transactions")
    .update({
      status: "FAILED",
      reviewedAt: nowIso(),
      reviewedBy: reviewerId || null,
      reviewNote: note || null,
      updatedAt: nowIso(),
    })
    .eq("id", transactionId)
    .eq("status", "PENDING");
  if (error) throw new Error(error.message);
  return { success: true as const };
}

export async function getFeeTypes() {
  return { success: true, data: [] };
}

export async function getFeeGroups() {
  return { success: true, data: [] };
}

/* ============================
   SESSION YEARS
   ============================ */

export type SessionYearStatus = "ACTIVE" | "UPCOMING" | "CLOSED";

export interface SessionYear {
  id: string;
  organizationId: string | null;
  name: string;
  /** `yyyy-mm-dd`, as the `date` column gives it back. */
  startDate: string;
  endDate: string;
  status: SessionYearStatus;
  /** The session new admissions default to. At most one per organisation. */
  isCurrent: boolean;
  description: string;
  createdAt: string;
}

/**
 * `session_years` ships in `session-years.sql`.
 *
 * Matched on the codes, not on the table name appearing in the message: a
 * PostgREST permission failure reads "permission denied for table
 * session_years", so a substring test would file an RLS refusal as a missing
 * migration and hand the caller an empty list instead of an error.
 */
const isMissingSessionTable = (error: { code?: string; message?: string } | null) =>
  error?.code === "PGRST205" ||
  error?.code === "42P01" ||
  /relation "?(public\.)?session_years"? does not exist/i.test(error?.message || "");

/**
 * Dates are compared as `yyyy-mm-dd` strings throughout this section, never as
 * `Date` objects. `new Date("2026-04-01")` is parsed as UTC midnight but read
 * back in local time, so in any timezone behind UTC it is the 31st of March --
 * which would put an admission on the first day of a session outside it. The
 * string form sorts correctly and has no timezone to get wrong.
 */
const asDay = (value: unknown) => String(value ?? "").slice(0, 10);

function mapSessionYear(row: Record<string, unknown>): SessionYear {
  return {
    id: String(row.id),
    organizationId: (row.organizationId as string) ?? null,
    name: (row.name as string) || "",
    startDate: asDay(row.startDate),
    endDate: asDay(row.endDate),
    status: ((row.status as string) || "ACTIVE").toUpperCase() as SessionYearStatus,
    isCurrent: row.isCurrent === true,
    description: (row.description as string) || "",
    createdAt: String(row.createdAt ?? ""),
  };
}

/**
 * Every session this institute has, newest first.
 *
 * `stored: false` means the migration has not been run. The admission form
 * reads that as "offer a free-text academic year", which is what the field was
 * before this existed -- so the page keeps working rather than presenting an
 * empty dropdown nobody can get past.
 */
export async function getSessionYears(organizationId: string | null) {
  let query = supabase
    .from("session_years")
    .select("*")
    .is("deletedAt", null)
    .order("startDate", { ascending: false });
  if (organizationId) query = query.eq("organizationId", organizationId);
  const { data, error } = await query;
  if (error) {
    if (isMissingSessionTable(error)) {
      return { success: true, data: [] as SessionYear[], stored: false };
    }
    throw new Error(error.message);
  }
  return { success: true, data: (data || []).map(mapSessionYear), stored: true };
}

/**
 * The fields a session is allowed to set, and the reasons it can be refused.
 *
 * Checked here as well as by the database's own constraint so the form can say
 * which box is wrong. The constraint is what actually guarantees it.
 */
export type SessionYearInput = {
  name?: string;
  startDate?: string;
  endDate?: string;
  status?: SessionYearStatus;
  description?: string;
};

function sessionPayload(input: SessionYearInput) {
  const payload: Record<string, unknown> = {};
  if (input.name !== undefined) payload.name = input.name.trim();
  if (input.startDate !== undefined) payload.startDate = asDay(input.startDate);
  if (input.endDate !== undefined) payload.endDate = asDay(input.endDate);
  if (input.status !== undefined) payload.status = input.status;
  // A cleared description is stored as null rather than "", so the column reads
  // as "nothing was written" rather than as an empty note.
  if (input.description !== undefined) payload.description = input.description.trim() || null;
  return payload;
}

/** The checks the form can explain, in the order the boxes appear. */
export function sessionYearProblem(input: SessionYearInput): string | null {
  const name = (input.name ?? "").trim();
  const startDate = asDay(input.startDate);
  const endDate = asDay(input.endDate);
  if (!name) return "Give the session a name.";
  if (!startDate) return "Choose the date the session starts.";
  if (!endDate) return "Choose the date the session ends.";
  if (endDate <= startDate) return "The session has to end after it starts.";
  return null;
}

export async function createSessionYear(
  organizationId: string | null,
  input: SessionYearInput,
) {
  const problem = sessionYearProblem(input);
  if (problem) throw new Error(problem);
  const { data, error } = await supabase
    .from("session_years")
    .insert({ ...sessionPayload(input), organizationId })
    .select("*")
    .single();
  if (error) throw new Error(describeSessionRejection(error));
  return { success: true, data: mapSessionYear(data as Record<string, unknown>) };
}

export async function updateSessionYear(id: string, input: SessionYearInput) {
  // An edit that only moves one date still has to end up with a valid range, so
  // the caller passes the whole session back rather than the changed field.
  const problem = sessionYearProblem(input);
  if (problem) throw new Error(problem);
  const { data, error } = await supabase
    .from("session_years")
    .update({ ...sessionPayload(input), updatedAt: nowIso() })
    .eq("id", id)
    .select("id");
  if (error) throw new Error(describeSessionRejection(error));
  assertWritten(data, "That session");
  return { success: true };
}

/** Soft delete, matching the `deletedAt is null` filter used when reading. */
export async function deleteSessionYear(id: string) {
  const { data, error } = await supabase
    .from("session_years")
    .update({ deletedAt: nowIso(), isCurrent: false, updatedAt: nowIso() })
    .eq("id", id)
    .select("id");
  if (error) throw new Error(describeSessionRejection(error));
  assertRemoved(data, "That session");
  return { success: true };
}

/**
 * Move the "current session" flag.
 *
 * The old one is cleared first because a unique index allows only one current
 * session per organisation -- setting the new one first would be refused by the
 * database rather than quietly leaving two.
 */
export async function setCurrentSessionYear(organizationId: string | null, id: string) {
  // The organisation is taken from the session being promoted rather than from
  // the caller. A SUPER_ADMIN carries no organizationId, and an unscoped
  // "clear the current flag" would clear it for every institute in the
  // database -- silently, since clearing a flag that is already clear is not
  // an error.
  const { data: target, error: findError } = await supabase
    .from("session_years")
    .select("id,organizationId")
    .eq("id", id)
    .maybeSingle();
  if (findError) throw new Error(describeSessionRejection(findError));
  if (!target) throw new Error("That session no longer exists.");
  const owner = ((target as Record<string, unknown>).organizationId as string) ?? organizationId;

  let clear = supabase
    .from("session_years")
    .update({ isCurrent: false, updatedAt: nowIso() })
    .eq("isCurrent", true);
  // `eq` cannot express "is null", and the two are not interchangeable here:
  // an unscoped filter is what the comment above warns about.
  clear = owner ? clear.eq("organizationId", owner) : clear.is("organizationId", null);
  const { error: clearError } = await clear.select("id");
  if (clearError) throw new Error(describeSessionRejection(clearError));

  const { data, error } = await supabase
    .from("session_years")
    .update({ isCurrent: true, updatedAt: nowIso() })
    .eq("id", id)
    .select("id");
  if (error) throw new Error(describeSessionRejection(error));
  assertWritten(data, "That session");
  return { success: true };
}

/** A database without `session-years.sql` should say so, not report a 404. */
function describeSessionRejection(error: { code?: string; message?: string }): string {
  if (isMissingSessionTable(error)) {
    return "Session years are not set up on this database yet. Run supabase/schema/session-years.sql in the Supabase SQL editor, then try again.";
  }
  if (error.code === "23505") {
    return "Another session is already the current one. Refresh the page and try again.";
  }
  return error.message || "Could not save the session";
}

/**
 * The sessions an admission on `day` could belong to.
 *
 * A session whose range contains the date, which is normally exactly one. Two
 * would mean overlapping sessions, and both are offered rather than guessing --
 * an institute that runs a short bridging session deliberately overlaps them.
 *
 * A closed session is still offered when the date falls inside it: back-dating
 * an admission into last year's session is a real thing an office does when
 * catching up on paperwork, and refusing it would send them to the free-text
 * box instead.
 */
export function sessionYearsForDate(sessions: SessionYear[], day: string): SessionYear[] {
  const date = asDay(day);
  if (!date) return [];
  return sessions.filter((s) => s.startDate <= date && date <= s.endDate);
}

/**
 * Why `day` cannot be the admission date for `session`, or null if it can.
 *
 * This is the rule the admission form enforces: an admission cannot be dated
 * before its academic year began. The upper bound comes with it -- a date after
 * the session ended is the same mistake pointing the other way, and a form that
 * refused only one of them would look arbitrary.
 */
export function admissionDateProblem(
  session: SessionYear | null | undefined,
  day: string,
): string | null {
  const date = asDay(day);
  if (!session || !date) return null;
  if (date < session.startDate) {
    return `${session.name} starts on ${session.startDate}. An admission cannot be dated before its academic year.`;
  }
  if (date > session.endDate) {
    return `${session.name} ended on ${session.endDate}. Pick the session this admission actually falls in.`;
  }
  return null;
}

/* ============================
   DROPDOWN OPTIONS
   ============================ */

/** `dropdown_options` ships in `add-multi-course-and-dropdowns.sql`. */
const isMissingDropdownTable = (error: { code?: string; message?: string } | null) =>
  error?.code === "PGRST205" ||
  error?.code === "42P01" ||
  !!error?.message?.includes("dropdown_options");

/**
 * Every option list this organisation has customised, as `{ key: values }`.
 *
 * A key with no row has never been edited, and the caller falls back to its
 * built-in defaults - so this returning `{}` is the normal state, not an error.
 * A database without the table behaves the same way rather than throwing, which
 * keeps every picker on the screen working before the migration is run.
 */
export async function getDropdownOptions(organizationId: string | null) {
  const { data, error } = await supabase
    .from("dropdown_options")
    .select("key,values")
    .eq("organizationId", organizationId || "");
  if (error) {
    if (isMissingDropdownTable(error)) return { success: true, data: {} as Record<string, string[]>, stored: false };
    throw new Error(error.message);
  }
  const out: Record<string, string[]> = {};
  for (const row of data || []) {
    const { key, values } = row as { key: string; values: string[] | null };
    out[key] = (values || []).filter(Boolean);
  }
  return { success: true, data: out, stored: true };
}

/**
 * Replace one list. `stored: false` means the table is not there yet and the
 * caller should keep the edit in the browser instead of reporting a failure.
 */
export async function saveDropdownOptions(
  organizationId: string | null,
  key: string,
  values: string[],
) {
  const { error } = await supabase
    .from("dropdown_options")
    .upsert(
      { organizationId: organizationId || "", key, values, updatedAt: nowIso() },
      { onConflict: "organizationId,key" },
    );
  if (error) {
    if (isMissingDropdownTable(error)) return { success: true, stored: false };
    throw new Error(error.message);
  }
  return { success: true, stored: true };
}

/* ============================
   SYSTEM USERS
   ============================ */

/**
 * The live values of the `SystemRole` and `UserType` Postgres enums.
 *
 * The All Users page used to offer "Admin", "Manager" and "Employee", none of
 * which the database will accept — writing one back is rejected with `22P02`.
 */
export const SYSTEM_ROLES = [
  "SUPER_ADMIN",
  "ORGANIZATION_ADMIN",
  "BRANCH_ADMIN",
  "ACCOUNTANT",
  "RECEPTIONIST",
  "TEACHER",
  "STAFF",
  "STUDENT",
] as const;

export type SystemRole = (typeof SYSTEM_ROLES)[number];

export interface SystemUserRow {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  userType: string;
  isActive: boolean;
  lastLoginAt: string;
  createdAt: string;
  /** The branch this login runs, if it runs one. The `users` table has no
   *  branch column — `branches.userId` points the other way, at the login. */
  branch: string;
  branchId: string;
  /** The organisation this login owns, if it owns one. */
  organization: string;
  /** The institute's own role this login was given, if any. Blank means it
   *  falls back to the built-in role for whatever it was minted as. */
  roleId: string;
}

/** The scope columns arrive with user-management.sql; until it is run the
 *  table has no `organizationId`, and PostgREST answers 42703. */
const isMissingUserScope = (error: { code?: string; message?: string }) =>
  error?.code === "42703" || /column users\.(organizationId|branchId|roleId) does not exist/i.test(error?.message || "");

/**
 * Staff logins, scoped to what the caller may see.
 *
 * Two scopes are merged, because the schema grew two ways of saying where a
 * login belongs.
 *
 * The older way is a link pointing the other way: an organisation names its
 * admin through `organizations.userId`, and each branch names its login through
 * `branches.userId`. That covers exactly the accounts that *own* something.
 *
 * The newer way is `users.organizationId`, added by user-management.sql, which
 * is the only way to place a receptionist or an accountant — they own neither a
 * branch nor an organisation, so the links above can never name them. Where
 * that column is missing the query is skipped rather than failing, so the page
 * keeps working on a database where the migration has not been run yet.
 *
 * Student logins are deliberately left out of both. Every enrolled student has
 * one, so they would swamp the list, and they are managed from the Students
 * section where the rest of the student record lives.
 */
export async function getUsers(
  organizationId: string | null,
  branchId: string | null,
): Promise<{ success: true; data: SystemUserRow[] }> {
  const owners = new Map<string, { branch?: string; branchId?: string; organization?: string }>();

  if (organizationId) {
    const { data: org } = await supabase
      .from("organizations")
      .select("id,name,userId")
      .eq("id", organizationId)
      .maybeSingle();
    const row = org as { name?: string; userId?: string } | null;
    if (row?.userId) owners.set(row.userId, { organization: row.name || "" });
  }

  let branchQuery = supabase.from("branches").select("id,name,userId").is("deletedAt", null);
  if (organizationId) branchQuery = branchQuery.eq("organizationId", organizationId);
  else if (branchId) branchQuery = branchQuery.eq("id", branchId);
  const { data: branches } = await branchQuery;

  // Every branch name, keyed by id -- a staff row carries a `branchId` but no
  // link back through `branches.userId`, so the owner map cannot name it.
  const branchNames = new Map<string, string>();

  for (const branch of (branches || []) as Array<{ id: string; name: string; userId?: string }>) {
    branchNames.set(branch.id, branch.name || "");
    if (!branch.userId) continue;
    owners.set(branch.userId, {
      ...owners.get(branch.userId),
      branch: branch.name || "",
      branchId: branch.id,
    });
  }

  // `roleId` is the institute's own role (roles.sql); the list names it and the
  // edit dialog opens on it.
  const columns = "id,name,email,phone,role,userType,isActive,lastLoginAt,createdAt,roleId";
  const rows = new Map<string, Record<string, unknown>>();

  if (owners.size) {
    const { data, error } = await supabase
      .from("users")
      .select(columns)
      .in("id", [...owners.keys()])
      .is("deletedAt", null);
    if (error) throw new Error(error.message);
    for (const row of (data || []) as Array<Record<string, unknown>>) {
      rows.set(String(row.id), row);
    }
  }

  if (organizationId || branchId) {
    let scopedQuery = supabase
      .from("users")
      .select(`${columns},organizationId,branchId`)
      .is("deletedAt", null)
      // Students are managed from the Students section, not here.
      .neq("userType", "STUDENT");
    if (organizationId) scopedQuery = scopedQuery.eq("organizationId", organizationId);
    else scopedQuery = scopedQuery.eq("branchId", branchId);

    const { data, error } = await scopedQuery;
    // A database without user-management.sql has no such column. That is not a
    // failure -- it just means the only users it can place are the ones the
    // owner links above already found.
    if (error && !isMissingUserScope(error)) throw new Error(error.message);
    for (const row of (data || []) as Array<Record<string, unknown>>) {
      rows.set(String(row.id), { ...rows.get(String(row.id)), ...row });
    }
  }

  if (!rows.size) return { success: true, data: [] };

  const users = [...rows.values()].map((row): SystemUserRow => {
    const owner = owners.get(String(row.id)) || {};
    const ownBranchId = String(row.branchId || "");
    return {
      id: String(row.id),
      name: String(row.name || ""),
      email: String(row.email || ""),
      phone: String(row.phone || ""),
      role: String(row.role || ""),
      userType: String(row.userType || ""),
      // The column is not null and defaults to true, so only an explicit
      // false means the account has been switched off.
      isActive: row.isActive !== false,
      lastLoginAt: String(row.lastLoginAt || ""),
      createdAt: String(row.createdAt || ""),
      // The owner link wins: a branch's own admin should read as that branch
      // even if the scope column has drifted.
      branch: owner.branch || branchNames.get(ownBranchId) || "",
      branchId: owner.branchId || ownBranchId,
      organization: owner.organization || "",
      roleId: String(row.roleId || ""),
    };
  });

  // Sorted here rather than in the query: two queries are merged, so neither
  // one's ordering survives the merge.
  users.sort((a, b) => b.createdAt.localeCompare(a.createdAt));

  return { success: true, data: users };
}

/**
 * Saves an edit. Only the columns that exist are sent — `department` and
 * `status` were on the old form and are on no table, so they were being typed
 * into boxes that went nowhere.
 */
export async function updateUser(
  id: string,
  patch: { name?: string; phone?: string | null; role?: string; isActive?: boolean },
) {
  const body: Record<string, unknown> = {};
  if (patch.name !== undefined) body.name = patch.name.trim();
  if (patch.phone !== undefined) body.phone = patch.phone?.trim() || null;
  if (patch.role !== undefined) body.role = patch.role;
  if (patch.isActive !== undefined) body.isActive = patch.isActive;
  if (!Object.keys(body).length) return { success: true as const };

  const { data, error } = await supabase
    .from("users")
    .update(body)
    .eq("id", id)
    .select("id");
  if (error) throw new Error(error.message);
  assertWritten(data, "That user");
  return { success: true as const };
}

/**
 * Soft-deletes a login, the same way branches and students are removed. The
 * account itself stays in Supabase Auth — revoking it needs the service-role
 * key, which the browser does not hold — so this stops it appearing as a user
 * of the institute rather than pretending the credential is gone.
 */
export async function deleteUser(id: string) {
  const { data, error } = await supabase
    .from("users")
    .update({ deletedAt: new Date().toISOString(), isActive: false })
    .eq("id", id)
    .select("id");
  if (error) throw new Error(error.message);
  assertRemoved(data, "That user");
  return { success: true as const };
}

/**
 * What each role may hand out.
 *
 * This mirrors the `GRANTABLE` table inside the create-staff-user edge
 * function. The function is the authority -- it re-checks every request
 * against the caller's own token -- and this copy only decides which options
 * are worth offering, so nobody is shown a role the server will refuse.
 *
 * Nobody can mint a role above their own. A branch admin staffing their branch
 * cannot create another branch admin, because that account would not be
 * confined to the branch they are confined to.
 */
const GRANTABLE_ROLES: Record<string, SystemRole[]> = {
  SUPER_ADMIN: ["SUPER_ADMIN", "ORGANIZATION_ADMIN", "BRANCH_ADMIN", "ACCOUNTANT", "RECEPTIONIST", "TEACHER", "STAFF"],
  ORGANIZATION_ADMIN: ["ORGANIZATION_ADMIN", "BRANCH_ADMIN", "ACCOUNTANT", "RECEPTIONIST", "TEACHER", "STAFF"],
  BRANCH_ADMIN: ["ACCOUNTANT", "RECEPTIONIST", "TEACHER", "STAFF"],
};

/** The roles this caller may create. Empty means they may not create logins. */
export const grantableRoles = (role?: string | null): SystemRole[] =>
  GRANTABLE_ROLES[(role ?? "").toUpperCase()] ?? [];

export const canManageUsers = (role?: string | null): boolean => grantableRoles(role).length > 0;

/**
 * Creates a staff login, or resets the password on one that already exists.
 *
 * The account is minted by the create-staff-user edge function, which holds
 * the service-role key -- signing up from the browser would swap out the
 * admin's own session. The function writes both the Supabase Auth account and
 * the `public.users` row, so a login always appears in the list that shows it.
 *
 * `branchId` is a request, not a decision: a branch admin always gets their own
 * branch regardless of what is sent, and an org admin may leave it out to post
 * someone to head office.
 */
export async function createStaffUser(input: {
  name: string;
  username: string;
  password: string;
  role: SystemRole;
  email?: string;
  phone?: string;
  branchId?: string | null;
}) {
  await requireLiveSession();

  const { data, error } = await supabase.functions.invoke("create-staff-user", { body: input });
  if (error) await throwFunctionError("create-staff-user", error);
  if (data?.error) throw new Error(data.error);
  return { success: true, data } as {
    success: true;
    data: {
      userId: string;
      loginEmail: string;
      username: string;
      role: SystemRole;
      branchId: string | null;
      created: boolean;
    };
  };
}

/**
 * Set a new password on another user's login.
 *
 * Through set-user-password rather than create-staff-user: that one creates or
 * replaces the whole account, and calling it to change a password would also
 * re-write the role and branch from whatever the edit form sent. This changes
 * the password and nothing else. Who may reset whom is decided in the
 * function, from the target's own claims; nobody reaches above their rank.
 *
 * There is no "current password" to show: Supabase Auth keeps only a hash.
 */
export async function setUserPassword(userId: string, password: string) {
  if (password.length < 6) throw new Error("The password must be at least 6 characters.");
  await requireLiveSession();
  const { data, error } = await supabase.functions.invoke("set-user-password", {
    body: { userId, password },
  });
  if (error) await throwFunctionError("set-user-password", error);
  if (data?.error) throw new Error(data.error);
  return { success: true as const };
}

/**
 * Change the email another user signs in with, through the same function as
 * the password (it holds the service-role key; the browser does not). The
 * address is confirmed straight away, and the app's users row follows.
 */
export async function setUserEmail(userId: string, email: string) {
  const address = email.trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(address)) throw new Error("That is not a valid email address.");
  await requireLiveSession();
  const { data, error } = await supabase.functions.invoke("set-user-password", {
    body: { userId, email: address },
  });
  if (error) await throwFunctionError("set-user-password", error);
  // The version deployed before email changes existed asks for a password.
  if (typeof data?.error === "string" && /password must be at least/i.test(data.error)) {
    throw new Error("The set-user-password function on Supabase is an older version. Deploy it again to change emails.");
  }
  if (data?.error) throw new Error(data.error);
  return { success: true as const };
}

/* ============================
   ROLES (an institute's own)
   ============================ */

/**
 * A role as the institute defines it: its own name for a job, and the pages
 * that job may open.
 *
 * `baseRole` is the part the database enforces. Every RLS policy in the schema
 * reads `users.role` through jwt_role(), so an account is always minted as one
 * of the eight `SystemRole` values -- a role named "HR Manager" is a
 * `baseRole` of STAFF wearing a name. `modules` only narrows what that base can
 * already reach; it is a menu, not a wall.
 */
export interface RoleRow {
  id: string;
  organizationId: string | null;
  name: string;
  description: string;
  baseRole: SystemRole;
  /** Navigation paths this role may open. Empty means everything its base can. */
  modules: string[];
  /** One of the eight the app ships with: renamable, not deletable. */
  isSystem: boolean;
  /** What the role may do on each page beyond opening it (role-permissions.sql).
   *  A page with no entry keeps every action. */
  permissions: Permissions;
}

const mapRole = (row: Record<string, unknown>): RoleRow => ({
  id: String(row.id || ""),
  organizationId: (row.organizationId as string) ?? null,
  name: String(row.name || ""),
  description: String(row.description || ""),
  baseRole: String(row.baseRole || "STAFF") as SystemRole,
  modules: Array.isArray(row.modules) ? (row.modules as string[]) : [],
  isSystem: Boolean(row.isSystem),
  permissions:
    row.permissions && typeof row.permissions === "object" && !Array.isArray(row.permissions)
      ? (row.permissions as Permissions)
      : {},
});

/** True while roles.sql has not been run; the app falls back to the eight. */
const isMissingRolesTable = (error: { code?: string; message?: string } | null) =>
  error?.code === "42P01" ||
  error?.code === "PGRST205" ||
  /relation .*roles.* does not exist|could not find the table/i.test(error?.message || "");

/**
 * Every role this organisation has. Empty -- rather than an error -- on a
 * database where roles.sql has not been run yet, so every screen that reads
 * this keeps working on the eight built-in roles alone.
 */
export async function getRoles(organizationId: string | null) {
  if (!organizationId) return { success: true as const, data: [] as RoleRow[] };
  const { data, error } = await supabase
    .from("roles")
    .select("*")
    .eq("organizationId", organizationId)
    .order("isSystem", { ascending: false })
    .order("name");
  if (error) {
    if (isMissingRolesTable(error)) return { success: true as const, data: [] as RoleRow[] };
    throw new Error(error.message);
  }
  return {
    success: true as const,
    data: (data || []).map((row) => mapRole(row as Record<string, unknown>)),
  };
}

/** The one role a login holds, for building that person's own menu. */
export async function getRole(id: string | null) {
  if (!id) return { success: true as const, data: null };
  const { data, error } = await supabase.from("roles").select("*").eq("id", id).maybeSingle();
  if (error) {
    if (isMissingRolesTable(error)) return { success: true as const, data: null };
    throw new Error(error.message);
  }
  return {
    success: true as const,
    data: data ? mapRole(data as Record<string, unknown>) : null,
  };
}

const describeRoleConflict = (error: { code?: string; message?: string }, name: string) =>
  error.code === "23505"
    ? `This institute already has a role called "${name}".`
    : error.message;

export async function createRole(
  organizationId: string,
  input: { name: string; description?: string; baseRole: SystemRole; modules?: string[] },
) {
  const payload = {
    id: newId("role"),
    organizationId,
    name: input.name.trim(),
    description: input.description?.trim() || null,
    baseRole: input.baseRole,
    modules: input.modules ?? [],
    isSystem: false,
  };
  const { data, error } = await supabase.from("roles").insert(payload).select("*").single();
  if (error) throw new Error(describeRoleConflict(error, payload.name));
  return { success: true as const, data: mapRole(data as Record<string, unknown>) };
}

export async function updateRole(
  id: string,
  input: Partial<{ name: string; description: string; baseRole: SystemRole; modules: string[]; permissions: Permissions }>,
) {
  const payload: Record<string, unknown> = { updatedAt: new Date().toISOString() };
  if (input.permissions !== undefined) payload.permissions = input.permissions;
  if (input.name !== undefined) payload.name = input.name.trim();
  if (input.description !== undefined) payload.description = input.description.trim() || null;
  if (input.baseRole !== undefined) payload.baseRole = input.baseRole;
  if (input.modules !== undefined) payload.modules = input.modules;

  const { data, error } = await supabase
    .from("roles")
    .update(payload)
    .eq("id", id)
    .select("*")
    .single();
  if (error) {
    if (input.permissions !== undefined && (error.code === "PGRST204" || /permissions/.test(error.message || ""))) {
      throw new Error("Action permissions are not set up yet. Run supabase/schema/role-permissions.sql in Supabase.");
    }
    throw new Error(describeRoleConflict(error, String(input.name ?? "")));
  }
  return { success: true as const, data: mapRole(data as Record<string, unknown>) };
}

/**
 * Deletes a role. The logins holding it keep working -- `users.roleId` is set
 * null by the foreign key and they fall back to their base role's own menu --
 * but the caller is told how many were affected, because that is a decision
 * worth seeing before it is made.
 */
export async function deleteRole(id: string) {
  const { data, error } = await supabase.from("roles").delete().eq("id", id).select("id");
  if (error) throw new Error(error.message);
  assertRemoved(data, "That role");
  return { success: true as const };
}

/** How many logins hold each role, for the roles list. */
export async function getRoleUserCounts(organizationId: string | null) {
  if (!organizationId) return { success: true as const, data: {} as Record<string, number> };
  const { data, error } = await supabase
    .from("users")
    .select("roleId")
    .eq("organizationId", organizationId);
  if (error) {
    if (isMissingUserScope(error) || isMissingRolesTable(error)) {
      return { success: true as const, data: {} as Record<string, number> };
    }
    throw new Error(error.message);
  }
  const counts: Record<string, number> = {};
  for (const row of data || []) {
    const id = (row as { roleId?: string }).roleId;
    if (id) counts[id] = (counts[id] || 0) + 1;
  }
  return { success: true as const, data: counts };
}

/**
 * Puts a login under one of the institute's roles.
 *
 * Kept apart from creating the account on purpose: the account itself is minted
 * by the edge function with the service-role key, and this is an ordinary write
 * an administrator's own session is allowed to make. That means adding roles
 * did not need the deployed function to be touched again.
 */
export async function setUserRole(userId: string, roleId: string | null) {
  const { error } = await supabase.from("users").update({ roleId }).eq("id", userId);
  if (error) {
    // A database without roles.sql simply has no column to set.
    if (isMissingRolesTable(error) || error.code === "PGRST204") return { success: true as const };
    throw new Error(error.message);
  }
  return { success: true as const };
}

/**
 * The pages the signed-in person's own role grants them.
 *
 * Read from the database rather than the token: the role's module list is
 * edited by an administrator while people are signed in, and a JWT minted
 * before that edit would carry the old menu until the next login.
 *
 * Returns an empty list for anyone whose role has none -- which every account
 * had before roles existed -- and that reads as "everything this view allows".
 */
/**
 * A Super Admin always has every page and every action. The SUPER_ADMIN
 * account itself, and any role the institute named "Super Admin", are never
 * narrowed by Access Control -- a page added to the app later must appear for
 * them without anyone remembering to tick it, and a slip on the Access
 * Control page must not lock the head office out of its own panel.
 */
export const isSuperAdminRole = (role: { name?: string | null; baseRole?: string | null } | null | undefined) =>
  String(role?.baseRole || "").toUpperCase() === "SUPER_ADMIN" ||
  /^\s*super\s*-?\s*admin\s*$/i.test(String(role?.name || ""));

export async function getUserModules(
  userId: string | null,
  fallback?: { role?: string | null; organizationId?: string | null },
) {
  if (!userId) return { success: true as const, data: [] as string[], permissions: {} as Permissions };
  const { data } = await supabase
    .from("users")
    .select('"roleId", role, "organizationId"')
    .eq("id", userId)
    .maybeSingle();
  // An unreadable row (no `public.users` mirror, or a policy that hides it)
  // still has the account's own role and institute to go on, so it gets that
  // role's menu rather than silently the whole view.
  const row = {
    roleId: (data as { roleId?: string } | null)?.roleId ?? null,
    role: (data as { role?: string } | null)?.role || fallback?.role || "",
    organizationId: (data as { organizationId?: string } | null)?.organizationId || fallback?.organizationId || null,
  };

  if (String(row.role || "").toUpperCase() === "SUPER_ADMIN") {
    return { success: true as const, data: [] as string[], permissions: {} as Permissions };
  }

  // The role the login was actually given.
  if (row.roleId) {
    const role = await getRole(row.roleId).catch(() => null);
    if (role?.data && isSuperAdminRole(role.data)) {
      return { success: true as const, data: [] as string[], permissions: {} as Permissions };
    }
    if (role?.data) return { success: true as const, data: role.data.modules, permissions: role.data.permissions };
    // The role itself could not be read: fall through to the built-in one.
  }

  /*
   * Nobody was given one -- every login that existed before roles did. Fall
   * back to the institute's built-in role for whatever this account was minted
   * as, which is what an administrator means by narrowing "Accountant": every
   * accountant, not only the ones hired since. An explicit role always wins
   * over this.
   */
  const roles = await getRoles(row.organizationId ?? null).catch(() => null);
  const builtIn = roles?.data.find(
    (role) => role.isSystem && role.baseRole === String(row.role || "").toUpperCase(),
  );
  return { success: true as const, data: builtIn?.modules ?? [], permissions: builtIn?.permissions ?? ({} as Permissions) };
}

/* ============================
   COURSE SYLLABUS
   ============================

   Two tables behind one screen: modules are the sections of a course, and
   chapters are what is taught inside a section. See
   supabase/schema/course-syllabus.sql. */

export interface SyllabusModule {
  id: string;
  courseId: string;
  name: string;
  description: string;
  sortOrder: number;
  status: "Active" | "Inactive";
}

export interface SyllabusChapter {
  id: string;
  moduleId: string;
  courseId: string;
  name: string;
  description: string;
  practical: string;
  pdfUrl: string;
  videoUrl: string;
  sortOrder: number;
  status: "Active" | "Inactive";
}

/** PostgREST answers a missing table with PGRST205, or 42P01 from Postgres. */
const isMissingSyllabusTable = (error: { code?: string; message?: string } | null) => {
  if (!error) return false;
  if (error.code === "PGRST205" || error.code === "42P01") return true;
  const message = error.message ?? "";
  return (
    /course_(modules|chapters)/.test(message) && /does not exist|schema cache/.test(message)
  );
};

const asStatus = (value: unknown): "Active" | "Inactive" =>
  String(value ?? "").toLowerCase() === "inactive" ? "Inactive" : "Active";

/**
 * A course's syllabus, modules and chapters together.
 *
 * Returns empty lists rather than throwing when the tables are not there yet,
 * so the screen can say the migration has not been run instead of showing an
 * error card that looks like a failure to load.
 */
export async function getCourseSyllabus(courseId: string) {
  if (!courseId) {
    return { success: true as const, data: { modules: [], chapters: [], ready: true } };
  }

  const [moduleResult, chapterResult] = await Promise.all([
    supabase.from("course_modules").select("*").eq("courseId", courseId).is("deletedAt", null),
    supabase.from("course_chapters").select("*").eq("courseId", courseId).is("deletedAt", null),
  ]);

  if (isMissingSyllabusTable(moduleResult.error) || isMissingSyllabusTable(chapterResult.error)) {
    return { success: true as const, data: { modules: [], chapters: [], ready: false } };
  }
  if (moduleResult.error) throw new Error(moduleResult.error.message);
  if (chapterResult.error) throw new Error(chapterResult.error.message);

  const modules: SyllabusModule[] = (moduleResult.data ?? []).map((row: Record<string, unknown>) => ({
    id: String(row.id),
    courseId: String(row.courseId),
    name: String(row.name ?? ""),
    description: String(row.description ?? ""),
    sortOrder: Number(row.sortOrder) || 1,
    status: asStatus(row.status),
  }));

  const chapters: SyllabusChapter[] = (chapterResult.data ?? []).map((row: Record<string, unknown>) => ({
    id: String(row.id),
    moduleId: String(row.moduleId),
    courseId: String(row.courseId),
    name: String(row.name ?? ""),
    description: String(row.description ?? ""),
    practical: String(row.practical ?? ""),
    pdfUrl: String(row.pdfUrl ?? ""),
    videoUrl: String(row.videoUrl ?? ""),
    sortOrder: Number(row.sortOrder) || 1,
    status: asStatus(row.status),
  }));

  return { success: true as const, data: { modules, chapters, ready: true } };
}

/* The PostgREST builder is thenable but is not a Promise, so the helper takes
   a PromiseLike rather than widening every call site with `await`. */
const syllabusWrite = async <T>(
  run: () => PromiseLike<{ data: T; error: { code?: string; message?: string } | null }>,
) => {
  const { data, error } = await run();
  if (isMissingSyllabusTable(error)) {
    throw new Error(
      "The syllabus tables are not in the database yet. Run supabase/schema/course-syllabus.sql.",
    );
  }
  if (error) throw new Error(error.message);
  return { success: true as const, data };
};

export const createSyllabusModule = (input: Record<string, unknown>) =>
  syllabusWrite(() => supabase.from("course_modules").insert(input).select("*").single());

export const updateSyllabusModule = (id: string, input: Record<string, unknown>) =>
  syllabusWrite(() =>
    supabase
      .from("course_modules")
      .update({ ...input, updatedAt: new Date().toISOString() })
      .eq("id", id)
      .select("*")
      .single(),
  );

/** Chapters cascade with the module in the database, so this deletes one row. */
export const deleteSyllabusModule = (id: string) =>
  syllabusWrite(() => supabase.from("course_modules").delete().eq("id", id).select("id"));

export const createSyllabusChapter = (input: Record<string, unknown>) =>
  syllabusWrite(() => supabase.from("course_chapters").insert(input).select("*").single());

export const updateSyllabusChapter = (id: string, input: Record<string, unknown>) =>
  syllabusWrite(() =>
    supabase
      .from("course_chapters")
      .update({ ...input, updatedAt: new Date().toISOString() })
      .eq("id", id)
      .select("*")
      .single(),
  );

export const deleteSyllabusChapter = (id: string) =>
  syllabusWrite(() => supabase.from("course_chapters").delete().eq("id", id).select("id"));

/* ============================
   ADMISSION LEADS
   ============================

   The enquiries a centre works on until they become students. Separate from
   `visit_enquiries`, which records one visit; a lead is worked for weeks.
   See supabase/schema/admission-leads.sql. */

export const LEAD_STAGES = [
  "New",
  "Contacted",
  "Interested",
  "Counselling",
  "Demo Class",
  "Admission",
] as const;

/** Off the board: reached an end that is not an admission. */
export const LEAD_CLOSED_STAGES = ["Not Interested", "Lost"] as const;

export type LeadStage = (typeof LEAD_STAGES)[number] | (typeof LEAD_CLOSED_STAGES)[number];

export interface AdmissionLead {
  id: string;
  branchId: string;
  studentName: string;
  parentName: string;
  phone: string;
  whatsapp: string;
  email: string;
  qualification: string;
  address: string;
  city: string;
  courseInterested: string;
  preferredBatch: string;
  source: string;
  counsellor: string;
  expectedAdmissionAt: string;
  status: LeadStage;
  remarks: string;
  followUpAt: string;
  followUpType: string;
  studentId: string;
  createdAt: string;
}

export interface LeadActivity {
  id: string;
  leadId: string;
  kind: string;
  note: string;
  status: string;
  occurredAt: string;
}

const isMissingLeadTable = (error: { code?: string; message?: string } | null) => {
  if (!error) return false;
  if (error.code === "PGRST205" || error.code === "42P01") return true;
  const message = error.message ?? "";
  return /admission_lead/.test(message) && /does not exist|schema cache/.test(message);
};

const text = (value: unknown) => (value == null ? "" : String(value));

const toLead = (row: Record<string, unknown>): AdmissionLead => ({
  id: text(row.id),
  branchId: text(row.branchId),
  studentName: text(row.studentName) || "Unnamed lead",
  parentName: text(row.parentName),
  phone: text(row.phone),
  // A lead who left the WhatsApp box blank still uses WhatsApp on the number
  // they gave, which is the assumption every other register here makes.
  whatsapp: text(row.whatsapp) || text(row.phone),
  email: text(row.email),
  qualification: text(row.qualification),
  address: text(row.address),
  city: text(row.city),
  courseInterested: text(row.courseInterested),
  preferredBatch: text(row.preferredBatch),
  source: text(row.source),
  counsellor: text(row.counsellor),
  expectedAdmissionAt: text(row.expectedAdmissionAt),
  status: (text(row.status) || "New") as LeadStage,
  remarks: text(row.remarks),
  followUpAt: text(row.followUpAt),
  followUpType: text(row.followUpType),
  studentId: text(row.studentId),
  createdAt: text(row.createdAt),
});

/**
 * Every lead the caller may see.
 *
 * Returns `ready: false` rather than throwing when the tables are not there
 * yet, so the screen can name the migration instead of showing an error card
 * that reads like a failure to load.
 */
export async function getAdmissionLeads(organizationId: string | null, branchId: string | null) {
  let query = supabase
    .from("admission_leads")
    .select("*")
    .is("deletedAt", null)
    .order("createdAt", { ascending: false });
  if (branchId) query = query.eq("branchId", branchId);
  else if (organizationId) query = query.eq("organizationId", organizationId);

  const { data, error } = await query;
  if (isMissingLeadTable(error)) {
    return { success: true as const, data: [] as AdmissionLead[], ready: false };
  }
  if (error) throw new Error(error.message);
  return {
    success: true as const,
    data: (data ?? []).map((row) => toLead(row as Record<string, unknown>)),
    ready: true,
  };
}

export async function getLeadActivities(leadId: string) {
  if (!leadId) return { success: true as const, data: [] as LeadActivity[] };
  const { data, error } = await supabase
    .from("admission_lead_activities")
    .select("*")
    .eq("leadId", leadId)
    .order("occurredAt", { ascending: false });
  if (isMissingLeadTable(error)) return { success: true as const, data: [] as LeadActivity[] };
  if (error) throw new Error(error.message);
  return {
    success: true as const,
    data: (data ?? []).map((row: Record<string, unknown>): LeadActivity => ({
      id: text(row.id),
      leadId: text(row.leadId),
      kind: text(row.kind),
      note: text(row.note),
      status: text(row.status),
      occurredAt: text(row.occurredAt),
    })),
  };
}

const leadWrite = async <T>(
  run: () => PromiseLike<{ data: T; error: { code?: string; message?: string } | null }>,
) => {
  const { data, error } = await run();
  if (isMissingLeadTable(error)) {
    throw new Error(
      "The lead tables are not in the database yet. Run supabase/schema/admission-leads.sql.",
    );
  }
  if (error) throw new Error(error.message);
  return { success: true as const, data };
};

/** The history is what makes a stage believable, so every write logs one. */
export async function logLeadActivity(input: {
  leadId: string;
  kind: string;
  note?: string;
  status?: string;
  actorId?: string | null;
}) {
  return leadWrite(() =>
    supabase
      .from("admission_lead_activities")
      .insert({
        leadId: input.leadId,
        kind: input.kind,
        note: input.note ?? null,
        status: input.status ?? null,
        actorId: input.actorId ?? null,
      })
      .select("*")
      .single(),
  );
}

export async function createAdmissionLead(input: Record<string, unknown>) {
  const result = await leadWrite(() =>
    supabase.from("admission_leads").insert(input).select("*").single(),
  );
  const lead = toLead(result.data as Record<string, unknown>);
  // Best effort: the lead exists either way, and a missing first line of
  // history is not worth failing the save the office just made.
  await logLeadActivity({
    leadId: lead.id,
    kind: "Enquiry created",
    status: lead.status,
    note: lead.source ? `Source: ${lead.source}` : undefined,
  }).catch(() => undefined);
  return { success: true as const, data: lead };
}

export async function updateAdmissionLead(id: string, input: Record<string, unknown>) {
  const result = await leadWrite(() =>
    supabase
      .from("admission_leads")
      .update({ ...input, updatedAt: new Date().toISOString() })
      .eq("id", id)
      .select("*")
      .single(),
  );
  return { success: true as const, data: toLead(result.data as Record<string, unknown>) };
}

/** Soft delete: a lost lead is still a record of what was tried. */
export async function deleteAdmissionLead(id: string) {
  return leadWrite(() =>
    supabase
      .from("admission_leads")
      .update({ deletedAt: new Date().toISOString() })
      .eq("id", id)
      .select("id")
      .single(),
  );
}

/* ============================
   FRANCHISE LEADS
   ============================

   People who want to open a branch. Separate from `admission_leads`, which is
   a student enquiry — the two share almost no fields.
   See supabase/schema/franchise-leads.sql. */

export const FRANCHISE_STAGES = [
  "New Lead",
  "Contacted",
  "Interested",
  "Site Visit",
  "Verification",
  "Agreement",
  "Converted",
] as const;

export type FranchiseStage = (typeof FRANCHISE_STAGES)[number] | "Lost";

export interface FranchiseLead {
  id: string;
  leadNo: string;
  directorName: string;
  ownerName: string;
  phone: string;
  whatsapp: string;
  email: string;
  qualification: string;
  state: string;
  district: string;
  block: string;
  city: string;
  pincode: string;
  landmark: string;
  wardNo: string;
  address: string;
  investmentBudget: string;
  centreAreaSqFt: number | null;
  computers: number | null;
  expectedOpeningAt: string;
  facilities: string[];
  businessExperience: string;
  franchiseType: string;
  executive: string;
  remarks: string;
  status: FranchiseStage;
  followUpAt: string;
  followUpType: string;
  createdAt: string;
  /** The source column the shared breakdown reads — here it is the channel
   *  the applicant came through, which this form records as the executive. */
  source: string;
}

const isMissingFranchiseTable = (error: { code?: string; message?: string } | null) => {
  if (!error) return false;
  if (error.code === "PGRST205" || error.code === "42P01") return true;
  const message = error.message ?? "";
  return /franchise_lead/.test(message) && /does not exist|schema cache/.test(message);
};

const asNumber = (value: unknown) => {
  const n = Number(value);
  return Number.isFinite(n) && value !== null && value !== "" ? n : null;
};

const toFranchiseLead = (row: Record<string, unknown>): FranchiseLead => ({
  id: text(row.id),
  leadNo: text(row.leadNo) || `FRL-${text(row.id).slice(-5).toUpperCase()}`,
  directorName: text(row.directorName) || "Unnamed applicant",
  ownerName: text(row.ownerName),
  phone: text(row.phone),
  whatsapp: text(row.whatsapp) || text(row.phone),
  email: text(row.email),
  qualification: text(row.qualification),
  state: text(row.state),
  district: text(row.district),
  block: text(row.block),
  city: text(row.city),
  pincode: text(row.pincode),
  landmark: text(row.landmark),
  wardNo: text(row.wardNo),
  address: text(row.address),
  investmentBudget: text(row.investmentBudget),
  centreAreaSqFt: asNumber(row.centreAreaSqFt),
  computers: asNumber(row.computers),
  expectedOpeningAt: text(row.expectedOpeningAt),
  facilities: Array.isArray(row.facilities) ? (row.facilities as string[]) : [],
  businessExperience: text(row.businessExperience),
  franchiseType: text(row.franchiseType),
  executive: text(row.executive),
  remarks: text(row.remarks),
  status: (text(row.status) || "New Lead") as FranchiseStage,
  followUpAt: text(row.followUpAt),
  followUpType: text(row.followUpType),
  createdAt: text(row.createdAt),
  source: text(row.franchiseType) || "Not recorded",
});

export async function getFranchiseLeads(organizationId: string | null) {
  let query = supabase
    .from("franchise_leads")
    .select("*")
    .is("deletedAt", null)
    .order("createdAt", { ascending: false });
  if (organizationId) query = query.eq("organizationId", organizationId);

  const { data, error } = await query;
  if (isMissingFranchiseTable(error)) {
    return { success: true as const, data: [] as FranchiseLead[], ready: false };
  }
  if (error) throw new Error(error.message);
  return {
    success: true as const,
    data: (data ?? []).map((row) => toFranchiseLead(row as Record<string, unknown>)),
    ready: true,
  };
}

export async function getFranchiseLeadActivities(leadId: string) {
  if (!leadId) return { success: true as const, data: [] as LeadActivity[] };
  const { data, error } = await supabase
    .from("franchise_lead_activities")
    .select("*")
    .eq("leadId", leadId)
    .order("occurredAt", { ascending: false });
  if (isMissingFranchiseTable(error)) return { success: true as const, data: [] as LeadActivity[] };
  if (error) throw new Error(error.message);
  return {
    success: true as const,
    data: (data ?? []).map((row: Record<string, unknown>): LeadActivity => ({
      id: text(row.id),
      leadId: text(row.leadId),
      kind: text(row.kind),
      note: text(row.note),
      status: text(row.status),
      occurredAt: text(row.occurredAt),
    })),
  };
}

const franchiseWrite = async <T>(
  run: () => PromiseLike<{ data: T; error: { code?: string; message?: string } | null }>,
) => {
  const { data, error } = await run();
  if (isMissingFranchiseTable(error)) {
    throw new Error(
      "The franchise lead tables are not in the database yet. Run supabase/schema/franchise-leads.sql.",
    );
  }
  if (error) throw new Error(error.message);
  return { success: true as const, data };
};

export async function logFranchiseActivity(input: {
  leadId: string;
  kind: string;
  note?: string;
  status?: string;
  actorId?: string | null;
}) {
  return franchiseWrite(() =>
    supabase
      .from("franchise_lead_activities")
      .insert({
        leadId: input.leadId,
        kind: input.kind,
        note: input.note ?? null,
        status: input.status ?? null,
        actorId: input.actorId ?? null,
      })
      .select("*")
      .single(),
  );
}

export async function createFranchiseLead(input: Record<string, unknown>) {
  const result = await franchiseWrite(() =>
    supabase.from("franchise_leads").insert(input).select("*").single(),
  );
  const lead = toFranchiseLead(result.data as Record<string, unknown>);
  await logFranchiseActivity({
    leadId: lead.id,
    kind: "Lead created",
    status: lead.status,
    note: lead.city ? `Proposed at ${[lead.city, lead.district, lead.state].filter(Boolean).join(", ")}` : undefined,
  }).catch(() => undefined);
  return { success: true as const, data: lead };
}

export async function updateFranchiseLead(id: string, input: Record<string, unknown>) {
  const result = await franchiseWrite(() =>
    supabase
      .from("franchise_leads")
      .update({ ...input, updatedAt: new Date().toISOString() })
      .eq("id", id)
      .select("*")
      .single(),
  );
  return { success: true as const, data: toFranchiseLead(result.data as Record<string, unknown>) };
}

/* ---------------------------------------------------------------------------
 * Certificate fee, charged to the centre's wallet.
 *
 * The head office sets a price per centre (branch_certificate_fees). Issuing a
 * student's certificate runs issue_certificate(), which takes that price from
 * the centre's wallet once per student and records the issue; printing it
 * again, or the student's own download afterwards, is free. All of it arrives
 * with certificate-wallet-charge.sql.
 * ------------------------------------------------------------------------- */

const missingRelation = (error: { code?: string; message?: string } | null) =>
  error?.code === "42P01" || error?.code === "PGRST205" || error?.code === "PGRST202" ||
  /does not exist|schema cache/i.test(error?.message || "");

/* ---------------------------------------------------------------------------
 * Centre charges (centre-charges.sql): what the head office takes from a
 * centre's wallet for an admission, an admit card, a marksheet and a
 * certificate. A rate is set for every centre ("*") and may be overridden for
 * one; the database charges each thing once, as it is made.
 * ------------------------------------------------------------------------- */

export const CHARGE_ITEMS = ["ADMISSION", "ADMIT_CARD", "MARKSHEET", "CERTIFICATE"] as const;
export type ChargeItem = (typeof CHARGE_ITEMS)[number];
export const CHARGE_LABELS: Record<ChargeItem, string> = {
  ADMISSION: "Admission",
  ADMIT_CARD: "Admit Card",
  MARKSHEET: "Marksheet",
  CERTIFICATE: "Certificate",
};

/** scope ("*" or a branch id) -> item -> amount. */
export type CentreRates = Map<string, Partial<Record<ChargeItem, number>>>;

/** What a centre pays for an item: its own rate, else the all-centres one, else 0. */
export const effectiveRate = (rates: CentreRates, branchId: string | null | undefined, item: ChargeItem) =>
  (branchId ? rates.get(branchId)?.[item] : undefined) ?? rates.get("*")?.[item] ?? 0;

const RATES_HINT = "Centre charges are not set up yet. Run supabase/schema/centre-charges.sql in Supabase.";

export async function getCentreRates(): Promise<CentreRates> {
  const rates: CentreRates = new Map();
  const { data, error } = await supabase.from("centre_charge_rates").select("scope, item, amount");
  if (error) {
    if (!missingRelation(error)) throw new Error(error.message);
    // Before centre-charges.sql: the per-centre certificate fees it replaces.
    const old = await supabase.from("branch_certificate_fees").select("branchId, amount");
    for (const row of old.data || []) rates.set(String(row.branchId), { CERTIFICATE: Number(row.amount) || 0 });
    return rates;
  }
  for (const row of data || []) {
    const scope = String(row.scope);
    rates.set(scope, { ...(rates.get(scope) || {}), [row.item as ChargeItem]: Number(row.amount) || 0 });
  }
  return rates;
}

/**
 * Saves rates. A null amount on a centre removes its own rate, so the
 * all-centres one applies again.
 */
export async function saveCentreRates(
  changes: Array<{ scope: string; item: ChargeItem; amount: number | null }>,
  updatedBy?: string | null,
) {
  const upserts = changes
    .filter((c) => c.amount !== null)
    .map((c) => ({ scope: c.scope, item: c.item, amount: Math.max(0, Number(c.amount) || 0), updatedBy: updatedBy || null, updatedAt: new Date().toISOString() }));
  if (upserts.length) {
    const { error } = await supabase.from("centre_charge_rates").upsert(upserts, { onConflict: "scope,item" });
    if (error) throw new Error(missingRelation(error) ? RATES_HINT : error.message);
  }
  for (const c of changes.filter((x) => x.amount === null && x.scope !== "*")) {
    const { error } = await supabase.from("centre_charge_rates").delete().eq("scope", c.scope).eq("item", c.item);
    if (error) throw new Error(missingRelation(error) ? RATES_HINT : error.message);
  }
}

export interface CentreChargeRow {
  id: string;
  branchId: string;
  item: ChargeItem;
  amount: number;
  chargedAt: string;
  chargedBy: string;
  refKey: string;
}

/** What has been charged, newest first (the centre's own, or every centre's). */
export async function getCentreCharges(branchId: string | null, limit = 500): Promise<CentreChargeRow[]> {
  let query = supabase.from("centre_charges").select("*").order("chargedAt", { ascending: false }).limit(limit);
  if (branchId) query = query.eq("branchId", branchId);
  const { data, error } = await query;
  if (error) {
    if (missingRelation(error)) return [];
    throw new Error(error.message);
  }
  return (data || []).map((row: Record<string, unknown>) => ({
    id: String(row.id),
    branchId: String(row.branchId),
    item: String(row.item) as ChargeItem,
    amount: Number(row.amount) || 0,
    chargedAt: String(row.chargedAt || ""),
    chargedBy: String(row.chargedBy || ""),
    refKey: String(row.refKey || ""),
  }));
}

/** Every centre's certificate price, keyed by branch id, with "*" for all centres. */
export async function getCertificateFees(): Promise<Map<string, number>> {
  const rates = await getCentreRates();
  const fees = new Map<string, number>();
  for (const [scope, items] of rates) if (items.CERTIFICATE !== undefined) fees.set(scope, items.CERTIFICATE);
  return fees;
}

/** One centre's certificate price; 0 when none is set. */
export async function getCertificateFee(branchId: string | null): Promise<number> {
  if (!branchId) return 0;
  return effectiveRate(await getCentreRates(), branchId, "CERTIFICATE");
}

/** A centre's own certificate price (kept for callers that set one rate). */
export async function setCertificateFee(branchId: string, amount: number, updatedBy?: string | null) {
  await saveCentreRates([{ scope: branchId, item: "CERTIFICATE", amount }], updatedBy);
}

/** A wallet refusal from the database, said plainly. */
export function friendlyChargeError(message: string): string {
  const low = /INSUFFICIENT_BALANCE:\s*(.*)/.exec(message || "");
  return low ? `Centre wallet balance is too low: ${low[1]} Recharge the wallet, then try again.` : message;
}

export interface CertificateIssue {
  amount: number;
  issuedAt: string;
}

/** The student's certificate issue, or null when the centre has not issued it. */
export async function getCertificateIssue(studentId: string | null): Promise<CertificateIssue | null> {
  if (!studentId) return null;
  const { data, error } = await supabase
    .from("certificate_issues")
    .select("amount, issuedAt")
    .eq("studentId", studentId)
    .maybeSingle();
  if (error) {
    if (missingRelation(error)) return null;
    throw new Error(error.message);
  }
  return data ? { amount: Number(data.amount) || 0, issuedAt: String(data.issuedAt) } : null;
}

export interface CertificateCharge {
  charged: boolean;
  alreadyIssued: boolean;
  amount: number;
  balance?: number;
  certificateNo?: string;
}

/**
 * Charge the centre for the student's certificate (once) and record the issue.
 * Throws with a readable message when the wallet cannot cover the fee, so the
 * caller does not print.
 */
export async function issueCertificate(
  studentId: string,
  issuedBy?: string | null,
  dates: { issueDate?: string | null; examConductedDate?: string | null } = {},
): Promise<CertificateCharge> {
  // The dates are only sent when given: a database still on the two-argument
  // function (before exam-workflow.sql) answers a call that names them with
  // "function not found".
  const args: Record<string, unknown> = { p_student_id: studentId, p_issued_by: issuedBy || null };
  if (dates.issueDate) args.p_issue_date = dates.issueDate;
  if (dates.examConductedDate) args.p_exam_date = dates.examConductedDate;
  const { data, error } = await supabase.rpc("issue_certificate", args);
  if (error) {
    if (missingRelation(error)) {
      throw new Error("Certificate wallet charging is not set up yet. Run supabase/schema/certificate-wallet-charge.sql in Supabase.");
    }
    const low = /INSUFFICIENT_BALANCE:\s*(.*)/.exec(error.message);
    if (low) throw new Error(`Centre wallet balance is too low: ${low[1]} Recharge the wallet, then generate again.`);
    if (/NOT_ELIGIBLE/.test(error.message)) {
      throw new Error("The student has no passed final-term marksheet yet. Create and pass the final result first.");
    }
    if (/APPROVAL_REQUIRED/.test(error.message)) {
      throw new Error("This certificate is waiting for the head office's approval.");
    }
    throw new Error(error.message);
  }
  const row = (data || {}) as Partial<CertificateCharge>;
  if (row.charged) announceWalletChange();
  return {
    charged: Boolean(row.charged),
    alreadyIssued: Boolean(row.alreadyIssued),
    amount: Number(row.amount) || 0,
    balance: row.balance == null ? undefined : Number(row.balance),
    certificateNo: row.certificateNo ? String(row.certificateNo) : undefined,
  };
}

/* ---------------------------------------------------------------------------
 * The centre's strip in its own panel: who it is, until when it is licensed,
 * and what its wallet holds -- what a centre looks at before it issues
 * anything the wallet pays for.
 * ------------------------------------------------------------------------- */

export interface CentreSummary {
  name: string;
  code: string;
  isActive: boolean;
  validUpto: string | null;
  balance: number;
}

/** Fired after anything that moves a centre's wallet, so the header re-reads it. */
export const WALLET_CHANGED = "wallet:changed";
export const announceWalletChange = () => {
  if (typeof window !== "undefined") window.dispatchEvent(new Event(WALLET_CHANGED));
};

export async function getCentreSummary(branchId: string | null): Promise<CentreSummary | null> {
  if (!branchId) return null;
  const [branchRes, licenseRes, walletRes] = await Promise.all([
    supabase.from("branches").select("name, code, isActive").eq("id", branchId).maybeSingle(),
    supabase.from("branch_licenses").select("expiryDate").eq("branchId", branchId).maybeSingle(),
    supabase.from("branch_wallets").select("balance").eq("branchId", branchId).maybeSingle(),
  ]);
  if (branchRes.error || !branchRes.data) return null;
  return {
    name: String(branchRes.data.name || ""),
    code: String(branchRes.data.code || ""),
    isActive: branchRes.data.isActive !== false,
    validUpto: licenseRes.data?.expiryDate ? String(licenseRes.data.expiryDate) : null,
    balance: Number(walletRes.data?.balance) || 0,
  };
}

/**
 * Every student as a pick list: the columns a picker and a register need, and
 * none of the uploads. `select("*")` carries each student's base64 documents
 * and photo, which across a whole institute is megabytes for a dropdown.
 */
export async function getStudentPicklist(branchId: string | null) {
  let query = supabase
    .from("students")
    .select('id, "branchId", "courseId", "firstName", "middleName", "lastName", "enrollmentNo", "applicationNo", "fatherName", "academicYear", "dateOfBirth", phone')
    .is("deletedAt", null)
    .order("firstName")
    .limit(10000);
  if (branchId) query = query.eq("branchId", branchId);
  const { data, error } = await query;
  if (error) throw new Error(error.message);
  return { success: true as const, data: data || [] };
}

/**
 * Puts one of a centre's registration documents on file, or replaces it
 * (src/lib/branchDocuments.ts lists them). The director's go on the
 * director's row, which every registered centre has.
 */
export async function saveBranchDocument(
  branchId: string,
  slot: { table: "branches" | "branch_directors"; column: string },
  file: { name: string; dataUrl: string; uploadedAt: string },
) {
  const { data, error } = await supabase
    .from(slot.table)
    .update({ [slot.column]: file, updatedAt: new Date().toISOString() })
    .eq(slot.table === "branches" ? "id" : "branchId", branchId)
    .select("id");
  if (error) throw new Error(error.message);
  if (!data?.length) {
    throw new Error(slot.table === "branch_directors" ? "This centre has no director on record. Edit the branch to add one." : "Could not save the document.");
  }
  return { success: true };
}
