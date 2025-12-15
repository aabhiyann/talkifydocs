import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

const isPublicRoute = createRouteMatcher([
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
]);

export default clerkMiddleware(async (auth, req) => {
  if (!isPublicRoute(req)) {
    await auth.protect();
  }
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


