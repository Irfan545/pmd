import { NextRequest, NextResponse } from "next/server";

const publicRoutes = ["/auth/register", "/auth/login"];
const superAdminRoutes = ["/super-admin", "/super-admin/:path*"];
// const userRoutes = ["/", "/listing", "/account", "/search"];
const userRoutes = ["/account", "/checkout", "/cart"]; // Only account page requires authentication
const publicUserRoutes = ["/", "/listing", "/search"]; // These routes are accessible without login

// Add paths that should be excluded from middleware checks
const publicPaths = [
  "/auth/login",
  "/auth/register",
  "/api",
  "/_next",
  "/static",
  "/images",
  "/favicon.ico",
];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip middleware for public paths
  if (publicPaths.some(path => pathname.startsWith(path))) {
    return NextResponse.next();
  }

  const accessToken = request.cookies.get("accessToken")?.value;
  const isAuthPage = pathname.startsWith("/auth");
  const isApiRoute = pathname.startsWith("/api");

  // Allow API routes to pass through
  if (isApiRoute) {
    return NextResponse.next();
  }

  // Redirect to login if accessing protected route without token
  if (!accessToken && userRoutes.some(route => pathname.startsWith(route))) {
    return NextResponse.redirect(new URL("/auth/login", request.url));
  }

  // Redirect to home if accessing auth pages with token
  if (accessToken && isAuthPage) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  // Check if route is valid - if not, let Next.js handle it with not-found.tsx
  const isValidRoute = 
    publicRoutes.some(route => pathname === route) ||
    superAdminRoutes.some(route => pathname.startsWith(route.replace('/:path*', ''))) ||
    userRoutes.some(route => pathname.startsWith(route)) ||
    publicUserRoutes.some(route => pathname === route || (route !== '/' && pathname.startsWith(route)));

  // If it's not a valid route, let Next.js handle it naturally
  if (!isValidRoute) {
    return NextResponse.next();
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
     */
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};
