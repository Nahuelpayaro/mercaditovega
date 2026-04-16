import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { ADMIN_SESSION_COOKIE_NAME, getAdminLoginRedirectPath } from "@/lib/admin-auth";

export function middleware(request: NextRequest) {
  const redirectPath = getAdminLoginRedirectPath(
    request.nextUrl.pathname,
    request.nextUrl.search,
    request.cookies.get(ADMIN_SESSION_COOKIE_NAME)?.value,
  );

  if (!redirectPath) {
    return NextResponse.next();
  }

  return NextResponse.redirect(new URL(redirectPath, request.url));
}

export const config = {
  matcher: ["/admin/:path*"],
};
