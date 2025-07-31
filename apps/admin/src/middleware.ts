import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

// Define public routes that don't require authentication
const publicRoutes = ["/auth", "/auth/sign-in", "/auth/reset-password"];

// Define protected routes that require authentication
const protectedRoutes = ["/dashboard", "/dashboard/analytics"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Check for token in cookies first, then headers
  let token = request.cookies.get("accessToken")?.value ||
    request.headers.get("authorization")?.replace("Bearer ", "");

  // Check if the current path is a public route
  const isPublicRoute = publicRoutes.some((route) =>
    pathname.startsWith(route)
  );

  // Check if the current path is a protected route
  const isProtectedRoute = protectedRoutes.some(
    (route) => pathname.startsWith(route) || pathname === "/"
  );

  // If user is not authenticated and trying to access protected routes
  if (!token && isProtectedRoute && !isPublicRoute) {
    const url = request.nextUrl.clone();
    url.pathname = "/auth/sign-in";
    return NextResponse.redirect(url);
  }

  // If user is authenticated and trying to access auth pages, redirect to dashboard
  if (token && isPublicRoute) {
    const url = request.nextUrl.clone();
    url.pathname = "/dashboard/analytics";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    "/((?!api|_next/static|_next/image|favicon.ico|public).*)",
  ],
};
