import { auth, currentUser } from "@clerk/nextjs/server";
import { db } from "@/lib/db";

export type AuthUser = {
  id: string; // internal User.id (Prisma)
  clerkId: string;
  email: string | null;
  name: string | null;
  imageUrl: string | null;
  tier?: "FREE" | "PRO" | "ADMIN";
};

/**
 * Returns the current authenticated user, ensuring there is a corresponding
 * Prisma User record. If no user is authenticated, returns null.
 */
export async function getCurrentUser(): Promise<AuthUser | null> {
  const { userId } = auth();
  if (!userId) return null;

  const clerk = await currentUser();
  if (!clerk || !clerk.id) return null;

  const email = clerk.emailAddresses?.[0]?.emailAddress ?? null;
  const name = clerk.fullName ?? null;
  const imageUrl = clerk.imageUrl ?? null;

  // Ensure we have a corresponding Prisma User
  const dbUser = await db.user.upsert({
    where: { clerkId: clerk.id },
    create: {
      clerkId: clerk.id,
      email: email ?? "",
      name,
      imageUrl,
    },
    update: {
      email: email ?? "",
      name,
      imageUrl,
    },
  });

  return {
    id: dbUser.id,
    clerkId: dbUser.clerkId,
    email: dbUser.email,
    name: dbUser.name,
    imageUrl: dbUser.imageUrl,
    tier: dbUser.tier as AuthUser["tier"],
  };
}

/**
 * Same as getCurrentUser but throws if the user is not authenticated.
 * Can be used in server components and server actions.
 * Note: Middleware should protect routes, but this provides an extra check.
 */
export async function requireUser(): Promise<AuthUser> {
  const user = await getCurrentUser();

  if (!user) {
    // Redirect to sign-in if not authenticated
    // This should rarely happen as middleware protects routes
    const { redirect } = await import("next/navigation");
    redirect("/sign-in");
  }

  return user;
}

/**
 * Alias required by v2 design-doc language.
 */
export const requireAuth = requireUser;

export async function requireAdmin(): Promise<AuthUser> {
  const user = await requireUser();

  if (user.tier !== "ADMIN") {
    throw new Error("User is not authorized to access this resource");
  }

  return user;
}

