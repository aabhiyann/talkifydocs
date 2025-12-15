import { auth, currentUser } from "@clerk/nextjs/server";
import { db } from "@/lib/db";

export type AuthUser = {
  id: string; // internal User.id (Prisma)
  clerkId: string;
  email: string | null;
  name: string | null;
  imageUrl: string | null;
};

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
  };
}

export async function requireUser(): Promise<AuthUser> {
  const user = await getCurrentUser();

  if (!user) {
    throw new Error("User not authenticated");
  }

  return user;
}


