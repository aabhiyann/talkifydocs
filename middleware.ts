import { authMiddleware } from "@clerk/nextjs";

export default authMiddleware({
  // Public routes that never require authentication
  publicRoutes: [
    "/",
    "/features",
    "/pricing",
    "/about",
    "/contact",
    "/style-guide",
    "/health",
    "/api/health",
    "/api/webhooks/stripe",
    "/api/webhooks/clerk",
    "/sign-in(.*)",
    "/sign-up(.*)",
    "/auth-callback(.*)",
    "/demo(.*)",
    "/docs(.*)",
  ],
  ignoredRoutes: [
    // Let Next.js handle static files and images
    "/_next(.*)",
    "/favicon.ico",
    "/robots.txt",
  ],
});

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next (static files)
     * - public assets
     */
    "/((?!_next/static|_next/image|favicon.ico|robots.txt).*)",
  ],
};


