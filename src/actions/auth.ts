"use server";

import { currentUser } from "@clerk/nextjs/server";
import { db } from "@/lib/db";

/**
 * Server Action to ensure the current Clerk user has a corresponding
 * Prisma User record. Safe to call multiple times.
 */
export async function initializeCurrentUser() {
  const clerk = await currentUser();

  if (!clerk || !clerk.id) {
    throw new Error("User not authenticated");
  }

  const email =
    clerk.emailAddresses?.[0]?.emailAddress ??
    clerk.primaryEmailAddress?.emailAddress ??
    "";
  const name = clerk.fullName ?? null;
  const imageUrl = clerk.imageUrl ?? null;

  const user = await db.user.upsert({
    where: { clerkId: clerk.id },
    create: {
      clerkId: clerk.id,
      email,
      name,
      imageUrl,
    },
    update: {
      email,
      name,
      imageUrl,
    },
  });

  return { id: user.id, clerkId: user.clerkId };
}


