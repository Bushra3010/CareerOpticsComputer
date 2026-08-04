import { type NextRequest, NextResponse } from "next/server";

import { createClient } from "@/lib/db/route";

const PROTECTED_PREFIXES = ["/admin", "/centre", "/student"];

const SIGN_IN_BY_PREFIX: Record<string, string> = {
  "/admin": "/sign-in/admin",
  "/centre": "/sign-in/centre",
  "/student": "/sign-in/student",
};

export async function middleware(request: NextRequest) {
  const { supabase, response } = createClient(request);

  // Refreshes the session cookie on every request — required by @supabase/ssr
  // so a Server Component never sees a stale/expired token.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Matched on a path SEGMENT, not a string prefix. A bare startsWith("/centre")
  // also matches "/centres" — the public centre finder — and bounced every
  // visitor to it into the staff sign-in page. Found by the axe scan, which
  // asserts it is still on the URL it asked for before scanning it.
  const { pathname } = request.nextUrl;
  const prefix = PROTECTED_PREFIXES.find(
    (p) => pathname === p || pathname.startsWith(`${p}/`),
  );

  if (prefix && !user) {
    const signInUrl = new URL(SIGN_IN_BY_PREFIX[prefix], request.url);
    signInUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(signInUrl);
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Skip static assets and image optimisation so the session refresh does
     * not run on every hashed asset request.
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|webp)$).*)",
  ],
};
