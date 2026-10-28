import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const publicPaths = ["/login", "/_next", "/favicon.ico", "/public"];

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;

  // Allow public paths
  if (publicPaths.some(p => path === p || path.startsWith(p))) {
    return NextResponse.next();
  }

  // Check for session cookie
  const token = request.cookies.get("sb-access-token")?.value;

  if (!token) {
    // Redirect unauthenticated users to login
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", path);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
