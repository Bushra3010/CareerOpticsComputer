import { NextResponse, type NextRequest } from "next/server";

import { callRpc } from "@/lib/db/rpc";
import { createServiceRoleClient } from "@/lib/db/service-role";

/**
 * The scheduled job runner — the first thing in `app/api`.
 *
 * It exists for one job today, and that job is not optional. `deadline_at` on
 * an attempt is a promise the database makes but cannot keep on its own:
 * nothing in Postgres notices that a deadline has passed. Without this, a
 * student who closes the tab mid-exam leaves an attempt `in_progress` for
 * ever, and the unique `(exam_id, student_id, attempt_number)` constraint then
 * stops them ever starting again. The migration that added the sweep shipped
 * with nothing calling it; this is that caller.
 *
 * Authenticated by a bearer secret rather than a session, because there is no
 * user — build plan A12, and one of the four callers CLAUDE.md permits the
 * service role. Compared in constant time, because a timing oracle on a shared
 * secret is worth a few lines to avoid.
 *
 * Runs at UTC, not IST. A sweep is about elapsed seconds, not business days,
 * so R13 does not apply here.
 *
 * The five-minute schedule in `vercel.json` needs a paid Vercel plan — Hobby
 * caps cron at once a day, and would accept the config while running it far
 * too rarely to matter. On the free plan, call this from an external scheduler
 * with the same bearer secret instead.
 */
export const dynamic = "force-dynamic";
export const runtime = "nodejs";

function secretMatches(header: string | null): boolean {
  const expected = process.env.CRON_SECRET;
  if (!expected) return false;

  const provided = header?.replace(/^Bearer\s+/i, "") ?? "";
  if (provided.length !== expected.length) return false;

  let diff = 0;
  for (let i = 0; i < expected.length; i += 1) {
    diff |= provided.charCodeAt(i) ^ expected.charCodeAt(i);
  }
  return diff === 0;
}

export async function POST(request: NextRequest) {
  if (!process.env.CRON_SECRET) {
    // Failing closed and saying why. A misconfigured runner that returns 200
    // looks healthy on a dashboard while doing nothing at all.
    return NextResponse.json(
      { error: "CRON_SECRET is not configured" },
      { status: 503 },
    );
  }

  if (!secretMatches(request.headers.get("authorization"))) {
    return NextResponse.json({ error: "Unauthorised" }, { status: 401 });
  }

  const supabase = createServiceRoleClient();
  const startedAt = Date.now();

  const LIMIT = 200;
  const { data, error } = await callRpc(
    supabase,
    "sweep_expired_exam_attempts",
    { p_limit: LIMIT },
  );

  if (error) {
    return NextResponse.json(
      { job: "sweep_expired_exam_attempts", error: error.message },
      { status: 500 },
    );
  }

  // The count is the useful signal: a sweep that keeps returning the limit is
  // a sweep that is behind, and the schedule needs to be tighter than the
  // backlog.
  const swept = typeof data === "number" ? data : 0;
  return NextResponse.json({
    job: "sweep_expired_exam_attempts",
    sweptAttempts: swept,
    hitLimit: swept >= LIMIT,
    durationMs: Date.now() - startedAt,
  });
}

/** A GET is almost always a browser or a probe; say so rather than 404. */
export function GET() {
  return NextResponse.json(
    { error: "This endpoint accepts POST from the scheduler only" },
    { status: 405 },
  );
}
